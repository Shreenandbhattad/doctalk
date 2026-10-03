(function(){
'use strict';
var B=window.DT, el=B.el, esc=B.esc;

var QUESTIONS={
  hair:['Is this pattern loss or shedding, and does that change the treatment?',
        'Should we check ferritin, thyroid and vitamin D before starting anything?',
        'How many weeks before we decide this is working or not?'],
  skin:['Is this likely to leave marks or scars, and how do we prevent that?',
        'Should I be on something stronger, or is my routine the problem?',
        'How long before we judge whether this is working?'],
  period:['Is this cycle length something to investigate rather than manage?',
          'Do I need a scan or blood tests before we try anything?',
          'If this is hormonal, what is the plan beyond the first three months?'],
  sexual:['Could this be physical rather than psychological, and how would we know?',
          'Are any of my current medicines contributing to this?',
          'What is realistic to expect, and in what time frame?'],
  gut:['Should we rule anything out before changing my diet?',
       'Is this worth a stool test or an endoscopy at my age?',
       'If it is not food, what else are we considering?'],
  sleep:['Could this be a sleep disorder rather than a habit problem?',
         'Should we check thyroid, iron or vitamin D first?',
         'What should I try before anything is prescribed?'],
  mood:['Is this something to treat, or something to watch for now?',
        'What are the options other than medication?',
        'How soon should I come back if nothing changes?'],
  pain:['What is the most likely cause, and what are we ruling out?',
        'Do I need a scan, or is that unnecessary at this stage?',
        'What should make me come back sooner?'],
  general:['What is the most likely cause of this?',
           'What tests, if any, do I need before we decide?',
           'How long should I give this before I come back?']
};

function sentence(s){
  var bits=[];
  var area=s.area ? B.interview.areaLabel(s.area) : null;
  var lead = area ? ('A problem with ' + area) : 'A health concern';
  if(s.duration) lead += ', going on for ' + s.duration.label;
  bits.push(lead + '.');
  if(s.severity!==undefined) bits.push('Rated ' + s.severity + ' out of 10.');
  if(s.pattern) bits.push('It is ' + s.pattern + '.');
  if(s.triggers && s.triggers.length && !/^nothing/.test(s.triggers[0])) bits.push('Worse with ' + s.triggers.join(', ') + '.');
  if(s.impact && s.impact.length && !/^nothing/.test(s.impact[0])) bits.push('Affecting ' + s.impact.join(', ') + '.');
  if(s.history) bits.push('It ' + s.history + '.');
  return B.clean(bits.join(' '));
}

function build(session){
  var s=session.slots;
  var qs = QUESTIONS[s.area] || QUESTIONS.general;
  return {
    date:B.todayLabel(),
    area:s.area ? B.interview.areaLabel(s.area) : 'general',
    headline:sentence(s),
    said:s.complaint ? B.clean(s.complaint) : '',
    duration:s.duration ? s.duration.label : null,
    severity:s.severity,
    pattern:s.pattern || null,
    triggers:s.triggers || null,
    tried:s.tried || null,
    impact:s.impact || null,
    history:s.history || null,
    meds:session.meds && session.meds.length ? session.meds : null,
    flags:session.flags.slice(),
    questions:qs
  };
}

function render(c){
  var d=el('div','dcard');
  var h='<div class="ctop"><div><div class="ck">Your health story</div></div>'+
        '<div class="cd">'+esc(c.date)+'</div></div>'+
        '<h2>'+esc(c.headline)+'</h2>';
  d.innerHTML=h;

  if(c.said){
    var q=el('div','csec');
    q.innerHTML='<div class="st">In their words</div><p class="sm" style="line-height:1.6">'+esc(c.said)+'</p>';
    d.appendChild(q);
  }

  var rows=[];
  if(c.duration) rows.push(['Started', c.duration+' ago']);
  if(c.severity!==undefined) rows.push(['Severity', c.severity+' out of 10']);
  if(c.pattern) rows.push(['Pattern', c.pattern]);
  if(c.triggers) rows.push(['Worse with', c.triggers.join(', ')]);
  if(c.impact) rows.push(['Affects', c.impact.join(', ')]);
  if(c.history) rows.push(['History', c.history]);
  if(rows.length){
    var det=el('div','csec');
    det.innerHTML='<div class="st">The story</div>';
    rows.forEach(function(r){
      det.appendChild(el('div','crow','<span class="cw">'+esc(r[0])+'</span><span class="cv">'+esc(r[1])+'</span>'));
    });
    d.appendChild(det);
  }

  if(c.tried){
    var t=el('div','csec');
    t.innerHTML='<div class="st">Already tried</div><p class="sm">'+esc(c.tried.join(', '))+'</p>';
    d.appendChild(t);
  }
  if(c.meds){
    var m=el('div','csec');
    m.innerHTML='<div class="st">Currently taking</div><p class="sm">'+esc(c.meds.map(function(x){ return x.name; }).join(', '))+'</p>';
    d.appendChild(m);
  }

  var qs=el('div','csec');
  qs.innerHTML='<div class="st">Worth asking about</div>';
  var ul=el('ol','qlist');
  c.questions.forEach(function(x){ ul.appendChild(el('li','',esc(x))); });
  qs.appendChild(ul);
  d.appendChild(qs);

  d.appendChild(el('div','cfoot','Built from your own words. Not a diagnosis.'));
  return d;
}

function text(c){
  var L=[];
  L.push('MY HEALTH STORY, '+c.date);
  L.push('');
  L.push(c.headline);
  if(c.said){ L.push(''); L.push('In my words: '+c.said); }
  L.push('');
  if(c.duration) L.push('Started: '+c.duration+' ago');
  if(c.severity!==undefined) L.push('Severity: '+c.severity+' out of 10');
  if(c.pattern) L.push('Pattern: '+c.pattern);
  if(c.triggers) L.push('Worse with: '+c.triggers.join(', '));
  if(c.impact) L.push('Affects: '+c.impact.join(', '));
  if(c.history) L.push('History: '+c.history);
  if(c.tried) L.push('Already tried: '+c.tried.join(', '));
  if(c.meds) L.push('Currently taking: '+c.meds.map(function(x){ return x.name; }).join(', '));
  L.push('');
  L.push('Worth asking about:');
  c.questions.forEach(function(q,i){ L.push('  '+(i+1)+'. '+q); });
  L.push('');
  L.push('Built from my own words. Not a diagnosis.');
  return B.clean(L.join('\n')).replace(/ , /g,', ');
}

function png(node, cb){
  var w=node.offsetWidth||440, h=node.offsetHeight||600;
  var scale=2;
  var cs=getComputedStyle(document.documentElement);
  var bg=cs.getPropertyValue('--card').trim()||'#fff';
  var cv=document.createElement('canvas');
  cv.width=w*scale; cv.height=h*scale;
  var ctx=cv.getContext('2d');
  ctx.scale(scale,scale);
  ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);
  var clone=node.cloneNode(true);
  clone.style.margin='0';
  var html=new XMLSerializer().serializeToString(wrapForeign(clone,w,h));
  var img=new Image();
  img.onload=function(){ ctx.drawImage(img,0,0,w,h); cb(cv.toDataURL('image/png')); };
  img.onerror=function(){ cb(null); };
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(html);
}
function wrapForeign(node,w,h){
  var ns='http://www.w3.org/2000/svg';
  var svg=document.createElementNS(ns,'svg');
  svg.setAttribute('xmlns',ns);
  svg.setAttribute('width',w); svg.setAttribute('height',h);
  var fo=document.createElementNS(ns,'foreignObject');
  fo.setAttribute('x',0); fo.setAttribute('y',0);
  fo.setAttribute('width',w); fo.setAttribute('height',h);
  var div=document.createElement('div');
  div.setAttribute('xmlns','http://www.w3.org/1999/xhtml');
  var cs=getComputedStyle(document.documentElement);
  var style=document.createElement('style');
  style.textContent=inlineStyles(cs);
  div.appendChild(style);
  div.appendChild(node);
  fo.appendChild(div);
  svg.appendChild(fo);
  return svg;
}
function inlineStyles(cs){
  var vars=['--card','--ink','--line','--faint','--muted','--tint','--leaf','--disp','--ui','--r'];
  var out=':root{';
  vars.forEach(function(v){ out+=v+':'+cs.getPropertyValue(v).trim()+';'; });
  out+='}';
  out+='*{box-sizing:border-box;margin:0;font-family:var(--ui),sans-serif}';
  out+='.dcard{background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:24px;padding:26px 24px}';
  out+='h2{font-family:var(--disp),Georgia,serif;font-weight:500;font-size:21px;line-height:1.28;margin-bottom:4px}';
  out+='.ctop{display:flex;justify-content:space-between;gap:12px;margin-bottom:16px}';
  out+='.ck{font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:var(--faint);font-weight:600}';
  out+='.cd{font-size:11.5px;color:var(--faint)}';
  out+='.csec{padding:15px 0;border-top:1px solid var(--line)}';
  out+='.st{font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:var(--faint);font-weight:600;margin-bottom:9px}';
  out+='.crow{display:flex;gap:12px;padding:5px 0;font-size:14.5px;line-height:1.5}';
  out+='.cw{width:94px;flex:none;color:var(--muted);font-size:13px}';
  out+='.qlist{list-style:none;padding:0;counter-reset:q}';
  out+='.qlist li{counter-increment:q;display:flex;gap:11px;padding:7px 0;font-size:14.5px;line-height:1.5}';
  out+='.qlist li:before{content:counter(q);width:21px;height:21px;border-radius:50%;background:var(--tint);color:var(--leaf);font-size:11.5px;font-weight:700;display:flex;align-items:center;justify-content:center;flex:none}';
  out+='.cfoot{margin-top:14px;padding-top:13px;border-top:1px solid var(--line);font-size:11.5px;color:var(--faint)}';
  out+='.sm{font-size:14px;line-height:1.6}';
  return out;
}

B.card={ build:build, render:render, text:text, png:png, QUESTIONS:QUESTIONS };
})();
