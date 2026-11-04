// Primoris Academy — telas. Funções puras que devolvem HTML a partir do estado.
import {
  S, esc, brl, brlShort, num, pct, fmtDate, fmtDT, fmtTime, today, dayOf, addDays, daysBetween, list, initials, firstName,
  ETAPAS, etapaNome, ROLES, ATIV_NOMES, PROSPECT_TIPOS, me, role, isAdmin, isGestor, nome, nivelNome, nivelNomes, ativos,
  minhasEquipes, equipeDe, gestorDe, membrosDaEquipe, podeVer, escopoUids, periodo, inP, vendaStatus, STATUS_VENDA, vendasDe,
  vgv, vgvTotal, vendasValidadas, vgvMensal, contatosDe, ativDe, prospeccoes, followups, reunioesDe, funil, esfriando, prog,
  szDias, szDia, szResumo, cursosPublicados, cursoStatus, cursosObrigatorios, treinamentosConcluidos, certCodigo, niveisCfg,
  proxNivel, reqsNivelAtual, conquistasDe, metasDe, metaVgvMensal, metaVgvEscopo, missao, atrasados, geral, fmtPhone, normPhone, monthLabel,
} from './core.js?v=7';
import * as V2 from './views2.js?v=7';
import * as V3 from './views3.js?v=7';

// ---------- Ícones (traço único, 24px)
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/>',
  flag: '<path d="M5 21V4h11l-1.5 4L16 12H5"/>',
  book: '<path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-4a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h5z"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  check: '<path d="M4 12.5 9 17.5 20 6.5"/>',
  checksq: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m7.5 12 3 3 6-6"/>',
  coins: '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/><path d="M9 15v2c0 1.7 2.7 3 6 3s6-1.3 6-3v-5c0-1.6-2.4-2.9-5.5-3"/>',
  stairs: '<path d="M3 20h5v-5h5v-5h5V5h3"/>',
  medal: '<circle cx="12" cy="15" r="5"/><path d="M8.5 11 6 3h4l2 5 2-5h4l-2.5 8"/>',
  team: '<circle cx="12" cy="7" r="3"/><circle cx="5" cy="10" r="2.2"/><circle cx="19" cy="10" r="2.2"/><path d="M7 20a5 5 0 0 1 10 0M1.5 19a3.5 3.5 0 0 1 5-3M22.5 19a3.5 3.5 0 0 0-5-3"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2"/>',
  msg: '<path d="M4 4h16v12H8l-4 4z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  play: '<path d="M7 4v16l13-8z"/>',
  file: '<path d="M6 2h8l5 5v15H6z"/><path d="M14 2v5h5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 13v4M8 21h8M9 17h6"/>',
  more: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
  download: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
  alert: '<path d="M12 3 2 21h20z"/><path d="M12 10v5M12 18v.5"/>',
  kanban: '<rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="10" rx="1"/><rect x="17" y="4" width="4" height="13" rx="1"/>',
  rows: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
  balao: '<ellipse cx="12" cy="8.6" rx="6.2" ry="7.1"/><path d="M10.8 15.6 10.2 17h3.6l-.6-1.4"/><path d="M12 17c-1.6 1.4 1.4 2.6-.2 4.6"/><path d="M14 6.3c-.4-.6-1.1-1-2-1-1.1 0-1.9.6-1.9 1.4 0 2 3.9 1.1 3.9 3.1 0 .9-.9 1.5-2 1.5-.9 0-1.6-.4-2-1M12 4.3v1M12 11.3v1"/>',
};
export const ic = (n, s = 18) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;

export const crown = (s = 40, cls = '') => `<img class="crown ${cls}" src="img/coroa-${s > 120 ? 640 : s > 40 ? 240 : 64}.webp" width="${s}" height="${Math.round(s * 0.713)}" alt="" decoding="async">`;
export const brandBig = (anim = false) => `<div class="brand-big">${crown(54, anim ? 'anim' : '')}<strong>PRIMORIS</strong><span>ACADEMY</span></div>`;

// ---------- Peças
export const chip = (txt, tone = '') => `<span class="chip ${tone}">${esc(txt)}</span>`;
export const bar = (v, accent = false) => `<div class="bar"><span class="${accent ? 'accent' : ''}" style="width:${Math.min(100, Math.max(0, v))}%"></span></div>`;
export const avatar = (uid, size = 32) => `<span class="avatar" style="width:${size}px;height:${size}px;font-size:${Math.round(size / 2.6)}px">${esc(initials(nome(uid)))}</span>`;
export const empty = (titulo, texto, acao = '') => `<div class="empty"><strong>${esc(titulo)}</strong><p>${esc(texto)}</p>${acao}</div>`;
export const card = (titulo, body, extra = '', cls = '') => `<section class="card ${cls}"><header class="card-h"><h3>${titulo}</h3>${extra}</header>${body}</section>`;
export const kpi = (label, valor, sub = '', link = '', accent = false, n = null, f = 'num') => `<button class="kpi ${accent ? 'accent' : ''}" ${link ? `data-act="go" data-id="${link}"` : 'disabled'}><span class="kpi-l">${esc(label)}</span><span class="kpi-v" ${n != null ? `data-n="${n}" data-f="${f}"` : ''}>${valor}</span>${sub ? `<span class="kpi-s">${sub}</span>` : ''}</button>`;
export const opt = (v, l, sel) => `<option value="${esc(v)}" ${String(v) === String(sel) ? 'selected' : ''}>${esc(l)}</option>`;
export const field = (label, input, cls = '') => `<label class="field ${cls}"><span>${label}</span>${input}</label>`;
export const inp = (name, val = '', attrs = '') => `<input id="f-${name}" name="${name}" value="${esc(val)}" ${attrs}>`;
export const sel = (name, opts, val, attrs = '') => `<select id="f-${name}" name="${name}" ${attrs}>${opts.map(o => (Array.isArray(o) ? opt(o[0], o[1], val) : opt(o, o, val))).join('')}</select>`;
export const txt = (name, val = '', attrs = '') => `<textarea id="f-${name}" name="${name}" ${attrs}>${esc(val)}</textarea>`;
export const statusVenda = v => { const [l, t] = STATUS_VENDA[vendaStatus(v)] || ['—', '']; return chip(l, t); };
const podeEscrever = () => S.canWrite !== false;

export const barChart = (items, { money = true, h = 180 } = {}) => {
  const max = Math.max(1, ...items.map(i => i.valor)); const w = 100 / items.length;
  return `<div class="bchart" style="height:${h}px">${items.map((i, k) => `<div class="bcol" style="width:${w}%"><span class="bval">${i.valor ? (money ? brlShort(i.valor) : num(i.valor)) : ''}</span><span class="bbar ${k === items.length - 1 ? 'last' : ''}" style="height:${Math.max(2, (i.valor / max) * (h - 44))}px"></span><span class="blab">${esc(i.label)}</span></div>`).join('')}</div>`;
};
const funilChart = (uids) => {
  const f = funil(uids).filter(e => !['perdido', 'sem_interesse'].includes(e.id)); const max = Math.max(1, ...f.map(e => e.n));
  const perdidos = funil(uids).filter(e => ['perdido', 'sem_interesse'].includes(e.id)).reduce((s, e) => s + e.n, 0);
  return `<div class="funil">${f.map(e => `<div class="frow"><span class="fl">${esc(e.nome)}</span><span class="fb"><span style="width:${(e.n / max) * 100}%"></span></span><span class="fn">${num(e.n)}</span></div>`).join('')}</div><p class="muted small">Perdidos ou sem interesse: ${num(perdidos)}</p>`;
};

const desafioAtivoV = () => { try { return V2.desafioCard ? (S.config.desafios?.lista || []).filter(d => d.ativo !== false && d.inicio <= today() && d.fim >= today()) : []; } catch (e) { return []; } };
export const embedVideo = url => { if (!url) return null; let m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/); if (m) return { tipo: 'youtube', id: m[1] }; m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/); if (m) return { tipo: 'vimeo', id: m[1] }; return null; };

const WA_ICON = '<svg class="ic" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3 1 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2 .7 2.8.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.2Z"/></svg>';
const projecaoMin = u => { const { mesesMilhao, falta } = projecaoLeve(u); return falta === 0 ? 0 : mesesMilhao; };
const projecaoLeve = u => { const mm = geral().metaMilhao; const tot = vgvTotal(u); const falta = Math.max(0, mm - tot); const m = vgvMensal([u], 3).reduce((s, x) => s + x.valor, 0) / 3; return { falta, mesesMilhao: falta && m > 0 ? Math.ceil(falta / m) : null }; };

// ---------- Telas de entrada
export const loading = (msg = 'Preparando sua jornada…') => `<div class="center-screen boot">${brandBig(true)}<div class="boot-line"><span></span></div><p class="muted small">${esc(msg)}</p></div>`;
export const fatal = msg => `<div class="center-screen">${brandBig()}<div class="notice">${esc(msg)}</div></div>`;

export const solicitarAcesso = () => {
  const s = S.solicitacoes[S.uid]; const p = S.profile || {};
  if (s) return `<div class="center-screen"><div class="login-card">${brandBig()}<h2>Solicitação enviada</h2><p class="muted">Recebemos seu pedido em ${fmtDT(s.at)}. Assim que um administrador liberar seu acesso, esta página abre automaticamente.</p><button class="linkbtn small" data-act="sair">Entrar com outra conta Google</button></div></div>`;
  if (!podeEscrever()) return fatal('Seu acesso a este link está como Visualizador. Peça ao administrador da Primoris para compartilhar com você como Contribuidor.');
  return `<div class="center-screen"><form class="login-card" data-form="solicitar">
    ${brandBig()}
    <h2>Solicite seu acesso</h2>
    <p class="muted">A Primoris Academy é exclusiva para integrantes da operação. Preencha seus dados e o administrador vai liberar seu acesso, definir sua equipe e seu gestor.</p>
    ${field('Nome completo', inp('nome', p.name || '', 'required autocomplete="name"'))}
    ${field('E-mail', inp('email', p.email || '', 'type="email" required autocomplete="email"'))}
    ${field('WhatsApp', inp('telefone', '', 'required inputmode="tel" placeholder="(11) 99999-9999"'))}
    <label class="check"><input type="checkbox" name="aceite" id="f-aceite" required> <span>Li e aceito o Termo de Uso e a Política de Privacidade da Primoris Academy.</span></label>
    <button class="btn accent block" type="submit">Enviar solicitação</button>
    <button type="button" class="linkbtn small" data-act="sair">Entrar com outra conta Google</button>
  </form></div>`;
};
const G_LOGO = '<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
export const login = () => `<div class="center-screen"><div class="login-card">
  ${brandBig(true)}
  <h2>Acesse sua conta</h2>
  <p class="muted">Entre com a conta Google cadastrada na Primoris. Consultores, gestores e administradores usam o mesmo acesso.</p>
  <button class="google-btn" data-act="google-login">${G_LOGO}<span>Entrar com Google</span></button>
  <p class="muted small">Primeiro acesso? Entre com o Google e solicite a liberação: o administrador define sua equipe e seu gestor.</p>
</div></div>`;
export const bloqueado = () => `<div class="center-screen">${brandBig()}<div class="notice">Acesso suspenso. Fale com seu gestor.</div><button class="linkbtn small" data-act="sair">Sair</button></div>`;

export const boasVindas = () => `<div class="center-screen welcome"><form class="login-card wide" data-form="boasvindas">
  ${brandBig()}
  <h1 class="display">Bem-vindo à Primoris Academy</h1>
  <p>Aqui começa sua jornada de desenvolvimento profissional.</p>
  <p class="muted">Você terá acesso a treinamentos, ferramentas comerciais, acompanhamento de resultados e um plano de carreira estruturado. Seu primeiro objetivo é concluir a Semana Zero e iniciar sua jornada até o primeiro milhão em VGV.</p>
  ${field('Qual é o seu objetivo nos próximos 12 meses?', txt('objetivo', '', 'rows="3" placeholder="Ex.: chegar a Autorizado e montar minha primeira equipe"'))}
  <button class="btn accent block" type="submit">COMEÇAR MINHA JORNADA ${ic('arrow')}</button>
</form></div>`;

// ---------- Estrutura (mesma para todos os perfis)
export const NAV = () => {
  const n = [
    ['inicio', 'Início', 'home'],
    ['resumo', 'Resumo da semana', 'chart'],
    ...(!szResumo(S.uid).concluida && szDias().length ? [['semana-zero', 'Semana Zero', 'flag']] : []),
    ['academy', 'Academy', 'book'],
    ['forum', 'Fórum', 'msg'],
    ['eventos', 'Eventos', 'balao'],
    ['carteira', 'Minha Carteira', 'users'],
    ['agenda', 'Agenda', 'calendar'],
    ['plano', 'Plano de Ação', 'checksq'],
    ['vendas', 'Meu Primeiro Milhão', 'coins'],
    ['carreira', 'Minha Evolução', 'stairs'],
    ['conquistas', 'Conquistas', 'medal'],
  ];
  if (szResumo(S.uid).concluida) n.splice(1, 0); // Semana Zero sai do menu após a conclusão
  if (isGestor()) n.push(['equipe', 'Minha Equipe', 'team'], ['relatorios', 'Relatórios', 'chart']);
  if (isAdmin()) n.push(['admin', 'Administração', 'gear']);
  return n;
};

export const shell = content => {
  const m = me() || {}; const naoLidas = list(S.notifs).filter(x => !x.lida).length; const h = new Date().getHours();
  const saud = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; const frases = geral().frases; const frase = frases[new Date().getDate() % frases.length];
  const gestor = gestorDe(S.uid); const nav = NAV();
  const pend = isAdmin() ? Object.keys(S.solicitacoes).length + list(S.vendas).filter(v => ['registrada', 'pre_aprovada'].includes(vendaStatus(v))).length + list(S.progressoes).filter(p => p.status === 'solicitada').length : 0;
  return `<div class="app">
  <aside class="side" id="side">
    <div class="side-brand"><span class="mark">${crown(26)}</span><div><strong>PRIMORIS</strong><small>ACADEMY</small></div></div>
    <nav>${nav.map(([id, l, i]) => `<a href="#${id}" class="${S.view === id ? 'on' : ''}">${ic(i)}<span>${l}</span>${id === 'admin' && pend ? `<em class="badge">${pend}</em>` : ''}</a>`).join('')}</nav>
    <a class="wa-grupo" href="https://chat.whatsapp.com/Ds8L37GWUHyBvAFvxwFAM2" target="_blank" rel="noopener">${WA_ICON}<span>Grupo Primoris no WhatsApp</span></a>${S.installPrompt ? `<button class="install" data-act="instalar">${ic('download', 16)} Instalar app</button>` : ''}<div class="side-foot"><span class="muted small">${esc(ROLES[role()])}</span><button class="linkbtn small" data-act="sair">Sair</button></div>
  </aside>
  <div class="main">
    <header class="top">
      <button class="iconbtn only-m" data-act="menu" aria-label="Abrir menu">${ic('menu')}</button>
      <div class="hello"><h1>${saud}, ${esc(firstName(m.nome))}!</h1><p class="muted">${esc(frase)}</p></div>
      <div class="top-r">
        <div class="who hide-s"><span class="chip accent">${esc(nivelNome(m.nivel))}</span><span class="muted small">${gestor && gestor !== S.uid ? 'Gestor: ' + esc(nome(gestor)) : esc(ROLES[role()])} · ${fmtDate(today())}</span></div>
        <button class="btn accent sm hide-s" data-act="novo">${ic('plus', 16)} Novo</button>
        <a class="iconbtn wa-top" href="https://chat.whatsapp.com/Ds8L37GWUHyBvAFvxwFAM2" target="_blank" rel="noopener" aria-label="Grupo Primoris no WhatsApp" title="Grupo Primoris no WhatsApp">${WA_ICON}</a>
        <button class="iconbtn bell" data-act="notifs" aria-label="Notificações">${ic('bell')}${naoLidas ? `<em class="badge">${naoLidas}</em>` : ''}</button>
        ${avatar(S.uid, 36)}
      </div>
    </header>
    ${S.stale ? '<div class="notice slim">Conexão lenta: os dados podem estar desatualizados.</div>' : ''}
    ${isAdmin() && !S.editor ? '<div class="notice slim">Seu perfil é Administrador, mas este link está compartilhado com você sem permissão de Editor. Peça ao dono para alterar seu acesso para Editor; até lá, ações administrativas serão recusadas.</div>' : ''}
    <main id="view">${content}</main>
  </div>
  <nav class="bottom">${[['inicio', 'Início', 'home'], ['carteira', 'Carteira', 'users'], ['+', 'Novo', 'plus'], ['agenda', 'Agenda', 'calendar'], ['mais', 'Mais', 'more']].map(([id, l, i]) => id === '+' ? `<button class="fab" data-act="novo" aria-label="Novo">${ic('plus', 22)}</button>` : id === 'mais' ? `<button data-act="menu">${ic(i)}<span>${l}</span></button>` : `<a href="#${id}" class="${S.view === id ? 'on' : ''}">${ic(i)}<span>${l}</span></a>`).join('')}</nav>
</div>`;
};
export const pageHead = (titulo, sub = '', acoes = '') => `<div class="ph"><div><h2 class="display">${titulo}</h2>${sub ? `<p class="muted">${sub}</p>` : ''}</div><div class="ph-a">${acoes}</div></div>`;

