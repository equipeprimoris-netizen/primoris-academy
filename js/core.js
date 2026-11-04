// Primoris Academy — núcleo: estado, banco, utilitários e cálculos.
// Todos os números exibidos são calculados a partir dos registros do banco.

export const S = {
  db: null, user: null, uid: null, owner: false, editor: false, canWrite: true,
  profile: null, ready: false, fatal: null, membersLoaded: false, started: false,
  members: {}, equipes: {}, cursos: {}, contatos: {}, atividades: {}, reunioes: {},
  vendas: {}, validacoes: {}, tarefas: {}, progresso: {}, feedbacks: {}, notifs: {},
  solicitacoes: {}, progressoes: {}, audit: {},
  config: { geral: null, semanaZero: null, carreira: null, academy: null },
  view: 'inicio', sub: {}, dash: { escopo: 'me', periodo: 'mes', equipe: '', consultor: '' },
  stale: false,
};

// ---------- Parâmetros padrão (o admin altera em Administração > Parâmetros)
export const DEFAULTS = {
  metaMilhao: 1000000,
  metas: { prospeccoes: 30, contatos: 20, reunioesAg: 3, reunioesReal: 2, followups: 10, treinamentos: 1 },
  diasEsfriando: 7,
  origens: ['Carteira pessoal', 'Indicação', 'Instagram', 'Facebook', 'Tráfego pago', 'WhatsApp', 'Prospecção ativa', 'Evento', 'Outros'],
  produtos: ['Imobiliário', 'Veículos', 'Serviços', 'Outros'],
  administradoras: [],
  motivosPerda: ['Preço', 'Momento', 'Concorrência', 'Sem crédito', 'Sem retorno', 'Outro'],
  frases: ['Vamos construir mais um dia de resultados?'],
};
export const geral = () => ({ ...DEFAULTS, ...(S.config.geral || {}), metas: { ...DEFAULTS.metas, ...((S.config.geral || {}).metas || {}) } });

export const ETAPAS = [
  { id: 'novo', nome: 'Novo contato' },
  { id: 'abordagem', nome: 'Primeira abordagem' },
  { id: 'negociacao', nome: 'Em negociação' },
  { id: 'reuniao_agendada', nome: 'Reunião agendada' },
  { id: 'reuniao_realizada', nome: 'Reunião realizada' },
  { id: 'proposta', nome: 'Proposta apresentada' },
  { id: 'followup', nome: 'Follow-up' },
  { id: 'venda', nome: 'Venda realizada' },
  { id: 'perdido', nome: 'Perdido' },
  { id: 'sem_interesse', nome: 'Sem interesse' },
];
export const etapaNome = id => (ETAPAS.find(e => e.id === id) || ETAPAS[0]).nome;
export const etapaIdx = id => Math.max(0, ETAPAS.findIndex(e => e.id === id));

export const ROLES = { consultor: 'Consultor', gestor: 'Gestor', admin: 'Administrador', superadmin: 'Superadministrador' };
export const NIVEIS_PADRAO = ['Prévia', 'Autorizado', 'Gestor Pleno', 'Gestor Sênior', 'Licenciado', 'Dono de Loja'];
export const PROSPECT_TIPOS = ['ligacao', 'whatsapp', 'email', 'visita'];
export const ATIV_NOMES = { ligacao: 'Ligação', whatsapp: 'WhatsApp', email: 'E-mail', visita: 'Visita', nota: 'Observação' };

