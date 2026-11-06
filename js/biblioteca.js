// Primoris Academy — Biblioteca Primoris: Downloader do Instagram, Extrator de Empresas e Editor de Imagem com IA.
import { S, esc, findDuplicate, normPhone, fmtPhone, fmtDate, list, firstName, nome, ETAPAS } from './core.js?v=29';
import { ic, pageHead } from './views.js?v=29';
import * as P from './platform.js?v=29';
import * as A from './arte.js?v=29';

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
  { id: 'artes', nome: 'Criador de Artes', tag: 'Grátis · rosto 100% fiel', icone: bi('imagem', 24), texto: 'Monte o post de resultado do mês com a sua foto original: o fundo sai sozinho e você só preenche mês, valor e nome. Dá para clonar modelos da internet.' },
  { id: 'editor', nome: 'Editor de Imagem com IA', tag: 'Inteligência Artificial', icone: bi('magia', 24), texto: 'Envie uma imagem de referência e sua foto: o sistema prepara tudo e a IA do Gemini recria a cena com você no lugar. Grátis.' },
];

// Estado local (fica guardado enquanto o app estiver aberto)
const ig = { url: '', loading: false, erro: '', items: [], caption: '', sc: '' };
const ex = { busca: '', cidade: '', loading: false, erro: '', lista: [], proxima: null, soCel: false, feita: '', emails: {} };
const ed = { ref: null, eu: null, instr: '', loading: false, erro: '', resultado: null };

