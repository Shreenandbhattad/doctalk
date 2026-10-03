(function(){
'use strict';
var B=window.DT, el=B.el, esc=B.esc;

var MEDS=[
 {n:'Minoxidil',a:['mintop','tugain','rogaine','hair 4u','morr'],w:'Helps hair grow back where it has thinned.',
  t:'Twice a day on a dry scalp. Leave four hours before washing.',
  c:'Shedding gets worse for the first month. That is expected, and stopping restarts it.'},
 {n:'Finasteride',a:['finpecia','finast','fincar','finax'],w:'Slows hair loss by blocking the hormone behind it.',
  t:'Once a day, same time.',c:'Not to be handled by anyone who could become pregnant. Tell your doctor about mood changes.'},
 {n:'Ketoconazole shampoo',a:['nizral','danclear','scalpe','ketostar'],w:'An antifungal wash for flaking and itch.',
  t:'Twice a week. Leave on for five minutes.',c:'Dryness is common. Follow with conditioner on the lengths.'},
 {n:'Adapalene',a:['deriva','adaferin','differin'],w:'A retinoid that unblocks pores.',
  t:'A pea sized amount at night, on dry skin.',c:'Worse before better for two to three weeks. Sunscreen is not optional.'},
 {n:'Benzoyl peroxide',a:['benzac','persol','brevoxyl','acnesol bpo'],w:'Kills the bacteria involved in acne.',
  t:'Thin layer, usually mornings.',c:'Bleaches towels and pillowcases. It also degrades tretinoin, so keep them apart.'},
 {n:'Clindamycin gel',a:['clindac','acnesol','erytop'],w:'An antibiotic applied to the skin.',
  t:'Twice a day on affected areas.',c:'Usually paired with benzoyl peroxide to avoid resistance.'},
 {n:'Isotretinoin',a:['sotret','isotroin','accufine','acnetret'],w:'The strongest acne treatment, taken by mouth.',
  t:'With a meal containing fat, which roughly doubles how much is absorbed.',
  c:'Strict pregnancy prevention is required. Regular blood tests. Tell your doctor about mood changes.'},
 {n:'Doxycycline',a:['doxt','doxy','minoz','minolup'],w:'An antibiotic taken by mouth for inflamed acne.',
  t:'With food and a full glass of water. Stay upright afterwards.',
  c:'Keep two to three hours away from milk, calcium and iron, which stop it being absorbed.'},
 {n:'Metformin',a:['glycomet','glucophage','obimet','carbophage'],w:'Improves how your body handles insulin.',
  t:'With food, to reduce stomach upset.',c:'Long term use lowers vitamin B12. Worth checking yearly.'},
 {n:'Levothyroxine',a:['eltroxin','thyronorm','thyrox','lethyrox'],w:'Replaces thyroid hormone.',
  t:'Empty stomach, thirty to sixty minutes before anything, including chai.',
  c:'Keep four hours away from calcium and iron or the dose stops working.'},
 {n:'Iron',a:['fefol','orofer','dexorange','autrin','livogen','ferrous'],w:'Replaces low iron stores.',
  t:'Best with vitamin C, worst with tea or milk.',c:'Dark stools are normal. Constipation is common.'},
 {n:'Vitamin D',a:['uprise','calcirol','d3 must','tayo'],w:'Corrects a low vitamin D level.',
  t:'With the largest meal of the day, because it needs fat to absorb.',c:'Recheck the level after about twelve weeks.'},
 {n:'Pantoprazole',a:['pantop','pan 40','pantocid','protonix'],w:'Reduces stomach acid.',
  t:'Thirty minutes before breakfast.',c:'Long term use affects iron and B12 absorption.'},
 {n:'Combined pill',a:['yasmin','krimson','diane','ginette','novelon'],w:'A hormonal contraceptive, also used for cycles and acne.',
  t:'Same time every day.',c:'Tell your doctor about migraines, smoking or a history of clots.'},
 {n:'Tranexamic acid',a:['trapic','pause','texid'],w:'Reduces heavy menstrual bleeding.',
  t:'Only on heavy days, as directed.',c:'Not for anyone with a history of clots.'},
 {n:'Sildenafil',a:['viagra','suhagra','manforce','penegra'],w:'Improves blood flow for erections.',
  t:'About an hour before, not with a heavy meal.',c:'Never with nitrate heart medicines. That combination is dangerous.'}
];

function match(q){
  q=String(q||'').toLowerCase().trim();
  if(q.length<2) return [];
  return MEDS.filter(function(m){
    if(m.n.toLowerCase().indexOf(q)>-1) return true;
    for(var i=0;i<m.a.length;i++) if(m.a[i].indexOf(q)>-1 || q.indexOf(m.a[i])>-1) return true;
    return false;
  }).slice(0,6);
}

// finds lines of writing by horizontal gradient, no OCR
function textBlocks(img){
  var W=320;
  var k=Math.min(W/img.width,W/img.height,1);
  var w=Math.max(16,Math.round(img.width*k)), h=Math.max(16,Math.round(img.height*k));
  var c=document.createElement('canvas'); c.width=w; c.height=h;
  var x=c.getContext('2d'); x.drawImage(img,0,0,w,h);
  var d=x.getImageData(0,0,w,h).data;
  var L=new Float32Array(w*h), i, j;
  for(i=0,j=0;i<d.length;i+=4,j++) L[j]=0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2];

  var grad=new Float32Array(w*h);
  for(var y=1;y<h-1;y++) for(var xx=1;xx<w-1;xx++){
    var p=y*w+xx;
    grad[p]=Math.abs(L[p-1]-L[p+1])+Math.abs(L[p-w]-L[p+w]);
  }
  var rows=new Float32Array(h);
  for(var y2=0;y2<h;y2++){ var s=0; for(var x2=0;x2<w;x2++) s+=grad[y2*w+x2]; rows[y2]=s/w; }
  var mean=0; for(var r=0;r<h;r++) mean+=rows[r]; mean/=h;
  var thr=mean*1.25;

  var bands=[], start=-1;
  for(var y3=0;y3<h;y3++){
    if(rows[y3]>thr && start<0) start=y3;
    else if(rows[y3]<=thr && start>=0){
      if(y3-start>=3) bands.push([start,y3]);
      start=-1;
    }
  }
  if(start>=0 && h-start>=3) bands.push([start,h]);

  return bands.slice(0,14).map(function(b){
    var x0=w, x1=0;
    for(var yy=b[0];yy<b[1];yy++) for(var xx2=0;xx2<w;xx2++){
      if(grad[yy*w+xx2]>thr*0.9){ if(xx2<x0)x0=xx2; if(xx2>x1)x1=xx2; }
    }
    if(x1<=x0){ x0=0; x1=w; }
    return {x:x0/w, y:b[0]/h, w:(x1-x0)/w, h:(b[1]-b[0])/h};
  }).filter(function(b){ return b.w>0.12 && b.h<0.3; });
}

function medCard(m, conf){
  var d=el('div','med');
  d.innerHTML='<div class="mh"><span class="mn">'+esc(m.n)+'</span>'+
    '<span class="mc '+(conf?'hi':'lo')+'">'+(conf?'you confirmed':'check this')+'</span></div>'+
    '<div class="mrow"><span class="mk">What it is</span><span>'+esc(m.w)+'</span></div>'+
    '<div class="mrow"><span class="mk">When</span><span>'+esc(m.t)+'</span></div>'+
    '<div class="mrow"><span class="mk">Watch for</span><span>'+esc(m.c)+'</span></div>'+
    '<div class="mnote">Confirm with your pharmacist or doctor before changing anything.</div>';
  return d;
}

B.scan={ MEDS:MEDS, match:match, textBlocks:textBlocks, medCard:medCard };
})();
