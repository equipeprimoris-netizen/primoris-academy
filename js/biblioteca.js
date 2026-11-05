// Primoris Academy — Biblioteca Primoris: Downloader do Instagram, Extrator de Empresas e Editor de Imagem com IA.
import { S, esc } from './core.js?v=19';
import { ic, pageHead } from './views.js?v=19';
import * as P from './platform.js?v=19';

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
  { id: 'extrator', nome: 'Extrator de Empresas', tag: 'Prospecção', icone: bi('mapa', 24), texto: 'Extensão do Chrome que coleta empresas do Google Maps com telefone, site e e-mail, e prepara o WhatsApp.' },
  { id: 'editor', nome: 'Editor de Imagem com IA', tag: 'Inteligência Artificial', icone: bi('magia', 24), texto: 'Envie uma imagem de referência e sua foto: a IA recria a cena com você no lugar.' },
];

// Estado local (fica guardado enquanto o app estiver aberto)
const ig = { url: '', loading: false, erro: '', items: [], caption: '', sc: '' };
const ed = { ref: null, eu: null, instr: '', loading: false, erro: '', resultado: null };

let rerender = () => {};
let avisar = () => {};
export function ligar(fnRender, fnToast) { rerender = fnRender; avisar = fnToast; }

// ---------- Telas
const voltar = () => `<button class="linkbtn" data-bib="tab" data-id="inicio">${ic('back', 16)} Voltar para a Biblioteca</button>`;

const inicio = () => `<div class="bib-grid">${FERRAMENTAS.map(f => `<button class="jt card bib-tool" data-bib="tab" data-id="${f.id}"><span class="jt-ic">${f.icone}</span><span class="jt-t">${esc(f.tag)}</span><strong>${esc(f.nome)}</strong><small class="muted">${esc(f.texto)}</small><span class="jt-go">Abrir ${ic('arrow', 14)}</span></button>`).join('')}</div>`;

const cabecalho = f => `<div class="bib-head"><span class="jt-ic">${f.icone}</span><div><h3>${esc(f.nome)}</h3><p class="muted small">${esc(f.texto)}</p></div></div>`;

const proxy = (url, nome) => `${FN('primoris-instagram')}?file=${encodeURIComponent(url)}&name=${encodeURIComponent(nome)}`;
const instagram = () => {
  const n = ig.items.length;
  return voltar() + `<section class="card bib-panel">${cabecalho(FERRAMENTAS[0])}
    <form class="bib-row" data-bib-form="instagram">
      <input data-bib-input="igUrl" value="${esc(ig.url)}" placeholder="Cole aqui o link do Instagram (ex.: https://www.instagram.com/reel/...)" autocomplete="off" aria-label="Link do Instagram">
      <button class="btn accent" ${ig.loading ? 'disabled' : ''}>${ig.loading ? '<span class="bib-spin"></span> Buscando…' : `${ic('download', 16)} Baixar`}</button>
    </form>
    ${ig.erro ? `<p class="bib-msg bad">${esc(ig.erro)}</p>` : n ? `<p class="bib-msg ok">${n === 1 ? 'Pronto! Clique em baixar.' : `Pronto! ${n} arquivos encontrados.`}</p>` : ''}
    ${n ? `<div class="bib-midias">${ig.items.map((it, i) => { const nome = `primoris-${ig.sc}${n > 1 ? '-' + (i + 1) : ''}`; const capa = it.thumb ? proxy(it.thumb, nome + '-capa') : ''; return `<div class="bib-midia"><div class="bib-thumb">${it.type === 'video' ? `<video src="${esc(proxy(it.url, nome))}" ${capa ? `poster="${esc(capa)}"` : ''} controls playsinline preload="none"></video>` : `<img src="${esc(proxy(it.url, nome))}" alt="" loading="lazy">`}<span class="bib-badge">${it.type === 'video' ? 'Vídeo' : 'Foto'}${n > 1 ? ' ' + (i + 1) : ''}</span></div><a class="btn accent block" href="${esc(proxy(it.url, nome))}">${ic('download', 16)} Baixar ${it.type === 'video' ? 'vídeo (MP4)' : 'foto (JPG)'}</a></div>`; }).join('')}</div>` : ''}
    ${ig.caption ? `<div class="bib-legenda"><span class="muted small">Legenda do post</span><p>${esc(ig.caption).replace(/\n/g, '<br>')}</p></div>` : ''}
  </section><p class="muted small">Funciona com posts públicos. Stories, destaques e contas privadas não são suportados. Baixe só conteúdo seu ou que você tem autorização para usar.</p>`;
};

const extrator = () => voltar() + `<section class="card bib-panel">${cabecalho(FERRAMENTAS[1])}
  <div class="bib-row"><a class="btn accent" href="${EXTENSAO}" download="primoris-extrator.zip">${ic('download', 16)} Baixar extensão (.zip)</a><span class="muted small">Versão 1.0 · Chrome, Edge, Brave e Opera (computador)</span></div>
  <ol class="bib-passos">
    <li>Baixe o arquivo e <strong>descompacte</strong> (botão direito → Extrair tudo).</li>
    <li>No Chrome, abra <code>chrome://extensions</code> e ligue o <strong>Modo do desenvolvedor</strong> (canto superior direito).</li>
    <li>Clique em <strong>Carregar sem compactação</strong> e escolha a pasta <code>primoris-extrator</code>.</li>
    <li>Fixe o ícone da coroa na barra. Faça uma busca no Google Maps (ex.: <em>dentista em Curitiba</em>) e clique no ícone.</li>
  </ol>
  <div class="bib-feat">
    <div><strong>Rolagem automática</strong><span>Coleta a lista inteira do Maps sozinho, com intervalo aleatório.</span></div>
    <div><strong>Telefone, site e e-mail</strong><span>Completa os dados abrindo cada empresa e lendo o site.</span></div>
    <div><strong>Fila de buscas</strong><span>Vários nichos e cidades em sequência, sem você clicar.</span></div>
    <div><strong>WhatsApp com mensagem</strong><span>Link pronto com {nome} e modo foco para envio manual.</span></div>
    <div><strong>Status do lead</strong><span>Novo, Contatado, Respondeu, Negociando, Fechado.</span></div>
    <div><strong>Exportação</strong><span>CSV, XLSX ou copiar tudo para a planilha.</span></div>
  </div>
</section>`;

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
async function baixarInstagram() {
  const url = ig.url.trim();
  if (!/instagram\.com\//i.test(url)) { ig.erro = 'Cole um link do Instagram (post, reel ou vídeo).'; ig.items = []; return rerender(); }
  Object.assign(ig, { loading: true, erro: '', items: [], caption: '' }); rerender();
  try {
    const r = await fetch(FN('primoris-instagram'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
    const d = await r.json().catch(() => ({ ok: false, error: 'Resposta inválida do servidor.' }));
    if (!d.ok) throw new Error(d.error || 'Não foi possível baixar.');
    Object.assign(ig, { items: d.items, caption: d.caption || '', sc: d.shortcode });
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
});
document.addEventListener('input', e => {
  const k = e.target.dataset?.bibInput; if (!k) return;
  if (k === 'igUrl') ig.url = e.target.value;
  if (k === 'edInstr') ed.instr = e.target.value;
});
document.addEventListener('change', e => { const k = e.target.dataset?.bibFile; if (k) definirImagem(k, e.target.files[0]); });
document.addEventListener('submit', e => {
  const f = e.target.closest('form[data-bib-form]'); if (!f) return;
  e.preventDefault();
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
