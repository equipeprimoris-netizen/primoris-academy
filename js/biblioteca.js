// Primoris Academy — Biblioteca Primoris: Downloader do Instagram, Extrator de Empresas e Editor de Imagem com IA.
import { S, esc, findDuplicate, normPhone, fmtPhone, fmtDate, list, firstName, nome, ETAPAS } from './core.js?v=23';
import { ic, pageHead } from './views.js?v=23';
import * as P from './platform.js?v=23';

const FN = name => `https://wgwhgcnbkwwrzaovsmij.supabase.co/functions/v1/${name}`;
const EXTENSAO = 'downloads/primoris-extrator.zip?v=1';

// Ícones extras da Biblioteca (mesmo traço dos ícones do sistema)
const I = {
  insta: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>',
  mapa: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  magia: '<path d="m4 20 10-10"/><path d="m14 10 2-2"/><path d="M17 3v3M15.5 4.5h3M20 8v2M19 9h2M11 3v2M10 4h2"/>',
  imagem: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  selfie: '<circle cx="12" cy="9" r="4"/><path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5"/>',
};
const bi = (n, s = 18) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || ''}</svg>`;

const FERRAMENTAS = [
  { id: 'instagram', nome: 'Downloader do Instagram', tag: 'Instagram', icone: bi('insta', 24), texto: 'Cole o link de um reel, post ou vídeo e baixe em alta qualidade, sem marca d\'água.' },
  { id: 'extrator', nome: 'Extrator de Empresas', tag: 'Prospecção', icone: bi('mapa', 24), texto: 'Pesquise empresas por nicho e cidade aqui mesmo: telefone, celular, site e e-mail, prontos para copiar ou chamar no WhatsApp.' },
  { id: 'editor', nome: 'Editor de Imagem com IA', tag: 'Inteligência Artificial', icone: bi('magia', 24), texto: 'Envie uma imagem de referência e sua foto: a IA recria a cena com você no lugar.' },
];

// Estado local (fica guardado enquanto o app estiver aberto)
const ig = { url: '', loading: false, erro: '', items: [], caption: '', sc: '' };
const ex = { busca: '', cidade: '', loading: false, erro: '', lista: [], proxima: null, soCel: false, feita: '', emails: {} };
const ed = { ref: null, eu: null, instr: '', loading: false, erro: '', resultado: null };

let rerender = () => {};
let avisar = () => {};
let novoContato = () => {};
let prospectar = async () => {};
export function ligar(fnRender, fnToast, fnContato, fnProspectar) { rerender = fnRender; avisar = fnToast; if (fnContato) novoContato = fnContato; if (fnProspectar) prospectar = fnProspectar; }

// ---------- Telas
const voltar = () => `<button class="linkbtn" data-bib="tab" data-id="inicio">${ic('back', 16)} Voltar para a Biblioteca</button>`;

const inicio = () => `<div class="bib-grid">${FERRAMENTAS.map(f => `<button class="jt card bib-tool" data-bib="tab" data-id="${f.id}"><span class="jt-ic">${f.icone}</span><span class="jt-t">${esc(f.tag)}</span><strong>${esc(f.nome)}</strong><small class="muted">${esc(f.texto)}</small><span class="jt-go">Abrir ${ic('arrow', 14)}</span></button>`).join('')}</div>`;

const cabecalho = f => `<div class="bib-head"><span class="jt-ic">${f.icone}</span><div><h3>${esc(f.nome)}</h3><p class="muted small">${esc(f.texto)}</p></div></div>`;

const instagram = () => {
  const n = ig.items.length;
  return voltar() + `<section class="card bib-panel">${cabecalho(FERRAMENTAS[0])}
    <form class="bib-row" data-bib-form="instagram">
      <input data-bib-input="igUrl" value="${esc(ig.url)}" placeholder="Cole aqui o link do Instagram (ex.: https://www.instagram.com/reel/...)" autocomplete="off" aria-label="Link do Instagram">
      <button class="btn accent" ${ig.loading ? 'disabled' : ''}>${ig.loading ? '<span class="bib-spin"></span> Buscando…' : `${ic('download', 16)} Baixar`}</button>
    </form>
    ${ig.erro ? `<p class="bib-msg bad">${esc(ig.erro)}</p>` : n ? `<p class="bib-msg ok">${n === 1 ? 'Pronto! Clique em baixar.' : `Pronto! ${n} arquivos encontrados.`}</p>` : ''}
    ${n ? `<div class="bib-midias">${ig.items.map((it, i) => { const capa = it.thumbDl || ''; return `<div class="bib-midia"><div class="bib-thumb">${it.type === 'video' ? `<video src="${esc(it.dl)}" ${capa ? `poster="${esc(capa)}"` : ''} controls playsinline preload="none"></video>` : `<img src="${esc(it.dl)}" alt="" loading="lazy">`}<span class="bib-badge">${it.type === 'video' ? 'Vídeo' : 'Foto'}${n > 1 ? ' ' + (i + 1) : ''}</span></div><a class="btn accent block" href="${esc(it.dl)}">${ic('download', 16)} Baixar ${it.type === 'video' ? 'vídeo (MP4)' : 'foto (JPG)'}</a></div>`; }).join('')}</div>` : ''}
    ${ig.caption ? `<div class="bib-legenda"><span class="muted small">Legenda do post</span><p>${esc(ig.caption).replace(/\n/g, '<br>')}</p></div>` : ''}
  </section><p class="muted small">Funciona com posts públicos. Stories, destaques e contas privadas não são suportados. Baixe só conteúdo seu ou que você tem autorização para usar.</p>`;
};

const MSG_PADRAO = 'Olá! Tudo bem? Aqui é {consultor}, da Primoris. Encontrei a {empresa} e gostaria de apresentar uma oportunidade rápida. Posso te enviar mais detalhes?';
const chaveMsg = () => 'primoris-msg-' + (S.uid || '');
const lerMsg = () => { try { return localStorage.getItem(chaveMsg()) || MSG_PADRAO; } catch { return MSG_PADRAO; } };
const montarMsg = e => lerMsg().replace(/\{empresa\}/g, e.nome).replace(/\{consultor\}/g, firstName(nome(S.uid)) || 'seu consultor');
const jaProspectado = e => { const c = e.whats ? findDuplicate(e.whats) : null; return c && c.ownerId === S.uid ? c : null; };
const prospectadosExtrator = () => list(S.contatos).filter(c => c.ownerId === S.uid && c.fonte === 'extrator' && !c.deletedAt).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
const etapaNome = id => (ETAPAS.find(x => x.id === id) || {}).nome || 'Novo contato';
const fone = t => ({ celular: '<span class="chip ok">Celular</span>', fixo: '<span class="chip">Fixo</span>' }[t] || '');
const extrator = () => {
  const l = ex.soCel ? ex.lista.filter(e => e.tipo === 'celular') : ex.lista; const cel = ex.lista.filter(e => e.tipo === 'celular').length;
  return voltar() + `<section class="card bib-panel">${cabecalho(FERRAMENTAS[1])}
  <form class="bib-ex-form" data-bib-form="extrator">
    <label class="field"><span>O que você procura</span><input data-bib-input="exBusca" value="${esc(ex.busca)}" placeholder="Ex.: dentista, academia, imobiliária, contabilidade" required></label>
    <label class="field"><span>Cidade / bairro</span><input data-bib-input="exCidade" value="${esc(ex.cidade)}" placeholder="Ex.: Curitiba, Moema São Paulo"></label>
    <button class="btn accent" ${ex.loading ? 'disabled' : ''}>${ex.loading ? '<span class="bib-spin"></span> Buscando…' : `${bi('mapa', 16)} Buscar empresas`}</button>
  </form>
  ${ex.loading ? '<p class="muted small bib-espera"><span class="bib-spin"></span> Procurando no mapa gratuito… <b id="ex-seg">0s</b>. Em capitais pode levar até 40 segundos; para ir mais rápido, informe o <strong>bairro</strong> (ex.: <em>Copacabana, Rio de Janeiro</em>). Buscas já feitas pela equipe aparecem na hora.</p>' : ''}
  <details class="bib-msgbox"><summary>${ic('msg', 15)} Mensagem do WhatsApp <span class="muted small">(clique para editar)</span></summary>
    <textarea data-bib-input="exMsg" rows="3" maxlength="600">${esc(lerMsg())}</textarea>
    <p class="muted small">Use <code>{empresa}</code> para o nome da empresa e <code>{consultor}</code> para o seu nome. Fica salva só para você.</p>
    <p class="small bib-prev"><span class="muted">Prévia:</span> ${esc(montarMsg({ nome: 'Clínica Exemplo' }))}</p></details>
  ${ex.erro ? `<p class="bib-msg bad">${esc(ex.erro)}</p>` : ''}
  ${ex.lista.length ? `<div class="bib-ex-bar"><strong>${ex.lista.length} empresa(s)</strong><span class="muted small">${esc(ex.feita)} · ${cel} com celular${ex.daEquipe ? ' · resultado já buscado pela equipe' : ''}</span>
    <label class="bib-chk"><input type="checkbox" data-bib-check="soCel" ${ex.soCel ? 'checked' : ''}> Só celulares</label>
    <span class="grow"></span>
    <button class="btn sm accent" data-bib="copiar-cel" ${cel ? '' : 'disabled'}>${ic('copy', 15)} Copiar todos os celulares</button>
    <button class="btn sm" data-bib="csv">${ic('download', 15)} Planilha (CSV)</button></div>
  <div class="tablewrap"><table class="tbl bib-ex-tbl"><thead><tr><th>Empresa</th><th>Telefone</th><th>Site / e-mail</th><th>Nota</th><th></th></tr></thead><tbody>
  ${l.map(e => { const i = ex.lista.indexOf(e); const em = ex.emails[e.id]; return `<tr><td><strong>${esc(e.nome)}</strong>${(() => { const c = jaProspectado(e); return c ? ` <span class="chip ok">✓ Prospectado ${fmtDate((c.createdAt || '').slice(0, 10))}</span>` : ''; })()}<small class="muted">${esc(e.categoria ? e.categoria + ' · ' : '')}${esc(e.endereco)}</small></td>
    <td>${e.telefone ? `<span class="bib-tel">${esc(e.telefone)}</span> ${fone(e.tipo)}` : '<span class="muted small">Sem telefone</span>'}</td>
    <td>${e.site ? `<a href="${esc(e.site)}" target="_blank" rel="noopener" class="small">${esc(e.site.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').slice(0, 34))}</a>` : '<span class="muted small">—</span>'}
      ${em === undefined ? (e.site ? `<br><button class="linkbtn small" data-bib="email" data-id="${i}">Buscar e-mail</button>` : '') : em === 'carregando' ? '<br><span class="muted small">Buscando e-mail…</span>' : em.length ? `<br><span class="small">${em.map(esc).join('<br>')}</span>` : '<br><span class="muted small">E-mail não encontrado</span>'}</td>
    <td>${e.nota ? `★ ${String(e.nota).replace('.', ',')} <small class="muted">(${e.avaliacoes})</small>` : '—'}</td>
    <td class="acts">${e.telefone ? `<button class="btn xs" data-bib="copiar" data-id="${i}" title="Copiar número">${ic('copy', 13)}</button>` : ''}${e.whats ? `<button class="btn xs wa" data-bib="wa" data-id="${i}" title="Abrir o WhatsApp com a mensagem pronta e registrar a prospecção">${ex.enviando === e.id ? '<span class="bib-spin"></span>' : ''} ${jaProspectado(e) ? 'Chamar de novo' : 'Chamar no WhatsApp'}</button>` : ''}${e.mapa ? `<a class="btn xs" href="${esc(e.mapa)}" target="_blank" rel="noopener" title="Ver no Google Maps">${bi('mapa', 13)}</a>` : ''}</td></tr>`; }).join('')}
  </tbody></table></div>
  <p class="muted small bib-c">Fonte: OpenStreetMap (mapa aberto e gratuito). Nem toda empresa tem telefone cadastrado lá: as com celular aparecem primeiro. Use o botão do mapa para conferir no Google Maps.</p>` : !ex.loading && !ex.erro ? `<div class="bib-ex-vazio">${bi('mapa', 34)}<p>Digite um nicho e uma cidade. As empresas aparecem aqui, com o telefone pronto para copiar.</p></div>` : ''}
