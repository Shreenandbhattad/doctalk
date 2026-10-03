const listeners = new WeakMap();
function mk(tag){
  const e = {
    tagName:(tag||'div').toUpperCase(), nodeType:1, children:[], parentNode:null,
    _a:{}, _c:new Set(), _html:'', hidden:false, disabled:false, value:'', textContent:'',
    scrollTop:0, offsetWidth:320, offsetHeight:320,
    style:new Proxy({},{get:(t,k)=> k==='setProperty'||k==='removeProperty'?()=>{}:(t[k]||''), set:(t,k,v)=>{t[k]=v;return true}}),
    dataset:{},
    get innerHTML(){ return this._html; },
    set innerHTML(v){ this._html=String(v); this.children=[]; },
    get classList(){ const s=this._c; return {add:(...c)=>c.forEach(x=>s.add(x)),remove:(...c)=>c.forEach(x=>s.delete(x)),
      toggle:c=>s.has(c)?s.delete(c):s.add(c),contains:c=>s.has(c)}; },
    get className(){ return [...this._c].join(' '); },
    set className(v){ this._c=new Set(String(v).split(/\s+/).filter(Boolean)); },
    get firstElementChild(){ return this.children[0]||null; },
    get firstChild(){ return this.children[0]||null; },
    appendChild(c){ c.parentNode=this; this.children.push(c); return c; },
    removeChild(c){ const i=this.children.indexOf(c); if(i>-1) this.children.splice(i,1); return c; },
    remove(){ if(this.parentNode) this.parentNode.removeChild(this); },
    setAttribute(k,v){ this._a[k]=String(v); },
    getAttribute(k){ return k in this._a ? this._a[k] : null; },
    removeAttribute(k){ delete this._a[k]; },
    addEventListener(t,f){ let m=listeners.get(this); if(!m){ m={}; listeners.set(this,m); } m[t]=f; },
    removeEventListener(){},
    click(){ const m=listeners.get(this)||{}; if(m.click) m.click({target:this,preventDefault(){},stopPropagation(){}}); },
    fire(t,ev){ const m=listeners.get(this)||{}; if(m[t]) m[t](Object.assign({target:this,preventDefault(){},stopPropagation(){}},ev||{})); },
    focus(){}, blur(){},
    getBoundingClientRect(){ return {left:0,top:0,width:320,height:320}; },
    getTotalLength(){ return 100; },
    querySelector(sel){ return find(this, sel); },
    querySelectorAll(sel){ return findAll(this, sel); },
    setPointerCapture(){}, releasePointerCapture(){}
  };
  if((tag||'').toLowerCase()==='canvas'){
    e.width=0; e.height=0;
    e.getContext=()=>({
      clearRect(){},fillRect(){},beginPath(){},closePath(){},arc(){},ellipse(){},moveTo(){},lineTo(){},
      quadraticCurveTo(){},rect(){},fill(){},stroke(){},save(){},restore(){},scale(){},translate(){},
      setLineDash(){},fillText(){},drawImage(){},clip(){},
      getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(Math.max(4,w*h*4))}),
      createRadialGradient:()=>({addColorStop(){}}), createLinearGradient:()=>({addColorStop(){}}),
      imageSmoothingQuality:'high',
      set fillStyle(v){}, set strokeStyle(v){}, set lineWidth(v){}, set globalAlpha(v){}, set font(v){}, set lineCap(v){}
    });
    e.toDataURL=()=>'data:image/png;base64,AA';
  }
  return e;
}
const ALL=[];
function walk(root,out){ (root.children||[]).forEach(c=>{ out.push(c); walk(c,out); }); return out; }
function matches(e,sel){
  if(sel[0]==='#') return e._a.id===sel.slice(1);
  if(sel[0]==='.') return e._c.has(sel.slice(1));
  return e.tagName===sel.toUpperCase();
}
function find(root,sel){ const o=walk(root,[]); for(const e of o) if(matches(e,sel)) return e; return null; }
function findAll(root,sel){ return walk(root,[]).filter(e=>matches(e,sel)); }
global.__mk=mk; global.__findAll=findAll; global.__find=find;

const store={};
global.localStorage={getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]},
  get length(){return Object.keys(store).length}, key:i=>Object.keys(store)[i]};
Object.defineProperty(global.localStorage,'__keys',{get:()=>Object.keys(store)});

const docEl=mk('html'), body=mk('body');
global.document={
  documentElement:docEl, body:body, head:mk('head'),
  createElement:mk, createElementNS:(ns,t)=>mk(t),
  getElementById:id=>find(body,'#'+id),
  querySelector:sel=>find(body,sel)||(matches(docEl,sel)?docEl:null),
  querySelectorAll:sel=>findAll(body,sel),
  addEventListener(){}, removeEventListener(){}, hidden:false, createRange:()=>({selectNodeContents(){}})
};
global.window={
  addEventListener(){}, removeEventListener(){}, scrollTo(){},
  matchMedia:()=>({matches:false,addEventListener(){},addListener(){}}),
  getSelection:()=>({removeAllRanges(){},addRange(){}}),
  devicePixelRatio:2, open(){},
  XMLSerializer:function(){ this.serializeToString=()=>'<svg/>'; }
};
global.XMLSerializer=global.window.XMLSerializer;
global.getComputedStyle=()=>({getPropertyValue:()=>'#2F8F5B'});
global.navigator={clipboard:{writeText:()=>Promise.resolve()}, vibrate(){}, mediaDevices:null};
const q=[];
global.requestAnimationFrame=cb=>{ q.push(cb); return q.length; };
global.cancelAnimationFrame=()=>{};
global.__flush=(n)=>{ for(let i=0;i<(n||4);i++){ q.splice(0).forEach(cb=>{ try{cb(16)}catch(e){console.log('  raf error:',e.message)} }); } };
global.performance={now:()=>Date.now()};
global.Image=function(){ const s=this; this.onload=null; this.onerror=null; this.width=320; this.height=320;
  Object.defineProperty(this,'src',{set(){ if(s.onload) setTimeout(()=>s.onload(),0); }}); };
global.FileReader=function(){ const s=this; this.readAsDataURL=()=>{ s.result='data:,'; if(s.onload) setTimeout(()=>s.onload(),0); }; };
global.SpeechSynthesisUtterance=function(){};
