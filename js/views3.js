// Primoris Academy — Fórum de dúvidas e projeção individual do consultor.
import {
  S, esc, brl, brlShort, num, pct, fmtDT, fmtDate, list, firstName, nome, isGestor, isAdmin, minhasEquipes, equipeDe,
  CATEGORIAS_FORUM, papel, respostasDe, statusTopico, projecao, initials, vgv, today,
  vendasDe, vendaStatus, STATUS_VENDA, inP, contatosDe, geral,
  proxNivel, nivelNome, conquistasDe, vgvTotal, atrasados,
} from './core.js?v=21';
import { ic, chip, bar, card, empty, field, inp, sel, txt, opt, pageHead } from './views.js?v=21';
import * as V from './views.js?v=21';

const autor = (uid, extra = '') => {
  const m = S.members[uid] || {}; const g = ['gestor', 'admin', 'superadmin'].includes(m.role);
  return `<span class="autor ${g ? 'gestao' : ''}"><span class="avatar" style="width:30px;height:30px;font-size:12px">${esc(initials(m.nome || '?'))}</span><span><strong>${esc(m.nome || 'Integrante')}</strong> <span class="papel ${g ? 'g' : ''}">${esc(papel(uid))}</span>${S.equipes[m.equipeId] ? ` <span class="muted small">· ${esc(S.equipes[m.equipeId].nome)}</span>` : ''}${extra}</span></span>`;
};

// ---------- Fórum
export const forum = () => {
  if (S.sub.topico && S.forum[S.sub.topico]) return topico(S.forum[S.sub.topico]);
  const f = S.sub.ff || 'todos'; const q = (S.sub.fq || '').toLowerCase(); const cat = S.sub.fcat || '';
  let ts = list(S.forum).filter(t => !t.deletedAt);
  if (f === 'aguardando') ts = ts.filter(t => statusTopico(t)[0] === 'Aguardando resposta');
  if (f === 'meus') ts = ts.filter(t => t.ownerId === S.uid);
  if (f === 'equipe') { const eqs = isGestor() && !isAdmin() ? minhasEquipes() : [equipeDe(S.uid)]; ts = ts.filter(t => eqs.includes(t.equipeId)); }
  if (f === 'resolvidos') ts = ts.filter(t => t.resolvido);
  if (cat) ts = ts.filter(t => t.categoria === cat);
  if (q) ts = ts.filter(t => (t.titulo + ' ' + t.texto).toLowerCase().includes(q));
  const ultima = t => { const r = respostasDe(t.id).at(-1); return r?.at || t.at; };
  ts.sort((a, b) => ultima(b).localeCompare(ultima(a)));
  const aguardando = list(S.forum).filter(t => !t.deletedAt && statusTopico(t)[0] === 'Aguardando resposta').length;
  return pageHead('Fórum', 'Tire dúvidas com a equipe. Gestores acompanham e respondem por aqui.', `<button class="btn accent sm" data-act="nova-duvida">${ic('plus', 16)} Nova dúvida</button>`)
    + `<div class="filters"><label class="search">${ic('search', 16)}<input data-filter="fq" value="${esc(S.sub.fq || '')}" placeholder="Buscar no fórum" aria-label="Buscar no fórum"></label>
      <div class="seg">${[['todos', 'Todos'], ['aguardando', `Aguardando${aguardando ? ' (' + aguardando + ')' : ''}`], ['equipe', 'Minha equipe'], ['meus', 'Minhas'], ['resolvidos', 'Resolvidos']].map(([v, l]) => `<button class="${f === v ? 'on' : ''}" data-act="ff" data-id="${v}">${l}</button>`).join('')}</div>
      <select data-filter="fcat" aria-label="Categoria">${opt('', 'Todas as categorias', cat)}${CATEGORIAS_FORUM.map(c => opt(c, c, cat)).join('')}</select></div>`
    + (ts.length ? `<div class="topicos">${ts.map(t => { const [st, tone] = statusTopico(t); const n = respostasDe(t.id).length; return `<button class="topico" data-act="topico" data-id="${t.id}"><div class="topico-h"><strong>${esc(t.titulo)}</strong>${chip(st, tone)}</div><p class="muted small">${esc((t.texto || '').slice(0, 160))}${(t.texto || '').length > 160 ? '…' : ''}</p><div class="topico-f">${autor(t.ownerId)}<span class="muted small">${t.categoria ? esc(t.categoria) + ' · ' : ''}${n} resposta${n === 1 ? '' : 's'} · ${fmtDT(ultima(t))}</span></div></button>`; }).join('')}</div>`
      : empty('Nenhuma dúvida por aqui', 'Publique a primeira pergunta: a gestão recebe um aviso e responde no fórum.', '<button class="btn accent" data-act="nova-duvida">Nova dúvida</button>'));
};
export const duvidaForm = () => `<form data-form="duvida" class="form-grid">
  ${field('Título da dúvida *', inp('titulo', '', 'required maxlength="140" placeholder="Ex.: Como explicar o lance embutido para o cliente?"'), 'span2')}
  ${field('Categoria', sel('categoria', CATEGORIAS_FORUM, 'Comercial'))}
  ${field('Detalhe sua dúvida *', txt('texto', '', 'rows="5" required maxlength="4000"'), 'span2')}
  <p class="muted small span2">Seu nome e seu perfil aparecem na publicação. Seu gestor e a administração recebem um aviso.</p>
  <div class="span2 row-a"><button class="btn accent">Publicar dúvida</button></div></form>`;
