// Primoris Academy — service worker: abertura rápida (cache do app) e notificações push.
const VERSAO = 'primoris-v4';
const APP = ['./', 'index.html', 'css/app.css', 'js/app.js', 'js/core.js', 'js/views.js', 'js/platform.js', 'js/views2.js', 'js/views3.js', 'manifest.webmanifest', 'icons/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Arquivos do app: mostra a versão salva na hora e atualiza em segundo plano.
// Bibliotecas e fontes externas: cache permanente. Banco de dados: sempre rede.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.hostname.endsWith('supabase.co')) return;
  const externo = url.origin !== location.origin;
  if (externo && !/jsdelivr|gstatic|googleapis/.test(url.hostname)) return;
  const p = caches.open(VERSAO).then(async c => {
    const salvo = await c.match(e.request, { ignoreSearch: !externo });
    const rede = (externo && salvo) ? null : fetch(e.request).then(r => { if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r; });
    return { salvo, rede };
  });
  e.respondWith(p.then(x => x.salvo || x.rede));
  e.waitUntil(p.then(x => x.rede && x.rede.catch(() => {})));
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
