var CACHE='doctalk-1';
var ASSETS=['./','./index.html','./app.css','./manifest.webmanifest',
  './js/core.js','./js/orb.js','./js/speech.js','./js/interview.js',
  './js/card.js','./js/scan.js','./js/app.js',
  './icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png','./icons/favicon-32.png'];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS).catch(function(){}); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ return k===CACHE ? null : caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('message', function(e){ if(e.data==='skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', function(e){
  if(e.request.method!=='GET') return;
  if(new URL(e.request.url).origin!==location.origin) return;
  e.respondWith(
    fetch(e.request).then(function(res){
      var copy=res.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copy); }).catch(function(){});
      return res;
    }).catch(function(){
      return caches.match(e.request).then(function(r){ return r || caches.match('./index.html'); });
    })
  );
});
