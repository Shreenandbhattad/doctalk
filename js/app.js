(function(){
'use strict';
var B=window.DT, el=B.el, esc=B.esc, $=B.$;
var stage=$('#stage'), orb=null, mic=null;

function swap(render){
  if(orb){ orb.stop(); orb=null; }
  if(mic){ mic.abort(); mic=null; }
  var old=stage.firstElementChild;
  if(old && !B.reduced){
    old.style.transition='opacity .22s ease, transform .22s ease';
    old.style.opacity='0';
    old.style.transform='translateY(-8px)';
    setTimeout(function(){ stage.innerHTML=''; render(); }, 190);
  } else {
    stage.innerHTML='';
    render();
  }
}

function topbar(back, onBack){
  var t=el('div','top');
  if(back){
    var b=el('button','backbtn', B.ICON.back+'<span>'+esc(back)+'</span>');
    b.addEventListener('click', onBack);
    t.appendChild(b);
  } else {
    t.appendChild(el('div','wordmark','Doc<span>Talk</span>'));
  }
  var m=el('button','topbtn', B.ICON.dots);
  m.setAttribute('aria-label','Menu');
  m.addEventListener('click', menu);
  t.appendChild(m);
  return t;
}

function home(){
  swap(function(){
    var root=el('div','');
    root.appendChild(topbar());
    var h=el('div','home');

    var ow=el('div','orbwrap');
    ow.style.cssText='width:200px;height:200px;margin-bottom:26px';
    h.appendChild(ow);

    var g=el('div','hgreet');
    g.innerHTML='<h1>Say it out loud once.</h1><p>Talk through whatever is bothering you. It listens, asks the right things, and shows you the whole picture.</p>';
    h.appendChild(g);

    var doors=el('div','doors');
    [['symptom', B.ICON.spark, 'Something is bothering me', 'Talk it through and see it clearly'],
     ['rx',      B.ICON.pill,  'I have a prescription',     'Photograph it, get it explained'],
     ['meds',    B.ICON.ask,   'Check what I am taking', 'Find what cancels what out']
    ].forEach(function(d,i){
      var b=el('button','door',
        '<span class="dn">0'+(i+1)+'</span>'+
        '<span class="dt"><span class="dl">'+esc(d[2])+'</span><span class="ds">'+esc(d[3])+'</span></span>'+
        '<span class="dc">&rsaquo;</span>');
      b.addEventListener('click', function(){ d[0]==='rx' ? rx() : d[0]==='meds' ? meds() : room(d[0]); });
      if(!B.reduced) b.style.animation='rise .6s cubic-bezier(.17,.84,.36,1) '+(260+i*70)+'ms backwards';
      doors.appendChild(b);
    });
    h.appendChild(doors);
    h.appendChild(el('p','privline','Nothing leaves your phone. No account, no recording kept.'));
    root.appendChild(h);
    stage.appendChild(root);

    orb=B.Orb(ow,{size:200});
    if(!B.reduced){
      g.style.animation='rise .7s cubic-bezier(.17,.84,.36,1) 120ms backwards';
      ow.style.animation='pop .9s cubic-bezier(.2,1.1,.4,1) backwards';
    }
  });
}

function room(door){
  var S=B.newSession(door);
  swap(function(){
    var root=el('div','');
    root.appendChild(topbar('Back', home));
    var r=el('div','room');

    var head=el('div','roomtop');
    var qLabel=el('div','qlabel','Question 1');
    var qEl=el('div','question');
    var qhEl=el('div','qhint dev');
    head.appendChild(qLabel); head.appendChild(qEl); head.appendChild(qhEl);
    r.appendChild(head);

    var zone=el('div','orbzone');
    var ow=el('div','orbwrap');
    ow.style.cssText='width:210px;height:210px;cursor:pointer';
    zone.appendChild(ow);
    r.appendChild(zone);

    var cap=el('div','caption');
    var capEl=el('p','ph','Tap the orb and just talk.');
    cap.appendChild(capEl);
    r.appendChild(cap);

    var picks=el('div','picks');
    r.appendChild(picks);

    var pet=el('div','petals');
    B.interview.PETALS.forEach(function(p){
      pet.appendChild(el('span','petal','<i class="pd"></i>'+esc(p.label)));
    });
    r.appendChild(pet);

    var bar=el('div','roombar');
    var type=el('button','btn quiet sm', B.ICON.keyboard);
    type.setAttribute('aria-label','Type instead');
    var done=el('button','btn primary','Tell me a bit more');
    done.disabled=true;
    done.addEventListener('click', function(){ card(S); });
    bar.appendChild(type);
    bar.appendChild(done);
    r.appendChild(bar);

    root.appendChild(r);
    stage.appendChild(root);

    orb=B.Orb(ow,{size:210});
    var ring=B.ring(210);
    ow.appendChild(ring.node);

    function setCaption(t){ capEl.className=''; capEl.textContent=t; }

    function refresh(){
      ring.set(B.interview.completeness(S));
      Array.prototype.forEach.call(pet.children, function(node,i){
        var k=B.interview.PETALS[i].k;
        var on = k==='severity' ? S.slots.severity!==undefined : !!(S.slots[k] && S.slots[k].length!==0);
        if(on && !node.classList.contains('on')){
          node.classList.add('on');
          if(navigator.vibrate && !B.reduced){ try{ navigator.vibrate(8); }catch(e){} }
        }
      });
      var n=B.interview.next(S);
      picks.innerHTML='';
      if(n && n.pick){
        n.pick.forEach(function(p,i){
          var pb=el('button','pick',esc(p[1]));
          pb.addEventListener('click', function(){
            B.interview.answerPick(S, n.key, p[0]);
            setCaption(p[1]);
            refresh();
          });
          if(!B.reduced) pb.style.animation='pop .4s var(--spring) '+(i*60)+'ms backwards';
          picks.appendChild(pb);
        });
      }
      qLabel.textContent = n ? ('Question '+(S.turns.length+1)) : 'Your story is ready';
      if(n){
        if(qEl.textContent!==n.q && !B.reduced){
          qEl.style.animation='none';
          void qEl.offsetWidth;
          qEl.style.animation='rise .5s cubic-bezier(.17,.84,.36,1)';
        }
        qEl.textContent=n.q;
        qhEl.textContent=n.h;
        B.say(n.q);
      } else {
        qEl.textContent='That is enough to work with.';
        qhEl.textContent='Aur kuch add karna ho to bolo, warna card bana lo.';
      }
      var ready=B.interview.filled(S)>=2;
      done.disabled=!ready;
      done.textContent = ready ? 'Make my card' : 'Tell me a bit more';
    }

    function commit(text){
      if(!text || !text.trim()) return;
      S.turns.push(text.trim());
      var flags=B.interview.extract(S, text);
      capEl.className='';
      capEl.textContent=B.clean(text.trim());
      refresh();
      if(flags.length) showFlag(flags[0]);
    }

    type.addEventListener('click', function(){ typeSheet(S, refresh, setCaption); });

    mic=B.Mic({
      onAmp:function(v){ if(orb) orb.setAmp(v); },
      onStart:function(){
        if(orb) orb.listen(true);
        capEl.className='ph';
        capEl.textContent='Listening...';
      },
      onText:function(fin, interim){
        capEl.className='';
        capEl.innerHTML=esc(fin)+(interim? ' <span class="interim">'+esc(interim)+'</span>' : '');
      },
      onEnd:function(fin){
        if(orb){ orb.listen(false); orb.setAmp(0); }
        commit(fin);
      },
      onBlocked:function(){
        if(orb) orb.listen(false);
        B.toast('Microphone is not available here. Type it instead.');
        typeSheet(S, refresh, setCaption);
      }
    });

    function toggle(){
      if(!mic) return;
      if(mic.running()) mic.stop();
      else if(!B.speechSupported) typeSheet(S, refresh, setCaption);
      else mic.start();
    }
    ow.addEventListener('click', toggle);
    ow.setAttribute('role','button');
    ow.setAttribute('tabindex','0');
    ow.setAttribute('aria-label','Tap to speak');
    ow.addEventListener('keydown', function(e){
      if(e.key===' '||e.key==='Enter'){ e.preventDefault(); toggle(); }
    });

    refresh();
    if(!B.speechSupported){
      qhEl.textContent='This browser will not give access to the microphone. Tap the keyboard to type.';
    }
  });
}

function typeSheet(S, after, onText){
  B.openSheet(function(sh){
    sh.appendChild(el('h2','','Type it instead'));
    sh.appendChild(el('p','lede','Same thing, no microphone needed. Hinglish is fine.'));
    var ta=el('textarea','textin');
    ta.placeholder='Mere baal teen mahine se jhad rahe hain, upar se patla ho raha hai...';
    ta.style.marginTop='14px';
    sh.appendChild(ta);
    var b=el('button','btn primary','Add this');
    b.style.cssText='width:100%;margin-top:12px';
    b.addEventListener('click', function(){
      var v=ta.value.trim();
      if(!v){ B.toast('Write a line first.'); return; }
      S.turns.push(v);
      var flags=B.interview.extract(S, v);
      B.closeSheet();
      if(onText) onText(B.clean(v));
      if(after) after();
      if(flags.length) setTimeout(function(){ showFlag(flags[0]); }, 420);
    });
    sh.appendChild(b);
    setTimeout(function(){ try{ ta.focus(); }catch(e){} }, 380);
  });
}

function card(S){
  var c=B.card.build(S), a=B.interview.assess(S), tab='story';
  swap(function(){
    var root=el('div','');
    root.appendChild(topbar('Back', function(){ room(S.door); }));
    var w=el('div','cardwrap');

    var tone = a.urgency==='now' ? 'var(--coral)' : a.urgency==='soon' ? 'var(--amber)' : 'var(--leaf)';
    var head = a.urgency==='now' ? 'Get this looked at today'
             : a.urgency==='soon' ? 'Worth booking this week'
             : 'No rush, but worth raising';
    var u=el('div','urg');
    u.style.setProperty('--uc', tone);
    u.innerHTML='<span class="ui"></span><span class="ub"><span class="ut">'+esc(head)+
      '</span><span class="us">'+esc(a.why)+(a.spec?' Usually a '+esc(a.spec.toLowerCase())+'.':'')+'</span></span>';
    w.appendChild(u);

    var tabs=el('div','tabs');
    var panel=el('div','');
    var TABS=[['story','Story'],['think','Considered'],['tests','Tests'],['ask','Ask']];
    TABS.forEach(function(t){
      var b=el('button','tab',esc(t[1]));
      b.setAttribute('aria-selected', tab===t[0]?'true':'false');
      b.addEventListener('click', function(){
        tab=t[0];
        Array.prototype.forEach.call(tabs.children,function(n,i){
          n.setAttribute('aria-selected', TABS[i][0]===tab?'true':'false');
        });
        paint();
      });
      tabs.appendChild(b);
    });
    w.appendChild(tabs);
    w.appendChild(panel);

    function paint(){
      panel.innerHTML='';
      if(tab==='story'){
        panel.appendChild(B.card.render(c));
      } else if(tab==='think'){
        var box=el('div','dcard');
        box.appendChild(el('div','ck','What a doctor will weigh'));
        if(!a.consider.length){
          box.appendChild(el('p','lede','Not enough detail yet to narrow it. Go back and answer a couple more questions.'));
        }
        a.consider.forEach(function(x){
          var row=el('div','consider');
          row.innerHTML='<div class="ct">'+esc(x.t)+'</div><div class="cx">'+esc(x.d)+'</div>';
          box.appendChild(row);
        });
        box.appendChild(el('p','hint','These are the things commonly ruled in or out for what you described. It is how the conversation usually goes, not a diagnosis, and the order can change once someone examines you.'));
        panel.appendChild(box);
      } else if(tab==='tests'){
        var tb=el('div','dcard');
        tb.appendChild(el('div','ck','What is usually checked first'));
        var ul=el('ul','tlist');
        (a.tests.length?a.tests:['Nothing specific at this stage']).forEach(function(t){
          ul.appendChild(el('li','',esc(t)));
        });
        tb.appendChild(ul);
        tb.appendChild(el('p','hint','Bring this up rather than booking it yourself. A doctor may skip some of it after examining you, and ordering tests without a reason tends to find things that were never the problem.'));
        panel.appendChild(tb);
      } else {
        var qb=el('div','dcard');
        qb.appendChild(el('div','ck','Worth asking'));
        var ol=el('ol','qlist');
        c.questions.forEach(function(q){ ol.appendChild(el('li','',esc(q))); });
        qb.appendChild(ol);
        if(S.flags.length){
          var fl=el('div','consider');
          fl.innerHTML='<div class="ct">Say this first</div><div class="cx">'+esc(S.flags[0].t)+'. '+esc(S.flags[0].d)+'</div>';
          qb.appendChild(fl);
        }
        panel.appendChild(qb);
      }
      B.reveal(panel,{step:0,start:0,from:10});
    }
    paint();

    var acts=el('div','actions');
    var save=el('button','btn primary', B.ICON.down+'<span>Save image</span>');
    save.addEventListener('click', function(){
      var n=panel.querySelector('.dcard');
      if(n) savePng(n); else B.toast('Open the Story tab first.');
    });
    var wa=el('button','btn quiet', B.ICON.wa+'<span>WhatsApp</span>');
    wa.addEventListener('click', function(){
      window.open('https://wa.me/?text='+encodeURIComponent(fullText(c,a,S)), '_blank', 'noopener');
    });
    var copy=el('button','btn quiet wide','Copy everything');
    copy.addEventListener('click', function(){
      var t=fullText(c,a,S);
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(t).then(function(){ B.toast('Copied.'); }, function(){ B.toast('Select and copy.'); });
      } else B.toast('Select and copy.');
    });
    var again=el('button','btn ghost wide','Start again');
    again.addEventListener('click', function(){ B.clearAll(); home(); });
    acts.appendChild(save); acts.appendChild(wa); acts.appendChild(copy); acts.appendChild(again);
    w.appendChild(acts);

    root.appendChild(w);
    stage.appendChild(root);
    B.reveal(w,{step:70,start:100});
  });
}

function fullText(c,a,S){
  var L=[B.card.text(c), ''];
  L.push('HOW URGENT');
  L.push('  '+(a.urgency==='now'?'Today':a.urgency==='soon'?'This week':'Not urgent')+'. '+a.why);
  if(a.spec) L.push('  Usually seen by: '+a.spec);
  if(a.consider.length){
    L.push('');
    L.push('WHAT IS USUALLY CONSIDERED');
    a.consider.forEach(function(x){ L.push('  '+x.t+'. '+x.d); });
  }
  if(a.tests.length){
    L.push('');
    L.push('USUALLY CHECKED FIRST');
    a.tests.forEach(function(t){ L.push('  '+t); });
  }
  L.push('');
  L.push('Not a diagnosis. Built from my own words.');
  return B.clean(L.join('\n'));
}

function meds(){
  swap(function(){
    var root=el('div','');
    root.appendChild(topbar('Back', home));
    var w=el('div','cardwrap');
    var hdr=el('div','hdr');
    hdr.innerHTML='<h1>What are you taking?</h1><p>Add everything, including supplements. Half of what people take cancels something else out.</p>';
    w.appendChild(hdr);

    var chosen=[];
    var inp=el('input','textin');
    inp.type='text';
    inp.placeholder='Start typing, for example Mintop, Pantop, iron';
    inp.style.minHeight='54px';
    w.appendChild(inp);
    var res=el('div','');
    res.style.marginTop='10px';
    w.appendChild(res);
    var out=el('div','');
    out.style.marginTop='16px';
    w.appendChild(out);

    function paint(){
      out.innerHTML='';
      if(!chosen.length){ return; }
      var pills=el('div','picks');
      pills.style.justifyContent='flex-start';
      chosen.forEach(function(m,i){
        var p=el('button','pick on', esc(m.n)+'  \u00d7');
        p.addEventListener('click', function(){ chosen.splice(i,1); paint(); });
        pills.appendChild(p);
      });
      out.appendChild(pills);

      var names=chosen.map(function(m){ return m.n; });
      var cl=B.scan.conflicts(names);
      var box=el('div','dcard');
      box.style.marginTop='14px';
      box.appendChild(el('div','ck', cl.length ? cl.length+' thing'+(cl.length>1?'s':'')+' to fix' : 'Nothing is fighting anything'));
      if(!cl.length){
        box.appendChild(el('p','lede','No known clash between these. Keep the timings on each label and you are fine.'));
      }
      cl.forEach(function(r){
        var row=el('div','clash'+(r.sev>=3?' bad':''));
        row.innerHTML='<span class="cd"></span><span class="cb"><span class="ch">'+esc(r.t)+
          '</span><span class="cs">'+esc(r.d)+'</span></span>';
        box.appendChild(row);
      });
      box.appendChild(el('p','hint','Timing guidance only, not dosing advice. If a prescriber told you differently about your own medicines, they are right.'));
      out.appendChild(box);

      chosen.forEach(function(m){ out.appendChild(B.scan.medCard(m,true)); });
    }

    inp.addEventListener('input', function(){
      res.innerHTML='';
      B.scan.match(inp.value).forEach(function(m){
        var b=el('button','door');
        b.innerHTML='<span class="dt"><span class="dl">'+esc(m.n)+'</span><span class="ds">'+esc(m.w)+'</span></span><span class="dc">+</span>';
        b.addEventListener('click', function(){
          var seen=false;
          chosen.forEach(function(x){ if(x.n===m.n) seen=true; });
          if(!seen) chosen.push(m);
          inp.value=''; res.innerHTML=''; paint();
        });
        res.appendChild(b);
      });
    });

    root.appendChild(w);
    stage.appendChild(root);
    B.reveal(w,{step:70,start:80});
  });
}

function savePng(node){
  B.toast('Rendering...');
  B.card.png(node, function(url){
    if(!url){ B.toast('Could not render. Copy as text instead.'); return; }
    var a=document.createElement('a');
    a.href=url;
    a.download='doctalk-card.png';
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){ try{ document.body.removeChild(a); }catch(e){} }, 100);
    B.toast('Saved.');
  });
}

