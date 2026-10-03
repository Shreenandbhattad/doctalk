(function(){
'use strict';
var B=window.DT;

// shared element morph: measure, render, invert, play
B.flip=function(sel, render, ms){
  var from=document.querySelector(sel);
  var a=from?from.getBoundingClientRect():null;
  render();
  var to=document.querySelector(sel);
  if(!a||!to||B.reduced) return;
  var b=to.getBoundingClientRect();
  if(!b.width||!a.width) return;
  var dx=a.left-b.left, dy=a.top-b.top, s=a.width/b.width;
  if(Math.abs(dx)<1 && Math.abs(dy)<1 && Math.abs(s-1)<0.01) return;
  to.style.transformOrigin='top left';
  to.style.transition='none';
  to.style.transform='translate('+dx+'px,'+dy+'px) scale('+s+')';
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      to.style.transition='transform '+(ms||620)+'ms cubic-bezier(.2,.9,.26,1)';
      to.style.transform='none';
      setTimeout(function(){ to.style.transition=''; to.style.transformOrigin=''; }, (ms||620)+40);
    });
  });
};

B.reveal=function(host, opts){
  if(B.reduced) return;
  opts=opts||{};
  var step=opts.step||70, start=opts.start||60, from=opts.from||14;
  var nodes=opts.nodes||host.children;
  Array.prototype.forEach.call(nodes, function(n,i){
    if(i>13) return;
    n.style.opacity='0';
    n.style.transform='translateY('+from+'px)';
    n.style.transition='opacity .62s cubic-bezier(.17,.84,.36,1) '+(start+i*step)+'ms, transform .62s cubic-bezier(.17,.84,.36,1) '+(start+i*step)+'ms';
  });
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      Array.prototype.forEach.call(nodes, function(n,i){
        if(i>13) return;
        n.style.opacity=''; n.style.transform='';
      });
    });
  });
};

B.typeOut=function(node, text, ms){
  if(B.reduced){ node.textContent=text; return; }
  node.textContent='';
  var i=0, step=Math.max(14, (ms||900)/Math.max(1,text.length));
  (function tick(){
    if(i>text.length) return;
    node.textContent=text.slice(0,i);
    i++;
    setTimeout(tick, step);
  })();
};
})();
