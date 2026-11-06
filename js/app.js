// Primoris Academy — inicialização, sincronização com o banco, eventos e ações.
import * as C from './core.js?v=27';
import * as V from './views.js?v=27';
import * as P from './platform.js?v=27';
import * as V2 from './views2.js?v=27';
import * as V3 from './views3.js?v=27';
import * as B from './biblioteca.js?v=27';
const { S, esc, list, nowISO, today, dayOf, addDays, put, upd, del, add, merge, audit, notify, normPhone, parseMoney, me, role, isAdmin, isGestor, nome, prog } = C;

const $app = document.getElementById('app');
const $modal = document.getElementById('modal-root');
const $toast = document.getElementById('toast');

// ---------- Toast e modal
let toastT;
const toast = (msg, tone = '') => { $toast.className = 'show ' + tone; $toast.textContent = msg; clearTimeout(toastT); toastT = setTimeout(() => ($toast.className = ''), 3600); };
const M = { refresh: null };
function modal(title, html, { wide = false, refresh = null } = {}) {
  $modal.innerHTML = `<div class="modal-bg" data-close-bg><div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header><h3>${esc(title)}</h3><button class="iconbtn" data-close aria-label="Fechar">${V.ic('x')}</button></header><div class="modal-b">${html}</div></div></div>`;
  M.refresh = refresh; M.title = title;
  setTimeout(() => $modal.querySelector('input:not([type=hidden]):not([type=checkbox]),select,textarea,button')?.focus(), 30);
}
const closeModal = () => { $modal.innerHTML = ''; M.refresh = null; };
const confirmar = (titulo, texto, rotulo = 'Confirmar') => new Promise(res => {
  modal(titulo, `<p>${esc(texto)}</p><div class="row-a"><button class="btn accent" id="ok">${esc(rotulo)}</button><button class="btn" id="no">Cancelar</button></div>`);
  $modal.querySelector('#ok').onclick = () => { closeModal(); res(true); };
  $modal.querySelector('#no').onclick = () => { closeModal(); res(false); };
});
const pedirTexto = (titulo, label, { obrigatorio = true, opcoes = null } = {}) => new Promise(res => {
  modal(titulo, `<form id="pt" class="form-grid">${opcoes ? `<label class="field span2"><span>Motivo</span><select id="f-op" name="op">${opcoes.map(o => `<option>${esc(o)}</option>`).join('')}</select></label>` : ''}<label class="field span2"><span>${esc(label)}</span><textarea id="f-pt" name="t" rows="3" ${obrigatorio && !opcoes ? 'required' : ''}></textarea></label><div class="span2 row-a"><button class="btn accent">Confirmar</button></div></form>`);
  $modal.querySelector('#pt').onsubmit = e => { e.preventDefault(); const f = new FormData(e.target); closeModal(); res([f.get('op'), f.get('t')].filter(Boolean).join(' — ')); };
});
const errMsg = e => {
  const c = e?.code;
  if (c === 'invalid_argument') return 'O banco recusou esta ação. Verifique se seu acesso permite (administradores precisam de acesso de Editor no link).';
  if (c === 'quota_exceeded') return 'O limite de armazenamento do piloto foi atingido. Fale com o administrador.';
  if (c === 'resource_exhausted') return 'Muitas ações em sequência. Aguarde alguns segundos e tente de novo.';
  if (c === 'revoked') return 'Seu acesso a esta página foi alterado. Recarregue a página.';
  return e?.message || 'Não foi possível salvar. Tente novamente.';
};
const run = async (fn, ok) => { try { const r = await fn(); if (ok) toast(ok, 'ok'); return r; } catch (e) { console.error(e); toast(errMsg(e), 'bad'); throw e; } };

// ---------- Renderização
let rq = false, deferred = false;
B.ligar(() => render(true), (m, t) => toast(m, t), c => modal('Adicionar à carteira', V.contatoForm(c), { wide: true }), prospectarEmpresa);
const schedule = () => { if (rq) return; rq = true; requestAnimationFrame(() => { rq = false; render(); }); };
function editing() { const a = document.activeElement; return a && $app.contains(a) && a.matches('input:not([type=checkbox]):not([type=radio]),textarea,select') && !a.dataset.filter; }
const SPLASH_MS = 10000; let splashT = null;
function splashAtivo() {
  const rest = SPLASH_MS - performance.now(); if (rest <= 0 || S.fatal) return false;
  if (!$app.querySelector('.boot.splash')) $app.innerHTML = V.loading(undefined, true);
  if (!splashT) { const tick = setInterval(() => { const el = document.getElementById('boot-pct'); if (el) el.textContent = Math.min(100, Math.floor(performance.now() / (SPLASH_MS / 100))) + '%'; }, 100); splashT = setTimeout(() => { clearInterval(tick); const b = $app.querySelector('.boot.splash'); if (b) { b.classList.add('saindo'); setTimeout(() => { S.animNext = true; render(true); }, 380); } else render(true); }, rest); }
  return true;
}
function render(force = false) {
  if (splashAtivo()) return;
  if (!force && editing()) { deferred = true; return; }
  if (!force && S.view === 'academy' && document.querySelector('.player iframe')) { deferred = true; return; }
  deferred = false;
  const y = window.scrollY;
  $app.innerHTML = screen();
  window.scrollTo(0, y);
  if (S.animNext && S.dataReady) { S.animNext = false; animarEntrada(); }
  afterRender();
  const ae = document.activeElement;
  if (M.refresh && !($modal.contains(ae) && ae.matches('input,textarea,select'))) { const b = $modal.querySelector('.modal-b'); const h = M.refresh(); if (b && h != null) b.innerHTML = h; }
}
function screen() {
  if (S.fatal) return V.fatal(S.fatal);
  if (S.login) return V.login();
  if (!S.ready || !S.membersLoaded) return V.loading();
  const m = me();
  if (!m) return V.solicitarAcesso();
  if ((m.status || 'ativo') !== 'ativo') return V.bloqueado();
  if (!S.dataReady) return V.loading('Sincronizando seus dados…');
  if (!prog(S.uid).welcomeDone && role() === 'consultor') return V.boasVindas();
  const views = { jornada: V3.jornada, biblioteca: V3.biblioteca, 'minhas-vendas': V3.minhasVendas, eventos: V3.eventos, forum: V3.forum, resumo: V2.resumo, inicio: V.inicio, 'semana-zero': () => V.semanaZero(), academy: V.academy, carteira: V3.carteiraHub, agenda: V.agenda, plano: V.plano, vendas: V.vendas, carreira: () => V.carreira(), conquistas: V.conquistas, equipe: V.equipe, relatorios: V.relatorios, admin: V.admin };
  let v = S.view;
  if (['equipe', 'relatorios'].includes(v) && !isGestor()) v = 'inicio';
  if (v === 'admin' && !isAdmin()) v = 'inicio';
  return V.shell((views[v] || V.inicio)());
}
const REDUZ = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function animarEntrada() {
  const v = document.getElementById('view'); if (!v || REDUZ) return;
  v.classList.add('enter');
  const els = [...v.querySelectorAll('[data-n]')]; const t0 = performance.now(); const dur = 700;
  const fmt = (n, f) => (f === 'brl' ? C.brlShort(n) : f === 'pct' ? Math.round(n) + '%' : C.num(Math.round(n)));
  const step = t => { const k = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - k, 3); els.forEach(el => { if (el.isConnected) el.textContent = fmt(Number(el.dataset.n) * e, el.dataset.f); }); if (k < 1) requestAnimationFrame(step); };
  if (els.length) requestAnimationFrame(step);
}
let ytApi = null, ytTimer = null, ytPlayer = null;
function carregarYT() { if (ytApi) return ytApi; ytApi = new Promise(res => { window.onYouTubeIframeAPIReady = () => res(window.YT); const sc = document.createElement('script'); sc.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(sc); }); return ytApi; }
function montarVideo() {
  const el = document.getElementById('yt-player'); clearInterval(ytTimer);
  if (!el || el.dataset.tipo !== 'youtube' || el.dataset.ok) return; el.dataset.ok = '1';
  const { video, curso, aula, pos } = el.dataset; let ultimo = Number(pos) || 0;
  const salvar = (t, dur) => { if (Math.abs(t - ultimo) < 10 && !(dur && t / dur > 0.9)) return; ultimo = t; const patch = { videoPos: { [curso]: { [aula]: Math.floor(t) } } }; if (dur && t / dur >= 0.9 && !prog(S.uid).aulas?.[curso]?.[aula]) patch.aulas = { [curso]: { [aula]: nowISO() } }; merge('progresso/' + S.uid, patch, S.progresso[S.uid]).catch(() => {}); };
  carregarYT().then(YT => { if (!el.isConnected) return; ytPlayer = new YT.Player(el, { videoId: video, playerVars: { start: Math.max(0, Math.floor(ultimo) - 3), rel: 0, modestbranding: 1, playsinline: 1 }, events: { onStateChange: ev => { if (ev.data === YT.PlayerState.ENDED) salvar(ytPlayer.getDuration(), ytPlayer.getDuration()); } } }); ytTimer = setInterval(() => { if (!document.getElementById(ytPlayer?.getIframe?.()?.id || '') && !ytPlayer?.getIframe?.()?.isConnected) { clearInterval(ytTimer); return; } try { if (ytPlayer.getPlayerState?.() === 1) salvar(ytPlayer.getCurrentTime(), ytPlayer.getDuration()); } catch (e) { /* */ } }, 5000); });
}
function afterRender() {
  montarVideo(); checarMarcos();
  ligarDigitando();
  const sim = document.getElementById('sim'); if (sim) document.getElementById('sim-out').innerHTML = V.simCalc(Object.fromEntries(new FormData(sim)));
  if (S.focusFilter) { const el = document.querySelector(`[data-filter="${S.focusFilter}"]`); if (el) { el.focus(); const n = el.value.length; try { el.setSelectionRange(n, n); } catch (e) { /* */ } } S.focusFilter = null; }
}
document.addEventListener('focusout', () => setTimeout(() => { if (deferred && !editing()) render(); }, 0));

// ---------- Rotas
const ALIAS = { plano: ['jornada', 'jTab', 'plano'], vendas: ['jornada', 'jTab', 'milhao'], carreira: ['jornada', 'jTab', 'carreira'], conquistas: ['jornada', 'jTab', 'conquistas'], 'minhas-vendas': ['carteira', 'cTab', 'vendas'], comissoes: ['carteira', 'cTab', 'comissoes'] };
function route() {
  let h = (location.hash || '#inicio').slice(1) || 'inicio';
  if (ALIAS[h]) { const [dest, k, t] = ALIAS[h]; S.sub[k] = t; history.replaceState(null, '', '#' + dest); h = dest; }
  S.animNext = true;
  if (h !== S.view) { S.view = h; if (h !== 'academy') S.sub.curso = null; if (h !== 'equipe') S.sub.perfil = null; S.sub.szDia = null; window.scrollTo(0, 0); }
  document.getElementById('side')?.classList.remove('open');
  render(true);
}
window.addEventListener('hashchange', route);

// ---------- Sincronização
const unsubs = {};
function sub(key, ref, onData) {
  if (unsubs[key]) return;
  let first = true;
  const timer = setTimeout(() => { if (first) { S.stale = true; schedule(); } }, 10000);
  unsubs[key] = ref.onSnapshot(snap => {
    if (!snap.metadata?.fromCache) { clearTimeout(timer); if (S.stale) S.stale = false; }
    first = false; onData(snap); schedule();
  }, err => { clearTimeout(timer); console.warn(key, err); if (err.code === 'revoked') S.fatal = 'Seu acesso a esta página foi alterado. Recarregue a página.'; schedule(); });
}
const toMap = snap => { const o = {}; snap.docs.forEach(d => { o[d.id] = { ...d.data(), id: d.id }; }); return o; };
const stop = keys => keys.forEach(k => { unsubs[k]?.(); delete unsubs[k]; });

