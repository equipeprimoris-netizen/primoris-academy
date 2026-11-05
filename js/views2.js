// Primoris Academy — telas da versão 2: resumo da semana, comissões, desafios, diagnóstico, mensagens e backup.
import {
  S, esc, brl, brlShort, num, pct, fmtDate, fmtDT, today, addDays, list, firstName, monthLabel, monthKey, MESES,
  ETAPAS, etapaNome, isAdmin, isGestor, nome, nivelNome, ativos, minhasEquipes, membrosDaEquipe, escopoUids, periodo,
  vgv, vendasValidadas, resumoSemana, comissaoVenda, comissoesDoMes, regrasComissao, pagamento, desafios, desafioAtivo,
  desafioProgresso, INDICADORES, diagnostico, geral, szResumo, equipeDe, niveisCfg,
} from './core.js?v=21';
import { ic, chip, bar, card, kpi, empty, field, inp, sel, txt, opt, pageHead, barChart } from './views.js?v=21';

// ---------- Resumo da semana
const delta = (a, b) => { if (!b && !a) return ''; if (!b) return chip('novo', 'ok'); const d = Math.round(((a - b) / b) * 100); return chip((d >= 0 ? '+' : '') + d + '%', d >= 0 ? 'ok' : 'bad'); };
export const resumo = () => {
  const eu = !isGestor();
  const uids = eu ? [S.uid] : isAdmin() ? ativos().map(m => m.id) : [S.uid, ...membrosDaEquipe(minhasEquipes())];
  const r = resumoSemana(uids); const a = r.atual, b = r.anterior;
  const linha = (l, x, y, money) => `<div class="kpi"><span class="kpi-l">${l}</span><span class="kpi-v">${money ? brlShort(x) : num(x)}</span><span class="kpi-s">${delta(x, y)} vs. semana anterior (${money ? brlShort(y) : num(y)})</span></div>`;
  return pageHead('Resumo da semana', `${fmtDate(r.r1.from)} a ${fmtDate(r.r1.to)} · ${eu ? 'seus números' : isAdmin() ? 'toda a operação' : 'sua equipe'}`)
    + `<div class="kpis">${linha('Prospecções', a.prosp, b.prosp)}${linha('Contatos novos', a.cont, b.cont)}${linha('Reuniões realizadas', a.real, b.real)}${linha('VGV validado', a.vgv, b.vgv, true)}</div>`
    + `<div class="grid2">${eu ? '' : card('Atenção', `<ul class="lst">
        <li><span>Parados na Semana Zero (mais de 7 dias)</span><strong>${r.parados.length}</strong></li>
        <li><span>Sem nenhuma atividade na semana</span><strong>${r.semAtividade.length}</strong></li>
        <li><span>Vendas aguardando validação</span><strong>${r.pendentes.length} · ${brlShort(r.pendentes.reduce((s, v) => s + Number(v.valor || 0), 0))}</strong></li></ul>
        ${r.semAtividade.length ? `<h4>Sem atividade</h4><p>${r.semAtividade.map(u => `<button class="linkbtn" data-act="perfil" data-id="${u}">${esc(nome(u))}</button>`).join(', ')}</p>` : ''}
        ${r.parados.length ? `<h4>Parados na Semana Zero</h4><p>${r.parados.map(u => `<button class="linkbtn" data-act="perfil" data-id="${u}">${esc(nome(u))}</button> (Dia ${szResumo(u).atual + 1})`).join(', ')}</p>` : ''}`)}
      ${card(eu ? 'Sua semana em uma frase' : 'Destaque da semana', r.destaque && (r.destaque.v || r.destaque.p) ? `<p class="big">${esc(eu ? 'Você' : nome(r.destaque.u))}</p><p class="muted">${brlShort(r.destaque.v)} em VGV validado · ${r.destaque.p} prospecções</p>` : '<p class="muted">Ainda sem movimento nesta semana.</p>')}
      ${card('Desafios em andamento', desafioAtivo().length ? desafioAtivo().map(d => desafioCard(d, uids)).join('') : '<p class="muted">Nenhum desafio ativo. ' + (isAdmin() ? 'Crie um em Administração → Desafios.' : '') + '</p>', '', 'span2')}</div>`;
};

