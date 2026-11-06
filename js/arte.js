// Primoris Academy — Criador de Artes: posts de resultado com a foto original do consultor (rosto 100% fiel).
// Tudo roda no navegador e é grátis: o fundo da foto é removido aqui mesmo e a arte é montada num canvas.
import { S, esc, nome, isGestor, list, vendasValidadas, nowISO } from './core.js?v=29';
import { ic } from './views.js?v=29';
import * as P from './platform.js?v=29';

const RECORTE_LIB = 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/+esm';
const FONTES_LOCAIS = [['Inter', 'Inter-Medium.otf', '500', 'normal'], ['Inter', 'Inter-Bold.otf', '700', 'normal'], ['Inter', 'Inter-Black.otf', '900', 'normal'], ['Inter', 'Inter-BlackItalic.otf', '900', 'italic'], ['Great Vibes', 'GreatVibes-Regular.ttf', '400', 'normal']];
const FONTES_CSS = 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,700;0,900;1,900&family=Bebas+Neue&family=Playfair+Display:ital,wght@0,700;1,700&family=Dancing+Script:wght@700&display=swap';
const MESES_N = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
const FORMATOS = { feed: [1080, 1350, 'Feed (4:5)'], story: [1080, 1920, 'Story (9:16)'], quadrado: [1080, 1080, 'Quadrado (1:1)'] };
const FONTES = {
  inter9i: ['italic 900', 'Inter', 'Inter Black Itálico'], inter9: ['900', 'Inter', 'Inter Black'], inter7: ['700', 'Inter', 'Inter Negrito'],
  inter5: ['500', 'Inter', 'Inter Normal'], mont9: ['900', 'Montserrat', 'Montserrat Black'], mont9i: ['italic 900', 'Montserrat', 'Montserrat Black Itálico'],
  bebas: ['400', 'Bebas Neue', 'Bebas Neue (condensada)'], playfair: ['700', 'Playfair Display', 'Playfair (elegante)'], playfairi: ['italic 700', 'Playfair Display', 'Playfair Itálico'],
  vibes: ['400', 'Great Vibes', 'Great Vibes (cursiva)'], dancing: ['700', 'Dancing Script', 'Dancing Script (cursiva)'],
};
const CAMPOS = [
  ['mes', 'Mês', 'Ex.: OUTUBRO'], ['valor', 'Valor', 'Ex.: R$ 500 mil'], ['nome', 'Seu nome', ''], ['titulo', 'Destaque', 'Ex.: Nº 1'],
  ['sub', 'Abaixo do destaque', 'Ex.: DA GESTÃO MACRO (deixe vazio para tirar)'], ['frase', 'Frase', 'Use Enter para quebrar a linha'], ['rodape', 'Rodapé', 'Ex.: GRATIDÃO A CADA CLIENTE'],
];
const VERDE = '#22e65a', VERDE2 = '#78ff96';

// ---------- Modelo PRIMORIS (o aprovado pela equipe), coordenadas no formato feed 1080x1350
const camadasPrimoris = () => [
  { id: 'foto', tipo: 'foto', x: -70, y: 1350, h: 962, aura: VERDE },
  { id: 'logo', tipo: 'logo', x: 830, y: 36, s: 1 },
  { id: 't-res', tipo: 'texto', txt: 'RESULTADO DO MÊS', x: 830, y: 252, tam: 38, fonte: 'inter7', cor: '#ffffff', brilho: 8, corBrilho: '#0a5a22', maxw: 430 },
  { id: 't-mes', tipo: 'texto', campo: 'mes', x: 830, y: 330, tam: 98, fonte: 'inter9i', grad: ['#aaffb9', '#14c84b'], brilho: 18, corBrilho: VERDE, maxw: 430 },
  { id: 'cx', tipo: 'caixa', x: 615, y: 412, w: 430, h: 190, cor: VERDE2, fundo: 'rgba(3,30,12,.6)', raio: 26 },
  { id: 't-com', tipo: 'texto', txt: 'Comercializei', x: 830, y: 464, tam: 40, fonte: 'inter7', cor: '#ffffff', maxw: 400 },
  { id: 't-val', tipo: 'texto', campo: 'valor', x: 830, y: 540, tam: 84, fonte: 'inter9', grad: ['#c8ffd2', '#28dc5f'], brilho: 14, corBrilho: VERDE, maxw: 400 },
  { id: 't-tit', tipo: 'texto', campo: 'titulo', x: 830, y: 712, tam: 160, fonte: 'inter9i', grad: ['#beffc8', '#0fbe46'], brilho: 22, corBrilho: VERDE, maxw: 430 },
  { id: 't-sub', tipo: 'texto', campo: 'sub', x: 830, y: 812, tam: 38, fonte: 'inter9', cor: '#ffffff', brilho: 6, corBrilho: '#0a5a22', maxw: 430 },
  { id: 't-fra', tipo: 'texto', campo: 'frase', x: 830, y: 887, tam: 29, fonte: 'inter5', cor: '#ebf5ee', maxw: 440 },
  { id: 'faixa', tipo: 'sombra', x: 560, y: 1120, w: 520, h: 230 },
  { id: 't-nom', tipo: 'texto', campo: 'nome', x: 830, y: 1210, tam: 88, fonte: 'vibes', cor: '#ffffff', brilho: 12, corBrilho: '#148232', maxw: 450 },
  { id: 't-rod', tipo: 'texto', campo: 'rodape', x: 830, y: 1290, tam: 26, fonte: 'inter7', cor: VERDE2, brilho: 5, corBrilho: VERDE, maxw: 440 },
];
// Ajusta o modelo do feed para os outros formatos (fundo se estende; textos centralizados; foto no rodapé)
function adaptar(camadas, fmt) {
  const [, h] = FORMATOS[fmt]; const dy = (h - 1350) / 2;
  return camadas.map(c => {
    const n = { ...c };
    if (c.tipo === 'foto') { n.y = h; n.h = Math.round(c.h * (fmt === 'quadrado' ? 0.8 : fmt === 'story' ? 1.4 : 1)); }
    else if (c.tipo === 'logo') n.y = c.y + (fmt === 'story' ? 90 : 0);
    else if (fmt === 'quadrado') { n.y = Math.round(c.y * 0.8); if (n.tam) n.tam = Math.round(n.tam * 0.82); if (n.h) { n.h = Math.round(n.h * 0.82); n.w = Math.round(n.w * 0.9); n.x = c.x + c.w * 0.05; } if (c.tipo === 'sombra') n.y = 1080 - n.h; }
    else if (c.tipo === 'sombra') n.y = h - c.h;
    else if (c.id === 't-nom' || c.id === 't-rod') n.y = c.y + dy * 2;
    else n.y = c.y + dy;
    return n;
  });
}