function rx(){
  swap(function(){
    var root=el('div','');
    root.appendChild(topbar('Back', home));
    var w=el('div','cardwrap');
    var hdr=el('div','hdr');
    hdr.innerHTML='<h1>What is on this prescription?</h1><p>Photograph it, then confirm each name. Everything is read on your phone.</p>';
    w.appendChild(hdr);

    var shot=el('button','shot');
    shot.innerHTML='<div><div class="ic">'+B.ICON.cam+'</div>'+
      '<div style="font-weight:600;font-size:16px">Take a photo</div>'+
      '<div class="sm muted" style="margin-top:4px">Or choose one from your gallery</div></div>';
    shot.addEventListener('click', pick);
    w.appendChild(shot);

    var out=el('div','');
    w.appendChild(out);
    root.appendChild(w);
    stage.appendChild(root);

    function pick(){
      var inp=document.createElement('input');
      inp.type='file';
      inp.accept='image/' + '*';
      inp.setAttribute('capture','environment');
      inp.style.display='none';
      document.body.appendChild(inp);
      inp.addEventListener('change', function(){
        var f=inp.files && inp.files[0];
        try{ document.body.removeChild(inp); }catch(e){}
        if(f) read(f);
      });
      inp.click();
    }
    function read(file){
      var fr=new FileReader();
      fr.onload=function(){
        var img=new Image();
        img.onload=function(){ show(img, fr.result); };
        img.onerror=function(){ B.toast('That image would not open.'); };
        img.src=fr.result;
      };
      fr.onerror=function(){ B.toast('Could not read that file.'); };
      fr.readAsDataURL(file);
    }
    function show(img, src){
      out.innerHTML='';
      shot.style.display='none';
      var pv=el('div','preview');
      var im=document.createElement('img');
      im.src=src;
      im.alt='Your prescription';
      pv.appendChild(im);
      var line=el('div','scanline');
      pv.appendChild(line);
      var boxes=el('div','boxes');
      pv.appendChild(boxes);
      out.appendChild(pv);

      var blocks=[];
      try{ blocks=B.scan.textBlocks(img); }catch(e){}
      setTimeout(function(){
        line.remove();
        blocks.forEach(function(b,i){
          var n=el('i');
          n.style.cssText='left:'+(b.x*100)+'%;top:'+(b.y*100)+'%;width:'+(b.w*100)+'%;height:'+(b.h*100)+'%;animation-delay:'+(i*45)+'ms';
          boxes.appendChild(n);
        });
        var note=el('p','sm muted');
        note.style.marginTop='12px';
        note.textContent = blocks.length
          ? 'Found '+blocks.length+' lines of writing. Handwriting cannot be read reliably, so type each medicine name and it will be explained.'
          : 'Could not find clear lines of text. Type the medicine names and they will be explained.';
        out.appendChild(note);
        out.appendChild(picker());
      }, B.reduced?0:1600);
    }
    function picker(){
      var box=el('div','block');
      box.style.marginTop='14px';
      box.innerHTML='<div class="qlabel" style="margin-bottom:10px">Add a medicine</div>';
      var inp=el('input','textin');
      inp.type='text';
      inp.placeholder='Start typing, for example Mintop or Pantop';
      inp.style.minHeight='52px';
      box.appendChild(inp);
      var res=el('div','');
      res.style.marginTop='10px';
      box.appendChild(res);
      var list=el('div','');
      list.style.marginTop='14px';
      box.appendChild(list);
      inp.addEventListener('input', function(){
        res.innerHTML='';
        B.scan.match(inp.value).forEach(function(m){
          var b=el('button','door');
          b.style.marginBottom='8px';
          b.innerHTML='<span class="dt"><span class="dl">'+esc(m.n)+'</span><span class="ds">'+esc(m.w)+'</span></span><span class="dc">+</span>';
          b.addEventListener('click', function(){
            if(!B.session) B.newSession('rx');
            var seen=false;
            B.session.meds.forEach(function(x){ if(x.name===m.n) seen=true; });
            if(!seen) B.session.meds.push({name:m.n});
            list.appendChild(B.scan.medCard(m,true));
            inp.value='';
            res.innerHTML='';
          });
          res.appendChild(b);
        });
      });
      return box;
    }
  });
}

