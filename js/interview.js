(function(){
'use strict';
var B=window.DT;

var NUM={ek:1,ik:1,do:2,teen:3,tin:3,char:4,chaar:4,paanch:5,panch:5,chh:6,che:6,chhe:6,saat:7,aath:8,ath:8,nau:9,das:10,
  one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,twelve:12,fifteen:15,twenty:20};

var AREAS=[
 {id:'hair',  label:'hair',            kw:['baal','bal','hair','jhad','jhar','ganj','patla','bald','scalp','dandruff','rusi','hairfall','hairline','chanda']},
 {id:'skin',  label:'skin',            kw:['skin','chehra','face','pimple','daane','dane','acne','keel','muhase','rash','khujli','itch','daag','spot','kaala','pigment']},
 {id:'period',label:'periods',         kw:['period','periods','mahvari','mc','cycle','bleeding','spotting','cramp','pcos','pcod','date','mahina aaya','irregular']},
 {id:'sexual',label:'sexual health',   kw:['sex','erection','erectile','stamina','ling','discharge','libido','sperm','premature','performance','shighrapatan']},
 {id:'gut',   label:'digestion',       kw:['pet','gas','acidity','bloat','constipat','kabz','loose','motion','dast','ulti','vomit','nausea','jalan','indigest','stomach']},
 {id:'sleep', label:'sleep',           kw:['neend','sleep','insomnia','so nahi','thak','thaka','tired','fatigue','energy','sust']},
 {id:'mood',  label:'how you feel',    kw:['tension','stress','anxiety','ghabrahat','udaas','depress','mood','chidchid','akela','mann nahi']},
 {id:'pain',  label:'pain',            kw:['dard','pain','ache','sir dard','headache','migraine','kamar','joint','ghutna']}
];

// patterns that interrupt the flow
var FLAGS=[
 {id:'cardiac', t:'Chest pain needs to be seen today',
  d:'Chest pain, pressure or pain spreading to the arm or jaw, especially with breathlessness or sweating, is checked urgently and not at home.',
  kw:['chest pain','seene me dard','seene mein dard','chhati me dard','heart attack','dil me dard','saans nahi aa rahi','breathless','saans phool']},
 {id:'bleed', t:'Heavy bleeding needs urgent care',
  d:'Soaking a pad every hour, passing large clots, or bleeding that will not stop should be seen the same day.',
  kw:['bahut khoon','heavy bleeding','khoon ruk nahi','blood nahi ruk','har ghante pad','clots','blood vomit','khoon ki ulti','stool me khoon','potty me khoon']},
 {id:'selfharm', t:'Please talk to someone today',
  d:'You do not have to carry this alone, and the people on the other end of this number do this every day. Tele MANAS, 14416, free and 24 hours.',
  kw:['khudkushi','suicide','marna chahta','marna chahti','jeena nahi','end my life','self harm','khatam kar','apne aap ko']},
 {id:'vision', t:'Sudden vision change needs same day care',
  d:'Losing vision suddenly, in one eye or both, is an emergency even when it is painless.',
  kw:['dikhna band','vision loss','andhera chha','blurry suddenly','ek aankh se nahi']},
 {id:'infant', t:'A fever in a small baby is urgent',
  d:'Fever in a baby under three months is seen the same day, every time, even if the baby seems settled.',
  kw:['newborn fever','bacche ko bukhar','infant fever','navjat','2 mahine ke bacche','teen mahine ke bacche']},
 {id:'neuro', t:'These signs need emergency care',
  d:'Face drooping, weakness on one side, or sudden trouble speaking is treated as a stroke until proven otherwise.',
  kw:['face tedha','ek taraf kamzor','bol nahi pa','slurred','stroke','paralysis','lakwa']}
];

function norm(s){ return ' '+String(s||'').toLowerCase().replace(/[^\w\sऀ-ॿ]/g,' ').replace(/\s+/g,' ')+' '; }
function has(hay, kw){ return hay.indexOf(' '+kw)>-1 || hay.indexOf(kw+' ')>-1 || hay.indexOf(kw)>-1; }

function detectArea(text){
  var t=norm(text), best=null, score=0;
  AREAS.forEach(function(a){
    var n=0;
    a.kw.forEach(function(k){ if(has(t,k)) n++; });
    if(n>score){ score=n; best=a; }
  });
  return best;
}
function detectFlags(text){
  var t=norm(text), out=[];
  FLAGS.forEach(function(f){
    for(var i=0;i<f.kw.length;i++) if(has(t,f.kw[i])){ out.push(f); return; }
  });
  return out;
}
function numberIn(t){
  var m=t.match(/\b(\d{1,3})\b/);
  if(m) return parseInt(m[1],10);
  for(var w in NUM) if(has(t,w)) return NUM[w];
  return null;
}
function durationIn(text){
  var t=norm(text);
  var m=t.match(/(\d{1,3}|ek|do|teen|tin|char|chaar|paanch|panch|chh|chhe|saat|aath|nau|das|one|two|three|four|five|six|seven|eight|nine|ten)\s*(saal|year|yrs|mahin[ae]|mahine|month|hafte|hafta|week|din|day)/);
  if(!m) return null;
  var n = parseInt(m[1],10);
  if(isNaN(n)) n = NUM[m[1]] || 1;
  var unit=m[2];
  var label, days;
  if(/saal|year|yrs/.test(unit)){ label=n+(n===1?' year':' years'); days=n*365; }
  else if(/mahin|month/.test(unit)){ label=n+(n===1?' month':' months'); days=n*30; }
  else if(/hafte|hafta|week/.test(unit)){ label=n+(n===1?' week':' weeks'); days=n*7; }
  else { label=n+(n===1?' day':' days'); days=n; }
  return {label:label, days:days};
}
function severityIn(text){
  var t=norm(text);
  var m=t.match(/(\d{1,2})\s*(?:out of|\/|upon|se)\s*10/);
  if(m){ var v=parseInt(m[1],10); if(v>=0&&v<=10) return v; }
  if(/bardasht|unbearable|bahut zyada|severe|bahut hi/.test(t)) return 9;
  if(/bahut|kaafi|kafi|a lot|zyada|bad/.test(t)) return 7;
  if(/thoda|halka|mild|slight|kam/.test(t)) return 3;
  if(/normal|theek|manageable|ok|moderate/.test(t)) return 5;
  var n=numberIn(t);
  if(n!==null && n<=10 && /dard|pain|severity|level|scale/.test(t)) return n;
  return null;
}
var TRIED_WORDS=['shampoo','oil','tel','cream','gel','serum','tablet','goli','capsule','syrup','churan','ayurved','homeopath',
  'minoxidil','rogaine','finasteride','biotin','ketoconazole','benzoyl','salicylic','retino','tretinoin','adapalene',
  'isotretinoin','metformin','ors','eno','gelusil','pantop','omeprazole','antacid','antibiotic','paracetamol','crocin',
  'dolo','ibuprofen','protein','multivitamin','iron','vitamin','yoga','exercise','diet','gym','walk','meditation','therapy'];
function triedIn(text){
  var t=norm(text), out=[];
  TRIED_WORDS.forEach(function(w){ if(has(t,w)) out.push(w); });
    if(!out.length && /(try kiya|tried|use kiya|laga raha|lagaya|le raha|khaya|kiya tha)/.test(t)) out.push('something, name not clear');
  return out.length ? out.filter(function(v,i,a){ return a.indexOf(v)===i; }).slice(0,6) : null;
}
function triggersIn(text){
  var t=norm(text), out=[];
  [['stress','stress or tension'],['tension','stress or tension'],['exam','exams'],['garmi','heat'],['heat','heat'],
   ['sardi','cold weather'],['winter','cold weather'],['raat','night time'],['subah','mornings'],
   ['khane ke baad','after eating'],['after eating','after eating'],['spicy','spicy food'],['tel','oily food'],
   ['oily','oily food'],['period','around periods'],['travel','travel'],['dhoop','sun'],['sun','sun'],
   ['sweat','sweating'],['pasina','sweating'],['shave','shaving'],['makeup','makeup']
  ].forEach(function(p){ if(has(t,p[0]) && out.indexOf(p[1])<0) out.push(p[1]); });
  return out.length?out.slice(0,4):null;
}
function impactIn(text){
  var t=norm(text), out=[];
  [['neend','sleep'],['sleep','sleep'],['kaam','work'],['work','work'],['office','work'],['padhai','study'],
   ['confidence','confidence'],['sharam','embarrassment'],['bahar','going out'],['logo se','meeting people'],
   ['shaadi','relationship'],['partner','relationship'],['mood','mood']
  ].forEach(function(p){ if(has(t,p[0]) && out.indexOf(p[1])<0) out.push(p[1]); });
  return out.length?out.slice(0,3):null;
}
function patternIn(text){
  var t=norm(text);
  if(/badh raha|badhta|worse|zyada ho raha|increasing|bigad/.test(t)) return 'getting worse';
  if(/kam ho raha|better|improve|theek ho/.test(t)) return 'slowly improving';
  if(/kabhi kabhi|on and off|aata jata|sometimes/.test(t)) return 'comes and goes';
  if(/same|waisa hi|constant|roz|daily|har din/.test(t)) return 'about the same every day';
  return null;
}
function historyIn(text){
  var t=norm(text);
  if(/(ghar me|family me|papa|mummy|maa|bhai|behen|father|mother|brother|sister|genetic|khandan)/.test(t))
    return 'runs in the family';
  if(/(pehle bhi|before also|phir se|again|recurr|wapas)/.test(t)) return 'has happened before';
  return null;
}

// the six things a doctor asks for
var SLOTS=['complaint','duration','severity','pattern','tried','impact'];
var PETALS=[
  {k:'duration', label:'When'},
  {k:'severity', label:'How bad'},
  {k:'tried',    label:'What you tried'},
  {k:'impact',   label:'What it affects'}
];

function extract(session, text){
  var s=session.slots;
  if(!s.complaint && text.trim().length>3) s.complaint=B.clean(text.trim());
  var a=detectArea(text); if(a && !s.area) s.area=a.id;
  var d=durationIn(text); if(d && !s.duration) s.duration=d;
  var sev=severityIn(text); if(sev!==null && s.severity===undefined) s.severity=sev;
  var p=patternIn(text); if(p && !s.pattern) s.pattern=p;
  var tr=triedIn(text); if(tr){ s.tried=(s.tried||[]).concat(tr).filter(function(v,i,arr){ return arr.indexOf(v)===i; }).slice(0,6); }
  var tg=triggersIn(text); if(tg){ s.triggers=(s.triggers||[]).concat(tg).filter(function(v,i,arr){ return arr.indexOf(v)===i; }).slice(0,4); }
  var im=impactIn(text); if(im){ s.impact=(s.impact||[]).concat(im).filter(function(v,i,arr){ return arr.indexOf(v)===i; }).slice(0,3); }
  var h=historyIn(text); if(h && !s.history) s.history=h;
  var f=detectFlags(text);
  f.forEach(function(x){ if(session.flags.indexOf(x)<0) session.flags.push(x); });
  return f;
}
function filled(session){
  var s=session.slots, n=0;
  SLOTS.forEach(function(k){
    if(k==='severity'){ if(s.severity!==undefined) n++; return; }
    var v=s[k];
    if(v && (!v.length || v.length>0)) n++;
  });
  return n;
}
function completeness(session){ return filled(session)/SLOTS.length; }

var ASK={
  duration:{
    q:'How long has this been going on?',
    h:'Kitne din ya mahine se? Roughly bhi chalega.'
  },
  severity:{
    q:'On a scale of zero to ten, how bad is it?',
    h:'Zero matlab bilkul nahi, das matlab bardasht ke bahar.'
  },
  pattern:{
    q:'Is it getting worse, staying the same, or coming and going?',
    h:'Badh raha hai, waisa hi hai, ya kabhi kabhi?'
  },
  tried:{
    q:'What have you already tried for it?',
    h:'Koi tablet, cream, oil, gharelu nuskha, kuch bhi.'
  },
  impact:{
    q:'What is it stopping you from doing?',
    h:'Neend, kaam, bahar jaana, confidence, kuch bhi.'
  },
  triggers:{
    q:'Have you noticed anything that makes it worse?',
    h:'Khana, stress, mausam, time of day.'
  },
  history:{
    q:'Has anyone in your family had this, or has it happened to you before?',
    h:'Ghar me kisi ko, ya pehle kabhi aapko.'
  }
};
var OPENERS={
  symptom:{ q:'What is bothering you?', h:'Jo bhi hai, apne shabdon mein. Koi sun nahi raha.' },
  ask:{     q:'What do you want to ask your doctor?', h:'Jo sawaal aap bhool jaate ho, abhi bol do.' }
};

function nextQuestion(session){
  var s=session.slots;
  if(!s.complaint) return OPENERS[session.door==='ask'?'ask':'symptom'];
  var order=['duration','severity','tried','impact','pattern','triggers','history'];
  for(var i=0;i<order.length;i++){
    var k=order[i];
    if(k==='severity'){ if(s.severity===undefined) return ASK[k]; continue; }
    if(!s[k] || (s[k].length===0)) return ASK[k];
  }
  return null;
}

B.interview = {
  AREAS:AREAS, FLAGS:FLAGS, SLOTS:SLOTS, PETALS:PETALS,
  extract:extract, next:nextQuestion, completeness:completeness, filled:filled,
  detectArea:detectArea, detectFlags:detectFlags,
  durationIn:durationIn, severityIn:severityIn, triedIn:triedIn,
  triggersIn:triggersIn, impactIn:impactIn, patternIn:patternIn, historyIn:historyIn,
  areaLabel:function(id){ for(var i=0;i<AREAS.length;i++) if(AREAS[i].id===id) return AREAS[i].label; return 'this'; }
};
})();
