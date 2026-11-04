// Primoris Academy — Fórum de dúvidas e projeção individual do consultor.
import {
  S, esc, brl, brlShort, num, pct, fmtDT, fmtDate, list, firstName, nome, isGestor, isAdmin, minhasEquipes, equipeDe,
  CATEGORIAS_FORUM, papel, respostasDe, statusTopico, projecao, initials,
} from './core.js';
import { ic, chip, bar, card, empty, field, inp, sel, txt, opt, pageHead } from './views.js';

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