</section>
${(() => { const l = prospectadosExtrator(); return l.length ? `<section class="card bib-panel"><div class="bib-ex-bar"><strong>${ic('phone', 16)} Suas prospecções pelo Extrator</strong><span class="muted small">${l.length} empresa(s) · elas já estão na sua Carteira e contam nas suas prospecções</span><span class="grow"></span><a class="btn sm" href="#carteira">Abrir Carteira</a></div>
  <div class="tablewrap"><table class="tbl"><thead><tr><th>Data</th><th>Empresa</th><th>WhatsApp</th><th>Etapa</th></tr></thead><tbody>${l.slice(0, 30).map(c => `<tr><td>${fmtDate((c.createdAt || '').slice(0, 10))}</td><td><strong>${esc(c.nome)}</strong>${c.cidade ? `<small class="muted">${esc(c.cidade)}</small>` : ''}</td><td><a href="https://wa.me/${esc(c.telNorm)}" target="_blank" rel="noopener">${esc(fmtPhone(c.telNorm))}</a></td><td><span class="chip">${esc(etapaNome(c.etapa))}</span></td></tr>`).join('')}</tbody></table></div></section>` : ''; })()}
<p class="muted small">Quer mais empresas e telefones? A extensão gratuita coleta direto do Google Maps, com rolagem automática: <a href="${EXTENSAO}" download="primoris-extrator.zip">Baixe a extensão do Chrome</a> (opcional). Use os contatos de forma responsável: mensagens em massa não solicitadas podem bloquear o seu WhatsApp.</p>`;
};

const caixa = (chave, n, titulo, texto, icone) => { const img = ed[chave]; return `<label class="bib-drop ${img ? 'has' : ''}" data-bib-drop="${chave}">
  <span class="bib-lbl">${n} · ${titulo}</span>
  ${img ? `<img src="${img.dataUrl}" alt=""><button type="button" class="bib-x" data-bib="limpar" data-id="${chave}" aria-label="Remover">${ic('x', 14)}</button>` : `<span class="bib-ph">${bi(icone, 34)}<strong>${titulo}</strong><span>${texto}</span><span class="muted small">Clique, arraste ou cole (Ctrl+V)</span></span>`}
  <input type="file" accept="image/*" data-bib-file="${chave}" hidden>
