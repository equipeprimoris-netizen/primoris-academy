// Primoris Academy — Fórum de dúvidas e projeção individual do consultor.
import {
  S, esc, brl, brlShort, num, pct, fmtDT, fmtDate, list, firstName, nome, isGestor, isAdmin, minhasEquipes, equipeDe,
  CATEGORIAS_FORUM, papel, respostasDe, statusTopico, projecao, initials,
} from './core.js?v=8';
import { ic, chip, bar, card, empty, field, inp, sel, txt, opt, pageHead } from './views.js?v=8';

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
  return pageHead(`<span class="balao-t">${ic('balao', 30)}</span> Eventos`, 'Inscreva-se e leve seus convidados. Você recebe a confirmação por e-mail.', isAdmin() ? `<button class="btn sm" data-act="ad-eventos">${ic('gear', 16)} Gerenciar eventos</button>` : '')
    + (fut.length ? `<div class="eventos">${fut.map(e => { const m = minhaInscricao(e.id); const ins = inscritosDe(e.id); const total = ins.reduce((s, i) => s + pessoas(i), 0); const lot = e.limite && total >= Number(e.limite); return `<article class="evento card"><div class="ev-data"><span>${e.data ? esc(e.data.slice(8, 10)) : '--'}</span><small>${e.data ? esc(['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][Number(e.data.slice(5, 7)) - 1]) : ''}</small></div><div class="ev-info"><h3>${esc(e.titulo)}</h3><p class="muted small">${dataEvento(e)}${e.local ? ' · ' + esc(e.local) : ''}</p>${e.descricao ? `<p>${esc(e.descricao).replace(/\n/g, '<br>')}</p>` : ''}<p class="small muted">${total} pessoa(s) confirmada(s)${e.limite ? ` de ${num(e.limite)} vagas` : ''}</p></div><div class="ev-acao">${m ? `${chip('Inscrito', 'ok')} ${statusEmail(m)}<div class="row-a"><button class="btn xs" data-act="inscrever" data-id="${e.id}">Editar</button><button class="btn xs danger" data-act="cancelar-inscricao" data-id="${m.id}">Cancelar</button></div>` : lot ? chip('Esgotado', 'bad') : `<button class="btn accent" data-act="inscrever" data-id="${e.id}">${ic('balao', 18)} Inscrever-se</button>`}</div></article>`; }).join('')}</div>`
      : empty('Nenhum evento aberto', isAdmin() ? 'Crie um evento em Gerenciar eventos para liberar as inscrições.' : 'Assim que a Primoris abrir um evento, ele aparece aqui.'))
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