let rerender = () => {};
let avisar = () => {};
let novoContato = () => {};
let prospectar = async () => {};
export function ligar(fnRender, fnToast, fnContato, fnProspectar) { rerender = fnRender; avisar = fnToast; A.ligar(fnRender, fnToast); if (fnContato) novoContato = fnContato; if (fnProspectar) prospectar = fnProspectar; }

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
const fone = t => ({ celular: '<span class="chip ok">Celular</span>', fixo: '<span class="chip">Fixo</span>', outro: '<span class="chip">Telefone</span>' }[t] || '');
const extrator = () => {
  const l = ex.soCel ? ex.lista.filter(e => e.tipo === 'celular') : ex.lista; const cel = ex.lista.filter(e => e.tipo === 'celular').length;
  return voltar() + `<section class="card bib-panel">${cabecalho(FERRAMENTAS[1])}
  <form class="bib-ex-form" data-bib-form="extrator">
    <label class="field"><span>O que você procura</span><input data-bib-input="exBusca" value="${esc(ex.busca)}" placeholder="Ex.: dentista, academia, imobiliária, contabilidade" required></label>
    <label class="field"><span>Cidade / bairro</span><input data-bib-input="exCidade" value="${esc(ex.cidade)}" placeholder="Ex.: Curitiba, Moema São Paulo, Lisboa"></label>
    <button class="btn accent" ${ex.loading ? 'disabled' : ''}>${ex.loading ? '<span class="bib-spin"></span> Buscando…' : `${bi('mapa', 16)} Buscar empresas`}</button>
  </form>
  <div class="bib-imp"><label class="btn sm">${ic('upload', 15)} Importar planilha da extensão (CSV)<input type="file" accept=".csv,text/csv" data-bib-file="planilha" hidden></label><span class="muted small">Funciona no Brasil e em outros países: informe a cidade (ex.: <em>Lisboa</em>, <em>Porto</em>, <em>Miami</em>).</span></div>
  ${ex.loading ? '<p class="muted small bib-espera"><span class="bib-spin"></span> Procurando no mapa gratuito… <b id="ex-seg">0s</b>. Em capitais pode levar até 40 segundos; para ir mais rápido, informe o <strong>bairro</strong> (ex.: <em>Copacabana, Rio de Janeiro</em>). Buscas já feitas pela equipe aparecem na hora.</p>' : ''}
  <details class="bib-msgbox"><summary>${ic('msg', 15)} Mensagem do WhatsApp <span class="muted small">(clique para editar)</span></summary>
    <textarea data-bib-input="exMsg" rows="3" maxlength="600">${esc(lerMsg())}</textarea>
    <p class="muted small">Use <code>{empresa}</code> para o nome da empresa e <code>{consultor}</code> para o seu nome. Fica salva só para você.</p>
    <p class="small bib-prev"><span class="muted">Prévia:</span> ${esc(montarMsg({ nome: 'Clínica Exemplo' }))}</p></details>
  ${ex.erro ? `<p class="bib-msg bad">${esc(ex.erro)}</p>` : ''}
  ${ex.lista.length ? `<div class="bib-ex-bar"><strong>${ex.lista.length} empresa(s)</strong><span class="muted small">${esc(ex.feita)} · ${cel} com celular${ex.daEquipe ? ' · resultado já buscado pela equipe' : ''}</span>
    <label class="bib-chk"><input type="checkbox" data-bib-check="soCel" ${ex.soCel ? 'checked' : ''}> Só celulares</label>
    <span class="grow"></span>
    <button class="btn sm accent" data-bib="copiar-cel" ${cel ? '' : 'disabled'}>${ic('copy', 15)} Copiar celulares</button>
    <button class="btn sm" data-bib="copiar-tel" ${ex.lista.some(e => e.telefone) ? '' : 'disabled'}>${ic('copy', 15)} Copiar todos os telefones</button>
    <button class="btn sm" data-bib="csv">${ic('download', 15)} Planilha (CSV)</button></div>
  ${ex.compl && !ex.compl.fim ? `<div class="bib-compl"><span class="bib-spin"></span> Completando contatos pelos sites das empresas: <b>${ex.compl.feitos} de ${ex.compl.total}</b> · ${ex.compl.achados} contato(s) novo(s) até agora. Você já pode usar a lista.</div>` : ex.compl?.fim ? `<div class="bib-compl ok">✓ Sites verificados: ${ex.compl.achados} empresa(s) ganharam telefone, WhatsApp ou e-mail.</div>` : ''}
  <div class="tablewrap"><table class="tbl bib-ex-tbl"><thead><tr><th>Empresa</th><th>Telefone</th><th>Site / e-mail</th><th>Nota</th><th></th></tr></thead><tbody>
  ${l.map(e => { const i = ex.lista.indexOf(e); const em = ex.emails[e.id]; return `<tr><td><strong>${esc(e.nome)}</strong>${(() => { const c = jaProspectado(e); return c ? ` <span class="chip ok">✓ Prospectado ${fmtDate((c.createdAt || '').slice(0, 10))}</span>` : ''; })()}<small class="muted">${esc(e.categoria ? e.categoria + ' · ' : '')}${esc(e.endereco)}</small></td>
    <td>${e.telefone ? `<span class="bib-tel">${esc(e.telefone)}</span> ${fone(e.tipo)}${e.viaSite ? ' <span class="chip">do site</span>' : ''}` : '<span class="muted small">Sem telefone</span>'}</td>
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
const PROMPT_BASE = `Vou te enviar duas imagens.
IMAGEM 1 = REFERÊNCIA: define a cena, a pose, o enquadramento, a roupa, o cenário, a iluminação, as cores e o estilo.
IMAGEM 2 = MINHA FOTO: sou eu, a pessoa que deve aparecer no resultado.
Crie UMA nova imagem que recrie a IMAGEM 1 o mais fiel possível, mas comigo (IMAGEM 2) no lugar da pessoa da referência.
Preserve exatamente o meu rosto, traços, tom de pele e formato do rosto: eu preciso ser reconhecível.
Mantenha da referência: pose, ângulo da câmera, roupa, acessórios, cenário, luz, paleta de cores, textura e proporção da imagem.
Resultado fotorrealista (ou no mesmo estilo artístico da referência, se ela não for foto).`;
const promptFinal = () => PROMPT_BASE + (ed.instr.trim() ? `\nAjustes que eu quero: ${ed.instr.trim()}` : '');
const editor = () => voltar() + `<section class="card bib-panel">${cabecalho(FERRAMENTAS[3])}
  <p class="bib-gratis">${ic('check', 15)} <span><strong>Grátis:</strong> o sistema prepara as imagens e as instruções, e a imagem é gerada no app do <strong>Gemini</strong> (Google), que tem cota gratuita diária. Basta estar logado com uma conta Google.</span></p>
  <div class="bib-duas">
    ${caixa('ref', 1, 'Referência', 'A cena, pose e estilo que você quer copiar.', 'imagem')}
    ${caixa('eu', 2, 'Sua foto', 'De preferência com o rosto bem visível e boa luz.', 'selfie')}
  </div>
  <label class="field"><span>Ajustes (opcional)</span><textarea data-bib-input="edInstr" rows="2" maxlength="800" placeholder="Ex.: trocar as cores para preto, verde e branco; colocar meu nome no lugar do nome da referência; formato quadrado">${esc(ed.instr)}</textarea></label>
  <div class="bib-row"><button class="btn accent" data-bib="preparar">${bi('magia', 16)} Preparar para o Gemini</button><span class="muted small">Leva 1 minuto: copiar, colar e enviar.</span></div>
  ${ed.erro ? `<p class="bib-msg bad">${esc(ed.erro)}</p>` : ''}
  ${ed.pronto ? `<div class="bib-gemini">
    <h4>Agora faça no Gemini, em 4 passos:</h4>
    <ol class="bib-passos">
      <li><a class="btn sm accent" href="https://gemini.google.com/app" target="_blank" rel="noopener">${ic('arrow', 15)} Abrir o Gemini</a> <span class="muted small">Abre numa nova aba. Entre com sua conta Google se pedir.</span></li>
      <li><button class="btn sm" data-bib="copiar-img" data-id="ref">${ic('copy', 15)} Copiar a referência</button> e cole no Gemini (<strong>Ctrl+V</strong>).</li>
      <li><button class="btn sm" data-bib="copiar-img" data-id="eu">${ic('copy', 15)} Copiar a sua foto</button> e cole no Gemini também (<strong>Ctrl+V</strong>).</li>
      <li><button class="btn sm" data-bib="copiar-prompt">${ic('copy', 15)} Copiar as instruções</button>, cole no Gemini e aperte <strong>Enviar</strong>. Quando a imagem aparecer, clique nela para baixar.</li>
    </ol>
    <p class="muted small">No celular, se o copiar não funcionar: <button class="linkbtn" data-bib="baixar-imgs">baixe as duas imagens</button> e anexe no Gemini pelo botão <strong>+</strong>.</p>
    <details><summary class="small">Ver as instruções que vão para o Gemini</summary><pre class="bib-prompt">${esc(promptFinal())}</pre></details>
  </div>` : ''}
</section><p class="muted small">Use fotos suas ou de pessoas que autorizaram. Se usar o post de outra pessoa ou marca como referência, troque nome, valores e logotipo pelos seus antes de publicar. As imagens não ficam salvas na Primoris.</p>`;

export const biblioteca = () => {
  const tab = ['instagram', 'extrator', 'artes', 'editor'].includes(S.sub.bTab) ? S.sub.bTab : 'inicio';
  const corpo = { inicio, instagram, extrator, artes: () => voltar() + A.tela(), editor }[tab]();
  return pageHead(`<span class="bib-t">${ic('book', 30)}</span> Biblioteca Primoris`, 'O acervo exclusivo da Primoris: materiais, ferramentas e conteúdos para acelerar seus resultados.')
    + `<div class="hub-tabs" role="tablist">${[['inicio', 'Todas', 'book'], ...FERRAMENTAS.map(f => [f.id, f.nome])].map(([id, l, i]) => `<button role="tab" aria-selected="${tab === id}" class="${tab === id ? 'on' : ''}" data-bib="tab" data-id="${id}">${i ? ic(i, 17) : bi({ instagram: 'insta', extrator: 'mapa', artes: 'imagem', editor: 'magia' }[id], 17)}<span>${esc(l)}</span></button>`).join('')}</div>`
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
const DDI = { br: '55', pt: '351', us: '1', ca: '1', es: '34', it: '39', fr: '33', gb: '44', ie: '353', de: '49', ch: '41', be: '32', nl: '31', ar: '54', uy: '598', py: '595', cl: '56', co: '57', mx: '52', pe: '51', bo: '591', ao: '244', mz: '258', jp: '81', au: '61' };
const CEL = { 351: /^3519/, 34: /^34[67]/, 39: /^393/, 33: /^33[67]/, 44: /^447/, 353: /^3538/, 49: /^491[567]/, 41: /^417[5-9]/, 32: /^324/, 31: /^316/, 54: /^549/, 598: /^5989/, 595: /^5959/, 56: /^569/, 57: /^573/, 52: /^521/, 51: /^519/, 244: /^2449/, 258: /^2588/, 61: /^614/ };
const DDIS = [...new Set(Object.values(DDI))].sort((a, b) => b.length - a.length);
const espacar = d => { const k = DDIS.find(x => d.startsWith(x)) || d.slice(0, d.length > 11 ? 3 : 2); const r = d.slice(k.length); const g = r.length === 10 ? r.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1 $2 $3') : r.length === 9 ? r.replace(/^(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3') : r.replace(/(\d{3})(?=\d)/g, '$1 '); return `+${k} ${g}`; };
// Classifica o número (celular, fixo ou telefone) e monta o link do WhatsApp, no Brasil ou em outro país
function tipoTelefone(tel, cc = 'br') {
  const bruto = String(tel || '').trim(); let d = bruto.replace(/\D/g, ''); if (!d) return { tipo: '', whats: '', bonito: '' };
  if (bruto.startsWith('00')) d = d.slice(2);
  const internacional = bruto.startsWith('+') || bruto.startsWith('00');
  if (!internacional) { if (cc === 'br' || !DDI[cc]) { if (d.startsWith('55') && d.length >= 12) d = d.slice(2); if (d.startsWith('0')) d = d.slice(1); d = '55' + d; } else { d = DDI[cc] + d.replace(/^0/, ''); } }
  if (d.startsWith('55')) {
    const n = d.slice(2).replace(/^0/, '');
    if (n.length === 11 && n[2] === '9') return { tipo: 'celular', whats: '55' + n, bonito: `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}` };
    if (n.length === 10) return { tipo: 'fixo', whats: '55' + n, bonito: `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}` };
    return { tipo: n.length >= 8 ? 'outro' : '', whats: n.length >= 10 ? '55' + n : '', bonito: bruto };
  }
  if (d.length < 8 || d.length > 15) return { tipo: d.length >= 8 ? 'outro' : '', whats: '', bonito: bruto };
  const ddi = Object.keys(CEL).find(k => d.startsWith(k));
  return { tipo: ddi ? (CEL[ddi].test(d) ? 'celular' : 'fixo') : 'outro', whats: d, bonito: espacar(d) };
}
async function comTempo(url, opt = {}, ms = 40000) {
  const c = new AbortController(); const t = setTimeout(() => c.abort(), ms);
  try { return await fetch(url, { ...opt, signal: c.signal }); } finally { clearTimeout(t); }
}
async function cidadeOSM(cidade) {
  const r = await comTempo('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&addressdetails=1&accept-language=pt-BR&q=' + encodeURIComponent(cidade), {}, 15000);
  if (!r.ok) throw new Error('O mapa gratuito não respondeu. Tente de novo em instantes.');
  const l = await r.json(); if (!l.length) return null;
  // Prefere o Brasil quando o nome existe em vários países (ex.: "Rio Branco"), a não ser que o país tenha sido escrito
  const pediuPais = /,\s*[^,]+$/.test(cidade);
  const rel = (!pediuPais && l.find(x => x.osm_type === 'relation' && x.address?.country_code === 'br')) || l.find(x => x.osm_type === 'relation') || l[0];
  const bb = (rel.boundingbox || []).map(Number);
  if (rel.addresstype === 'country' || rel.type === 'administrative' && rel.place_rank <= 4 || (bb.length === 4 && (bb[1] - bb[0]) * (bb[3] - bb[2]) > 9)) throw new Error('Essa área é grande demais para o mapa gratuito. Informe uma cidade (ex.: Lisboa, Porto, Miami) ou um bairro.');
  return { nome: rel.display_name, cc: rel.address?.country_code || 'br', bbox: bb.length === 4 ? `${bb[0]},${bb[2]},${bb[1]},${bb[3]}` : null };
}
// Pergunta aos 3 servidores do mapa ao mesmo tempo e fica com o primeiro que responder
async function overpass(q) {
  const ctrls = []; let vazios = 0; const hosts = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
  try {
    return await Promise.any(hosts.map(async host => {
      const c = new AbortController(); ctrls.push(c); const t = setTimeout(() => c.abort(), 40000);
      try {
        const r = await fetch(host, { method: 'POST', body: 'data=' + encodeURIComponent(q), signal: c.signal }); if (!r.ok) throw new Error('ocupado');
        const d = await r.json();
        // Servidor sobrecarregado costuma responder rápido, mas vazio ou com aviso de erro: espera os outros
        if (/error|timed out|timeout/i.test(d.remark || '') || !(d.elements || []).length) { vazios++; throw new Error('vazio'); }
        return d;
      } finally { clearTimeout(t); }
    }));
  } catch {
    if (vazios) return { elements: [] };
    throw new Error('O mapa gratuito está ocupado agora. Tente de novo em 1 minuto.');
  }
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
  try { const sn = await S.db.doc('cachemp/' + idCache).get(); const d = sn.exists ? sn.data() : null; if (d && Date.now() - new Date(d.at).getTime() < 7 * 864e5 && d.empresas?.length) { const r = { empresas: d.empresas, local: d.local, daEquipe: true, cacheId: idCache, completo: !!d.completo }; proCache(chave, r); return r; } } catch { /* segue para o mapa */ }
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
    const tp = tel ? tipoTelefone(tel, c.cc) : { tipo: '', whats: '', bonito: '' };
    const end = [t['addr:street'] && `${t['addr:street']}${t['addr:housenumber'] ? ', ' + t['addr:housenumber'] : ''}`, t['addr:suburb'], t['addr:city']].filter(Boolean).join(' - ');
    const lat = e.lat ?? e.center?.lat, lon = e.lon ?? e.center?.lon;
    return { id: `${e.type}/${e.id}`, nome: t.name, categoria: '', endereco: end, telefone: tp.bonito, tipo: tp.tipo, whats: tp.whats, site: t.website || t['contact:website'] || '', email: t.email || t['contact:email'] || '', nota: null, avaliacoes: 0, mapa: lat ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.name + ' ' + (t['addr:city'] || cidade))}` : '' };
  }).filter(e => { const k = (e.nome || '').toLowerCase() + e.telefone; if (!e.nome || vistos.has(k)) return false; vistos.add(k); return true; });
  l.sort((a, b) => (b.tipo === 'celular' ? 2 : b.telefone ? 1 : 0) - (a.tipo === 'celular' ? 2 : a.telefone ? 1 : 0));
  const res = { empresas: l.slice(0, 300), local: c.nome, cacheId: idCache, cc: c.cc }; if (res.empresas.length) proCache(chave, res);
  if (res.empresas.length) S.db.doc('cachemp/' + idCache).set({ empresas: res.empresas, local: c.nome, busca, cidade, at: new Date().toISOString(), by: S.uid }).catch(() => {});
  return res;
}
async function buscarEmpresas() {
  if (ex.loading) return;
  if (ex.busca.trim().length < 2) { ex.erro = 'Diga o que você procura (ex.: dentista, academia).'; return rerender(); }
  ex.rodada = (ex.rodada || 0) + 1; Object.assign(ex, { loading: true, erro: '', lista: [], proxima: null, emails: {}, t0: Date.now(), compl: null }); rerender();
  const relogio = setInterval(() => { const el = document.getElementById('ex-seg'); if (el) el.textContent = Math.round((Date.now() - ex.t0) / 1000) + 's'; }, 1000);
  try {
    const d = await buscarOSM(ex.busca.trim(), ex.cidade.trim());
    ex.daEquipe = !!d.daEquipe; ex.cacheId = d.cacheId || ''; ex.completo = !!d.completo;
    ex.lista = d.empresas.map(e => ({ ...e })); ex.cc = d.cc || 'br'; ex.lista.forEach(e => { if (e.email) ex.emails[e.id] = [e.email]; });
    ex.feita = [ex.busca, (d.local || ex.cidade).split(',')[0]].filter(Boolean).join(' · ');
    if (!ex.lista.length) ex.erro = 'Nenhuma empresa encontrada no mapa gratuito. Tente um termo mais comum (ex.: "clínica", "loja") ou outra cidade.';
  } catch (e) { ex.erro = e.name === 'AbortError' ? 'A busca demorou demais. Tente de novo ou use uma cidade/bairro menor.' : e.message === 'Failed to fetch' ? 'Sem conexão com o mapa. Verifique sua internet.' : e.message; }
  finally { clearInterval(relogio); ex.loading = false; rerender(); }
  if (ex.lista.length && !ex.completo) completarPelosSites();
}
// Abre o site de cada empresa (4 por vez) e completa telefone, WhatsApp e e-mail que faltam
async function completarPelosSites() {
  const alvo = ex.lista.filter(e => e.site && (!e.telefone || e.tipo !== 'celular' || !e.email)).slice(0, 80);
  if (!alvo.length) return;
  const rodada = ex.rodada = (ex.rodada || 0) + 1; ex.compl = { feitos: 0, total: alvo.length, achados: 0 }; rerender();
  const fila = [...alvo];
  const trabalhar = async () => {
    while (fila.length && rodada === ex.rodada) {
      const e = fila.shift();
      try {
        const d = await chamar('primoris-empresas', { acao: 'contato', site: e.site });
        let achou = false;
        if (d.whats && e.tipo !== 'celular') { const t = tipoTelefone('+' + d.whats.replace(/^\+/, '')); Object.assign(e, { whats: t.whats, tipo: 'celular', telefone: e.telefone && e.tipo === 'fixo' ? e.telefone : t.bonito, viaSite: true }); if (e.tipo === 'celular' && !e.telFixo) achou = true; }
        else if (!e.telefone && d.telefones?.length) { const t = tipoTelefone(d.telefones[0], ex.cc); Object.assign(e, { telefone: t.bonito, tipo: t.tipo, whats: t.whats, viaSite: true }); achou = true; }
        if (d.emails?.length && !e.email) { e.email = d.emails[0]; ex.emails[e.id] = d.emails; achou = true; }
        if (achou) ex.compl.achados++;
      } catch { /* site fora do ar */ }
      if (rodada !== ex.rodada) return;
      ex.compl.feitos++; if (ex.compl.feitos % 4 === 0 || !fila.length) rerender();
    }
  };
  await Promise.all([trabalhar(), trabalhar(), trabalhar(), trabalhar()]);
  if (rodada !== ex.rodada) return;
  ex.lista.sort((a, b) => (b.tipo === 'celular' ? 2 : b.telefone ? 1 : 0) - (a.tipo === 'celular' ? 2 : a.telefone ? 1 : 0));
  ex.compl.fim = true; rerender();
  if (ex.cacheId) S.db.doc('cachemp/' + ex.cacheId).set({ empresas: ex.lista, local: ex.feita, at: new Date().toISOString(), by: S.uid, completo: true }).catch(() => {});
}
// Importa a planilha CSV exportada pela extensão (ou qualquer planilha com Nome e Telefone)
function lerCsv(texto) {
  const t = texto.replace(/^\ufeff/, ''); const sep = (t.split('\n')[0].match(/;/g) || []).length >= (t.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
  const linhas = []; let campo = '', linha = [], aspas = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (aspas) { if (ch === '"') { if (t[i + 1] === '"') { campo += '"'; i++; } else aspas = false; } else campo += ch; }
    else if (ch === '"') aspas = true;
    else if (ch === sep) { linha.push(campo); campo = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && t[i + 1] === '\n') i++; linha.push(campo); if (linha.some(x => x.trim())) linhas.push(linha); linha = []; campo = ''; }
    else campo += ch;
  }
  linha.push(campo); if (linha.some(x => x.trim())) linhas.push(linha);
  return linhas;
}
async function importarPlanilha(file) {
  if (!file) return;
  if (!/\.csv$/i.test(file.name) && !/csv|text/.test(file.type)) { ex.erro = 'Use o arquivo CSV (na extensão, clique em "Exportar CSV").'; return rerender(); }
  const linhas = lerCsv(await file.text()); if (linhas.length < 2) { ex.erro = 'A planilha está vazia.'; return rerender(); }
  const cab = linhas[0].map(h => tirarAcento(h.toLowerCase().trim()));
  const col = (...nomes) => cab.findIndex(h => nomes.some(n => h === n || h.startsWith(n)));
  const ix = { nome: col('nome', 'empresa', 'name'), tel: col('telefone', 'phone', 'fone', 'celular'), wa: col('whatsapp', 'whats'), site: col('site', 'website'), email: col('email', 'e-mail'), end: col('endereco', 'address'), cidade: col('cidade', 'city'), cat: col('categoria', 'nicho', 'category'), nota: col('nota', 'rating'), aval: col('avaliacoes', 'reviews'), mapa: col('link maps', 'link', 'maps') };
  if (ix.nome < 0) { ex.erro = 'Não achei a coluna "Nome" na planilha.'; return rerender(); }
  const v = (l, i) => (i >= 0 ? String(l[i] || '').trim() : '');
  const lista = linhas.slice(1).map((l, n) => {
    const waNum = v(l, ix.wa).match(/(\d{10,15})/)?.[1] || '';
    const t = waNum ? tipoTelefone('+' + waNum) : tipoTelefone(v(l, ix.tel));
    return { id: 'csv/' + n + '/' + v(l, ix.nome).slice(0, 20), nome: v(l, ix.nome), categoria: v(l, ix.cat), endereco: [v(l, ix.end), v(l, ix.cidade)].filter(Boolean).join(' - '), telefone: v(l, ix.tel) ? tipoTelefone(v(l, ix.tel)).bonito : t.bonito, tipo: waNum ? 'celular' : t.tipo, whats: t.whats, site: v(l, ix.site), email: v(l, ix.email), nota: Number(String(v(l, ix.nota)).replace(',', '.')) || null, avaliacoes: Number(v(l, ix.aval)) || 0, mapa: /^https?:/.test(v(l, ix.mapa)) ? v(l, ix.mapa) : '' };
  }).filter(e => e.nome);
  lista.sort((a, b) => (b.tipo === 'celular' ? 2 : b.telefone ? 1 : 0) - (a.tipo === 'celular' ? 2 : a.telefone ? 1 : 0));
  Object.assign(ex, { lista, erro: '', emails: {}, feita: 'Planilha ' + file.name, daEquipe: false, cacheId: '', completo: false, compl: null, cc: 'br' });
  lista.forEach(e => { if (e.email) ex.emails[e.id] = [e.email]; });
  avisar(`${lista.length} empresas importadas da planilha.`, 'ok'); rerender(); completarPelosSites();
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

// ---------- Geração grátis dentro do sistema pelo Puter (cada usuário usa a própria conta gratuita)
let puterPronto = null;
function carregarPuter() {
  if (window.puter) return Promise.resolve(window.puter);
  if (!puterPronto) puterPronto = new Promise((ok, falha) => { const sc = document.createElement('script'); sc.src = 'https://js.puter.com/v2/'; sc.async = true; sc.onload = () => ok(window.puter); sc.onerror = () => { puterPronto = null; falha(new Error('Não consegui carregar a IA gratuita. Verifique sua internet.')); }; document.head.appendChild(sc); });
  return puterPronto;
}
async function gerarPuter() {
  if (ed.loading) return;
  if (!ed.ref) { ed.erro = 'Envie a imagem de referência (1).'; return rerender(); }
  if (!ed.eu) { ed.erro = 'Envie a sua foto (2).'; return rerender(); }
  Object.assign(ed, { loading: true, erro: '' }); rerender();
  try {
    const puter = await carregarPuter();
    if (!puter.auth.isSignedIn()) { avisar('Entre ou crie sua conta gratuita do Puter na janela que abriu.', 'ok'); await puter.auth.signIn(); }
    const img = await puter.ai.txt2img(promptFinal(), { model: 'gemini-3.1-flash-image', quality: '1K', input_images: [ed.ref.dataUrl, ed.eu.dataUrl] });
    const src = img?.src || String(img || '');
    if (!src) throw new Error('A IA não devolveu imagem. Tente de novo.');
    ed.resultado = { src, ext: /png/.test(src.slice(0, 30)) ? 'png' : 'jpg' }; avisar('Imagem pronta!', 'ok');
    setTimeout(() => document.querySelector('.bib-result')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
  } catch (e) {
    const cod = e?.errorCode || e?.code || e?.error?.code || '', msg = e?.message || e?.error?.message || '';
    ed.erro = /insufficient_funds|402|credit|funds/i.test(cod + msg) ? 'A cota grátis da sua conta Puter acabou por agora. Use o botão "Fazer pelo app do Gemini (grátis)" abaixo.'
      : /moderation/i.test(cod + msg) ? 'A IA recusou essas imagens ou instruções. Tente outra referência ou mude os ajustes.'
      : /popup|closed|cancel|auth/i.test(cod + msg) ? 'O login no Puter não foi concluído. Clique em "Gerar imagem aqui" e entre na janela que abrir (permita pop-ups).'
      : 'Não foi possível gerar agora' + (msg ? ': ' + msg : '.') + ' Tente de novo ou use o app do Gemini.';
  } finally { ed.loading = false; rerender(); }
}
async function baixarResultado() {
  const r = ed.resultado; if (!r) return;
  try { const b = await (await fetch(r.src)).blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'primoris-ia.' + (b.type.includes('png') ? 'png' : 'jpg'); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000); }
  catch { window.open(r.src, '_blank'); }
}
async function copiarImagem(chave) {
  const img = ed[chave]; if (!img) return;
  try {
    const png = await new Promise((ok, falha) => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); c.toBlob(b => b ? ok(b) : falha(new Error('x')), 'image/png'); }; im.onerror = falha; im.src = img.dataUrl; });
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
    avisar(chave === 'ref' ? 'Referência copiada. Cole no Gemini com Ctrl+V.' : 'Sua foto foi copiada. Cole no Gemini com Ctrl+V.', 'ok');
  } catch { baixarImagem(chave); avisar('Seu navegador não deixou copiar a imagem; baixei o arquivo para você anexar no Gemini.', 'warn'); }
}
function baixarImagem(chave) {
  const img = ed[chave]; if (!img) return;
  const a = document.createElement('a'); a.href = img.dataUrl; a.download = chave === 'ref' ? '1-referencia.jpg' : '2-minha-foto.jpg'; a.click();
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
  else if (el.dataset.bib === 'gerar-puter') gerarPuter();
  else if (el.dataset.bib === 'baixar-res') baixarResultado();
  else if (el.dataset.bib === 'preparar') {
    if (!ed.ref) { ed.erro = 'Envie a imagem de referência (1).'; ed.pronto = false; return rerender(); }
    if (!ed.eu) { ed.erro = 'Envie a sua foto (2).'; ed.pronto = false; return rerender(); }
    ed.erro = ''; ed.pronto = true; rerender(); setTimeout(() => document.querySelector('.bib-gemini')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }
  else if (el.dataset.bib === 'copiar-img') copiarImagem(id);
  else if (el.dataset.bib === 'copiar-prompt') copiar(promptFinal(), 'Instruções copiadas. Cole no Gemini com Ctrl+V e envie.');
  else if (el.dataset.bib === 'baixar-imgs') { baixarImagem('ref'); setTimeout(() => baixarImagem('eu'), 400); }
  else if (el.dataset.bib === 'email') buscarEmail(Number(id));
  else if (el.dataset.bib === 'copiar') { const e = ex.lista[Number(id)]; if (e) copiar(e.telefone, `Número copiado: ${e.telefone}`); }
  else if (el.dataset.bib === 'copiar-cel') { const l = ex.lista.filter(e => e.tipo === 'celular'); copiar(l.map(e => `${e.nome}\t${e.telefone}`).join('\n'), `${l.length} celulares copiados. Cole na planilha ou no bloco de notas.`); }
  else if (el.dataset.bib === 'copiar-tel') { const l = ex.lista.filter(e => e.telefone); copiar(l.map(e => `${e.nome}\t${e.telefone}`).join('\n'), `${l.length} telefones copiados. Cole na planilha ou no bloco de notas.`); }
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
document.addEventListener('change', e => { const k = e.target.dataset?.bibFile; if (k === 'planilha') { importarPlanilha(e.target.files[0]); e.target.value = ''; return; } if (k) definirImagem(k, e.target.files[0]); if (e.target.dataset?.bibCheck === 'soCel') { ex.soCel = e.target.checked; rerender(); } });
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