// ---------- Filtros padrão
const filtroBar = (opts = {}) => {
  const d = S.dash; const eqs = list(S.equipes);
  const pessoas = isAdmin() ? ativos() : ativos().filter(m => minhasEquipes().includes(m.equipeId));
  return `<div class="filters">
    ${isGestor() ? `<select data-filter="escopo" aria-label="Escopo">${opt('me', 'Eu', d.escopo)}${opt('equipe', isAdmin() ? 'Equipe' : 'Minha equipe', d.escopo)}${isAdmin() ? opt('todos', 'Toda a operação', d.escopo) : ''}</select>` : ''}
    ${isAdmin() && d.escopo === 'equipe' ? `<select data-filter="equipe" aria-label="Equipe">${opt('', 'Todas as equipes', d.equipe)}${eqs.map(e => opt(e.id, e.nome, d.equipe)).join('')}</select>` : ''}
    ${isGestor() && d.escopo !== 'me' ? `<select data-filter="consultor" aria-label="Consultor">${opt('', 'Todos os consultores', d.consultor)}${pessoas.map(m => opt(m.id, m.nome, d.consultor)).join('')}</select>` : ''}
    ${opts.semPeriodo ? '' : `<select data-filter="periodo" aria-label="Período">${[['hoje', 'Hoje'], ['semana', 'Últimos 7 dias'], ['mes', 'Este mês'], ['mesant', 'Mês anterior'], ['tri', 'Este trimestre'], ['ano', 'Este ano'], ['tudo', 'Todo o período']].map(([v, l]) => opt(v, l, d.periodo)).join('')}</select>`}
  </div>`;
};

// ---------- INÍCIO (dashboard único)
export const inicio = () => {
  const uids = escopoUids(); const r = periodo(); const eu = S.dash.escopo === 'me' || !isGestor();
  const val = vgv(uids, r), pend = vgv(uids, r, 'pendente'), meta = metaVgvEscopo(uids, r);
  const cont = contatosDe(uids); const novos = cont.filter(c => inP(dayOf(c.createdAt), r)).length;
  const reun = reunioesDe(uids, r); const vendas = vendasValidadas(uids, r).length;
  const realizadas = reun.filter(x => x.status === 'realizada').length;
  const kpis = `<div class="kpis">
    ${kpi('VGV validado', brlShort(val), pend ? `+ ${brlShort(pend)} aguardando validação` : r.nome, 'vendas', true, val, 'brl')}
    ${kpi('Meta de VGV', meta ? brlShort(meta) : 'Não definida', meta ? r.nome : 'O administrador define em Parâmetros', 'vendas')}
    ${kpi('% da meta', meta ? pct(val, meta) + '%' : '—', meta ? bar(pct(val, meta), true) : '', 'vendas', false, meta ? pct(val, meta) : null, 'pct')}
    ${kpi('Contatos', num(cont.length), `${num(novos)} novos no período`, 'carteira', false, cont.length)}
    ${kpi('Prospecções', num(prospeccoes(uids, r).length), r.nome, 'carteira', false, prospeccoes(uids, r).length)}
    ${kpi('Reuniões agendadas', num(reun.length), r.nome, 'agenda', false, reun.length)}
    ${kpi('Reuniões realizadas', num(realizadas), reun.length ? pct(realizadas, reun.length) + '% das agendadas' : r.nome, 'agenda', false, realizadas)}
    ${kpi('Vendas', num(vendas), realizadas ? pct(vendas, realizadas) + '% das reuniões' : 'validadas', 'vendas', false, vendas)}
  </div>`;
  let linha2, linha3, linha5;
  if (eu) {
    const pn = proxNivel(S.uid); const tot = vgvTotal(S.uid); const mm = geral().metaMilhao;
    linha2 = card('Minha evolução', pn ? `<div class="evo"><div><span class="muted small">Nível atual</span><strong class="accent-t">${esc(nivelNome(me()?.nivel))}</strong></div>${ic('arrow')}<div><span class="muted small">Próximo nível</span><strong>${esc(pn.nome)}</strong></div></div>
      ${pn.definido ? `${bar(pn.pct, true)}<p class="small">${pn.feitos} de ${pn.total} requisitos concluídos</p><ul class="reqs">${pn.reqs.slice(0, 4).map(q => `<li class="${q.ok ? 'ok' : ''}">${ic(q.ok ? 'check' : 'lock', 14)} ${esc(q.label)} <span class="muted small">${esc(q.info)}</span></li>`).join('')}</ul>` : '<p class="muted">Critérios em definição pela diretoria.</p>'}` : '<p>Você chegou ao topo da carreira.</p>', '<a href="#carreira" class="link">Ver carreira</a>')
      + card('Meu Primeiro Milhão', `<div class="milhao"><strong class="big accent-t">${brlShort(tot)}</strong><span class="muted">de ${brlShort(mm)}</span></div>${bar(pct(tot, mm), true)}<div class="row3"><div><span class="muted small">Restante</span><strong>${brlShort(Math.max(0, mm - tot))}</strong></div><div><span class="muted small">Progresso</span><strong>${pct(tot, mm)}%</strong></div><div><span class="muted small">Vendas</span><strong>${vendasValidadas([S.uid]).length}</strong></div></div>`, '<a href="#vendas" class="link">Abrir</a>');
    const ms = missao(S.uid);
    const itens = [
      ...(!ms.sz.concluida && szDias().length ? [`<li><a href="#semana-zero">${ic('flag', 16)} Semana Zero: Dia ${ms.sz.atual + 1} pendente</a></li>`] : []),
      ...ms.reun.map(x => `<li>${ic('calendar', 16)} ${fmtTime(x.inicio)} · ${esc(x.titulo || 'Reunião')} ${x.contatoId ? '· ' + esc(S.contatos[x.contatoId]?.nome || '') : ''}</li>`),
      ...ms.tarefas.map(t => `<li><label class="check"><input type="checkbox" data-act="tarefa-ok" data-id="${t.id}"> <span>${esc(t.titulo)} ${t.prazo < today() ? chip('Atrasada', 'bad') : ''}</span></label></li>`),
      ...ms.fups.slice(0, 6).map(c => `<li><button class="linkbtn" data-act="contato" data-id="${c.id}">${ic('phone', 16)} Follow-up: ${esc(c.nome)}</button> ${c.proximaData < today() ? chip('Atrasado', 'bad') : ''}</li>`),
      ...ms.cursos.map(c => `<li><a href="#academy" data-act="curso" data-id="${c.id}">${ic('book', 16)} Treinamento: ${esc(c.titulo)}</a></li>`),
    ];
    linha3 = card('Minha missão de hoje', `<div class="metas-dia">${ms.metas.map(x => `<div class="md"><span class="small">${esc(x.nome)}</span><strong>${x.feito}<small>/${x.meta}</small></strong>${bar(pct(x.feito, x.meta), x.feito >= x.meta)}</div>`).join('')}</div>
      ${itens.length ? `<ul class="todo">${itens.join('')}</ul>` : '<p class="muted">Nenhuma pendência para hoje. Que tal prospectar novos contatos?</p>'}`, `<a href="#plano" class="link">Plano de ação</a>`, 'span2');
    const prox = reunioesDe([S.uid]).filter(x => x.status === 'agendada' && x.inicio >= nowISOsafe()).sort((a, b) => a.inicio.localeCompare(b.inicio)).slice(0, 5);
    const rec = cursosObrigatorios(S.uid).find(c => !cursoStatus(S.uid, c).concluido) || cursosPublicados().find(c => !cursoStatus(S.uid, c).concluido);
    linha5 = card('Próximas reuniões', prox.length ? `<ul class="lst">${prox.map(x => `<li><span>${fmtDT(x.inicio)}</span><span>${esc(x.titulo || 'Reunião')}${x.contatoId ? ' · ' + esc(S.contatos[x.contatoId]?.nome || '') : ''}</span></li>`).join('')}</ul>` : empty('Sem reuniões agendadas', 'Agende pela sua carteira de contatos.'), '<a href="#agenda" class="link">Agenda</a>')
      + card('Treinamento recomendado', rec ? `<p><strong>${esc(rec.titulo)}</strong></p><p class="muted small">${esc(rec.descricao || '')}</p>${bar(cursoStatus(S.uid, rec).pct)}<button class="btn sm" data-act="curso" data-id="${rec.id}">Continuar</button>` : '<p class="muted">Você concluiu todos os treinamentos publicados.</p>');
  } else {
    const pessoas = uids.map(u => ({ u, v: vgvTotal(u) }));
    const porNivel = nivelNomes().slice(0, 6).map((n, i) => ({ label: n, valor: uids.filter(u => (S.members[u]?.nivel || 0) === i).length }));
    const mm = geral().metaMilhao;
    linha2 = card('Consultores por nível', barChart(porNivel, { money: false, h: 160 }), `<span class="muted small">${uids.length} ativos · ${uids.filter(u => !szResumo(u).concluida).length} em Semana Zero</span>`)
      + card('Próximos do primeiro milhão', (() => { const l = pessoas.filter(p => p.v < mm && p.v >= mm * 0.5).sort((a, b) => b.v - a.v).slice(0, 6); return l.length ? `<ul class="lst">${l.map(p => `<li><button class="linkbtn" data-act="perfil" data-id="${p.u}">${esc(nome(p.u))}</button><span>${brlShort(p.v)} · ${pct(p.v, mm)}%</span></li>`).join('')}</ul>` : empty('Ninguém acima de 50% ainda', 'A lista mostra quem já passou da metade do primeiro milhão.'); })());
    const atr = uids.map(u => ({ u, n: atrasados(u) })).filter(x => x.n).sort((a, b) => b.n - a.n).slice(0, 8);
    const novosInt = uids.filter(u => inP(S.members[u]?.dataEntrada, r)).length;
    linha3 = card('Atividades atrasadas', atr.length ? `<ul class="lst">${atr.map(x => `<li><button class="linkbtn" data-act="perfil" data-id="${x.u}">${esc(nome(x.u))}</button>${chip(x.n + ' atrasadas', 'bad')}</li>`).join('')}</ul>` : empty('Tudo em dia', 'Nenhum consultor do escopo tem tarefas ou follow-ups vencidos.'), `<span class="muted small">${novosInt} novos integrantes no período · ${treinamentosConcluidos(uids, r)} treinamentos concluídos</span>`, 'span2');
    const rk = uids.map(u => ({ u, v: vgv([u], r), n: vendasValidadas([u], r).length })).sort((a, b) => b.v - a.v).slice(0, 10);
    linha5 = card('Ranking de VGV', rk.length ? `<ol class="rank">${rk.map((x, i) => `<li><span class="pos ${i < 3 ? 'accent-t' : ''}">${i + 1}</span><button class="linkbtn" data-act="perfil" data-id="${x.u}">${esc(nome(x.u))}</button><span>${brlShort(x.v)} · ${x.n} vendas</span></li>`).join('')}</ol>` : empty('Sem dados', 'Nenhum consultor no escopo.'), `<span class="muted small">${r.nome}</span>`)
      + card('Conversão comercial', (() => { const ag = reun.length, re = realizadas, cts = cont.length; return `<div class="row3"><div><span class="muted small">Contato → reunião</span><strong>${pct(ag, cts)}%</strong></div><div><span class="muted small">Agendada → realizada</span><strong>${pct(re, ag)}%</strong></div><div><span class="muted small">Reunião → venda</span><strong>${pct(vendas, re)}%</strong></div></div>`; })());
  }
  const dAt = desafioAtivoV(); const desafioHtml = dAt.length ? card('Desafio da semana', dAt.map(d => V2.desafioCard(d, eu ? [S.uid] : uids)).join(''), '<a href="#conquistas" class="link">Ver todos</a>', 'span2') : '';
  const grafico = card('Evolução mensal do VGV validado', barChart(vgvMensal(uids, 6)), '<span class="muted small">últimos 6 meses</span>') + card('Funil da carteira', funilChart(uids));
  const conq = eu ? (() => { const c = conquistasDe(S.uid).filter(x => x.ok); return card('Conquistas', c.length ? `<div class="medals sm">${c.slice(-6).map(x => `<span class="medal on">${ic('medal', 20)}<small>${esc(x.nome)}</small></span>`).join('')}</div>` : empty('Primeira conquista à vista', 'Conclua a Semana Zero para ganhar sua primeira medalha.'), '<a href="#conquistas" class="link">Ver todas</a>', 'span2'); })() : '';
  return `${V3.eventosTile()}${filtroBar()}${kpis}<div class="grid2">${linha2}${linha3}${desafioHtml}${grafico}${linha5}${conq}</div>`;
};
const nowISOsafe = () => new Date().toISOString();

