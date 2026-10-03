require('./dom.js');
const fs=require('fs');
for(const f of ['js/config.js','js/core.js','js/motion.js','js/orb.js','js/conditions.js','js/speech.js','js/interview.js','js/card.js','js/scan.js']) (0,eval)(fs.readFileSync(__dirname+'/../'+f,'utf8'));
const D=global.window.DT; let bad=false;

function run(name, opener, answers){
  const S=D.newSession('symptom'); const seenQ=[]; let turns=0, retries=0;
  let text=opener;
  while(turns<20){
    const asked=D.interview.next(S);
    S.turns.push(text); D.interview.extract(S,text);
    const r=D.interview.resolve(S, asked&&asked.key, text); turns++;
    if(r==='retry') retries++;
    const n=D.interview.next(S);
    if(!n) break;
    const key=n.key; seenQ.push(key);
    text = answers[key]!==undefined ? answers[key] : (answers._ || 'hmm');
  }
  const done=!D.interview.next(S);
  const maxRepeat=Math.max.apply(null,Object.values(seenQ.reduce((m,k)=>(m[k]=(m[k]||0)+1,m),{})));
  console.log((done&&maxRepeat<=2?'ok  ':'FAIL')+'  '+name+': '+turns+' turns, '+retries+' re-asks, a question asked at most '+maxRepeat+'x');
  if(!done||maxRepeat>2) bad=true;
}

run('clean answers','mere baal jhad rahe hain',{duration:'teen mahine se',severity:'7 out of 10',shape:'all over',trigger3:'yes',tried:'minoxidil',impact:'confidence',pattern:'getting worse',triggers:'stress',history:'papa ko bhi tha'});
run('loose answers','my hair is thinning',{duration:'about a week',severity:'seven',shape:'all over',trigger3:'no',tried:'nothing',impact:'not really',pattern:'same',triggers:'no',history:'no'});
run('mumbling','skin is bad',{_:'hmm I do not know'});
run('hindi', 'neend nahi aati',{duration:'kuch mahine se',severity:'bahut',tried:'kuch nahi',impact:'kaam',pattern:'kabhi kabhi',triggers:'nahi',history:'nahi'});
console.log(bad?'\nFAILED':'\nconversation always moves forward');
process.exit(bad?1:0);
