// Primoris Academy — camada de plataforma: login Google (Supabase Auth), banco em tempo real e downloads.
// Expõe a mesma interface usada pelo app (doc/collection/onSnapshot, user, downloads).
const CFG = {
  url: 'https://wgwhgcnbkwwrzaovsmij.supabase.co',
  key: 'sb_publishable_ZxdqayqHFgOWTgkDpqekLA_BqGGi3sn',
  lib: 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm',
};
let sb = null, session = null, info = { role: null, owner: false };

// No claude.ai (piloto), usa a conta Claude e o banco do próprio artefato.
export const noClaude = () => !!window.claude?.use;
export async function init() {
  if (noClaude()) { document.documentElement.classList.add('claude-mode'); return { claude: true }; }
  const { createClient } = await import(CFG.lib);
  sb = createClient(CFG.url, CFG.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' } });
  const { data } = await sb.auth.getSession();
  session = data.session;
  sb.auth.onAuthStateChange((ev, s) => { session = s; if (ev === 'SIGNED_OUT') location.reload(); });
  if (session) {
    const [o, r] = await Promise.all([sb.rpc('is_owner'), sb.rpc('my_role')]);
    info = { owner: !!o.data, role: r.data || null };
    if (location.search.includes('code=')) history.replaceState(null, '', location.pathname + location.hash);
  }
  return session;
}
export const entrarComGoogle = () => sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname, queryParams: { prompt: 'select_account' } } });
export const sair = () => sb.auth.signOut();

// ---------- Banco
const erro = e => ({ code: /42501|row-level|permission/i.test(`${e?.code} ${e?.message}`) || e?.code === 'P0002' ? 'invalid_argument' : 'unavailable', message: e?.message || 'Erro de rede' });
const cache = new Map(); // col -> Map(id -> data)
const listeners = new Set();
const colCache = col => { if (!cache.has(col)) cache.set(col, new Map()); return cache.get(col); };
const clone = v => (v == null ? v : JSON.parse(JSON.stringify(v)));
const deepMerge = (a, b) => { if (!a || typeof a !== 'object' || Array.isArray(a) || !b || typeof b !== 'object' || Array.isArray(b)) return b; const o = { ...a }; for (const k of Object.keys(b)) o[k] = k in a ? deepMerge(a[k], b[k]) : b[k]; return o; };
const meta = { fromCache: false, hasPendingWrites: false };
const snap = (id, data) => ({ id, exists: data !== undefined, data: () => clone(data), metadata: meta });
const notifyCol = col => listeners.forEach(l => { if (l.col === col) l.emit(); });
const splitPath = p => { const s = p.split('/'); return { col: s.slice(0, -1).join('/'), id: s.at(-1) }; };

let channel = null, primeiraConexao = true;
function realtime() {
  if (channel) return;
  channel = sb.channel('docs-all').on('postgres_changes', { event: '*', schema: 'public', table: 'docs' }, p => {
    if (p.eventType === 'DELETE') { const { col, id } = splitPath(p.old.path); colCache(col).delete(id); notifyCol(col); }
    else { const r = p.new; colCache(r.col).set(r.id, r.data); notifyCol(r.col); }
  }).subscribe(status => {
    if (status === 'SUBSCRIBED') { if (!primeiraConexao) listeners.forEach(l => l.refetch()); primeiraConexao = false; }
  });
}
async function fetchRows(col, filters, order, lim) {
  const out = []; const page = 1000;
  for (let from = 0; ; from += page) {
    let q = sb.from('docs').select('id,data').eq('col', col);
    filters.forEach(([f, op, v]) => { const k = `data->>${f}`; if (op === '==') q = q.eq(k, String(v)); else if (op === '!=') q = q.neq(k, String(v)); else if (op === 'in') q = q.in(k, v.map(String)); });
    if (order) q = q.order(`data->>${order[0]}`, { ascending: order[1] !== 'desc' });
    q = q.range(from, from + Math.min(page, lim || page) - 1);
    const { data, error } = await q; if (error) throw erro(error);
    out.push(...data); if (data.length < page || (lim && out.length >= lim)) break;
  }
  return out;
}
const match = (d, filters) => filters.every(([f, op, v]) => { const x = d?.[f]; return op === '==' ? x === v : op === '!=' ? x !== v : op === 'in' ? v.includes(x) : op === 'array-contains' ? (x || []).includes(v) : true; });