// ---------- Estado
const chaveLocal = s => `primoris-arte-${s}-${S.uid || 'anon'}`;
const lerLocal = (s, def) => { try { return JSON.parse(localStorage.getItem(chaveLocal(s))) ?? def; } catch { return def; } };
const gravarLocal = (s, v) => { try { localStorage.setItem(chaveLocal(s), JSON.stringify(v)); return true; } catch { return false; } };
const ar = {
  iniciado: false, modelo: 'primoris', fmt: 'feed', valores: {}, camadas: null, fundo: null, fundoSrc: '',
  foto: null, fotoSrc: '', recortar: true, recortando: false, progresso: '', erro: '', sel: null, salvando: false,
};
const valoresPadrao = () => {
  const d = new Date(); const mk = d.toISOString().slice(0, 7);
  const total = vendasValidadas([S.uid]).filter(v => (v.data || '').startsWith(mk)).reduce((s, v) => s + (Number(v.valor) || 0), 0);
  return { mes: MESES_N[d.getMonth()], valor: total ? valorCurto(total) : 'R$ 500', nome: nome(S.uid) || '', titulo: 'Nº 1', sub: 'DA GESTÃO MACRO', frase: 'Toda conquista carrega uma\nhistória que nem todos viram.', rodape: 'GRATIDÃO A CADA CLIENTE' };
};
const valorCurto = n => n >= 1e6 ? `R$ ${(n / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} mi` : n >= 1e3 ? `R$ ${Math.round(n / 1e3).toLocaleString('pt-BR')} mil` : `R$ ${Math.round(n)}`;
function iniciar() {
  if (ar.iniciado) return; ar.iniciado = true;
  ar.valores = { ...valoresPadrao(), ...lerLocal('valores', {}) };
  ar.fmt = lerLocal('fmt', 'feed');
  const f = lerLocal('foto', null); if (f) carregarImg(f).then(im => { ar.foto = im; ar.fotoSrc = f; desenhar(); });
  escolherModelo(lerLocal('modelo', 'primoris'), true);
}

// ---------- Modelos: PRIMORIS + modelos da equipe (banco) + meus modelos (neste aparelho)
const modelosEquipe = () => list(S.modelos_arte).filter(m => !m.deletedAt).sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
const meusModelos = () => lerLocal('modelos', []);
function acharModelo(id) {
  if (id === 'primoris') return { id, nome: 'PRIMORIS Resultado do Mês' };
  return modelosEquipe().find(m => m.id === id) || meusModelos().find(m => m.id === id) || null;
}
function escolherModelo(id, silencioso) {
  const m = acharModelo(id) || acharModelo('primoris');
  ar.modelo = m.id; ar.sel = null; gravarLocal('modelo', m.id);
  if (m.id === 'primoris') { if (ar.fmt === 'livre') ar.fmt = lerLocal('fmt', 'feed'); if (!FORMATOS[ar.fmt]) ar.fmt = 'feed'; ar.fundo = null; ar.fundoSrc = ''; ar.camadas = lerLocal('camadas-' + ar.fmt, null) || adaptar(camadasPrimoris(), ar.fmt); }
  else { ar.fmt = 'livre'; ar.camadas = JSON.parse(JSON.stringify(m.camadas || [])); ar.fundoSrc = m.fundo; ar.tam = [m.w, m.h]; ar.fundo = null; carregarImg(m.fundo).then(im => { ar.fundo = im; desenhar(); }); }
  if (!silencioso) rerender();
}
const tamanho = () => (ar.fmt === 'livre' ? ar.tam : FORMATOS[ar.fmt]);