</label>`; };
const editor = () => voltar() + `<section class="card bib-panel">${cabecalho(FERRAMENTAS[2])}
  <div class="bib-duas">
    ${caixa('ref', 1, 'Referência', 'A cena, pose e estilo que você quer copiar.', 'imagem')}
    ${caixa('eu', 2, 'Sua foto', 'De preferência com o rosto bem visível e boa luz.', 'selfie')}
  </div>
  <label class="field"><span>Ajustes (opcional)</span><textarea data-bib-input="edInstr" rows="2" maxlength="800" placeholder="Ex.: manter meu cabelo cacheado, deixar o fundo mais claro, formato quadrado">${esc(ed.instr)}</textarea></label>
  <div class="bib-row"><button class="btn accent" data-bib="gerar" ${ed.loading ? 'disabled' : ''}>${ed.loading ? '<span class="bib-spin"></span> Gerando com IA…' : `${bi('magia', 16)} Deixar igual à referência`}</button><span class="muted small">${ed.loading ? 'Pode levar até 40 segundos. Não feche esta tela.' : 'Leva de 10 a 40 segundos.'}</span></div>
  ${ed.erro ? `<p class="bib-msg bad">${esc(ed.erro)}</p>` : ''}
  ${ed.resultado ? `<div class="bib-result"><img src="${ed.resultado.src}" alt="Resultado"><div class="bib-row bib-c"><a class="btn accent" href="${ed.resultado.src}" download="primoris-ia.${ed.resultado.ext}">${ic('download', 16)} Baixar imagem</a><button class="btn" data-bib="gerar" ${ed.loading ? 'disabled' : ''}>Gerar outra versão</button></div></div>` : ''}