// ---------- SEMANA ZERO
export const semanaZero = (uid = S.uid) => {
  const dias = szDias(); if (!dias.length) return pageHead('Semana Zero') + empty('Conteúdo em preparação', 'O administrador ainda não publicou a trilha da Semana Zero.');
  const rs = szResumo(uid); const d = Math.min(S.sub.szDia ?? rs.atual, dias.length - 1); const dia = dias[d];
  const seq = (S.config.semanaZero?.liberacao || 'sequencial') === 'sequencial';
  const liberado = i => !seq || i === 0 || rs.dias[i - 1].done;
  const st = rs.dias[d]; const p = prog(uid).sz?.[d] || {}; const a = dia.atividade || {};
  let ativ = '';
  if (a.tipo === 'aceite') ativ = `<label class="check"><input type="checkbox" data-act="sz-aceite" data-id="${d}" ${p.aceite ? 'checked disabled' : ''}> <span>${esc(a.texto || 'Li e aceito o Código de Conduta da Primoris.')}</span></label>`;
  else if (a.tipo === 'contatos' || a.tipo === 'prospeccoes') ativ = `<p>${esc(a.texto || '')}</p><div class="prog-line"><strong>${st.ativInfo}</strong>${bar(pct(parseInt(st.ativInfo), Number(a.minimo) || 1), st.ativOk)}</div><p class="muted small">Contado automaticamente a partir dos seus registros reais no CRM.</p><a class="btn sm" href="#carteira">Ir para Minha Carteira</a>`;
  else if (a.tipo === 'texto') ativ = p.texto ? `<p class="muted small">Enviado em ${fmtDT(p.textoAt)}</p><blockquote>${esc(p.texto)}</blockquote>${prog(uid).szComent?.[d] ? `<p><strong>Comentário do gestor:</strong> ${esc(prog(uid).szComent[d])}</p>` : ''}` : `<form data-form="sz-texto" data-id="${d}">${field(esc(a.texto || 'Sua resposta'), txt('texto', '', 'rows="5" required'))}<button class="btn sm primary">Enviar</button></form>`;
  else if (a.tipo === 'avaliacao') { const av = prog(uid).szAval; ativ = `<p>${esc(a.texto || 'Simulação comercial avaliada pelo seu gestor.')}</p>${av ? `<p>Média ${av.media?.toFixed(1)} · ${av.aprovado ? chip('Aprovado', 'ok') : chip('Refazer', 'warn')} <span class="muted small">por ${esc(nome(av.by))} em ${fmtDT(av.at)}</span></p>${av.obs ? `<blockquote>${esc(av.obs)}</blockquote>` : ''}` : chip('Aguardando avaliação do gestor', 'warn')}`; }
  else if (a.tipo === 'plano') {
    const pl = prog(uid).plano;
    ativ = pl ? `<div class="kv"><span>Prospecções por dia</span><strong>${pl.prospeccoes}</strong><span>Contatos por dia</span><strong>${pl.contatos}</strong><span>Reuniões por semana</span><strong>${pl.reunioes}</strong><span>Meta de VGV em 90 dias</span><strong>${brl(pl.vgv90)}</strong><span>Rotina</span><strong>${esc(pl.rotina)}</strong></div><p>${pl.status === 'aprovado' ? chip('Aprovado pelo gestor', 'ok') : pl.status === 'devolvido' ? chip('Devolvido: ' + (pl.motivo || ''), 'warn') : chip('Aguardando validação do gestor', 'warn')}</p>${pl.status !== 'aprovado' && uid === S.uid ? '<button class="btn sm" data-act="sz-plano-edit">Editar plano</button>' : ''}` : (uid === S.uid ? planoForm() : chip('Plano não enviado', 'warn'));
    if (pl && S.sub.planoEdit && uid === S.uid) ativ = planoForm(pl);
  }
  const quiz = (dia.quiz || []).length ? `<h4>Avaliação do dia</h4>${p.quizOk ? `<p>${chip('Aprovado com ' + p.quizNota + '%', 'ok')}</p>` : quizForm('sz-quiz', d, dia.quiz, p.quizNota)}` : '';
  return pageHead('Semana Zero', 'Sua jornada de integração em 7 dias. O progresso é salvo a cada ação.', `<div class="pill-big">${rs.pct}%</div>`)
    + `<div class="card"><div class="sz-days">${dias.map((x, i) => `<button class="szd ${i === d ? 'on' : ''} ${rs.dias[i].done ? 'done' : ''}" data-act="sz-dia" data-id="${i}" ${liberado(i) ? '' : 'disabled'}><span>Dia ${i + 1}</span><small>${esc(x.titulo)}</small>${rs.dias[i].done ? ic('check', 14) : liberado(i) ? '' : ic('lock', 14)}</button>`).join('')}</div>${bar(rs.pct, true)}<p class="small muted">${rs.feitos} de ${rs.total} dias concluídos</p></div>`
    + (liberado(d) ? `<div class="grid2"><section class="card"><header class="card-h"><h3>Dia ${d + 1} — ${esc(dia.titulo)}</h3>${st.done ? chip('Concluído', 'ok') : ''}</header>
      ${dia.descricao ? `<p class="muted">${esc(dia.descricao)}</p>` : ''}
      <ul class="sz-itens">${(dia.itens || []).map((it, i) => `<li><label class="check"><input type="checkbox" data-act="sz-item" data-id="${d}:${i}" ${p.itens?.[i] ? 'checked' : ''} ${uid !== S.uid ? 'disabled' : ''}> <span>${esc(it)}</span></label></li>`).join('')}</ul>
      ${(dia.materiais || []).length ? `<h4>Materiais</h4><ul class="lst">${dia.materiais.map(m => `<li><a href="${esc(m.url)}" target="_blank" rel="noopener">${ic('file', 16)} ${esc(m.titulo)}</a></li>`).join('')}</ul>` : ''}
      </section><section class="card"><header class="card-h"><h3>Atividade obrigatória</h3>${st.ativOk ? chip('Cumprida', 'ok') : chip('Pendente', 'warn')}</header>${ativ}${quiz}</section></div>` : empty('Dia bloqueado', 'Conclua o dia anterior para liberar este conteúdo.'));
};
const planoForm = (pl = {}) => `<form data-form="sz-plano"><div class="form-grid">
  ${field('Prospecções por dia', inp('prospeccoes', pl.prospeccoes || metasDe(S.uid).prospeccoes, 'type="number" min="0" required'))}
  ${field('Contatos novos por dia', inp('contatos', pl.contatos || metasDe(S.uid).contatos, 'type="number" min="0" required'))}
  ${field('Reuniões por semana', inp('reunioes', pl.reunioes || 10, 'type="number" min="0" required'))}
  ${field('Meta de VGV em 90 dias (R$)', inp('vgv90', pl.vgv90 || '', 'inputmode="decimal" required'))}
  </div>${field('Minha rotina (horários de prospecção, reuniões e estudo)', txt('rotina', pl.rotina || '', 'rows="3" required'))}
  <button class="btn primary sm">Enviar para o gestor</button></form>`;
export const quizForm = (form, id, qs, nota) => `<form data-form="${form}" data-id="${esc(id)}" class="quiz">${qs.map((q, i) => `<fieldset><legend>${i + 1}. ${esc(q.q)}</legend>${(q.opts || []).map((o, j) => `<label class="check"><input type="radio" name="q${i}" value="${j}" required> <span>${esc(o)}</span></label>`).join('')}</fieldset>`).join('')}${nota != null ? `<p>${chip('Última tentativa: ' + nota + '%', 'warn')}</p>` : ''}<button class="btn primary sm">Enviar respostas</button></form>`;

// ---------- ACADEMY
export const academy = () => {
  const escolas = S.config.academy?.escolas || []; const cursos = cursosPublicados(); const tab = S.sub.acTab || 'escolas';
  if (S.sub.curso && S.cursos[S.sub.curso]) return cursoView(S.cursos[S.sub.curso]);
  const tabs = `<div class="tabs">${[['escolas', 'Escolas'], ['meus', 'Meus treinamentos'], ['certificados', 'Certificados']].map(([v, l]) => `<button class="${tab === v ? 'on' : ''}" data-act="ac-tab" data-id="${v}">${l}</button>`).join('')}</div>`;
  let body = '';
  if (tab === 'escolas') {
    if (S.sub.escola != null) {
      const e = escolas.find(x => x.n === S.sub.escola) || { n: S.sub.escola, nome: 'Escola' }; const cs = cursos.filter(c => c.escola === e.n);
      body = `<button class="linkbtn" data-act="escola" data-id="">${ic('back', 16)} Todas as escolas</button><h3 class="display">Escola ${String(e.n).padStart(2, '0')} — ${esc(e.nome)}</h3>${cs.length ? `<div class="cursos">${cs.map(cursoCard).join('')}</div>` : empty('Nenhum curso publicado nesta escola', 'Os cursos aparecem aqui assim que o administrador publicar.')}`;
    } else body = escolas.length ? `<div class="escolas">${escolas.map(e => { const cs = cursos.filter(c => c.escola === e.n); const feitos = cs.filter(c => cursoStatus(S.uid, c).concluido).length; return `<button class="escola" data-act="escola" data-id="${e.n}"><span class="num">${String(e.n).padStart(2, '0')}</span><strong>${esc(e.nome)}</strong><small class="muted">${esc(e.desc || '')}</small><span class="small">${cs.length} cursos · ${feitos} concluídos</span>${bar(pct(feitos, cs.length))}</button>`; }).join('')}</div>` : empty('Academy em preparação', 'O administrador ainda não cadastrou as escolas.');
  } else if (tab === 'meus') {
    const grupos = { 'Em andamento': [], Pendentes: [], Concluídos: [] };
    cursos.forEach(c => { const st = cursoStatus(S.uid, c); if (st.concluido) grupos['Concluídos'].push(c); else if (st.iniciado) grupos['Em andamento'].push(c); else if (cursosObrigatorios(S.uid).includes(c)) grupos.Pendentes.push(c); });
    body = Object.entries(grupos).map(([g, cs]) => `<h3>${g} <span class="muted small">${cs.length}</span></h3>${cs.length ? `<div class="cursos">${cs.map(cursoCard).join('')}</div>` : '<p class="muted small">Nada por aqui.</p>'}`).join('');
  } else {
    const certs = cursos.filter(c => cursoStatus(S.uid, c).concluido);
    const szOk = szResumo(S.uid).concluida;
    body = (certs.length || szOk) ? `<div class="cursos">${szOk ? `<div class="curso cert"><strong>Semana Zero</strong><span class="muted small">Código ${certCodigo(S.uid, 'semana-zero')}</span><button class="btn sm" data-act="cert" data-id="semana-zero">Ver certificado</button></div>` : ''}${certs.map(c => `<div class="curso cert"><strong>${esc(c.titulo)}</strong><span class="muted small">Concluído em ${fmtDate(dayOf(cursoStatus(S.uid, c).concluidoAt))} · Código ${certCodigo(S.uid, c.id)}</span><button class="btn sm" data-act="cert" data-id="${c.id}">Ver certificado</button></div>`).join('')}</div>` : empty('Nenhum certificado ainda', 'Conclua um curso para receber seu certificado digital.');
  }
  return pageHead('Academy', 'Universidade corporativa da Primoris.') + tabs + body;
};
const cursoCard = c => { const st = cursoStatus(S.uid, c); return `<button class="curso" data-act="curso" data-id="${c.id}"><strong>${esc(c.titulo)}</strong><span class="muted small">${esc(c.descricao || '')}</span><span class="small">${(c.aulas || []).length} aulas${c.cargaHoraria ? ' · ' + c.cargaHoraria + 'h' : ''} ${c.obrigatorio ? chip('Obrigatório', 'accent') : ''} ${st.concluido ? chip('Concluído', 'ok') : ''}</span>${bar(st.pct, st.concluido)}</button>`; };
const cursoView = c => {
  const st = cursoStatus(S.uid, c); const aulas = c.aulas || []; const ai = S.sub.aula ?? Math.max(0, aulas.findIndex(a => !prog(S.uid).aulas?.[c.id]?.[a.id])); const a = aulas[ai];
  const feita = id => !!prog(S.uid).aulas?.[c.id]?.[id];
  const emb = a && embedVideo(a.url);
  const conteudo = a ? `<h3>${esc(a.titulo)}</h3>${emb ? `<div class="player"><div id="yt-player" data-video="${esc(emb.id)}" data-tipo="${emb.tipo}" data-curso="${c.id}" data-aula="${a.id}" data-pos="${Number(prog(S.uid).videoPos?.[c.id]?.[a.id] || 0)}">${emb.tipo === 'vimeo' ? `<iframe src="https://player.vimeo.com/video/${esc(emb.id)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="${esc(a.titulo)}"></iframe>` : ''}</div></div>${Number(prog(S.uid).videoPos?.[c.id]?.[a.id] || 0) > 5 && emb.tipo === 'youtube' ? `<p class="small muted">Continuando de onde você parou.</p>` : ''}` : ''}${a.url && !emb ? `<a class="video" href="${esc(a.url)}" target="_blank" rel="noopener">${ic(a.tipo === 'pdf' ? 'file' : 'play', 28)}<span>${a.tipo === 'pdf' ? 'Abrir material em PDF' : 'Assistir à aula'}</span><small class="muted">abre em nova aba</small></a>` : ''}${a.conteudo ? `<div class="prose">${esc(a.conteudo).replace(/\n/g, '<br>')}</div>` : ''}
    <div class="row-a">${feita(a.id) ? chip('Aula concluída', 'ok') : `<button class="btn primary" data-act="aula-ok" data-id="${c.id}:${a.id}">Marcar como concluída</button>`}${ai < aulas.length - 1 ? `<button class="btn" data-act="aula" data-id="${ai + 1}">Próxima aula ${ic('arrow', 16)}</button>` : ''}</div>` : empty('Curso sem aulas', 'O administrador ainda não adicionou aulas.');
  const quiz = st.temQuiz ? `<section class="card"><header class="card-h"><h3>Avaliação final</h3><span class="muted small">Nota mínima ${c.notaMin || 70}%</span></header>${st.quiz?.aprovado ? `<p>${chip('Aprovado com ' + st.quiz.nota + '%', 'ok')}</p>` : st.feitas < st.total ? '<p class="muted">Conclua todas as aulas para liberar a avaliação.</p>' : quizForm('curso-quiz', c.id, c.quiz, st.quiz?.nota)}</section>` : '';
  return `<button class="linkbtn" data-act="curso" data-id="">${ic('back', 16)} Voltar</button>` + pageHead(esc(c.titulo), esc(c.descricao || ''), st.concluido ? `<button class="btn accent sm" data-act="cert" data-id="${c.id}">Ver certificado</button>` : `<div class="pill-big">${st.pct}%</div>`)
    + `<div class="grid-curso"><section class="card"><ol class="aulas">${aulas.map((x, i) => `<li><button class="${i === ai ? 'on' : ''}" data-act="aula" data-id="${i}">${feita(x.id) ? ic('check', 14) : `<span class="n">${i + 1}</span>`} ${esc(x.titulo)}</button></li>`).join('')}</ol></section><div class="stack"><section class="card">${conteudo}</section>${quiz}</div></div>`;
};
export const certificado = id => {
  const m = me(); let titulo, data;
  if (id === 'semana-zero') { titulo = 'Semana Zero — Jornada de Integração'; data = today(); }
  else { const c = S.cursos[id]; titulo = c?.titulo || 'Curso'; data = dayOf(cursoStatus(S.uid, c).concluidoAt); }
  return `<div class="certificate"><div class="cert-in">${brandBig()}<p class="muted">Certificamos que</p><h2 class="display">${esc(m?.nome)}</h2><p class="muted">concluiu com aproveitamento</p><h3>${esc(titulo)}</h3><p class="small">${fmtDate(data)} · Código de identificação <strong>${certCodigo(S.uid, id)}</strong></p><p class="tag">Formando consultores. Desenvolvendo líderes. Construindo empresários.</p></div></div>`;
};

