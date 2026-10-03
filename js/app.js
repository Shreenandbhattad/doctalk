(function(){
'use strict';
var B=window.DT, el=B.el, esc=B.esc, $=B.$;
var stage=$('#stage'), bar=$('#tabbar'), orb=null, mic=null;
var here='home';

var TABS=[
  ['home','Home', B.ICON.home],
  ['talk','Talk', B.ICON.wave],
  ['insights','Insights', B.ICON.chart],
  ['tools','Tools', B.ICON.grid],
  ['you','You', B.ICON.user]
];

function paintBar(){
  bar.innerHTML='';
  TABS.forEach(function(t){
    var b=el('button','tabbtn', t[2]+'<span>'+esc(t[1])+'</span>');
    b.setAttribute('aria-current', here===t[0]?'true':'false');
    b.addEventListener('click', function(){ go(t[0]); });
    bar.appendChild(b);
  });
}

function swap(render, root){
  if(orb){ orb.stop(); orb=null; }
  if(mic){ mic.abort(); mic=null; }
  B.hush(); B.onSpeakAmp=null;
  if(root){ here=root; bar.hidden=false; paintBar(); }
  var old=stage.firstElementChild;
  function go(){
    stage.innerHTML='';
    var s=render();
    stage.appendChild(s);
    if(!B.reduced) s.style.animation='rise .42s cubic-bezier(.22,.9,.3,1)';
    window.scrollTo(0,0);
  }
  if(old && !B.reduced){
    old.style.transition='opacity .16s ease, transform .16s ease';
    old.style.opacity='0';
    old.style.transform='scale(.985)';
    setTimeout(go, 140);
  } else go();
}

function go(name, arg){
  if(name==='home') home();
  else if(name==='talk') talk(arg);
  else if(name==='insights') insights();
  else if(name==='tools') tools();
  else if(name==='you') you();
}

function screen(cls){ return el('section','screen '+(cls||'pad')); }

function header(){
  var h=el('div','hdr');
  var a=el('button','brandmark', B.logo(44));
  a.setAttribute('aria-label','DocTalk home');
  a.addEventListener('click', function(){ go('home'); });
  var b=el('div','hb');
  var hk=el('div','hk'); hk.textContent=B.greet();
  var hn=el('div','hn'); hn.textContent=B.firstName()||'there';
  b.appendChild(hk); b.appendChild(hn);
  var m=el('button','icbtn', B.ICON.dots);
  m.setAttribute('aria-label','Menu');
  m.addEventListener('click', menu);
  h.appendChild(a); h.appendChild(b); h.appendChild(m);
  return h;
}

function navbar(label, onBack, right){
  var h=el('div','hdr');
  var b=el('button','back', B.ICON.back+'<span>'+esc(label||'Back')+'</span>');
  b.addEventListener('click', onBack);
  var sp=el('div','hb');
  h.appendChild(b); h.appendChild(sp);
  if(right) h.appendChild(right);
  return h;
}

/* ---------- onboarding ---------- */

var AGES=[['teen','Under 20'],['20s','20 to 29'],['30s','30 to 39'],['40s','40 to 54'],['55','55 and over']];
var SEX=[['female','Female'],['male','Male'],['other','Other']];

function onboard(step, draft){
  step=step||0;
  draft=draft||{name:'', age:'', sex:'', focus:[]};
  bar.hidden=true;

  swap(function(){
    var s=screen('full');
    var ob=el('div','ob');

    if(step>0){
      var top=el('div','hdr');
      var back=el('button','back', B.ICON.back+'<span>Back</span>');
      back.addEventListener('click', function(){ onboard(step-1, draft); });
      top.appendChild(back); top.appendChild(el('div','hb'));
      s.appendChild(top);
    }

    if(step===0){
      var wm=el('div','wordmark', B.logo(30)+'<span>DocTalk</span>');
      s.appendChild(wm);
      var halo=el('div','halo');
      var ow=el('div','orbwrap');
      ow.style.cssText='width:168px;height:168px';
      halo.appendChild(el('div','orbit'));
      halo.appendChild(ow);
      ob.appendChild(halo);
      ob.appendChild(el('h1','','Say it out loud.<br><span class="g">Once.</span>'));
      ob.appendChild(el('p','','Some things are hard to say to anyone. Say them here instead, and walk out with the whole picture.'));
      var pl=el('div','pills');
      ['Private','Voice first','No sign up'].forEach(function(t){ pl.appendChild(el('span','',t)); });
      ob.appendChild(pl);
      var g=el('button','btn primary wide','Get started');
      g.addEventListener('click', function(){ onboard(1, draft); });
      g.style.marginTop='30px';
      ob.appendChild(g);
      var skip=el('button','btn ghost wide','I have been here before');
      skip.style.marginTop='6px';
      skip.addEventListener('click', function(){
        B.setMe({name:'', age:'', sex:'', focus:[], at:Date.now()});
        go('home');
      });
      ob.appendChild(skip);
      s.appendChild(ob);
      setTimeout(function(){ orb=B.Orb(ow,{size:168}); }, 0);
      return s;
    }

    if(step===1){
      ob.appendChild(el('h1','','What should I<br>call you?'));
      ob.appendChild(el('p','','Only so the app does not talk to you like a form. It stays on this phone.'));
      var inp=el('input','bigin');
      inp.type='text'; inp.value=draft.name; inp.placeholder='Your name';
      inp.setAttribute('autocomplete','given-name');
      ob.appendChild(inp);
      var n=el('button','btn primary wide','Continue');
      n.addEventListener('click', function(){
        draft.name=inp.value.trim();
        if(!draft.name){ B.toast('Put in a name, or anything you like.'); return; }
        onboard(2, draft);
      });
      ob.appendChild(n);
      inp.addEventListener('keydown', function(e){ if(e.key==='Enter') n.click(); });
      s.appendChild(ob);
      s.appendChild(dots(1));
      setTimeout(function(){ try{ inp.focus(); }catch(e){} }, 420);
      return s;
    }

    if(step===2){
      ob.appendChild(el('h1','','A little<br>about you'));
      ob.appendChild(el('p','','This changes which follow ups you get asked, nothing else.'));
      var g1=el('div','grid2');
      AGES.forEach(function(a){
        var b=el('button','opt'+(draft.age===a[0]?' on':''), esc(a[1]));
        b.addEventListener('click', function(){
          draft.age=a[0];
          Array.prototype.forEach.call(g1.children,function(n){ n.classList.remove('on'); });
          b.classList.add('on');
        });
        g1.appendChild(b);
      });
      ob.appendChild(g1);
      var g2=el('div','grid2');
      g2.style.gridTemplateColumns='repeat(3,1fr)';
      SEX.forEach(function(a){
        var b=el('button','opt'+(draft.sex===a[0]?' on':''), esc(a[1]));
        b.addEventListener('click', function(){
          draft.sex=a[0];
          Array.prototype.forEach.call(g2.children,function(n){ n.classList.remove('on'); });
          b.classList.add('on');
        });
        g2.appendChild(b);
      });
      ob.appendChild(g2);
      var n2=el('button','btn primary wide','Continue');
      n2.style.marginTop='24px';
      n2.addEventListener('click', function(){
        if(!draft.age || !draft.sex){ B.toast('Pick one from each.'); return; }
        onboard(3, draft);
      });
      ob.appendChild(n2);
      s.appendChild(ob);
      s.appendChild(dots(2));
      return s;
    }

    ob.appendChild(el('h1','','Anything on<br>your mind?'));
    ob.appendChild(el('p','','Pick what you want close at hand. You can talk about anything else any time.'));
    var ch=el('div','chips');
    ch.style.cssText='justify-content:center;margin-top:24px';
    B.conditions.ORDER.filter(function(id){
      return B.relevant(id) || draft.sex!=='male' ? true : false;
    }).forEach(function(id){
      if(draft.sex==='male' && id==='period') return;
      var a=B.conditions.get(id);
      var b=el('button','chip'+(draft.focus.indexOf(id)>-1?' on':''), esc(a.title));
      b.addEventListener('click', function(){
        var i=draft.focus.indexOf(id);
        if(i>-1){ draft.focus.splice(i,1); b.classList.remove('on'); }
        else { draft.focus.push(id); b.classList.add('on'); }
      });
      ch.appendChild(b);
    });
    ob.appendChild(ch);
    var fin=el('button','btn primary wide','Done');
    fin.style.marginTop='26px';
    fin.addEventListener('click', function(){
      draft.at=Date.now();
      B.setMe(draft);
      settle();
    });
    ob.appendChild(fin);
    s.appendChild(ob);
    s.appendChild(dots(3));
    return s;
  });

  function dots(i){
    var d=el('div','dots');
    for(var k=1;k<=3;k++) d.appendChild(el('i', k===i?'on':''));
    return d;
  }
}

function settle(){
  bar.hidden=true;
  swap(function(){
    var s=screen('full');
    var w=el('div','build');
    w.appendChild(el('div','bl', B.logo(64)));
    w.appendChild(el('h2','','Setting things up for '+esc(B.firstName()||'you')));
    var ul=el('ul','bsteps');
    ['Keeping everything on this phone','Tuning the questions to you','Getting your space ready'].forEach(function(t){
      ul.appendChild(el('li','', '<span class="bk"></span><span>'+esc(t)+'</span>'));
    });
    w.appendChild(ul); s.appendChild(w);
    var items=ul.children, i=0;
    function tick(){
      if(i>0) items[i-1].classList.add('done');
      if(i<items.length){ items[i].classList.add('now'); i++; setTimeout(tick, B.reduced?10:560); }
      else setTimeout(function(){ go('home'); }, B.reduced?10:420);
    }
    setTimeout(tick, 250);
    return s;
  });
}

/* ---------- home ---------- */

function home(){
  swap(function(){
    var s=screen();
    s.appendChild(header());

    var hero=el('div','hero');
    var last=B.history()[0];
    hero.innerHTML='<h2>'+(last? 'Anything changed?' : 'What is bothering you?')+'</h2>'+
      '<p>'+(last
        ? 'Last time it was '+esc((last.title||'something').toLowerCase())+'. Pick that up again, or start something new.'
        : 'Talk for ninety seconds. It asks the follow ups that actually decide what a symptom means.')+'</p>';
    var hb=el('button','btn primary', B.ICON.mic+'<span>Start talking</span>');
    hb.addEventListener('click', function(){ go('talk','new'); });
    hero.appendChild(hb);
    var st=el('div','hstats');
    [['90 sec','to say it'],['6','things it asks'],['0','uploads']].forEach(function(x){
      st.appendChild(el('div','','<b>'+x[0]+'</b><span>'+x[1]+'</span>'));
    });
    hero.appendChild(st);
    s.appendChild(hero);

    var me=B.me||{};
    if(me.focus && me.focus.length){
      s.appendChild(sectionLabel('You are watching'));
      var sc=el('div','scroller');
      sc.style.marginBottom='6px';
      me.focus.forEach(function(id){
        var a=B.conditions.get(id); if(!a) return;
        var b=el('button','acard');
        b.innerHTML='<div class="ai">'+esc(a.title.charAt(0))+'</div><div class="an">'+esc(a.title)+'</div><div class="as">'+esc(a.spec)+'</div>';
        b.addEventListener('click', function(){ condition(id,'home'); });
        sc.appendChild(b);
      });
      var add=el('button','acard add','Edit');
      add.addEventListener('click', function(){ focusSheet(home); });
      sc.appendChild(add);
      s.appendChild(sc);
    }

    s.appendChild(sectionLabel('Quick'));
    var bn=el('div','bento');
    [[B.ICON.pill,'Prescription','Read it, name by name', rx],
     [B.ICON.flask,'Interactions','What cancels what out', meds],
     [B.ICON.book,'Library','Thirteen areas', library],
     [B.ICON.shield,'When to worry','Signs that mean today', worry]
    ].forEach(function(t){
      var b=el('button','tile','<span class="ti2">'+t[0]+'</span><span><span class="tt">'+esc(t[1])+'</span><span class="tsb">'+esc(t[2])+'</span></span>');
      b.addEventListener('click', t[3]);
      bn.appendChild(b);
    });
    s.appendChild(bn);

    var h=B.history();
    if(h.length){
      s.appendChild(sectionLabel('Recent'));
      var rc=el('div','card');
      h.slice(0,3).forEach(function(e){
        rc.appendChild(row(B.ICON.clock, e.title, B.ago(e.at), function(){ replay(e,'home'); }));
      });
      if(h.length>3){
        var more=el('button','btn ghost wide sm','See all '+h.length);
        more.addEventListener('click', function(){ history('home'); });
        rc.appendChild(more);
      }
      s.appendChild(rc);
    } else {
      var tip=el('div','card raise');
      tip.innerHTML='<div class="lbl" style="margin-bottom:8px">Why talking helps</div>'+
        '<p class="lede">People search a symptom at 2am and then tell a doctor half of it. Saying the whole thing out loud once, with something asking the right follow ups, is the difference between a wasted visit and a useful one.</p>';
      s.appendChild(tip);
    }

    s.appendChild(privLine());
    B.reveal(s,{step:55,start:40});
    return s;
  }, 'home');
}

function sectionLabel(t){
  var d=el('div','lbl', esc(t));
  d.style.cssText='margin:18px 0 9px';
  return d;
}
function privLine(){
  var p=el('p','xs muted');
  p.style.cssText='text-align:center;margin:18px 0 6px';
  p.textContent='Nothing leaves your phone. Not a diagnosis.';
  return p;
}
function row(icon, title, sub, onTap){
  var r=el('button','row tap');
  r.innerHTML='<span class="ri">'+icon+'</span><span class="rb"><span class="rt">'+esc(title)+'</span>'+
    (sub ? '<span class="rs">'+esc(sub)+'</span>' : '')+'</span><span class="rc">&rsaquo;</span>';
  r.addEventListener('click', onTap);
  return r;
}

/* ---------- talk ---------- */

function talk(mode){
  var resume = mode!=='new' && B.session && B.session.turns.length && !B.session.saved;
  var S = resume ? B.session : B.newSession('symptom');
  swap(function(){
    var s=screen('pad');
    s.appendChild(navbar('Home', function(){ go('home'); }));
    var t=el('div','talk');

    var qw=el('div','qwrap');
    var qn=el('div','qn','Question 1');
    var q=el('div','q');
    var qh=el('div','qh dev');
    qh.style.minHeight='1.3em';
    qw.appendChild(qn); qw.appendChild(q); qw.appendChild(qh);
    t.appendChild(qw);

    var zone=el('div','orbzone');
    var ow=el('button','orbbtn');
    ow.style.cssText='width:198px;height:198px';
    ow.setAttribute('aria-label','Tap to speak');
    zone.appendChild(ow);
    t.appendChild(zone);

    var cap=el('div','cap');
    var capEl=el('p','ph', (B.prefs.hands!==false && B.speechSupported) ? 'Tap the orb and I will start' : 'Tap the orb and just talk');
    cap.appendChild(capEl);
    t.appendChild(cap);

    var live=el('button','livepill');
    live.hidden=true;
    live.addEventListener('click', function(){ go('insights'); });
    t.appendChild(live);

    var picks=el('div','picks');
    t.appendChild(picks);

    var pet=el('div','petals');
    B.interview.PETALS.forEach(function(p){
      pet.appendChild(el('span','petal','<i></i>'+esc(p.label)));
    });
    t.appendChild(pet);

    var tb=el('div','talkbar');
    var type=el('button','btn quiet', B.ICON.keyboard);
    type.setAttribute('aria-label','Type instead');
    var vo=el('button','btn quiet','');
    var done=el('button','btn primary','Tell me a bit more');
    done.disabled=true;
    done.addEventListener('click', function(){ B.hush(); building(S); });
    tb.appendChild(type); tb.appendChild(vo); tb.appendChild(done);
    t.appendChild(tb);

    s.appendChild(t);

    setTimeout(function(){
      orb=B.Orb(ow,{size:198});
      var ring=B.ring(198);
      ring.node.classList.add('orbring');
      ow.appendChild(ring.node);
      wire(ring);
    },0);

    function setCaption(x){ capEl.className=''; capEl.textContent=x; }

    function wire(ring){
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
        var A=B.interview.assess(S);
        if(S.slots.area && A.area){
          live.hidden=false;
          var tone2 = A.urgency==='now' ? 'var(--bad)' : A.urgency==='soon' ? 'var(--warn)' : 'var(--good)';
          live.style.setProperty('--uc', tone2);
          var label = A.urgency==='now' ? 'See someone today' : A.urgency==='soon' ? 'Worth booking' : 'No rush';
          live.innerHTML='<i></i><span>'+esc(A.area.title)+'</span><b>'+esc(label)+'</b>';
        }
        var n=B.interview.next(S);
        picks.innerHTML='';
        if(n && n.pick){
          n.pick.forEach(function(p,i){
            var pb=el('button','chip', esc(p[1]));
            pb.addEventListener('click', function(){
              B.interview.answerPick(S, n.key, p[0]);
              setCaption(p[1]);
              refresh();
            });
            if(!B.reduced) pb.style.animation='pop .36s var(--spring) '+(i*55)+'ms backwards';
            picks.appendChild(pb);
          });
        }
        qn.textContent = n ? ('Question '+(S.turns.length+1)) : 'Your story is ready';
        if(n){
          if(q.textContent!==n.q && !B.reduced){
            q.style.animation='none'; void q.offsetWidth;
            q.style.animation='rise .45s var(--ease)';
          }
          q.textContent=n.q;
          qh.textContent=B.prefs.lang==='hinglish' ? n.h : '';
        } else {
          q.textContent='That is enough to work with.';
          qh.textContent=B.prefs.lang==='hinglish' ? 'Aur kuch add karna ho to bolo, warna card bana lo.' : 'Add anything else, or see your read.';
        }
        var ready=B.interview.filled(S)>=2;
        done.disabled=!ready;
        done.textContent = ready ? 'See my read' : 'Tell me a bit more';
      }

      var hands = B.prefs.hands!==false;
      var speaking=false, spoke=false, quiet=null, seen={};
      B.onSpeakAmp=function(v){ if(orb) orb.setAmp(v); };

      function paintVo(){
        vo.innerHTML=hands ? B.ICON.speaker : B.ICON.speakeroff;
        vo.setAttribute('aria-label', hands ? 'Voice on' : 'Voice off');
        vo.setAttribute('aria-pressed', hands ? 'true' : 'false');
      }
      paintVo();
      vo.addEventListener('click', function(){
        hands=!hands;
        B.setPref('hands', hands);
        paintVo();
        if(!hands){ B.hush(); speaking=false; clearTimeout(quiet); }
        B.toast(hands ? 'Voice on. I will ask and listen.' : 'Voice off. Tap the orb to talk.');
      });

      function listen(){
        if(!hands || !B.speechSupported || !mic || mic.running()) return;
        try{ mic.start(); }catch(e){}
      }

      function ack(){
        var s=S.slots, line='';
        if(s.duration && s.duration.label && !seen.duration) line='Okay, '+s.duration.label+'.';
        else if(s.severity!==undefined && !seen.severity) line = s.severity>=7 ? 'That sounds rough.' : 'Got it.';
        else if(s.tried && s.tried.length && !seen.tried) line='Thanks, noted what you tried.';
        else line=['Okay.','Got it.','Thanks, that helps.','Understood.'][S.turns.length%4];
        if(s.duration) seen.duration=1;
        if(s.severity!==undefined) seen.severity=1;
        if(s.tried && s.tried.length) seen.tried=1;
        return line;
      }

      function thinking(on){
        if(on){ capEl.className='ph think'; capEl.textContent=''; }
      }

      function speak(line, then){
        if(!hands){ return; }
        speaking=true;
        if(orb) orb.listen(false);
        B.say(line, function(){ speaking=false; if(then) then(); });
      }

      function ask(prefix){
        var n=B.interview.next(S);
        var line=(prefix?prefix+' ':'')+(n ? n.q : 'That is enough to work with. Tap see my read, or keep talking.');
        speak(line, n ? listen : null);
      }

      var quietCount=0;

      function commit(text){
        var asked=B.interview.next(S);
        if(!text || !text.trim()){
          quietCount++;
          if(!hands) return;
          if(quietCount>=2){
            capEl.className='ph'; capEl.textContent='Tap the orb when you are ready';
            speak('No rush. Tap the orb whenever you are ready.', null);
          } else {
            speak('I did not catch anything. Take your time, I am listening.', listen);
          }
          return;
        }
        quietCount=0;
        S.turns.push(text.trim());
        var flags=B.interview.extract(S, text);
        var res=B.interview.resolve(S, asked && asked.key, text);
        setCaption(B.clean(text.trim()));
        refresh();
        if(flags.length){
          showFlag(flags[0]);
          if(hands){ speak(flags[0].t+'. '+flags[0].d, null); }
          return;
        }
        if(res==='retry'){
          var cl=B.interview.clarify(S, asked);
          qh.textContent=cl;
          speak(cl, listen);
          return;
        }
        thinking(true);
        ask(res==='skip' ? 'No problem, we can leave that.' : ack());
        var nx=B.interview.next(S);
        if(nx && nx.q && B.warm) B.warm(nx.q);
      }

      type.addEventListener('click', function(){ B.hush(); speaking=false; typeSheet(commit); });

      mic=B.Mic({
        onAmp:function(v){ if(orb && !speaking) orb.setAmp(v); },
        onStart:function(){
          if(orb) orb.listen(true);
          ow.classList.add('live');
          capEl.className='ph'; capEl.textContent='Listening';
        },
        onText:function(fin, interim){
          capEl.className='';
          capEl.innerHTML=esc(fin)+(interim? ' <span class="im">'+esc(interim)+'</span>' : '');
          clearTimeout(quiet);
          if(hands && fin){ quiet=setTimeout(function(){ if(mic && mic.running()) mic.stop(); }, 1400); }
        },
        onEnd:function(fin){
          clearTimeout(quiet);
          if(orb){ orb.listen(false); orb.setAmp(0); }
          ow.classList.remove('live');
          commit(fin);
        },
        onBlocked:function(){
          clearTimeout(quiet);
          if(orb) orb.listen(false);
          ow.classList.remove('live');
          B.toast('Microphone is not available here. Type it instead.');
          typeSheet(commit);
        }
      });

      function toggle(){
        if(!mic) return;
        if(speaking){ B.hush(); speaking=false; listen(); if(!hands && B.speechSupported) mic.start(); return; }
        if(mic.running()){ mic.stop(); return; }
        if(!B.speechSupported){ typeSheet(commit); return; }
        if(hands && !spoke){ spoke=true; ask(''); }
        else mic.start();
      }
      ow.addEventListener('click', toggle);

      refresh();
      if(resume && S.turns.length) setCaption(B.clean(S.turns[S.turns.length-1]));
      if(!B.speechSupported){
        qh.textContent='This browser will not give the microphone. Tap the keyboard to type.';
      }
    }

    return s;
  }, 'talk');
}

function typeSheet(onAdd){
  B.openSheet(function(sh){
    sh.appendChild(el('h2','','Type it instead'));
    sh.appendChild(el('p','lede','Same thing, no microphone needed.'));
    var ta=el('textarea','textin');
    ta.placeholder=B.prefs.lang==='hinglish' ? 'Mere baal teen mahine se jhad rahe hain...' : 'My hair has been thinning for three months...';
    ta.style.marginTop='14px';
    sh.appendChild(ta);
    var b=el('button','btn primary wide','Add this');
    b.style.marginTop='12px';
    function send(){
      var v=ta.value.trim();
      if(!v){ B.toast('Write a line first.'); return; }
      B.closeSheet();
      setTimeout(function(){ onAdd(v); }, 200);
    }
    b.addEventListener('click', send);
    ta.addEventListener('keydown', function(e){ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); } });
    sh.appendChild(b);
    setTimeout(function(){ try{ ta.focus(); }catch(e){} }, 380);
  });
}