</section><p class="muted small">Use fotos suas ou de pessoas que autorizaram. As imagens vão para a IA do Google (Gemini) só para gerar o resultado e não ficam salvas na Primoris.</p>`;

export const biblioteca = () => {
  const tab = ['instagram', 'extrator', 'editor'].includes(S.sub.bTab) ? S.sub.bTab : 'inicio';
  const corpo = { inicio, instagram, extrator, editor }[tab]();
  return pageHead(`<span class="bib-t">${ic('book', 30)}</span> Biblioteca Primoris`, 'O acervo exclusivo da Primoris: materiais, ferramentas e conteúdos para acelerar seus resultados.')
    + `<div class="hub-tabs" role="tablist">${[['inicio', 'Todas', 'book'], ...FERRAMENTAS.map(f => [f.id, f.nome])].map(([id, l, i]) => `<button role="tab" aria-selected="${tab === id}" class="${tab === id ? 'on' : ''}" data-bib="tab" data-id="${id}">${i ? ic(i, 17) : bi({ instagram: 'insta', extrator: 'mapa', editor: 'magia' }[id], 17)}<span>${esc(l)}</span></button>`).join('')}</div>`
    + `<div class="bib-body">${corpo}</div>`;
};

// ---------- Ações
async function chamar(fn, corpo) {
  const token = P.token(); if (!token) throw new Error('Sua sessão expirou. Entre de novo no sistema.');
  const r = await fetch(FN(fn), { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token, apikey: P.chavePublica }, body: JSON.stringify(corpo) });
  const d = await r.json().catch(() => ({ ok: false, error: 'Resposta inválida do servidor.' }));
  if (!d.ok) throw new Error(d.error || 'Não foi possível concluir.');
  return d;
}
// ---------- Busca gratuita no OpenStreetMap, feita direto do navegador (sem chave e sem custo)
const NICHOS = [
  [/dent|odont/, ['"amenity"="dentist"', '"healthcare"="dentist"']],
  [/academia|crossfit|muscula|fitness|pilates/, ['"leisure"="fitness_centre"', '"sport"="fitness"']],
  [/imobili|corretor de im/, ['"office"="estate_agent"', '"shop"="estate_agent"']],
  [/contab|contador/, ['"office"="accountant"']],
  [/advoga|advocacia|jur[ií]dic/, ['"office"="lawyer"']],
  [/restaurante|lanchonete|hamburg/, ['"amenity"="restaurant"', '"amenity"="fast_food"']],
  [/pizza/, ['"cuisine"~"pizza"']],
  [/padaria|confeitaria/, ['"shop"="bakery"', '"shop"="pastry"']],
  [/caf[eé]|cafeteria/, ['"amenity"="cafe"']],
  [/(^|\s)bar(\s|$)|choperia|(^|\s)pub(\s|$)/, ['"amenity"="bar"', '"amenity"="pub"']],
  [/farm[aá]c|drogaria/, ['"amenity"="pharmacy"', '"shop"="chemist"']],
  [/cl[ií]nica|consult[oó]rio/, ['"amenity"="clinic"', '"amenity"="doctors"', '"healthcare"="clinic"']],
  [/m[eé]dic/, ['"amenity"="doctors"', '"healthcare"="doctor"']],
  [/hospital/, ['"amenity"="hospital"']],
  [/psic[oó]l/, ['"healthcare"="psychotherapist"', '"healthcare:speciality"~"psych"']],
  [/fisio/, ['"healthcare"="physiotherapist"']],
  [/veterin/, ['"amenity"="veterinary"']],
  [/pet ?shop|petshop|banho e tosa/, ['"shop"="pet"', '"shop"="pet_grooming"']],
  [/sal[aã]o|cabeleire|barbear|est[eé]tica|beleza|manicure/, ['"shop"="hairdresser"', '"shop"="beauty"']],
  [/[oó]tica/, ['"shop"="optician"']],
  [/mercado|supermercado|mercearia|hortifruti/, ['"shop"="supermarket"', '"shop"="convenience"', '"shop"="greengrocer"']],
  [/oficina|mec[aâ]nic|auto ?pe[cç]as|funilaria/, ['"shop"="car_repair"', '"shop"="car_parts"']],
  [/concession[aá]ria|revenda de (carro|ve[ií]culo)|seminovos/, ['"shop"="car"']],
  [/moto/, ['"shop"="motorcycle"']],
  [/auto ?escola|autoescola/, ['"amenity"="driving_school"']],
  [/hotel|pousada|hostel/, ['"tourism"="hotel"', '"tourism"="guest_house"', '"tourism"="hostel"']],
  [/escola|col[eé]gio|curso|idioma/, ['"amenity"="school"', '"amenity"="language_school"', '"amenity"="college"']],
  [/roupa|moda|boutique|confec/, ['"shop"="clothes"', '"shop"="boutique"']],
  [/cal[cç]ado|sapat/, ['"shop"="shoes"']],
  [/m[oó]veis|decora|colch/, ['"shop"="furniture"', '"shop"="interior_decoration"', '"shop"="bed"']],
  [/constru|material de constr|home center/, ['"shop"="hardware"', '"shop"="doityourself"', '"office"="construction_company"', '"craft"="builder"']],
  [/arquitet/, ['"office"="architect"']],
  [/engenhar/, ['"office"="engineer"']],
  [/seguro/, ['"office"="insurance"']],
  [/banco|financeira|cr[eé]dito|cons[oó]rcio/, ['"amenity"="bank"', '"office"="financial"', '"office"="financial_advisor"']],
  [/ag[eê]ncia de viage|turismo/, ['"shop"="travel_agency"']],
  [/joalheria|rel[oó]gio/, ['"shop"="jewelry"', '"shop"="watches"']],
  [/eletr[oô]nic|celular|inform[aá]tica/, ['"shop"="electronics"', '"shop"="mobile_phone"', '"shop"="computer"']],
  [/posto|combust/, ['"amenity"="fuel"']],
  [/lavanderia/, ['"shop"="laundry"', '"shop"="dry_cleaning"']],
  [/florica|flores/, ['"shop"="florist"']],
  [/gr[aá]fica/, ['"shop"="copyshop"', '"craft"="printer"']],
  [/marketing|publicidade|ag[eê]ncia/, ['"office"="advertising_agency"', '"office"="marketing"']],
  [/empresa|com[eé]rcio|loja/, ['"shop"', '"office"']],
];
const tirarAcento = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
function tipoTelefone(tel) {
  let d = String(tel).replace(/\D/g, '');
  if (d.startsWith('55') && d.length >= 12) d = d.slice(2);
  if (d.startsWith('0')) d = d.slice(1);
  if (d.length === 11 && d[2] === '9') return { tipo: 'celular', whats: '55' + d, bonito: `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` };
  if (d.length === 10) return { tipo: 'fixo', whats: '55' + d, bonito: `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` };
  return { tipo: d.length >= 8 ? 'outro' : '', whats: d.length >= 10 ? '55' + d : '', bonito: tel };
}
async function comTempo(url, opt = {}, ms = 40000) {
  const c = new AbortController(); const t = setTimeout(() => c.abort(), ms);
  try { return await fetch(url, { ...opt, signal: c.signal }); } finally { clearTimeout(t); }
}
async function cidadeOSM(cidade) {
  const r = await comTempo('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=br&accept-language=pt-BR&q=' + encodeURIComponent(cidade), {}, 15000);
  if (!r.ok) throw new Error('O mapa gratuito não respondeu. Tente de novo em instantes.');
  const l = await r.json(); const rel = l.find(x => x.osm_type === 'relation') || l[0]; if (!rel) return null;
  const bb = (rel.boundingbox || []).map(Number);
  return { nome: rel.display_name, area: rel.osm_type === 'relation' ? 3600000000 + Number(rel.osm_id) : null, bbox: bb.length === 4 ? `${bb[0]},${bb[2]},${bb[1]},${bb[3]}` : null };
}
// Pergunta aos 3 servidores do mapa ao mesmo tempo e fica com o primeiro que responder
async function overpass(q) {
  const ctrls = []; const hosts = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
  try {
    return await Promise.any(hosts.map(async host => {
      const c = new AbortController(); ctrls.push(c); const t = setTimeout(() => c.abort(), 40000);
      try { const r = await fetch(host, { method: 'POST', body: 'data=' + encodeURIComponent(q), signal: c.signal }); if (!r.ok) throw new Error('ocupado'); return await r.json(); } finally { clearTimeout(t); }
    }));
  } catch { throw new Error('O mapa gratuito está ocupado agora. Tente de novo em 1 minuto.'); }
  finally { ctrls.forEach(c => c.abort()); }
}
const CACHE = 'primoris-extrator-cache';
const doCache = k => { try { const c = JSON.parse(sessionStorage.getItem(CACHE) || '{}')[k]; return c && Date.now() - c.t < 3600e3 ? c.d : null; } catch { return null; } };
const proCache = (k, d) => { try { const c = JSON.parse(sessionStorage.getItem(CACHE) || '{}'); c[k] = { t: Date.now(), d }; const ks = Object.keys(c); if (ks.length > 12) delete c[ks[0]]; sessionStorage.setItem(CACHE, JSON.stringify(c)); } catch { /* sem espaço */ } };
async function buscarOSM(busca, cidade) {
  if (!cidade.trim()) throw new Error('Informe a cidade (ex.: Curitiba ou Moema, São Paulo).');
  const chave = tirarAcento((busca + '|' + cidade).toLowerCase().trim()); const salvo = doCache(chave); if (salvo) return salvo;
  // Cache da equipe: se alguém já fez essa busca nos últimos 7 dias, o resultado aparece na hora
  const idCache = chave.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120);
  try { const sn = await S.db.doc('cachemp/' + idCache).get(); const d = sn.exists ? sn.data() : null; if (d && Date.now() - new Date(d.at).getTime() < 7 * 864e5 && d.empresas?.length) { const r = { empresas: d.empresas, local: d.local, daEquipe: true }; proCache(chave, r); return r; } } catch { /* segue para o mapa */ }
  const c = await cidadeOSM(cidade); if (!c) throw new Error('Não encontrei essa cidade. Escreva o nome completo (ex.: Curitiba, PR).');
  // Buscar dentro do retângulo da cidade é bem mais rápido do que pelo contorno exato
  const alvo = '';
  const termo = tirarAcento(busca.toLowerCase());
  const filtros = NICHOS.filter(([re]) => re.test(termo)).flatMap(([, f]) => f);
  const palavra = busca.replace(/[^\p{L}\p{N} ]/gu, '').trim().split(/\s+/).filter(w => w.length > 2).sort((a, b) => b.length - a.length)[0] || busca;
  // Com nicho conhecido, busca só pelas categorias (bem mais rápido); senão, procura pelo nome
  const partes = filtros.length ? filtros.map(f => `nwr[${f}]["name"]${alvo};`) : [`nwr["name"~"${palavra.replace(/"/g, '')}",i]["name"]${alvo};`];
  if (!c.bbox) throw new Error('Não consegui delimitar essa cidade. Tente escrever o nome completo (ex.: Curitiba, PR).');
  const d = await overpass(`[out:json][timeout:35][bbox:${c.bbox}];(${partes.join('')});out center tags qt 400;`);
  const vistos = new Set();
  const l = (d.elements || []).map(e => {
    const t = e.tags || {};
    const tel = String(t.phone || t['contact:phone'] || t['contact:mobile'] || t.mobile || t['contact:whatsapp'] || '').split(/[;,/]/)[0].trim();
    const tp = tel ? tipoTelefone(tel) : { tipo: '', whats: '', bonito: '' };
    const end = [t['addr:street'] && `${t['addr:street']}${t['addr:housenumber'] ? ', ' + t['addr:housenumber'] : ''}`, t['addr:suburb'], t['addr:city']].filter(Boolean).join(' - ');
    const lat = e.lat ?? e.center?.lat, lon = e.lon ?? e.center?.lon;
    return { id: `${e.type}/${e.id}`, nome: t.name, categoria: '', endereco: end, telefone: tp.bonito, tipo: tp.tipo, whats: tp.whats, site: t.website || t['contact:website'] || '', email: t.email || t['contact:email'] || '', nota: null, avaliacoes: 0, mapa: lat ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.name + ' ' + (t['addr:city'] || cidade))}` : '' };
  }).filter(e => { const k = (e.nome || '').toLowerCase() + e.telefone; if (!e.nome || vistos.has(k)) return false; vistos.add(k); return true; });
  l.sort((a, b) => (b.tipo === 'celular' ? 2 : b.telefone ? 1 : 0) - (a.tipo === 'celular' ? 2 : a.telefone ? 1 : 0));
  const res = { empresas: l.slice(0, 300), local: c.nome }; proCache(chave, res);
  if (res.empresas.length) S.db.doc('cachemp/' + idCache).set({ empresas: res.empresas, local: c.nome, busca, cidade, at: new Date().toISOString(), by: S.uid }).catch(() => {});
  return res;
}
async function buscarEmpresas() {
  if (ex.loading) return;
  if (ex.busca.trim().length < 2) { ex.erro = 'Diga o que você procura (ex.: dentista, academia).'; return rerender(); }
  Object.assign(ex, { loading: true, erro: '', lista: [], proxima: null, emails: {}, t0: Date.now() }); rerender();
  const relogio = setInterval(() => { const el = document.getElementById('ex-seg'); if (el) el.textContent = Math.round((Date.now() - ex.t0) / 1000) + 's'; }, 1000);
  try {
    const d = await buscarOSM(ex.busca.trim(), ex.cidade.trim());
    ex.daEquipe = !!d.daEquipe;
    ex.lista = d.empresas; d.empresas.forEach(e => { if (e.email) ex.emails[e.id] = [e.email]; });
    ex.feita = [ex.busca, (d.local || ex.cidade).split(',')[0]].filter(Boolean).join(' · ');
    if (!ex.lista.length) ex.erro = 'Nenhuma empresa encontrada no mapa gratuito. Tente um termo mais comum (ex.: "clínica", "loja") ou outra cidade.';
  } catch (e) { ex.erro = e.name === 'AbortError' ? 'A busca demorou demais. Tente de novo ou use uma cidade/bairro menor.' : e.message === 'Failed to fetch' ? 'Sem conexão com o mapa. Verifique sua internet.' : e.message; }
  finally { clearInterval(relogio); ex.loading = false; rerender(); }
}
async function buscarEmail(i) {
  const e = ex.lista[i]; if (!e?.site) return;
  ex.emails[e.id] = 'carregando'; rerender();
  try { ex.emails[e.id] = (await chamar('primoris-empresas', { acao: 'email', site: e.site })).emails; } catch { ex.emails[e.id] = []; }
  rerender();
}
async function copiar(texto, msg) {
  try { await navigator.clipboard.writeText(texto); } catch { const t = document.createElement('textarea'); t.value = texto; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
  avisar(msg, 'ok');
}
function baixarCsv() {
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const linhas = [['Empresa', 'Categoria', 'Telefone', 'Tipo', 'WhatsApp', 'Site', 'E-mail', 'Endereço', 'Nota', 'Avaliações', 'Google Maps']]
    .concat(ex.lista.map(e => [e.nome, e.categoria, e.telefone, e.tipo, e.whats ? 'https://wa.me/' + e.whats : '', e.site, Array.isArray(ex.emails[e.id]) ? ex.emails[e.id].join(' ') : '', e.endereco, e.nota ?? '', e.avaliacoes, e.mapa]));
  const blob = new Blob(['\ufeff' + linhas.map(l => l.map(q).join(';')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `empresas-${(ex.feita || 'busca').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

async function baixarInstagram() {
  const url = ig.url.trim();
  if (!/instagram\.com\//i.test(url)) { ig.erro = 'Cole um link do Instagram (post, reel ou vídeo).'; ig.items = []; return rerender(); }
  Object.assign(ig, { loading: true, erro: '', items: [], caption: '' }); rerender();
  try {
    const token = P.token(); if (!token) throw new Error('Sua sessão expirou. Entre de novo para usar o downloader.');
    const r = await fetch(FN('primoris-instagram'), { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token, apikey: P.chavePublica }, body: JSON.stringify({ url }) });
    const d = await r.json().catch(() => ({ ok: false, error: 'Resposta inválida do servidor.' }));
    if (!d.ok) throw new Error(d.error || 'Não foi possível baixar.');
    Object.assign(ig, { items: d.items, caption: (d.caption || '').replace(/\\+n/g, '\n').replace(/\\+/g, ''), sc: d.shortcode });
  } catch (e) {
    ig.erro = e.message === 'Failed to fetch' ? 'Sem conexão com o servidor. Verifique sua internet.' : e.message;
  } finally { ig.loading = false; rerender(); }
}

function lerImagem(file, lado = 1536) {
  return new Promise((ok, falha) => {
    const u = URL.createObjectURL(file); const im = new Image();
    im.onload = () => {
      const s = Math.min(1, lado / Math.max(im.width, im.height)); const c = document.createElement('canvas');
      c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      const dataUrl = c.toDataURL('image/jpeg', 0.9); URL.revokeObjectURL(u);
      ok({ dataUrl, data: dataUrl.split(',')[1], mime: 'image/jpeg' });
    };
    im.onerror = () => { URL.revokeObjectURL(u); falha(new Error('Não consegui abrir essa imagem. Use JPG, PNG ou WEBP.')); };
    im.src = u;
  });
}
async function definirImagem(chave, file) {
  if (!file || !file.type.startsWith('image/')) return;
  try { ed[chave] = await lerImagem(file); ed.erro = ''; } catch (e) { ed.erro = e.message; }
  rerender();
}

async function gerar() {
  if (ed.loading) return;
  if (!ed.ref) { ed.erro = 'Envie a imagem de referência (1).'; return rerender(); }
  if (!ed.eu) { ed.erro = 'Envie a sua foto (2).'; return rerender(); }
  Object.assign(ed, { loading: true, erro: '' }); rerender();
  try {
    const token = P.token();
    if (!token) throw new Error('Sua sessão expirou. Entre de novo para usar o editor.');
    const r = await fetch(FN('primoris-imagem'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token, apikey: P.chavePublica },
      body: JSON.stringify({ reference: { data: ed.ref.data, mime: ed.ref.mime }, photo: { data: ed.eu.data, mime: ed.eu.mime }, instructions: ed.instr }),
    });
    const d = await r.json().catch(() => ({ ok: false, error: 'Resposta inválida do servidor.' }));
    if (!d.ok) throw new Error(d.error || d.message || 'Falha ao gerar a imagem.');
    ed.resultado = { src: `data:${d.image.mime};base64,${d.image.data}`, ext: d.image.mime.includes('jpeg') ? 'jpg' : 'png' };
    avisar('Imagem pronta!', 'ok');
  } catch (e) {
    ed.erro = e.message === 'Failed to fetch' ? 'Sem conexão com o servidor. Verifique sua internet.' : e.message;
  } finally { ed.loading = false; rerender(); }
}

// ---------- Eventos (só dentro da Biblioteca)
const naBiblioteca = () => S.view === 'biblioteca';
document.addEventListener('click', e => {
  if (!naBiblioteca()) return;
  const el = e.target.closest('[data-bib]'); if (!el) return;
  e.preventDefault();
  const id = el.dataset.id;
  if (el.dataset.bib === 'tab') { S.sub.bTab = id; S.animNext = true; rerender(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  else if (el.dataset.bib === 'limpar') { ed[id] = null; rerender(); }
  else if (el.dataset.bib === 'gerar') gerar();
  else if (el.dataset.bib === 'email') buscarEmail(Number(id));
  else if (el.dataset.bib === 'copiar') { const e = ex.lista[Number(id)]; if (e) copiar(e.telefone, `Número copiado: ${e.telefone}`); }
  else if (el.dataset.bib === 'copiar-cel') { const l = ex.lista.filter(e => e.tipo === 'celular'); copiar(l.map(e => `${e.nome}\t${e.telefone}`).join('\n'), `${l.length} celulares copiados. Cole na planilha ou no bloco de notas.`); }
  else if (el.dataset.bib === 'csv') baixarCsv();
  else if (el.dataset.bib === 'wa') {
    const e = ex.lista[Number(id)]; if (!e?.whats || ex.enviando) return;
    const url = `https://wa.me/${e.whats}?text=${encodeURIComponent(montarMsg(e))}`;
    const jan = window.open('about:blank', '_blank'); // abre já no clique (o navegador bloqueia se abrir depois)
    ex.enviando = e.id; rerender();
    prospectar(e).then(r => {
      if (r && r.bloqueado) { jan?.close(); avisar(r.msg, 'warn'); }
      else { if (jan) { jan.opener = null; jan.location.href = url; } else location.href = url; avisar(r?.novo ? `Prospecção registrada: ${e.nome} entrou na sua Carteira.` : `Prospecção registrada para ${e.nome}.`, 'ok'); }
    }).catch(err => { jan?.close(); avisar(err.message || 'Não foi possível registrar.', 'warn'); }).finally(() => { ex.enviando = null; rerender(); });
  }
  else if (el.dataset.bib === 'carteira') { const e = ex.lista[Number(id)]; if (e) novoContato({ nome: e.nome, telefone: e.telefone, origem: 'Prospecção ativa', cidade: (e.endereco.match(/,\s*([^,]+?)\s*-\s*[A-Z]{2}/) || [])[1] || ex.cidade }); }
});
document.addEventListener('input', e => {
  const k = e.target.dataset?.bibInput; if (!k) return;
  if (k === 'igUrl') ig.url = e.target.value;
  if (k === 'edInstr') ed.instr = e.target.value;
  if (k === 'exBusca') ex.busca = e.target.value;
  if (k === 'exCidade') ex.cidade = e.target.value;
  if (k === 'exMsg') { try { localStorage.setItem(chaveMsg(), e.target.value.trim() || MSG_PADRAO); } catch { /* sem espaço */ } const pv = document.querySelector('.bib-prev'); if (pv) pv.innerHTML = '<span class="muted">Prévia:</span> ' + esc(montarMsg({ nome: 'Clínica Exemplo' })); }
});
document.addEventListener('change', e => { const k = e.target.dataset?.bibFile; if (k) definirImagem(k, e.target.files[0]); if (e.target.dataset?.bibCheck === 'soCel') { ex.soCel = e.target.checked; rerender(); } });
document.addEventListener('submit', e => {
  const f = e.target.closest('form[data-bib-form]'); if (!f) return;
  e.preventDefault();
  if (f.dataset.bibForm === 'extrator') { ex.busca = f.querySelector('[data-bib-input="exBusca"]').value; ex.cidade = f.querySelector('[data-bib-input="exCidade"]').value; document.activeElement?.blur(); return buscarEmpresas(); }
  const inp = f.querySelector('[data-bib-input="igUrl"]'); if (inp) ig.url = inp.value;
  inp?.blur(); baixarInstagram();
});
document.addEventListener('dragover', e => { const z = e.target.closest?.('[data-bib-drop]'); if (z) { e.preventDefault(); z.classList.add('over'); } });
document.addEventListener('dragleave', e => e.target.closest?.('[data-bib-drop]')?.classList.remove('over'));
document.addEventListener('drop', e => { const z = e.target.closest?.('[data-bib-drop]'); if (!z) return; e.preventDefault(); z.classList.remove('over'); definirImagem(z.dataset.bibDrop, e.dataTransfer.files[0]); });
document.addEventListener('paste', e => {
  if (!naBiblioteca() || S.sub.bTab !== 'editor') return;
  const f = [...(e.clipboardData?.files || [])].find(x => x.type.startsWith('image/')); if (!f) return;
  e.preventDefault(); definirImagem(!ed.ref ? 'ref' : 'eu', f);
});
