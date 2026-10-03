(function(){
'use strict';
var B=window.DT;

// browser speech engine, nothing downloaded, nothing uploaded
var SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
B.speechSupported = !!SR;

B.Mic=function(handlers){
  handlers=handlers||{};
  var rec=null, actx=null, analyser=null, stream=null, raf=null;
  var running=false, finalText='', blocked=false;

  function amp(){
    if(!analyser) return;
    var buf=new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(buf);
    var sum=0;
    for(var i=0;i<buf.length;i++){ var v=(buf[i]-128)/128; sum+=v*v; }
    var rms=Math.sqrt(sum/buf.length);
    if(handlers.onAmp) handlers.onAmp(Math.min(1, rms*4.2));
    raf=requestAnimationFrame(amp);
  }

  function startMeter(){
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    navigator.mediaDevices.getUserMedia({audio:true}).then(function(s){
      stream=s;
      var AC=window.AudioContext||window.webkitAudioContext;
      if(!AC) return;
      actx=new AC();
      var src=actx.createMediaStreamSource(s);
      analyser=actx.createAnalyser();
      analyser.fftSize=1024; analyser.smoothingTimeConstant=0.72;
      src.connect(analyser);
      amp();
    }).catch(function(){  });
  }
  function stopMeter(){
    if(raf) cancelAnimationFrame(raf); raf=null;
    if(stream){ stream.getTracks().forEach(function(t){ try{ t.stop(); }catch(e){} }); stream=null; }
    if(actx){ try{ actx.close(); }catch(e){} actx=null; }
    analyser=null;
    if(handlers.onAmp) handlers.onAmp(0);
  }

  return {
    supported:!!SR,
    blocked:function(){ return blocked; },
    start:function(){
      if(running) return;
      finalText='';
      if(!SR){ blocked=true; if(handlers.onBlocked) handlers.onBlocked('no-engine'); return; }
      try{
        rec=new SR();
        rec.lang = B.prefs.lang==='english' ? 'en-IN' : 'hi-IN';
        rec.continuous=true; rec.interimResults=true; rec.maxAlternatives=1;
        rec.onstart=function(){ running=true; blocked=false; startMeter(); if(handlers.onStart) handlers.onStart(); };
        rec.onresult=function(ev){
          var interim='';
          for(var i=ev.resultIndex;i<ev.results.length;i++){
            var r=ev.results[i];
            if(r.isFinal) finalText += (finalText?' ':'') + r[0].transcript.trim();
            else interim += r[0].transcript;
          }
          if(handlers.onText) handlers.onText(finalText, interim.trim());
        };
        rec.onerror=function(ev){
          running=false; stopMeter();
          blocked = (ev.error==='not-allowed' || ev.error==='service-not-allowed' || ev.error==='audio-capture');
          if(handlers.onBlocked) handlers.onBlocked(ev.error);
        };
        rec.onend=function(){
          running=false; stopMeter();
          if(handlers.onEnd) handlers.onEnd(finalText);
        };
        rec.start();
      }catch(e){
        blocked=true; running=false;
        if(handlers.onBlocked) handlers.onBlocked('threw');
      }
    },
    stop:function(){
      if(rec && running){ try{ rec.stop(); }catch(e){} }
      else { stopMeter(); if(handlers.onEnd) handlers.onEnd(finalText); }
    },
    abort:function(){
      if(rec){ try{ rec.abort(); }catch(e){} }
      running=false; stopMeter();
    },
    running:function(){ return running; },
    text:function(){ return finalText; }
  };
};

var cache={}, audio=null, tick=null, token=0;

B.cloudVoice=function(){ return !!(B.config && B.config.voice); };

function pulse(on, onAmp){
  if(tick){ clearInterval(tick); tick=null; }
  if(!on){ if(onAmp) onAmp(0); return; }
  var t=0;
  tick=setInterval(function(){
    t+=0.22;
    if(onAmp) onAmp(0.28+0.2*Math.sin(t*2.1)+0.12*Math.sin(t*5.3)+Math.random()*0.08);
  }, 60);
}

B.hush=function(){
  token++;
  pulse(false, B.onSpeakAmp);
  if(audio){ try{ audio.pause(); }catch(e){} audio=null; }
  try{ if(window.speechSynthesis) window.speechSynthesis.cancel(); }catch(e){}
};

function viaBrowser(text, myToken, done){
  try{
    if(!window.speechSynthesis){ done(); return; }
    var u=new SpeechSynthesisUtterance(text);
    u.lang = B.prefs.lang==='english' ? 'en-IN' : 'hi-IN';
    u.rate=1; u.pitch=1;
    u.onend=u.onerror=function(){ if(myToken===token) done(); };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }catch(e){ done(); }
}

function viaCloud(text, myToken, done, fail){
  var hit=cache[text];
  var get = hit ? Promise.resolve(hit) :
    fetch(B.config.voice, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({text:text})})
      .then(function(r){ if(!r.ok) throw new Error('voice'); return r.blob(); })
      .then(function(b){ cache[text]=b; return b; });
  get.then(function(blob){
    if(myToken!==token) return;
    var url=URL.createObjectURL(blob);
    audio=new Audio(url);
    audio.onended=audio.onerror=function(){ try{ URL.revokeObjectURL(url); }catch(e){} if(myToken===token) done(); };
    var p=audio.play();
    if(p && p.catch) p.catch(function(){ if(myToken===token) fail(); });
  }).catch(function(){ if(myToken===token) fail(); });
}

B.say=function(text, done){
  B.hush();
  var myToken=token;
  var line=B.clean(text);
  var finish=function(){ pulse(false, B.onSpeakAmp); if(done) done(); };
  if(!line){ finish(); return; }
  pulse(true, B.onSpeakAmp);
  if(B.cloudVoice()) viaCloud(line, myToken, finish, function(){ viaBrowser(line, myToken, finish); });
  else viaBrowser(line, myToken, finish);
};

B.warm=function(text){
  var line=B.clean(text);
  if(!B.cloudVoice() || cache[line]) return;
  fetch(B.config.voice, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({text:line})})
    .then(function(r){ return r.ok ? r.blob() : null; })
    .then(function(b){ if(b) cache[line]=b; })
    .catch(function(){});
};
})();
