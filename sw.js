// Primoris Academy — service worker: abertura rápida (cache do app) e notificações push.
const VERSAO = 'primoris-v18';
const APP = ['./', 'index.html', 'css/app.css', 'js/app.js', 'js/core.js', 'js/views.js', 'js/platform.js', 'js/views2.js', 'js/views3.js', 'manifest.webmanifest', 'icons/icon-192.png', 'img/coroa-240.webp', 'img/coroa-64.webp', 'img/coroa-640.webp', 'img/equipe.jpg', 'img/favicon-64.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(APP.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Página: sempre busca a versão mais nova na internet (usa a salva só se estiver sem conexão).
// Arquivos versionados (?v=N), bibliotecas e fontes: cache, porque cada versão nova tem um endereço novo.
// Banco de dados: sempre rede.
self.addEventListener('fetch', e => {
  const req = e.request; const url = new URL(req.url);
  if (req.method !== 'GET' || url.hostname.endsWith('supabase.co')) return;
  const externo = url.origin !== location.origin;
  if (externo && !/jsdelivr|gstatic|googleapis/.test(url.hostname)) return;
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const c = await caches.open(VERSAO);
      try { const r = await fetch(req.url, { cache: 'no-store', credentials: 'same-origin' }); if (r.ok) c.put('index.html', r.clone()); return r; }
      catch (x) { return (await c.match('index.html')) || (await c.match('./')) || Response.error(); }
    })());
    return;
  }
  e.respondWith((async () => {
    const c = await caches.open(VERSAO);
    const salvo = await c.match(req);
    if (salvo) return salvo;
    const r = await fetch(req);
    if (r.ok || r.type === 'opaque') c.put(req, r.clone());
    return r;
  })());
});

self.addEventListener('push', e => {
  let d = {}; try { d = e.data.json(); } catch (x) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Primoris Academy', {
    body: d.body || '', icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', data: { link: d.link || '' }, tag: d.link || 'primoris', renotify: true,
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const alvo = new URL('./' + (e.notification.data.link ? '#' + e.notification.data.link : ''), self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    const c = cs.find(x => x.url.startsWith(self.registration.scope));
    if (c) { c.navigate(alvo); return c.focus(); }
    return self.clients.openWindow(alvo);
  }));
});