// ---------- Utilitários
export const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const brl = n => (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
export const brlShort = n => {
  n = Number(n) || 0;
  if (Math.abs(n) >= 1e6) return 'R$ ' + (n / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' mi';
  if (Math.abs(n) >= 1e3) return 'R$ ' + (n / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + ' mil';
  return brl(n);
};
export const num = n => (Number(n) || 0).toLocaleString('pt-BR');
export const pct = (a, b) => (b > 0 ? Math.min(999, Math.round((a / b) * 100)) : 0);
const TZ = 'America/Sao_Paulo';
const dfmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
export const dayOf = d => (d ? dfmt.format(new Date(d)) : '');
export const today = () => dfmt.format(new Date());
export const nowISO = () => new Date().toISOString();
export const fmtDate = d => {
  if (!d) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) { const [y, m, dd] = d.split('-'); return `${dd}/${m}/${y}`; }
  return new Date(d).toLocaleDateString('pt-BR', { timeZone: TZ });
};
export const fmtDT = d => (d ? new Date(d).toLocaleString('pt-BR', { timeZone: TZ, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—');
export const fmtTime = d => (d ? new Date(d).toLocaleTimeString('pt-BR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }) : '');
export const addDays = (ymd, n) => { const d = new Date(ymd + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 864e5);
export const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export const monthKey = ymd => (ymd || '').slice(0, 7);
export const monthLabel = mk => { const [y, m] = mk.split('-'); return `${MESES.at(Number(m) - 1)}/${y.slice(2)}`; };
export const normPhone = p => { let d = String(p || '').replace(/\D/g, ''); if (!d) return ''; if (d.length <= 11) d = '55' + d; return d; };
export const fmtPhone = p => { const d = String(p || '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, ''); if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`; if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`; return p || ''; };
export const parseMoney = v => { if (typeof v === 'number') return v; const s = String(v || '').replace(/[^\d,.-]/g, ''); if (!s) return 0; const n = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/\.(?=\d{3}(\D|$))/g, ''); return Number(n) || 0; };
export const list = o => Object.entries(o || {}).map(([id, d]) => ({ id, ...d }));
export const initials = n => String(n || '?').trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
export const firstName = n => String(n || '').trim().split(/\s+/)[0] || '';
export const hashCode = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36).toUpperCase().padStart(7, '0').slice(0, 7); };

// ---------- Escritas (uma por documento por vez)
const queues = {};
const serial = (path, fn) => { const p = (queues[path] || Promise.resolve()).then(fn, fn); queues[path] = p.catch(() => {}); return p; };
export const put = (path, data) => serial(path, () => S.db.doc(path).set(data));
export const upd = (path, data) => serial(path, () => S.db.doc(path).update(data));
export const del = path => serial(path, () => S.db.doc(path).delete());
export const add = (coll, data) => { const ref = S.db.collection(coll).doc(); return serial(ref.path, () => ref.set(data)).then(() => ref); };
export const merge = (path, data, current) => (current ? upd(path, data) : put(path, data));
export const audit = (acao, alvo, extra = {}) => add('audit', { by: S.uid, acao, alvo: alvo || '', ...extra, at: nowISO() }).catch(() => {});
export const notify = (to, texto, link = '') => { if (to && to !== S.uid) add('notifs', { to, texto, link, at: nowISO(), lida: false }).catch(() => {}); };

// ---------- Pessoas e escopo
export const me = () => S.members[S.uid];
export const role = () => (S.owner ? 'superadmin' : me()?.role || 'consultor');
export const isAdmin = () => ['admin', 'superadmin'].includes(role());
export const isGestor = () => role() === 'gestor' || isAdmin();
export const nome = uid => S.members[uid]?.nome || S.solicitacoes[uid]?.nome || 'Usuário';
export const nivelNomes = () => (S.config.carreira?.niveis || []).map(n => n.nome).concat(NIVEIS_PADRAO).slice(0, Math.max(6, (S.config.carreira?.niveis || []).length));
export const nivelNome = i => nivelNomes()[i || 0] || NIVEIS_PADRAO[0];
export const ativos = () => list(S.members).filter(m => (m.status || 'ativo') === 'ativo');
export const minhasEquipes = () => list(S.equipes).filter(e => e.gestorId === S.uid).map(e => e.id);
export const equipeDe = uid => S.members[uid]?.equipeId || '';
export const gestorDe = uid => { const m = S.members[uid]; if (m?.gestorId) return m.gestorId; const e = S.equipes[m?.equipeId]; return e?.gestorId || ''; };
export const membrosDaEquipe = ids => ativos().filter(m => ids.includes(m.equipeId)).map(m => m.id);
export const podeVer = uid => {
  if (uid === S.uid || isAdmin()) return true;
  if (role() === 'gestor') return minhasEquipes().includes(equipeDe(uid));
  return false;
};
// Usuários no escopo atual do dashboard/relatórios
export const escopoUids = (d = S.dash) => {
  let ids;
  if (d.escopo === 'me' || !isGestor()) ids = [S.uid];
  else if (d.escopo === 'equipe') ids = isAdmin() && d.equipe ? membrosDaEquipe([d.equipe]) : membrosDaEquipe(isAdmin() && !minhasEquipes().length ? Object.keys(S.equipes) : minhasEquipes());
  else ids = ativos().map(m => m.id);
  if (d.consultor && d.escopo !== 'me') ids = ids.filter(i => i === d.consultor);
  return ids;
};

// ---------- Período
export const periodo = (p = S.dash.periodo) => {
  const t = today(); const [y, m] = t.split('-').map(Number);
  const mStart = (yy, mm) => `${yy}-${String(mm).padStart(2, '0')}-01`;
  if (p === 'hoje') return { from: t, to: t, nome: 'Hoje' };
  if (p === 'semana') return { from: addDays(t, -6), to: t, nome: 'Últimos 7 dias' };
  if (p === 'mes') return { from: mStart(y, m), to: t, nome: 'Este mês' };
  if (p === 'mesant') { const pm = m === 1 ? 12 : m - 1, py = m === 1 ? y - 1 : y; return { from: mStart(py, pm), to: addDays(mStart(y, m), -1), nome: 'Mês anterior' }; }
  if (p === 'tri') { const qm = Math.floor((m - 1) / 3) * 3 + 1; return { from: mStart(y, qm), to: t, nome: 'Este trimestre' }; }
  if (p === 'ano') return { from: `${y}-01-01`, to: t, nome: 'Este ano' };
  return { from: '2000-01-01', to: '2999-12-31', nome: 'Todo o período' };
};
export const inP = (ymd, r) => !!ymd && ymd >= r.from && ymd <= r.to;

// ---------- Vendas e VGV
export const vendaStatus = v => {
  const val = S.validacoes[v.id];
  if (val) {
    if (val.status === 'devolvida' && v.reenviadaAt && v.reenviadaAt > val.at) return 'registrada';
    return val.status;
  }
  return v.preAprovadaPor ? 'pre_aprovada' : 'registrada';
};
export const STATUS_VENDA = {
  registrada: ['Aguardando validação', 'warn'], pre_aprovada: ['Pré-aprovada pelo gestor', 'warn'],
  validada: ['Validada', 'ok'], devolvida: ['Devolvida para correção', 'warn'], reprovada: ['Reprovada', 'bad'], cancelada: ['Cancelada', 'bad'],
};
export const vendasDe = uids => list(S.vendas).filter(v => uids.includes(v.ownerId) && !v.deletedAt);
export const vgv = (uids, r, status = 'validada') => vendasDe(uids).filter(v => (!r || inP(v.data, r)) && (status === 'pendente' ? ['registrada', 'pre_aprovada'].includes(vendaStatus(v)) : vendaStatus(v) === status)).reduce((s, v) => s + (Number(v.valor) || 0), 0);
export const vgvTotal = uid => vgv([uid], null);
export const vendasValidadas = (uids, r) => vendasDe(uids).filter(v => vendaStatus(v) === 'validada' && (!r || inP(v.data, r)));
export const vgvMensal = (uids, meses = 6) => {
  const t = today(); const out = [];
  let [y, m] = t.split('-').map(Number);
  for (let i = 0; i < meses; i++) { out.unshift(`${y}-${String(m).padStart(2, '0')}`); m--; if (!m) { m = 12; y--; } }
  return out.map(mk => ({ mk, label: monthLabel(mk), valor: vendasValidadas(uids).filter(v => monthKey(v.data) === mk).reduce((s, v) => s + (Number(v.valor) || 0), 0) }));
};

// ---------- CRM
export const contatosDe = uids => list(S.contatos).filter(c => uids.includes(c.ownerId) && !c.deletedAt);
export const ativDe = (uids, r) => list(S.atividades).filter(a => uids.includes(a.ownerId) && (!r || inP(dayOf(a.at), r)));
export const prospeccoes = (uids, r) => ativDe(uids, r).filter(a => PROSPECT_TIPOS.includes(a.tipo));
export const followups = (uids, r) => prospeccoes(uids, r).filter(a => a.followup);
export const reunioesDe = (uids, r) => list(S.reunioes).filter(x => uids.includes(x.ownerId) && x.status !== 'cancelada' && (!r || inP(dayOf(x.inicio), r)));
export const funil = uids => { const cs = contatosDe(uids); return ETAPAS.map(e => ({ ...e, n: cs.filter(c => (c.etapa || 'novo') === e.id).length })); };
export const esfriando = c => { const last = c.ultimaInteracao || c.createdAt; return !['venda', 'perdido', 'sem_interesse'].includes(c.etapa) && last && daysBetween(dayOf(last), today()) >= geral().diasEsfriando; };
export const findDuplicate = (tel, email, ignoreId) => {
  const t = normPhone(tel), e = String(email || '').trim().toLowerCase();
  return list(S.contatos).find(c => c.id !== ignoreId && !c.deletedAt && ((t && c.telNorm === t) || (e && (c.email || '').toLowerCase() === e)));
};

// ---------- Progresso pessoal (Semana Zero, Academy)
export const prog = uid => S.progresso[uid] || {};
export const szDias = () => S.config.semanaZero?.dias || [];
export const szDia = (uid, d) => {
  const dia = szDias()[d]; if (!dia) return { itensOk: false, ativOk: false, done: false };
  const p = prog(uid).sz?.[d] || {};
  const itens = dia.itens || [];
  const itensFeitos = itens.filter((_, i) => p.itens?.[i]).length;
  const itensOk = itensFeitos === itens.length;
  const a = dia.atividade || { tipo: 'nenhuma' }; const min = Number(a.minimo) || 0;
  let ativOk = true, ativInfo = '';
  const r = null;
  if (a.tipo === 'quiz') ativOk = !!p.quizOk;
  else if (a.tipo === 'aceite') ativOk = !!p.aceite && (!(dia.quiz || []).length || !!p.quizOk);
  else if (a.tipo === 'contatos') { const n = contatosDe([uid]).length; ativOk = n >= min; ativInfo = `${n} de ${min}`; }
  else if (a.tipo === 'prospeccoes') { const n = prospeccoes([uid], r).length; ativOk = n >= min; ativInfo = `${n} de ${min}`; }
  else if (a.tipo === 'texto') ativOk = !!p.texto;
  else if (a.tipo === 'avaliacao') ativOk = !!prog(uid).szAval?.aprovado;
  else if (a.tipo === 'plano') ativOk = prog(uid).plano?.status === 'aprovado';
  if (a.tipo !== 'quiz' && a.tipo !== 'aceite' && (dia.quiz || []).length) ativOk = ativOk && !!p.quizOk;
  return { itensFeitos, itensTotal: itens.length, itensOk, ativOk, ativInfo, done: itensOk && ativOk };
};
export const szResumo = uid => {
  const dias = szDias(); const st = dias.map((_, i) => szDia(uid, i));
  const feitos = st.filter(s => s.done).length;
  const partes = st.reduce((a, s) => a + s.itensFeitos + (s.ativOk ? 1 : 0), 0);
  const total = st.reduce((a, s) => a + s.itensTotal + 1, 0);
  const atual = st.findIndex(s => !s.done);
  return { dias: st, feitos, total: dias.length, pct: pct(partes, total), concluida: dias.length > 0 && feitos === dias.length, atual: atual < 0 ? dias.length - 1 : atual };
};
export const cursosPublicados = () => list(S.cursos).filter(c => c.publicado !== false).sort((a, b) => (a.escola || 0) - (b.escola || 0) || (a.ordem || 0) - (b.ordem || 0) || String(a.titulo).localeCompare(b.titulo));
export const cursoStatus = (uid, c) => {
  const aulas = c.aulas || []; const feitas = aulas.filter(a => prog(uid).aulas?.[c.id]?.[a.id]).length;
  const q = prog(uid).quiz?.[c.id]; const temQuiz = (c.quiz || []).length > 0;
  const concluido = aulas.length > 0 && feitas === aulas.length && (!temQuiz || !!q?.aprovado);
  const concluidoAt = concluido ? (q?.at || Object.values(prog(uid).aulas?.[c.id] || {}).sort().at(-1)) : null;
  const iniciado = feitas > 0 || !!q;
  return { feitas, total: aulas.length, temQuiz, quiz: q, concluido, concluidoAt, iniciado, pct: pct(feitas + (temQuiz && q?.aprovado ? 1 : 0), aulas.length + (temQuiz ? 1 : 0)) };
};
export const cursosObrigatorios = uid => { const n = S.members[uid]?.nivel || 0; return cursosPublicados().filter(c => c.obrigatorio && (!(c.niveis || []).length || c.niveis.includes(n))); };
export const treinamentosConcluidos = (uids, r) => uids.reduce((s, u) => s + cursosPublicados().filter(c => { const st = cursoStatus(u, c); return st.concluido && (!r || inP(dayOf(st.concluidoAt), r)); }).length, 0);
export const certCodigo = (uid, ref) => 'PA-' + hashCode(uid + '|' + ref);

// ---------- Carreira
export const niveisCfg = () => { const n = S.config.carreira?.niveis; return n && n.length ? n : NIVEIS_PADRAO.map(nome => ({ nome, requisitos: [] })); };
export const avaliarReq = (uid, r) => {
  const p = prog(uid); let ok = false, info = '', auto = true;
  if (r.tipo === 'semanaZero') { const s = szResumo(uid); ok = s.concluida; info = `${s.feitos}/${s.total} dias`; }
  else if (r.tipo === 'vgv') { const v = vgvTotal(uid); ok = v >= Number(r.valor); info = `${brlShort(v)} de ${brlShort(r.valor)}`; }
  else if (r.tipo === 'contatos') { const n = contatosDe([uid]).length; ok = n >= Number(r.valor); info = `${n} de ${r.valor}`; }
  else if (r.tipo === 'prospeccoes') { const n = prospeccoes([uid]).length; ok = n >= Number(r.valor); info = `${n} de ${r.valor}`; }
  else if (r.tipo === 'vendas') { const n = vendasValidadas([uid]).length; ok = n >= Number(r.valor); info = `${n} de ${r.valor}`; }
  else if (r.tipo === 'cursosObrigatorios') { const cs = cursosObrigatorios(uid); const d = cs.filter(c => cursoStatus(uid, c).concluido).length; ok = d === cs.length; info = `${d}/${cs.length} cursos`; }
  else if (r.tipo === 'curso') { const c = S.cursos[r.valor]; ok = !!c && cursoStatus(uid, c).concluido; info = c?.titulo || 'Curso'; }
  else if (r.tipo === 'tempo') { const e = S.members[uid]?.dataEntrada; const m = e ? Math.floor(daysBetween(e, today()) / 30) : 0; ok = m >= Number(r.valor); info = `${m} de ${r.valor} meses`; }
  else if (r.tipo === 'equipe') { const n = ativos().filter(m => gestorDe(m.id) === uid && m.id !== uid).length; ok = n >= Number(r.valor); info = `${n} de ${r.valor} consultores`; }
  else if (r.tipo === 'documento') { auto = false; const d = p.docs?.[r.id]; ok = !!d?.conferido; info = d ? (d.conferido ? 'Conferido' : 'Enviado, aguardando conferência') : 'Pendente'; }
  else { auto = false; ok = !!p.aprovacoes?.[r.id]; info = ok ? 'Aprovado' : 'Aguardando aprovação'; }
  return { ok, info, auto };
};
export const proxNivel = uid => {
  const atual = S.members[uid]?.nivel || 0; const niveis = niveisCfg();
  if (atual >= niveis.length - 1) return null;
  const n = niveis[atual + 1]; const reqs = (n.requisitos || []).map(r => ({ ...r, ...avaliarReq(uid, r) }));
  const feitos = reqs.filter(r => r.ok).length;
  return { idx: atual + 1, nome: n.nome, reqs, feitos, total: reqs.length, pct: pct(feitos, reqs.length), definido: reqs.length > 0, apto: reqs.length > 0 && reqs.filter(r => r.auto).every(r => r.ok) };
};
export const reqsNivelAtual = uid => { const atual = S.members[uid]?.nivel || 0; return (niveisCfg()[atual]?.requisitos || []).map(r => ({ ...r, ...avaliarReq(uid, r) })); };

// ---------- Conquistas (sempre derivadas de dados validados)
export const CONQUISTAS = [
  { id: 'sz', nome: 'Semana Zero concluída', test: u => szResumo(u).concluida },
  { id: 'c50', nome: 'Primeiros 50 contatos', test: u => contatosDe([u]).length >= 50 },
  { id: 'r1', nome: 'Primeira reunião', test: u => reunioesDe([u]).some(r => r.status === 'realizada') },
  { id: 'v1', nome: 'Primeira venda', test: u => vendasValidadas([u]).length >= 1 },
  { id: 'v100', nome: 'R$ 100 mil em VGV', test: u => vgvTotal(u) >= 100000 },
  { id: 'v500', nome: 'R$ 500 mil em VGV', test: u => vgvTotal(u) >= 500000 },
  { id: 'v1m', nome: 'Primeiro milhão', test: u => vgvTotal(u) >= 1000000 },
  { id: 'n1', nome: 'Autorizado', test: u => (S.members[u]?.nivel || 0) >= 1 },
  { id: 'n2', nome: 'Gestor Pleno', test: u => (S.members[u]?.nivel || 0) >= 2 },
  { id: 'n3', nome: 'Gestor Sênior', test: u => (S.members[u]?.nivel || 0) >= 3 },
  { id: 'n4', nome: 'Licenciado', test: u => (S.members[u]?.nivel || 0) >= 4 },
  { id: 'n5', nome: 'Dono de Loja', test: u => (S.members[u]?.nivel || 0) >= 5 },
];
export const conquistasDe = uid => CONQUISTAS.map(c => ({ ...c, ok: c.test(uid) }));

// ---------- Metas
export const metasDe = uid => {
  const pl = prog(uid).plano; const doPlano = pl?.status === 'aprovado' ? { prospeccoes: Number(pl.prospeccoes) || undefined, contatos: Number(pl.contatos) || undefined } : {};
  Object.keys(doPlano).forEach(k => doPlano[k] === undefined && delete doPlano[k]);
  const ind = {}; Object.entries(S.members[uid]?.metas || {}).forEach(([k, v]) => { if (Number(v)) ind[k] = Number(v); });
  return { ...geral().metas, ...doPlano, ...ind };
};
export const metaVgvMensal = uid => Number(S.members[uid]?.metaVgvMensal || S.config.geral?.metaVgvMensal || 0);
export const metaVgvEscopo = (uids, r) => {
  const meses = Math.max(1, Math.round(daysBetween(r.from, r.to) / 30.4) || 1);
  return uids.reduce((s, u) => s + metaVgvMensal(u), 0) * (r.from === '2000-01-01' ? 0 : meses);
};

// ---------- Missão de hoje
export const missao = uid => {
  const t = today(); const r = { from: t, to: t }; const m = metasDe(uid);
  const metas = [
    { nome: 'Prospecções', feito: prospeccoes([uid], r).length, meta: m.prospeccoes },
    { nome: 'Contatos cadastrados', feito: contatosDe([uid]).filter(c => dayOf(c.createdAt) === t).length, meta: m.contatos },
    { nome: 'Follow-ups', feito: followups([uid], r).length, meta: m.followups },
    { nome: 'Reuniões agendadas', feito: list(S.reunioes).filter(x => x.ownerId === uid && dayOf(x.createdAt) === t).length, meta: m.reunioesAg },
    { nome: 'Reuniões realizadas', feito: reunioesDe([uid]).filter(x => x.status === 'realizada' && dayOf(x.realizadaAt) === t).length, meta: m.reunioesReal },
  ];
  const tarefas = list(S.tarefas).filter(x => x.ownerId === uid && x.status === 'aberta' && x.prazo && x.prazo <= t).sort((a, b) => a.prazo.localeCompare(b.prazo));
  const fups = contatosDe([uid]).filter(c => c.proximaData && c.proximaData <= t && !['venda', 'perdido', 'sem_interesse'].includes(c.etapa)).sort((a, b) => a.proximaData.localeCompare(b.proximaData));
  const reun = reunioesDe([uid]).filter(x => dayOf(x.inicio) === t && x.status === 'agendada').sort((a, b) => a.inicio.localeCompare(b.inicio));
  const cursos = cursosObrigatorios(uid).filter(c => !cursoStatus(uid, c).concluido).slice(0, 3);
  const sz = szResumo(uid);
  return { metas, tarefas, fups, reun, cursos, sz };
};
export const atrasados = uid => {
  const t = today();
  return list(S.tarefas).filter(x => x.ownerId === uid && x.status === 'aberta' && x.prazo && x.prazo < t).length
    + contatosDe([uid]).filter(c => c.proximaData && c.proximaData < t && !['venda', 'perdido', 'sem_interesse'].includes(c.etapa)).length;
};

// ---------- CSV
export const toCSV = rows => rows.map(r => r.map(v => { const s = String(v ?? ''); return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(';')).join('\n');
export const parseCSV = text => {
  const rows = []; let row = [], cur = '', q = false;
  const sep = (text.split('\n')[0].match(/;/g) || []).length >= (text.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; }
    else if (ch === '"') q = true; else if (ch === sep) { row.push(cur); cur = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
    else cur += ch;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim()));
};