/* ---------- the read ---------- */

function building(S){
  swap(function(){
    var s=screen('full');
    var w=el('div','build');
    w.appendChild(el('div','bl', B.logo(56)));
    w.appendChild(el('h2','','Putting your read together'));
    var steps=['Listening back to what you said','Matching it against what doctors ask','Checking for anything urgent','Writing it up'];
    var ul=el('ul','bsteps');
    steps.forEach(function(t){ ul.appendChild(el('li','', '<span class="bk"></span><span>'+esc(t)+'</span>')); });
    w.appendChild(ul);
    s.appendChild(w);
    var items=ul.children, i=0;
    function tick(){
      if(i>0) items[i-1].classList.add('done');
      if(i<items.length){ items[i].classList.add('now'); i++; setTimeout(tick, B.reduced?10:520); }
      else setTimeout(function(){ card(S); }, B.reduced?10:380);
    }
    setTimeout(tick, 200);
    return s;
  }, 'talk');
}

function card(S, from){
  var c=B.card.build(S), a=B.interview.assess(S), tab='story';
  if(S.turns.length && !from && !S.saved) S.saved=true;
  if(S.turns.length && !from) B.remember({
    at:Date.now(), area:a.area, title:entryTitle(a, S),
    urgency:a.urgency, turns:S.turns.slice(0), door:S.door
  });
  swap(function(){
    var s=screen('pad');
    s.appendChild(navbar(from==='history'?'History':'Talk', function(){
      from==='history' ? history('you') : go('talk');
    }));
    s.appendChild(el('div','title','Your read'));

    var tone = a.urgency==='now' ? 'var(--bad)' : a.urgency==='soon' ? 'var(--warn)' : 'var(--good)';
    var head = a.urgency==='now' ? 'Get this looked at today'
             : a.urgency==='soon' ? 'Worth booking this week'
             : 'No rush, but worth raising';
    var u=el('div','urg');
    u.style.setProperty('--uc', tone);
    u.innerHTML='<span class="ud"></span><span><span class="ut">'+esc(head)+
      '</span><span class="us">'+esc(a.why)+(a.spec?' Usually a '+esc(a.spec.toLowerCase())+'.':'')+'</span></span>';
    s.appendChild(u);

    var tabs=el('div','tabs'), panel=el('div','');
    var T=[['story','Story'],['think','Considered'],['tests','Tests'],['ask','Ask']];
    T.forEach(function(t){
      var b=el('button','tab',esc(t[1]));
      b.setAttribute('aria-selected', tab===t[0]?'true':'false');
      b.addEventListener('click', function(){
        tab=t[0];
        Array.prototype.forEach.call(tabs.children,function(n,i){
          n.setAttribute('aria-selected', T[i][0]===tab?'true':'false');
        });
        paint();
      });
      tabs.appendChild(b);
    });
    s.appendChild(tabs); s.appendChild(panel);

    function paint(){
      panel.innerHTML='';
      if(tab==='story'){
        panel.appendChild(B.card.render(c));
      } else if(tab==='think'){
        var box=el('div','dcard');
        box.appendChild(el('div','ck','What a doctor will weigh'));
        if(!a.consider.length)
          box.appendChild(el('p','lede','Not enough detail yet to narrow it. Go back and answer a couple more questions.'));
        a.consider.forEach(function(x){
          var it=el('div','item');
          it.innerHTML='<div class="it">'+esc(x.t)+'</div><div class="ix">'+esc(x.d)+'</div>';
          box.appendChild(it);
        });
        box.appendChild(el('p','hint','These are the things commonly ruled in or out for what you described. It is how the conversation usually goes, not a diagnosis.'));
        panel.appendChild(box);
      } else if(tab==='tests'){
        var tbx=el('div','dcard');
        tbx.appendChild(el('div','ck','What is usually checked first'));
        var ul=el('ul','tlist');
        (a.tests.length?a.tests:['Nothing specific at this stage']).forEach(function(x){ ul.appendChild(el('li','',esc(x))); });
        tbx.appendChild(ul);
        tbx.appendChild(el('p','hint','Bring this up rather than booking it yourself. Ordering tests without a reason tends to find things that were never the problem.'));
        panel.appendChild(tbx);
      } else {
        var qb=el('div','dcard');
        qb.appendChild(el('div','ck','Worth asking'));
        var ol=el('ol','qlist');
        c.questions.forEach(function(x){ ol.appendChild(el('li','',esc(x))); });
        qb.appendChild(ol);
        if(S.flags.length){
          var fl=el('div','item');
          fl.innerHTML='<div class="it">Say this first</div><div class="ix">'+esc(S.flags[0].t)+'. '+esc(S.flags[0].d)+'</div>';
          qb.appendChild(fl);
        }
        panel.appendChild(qb);
      }
      B.reveal(panel,{step:0,start:0,from:10});
    }
    paint();

    var acts=el('div','actions');
    acts.style.marginTop='14px';
    var save=el('button','btn primary', B.ICON.down+'<span>Save image</span>');
    save.addEventListener('click', function(){
      var n=panel.querySelector('.dcard');
      if(n) savePng(n); else B.toast('Open the Story tab first.');
    });
    var wa=el('button','btn quiet', B.ICON.wa+'<span>Send</span>');
    wa.addEventListener('click', function(){
      window.open('https://wa.me/?text='+encodeURIComponent(fullText(c,a,S)), '_blank', 'noopener');
    });
    var copy=el('button','btn quiet wide','Copy everything');
    copy.addEventListener('click', function(){
      var t=fullText(c,a,S);
      if(navigator.clipboard && navigator.clipboard.writeText)
        navigator.clipboard.writeText(t).then(function(){ B.toast('Copied.'); }, function(){ B.toast('Select and copy.'); });
      else B.toast('Select and copy.');
    });
    var again=el('button','btn ghost wide','Talk about something else');
    again.addEventListener('click', function(){ go('talk','new'); });
    acts.appendChild(save); acts.appendChild(wa); acts.appendChild(copy); acts.appendChild(again);
    s.appendChild(acts);
    return s;
  }, 'talk');
}