// ---------- CARTEIRA (CRM)
export const carteira = () => {
  const f = S.sub.crm || (S.sub.crm = { modo: 'kanban', q: '', etapa: '', origem: '', temp: '', dono: '' });
  const donos = isGestor() ? (isAdmin() ? ativos() : ativos().filter(m => m.id === S.uid || minhasEquipes().includes(m.equipeId))) : [];
  let uids = [S.uid]; if (isGestor()) uids = f.dono === '*' ? donos.map(d => d.id) : [f.dono || S.uid];
  const q = f.q.trim().toLowerCase(); const qd = q.replace(/\D/g, '');
  let cs = contatosDe(uids).filter(c => (!q || c.nome?.toLowerCase().includes(q) || (qd && c.telNorm?.includes(qd)) || (c.email || '').toLowerCase().includes(q)) && (!f.etapa || c.etapa === f.etapa) && (!f.origem || c.origem === f.origem) && (!f.temp || c.temperatura === f.temp) && (!f.venc || (c.proximaData && c.proximaData <= today())));
  cs.sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''));
  const g = geral(); const valorTotal = cs.reduce((s, c) => s + (Number(c.valor) || 0), 0);
  const bar_ = `<div class="filters">
    <label class="search">${ic('search', 16)}<input data-filter="crm.q" value="${esc(f.q)}" placeholder="Buscar nome, telefone ou e-mail" aria-label="Buscar"></label>
    ${isGestor() ? `<select data-filter="crm.dono" aria-label="Carteira">${opt('', 'Minha carteira', f.dono)}${opt('*', 'Todas as carteiras autorizadas', f.dono)}${donos.filter(d => d.id !== S.uid).map(d => opt(d.id, d.nome, f.dono)).join('')}</select>` : ''}
    <select data-filter="crm.etapa" aria-label="Etapa">${opt('', 'Todas as etapas', f.etapa)}${ETAPAS.map(e => opt(e.id, e.nome, f.etapa)).join('')}</select>
    <select data-filter="crm.origem" aria-label="Origem">${opt('', 'Todas as origens', f.origem)}${g.origens.map(o => opt(o, o, f.origem)).join('')}</select>
    <select data-filter="crm.temp" aria-label="Temperatura">${opt('', 'Temperatura', f.temp)}${['Frio', 'Morno', 'Quente'].map(o => opt(o, o, f.temp)).join('')}</select>
    <label class="check"><input type="checkbox" data-filter="crm.venc" ${f.venc ? 'checked' : ''}> <span>Próxima ação vencida</span></label>
    <div class="seg"><button class="${f.modo === 'kanban' ? 'on' : ''}" data-act="crm-modo" data-id="kanban" aria-label="Kanban">${ic('kanban', 16)}</button><button class="${f.modo === 'lista' ? 'on' : ''}" data-act="crm-modo" data-id="lista" aria-label="Lista">${ic('rows', 16)}</button></div>
  </div>`;
  const head = pageHead('Minha Carteira', `${num(cs.length)} contatos · ${brlShort(valorTotal)} em projetos estimados`, `<button class="btn sm" data-act="objecoes">${ic('msg', 16)} Objeções</button><button class="btn sm" data-act="importar">${ic('upload', 16)} Importar</button>${isGestor() ? `<button class="btn sm" data-act="exportar-crm">${ic('download', 16)} Exportar</button>` : ''}<button class="btn accent sm" data-act="novo-contato">${ic('plus', 16)} Novo contato</button>`);
  if (!contatosDe(uids).length) return head + bar_ + empty('Nenhum contato ainda', 'Cadastre seu primeiro contato ou importe uma planilha.', '<button class="btn accent" data-act="novo-contato">Cadastrar contato</button>');
  const cardC = c => `<div class="ccard" draggable="true" data-drag="${c.id}" data-act="contato" data-id="${c.id}" tabindex="0"><strong>${esc(c.nome)}</strong><span class="small muted">${esc(fmtPhone(c.telefone))}${c.produto ? ' · ' + esc(c.produto) : ''}</span>${c.valor ? `<span class="small">${brlShort(c.valor)}</span>` : ''}<span class="ctags">${c.temperatura ? chip(c.temperatura, c.temperatura === 'Quente' ? 'accent' : '') : ''}${esfriando(c) ? chip('Esfriando', 'warn') : ''}${c.proximaData && c.proximaData <= today() ? chip('Ação ' + fmtDate(c.proximaData), c.proximaData < today() ? 'bad' : 'warn') : ''}${uids.length > 1 ? `<span class="muted small">${esc(firstName(nome(c.ownerId)))}</span>` : ''}</span></div>`;
  const body = f.modo === 'kanban' ? `<div class="kanban">${ETAPAS.map(e => { const col = cs.filter(c => (c.etapa || 'novo') === e.id); return `<div class="kcol" data-drop="${e.id}"><header><span>${esc(e.nome)}</span><span class="muted small">${col.length} · ${brlShort(col.reduce((s, c) => s + (Number(c.valor) || 0), 0))}</span></header><div class="kbody">${col.map(cardC).join('')}</div></div>`; }).join('')}</div>`
    : `<div class="card tablewrap"><table class="tbl"><thead><tr><th>Nome</th><th>Telefone</th><th>Etapa</th><th>Origem</th><th>Produto</th><th class="r">Valor</th><th>Próxima ação</th>${uids.length > 1 ? '<th>Responsável</th>' : ''}</tr></thead><tbody>${cs.map(c => `<tr data-act="contato" data-id="${c.id}" class="click"><td><strong>${esc(c.nome)}</strong></td><td>${esc(fmtPhone(c.telefone))}</td><td>${esc(etapaNome(c.etapa))}</td><td>${esc(c.origem || '')}</td><td>${esc(c.produto || '')}</td><td class="r">${c.valor ? brlShort(c.valor) : ''}</td><td>${c.proximaData ? fmtDate(c.proximaData) + ' · ' + esc(c.proximaAcao || '') : ''}</td>${uids.length > 1 ? `<td>${esc(nome(c.ownerId))}</td>` : ''}</tr>`).join('')}</tbody></table></div>`;
  return head + bar_ + body;
};
export const contatoForm = (c = {}) => {
  const g = geral();
  return `<form data-form="contato" data-id="${c.id || ''}" class="form-grid">
  ${!c.id && 'contacts' in navigator && 'select' in (navigator.contacts || {}) ? '<div class="span2"><button type="button" class="btn sm" data-act="picker">' + ic('users', 16) + ' Puxar da agenda do celular</button></div>' : ''}
  ${field('Nome completo *', inp('nome', c.nome, 'required'), 'span2')}
  ${field('Telefone / WhatsApp *', inp('telefone', fmtPhone(c.telefone), 'required inputmode="tel" placeholder="(11) 99999-9999"'))}
  ${field('E-mail', inp('email', c.email, 'type="email"'))}
  ${field('Origem *', sel('origem', g.origens, c.origem || g.origens[0]))}
  ${field('Indicado por', inp('indicadoPor', c.indicadoPor, 'placeholder="Se veio por indicação"'))}
  ${field('Produto de interesse', sel('produto', ['', ...g.produtos], c.produto))}
  ${field('Valor estimado do projeto (R$)', inp('valor', c.valor ? String(c.valor).replace('.', ',') : '', 'inputmode="decimal"'))}
  ${field('Cidade', inp('cidade', c.cidade))}
  ${field('Estado (UF)', sel('uf', ['', 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'], c.uf))}
  ${field('Temperatura', sel('temperatura', ['', 'Frio', 'Morno', 'Quente'], c.temperatura))}
  ${field('Etapa', sel('etapa', ETAPAS.filter(e => e.id !== 'venda').map(e => [e.id, e.nome]), c.etapa || 'novo'))}
  ${field('Próxima ação', inp('proximaAcao', c.proximaAcao, 'placeholder="Ex.: ligar para apresentar simulação"'))}
  ${field('Data da próxima ação', inp('proximaData', c.proximaData, 'type="date"'))}
  ${field('Observações', txt('obs', c.obs, 'rows="3"'), 'span2')}
  <label class="check span2"><input type="checkbox" name="lgpd" id="f-lgpd" ${c.id ? 'checked' : ''} required> <span>Tenho base legal para tratar estes dados (contato pessoal, indicação ou pedido do próprio cliente) e vou usá-los só para atendimento comercial de consórcio.</span></label>
  <div class="span2 row-a"><button class="btn accent" type="submit">Salvar contato</button></div></form>`;
};
export const contatoDetalhe = c => {
  const atv = list(S.atividades).filter(a => a.contatoId === c.id).map(a => ({ at: a.at, t: `${ATIV_NOMES[a.tipo] || a.tipo}${a.resultado ? ' · ' + a.resultado : ''}`, d: a.texto, by: a.ownerId }));
  const hist = (c.historico || []).map(h => ({ at: h.at, t: `Etapa: ${etapaNome(h.de)} → ${etapaNome(h.para)}${h.motivo ? ' · ' + h.motivo : ''}`, by: h.by }));
  const reun = list(S.reunioes).filter(r => r.contatoId === c.id).map(r => ({ at: r.createdAt, t: `Reunião ${fmtDT(r.inicio)} · ${r.status}${r.resultado ? ' · ' + r.resultado : ''}`, by: r.ownerId }));
  const vend = list(S.vendas).filter(v => v.contatoId === c.id).map(v => ({ at: v.createdAt, t: `Venda ${brl(v.valor)} · ${STATUS_VENDA[vendaStatus(v)]?.[0]}`, by: v.ownerId }));
  const tl = [...atv, ...hist, ...reun, ...vend, { at: c.createdAt, t: 'Contato cadastrado', by: c.createdBy || c.ownerId }].sort((a, b) => (b.at || '').localeCompare(a.at || ''));
  const meu = c.ownerId === S.uid || isAdmin(); const wa = normPhone(c.telefone);
  return `<div class="det">
    <div class="det-h"><div><h3>${esc(c.nome)}</h3><p class="muted small">${esc(fmtPhone(c.telefone))} ${c.email ? '· ' + esc(c.email) : ''} ${c.cidade ? '· ' + esc(c.cidade) + '/' + esc(c.uf || '') : ''}</p><p>${chip(etapaNome(c.etapa), 'accent')} ${c.origem ? chip(c.origem) : ''} ${c.produto ? chip(c.produto) : ''} ${c.valor ? chip(brlShort(c.valor)) : ''}</p>${c.ownerId !== S.uid ? `<p class="muted small">Responsável: ${esc(nome(c.ownerId))}</p>` : ''}</div></div>
    ${meu ? `<div class="row-a wrap">
      <a class="btn sm" href="tel:+${wa}" data-act="ligar" data-id="${c.id}">${ic('phone', 16)} Ligar</a>
      <a class="btn sm" href="https://wa.me/${wa}" target="_blank" rel="noopener" data-act="wa" data-id="${c.id}">${ic('msg', 16)} WhatsApp</a>
      <button class="btn sm" data-act="ativ" data-id="${c.id}">${ic('phone', 16)} Registrar contato</button>
      <button class="btn sm" data-act="nova-reuniao" data-id="${c.id}">${ic('calendar', 16)} Agendar reunião</button>
      <button class="btn sm accent" data-act="nova-venda" data-id="${c.id}">${ic('coins', 16)} Registrar venda</button>
      <button class="btn sm" data-act="editar-contato" data-id="${c.id}">Editar</button>
    </div>
    <div class="row-a wrap"><label class="field inline"><span>Mover para</span><select data-act-change="etapa" data-id="${c.id}">${ETAPAS.map(e => opt(e.id, e.nome, c.etapa || 'novo')).join('')}</select></label></div>` : ''}
    ${meu && V2.modelosPara(c).length ? `<h4>Mensagens prontas</h4><div class="modelos">${V2.modelosPara(c).map((m, i) => `<a class="btn xs" target="_blank" rel="noopener" href="https://wa.me/${wa}?text=${encodeURIComponent(V2.preencher(m.texto, c))}" data-act="wa" data-id="${c.id}">${esc(m.titulo)}</a>`).join('')}</div>` : ''}
    ${c.proximaData ? `<p><strong>Próxima ação:</strong> ${esc(c.proximaAcao || '')} · ${fmtDate(c.proximaData)}</p>` : ''}
    ${c.obs ? `<blockquote>${esc(c.obs)}</blockquote>` : ''}
    <h4>Linha do tempo</h4><ul class="timeline">${tl.map(x => `<li><span class="muted small">${fmtDT(x.at)} · ${esc(firstName(nome(x.by)))}</span><span>${esc(x.t)}</span>${x.d ? `<span class="small">${esc(x.d)}</span>` : ''}</li>`).join('')}</ul>
    ${meu ? `<div class="row-a"><button class="btn sm danger" data-act="excluir-contato" data-id="${c.id}">Mover para a lixeira</button></div>` : ''}
  </div>`;
};

// ---------- AGENDA
export const agenda = () => {
  const base = S.sub.agBase || today(); const modo = S.sub.agModo || 'semana';
  const dow = new Date(base + 'T12:00:00Z').getUTCDay(); const ini = modo === 'dia' ? base : modo === 'semana' ? addDays(base, -((dow + 6) % 7)) : base.slice(0, 8) + '01';
  const fim = modo === 'dia' ? base : modo === 'semana' ? addDays(ini, 6) : addDays(addDays(ini, 32).slice(0, 8) + '01', -1);
  const uids = S.sub.agEquipe && isGestor() ? [S.uid, ...membrosDaEquipe(isAdmin() ? Object.keys(S.equipes) : minhasEquipes())] : [S.uid];
  const rs = list(S.reunioes).filter(x => uids.includes(x.ownerId) && x.status !== 'cancelada').sort((a, b) => a.inicio.localeCompare(b.inicio));
  const pend = rs.filter(x => x.ownerId === S.uid && x.status === 'agendada' && x.inicio < new Date().toISOString());
  const dias = []; for (let d = ini; d <= fim; d = addDays(d, 1)) dias.push(d);
  const tipoNome = { reuniao: 'Reunião com cliente', followup: 'Follow-up', treinamento: 'Treinamento', oneonone: '1:1 com gestor', prospeccao: 'Bloco de prospecção', pessoal: 'Pessoal' };
  const item = x => `<div class="ev ${x.status}"><span class="ev-t">${fmtTime(x.inicio)}</span><div><strong>${esc(x.titulo || tipoNome[x.tipo] || 'Compromisso')}</strong><span class="small muted">${esc(tipoNome[x.tipo] || '')}${x.contatoId ? ' · ' + esc(S.contatos[x.contatoId]?.nome || '') : ''}${x.local ? ' · ' + esc(x.local) : ''}${uids.length > 1 ? ' · ' + esc(firstName(nome(x.ownerId))) : ''}</span></div>${x.status === 'agendada' && x.ownerId === S.uid ? `<button class="btn xs" data-act="reuniao-res" data-id="${x.id}">Registrar resultado</button>` : chip(x.status === 'realizada' ? 'Realizada' : x.status === 'nao_compareceu' ? 'Não compareceu' : x.status === 'remarcada' ? 'Remarcada' : 'Agendada', x.status === 'realizada' ? 'ok' : x.status === 'nao_compareceu' ? 'bad' : '')}</div>`;
  const nomeDia = d => new Date(d + 'T12:00:00Z').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short', timeZone: 'UTC' });
  return pageHead('Agenda', `${fmtDate(ini)} a ${fmtDate(fim)}`, `<button class="btn accent sm" data-act="nova-reuniao">${ic('plus', 16)} Novo compromisso</button>`)
    + `<div class="filters"><div class="seg">${[['dia', 'Dia'], ['semana', 'Semana'], ['mes', 'Mês']].map(([v, l]) => `<button class="${modo === v ? 'on' : ''}" data-act="ag-modo" data-id="${v}">${l}</button>`).join('')}</div><button class="btn sm" data-act="ag-nav" data-id="-1">${ic('back', 16)}</button><button class="btn sm" data-act="ag-nav" data-id="0">Hoje</button><button class="btn sm" data-act="ag-nav" data-id="1">${ic('arrow', 16)}</button>${isGestor() ? `<label class="check"><input type="checkbox" data-filter="agEquipe" ${S.sub.agEquipe ? 'checked' : ''}> <span>Mostrar a equipe</span></label>` : ''}<button class="btn sm" data-act="ics">${ic('download', 16)} Exportar .ics</button></div>`
    + (pend.length ? `<div class="notice">${pend.length} compromisso(s) já passaram e aguardam resultado. A reunião aconteceu? Registre para atualizar o funil e os indicadores.</div>` : '')
    + `<div class="agenda">${dias.map(d => { const evs = rs.filter(x => dayOf(x.inicio) === d); if (modo === 'mes' && !evs.length) return ''; return `<section class="ag-day ${d === today() ? 'today' : ''}"><h4>${nomeDia(d)}</h4>${evs.length ? evs.map(item).join('') : '<p class="muted small">Livre</p>'}</section>`; }).join('') || empty('Nenhum compromisso neste mês', 'Use “Novo compromisso” para agendar.')}</div>`;
};
export const reuniaoForm = (x = {}, contatoId = '') => {
  const cs = contatosDe([S.uid]).sort((a, b) => a.nome.localeCompare(b.nome)); const ini = x.inicio ? new Date(x.inicio) : null;
  const loc = ini ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(ini).replace(' ', 'T') : '';
  return `<form data-form="reuniao" data-id="${x.id || ''}" class="form-grid">
  ${field('Tipo', sel('tipo', [['reuniao', 'Reunião com cliente'], ['followup', 'Follow-up'], ['treinamento', 'Treinamento'], ['oneonone', '1:1 com gestor'], ['prospeccao', 'Bloco de prospecção'], ['pessoal', 'Pessoal']], x.tipo || 'reuniao'))}
  ${field('Contato', sel('contatoId', [['', 'Sem contato'], ...cs.map(c => [c.id, c.nome])], x.contatoId || contatoId))}
  ${field('Título', inp('titulo', x.titulo, 'placeholder="Ex.: Apresentação de proposta"'), 'span2')}
  ${field('Data e hora *', inp('inicio', loc, 'type="datetime-local" required'))}
  ${field('Local ou link', inp('local', x.local))}
  ${field('Lembrete', sel('lembrete', [['60', '1 hora antes'], ['1440', '1 dia antes'], ['0', 'Sem lembrete']], x.lembrete || '60'))}
  ${field('Observações', txt('obs', x.obs, 'rows="2"'), 'span2')}
  <div class="span2 row-a"><button class="btn accent">Salvar</button></div></form>`;
};

