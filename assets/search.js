/* Marque en Gros — header : icônes à droite + recherche active (références, produits, marques, catégories) */
(function () {
  'use strict';
  var INDEX = null, loading = null;
  var SYN = {
    'pantalon': 'pantalon chino pants trousers', 'jean': 'jean jeans denim', 'jogging': 'jogging jogger bas de jogging pantalon sportswear',
    'veste': 'veste jacket blouson', 'blouson': 'blouson veste jacket bomber', 'parka': 'parka manteau coat veste',
    'sweat': 'sweat sweatshirt hoodie capuche', 'pull': 'pull pullover jumper sweater maille knit tricot', 'gilet': 'gilet cardigan vest sans manche',
    'polo': 'polo', 't-shirt': 't-shirt tee shirt tshirt', 'doudoune': 'doudoune down jacket puffer', 'anorak': 'anorak coupe-vent windbreaker',
    'polaire': 'polaire fleece sherpa'
  };
  var PAGES = [
    { n: 'Compte pro', n_en: 'Pro account', p: 'Compte-Pro.dc.html', k: 'compte pro ouvrir inscription account' },
    { n: 'Contact', n_en: 'Contact', p: 'Contact.dc.html', k: 'contact aide question devis' },
    { n: 'Catalogue', n_en: 'Catalogue', p: 'Main.dc.html', k: 'catalogue accueil marques' }
  ];

  function lang() { try { return localStorage.getItem('meg-lang') === 'en' ? 'en' : 'fr'; } catch (e) { return 'fr'; } }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function load() {
    if (INDEX) return Promise.resolve(INDEX);
    if (!loading) {
      loading = fetch('./assets/search-index.json').then(function (r) { return r.json(); }).then(function (d) {
        d.items.forEach(function (it) {
          var syn = '';
          var tn = norm(it.t) + ' ' + norm(it.s);
          Object.keys(SYN).forEach(function (k) { if (tn.indexOf(norm(k)) > -1) syn += ' ' + SYN[k]; });
          it._name = norm(it.n);
          it._refs = it.r.map(norm).join(' ');
          it._hay = norm([it.n, it.r.join(' '), it.t, it.s, it.c.join(' '), it.b, syn].join(' '));
        });
        d.brands.forEach(function (b) { b._n = norm(b.n); });
        INDEX = d; return d;
      }).catch(function () { INDEX = { items: [], brands: [] }; return INDEX; });
    }
    return loading;
  }

  function search(q) {
    var toks = norm(q).split(' ').filter(Boolean);
    if (!toks.length || !INDEX) return { items: [], brands: [], pages: [] };
    var res = [];
    INDEX.items.forEach(function (it) {
      var ok = toks.every(function (t) { return it._hay.indexOf(t) > -1; });
      if (!ok) return;
      var sc = 0, full = toks.join(' ');
      if (it._name === full || it._refs.split(' ').indexOf(full) > -1) sc += 100;
      if (it._name.indexOf(full) === 0) sc += 40;
      toks.forEach(function (t) { if (it._name.indexOf(t) > -1) sc += 10; if (norm(it.t).indexOf(t) > -1) sc += 5; });
      res.push({ it: it, sc: sc });
    });
    res.sort(function (a, b) { return b.sc - a.sc || a.it.n.localeCompare(b.it.n); });
    var brands = INDEX.brands.filter(function (b) { return toks.every(function (t) { return b._n.indexOf(t) > -1; }); });
    var pages = PAGES.filter(function (p) { var h = norm(p.n + ' ' + p.k); return toks.every(function (t) { return h.indexOf(t) > -1; }); });
    return { items: res.map(function (r) { return r.it; }), brands: brands, pages: pages };
  }

  function go(it) {
    try { localStorage.setItem('meg-go-' + it.lk, JSON.stringify({ mk: it.k, ck: it.ck, t: Date.now() })); } catch (e) {}
    location.href = it.f;
  }

  var CSS = [
    '.m-hdr>header.mgs-on{display:flex!important;align-items:center;gap:28px}',
    '.m-hdr>header.mgs-on>a:not(.mgs-x){justify-self:auto!important;flex:none}',
    '.m-hdr>header.mgs-on>div:last-child{margin-left:auto;flex:none}',
    '.m-hdr>header.mgs-on>div:last-child>button:first-child{display:none!important}',
    '.mgs{position:relative;flex:1 1 auto;max-width:540px;min-width:0}',
    '.mgs-box{display:flex;align-items:center;gap:10px;height:42px;padding:0 14px;border:1px solid #2A2F36;background:#161A20;border-radius:2px;transition:border-color .15s,background .15s}',
    '.mgs-box:focus-within{border-color:#8A919B;background:#1B2027}',
    '.mgs-box svg{flex:none;color:#8A919B}',
    '.mgs-in{flex:1;min-width:0;height:100%;background:none;border:0;outline:0;color:#fff;font:400 14px Inter,sans-serif}',
    '.mgs-in::placeholder{color:#8A919B}',
    '.mgs-clr{display:none;flex:none;width:24px;height:24px;border:0;background:none;color:#8A919B;font-size:20px;line-height:1;cursor:pointer;padding:0}',
    '.mgs-clr.on{display:block}',
    '.mgs-dd{display:none;position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:80;background:#fff;color:#0E1116;border-radius:2px;box-shadow:0 24px 48px rgba(14,17,22,.35);max-height:min(70vh,560px);overflow:auto}',
    '.mgs-dd.on{display:block}',
    '.mgs-h{padding:12px 16px 6px;font:500 10.5px/1 "IBM Plex Mono",monospace;letter-spacing:.1em;text-transform:uppercase;color:#6B727C}',
    '.mgs-r{display:flex;align-items:center;gap:12px;padding:8px 16px;text-decoration:none;color:inherit;cursor:pointer;border:0;background:none;width:100%;text-align:left;font:inherit}',
    '.mgs-r.act,.mgs-r:hover{background:#F2F3F4}',
    '.mgs-r img{flex:none;width:40px;height:52px;object-fit:cover;object-position:center top;background:#F2F3F4;border-radius:2px}',
    '.mgs-t{display:flex;flex-direction:column;gap:3px;min-width:0}',
    '.mgs-t b{font:800 14px/1.1 "Inter Tight",sans-serif;letter-spacing:-.01em;text-transform:uppercase}',
    '.mgs-t span{font:400 12px/1.2 Inter,sans-serif;color:#545B66;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.mgs-t mark{background:#FFE9A8;color:inherit;padding:0}',
    '.mgs-e{padding:18px 16px;font:400 14px Inter,sans-serif;color:#545B66}',
    '.mgs-f{padding:10px 16px 12px;border-top:1px solid #ECEDEF;font:400 12px Inter,sans-serif;color:#6B727C}',
    /* mobile : la loupe d’origine ouvre une barre plein écran */
    '.mgs-m{display:none}',
    '@media (max-width:768px){',
    '.m-hdr>header.mgs-on{display:grid!important;gap:4px!important}',
    '.m-hdr>header.mgs-on>div:last-child>button:first-child{display:flex!important}',
    '.mgs{position:fixed;left:0;right:0;top:0;z-index:200;max-width:none;display:none;background:#0E1116;padding:8px 10px;border-bottom:1px solid #2A2F36}',
    '.mgs.open{display:block}',
    '.mgs-dd{position:fixed;left:0;right:0;top:58px;border-radius:0;max-height:calc(100vh - 58px)}',
    '.mgs-m{display:flex;align-items:center;justify-content:center;width:40px;height:42px;border:0;background:none;color:#fff;font-size:26px;cursor:pointer;padding:0;position:absolute;right:10px;top:8px}',
    '.mgs-box{margin-right:44px}',
    '}'
  ].join('\n');

  var st = null, form, inp, dd, clr, cur = [], act = -1;

  function hl(txt, toks) {
    var out = esc(txt);
    toks.forEach(function (t) {
      if (t.length < 2) return;
      var n = norm(out); // best-effort : surligne sur le texte brut sans accents
      var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      out = out.replace(re, '<mark>$1</mark>');
    });
    return out;
  }

  function render() {
    var q = inp.value, en = lang() === 'en';
    clr.classList.toggle('on', !!q);
    if (!q.trim()) { dd.classList.remove('on'); dd.innerHTML = ''; cur = []; return; }
    var r = search(q), toks = norm(q).split(' ').filter(Boolean), h = '';
    cur = []; act = -1;
    if (r.brands.length) {
      h += '<div class="mgs-h">' + (en ? 'Brands' : 'Marques') + '</div>';
      r.brands.forEach(function (b) { cur.push({ href: b.p }); h += '<a class="mgs-r" href="' + b.p + '" data-i="' + (cur.length - 1) + '"><div class="mgs-t"><b>' + esc(b.n) + '</b><span>' + (en ? 'See the brand catalogue' : 'Voir le catalogue de la marque') + '</span></div></a>'; });
    }
    if (r.items.length) {
      h += '<div class="mgs-h">' + (en ? 'Products' : 'Produits') + ' (' + r.items.length + ')</div>';
      r.items.slice(0, 8).forEach(function (it) {
        cur.push({ it: it });
        h += '<button type="button" class="mgs-r" data-i="' + (cur.length - 1) + '"><img src="' + it.i + '" alt="" loading="lazy"><div class="mgs-t"><b>' + hl(it.n, toks) + '</b><span>' + esc(it.b) + ' · ' + hl(it.s || it.t, toks) + ' · ' + it.c.length + (en ? ' colours' : ' coloris') + '</span></div></button>';
      });
      if (r.items.length > 8) h += '<div class="mgs-f">' + (en ? (r.items.length - 8) + ' more results: refine your search' : (r.items.length - 8) + ' autres résultats : précisez votre recherche') + '</div>';
    }
    if (r.pages.length) {
      h += '<div class="mgs-h">Pages</div>';
      r.pages.forEach(function (p) { cur.push({ href: p.p }); h += '<a class="mgs-r" href="' + p.p + '" data-i="' + (cur.length - 1) + '"><div class="mgs-t"><b>' + esc(en ? p.n_en : p.n) + '</b></div></a>'; });
    }
    if (!h) h = '<div class="mgs-e">' + (en ? 'No result for « ' : 'Aucun résultat pour « ') + esc(q) + ' ». ' + (en ? 'Try a reference (ATOLAL), a product (trousers, parka) or a brand.' : 'Essayez une référence (ATOLAL), un produit (pantalon, parka) ou une marque.') + '</div>';
    dd.innerHTML = h; dd.classList.add('on');
  }

  function open(i) { var c = cur[i]; if (!c) return; if (c.it) go(c.it); else location.href = c.href; }
  function setAct(n) {
    var rows = dd.querySelectorAll('[data-i]'); if (!rows.length) return;
    act = (n + rows.length) % rows.length;
    rows.forEach(function (r, k) { r.classList.toggle('act', k === act); });
    rows[act].scrollIntoView({ block: 'nearest' });
  }

  function build(header) {
    var en = lang() === 'en';
    form = document.createElement('form');
    form.className = 'mgs'; form.setAttribute('role', 'search'); form.setAttribute('autocomplete', 'off');
    form.innerHTML = '<div class="mgs-box"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4"></path></svg>' +
      '<input class="mgs-in" type="search" name="q" enterkeyhint="search" aria-label="' + (en ? 'Search' : 'Rechercher') + '" placeholder="' + (en ? 'Search a reference, a product, a brand…' : 'Rechercher une référence, un produit, une marque…') + '">' +
      '<button type="button" class="mgs-clr" aria-label="' + (en ? 'Clear' : 'Effacer') + '">×</button></div>' +
      '<button type="button" class="mgs-m" aria-label="' + (en ? 'Close' : 'Fermer') + '">×</button>' +
      '<div class="mgs-dd" role="listbox"></div>';
    inp = form.querySelector('.mgs-in'); dd = form.querySelector('.mgs-dd'); clr = form.querySelector('.mgs-clr');
    header.insertBefore(form, header.lastElementChild);
    header.classList.add('mgs-on');
    form.addEventListener('submit', function (e) { e.preventDefault(); if (act < 0) act = 0; if (!cur.length) render(); open(Math.max(act, 0)); });
    inp.addEventListener('focus', function () { load().then(render); });
    inp.addEventListener('input', function () { load().then(render); });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setAct(act + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setAct(act - 1); }
      else if (e.key === 'Escape') { inp.value = ''; render(); inp.blur(); form.classList.remove('open'); }
    });
    clr.addEventListener('click', function () { inp.value = ''; render(); inp.focus(); });
    form.querySelector('.mgs-m').addEventListener('click', function () { inp.value = ''; render(); form.classList.remove('open'); });
    dd.addEventListener('mousedown', function (e) { e.preventDefault(); });
    dd.addEventListener('click', function (e) { var r = e.target.closest('[data-i]'); if (r && r.tagName === 'BUTTON') open(+r.getAttribute('data-i')); });
    document.addEventListener('click', function (e) { if (!form.contains(e.target)) dd.classList.remove('on'); });
    document.addEventListener('keydown', function (e) {
      if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && !/INPUT|TEXTAREA/.test((document.activeElement || {}).tagName)) { e.preventDefault(); form.classList.add('open'); inp.focus(); }
    });
    // loupe d'origine (mobile) : ouvre la barre plein écran
    var loupe = header.lastElementChild && header.lastElementChild.querySelector('button:first-child');
    if (loupe) loupe.addEventListener('click', function () { form.classList.add('open'); inp.focus(); load(); });
    load();
  }

  function ensure() {
    var header = document.querySelector('.m-hdr > header');
    if (!header) return;
    if (!st) { st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st); }
    if (!header.classList.contains('mgs-on')) header.classList.add('mgs-on');
    if (!form || !header.contains(form)) {
      if (form && form.parentNode) form.parentNode.removeChild(form);
      var old = inp ? inp.value : '';
      build(header);
      if (old) { inp.value = old; }
    }
  }

  function init() {
    ensure();
    var n = 0, t = setInterval(function () { ensure(); if (++n > 40) clearInterval(t); }, 250);
    new MutationObserver(function () { var h = document.querySelector('.m-hdr > header'); if (h && (!form || !h.contains(form) || !h.classList.contains('mgs-on'))) ensure(); }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