let dataRole = null;
function startData() {
  const r = role(); if (dataRole === r) return;
  if (dataRole) stop(Object.keys(unsubs).filter(k => k.startsWith('d:')));
  dataRole = r; const mine = r === 'consultor'; const db = S.db; const uid = S.uid;
  const own = c => (mine ? db.collection(c).where('ownerId', '==', uid) : db.collection(c));
  let pending = 0; const ready = () => { if (--pending <= 0 && !S.dataReady) { S.dataReady = true; S.animNext = true; } };
  const track = (key, ref, fn) => { pending++; let done = false; sub(key, ref, s => { fn(s); if (!done) { done = true; ready(); } }); };
  ['contatos', 'atividades', 'reunioes', 'vendas', 'tarefas'].forEach(c => track('d:' + c, own(c), s => { S[c] = toMap(s); }));
  track('d:validacoes', db.collection('validacoes'), s => { S.validacoes = toMap(s); });
  track('d:forum', db.collection('forum'), s => { S.forum = toMap(s); });
  track('d:eventos', db.collection('eventos'), s => { S.eventos = toMap(s); });
  track('d:inscricoes', mine ? db.collection('inscricoes').where('ownerId', '==', uid) : db.collection('inscricoes'), s => { S.inscricoes = toMap(s); });
  track('d:forum_resp', db.collection('forum_resp'), s => { S.forum_resp = toMap(s); });
  track('d:cursos', db.collection('cursos'), s => { S.cursos = toMap(s); });
  if (mine) track('d:progresso', db.doc('progresso/' + uid), d => { S.progresso = d.exists ? { [uid]: d.data() } : {}; });
  else track('d:progresso', db.collection('progresso'), s => { S.progresso = toMap(s); });
  if (mine) {
    const fb = { a: {}, b: {} }; const mergeFb = () => { S.feedbacks = { ...fb.a, ...fb.b }; };
    track('d:fb1', db.collection('feedbacks').where('para', '==', uid), s => { fb.a = toMap(s); mergeFb(); });
    track('d:fb2', db.collection('feedbacks').where('tipo', '==', 'mural'), s => { fb.b = toMap(s); mergeFb(); });
    track('d:prog', db.collection('progressoes').where('uid', '==', uid), s => { S.progressoes = toMap(s); });
  } else {
    track('d:fb', db.collection('feedbacks'), s => { S.feedbacks = toMap(s); });
    track('d:prog', db.collection('progressoes'), s => { S.progressoes = toMap(s); });
  }
  track('d:notifs', db.collection('notifs').where('to', '==', uid), s => { S.notifs = toMap(s); });
  track('d:pagamentos', mine ? db.collection('pagamentos').where('ownerId', '==', uid) : db.collection('pagamentos'), s => { S.pagamentos = toMap(s); });
  if (r === 'admin' || r === 'superadmin') sub('d:audit', db.collection('audit').orderBy('at', 'desc').limit(200), s => { S.audit = toMap(s); });
  setTimeout(() => { if (!S.dataReady) { S.dataReady = true; S.animNext = true; schedule(); } }, 2500);
}

async function boot() {
  const t = setTimeout(() => { if (!S.db && !S.login) { S.fatal = 'Não foi possível conectar. Verifique sua internet e recarregue a página.'; render(true); } }, 15000);
  let session = null;
  try { session = await P.init(); } catch (e) { console.error(e); clearTimeout(t); S.fatal = 'Não foi possível conectar. Verifique sua internet e recarregue a página.'; return render(true); }
  if (!session) { clearTimeout(t); S.login = true; return render(true); }
  const [db, user] = await Promise.all([P.use('db'), P.use('user')]);
  clearTimeout(t);
  if (!db || !user) { S.login = true; return render(true); }
  S.db = db; S.user = user;
  const [uid, owner, editor, cw, profile] = await Promise.all([user.id(), Promise.resolve(user.isOwner?.()), Promise.resolve(user.canEdit?.()), Promise.resolve(user.can?.('data.write')), user.me().catch(() => null)]);
  S.uid = uid;
  if (!S.uid) { S.fatal = 'Entre na sua conta Claude para acessar a Primoris Academy.'; return render(true); }
  S.owner = !!owner; S.editor = !!editor; S.canWrite = cw !== false; S.profile = profile;
  S.ready = true;
  ['geral', 'semanaZero', 'carreira', 'academy', 'comissoes', 'desafios', 'mensagens', 'metaMes'].forEach(k => sub('cfg:' + k, db.doc('config/' + k), d => { S.config[k] = d.exists ? d.data() : null; }));
  sub('equipes', db.collection('equipes'), s => { S.equipes = toMap(s); });
  sub('solicitacoes', db.collection('solicitacoes'), s => { S.solicitacoes = toMap(s); });
  sub('members', db.collection('members'), async s => {
    S.members = toMap(s); S.membersLoaded = true;
    if (S.owner && !S.members[S.uid] && !S.bootstrapping) {
      S.bootstrapping = true;
      const p = S.profile || {};
      await run(() => put('members/' + S.uid, { nome: p.name || 'Administrador', email: p.email || '', telefone: '', role: 'superadmin', nivel: 0, status: 'ativo', dataEntrada: today(), createdAt: nowISO() })).catch(() => {});
      audit('Superadministrador criado', p.name || '');
    }
    if (me() && (me().status || 'ativo') === 'ativo') startData();
  });
  route();
}

// ---------- Ações de negócio
const hist = (arr, item) => [...(arr || []), item].slice(-50);
async function mudarEtapa(c, para, motivo = '') {
  if ((c.etapa || 'novo') === para) return;
  await upd('contatos/' + c.id, { etapa: para, updatedAt: nowISO(), ultimaInteracao: nowISO(), historico: hist(c.historico, { de: c.etapa || 'novo', para, at: nowISO(), by: S.uid, motivo }) });
}
async function pedirEtapa(id, para) {
  const c = S.contatos[id]; if (!c) return;
  if (para === 'perdido' || para === 'sem_interesse') { const m = await pedirTexto('Motivo', 'Detalhes (opcional)', { opcoes: C.geral().motivosPerda }); if (!m) return schedule(); return run(() => mudarEtapa(c, para, m), 'Contato atualizado'); }
  if (para === 'reuniao_agendada') return abrirReuniao({}, id);
  if (para === 'venda') return abrirVenda({}, id);
  return run(() => mudarEtapa(c, para), 'Etapa atualizada');
}
const abrirContato = id => { const c = S.contatos[id]; if (!c) return toast('Contato não encontrado.', 'bad'); modal(c.nome, V.contatoDetalhe(c), { wide: true, refresh: () => (S.contatos[id] ? V.contatoDetalhe(S.contatos[id]) : null) }); };
const abrirReuniao = (x = {}, contatoId = '') => modal(x.id ? 'Editar compromisso' : 'Novo compromisso', V.reuniaoForm(x, contatoId));
const abrirVenda = (v = {}, contatoId = '') => { if (!C.contatosDe([S.uid]).length) return toast('Cadastre o cliente na sua carteira antes de registrar a venda.', 'warn'); modal(v.id ? 'Corrigir venda' : 'Registrar venda', V.vendaForm(v, contatoId), { wide: true }); };
const registrarAtividade = async (c, tipo, resultado, texto = '') => {
  const anteriores = list(S.atividades).some(a => a.contatoId === c.id && C.PROSPECT_TIPOS.includes(a.tipo));
  await add('atividades', { ownerId: c.ownerId, equipeId: C.equipeDe(c.ownerId), contatoId: c.id, tipo, resultado, texto, followup: anteriores, at: nowISO() });
  const patch = { ultimaInteracao: nowISO(), updatedAt: nowISO() };
  if ((c.etapa || 'novo') === 'novo' && C.PROSPECT_TIPOS.includes(tipo)) { patch.etapa = 'abordagem'; patch.historico = hist(c.historico, { de: 'novo', para: 'abordagem', at: nowISO(), by: S.uid }); }
  await upd('contatos/' + c.id, patch);
  celebrar();
};
let marcosChecados = '';
function checarMarcos() {
  try {
    if (!S.dataReady || !S.uid || !S.members[S.uid] || !S.progresso[S.uid]) return;
    const r = V3.mesAtual(); const val = C.vgv([S.uid], r); const ganhos = V3.marcos().filter(m => val >= m.valor);
    const key = r.mk + ':' + ganhos.length; if (key === marcosChecados) return; marcosChecados = key;
    const ja = Number(prog(S.uid).marcosMes?.[r.mk]) || 0; if (ganhos.length <= ja) return;
    const m = ganhos[ganhos.length - 1];
    merge('progresso/' + S.uid, { marcosMes: { [r.mk]: ganhos.length } }, S.progresso[S.uid]).catch(() => {});
    add('feedbacks', { tipo: 'mural', de: S.uid, texto: `${C.firstName(nome(S.uid))} bateu ${C.brlShort(m.valor)} em VGV no mês e conquistou um brinde!`, equipeId: C.equipeDe(S.uid), auto: true, at: nowISO() }).catch(() => {});
    toast(`Parabéns! Você bateu ${C.brlShort(m.valor)} no mês e conquistou ${m.brinde.toLowerCase() === 'brinde' ? 'um brinde' : m.brinde}!`, 'ok');
    document.querySelector('.metames')?.classList.add('festa');
  } catch (e) { /* opcional */ }
}
async function celebrar() {
  try {
    const t = today(); const p = prog(S.uid); const meta = C.metasDe(S.uid).prospeccoes; const n = C.prospeccoes([S.uid], { from: t, to: t }).length;
    const patch = {};
    if (n >= meta && meta > 0 && p.muralMeta !== t) { patch.muralMeta = t; await add('feedbacks', { tipo: 'mural', de: S.uid, texto: `${C.firstName(nome(S.uid))} bateu a meta de ${meta} prospecções hoje!`, equipeId: C.equipeDe(S.uid), auto: true, at: nowISO() }); toast(`Meta do dia batida: ${n} prospecções!`, 'ok'); }
    for (const d of C.desafioAtivo()) { if (C.desafioProgresso(S.uid, d).ok && !p.desafiosOk?.[d.id]) { patch.desafiosOk = { ...(patch.desafiosOk || {}), [d.id]: nowISO() }; await add('feedbacks', { tipo: 'mural', de: S.uid, texto: `${C.firstName(nome(S.uid))} cumpriu o desafio “${d.titulo}”!`, equipeId: C.equipeDe(S.uid), auto: true, at: nowISO() }); toast('Desafio cumprido: ' + d.titulo, 'ok'); } }
    if (Object.keys(patch).length) await merge('progresso/' + S.uid, patch, S.progresso[S.uid]);
  } catch (e) { /* comemoração é opcional */ }
}
// Extrator de Empresas: ao chamar no WhatsApp, a empresa entra na Carteira (Primeira abordagem) e conta como prospecção
async function prospectarEmpresa(e) {
  const telNorm = String(e.whats || '').replace(/\D/g, ''); if (telNorm.length < 10) throw new Error('Telefone inválido para WhatsApp.');
  let c = C.findDuplicate(telNorm);
  if (c && c.ownerId !== S.uid) return { bloqueado: true, msg: `${e.nome} já está em atendimento por outro consultor da operação.` };
  let novo = false;
  if (!c) {
    const idx = await S.db.doc('dupidx/' + telNorm).get().catch(() => null);
    if (idx?.exists && idx.data().ownerId !== S.uid) { gestoresDe(S.uid).forEach(x => notify(x, `${nome(S.uid)} tentou prospectar uma empresa que já está em atendimento por outro consultor (${e.nome}, ${C.fmtPhone(telNorm)}).`, 'carteira')); return { bloqueado: true, msg: `${e.nome} já está em atendimento por outro consultor. Seu gestor foi avisado.` }; }
    const cidade = (e.endereco.match(/-\s*([^-]+)$/) || [])[1]?.trim() || '';
    const d = { nome: e.nome, telefone: telNorm, telNorm, email: (e.email || '').toLowerCase(), origem: 'Prospecção ativa', indicadoPor: '', produto: '', valor: 0, cidade, uf: '', temperatura: '', site: e.site || '', endereco: e.endereco || '', fonte: 'extrator', obs: 'Empresa encontrada pelo Extrator de Empresas (Biblioteca Primoris).', etapa: 'novo', ownerId: S.uid, equipeId: C.equipeDe(S.uid), createdAt: nowISO(), createdBy: S.uid, historico: [] };
    const ref = await add('contatos', d); salvarDupIdx({ telNorm, ownerId: S.uid }, ref.id);
    c = { id: ref.id, ...d }; S.contatos[ref.id] = S.contatos[ref.id] || c; novo = true;
  }
  await registrarAtividade(c, 'whatsapp', 'Mensagem enviada', 'Prospecção pelo Extrator de Empresas');
  return { novo };
}
const salvarDupIdx = (c, id) => c.telNorm && put('dupidx/' + c.telNorm, { ownerId: c.ownerId, contatoId: id, at: nowISO() }).catch(() => {});
const gestoresDe = uid => { const g = C.gestorDe(uid); return g && g !== uid ? [g] : []; };
const admins = () => list(S.members).filter(m => ['admin', 'superadmin'].includes(m.role) && (m.status || 'ativo') === 'ativo').map(m => m.id);
async function baixar(filename, data, tipo = 'text/csv') {
  const d = await P.use('downloads').catch(() => null);
  if (!d) { modal('Copiar dados', `<p class="muted">O download não está disponível nesta visualização. Copie o conteúdo abaixo e cole numa planilha.</p><textarea rows="12" class="mono" readonly>${esc(data)}</textarea>`); return; }
  try { await d.save({ filename, data: (tipo === 'text/csv' ? '﻿' : '') + data, mimeType: tipo }); } catch (e) { if (e?.code !== 'cancelled') toast('Download não concluído.', 'warn'); }
}