// ---------- PLANO DE AÇÃO (metas + tarefas)
export const plano = () => {
  const ms = missao(S.uid); const f = S.sub.tf || 'abertas'; const t = today();
  const doms = isGestor() ? [S.uid, ...membrosDaEquipe(isAdmin() ? Object.keys(S.equipes) : minhasEquipes())] : [S.uid];
  const minhas = list(S.tarefas).filter(x => S.sub.tfEquipe ? doms.includes(x.ownerId) : x.ownerId === S.uid);
  const lst = minhas.filter(x => f === 'abertas' ? x.status === 'aberta' : f === 'atrasadas' ? x.status === 'aberta' && x.prazo && x.prazo < t : x.status === 'concluida').sort((a, b) => (a.prazo || '9').localeCompare(b.prazo || '9'));
  const r30 = { from: addDays(t, -29), to: t }; const m = metasDe(S.uid);
  let streak = 0; for (let d = t, i = 0; i < 60; i++, d = addDays(d, -1)) { if (prospeccoes([S.uid], { from: d, to: d }).length >= m.prospeccoes) streak++; else if (d !== t) break; }
  const noPrazo = minhas.filter(x => x.status === 'concluida' && (!x.prazo || dayOf(x.doneAt) <= x.prazo)).length, concl = minhas.filter(x => x.status === 'concluida').length;
  return pageHead('Plano de Ação', 'Metas de atividade e tarefas. Os contadores sobem sozinhos com seus registros.', `<button class="btn accent sm" data-act="nova-tarefa">${ic('plus', 16)} Nova tarefa</button>`)
    + `<div class="grid2">${card('Metas de hoje', `<div class="metas-dia">${ms.metas.map(x => `<div class="md"><span class="small">${esc(x.nome)}</span><strong>${x.feito}<small>/${x.meta}</small></strong>${bar(pct(x.feito, x.meta), x.feito >= x.meta)}</div>`).join('')}</div>`, '<span class="muted small">valores definidos pela gestão</span>')}
      ${card('Indicadores de execução', `<div class="row3"><div><span class="muted small">Sequência de dias com meta de prospecção</span><strong class="accent-t">${streak}</strong></div><div><span class="muted small">Prospecções em 30 dias</span><strong>${prospeccoes([S.uid], r30).length}</strong></div><div><span class="muted small">Tarefas no prazo</span><strong>${pct(noPrazo, concl)}%</strong></div></div>`)}</div>`
    + `<section class="card"><header class="card-h"><h3>Tarefas</h3><div class="row-a">${isGestor() ? `<label class="check"><input type="checkbox" data-filter="tfEquipe" ${S.sub.tfEquipe ? 'checked' : ''}> <span>Equipe</span></label>` : ''}<div class="seg">${[['abertas', 'Abertas'], ['atrasadas', 'Atrasadas'], ['concluidas', 'Concluídas']].map(([v, l]) => `<button class="${f === v ? 'on' : ''}" data-act="tf" data-id="${v}">${l}</button>`).join('')}</div></div></header>
    ${lst.length ? `<ul class="tasks">${lst.map(x => `<li class="${x.status === 'concluida' ? 'done' : ''}"><label class="check"><input type="checkbox" data-act="${x.status === 'concluida' ? 'tarefa-reabrir' : 'tarefa-ok'}" data-id="${x.id}" ${x.status === 'concluida' ? 'checked' : ''} ${x.ownerId !== S.uid && !isGestor() ? 'disabled' : ''}> <span><strong>${esc(x.titulo)}</strong>${x.descricao ? `<small class="muted">${esc(x.descricao)}</small>` : ''}</span></label><span class="small">${x.prazo ? fmtDate(x.prazo) : ''} ${x.prazo && x.prazo < t && x.status === 'aberta' ? chip('Atrasada', 'bad') : ''} ${x.prioridade === 'alta' ? chip('Alta', 'accent') : ''} ${x.ownerId !== S.uid ? '· ' + esc(firstName(nome(x.ownerId))) : ''} ${x.createdBy && x.createdBy !== x.ownerId ? `<span class="muted">· por ${esc(firstName(nome(x.createdBy)))}</span>` : ''}${x.doneAt ? ` <span class="muted">· feita ${fmtDT(x.doneAt)}</span>` : ''}</span></li>`).join('')}</ul>` : empty('Nenhuma tarefa aqui', 'Crie tarefas ou receba tarefas do seu gestor.')}</section>`;
};
export const tarefaForm = (x = {}) => {
  const doms = isGestor() ? [S.uid, ...membrosDaEquipe(isAdmin() ? Object.keys(S.equipes) : minhasEquipes())] : [S.uid];
  return `<form data-form="tarefa" data-id="${x.id || ''}" class="form-grid">
  ${field('Título *', inp('titulo', x.titulo, 'required'), 'span2')}
  ${field('Descrição', txt('descricao', x.descricao, 'rows="2"'), 'span2')}
  ${field('Prazo', inp('prazo', x.prazo || today(), 'type="date"'))}
  ${field('Prioridade', sel('prioridade', [['normal', 'Normal'], ['alta', 'Alta']], x.prioridade || 'normal'))}
  ${doms.length > 1 ? field('Responsável', sel('ownerId', [...new Set(doms)].map(u => [u, u === S.uid ? 'Eu' : nome(u)]), x.ownerId || S.uid), 'span2') : ''}
  ${field('Repetir', sel('recorrencia', [['', 'Não repetir'], ['diaria', 'Todo dia útil'], ['semanal', 'Toda semana']], x.recorrencia || ''))}
  <div class="span2 row-a"><button class="btn accent">Salvar tarefa</button></div></form>`;
};

// ---------- VENDAS / MEU PRIMEIRO MILHÃO
export const vendas = () => {
  const tab = S.sub.vTab || 'milhao'; const mm = geral().metaMilhao; const tot = vgvTotal(S.uid); const minhas = vendasDe([S.uid]);
  const valid = vendasValidadas([S.uid]); const ticket = valid.length ? tot / valid.length : 0; const pend = vgv([S.uid], null, 'pendente');
  const tabs = `<div class="tabs">${[['milhao', 'Meu Primeiro Milhão'], ['minhas', 'Minhas vendas'], ['comissoes', 'Comissões'], ['simulador', 'Simulador'], ...(isGestor() ? [['fila', 'Fila de validação']] : [])].map(([v, l]) => `<button class="${tab === v ? 'on' : ''}" data-act="v-tab" data-id="${v}">${l}</button>`).join('')}</div>`;
  let body = '';
  if (tab === 'milhao') {
    const marcos = [100000, 250000, 500000, 750000, 1000000].filter(x => x <= mm);
    const mens = vgvMensal([S.uid], 6); const ult3 = mens.slice(-3).reduce((s, x) => s + x.valor, 0) / 3; const falta = Math.max(0, mm - tot);
    body = `<div class="hero-m card"><div><span class="muted small">Meta</span><strong>${brl(mm)}</strong></div><div><span class="muted small">Realizado (validado)</span><strong class="accent-t">${brl(tot)}</strong></div><div><span class="muted small">Restante</span><strong>${brl(falta)}</strong></div><div><span class="muted small">Progresso</span><strong>${pct(tot, mm)}%</strong></div>
      <div class="span4"><div class="marcos">${bar(pct(tot, mm), true)}${marcos.map(x => `<span class="marco ${tot >= x ? 'on' : ''}" style="left:${(x / mm) * 100}%">${brlShort(x)}</span>`).join('')}</div></div>
      <div><span class="muted small">Vendas validadas</span><strong>${valid.length}</strong></div><div><span class="muted small">Ticket médio</span><strong>${brlShort(ticket)}</strong></div><div><span class="muted small">Maior venda</span><strong>${brlShort(Math.max(0, ...valid.map(v => Number(v.valor) || 0)))}</strong></div><div><span class="muted small">Aguardando validação</span><strong>${brlShort(pend)}</strong></div></div>
      <div class="grid2">${card('Evolução mensal', barChart(mens))}${card('Ritmo', falta === 0 ? '<p class="accent-t big">Meta atingida!</p>' : ult3 > 0 ? `<p>No ritmo dos últimos 3 meses (${brlShort(ult3)} por mês), você atinge o primeiro milhão em <strong class="accent-t">${Math.ceil(falta / ult3)} meses</strong>.</p>` : '<p class="muted">Registre e valide suas primeiras vendas para calcularmos seu ritmo.</p>', '<span class="chip">Projeção</span>')}</div>`;
  } else if (tab === 'minhas') {
    body = minhas.length ? `<div class="card tablewrap"><table class="tbl"><thead><tr><th>Data</th><th>Cliente</th><th>Produto</th><th>Administradora</th><th class="r">Carta de crédito</th><th>Status</th><th></th></tr></thead><tbody>${minhas.sort((a, b) => b.data.localeCompare(a.data)).map(v => `<tr><td>${fmtDate(v.data)}</td><td>${esc(S.contatos[v.contatoId]?.nome || v.clienteNome || '')}</td><td>${esc(v.produto)}</td><td>${esc(v.administradora || '')}</td><td class="r">${brl(v.valor)}</td><td>${statusVenda(v)}${S.validacoes[v.id]?.motivo ? `<div class="small muted">${esc(S.validacoes[v.id].motivo)}</div>` : ''}</td><td>${vendaStatus(v) === 'devolvida' ? `<button class="btn xs" data-act="editar-venda" data-id="${v.id}">Corrigir</button>` : `<button class="btn xs" data-act="hist-venda" data-id="${v.id}">Histórico</button>`}</td></tr>`).join('')}</tbody></table></div>` : empty('Nenhuma venda registrada', 'Registre uma venda a partir de um contato da sua carteira.', '<a class="btn accent" href="#carteira">Ir para a carteira</a>');
  } else if (tab === 'simulador') {
    const cr = (() => { const r = reunioesDe([S.uid]).filter(x => x.status === 'realizada').length; const v = valid.length; return r ? Math.round((v / r) * 100) : 20; })();
    const pr = (() => { const p = prospeccoes([S.uid]).length; const r = reunioesDe([S.uid]).length; return p ? Math.round((r / p) * 100) : 10; })();
    body = `<div class="grid2"><form class="card" data-form="sim" id="sim"><header class="card-h"><h3>Simulador de VGV</h3><span class="chip">Projeção</span></header><div class="form-grid">
      ${field('Ticket médio (R$)', inp('ticket', ticket ? Math.round(ticket) : 200000, 'inputmode="decimal" data-sim'))}
      ${field('VGV a alcançar (R$)', inp('alvo', Math.max(0, mm - tot) || mm, 'inputmode="decimal" data-sim'))}
      ${field('Prazo desejado (meses)', inp('prazo', 6, 'type="number" min="1" data-sim'))}
      ${field('Dias de trabalho por mês', inp('dias', 22, 'type="number" min="1" data-sim'))}
      ${field('Conversão reunião → venda (%)', inp('conv', cr, 'type="number" min="1" max="100" data-sim'))}
      ${field('Conversão prospecção → reunião (%)', inp('conv2', pr, 'type="number" min="1" max="100" data-sim'))}
      </div><p class="muted small">As conversões vêm dos seus números reais quando existem; ajuste para testar cenários.</p></form>
      <section class="card sim-out" id="sim-out"></section></div>`;
  } else if (tab === 'comissoes') {
    body = V2.comissoes();
  } else if (tab === 'fila') {
    const vis = isAdmin() ? list(S.vendas) : list(S.vendas).filter(v => minhasEquipes().includes(equipeDe(v.ownerId)));
    const fila = vis.filter(v => ['registrada', 'pre_aprovada'].includes(vendaStatus(v))).sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
    const outras = vis.filter(v => !['registrada', 'pre_aprovada'].includes(vendaStatus(v))).sort((a, b) => (S.validacoes[b.id]?.at || '').localeCompare(S.validacoes[a.id]?.at || '')).slice(0, 30);
    const row = v => `<tr><td>${fmtDate(v.data)}</td><td>${esc(nome(v.ownerId))}</td><td>${esc(S.contatos[v.contatoId]?.nome || v.clienteNome || '')}</td><td>${esc(v.produto)} · ${esc(v.administradora || '')}</td><td>${esc(v.proposta || '')}${v.grupo ? ' · G' + esc(v.grupo) + '/C' + esc(v.cota || '') : ''}${v.comprovante ? ` <button class="btn xs" data-act="ver-arquivo" data-id="${esc(v.comprovante)}">Comprovante</button>` : ''}</td><td class="r">${brl(v.valor)}</td><td>${statusVenda(v)}${daysBetween(dayOf(v.createdAt), today()) > 3 && ['registrada', 'pre_aprovada'].includes(vendaStatus(v)) ? chip('Parada há ' + daysBetween(dayOf(v.createdAt), today()) + ' dias', 'bad') : ''}</td><td class="acts">${['registrada', 'pre_aprovada'].includes(vendaStatus(v)) ? `${isAdmin() ? `<button class="btn xs accent" data-act="validar" data-id="${v.id}">Validar</button><button class="btn xs" data-act="devolver" data-id="${v.id}">Devolver</button><button class="btn xs danger" data-act="reprovar" data-id="${v.id}">Reprovar</button>` : !v.preAprovadaPor ? `<button class="btn xs accent" data-act="preaprovar" data-id="${v.id}">Pré-aprovar</button>` : ''}` : vendaStatus(v) === 'validada' && isAdmin() ? `<button class="btn xs danger" data-act="cancelar-venda" data-id="${v.id}">Cancelar</button>` : ''}<button class="btn xs" data-act="hist-venda" data-id="${v.id}">Histórico</button></td></tr>`;
    body = `<section class="card tablewrap"><header class="card-h"><h3>Aguardando validação</h3><span class="muted small">${fila.length} vendas · ${brl(fila.reduce((s, v) => s + Number(v.valor || 0), 0))}</span></header>${fila.length ? `<table class="tbl"><thead><tr><th>Data</th><th>Consultor</th><th>Cliente</th><th>Produto</th><th>Proposta</th><th class="r">Valor</th><th>Status</th><th></th></tr></thead><tbody>${fila.map(row).join('')}</tbody></table>` : empty('Fila vazia', 'Nenhuma venda aguardando validação.')}</section>
      <section class="card tablewrap"><header class="card-h"><h3>Decididas recentemente</h3></header>${outras.length ? `<table class="tbl"><tbody>${outras.map(row).join('')}</tbody></table>` : '<p class="muted">Nada ainda.</p>'}</section>
      ${!isAdmin() ? '<p class="muted small">Como gestor, você pré-aprova. A validação oficial, que conta no VGV, é feita pela administração.</p>' : ''}`;
  }
  return pageHead('Meu Primeiro Milhão', 'Só vendas validadas contam para o VGV oficial, metas, ranking e carreira.', `<button class="btn accent sm" data-act="nova-venda">${ic('plus', 16)} Registrar venda</button>`) + tabs + body;
};
export const simCalc = f => {
  const n = k => Math.max(0, Number(String(f[k] || '').replace(/\./g, '').replace(',', '.')) || 0);
  const ticket = n('ticket'), alvo = n('alvo'), prazo = Math.max(1, n('prazo')), dias = Math.max(1, n('dias')), conv = Math.max(1, n('conv')) / 100, conv2 = Math.max(1, n('conv2')) / 100;
  if (!ticket) return '<p class="muted">Informe o ticket médio.</p>';
  const vendas = Math.ceil(alvo / ticket), porMes = vendas / prazo, reun = Math.ceil(vendas / conv), prosp = Math.ceil(reun / conv2), prospDia = prosp / (prazo * dias);
  return `<header class="card-h"><h3>Projeção</h3><span class="chip">Não é resultado real</span></header><div class="kv big">
    <span>Vendas necessárias</span><strong class="accent-t">${num(vendas)}</strong><span>Vendas por mês</span><strong>${porMes.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</strong>
    <span>Reuniões realizadas necessárias</span><strong>${num(reun)}</strong><span>Prospecções necessárias</span><strong>${num(prosp)}</strong>
    <span>Prospecções por dia</span><strong>${prospDia.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</strong></div>
    <p class="muted small">Ex.: ticket de R$ 100 mil = 10 vendas; ticket de R$ 200 mil = 5 vendas para R$ 1 milhão.</p>`;
};
export const vendaForm = (v = {}, contatoId = '') => {
  const g = geral(); const cs = contatosDe([S.uid]).sort((a, b) => a.nome.localeCompare(b.nome));
  return `<form data-form="venda" data-id="${v.id || ''}" class="form-grid">
  ${field('Cliente (contato da carteira) *', sel('contatoId', [['', 'Selecione'], ...cs.map(c => [c.id, c.nome])], v.contatoId || contatoId, 'required'), 'span2')}
  ${field('Produto *', sel('produto', g.produtos, v.produto || g.produtos[0]))}
  ${field('Administradora', g.administradoras.length ? sel('administradora', g.administradoras, v.administradora) : inp('administradora', v.administradora))}
  ${field('Valor da carta de crédito (R$) *', inp('valor', v.valor ? String(v.valor).replace('.', ',') : '', 'required inputmode="decimal"'))}
  ${field('Data da venda *', inp('data', v.data || today(), 'type="date" required'))}
  ${field('Nº da proposta/contrato', inp('proposta', v.proposta))}
  ${field('Prazo (meses)', inp('prazoMeses', v.prazoMeses, 'type="number" min="1"'))}
  ${field('Grupo', inp('grupo', v.grupo))}
  ${field('Cota', inp('cota', v.cota))}
  ${field('Observações', txt('obs', v.obs, 'rows="2"'), 'span2')}
  ${!v.id ? field('Comprovante (PDF ou foto, opcional)', '<input type="file" id="f-comprovante" name="comprovante" accept="application/pdf,image/*">', 'span2') : ''}
  <p class="muted small span2">A venda entra como “aguardando validação” e só soma no VGV oficial depois de aprovada pela administração.</p>
  <div class="span2 row-a"><button class="btn accent">${v.id ? 'Reenviar para validação' : 'Registrar venda'}</button></div></form>`;
};
export const vendaHist = v => { const h = [...(v.historico || []), ...(S.validacoes[v.id]?.historico || [])].sort((a, b) => a.at.localeCompare(b.at)); return `<ul class="timeline">${h.map(x => `<li><span class="muted small">${fmtDT(x.at)} · ${esc(nome(x.by))}</span><span>${esc(STATUS_VENDA[x.status]?.[0] || x.status)}</span>${x.motivo ? `<span class="small">${esc(x.motivo)}</span>` : ''}</li>`).join('')}</ul>`; };