// ---------- Imagens
const carregarImg = src => new Promise((ok, falha) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => ok(im); im.onerror = () => falha(new Error('Não consegui abrir essa imagem.')); im.src = src; });
function reduzir(im, lado, tipo = 'image/jpeg', q = 0.88) {
  const s = Math.min(1, lado / Math.max(im.width, im.height)); const c = document.createElement('canvas');
  c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
  return c.toDataURL(tipo, q);
}
let libRecorte = null;
async function recortarFundo(dataUrl) {
  libRecorte ||= import(RECORTE_LIB).catch(e => { libRecorte = null; throw e; });
  const lib = await libRecorte;
  const blob = await (await fetch(dataUrl)).blob();
  const out = await lib.removeBackground(blob, {
    model: 'isnet_fp16', output: { format: 'image/png' },
    progress: (k, a, b) => { if (/fetch/.test(k) && b) { const p = Math.round((a / b) * 100); if (p !== ar.pctBaixando) { ar.pctBaixando = p; mostrarProgresso(`Preparando o recorte (só na 1ª vez): ${p}%`); } } },
  });
  return new Promise(ok => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(out); });
}
// Corta as bordas transparentes para a foto ficar "colada" no rodapé
async function aparar(src) {
  const im = await carregarImg(src); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
  const g = c.getContext('2d'); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data;
  let top = c.height, l = c.width, r = 0, b = 0;
  for (let y = 0; y < c.height; y += 2) for (let x = 0; x < c.width; x += 2) if (d[(y * c.width + x) * 4 + 3] > 24) { if (y < top) top = y; if (y > b) b = y; if (x < l) l = x; if (x > r) r = x; }
  if (r <= l || b <= top) return src;
  const o = document.createElement('canvas'); o.width = r - l + 1; o.height = b - top + 1;
  o.getContext('2d').drawImage(c, l, top, o.width, o.height, 0, 0, o.width, o.height);
  return o.toDataURL('image/png');
}
function mostrarProgresso(t) { ar.progresso = t; const el = document.querySelector('.arte-prog'); if (el) el.textContent = t; }
async function definirFoto(file) {
  if (!file?.type?.startsWith('image/')) return;
  ar.erro = ''; ar.recortando = true; ar.pctBaixando = -1; mostrarProgresso('Abrindo sua foto…'); rerender();
  try {
    const transp = /png|webp|gif/.test(file.type);
    const original = reduzir(await carregarImg(URL.createObjectURL(file)), 1600, transp ? 'image/png' : 'image/jpeg', 0.92);
    let src = original;
    if (ar.recortar) { mostrarProgresso('Tirando o fundo da foto (o seu rosto não é alterado)…'); src = await aparar(await recortarFundo(original)); }
    else if (transp) src = await aparar(original);
    ar.foto = await carregarImg(src); ar.fotoSrc = src;
    if (!gravarLocal('foto', src)) { const menor = reduzir(ar.foto, 1000, 'image/webp', 0.9); gravarLocal('foto', menor); }
    avisar('Foto pronta! Agora é só preencher os textos e baixar.', 'ok');
  } catch (e) {
    console.warn(e); ar.erro = 'Não consegui tirar o fundo agora (verifique sua internet e tente de novo). Se preferir, desmarque "Tirar o fundo da foto" e envie uma foto que já esteja sem fundo.';
  } finally { ar.recortando = false; ar.progresso = ''; rerender(); }
}
async function definirFundoModelo(file) {
  if (!file?.type?.startsWith('image/')) return;
  try {
    const src = reduzir(await carregarImg(URL.createObjectURL(file)), 1350, 'image/jpeg', 0.86);
    const im = await carregarImg(src); const s = 1080 / im.width;
    ar.modelo = 'novo'; ar.fmt = 'livre'; ar.tam = [1080, Math.round(im.height * s)]; ar.fundo = im; ar.fundoSrc = src; ar.sel = null;
    const [w, h] = ar.tam;
    ar.camadas = [
      { id: 'foto', tipo: 'foto', x: Math.round(w * 0.02), y: h, h: Math.round(h * 0.7), aura: '' },
      { id: 'c-mes', tipo: 'texto', campo: 'mes', x: Math.round(w * 0.72), y: Math.round(h * 0.25), tam: 80, fonte: 'inter9i', cor: '#ffffff', maxw: 520 },
      { id: 'c-val', tipo: 'texto', campo: 'valor', x: Math.round(w * 0.72), y: Math.round(h * 0.42), tam: 80, fonte: 'inter9', cor: '#ffffff', maxw: 520 },
      { id: 'c-nom', tipo: 'texto', campo: 'nome', x: Math.round(w * 0.72), y: Math.round(h * 0.85), tam: 80, fonte: 'vibes', cor: '#ffffff', maxw: 560 },
    ];
    avisar('Modelo carregado. Cubra os textos e a pessoa do modelo com "Tarja" e arraste os seus textos para o lugar.', 'ok');
  } catch (e) { ar.erro = e.message; }
  rerender();
}