function entryTitle(a, S){
  var area=a.area && B.conditions.get(a.area);
  if(area) return area.title;
  var first=B.clean(S.turns[0]||'A conversation');
  return first.length>42 ? first.slice(0,42).replace(/\s\S*$/,'')+'...' : first;
}

function replay(entry, from){
  var S=B.newSession(entry.door||'symptom');
  entry.turns.forEach(function(t){ S.turns.push(t); B.interview.extract(S,t); });
  card(S, from==='you'?'history':'');
}

function fullText(c,a,S){
  var L=[B.card.text(c), ''];
  L.push('HOW URGENT');
  L.push('  '+(a.urgency==='now'?'Today':a.urgency==='soon'?'This week':'Not urgent')+'. '+a.why);
  if(a.spec) L.push('  Usually seen by: '+a.spec);
  if(a.consider.length){
    L.push(''); L.push('WHAT IS USUALLY CONSIDERED');
    a.consider.forEach(function(x){ L.push('  '+x.t+'. '+x.d); });
  }
  if(a.tests.length){
    L.push(''); L.push('USUALLY CHECKED FIRST');
    a.tests.forEach(function(t){ L.push('  '+t); });
  }
  L.push(''); L.push('Not a diagnosis. Built from my own words.');
  return B.clean(L.join('\n'));
}

