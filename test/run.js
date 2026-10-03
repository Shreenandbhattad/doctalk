require('./dom.js');
const fs=require('fs'), path=require('path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const body=global.document.body;

const shell=html.slice(html.indexOf('<body>'), html.indexOf('<script'));
[...shell.matchAll(/<(\w+)[^>]*id="([^"]+)"[^>]*class="([^"]*)"/g)].forEach(m=>{
  const e=global.__mk(m[1]); e.setAttribute('id',m[2]); e.className=m[3]; body.appendChild(e);
});
[...shell.matchAll(/<(\w+)[^>]*class="([^"]*)"[^>]*id="([^"]+)"/g)].forEach(m=>{
  if(global.document.getElementById(m[3])) return;
  const e=global.__mk(m[1]); e.setAttribute('id',m[3]); e.className=m[2]; body.appendChild(e);
});
['stage','toast','scrim','sheet','flag','disclaim'].forEach(id=>{
  if(!global.document.getElementById(id)){ const e=global.__mk('div'); e.setAttribute('id',id); body.appendChild(e); }
});
const sheet=global.document.getElementById('sheet');
if(sheet && sheet.parentNode!==global.document.getElementById('scrim')){
  global.document.getElementById('scrim').appendChild(sheet);
}

let bad=false;
console.log('loading modules');
for(const f of ['js/core.js','js/motion.js','js/orb.js','js/conditions.js','js/speech.js','js/interview.js','js/card.js','js/scan.js','js/app.js']){
  try{ (0,eval)(fs.readFileSync(path.join(root,f),'utf8')); console.log('  ok   '+f); }
  catch(e){ bad=true; console.log('  FAIL '+f+' -> '+e.message); console.log('       '+(e.stack||'').split('\n')[1]); break; }
}
if(bad) process.exit(1);
global.__flush(6);
const D=global.window.DT;
const stage=global.document.getElementById('stage');

console.log('\nhome screen');
console.log('  blocks rendered: '+stage.children.length);
console.log('  doors: '+global.__findAll(stage,'.door').length);

console.log('\ninterview, one hinglish story at a time');
const S=D.newSession('symptom');
const lines=[
 'mere baal bahut jhad rahe hain teen mahine se aur upar se patla ho raha hai',
 'sir ke upar wala hissa zyada, 7 out of 10 bura lagta hai',
 'badh raha hai dheere dheere',
 'maine minoxidil aur biotin try kiya tha do mahine',
 'neend bhi kharab hai aur confidence par asar pada hai',
 'papa ko bhi tha ghar me'
];
lines.forEach((t,i)=>{
  D.interview.extract(S,t);
  const n=D.interview.next(S);
  console.log('  turn '+(i+1)+'  ring '+Math.round(D.interview.completeness(S)*100)+'%   next: '+(n?n.q:'story complete'));
});
console.log('\n  extracted');
console.log('   area      '+S.slots.area);
console.log('   duration  '+(S.slots.duration?S.slots.duration.label:'-'));
console.log('   severity  '+S.slots.severity);
console.log('   pattern   '+S.slots.pattern);
console.log('   tried     '+(S.slots.tried||[]).join(', '));
console.log('   impact    '+(S.slots.impact||[]).join(', '));
console.log('   history   '+S.slots.history);

console.log('\nred flags');
[['mujhe seene me dard ho raha hai aur saans nahi aa rahi','cardiac'],
 ['mera bahut khoon ja raha hai har ghante pad badalna pad raha','bleed'],
 ['mujhe lagta hai jeena nahi chahiye','selfharm'],
 ['thoda sa sar dard hai','none']].forEach(c=>{
  const f=D.interview.detectFlags(c[0]);
  const got=f.length?f[0].id:'none';
  console.log('  '+(got===c[1]?'ok  ':'MISS')+'  "'+c[0].slice(0,42)+'..." -> '+got);
  if(got!==c[1]) bad=true;
});

console.log('\ncard');
const c=D.card.build(S);
console.log('  headline: '+c.headline);
console.log('  questions: '+c.questions.length);
const txt=D.card.text(c);
if(/[—–…]/.test(txt)){ console.log('  FAIL em dash or ellipsis in card text'); bad=true; }
else console.log('  copy filter: clean');

console.log('\nmedicine lookup');
[['mintop','Minoxidil'],['pantop','Pantoprazole'],['sotret','Isotretinoin'],['eltroxin','Levothyroxine']].forEach(p=>{
  const m=D.scan.match(p[0]);
  const ok=m.length&&m[0].n===p[1];
  console.log('  '+(ok?'ok  ':'MISS')+'  '+p[0]+' -> '+(m.length?m[0].n:'nothing'));
  if(!ok) bad=true;
});

console.log('\nnavigation');
global.__findAll(stage,'.door')[0].click();
setTimeout(function(){
  global.__flush(8);
  const petals=global.__findAll(stage,'.petal').length;
  const q=global.__findAll(stage,'.question')[0];
  console.log('  room rendered, petals: '+petals);
  console.log('  first question: '+(q?q.textContent:'none'));
  console.log('  type fallback present: '+(global.__findAll(stage,'.roombar').length>0));
  if(petals!==4) bad=true;
  if(!q || !q.textContent) bad=true;

  console.log('\ncard screen');
  try{
    const S2=global.window.DT.newSession('symptom');
    global.window.DT.interview.extract(S2,'teen mahine se baal jhad rahe hain, 7 out of 10, minoxidil try kiya, neend kharab');
    const c2=global.window.DT.card.build(S2);
    const node=global.window.DT.card.render(c2);
    console.log('  card sections: '+node.children.length);
    if(node.children.length<3) bad=true;
  }catch(e){ bad=true; console.log('  FAIL '+e.message); }

  console.log('\n'+(bad?'FAILED':'all checks passed'));
  process.exit(bad?1:0);
}, 420);