// ---------- Desenho
let fontesProntas = null;
function carregarFontes() {
  if (fontesProntas) return fontesProntas;
  if (!document.querySelector('link[data-arte-fontes]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = FONTES_CSS; l.dataset.arteFontes = '1'; document.head.appendChild(l); }
  const locais = FONTES_LOCAIS.map(([f, arq, peso, estilo]) => new FontFace(f, `url(fonts/${arq})`, { weight: peso, style: estilo }).load().then(ff => document.fonts.add(ff)).catch(() => null));
  fontesProntas = Promise.all([...locais, ...Object.values(FONTES).map(([p, f]) => document.fonts.load(`${p} 40px "${f}"`).catch(() => null))]).then(() => { desenhar(); });
  return fontesProntas;
}
let logo = null; carregarImg('img/coroa-240.png').then(im => { logo = im; desenhar(); }).catch(() => {});
function rnd(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function fundoPrimoris(g, w, h) {
  const r = rnd(7);
  g.fillStyle = '#020604'; g.fillRect(0, 0, w, h);
  for (const [cx, cy, rr, a] of [[300 / 1080, 0.53, 620, 0.45], [900 / 1080, 0.41, 560, 0.3], [1000 / 1080, 0.09, 380, 0.22]]) {
    const gr = g.createRadialGradient(cx * w, cy * h, 0, cx * w, cy * h, rr); gr.addColorStop(0, `rgba(10,110,45,${a})`); gr.addColorStop(1, 'rgba(10,110,45,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }
  g.save(); g.strokeStyle = VERDE; g.shadowColor = VERDE; g.shadowBlur = 8;
  for (let i = 0; i < 14; i++) { const x = -400 + r() * (w + 400); const ang = (r() > 0.5 ? 1 : -1) * (0.5 + r() * 0.6); g.globalAlpha = 0.15 + r() * 0.3; g.lineWidth = 1 + r() * 2; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + ang * h, h); g.stroke(); }
  g.fillStyle = VERDE2; g.shadowColor = VERDE2;
  for (let i = 0; i < Math.round(260 * h / 1350); i++) { const x = r() * w, y = r() * h, rr = [1, 1, 1, 2, 2, 3][Math.floor(r() * 6)]; g.globalAlpha = 0.35 + r() * 0.65; g.shadowBlur = 6; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); }
  g.restore();
}
const fonteCss = (c, tam) => { const [p, f] = FONTES[c.fonte] || FONTES.inter7; return `${p} ${tam}px "${f}", Inter, sans-serif`; };
function textoDa(c) { return c.campo ? (ar.valores[c.campo] ?? '') : (c.txt ?? ''); }
function desenharCamada(g, c, caixas) {
  g.save();
  if (c.tipo === 'foto') {
    if (!ar.foto) { // espaço reservado
      const h = c.h, w = h * 0.7; g.globalAlpha = 0.5; g.fillStyle = 'rgba(255,255,255,.08)'; g.strokeStyle = 'rgba(255,255,255,.5)'; g.setLineDash([14, 10]); g.lineWidth = 3;
      g.beginPath(); g.roundRect(c.x + 60, c.y - h, w, h - 10, 30); g.fill(); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
      g.fillStyle = '#fff'; g.font = '600 34px Inter, sans-serif'; g.textAlign = 'center'; g.fillText('Sua foto aqui', c.x + 60 + w / 2, c.y - h / 2);
      caixas.push([c, c.x + 60, c.y - h, w, h]);
    } else {
      const h = c.h, w = h * ar.foto.width / ar.foto.height, x = c.x, y = c.y - h;
      if (c.aura) { g.shadowColor = c.aura; g.shadowBlur = 40; g.drawImage(ar.foto, x, y, w, h); g.shadowBlur = 18; g.drawImage(ar.foto, x, y, w, h); g.shadowBlur = 0; }
      g.drawImage(ar.foto, x, y, w, h); caixas.push([c, x, y, w, h]);
    }
  } else if (c.tipo === 'logo') {
    const s = c.s || 1; const lw = 92 * s;
    if (logo) g.drawImage(logo, c.x - lw / 2, c.y, lw, lw * logo.height / logo.width);
    const lh = logo ? lw * logo.height / logo.width : 60 * s;
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.shadowColor = '#14592a'; g.shadowBlur = 10 * s;
    g.font = `900 ${50 * s}px Inter, sans-serif`; g.fillText('PRIMORIS', c.x, c.y + lh + 34 * s);
    g.shadowBlur = 0; g.fillStyle = '#cdebd7'; g.font = `500 ${21 * s}px Inter, sans-serif`; g.fillText('Consórcio e Investimento', c.x, c.y + lh + 72 * s);
    caixas.push([c, c.x - 160 * s, c.y, 320 * s, lh + 90 * s]);
  } else if (c.tipo === 'caixa') {
    g.beginPath(); g.roundRect(c.x, c.y, c.w, c.h, c.raio || 20); g.fillStyle = c.fundo || 'rgba(0,0,0,.4)'; g.fill();
    g.strokeStyle = c.cor || '#fff'; g.lineWidth = 4; g.shadowColor = c.cor || '#fff'; g.shadowBlur = 20; g.stroke(); g.shadowBlur = 0; g.stroke();
    caixas.push([c, c.x, c.y, c.w, c.h]);
  } else if (c.tipo === 'tarja') {
    g.beginPath(); g.roundRect(c.x, c.y, c.w, c.h, c.raio || 0); g.fillStyle = c.cor || '#000'; g.fill(); caixas.push([c, c.x, c.y, c.w, c.h]);
  } else if (c.tipo === 'sombra') {
    const gr = g.createLinearGradient(0, c.y, 0, c.y + c.h); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.45, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,.7)');
    g.fillStyle = gr; g.fillRect(c.x, c.y, c.w, c.h);
  } else if (c.tipo === 'texto') {
    const linhas = String(textoDa(c)).split('\n'); if (!linhas.join('').trim()) { g.restore(); caixas.push([c, c.x - 80, c.y - 20, 160, 40]); return; }
    let tam = c.tam; g.font = fonteCss(c, tam);
    const larg = () => Math.max(...linhas.map(l => g.measureText(l).width));
    while (c.maxw && larg() > c.maxw && tam > 12) { tam -= 2; g.font = fonteCss(c, tam); }
    const alin = c.alinh || 'center'; g.textAlign = alin; g.textBaseline = 'middle';
    const lh = tam * 1.3, alt = lh * linhas.length, y0 = c.y - alt / 2 + lh / 2, wmax = larg();
    const xEsq = alin === 'center' ? c.x - wmax / 2 : alin === 'right' ? c.x - wmax : c.x;
    if (c.grad) { const gr = g.createLinearGradient(0, c.y - alt / 2, 0, c.y + alt / 2); gr.addColorStop(0, c.grad[0]); gr.addColorStop(1, c.grad[1]); g.fillStyle = gr; } else g.fillStyle = c.cor || '#fff';
    linhas.forEach((l, i) => {
      if (c.brilho) { g.shadowColor = c.corBrilho || c.cor || VERDE; g.shadowBlur = c.brilho * 1.6; g.fillText(l, c.x, y0 + i * lh); }
      g.shadowBlur = 0; g.fillText(l, c.x, y0 + i * lh);
    });
    caixas.push([c, xEsq - 10, c.y - alt / 2 - 6, wmax + 20, alt + 12]);
  }
  g.restore();
}
let caixasAtuais = [];
function desenhar(cv = document.getElementById('arte-cv'), paraBaixar = false) {
  if (!cv || !ar.camadas) return;
  const [w, h] = tamanho(); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  const g = cv.getContext('2d'); g.clearRect(0, 0, w, h);
  if (ar.fundo) g.drawImage(ar.fundo, 0, 0, w, h); else if (ar.fmt === 'livre') { g.fillStyle = '#111'; g.fillRect(0, 0, w, h); } else fundoPrimoris(g, w, h);
  const caixas = []; ar.camadas.forEach(c => desenharCamada(g, c, caixas));
  if (!paraBaixar) {
    caixasAtuais = caixas;
    const s = caixas.find(([c]) => c.id === ar.sel);
    if (s) { g.save(); g.strokeStyle = '#ffd84d'; g.lineWidth = 4; g.setLineDash([16, 10]); g.strokeRect(s[1], s[2], s[3], s[4]); g.restore(); }
  }
}

// ---------- Tela
const camadaSel = () => ar.camadas?.find(c => c.id === ar.sel);
const rotulo = c => c.tipo === 'foto' ? 'Sua foto' : c.tipo === 'logo' ? 'Logo PRIMORIS' : c.tipo === 'caixa' ? 'Caixa do valor' : c.tipo === 'tarja' ? 'Tarja (cobre partes do modelo)' : c.tipo === 'sombra' ? 'Sombra' : `Texto: ${(CAMPOS.find(f => f[0] === c.campo) || [, c.txt || 'texto'])[1]}`;
function painelCamada() {
  const c = camadaSel();
  if (!c) return `<p class="muted small">${ic('alert', 14)} Clique em qualquer elemento da arte para selecionar. Arraste para mudar de lugar.</p>`;
  const faixa = (k, l, min, max, v, passo = 1) => `<label class="field arte-faixa"><span>${l} <b>${Math.round(v)}</b></span><input type="range" min="${min}" max="${max}" step="${passo}" value="${v}" data-arte-prop="${k}"></label>`;
  let h = `<div class="arte-sel-t"><strong>${esc(rotulo(c))}</strong><span class="grow"></span><button class="btn sm" data-arte="desmarcar">Pronto</button></div>`;
  if (c.tipo === 'foto') h += faixa('h', 'Tamanho', 200, 2400, c.h, 2) + `<label class="arte-chk"><input type="checkbox" data-arte-prop="aura" ${c.aura ? 'checked' : ''}> Brilho em volta da foto</label>`;
  if (c.tipo === 'logo') h += faixa('s', 'Tamanho (%)', 40, 250, (c.s || 1) * 100);
  if (c.tipo === 'texto') {
    h += faixa('tam', 'Tamanho da letra', 12, 260, c.tam) + faixa('maxw', 'Largura máxima', 100, 1080, c.maxw || 1080, 10) + faixa('brilho', 'Brilho', 0, 40, c.brilho || 0);
    h += `<div class="arte-linha"><label class="field"><span>Letra</span><select data-arte-prop="fonte">${Object.entries(FONTES).map(([k, v]) => `<option value="${k}" ${c.fonte === k ? 'selected' : ''}>${esc(v[2])}</option>`).join('')}</select></label>
      <label class="field arte-cor"><span>Cor</span><input type="color" value="${c.grad ? c.grad[1] : (c.cor || '#ffffff')}" data-arte-prop="cor"></label>
      <label class="field arte-cor"><span>Cor do brilho</span><input type="color" value="${c.corBrilho || '#22e65a'}" data-arte-prop="corBrilho"></label></div>
      <div class="arte-linha"><label class="field"><span>Alinhamento</span><select data-arte-prop="alinh">${[['center', 'Centro'], ['left', 'Esquerda'], ['right', 'Direita']].map(([k, l]) => `<option value="${k}" ${(c.alinh || 'center') === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <label class="field"><span>O que mostra</span><select data-arte-prop="campo">${CAMPOS.map(([k, l]) => `<option value="${k}" ${c.campo === k ? 'selected' : ''}>${esc(l)}</option>`).join('')}<option value="" ${!c.campo ? 'selected' : ''}>Texto fixo</option></select></label></div>`;
    if (!c.campo) h += `<label class="field"><span>Texto fixo</span><textarea rows="2" data-arte-prop="txt">${esc(c.txt || '')}</textarea></label>`;
  }
  if (c.tipo === 'caixa' || c.tipo === 'tarja') {
    h += faixa('w', 'Largura', 20, 1920, c.w, 2) + faixa('h', 'Altura', 20, 1920, c.h, 2) + faixa('raio', 'Cantos arredondados', 0, 120, c.raio || 0);
    h += `<label class="field arte-cor"><span>${c.tipo === 'tarja' ? 'Cor da tarja' : 'Cor da borda'}</span><input type="color" value="${c.cor || '#000000'}" data-arte-prop="cor"></label>`;
    if (c.tipo === 'tarja') h += `<button class="btn sm" data-arte="conta-gotas">${ic('search', 14)} Pegar a cor do fundo do modelo</button>`;
  }
  h += `<div class="arte-linha"><button class="btn sm" data-arte="frente">Trazer para frente</button><button class="btn sm" data-arte="tras">Mandar para trás</button>${c.tipo !== 'foto' ? `<button class="btn sm" data-arte="duplicar">Duplicar</button><button class="btn sm danger" data-arte="remover">Excluir</button>` : ''}</div>`;
  return h;
}
export function tela() {
  iniciar(); carregarFontes();
  const eq = modelosEquipe(), meus = meusModelos(); const livre = ar.fmt === 'livre';
  const opt = (id, n) => `<option value="${esc(id)}" ${ar.modelo === id ? 'selected' : ''}>${esc(n)}</option>`;
  return `<section class="card bib-panel arte">
  <div class="bib-head"><span class="jt-ic">${ic('medal', 24)}</span><div><span class="jt-t">Grátis · seu rosto 100% original</span><h3>Criador de Artes</h3><p class="muted small">Monte o post de resultado com a <strong>sua foto de verdade</strong>: o sistema tira o fundo da foto aqui mesmo, sem IA mexer no seu rosto. Escolha um modelo, preencha os textos e baixe.</p></div></div>
  <div class="arte-grid">
    <div class="arte-esq">
      <div class="arte-linha">
        <label class="field grow"><span>Modelo</span><select data-arte-sel="modelo">${opt('primoris', 'PRIMORIS · Resultado do Mês')}${eq.length ? `<optgroup label="Modelos da equipe">${eq.map(m => opt(m.id, m.nome)).join('')}</optgroup>` : ''}${meus.length ? `<optgroup label="Meus modelos (neste aparelho)">${meus.map(m => opt(m.id, m.nome)).join('')}</optgroup>` : ''}${ar.modelo === 'novo' ? opt('novo', 'Novo modelo (não salvo)') : ''}</select></label>
        ${!livre ? `<label class="field"><span>Formato</span><select data-arte-sel="fmt">${Object.entries(FORMATOS).map(([k, v]) => `<option value="${k}" ${ar.fmt === k ? 'selected' : ''}>${v[2]}</option>`).join('')}</select></label>` : ''}
      </div>
      <label class="arte-foto ${ar.foto ? 'has' : ''}" data-arte-drop="foto">
        ${ar.foto ? `<img src="${ar.fotoSrc}" alt="">` : `<span>${ic('users', 26)}</span>`}
        <span class="arte-foto-t"><strong>${ar.foto ? 'Trocar a sua foto' : '1 · Envie a sua foto'}</strong><small class="muted">${ar.recortando ? '' : 'Rosto bem visível e boa luz. Clique, arraste ou cole (Ctrl+V).'}</small>${ar.recortando ? `<small class="arte-prog">${esc(ar.progresso || 'Processando…')}</small>` : ''}</span>
        <input type="file" accept="image/*" data-arte-file="foto" hidden ${ar.recortando ? 'disabled' : ''}>
      </label>
      <label class="arte-chk"><input type="checkbox" data-arte-sel="recortar" ${ar.recortar ? 'checked' : ''}> Tirar o fundo da foto automaticamente</label>
      ${ar.erro ? `<p class="bib-msg bad">${esc(ar.erro)}</p>` : ''}
      <h4 class="arte-h">2 · Seus textos</h4>
      <div class="arte-campos">${CAMPOS.map(([k, l, ph]) => k === 'frase' ? `<label class="field arte-full"><span>${l}</span><textarea rows="2" data-arte-val="${k}" placeholder="${esc(ph)}">${esc(ar.valores[k] || '')}</textarea></label>` : `<label class="field"><span>${l}</span><input data-arte-val="${k}" value="${esc(ar.valores[k] || '')}" placeholder="${esc(ph)}" maxlength="60"></label>`).join('')}</div>
      <div class="arte-sel">${painelCamada()}</div>
      <details class="arte-clonar" ${livre ? 'open' : ''}><summary><strong>${ic('copy', 15)} Clonar um modelo da internet</strong></summary>
        <ol class="bib-passos small">
          <li>Salve a imagem do modelo que você gostou (print ou download) e envie aqui: <label class="btn sm">${ic('upload', 14)} Enviar modelo<input type="file" accept="image/*" data-arte-file="modelo" hidden></label></li>
          <li>Use <button class="btn sm" data-arte="add-tarja">+ Tarja</button> para cobrir o nome, o valor e a pessoa do modelo (a tarja pode pegar a cor do fundo).</li>
          <li>Arraste a sua foto e os textos para o lugar. Precisa de mais? <button class="btn sm" data-arte="add-texto">+ Texto</button></li>
          <li>Salve o modelo para usar de novo${isGestor() ? ' ou para toda a equipe' : ''}.</li>
        </ol>
        ${livre ? `<div class="arte-linha"><input class="grow" data-arte-nome placeholder="Nome do modelo (ex.: Ranking Dourado)" value="${esc(acharModelo(ar.modelo)?.nome || '')}" maxlength="50">
          <button class="btn sm" data-arte="salvar-meu" ${ar.salvando ? 'disabled' : ''}>Salvar para mim</button>
          ${isGestor() ? `<button class="btn sm accent" data-arte="salvar-equipe" ${ar.salvando ? 'disabled' : ''}>Salvar para a equipe</button>` : ''}
          ${ar.modelo !== 'novo' && (meus.some(m => m.id === ar.modelo) || (isGestor() && eq.some(m => m.id === ar.modelo))) ? `<button class="btn sm danger" data-arte="excluir-modelo">Excluir modelo</button>` : ''}</div>` : ''}
        <p class="muted small">Use o modelo só como inspiração de layout: troque nome, logo, valores e fotos de outras pessoas ou marcas pelos seus.</p>
      </details>
    </div>
    <div class="arte-dir">
      <div class="arte-palco"><canvas id="arte-cv" aria-label="Prévia da arte"></canvas></div>
      <div class="arte-linha arte-acoes"><button class="btn accent" data-arte="baixar">${ic('download', 16)} Baixar arte (PNG)</button><button class="btn" data-arte="restaurar">Restaurar modelo</button></div>
      <p class="muted small">Dica: clique num elemento para ajustar tamanho, cor e letra. Tudo fica salvo neste aparelho.</p>
    </div>
  </div>
</section>`;
}

// ---------- Ações
let rerender = () => {}, avisar = () => {};
export function ligar(fnRender, fnToast) { rerender = fnRender; avisar = fnToast; }
const ativo = () => !!document.getElementById('arte-cv');
const nid = () => 'c' + Math.random().toString(36).slice(2, 8);
async function salvarModelo(equipe) {
  const nomeM = document.querySelector('[data-arte-nome]')?.value.trim();
  if (!nomeM) return avisar('Dê um nome ao modelo.', 'warn');
  if (!ar.fundoSrc) return avisar('Envie a imagem do modelo primeiro.', 'warn');
  const [w, h] = ar.tam; const dados = { nome: nomeM, fundo: ar.fundoSrc, w, h, camadas: ar.camadas };
  if (!equipe) {
    const l = meusModelos(); const id = ar.modelo !== 'novo' && l.some(m => m.id === ar.modelo) ? ar.modelo : 'm' + Date.now().toString(36);
    const nl = [...l.filter(m => m.id !== id), { id, ...dados }];
    if (!gravarLocal('modelos', nl)) return avisar('Sem espaço neste aparelho. Exclua algum modelo antigo.', 'warn');
    ar.modelo = id; gravarLocal('modelo', id); avisar('Modelo salvo neste aparelho.', 'ok'); return rerender();
  }
  ar.salvando = true; rerender();
  try {
    const db = await P.use('db'); const atual = modelosEquipe().find(m => m.id === ar.modelo);
    if (atual) await db.doc('modelos_arte/' + atual.id).set({ ...atual, ...dados, id: undefined, updatedAt: nowISO() });
    else { const ref = await db.collection('modelos_arte').add({ ...dados, createdAt: nowISO(), createdBy: S.uid }); ar.modelo = ref.id; }
    gravarLocal('modelo', ar.modelo); avisar('Modelo salvo para toda a equipe!', 'ok');
  } catch (e) { avisar('Não consegui salvar: ' + (e.message || 'erro'), 'warn'); }
  finally { ar.salvando = false; rerender(); }
}
async function excluirModelo() {
  const id = ar.modelo;
  if (meusModelos().some(m => m.id === id)) gravarLocal('modelos', meusModelos().filter(m => m.id !== id));
  else { try { const db = await P.use('db'); await db.doc('modelos_arte/' + id).delete(); } catch (e) { return avisar('Não consegui excluir: ' + e.message, 'warn'); } }
  avisar('Modelo excluído.', 'ok'); escolherModelo('primoris');
}
function baixar() {
  const c = document.createElement('canvas'); const prev = ar.sel; ar.sel = null; desenhar(c, true); ar.sel = prev;
  c.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `arte-primoris-${(ar.valores.mes || 'resultado').toLowerCase()}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }, 'image/png');
  avisar('Arte baixada!', 'ok');
}
function mover(dir) {
  const i = ar.camadas.findIndex(c => c.id === ar.sel); if (i < 0) return;
  const [c] = ar.camadas.splice(i, 1); ar.camadas.splice(Math.max(0, Math.min(ar.camadas.length, i + dir)), 0, c);
}
let contaGotas = false;
document.addEventListener('click', e => {
  if (!ativo()) return;
  const el = e.target.closest('[data-arte]'); if (!el) return;
  e.preventDefault(); const a = el.dataset.arte; const [w, h] = tamanho();
  if (a === 'baixar') return baixar();
  if (a === 'desmarcar') ar.sel = null;
  else if (a === 'restaurar') { if (ar.modelo === 'novo') { ar.camadas = ar.camadas.filter(c => c.tipo === 'foto' || c.campo); } else { if (ar.modelo === 'primoris') { try { localStorage.removeItem(chaveLocal('camadas-' + ar.fmt)); } catch { /* ok */ } } return escolherModelo(ar.modelo); } }
  else if (a === 'add-texto') { const c = { id: nid(), tipo: 'texto', txt: 'Seu texto', x: w / 2, y: h / 2, tam: 64, fonte: 'inter9', cor: '#ffffff', maxw: 900 }; ar.camadas.push(c); ar.sel = c.id; }
  else if (a === 'add-tarja') { const c = { id: nid(), tipo: 'tarja', x: w * 0.55, y: h * 0.4, w: 400, h: 140, cor: '#000000', raio: 0 }; const iFoto = ar.camadas.findIndex(x => x.tipo === 'foto'); ar.camadas.splice(Math.max(0, iFoto), 0, c); ar.sel = c.id; }
  else if (a === 'remover') { ar.camadas = ar.camadas.filter(c => c.id !== ar.sel); ar.sel = null; }
  else if (a === 'duplicar') { const c = camadaSel(); if (c) { const n = { ...JSON.parse(JSON.stringify(c)), id: nid(), x: c.x + 30, y: c.y + 30 }; ar.camadas.push(n); ar.sel = n.id; } }
  else if (a === 'frente') mover(1);
  else if (a === 'tras') mover(-1);
  else if (a === 'conta-gotas') { contaGotas = true; return avisar('Clique na arte, no ponto com a cor que você quer usar.', 'ok'); }
  else if (a === 'salvar-meu') return salvarModelo(false);
  else if (a === 'salvar-equipe') return salvarModelo(true);
  else if (a === 'excluir-modelo') return excluirModelo();
  if (ar.modelo === 'primoris' && !['desmarcar'].includes(a)) gravarLocal('camadas-' + ar.fmt, ar.camadas);
  rerender();
});
document.addEventListener('change', e => {
  if (!ativo()) return; const t = e.target;
  if (t.dataset.arteFile === 'foto') { definirFoto(t.files[0]); t.value = ''; }
  else if (t.dataset.arteFile === 'modelo') { definirFundoModelo(t.files[0]); t.value = ''; }
  else if (t.dataset.arteSel === 'modelo') escolherModelo(t.value);
  else if (t.dataset.arteSel === 'fmt') { ar.fmt = t.value; gravarLocal('fmt', ar.fmt); escolherModelo('primoris'); }
  else if (t.dataset.arteSel === 'recortar') ar.recortar = t.checked;
  else if (t.dataset.arteProp && ['fonte', 'alinh', 'campo', 'aura'].includes(t.dataset.arteProp)) {
    const c = camadaSel(); if (!c) return; const k = t.dataset.arteProp;
    if (k === 'aura') c.aura = t.checked ? VERDE : ''; else if (k === 'campo') { c.campo = t.value || undefined; if (!t.value) c.txt = c.txt || 'Seu texto'; } else c[k] = t.value;
    rerender();
  }
});
document.addEventListener('input', e => {
  if (!ativo()) return; const t = e.target;
  if (t.dataset.arteVal) { ar.valores[t.dataset.arteVal] = t.value; gravarLocal('valores', ar.valores); return desenhar(); }
  const k = t.dataset.arteProp; const c = camadaSel(); if (!k || !c || ['fonte', 'alinh', 'campo', 'aura'].includes(k)) return;
  if (k === 'cor') { if (c.grad) c.grad = [clarear(t.value), t.value]; else c.cor = t.value; }
  else if (k === 'corBrilho') { c.corBrilho = t.value; if (!c.brilho) c.brilho = 12; }
  else if (k === 'txt') c.txt = t.value;
  else if (k === 's') c.s = Number(t.value) / 100;
  else c[k] = Number(t.value);
  const b = t.closest('.arte-faixa')?.querySelector('b'); if (b) b.textContent = t.value;
  desenhar();
});
const clarear = hex => { const n = parseInt(hex.slice(1), 16); const m = v => Math.min(255, Math.round(v + (255 - v) * 0.6)); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(m).map(v => v.toString(16).padStart(2, '0')).join(''); };

// Arrastar elementos na arte
let arrasto = null;
const ponto = (cv, ev) => { const r = cv.getBoundingClientRect(); return [(ev.clientX - r.left) * cv.width / r.width, (ev.clientY - r.top) * cv.height / r.height]; };
document.addEventListener('pointerdown', ev => {
  const cv = ev.target.closest?.('#arte-cv'); if (!cv) return;
  const [x, y] = ponto(cv, ev);
  if (contaGotas) {
    contaGotas = false; const tmp = document.createElement('canvas'); const prev = ar.sel; ar.sel = null; const sel = ar.camadas.find(c => c.id === prev);
    const esc2 = ar.camadas; ar.camadas = esc2.filter(c => c !== sel); desenhar(tmp, true); ar.camadas = esc2; ar.sel = prev;
    const [r, g, b] = tmp.getContext('2d').getImageData(Math.round(x), Math.round(y), 1, 1).data;
    if (sel) sel.cor = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    return rerender();
  }
  const hit = [...caixasAtuais].reverse().find(([c, bx, by, bw, bh]) => c.tipo !== 'sombra' && x >= bx && x <= bx + bw && y >= by && y <= by + bh);
  const novoSel = hit ? hit[0].id : null;
  if (novoSel !== ar.sel) { ar.sel = novoSel; const p = document.querySelector('.arte-sel'); if (p) p.innerHTML = painelCamada(); }
  if (hit) { arrasto = { c: hit[0], x0: x, y0: y, cx: hit[0].x, cy: hit[0].y }; cv.setPointerCapture(ev.pointerId); ev.preventDefault(); }
  desenhar();
});
document.addEventListener('pointermove', ev => {
  if (!arrasto) return; const cv = document.getElementById('arte-cv'); if (!cv) return;
  const [x, y] = ponto(cv, ev); arrasto.c.x = Math.round(arrasto.cx + x - arrasto.x0); arrasto.c.y = Math.round(arrasto.cy + y - arrasto.y0); desenhar();
});
document.addEventListener('pointerup', () => { if (arrasto && ar.modelo === 'primoris') gravarLocal('camadas-' + ar.fmt, ar.camadas); arrasto = null; });
document.addEventListener('paste', e => {
  if (!ativo()) return; const f = [...(e.clipboardData?.files || [])].find(x => x.type.startsWith('image/')); if (!f) return;
  e.preventDefault(); definirFoto(f);
});
document.addEventListener('dragover', e => { if (e.target.closest?.('[data-arte-drop]')) e.preventDefault(); });
document.addEventListener('drop', e => { const z = e.target.closest?.('[data-arte-drop]'); if (!z) return; e.preventDefault(); definirFoto(e.dataTransfer.files[0]); });

// Redesenha sempre que a tela for montada de novo
new MutationObserver(() => { const cv = document.getElementById('arte-cv'); if (cv && !cv.dataset.ok) { cv.dataset.ok = '1'; desenhar(cv); } }).observe(document.body, { childList: true, subtree: true });

