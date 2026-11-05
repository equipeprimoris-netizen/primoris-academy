// Primoris Academy — Biblioteca Primoris: Downloader do Instagram, Extrator de Empresas e Editor de Imagem com IA.
import { S, esc } from './core.js?v=20';
import { ic, pageHead } from './views.js?v=20';
import * as P from './platform.js?v=20';

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
  { id: 'extrator', nome: 'Extrator de Empresas', tag: 'Prospecção', icone: bi('mapa', 24), texto: 'Pesquise empresas do Google Maps aqui mesmo: telefone, celular, site e e-mail, prontos para copiar ou chamar no WhatsApp.' },
  { id: 'editor', nome: 'Editor de Imagem com IA', tag: 'Inteligência Artificial', icone: bi('magia', 24), texto: 'Envie uma imagem de referência e sua foto: a IA recria a cena com você no lugar.' },
];

// Estado local (fica guardado enquanto o app estiver aberto)
const ig = { url: '', loading: false, erro: '', items: [], caption: '', sc: '' };
const ex = { busca: '', cidade: '', loading: false, erro: '', lista: [], proxima: null, soCel: false, feita: '', emails: {} };
const ed = { ref: null, eu: null, instr: '', loading: false, erro: '', resultado: null };

let rerender = () => {};
let avisar = () => {};
let novoContato = () => {};
export function ligar(fnRender, fnToast, fnContato) { rerender = fnRender; avisar = fnToast; if (fnContato) novoContato = fnContato; }

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