const topico = t => {
  const rs = respostasDe(t.id); const [st, tone] = statusTopico(t);
  const podeResolver = t.ownerId === S.uid || isGestor();
  const digit = Object.values(S.digitando[t.id] || {}).filter(d => Date.now() - d.t < 4000 && d.uid !== S.uid);
  return `<button class="linkbtn" data-act="topico" data-id="">${ic('back', 16)} Voltar para o fórum</button>`
    + `<article class="card post pergunta"><header class="card-h"><h2 class="display">${esc(t.titulo)}</h2>${chip(st, tone)}</header>${autor(t.ownerId, ` <span class="muted small">· perguntou em ${fmtDT(t.at)}</span>`)}<div class="post-txt">${esc(t.texto).replace(/\n/g, '<br>')}</div>
      <div class="row-a">${t.categoria ? chip(t.categoria) : ''}${podeResolver ? `<button class="btn xs" data-act="${t.resolvido ? 'reabrir-topico' : 'resolver-topico'}" data-id="${t.id}">${t.resolvido ? 'Reabrir' : 'Marcar como resolvido'}</button>` : ''}${t.ownerId === S.uid || isAdmin() ? `<button class="btn xs danger" data-act="excluir-topico" data-id="${t.id}">Excluir</button>` : ''}</div></article>`
    + `<div class="respostas">${rs.map(r => { const g = ['gestor', 'admin', 'superadmin'].includes(S.members[r.ownerId]?.role); return `<article class="card post ${g ? 'resp-gestao' : ''}">${g ? '<span class="selo">Resposta da gestão</span>' : ''}${autor(r.ownerId, ` <span class="muted small">· ${fmtDT(r.at)}</span>`)}<div class="post-txt">${esc(r.texto).replace(/\n/g, '<br>')}</div>${r.ownerId === S.uid || isAdmin() ? `<div class="row-a"><button class="btn xs danger" data-act="excluir-resposta" data-id="${r.id}">Excluir</button></div>` : ''}</article>`; }).join('') || '<p class="muted">Ainda sem respostas.</p>'}</div>`
    + `<div class="digitando" id="digitando" aria-live="polite">${digit.map(d => `<span><span class="dots"><i></i><i></i><i></i></span> <strong>${esc(d.nome)}</strong> (${esc(d.papel)}) está digitando…</span>`).join('')}</div>`
    + `<form class="card" data-form="resposta" data-id="${t.id}"><label class="field"><span>Responder como <strong>${esc(nome(S.uid))}</strong> (${esc(papel(S.uid))})</span><textarea id="f-texto" name="texto" rows="4" required maxlength="4000" data-digitando="${t.id}" placeholder="Escreva sua resposta"></textarea></label><div class="row-a"><button class="btn accent">Enviar resposta</button></div></form>`;
};
export const digitandoHtml = tid => Object.values(S.digitando[tid] || {}).filter(d => Date.now() - d.t < 4000 && d.uid !== S.uid).map(d => `<span><span class="dots"><i></i><i></i><i></i></span> <strong>${esc(d.nome)}</strong> (${esc(d.papel)}) está digitando…</span>`).join('');

// ---------- Projeção individual
export const projecaoCard = uid => {
  const p = projecao(uid);
  const prev = p.falta === 0 ? '<strong class="accent-t">Meta do milhão atingida</strong>' : p.mesesMilhao ? `<strong class="accent-t">${p.mesesMilhao} ${p.mesesMilhao === 1 ? 'mês' : 'meses'}</strong> no ritmo dos últimos 3 meses (${brlShort(p.ult3)}/mês)` : '<span class="muted">Sem vendas validadas nos últimos 3 meses para projetar.</span>';
  const maxPipe = Math.max(1, ...p.pipeline.map(e => e.valor));
  return card('Projeção do consultor', `<div class="proj">
    <div class="proj-top"><div><span class="muted small">VGV validado</span><strong>${brlShort(p.tot)}</strong><span class="small">${pct(p.tot, p.mm)}% do primeiro milhão</span></div><div><span class="muted small">Faltam</span><strong>${brlShort(p.falta)}</strong></div><div><span class="muted small">Previsão do milhão</span><span>${prev}</span></div><div><span class="muted small">Em negociação quente</span><strong>${brlShort(p.quentes)}</strong><span class="small muted">propostas, follow-ups e reuniões feitas</span></div></div>
    <h4>Carteira em andamento (valor estimado dos projetos)</h4>
    <div class="funil larg">${p.pipeline.map(e => `<div class="frow"><span class="fl">${esc(e.nome)}</span><span class="fb"><span style="width:${(e.valor / maxPipe) * 100}%"></span></span><span class="fn">${e.n} · ${brlShort(e.valor)}</span></div>`).join('')}</div>
    <h4>Ritmo do mês (${p.diasUteis} dias úteis)</h4>
    <div class="metas-dia">${p.ritmoMetas.map(x => `<div class="md"><span class="small">${esc(x.nome)}</span><strong>${num(x.feito)}<small>/${num(x.esperado)}</small></strong>${bar(pct(x.feito, x.esperado), x.feito >= x.esperado)}</div>`).join('')}<div class="md"><span class="small">Conversões históricas</span><strong>${Math.round(p.conv.pr * 100)}%<small> prosp.→reunião</small></strong><span class="small">${Math.round(p.conv.rv * 100)}% reunião→venda</span></div></div>
    ${p.plano ? `<p class="small muted">Plano de ação aprovado: ${num(p.plano.prospeccoes)} prospecções/dia, meta de ${brl(p.plano.vgv90)} em 90 dias.</p>` : ''}
  </div>`, `<div class="row-a"><button class="btn xs" data-act="ver-carteira" data-id="${uid}">Ver carteira</button><button class="btn xs" data-act="ver-agenda" data-id="${uid}">Ver agenda</button></div>`, 'span2');
};