// ---------- Cliques
const ACT = {
  inscrever: id => { const e = S.eventos[id]; if (!e) return; const m = list(S.inscricoes).find(i => i.eventoId === id && i.ownerId === S.uid && !i.canceladaEm); modal(m ? 'Editar inscrição' : 'Inscrição no evento', V3.inscricaoForm(e, m || {}), { wide: true }); },
  'cancelar-inscricao': async id => { if (await confirmar('Cancelar inscrição', 'Sua inscrição e a dos seus visitantes serão canceladas.', 'Cancelar inscrição')) run(() => upd('inscricoes/' + id, { canceladaEm: nowISO() }), 'Inscrição cancelada').then(() => admins().forEach(a => notify(a, `${nome(S.uid)} cancelou a inscrição em ${S.eventos[S.inscricoes[id]?.eventoId]?.titulo || 'evento'}`, 'eventos'))); },
  'ad-eventos': () => { S.sub.evGestao = !S.sub.evGestao; if (location.hash !== '#eventos') location.hash = 'eventos'; else schedule(); },
  'editar-marcos': () => modal('Brindes da meta do mês', V3.marcosForm(), { wide: true }),
  'novo-evento': () => modal('Novo evento', V3.eventoForm(), { wide: true }),
  'editar-evento': id => modal('Editar evento', V3.eventoForm({ id, ...S.eventos[id] }), { wide: true }),
  'ev-sel': id => { S.sub.evSel = id; render(true); },
  'exportar-inscritos': id => { const e = S.eventos[id]; const l = list(S.inscricoes).filter(i => i.eventoId === id && !i.canceladaEm); audit('Exportação de inscritos', e.titulo); baixar(`inscritos-${(e.titulo || 'evento').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`, C.toCSV([['Inscrito', 'E-mail', 'Celular', 'Consultor', 'Qtd. visitantes', 'Visitantes', 'Inscrição em'], ...l.map(i => [i.nome, i.email, i.celular, nome(i.ownerId), (i.visitantes || []).filter(Boolean).length, (i.visitantes || []).filter(Boolean).join(', '), C.fmtDT(i.at)])])); },
  'nova-duvida': () => modal('Nova dúvida', V3.duvidaForm(), { wide: true }),
  topico: id => { S.sub.topico = id || null; if (S.view !== 'forum') location.hash = 'forum'; else { render(true); window.scrollTo(0, 0); } },
  ff: v => { S.sub.ff = v; render(true); },
  'resolver-topico': id => run(() => upd('forum/' + id, { resolvido: nowISO(), resolvidoPor: S.uid }), 'Dúvida marcada como resolvida').then(() => { const t = S.forum[id]; if (t.ownerId !== S.uid) notify(t.ownerId, `${nome(S.uid)} marcou sua dúvida como resolvida: ${t.titulo}`, 'forum'); render(true); }),
  'reabrir-topico': id => run(() => upd('forum/' + id, { resolvido: null }), 'Dúvida reaberta').then(() => render(true)),
  'excluir-topico': async id => { if (await confirmar('Excluir dúvida', 'A dúvida e as respostas deixam de aparecer no fórum.', 'Excluir')) run(() => upd('forum/' + id, { deletedAt: nowISO(), deletedBy: S.uid }), 'Dúvida excluída').then(() => { S.sub.topico = null; audit('Tópico do fórum excluído', S.forum[id]?.titulo); render(true); }); },
  'excluir-resposta': async id => { if (await confirmar('Excluir resposta', 'A resposta deixa de aparecer no fórum.', 'Excluir')) run(() => upd('forum_resp/' + id, { deletedAt: nowISO(), deletedBy: S.uid }), 'Resposta excluída').then(() => render(true)); },
  'ver-carteira': uid => { S.sub.crm = { modo: 'lista', q: '', etapa: '', origem: '', temp: '', dono: uid }; location.hash = 'carteira'; },
  'ver-agenda': () => { S.sub.agEquipe = true; location.hash = 'agenda'; },
  ligar: id => { setTimeout(() => ACT.ativ(id), 1200); },
  picker: async () => { try { const [c] = await navigator.contacts.select(['name', 'tel', 'email'], { multiple: false }); if (!c) return; const f = $modal.querySelector('form[data-form="contato"]'); if (c.name?.[0]) f.nome.value = c.name[0]; if (c.tel?.[0]) f.telefone.value = c.tel[0]; if (c.email?.[0]) f.email.value = c.email[0]; } catch (e) { toast('Não foi possível abrir a agenda do celular.', 'warn'); } },
  objecoes: () => modal('Objeções e respostas', V2.objecoesView(), { wide: true }),
  copiar: (_, el) => navigator.clipboard?.writeText(el.dataset.txt).then(() => toast('Copiado', 'ok')).catch(() => toast('Selecione e copie o texto.', 'warn')),
  'ativar-push': async () => { try { const st = await P.ativarPush(); toast(st === 'ativo' ? 'Notificações ativadas neste aparelho.' : 'As notificações foram bloqueadas no navegador.', st === 'ativo' ? 'ok' : 'warn'); } catch (e) { toast('Não foi possível ativar as notificações: ' + (e.message || e), 'bad'); } if (M.refresh) { const b = $modal.querySelector('.modal-b'); if (b) b.innerHTML = M.refresh(); } },
  instalar: async () => { const p = S.installPrompt; if (!p) return; p.prompt(); await p.userChoice.catch(() => {}); S.installPrompt = null; render(true); },
  'exportar-comissoes': mk => { const l = C.comissoesDoMes(isAdmin() ? C.ativos().map(m => m.id) : [S.uid], mk); audit('Exportação de comissões', mk); baixar(`comissoes-${mk}.csv`, C.toCSV([['Consultor', 'Validada em', 'Cliente', 'Produto', 'Administradora', 'Carta de crédito', '%', 'Comissão'], ...l.map(v => [nome(v.ownerId), C.fmtDate(S.validacoes[v.id]?.at), S.contatos[v.contatoId]?.nome || v.clienteNome || '', v.produto, v.administradora || '', C.brl(v.valor), v.com.pct, C.brl(v.com.valor)])])); },
  'marcar-pago': (id, el) => { const [uid, mk] = id.split('_'); run(() => put('pagamentos/' + id, { ownerId: uid, mes: mk, valor: Number(el.dataset.valor) || 0, pagoEm: today(), by: S.uid, at: nowISO() }), 'Pagamento registrado').then(() => { notify(uid, `Sua comissão de ${C.monthLabel(mk)} (${C.brl(Number(el.dataset.valor) || 0)}) foi paga.`, 'vendas'); audit('Comissão paga', `${nome(uid)} · ${mk}`); }); },
  'desfazer-pagamento': id => run(() => del('pagamentos/' + id), 'Pagamento desfeito').then(() => audit('Pagamento desfeito', id)),
  'novo-desafio': () => modal('Novo desafio', V2.desafioForm()),
  'editar-desafio': id => modal('Editar desafio', V2.desafioForm((S.config.desafios?.lista || []).find(d => d.id === id))),
  'excluir-desafio': async id => { if (await confirmar('Excluir desafio', 'O desafio sai da tela de todos.', 'Excluir')) run(() => put('config/desafios', { lista: (S.config.desafios?.lista || []).filter(d => d.id !== id) }), 'Desafio excluído'); },
  'atribuir-curso': id => { const [eq, cid] = id.split(':'); const c = S.cursos[cid]; const ids = C.membrosDaEquipe([eq]).filter(u => !C.cursoStatus(u, c).concluido); run(async () => { for (const u of ids) { await add('tarefas', { titulo: 'Concluir o treinamento: ' + c.titulo, descricao: 'Atribuído pelo diagnóstico do funil.', prazo: addDays(today(), 7), prioridade: 'alta', ownerId: u, equipeId: eq, status: 'aberta', createdBy: S.uid, createdAt: nowISO() }); notify(u, `Novo treinamento para você: ${c.titulo}`, 'academy'); } }, `Treinamento atribuído a ${ids.length} consultor(es)`); },
  'backup-json': () => { const cols = ['members', 'equipes', 'contatos', 'atividades', 'reunioes', 'vendas', 'validacoes', 'tarefas', 'progresso', 'progressoes', 'feedbacks', 'cursos', 'pagamentos']; const out = { geradoEm: nowISO(), config: S.config }; cols.forEach(c => { out[c] = S[c]; }); audit('Backup completo', ''); baixar(`primoris-backup-${today()}.json`, JSON.stringify(out, null, 1), 'application/json'); },
  'backup-csv': c => { const rows = c === 'contatos' ? [['Nome', 'Telefone', 'E-mail', 'Cidade', 'UF', 'Origem', 'Produto', 'Valor', 'Etapa', 'Responsável', 'Cadastro'], ...list(S.contatos).filter(x => !x.deletedAt).map(x => [x.nome, C.fmtPhone(x.telefone), x.email, x.cidade, x.uf, x.origem, x.produto, x.valor, C.etapaNome(x.etapa), nome(x.ownerId), C.fmtDate(x.createdAt)])] : c === 'vendas' ? [['Data', 'Consultor', 'Cliente', 'Produto', 'Administradora', 'Valor', 'Status', 'Proposta'], ...list(S.vendas).map(v => [C.fmtDate(v.data), nome(v.ownerId), S.contatos[v.contatoId]?.nome || v.clienteNome || '', v.produto, v.administradora, v.valor, C.STATUS_VENDA[C.vendaStatus(v)]?.[0], v.proposta])] : [['Nome', 'E-mail', 'Telefone', 'Perfil', 'Nível', 'Equipe', 'Entrada', 'Status'], ...list(S.members).map(m => [m.nome, m.email, C.fmtPhone(m.telefone), C.ROLES[m.role], C.nivelNome(m.nivel), S.equipes[m.equipeId]?.nome || '', C.fmtDate(m.dataEntrada), m.status || 'ativo'])]; audit('Exportação ' + c, ''); baixar(`${c}-${today()}.csv`, C.toCSV(rows)); },
  'ver-arquivo': async path => { const w = window.open('', '_blank'); try { const u = await P.linkArquivo(path); if (w) w.location = u; else location.href = u; } catch (e) { if (w) w.close(); toast('Não foi possível abrir o arquivo.', 'bad'); } },
  'google-login': async (_, el) => { el.disabled = true; el.querySelector('span').textContent = 'Abrindo o Google…'; const { error } = await P.entrarComGoogle(); if (error) { el.disabled = false; toast('Não foi possível abrir o login do Google. ' + error.message, 'bad'); } },
  sair: async () => { if (await confirmar('Sair', 'Deseja sair da Primoris Academy neste dispositivo?', 'Sair')) P.sair(); },
  go: id => { location.hash = id; },
  menu: () => document.getElementById('side')?.classList.toggle('open'),
  novo: () => modal('Novo registro', `<div class="quick">${[['novo-contato', 'users', 'Novo contato'], ['ativ-rapida', 'phone', 'Registrar prospecção'], ['nova-reuniao', 'calendar', 'Agendar reunião'], ['nova-venda', 'coins', 'Registrar venda'], ['nova-tarefa', 'checksq', 'Nova tarefa']].map(([a, i, l]) => `<button class="quick-b" data-act="${a}">${V.ic(i, 22)}<span>${l}</span></button>`).join('')}</div>`),
  'ativ-rapida': () => { const cs = C.contatosDe([S.uid]).sort((a, b) => a.nome.localeCompare(b.nome)); if (!cs.length) return toast('Cadastre um contato primeiro.', 'warn'); modal('Registrar prospecção', `<form data-form="ativ" class="form-grid"><label class="field span2"><span>Contato</span><select name="contatoId" id="f-contatoId" required>${cs.map(c => `<option value="${c.id}">${esc(c.nome)}</option>`).join('')}</select></label>${ativCampos()}</form>`); },
  notifs: async () => { const st = await P.pushStatus().catch(() => 'indisponivel'); const h = () => V.pushBox(st) + V.notifsHtml(); modal('Notificações', h(), { refresh: h }); },
  notif: async id => { const n = S.notifs[id]; if (!n) return; if (!n.lida) upd('notifs/' + id, { lida: true }).catch(() => {}); closeModal(); if (n.link) location.hash = n.link; },
  'notifs-lidas': () => list(S.notifs).filter(n => !n.lida).reduce((p, n) => p.then(() => upd('notifs/' + n.id, { lida: true })), Promise.resolve()).catch(() => {}),
  'tarefa-ok': id => { const t = S.tarefas[id]; if (!t) return; run(async () => { await upd('tarefas/' + id, { status: 'concluida', doneAt: nowISO(), doneBy: S.uid }); if (t.recorrencia) { let p = addDays(t.prazo || today(), t.recorrencia === 'semanal' ? 7 : 1); while (t.recorrencia === 'diaria' && [0, 6].includes(new Date(p + 'T12:00:00Z').getUTCDay())) p = addDays(p, 1); await add('tarefas', { titulo: t.titulo, descricao: t.descricao || '', prioridade: t.prioridade || 'normal', recorrencia: t.recorrencia, ownerId: t.ownerId, equipeId: t.equipeId || '', createdBy: t.createdBy || S.uid, status: 'aberta', prazo: p, createdAt: nowISO() }); } if (t.createdBy && t.createdBy !== S.uid) notify(t.createdBy, `${nome(S.uid)} concluiu a tarefa “${t.titulo}”`, 'plano'); }, 'Tarefa concluída'); },
  'tarefa-reabrir': id => run(() => upd('tarefas/' + id, { status: 'aberta', doneAt: null, doneBy: null })),
  contato: id => abrirContato(id),
  'sz-dia': i => { S.sub.szDia = Number(i); render(true); },
  'sz-item': (id, el) => { const [d, i] = id.split(':'); run(() => merge('progresso/' + S.uid, { sz: { [d]: { itens: { [i]: el.checked ? nowISO() : null } } } }, S.progresso[S.uid])); },
  'sz-aceite': d => run(() => merge('progresso/' + S.uid, { sz: { [d]: { aceite: nowISO() } } }, S.progresso[S.uid]), 'Aceite registrado'),
  'sz-plano-edit': () => { S.sub.planoEdit = true; render(true); },
  'ac-tab': v => { S.sub.acTab = v; S.sub.escola = null; render(true); },
  escola: v => { S.sub.escola = v === '' ? null : Number(v); render(true); },
  curso: id => { S.sub.curso = id || null; S.sub.aula = null; if (S.view !== 'academy') location.hash = 'academy'; else { render(true); window.scrollTo(0, 0); } closeModal(); },
  aula: i => { S.sub.aula = Number(i); render(true); },
  'aula-ok': id => { const [c, a] = id.split(':'); run(() => merge('progresso/' + S.uid, { aulas: { [c]: { [a]: nowISO() } } }, S.progresso[S.uid]), 'Aula concluída').then(() => render(true)); },
  cert: id => modal('Certificado', V.certificado(id) + `<div class="row-a"><button class="btn accent" data-act="cert-baixar" data-id="${id}">${V.ic('download', 16)} Baixar certificado</button></div>`, { wide: true }),
  'cert-baixar': id => baixar(`certificado-${C.certCodigo(S.uid, id)}.html`, `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Certificado Primoris Academy</title><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Inter:wght@400;600&display=swap" rel="stylesheet"><style>${document.getElementById('cert-css').textContent}</style></head><body style="background:#111;margin:0;padding:40px">${V.certificado(id).replace(/src="img\//g, 'src="' + location.origin + location.pathname.replace(/[^/]*$/, '') + 'img/')}</body></html>`, 'text/html'),
  'crm-modo': v => { S.sub.crm.modo = v; render(true); },
  'novo-contato': () => modal('Novo contato', V.contatoForm(), { wide: true }),
  'editar-contato': id => modal('Editar contato', V.contatoForm(S.contatos[id]), { wide: true }),
  'excluir-contato': async id => { if (await confirmar('Mover para a lixeira', 'O contato sai da carteira e dos indicadores. O histórico é mantido para auditoria.', 'Mover para a lixeira')) run(() => upd('contatos/' + id, { deletedAt: nowISO(), deletedBy: S.uid }), 'Contato removido').then(() => audit('Contato excluído', S.contatos[id]?.nome)); },
  ativ: id => modal('Registrar contato', `<form data-form="ativ" data-id="${id}" class="form-grid">${ativCampos(S.contatos[id])}</form>`),
  wa: id => { const c = S.contatos[id]; if (c) run(() => registrarAtividade(c, 'whatsapp', 'Mensagem enviada'), 'Tentativa por WhatsApp registrada'); },
  importar: () => modal('Importar contatos', `<p class="muted">Envie um arquivo CSV (exportado do Excel ou Google Planilhas) ou cole os dados. A primeira linha deve ter os títulos das colunas: <code>nome; telefone; email; cidade; uf; origem; produto; valor</code>.</p><form data-form="importar" class="form-grid"><label class="field span2"><span>Arquivo CSV</span><input type="file" id="f-arq" name="arq" accept=".csv,text/csv,.txt"></label><label class="field span2"><span>Ou cole aqui</span><textarea id="f-dados" name="dados" rows="6" placeholder="nome;telefone;origem&#10;Maria Silva;11999998888;Indicação"></textarea></label><div class="span2 row-a"><button class="btn accent">Importar</button></div><div class="span2" id="imp-out"></div></form>`, { wide: true }),
  'exportar-crm': () => { const f = S.sub.crm || {}; const ids = f.dono === '*' ? (isAdmin() ? C.ativos().map(m => m.id) : [S.uid, ...C.membrosDaEquipe(C.minhasEquipes())]) : [f.dono || S.uid]; const cs = C.contatosDe(ids); audit('Exportação de contatos', `${cs.length} registros`); baixar(`contatos-${today()}.csv`, C.toCSV([['Nome', 'Telefone', 'E-mail', 'Cidade', 'UF', 'Origem', 'Produto', 'Valor estimado', 'Etapa', 'Responsável', 'Cadastro'], ...cs.map(c => [c.nome, C.fmtPhone(c.telefone), c.email, c.cidade, c.uf, c.origem, c.produto, c.valor, C.etapaNome(c.etapa), nome(c.ownerId), C.fmtDate(c.createdAt)])])); },
  'nova-reuniao': id => abrirReuniao({}, id || ''),
  'reuniao-res': id => modal('Resultado do compromisso', `<form data-form="reuniao-res" data-id="${id}" class="form-grid"><label class="field"><span>A reunião aconteceu?</span><select name="status" id="f-status"><option value="realizada">Sim, foi realizada</option><option value="nao_compareceu">Cliente não compareceu</option><option value="remarcada">Precisa remarcar</option><option value="cancelada">Cancelada</option></select></label><label class="field"><span>Resultado</span><select name="resultado" id="f-resultado"><option>Proposta apresentada</option><option>Venda</option><option>Follow-up</option><option>Sem interesse</option><option>Outro</option></select></label><label class="field span2"><span>Observações</span><textarea name="obs" id="f-obs" rows="2"></textarea></label><div class="span2 row-a"><button class="btn accent">Salvar resultado</button></div></form>`),
  'ag-modo': v => { S.sub.agModo = v; render(true); },
  'ag-nav': d => { const m = S.sub.agModo || 'semana'; const b = S.sub.agBase || today(); S.sub.agBase = d === '0' ? today() : m === 'mes' ? addDays(b.slice(0, 8) + '15', Number(d) * 30).slice(0, 8) + '01' : addDays(b, Number(d) * (m === 'dia' ? 1 : 7)); render(true); },
  ics: () => { const rs = list(S.reunioes).filter(x => x.ownerId === S.uid && x.status === 'agendada'); const f = d => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''); baixar('agenda-primoris.ics', ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Primoris Academy//PT-BR', ...rs.flatMap(x => ['BEGIN:VEVENT', 'UID:' + x.id + '@primoris', 'DTSTAMP:' + f(nowISO()), 'DTSTART:' + f(x.inicio), 'DTEND:' + f(new Date(new Date(x.inicio).getTime() + 3600e3)), 'SUMMARY:' + (x.titulo || 'Reunião') + (x.contatoId ? ' - ' + (S.contatos[x.contatoId]?.nome || '') : ''), 'LOCATION:' + (x.local || ''), 'END:VEVENT']), 'END:VCALENDAR'].join('\r\n'), 'text/calendar'); },
  'nova-tarefa': uid => modal('Nova tarefa', V.tarefaForm(uid ? { ownerId: uid } : {})),
  tf: v => { S.sub.tf = v; render(true); },
  'v-tab': v => { S.sub.vTab = v; render(true); },
  'hub-tab': v => { const [hub, t] = v.split(':'); S.sub[hub === 'jornada' ? 'jTab' : 'cTab'] = t; S.animNext = true; if (location.hash !== '#' + hub) location.hash = hub; else render(true); window.scrollTo({ top: 0, behavior: 'smooth' }); },
  'nova-venda': id => abrirVenda({}, id || ''),
  'lancar-venda': () => modal('Lançar venda', V3.lancarVendaForm(), { wide: true }),
  'editar-lancamento': id => modal('Editar venda', V3.lancarVendaForm({ id, ...S.vendas[id] }), { wide: true }),
  'enviar-contrato': id => modal('Enviar contrato', V3.contratoForm(id)),
  'editar-venda': id => abrirVenda(S.vendas[id]),
  'hist-venda': id => modal('Histórico da venda', V.vendaHist(S.vendas[id])),
  preaprovar: id => { const v = S.vendas[id]; run(() => upd('vendas/' + id, { preAprovadaPor: S.uid, preAprovadaAt: nowISO(), historico: hist(v.historico, { status: 'pre_aprovada', by: S.uid, at: nowISO() }) }), 'Venda pré-aprovada').then(() => { admins().forEach(a => notify(a, `Venda de ${nome(v.ownerId)} pré-aprovada aguarda validação`, 'vendas')); audit('Venda pré-aprovada', id); }); },
  validar: id => decidirVenda(id, 'validada'),
  devolver: async id => { const m = await pedirTexto('Devolver para correção', 'O que precisa ser corrigido?'); if (m) decidirVenda(id, 'devolvida', m); },
  reprovar: async id => { const m = await pedirTexto('Reprovar venda', 'Motivo da reprovação'); if (m) decidirVenda(id, 'reprovada', m); },
  'cancelar-venda': async id => { const m = await pedirTexto('Cancelar venda validada', 'Motivo (desistência, inadimplência…)'); if (m) decidirVenda(id, 'cancelada', m); },
  'solicitar-nivel': () => { const pn = C.proxNivel(S.uid); if (!pn) return; run(() => add('progressoes', { uid: S.uid, de: me().nivel || 0, para: pn.idx, status: 'solicitada', at: nowISO() }), 'Solicitação enviada').then(() => { [...gestoresDe(S.uid), ...admins()].forEach(u => notify(u, `${nome(S.uid)} solicitou progressão para ${pn.nome}`, 'admin')); }); },
  'doc-enviar': rid => { const req = (C.niveisCfg()[(me().nivel || 0) + 1]?.requisitos || []).find(r => r.id === rid); modal(req?.label || 'Enviar documento', `<form data-form="doc" data-id="${rid}" class="form-grid">${P.temArquivos() ? '<label class="field span2"><span>Arquivo (PDF ou foto, até 10 MB)</span><input type="file" id="f-arquivo" name="arquivo" accept="application/pdf,image/*" required></label>' : ''}<label class="field span2"><span>Número ou referência (ex.: CNPJ 00.000.000/0001-00)</span><input id="f-valor" name="valor" required></label><div class="span2 row-a"><button class="btn accent">Enviar para conferência</button></div></form>`); },
  'doc-enviar-antigo': async rid => { const req = (C.niveisCfg()[(me().nivel || 0) + 1]?.requisitos || []).find(r => r.id === rid); const v = await pedirTexto(req?.label || 'Documento', 'Informe o número ou a referência do documento (ex.: CNPJ 00.000.000/0001-00)'); if (v) run(() => merge('progresso/' + S.uid, { docs: { [rid]: { valor: v, label: req?.label || rid, at: nowISO(), conferido: false } } }, S.progresso[S.uid]), 'Documento enviado para conferência').then(() => admins().forEach(a => notify(a, `${nome(S.uid)} enviou documento: ${req?.label || ''}`, 'admin'))); },
  'plano-aprovar': uid => run(() => merge('progresso/' + uid, { plano: { status: 'aprovado', by: S.uid, decididoAt: nowISO() } }, S.progresso[uid]), 'Plano aprovado').then(() => notify(uid, 'Seu plano de ação foi aprovado. As metas passam a valer a partir de hoje.', 'plano')),
  'plano-devolver': async uid => { const m = await pedirTexto('Devolver plano', 'O que ajustar?'); if (m) run(() => merge('progresso/' + uid, { plano: { status: 'devolvido', motivo: m, by: S.uid, decididoAt: nowISO() } }, S.progresso[uid]), 'Plano devolvido').then(() => notify(uid, 'Seu plano de ação foi devolvido para ajustes.', 'semana-zero')); },
  perfil: uid => { S.sub.perfil = uid || null; if (S.view !== 'equipe') location.hash = 'equipe'; else { render(true); window.scrollTo(0, 0); } },
  feedback: uid => modal('Feedback para ' + nome(uid), V.feedbackForm(uid)),
  ciente: id => run(() => upd('feedbacks/' + id, { ciente: nowISO() })),
  'mural-post': async () => { const t = await pedirTexto('Publicar no mural', 'Mensagem para a equipe'); if (t) run(() => add('feedbacks', { tipo: 'mural', de: S.uid, texto: t, equipeId: isAdmin() ? '' : C.equipeDe(S.uid) || C.minhasEquipes()[0] || '', at: nowISO() }), 'Publicado'); },
  rel: v => { S.sub.rel = v; render(true); },
  'exportar-rel': () => { const t = S.sub.rel || 'vgv'; const rows = V.relatorioDados(t); audit('Exportação de relatório', V.RELATORIOS[t]); baixar(`relatorio-${t}-${today()}.csv`, C.toCSV(rows)); },
  'ad-tab': v => { S.sub.adTab = v; render(true); },
  'aprovar-acesso': uid => { const s = S.solicitacoes[uid]; modal('Liberar acesso', V.membroForm(uid, { nome: s.nome, email: s.email, telefone: s.telefone, role: 'consultor', nivel: 0, dataEntrada: today(), status: 'ativo' }), { wide: true }); },
  'recusar-acesso': async uid => { if (await confirmar('Recusar solicitação', `Recusar o acesso de ${S.solicitacoes[uid]?.nome}?`, 'Recusar')) run(() => del('solicitacoes/' + uid), 'Solicitação recusada').then(() => audit('Acesso recusado', S.solicitacoes[uid]?.nome)); },
  'editar-membro': uid => modal('Editar usuário', V.membroForm(uid), { wide: true }),
  'nova-equipe': () => modal('Nova equipe', V.equipeForm()),
  'editar-equipe': id => modal('Editar equipe', V.equipeForm({ id, ...S.equipes[id] })),
  'aprovar-nivel': async id => { const p = S.progressoes[id]; const j = await pedirTexto('Aprovar progressão', `Justificativa da aprovação para ${C.nivelNome(p.para)}`); if (!j) return; const m = S.members[p.uid]; run(async () => { await upd('members/' + p.uid, { nivel: p.para, historicoNivel: hist(m.historicoNivel, { de: m.nivel || 0, para: p.para, at: nowISO(), by: S.uid, justificativa: j }) }); await upd('progressoes/' + id, { status: 'aprovada', by: S.uid, decididoAt: nowISO(), justificativa: j }); }, 'Progressão aprovada').then(() => { notify(p.uid, `Parabéns! Sua progressão para ${C.nivelNome(p.para)} foi aprovada.`, 'carreira'); audit('Progressão aprovada', `${nome(p.uid)} → ${C.nivelNome(p.para)}`); }); },
  'devolver-nivel': async id => { const p = S.progressoes[id]; const m = await pedirTexto('Devolver solicitação', 'O que falta?'); if (m) run(() => upd('progressoes/' + id, { status: 'devolvida', motivo: m, by: S.uid, decididoAt: nowISO() }), 'Solicitação devolvida').then(() => notify(p.uid, `Sua solicitação de progressão foi devolvida: ${m}`, 'carreira')); },
  'conferir-doc': id => { const [uid, k] = id.split(':'); run(() => upd('progresso/' + uid, { docs: { [k]: { conferido: true, by: S.uid, conferidoAt: nowISO() } } }), 'Documento conferido').then(() => { notify(uid, 'Seu documento foi conferido pela administração.', 'carreira'); audit('Documento conferido', `${nome(uid)} · ${k}`); }); },
  'editar-carreira': () => modal('Níveis e requisitos', V.carreiraForm(), { wide: true }),
  'novo-curso': () => modal('Novo curso', V.cursoForm(), { wide: true }),
  'editar-curso': id => modal('Editar curso', V.cursoForm({ id, ...S.cursos[id] }), { wide: true }),
  'excluir-curso': async id => { closeModal(); if (await confirmar('Excluir curso', 'O curso deixa de aparecer na Academy. O progresso dos alunos é mantido no histórico.', 'Excluir')) run(() => del('cursos/' + id), 'Curso excluído').then(() => audit('Curso excluído', id)); },
  'editar-sz': () => modal('Editar Semana Zero', V.szForm(), { wide: true }),
};
const ativCampos = (c = {}) => `<label class="field"><span>Canal</span><select name="tipo" id="f-tipo"><option value="ligacao">Ligação</option><option value="whatsapp">WhatsApp</option><option value="email">E-mail</option><option value="visita">Visita</option><option value="nota">Só observação</option></select></label>
  <label class="field"><span>Resultado</span><select name="resultado" id="f-resultado"><option>Atendeu</option><option>Não atendeu</option><option>Retornar depois</option><option>Mensagem enviada</option><option>Interessado</option><option>Pediu proposta</option><option>Sem interesse</option></select></label>
  <label class="field span2"><span>O que foi conversado</span><textarea name="texto" id="f-texto" rows="2"></textarea></label>
  <label class="field"><span>Próxima ação</span><input name="proximaAcao" id="f-proximaAcao" value="${esc(c.proximaAcao || '')}"></label>
  <label class="field"><span>Data da próxima ação</span><input type="date" name="proximaData" id="f-proximaData" value="${esc(c.proximaData || addDays(today(), 2))}"></label>
  <div class="span2 row-a"><button class="btn accent">Registrar</button></div>`;
async function decidirVenda(id, status, motivo = '') {
  const v = S.vendas[id]; const cur = S.validacoes[id];
  await run(() => put('validacoes/' + id, { status, motivo, by: S.uid, at: nowISO(), ownerId: v.ownerId, valor: v.valor, historico: hist(cur?.historico, { status, by: S.uid, at: nowISO(), motivo }) }), { validada: 'Venda validada: VGV atualizado', devolvida: 'Venda devolvida', reprovada: 'Venda reprovada', cancelada: 'Venda cancelada' }[status]);
  const txt = { validada: `Sua venda de ${C.brl(v.valor)} foi validada e já conta no seu VGV!`, devolvida: `Sua venda de ${C.brl(v.valor)} foi devolvida para correção: ${motivo}`, reprovada: `Sua venda de ${C.brl(v.valor)} foi reprovada: ${motivo}`, cancelada: `Sua venda de ${C.brl(v.valor)} foi cancelada: ${motivo}` }[status];
  notify(v.ownerId, txt, 'vendas'); audit('Venda ' + status, `${nome(v.ownerId)} · ${C.brl(v.valor)}`);
}

document.addEventListener('click', e => {
  if (e.target.closest('[data-close]') || e.target.matches('[data-close-bg]')) return closeModal();
  const add_ = e.target.closest('[data-add]'); if (add_) { const k = add_.dataset.add; const tpl = document.getElementById('tpl-' + k); document.getElementById('rows-' + k).insertAdjacentHTML('beforeend', tpl.innerHTML); return; }
  const rm = e.target.closest('[data-rm]'); if (rm) { rm.closest('.rowed').remove(); return; }
  const el = e.target.closest('[data-act]'); if (!el) { if (!e.target.closest('#side') && !e.target.closest('[data-act="menu"]')) document.getElementById('side')?.classList.remove('open'); return; }
  const fn = ACT[el.dataset.act]; if (!fn) return;
  if (el.tagName === 'A' && !['wa', 'ligar'].includes(el.dataset.act)) e.preventDefault();
  fn(el.dataset.id ?? '', el);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $modal.innerHTML) closeModal();
  if (e.key === 'Enter' && e.target.matches('[data-act][tabindex]')) e.target.click();
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.actChange === 'etapa') return pedirEtapa(t.dataset.id, t.value);
  if (t.dataset.filter && (t.tagName === 'SELECT' || t.type === 'checkbox')) setFilter(t);
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.visitantes !== undefined) { const box = document.getElementById('visitantes'); const n = Math.min(Number(t.max) || 30, Math.max(0, Number(t.value) || 0)); const atuais = [...box.querySelectorAll('input')].map(i => i.value); box.innerHTML = Array.from({ length: n }, (_, i) => V3.visitanteInput(i, atuais[i] || '')).join(''); }
  if (t.dataset.filter && t.tagName === 'INPUT' && t.type !== 'checkbox') { clearTimeout(t._d); t._d = setTimeout(() => { S.focusFilter = t.dataset.filter; setFilter(t); }, 180); }
  if (t.closest('#sim')) document.getElementById('sim-out').innerHTML = V.simCalc(Object.fromEntries(new FormData(t.closest('#sim'))));
});
function setFilter(t) {
  const k = t.dataset.filter; const v = t.type === 'checkbox' ? t.checked : t.value;
  if (k.startsWith('crm.')) S.sub.crm[k.slice(4)] = v;
  else if (['agEquipe', 'tfEquipe', 'comMes', 'fq', 'fcat'].includes(k)) S.sub[k] = v;
  else { S.dash[k] = v; if (k === 'escopo') { S.dash.consultor = ''; if (v !== 'equipe') S.dash.equipe = ''; } }
  render(true);
}