function showFlag(f){
  var box=$('#flag');
  box.innerHTML='<h3>'+esc(f.t)+'</h3><p>'+esc(f.d)+'</p>';
  var a=el('div','fa');
  var ok=el('button','btn primary sm','I understand');
  ok.addEventListener('click', function(){
    box.classList.remove('on');
    setTimeout(function(){ box.hidden=true; }, 320);
  });
  a.appendChild(ok);
  if(f.id==='selfharm'){
    var call=el('a','btn quiet sm','Call 14416');
    call.href='tel:14416';
    call.style.textDecoration='none';
    a.appendChild(call);
  }
  box.appendChild(a);
  box.hidden=false;
  requestAnimationFrame(function(){ box.classList.add('on'); });
  if(navigator.vibrate){ try{ navigator.vibrate([14,60,14]); }catch(e){} }
}

function seg(label, opts, cur, onPick){
  var w=el('div','');
  w.style.marginBottom='14px';
  w.appendChild(el('div','qlabel',esc(label)));
  var s=el('div','seg');
  s.style.gridTemplateColumns='repeat('+opts.length+',1fr)';
  opts.forEach(function(o){
    var b=el('button','',esc(o[1]));
    b.setAttribute('aria-pressed', o[0]===cur?'true':'false');
    b.addEventListener('click', function(){
      Array.prototype.forEach.call(s.children, function(n){ n.setAttribute('aria-pressed','false'); });
      b.setAttribute('aria-pressed','true');
      onPick(o[0]);
    });
    s.appendChild(b);
  });
  w.appendChild(s);
  return w;
}