// ---------- Eventos
const eventosFuturos = () => list(S.eventos).filter(e => e.ativo !== false && (e.data || '9999') >= todayStr()).sort((a, b) => (a.data || '').localeCompare(b.data || ''));
const todayStr = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
const inscritosDe = eid => list(S.inscricoes).filter(i => i.eventoId === eid && !i.canceladaEm);
const minhaInscricao = eid => list(S.inscricoes).find(i => i.eventoId === eid && i.ownerId === S.uid && !i.canceladaEm);
const pessoas = ins => 1 + (ins.visitantes || []).filter(Boolean).length;
const dataEvento = e => `${e.data ? fmtDate(e.data) : 'Data a definir'}${e.hora ? ' às ' + esc(e.hora) : ''}`;
const statusEmail = i => { const s = i.email?.status; return s === 'enviado' ? chip('E-mail enviado', 'ok') : s === 'erro' ? chip('Falha no e-mail', 'bad') : s === 'aguardando_configuracao' ? chip('E-mail pendente', 'warn') : chip('Enviando e-mail…'); };

export const eventosTile = () => {
  const prox = eventosFuturos()[0]; const minha = prox && minhaInscricao(prox.id);
  return `<a class="evento-tile" href="#eventos"><span class="balao">${ic('balao', 34)}</span><span class="et-txt"><strong>EVENTOS</strong><span>${prox ? `${esc(prox.titulo)} · ${dataEvento(prox)}` : 'Fique de olho nos próximos eventos da Primoris'}</span></span><span class="et-cta">${prox ? (minha ? chip('Você está inscrito', 'ok') : '<span class="btn sm accent">Inscrever-se</span>') : ic('arrow', 18)}</span></a>`;
};

