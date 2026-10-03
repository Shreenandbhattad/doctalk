require('./dom.js');
const fs=require('fs');
['js/core.js','js/motion.js','js/orb.js','js/conditions.js','js/speech.js','js/interview.js','js/card.js','js/scan.js']
  .forEach(f=>(0,eval)(fs.readFileSync(f,'utf8')));
const D=global.window.DT, I=D.interview;

function run(title, lines, picks){
  const S=D.newSession('symptom');
  lines.forEach(t=>I.extract(S,t));
  Object.keys(picks||{}).forEach(k=>I.answerPick(S,k,picks[k]));
  const a=I.assess(S);
  console.log('\n'+title);
  console.log('  area        '+(a.area?a.area.title:'not identified'));
  console.log('  urgency     '+a.urgency.toUpperCase()+'  '+a.why);
  console.log('  specialist  '+a.spec);
  console.log('  considering');
  a.consider.forEach(c=>console.log('    - '+c.t));
  console.log('  tests       '+a.tests.slice(0,3).join(', '));
  if(S.flags.length) console.log('  FLAG        '+S.flags[0].t);
  return {S,a};
}

run('A. diffuse hair fall after an illness',
  ['mere baal bahut jhad rahe hain teen mahine se','5 out of 10','minoxidil try kiya'],
  {shape:'diffuse', trigger3:'yes'});

run('B. jaw acne that flares with the cycle',
  ['chehre pe daane ho rahe hain jaw par, 6 mahine se','7 out of 10','benzoyl aur salicylic aur retinol laga raha hoon'],
  {where2:'jaw', cycle:'yes'});

run('C. long cycles with weight gain',
  ['period bahut irregular hai, do mahine se nahi aaya','vajan bhi badh raha hai'],
  {gap:'missing', flow:'normal'});

run('D. tired with breathlessness',
  ['bahut thakan rehti hai char mahine se','seedhi chadhte saans phoolti hai','8 out of 10'],
  {rest:'no', breath2:'yes'});

run('E. cough for two months',
  ['khasi do mahine se nahi ja rahi','raat ko zyada hoti hai'],
  {howlong3:'long', night3:'yes'});

run('F. chest pain, should interrupt everything',
  ['mujhe seene me dard ho raha hai aur saans nahi aa rahi'], {});

run('G. erection difficulty, slow onset',
  ['erection problem hai, dheere dheere ho raha hai pichle saal se'],
  {morning:'no', onset2:'slow'});

console.log('\nurgency spread across the cases above is the point: not everything is urgent.');