/* ---------- insights ---------- */

var LINKS=[
  [['hair','energy'],'Hair shedding with tiredness often shares one cause, usually iron or thyroid. One blood test can cover both.'],
  [['hair','sleep'],'Poor sleep and shedding can feed each other. Mention both so sleep gets looked at too.'],
  [['hair','period'],'Hair loss with uneven periods is worth a hormone check, including PCOS.'],
  [['skin','period'],'Breakouts that flare around periods point to hormones, which changes what treatment is likely to work.'],
  [['skin','gut'],'Digestion and skin often move together. Say both, it can change what gets tried first.'],
  [['sleep','mood'],'Poor sleep and low mood feed each other, so raise them together rather than one at a time.'],
  [['sleep','energy'],'Tiredness that does not clear with sleep is worth a thyroid, iron and vitamin D check.'],
  [['gut','mood'],'Stress and the gut talk to each other, so a flare in one often follows the other.'],
  [['weight','energy'],'Weight change with tiredness is a classic reason to check thyroid and blood sugar.'],
  [['sexual','mood'],'Mood, stress and sexual health are tightly linked. A doctor will want to hear about both.'],
  [['pain','sleep'],'Pain that wrecks sleep and sleep loss that worsens pain is worth raising as one problem.']
];

function sessionOf(entry){
  var S=B.blankSession(entry.door||'symptom');
  entry.turns.forEach(function(t){ S.turns.push(t); B.interview.extract(S,t); });
  return S;
}
function toneOf(u){ return u==='now' ? 'var(--bad)' : u==='soon' ? 'var(--warn)' : 'var(--good)'; }
function factsOf(S){
  var s=S.slots, f=[];
  if(s.duration) f.push(s.duration.label);
  if(s.severity!==undefined) f.push(s.severity+' out of 10');
  if(s.pattern) f.push(s.pattern);
  return f.join(', ');
}