function query(col, filters = [], order = null, lim = null) {
  const run = () => {
    let rows = [...colCache(col).entries()].filter(([, d]) => match(d, filters));
    if (order) rows.sort((a, b) => String(a[1]?.[order[0]] ?? '').localeCompare(String(b[1]?.[order[0]] ?? '')) * (order[1] === 'desc' ? -1 : 1));
    if (lim) rows = rows.slice(0, lim);
    const docs = rows.map(([id, d]) => snap(id, d));
    return { docs, size: docs.length, empty: !docs.length, docChanges: () => [], metadata: meta };
  };
  return {
    where: (f, op, v) => query(col, [...filters, [f, op, v]], order, lim),
    orderBy: (f, dir) => query(col, filters, [f, dir], lim),
    limit: n => query(col, filters, order, n),
    async get() { const rows = await fetchRows(col, filters, order, lim); rows.forEach(r => colCache(col).set(r.id, r.data)); return run(); },
    onSnapshot(next, onErr) {
      realtime();
      let ready = false;
      const l = { col, emit: () => { if (ready) next(run()); }, refetch: () => fetchRows(col, filters, order, lim).then(rows => { rows.forEach(r => colCache(col).set(r.id, r.data)); ready = true; next(run()); }).catch(e => onErr?.(erro(e))) };
      listeners.add(l); l.refetch();
      return () => listeners.delete(l);
    },
  };
}
const rid = () => (crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '').slice(0, 20) : Math.random().toString(36).slice(2) + Date.now().toString(36));
function docRef(path) {
  const { col, id } = splitPath(path);
  return {
    id, path,
    async get() { const { data, error } = await sb.from('docs').select('data').eq('path', path).maybeSingle(); if (error) throw erro(error); if (data) colCache(col).set(id, data.data); return snap(id, data?.data); },
    async set(d) { const prev = colCache(col).get(id); colCache(col).set(id, clone(d)); notifyCol(col); const { error } = await sb.from('docs').upsert({ path, col, id, data: d, updated_at: new Date().toISOString() }); if (error) { if (prev === undefined) colCache(col).delete(id); else colCache(col).set(id, prev); notifyCol(col); throw erro(error); } },
    async update(d) { const prev = colCache(col).get(id); if (prev !== undefined) { colCache(col).set(id, deepMerge(prev, clone(d))); notifyCol(col); } const { error } = await sb.rpc('doc_update', { p_path: path, p_patch: d }); if (error) { if (prev !== undefined) { colCache(col).set(id, prev); notifyCol(col); } throw erro(error); } },
    async delete() { const prev = colCache(col).get(id); colCache(col).delete(id); notifyCol(col); const { error } = await sb.from('docs').delete().eq('path', path); if (error) { if (prev !== undefined) colCache(col).set(id, prev); notifyCol(col); throw erro(error); } },
    onSnapshot(next, onErr) {
      realtime();
      let ready = false;
      const l = { col, emit: () => { if (ready) next(snap(id, colCache(col).get(id))); }, refetch: () => sb.from('docs').select('data').eq('path', path).maybeSingle().then(({ data, error }) => { if (error) throw error; if (data) colCache(col).set(id, data.data); else colCache(col).delete(id); ready = true; next(snap(id, data?.data)); }).catch(e => onErr?.(erro(e))) };
      listeners.add(l); l.refetch();
      return () => listeners.delete(l);
    },
    collection: c => collRef(path + '/' + c),
  };
}
const collRef = col => ({ ...query(col), path: col, doc: id => docRef(col + '/' + (id || rid())), add: async d => { const r = docRef(col + '/' + rid()); await r.set(d); return r; } });
const db = { doc: docRef, collection: collRef };

// ---------- Usuário
const user = {
  id: async () => session?.user?.id || null,
  isOwner: () => info.owner,
  canEdit: () => ['admin', 'superadmin'].includes(info.role) || info.owner,
  can: () => true,
  me: async () => { const u = session?.user; const m = u?.user_metadata || {}; return { id: u?.id, name: m.full_name || m.name || '', email: u?.email || '', avatar: m.avatar_url || m.picture || '' }; },
  profiles: async () => ({}),
};

// ---------- Downloads
const downloads = {
  save: async ({ filename, data, mimeType = 'text/plain' }) => {
    const url = URL.createObjectURL(new Blob([data], { type: mimeType + ';charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: filename }); document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  },
};

export const use = async name => (noClaude() ? window.claude.use(name) : session ? { db, user, downloads }[name] || null : null);
