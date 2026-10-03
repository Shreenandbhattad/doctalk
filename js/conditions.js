(function(){
'use strict';
var B=window.DT;

function A(o){ return o; }

var AREAS={

hair:A({label:'hair', title:'Hair and scalp', spec:'Dermatologist',
 kw:['baal','bal','hair','jhad','jhar','ganj','patla','bald','scalp','dandruff','rusi','hairfall','hairline','chanda','tak'],
 ask:[
  {k:'shape', q:'Is it thinning everywhere, or going back at the front and crown?',
   h:'Poore sar pe patla, ya aage aur upar se.',
   pick:[['diffuse','All over'],['pattern','Front and crown'],['patch','In patches']]},
  {k:'trigger3', q:'Anything big about three months before it started?',
   h:'Bimari, operation, bahut stress, crash diet, delivery.',
   pick:[['yes','Yes, something happened'],['no','Nothing I can think of']]}
 ],
 consider:[
  {t:'Telogen effluvium', if:function(s){ return s.shape==='diffuse' || s.trigger3==='yes'; },
   d:'Shedding that follows an illness, surgery, crash diet or a hard few months, usually about three months later. It is the commonest diffuse shedding and it reverses.'},
  {t:'Pattern hair loss', if:function(s){ return s.shape==='pattern'; },
   d:'Gradual loss at the hairline and crown, often in the family. It responds to treatment slowly and needs it kept up.'},
  {t:'Alopecia areata', if:function(s){ return s.shape==='patch'; },
   d:'Smooth coin shaped bald patches. Different cause and different treatment, so it is worth showing a doctor rather than treating at home.'},
  {t:'Iron, thyroid or vitamin D', if:function(){ return true; },
   d:'Low ferritin and thyroid problems both cause shedding and both are cheap to rule out before anything is prescribed.'}
 ],
 tests:['Ferritin','Thyroid, TSH','Vitamin D','Complete blood count'],
 flags:[{kw:['patch','chakatta','smooth bald','coin'], t:'Patchy loss is worth seeing someone about',
   d:'Round smooth patches are treated differently from general thinning.'}]}),

skin:A({label:'skin', title:'Skin', spec:'Dermatologist',
 kw:['skin','chehra','face','pimple','daane','dane','acne','keel','muhase','rash','khujli','itch','daag','spot','kaala','pigment','sun'],
 ask:[
  {k:'where2', q:'Where mostly?', h:'Jaw aur chin, maatha, gaal, ya poora chehra.',
   pick:[['jaw','Jaw and chin'],['fore','Forehead'],['cheek','Cheeks'],['all','All over']]},
  {k:'cycle', q:'Does it flare around your periods?', h:'Period ke aas paas zyada hota hai.',
   pick:[['yes','Yes'],['no','No'],['na','Does not apply']]}
 ],
 consider:[
  {t:'Hormonal acne', if:function(s){ return s.where2==='jaw' || s.cycle==='yes'; },
   d:'Jaw and chin dominant acne that flares with the cycle. It responds poorly to creams alone and often needs the hormonal side looked at.'},
  {t:'Comedonal or occlusive acne', if:function(s){ return s.where2==='fore'; },
   d:'Forehead dominant acne is often friction, hair products or helmets rather than hormones.'},
  {t:'Barrier damage from over treating', if:function(s){ return (s.tried||[]).length>=3; },
   d:'Several actives at once strips the skin, and the redness that follows looks like worsening acne. Using more makes it worse.'},
  {t:'PCOS, where it fits', if:function(s){ return s.cycle==='yes'; },
   d:'Acne with irregular cycles or new facial hair is usually screened for PCOS rather than treated as a skin problem on its own.'}
 ],
 tests:['Usually none to start','If hormonal: testosterone, DHEAS','If cycles are irregular: a PCOS screen'],
 flags:[{kw:['cyst','gaanth','painful lump','scar','nishan','pitted'], t:'Deep lumps and scarring need a dermatologist',
   d:'Nodules and cysts are the ones that scar permanently, and the window to prevent that is now.'}]}),

period:A({label:'periods', title:'Periods and cycle', spec:'Gynaecologist',
 kw:['period','periods','mahvari','mc','cycle','bleeding','spotting','cramp','pcos','pcod','irregular','date','mahina'],
 ask:[
  {k:'gap', q:'How many days between periods, roughly?', h:'Ek period se agle tak kitne din.',
   pick:[['short','Under 21 days'],['normal','21 to 35 days'],['long','Over 35 days'],['missing','They go missing for months']]},
  {k:'flow', q:'How heavy are the first two days?',
   h:'Pad kitni der chalta hai, clots aate hain kya.',
   pick:[['heavy','Soaking through fast'],['normal','Normal'],['light','Light']]}
 ],
 consider:[
  {t:'PCOS', if:function(s){ return s.gap==='long' || s.gap==='missing'; },
   d:'Long or missing cycles, often with acne, weight change or extra hair. It is diagnosed on a combination of things, not one test.'},
  {t:'Thyroid', if:function(s){ return s.gap!=='normal'; },
   d:'Both an underactive and overactive thyroid disturb cycles, and it is one of the first things checked.'},
  {t:'Fibroids or adenomyosis', if:function(s){ return s.flow==='heavy'; },
   d:'Heavy bleeding with cramping is often structural rather than hormonal, which a scan settles.'},
  {t:'Endometriosis', if:function(s){ return (s.severity||0)>=7; },
   d:'Pain that stops you working is not normal period pain, and it is commonly dismissed for years before anyone looks.'}
 ],
 tests:['Pelvic ultrasound','Thyroid, TSH','Haemoglobin and ferritin','If PCOS is suspected: testosterone, LH, FSH, fasting insulin'],
 flags:[{kw:['har ghante','soaking','bade clots','large clots','bleeding ruk nahi'],
   t:'That amount of bleeding needs same day care', d:'Soaking a pad every hour or passing large clots is not something to wait out.'}]}),

sexual:A({label:'sexual health', title:'Sexual health', spec:'Urologist or andrologist',
 kw:['sex','erection','erectile','stamina','ling','discharge','libido','sperm','premature','performance','shighrapatan','nightfall'],
 ask:[
  {k:'morning', q:'Do morning erections still happen?', h:'Subah ke waqt hota hai ya nahi.',
   pick:[['yes','Yes, usually'],['sometimes','Sometimes'],['no','Rarely or never']]},
  {k:'onset2', q:'Did it come on suddenly or slowly over months?',
   h:'Achanak hua ya dheere dheere.',
   pick:[['sudden','Suddenly'],['slow','Slowly over months']]}
 ],
 consider:[
  {t:'Mostly psychological', if:function(s){ return s.morning==='yes' && s.onset2==='sudden'; },
   d:'Morning erections intact plus a sudden start usually points away from a blood flow problem. That is good news and it is treatable.'},
  {t:'Vascular or metabolic', if:function(s){ return s.morning==='no' || s.onset2==='slow'; },
   d:'A slow decline with no morning erections is often the first visible sign of blood sugar, cholesterol or blood pressure trouble. It is worth taking seriously for reasons beyond sex.'},
  {t:'Testosterone and thyroid', if:function(){ return true; },
   d:'Low drive alongside fatigue and mood change is usually checked with bloods before anything is prescribed.'},
  {t:'Medication side effects', if:function(s){ return (s.tried||[]).length>0; },
   d:'Several common medicines affect this, and switching is often simpler than adding something new.'}
 ],
 tests:['Fasting glucose and HbA1c','Lipid profile','Morning testosterone','Thyroid, TSH'],
 flags:[]}),

gut:A({label:'digestion', title:'Stomach and digestion', spec:'Gastroenterologist or GP first',
 kw:['pet','gas','acidity','bloat','constipat','kabz','loose','motion','dast','ulti','vomit','nausea','jalan pet','indigest','stomach','gastric','seene me jalan'],
 ask:[
  {k:'when2', q:'Is it worse after eating, or at any particular time?',
   h:'Khane ke baad, khali pet, ya raat ko.',
   pick:[['after','After eating'],['empty','On an empty stomach'],['night','At night'],['any','No clear pattern']]},
  {k:'bowel', q:'Any change in your bowel habit?',
   h:'Kabz, loose motion, ya normal.',
   pick:[['const','Constipated'],['loose','Loose'],['both','Alternating'],['normal','Normal']]}
 ],
 consider:[
  {t:'Acid reflux or gastritis', if:function(s){ return s.when2==='empty' || s.when2==='night'; },
   d:'Burning that is worse on an empty stomach or lying down. Common, and usually managed before anyone looks inside.'},
  {t:'Irritable bowel', if:function(s){ return s.bowel==='both' || s.bowel==='loose'; },
   d:'A pattern diagnosis made after ruling things out, not a throwaway label. Food and stress both feed it.'},
  {t:'Lactose or food intolerance', if:function(){ return true; },
   d:'Very common across India and worth a clean trial rather than a lifelong assumption.'},
  {t:'Coeliac disease', if:function(s){ return s.bowel==='loose'; },
   d:'Often missed for years. The blood test has to be done before gluten is cut, or it reads falsely normal.'}
 ],
 tests:['Complete blood count and ferritin','Coeliac serology, before cutting gluten','H pylori test','Faecal calprotectin if symptoms persist'],
 flags:[{kw:['khoon','blood in stool','black stool','kaala potty','weight loss','vajan kam','raat ko dard'],
   t:'These need a doctor rather than a home remedy',
   d:'Blood in the stool, black stools, unintended weight loss or pain that wakes you at night are all investigated rather than managed.'}]}),

sleep:A({label:'sleep', title:'Sleep', spec:'GP, or a sleep clinic',
 kw:['neend','sleep','insomnia','so nahi','jaag','snore','kharate','nap'],
 ask:[
  {k:'which', q:'Is it falling asleep, or staying asleep?',
   h:'Neend aane me dikkat ya baar baar khulna.',
   pick:[['fall','Falling asleep'],['stay','Staying asleep'],['both','Both']]},
  {k:'snore', q:'Has anyone said you snore loudly or stop breathing?',
   h:'Kharate ya saans rukti hai.',
   pick:[['yes','Yes'],['no','No'],['dunno','Nobody has said']]}
 ],
 consider:[
  {t:'Sleep apnoea', if:function(s){ return s.snore==='yes'; },
   d:'Loud snoring with pauses, plus daytime tiredness despite enough hours. It is common, under diagnosed, and treatable once confirmed.'},
  {t:'Insomnia from the clock', if:function(s){ return s.which==='fall'; },
   d:'Trouble falling asleep is usually a body clock and wind down problem rather than a chemical one.'},
  {t:'Thyroid, iron and vitamin D', if:function(){ return true; },
   d:'All three cause unrefreshing sleep and all three are cheap to check.'},
  {t:'Anxiety or low mood', if:function(s){ return s.which==='stay'; },
   d:'Waking at three and not getting back is a classic pattern, and treating the sleep alone rarely fixes it.'}
 ],
 tests:['Thyroid, TSH','Ferritin','Vitamin D','A sleep study if snoring or daytime sleepiness is present'],
 flags:[{kw:['saans rukti','stop breathing','gasping','choking'], t:'Pauses in breathing should be checked',
   d:'Stopping breathing in your sleep strains the heart over time and is very treatable.'}]}),

mood:A({label:'how you have been feeling', title:'Mood and stress', spec:'GP or a psychiatrist',
 kw:['tension','stress','anxiety','ghabrahat','udaas','depress','mood','chidchid','akela','mann nahi','panic','rona'],
 ask:[
  {k:'howlong2', q:'Most days, or only some days?',
   h:'Har roz aisa lagta hai ya kabhi kabhi.',
   pick:[['most','Most days'],['some','Some days']]},
  {k:'function', q:'Is it affecting work, sleep or eating?',
   h:'Kaam, neend ya khana par asar.',
   pick:[['yes','Yes, clearly'],['little','A little'],['no','Not really']]}
 ],
 consider:[
  {t:'Worth a proper assessment', if:function(s){ return s.howlong2==='most' && s.function==='yes'; },
   d:'Most days, for weeks, with work or sleep affected is the point at which this is treated rather than waited out. That is a medical threshold, not a judgement.'},
  {t:'Thyroid and vitamin deficiency', if:function(){ return true; },
   d:'Thyroid problems, low B12 and low vitamin D all produce low mood and fatigue, and they are checked first because they are simple to correct.'},
  {t:'Sleep as a driver', if:function(){ return true; },
   d:'Poor sleep and low mood each make the other worse, and sorting the sleep first sometimes lifts both.'}
 ],
 tests:['Thyroid, TSH','Vitamin B12 and vitamin D','Complete blood count'],
 flags:[]}),

energy:A({label:'energy', title:'Tiredness', spec:'GP',
 kw:['thak','thaka','tired','fatigue','energy','sust','kamzor','weakness','kamzori'],
 ask:[
  {k:'rest', q:'Does it improve after a good night of sleep?',
   h:'Achhi neend ke baad theek lagta hai.',
   pick:[['yes','Yes'],['no','No, still tired']]},
  {k:'breath2', q:'Any breathlessness going up stairs?',
   h:'Seedhi chadhte waqt saans phoolti hai.',
   pick:[['yes','Yes'],['no','No']]}
 ],
 consider:[
  {t:'Anaemia', if:function(s){ return s.breath2==='yes'; },
   d:'Tiredness with breathlessness on mild effort is checked for low haemoglobin first. Very common, especially with heavy periods.'},
  {t:'Thyroid', if:function(){ return true; },
   d:'An underactive thyroid produces exactly this picture, along with feeling cold and gaining weight.'},
  {t:'Vitamin B12 and vitamin D', if:function(){ return true; },
   d:'Both are widely low in India, both cause fatigue, and both are simple to correct once measured.'},
  {t:'Unrefreshing sleep', if:function(s){ return s.rest==='no'; },
   d:'Still tired after eight hours points at sleep quality rather than quantity.'}
 ],
 tests:['Complete blood count','Ferritin','Thyroid, TSH','Vitamin B12 and vitamin D','Fasting glucose'],
 flags:[]}),

weight:A({label:'weight', title:'Weight change', spec:'GP or endocrinologist',
 kw:['weight','vajan','mota','patla','motapa','obese','gain','lose','bhook'],
 ask:[
  {k:'dir', q:'Going up or down?', h:'Badh raha hai ya kam ho raha hai.',
   pick:[['up','Up'],['down','Down']]},
  {k:'intent', q:'Were you trying to change it?', h:'Koshish kar rahe the ya apne aap.',
   pick:[['yes','Yes, deliberately'],['no','No, it just happened']]}
 ],
 consider:[
  {t:'Unintentional loss needs looking at', if:function(s){ return s.dir==='down' && s.intent==='no'; },
   d:'Losing weight without trying is one of the few symptoms that is always investigated, because the list of causes is wide.'},
  {t:'Thyroid', if:function(){ return true; },
   d:'Underactive causes gain, overactive causes loss, and it is the first blood test either way.'},
  {t:'Insulin resistance or PCOS', if:function(s){ return s.dir==='up'; },
   d:'Weight that will not move alongside irregular cycles or skin changes is usually assessed together, not separately.'},
  {t:'Diabetes', if:function(s){ return s.dir==='down' && s.intent==='no'; },
   d:'Weight loss with thirst and passing urine often is checked urgently.'}
 ],
 tests:['Thyroid, TSH','Fasting glucose and HbA1c','Complete blood count','Lipid profile'],
 flags:[{kw:['bina koshish','without trying','apne aap kam'], t:'Unexplained weight loss is worth booking soon',
   d:'Losing weight you did not intend to lose is checked rather than watched.'}]}),

urine:A({label:'urinary symptoms', title:'Urinary', spec:'GP, or a urologist',
 kw:['peshab','urine','jalan peshab','peshab me jalan','uti','bladder','urination','pishab'],
 ask:[
  {k:'burn', q:'Any burning when you pass urine?', h:'Peshab me jalan hoti hai.',
   pick:[['yes','Yes'],['no','No']]},
  {k:'night2', q:'Getting up at night to go?', h:'Raat ko uthna padta hai.',
   pick:[['yes','Yes'],['no','No']]}
 ],
 consider:[
  {t:'Urinary infection', if:function(s){ return s.burn==='yes'; },
   d:'Burning with frequency is usually an infection and is confirmed with a simple urine test before antibiotics.'},
  {t:'Blood sugar', if:function(s){ return s.night2==='yes'; },
   d:'Passing urine often, especially at night, with thirst, is checked for diabetes early.'},
  {t:'Prostate, for men over forty', if:function(){ return true; },
   d:'A weak stream and night time trips are common and treatable, and worth raising rather than living with.'}
 ],
 tests:['Urine routine and culture','Fasting glucose and HbA1c','Ultrasound if symptoms persist'],
 flags:[{kw:['khoon peshab','blood in urine','pink urine','bukhar aur peshab'],
   t:'Blood in urine or fever with it needs care now',
   d:'Either of those changes this from a routine problem to an urgent one.'}]}),

breath:A({label:'breathing', title:'Cough and breathing', spec:'GP, or a pulmonologist',
 kw:['khasi','cough','saans','breath','wheez','chest','seena','balgam','phlegm','asthma'],
 ask:[
  {k:'howlong3', q:'How long has the cough been there?',
   h:'Kitne hafte se.',
   pick:[['short','Under two weeks'],['mid','Two to six weeks'],['long','Over six weeks']]},
  {k:'night3', q:'Worse at night or with exercise?',
   h:'Raat ko ya bhaagne par zyada.',
   pick:[['yes','Yes'],['no','No']]}
 ],
 consider:[
  {t:'Asthma or allergic cough', if:function(s){ return s.night3==='yes'; },
   d:'A cough that is worse at night or on exertion is often asthma, including in adults who never had it as children.'},
  {t:'Post infection cough', if:function(s){ return s.howlong3==='mid'; },
   d:'A cough can linger for weeks after an infection clears, and antibiotics do nothing for it.'},
  {t:'Needs ruling out at six weeks', if:function(s){ return s.howlong3==='long'; },
   d:'A cough beyond six weeks is investigated properly. In India that includes ruling out tuberculosis, which is common and very treatable.'}
 ],
 tests:['Chest x ray if the cough is over three weeks','Sputum testing where TB is a possibility','Complete blood count','Spirometry if asthma is suspected'],
 flags:[{kw:['khoon ki khasi','coughing blood','blood in sputum','raat ko paseena','night sweats','saans nahi'],
   t:'This needs to be seen quickly',
   d:'Coughing blood, night sweats with weight loss, or real breathlessness are all seen urgently.'}]}),

pain:A({label:'pain', title:'Pain', spec:'GP',
 kw:['dard','pain','ache','sir dard','headache','migraine','kamar','back','joint','ghutna','knee','jodo'],
 ask:[
  {k:'spot', q:'Where is it, mostly?', h:'Sar, kamar, jodon me, ya kahin aur.',
   pick:[['head','Head'],['back','Back or neck'],['joint','Joints'],['other','Somewhere else']]},
  {k:'wake', q:'Does it wake you at night?', h:'Raat ko neend kholta hai.',
   pick:[['yes','Yes'],['no','No']]}
 ],
 consider:[
  {t:'Tension or migraine headache', if:function(s){ return s.spot==='head'; },
   d:'Pattern, triggers and what helps separate these two, and they are managed quite differently.'},
  {t:'Mechanical back pain', if:function(s){ return s.spot==='back'; },
   d:'Most back pain is mechanical, settles in weeks, and does not need a scan. Scanning early often finds things that were never the problem.'},
  {t:'Inflammatory joint pain', if:function(s){ return s.spot==='joint'; },
   d:'Morning stiffness lasting over an hour, with swelling, is assessed differently from wear and tear.'},
  {t:'Pain that wakes you', if:function(s){ return s.wake==='yes'; },
   d:'Night pain is one of the few features that pushes a doctor to investigate sooner.'}
 ],
 tests:['Usually none at first','Complete blood count and inflammatory markers if joints are involved','Imaging only if specific signs are present'],
 flags:[{kw:['sabse bura dard','worst headache','achanak dard','sudden severe','bukhar aur gardan','neck stiff'],
   t:'A sudden worst ever headache is an emergency',
   d:'A headache that arrives like a thunderclap, or one with fever and a stiff neck, is seen immediately.'}]}),

fever:A({label:'fever', title:'Fever and infection', spec:'GP',
 kw:['bukhar','fever','temperature','thand lag','chills','infection','sardi','jukam','cold'],
 ask:[
  {k:'days', q:'How many days of fever?', h:'Kitne din se bukhar hai.',
   pick:[['1','One or two'],['3','Three to five'],['7','More than a week']]},
  {k:'with', q:'Anything with it?', h:'Dard, dane, ulti, saans.',
   pick:[['rash','A rash'],['pain','Body ache'],['tummy','Vomiting'],['none','Nothing else']]}
 ],
 consider:[
  {t:'Common viral illness', if:function(s){ return s.days==='1'; },
   d:'Most short fevers are viral and settle. Antibiotics do nothing for them.'},
  {t:'Dengue, typhoid, malaria', if:function(s){ return s.days==='3' || s.with==='rash'; },
   d:'In India a fever beyond three days is commonly tested for these rather than treated blind, especially after the monsoon.'},
  {t:'Fever beyond a week', if:function(s){ return s.days==='7'; },
   d:'A week of fever is always investigated, because the causes stop being the simple ones.'}
 ],
 tests:['Complete blood count with platelets','Dengue NS1 and IgM where relevant','Malaria smear or antigen','Typhoid testing','Urine routine'],
 flags:[{kw:['bacche ko bukhar','infant fever','newborn','navjat','dane aur bukhar','saans aur bukhar','behosh'],
   t:'Fever with these signs is urgent',
   d:'A fever in a baby under three months, or with breathlessness, drowsiness or a rash that does not fade when pressed, is seen the same day.'}]})

};

var ORDER=['hair','skin','period','sexual','gut','sleep','mood','energy','weight','urine','breath','pain','fever'];

B.conditions={
  AREAS:AREAS,
  ORDER:ORDER,
  get:function(id){ return AREAS[id]||null; },
  label:function(id){ return AREAS[id] ? AREAS[id].label : 'this'; },
  detect:function(text){
    var t=' '+String(text||'').toLowerCase().replace(/[^\w\s\u0900-\u097F]/g,' ').replace(/\s+/g,' ')+' ';
    var best=null, score=0;
    ORDER.forEach(function(id){
      var n=0;
      AREAS[id].kw.forEach(function(k){
        if(t.indexOf(' '+k)>-1 || t.indexOf(k+' ')>-1) n += k.length>=5 ? 3 : 1;
      });
      if(n>score){ score=n; best=id; }
    });
    return score>=2 ? best : null;
  }
};
})();