function insights(){
  swap(function(){
    var s=screen();
    s.appendChild(header());
    s.appendChild(el('div','title','Insights'));

    var reads=B.history().slice().reverse().map(function(e){
      var S=sessionOf(e); return {e:e, S:S, A:B.interview.assess(S)};
    });
    var live=null;
    if(B.session && B.session.turns.length && !B.session.saved)
      live={S:B.session, A:B.interview.assess(B.session)};

    if(!reads.length && !live){
      s.appendChild(el('p','sub','Your whole health picture builds here as you talk. Patterns, links between things, and what to ask for.'));
      var e=el('div','empty');
      e.innerHTML='<div class="eo">'+B.ICON.chart+'</div><p>Nothing to read yet. Talk something through and this fills in live.</p>';
      s.appendChild(e);
      var g=el('button','btn primary wide', B.ICON.mic+'<span>Start talking</span>');
      g.addEventListener('click', function(){ go('talk','new'); });
      s.appendChild(g);
      return s;
    }
    s.appendChild(el('p','sub','Everything you have said, put together. Updates the moment you talk.'));

    var all=reads.slice();
    if(live) all.push({e:{at:Date.now()}, S:live.S, A:live.A, live:true});

    if(live){
      var lc=el('div','card livecard');
      lc.appendChild(el('div','lvh','<span class="lvd"></span><span class="lbl">Live now</span>'));
      lc.appendChild(el('div','ct', live.A.area ? live.A.area.title : 'Listening to you'));
      var sl=live.S.slots, chips=el('div','chips'); chips.style.marginTop='12px';
      [['When', sl.duration && sl.duration.label],
       ['How bad', sl.severity!==undefined && sl.severity+'/10'],
       ['Pattern', sl.pattern],
       ['Tried', sl.tried && sl.tried.join(', ')],
       ['Affects', sl.impact && sl.impact.join(', ')]
      ].forEach(function(p){
        if(!p[1]) return;
        chips.appendChild(el('span','chip on', '<b style="font-weight:600;opacity:.7">'+p[0]+'</b>&nbsp;&nbsp;'+esc(p[1])));
      });
      if(!chips.children.length) chips.appendChild(el('span','chip','Waiting for details'));
      lc.appendChild(chips);
      var cont=el('button','btn quiet wide sm','Keep talking');
      cont.style.marginTop='14px';
      cont.addEventListener('click', function(){ go('talk'); });
      lc.appendChild(cont);
      s.appendChild(lc);
    }

    var urgent=all.filter(function(x){ return x.A.urgency!=='routine'; });
    var areas={};
    all.forEach(function(x){ if(x.S.slots.area) areas[x.S.slots.area]=1; });
    var tried={};
    all.forEach(function(x){ (x.S.slots.tried||[]).forEach(function(t){ if(!/^(nothing|something)/.test(t)) tried[t]=1; }); });

    var stats=el('div','stats');
    [[all.length,'reads'],[Object.keys(areas).length,'areas'],[urgent.length,'worth booking']].forEach(function(p){
      stats.appendChild(el('div','stat','<b>'+p[0]+'</b><span>'+esc(p[1])+'</span>'));
    });
    s.appendChild(stats);

    if(urgent.length){
      var top=urgent.slice().sort(function(a,b){ return (b.A.urgency==='now') - (a.A.urgency==='now'); })[0];
      var nb=el('div','urg');
      nb.style.setProperty('--uc', toneOf(top.A.urgency));
      nb.innerHTML='<span class="ud"></span><span><span class="ut">'+
        (top.A.urgency==='now' ? 'One thing needs seeing today' : 'Book one appointment')+
        '</span><span class="us">'+esc(top.A.area ? top.A.area.title+': ' : '')+esc(top.A.why)+'</span></span>';
      s.appendChild(nb);
    }

    var byArea={};
    all.forEach(function(x){ var id=x.S.slots.area||'general'; (byArea[id]=byArea[id]||[]).push(x); });
    s.appendChild(sectionLabel('By area'));
    var ac=el('div','card');
    Object.keys(byArea).forEach(function(id){
      var list=byArea[id], last=list[list.length-1];
      var area=B.conditions.get(id);
      var r=el('button','row tap');
      var delta='';
      var sv=list.filter(function(x){ return x.S.slots.severity!==undefined; });
      if(sv.length>=2){
        var d=sv[sv.length-1].S.slots.severity - sv[0].S.slots.severity;
        delta = d<0 ? ' Down from '+sv[0].S.slots.severity+'.' : d>0 ? ' Up from '+sv[0].S.slots.severity+'.' : ' Unchanged.';
      }
      r.innerHTML='<span class="ri" style="background:none;color:'+toneOf(last.A.urgency)+'"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="currentColor"/></svg></span>'+
        '<span class="rb"><span class="rt">'+esc(area?area.title:'General')+
        (list.length>1?' <span class="muted" style="font-weight:500">x'+list.length+'</span>':'')+'</span>'+
        '<span class="rs">'+esc(factsOf(last.S)||'Not enough detail yet')+esc(delta)+'</span></span><span class="rc">&rsaquo;</span>';
      r.addEventListener('click', function(){
        if(last.live) go('talk'); else if(area) condition(id,'library'); else go('talk');
      });
      ac.appendChild(r);
    });
    s.appendChild(ac);

    var ids=Object.keys(areas), hits=[];
    LINKS.forEach(function(l){ if(ids.indexOf(l[0][0])>-1 && ids.indexOf(l[0][1])>-1) hits.push(l); });
    var me=B.me||{};
    if(me.sex==='female' && ids.indexOf('hair')>-1 && ids.indexOf('skin')>-1 && ids.indexOf('period')>-1)
      hits.unshift([['hair','skin','period'],'Hair, skin and periods together is the combination worth asking about PCOS for.']);
    if(hits.length){
      s.appendChild(sectionLabel('How these connect'));
      var lk=el('div','card');
      hits.slice(0,4).forEach(function(h){
        var names=h[0].map(function(id){ return B.conditions.get(id).title.split(' ')[0]; }).join(' + ');
        var it=el('div','item');
        it.innerHTML='<div class="it">'+esc(names)+'</div><div class="ix">'+esc(h[1])+'</div>';
        lk.appendChild(it);
      });
      s.appendChild(lk);
    }

    var tests={};
    all.forEach(function(x){ x.A.tests.forEach(function(t){ tests[t]=(tests[t]||0)+1; }); });
    var tk=Object.keys(tests).sort(function(a,b){ return tests[b]-tests[a]; });
    if(tk.length){
      s.appendChild(sectionLabel('Ask for these in one visit'));
      var tc=el('div','card');
      var tw=el('div','chips');
      tk.slice(0,10).forEach(function(t){ tw.appendChild(el('span','chip'+(tests[t]>1?' on':''), esc(t))); });
      tc.appendChild(tw);
      tc.appendChild(el('p','hint','Highlighted ones came up for more than one thing you mentioned. Bring the list rather than ordering them yourself.'));
      s.appendChild(tc);
    }

    var tkeys=Object.keys(tried);
    if(tkeys.length){
      s.appendChild(sectionLabel('What you have already tried'));
      var trc=el('div','card'), tr=el('div','chips');
      tkeys.forEach(function(t){ tr.appendChild(el('span','chip',esc(t))); });
      trc.appendChild(tr);
      trc.appendChild(el('p','hint','Tell the doctor all of it, including what did nothing. It saves a repeat.'));
      s.appendChild(trc);
    }

    s.appendChild(el('p','note','Built only from your own words, on this phone. It is a way to organise what you said, not a diagnosis.'));
    B.reveal(s,{step:50,start:30});
    return s;
  }, 'insights');
}