// ---------- Arrastar e soltar no Kanban
document.addEventListener('dragstart', e => { const c = e.target.closest?.('[data-drag]'); if (c) { e.dataTransfer.setData('text/plain', c.dataset.drag); c.classList.add('dragging'); } });
document.addEventListener('dragend', e => e.target.classList?.remove('dragging'));
document.addEventListener('dragover', e => { const col = e.target.closest?.('[data-drop]'); if (col) { e.preventDefault(); col.classList.add('over'); } });
document.addEventListener('dragleave', e => e.target.closest?.('[data-drop]')?.classList.remove('over'));
document.addEventListener('drop', e => { const col = e.target.closest?.('[data-drop]'); if (!col) return; e.preventDefault(); col.classList.remove('over'); const id = e.dataTransfer.getData('text/plain'); const c = S.contatos[id]; if (c && (c.ownerId === S.uid || isAdmin())) pedirEtapa(id, col.dataset.drop); });

// ---------- Formulários
const FORM = {
  async inscricao(f, eid, form) {
    const e = S.eventos[eid]; const insId = form.dataset.ins;
    const email = (f.email || '').trim().toLowerCase(); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Informe um e-mail válido.');
    const cel = normPhone(f.celular); if (cel.length < 12) throw new Error('Informe o celular com DDD.');
    const qtd = Math.max(0, Number(f.qtd) || 0); const visitantes = Array.from({ length: qtd }, (_, i) => (f['v' + i] || '').trim()).filter(Boolean);
    if (visitantes.length !== qtd) throw new Error('Preencha o nome de todos os visitantes.');
    if (e.limite) { const outros = list(S.inscricoes).filter(i => i.eventoId === eid && !i.canceladaEm && i.id !== insId).reduce((s, i) => s + 1 + (i.visitantes || []).length, 0); if (outros + 1 + qtd > Number(e.limite)) throw new Error(`Restam ${Math.max(0, Number(e.limite) - outros)} vaga(s) neste evento.`); }
    const d = { eventoId: eid, nome: f.nome.trim(), email, celular: C.fmtPhone(cel), visitantes, updatedAt: nowISO() };
    if (insId) { await upd('inscricoes/' + insId, d); return 'Inscrição atualizada'; }
    await add('inscricoes', { ...d, ownerId: S.uid, equipeId: C.equipeDe(S.uid), at: nowISO() });
    [...new Set([...admins(), ...gestoresDe(S.uid)])].forEach(a => notify(a, `${d.nome} se inscreveu em ${e.titulo} com ${qtd} visitante(s)`, 'eventos'));
    return 'Inscrição confirmada! Enviamos a confirmação para o seu e-mail.';
  },
  async evento(f, id) {
    const d = { titulo: f.titulo.trim(), data: f.data, hora: f.hora || '', local: f.local || '', descricao: f.descricao || '', limite: Number(f.limite) || null, maxVisitantes: Number(f.maxVisitantes) || 0, ativo: f.ativo === '1', updatedAt: nowISO() };
    if (id) await put('eventos/' + id, { ...S.eventos[id], ...d }); else { const ref = await add('eventos', { ...d, createdAt: nowISO(), createdBy: S.uid }); id = ref.id; }
    if (f.avisar) C.ativos().forEach(m => notify(m.id, `Novo evento: ${d.titulo} em ${C.fmtDate(d.data)}. Inscreva-se e leve seus convidados!`, 'eventos'));
    S.sub.evSel = id; audit('Evento salvo', d.titulo); return 'Evento salvo';
  },
  async duvida(f) {
    const ref = await add('forum', { ownerId: S.uid, equipeId: C.equipeDe(S.uid), titulo: f.titulo.trim(), texto: f.texto.trim(), categoria: f.categoria, at: nowISO() });
    [...new Set([...gestoresDe(S.uid), ...admins()])].forEach(u => notify(u, `Nova dúvida de ${nome(S.uid)} (${C.papel(S.uid)}): ${f.titulo.trim()}`, 'forum'));
    S.sub.topico = ref.id; location.hash = 'forum'; return 'Dúvida publicada. A gestão foi avisada.';
  },
  async resposta(f, tid) {
    const t = S.forum[tid]; await add('forum_resp', { topicoId: tid, ownerId: S.uid, texto: f.texto.trim(), at: nowISO() });
    const env = new Set([t.ownerId, ...C.respostasDe(tid).map(r => r.ownerId)]); env.delete(S.uid);
    env.forEach(u => notify(u, `${nome(S.uid)} (${C.papel(S.uid)}) respondeu: ${t.titulo}`, 'forum'));
    if (t.resolvido && t.ownerId === S.uid) await upd('forum/' + tid, { resolvido: null });
    return 'Resposta enviada';
  },
  async doc(f, rid, form) {
    const req = (C.niveisCfg()[(me().nivel || 0) + 1]?.requisitos || []).find(r => r.id === rid);
    const file = form.querySelector('#f-arquivo')?.files?.[0]; let arquivo = '';
    if (file) { if (file.size > 10 * 1024 * 1024) throw new Error('O arquivo passa de 10 MB.'); arquivo = await P.enviarArquivo(file, rid); }
    await merge('progresso/' + S.uid, { docs: { [rid]: { valor: f.valor, label: req?.label || rid, arquivo, at: nowISO(), conferido: false } } }, S.progresso[S.uid]);
    admins().forEach(a => notify(a, `${nome(S.uid)} enviou documento: ${req?.label || ''}`, 'admin'));
    return 'Documento enviado para conferência';
  },
  async desafio(f, id) {
    const l = (S.config.desafios?.lista || []).slice(); const d = { id: id || 'd' + Date.now().toString(36), titulo: f.titulo.trim(), indicador: f.indicador, meta: parseMoney(f.meta), inicio: f.inicio, fim: f.fim, premio: f.premio || '', ativo: true };
    if (d.fim < d.inicio) throw new Error('A data de fim precisa ser depois do início.');
    const i = l.findIndex(x => x.id === d.id); if (i >= 0) l[i] = d; else l.push(d);
    await put('config/desafios', { lista: l, updatedAt: nowISO() });
    if (f.anunciar) C.ativos().forEach(m => notify(m.id, `Novo desafio: ${d.titulo} (meta ${d.indicador === 'vgv' ? C.brlShort(d.meta) : d.meta} · até ${C.fmtDate(d.fim)})`, 'conquistas'));
    audit('Desafio salvo', d.titulo); return 'Desafio salvo';
  },
  async marcos(f, _, form) {
    const l = [...form.querySelectorAll('[data-row=marco]')].map(r => ({ valor: Number(r.querySelector('[name=m_valor]').value) || 0, brinde: r.querySelector('[name=m_brinde]').value.trim() || 'Brinde' })).filter(m => m.valor > 0).sort((a, b) => a.valor - b.valor);
    if (!l.length) throw new Error('Informe pelo menos um valor.');
    await put('config/metaMes', { marcos: l, updatedAt: nowISO(), updatedBy: S.uid }); audit('Brindes da meta do mês alterados', l.map(m => m.valor).join(', ')); return 'Brindes salvos';
  },
  async comissoes(f, _, form) {
    const regras = [...form.querySelectorAll('[data-row=regra]')].map(r => ({ produto: r.querySelector('[name=r_produto]').value, administradora: r.querySelector('[name=r_adm]').value.trim() || '*', nivel: r.querySelector('[name=r_nivel]').value, percentual: Number(String(r.querySelector('[name=r_pct]').value).replace(',', '.')) })).filter(r => r.percentual > 0);
    await put('config/comissoes', { regras, obs: f.obs || '', updatedAt: nowISO(), updatedBy: S.uid }); audit('Regras de comissão alteradas', `${regras.length} regras`); return 'Regras de comissão salvas';
  },
  async mensagens(f) {
    const blocos = t => String(t || '').split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
    const modelos = blocos(f.modelos).map(b => { const [titulo, etapas, ...resto] = b.split('|').map(x => x.trim()); return { titulo, etapas: (etapas || '').split(',').map(x => x.trim()).filter(Boolean), texto: resto.join(' | ') }; }).filter(m => m.titulo && m.texto);
    const objecoes = blocos(f.objecoes).map(b => { const [objecao, ...resto] = b.split('|').map(x => x.trim()); return { objecao, resposta: resto.join(' | ') }; }).filter(o => o.objecao && o.resposta);
    await put('config/mensagens', { modelos, objecoes, updatedAt: nowISO() }); return 'Mensagens salvas';
  },
  async solicitar(f) {
    if (!f.telefone || f.telefone.replace(/\D/g, '').length < 10) throw new Error('Informe um WhatsApp com DDD.');
    await put('solicitacoes/' + S.uid, { nome: f.nome.trim(), email: f.email.trim().toLowerCase(), telefone: normPhone(f.telefone), aceiteTermos: nowISO(), versaoTermos: '1.0', at: nowISO() });
    admins().forEach(a => notify(a, `${f.nome} solicitou acesso à plataforma`, 'admin'));
  },
  async boasvindas(f) { await merge('progresso/' + S.uid, { welcomeDone: nowISO(), objetivo: f.objetivo || '' }, S.progresso[S.uid]); location.hash = 'semana-zero'; },
  async 'sz-texto'(f, id) { await merge('progresso/' + S.uid, { sz: { [id]: { texto: f.texto, textoAt: nowISO() } } }, S.progresso[S.uid]); gestoresDe(S.uid).forEach(g => notify(g, `${nome(S.uid)} enviou uma resposta na Semana Zero`, 'equipe')); return 'Resposta enviada'; },
  async 'sz-plano'(f) { S.sub.planoEdit = false; await merge('progresso/' + S.uid, { plano: { prospeccoes: Number(f.prospeccoes), contatos: Number(f.contatos), reunioes: Number(f.reunioes), vgv90: parseMoney(f.vgv90), rotina: f.rotina, status: 'enviado', at: nowISO() } }, S.progresso[S.uid]); gestoresDe(S.uid).forEach(g => notify(g, `${nome(S.uid)} enviou o plano de ação para validação`, 'equipe')); return 'Plano enviado ao gestor'; },
  async 'sz-quiz'(f, id) { const qs = C.szDias()[id].quiz; const n = Math.round((qs.filter((q, i) => Number(f['q' + i]) === q.c).length / qs.length) * 100); const min = C.S.config.semanaZero?.notaMin || 70; await merge('progresso/' + S.uid, { sz: { [id]: { quizNota: n, quizOk: n >= min, quizAt: nowISO() } } }, S.progresso[S.uid]); toast(n >= min ? `Aprovado com ${n}%!` : `Você acertou ${n}%. A nota mínima é ${min}%. Revise e tente de novo.`, n >= min ? 'ok' : 'warn'); },
  async 'curso-quiz'(f, id) { const c = S.cursos[id]; const n = Math.round((c.quiz.filter((q, i) => Number(f['q' + i]) === q.c).length / c.quiz.length) * 100); const min = Number(c.notaMin) || 70; const prev = prog(S.uid).quiz?.[id]; await merge('progresso/' + S.uid, { quiz: { [id]: { nota: n, aprovado: n >= min, at: nowISO(), tentativas: (prev?.tentativas || 0) + 1 } } }, S.progresso[S.uid]); toast(n >= min ? `Aprovado com ${n}%! Certificado liberado.` : `Você acertou ${n}%. A nota mínima é ${min}%.`, n >= min ? 'ok' : 'warn'); },
  async contato(f, id) {
    const telNorm = normPhone(f.telefone); if (telNorm.length < 12) throw new Error('Informe um telefone com DDD.');
    const dup = C.findDuplicate(f.telefone, f.email, id);
    if (dup) { toast(`Você já tem este contato na carteira: ${dup.nome}.`, 'warn'); return abrirContato(dup.id), false; }
    if (!id) { const idx = await S.db.doc('dupidx/' + telNorm).get(); if (idx.exists && idx.data().ownerId !== S.uid) { const g = gestoresDe(S.uid); g.forEach(x => notify(x, `${nome(S.uid)} tentou cadastrar um contato que já está em atendimento por outro consultor (${C.fmtPhone(telNorm)}).`, 'carteira')); throw new Error('Este contato já está em atendimento na operação. Seu gestor foi avisado para decidir.'); } }
    const base = id ? S.contatos[id] : null;
    const d = { nome: f.nome.trim(), telefone: telNorm, telNorm, email: (f.email || '').trim().toLowerCase(), origem: f.origem, indicadoPor: f.indicadoPor || '', produto: f.produto || '', valor: parseMoney(f.valor), cidade: f.cidade || '', uf: f.uf || '', temperatura: f.temperatura || '', proximaAcao: f.proximaAcao || '', proximaData: f.proximaData || '', obs: f.obs || '', baseLegal: 'Legítimo interesse — atendimento comercial', updatedAt: nowISO() };
    if (base) { const etapaNova = f.etapa || base.etapa; if (etapaNova !== base.etapa) { d.etapa = etapaNova; d.historico = hist(base.historico, { de: base.etapa, para: etapaNova, at: nowISO(), by: S.uid }); } await upd('contatos/' + id, d); if (base.telNorm !== telNorm) salvarDupIdx({ ...d, ownerId: base.ownerId }, id); return 'Contato atualizado'; }
    const ref = await add('contatos', { ...d, etapa: f.etapa || 'novo', ownerId: S.uid, equipeId: C.equipeDe(S.uid), createdAt: nowISO(), createdBy: S.uid, historico: [] });
    salvarDupIdx({ telNorm, ownerId: S.uid }, ref.id); return 'Contato cadastrado';
  },
  async ativ(f, id) { const c = S.contatos[id || f.contatoId]; await registrarAtividade(c, f.tipo, f.resultado, f.texto); if (f.proximaData || f.proximaAcao) await upd('contatos/' + c.id, { proximaAcao: f.proximaAcao, proximaData: f.proximaData }); return C.PROSPECT_TIPOS.includes(f.tipo) ? 'Prospecção registrada' : 'Observação registrada'; },
  async reuniao(f, id) {
    const inicio = new Date(f.inicio + ':00-03:00').toISOString();
    const d = { tipo: f.tipo, contatoId: f.contatoId || '', titulo: f.titulo || '', inicio, local: f.local || '', lembrete: f.lembrete, obs: f.obs || '', updatedAt: nowISO() };
    if (id) { await upd('reunioes/' + id, { ...d, status: 'agendada' }); return 'Compromisso atualizado'; }
    await add('reunioes', { ...d, ownerId: S.uid, equipeId: C.equipeDe(S.uid), status: 'agendada', createdAt: nowISO() });
    const c = S.contatos[f.contatoId]; if (c && f.tipo === 'reuniao' && C.etapaIdx(c.etapa) < C.etapaIdx('reuniao_agendada')) await mudarEtapa(c, 'reuniao_agendada');
    return 'Compromisso agendado';
  },
  async 'reuniao-res'(f, id) {
    const x = S.reunioes[id]; if (f.status === 'remarcada') { closeModal(); return abrirReuniao(x), false; }
    await upd('reunioes/' + id, { status: f.status, resultado: f.status === 'realizada' ? f.resultado : '', obsResultado: f.obs || '', realizadaAt: f.status === 'realizada' ? nowISO() : null });
    const c = S.contatos[x.contatoId];
    if (c && f.status === 'realizada') {
      const alvo = { 'Proposta apresentada': 'proposta', 'Follow-up': 'followup', 'Sem interesse': 'sem_interesse' }[f.resultado] || 'reuniao_realizada';
      if (f.resultado === 'Venda') { await mudarEtapa(c, 'reuniao_realizada'); setTimeout(() => abrirVenda({}, c.id), 50); }
      else await mudarEtapa(S.contatos[c.id], alvo, f.resultado === 'Sem interesse' ? f.obs : '');
    }
    return 'Resultado registrado';
  },
  async lancar(f, id, form) {
    const valor = parseMoney(f.valor); if (!(valor > 0)) throw new Error('Informe o valor da venda.');
    const tipo = f.tipo === 'veiculo' ? 'veiculo' : 'imovel'; const cli = (f.cliente || '').trim(); if (!cli) throw new Error('Informe o nome do cliente.');
    const ct = C.contatosDe([S.uid]).find(c => c.nome.trim().toLowerCase() === cli.toLowerCase());
    const d = { tipo, produto: V3.TIPOS[tipo].produto, clienteNome: cli, contatoId: ct?.id || (id ? S.vendas[id]?.contatoId || '' : ''), grupo: f.grupo.trim(), cota: f.cota.trim(), data: f.data, valor, administradora: f.administradora || '' };
    const arq = form?.querySelector('#f-contrato')?.files?.[0]; let novo = null;
    if (arq) { if (!P.temArquivos()) throw new Error('O envio de arquivos não está disponível agora.'); if (arq.size > 25 * 1024 * 1024) throw new Error('O contrato passa de 25 MB.'); novo = { path: await P.enviarArquivo(arq, 'contrato'), nome: arq.name, at: nowISO() }; }
    if (id) {
      const v = S.vendas[id]; const patch = { ...d, updatedAt: nowISO() }; if (novo) patch.contratos = [...(v.contratos || []), novo];
      if (C.vendaStatus(v) === 'devolvida') { patch.reenviadaAt = nowISO(); patch.historico = hist(v.historico, { status: 'registrada', by: S.uid, at: nowISO(), motivo: 'Reenviada após correção' }); }
      await upd('vendas/' + id, patch); return 'Venda atualizada';
    }
    await add('vendas', { ...d, contratos: novo ? [novo] : [], ownerId: S.uid, equipeId: C.equipeDe(S.uid), createdAt: nowISO(), historico: [{ status: 'registrada', by: S.uid, at: nowISO() }] });
    if (ct) await mudarEtapa(ct, 'venda').catch(() => {});
    [...gestoresDe(S.uid), ...admins()].forEach(u => notify(u, `${nome(S.uid)} lançou uma venda de ${C.brl(valor)} (${V3.TIPOS[tipo].nome}, grupo ${d.grupo}, cota ${d.cota})`, 'vendas'));
    return novo ? 'Venda lançada e contrato guardado!' : 'Venda lançada! Lembre de anexar o contrato.';
  },
  async contrato(f, id, form) {
    const v = S.vendas[id]; const arq = form?.querySelector('#f-contrato')?.files?.[0]; if (!v || !arq) throw new Error('Escolha o arquivo do contrato.');
    if (!P.temArquivos()) throw new Error('O envio de arquivos não está disponível agora.'); if (arq.size > 25 * 1024 * 1024) throw new Error('O contrato passa de 25 MB.');
    const novo = { path: await P.enviarArquivo(arq, 'contrato'), nome: (f.nomeArq || '').trim() || arq.name, at: nowISO() };
    await upd('vendas/' + id, { contratos: [...(v.contratos || []), novo] }); audit('Contrato enviado', `${v.clienteNome || ''} · ${novo.nome}`);
    return 'Contrato guardado com segurança';
  },
  async venda(f, id, form) {
    const valor = parseMoney(f.valor); if (!(valor > 0)) throw new Error('Informe o valor da carta de crédito.');
    const d = { contatoId: f.contatoId, clienteNome: S.contatos[f.contatoId]?.nome || '', produto: f.produto, administradora: f.administradora || '', valor, data: f.data, proposta: f.proposta || '', prazoMeses: Number(f.prazoMeses) || null, grupo: f.grupo || '', cota: f.cota || '', obs: f.obs || '', updatedAt: nowISO() };
    if (id) { const v = S.vendas[id]; await upd('vendas/' + id, { ...d, reenviadaAt: nowISO(), historico: hist(v.historico, { status: 'registrada', by: S.uid, at: nowISO(), motivo: 'Reenviada após correção' }) }); admins().forEach(a => notify(a, `${nome(S.uid)} corrigiu e reenviou uma venda`, 'vendas')); return 'Venda reenviada para validação'; }
    const arq = form?.querySelector('#f-comprovante')?.files?.[0]; if (arq && P.temArquivos()) { if (arq.size > 10 * 1024 * 1024) throw new Error('O comprovante passa de 10 MB.'); d.comprovante = await P.enviarArquivo(arq, 'venda'); }
    await add('vendas', { ...d, ownerId: S.uid, equipeId: C.equipeDe(S.uid), createdAt: nowISO(), historico: [{ status: 'registrada', by: S.uid, at: nowISO() }] });
    const c = S.contatos[f.contatoId]; if (c) await mudarEtapa(c, 'venda');
    [...gestoresDe(S.uid), ...admins()].forEach(u => notify(u, `${nome(S.uid)} registrou uma venda de ${C.brl(valor)} para validação`, 'vendas'));
    return 'Venda registrada. Ela soma no VGV após a validação.';
  },
  async tarefa(f, id) {
    const d = { titulo: f.titulo, descricao: f.descricao || '', prazo: f.prazo || '', prioridade: f.prioridade, recorrencia: f.recorrencia || '', ownerId: f.ownerId || S.uid };
    if (id) { await upd('tarefas/' + id, d); return 'Tarefa atualizada'; }
    await add('tarefas', { ...d, equipeId: C.equipeDe(d.ownerId), status: 'aberta', createdBy: S.uid, createdAt: nowISO() });
    if (d.ownerId !== S.uid) notify(d.ownerId, `${nome(S.uid)} atribuiu uma tarefa a você: ${d.titulo}`, 'plano');
    return 'Tarefa criada';
  },
  async feedback(f, id) { await add('feedbacks', { de: S.uid, para: id, tipo: f.tipo, competencia: f.competencia, texto: f.texto, visivel: !!f.visivel, at: nowISO() }); if (f.visivel) notify(id, `Você recebeu um feedback de ${nome(S.uid)}`, 'carreira'); return 'Feedback registrado'; },
  async 'sz-aval'(f, uid) { const rub = S.config.semanaZero?.rubrica || [0, 1, 2, 3, 4]; const notas = rub.map((_, i) => Number(f['c' + i]) || 0); const media = notas.reduce((a, b) => a + b, 0) / notas.length; const min = Number(S.config.semanaZero?.notaAval) || 3.5; const prev = prog(uid).szAval; await merge('progresso/' + uid, { szAval: { notas, media, aprovado: media >= min, obs: f.obs || '', by: S.uid, at: nowISO(), tentativas: (prev?.tentativas || 0) + 1 } }, S.progresso[uid]); notify(uid, media >= min ? 'Sua simulação comercial foi aprovada!' : 'Seu gestor avaliou sua simulação. Veja os pontos para refazer.', 'semana-zero'); return 'Avaliação registrada'; },
  async 'sz-coment'(f, id) { const [uid, d] = id.split(':'); await merge('progresso/' + uid, { szComent: { [d]: f.coment } }, S.progresso[uid]); notify(uid, 'Seu gestor comentou sua resposta na Semana Zero.', 'semana-zero'); return 'Comentário salvo'; },
  async membro(f, uid) {
    const cur = S.members[uid]; const nivel = Number(f.nivel) || 0;
    if (cur && (cur.nivel || 0) !== nivel && !f.justificativa) throw new Error('Informe a justificativa para mudar o nível.');
    if (uid === S.uid && S.owner && f.role !== 'superadmin') throw new Error('O dono da plataforma permanece Superadministrador.');
    const metas = { ...(cur?.metas || {}) }; if (f.metaProsp) metas.prospeccoes = Number(f.metaProsp); else delete metas.prospeccoes;
    const d = { ...(cur || { createdAt: nowISO() }), nome: f.nome.trim(), email: (f.email || '').trim().toLowerCase(), telefone: normPhone(f.telefone), role: f.role, nivel, equipeId: f.equipeId || '', gestorId: f.gestorId || '', dataEntrada: f.dataEntrada, status: f.status, metaVgvMensal: parseMoney(f.metaVgvMensal) || null, metas, updatedAt: nowISO(), updatedBy: S.uid };
    if (cur && (cur.nivel || 0) !== nivel) d.historicoNivel = hist(cur.historicoNivel, { de: cur.nivel || 0, para: nivel, at: nowISO(), by: S.uid, justificativa: f.justificativa });
    await put('members/' + uid, d);
    if (!cur) { if (S.solicitacoes[uid]) await del('solicitacoes/' + uid); notify(uid, 'Bem-vindo! Seu acesso à Primoris Academy foi liberado.', 'inicio'); audit('Acesso liberado', d.nome); return 'Acesso liberado'; }
    audit('Usuário editado', d.nome, { de: JSON.stringify({ role: cur.role, nivel: cur.nivel, equipeId: cur.equipeId, status: cur.status }), para: JSON.stringify({ role: d.role, nivel: d.nivel, equipeId: d.equipeId, status: d.status }) });
    return 'Usuário atualizado';
  },
  async equipe(f, id) { const d = { nome: f.nome.trim(), loja: f.loja || 'Loja principal', gestorId: f.gestorId || '', updatedAt: nowISO() }; if (id) await put('equipes/' + id, { ...S.equipes[id], ...d }); else await add('equipes', { ...d, createdAt: nowISO() }); audit(id ? 'Equipe editada' : 'Equipe criada', d.nome); return 'Equipe salva'; },
  async parametros(f) {
    const lines = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean);
    const d = { ...(S.config.geral || {}), metaMilhao: parseMoney(f.metaMilhao) || C.DEFAULTS.metaMilhao, metaVgvMensal: parseMoney(f.metaVgvMensal) || null, diasEsfriando: Number(f.diasEsfriando) || 7, rankingPublico: !!f.rankingPublico, metas: Object.fromEntries(['prospeccoes', 'contatos', 'followups', 'reunioesAg', 'reunioesReal', 'treinamentos'].map(k => [k, Number(f['m_' + k]) || 0])), origens: lines(f.origens), produtos: lines(f.produtos), administradoras: lines(f.administradoras), frases: lines(f.frases).length ? lines(f.frases) : C.DEFAULTS.frases, updatedAt: nowISO(), updatedBy: S.uid };
    await put('config/geral', d); audit('Parâmetros alterados', ''); return 'Parâmetros salvos';
  },
  async curso(f, id, form) {
    const aulas = [...form.querySelectorAll('[data-row=aula]')].map(r => ({ id: r.querySelector('[name=a_id]').value || 'a' + Math.random().toString(36).slice(2, 8), titulo: r.querySelector('[name=a_titulo]').value.trim(), tipo: r.querySelector('[name=a_tipo]').value, url: r.querySelector('[name=a_url]').value.trim(), conteudo: r.querySelector('[name=a_conteudo]').value })).filter(a => a.titulo);
    const quiz = [...form.querySelectorAll('[data-row=q]')].map(r => ({ q: r.querySelector('[name=q_q]').value.trim(), opts: r.querySelector('[name=q_opts]').value.split(';').map(s => s.trim()).filter(Boolean), c: Number(r.querySelector('[name=q_c]').value) - 1 })).filter(q => q.q && q.opts.length >= 2);
    if (quiz.some(q => !(q.c >= 0 && q.c < q.opts.length))) throw new Error('Em cada questão, informe o número da alternativa correta.');
    const niveis = C.niveisCfg().map((_, i) => (f['niv' + i] ? i : null)).filter(x => x != null);
    const d = { ...(id ? S.cursos[id] : { createdAt: nowISO() }), titulo: f.titulo.trim(), escola: Number(f.escola), descricao: f.descricao || '', cargaHoraria: Number(f.cargaHoraria) || null, notaMin: Number(f.notaMin) || 70, publicado: f.publicado === '1', obrigatorio: !!f.obrigatorio, niveis, aulas, quiz, updatedAt: nowISO() };
    if (id) await put('cursos/' + id, d); else await add('cursos', d);
    audit(id ? 'Curso editado' : 'Curso criado', d.titulo); return 'Curso salvo';
  },
  async 'sz-editar'(f) {
    const dias = C.szDias().map((d, i) => ({ ...d, titulo: f['t' + i], itens: String(f['i' + i] || '').split('\n').map(s => s.trim()).filter(Boolean), atividade: { ...(d.atividade || {}), tipo: f['at' + i], minimo: Number(f['am' + i]) || null, texto: f['ax' + i] || '' }, quiz: String(f['q' + i] || '').split('\n').map(l => l.split('|').map(s => s.trim())).filter(p => p.length >= 4).map(p => ({ q: p[0], opts: p.slice(1, -1), c: Number(p.at(-1)) - 1 })) }));
    await put('config/semanaZero', { ...(S.config.semanaZero || {}), dias, updatedAt: nowISO() }); audit('Semana Zero editada', ''); return 'Semana Zero salva';
  },
  async carreira(f) {
    const niveis = C.niveisCfg().map((n, i) => ({ nome: f['n' + i] || n.nome, requisitos: String(f['r' + i] || '').split('\n').map(l => l.split('|').map(s => s.trim())).filter(p => p[0]).map((p, k) => ({ id: p[0] + '_' + k, tipo: p[0], valor: p[1] === '' ? null : isNaN(Number(p[1])) ? p[1] : Number(p[1]), label: p[2] || p[0] })) }));
    await put('config/carreira', { niveis, updatedAt: nowISO() }); audit('Carreira editada', ''); return 'Plano de carreira salvo';
  },
  async importar(f, _, form) {
    let text = f.dados || ''; const file = form.querySelector('#f-arq').files[0]; if (file) text = await file.text();
    const rows = C.parseCSV(text); if (rows.length < 2) throw new Error('Nenhuma linha encontrada. Confira a primeira linha com os títulos.');
    const h = rows[0].map(x => x.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''));
    const col = (...names) => h.findIndex(x => names.some(n => x.startsWith(n)));
    const ix = { nome: col('nome'), tel: col('telefone', 'whatsapp', 'celular', 'fone'), email: col('email', 'e-mail'), cidade: col('cidade'), uf: col('uf', 'estado'), origem: col('origem'), produto: col('produto'), valor: col('valor') };
    if (ix.nome < 0 || ix.tel < 0) throw new Error('A planilha precisa das colunas nome e telefone.');
    const out = form.querySelector('#imp-out'); let ok = 0, dup = 0, bad = 0; const vistos = new Set();
    for (const r of rows.slice(1)) {
      const nomeC = (r[ix.nome] || '').trim(), tel = normPhone(r[ix.tel]);
      if (!nomeC || tel.length < 12) { bad++; continue; }
      if (vistos.has(tel) || C.findDuplicate(tel, ix.email >= 0 ? r[ix.email] : '')) { dup++; continue; }
      const idx = await S.db.doc('dupidx/' + tel).get(); if (idx.exists && idx.data().ownerId !== S.uid) { dup++; continue; }
      vistos.add(tel);
      const g = C.geral(); const origem = ix.origem >= 0 && g.origens.includes((r[ix.origem] || '').trim()) ? r[ix.origem].trim() : 'Carteira pessoal';
      const ref = await add('contatos', { nome: nomeC, telefone: tel, telNorm: tel, email: ix.email >= 0 ? (r[ix.email] || '').trim().toLowerCase() : '', cidade: ix.cidade >= 0 ? r[ix.cidade] || '' : '', uf: ix.uf >= 0 ? (r[ix.uf] || '').trim().toUpperCase().slice(0, 2) : '', origem, produto: ix.produto >= 0 ? r[ix.produto] || '' : '', valor: ix.valor >= 0 ? parseMoney(r[ix.valor]) : 0, etapa: 'novo', ownerId: S.uid, equipeId: C.equipeDe(S.uid), createdAt: nowISO(), createdBy: S.uid, importado: true, historico: [], baseLegal: 'Legítimo interesse — atendimento comercial' });
      salvarDupIdx({ telNorm: tel, ownerId: S.uid }, ref.id); ok++;
      if (out) out.innerHTML = `<p>${ok} importados…</p>`;
    }
    audit('Importação de contatos', `${ok} importados, ${dup} duplicados, ${bad} inválidos`);
    if (out) out.innerHTML = `<div class="notice">${ok} contatos importados · ${dup} duplicados ignorados · ${bad} linhas sem nome ou telefone válido.</div>`;
    toast(`${ok} contatos importados`, 'ok'); return false;
  },
};
document.addEventListener('submit', async e => {
  const form = e.target.closest('form[data-form]'); if (!form) return;
  e.preventDefault(); const k = form.dataset.form; const fn = FORM[k]; if (!fn) return;
  const btn = form.querySelector('button:not([type=button])'); if (btn?.disabled) return; if (btn) btn.disabled = true;
  try {
    const data = {}; new FormData(form).forEach((v, key) => { if (!(v instanceof File)) data[key] = typeof v === 'string' ? v : v; });
    form.querySelectorAll('input[type=checkbox][name]').forEach(cb => { data[cb.name] = cb.checked; });
    const msg = await fn(data, form.dataset.id || '', form);
    if (msg !== false) { if ($modal.contains(form)) closeModal(); if (msg) toast(msg, 'ok'); }
    render(true);
  } catch (err) { console.error(err); toast(err?.code ? errMsg(err) : err.message || 'Não foi possível salvar.', 'bad'); }
  finally { if (btn) btn.disabled = false; }
});