// ---------- Desafios
export const desafioCard = (d, uids = [S.uid]) => {
  const meu = desafioProgresso(S.uid, d); const money = d.indicador === 'vgv';
  const rk = uids.map(u => ({ u, ...desafioProgresso(u, d) })).sort((a, b) => b.v - a.v).slice(0, 5);
  return `<div class="desafio"><div class="desafio-h"><strong>${esc(d.titulo)}</strong><span class="muted small">${esc(INDICADORES[d.indicador])} · meta ${money ? brlShort(d.meta) : num(d.meta)} · até ${fmtDate(d.fim)}</span></div>
    ${bar(meu.pct, true)}<p class="small">${meu.ok ? chip('Desafio cumprido!', 'ok') : `Você: ${money ? brlShort(meu.v) : num(meu.v)} (${meu.pct}%)`}${d.premio ? ' · Prêmio: ' + esc(d.premio) : ''}</p>
    ${uids.length > 1 ? `<ol class="rank">${rk.map((x, i) => `<li class="${x.u === S.uid ? 'me' : ''}"><span class="pos ${i < 3 ? 'accent-t' : ''}">${i + 1}</span><span>${esc(nome(x.u))}</span><span>${money ? brlShort(x.v) : num(x.v)} ${x.ok ? '✓' : ''}</span></li>`).join('')}</ol>` : ''}</div>`;
};
export const desafiosAdmin = () => {
  const l = (S.config.desafios?.lista || []).slice().sort((a, b) => b.inicio.localeCompare(a.inicio));
  return `<div class="row-a"><button class="btn accent sm" data-act="novo-desafio">${ic('plus', 16)} Novo desafio</button></div>` + (l.length ? `<section class="card tablewrap"><table class="tbl"><thead><tr><th>Desafio</th><th>Indicador</th><th class="r">Meta</th><th>Período</th><th class="r">Cumpriram</th><th></th></tr></thead><tbody>${l.map(d => `<tr><td><strong>${esc(d.titulo)}</strong>${d.premio ? `<div class="small muted">${esc(d.premio)}</div>` : ''}</td><td>${esc(INDICADORES[d.indicador])}</td><td class="r">${d.indicador === 'vgv' ? brlShort(d.meta) : num(d.meta)}</td><td>${fmtDate(d.inicio)} a ${fmtDate(d.fim)}</td><td class="r">${ativos().filter(m => desafioProgresso(m.id, d).ok).length}</td><td class="acts"><button class="btn xs" data-act="editar-desafio" data-id="${d.id}">Editar</button><button class="btn xs danger" data-act="excluir-desafio" data-id="${d.id}">Excluir</button></td></tr>`).join('')}</tbody></table></section>` : empty('Nenhum desafio criado', 'Crie desafios semanais para engajar a equipe: prospecções, reuniões, vendas ou VGV.'));
};
export const desafioForm = (d = {}) => {
  const t = today(); const dow = new Date(t + 'T12:00:00Z').getUTCDay(); const seg = addDays(t, -((dow + 6) % 7));
  return `<form data-form="desafio" data-id="${d.id || ''}" class="form-grid">
  ${field('Título *', inp('titulo', d.titulo, 'required placeholder="Ex.: Semana das 150 prospecções"'), 'span2')}
  ${field('Indicador', sel('indicador', Object.entries(INDICADORES), d.indicador || 'prospeccoes'))}
  ${field('Meta por consultor *', inp('meta', d.meta, 'required inputmode="decimal"'))}
  ${field('Início', inp('inicio', d.inicio || seg, 'type="date" required'))}
  ${field('Fim', inp('fim', d.fim || addDays(seg, 6), 'type="date" required'))}
  ${field('Prêmio ou reconhecimento (opcional)', inp('premio', d.premio), 'span2')}
  <label class="check span2"><input type="checkbox" name="anunciar" id="f-anunciar" ${d.id ? '' : 'checked'}> <span>Avisar todos por notificação</span></label>
  <div class="span2 row-a"><button class="btn accent">Salvar desafio</button></div></form>`;
};