/* ---------- tools ---------- */

function tools(){
  swap(function(){
    var s=screen();
    s.appendChild(header());
    s.appendChild(el('div','title','Tools'));
    s.appendChild(el('p','sub','Four things worth having on a phone when nobody is around to ask.'));

    [[B.ICON.cam,'Read a prescription','Photograph it and get each name explained',"", rx],
     [B.ICON.flask,'Interaction check','See what cancels what out, and what to space apart',"", meds],
     [B.ICON.book,'Condition library','Thirteen areas, what gets asked and what gets checked',"", library],
     [B.ICON.shield,'When to worry','The signs that mean today, not next week',"", worry]
    ].forEach(function(t){
      var b=el('button','tool');
      b.innerHTML='<span class="ti">'+t[0]+'</span>'+
        '<span class="tb"><span class="tn">'+esc(t[1])+'</span><span class="ts">'+esc(t[2])+'</span></span>'+
        '<span class="tc">&rsaquo;</span>';
      b.addEventListener('click', t[4]);
      s.appendChild(b);
    });
    s.appendChild(privLine());
    B.reveal(s,{step:55,start:40});
    return s;
  }, 'tools');
}

function library(){
  swap(function(){
    var s=screen();
    s.appendChild(navbar('Tools', tools));
    s.appendChild(el('div','title','Library'));
    s.appendChild(el('p','sub','What a doctor asks for each area, and what usually gets checked.'));
    var c=el('div','card');
    B.conditions.ORDER.forEach(function(id){
      if(!B.relevant(id)) return;
      var a=B.conditions.get(id);
      c.appendChild(row(B.ICON.spark, a.title, a.spec, function(){ condition(id,'library'); }));
    });
    s.appendChild(c);
    B.reveal(s,{step:40,start:40});
    return s;
  }, 'tools');
}

function condition(id, from){
  var a=B.conditions.get(id);
  if(!a){ library(); return; }
  swap(function(){
    var s=screen();
    s.appendChild(navbar(from==='home'?'Home':'Library', function(){
      from==='home' ? go('home') : library();
    }));
    s.appendChild(el('div','title', a.title));
    s.appendChild(el('p','sub','Usually seen by a '+a.spec.toLowerCase()+'.'));

    var q=el('div','card');
    q.appendChild(el('div','lbl','What you get asked'));
    var ol=el('ol','qlist');
    ol.style.marginTop='6px';
    a.ask.forEach(function(x){ ol.appendChild(el('li','',esc(x.q))); });
    q.appendChild(ol);
    s.appendChild(q);

    var cb=el('div','card');
    cb.appendChild(el('div','lbl','What gets considered'));
    a.consider.forEach(function(x){
      var it=el('div','item');
      it.innerHTML='<div class="it">'+esc(x.t)+'</div><div class="ix">'+esc(x.d)+'</div>';
      cb.appendChild(it);
    });
    s.appendChild(cb);

    var tb=el('div','card');
    tb.appendChild(el('div','lbl','Usually checked first'));
    var ul=el('ul','tlist');
    ul.style.marginTop='6px';
    a.tests.forEach(function(x){ ul.appendChild(el('li','',esc(x))); });
    tb.appendChild(ul);
    s.appendChild(tb);

    var go2=el('button','btn primary wide', B.ICON.mic+'<span>Talk about this</span>');
    go2.style.marginTop='4px';
    go2.addEventListener('click', function(){ talk('new'); });
    s.appendChild(go2);
    s.appendChild(el('p','note','Reference only. It does not diagnose, and the order changes once someone examines you.'));
    B.reveal(s,{step:60,start:40});
    return s;
  }, from==='home'?'home':'tools');
}

var WORRY=[
  ['Chest pain that spreads','Into the jaw, the left arm or the back, with sweating or breathlessness. This is an ambulance, not an appointment.'],
  ['Sudden weakness on one side','Face drooping, one arm falling, speech going strange. Note the time it started and go now. The treatment window is hours.'],
  ['Bleeding that soaks through','A pad an hour for two hours, or clots bigger than a plum, or bleeding after menopause.'],
  ['Sudden loss of vision','In one eye or both, with or without pain. Same day, every time.'],
  ['Fever in a baby under three months','Any fever at all. Also any fever with breathlessness, drowsiness, or a rash that does not fade when you press a glass on it.'],
  ['Breathlessness that came on fast','At rest, or with chest pain, or with one calf swollen and sore.'],
  ['Thoughts of hurting yourself','Tele MANAS is 14416. Free, all day, every day, in your own language.']
];

function worry(){
  swap(function(){
    var s=screen();
    s.appendChild(navbar('Tools', tools));
    s.appendChild(el('div','title','When to worry'));
    s.appendChild(el('p','sub','Most things can wait. These cannot. If one of them is happening, stop reading.'));
    var c=el('div','card');
    WORRY.forEach(function(w){
      var it=el('div','item');
      it.innerHTML='<div class="it">'+esc(w[0])+'</div><div class="ix">'+esc(w[1])+'</div>';
      c.appendChild(it);
    });
    s.appendChild(c);
    var call=el('a','btn primary wide','Call 14416 for mental health');
    call.href='tel:14416';
    call.style.textDecoration='none';
    s.appendChild(call);
    s.appendChild(el('p','note','This list is the common ones, not all of them. Trusting your own sense that something is badly wrong is reasonable.'));
    B.reveal(s,{step:60,start:40});
    return s;
  }, 'tools');
}

/* ---------- you ---------- */

