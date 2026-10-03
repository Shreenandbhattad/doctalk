(function(){
'use strict';
var B=window.DT;

function mkNoise(){
  var p=new Uint8Array(512), i;
  for(i=0;i<256;i++) p[i]=i;
  for(i=255;i>0;i--){ var j=(Math.random()*(i+1))|0, t=p[i]; p[i]=p[j]; p[j]=t; }
  for(i=0;i<256;i++) p[i+256]=p[i];
  function fade(t){ return t*t*t*(t*(t*6-15)+10); }
  function lerp(a,b,t){ return a+t*(b-a); }
  function grad(h,x,y){
    switch(h&3){ case 0:return x+y; case 1:return -x+y; case 2:return x-y; default:return -x-y; }
  }
  return function(x,y){
    var X=Math.floor(x)&255, Y=Math.floor(y)&255;
    x-=Math.floor(x); y-=Math.floor(y);
    var u=fade(x), v=fade(y);
    var aa=p[p[X]+Y], ab=p[p[X]+Y+1], ba=p[p[X+1]+Y], bb=p[p[X+1]+Y+1];
    return lerp(lerp(grad(aa,x,y),grad(ba,x-1,y),u), lerp(grad(ab,x,y-1),grad(bb,x-1,y-1),u), v);
  };
}
function rgba(h,a){
  h=String(h).trim();
  if(h[0]!=='#') return h;
  if(h.length===4) h='#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];
  var v=parseInt(h.slice(1),16);
  return 'rgba('+((v>>16)&255)+','+((v>>8)&255)+','+(v&255)+','+a+')';
}

B.Orb=function(host, opts){
  opts=opts||{};
  var size=opts.size||220;
  var dpr=Math.min(window.devicePixelRatio||1, 1.5);
  var W=Math.round(size*dpr);

  var cv=document.createElement('canvas');
  cv.width=W; cv.height=W;
  cv.style.width=size+'px'; cv.style.height=size+'px';
  host.appendChild(cv);
  var ctx=cv.getContext('2d');
  var noise=mkNoise();

  var skin=document.createElement('canvas');
  skin.width=W; skin.height=W;
  var sx=skin.getContext('2d');

  var t=0, amp=0, target=0, alive=true, raf=null, listening=false, last=0;
  var leaf,sage,tint;

  function readTokens(){
    var cs=getComputedStyle(document.documentElement);
    function tok(n,f){ var v=cs.getPropertyValue(n).trim(); return v||f; }
    leaf=tok('--orb1','#3FB2AE'); sage=tok('--orb2','#6BCFCB'); tint=tok('--orb3','#E2F8F6');
    paintSkin();
  }

  // the body is painted once and reused every frame
  function paintSkin(){
    var c=W/2, r=W*0.5;
    sx.clearRect(0,0,W,W);
    var g=sx.createRadialGradient(c-r*0.34, c-r*0.40, r*0.06, c, c, r*1.15);
    g.addColorStop(0, rgba(tint,.98));
    g.addColorStop(0.38, rgba(sage,.97));
    g.addColorStop(1, rgba(leaf,1));
    sx.fillStyle=g;
    sx.fillRect(0,0,W,W);
    var s=sx.createRadialGradient(c-r*0.38, c-r*0.46, 0, c-r*0.38, c-r*0.46, r*0.5);
    s.addColorStop(0,'rgba(255,255,255,.7)');
    s.addColorStop(1,'rgba(255,255,255,0)');
    sx.fillStyle=s;
    sx.fillRect(0,0,W,W);
  }

  function path(cx,cy,base,wob,phase){
    ctx.beginPath();
    var steps=64, i;
    for(i=0;i<=steps;i++){
      var a=(i/steps)*Math.PI*2;
      var n=noise(Math.cos(a)*1.5+phase, Math.sin(a)*1.5+phase*0.7);
      var rr=base*(1 + n*wob + Math.sin(a*3+phase*2)*wob*0.22);
      var x=cx+Math.cos(a)*rr, y=cy+Math.sin(a)*rr;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath();
  }

  var bloom=null, bloomFor=-1;
  function bloomGrad(cx,cy,base){
    var key=Math.round(base);
    if(bloom && bloomFor===key) return bloom;
    bloomFor=key;
    bloom=ctx.createRadialGradient(cx,cy,base*0.55,cx,cy,base*1.7);
    bloom.addColorStop(0, rgba(sage,.34));
    bloom.addColorStop(1, rgba(sage,0));
    return bloom;
  }

  function frame(now){
    if(!alive) return;
    raf=requestAnimationFrame(frame);
    var fps = listening ? 60 : 30;
    if(now - last < 1000/fps) return;
    last=now;

    amp += (target-amp)*0.16;
    if(!B.reduced) t += 0.016;

    var c=W/2;
    var breath = B.reduced ? 0 : Math.sin(t*1.9)*0.022;
    var base = c*(0.60 + breath + amp*0.16);

    ctx.clearRect(0,0,W,W);

    ctx.fillStyle=bloomGrad(c,c,base);
    ctx.beginPath(); ctx.arc(c,c,base*1.7,0,6.2832); ctx.fill();

    ctx.save();
    path(c,c,base, 0.055+amp*0.07, t*1.1);
    ctx.clip();
    ctx.drawImage(skin,0,0);
    ctx.restore();

    if(listening && !B.reduced && amp>0.04){
      ctx.lineWidth=Math.max(1,dpr);
      for(var k=0;k<2;k++){
        var p=((t*1.2)+(k/2))%1;
        ctx.strokeStyle=rgba(sage,(1-p)*0.34*Math.min(1,amp*3));
        ctx.beginPath(); ctx.arc(c,c,base*(1.02+p*0.5),0,6.2832); ctx.stroke();
      }
    }
  }

  readTokens();
  raf=requestAnimationFrame(frame);

  function onVis(){ if(document.hidden){ if(raf) cancelAnimationFrame(raf); raf=null; }
                    else if(alive && !raf){ last=0; raf=requestAnimationFrame(frame); } }
  document.addEventListener('visibilitychange', onVis);

  return {
    el:cv,
    size:size,
    setAmp:function(v){ target=Math.max(0,Math.min(1,v)); },
    listen:function(on){ listening=!!on; if(!on) target=0; },
    refresh:readTokens,
    stop:function(){
      alive=false;
      if(raf) cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
    }
  };
};

B.ring=function(size){
  var NS='http://www.w3.org/2000/svg';
  var r=size/2-5, c=2*Math.PI*r;
  var svg=document.createElementNS(NS,'svg');
  svg.setAttribute('class','orbring');
  svg.setAttribute('viewBox','0 0 '+size+' '+size);
  svg.setAttribute('width',size); svg.setAttribute('height',size);
  function circle(stroke,dash){
    var el=document.createElementNS(NS,'circle');
    el.setAttribute('cx',size/2); el.setAttribute('cy',size/2); el.setAttribute('r',r);
    el.setAttribute('stroke',stroke); el.setAttribute('stroke-width','3');
    if(dash){ el.setAttribute('stroke-dasharray',c.toFixed(1)); el.setAttribute('stroke-dashoffset',c.toFixed(1)); }
    return el;
  }
  svg.appendChild(circle('var(--line)',false));
  var prog=circle('var(--leaf)',true);
  prog.style.transition='stroke-dashoffset .7s cubic-bezier(.2,.9,.3,1)';
  svg.appendChild(prog);
  return { node:svg, set:function(p){ prog.setAttribute('stroke-dashoffset',(c*(1-p)).toFixed(1)); } };
};
})();