export const eventos = () => {
  const fut = eventosFuturos(); const minhas = list(S.inscricoes).filter(i => i.ownerId === S.uid && !i.canceladaEm).sort((a, b) => (b.at || '').localeCompare(a.at || ''));
  const gestao = isGestor() && S.sub.evGestao;
  if (gestao) return pageHead(`<span class="balao-t">${ic('balao', 30)}</span> Organizar eventos`, 'Somente gestores criam e editam eventos e acompanham os inscritos.', `<button class="btn sm" data-act="ad-eventos">${ic('back', 16)} Ver como consultor</button>`) + eventosAdmin();
  return pageHead(`<span class="balao-t">${ic('balao', 30)}</span> Eventos`, 'Inscreva-se e leve seus convidados. Você recebe a confirmação por e-mail.', isGestor() ? `<button class="btn sm" data-act="ad-eventos">${ic('gear', 16)} Organizar eventos</button>` : '')
    + (fut.length ? `<div class="eventos">${fut.map(e => { const m = minhaInscricao(e.id); const ins = inscritosDe(e.id); const total = ins.reduce((s, i) => s + pessoas(i), 0); const lot = e.limite && total >= Number(e.limite); return `<article class="evento card"><div class="ev-data"><span>${e.data ? esc(e.data.slice(8, 10)) : '--'}</span><small>${e.data ? esc(['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][Number(e.data.slice(5, 7)) - 1]) : ''}</small></div><div class="ev-info"><h3>${esc(e.titulo)}</h3><p class="muted small">${dataEvento(e)}${e.local ? ' · ' + esc(e.local) : ''}</p>${e.descricao ? `<p>${esc(e.descricao).replace(/\n/g, '<br>')}</p>` : ''}<p class="small muted">${total} pessoa(s) confirmada(s)${e.limite ? ` de ${num(e.limite)} vagas` : ''}</p></div><div class="ev-acao">${m ? `${chip('Inscrito', 'ok')} ${statusEmail(m)}<div class="row-a"><button class="btn xs" data-act="inscrever" data-id="${e.id}">Editar</button><button class="btn xs danger" data-act="cancelar-inscricao" data-id="${m.id}">Cancelar</button></div>` : lot ? chip('Esgotado', 'bad') : `<button class="btn accent" data-act="inscrever" data-id="${e.id}">${ic('balao', 18)} Inscrever-se</button>`}</div></article>`; }).join('')}</div>`
      : empty('Nenhum evento aberto', isGestor() ? 'Crie um evento em Organizar eventos para liberar as inscrições.' : 'Assim que a Primoris abrir um evento, ele aparece aqui.'))
    + (minhas.length ? `<section class="card tablewrap"><header class="card-h"><h3>Minhas inscrições</h3></header><table class="tbl"><thead><tr><th>Evento</th><th>Data</th><th class="r">Visitantes</th><th>Confirmação</th></tr></thead><tbody>${minhas.map(i => { const e = S.eventos[i.eventoId] || {}; return `<tr><td>${esc(e.titulo || 'Evento')}</td><td>${dataEvento(e)}</td><td class="r">${(i.visitantes || []).filter(Boolean).length}</td><td>${statusEmail(i)}</td></tr>`; }).join('')}</tbody></table></section>` : '');
};

export const inscricaoForm = (e, ins = {}) => {
  const m = S.members[S.uid] || {}; const vis = ins.visitantes || []; const q = ins.id ? vis.length : 0;
  return `<form data-form="inscricao" data-id="${e.id}" data-ins="${ins.id || ''}" class="form-grid">
  <div class="span2 ev-resumo"><strong>${esc(e.titulo)}</strong><span class="muted small">${dataEvento(e)}${e.local ? ' · ' + esc(e.local) : ''}</span></div>
  ${field('Seu nome completo *', inp('nome', ins.nome || m.nome || '', 'required autocomplete="name"'), 'span2')}
  ${field('E-mail *', inp('email', ins.email || m.email || S.profile?.email || '', 'type="email" required autocomplete="email"'))}
  ${field('Celular / WhatsApp *', inp('celular', ins.celular || (m.telefone ? String(m.telefone).replace(/^55/, '') : ''), 'required inputmode="tel" placeholder="(21) 99999-9999"'))}
  ${field('Quantos visitantes você vai levar?', `<input id="f-qtd" name="qtd" type="number" min="0" max="${Math.min(30, Number(e.maxVisitantes) || 30)}" value="${q}" data-visitantes>`, 'span2')}
  <div class="span2 visitantes" id="visitantes">${vis.map((v, i) => visitanteInput(i, v)).join('')}</div>
  <p class="muted small span2">Ao confirmar, você e a Primoris recebem um e-mail com os dados da inscrição.</p>
  <div class="span2 row-a"><button class="btn accent">${ins.id ? 'Salvar alterações' : 'Confirmar inscrição'}</button></div></form>`;
};
export const visitanteInput = (i, v = '') => `<label class="field"><span>Nome do visitante ${i + 1} *</span><input name="v${i}" id="f-v${i}" value="${esc(v)}" required autocomplete="off"></label>`;

export const eventosAdmin = () => {
  const evs = list(S.eventos).sort((a, b) => (b.data || '').localeCompare(a.data || ''));
  const sel = S.sub.evSel && S.eventos[S.sub.evSel] ? S.sub.evSel : evs[0]?.id;
  const ins = sel ? inscritosDe(sel).sort((a, b) => (a.at || '').localeCompare(b.at || '')) : [];
  const pend = list(S.inscricoes).filter(i => i.email?.status && i.email.status !== 'enviado' && !i.canceladaEm).length;
  return `<div class="row-a"><button class="btn accent sm" data-act="novo-evento">${ic('plus', 16)} Novo evento</button>${pend ? `<span class="chip warn">${pend} e-mail(s) pendente(s)</span>` : ''}</div>`
    + (evs.length ? `<section class="card tablewrap"><table class="tbl"><thead><tr><th>Evento</th><th>Data</th><th>Local</th><th class="r">Inscritos</th><th class="r">Pessoas</th><th>Status</th><th></th></tr></thead><tbody>${evs.map(e => { const l = inscritosDe(e.id); return `<tr class="${e.id === sel ? 'sel' : ''}"><td><button class="linkbtn" data-act="ev-sel" data-id="${e.id}"><strong>${esc(e.titulo)}</strong></button></td><td>${dataEvento(e)}</td><td>${esc(e.local || '')}</td><td class="r">${l.length}</td><td class="r">${l.reduce((s, i) => s + pessoas(i), 0)}${e.limite ? ' / ' + num(e.limite) : ''}</td><td>${e.ativo === false ? chip('Encerrado') : chip('Aberto', 'ok')}</td><td class="acts"><button class="btn xs" data-act="editar-evento" data-id="${e.id}">Editar</button></td></tr>`; }).join('')}</tbody></table></section>` : empty('Nenhum evento criado', 'Crie o primeiro evento para liberar as inscrições no Dashboard.'))
    + (sel ? `<section class="card tablewrap"><header class="card-h"><h3>Inscritos · ${esc(S.eventos[sel].titulo)}</h3><button class="btn xs" data-act="exportar-inscritos" data-id="${sel}">${ic('download', 14)} Exportar lista</button></header>${ins.length ? `<table class="tbl"><thead><tr><th>Inscrito</th><th>Contato</th><th>Consultor</th><th>Visitantes</th><th>E-mail</th></tr></thead><tbody>${ins.map(i => `<tr><td><strong>${esc(i.nome)}</strong><div class="small muted">${fmtDT(i.at)}</div></td><td class="small">${esc(i.email)}<br>${esc(i.celular)}</td><td>${esc(nome(i.ownerId))}</td><td class="small">${(i.visitantes || []).filter(Boolean).map(esc).join('<br>') || '—'}</td><td>${statusEmail(i)}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">Nenhuma inscrição ainda.</p>'}</section>` : '');
};
export const eventoForm = (e = {}) => `<form data-form="evento" data-id="${e.id || ''}" class="form-grid">
  ${field('Nome do evento *', inp('titulo', e.titulo, 'required'), 'span2')}
  ${field('Data *', inp('data', e.data, 'type="date" required'))}
  ${field('Horário', inp('hora', e.hora, 'type="time"'))}
  ${field('Local', inp('local', e.local, 'placeholder="Endereço ou link"'), 'span2')}
  ${field('Descrição', txt('descricao', e.descricao, 'rows="3"'), 'span2')}
  ${field('Limite total de pessoas (opcional)', inp('limite', e.limite, 'type="number" min="1"'))}
  ${field('Máximo de visitantes por inscrição', inp('maxVisitantes', e.maxVisitantes || 10, 'type="number" min="0" max="30"'))}
  ${field('Status', sel('ativo', [['1', 'Inscrições abertas'], ['0', 'Encerrado']], e.ativo === false ? '0' : '1'))}
  <label class="check span2"><input type="checkbox" name="avisar" id="f-avisar" ${e.id ? '' : 'checked'}> <span>Avisar todos por notificação</span></label>
  <div class="span2 row-a"><button class="btn accent">Salvar evento</button></div></form>`;

// ---------- Meta do mês: coroa subindo até os brindes
export const MARCOS_PADRAO = [{ valor: 300000, brinde: 'Brinde' }, { valor: 500000, brinde: 'Brinde' }, { valor: 1000000, brinde: 'Brinde' }];
export const marcos = () => { const l = S.config.metaMes?.marcos; return (Array.isArray(l) && l.length ? l : MARCOS_PADRAO).map(m => ({ valor: Number(m.valor) || 0, brinde: String(m.brinde || 'Brinde') })).filter(m => m.valor > 0).sort((a, b) => a.valor - b.valor); };
export const mesAtual = () => { const t = today(); return { from: t.slice(0, 8) + '01', to: t, mk: t.slice(0, 7) }; };
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const metaMesCard = (uids, eu) => {
  const r = mesAtual(); const val = vgv(uids, r); const ms = marcos(); if (!ms.length) return '';
  const topo = ms[ms.length - 1].valor; const p = Math.min(100, (val / topo) * 100);
  const prox = ms.find(m => val < m.valor); const ganhos = ms.filter(m => val >= m.valor).length;
  const mes = MESES[Number(r.mk.slice(5, 7)) - 1];
  const torre = `<div class="mm-torre" style="--p:${p.toFixed(1)}%"><div class="mm-trilho"><div class="mm-fill"></div></div>
    ${ms.map(m => { const ok = val >= m.valor; return `<div class="mm-marco ${ok ? 'ok' : ''}" style="--y:${((m.valor / topo) * 100).toFixed(1)}%"><span class="mm-linha"></span><span class="mm-gift">${ic('gift', 18)}</span><span class="mm-lbl"><strong>${brlShort(m.valor)}</strong><small>${ok ? 'Conquistado!' : esc(m.brinde)}</small></span></div>`; }).join('')}
    <div class="mm-coroa"><img src="img/coroa-64.webp" width="44" height="31" alt=""></div></div>`;
  const resumo = `<div class="mm-resumo"><span class="muted small">VGV validado em ${mes}</span><strong class="big accent-t" data-n="${val}" data-f="brl">${brlShort(val)}</strong>
    ${prox ? `<p>Próximo brinde em <strong>${brlShort(prox.valor)}</strong></p><p class="muted small">Faltam ${brlShort(prox.valor - val)} para ${esc(prox.brinde.toLowerCase() === 'brinde' ? 'o próximo brinde' : prox.brinde)}.</p>` : `<p class="mm-top">${ic('trophy', 18)} Todos os brindes do mês conquistados!</p>`}
    <div class="mm-chips">${ms.map(m => `<span class="chip ${val >= m.valor ? 'ok' : ''}">${ic('gift', 13)} ${brlShort(m.valor)}${m.brinde !== 'Brinde' ? ' · ' + esc(m.brinde) : ''}</span>`).join('')}</div>
    <p class="muted small">${ganhos} de ${ms.length} brindes · ${eu ? 'sua meta individual' : 'meta do escopo selecionado'} · reinicia todo dia 1º</p></div>`;
  return card(`${ic('gift', 18)} Meta do mês`, `<div class="metames">${torre}${resumo}</div>`, isAdmin() ? '<button class="btn xs" data-act="editar-marcos">Editar brindes</button>' : '', 'span2');
};
export const marcosForm = () => `<form data-form="marcos" class="form-grid"><p class="muted small span2">Defina os valores de VGV validado no mês e o brinde de cada etapa. A coroa sobe até o último valor.</p>
  <div class="span2 marcos-l">${[...marcos(), {}, {}].slice(0, 8).map((m, i) => `<div class="row-a" data-row="marco"><label class="field"><span>VGV do mês (R$)</span><input name="m_valor" type="number" min="0" step="1000" value="${m.valor || ''}"></label><label class="field grow"><span>Brinde</span><input name="m_brinde" value="${esc(m.brinde || '')}" placeholder="Ex.: Brinde, Jantar, Viagem"></label></div>`).join('')}</div>
  <div class="span2 row-a"><button class="btn accent">Salvar brindes</button></div></form>`;

// ---------- Minhas Vendas (lançamento simples: tipo, cliente, grupo, cota, data, valor e contrato)
export const TIPOS = { imovel: { nome: 'Imóvel', ic: 'home', produto: 'Imobiliário' }, veiculo: { nome: 'Veículo', ic: 'car', produto: 'Veículos' } };
export const tipoVenda = v => v.tipo || (/im[oó]v|imob/i.test(v.produto || '') ? 'imovel' : /ve[ií]c/i.test(v.produto || '') ? 'veiculo' : 'outro');
const tipoIc = (t, s = 18) => `<span class="tipo-ic ${t}" title="${TIPOS[t]?.nome || 'Outro'}">${ic(TIPOS[t]?.ic || 'file', s)}</span>`;
const ativa = v => !['reprovada', 'cancelada'].includes(vendaStatus(v));
const contratosDe = v => [...(v.contratos || []), ...(v.contrato && !(v.contratos || []).some(c => c.path === v.contrato) ? [{ path: v.contrato, nome: 'Contrato' }] : []), ...(v.comprovante && !(v.contratos || []).some(c => c.path === v.comprovante) ? [{ path: v.comprovante, nome: 'Comprovante' }] : [])];
export const resumoVendasMes = uids => {
  const r = mesAtual(); const l = vendasDe(uids).filter(v => inP(v.data, r) && ativa(v));
  const por = t => { const x = l.filter(v => tipoVenda(v) === t); return { n: x.length, valor: x.reduce((s, v) => s + (Number(v.valor) || 0), 0) }; };
  return { n: l.length, valor: l.reduce((s, v) => s + (Number(v.valor) || 0), 0), imovel: por('imovel'), veiculo: por('veiculo'), mes: MESES[Number(r.mk.slice(5, 7)) - 1] };
};
export const vendidoMesCard = (uids, eu) => {
  const x = resumoVendasMes(uids);
  return card(`${ic('cifrao', 18)} Vendido no mês`, `<div class="vend-mes">
    <div class="vm-total"><span class="muted small">Total vendido em ${x.mes}</span><strong class="big accent-t" data-n="${x.valor}" data-f="brl">${brlShort(x.valor)}</strong><span class="muted small">${num(x.n)} venda(s) · inclui as aguardando validação</span></div>
    ${['imovel', 'veiculo'].map(t => `<div class="vm-tipo">${tipoIc(t, 26)}<div><span class="muted small">${TIPOS[t].nome}s</span><strong>${brlShort(x[t].valor)}</strong><span class="muted small">${num(x[t].n)} venda(s)</span></div></div>`).join('')}
  </div>`, `<a href="#minhas-vendas" class="link">${eu ? 'Lançar venda' : 'Ver vendas'}</a>`, 'span2');
};
export const minhasVendas = () => {
  const x = resumoVendasMes([S.uid]);
  const l = vendasDe([S.uid]).sort((a, b) => (b.data || '').localeCompare(a.data || '') || (b.createdAt || '').localeCompare(a.createdAt || ''));
  const semContrato = l.filter(v => ativa(v) && !contratosDe(v).length).length;
  const resumo = `<div class="kpis vm-kpis">
    <div class="kpi accent"><span>Vendido no mês</span><strong>${brlShort(x.valor)}</strong><small>${num(x.n)} venda(s) em ${x.mes}</small></div>
    ${['imovel', 'veiculo'].map(t => `<div class="kpi"><span>${tipoIc(t, 16)} ${TIPOS[t].nome}s no mês</span><strong>${brlShort(x[t].valor)}</strong><small>${num(x[t].n)} venda(s)</small></div>`).join('')}
    <div class="kpi ${semContrato ? 'warn' : ''}"><span>${ic('file', 16)} Contratos pendentes</span><strong>${num(semContrato)}</strong><small>${semContrato ? 'Envie para não perder' : 'Todos guardados'}</small></div></div>`;
  const tabela = l.length ? `<section class="card tablewrap"><table class="tbl vendas-tbl"><thead><tr><th>Tipo</th><th>Data</th><th>Cliente</th><th>Grupo</th><th>Cota</th><th class="r">Valor</th><th>Status</th><th>Contrato</th></tr></thead><tbody>${l.map(v => { const st = vendaStatus(v); const cs = contratosDe(v); const pode = !['validada', 'cancelada'].includes(st);
    return `<tr><td>${tipoIc(tipoVenda(v))}</td><td>${fmtDate(v.data)}</td><td><strong>${esc(S.contatos[v.contatoId]?.nome || v.clienteNome || '—')}</strong></td><td>${esc(v.grupo || '—')}</td><td>${esc(v.cota || '—')}</td><td class="r"><strong>${brl(Number(v.valor) || 0)}</strong></td><td>${chip(...(STATUS_VENDA[st] || [st]))}</td>
      <td class="acts">${cs.map(c => `<button class="btn xs" data-act="ver-arquivo" data-id="${esc(c.path)}" title="${esc(c.nome || 'Contrato')}">${ic('file', 13)} Ver</button>`).join('')}<button class="btn xs ${cs.length ? '' : 'accent'}" data-act="enviar-contrato" data-id="${v.id}">${ic('upload', 13)} ${cs.length ? 'Mais' : 'Enviar contrato'}</button>${pode ? `<button class="btn xs" data-act="editar-lancamento" data-id="${v.id}">Editar</button>` : ''}</td></tr>`; }).join('')}</tbody></table></section>`
    : empty('Nenhuma venda lançada ainda', 'Clique em “Lançar venda” e registre tipo, grupo, cota, data e valor. Aproveite e já anexe o contrato do cliente.');
  return pageHead(`${ic('cifrao', 28)} Minhas Vendas`, 'Lance suas vendas e guarde os contratos dos clientes em um só lugar.', `<button class="btn accent sm" data-act="lancar-venda">${ic('plus', 16)} Lançar venda</button>`)
    + resumo + tabela + '<p class="muted small">Os contratos ficam guardados com segurança e não podem ser apagados pelo consultor. Somente você, seu gestor e a administração conseguem abrir.</p>';
};
export const lancarVendaForm = (v = {}) => {
  const t = v.id ? tipoVenda(v) : 'imovel'; const g = geral(); const cs = contatosDe([S.uid]).sort((a, b) => a.nome.localeCompare(b.nome));
  const cli = S.contatos[v.contatoId]?.nome || v.clienteNome || '';
  return `<form data-form="lancar" data-id="${v.id || ''}" class="form-grid">
  <div class="span2 tipo-sel">${['imovel', 'veiculo'].map(k => `<label class="tipo-op"><input type="radio" name="tipo" value="${k}" ${t === k ? 'checked' : ''}><span>${ic(TIPOS[k].ic, 30)}<strong>${TIPOS[k].nome}</strong></span></label>`).join('')}</div>
  ${field('Nome do cliente *', `<input name="cliente" id="f-cliente" value="${esc(cli)}" required list="dl-clientes" autocomplete="off"><datalist id="dl-clientes">${cs.map(c => `<option value="${esc(c.nome)}">`).join('')}</datalist>`, 'span2')}
  ${field('Grupo *', inp('grupo', v.grupo, 'required'))}
  ${field('Cota *', inp('cota', v.cota, 'required'))}
  ${field('Data da venda *', inp('data', v.data || today(), 'type="date" required'))}
  ${field('Valor da venda (R$) *', inp('valor', v.valor ? String(v.valor).replace('.', ',') : '', 'required inputmode="decimal" placeholder="Ex.: 250.000,00"'))}
  ${field('Administradora', g.administradoras?.length ? sel('administradora', ['', ...g.administradoras], v.administradora || '') : inp('administradora', v.administradora), 'span2')}
  ${field(v.id ? 'Anexar outro contrato (opcional)' : 'Contrato do cliente (PDF ou foto)', '<input type="file" id="f-contrato" name="contrato" accept="application/pdf,image/*">', 'span2')}
  <p class="muted small span2">A venda aparece na hora em “Vendido no mês”. Para somar no VGV oficial, ela passa pela validação da administração.</p>
  <div class="span2 row-a"><button class="btn accent">${v.id ? 'Salvar alterações' : 'Lançar venda'}</button></div></form>`;
};
export const contratoForm = id => `<form data-form="contrato" data-id="${id}" class="form-grid">
  ${field('Arquivo do contrato (PDF ou foto, até 25 MB) *', '<input type="file" id="f-contrato" name="contrato" accept="application/pdf,image/*" required>', 'span2')}
  ${field('Descrição', inp('nomeArq', '', 'placeholder="Ex.: Contrato assinado, aditivo, RG do cliente"'), 'span2')}
  <div class="span2 row-a"><button class="btn accent">Enviar contrato</button></div></form>`;

// ---------- Hubs: Minha Jornada e Carteira & Vendas (menus unificados)
const hubTabs = (chave, tabs, atual) => `<div class="hub-tabs" role="tablist">${tabs.map(([id, l, i, n]) => `<button role="tab" aria-selected="${atual === id}" class="${atual === id ? 'on' : ''}" data-act="hub-tab" data-id="${chave}:${id}">${ic(i, 17)}<span>${l}</span>${n ? `<b class="hub-n">${n}</b>` : ''}</button>`).join('')}</div>`;
export const JORNADA_TABS = ['visao', 'plano', 'milhao', 'carreira', 'conquistas'];
export const jornada = () => {
  const tab = JORNADA_TABS.includes(S.sub.jTab) ? S.sub.jTab : 'visao';
  const t = today(); const abertas = list(S.tarefas).filter(x => x.ownerId === S.uid && x.status === 'aberta'); const atras = abertas.filter(x => x.prazo && x.prazo < t).length;
  const mm = geral().metaMilhao || 1000000; const tot = vgvTotal(S.uid); const pn = proxNivel(S.uid); const cq = conquistasDe(S.uid); const ganhas = cq.filter(x => x.ok).length;
  const tabs = [['visao', 'Visão geral', 'home'], ['plano', 'Plano de Ação', 'checksq', atras || ''], ['milhao', 'Primeiro Milhão', 'coins'], ['carreira', 'Evolução', 'stairs'], ['conquistas', 'Conquistas', 'medal']];
  const head = pageHead(`${ic('stairs', 28)} Minha Jornada`, 'Seu caminho na Primoris em um só lugar: o que fazer hoje, quanto falta para o primeiro milhão, seu nível de carreira e suas medalhas.');
  let body;
  if (tab === 'visao') {
    const passo = (n, titulo, tb, ico, valor, detalhe, barra) => `<button class="jt card" data-act="hub-tab" data-id="jornada:${tb}"><span class="jt-n">${n}</span><span class="jt-ic">${ic(ico, 24)}</span><span class="jt-t">${titulo}</span><strong>${valor}</strong>${barra != null ? bar(barra, true) : ''}<small class="muted">${detalhe}</small><span class="jt-go">Abrir ${ic('arrow', 14)}</span></button>`;
    body = `<p class="muted jt-intro">Siga a ordem: as <strong>tarefas do dia</strong> geram vendas, as <strong>vendas</strong> levam ao primeiro milhão, e o milhão, junto com os requisitos, sobe o seu <strong>nível de carreira</strong>. Cada passo rende <strong>conquistas</strong>.</p>
    <div class="jt-grid">
      ${passo(1, 'Plano de Ação', 'plano', 'checksq', `${num(abertas.length)} tarefa(s) aberta(s)`, atras ? `<span class="warn-t">${atras} atrasada(s)</span>` : 'Nenhuma atrasada', null)}
      ${passo(2, 'Meu Primeiro Milhão', 'milhao', 'coins', brlShort(tot) + ' <small class="muted">de ' + brlShort(mm) + '</small>', `${pct(tot, mm)}% do caminho · VGV validado`, pct(tot, mm))}
      ${passo(3, 'Evolução de carreira', 'carreira', 'stairs', esc(nivelNome(S.members[S.uid]?.nivel)), pn ? `Próximo: ${esc(pn.nome)}${pn.definido ? ` · ${pn.feitos} de ${pn.total} requisitos` : ''}` : 'Topo da carreira', pn?.definido ? pn.pct : null)}
      ${passo(4, 'Conquistas', 'conquistas', 'medal', `${ganhas} de ${cq.length} medalhas`, 'Ranking do mês, desafios e mural', pct(ganhas, cq.length))}
    </div>`;
  } else if (tab === 'plano') body = V.plano();
  else if (tab === 'milhao') body = V.vendas('milhao');
  else if (tab === 'carreira') body = V.carreira();
  else body = V.conquistas();
  return head + hubTabs('jornada', tabs, tab) + `<div class="hub-body">${body}</div>`;
};
export const CARTEIRA_TABS = ['clientes', 'vendas', 'comissoes', 'simulador', 'fila'];
export const carteiraHub = () => {
  let tab = CARTEIRA_TABS.includes(S.sub.cTab) ? S.sub.cTab : 'clientes'; if (tab === 'fila' && !isGestor()) tab = 'clientes';
  const cs = contatosDe([S.uid]); const x = resumoVendasMes([S.uid]);
  const semContrato = vendasDe([S.uid]).filter(v => !['reprovada', 'cancelada'].includes(vendaStatus(v)) && !(v.contratos || []).length && !v.contrato && !v.comprovante).length;
  const fila = isGestor() ? list(S.vendas).filter(v => ['registrada', 'pre_aprovada', 'em_analise'].includes(vendaStatus(v))).length : 0;
  const tabs = [['clientes', 'Clientes', 'users', ''], ['vendas', 'Vendas e contratos', 'cifrao', semContrato || ''], ['comissoes', 'Comissões', 'coins'], ['simulador', 'Simulador', 'chart'], ...(isGestor() ? [['fila', 'Validação', 'check', fila || '']] : [])];
  const resumo = `<div class="hub-resumo">
    <button data-act="hub-tab" data-id="carteira:clientes"><span class="muted small">Clientes na carteira</span><strong>${num(cs.length)}</strong></button>
    <button data-act="hub-tab" data-id="carteira:vendas"><span class="muted small">Vendido em ${x.mes}</span><strong class="accent-t">${brlShort(x.valor)}</strong></button>
    <button data-act="hub-tab" data-id="carteira:vendas"><span class="muted small">${ic('home', 13)} Imóveis · ${ic('car', 13)} Veículos</span><strong>${brlShort(x.imovel.valor)} · ${brlShort(x.veiculo.valor)}</strong></button>
    <button data-act="hub-tab" data-id="carteira:vendas" class="${semContrato ? 'alerta' : ''}"><span class="muted small">Contratos pendentes</span><strong>${num(semContrato)}</strong></button></div>`;
  const head = pageHead(`${ic('users', 28)} Carteira & Vendas`, 'Do primeiro contato ao contrato guardado: seus clientes, suas vendas e suas comissões.');
  const body = tab === 'clientes' ? V.carteira() : tab === 'vendas' ? minhasVendas() : V.vendas(tab);
  return head + resumo + hubTabs('carteira', tabs, tab) + `<div class="hub-body">${body}</div>`;
};

// ---------- Biblioteca Primoris: as ferramentas ficam em biblioteca.js
export { biblioteca } from './biblioteca.js?v=21';
