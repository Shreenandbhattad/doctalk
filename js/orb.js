(function(){
'use strict';
var B=window.DT;

// value noise, enough for a slowly deforming blob
function mkNoise(){
    var p=new Uint8Array(512), i;
  for(i=0;i<256;i++) p[i]=i;
  for(i=255;i>0;i--){ var j=(Math.random()*(i+1))|0, t=p[i]; p[i]=p[j]; p[j]=t; }
  for(i=0;i<256;i++) p[i+256]=p[i];
  function fade(t){ return t*t*t*(t*(t*6-15)+10); }
  function lerp(a,b,t){ return a+t*(b-a); }
  function grad(h,x,y){
    switch(h&3){ case 0: return x+y; case 1: return -x+y; case 2: return x-y; default: return -x-y; }
  }
  return function(x,y){
    var X=Math.floor(x)&255, Y=Math.floor(y)&255;
    x-=Math.floor(x); y-=Math.floor(y);
    var u=fade(x), v=fade(y);
    var aa=p[p[X]+Y], ab=p[p[X]+Y+1], ba=p[p[X+1]+Y], bb=p[p[X+1]+Y+1];
    return lerp(lerp(grad(aa,x,y), grad(ba,x-1,y), u),
                lerp(grad(ab,x,y-1), grad(bb,x-1,y-1), u), v);
  };
}

B.Orb=function(host, opts){
  opts=opts||{};
  var size=opts.size||230;
  var dpr=Math.min(window.devicePixelRatio||1, 2);
  var cv=document.createElement('canvas');
  cv.width=size*dpr; cv.height=size*dpr;
  cv.style.width=size+'px'; cv.style.height=size+'px';
  host.appendChild(cv);
  var ctx=cv.getContext('2d');
  var noise=mkNoise();

  var t=0, amp=0, target=0, alive=true, raf=null, listening=false;
  var cs=getComputedStyle(document.documentElement);
  function tok(n,f){ var v=cs.getPropertyValue(n).trim(); return v||f; }
  var leaf=tok('--leaf','#2F8F5B'), sage=tok('--sage','#9BD7B0'), tint=tok('--tint','#E8F5EC');

  function refreshTokens(){
    cs=getComputedStyle(document.documentElement);
    leaf=tok('--leaf','#2F8F5B'); sage=tok('--sage','#9BD7B0'); tint=tok('--tint','#E8F5EC');
  }

  function blobPath(cx,cy,base,wob,phase){
    ctx.beginPath();
    var steps=128;
    for(var i=0;i<=steps;i++){
      var a=(i/steps)*Math.PI*2;
      var nx=Math.cos(a)*0.9, ny=Math.sin(a)*0.9;
      var n=noise(nx*1.6+phase, ny*1.6+phase*0.7);
      var r=base*(1 + n*wob + Math.sin(a*3+phase*2)*wob*0.22);
      var x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath();
  }

  function frame(){
    if(!alive) return;
    raf=requestAnimationFrame(frame);
    amp += (target-amp)*0.14;
    t += B.reduced ? 0 : 0.0065;

    var W=cv.width, H=cv.height, cx=W/2, cy=H/2;
    ctx.clearRect(0,0,W,H);
    var breath = B.reduced ? 0 : Math.sin(t*1.9)*0.022;
    var base = (Math.min(W,H)/2) * (0.60 + breath + amp*0.16);

        var g0=ctx.createRadialGradient(cx,cy,base*0.5,cx,cy,base*1.75);
    g0.addColorStop(0, hexa(sage, 0.30+amp*0.3));
    g0.addColorStop(1, hexa(sage, 0));
    ctx.fillStyle=g0;
    ctx.beginPath(); ctx.arc(cx,cy,base*1.75,0,6.2832); ctx.fill();

        ctx.save();
    blobPath(cx,cy,base, 0.055+amp*0.07, t*1.1);
    ctx.clip();
    var g1=ctx.createRadialGradient(cx-base*0.36, cy-base*0.42, base*0.08, cx, cy, base*1.25);
    g1.addColorStop(0, hexa(tint,.98));
    g1.addColorStop(0.34, hexa(sage,.96));
    g1.addColorStop(1, hexa(leaf,1));
    ctx.fillStyle=g1;
    ctx.fillRect(cx-base*2, cy-base*2, base*4, base*4);

        var k;
    for(k=0;k<3;k++){
      var ph=t*(0.6+k*0.33)+k*2.1;
      var ox=Math.cos(ph)*base*0.22, oy=Math.sin(ph*1.3)*base*0.2;
      var gi=ctx.createRadialGradient(cx+ox, cy+oy, 0, cx+ox, cy+oy, base*(0.62-k*0.11));
      gi.addColorStop(0, hexa(k===1?tint:sage, 0.26));
      gi.addColorStop(1, hexa(sage, 0));
      ctx.fillStyle=gi;
      ctx.fillRect(cx-base*2, cy-base*2, base*4, base*4);
    }
        var gs=ctx.createRadialGradient(cx-base*0.40, cy-base*0.50, 0, cx-base*0.40, cy-base*0.50, base*0.56);
    gs.addColorStop(0,'rgba(255,255,255,.72)');
    gs.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=gs;
    ctx.fillRect(cx-base*2, cy-base*2, base*4, base*4);
    ctx.restore();

        if(listening && !B.reduced && amp>0.03){
      ctx.lineWidth=Math.max(1, dpr);
      for(k=0;k<3;k++){
        var p=((t*1.4)+(k/3))%1;
        ctx.strokeStyle=hexa(leaf, (1-p)*0.28*Math.min(1,amp*3));
        ctx.beginPath();
        ctx.arc(cx,cy, base*(1.02+p*0.55), 0, 6.2832);
        ctx.stroke();
      }
    }
  }
  function hexa(h,a){
    h=String(h).trim();
    if(h[0]!=='#') return h;
    if(h.length===4) h='#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];
    var v=parseInt(h.slice(1),16);
    return 'rgba('+((v>>16)&255)+','+((v>>8)&255)+','+(v&255)+','+a+')';
  }

  frame();
  return {
    el:cv,
    size:size,
    setAmp:function(v){ target=Math.max(0, Math.min(1, v)); },
    listen:function(on){ listening=!!on; if(!on) target=0; },
    refresh:refreshTokens,
    stop:function(){ alive=false; if(raf) cancelAnimationFrame(raf); }
  };
};

B.ring=function(size){
  var NS='http://www.w3.org/2000/svg';
  var r=size/2-5, c=2*Math.PI*r;
  var svg=document.createElementNS(NS,'svg');
  svg.setAttribute('class','orbring');
  svg.setAttribute('viewBox','0 0 '+size+' '+size);
  svg.setAttribute('width',size);
  svg.setAttribute('height',size);
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
  return {
    node:svg,
    set:function(pct){ prog.setAttribute('stroke-dashoffset',(c*(1-pct)).toFixed(1)); }
  };
};
})();