// ---------- Comissões
const meses = (n = 6) => { const out = []; let [y, m] = today().split('-').map(Number); for (let i = 0; i < n; i++) { out.push(`${y}-${String(m).padStart(2, '0')}`); m--; if (!m) { m = 12; y--; } } return out; };
export const comissoes = () => {
  const mk = S.sub.comMes || monthKey(today()); const semRegras = !regrasComissao().length;
  const mesSel = `<select data-filter="comMes" aria-label="Mês">${meses(12).map(m => opt(m, monthLabel(m), mk)).join('')}</select>`;
  if (semRegras) return `<div class="filters">${mesSel}</div>` + empty('Regras de comissão ainda não definidas', isAdmin() ? 'Cadastre os percentuais em Administração → Comissões. O cálculo passa a valer para todas as vendas validadas.' : 'A administração ainda não cadastrou as regras de comissão.');
  const minhas = comissoesDoMes([S.uid], mk); const tot = minhas.reduce((s, v) => s + v.com.valor, 0); const pg = pagamento(S.uid, mk);
  let html = `<div class="filters">${mesSel}</div><div class="kpis">${kpi('Comissão do mês', brl(tot), monthLabel(mk), '', true)}${kpi('Vendas validadas no mês', num(minhas.length))}${kpi('VGV validado no mês', brlShort(minhas.reduce((s, v) => s + Number(v.valor || 0), 0)))}${kpi('Status', pg ? 'Pago' : 'A pagar', pg ? 'em ' + fmtDate(pg.pagoEm) : 'Previsão conforme política da Primoris')}</div>`
    + `<section class="card tablewrap"><header class="card-h"><h3>Extrato de ${monthLabel(mk)}</h3><button class="btn xs" data-act="exportar-comissoes" data-id="${mk}">${ic('download', 14)} Exportar</button></header>${minhas.length ? `<table class="tbl"><thead><tr><th>Validada em</th><th>Cliente</th><th>Produto</th><th>Administradora</th><th class="r">Carta</th><th class="r">%</th><th class="r">Comissão</th></tr></thead><tbody>${minhas.map(v => `<tr><td>${fmtDate(S.validacoes[v.id]?.at)}</td><td>${esc(S.contatos[v.contatoId]?.nome || v.clienteNome || '')}</td><td>${esc(v.produto)}</td><td>${esc(v.administradora || '')}</td><td class="r">${brl(v.valor)}</td><td class="r">${v.com.pct.toLocaleString('pt-BR')}%</td><td class="r"><strong>${brl(v.com.valor)}</strong></td></tr>`).join('')}</tbody></table>` : '<p class="muted">Nenhuma venda validada neste mês.</p>'}</section>`;
  if (isAdmin()) {
    const linhas = ativos().map(m => { const l = comissoesDoMes([m.id], mk); return { m, n: l.length, vgv: l.reduce((s, v) => s + Number(v.valor || 0), 0), com: l.reduce((s, v) => s + v.com.valor, 0), pg: pagamento(m.id, mk) }; }).filter(x => x.n);
    html += `<section class="card tablewrap"><header class="card-h"><h3>Comissões da operação · ${monthLabel(mk)}</h3><span class="muted small">Total ${brl(linhas.reduce((s, x) => s + x.com, 0))}</span></header>${linhas.length ? `<table class="tbl"><thead><tr><th>Consultor</th><th class="r">Vendas</th><th class="r">VGV</th><th class="r">Comissão</th><th>Status</th><th></th></tr></thead><tbody>${linhas.map(x => `<tr><td>${esc(x.m.nome)}</td><td class="r">${x.n}</td><td class="r">${brlShort(x.vgv)}</td><td class="r"><strong>${brl(x.com)}</strong></td><td>${x.pg ? chip('Pago ' + fmtDate(x.pg.pagoEm), 'ok') : chip('A pagar', 'warn')}</td><td class="acts">${x.pg ? `<button class="btn xs" data-act="desfazer-pagamento" data-id="${x.m.id}_${mk}">Desfazer</button>` : `<button class="btn xs accent" data-act="marcar-pago" data-id="${x.m.id}_${mk}" data-valor="${x.com}">Marcar como pago</button>`}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">Nenhuma comissão neste mês.</p>'}</section>`;
  }
  return html;
};
export const comissoesAdmin = () => {
  const regras = regrasComissao(); const g = geral();
  const row = (r = {}) => `<div class="rowed" data-row="regra"><select name="r_produto" aria-label="Produto">${['*', ...g.produtos].map(p => opt(p, p === '*' ? 'Qualquer produto' : p, r.produto || '*')).join('')}</select><input name="r_adm" placeholder="Administradora (vazio = qualquer)" value="${esc(r.administradora && r.administradora !== '*' ? r.administradora : '')}" aria-label="Administradora"><select name="r_nivel" aria-label="Nível">${[['*', 'Qualquer nível'], ...niveisCfg().map((n, i) => [String(i), n.nome])].map(([v, l]) => opt(v, l, r.nivel ?? '*')).join('')}</select><input name="r_pct" type="number" step="0.01" min="0" placeholder="%" value="${esc(r.percentual ?? '')}" aria-label="Percentual"><button type="button" class="iconbtn" data-rm aria-label="Remover">${ic('x', 16)}</button></div>`;
  return `<form class="card" data-form="comissoes"><header class="card-h"><h3>Regras de comissão</h3></header>
    <p class="muted small">Cada venda validada usa a regra mais específica que combinar (produto, administradora e nível). Informe o percentual sobre o valor da carta de crédito. As regras valem para o cálculo exibido aos consultores.</p>
    <div class="rowed head small muted"><span>Produto</span><span>Administradora</span><span>Nível</span><span>% da carta</span><span></span></div>
    <div id="rows-regra">${(regras.length ? regras : [{}]).map(row).join('')}</div><button type="button" class="btn xs" data-add="regra">+ Regra</button><template id="tpl-regra">${row()}</template>
    ${field('Observação exibida no extrato (opcional)', inp('obs', S.config.comissoes?.obs || '', 'placeholder="Ex.: pagamento até o dia 10 do mês seguinte"'))}
    <div class="row-a"><button class="btn accent">Salvar regras</button></div></form>`;
};

// ---------- Diagnóstico do funil
export const diagnosticoView = () => {
  const r = periodo(); const d = diagnostico(r);
  const pc = x => Math.round(x * 100) + '%';
  return `<div class="card tablewrap"><table class="tbl"><thead><tr><th>Equipe</th><th class="r">Consultores</th><th class="r">Prospecções</th><th class="r">Prospecção → reunião</th><th class="r">Comparecimento</th><th class="r">Reunião → venda</th><th class="r">Vendas</th></tr></thead><tbody>${d.map(x => `<tr class="${x.e.id === '*' ? 'tot' : ''}"><td><strong>${esc(x.e.nome)}</strong></td><td class="r">${x.ids.length}</td><td class="r">${num(x.t.prosp)}</td><td class="r">${pc(x.t.pr)}</td><td class="r">${pc(x.t.rr)}</td><td class="r">${pc(x.t.rv)}</td><td class="r">${num(x.t.vend)}</td></tr>`).join('')}</tbody></table></div>`
    + `<div class="grid2">${d.filter(x => x.e.id !== '*').map(x => card(esc(x.e.nome), x.alertas.length ? `<ul class="alertas">${x.alertas.map(a => `<li><span class="chip bad">${esc(a.etapa)}</span><div><p>${esc(a.txt)}</p>${a.curso ? `<p class="small">Treinamento sugerido: <button class="linkbtn" data-act="atribuir-curso" data-id="${x.e.id}:${a.curso.id}">${esc(a.curso.titulo)} · atribuir à equipe</button></p>` : ''}</div></li>`).join('')}</ul>` : '<p>' + chip('Funil saudável', 'ok') + ' <span class="muted small">nenhuma etapa abaixo de 70% da média da operação.</span></p>')).join('') || empty('Nenhuma equipe', 'Crie equipes para ver o diagnóstico.')}</div>`;
};

// ---------- Modelos de mensagem e objeções
export const MENSAGENS_PADRAO = { modelos: [], objecoes: [] };
export const mensagensCfg = () => S.config.mensagens || MENSAGENS_PADRAO;
export const preencher = (t, c) => String(t || '').replace(/\{nome\}/g, firstName(c?.nome) || '').replace(/\{consultor\}/g, firstName(nome(S.uid))).replace(/\{produto\}/g, (c?.produto || 'consórcio').toLowerCase());
export const modelosPara = c => mensagensCfg().modelos.filter(m => !m.etapas?.length || m.etapas.includes(c.etapa || 'novo'));
export const objecoesView = () => { const o = mensagensCfg().objecoes; return o.length ? `<div class="objecoes">${o.map((x, i) => `<details ${i === 0 ? 'open' : ''}><summary>${esc(x.objecao)}</summary><p>${esc(x.resposta).replace(/\n/g, '<br>')}</p><button class="btn xs" data-act="copiar" data-txt="${esc(x.resposta)}">Copiar resposta</button></details>`).join('')}</div>` : empty('Nenhuma objeção cadastrada', 'O administrador cadastra as respostas em Administração → Mensagens.'); };
export const mensagensAdmin = () => {
  const m = mensagensCfg();
  return `<form class="card" data-form="mensagens"><p class="muted small">Use {nome} para o primeiro nome do cliente, {consultor} para o seu e {produto} para o produto de interesse.</p>
    <h4>Modelos de mensagem (WhatsApp)</h4><p class="muted small">Um por bloco, no formato: <code>Título | etapas separadas por vírgula (ou vazio para todas) | texto</code>. Etapas: ${ETAPAS.map(e => `<code>${e.id}</code>`).join(' ')}</p>
    ${txt('modelos', m.modelos.map(x => [x.titulo, (x.etapas || []).join(','), x.texto].join(' | ')).join('\n\n'), 'rows="10" class="mono-area"')}
    <h4>Objeções e respostas</h4><p class="muted small">Um por bloco, no formato: <code>Objeção | resposta</code></p>
    ${txt('objecoes', m.objecoes.map(x => [x.objecao, x.resposta].join(' | ')).join('\n\n'), 'rows="10" class="mono-area"')}
    <div class="row-a"><button class="btn accent">Salvar mensagens</button></div></form>`;
};

// ---------- Backup
export const backupAdmin = () => {
  const cols = ['members', 'equipes', 'contatos', 'atividades', 'reunioes', 'vendas', 'validacoes', 'tarefas', 'progresso', 'progressoes', 'feedbacks', 'cursos', 'pagamentos'];
  return `<section class="card"><header class="card-h"><h3>Backup completo</h3></header><p>Baixa uma cópia de todos os dados que você vê como administrador, em um arquivo JSON (para restaurar) e planilhas CSV (para abrir no Excel ou Google Planilhas).</p>
    <ul class="lst">${cols.map(c => `<li><span>${esc(c)}</span><span class="muted">${num(Object.keys(c === 'cursos' ? S.cursos : S[c] || {}).length)} registros</span></li>`).join('')}</ul>
    <div class="row-a"><button class="btn accent" data-act="backup-json">${ic('download', 16)} Baixar backup (JSON)</button><button class="btn" data-act="backup-csv" data-id="contatos">Contatos (CSV)</button><button class="btn" data-act="backup-csv" data-id="vendas">Vendas (CSV)</button><button class="btn" data-act="backup-csv" data-id="members">Usuários (CSV)</button></div>
    <p class="muted small">Recomendação: faça um backup por semana e guarde no Google Drive da Primoris.</p></section>`;
};