// ---------- CARREIRA
export const carreira = (uid = S.uid) => {
  const niveis = niveisCfg(); const atual = S.members[uid]?.nivel || 0; const pn = proxNivel(uid);
  const sol = list(S.progressoes).filter(p => p.uid === uid).sort((a, b) => (b.at || '').localeCompare(a.at || ''));
  const aberta = sol.find(p => p.status === 'solicitada');
  const ladder = `<div class="ladder">${niveis.map((n, i) => `<div class="step ${i === atual ? 'cur' : i < atual ? 'past' : ''}" style="--h:${84 + i * 26}px"><span class="muted small">${String(i + 1).padStart(2, '0')}</span><strong>${esc(n.nome)}</strong><small>${(n.requisitos || []).length ? (n.requisitos || []).length + ' requisitos' : i === 0 ? 'Entrada' : 'Critérios em definição'}</small></div>`).join('')}</div>`;
  const reqLi = q => `<li class="${q.ok ? 'ok' : ''}">${ic(q.ok ? 'check' : 'lock', 16)}<div><strong>${esc(q.label)}</strong><span class="small muted">${esc(q.info)}${q.auto ? ' · verificado automaticamente' : ''}</span></div>${!q.ok && q.tipo === 'documento' && uid === S.uid ? `<button class="btn xs" data-act="doc-enviar" data-id="${q.id}">Enviar</button>` : ''}</li>`;
  return pageHead('Minha Evolução', 'Plano de carreira da Primoris: de Prévia a Dono de Loja.') + `<div class="card">${ladder}</div>
    <div class="grid2">${card(pn ? `Próximo nível: ${esc(pn.nome)}` : 'Topo da carreira', pn ? (pn.definido ? `${bar(pn.pct, true)}<p class="small">${pn.feitos} de ${pn.total} requisitos cumpridos</p><ul class="reqs lg">${pn.reqs.map(reqLi).join('')}</ul>
      ${uid === S.uid ? (aberta ? `<p>${chip('Solicitação em análise desde ' + fmtDate(dayOf(aberta.at)), 'warn')}</p>` : pn.apto ? `<button class="btn accent" data-act="solicitar-nivel">Solicitar progressão para ${esc(pn.nome)}</button>` : '<p class="muted small">Cumpra os requisitos automáticos para solicitar a progressão.</p>') : ''}` : '<p class="muted">Critérios em definição pela diretoria. Assim que forem publicados, aparecem aqui com seu progresso.</p>') : '<p>Parabéns: você está no nível mais alto.</p>')}
    ${card('Histórico de progressão', sol.length || (S.members[uid]?.historicoNivel || []).length ? `<ul class="timeline">${[...(S.members[uid]?.historicoNivel || []).map(h => ({ at: h.at, t: `${nivelNome(h.de)} → ${nivelNome(h.para)}`, d: h.justificativa, by: h.by })), ...sol.filter(p => p.status !== 'aprovada').map(p => ({ at: p.at, t: `Solicitação para ${nivelNome(p.para)} · ${p.status}`, d: p.motivo, by: p.uid }))].sort((a, b) => b.at.localeCompare(a.at)).map(x => `<li><span class="muted small">${fmtDT(x.at)} · ${esc(nome(x.by))}</span><span>${esc(x.t)}</span>${x.d ? `<span class="small">${esc(x.d)}</span>` : ''}</li>`).join('')}</ul>` : `<p class="muted">Entrada como ${esc(nivelNome(0))} em ${fmtDate(S.members[uid]?.dataEntrada)}.</p>`)}
    ${(() => { const fbs = list(S.feedbacks).filter(f => f.para === uid && f.tipo !== 'mural' && f.visivel !== false).sort((a, b) => b.at.localeCompare(a.at)); return card('Feedbacks recebidos', fbs.length ? `<ul class="timeline">${fbs.map(f => `<li><span class="muted small">${fmtDT(f.at)} · ${esc(nome(f.de))} · ${esc(f.tipo)}${f.competencia ? ' · ' + esc(f.competencia) : ''}</span><span>${esc(f.texto)}</span>${f.ciente ? '<span class="small muted">Ciente</span>' : uid === S.uid ? `<button class="btn xs" data-act="ciente" data-id="${f.id}">Estou ciente</button>` : ''}</li>`).join('')}</ul>` : '<p class="muted">Nenhum feedback ainda.</p>', '', 'span2'); })()}</div>`;
};

// ---------- CONQUISTAS
export const conquistas = () => {
  const c = conquistasDe(S.uid); const r = periodo('mes');
  const rk = ativos().map(m => ({ u: m.id, v: vgv([m.id], r) })).filter(x => S.config.geral?.rankingPublico || isGestor() || minhasEquipes().includes(equipeDe(x.u)) || equipeDe(x.u) === equipeDe(S.uid)).sort((a, b) => b.v - a.v);
  const pos = rk.findIndex(x => x.u === S.uid) + 1;
  const ds = V2 && desafioAtivoV(); return pageHead('Conquistas', `${c.filter(x => x.ok).length} de ${c.length} medalhas`) + (ds.length ? `<section class="card"><header class="card-h"><h3>Desafios da semana</h3></header>${ds.map(d => V2.desafioCard(d, ativos().filter(m => isGestor() || m.equipeId === equipeDe(S.uid)).map(m => m.id))).join('')}</section>` : '') + `<div class="medals">${c.map(x => `<div class="medal ${x.ok ? 'on' : ''}">${ic(x.ok ? 'medal' : 'lock', 28)}<strong>${esc(x.nome)}</strong></div>`).join('')}</div>`
    + `<div class="grid2">${card('Ranking do mês (VGV validado)', `${pos ? `<p>Sua posição: <strong class="accent-t">${pos}º</strong></p>` : ''}<ol class="rank">${rk.slice(0, 10).map((x, i) => `<li class="${x.u === S.uid ? 'me' : ''}"><span class="pos ${i < 3 ? 'accent-t' : ''}">${i + 1}</span><span>${esc(nome(x.u))}</span><span>${brlShort(x.v)}</span></li>`).join('')}</ol>`)}
    ${card('Mural da equipe', muralHtml(), '<button class="btn xs" data-act="mural-post">Publicar</button>')}</div>`;
};
const muralHtml = () => { const posts = list(S.feedbacks).filter(f => f.tipo === 'mural' && (isAdmin() || !f.equipeId || f.equipeId === equipeDe(S.uid) || minhasEquipes().includes(f.equipeId))).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 10); return posts.length ? `<ul class="timeline">${posts.map(p => `<li><span class="muted small">${fmtDT(p.at)} · ${esc(nome(p.de))}</span><span>${esc(p.texto)}</span></li>`).join('')}</ul>` : '<p class="muted">Nenhuma publicação ainda.</p>'; };

// ---------- EQUIPE (gestor)
export const equipe = () => {
  if (S.sub.perfil && podeVer(S.sub.perfil)) return perfil(S.sub.perfil);
  const ids = isAdmin() ? (S.dash.equipe ? membrosDaEquipe([S.dash.equipe]) : ativos().map(m => m.id)) : membrosDaEquipe(minhasEquipes());
  const r = periodo();
  const pendAval = ids.filter(u => { const s = szResumo(u); const dias = szDias(); return dias.some((d, i) => (d.atividade?.tipo === 'avaliacao' && !prog(u).szAval?.aprovado && (i === 0 || s.dias[i - 1].done)) || (d.atividade?.tipo === 'plano' && prog(u).plano?.status === 'enviado')); });
  const rows = ids.map(u => ({ u, m: S.members[u], sz: szResumo(u), v: vgv([u], r), p: prospeccoes([u], r).length, re: reunioesDe([u], r).filter(x => x.status === 'realizada').length, vt: vgvTotal(u), at: atrasados(u), c: contatosDe([u]).length }));
  return pageHead('Minha Equipe', `${ids.length} integrantes`, isAdmin() ? `<select data-filter="equipe" aria-label="Equipe">${opt('', 'Todas as equipes', S.dash.equipe)}${list(S.equipes).map(e => opt(e.id, e.nome, S.dash.equipe)).join('')}</select>` : '')
    + filtroBar({ semEscopo: true }).replace(/<select data-filter="escopo"[\s\S]*?<\/select>/, '').replace(/<select data-filter="equipe"[\s\S]*?<\/select>/, '').replace(/<select data-filter="consultor"[\s\S]*?<\/select>/, '')
    + (pendAval.length ? `<div class="notice">${pendAval.length} consultor(es) aguardam sua avaliação na Semana Zero: ${pendAval.map(u => `<button class="linkbtn" data-act="perfil" data-id="${u}">${esc(nome(u))}</button>`).join(', ')}</div>` : '')
    + (rows.length ? `<div class="card tablewrap"><table class="tbl"><thead><tr><th>Consultor</th><th>Nível</th><th>Semana Zero</th><th class="r">Contatos</th><th class="r">Prospecções</th><th class="r">Reuniões</th><th class="r">VGV período</th><th class="r">Rumo ao milhão</th><th class="r">Previsão</th><th>Atrasos</th></tr></thead><tbody>${rows.sort((a, b) => b.v - a.v).map(x => `<tr class="click" data-act="perfil" data-id="${x.u}"><td>${avatar(x.u, 26)} <strong>${esc(x.m?.nome)}</strong></td><td>${esc(nivelNome(x.m?.nivel))}</td><td>${x.sz.concluida ? chip('Concluída', 'ok') : `${x.sz.pct}%`}</td><td class="r">${x.c}</td><td class="r">${x.p}</td><td class="r">${x.re}</td><td class="r">${brlShort(x.v)}</td><td class="r">${pct(x.vt, geral().metaMilhao)}%</td><td class="r">${(() => { const p = projecaoMin(x.u); return p === 0 ? chip('Atingido', 'ok') : p ? p + ' meses' : '—'; })()}</td><td>${x.at ? chip(x.at, 'bad') : ''}</td></tr>`).join('')}</tbody></table></div>` : empty('Equipe sem integrantes', isAdmin() ? 'Vincule consultores a equipes em Administração.' : 'Peça ao administrador para vincular consultores à sua equipe.'));
};
export const perfil = uid => {
  const m = S.members[uid] || {}; const r = periodo(); const sz = szResumo(uid); const dias = szDias();
  const fbs = list(S.feedbacks).filter(f => f.para === uid && f.tipo !== 'mural').sort((a, b) => b.at.localeCompare(a.at));
  const idxAval = dias.findIndex(d => d.atividade?.tipo === 'avaliacao'); const idxPlano = dias.findIndex(d => d.atividade?.tipo === 'plano');
  const rub = S.config.semanaZero?.rubrica || ['Abertura e rapport', 'Diagnóstico de necessidades', 'Clareza na explicação do produto', 'Tratamento de objeções', 'Fechamento e próximos passos'];
  const pl = prog(uid).plano; const textos = dias.map((d, i) => ({ i, d, p: prog(uid).sz?.[i] })).filter(x => x.d.atividade?.tipo === 'texto' && x.p?.texto);
  return `<button class="linkbtn" data-act="perfil" data-id="">${ic('back', 16)} Voltar para a equipe</button>`
    + pageHead(esc(m.nome), `${esc(nivelNome(m.nivel))} · ${esc(S.equipes[m.equipeId]?.nome || 'Sem equipe')} · entrada em ${fmtDate(m.dataEntrada)} · ${esc(fmtPhone(m.telefone))}`, `<button class="btn sm" data-act="feedback" data-id="${uid}">Registrar feedback</button><button class="btn sm" data-act="nova-tarefa" data-id="${uid}">Atribuir tarefa</button>`)
    + `<div class="kpis">${kpi('VGV validado (total)', brlShort(vgvTotal(uid)), pct(vgvTotal(uid), geral().metaMilhao) + '% do primeiro milhão', '', true)}${kpi('Contatos', num(contatosDe([uid]).length))}${kpi('Prospecções', num(prospeccoes([uid], r).length), r.nome)}${kpi('Reuniões realizadas', num(reunioesDe([uid], r).filter(x => x.status === 'realizada').length), r.nome)}</div>
    <div class="grid2">${card('Semana Zero', `${bar(sz.pct, true)}<p class="small">${sz.feitos} de ${sz.total} dias concluídos</p><ul class="lst">${dias.map((d, i) => `<li><span>Dia ${i + 1} · ${esc(d.titulo)}</span>${sz.dias[i].done ? chip('Concluído', 'ok') : chip(sz.dias[i].itensFeitos + '/' + sz.dias[i].itensTotal + ' itens', '')}</li>`).join('')}</ul>
      ${textos.map(x => `<h4>Dia ${x.i + 1}: resposta</h4><blockquote>${esc(x.p.texto)}</blockquote><form data-form="sz-coment" data-id="${uid}:${x.i}" class="row-a">${inp('coment', prog(uid).szComent?.[x.i] || '', 'placeholder="Comentário para o consultor"')}<button class="btn xs">Salvar</button></form>`).join('')}
      ${idxAval >= 0 ? `<h4>Avaliação da simulação (Dia ${idxAval + 1})</h4>${prog(uid).szAval ? `<p>Média ${prog(uid).szAval.media?.toFixed(1)} · ${prog(uid).szAval.aprovado ? chip('Aprovado', 'ok') : chip('Refazer', 'warn')}</p>` : ''}${!prog(uid).szAval?.aprovado ? `<form data-form="sz-aval" data-id="${uid}" class="rubrica">${rub.map((c, i) => `<label class="field inline"><span>${esc(c)}</span><select name="c${i}" id="f-c${i}">${[1, 2, 3, 4, 5].map(n => opt(n, n, 3)).join('')}</select></label>`).join('')}${field('Observações', txt('obs', '', 'rows="2"'))}<button class="btn sm accent">Salvar avaliação</button></form>` : ''}` : ''}
      ${idxPlano >= 0 && pl ? `<h4>Plano de ação (Dia ${idxPlano + 1})</h4><div class="kv"><span>Prospecções/dia</span><strong>${pl.prospeccoes}</strong><span>Contatos/dia</span><strong>${pl.contatos}</strong><span>Reuniões/semana</span><strong>${pl.reunioes}</strong><span>VGV 90 dias</span><strong>${brl(pl.vgv90)}</strong><span>Rotina</span><strong>${esc(pl.rotina)}</strong></div>${pl.status === 'enviado' ? `<div class="row-a"><button class="btn sm accent" data-act="plano-aprovar" data-id="${uid}">Aprovar plano</button><button class="btn sm" data-act="plano-devolver" data-id="${uid}">Devolver</button></div>` : `<p>${chip(pl.status === 'aprovado' ? 'Aprovado' : 'Devolvido', pl.status === 'aprovado' ? 'ok' : 'warn')}</p>`}` : ''}`)}
    ${V3.projecaoCard(uid)}
    ${card('Carreira', (() => { const pn = proxNivel(uid); return pn ? `<p>Próximo: <strong>${esc(pn.nome)}</strong></p>${pn.definido ? `${bar(pn.pct, true)}<ul class="reqs">${pn.reqs.map(q => `<li class="${q.ok ? 'ok' : ''}">${ic(q.ok ? 'check' : 'lock', 14)} ${esc(q.label)} <span class="muted small">${esc(q.info)}</span></li>`).join('')}</ul>` : '<p class="muted">Critérios em definição.</p>'}` : '<p>Topo da carreira.</p>'; })())}
    ${card('Treinamentos', (() => { const cs = cursosPublicados(); return cs.length ? `<ul class="lst">${cs.map(c => { const st = cursoStatus(uid, c); return `<li><span>${esc(c.titulo)} ${c.obrigatorio ? chip('Obrigatório', 'accent') : ''}</span>${st.concluido ? chip('Concluído', 'ok') : st.pct + '%'}</li>`; }).join('')}</ul>` : '<p class="muted">Nenhum curso publicado.</p>'; })())}
    ${card('VGV mês a mês', barChart(vgvMensal([uid], 6), { h: 150 }))}
    ${card('Feedbacks', fbs.length ? `<ul class="timeline">${fbs.map(f => `<li><span class="muted small">${fmtDT(f.at)} · ${esc(nome(f.de))} · ${esc(f.tipo)}${f.competencia ? ' · ' + esc(f.competencia) : ''}</span><span>${esc(f.texto)}</span>${f.ciente ? '<span class="small muted">Consultor ciente</span>' : ''}</li>`).join('')}</ul>` : '<p class="muted">Nenhum feedback registrado.</p>', '', 'span2')}</div>`;
};
export const feedbackForm = uid => `<form data-form="feedback" data-id="${uid}" class="form-grid">
  ${field('Tipo', sel('tipo', [['reconhecimento', 'Reconhecimento'], ['orientacao', 'Orientação'], ['correcao', 'Correção']], 'reconhecimento'))}
  ${field('Competência', sel('competencia', ['Prospecção', 'Fechamento', 'Disciplina', 'Conhecimento de produto', 'Postura', 'Outro'], 'Prospecção'))}
  ${field('Feedback *', txt('texto', '', 'rows="4" required'), 'span2')}
  <label class="check span2"><input type="checkbox" name="visivel" id="f-visivel" checked> <span>Visível para o consultor</span></label>
  <div class="span2 row-a"><button class="btn accent">Registrar</button></div></form>`;