function menu(){
  B.openSheet(function(sh){
    sh.appendChild(el('h2','','DocTalk'));
    sh.appendChild(el('p','lede','A private place to say the thing out loud and see it clearly.'));
    var box=el('div','');
    box.style.marginTop='8px';
    box.appendChild(seg('Captions', [['hinglish','Hinglish'],['english','English']], B.prefs.lang, function(v){
      B.setPref('lang', v);
      B.toast(v==='english' ? 'Captions in English.' : 'Captions in Hinglish.');
    }));
    box.appendChild(seg('Look', [['system','System'],['light','Light'],['dark','Dark']], B.prefs.theme, function(v){
      B.setPref('theme', v);
      if(orb) orb.refresh();
    }));
    box.appendChild(seg('Motion', [['full','Full'],['calm','Calm']], B.prefs.motion, function(v){
      B.setPref('motion', v);
    }));
    sh.appendChild(box);

    var about=el('div','');
    about.style.marginTop='16px';
    [['What this is','You talk, it listens, and it asks the things that actually matter about a symptom. At the end you get your story laid out in one page, clear enough to act on or to hand to someone. It does not diagnose or prescribe.'],
     ['Where your words go','Nowhere. Speech is turned into text by your own browser, the session lives in memory, and closing the tab erases it. No account, no server, no recording kept.'],
     ['How the questions are chosen','It tracks six things that decide what a symptom means: how long, how bad, the pattern, what you have tried, what it affects, and your history. It asks for whatever is still missing, one at a time.'],
     ['If something urgent comes up','Certain things stop the flow and tell you to get seen, including chest pain, heavy bleeding, sudden vision loss and thoughts of self harm. That last one shows the Tele MANAS number, 14416.']
    ].forEach(function(p){
      var d=el('details','g','<summary>'+esc(p[0])+'</summary>');
      d.appendChild(el('div','inner', esc(p[1])));
      about.appendChild(d);
    });
    sh.appendChild(about);

    var clr=el('button','btn quiet', B.ICON.trash+'<span>Clear everything</span>');
    clr.style.cssText='width:100%;margin-top:16px';
    clr.addEventListener('click', function(){
      B.clearAll();
      B.closeSheet();
      home();
      B.toast('Cleared.');
    });
    sh.appendChild(clr);
  });
}

$('#scrim').addEventListener('click', function(e){ if(e.target===$('#scrim')) B.closeSheet(); });
document.addEventListener('keydown', function(e){
  if(e.key!=='Escape') return;
  if(!$('#scrim').hidden) B.closeSheet();
  else if(!$('#flag').hidden){
    $('#flag').classList.remove('on');
    setTimeout(function(){ $('#flag').hidden=true; }, 320);
  }
});
if(window.matchMedia){
  var mq=window.matchMedia('(prefers-color-scheme: dark)');
  var f=function(){ if(orb) orb.refresh(); };
  if(mq.addEventListener) mq.addEventListener('change', f);
  else if(mq.addListener) mq.addListener(f);
}

home();
})();
