(function(){
'use strict';
var B = window.DT = window.DT || {};
var PRE='doctalk.';

function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
function lsDel(k){ try{ localStorage.removeItem(k); }catch(e){} }
B.PRE=PRE; B.lsGet=lsGet; B.lsSet=lsSet; B.lsDel=lsDel;
B.load=function(k){ var r=lsGet(k); if(!r) return null; try{ return JSON.parse(r); }catch(e){ return null; } };
B.save=function(k,v){ try{ lsSet(k, JSON.stringify(v)); }catch(e){} };

B.$=function(s,r){ return (r||document).querySelector(s); };
B.el=function(t,c,h){ var e=document.createElement(t); if(c) e.className=c; if(h!==undefined) e.innerHTML=h; return e; };
B.esc=function(s){ return String(s).replace(/[&<>"]/g,function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };

// no em dashes anywhere the user can read
B.clean=function(s){
  return String(s)
    .replace(/\s*—\s*/g, ', ')
    .replace(/\s*–\s*/g, ' to ')
    .replace(/…/g, '...')
    .replace(/·/g, ',')
    .replace(/\s+,/g, ',')
    .replace(/,\s*,/g, ',')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

var tT;
B.toast=function(m){
  var t=B.$('#toast'); if(!t) return;
  t.textContent=B.clean(m); t.classList.add('on');
  clearTimeout(tT); tT=setTimeout(function(){ t.classList.remove('on'); }, 3000);
};

B.openSheet=function(build){
  var sc=B.$('#scrim'), sh=B.$('#sheet');
  sh.innerHTML='<div class="grab"></div>';
  build(sh); sh.scrollTop=0; sc.hidden=false;
  requestAnimationFrame(function(){ sc.classList.add('on'); });
};
B.closeSheet=function(){
  var sc=B.$('#scrim');
  sc.classList.remove('on');
  setTimeout(function(){ sc.hidden=true; B.$('#sheet').innerHTML=''; }, B.reduced?10:360);
};

B.prefs = B.load(PRE+'prefs') || {};
if(B.prefs.v!==2){ B.prefs={v:2, theme:'light', motion:B.prefs.motion||'full', lang:'english'}; B.save(PRE+'prefs', B.prefs); }
B.reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
B.applyPrefs=function(){
  var r=document.documentElement;
  if(B.prefs.theme==='system') r.removeAttribute('data-theme');
  else r.setAttribute('data-theme', B.prefs.theme);
  if(B.prefs.motion==='calm') r.setAttribute('data-motion','calm');
  else r.removeAttribute('data-motion');
  B.reduced = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
            || B.prefs.motion==='calm';
};
B.setPref=function(k,v){ B.prefs[k]=v; B.save(PRE+'prefs', B.prefs); B.applyPrefs(); };
B.applyPrefs();

B.session=null;
B.newSession=function(door){
  B.session={ door:door||'symptom', started:Date.now(), turns:[], slots:{}, flags:[], meds:[] };
  return B.session;
};

B.me = B.load(PRE+'me') || null;
B.setMe=function(p){ B.me=p; B.save(PRE+'me', p); };
B.initial=function(){
  var n=(B.me&&B.me.name||'').trim();
  return n ? n.charAt(0).toUpperCase() : '?';
};
B.firstName=function(){
  var n=(B.me&&B.me.name||'').trim();
  return n ? n.split(/\s+/)[0] : '';
};
B.greet=function(){
  var h=new Date().getHours();
  return h<5 ? 'Still up' : h<12 ? 'Good morning' : h<17 ? 'Good afternoon' : 'Good evening';
};
B.relevant=function(id){
  var p=B.me; if(!p) return true;
  if(id==='period' && p.sex==='male') return false;
  return true;
};

B.history=function(){ return B.load(PRE+'history') || []; };
B.remember=function(entry){
  var h=B.history();
  h.unshift(entry);
  B.save(PRE+'history', h.slice(0,40));
};
B.forget=function(at){
  B.save(PRE+'history', B.history().filter(function(e){ return e.at!==at; }));
};
B.clearAll=function(){
  B.me=null;
  B.session=null;
  try{ Object.keys(localStorage).forEach(function(k){ if(k.indexOf(PRE)===0 && k!==PRE+'prefs') lsDel(k); }); }catch(e){}
};

var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
B.todayLabel=function(){
  var d=new Date();
  return d.getDate()+' '+MON[d.getMonth()]+' '+d.getFullYear();
};
B.dateLabel=function(ts){
  var d=new Date(ts);
  return d.getDate()+' '+MON[d.getMonth()];
};
B.ago=function(ts){
  var m=Math.floor((Date.now()-ts)/60000);
  if(m<1) return 'just now';
  if(m<60) return m+' min ago';
  var h=Math.floor(m/60); if(h<24) return h===1?'an hour ago':h+' hours ago';
  var d=Math.floor(h/24); if(d===1) return 'yesterday';
  if(d<30) return d+' days ago';
  return B.dateLabel(ts);
};
B.stagger=function(host, step, start){
  if(B.reduced) return;
  step=step||60; start=start||0;
  Array.prototype.forEach.call(host.children, function(c,i){
    if(i>11) return;
    c.style.animation='rise .6s cubic-bezier(.17,.84,.36,1) '+(start+i*step)+'ms backwards';
  });
};
B.ICON={
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  dots:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="5" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="19" r="1.3"/></svg>',
  mic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
  spark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5l1.8 4.7 4.7 1.8-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-1.8z"/><path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/></svg>',
  pill:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.6" y="8.4" width="18.8" height="7.2" rx="3.6" transform="rotate(-45 12 12)"/><path d="M8.5 8.5l7 7"/></svg>',
  ask:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4L4 21l1.1-3.9A8.4 8.4 0 1 1 21 11.5z"/><path d="M9.8 9.4a2.2 2.2 0 1 1 3 2.05V13"/><path d="M12.8 16.1v.1"/></svg>',
  cam:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h2.6L8 6h8l1.4 2H20a1.4 1.4 0 0 1 1.4 1.4v8.2A1.4 1.4 0 0 1 20 19H4a1.4 1.4 0 0 1-1.4-1.4V9.4A1.4 1.4 0 0 1 4 8z"/><circle cx="12" cy="13" r="3.4"/></svg>',
  share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5v11"/><path d="M8.2 7.3 12 3.5l3.8 3.8"/><path d="M5 13.5v5.2a1.8 1.8 0 0 0 1.8 1.8h10.4a1.8 1.8 0 0 0 1.8-1.8V13.5"/></svg>',
  down:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5v11"/><path d="M8.2 10.7 12 14.5l3.8-3.8"/><path d="M5 17.5v1.2a1.8 1.8 0 0 0 1.8 1.8h10.4a1.8 1.8 0 0 0 1.8-1.8v-1.2"/></svg>',
  wa:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.93L2.1 22l5.36-1.4a9.78 9.78 0 0 0 4.58 1.16h.01c5.43 0 9.84-4.4 9.84-9.84C21.89 6.4 17.48 2 12.04 2zm0 17.93h-.01a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.07.8.82-3-.19-.31a8.07 8.07 0 0 1-1.24-4.3c0-4.47 3.64-8.1 8.12-8.1a8.1 8.1 0 0 1 8.1 8.11c0 4.47-3.63 8.1-8.1 8.1zm4.45-6.07c-.24-.12-1.44-.71-1.67-.79-.22-.08-.38-.12-.55.12-.16.25-.62.79-.76.95-.14.17-.28.19-.52.07-.24-.12-1.03-.38-1.96-1.21-.72-.65-1.21-1.45-1.36-1.69-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.25.24-.41.08-.17.04-.31-.02-.43-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.3-.22.25-.85.84-.85 2.04s.87 2.37 1 2.53c.12.17 1.72 2.62 4.16 3.68.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.05.14-1.16-.06-.1-.22-.17-.46-.29z"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7"/><path d="M6.5 7l.8 12a1.6 1.6 0 0 0 1.6 1.5h6.2a1.6 1.6 0 0 0 1.6-1.5L17.5 7"/></svg>',
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 10.4 12 3.8l8.5 6.6V19a1.6 1.6 0 0 1-1.6 1.6H5.1A1.6 1.6 0 0 1 3.5 19z"/><path d="M9.6 20.6v-6h4.8v6"/></svg>',
  wave:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12h3l2.2-6 3.4 13 3-9.5 1.9 5 1.6-2.5h3.9"/></svg>',
  grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.4" y="3.4" width="7" height="7" rx="2"/><rect x="13.6" y="3.4" width="7" height="7" rx="2"/><rect x="3.4" y="13.6" width="7" height="7" rx="2"/><rect x="13.6" y="13.6" width="7" height="7" rx="2"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.9"/><path d="M4.6 20.4a7.6 7.6 0 0 1 14.8 0"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.6h5.4A2.6 2.6 0 0 1 12 7.2v13a2 2 0 0 0-2-2H4z"/><path d="M20 4.6h-5.4A2.6 2.6 0 0 0 12 7.2v13a2 2 0 0 1 2-2h6z"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.2 2"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 5.8v5.6c0 4.3 2.9 8.1 7 9.2 4.1-1.1 7-4.9 7-9.2V5.8z"/><path d="m9.2 12 2 2 3.6-3.8"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.6 4.4 4.4L19 7.4"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.2M12 19.2v2.2M4.3 4.3l1.6 1.6M18.1 18.1l1.6 1.6M2.6 12h2.2M19.2 12h2.2M4.3 19.7l1.6-1.6M18.1 5.9l1.6-1.6"/></svg>',
  flask:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.6 3.2v6L4.4 18a2 2 0 0 0 1.7 3h11.8a2 2 0 0 0 1.7-3l-5.2-8.8v-6"/><path d="M8.4 3.2h7.2M6.6 14.4h10.8"/></svg>',
  keyboard:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6.5 9.5h.01M10 9.5h.01M13.5 9.5h.01M17 9.5h.01M6.5 13h.01M17 13h.01M9.5 13h5"/></svg>'
};
})();