// ---------- RELATÓRIOS
export const RELATORIOS = {
  consultores: 'Consultores', vgv: 'VGV por consultor', prospeccoes: 'Prospecções', contatos: 'Contatos por origem', reunioes: 'Reuniões',
  conversao: 'Conversão do funil', treinamentos: 'Treinamentos', produtividade: 'Produtividade', evolucao: 'Evolução profissional', equipes: 'Por equipe', semanazero: 'Semana Zero',
};
export const relatorioDados = (tipo) => {
  const uids = escopoUids(S.dash.escopo === 'me' ? { ...S.dash, escopo: isAdmin() ? 'todos' : 'equipe' } : S.dash); const r = periodo();
  const N = u => nome(u);
  switch (tipo) {
    case 'consultores': return [['Nome', 'E-mail', 'Telefone', 'Perfil', 'Nível', 'Equipe', 'Entrada', 'Status'], ...uids.map(u => { const m = S.members[u] || {}; return [m.nome, m.email, fmtPhone(m.telefone), ROLES[m.role] || '', nivelNome(m.nivel), S.equipes[m.equipeId]?.nome || '', fmtDate(m.dataEntrada), m.status || 'ativo']; })];
    case 'vgv': return [['Consultor', 'VGV validado', 'VGV pendente', 'VGV cancelado', 'Vendas validadas', 'Ticket médio', 'VGV acumulado'], ...uids.map(u => { const v = vgv([u], r), n = vendasValidadas([u], r).length; return [N(u), brl(v), brl(vgv([u], r, 'pendente')), brl(vgv([u], r, 'cancelada')), n, brl(n ? v / n : 0), brl(vgvTotal(u))]; })];
    case 'prospeccoes': return [['Consultor', 'Total', 'Ligações', 'WhatsApp', 'E-mail', 'Visitas', 'Follow-ups'], ...uids.map(u => { const p = prospeccoes([u], r); return [N(u), p.length, ...['ligacao', 'whatsapp', 'email', 'visita'].map(t => p.filter(a => a.tipo === t).length), p.filter(a => a.followup).length]; })];
    case 'contatos': { const cs = contatosDe(uids).filter(c => inP(dayOf(c.createdAt), r)); return [['Origem', 'Novos contatos', 'Em negociação ou além', 'Vendas'], ...geral().origens.map(o => { const l = cs.filter(c => c.origem === o); return [o, l.length, l.filter(c => etapaIdx_(c.etapa) >= 2 && !['perdido', 'sem_interesse'].includes(c.etapa)).length, l.filter(c => c.etapa === 'venda').length]; })]; }
    case 'reunioes': return [['Consultor', 'Agendadas', 'Realizadas', 'Não compareceu', 'Taxa de realização'], ...uids.map(u => { const x = reunioesDe([u], r); const re = x.filter(y => y.status === 'realizada').length; return [N(u), x.length, re, x.filter(y => y.status === 'nao_compareceu').length, pct(re, x.length) + '%']; })];
    case 'conversao': { const f = funil(uids); const tot = f.reduce((s, e) => s + e.n, 0); return [['Etapa', 'Contatos', '% da carteira'], ...f.map(e => [e.nome, e.n, pct(e.n, tot) + '%'])]; }
    case 'treinamentos': return [['Curso', 'Obrigatório', 'Iniciados', 'Concluídos', 'Nota média'], ...cursosPublicados().map(c => { const st = uids.map(u => cursoStatus(u, c)); const notas = st.filter(s => s.quiz?.nota != null).map(s => s.quiz.nota); return [c.titulo, c.obrigatorio ? 'Sim' : 'Não', st.filter(s => s.iniciado).length, st.filter(s => s.concluido).length, notas.length ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length) + '%' : '—']; })];
    case 'produtividade': return [['Consultor', 'Prospecções', 'Meta diária', 'Contatos novos', 'Tarefas concluídas', 'Tarefas atrasadas'], ...uids.map(u => [N(u), prospeccoes([u], r).length, metasDe(u).prospeccoes, contatosDe([u]).filter(c => inP(dayOf(c.createdAt), r)).length, list(S.tarefas).filter(t => t.ownerId === u && t.status === 'concluida' && inP(dayOf(t.doneAt), r)).length, atrasados(u)])];
    case 'evolucao': return [['Consultor', 'Nível atual', 'Próximo nível', 'Requisitos cumpridos', 'Dias na operação'], ...uids.map(u => { const pn = proxNivel(u); return [N(u), nivelNome(S.members[u]?.nivel), pn?.nome || '—', pn ? `${pn.feitos}/${pn.total}` : '—', S.members[u]?.dataEntrada ? daysBetween(S.members[u].dataEntrada, today()) : '']; })];
    case 'equipes': return [['Equipe', 'Gestor', 'Integrantes', 'VGV validado', 'Prospecções', 'Reuniões realizadas', 'Vendas'], ...list(S.equipes).map(e => { const ids = membrosDaEquipe([e.id]); return [e.nome, nome(e.gestorId), ids.length, brl(vgv(ids, r)), prospeccoes(ids, r).length, reunioesDe(ids, r).filter(x => x.status === 'realizada').length, vendasValidadas(ids, r).length]; })];
    case 'semanazero': return [['Consultor', 'Entrada', 'Progresso', 'Dias concluídos', 'Dia atual', 'Dias desde a entrada'], ...uids.map(u => { const s = szResumo(u); const e = S.members[u]?.dataEntrada; return [N(u), fmtDate(e), s.pct + '%', `${s.feitos}/${s.total}`, s.concluida ? 'Concluída' : 'Dia ' + (s.atual + 1), e ? daysBetween(e, today()) : '']; })];
  }
  return [[]];
};
const etapaIdx_ = id => ETAPAS.findIndex(e => e.id === id);
export const relatorios = () => {
  const tipo = S.sub.rel || 'vgv'; const rows = tipo === 'diagnostico' ? [[]] : relatorioDados(tipo);
  return pageHead('Relatórios', 'Respeitam seu escopo de acesso. Exportações ficam registradas na auditoria.', `<button class="btn sm" data-act="exportar-rel">${ic('download', 16)} Exportar CSV</button>`)
    + `<div class="tabs scroll">${[['diagnostico', 'Diagnóstico do funil'], ...Object.entries(RELATORIOS)].map(([v, l]) => `<button class="${tipo === v ? 'on' : ''}" data-act="rel" data-id="${v}">${l}</button>`).join('')}</div>` + filtroBar()
    + (tipo === 'diagnostico' ? V2.diagnosticoView() : `<div class="card tablewrap"><table class="tbl"><thead><tr>${rows[0].map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${rows[0].length}" class="muted">Sem dados no escopo e período.</td></tr>`}</tbody></table></div>`);
};

// ---------- ADMINISTRAÇÃO
export const admin = () => {
  const tab = S.sub.adTab || 'usuarios';
  const nSol = Object.keys(S.solicitacoes).length, nProg = list(S.progressoes).filter(p => p.status === 'solicitada').length;
  const docsPend = ativos().reduce((s, m) => s + Object.values(prog(m.id).docs || {}).filter(d => !d.conferido).length, 0);
  const tabs = [['usuarios', `Usuários${nSol ? ` (${nSol})` : ''}`], ['equipes', 'Equipes'], ['progressoes', `Carreira${nProg + docsPend ? ` (${nProg + docsPend})` : ''}`], ['cursos', 'Treinamentos'], ['semanazero', 'Semana Zero'], ['comissoes', 'Comissões'], ['desafios', 'Desafios'], ['mensagens', 'Mensagens'], ['parametros', 'Parâmetros'], ['eventos', 'Eventos'], ['backup', 'Backup'], ['auditoria', 'Auditoria'], ['ajuda', 'Ajuda']];
  let body = '';
  if (tab === 'usuarios') {
    const sols = list(S.solicitacoes).sort((a, b) => (a.at || '').localeCompare(b.at || ''));
    body = (sols.length ? `<section class="card"><header class="card-h"><h3>Solicitações de acesso</h3></header><table class="tbl"><tbody>${sols.map(s => `<tr><td><strong>${esc(s.nome)}</strong><div class="small muted">${esc(s.email)} · ${esc(fmtPhone(s.telefone))}</div></td><td class="small">${fmtDT(s.at)}</td><td class="acts"><button class="btn xs accent" data-act="aprovar-acesso" data-id="${s.id}">Liberar acesso</button><button class="btn xs danger" data-act="recusar-acesso" data-id="${s.id}">Recusar</button></td></tr>`).join('')}</tbody></table></section>` : '')
      + `<section class="card tablewrap"><header class="card-h"><h3>Usuários</h3><span class="muted small">${list(S.members).length} cadastrados</span></header><table class="tbl"><thead><tr><th>Nome</th><th>Perfil</th><th>Nível</th><th>Equipe</th><th>Gestor</th><th>Entrada</th><th>Status</th><th></th></tr></thead><tbody>${list(S.members).sort((a, b) => (a.nome || '').localeCompare(b.nome || '')).map(m => `<tr><td><strong>${esc(m.nome)}</strong><div class="small muted">${esc(m.email || '')}</div></td><td>${esc(ROLES[m.role] || '')}</td><td>${esc(nivelNome(m.nivel))}</td><td>${esc(S.equipes[m.equipeId]?.nome || '—')}</td><td>${esc(gestorDe(m.id) ? nome(gestorDe(m.id)) : '—')}</td><td>${fmtDate(m.dataEntrada)}</td><td>${chip(m.status || 'ativo', (m.status || 'ativo') === 'ativo' ? 'ok' : 'bad')}</td><td><button class="btn xs" data-act="editar-membro" data-id="${m.id}">Editar</button></td></tr>`).join('')}</tbody></table></section>`;
  } else if (tab === 'equipes') {
    body = `<div class="row-a"><button class="btn accent sm" data-act="nova-equipe">${ic('plus', 16)} Nova equipe</button></div>` + (Object.keys(S.equipes).length ? `<div class="cursos">${list(S.equipes).map(e => { const ids = membrosDaEquipe([e.id]); return `<div class="curso"><strong>${esc(e.nome)}</strong><span class="small muted">${esc(e.loja || 'Loja principal')} · Gestor: ${esc(e.gestorId ? nome(e.gestorId) : 'não definido')}</span><span class="small">${ids.length} integrantes · ${brlShort(vgv(ids, periodo('mes')))} no mês</span><div class="row-a"><button class="btn xs" data-act="editar-equipe" data-id="${e.id}">Editar</button></div></div>`; }).join('')}</div>` : empty('Nenhuma equipe', 'Crie a primeira equipe e defina o gestor.'));
  } else if (tab === 'progressoes') {
    const sols = list(S.progressoes).filter(p => p.status === 'solicitada');
    const docs = ativos().flatMap(m => Object.entries(prog(m.id).docs || {}).filter(([, d]) => !d.conferido).map(([k, d]) => ({ uid: m.id, k, d })));
    body = `<section class="card"><header class="card-h"><h3>Solicitações de progressão</h3></header>${sols.length ? `<table class="tbl"><tbody>${sols.map(p => { const pn = proxNivel(p.uid); return `<tr><td><strong>${esc(nome(p.uid))}</strong><div class="small muted">${esc(nivelNome(p.de))} → ${esc(nivelNome(p.para))} · ${fmtDT(p.at)}</div>${p.gestorRec ? `<div class="small">Gestor: ${esc(p.gestorRec)}</div>` : ''}</td><td class="small">${pn ? pn.reqs.map(q => `${q.ok ? '✓' : '✗'} ${esc(q.label)}`).join('<br>') : ''}</td><td class="acts"><button class="btn xs accent" data-act="aprovar-nivel" data-id="${p.id}">Aprovar</button><button class="btn xs" data-act="devolver-nivel" data-id="${p.id}">Devolver</button></td></tr>`; }).join('')}</tbody></table>` : '<p class="muted">Nenhuma solicitação pendente.</p>'}</section>
      <section class="card"><header class="card-h"><h3>Documentos para conferência</h3></header>${docs.length ? `<table class="tbl"><tbody>${docs.map(x => `<tr><td><strong>${esc(nome(x.uid))}</strong><div class="small muted">${esc(x.d.label || x.k)} · enviado ${fmtDT(x.d.at)}</div></td><td>${esc(x.d.valor || '')}${x.d.arquivo ? ` <button class="btn xs" data-act="ver-arquivo" data-id="${esc(x.d.arquivo)}">Ver arquivo</button>` : ''}</td><td class="acts"><button class="btn xs accent" data-act="conferir-doc" data-id="${x.uid}:${x.k}">Conferido</button></td></tr>`).join('')}</tbody></table>` : '<p class="muted">Nenhum documento pendente.</p>'}</section>
      <section class="card"><header class="card-h"><h3>Níveis e requisitos</h3><button class="btn xs" data-act="editar-carreira">Editar requisitos</button></header><ul class="lst">${niveisCfg().map((n, i) => `<li><span><strong>${String(i + 1).padStart(2, '0')} ${esc(n.nome)}</strong></span><span class="small muted">${(n.requisitos || []).map(r => esc(r.label)).join(' · ') || 'Critérios em definição'}</span></li>`).join('')}</ul></section>`;
  } else if (tab === 'cursos') {
    const escolas = S.config.academy?.escolas || [];
    body = `<div class="row-a"><button class="btn accent sm" data-act="novo-curso">${ic('plus', 16)} Novo curso</button></div><section class="card tablewrap"><table class="tbl"><thead><tr><th>Escola</th><th>Curso</th><th class="r">Aulas</th><th class="r">Questões</th><th>Obrigatório</th><th>Status</th><th class="r">Concluíram</th><th></th></tr></thead><tbody>${list(S.cursos).sort((a, b) => (a.escola || 0) - (b.escola || 0)).map(c => `<tr><td>${String(c.escola || '').padStart(2, '0')} ${esc(escolas.find(e => e.n === c.escola)?.nome || '')}</td><td><strong>${esc(c.titulo)}</strong></td><td class="r">${(c.aulas || []).length}</td><td class="r">${(c.quiz || []).length}</td><td>${c.obrigatorio ? 'Sim' : 'Não'}</td><td>${c.publicado === false ? chip('Rascunho') : chip('Publicado', 'ok')}</td><td class="r">${ativos().filter(m => cursoStatus(m.id, c).concluido).length}</td><td><button class="btn xs" data-act="editar-curso" data-id="${c.id}">Editar</button></td></tr>`).join('')}</tbody></table></section>`;
  } else if (tab === 'semanazero') {
    const dias = szDias();
    body = `<section class="card"><header class="card-h"><h3>Trilha da Semana Zero</h3><button class="btn xs" data-act="editar-sz">Editar conteúdo</button></header><ul class="lst">${dias.map((d, i) => `<li><span><strong>Dia ${i + 1} — ${esc(d.titulo)}</strong><div class="small muted">${(d.itens || []).length} itens · atividade: ${esc(d.atividade?.tipo || 'nenhuma')}${d.atividade?.minimo ? ' (mínimo ' + d.atividade.minimo + ')' : ''} · ${(d.quiz || []).length} questões</div></span><span>${ativos().filter(m => szResumo(m.id).dias[i]?.done).length} concluíram</span></li>`).join('')}</ul></section>`;
  } else if (tab === 'parametros') {
    const g = geral();
    body = `<form class="card" data-form="parametros"><div class="form-grid">
      ${field('Meta do Primeiro Milhão (R$)', inp('metaMilhao', g.metaMilhao, 'inputmode="decimal"'))}
      ${field('Meta de VGV mensal padrão por consultor (R$)', inp('metaVgvMensal', S.config.geral?.metaVgvMensal || '', 'inputmode="decimal" placeholder="Deixe vazio se não houver"'))}
      ${['prospeccoes', 'contatos', 'followups', 'reunioesAg', 'reunioesReal', 'treinamentos'].map(k => field({ prospeccoes: 'Prospecções por dia', contatos: 'Contatos cadastrados por dia', followups: 'Follow-ups por dia', reunioesAg: 'Reuniões agendadas por dia', reunioesReal: 'Reuniões realizadas por dia', treinamentos: 'Treinamentos por dia' }[k], inp('m_' + k, g.metas[k], 'type="number" min="0"'))).join('')}
      ${field('Dias sem interação para "esfriando"', inp('diasEsfriando', g.diasEsfriando, 'type="number" min="1"'))}
      <label class="check"><input type="checkbox" name="rankingPublico" id="f-rankingPublico" ${S.config.geral?.rankingPublico ? 'checked' : ''}> <span>Ranking geral visível a todos os consultores</span></label>
      ${field('Origens de contato (uma por linha)', txt('origens', g.origens.join('\n'), 'rows="5"'))}
      ${field('Produtos (um por linha)', txt('produtos', g.produtos.join('\n'), 'rows="5"'))}
      ${field('Administradoras parceiras (uma por linha)', txt('administradoras', g.administradoras.join('\n'), 'rows="4"'))}
      ${field('Frases do cabeçalho (uma por linha)', txt('frases', g.frases.join('\n'), 'rows="4"'))}
      </div><div class="row-a"><button class="btn accent">Salvar parâmetros</button></div></form>`;
  } else if (tab === 'comissoes') { body = V2.comissoesAdmin();
  } else if (tab === 'desafios') { body = V2.desafiosAdmin();
  } else if (tab === 'mensagens') { body = V2.mensagensAdmin();
  } else if (tab === 'backup') { body = V2.backupAdmin();
  } else if (tab === 'eventos') { body = V3.eventosAdmin();
  } else if (tab === 'auditoria') {
    const a = list(S.audit).sort((x, y) => (y.at || '').localeCompare(x.at || '')).slice(0, 200);
    body = `<section class="card tablewrap"><table class="tbl"><thead><tr><th>Quando</th><th>Quem</th><th>Ação</th><th>Alvo</th></tr></thead><tbody>${a.map(x => `<tr><td>${fmtDT(x.at)}</td><td>${esc(nome(x.by))}</td><td>${esc(x.acao)}</td><td>${esc(x.alvo)}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">Sem registros.</td></tr>'}</tbody></table></section>`;
  } else {
    body = `<section class="card prose"><h3>Como colocar pessoas na plataforma</h3><ol>
      <li>Envie o endereço da plataforma para a pessoa: <strong>${esc(location.origin + location.pathname)}</strong></li>
      <li>Ela clica em <strong>Entrar com Google</strong> e preenche a solicitação de acesso.</li>
      <li>A solicitação aparece na aba Usuários. Clique em <strong>Liberar acesso</strong> e defina perfil (Consultor, Gestor ou Administrador), nível, equipe e gestor.</li></ol>
      <p class="muted">As permissões valem no servidor: um consultor só lê a própria carteira; o gestor, a da equipe; administradores, tudo. Para retirar alguém, marque o usuário como Bloqueado ou Desativado: o acesso aos dados é cortado na hora.</p>
      <h3>Instalar no celular</h3><p>Android (Chrome): abra o endereço e toque em <strong>Instalar app</strong> no menu lateral ou em ⋮ → Instalar app. iPhone (Safari): toque em Compartilhar → <strong>Adicionar à Tela de Início</strong>. Depois, ative as notificações pelo sino.</p>
      <h3>Domínio próprio (ex.: academy.primoris.com.br)</h3><ol><li>Compre o domínio (Registro.br para .com.br).</li><li>No painel do domínio, crie um registro <code>CNAME</code> de <code>academy</code> apontando para <code>equipeprimoris-netizen.github.io</code>.</li><li>Me avise: eu configuro o GitHub Pages, o Supabase e o Google com o novo endereço.</li></ol></section>`;
  }
  return pageHead('Administração', 'Configure a operação sem depender de programação.') + `<div class="tabs scroll">${tabs.map(([v, l]) => `<button class="${tab === v ? 'on' : ''}" data-act="ad-tab" data-id="${v}">${l}</button>`).join('')}</div>` + body;
};
export const membroForm = (uid, base = {}) => {
  const m = { ...base, ...(S.members[uid] || {}) }; const eqs = list(S.equipes); const gestores = list(S.members).filter(x => ['gestor', 'admin', 'superadmin'].includes(x.role));
  return `<form data-form="membro" data-id="${uid}" class="form-grid">
  ${field('Nome completo', inp('nome', m.nome, 'required'), 'span2')}
  ${field('E-mail', inp('email', m.email, 'type="email"'))}
  ${field('Telefone', inp('telefone', fmtPhone(m.telefone)))}
  ${field('Perfil de acesso', sel('role', Object.entries(ROLES).filter(([k]) => k !== 'superadmin' || S.owner), m.role || 'consultor'))}
  ${field('Nível profissional', sel('nivel', nivelNomes().slice(0, niveisCfg().length).map((n, i) => [i, n]), m.nivel || 0))}
  ${field('Equipe', sel('equipeId', [['', 'Sem equipe'], ...eqs.map(e => [e.id, e.nome])], m.equipeId || ''))}
  ${field('Gestor direto (se diferente do gestor da equipe)', sel('gestorId', [['', 'Gestor da equipe'], ...gestores.filter(g => g.id !== uid).map(g => [g.id, g.nome])], m.gestorId || ''))}
  ${field('Data de entrada', inp('dataEntrada', m.dataEntrada || today(), 'type="date"'))}
  ${field('Status', sel('status', [['ativo', 'Ativo'], ['bloqueado', 'Bloqueado'], ['desativado', 'Desativado']], m.status || 'ativo'))}
  ${field('Meta de VGV mensal individual (R$)', inp('metaVgvMensal', m.metaVgvMensal || '', 'inputmode="decimal" placeholder="Usar padrão"'))}
  ${field('Meta individual de prospecções/dia', inp('metaProsp', m.metas?.prospeccoes || '', 'type="number" min="0" placeholder="Usar padrão"'))}
  ${field('Justificativa (obrigatória ao mudar o nível)', inp('justificativa', ''), 'span2')}
  <div class="span2 row-a"><button class="btn accent">Salvar</button></div></form>`;
};
export const equipeForm = (e = {}) => `<form data-form="equipe" data-id="${e.id || ''}" class="form-grid">
  ${field('Nome da equipe', inp('nome', e.nome, 'required'))}
  ${field('Loja / unidade', inp('loja', e.loja || 'Loja principal'))}
  ${field('Gestor', sel('gestorId', [['', 'Selecione'], ...list(S.members).filter(m => ['gestor', 'admin', 'superadmin'].includes(m.role)).map(m => [m.id, m.nome])], e.gestorId || ''), 'span2')}
  <div class="span2 row-a"><button class="btn accent">Salvar equipe</button></div></form>`;
export const cursoForm = (c = {}) => {
  const escolas = S.config.academy?.escolas || []; const aulas = c.aulas?.length ? c.aulas : [{ id: '', titulo: '', tipo: 'video', url: '', conteudo: '' }]; const quiz = c.quiz || [];
  const aulaRow = (a, i) => `<div class="rowed" data-row="aula"><input name="a_id" type="hidden" value="${esc(a.id)}"><input name="a_titulo" placeholder="Título da aula" value="${esc(a.titulo)}" aria-label="Título da aula ${i + 1}"><select name="a_tipo" aria-label="Tipo">${[['video', 'Vídeo'], ['texto', 'Texto'], ['pdf', 'PDF']].map(([v, l]) => opt(v, l, a.tipo)).join('')}</select><input name="a_url" placeholder="Link do vídeo/PDF (YouTube, Vimeo, Drive)" value="${esc(a.url)}" aria-label="Link"><textarea name="a_conteudo" rows="2" placeholder="Texto da aula (opcional)" aria-label="Conteúdo">${esc(a.conteudo)}</textarea><button type="button" class="iconbtn" data-rm aria-label="Remover">${ic('x', 16)}</button></div>`;
  const qRow = q => `<div class="rowed" data-row="q"><input name="q_q" placeholder="Pergunta" value="${esc(q.q)}" aria-label="Pergunta"><input name="q_opts" placeholder="Alternativas separadas por ;" value="${esc((q.opts || []).join('; '))}" aria-label="Alternativas"><input name="q_c" type="number" min="1" placeholder="Nº da correta" value="${q.c != null ? q.c + 1 : ''}" aria-label="Correta"><button type="button" class="iconbtn" data-rm aria-label="Remover">${ic('x', 16)}</button></div>`;
  return `<form data-form="curso" data-id="${c.id || ''}" class="form-grid">
  ${field('Título *', inp('titulo', c.titulo, 'required'), 'span2')}
  ${field('Escola', sel('escola', escolas.map(e => [e.n, `${String(e.n).padStart(2, '0')} ${e.nome}`]), c.escola || 1))}
  ${field('Carga horária (h)', inp('cargaHoraria', c.cargaHoraria, 'type="number" min="0" step="0.5"'))}
  ${field('Descrição', txt('descricao', c.descricao, 'rows="2"'), 'span2')}
  ${field('Nota mínima (%)', inp('notaMin', c.notaMin || 70, 'type="number" min="0" max="100"'))}
  ${field('Status', sel('publicado', [['1', 'Publicado'], ['0', 'Rascunho']], c.publicado === false ? '0' : '1'))}
  <label class="check"><input type="checkbox" name="obrigatorio" id="f-obrigatorio" ${c.obrigatorio ? 'checked' : ''}> <span>Obrigatório</span></label>
  ${field('Obrigatório para os níveis', `<span class="checks">${niveisCfg().map((n, i) => `<label class="check"><input type="checkbox" name="niv${i}" ${(c.niveis || []).includes(i) ? 'checked' : ''}> <span>${esc(n.nome)}</span></label>`).join('')}</span>`, 'span2')}
  <div class="span2"><h4>Aulas</h4><div id="rows-aula">${aulas.map(aulaRow).join('')}</div><button type="button" class="btn xs" data-add="aula">+ Aula</button><template id="tpl-aula">${aulaRow({ id: '', titulo: '', tipo: 'video', url: '', conteudo: '' }, 0)}</template></div>
  <div class="span2"><h4>Avaliação (opcional)</h4><div id="rows-q">${quiz.map(qRow).join('')}</div><button type="button" class="btn xs" data-add="q">+ Questão</button><template id="tpl-q">${qRow({ q: '', opts: [] })}</template></div>
  <div class="span2 row-a"><button class="btn accent">Salvar curso</button>${c.id ? '<button type="button" class="btn danger" data-act="excluir-curso" data-id="' + c.id + '">Excluir</button>' : ''}</div></form>`;
};
export const szForm = () => {
  const dias = szDias();
  return `<form data-form="sz-editar">${dias.map((d, i) => `<fieldset class="szedit"><legend>Dia ${i + 1}</legend><div class="form-grid">
    ${field('Título', inp('t' + i, d.titulo))}
    ${field('Atividade', sel('at' + i, [['nenhuma', 'Nenhuma'], ['aceite', 'Aceite de termo'], ['quiz', 'Quiz'], ['contatos', 'Cadastrar contatos'], ['prospeccoes', 'Registrar prospecções'], ['texto', 'Resposta escrita'], ['avaliacao', 'Avaliação do gestor'], ['plano', 'Plano de ação']], d.atividade?.tipo || 'nenhuma'))}
    ${field('Mínimo (para contatos/prospecções)', inp('am' + i, d.atividade?.minimo || '', 'type="number" min="0"'))}
    ${field('Instrução da atividade', inp('ax' + i, d.atividade?.texto || ''))}
    ${field('Itens do dia (um por linha)', txt('i' + i, (d.itens || []).join('\n'), 'rows="5"'), 'span2')}
    ${field('Quiz: uma questão por linha no formato Pergunta | alternativa A | alternativa B | ... | nº da correta', txt('q' + i, (d.quiz || []).map(q => [q.q, ...q.opts, q.c + 1].join(' | ')).join('\n'), 'rows="3"'), 'span2')}
  </div></fieldset>`).join('')}<div class="row-a"><button class="btn accent">Salvar Semana Zero</button></div></form>`;
};
export const carreiraForm = () => {
  const niveis = niveisCfg();
  const tipos = [['semanaZero', 'Semana Zero concluída'], ['vgv', 'VGV validado acumulado (R$)'], ['contatos', 'Contatos na carteira'], ['prospeccoes', 'Prospecções registradas'], ['vendas', 'Vendas validadas'], ['cursosObrigatorios', 'Cursos obrigatórios concluídos'], ['curso', 'Curso específico (id)'], ['tempo', 'Tempo de casa (meses)'], ['equipe', 'Consultores na equipe'], ['documento', 'Documento enviado e conferido'], ['manual', 'Aprovação manual']];
  return `<form data-form="carreira"><p class="muted small">Uma linha por requisito no formato: tipo | valor | descrição. Tipos: ${tipos.map(t => `<code>${t[0]}</code> (${t[1]})`).join(', ')}. Não preencha critérios que a diretoria ainda não definiu.</p>${niveis.map((n, i) => `<fieldset class="szedit"><legend>Nível ${i + 1}</legend><div class="form-grid">${field('Nome', inp('n' + i, n.nome))}${field('Requisitos para chegar a este nível', txt('r' + i, (n.requisitos || []).map(r => [r.tipo, r.valor ?? '', r.label].join(' | ')).join('\n'), 'rows="4"'), 'span2')}</div></fieldset>`).join('')}<div class="row-a"><button class="btn accent">Salvar carreira</button></div></form>`;
};
export const pushBox = st => st === 'indisponivel' ? '' : st === 'ativo' ? `<p class="small muted">${ic('check', 14)} Notificações ativas neste aparelho.</p>` : st === 'bloqueado' ? `<div class="notice">As notificações estão bloqueadas neste navegador. Libere nas configurações do site (cadeado ao lado do endereço).</div>` : `<div class="notice">Receba avisos de reuniões, follow-ups e vendas validadas mesmo com o app fechado. <button class="btn xs accent" data-act="ativar-push">Ativar notificações</button></div>`;
export const notifsHtml = () => { const ns = list(S.notifs).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 30); return ns.length ? `<div class="row-a"><button class="btn xs" data-act="notifs-lidas">Marcar todas como lidas</button></div><ul class="notifs">${ns.map(n => `<li class="${n.lida ? '' : 'new'}"><button class="linkbtn" data-act="notif" data-id="${n.id}"><span>${esc(n.texto)}</span><span class="muted small">${fmtDT(n.at)}</span></button></li>`).join('')}</ul>` : '<p class="muted">Nenhuma notificação.</p>'; };