// ---------- "Digitando…" no fórum
let canal = null, canalTid = null;
function ligarDigitando() {
  const tid = S.view === 'forum' ? S.sub.topico : null;
  if (tid === canalTid) return;
  canal?.sair(); canal = null; canalTid = tid;
  if (!tid) return;
  canal = P.canalDigitando(tid, d => {
    (S.digitando[tid] ||= {})[d.uid] = { ...d, t: Date.now() };
    const el = document.getElementById('digitando'); if (el) el.innerHTML = V3.digitandoHtml(tid);
    setTimeout(() => { const e2 = document.getElementById('digitando'); if (e2) e2.innerHTML = V3.digitandoHtml(tid); }, 4200);
  });
}
document.addEventListener('input', e => { const tid = e.target.dataset?.digitando; if (tid && canal && canalTid === tid) canal.avisar({ uid: S.uid, nome: nome(S.uid), papel: C.papel(S.uid) }); });

// ---------- App instalável e atualizações
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); S.installPrompt = e; schedule(); });
if ('serviceWorker' in navigator && !window.claude?.use && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
  let recarregando = false; const tinhaVersao = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (recarregando || !tinhaVersao) return; recarregando = true; if (!editing() && !$modal.innerHTML) location.reload(); });
}
setTimeout(async () => { try { if (!S.dataReady || !me()) return; const st = await P.pushStatus(); let visto = null; try { visto = localStorage.getItem('pushDica'); } catch (e) { /* */ } if (st === 'inativo' && !visto) { try { localStorage.setItem('pushDica', '1'); } catch (e) { /* */ } toast('Dica: toque no sino e ative as notificações para receber lembretes de reuniões e follow-ups.'); } } catch (e) { /* */ } }, 6000);

boot();