function you(){
  swap(function(){
    var s=screen();
    s.appendChild(header());
    var me=B.me||{};

    var pc=el('div','card');
    pc.appendChild(row(B.ICON.user, me.name||'Add your name',
      [ageLabel(me.age), sexLabel(me.sex)].filter(Boolean).join(', ') || 'Nothing set yet',
      function(){ profile(); }));
    var h=B.history();
    pc.appendChild(row(B.ICON.clock, 'History', h.length? h.length+' saved read'+(h.length>1?'s':'') : 'Nothing yet',
      function(){ history('you'); }));
    pc.appendChild(row(B.ICON.spark, 'What you are watching',
      (me.focus&&me.focus.length)? me.focus.length+' area'+(me.focus.length>1?'s':'') : 'None picked',
      function(){ focusSheet(you); }));
    s.appendChild(pc);

    s.appendChild(sectionLabel('Settings'));
    var sc=el('div','card');
    sc.appendChild(seg('Language', [['english','English'],['hinglish','Hinglish']], B.prefs.lang, function(v){
      B.setPref('lang', v);
      B.toast(v==='english' ? 'English.' : 'Hinglish.');
    }));
    sc.appendChild(seg('Look', [['system','System'],['light','Light'],['dark','Dark']], B.prefs.theme, function(v){
      B.setPref('theme', v); if(orb) orb.refresh();
    }));
    sc.appendChild(seg('Motion', [['full','Full'],['calm','Calm']], B.prefs.motion, function(v){
      B.setPref('motion', v);
    }));
    s.appendChild(sc);

    s.appendChild(sectionLabel('About'));
    var ab=el('div','card');
    [['What this is','You talk, it listens, and it asks the things that actually matter about a symptom. At the end you get your story on one page, clear enough to act on or to hand to someone. It does not diagnose or prescribe.'],
     ['Where your words go','Nowhere. Speech becomes text inside your own browser. Your name and your saved reads sit on this device and nowhere else. No account, no server, no recording kept.'],
     ['How the questions are chosen','It tracks six things that decide what a symptom means: how long, how bad, the pattern, what you have tried, what it affects, and your history. It asks for whatever is still missing, one at a time.'],
     ['If something urgent comes up','Certain things stop the flow and tell you to get seen, including chest pain, heavy bleeding, sudden vision loss and thoughts of self harm. That last one shows Tele MANAS, 14416.']
    ].forEach(function(p){
      var d=el('details','g','<summary>'+esc(p[0])+'</summary>');
      d.appendChild(el('div','inner', esc(p[1])));
      ab.appendChild(d);
    });
    s.appendChild(ab);

    var clr=el('button','btn quiet wide', B.ICON.trash+'<span>Clear everything</span>');
    clr.style.marginTop='4px';
    clr.addEventListener('click', function(){
      B.openSheet(function(sh){
        sh.appendChild(el('h2','','Clear everything?'));
        sh.appendChild(el('p','lede','Your name, what you are watching, and every saved read go. It cannot be undone.'));
        var yes=el('button','btn primary wide','Yes, clear it');
        yes.style.marginTop='16px';
        yes.addEventListener('click', function(){
          B.clearAll(); B.closeSheet(); onboard(0); B.toast('Cleared.');
        });
        var no=el('button','btn ghost wide','Keep it');
        no.addEventListener('click', B.closeSheet);
        sh.appendChild(yes); sh.appendChild(no);
      });
    });
    s.appendChild(clr);
    s.appendChild(privLine());
    B.reveal(s,{step:55,start:40});
    return s;
  }, 'you');
}

function ageLabel(v){ var o=null; AGES.forEach(function(a){ if(a[0]===v) o=a[1]; }); return o; }
function sexLabel(v){ var o=null; SEX.forEach(function(a){ if(a[0]===v) o=a[1]; }); return o; }

function profile(){
  swap(function(){
    var s=screen();
    s.appendChild(navbar('You', you));
    s.appendChild(el('div','title','Your details'));
    s.appendChild(el('p','sub','All of it stays on this phone. It only changes which follow ups you get asked.'));
    var me=B.me||{name:'',age:'',sex:'',focus:[]};
    var draft={name:me.name, age:me.age, sex:me.sex, focus:(me.focus||[]).slice(0)};

    var c=el('div','card');
    c.appendChild(el('div','lbl','Name'));
    var inp=el('input','textin');
    inp.type='text'; inp.value=draft.name; inp.placeholder='Your name';
    inp.style.marginTop='9px';
    c.appendChild(inp);
    s.appendChild(c);

    var c2=el('div','card');
    c2.appendChild(el('div','lbl','Age'));
    var g1=el('div','grid2'); g1.style.marginTop='9px';
    AGES.forEach(function(a){
      var b=el('button','opt'+(draft.age===a[0]?' on':''), esc(a[1]));
      b.addEventListener('click', function(){
        draft.age=a[0];
        Array.prototype.forEach.call(g1.children,function(n){ n.classList.remove('on'); });
        b.classList.add('on');
      });
      g1.appendChild(b);
    });
    c2.appendChild(g1);
    c2.appendChild(el('div','lbl','Sex'));
    var g2=el('div','grid2'); g2.style.cssText='grid-template-columns:repeat(3,1fr);margin-top:9px';
    SEX.forEach(function(a){
      var b=el('button','opt'+(draft.sex===a[0]?' on':''), esc(a[1]));
      b.addEventListener('click', function(){
        draft.sex=a[0];
        Array.prototype.forEach.call(g2.children,function(n){ n.classList.remove('on'); });
        b.classList.add('on');
      });
      g2.appendChild(b);
    });
    c2.appendChild(g2);
    s.appendChild(c2);

    var sv=el('button','btn primary wide','Save');
    sv.addEventListener('click', function(){
      draft.name=inp.value.trim();
      draft.at=Date.now();
      B.setMe(draft);
      you();
      B.toast('Saved.');
    });
    s.appendChild(sv);
    B.reveal(s,{step:60,start:40});
    return s;
  }, 'you');
}

function focusSheet(after){
  B.openSheet(function(sh){
    sh.appendChild(el('h2','','What to keep close'));
    sh.appendChild(el('p','lede','These sit on your home screen. Nothing stops you talking about anything else.'));
    var me=B.me||{focus:[]};
    var pick=(me.focus||[]).slice(0);
    var ch=el('div','chips');
    ch.style.marginTop='16px';
    B.conditions.ORDER.forEach(function(id){
      if(!B.relevant(id)) return;
      var a=B.conditions.get(id);
      var b=el('button','chip'+(pick.indexOf(id)>-1?' on':''), esc(a.title));
      b.addEventListener('click', function(){
        var i=pick.indexOf(id);
        if(i>-1){ pick.splice(i,1); b.classList.remove('on'); }
        else { pick.push(id); b.classList.add('on'); }
      });
      ch.appendChild(b);
    });
    sh.appendChild(ch);
    var sv=el('button','btn primary wide','Save');
    sv.style.marginTop='18px';
    sv.addEventListener('click', function(){
      var m=B.me||{name:'',age:'',sex:''};
      m.focus=pick;
      B.setMe(m);
      B.closeSheet();
      if(after) after();
    });
    sh.appendChild(sv);
  });
}

