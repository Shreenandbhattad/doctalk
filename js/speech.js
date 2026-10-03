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

B.say=function(text){
  if(!B.prefs.voiceBack) return;
  try{
    if(!window.speechSynthesis) return;
    var u=new SpeechSynthesisUtterance(B.clean(text));
    u.lang = B.prefs.lang==='english' ? 'en-IN' : 'hi-IN';
    u.rate=0.98; u.pitch=1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }catch(e){}
};
})();