const fone = t => ({ celular: '<span class="chip ok">Celular</span>', fixo: '<span class="chip">Fixo</span>' }[t] || '');
const extrator = () => {
  const l = ex.soCel ? ex.lista.filter(e => e.tipo === 'celular') : ex.lista; const cel = ex.lista.filter(e => e.tipo === 'celular').length;
  return voltar() + `<section class="card bib-panel">${cabecalho(FERRAMENTAS[1])}
  <form class="bib-ex-form" data-bib-form="extrator">
    <label class="field"><span>O que você procura</span><input data-bib-input="exBusca" value="${esc(ex.busca)}" placeholder="Ex.: dentista, academia, imobiliária, contabilidade" required></label>
    <label class="field"><span>Cidade / bairro</span><input data-bib-input="exCidade" value="${esc(ex.cidade)}" placeholder="Ex.: Curitiba, Moema São Paulo"></label>
    <button class="btn accent" ${ex.loading ? 'disabled' : ''}>${ex.loading ? '<span class="bib-spin"></span> Buscando…' : `${bi('mapa', 16)} Buscar empresas`}</button>
  </form>
  ${ex.erro ? `<p class="bib-msg bad">${esc(ex.erro)}</p>` : ''}
  ${ex.lista.length ? `<div class="bib-ex-bar"><strong>${ex.lista.length} empresa(s)</strong><span class="muted small">${esc(ex.feita)} · ${cel} com celular</span>
    <label class="bib-chk"><input type="checkbox" data-bib-check="soCel" ${ex.soCel ? 'checked' : ''}> Só celulares</label>
    <span class="grow"></span>
    <button class="btn sm accent" data-bib="copiar-cel" ${cel ? '' : 'disabled'}>${ic('copy', 15)} Copiar todos os celulares</button>
    <button class="btn sm" data-bib="csv">${ic('download', 15)} Planilha (CSV)</button></div>
  <div class="tablewrap"><table class="tbl bib-ex-tbl"><thead><tr><th>Empresa</th><th>Telefone</th><th>Site / e-mail</th><th>Nota</th><th></th></tr></thead><tbody>
  ${l.map(e => { const i = ex.lista.indexOf(e); const em = ex.emails[e.id]; return `<tr><td><strong>${esc(e.nome)}</strong><small class="muted">${esc(e.categoria ? e.categoria + ' · ' : '')}${esc(e.endereco)}</small></td>
    <td>${e.telefone ? `<span class="bib-tel">${esc(e.telefone)}</span> ${fone(e.tipo)}` : '<span class="muted small">Sem telefone</span>'}</td>
    <td>${e.site ? `<a href="${esc(e.site)}" target="_blank" rel="noopener" class="small">${esc(e.site.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').slice(0, 34))}</a>` : '<span class="muted small">—</span>'}
      ${em === undefined ? (e.site ? `<br><button class="linkbtn small" data-bib="email" data-id="${i}">Buscar e-mail</button>` : '') : em === 'carregando' ? '<br><span class="muted small">Buscando e-mail…</span>' : em.length ? `<br><span class="small">${em.map(esc).join('<br>')}</span>` : '<br><span class="muted small">E-mail não encontrado</span>'}</td>
    <td>${e.nota ? `★ ${String(e.nota).replace('.', ',')} <small class="muted">(${e.avaliacoes})</small>` : '—'}</td>
    <td class="acts">${e.telefone ? `<button class="btn xs" data-bib="copiar" data-id="${i}" title="Copiar número">${ic('copy', 13)}</button>` : ''}${e.whats ? `<a class="btn xs wa" href="https://wa.me/${e.whats}" target="_blank" rel="noopener" title="Chamar no WhatsApp">WhatsApp</a>` : ''}${e.telefone ? `<button class="btn xs" data-bib="carteira" data-id="${i}" title="Adicionar à minha carteira">${ic('plus', 13)} Carteira</button>` : ''}${e.mapa ? `<a class="btn xs" href="${esc(e.mapa)}" target="_blank" rel="noopener" title="Ver no Google Maps">${bi('mapa', 13)}</a>` : ''}</td></tr>`; }).join('')}
  </tbody></table></div>
  ${ex.proxima ? `<div class="bib-row bib-c"><button class="btn" data-bib="mais" ${ex.loading ? 'disabled' : ''}>Carregar mais empresas</button></div>` : '<p class="muted small bib-c">O Google mostra no máximo 60 empresas por busca. Para achar mais, mude o bairro ou o termo.</p>'}` : !ex.loading && !ex.erro ? `<div class="bib-ex-vazio">${bi('mapa', 34)}<p>Digite um nicho e uma cidade. As empresas do Google Maps aparecem aqui, com o telefone pronto para copiar.</p></div>` : ''}
</section>
<p class="muted small">Prefere coletar direto do Google Maps com rolagem automática? <a href="${EXTENSAO}" download="primoris-extrator.zip">Baixe a extensão do Chrome</a> (opcional). Use os contatos de forma responsável: mensagens em massa não solicitadas podem bloquear o seu WhatsApp.</p>`;
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
async function buscarEmpresas(mais = false) {
  if (ex.loading) return;
  if (!mais && ex.busca.trim().length < 2) { ex.erro = 'Diga o que você procura (ex.: dentista, academia).'; return rerender(); }
  Object.assign(ex, { loading: true, erro: '' }); if (!mais) Object.assign(ex, { lista: [], proxima: null, emails: {} }); rerender();
  try {
    const d = await chamar('primoris-empresas', { acao: 'buscar', busca: ex.busca, cidade: ex.cidade, pagina: mais ? ex.proxima : undefined });
    const ids = new Set(ex.lista.map(e => e.id));
    ex.lista.push(...d.empresas.filter(e => !ids.has(e.id))); ex.proxima = d.proxima;
    ex.feita = [ex.busca, ex.cidade].filter(Boolean).join(' · ');
    if (!ex.lista.length) ex.erro = 'Nenhuma empresa encontrada. Tente outro termo ou cidade.';
  } catch (e) { ex.erro = e.message === 'Failed to fetch' ? 'Sem conexão com o servidor. Verifique sua internet.' : e.message; }
  finally { ex.loading = false; rerender(); }
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
  else if (el.dataset.bib === 'mais') buscarEmpresas(true);
  else if (el.dataset.bib === 'email') buscarEmail(Number(id));
  else if (el.dataset.bib === 'copiar') { const e = ex.lista[Number(id)]; if (e) copiar(e.telefone, `Número copiado: ${e.telefone}`); }
  else if (el.dataset.bib === 'copiar-cel') { const l = ex.lista.filter(e => e.tipo === 'celular'); copiar(l.map(e => `${e.nome}\t${e.telefone}`).join('\n'), `${l.length} celulares copiados. Cole na planilha ou no bloco de notas.`); }
  else if (el.dataset.bib === 'csv') baixarCsv();
  else if (el.dataset.bib === 'carteira') { const e = ex.lista[Number(id)]; if (e) novoContato({ nome: e.nome, telefone: e.telefone, origem: 'Prospecção ativa', cidade: (e.endereco.match(/,\s*([^,]+?)\s*-\s*[A-Z]{2}/) || [])[1] || ex.cidade }); }
});
document.addEventListener('input', e => {
  const k = e.target.dataset?.bibInput; if (!k) return;
  if (k === 'igUrl') ig.url = e.target.value;
  if (k === 'edInstr') ed.instr = e.target.value;
  if (k === 'exBusca') ex.busca = e.target.value;
  if (k === 'exCidade') ex.cidade = e.target.value;
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