function history(from){
  swap(function(){
    var s=screen();
    s.appendChild(navbar(from==='home'?'Home':'You', function(){ from==='home'?go('home'):you(); }));
    s.appendChild(el('div','title','History'));
    var h=B.history();
    if(!h.length){
      s.appendChild(el('p','sub','Everything you talk through gets kept here, on this phone only.'));
      var e=el('div','empty');
      e.innerHTML='<div class="eo">'+B.ICON.clock+'</div><p>Nothing saved yet. Talk something through and it will show up here.</p>';
      s.appendChild(e);
      var g=el('button','btn primary wide', B.ICON.mic+'<span>Start talking</span>');
      g.addEventListener('click', function(){ go('talk','new'); });
      s.appendChild(g);
      return s;
    }
    s.appendChild(el('p','sub',h.length+' read'+(h.length>1?'s':'')+', kept on this phone only.'));
    var c=el('div','card');
    h.forEach(function(e){
      var r=el('div','row');
      var tone = e.urgency==='now' ? 'var(--bad)' : e.urgency==='soon' ? 'var(--warn)' : 'var(--good)';
      var open=el('button','rb');
      open.style.cssText='background:none;border:0;padding:0;text-align:left';
      open.innerHTML='<span class="rt">'+esc(e.title)+'</span><span class="rs">'+esc(B.ago(e.at))+
        ', '+esc(e.turns.length)+' thing'+(e.turns.length>1?'s':'')+' said</span>';
      open.addEventListener('click', function(){ replay(e,'you'); });
      var dot=el('span','ri');
      dot.style.cssText='background:none;color:'+tone;
      dot.innerHTML='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="currentColor"/></svg>';
      var del=el('button','rc');
      del.setAttribute('aria-label','Delete');
      del.style.cssText='width:34px;text-align:center';
      del.innerHTML=B.ICON.trash;
      del.querySelector('svg').style.cssText='width:16px;height:16px';
      del.addEventListener('click', function(){ B.forget(e.at); history(from); B.toast('Deleted.'); });
      r.appendChild(dot); r.appendChild(open); r.appendChild(del);
      c.appendChild(r);
    });
    s.appendChild(c);
    B.reveal(s,{step:45,start:40});
    return s;
  }, 'you');
}

/* ---------- medicines ---------- */

function meds(){
  swap(function(){
    var s=screen();
    s.appendChild(navbar('Tools', tools));
    s.appendChild(el('div','title','What are you taking?'));
    s.appendChild(el('p','sub','Add everything, including supplements. Half of what people take cancels something else out.'));

    var chosen=[];
    var inp=el('input','textin');
    inp.type='text';
    inp.placeholder='Start typing, for example Mintop, Pantop, iron';
    s.appendChild(inp);
    var res=el('div',''); res.style.marginTop='10px'; s.appendChild(res);
    var out=el('div',''); out.style.marginTop='16px'; s.appendChild(out);

    function paint(){
      out.innerHTML='';
      if(!chosen.length){
        var e=el('div','empty');
        e.innerHTML='<div class="eo">'+B.ICON.flask+'</div><p>Add two or more and it will tell you what to space apart.</p>';
        out.appendChild(e);
        return;
      }
      var pills=el('div','chips');
      chosen.forEach(function(m,i){
        var p=el('button','chip on', esc(m.n)+'  ×');
        p.addEventListener('click', function(){ chosen.splice(i,1); paint(); });
        pills.appendChild(p);
      });
      out.appendChild(pills);

      var cl=B.scan.conflicts(chosen.map(function(m){ return m.n; }));
      var box=el('div','card');
      box.style.marginTop='14px';
      box.appendChild(el('div','lbl', cl.length ? cl.length+' thing'+(cl.length>1?'s':'')+' to fix' : 'Nothing is fighting anything'));
      if(!cl.length) box.appendChild(el('p','lede','No known clash between these. Keep the timings on each label and you are fine.'));
      cl.forEach(function(r){
        var row2=el('div','clash'+(r.sev>=3?' bad':''));
        row2.innerHTML='<span class="cd"></span><span><span class="ch">'+esc(r.t)+
          '</span><span class="cs">'+esc(r.d)+'</span></span>';
        box.appendChild(row2);
      });
      box.appendChild(el('p','hint','Timing guidance only, not dosing advice. If a prescriber told you differently about your own medicines, they are right.'));
      out.appendChild(box);
      chosen.forEach(function(m){ out.appendChild(B.scan.medCard(m,true)); });
    }

    inp.addEventListener('input', function(){
      res.innerHTML='';
      B.scan.match(inp.value).forEach(function(m){
        res.appendChild(addRow(m, function(){
          var seen=false;
          chosen.forEach(function(x){ if(x.n===m.n) seen=true; });
          if(!seen) chosen.push(m);
          inp.value=''; res.innerHTML=''; paint();
        }));
      });
    });
    paint();
    B.reveal(s,{step:55,start:40});
    return s;
  }, 'tools');
}

function addRow(m, onTap){
  var b=el('button','tool');
  b.innerHTML='<span class="ti">'+B.ICON.pill+'</span>'+
    '<span class="tb"><span class="tn">'+esc(m.n)+'</span><span class="ts">'+esc(m.w)+'</span></span>'+
    '<span class="tc">+</span>';
  b.addEventListener('click', onTap);
  return b;
}

/* ---------- prescription ---------- */

function rx(){
  swap(function(){
    var s=screen();
    s.appendChild(navbar('Tools', tools));
    s.appendChild(el('div','title','Read a prescription'));
    s.appendChild(el('p','sub','Photograph it, then confirm each name. Everything is read on your phone.'));

    var shot=el('button','shot');
    shot.innerHTML='<div><div class="ic">'+B.ICON.cam+'</div>'+
      '<div style="font-weight:600;font-size:16px">Take a photo</div>'+
      '<div class="sm muted" style="margin-top:4px">Or choose one from your gallery</div></div>';
    shot.addEventListener('click', pick);
    s.appendChild(shot);

    var out=el('div',''); out.style.marginTop='14px'; s.appendChild(out);

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
      im.src=src; im.alt='Your prescription';
      pv.appendChild(im);
      var line=el('div','scanline'); pv.appendChild(line);
      var boxes=el('div','boxes'); pv.appendChild(boxes);
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
        var note=el('p','note');
        note.textContent = blocks.length
          ? 'Found '+blocks.length+' lines of writing. Handwriting cannot be read reliably, so type each medicine name and it will be explained.'
          : 'Could not find clear lines of text. Type the medicine names and they will be explained.';
        out.appendChild(note);
        out.appendChild(picker());
      }, B.reduced?0:1600);
    }
    function picker(){
      var box=el('div','');
      box.style.marginTop='14px';
      box.appendChild(el('div','lbl','Add a medicine'));
      var inp=el('input','textin');
      inp.type='text';
      inp.placeholder='Start typing, for example Mintop or Pantop';
      inp.style.marginTop='9px';
      box.appendChild(inp);
      var res=el('div',''); res.style.marginTop='10px'; box.appendChild(res);
      var list=el('div',''); list.style.marginTop='14px'; box.appendChild(list);
      inp.addEventListener('input', function(){
        res.innerHTML='';
        B.scan.match(inp.value).forEach(function(m){
          res.appendChild(addRow(m, function(){
            if(!B.session) B.newSession('rx');
            var seen=false;
            B.session.meds.forEach(function(x){ if(x.name===m.n) seen=true; });
            if(!seen) B.session.meds.push({name:m.n});
            list.appendChild(B.scan.medCard(m,true));
            inp.value=''; res.innerHTML='';
          }));
        });
      });
      return box;
    }
    B.reveal(s,{step:55,start:40});
    return s;
  }, 'tools');
}

function savePng(node){
  B.toast('Rendering...');
  B.card.png(node, function(url){
    if(!url){ B.toast('Could not render. Copy as text instead.'); return; }
    var a=document.createElement('a');
    a.href=url; a.download='doctalk-read.png';
    document.body.appendChild(a); a.click();
    setTimeout(function(){ try{ document.body.removeChild(a); }catch(e){} }, 100);
    B.toast('Saved.');
  });
}

/* ---------- bits ---------- */

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
  w.appendChild(el('div','lbl',esc(label)));
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
    box.style.marginTop='16px';
    [[B.ICON.mic,'Start talking', function(){ B.closeSheet(); go('talk','new'); }],
     [B.ICON.shield,'When to worry', function(){ B.closeSheet(); worry(); }],
     [B.ICON.book,'Condition library', function(){ B.closeSheet(); library(); }],
     [B.ICON.user,'Your details', function(){ B.closeSheet(); profile(); }]
    ].forEach(function(r){ box.appendChild(row(r[0], r[1], '', r[2])); });
    sh.appendChild(box);
  });
}

B.go=go;
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

if(B.me) home(); else onboard(0);
})();
