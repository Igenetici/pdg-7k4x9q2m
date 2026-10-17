(function () {
'use strict';
const E = window.PedEngine;
const LS_KEY = 'pedigree-editor.v1';
const SYM = E.SYM, h = SYM / 2;
let S, undoStack = [], redoStack = [], log = [], fresh = new Set(), selected = null;
let zoom = { mode: 'fit', z: 1 };
let memo = null;
const insideClaude = !!(window.claude && typeof window.claude.use === 'function');
let downloads = null;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- persistence ---------- */
function load() { S = E.newState(); log = []; }
function valid(st) {
  const ok = st && st.people && st.unions && st.probandId && st.people[st.probandId];
  if (ok) Object.values(st.people).forEach(p => { if (p.twin && !p.twinType) p.twinType = p.mz ? 'MZ' : '?'; if (p.adopted === true) p.adopted = 'in'; if (!Array.isArray(p.variants)) p.variants = []; if (!Array.isArray(p.carriers)) p.carriers = []; if (!Array.isArray(p.conditions)) p.conditions = []; });
  return ok;
}
function save() { if (window.PedTablet) window.PedTablet.salva(S, log); }
function pushUndo(before) { undoStack.push(before || JSON.stringify(S)); if (undoStack.length > 120) undoStack.shift(); redoStack = []; }
function flashSheet() { const sh = $('#sheet'); sh.classList.remove('flash'); void sh.offsetWidth; sh.classList.add('flash'); }
function doUndo() { if (!undoStack.length) return false; flashSheet(); redoStack.push(JSON.stringify(S)); S = JSON.parse(undoStack.pop()); selected = null; closeEditor(); render(); save(); return true; }
function doRedo() { if (!redoStack.length) return; flashSheet(); undoStack.push(JSON.stringify(S)); S = JSON.parse(redoStack.pop()); selected = null; closeEditor(); render(); save(); }

/* ---------- SVG rendering ---------- */
function condColor(name) { const c = S.conditions.find(x => x.name === name); return c ? c.color : '#1B2433'; }
function shapePath(p, x, y) {
  if (p.miscarriage && p.loss === 'BIO') return `M${x},${y - 9}L${x + 10},${y + 8}L${x - 10},${y + 8}Z`;
  if (p.miscarriage) return `M${x},${y - 13}L${x + 14},${y + 11}L${x - 14},${y + 11}Z`;
  if (p.sex === 'M') return `M${x - h},${y - h}h${SYM}v${SYM}h${-SYM}Z`;
  if (p.sex === 'F') return `M${x - h},${y}a${h},${h} 0 1,0 ${SYM},0a${h},${h} 0 1,0 ${-SYM},0Z`;
  return `M${x},${y - 21}L${x + 21},${y}L${x},${y + 21}L${x - 21},${y}Z`;
}
function topOff(p) { return p.miscarriage ? 13 : p.sex === 'U' ? 21 : h; }
function halfW(p) { return p.miscarriage ? 14 : p.sex === 'U' ? 21 : h; }
const SVG_STYLE = `
.ln{stroke:#1B2433;stroke-width:1.6;fill:none}
.sh{fill:#fff;stroke:#1B2433;stroke-width:1.9}
.gn{font:700 13px 'Atkinson Hyperlegible',Arial,sans-serif;fill:#6A7584}
.lb{font:400 11.5px 'Atkinson Hyperlegible',Arial,sans-serif;fill:#1B2433;text-anchor:middle}
.lb.id{font-size:10.5px;fill:#6A7584}
.lb.nm{font-weight:700;font-size:12px}
.lb.cr{font-style:italic;fill:#4A5563}
.lb.ky{font:600 10.5px ui-monospace,'SFMono-Regular',Menlo,Consolas,monospace;fill:#3D5A99}
.wbadge circle{fill:#E8A33D;stroke:#fff;stroke-width:1.5}
.wbadge text{font:700 11px 'Atkinson Hyperlegible',Arial,sans-serif;fill:#fff;text-anchor:middle}
.lg .inh{fill:#6A7584}
.lb.nt{font-style:italic;fill:#6A7584;font-size:10.5px}
.lb.pm{font-weight:700;fill:#6B3E75;font-size:10.5px}
.pin.sm{font-size:10px}
.sh.bio{stroke-dasharray:3 2}
.pmab rect{fill:#F3EEFA;stroke:#6B3E75;stroke-width:1}
.pmab text{font:700 8.5px 'Atkinson Hyperlegible',Arial,sans-serif;fill:#6B3E75;text-anchor:middle}
.fn{font:400 11px 'Atkinson Hyperlegible',Arial,sans-serif;fill:#1B2433}
.qm{font:700 13px 'Atkinson Hyperlegible',Arial,sans-serif;fill:#1B2433;text-anchor:middle}
.lb.vr{font-weight:700;fill:#1F4E79}
.lb.vn{fill:#6A7584}
.vplus{font:700 14px 'Atkinson Hyperlegible',Arial,sans-serif;fill:#1F4E79}
.pp{font:700 12px 'Atkinson Hyperlegible',Arial,sans-serif;fill:#1B2433}
.pin{font:700 15px 'Atkinson Hyperlegible',Arial,sans-serif;fill:#1B2433;text-anchor:middle}
.ttl{font:700 16px 'Atkinson Hyperlegible',Arial,sans-serif;fill:#1B2433}
.sub{font:400 11.5px 'Atkinson Hyperlegible',Arial,sans-serif;fill:#6A7584}
.lg{font:400 12px 'Atkinson Hyperlegible',Arial,sans-serif;fill:#1B2433}
.hit{fill:transparent;cursor:pointer}
.sel{fill:none;stroke:#0E6E6B;stroke-width:2;stroke-dasharray:4 3}
.halo{fill:none;stroke:#0E6E6B;stroke-width:3;opacity:0}
.fresh .halo{animation:halo 1.6s ease-out 1}
@keyframes halo{0%{opacity:.9;stroke-width:7}100%{opacity:0;stroke-width:1}}
.anim .fresh .sym{transform-box:fill-box;transform-origin:center;animation:pop .5s cubic-bezier(.2,1.5,.4,1) 1}
.anim .fresh .lb{animation:fadein .5s ease-out .12s 1 both}
@keyframes pop{0%{transform:scale(.3);opacity:0}100%{transform:scale(1);opacity:1}}
.anim .draw{stroke-dasharray:1000;stroke-dashoffset:1000;animation:draw .8s cubic-bezier(.4,0,.2,1) .05s forwards}
@keyframes draw{to{stroke-dashoffset:0}}
.anim .fresh .fill{transform-box:fill-box;transform-origin:bottom;animation:fillup .7s cubic-bezier(.3,.8,.3,1) .15s both}
@keyframes fillup{from{transform:scaleY(0)}to{transform:scaleY(1)}}
.anim .fresh .vplus,.anim .fresh circle:not(.halo){animation:fadein .4s ease-out .35s both}
@keyframes fadein{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.fresh .halo,.anim .fresh .sym,.anim .fresh .lb,.anim .draw,.anim .fresh .fill{animation:none;opacity:1;stroke-dashoffset:0}}
`;
let svgSeq = 0;
function notaRighe(S, larghezza) {
  // le note generali spezzate sulla larghezza del disegno; il punto elenco solo sulla prima riga di ogni nota
  const max = Math.max(38, Math.floor(larghezza / 6.4));
  const out = [];
  (S.noteGen || []).filter(Boolean).forEach(t => {
    let cur = '• ';
    String(t).split(/\s+/).forEach(w => { if (cur.length + w.length + 1 > max && cur.trim() !== '•') { out.push(cur); cur = '   ' + w; } else cur += (cur === '• ' ? '' : ' ') + w; });
    out.push(cur);
  });
  return out;
}
function svgFor(L, o) {
  o = o || {};
  const sid = 's' + (++svgSeq);
  const P = S.people;
  const PADL = 58, PADR = 26, PADT = o.exp ? 74 : 30;
  const vociLeg = !o.exp ? [] : S.conditions.map(c => ({ color: c.color, nome: c.name, m: E.modoDi(S, c.name) }))
    .concat(Object.entries(E.mappaPortatori ? E.mappaPortatori(S) : {}).map(([g, m]) => ({ color: m.colore, nome: m.varianti.join(', ') + ' – portatori', port: true })));
  const legendRows = vociLeg.length ? Math.ceil(vociLeg.length / 2) : 0;
  const noteLinee = notaRighe(S, Math.max(L.width, o.exp ? 420 - PADL - PADR : 0));
  const noteH = noteLinee.length ? 30 + noteLinee.length * 16 : 0;
  const W = Math.max(L.width + PADL + PADR, o.exp ? 420 : 0);
  const noteRows = o.exp && E.reproRiassunto ? E.reproRiassunto(S).length : 0;
  const H = L.height + PADT + 34 + noteH + (legendRows ? 30 + legendRows * 22 : 0) + (noteRows ? 26 + noteRows * 17 : 0);
  const X = id => L.x[id] + PADL, Y = id => L.y[id] + PADT;
  const out = [];
  const mappaPort = E.mappaPortatori ? E.mappaPortatori(S) : {};
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}" width="${(W * (o.z || 1)).toFixed(0)}" height="${(H * (o.z || 1)).toFixed(0)}" role="img" aria-label="Albero genealogico">`);
  out.push(`<style>${SVG_STYLE}</style>`);
  if (o.exp) {
    out.push(`<rect width="100%" height="100%" fill="#fff"/>`);
    out.push(`<text class="ttl" x="${PADL}" y="30">Pedigree${S.code ? ' – ' + esc(S.code) : ''}</text>`);
    out.push(`<text class="sub" x="${PADL}" y="50">${new Date().toLocaleDateString('it-IT')}</text>`);
  }
  // generation numerals
  L.gks.forEach((g, gi) => out.push(`<text class="gn" x="16" y="${(L.rowY[g] + PADT + 5).toFixed(1)}">${E.ROMAN[gi]}</text>`));
  // relationship lines
  const ln = [], lnF = [], qmarks = [], badges = [];
  // stagger sibship lines that overlap horizontally within the same row
  const sibLevel = {};
  {
    const byRow = {};
    for (const u of Object.values(S.unions)) {
      const pa = [u.a, u.b].filter(id => id && P[id] && L.x[id] != null);
      const kids = u.children.filter(c => P[c] && L.x[c] != null);
      if (!kids.length || !pa.length) continue;
      const mx = pa.length === 2 ? (X(pa[0]) + X(pa[1])) / 2 : X(pa[0]);
      const xs = [...kids.map(X), mx];
      const row = Math.min(...kids.map(Y));
      (byRow[row] = byRow[row] || []).push({ id: u.id, a: Math.min(...xs), b: Math.max(...xs), mx, drops: kids.map(X) });
    }
    const ov = (p, q) => !(p.a > q.b + 6 || p.b < q.a - 6);
    const inside = (x, q) => x > q.a - 2 && x < q.b + 2;
    const cost = (top, bot) => top.drops.filter(x => inside(x, bot)).length + (inside(bot.mx, top) ? 1 : 0);
    Object.values(byRow).forEach(list => {
      list.sort((p, q) => p.a - q.a);
      for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
        const p = list[i], q = list[j];
        if (ov(p, q) && cost(p, q) < cost(q, p)) { list[i] = q; list[j] = p; }
      }
      const placed = [];
      list.forEach(it => {
        const lv = placed.filter(o => ov(o, it)).reduce((m, o) => Math.max(m, sibLevel[o.id] + 1), 0);
        sibLevel[it.id] = lv; placed.push(it);
      });
    });
  }
  const dash = [], extra = [];
  for (const u of Object.values(S.unions)) {
    const pa = [u.a, u.b].filter(id => id && P[id] && L.x[id] != null);
    const cons = L.consang && L.consang.has(u.id);
    const LN = o.fresh && [u.a, u.b, ...u.children].some(x => o.fresh.has(x)) ? lnF : ln;
    let mx = null, my = null;
    if (pa.length === 2) {
      const [l, r] = X(pa[0]) <= X(pa[1]) ? pa : [pa[1], pa[0]];
      if (Y(l) === Y(r)) {
        const yy = Y(l), x1 = X(l) + halfW(P[l]), x2 = X(r) - halfW(P[r]);
        if (cons) LN.push(`M${x1},${yy - 3}H${x2}`, `M${x1},${yy + 3}H${x2}`); else LN.push(`M${x1},${yy}H${x2}`);
        mx = (X(l) + X(r)) / 2; my = yy + (cons ? 3 : 0);
      } else {
        // unione tra generazioni diverse: esce dal lato libero e scende fino al partner piu' in basso
        const [hi, lo] = Y(l) < Y(r) ? [l, r] : [r, l];
        const freeSide = id => { const row = L.rows[L.gen[id]] || []; const i = row.indexOf(id);
          const lx = i > 0 ? X(id) - X(row[i - 1]) : 1e9, rx = i < row.length - 1 ? X(row[i + 1]) - X(id) : 1e9;
          if (id === S.probandId && rx > 120) return 1; return lx >= rx ? -1 : 1; };
        const side = freeSide(lo);
        const kx = side < 0 ? Math.min(X(hi) - halfW(P[hi]), X(lo) - halfW(P[lo])) - 26 : Math.max(X(hi) + halfW(P[hi]), X(lo) + halfW(P[lo])) + 26;
        const path = (o) => `M${X(hi) + side * halfW(P[hi])},${Y(hi) + o}H${kx + side * o}V${Y(lo) + o}H${X(lo) + side * halfW(P[lo])}`;
        if (cons) LN.push(path(-3), path(3)); else LN.push(path(0));
        mx = kx; my = Y(lo) + (cons ? 3 : 0);
      }
      if (u.pma) badges.push([mx, my]);
      if (u.separated) {
        const n = u.separated === 'divorziati' ? 2 : 1;
        for (let i = 0; i < n; i++) { const dx = (i - (n - 1) / 2) * 7; extra.push(`M${mx + dx - 5},${my + 9}L${mx + dx + 5},${my - 9}`); }
      }
    } else if (pa.length === 1) { mx = X(pa[0]); my = Y(pa[0]) + halfW(P[pa[0]]); }
    const kids = u.children.filter(c => P[c] && L.x[c] != null);
    if (!kids.length) {
      if (u.noKids && mx != null) { const by = my + 26; extra.push(`M${mx},${my}V${by}M${mx - 11},${by}H${mx + 11}`); if (u.noKids === 'infertile') extra.push(`M${mx - 11},${by + 5}H${mx + 11}`); }
      continue;
    }
    if (mx == null) continue;
    const startY = my;
    const cy = Math.min(...kids.map(Y));
    const sibY = cy - h - 24 - (sibLevel[u.id] || 0) * 10;
    const groups = {};
    kids.forEach(c => { const t = P[c].twin; if (t) (groups[t] = groups[t] || []).push(c); });
    const att = {};
    kids.forEach(c => { const t = P[c].twin; att[c] = t && groups[t].length > 1 ? groups[t].reduce((s2, k) => s2 + X(k), 0) / groups[t].length : X(c); });
    const xs = [...Object.values(att), mx];
    LN.push(`M${mx},${startY}V${sibY}`);
    LN.push(`M${Math.min(...xs)},${sibY}H${Math.max(...xs)}`);
    kids.forEach(c => (P[c].adopted === 'in' ? dash : LN).push(`M${att[c]},${sibY}L${X(c)},${Y(c) - topOff(P[c])}`));
    Object.values(groups).forEach(g => {
      if (g.length < 2) return;
      const ty = P[g[0]].twinType || (P[g[0]].mz ? 'MZ' : '?');
      const pts = g.map(c => { const t = 0.5; const top = Y(c) - topOff(P[c]); return [att[c] + (X(c) - att[c]) * t, sibY + (top - sibY) * t]; });
      const xa = Math.min(...pts.map(p => p[0])), xb = Math.max(...pts.map(p => p[0]));
      if (ty === 'MZ') LN.push(`M${xa},${pts[0][1]}H${xb}`);
      else if (ty === '?') qmarks.push([(xa + xb) / 2, pts[0][1] + 4]);
    });
  }
  // donatori: linea tratteggiata verso il partner piu' vicino della coppia
  for (const u of Object.values(S.unions)) (u.donors || []).forEach(dn => {
    if (!P[dn] || L.x[dn] == null) return;
    const pa = [u.a, u.b].filter(z => z && L.x[z] != null);
    if (!pa.length) return;
    const near = pa.reduce((best, z) => Math.abs(X(z) - X(dn)) < Math.abs(X(best) - X(dn)) ? z : best, pa[0]);
    const dir = X(dn) > X(near) ? 1 : -1;
    dash.push(`M${X(dn) - dir * halfW(P[dn])},${Y(dn)}L${X(near) + dir * halfW(P[near])},${Y(near)}`);
  });
  // persone senza partner con «nessun figlio» / infertili
  for (const id of Object.keys(P)) {
    const p = P[id]; if (!p.noKids || L.x[id] == null) continue;
    const x0 = X(id), y0 = Y(id) + halfW(p) + 6 + (L.lines[id].length * 13.5) + 4, by = y0 + 14;
    extra.push(`M${x0},${y0}V${by}M${x0 - 10},${by}H${x0 + 10}`); if (p.noKids === 'infertile') extra.push(`M${x0 - 10},${by + 5}H${x0 + 10}`);
  }
  out.push(`<path class="ln" d="${ln.join('')}"/>`);
  if (lnF.length) out.push(`<path class="ln draw" pathLength="1000" d="${lnF.join('')}"/>`);
  if (dash.length) out.push(`<path class="ln" stroke-dasharray="5 4" d="${dash.join('')}"/>`);
  if (extra.length) out.push(`<path class="ln" d="${extra.join('')}"/>`);
  qmarks.forEach(([qx, qy]) => out.push(`<text class="qm" x="${qx}" y="${qy}">?</text>`));
  badges.forEach(([bx, by]) => out.push(`<g class="pmab"><rect x="${bx - 15}" y="${by - 20}" width="30" height="13" rx="6.5"/><text x="${bx}" y="${by - 10.5}">PMA</text></g>`));
  // individuals
  for (const id of Object.keys(P)) {
    if (L.x[id] == null) continue;
    const p = P[id], x = X(id), y = Y(id);
    const d = shapePath(p, x, y);
    const isFresh = o.fresh && o.fresh.has(id);
    out.push(`<g class="pn${isFresh ? ' fresh' : ''}" data-id="${id}">`);
    const lines = L.lines[id];
    if (o.interactive) out.push(`<rect class="hit" x="${x - 34}" y="${y - 30}" width="68" height="${60 + lines.length * 13.5}"/>`);
    if (o.selected === id) out.push(`<rect class="sel" x="${x - 28}" y="${y - 28}" width="56" height="56" rx="6"/>`);
    if (o.interactive && memo && memo.pov === id) out.push(`<circle class="povring" cx="${x}" cy="${y}" r="35"><title>Riferimento attuale per le parentele</title></circle>`);
    out.push(`<g class="sym"><path class="sh${p.miscarriage && p.loss === 'BIO' ? ' bio' : ''}" d="${d}"/>`);
    const conds = p.conditions.slice(0, 4);
    if (conds.length) {
      out.push(`<clipPath id="cp-${sid}-${id}"><path d="${d}"/></clipPath><g clip-path="url(#cp-${sid}-${id})">`);
      const R = 23;
      const rects = conds.length === 1 ? [[x - R, y - R, 2 * R, 2 * R]]
        : conds.length === 2 ? [[x - R, y - R, R, 2 * R], [x, y - R, R, 2 * R]]
        : [[x - R, y - R, R, R], [x, y - R, R, R], [x - R, y, R, R], [x, y, R, R]];
      conds.forEach((c, i) => { const r = rects[i]; out.push(`<rect class="fill" x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" fill="${condColor(c.name)}"/>`); });
      out.push(`</g><path d="${d}" fill="none" stroke="#1B2433" stroke-width="1.9"/>`);
    }
    const port = E.portatoriDi ? E.portatoriDi(S, p, mappaPort) : [];
    if (port.length && !conds.length && !p.miscarriage) {
      const R = 24, TL = [x - R, y - R], BL = [x - R, y + R], BR = [x + R, y + R];
      const n = Math.min(port.length, 4);
      const lungo = (t) => [TL[0] + (BR[0] - TL[0]) * t, TL[1] + (BR[1] - TL[1]) * t];
      out.push(`<clipPath id="ch-${sid}-${id}"><path d="${d}"/></clipPath><g clip-path="url(#ch-${sid}-${id})">`);
      for (let i = 0; i < n; i++) {
        const p0 = lungo(i / n), p1 = lungo((i + 1) / n);
        out.push(`<path class="fill half" d="M${BL[0]},${BL[1]}L${p0[0]},${p0[1]}L${p1[0]},${p1[1]}Z" fill="${port[i].color}"><title>${esc('portatore: ' + port[i].label)}</title></path>`);
      }
      for (let i = 1; i < n; i++) { const q = lungo(i / n); out.push(`<path d="M${BL[0]},${BL[1]}L${q[0]},${q[1]}" stroke="#FFFFFF" stroke-width="1.8"/>`); }
      out.push(`</g><path d="M${TL[0]},${TL[1]}L${BR[0]},${BR[1]}" clip-path="url(#ch-${sid}-${id})" stroke="#1B2433" stroke-width="1.3"/><path d="${d}" fill="none" stroke="#1B2433" stroke-width="1.9"/>`);
      if (port.length > 4) out.push(`<text class="pmore" x="${x + halfW(p) + 3}" y="${y + h - 2}">+${port.length - 4}</text>`);
    }
    if (port.length && (conds.length || p.miscarriage)) {
      port.slice(0, 4).forEach((c, i) => { const bx = x + halfW(p) + 4, by = y + h - 10 - i * 12; out.push(`<g class="pbadge"><title>${esc('portatore: ' + c.label)}</title><rect x="${bx}" y="${by}" width="9" height="9" fill="#FFFFFF" stroke="#1B2433" stroke-width="1"/><path d="M${bx},${by}L${bx},${by + 9}L${bx + 9},${by + 9}Z" fill="${c.color}"/></g>`); });
    }
    if (o.warns && o.warns.has(id)) out.push(`<g class="wbadge"><circle cx="${x - halfW(p) - 7}" cy="${y - h + 1}" r="7.5"/><text x="${x - halfW(p) - 7}" y="${y - h + 5}">!</text></g>`);
    if (p.presympt) out.push(`<path class="ln" style="stroke-width:2" d="M${x},${y - topOff(p) + 3}V${y + topOff(p) - 3}"/>`);
    if ((p.variants || []).some(v => !v.neg && !v.carrier)) out.push(`<text class="vplus" x="${x + halfW(p) + 3}" y="${y - h + 9}">+</text>`);
    if (p.pregnancy) out.push(`<text class="pin" x="${x}" y="${y + 5}">P</text>`);
    if (p.donor) out.push(`<text class="pin" x="${x}" y="${y + 5}">${p.donor === 'surrogata' ? 'S' : 'D'}</text>`);
    if (p.miscarriage && p.loss === 'ECT') out.push(`<text class="pin sm" x="${x}" y="${y + 8}">E</text>`);
    if (p.deceased || p.top) { const k = p.miscarriage ? 17 : 26; out.push(`<path class="ln" style="stroke-width:1.9" d="M${x - k},${y + k}L${x + k},${y - k}"/>`); }
    if (p.stillborn) out.push(`<text class="pin" x="${x}" y="${y + 5}" style="font-size:12px">SB</text>`);
    if (p.adopted) out.push(`<path class="ln" d="M${x - 26},${y - 25}h-5v50h5M${x + 26},${y - 25}h5v50h-5"/>`);
    out.push('</g>');
    if (id === S.probandId) {
      out.push(`<path class="ln" style="stroke-width:1.9" d="M${x - 50},${y + 42}L${x - 25},${y + 22}"/><path d="M${x - 22},${y + 19.5}l-10.5,3.2l5.2,5.6Z" fill="#1B2433"/>`);
      out.push(`<text class="pp" x="${x - 62}" y="${y + 50}">P</text>`);
    }
    out.push(`<circle class="halo" cx="${x}" cy="${y}" r="28"/>`);
    lines.forEach((l, i) => {
      let fill = l.c === 'cd' ? ` style="fill:${condColor(l.k)}"` : '';
      if ((l.c === 'cr' || l.c === 'vr') && l.k && E.portatoriDi) { const it = E.portatoriDi(S, p, mappaPort).find(z => z.label === l.k || z.key === l.k); if (it && it.color !== '#4A5563') fill = ` style="fill:${it.color}"`; }
      out.push(`<text class="lb ${l.c}" x="${x}" y="${(y + h + 16 + i * 13.5).toFixed(1)}"${fill}>${esc(l.t)}</text>`);
    });
    out.push(`</g>`);
  }
  const note = E.reproRiassunto ? E.reproRiassunto(S) : [];
  if (noteLinee.length) {
    const ny0 = L.height + PADT + 40;
    out.push(`<g class="notegen" data-notegen="1"><text class="sub" x="${PADL}" y="${ny0}">Note</text>`);
    noteLinee.forEach((t, i) => out.push(`<text class="fn" x="${PADL + (/^ {3}/.test(t) ? 10 : 0)}" y="${ny0 + 18 + i * 16}">${esc(t.trim())}</text>`));
    out.push(`</g>`);
  }
  if (legendRows) {
    let ly = L.height + PADT + 40 + noteH;
    out.push(`<text class="sub" x="${PADL}" y="${ly}">Legenda</text>`);
    vociLeg.forEach((c, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const lx = PADL + col * 240, yy = ly + 14 + row * 22;
      const m = c.m;
      out.push((c.port ? `<rect x="${lx}" y="${yy}" width="13" height="13" fill="#FFFFFF" stroke="#1B2433" stroke-width="1"/><path d="M${lx},${yy}L${lx},${yy + 13}L${lx + 13},${yy + 13}Z" fill="${c.color}"/>` : `<rect x="${lx}" y="${yy}" width="13" height="13" fill="${c.color}"/>`) + `<text class="lg" x="${lx + 20}" y="${yy + 11}">${esc(c.nome)}${m ? ` <tspan class="inh">(${E.MODI[m].breve})</tspan>` : ''}</text>`);
    });
  }
  if (noteRows) {
    let ny = L.height + PADT + 40 + noteH + (legendRows ? 30 + legendRows * 22 : 0);
    out.push(`<text class="sub" x="${PADL}" y="${ny}">Storia riproduttiva</text>`);
    note.forEach((nn, i) => out.push(`<text class="fn" x="${PADL}" y="${ny + 17 + i * 17}">${esc((L.labels[nn.a] || '') + ' × ' + (L.labels[nn.b] || '') + ': ' + nn.testo)}</text>`));
  }
  out.push('</svg>');
  return { svg: out.join(''), W, H };
}

/* ---------- canvas ---------- */
function render() {
  const L = E.layout(S);
  const stage = $('#stage');
  const base = svgFor(L, {});
  let z = zoom.z;
  if (zoom.mode === 'fit') {
    const aw = stage.clientWidth - 24, ah = stage.clientHeight - 24;
    z = Math.min(1.15, aw / base.W, ah / base.H);
    const floor = window.innerWidth < 700 ? 0.62 : 0.4;
    if (z < floor) z = Math.max(floor, Math.min(1.15, aw / base.W));
    zoom.z = z;
  }
  let warns = new Set();
  try { warns = new Set(E.verifica(S).filter(v => v.level === 'warn').map(v => v.id)); } catch (e) {}
  const r = svgFor(L, { interactive: true, fresh, selected, z, warns });
  $('#sheet').innerHTML = r.svg;
  $('#zoomval').textContent = Math.round(z * 100) + '%';
  renderLegend();
  renderLog(L);
  $('#undo').disabled = !undoStack.length;
  $('#redo').disabled = !redoStack.length;
  const p0 = S.people[S.probandId];
  const empty = Object.keys(S.people).length === 1 && !p0.conditions.length && !p0.age && p0.sex === 'U';
  $('#emptyhint').hidden = !empty;
  if (document.activeElement !== $('#code')) $('#code').value = S.code || '';
}
function renderLegend() {
  const el = $('#legend');
  el.onclick = ev => {
    const w = ev.target.closest('[data-warns]'); if (w) { const lst = el.querySelector('.warnlist'); if (lst) lst.hidden = !lst.hidden; return; }
    const b = ev.target.closest('[data-sel]'); if (b && S.people[b.dataset.sel]) openEditor(b.dataset.sel);
  };
  const note = E.reproRiassunto ? E.reproRiassunto(S) : [];
  let nw = 0; try { nw = E.verifica(S).filter(v => v.level === 'warn').length; } catch (e) {}
  const mp = E.mappaPortatori ? E.mappaPortatori(S) : {};
  if (!S.conditions.length && !Object.keys(mp).length && !note.length && !nw) { el.hidden = true; el.innerHTML = ''; return; }
  el.hidden = false;
  const L = E.layout(S);
  let warns = [];
  try { warns = E.verifica(S).filter(v => v.level === 'warn'); } catch (e) {}
  const conPort = Object.values(S.people).some(p => p.carriers.length || (p.variants || []).some(v => v.carrier && !v.neg));
  el.innerHTML = S.conditions.map(c => { const m = E.modoDi(S, c.name); return `<span class="lgi"><i style="background:${c.color}"></i>${esc(c.name)}${m ? `<em class="inh" title="${esc(E.MODI[m].nome)}">${E.MODI[m].breve}</em>` : ''}</span>`; }).join('')
    + Object.entries(mp).map(([g, m]) => `<span class="lgi" title="Portatori di ${esc(g)}"><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="1" y="1" width="12" height="12" fill="#FFFFFF" stroke="currentColor" stroke-width="1.3"/><path d="M1,1L1,13L13,13Z" fill="${m.colore}"/></svg>${esc(m.varianti.join(', '))}<em class="inh">portatori</em></span>`).join('')
    + (Object.values(S.people).some(p => p.presympt) ? `<span class="lgi lgkey"><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="1" y="1" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M7,2.5V11.5" stroke="currentColor" stroke-width="1.6"/></svg>presintomatico</span>` : '')
    + (conPort ? `<span class="lgi lgkey"><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="1" y="1" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M1,1L1,13L13,13Z" fill="currentColor"/></svg>portatore</span>` : '')
    + (warns.length ? `<span class="lgi lgwarn" data-warns="1"><b>!</b>${warns.length === 1 ? '1 dato da verificare' : warns.length + ' dati da verificare'}</span>` + `<div class="warnlist" hidden>${warns.map(w => `<button type="button" data-sel="${w.id}">${esc(w.text.replace(/⟨(p\d+)⟩/g, (mm, x) => L.labels[x] || ''))}</button>`).join('')}</div>` : '')
    + note.map(nn => `<span class="lgi pmanote" data-sel="${nn.a || nn.b}"><b>PMA</b> ${esc((L.labels[nn.a] || '') + ' × ' + (L.labels[nn.b] || ''))}: ${esc(nn.testo)}</span>`).join('');
}
function renderLog() {
  renderPov();
  const el = $('#log');
  if (!log.length) { el.innerHTML = `<p class="lognote">Qui vedrai come ho interpretato ogni frase.</p>`; return; }
  const glyph = { ok: '✓', warn: '!', err: '×', fix: '↺', ai: '✦', tip: 'i', ans: '↳' };
  const top = cmdTop();
  el.innerHTML = log.map((e, i) => e.thinking ? `<div class="entry latest thinking"><div class="cmd">${esc(e.cmd)}</div><div class="it ai"><b aria-hidden="true">✦</b><span class="shimmer">L\u2019AI sta interpretando la frase<i class="dots"><i>.</i><i>.</i><i>.</i></i></span></div></div>` : `<div class="entry${i === 0 ? ' latest' : ''}${e.ai ? ' aientry' : ''}${e.annullata ? ' annullata' : ''}"><div class="cmd">${esc(e.cmd)}${i === 0 && top && top.entry === e ? `<button type="button" class="undolink" data-indietro="1" title="Annulla questa modifica e rimetti la frase nella casella">↶ annulla e riscrivi</button>` : ''}</div>${e.items.map(it => `<div class="it ${it.type}"><b aria-hidden="true">${glyph[it.type] || '·'}</b><span>${esc(it.text)}</span></div>`).join('')}${(e.asks || []).map((a, k) => `<div class="ask${a.done ? ' done' : ''}"><div class="askq"><b aria-hidden="true">?</b>${esc(a.text)}</div>${a.done ? `<div class="askd">Scelto: ${esc(a.done)}</div>` : `<div class="askb">${a.options.map((o, j) => `<button type="button" data-ask="${i}|${k}|${j}">${esc(o.label)}</button>`).join('')}</div>`}</div>`).join('')}</div>`).join('');
}

/* ---------- AI ---------- */
let aiCtl = null, aiDomanda = null, cmdStack = [];
function contestoAI() {
  const righe = [];
  const L = E.layout(S).labels;
  if (memo && memo.pending && (memo.pending.asks || []).length) memo.pending.asks.slice(0, 2).forEach(a => righe.push('Domanda del programma ancora aperta: «' + resolveLabels(a.text, L) + '». Opzioni: ' + a.options.map(o => '«' + resolveLabels(o.label, L) + '» = ' + o.cmd).join(' | ') + (a.open ? ' | risposta libera: ' + a.open.tmpl : '')));
  if (memo && memo.pov && S.people[memo.pov]) righe.push('Riferimento attuale per le parentele: @' + memo.pov + ' (le parentele senza «di …» sono riferite a questa persona, non al probando).');
  if (aiDomanda) righe.push('Nel turno precedente TU hai chiesto: «' + aiDomanda.domanda + '» a proposito della frase «' + aiDomanda.frase + '». La frase attuale è con ogni probabilità la risposta: uniscila a quella frase e restituisci i comandi, senza chiedere di nuovo.');
  const prec = log.filter(e => !e.thinking).slice(0, 3).map(e => e.cmd).filter(Boolean);
  if (prec.length) righe.push('Frasi precedenti (dalla più recente): ' + prec.map(x => '«' + x + '»').join(' '));
  return righe.join('\n');
}
function serveAI(R) { return R.log.some(l => l.type === 'err' || /Non ho capito|Ho ignorato|Non capisco/.test(l.text)) || (!R.log.length && !(R.asks || []).length); }
async function submit(text) {
  text = text.trim(); if (!text) return;
  const A = window.PedAI;
  if (!A || !A.cfg.on || !A.disponibile() || aiCtl) return apply(text);
  if (A.cfg.mode === 'fallback') {
    const prova = E.run(JSON.parse(JSON.stringify(S)), text, E.layout(S).labels, memo ? JSON.parse(JSON.stringify(memo)) : null);
    if (prova.undo || prova.reset || !serveAI(prova)) return apply(text);
  }
  const L0 = E.layout(S);
  aiCtl = new AbortController();
  const pending = { cmd: text, items: [], thinking: true };
  log.unshift(pending); renderLog(); setAIBusy(true);
  let out = null, err = null;
  const ctxAI = contestoAI(), domPrima = aiDomanda;
  try { out = await A.traduci(text, S, E, aiCtl.signal, ctxAI); } catch (e) { err = e; }
  const i = log.indexOf(pending); if (i >= 0) log.splice(i, 1);
  aiCtl = null; setAIBusy(false);
  if (err) {
    const msg = A.messaggioErrore(err);
    if (err.code === 'cancelled' || err.name === 'AbortError') { log.unshift({ cmd: text, items: [{ type: 'warn', text: msg }] }); render(); return; }
    apply(text, null, { aiItems: [{ type: 'warn', text: msg + ' Ho usato l\u2019interprete interno.' }] });
    return;
  }
  const leggibile = c => c.replace(/@(p\d+)/g, (m, id) => L0.labels[id] || m);
  aiDomanda = !out.comandi.length && out.domanda ? { domanda: out.domanda, frase: domPrima ? domPrima.frase + ' → ' + text : text } : null;
  if (!out.comandi.length) {
    log.unshift({ cmd: text, items: [{ type: 'ai', text: out.domanda ? 'L\u2019AI chiede: ' + out.domanda : 'L\u2019AI non ha trovato nulla da eseguire in questa frase.' }], ai: true });
    render(); return;
  }
  apply(out.comandi.join('; '), text, { aiItems: [{ type: 'ai', text: 'Interpretata con AI: ' + out.comandi.map(c => '«' + leggibile(c) + '»').join('  ') }] });
}
function setAIBusy(b) {
  document.body.classList.toggle('ai-busy', b);
  const send = document.querySelector('#composer .send'); if (send) send.textContent = b ? 'Ferma' : 'Applica';
}
function aiLabel() {
  const A = window.PedAI; const b = $('#aibtn'); if (!A || !b) return;
  const on = A.cfg.on && A.disponibile();
  b.classList.toggle('on', on);
  b.setAttribute('aria-pressed', String(on));
  b.innerHTML = `<span class="aidot"></span>AI ${on ? (A.cfg.mode === 'always' ? 'sempre' : 'se serve') : 'spenta'}`;
}
function aiSettings() {
  const A = window.PedAI; const c = A.cfg;
  const d = $('#aidlg');
  const opt = (v, t, dis) => `<option value="${v}"${c.provider === v ? ' selected' : ''}${dis ? ' disabled' : ''}>${t}</option>`;
  d.innerHTML = `<div class="aibox" role="dialog" aria-modal="true" aria-label="Impostazioni AI">
    <div class="edhead"><b>Interpretazione con AI</b><button type="button" class="ghost" data-aiclose>Chiudi</button></div>
    <div class="edbody">
      <label class="chk"><input type="checkbox" id="ai-on" ${c.on ? 'checked' : ''}> Usa l'AI per capire le frasi</label>
      <label>Quando<select id="ai-mode"><option value="fallback"${c.mode === 'fallback' ? ' selected' : ''}>solo quando l'interprete interno non capisce</option><option value="always"${c.mode === 'always' ? ' selected' : ''}>sempre</option></select></label>
      <label>Servizio<select id="ai-prov">${opt('anthropic', 'Claude (chiave API Anthropic)')}${opt('openai', 'ChatGPT (chiave API OpenAI)')}${opt('gemini', 'Gemini (chiave API Google AI Studio)')}</select></label>
      ${A.insideClaude ? `<p class="note">Qui dentro Claude si usa il tuo account claude.ai: la prima volta ti chiede il permesso. Le chiavi API personali di Claude o ChatGPT funzionano nel file scaricato e nel software installato, perché questa pagina non può contattare altri servizi.</p>` : ''}
      <div id="ai-keyrow" ${c.provider === 'claude' ? 'hidden' : ''}>
        <label>Chiave API<input id="ai-key" type="password" autocomplete="off" value="${(c.key || '').replace(/"/g, '&quot;')}" placeholder="${c.provider === 'openai' ? 'sk-…' : c.provider === 'gemini' ? 'AIza…' : 'sk-ant-…'}"></label>
        <label>Modello<input id="ai-model" value="${(c.model || '').replace(/"/g, '&quot;')}" placeholder="${A.modelli[c.provider] || ''}"></label>
        <p class="note">La chiave resta solo su questo tablet. Il modello si può lasciare vuoto. Senza rete l\u2019AI non si usa e lavora l\u2019interprete interno.</p>${c.provider === 'gemini' ? '<p class="note avviso">Con la chiave gratuita di Gemini Google può usare i testi inviati per migliorare i suoi modelli: per i pazienti reali usa un piano a pagamento.</p>' : ''}
      </div>
      <p class="note privacy">Cosa viene inviato: la frase che scrivi e una descrizione della famiglia senza nomi né codice consulenza (sigle, parentele, sesso, età, malattie, varianti). Se nella frase scrivi un nome, viene inviato anche quello.</p>
      <p class="note">L'AI traduce la frase in comandi; è sempre l'interprete interno a eseguirli, e nel registro vedi esattamente cosa ha fatto.</p>
    </div></div>`;
  d.hidden = false;
  const salva = () => { A.salva({ on: $('#ai-on').checked, mode: $('#ai-mode').value, provider: $('#ai-prov').value, key: ($('#ai-key') || {}).value || c.key, model: ($('#ai-model') || {}).value || '' }); aiLabel(); };
  d.querySelectorAll('input,select').forEach(el => el.addEventListener('change', () => { salva(); if (el.id === 'ai-prov') aiSettings(); }));
  d.querySelector('[data-aiclose]').onclick = () => { salva(); d.hidden = true; };
  d.onclick = ev => { if (ev.target === d) { salva(); d.hidden = true; } };
}

/* ---------- commands ---------- */
function resolveLabels(t, labels) { return t.replace(/⟨(p\d+)⟩/g, (m, id) => labels[id] || '—'); }
function apply(text, shown, extra) {
  text = text.trim(); if (!text) return;
  const before = JSON.stringify(S);
  const L0 = E.layout(S);
  const R = E.run(S, text, L0.labels, memo);
  memo = R.memo;
  if (R.undo) {
    const r = annullaUltimo();
    log.unshift({ cmd: shown || text, items: [{ type: r ? 'ok' : 'warn', text: r ? 'Annullata l\u2019ultima modifica' + (r.cmd ? ' («' + r.cmd + '»)' : '') : 'Niente da annullare' }] });
    render(); save();
    if (R.rest) apply(R.rest);
    return;
  }
  if (R.reset) {
    pushUndo(before); S = E.newState(); selected = null; closeEditor();
    log.unshift({ cmd: text, items: [{ type: 'ok', text: 'Nuovo pedigree. Puoi annullare con ↶.' }] });
    render(); save(); return;
  }
  const changed = JSON.stringify(S) !== before;
  if (changed) { pushUndo(before); cmdStack.push({ depth: undoStack.length, cmd: shown && /^Scelta:/.test(shown) ? '' : (shown || text), entry: null }); if (cmdStack.length > 150) cmdStack.shift(); }
  const L1 = E.layout(S);
  const items = R.log.map(it => ({ type: it.type, text: resolveLabels(it.text, L1.labels) }));
  const asks = (R.asks || []).map(a => ({ text: resolveLabels(a.text, L1.labels), options: a.options.map(o => Object.assign({}, o, { label: resolveLabels(o.label, L1.labels) })), done: '' }));
  if (!items.length && !asks.length) items.push({ type: 'warn', text: 'Nessuna modifica.' });
  if (extra && extra.aiItems) items.unshift(...extra.aiItems);
  if (R.answered) {
    const cerca = [resolveLabels(R.answered.text, L0.labels), resolveLabels(R.answered.text, L1.labels)], lab = resolveLabels(R.answered.label || '', L1.labels);
    let a = null;
    for (const e of log) { a = (e.asks || []).find(x => !x.done && cerca.includes(x.text)); if (a) break; }
    if (!a) { const e = log.find(e => (e.asks || []).some(x => !x.done)); if (e) a = e.asks.find(x => !x.done); }
    if (a) a.done = lab;
  }
  log.unshift({ cmd: shown || text, items, asks, ai: !!(extra && extra.aiItems) });
  if (log.length > 80) log.length = 80;
  if (changed && cmdStack.length) cmdStack[cmdStack.length - 1].entry = log[0];
  if (R.vocabNuovo) vocabSalva(R.vocabNuovo);
  fresh = new Set([...R.created, ...R.touched]);
  render(); save();
  if (selected && S.people[selected]) openEditor(selected); else closeEditor();
  ensureVisible([...R.created, ...R.touched]);
  clearTimeout(apply._t);
  apply._t = setTimeout(() => { fresh = new Set(); }, 1700);
}

function ensureVisible(ids) {
  const st = $('#stage'); const sr = st.getBoundingClientRect();
  const rects = ids.map(id => document.querySelector(`.pn[data-id="${id}"] .sh`)).filter(Boolean).map(e => e.getBoundingClientRect());
  if (!rects.length) return;
  const l = Math.min(...rects.map(r => r.left)), r = Math.max(...rects.map(r => r.right));
  const t = Math.min(...rects.map(r => r.top)), b = Math.max(...rects.map(r => r.bottom));
  let dx = 0, dy = 0;
  if (l < sr.left + 20 || r > sr.right - 20) dx = (l + r) / 2 - (sr.left + sr.right) / 2;
  if (t < sr.top + 20 || b > sr.bottom - 60) dy = (t + b) / 2 - (sr.top + sr.bottom) / 2;
  if (dx || dy) st.scrollBy({ left: dx, top: dy, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
window.PedApp = { exportSVG: () => svgFor(E.layout(S), { exp: true }) };

function cmdTop() {
  while (cmdStack.length && cmdStack[cmdStack.length - 1].depth > undoStack.length) cmdStack.pop();
  const t = cmdStack[cmdStack.length - 1];
  return t && t.depth === undoStack.length ? t : null;
}
function annullaUltimo() {
  const t = cmdTop();
  if (!doUndo()) return null;
  if (t) { const i = cmdStack.indexOf(t); if (i >= 0) cmdStack.splice(i, 1); if (t.entry) t.entry.annullata = true; }
  if (memo) memo.pending = null;
  return { cmd: t ? t.cmd : '' };
}
function indietro() {
  if (aiCtl) return;
  const r = annullaUltimo();
  log.unshift({ cmd: '↶ Indietro', items: [r ? { type: 'ok', text: 'Annullata l\u2019ultima modifica' + (r.cmd ? ': la frase è di nuovo nella casella, correggila e premi Applica.' : '.') } : { type: 'warn', text: 'Niente da annullare.' }] });
  renderLog();
  const ta = $('#cmd');
  if (r && r.cmd && ta) { ta.value = r.cmd; ta.dispatchEvent(new Event('input', { bubbles: true })); ta.focus(); try { ta.setSelectionRange(ta.value.length, ta.value.length); } catch (e) {} }
}
document.addEventListener('click', ev => { if (ev.target.closest && ev.target.closest('#indietro, [data-indietro]')) { ev.preventDefault(); indietro(); } });
function renderPov() {
  let el = $('#povchip');
  if (!el) { const c = $('#composer'); if (!c) return; el = document.createElement('div'); el.id = 'povchip'; c.parentNode.insertBefore(el, c); }
  const id = memo && memo.pov && S.people[memo.pov] ? memo.pov : null;
  if (!id) { el.hidden = true; el.innerHTML = ''; return; }
  const L = E.layout(S);
  const k = E.kinWord(S, id);
  el.hidden = false;
  el.innerHTML = `<span>Parentele riferite a <b>${esc(L.labels[id] || '')}</b>${k ? ' (' + esc(k) + ')' : ''}</span><button type="button" class="ghost small" data-povoff="1">Torna al probando</button>`;
}
function apriNote() {
  const d = $('#aidlg');
  d.innerHTML = `<div class="aibox" role="dialog" aria-modal="true" aria-label="Note generali">
    <div class="edhead"><b>Note generali</b><button type="button" class="ghost" data-noteclose>Chiudi</button></div>
    <div class="edbody"><p class="note">Compaiono in basso a sinistra sotto l\u2019albero, anche nella stampa e nell\u2019esportazione. Una nota per riga. Puoi anche scrivere «nota generale: …» nella casella dei comandi.</p>
      <textarea id="notegen-t" rows="8" style="width:100%">${esc((S.noteGen || []).join('\n'))}</textarea>
      <div class="acts-row"><button type="button" class="send" data-notesave>Salva note</button></div></div></div>`;
  d.hidden = false;
  const chiudi = () => { d.hidden = true; d.innerHTML = ''; };
  d.querySelector('[data-noteclose]').onclick = chiudi;
  d.onclick = ev => { if (ev.target === d) chiudi(); };
  d.querySelector('[data-notesave]').onclick = () => { const v = $('#notegen-t').value.split('\n').map(x => x.trim()).filter(Boolean); mutate(() => { S.noteGen = v; }); chiudi(); };
  setTimeout(() => { const t = $('#notegen-t'); if (t) t.focus(); }, 30);
}
const VOCAB_KEY = 'pedigree-vocabolario.v1';
function vocabCarica() {
  try { E.aggiungiVocabolario && E.aggiungiVocabolario(JSON.parse(localStorage.getItem(VOCAB_KEY) || '{}')); } catch (e) {}
  if (window.PedApp && window.fetch) fetch('/api/vocabolario', { credentials: 'same-origin' }).then(r => r.ok ? r.json() : null).then(v => { if (v && E.aggiungiVocabolario) E.aggiungiVocabolario(v); }).catch(() => {});
}
function vocabSalva(nuovo) {
  if (!nuovo) return;
  try { const v = JSON.parse(localStorage.getItem(VOCAB_KEY) || '{}'); ['geni', 'malattie'].forEach(k => { v[k] = [...new Set([...(v[k] || []), ...(nuovo[k] || [])])]; }); localStorage.setItem(VOCAB_KEY, JSON.stringify(v)); } catch (e) {}
  if (window.PedApp && window.fetch) fetch('/api/vocabolario', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify(nuovo) }).catch(() => {});
}
vocabCarica();
document.addEventListener('click', ev => {
  const t = ev.target.closest ? ev.target : null; if (!t) return;
  if (t.closest('[data-povoff]')) { ev.preventDefault(); apply('torna al probando'); return; }
  const ps = t.closest('[data-povset]'); if (ps) { ev.preventDefault(); apply('collocati su @' + ps.dataset.povset); return; }
  if (t.closest('#notebtn') || t.closest('[data-notegen]')) { ev.preventDefault(); ev.stopPropagation(); apriNote(); }
}, true);
/* ---------- editor sheet ---------- */
function openEditor(id) {
  const p = S.people[id]; if (!p) return;
  selected = id;
  const L = E.layout(S);
  const ed = $('#editor');
  const sexBtn = (v, t) => `<button type="button" class="seg${p.sex === v ? ' on' : ''}" data-sex="${v}" aria-pressed="${p.sex === v}">${t}</button>`;
  const selModo = (nome) => { const m = E.modoDi(S, nome); return `<select class="inhsel" data-inh="${esc(nome)}" aria-label="Modalità di trasmissione di ${esc(nome)}" title="Modalità di trasmissione (vale per tutta la famiglia)"><option value="">trasmissione?</option>${Object.entries(E.MODI).map(([k, v]) => `<option value="${k}"${m === k ? ' selected' : ''}>${v.breve} · ${v.nome}</option>`).join('')}</select>`; };
  const conds = p.conditions.map((c, i) => `<div class="crow wrap"><button type="button" class="sw" data-cyc="${esc(c.name)}" style="background:${condColor(c.name)}" aria-label="Cambia colore di ${esc(c.name)}"></button><span class="cn">${esc(c.name)}</span><input class="cage" data-ci="${i}" inputmode="numeric" placeholder="età dx" value="${esc(c.age || '')}" aria-label="Età alla diagnosi"><button type="button" class="x" data-rmc="${i}" aria-label="Togli ${esc(c.name)}">×</button>
    <div class="crow2">${selModo(c.name)}<label class="dn"><input type="checkbox" data-dn="${i}" ${c.denovo ? 'checked' : ''}> de novo</label></div></div>`).join('');
  ed.innerHTML = `
  <div class="edhead"><div><span class="edid">${L.labels[id]}</span>${id === S.probandId ? '<span class="tag">probando</span>' : ''}${memo && memo.pov === id ? '<span class="tag pov">riferimento</span>' : ''}</div><button type="button" class="ghost" id="edclose">Chiudi</button></div>
  ${id !== S.probandId && !(memo && memo.pov === id) ? `<div class="povrow"><button type="button" class="small" data-povset="${id}" title="Le parentele che scrivi («la zia», «aggiungi un fratello») saranno riferite a questa persona">Descrivi la famiglia da questa persona</button></div>` : ''}
  <div class="edbody">
    <div class="segs" role="group" aria-label="Sesso">${sexBtn('M', 'Maschio')}${sexBtn('F', 'Femmina')}${sexBtn('U', 'Non noto')}</div>
    ${gravBlock(id)}${donorBlock(id)}
    <div class="grid2">
      <label>Nome<input id="f-name" value="${esc(p.name)}" autocomplete="off"></label>
      <label>Età<input id="f-age" value="${esc(p.age)}" placeholder="es. 45"></label>
    </div>
    <div class="grid2">
      <label class="chk"><input type="checkbox" id="f-dec" ${p.deceased ? 'checked' : ''}> Deceduto</label>
      <label>Età al decesso<input id="f-dage" value="${esc(p.deathAge)}" inputmode="numeric" ${p.deceased ? '' : 'disabled'}></label>
    </div>
    ${familyBlock(id)}
    <label>Cariotipo / citogenetica<input id="f-karyo" value="${esc(p.karyo || '')}" placeholder="es. 46,XX,t(11;22)(q23;q11.2) oppure «traslocazione 11;22 bilanciata»" autocomplete="off"></label>
    <div class="blk"><div class="blkt">Condizioni</div>${conds || '<p class="note">Nessuna</p>'}
      <div class="addc"><input id="f-newc" list="condlist" placeholder="Aggiungi condizione"><input id="f-newca" class="cage" inputmode="numeric" placeholder="età dx"><button type="button" id="f-addc" class="small">Aggiungi</button></div>
      <datalist id="condlist">${[...new Set([...S.conditions.map(c => c.name), ...(E.nomiMalattie ? E.nomiMalattie() : [])])].map(c => `<option value="${esc(c)}">`).join('')}</datalist>
    </div>
    <div class="blk"><div class="blkt">Varianti e test genetici</div>${(p.variants || []).map((v, i) => { const st = v.neg ? 'neg' : v.carrier ? 'car' : (v.zyg || 'het'); const o = (k, t) => `<option value="${k}"${st === k ? ' selected' : ''}>${t}</option>`;
        const hg = E.hgvsDi ? E.hgvsDi(v.text) : ''; const pc = v.carrier && !v.neg && E.portatoriDi ? (E.portatoriDi(S, p).find(z => z.label === v.text) || {}).color : '';
        return `<div class="crow">${pc ? `<span class="dot half" style="--c:${pc}"></span>` : ''}<span class="cn vtxt">${esc(v.text)}${v.cls ? ` <span class="tag">${esc(v.cls)}</span>` : ''}${hg ? `<span class="hgvs">${esc(hg)}</span>` : ''}</span><select data-vz="${i}" aria-label="Esito">${o('het', 'eterozigote')}${o('car', 'portatore (metà simbolo)')}${o('omo', 'omozigote')}${o('emi', 'emizigote')}${o('comp', 'et. composto')}${o('neg', 'negativo')}</select><button type="button" class="x" data-rmv="${i}" aria-label="Togli ${esc(v.text)}">×</button></div>`; }).join('') || '<p class="note">Nessuna</p>'}
      <div class="addc"><input id="f-newv" placeholder="es. CFTR F508del"><button type="button" id="f-addv" class="small">Aggiungi</button></div>
    </div>
    <div class="blk"><div class="blkt">Portatore (metà simbolo colorata)</div>
      ${p.carriers.map((c, i) => `<div class="crow"><span class="dot" style="background:${c ? condColor(c) : '#1B2433'}"></span><span class="cn">${c ? esc(c) : 'portatore (condizione non specificata)'}</span><button type="button" class="x" data-rmcar="${i}" aria-label="Non più portatore">×</button></div>`).join('') || '<p class="note">Non portatore</p>'}
      <div class="addc"><input id="f-newcar" list="condlist" placeholder="es. fibrosi cistica"><button type="button" id="f-addcar" class="small">Aggiungi</button></div>
    </div>
    <label class="chk"><input type="checkbox" id="f-presympt" ${p.presympt ? 'checked' : ''}> Asintomatico / presintomatico (linea verticale)</label>
    <div class="grid2">
      <label class="chk"><input type="checkbox" id="f-prob" ${id === S.probandId ? 'checked disabled' : ''}> Probando</label>
      <label>Adozione<select id="f-adopt"><option value="">—</option><option value="in"${p.adopted === 'in' || p.adopted === true ? ' selected' : ''}>adottato</option><option value="out"${p.adopted === 'out' ? ' selected' : ''}>dato in adozione</option></select></label>
    </div>
    <label>Nota<input id="f-note" value="${esc(p.note || '')}" placeholder="es. concepito con ovodonazione, rifiuta il test"></label>
    ${pmaBlock(id, L)}
    ${twinBlock(id, L)}
    ${linksBlock(id, L)}
    <div class="blk"><div class="blkt">Aggiungi a questa persona</div>
      <div class="quick">
        <button type="button" data-q="genitori">Genitori</button><button type="button" data-q="fratello">Fratello</button><button type="button" data-q="sorella">Sorella</button>
        <button type="button" data-q="figlio">Figlio</button><button type="button" data-q="figlia">Figlia</button><button type="button" data-q="partner">Partner</button>
        <button type="button" data-q="gemello">Gemello</button><button type="button" data-q="gemella">Gemella</button><button type="button" data-q="figligem">Figli gemelli</button>
        <button type="button" data-q="figliegem">Figlie gemelle</button><button type="button" data-q="patrigno">Nuovo partner del genitore</button><button type="button" data-q="aborto">Aborto spontaneo</button>
      </div>
    </div>
    <button type="button" class="danger" id="f-del">${id === S.probandId ? 'Il probando non si può eliminare' : 'Elimina questa persona'}</button>
    <p class="err" id="f-err" hidden></p>
  </div>`;
  ed.hidden = false; ed.classList.add('open');
  $('#scrim').hidden = false;
  render();
}
const ESITI = [['SAB', 'Aborto spontaneo'], ['BIO', 'Gravidanza biochimica'], ['ECT', 'Gravidanza ectopica'], ['MOLA', 'Mola vescicolare'], ['ITG', 'ITG (interruzione terapeutica)'], ['IVG', 'IVG (interruzione volontaria)'], ['SB', 'Nato morto'], ['PREG', 'Gravidanza in corso']];
const TAG_PMA = ['', 'PMA', 'FIVET', 'ICSI', 'IUI', 'PMA eterologa'];
function tipoGrav(p) { return p.pregnancy ? 'PREG' : p.stillborn ? 'SB' : p.loss === 'TOP' || p.top ? (p.topKind === 'IVG' ? 'IVG' : 'ITG') : (p.loss || 'SAB'); }
function gravBlock(id) {
  const p = S.people[id];
  if (!p.miscarriage && !p.pregnancy && !p.stillborn) return '';
  const t = tipoGrav(p);
  return `<div class="blk grav"><div class="blkt">Gravidanza</div>
    <div class="grid2"><label>Esito<select id="g-tipo">${ESITI.map(([k, l]) => `<option value="${k}"${k === t ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
      <label>Settimane<input id="g-ga" value="${esc(p.ga || '')}" placeholder="es. 12+3 sett."></label></div>
    <label>Concepimento<select id="g-pma">${TAG_PMA.map(k => `<option value="${k}"${(p.pma || '') === k ? ' selected' : ''}>${k || 'naturale / non indicato'}</option>`).join('')}</select></label>
    <label>Esami prenatali (uno per riga)<textarea id="g-pren" rows="2" placeholder="es. NIPT: alto rischio T21&#10;amniocentesi: 47,XY,+21">${esc((p.prenatal || []).join('\n'))}</textarea></label>
    <p class="note">La causa (es. Sindrome di Down) si indica in «Condizioni»: il triangolo si riempie.</p>
  </div>`;
}
function donorBlock(id) {
  const p = S.people[id];
  if (!p.donor) return '';
  const o = (k, l) => `<option value="${k}"${p.donor === k ? ' selected' : ''}>${l}</option>`;
  return `<div class="blk"><div class="blkt">Donatore</div><label>Tipo<select id="d-tipo">${o('ovociti', 'donatrice di ovociti')}${o('seme', 'donatore di seme')}${o('embrione', 'embrione donato')}${o('surrogata', 'gestante per altri')}</select></label><p class="note">L'età si indica nel campo «Età».</p></div>`;
}
function pmaBlock(id, L) {
  const p = S.people[id];
  if (p.miscarriage || p.pregnancy || p.donor) return '';
  const us = p.unions.map(u => S.unions[u]).filter(Boolean);
  if (!us.length) return `<details class="blk"><summary class="blkt">Storia riproduttiva / PMA</summary><p class="note">Serve un partner: usa «Partner» in «Aggiungi a questa persona», anche se non noto.</p></details>`;
  return us.map(u => {
    const q = u.a === id ? u.b : u.a, m = u.pma || { cicli: 0, tecnica: [], transfer: 0, falliti: 0, crio: 0, pgt: '', eterologa: '', note: [] };
    const num = (f, lab) => `<label>${lab}<input type="number" min="0" inputmode="numeric" data-pmaf="${u.id}|${f}" value="${m[f] || ''}"></label>`;
    const tec = k => `<label class="chk"><input type="checkbox" data-pmat="${u.id}|${k}" ${m.tecnica.includes(k) ? 'checked' : ''}> ${k}</label>`;
    const eo = (k, l) => `<option value="${k}"${(m.eterologa || '') === k ? ' selected' : ''}>${l}</option>`;
    const esiti = u.children.map(c => S.people[c]).filter(x => x && (x.miscarriage || x.pregnancy || x.stillborn));
    return `<details class="blk"${u.pma || esiti.length ? ' open' : ''}><summary class="blkt">Storia riproduttiva${q ? ' con ' + L.labels[q] : ''}${u.pma ? ' <span class="tag pmatag">PMA</span>' : ''}</summary>
      <div class="row3">${tec('FIVET')}${tec('ICSI')}${tec('IUI')}</div>
      <div class="g3s">${num('cicli', 'Cicli')}${num('transfer', 'Transfer')}${num('falliti', 'non riusciti')}${num('crio', 'Embrioni crio')}</div>
      <div class="grid2"><label>Eterologa<select data-pmaf="${u.id}|eterologa">${eo('', 'no')}${eo('ovociti', 'ovociti donati')}${eo('seme', 'seme di donatore')}${eo('embrione', 'embrioni donati')}</select></label>
        <label>PGT<input data-pmaf="${u.id}|pgt" value="${esc(m.pgt || '')}" placeholder="es. PGT-A, PGT-M per CFTR"></label></div>
      <label>Note<input data-pmaf="${u.id}|note" value="${esc((m.note || []).filter(x => x !== 'PMA').join('; '))}" placeholder="es. infertilità maschile, endometriosi"></label>
      <div class="blkt" style="margin-top:8px">Aggiungi un esito</div>
      <div class="grid2"><label>Settimane<input id="es-ga-${u.id}" placeholder="es. 8 sett."></label><label class="chk"><input type="checkbox" id="es-pma-${u.id}" ${u.pma ? 'checked' : ''}> da PMA</label></div>
      <div class="quick">${ESITI.map(([k, l]) => `<button type="button" data-esito="${u.id}|${k}">${l.replace(/ \(.*\)$/, '')}</button>`).join('')}
        <button type="button" data-adddon="${u.id}|ovociti">+ Donatrice ovociti</button><button type="button" data-adddon="${u.id}|seme">+ Donatore seme</button><button type="button" data-adddon="${u.id}|surrogata">+ Gestante per altri</button></div>
    </details>`;
  }).join('');
}
function familyBlock(id) {
  const p = S.people[id], pb = S.people[S.probandId];
  const fc = E.familyConditions(S), fv = E.familyVariants(S);
  if (!fc.length && !fv.length) return '';
  const isPb = id === S.probandId;
  const pbC = pb.conditions.map(c => c.name), pbV = (pb.variants || []).filter(v => !v.neg && v.text !== 'test').map(v => v.text);
  const has = n => p.conditions.some(c => c.name === n);
  const st = t => { const v = (p.variants || []).find(x => x.text === t); return !v ? '' : v.neg ? 'neg' : v.carrier ? 'car' : (v.zyg || 'het'); };
  const zb = (i, z, lab) => `<button type="button" class="zb${st(fv[i]) === z ? ' on' : ''}" data-fv="${i}" data-z="${z}" aria-pressed="${st(fv[i]) === z}">${lab}</button>`;
  return `<div class="blk fam"><div class="blkt">Nella famiglia${isPb ? '' : ' · rispetto al probando'}</div>
    ${fc.length ? `<div class="famrow"><span class="fl">Malattie</span><div class="chips">${fc.map((c, i) => `<button type="button" class="fchip${has(c) ? ' on' : ''}" data-fc="${i}" aria-pressed="${has(c)}"><i style="background:${condColor(c)}"></i>${esc(c)}</button>`).join('')}</div></div>
      ${!isPb && pbC.length ? `<button type="button" class="small likepb" data-likec="1">Affetto come il probando</button>` : ''}
      <div id="pickc" class="pick" hidden></div>` : ''}
    ${fv.length ? `<div class="famrow"><span class="fl">Varianti</span><div class="vlist">${fv.map((v, i) => `<div class="vrow"><span class="vtxt">${esc(v)}</span><span class="zbs">${zb(i, 'het', 'Etero')}${zb(i, 'car', 'Port.')}${zb(i, 'omo', 'Omo')}${zb(i, 'emi', 'Emi')}${zb(i, 'neg', 'Neg')}</span></div>`).join('')}</div></div>
      ${!isPb && pbV.length ? `<button type="button" class="small likepb" data-likev="1">Eterozigote come il probando</button>` : ''}
      <div id="pickv" class="pick" hidden></div>` : ''}
  </div>`;
}
function twinBlock(id, L) {
  const p = S.people[id];
  if (!p.parentUnion || p.miscarriage) return '';
  const sibs = S.unions[p.parentUnion].children.filter(c => c !== id && !S.people[c].miscarriage);
  if (!sibs.length) return '';
  const tw = p.twin ? sibs.filter(c => S.people[c].twin === p.twin) : [];
  const ty = p.twinType || (p.mz ? 'MZ' : '?');
  const tb = (v, lab) => `<button type="button" class="zb${p.twin && ty === v ? ' on' : ''}" data-tt="${v}">${lab}</button>`;
  return `<details class="blk"${p.twin ? ' open' : ''}><summary class="blkt">Gemelli</summary>
    ${tw.length ? `<p class="note">Gemello di ${tw.map(c => L.labels[c]).join(', ')}</p><div class="zbs wide">${tb('MZ', 'Monozigoti')}${tb('DZ', 'Dizigoti')}${tb('?', 'Non noto')}</div><button type="button" class="small" data-untwin="1">Non sono gemelli</button>`
      : `<div class="addc"><select id="f-twinwith"><option value="">Gemello di…</option>${sibs.map(c => `<option value="${c}">${L.labels[c]}${S.people[c].name ? ' ' + esc(S.people[c].name) : ''}</option>`).join('')}</select><select id="f-twintype"><option value="MZ">monozigoti</option><option value="DZ">dizigoti</option><option value="?">non noto</option></select><button type="button" class="small" data-twin="1">Collega</button></div>`}
  </details>`;
}
function linksBlock(id, L) {
  const p = S.people[id];
  const us = p.unions.map(u => S.unions[u]).filter(Boolean);
  const others = Object.keys(S.people).filter(x => x !== id && !S.people[x].miscarriage).sort((a, b) => (L.labels[a] || '').localeCompare(L.labels[b] || '', 'it', { numeric: true }));
  const opt = x => `<option value="${x}">${L.labels[x]}${S.people[x].name ? ' ' + esc(S.people[x].name) : ''}</option>`;
  const uf = (u, f, v, lab) => `<button type="button" class="zb${u[f] === v ? ' on' : ''}" data-uf="${u.id}|${f}|${v}">${lab}</button>`;
  return `<details class="blk"${us.some(u => u.separated || u.noKids || (L.consang && L.consang.has(u.id))) ? ' open' : ''}><summary class="blkt">Coppie e legami</summary>
    ${us.map(u => { const q = u.a === id ? u.b : u.a; const cons = L.consang && L.consang.has(u.id); return `<div class="urow"><div class="ut">con <b>${q ? L.labels[q] : '—'}</b>${cons ? ' <span class="tag">consanguinei</span>' : ''}</div>
      <div class="zbs">${uf(u, 'separated', 'separati', 'Separati')}${uf(u, 'separated', 'divorziati', 'Divorziati')}${u.children.length ? '' : uf(u, 'noKids', 'nessuno', 'Nessun figlio') + uf(u, 'noKids', 'infertile', 'Infertili')}</div></div>`; }).join('')}
    ${!us.length ? `<div class="zbs">${['nessuno', 'infertile'].map(v => `<button type="button" class="zb${p.noKids === v ? ' on' : ''}" data-pnk="${v}">${v === 'nessuno' ? 'Nessun figlio' : 'Infertile'}</button>`).join('')}</div>` : ''}
    <div class="addc"><select id="f-unionwith"><option value="">Coppia con…</option>${others.filter(x => !us.some(u => u.a === x || u.b === x)).map(opt).join('')}</select><button type="button" class="small" data-mkunion="1">Crea</button></div>
    <div class="addc"><select id="f-sibof"><option value="">Fratello/sorella di…</option>${others.filter(x => !(p.parentUnion && S.people[x].parentUnion === p.parentUnion)).map(opt).join('')}</select><button type="button" class="small" data-mksib="1">Collega</button></div>
    <p class="note">Per unioni tra parenti la linea doppia compare da sola.</p>
  </details>`;
}
function closeEditor() { const ed = $('#editor'); ed.hidden = true; ed.classList.remove('open'); $('#scrim').hidden = true; if (selected) { selected = null; } }
function mutate(fn) { const before = JSON.stringify(S); fn(); if (JSON.stringify(S) !== before) pushUndo(before); render(); save(); }
function editorEvents() {
  const ed = $('#editor');
  ed.addEventListener('click', ev => {
    const t = ev.target.closest('button'); if (!t || !selected) return;
    const id = selected, p = S.people[id];
    if (t.id === 'edclose') { closeEditor(); render(); return; }
    if (t.dataset.sex) { mutate(() => { p.sex = t.dataset.sex; p.unions.forEach(u => E.orient(S, S.unions[u])); }); openEditor(id); return; }
    const fail = e => { const er = $('#f-err'); er.textContent = (e.message || String(e)).replace(/⟨(p\d+)⟩/g, (m, x) => E.layout(S).labels[x] || ''); er.hidden = false; };
    if (t.dataset.fc != null) { const c = E.familyConditions(S)[+t.dataset.fc]; mutate(() => { const i = p.conditions.findIndex(x => x.name === c); if (i >= 0) p.conditions.splice(i, 1); else p.conditions.push({ name: c, age: '' }); }); fresh = new Set([id]); openEditor(id); return; }
    if (t.dataset.fv != null) {
      const v = E.familyVariants(S)[+t.dataset.fv], z = t.dataset.z;
      mutate(() => { p.variants = p.variants || []; const i = p.variants.findIndex(x => x.text === v); const cur = i >= 0 ? (p.variants[i].neg ? 'neg' : p.variants[i].carrier ? 'car' : (p.variants[i].zyg || 'het')) : '';
        const zz = z === 'car' ? 'het' : z === 'neg' ? '' : z;
        if (cur === z) p.variants.splice(i, 1); else if (i >= 0) { p.variants[i].neg = z === 'neg'; p.variants[i].carrier = z === 'car'; p.variants[i].zyg = zz; } else p.variants.push({ text: v, neg: z === 'neg', carrier: z === 'car', zyg: zz }); });
      fresh = new Set([id]); openEditor(id); return;
    }
    if (t.dataset.likec) {
      const pc = S.people[S.probandId].conditions.map(c => c.name);
      if (pc.length === 1) { mutate(() => { if (!p.conditions.some(c => c.name === pc[0])) p.conditions.push({ name: pc[0], age: '' }); }); fresh = new Set([id]); openEditor(id); return; }
      const box = $('#pickc'); box.innerHTML = `<span>Il probando ha più malattie: quale?</span>${pc.map(c => `<button type="button" class="fchip" data-pickc="${esc(c)}"><i style="background:${condColor(c)}"></i>${esc(c)}</button>`).join('')}`; box.hidden = false; return;
    }
    if (t.dataset.pickc) { const c = t.dataset.pickc; mutate(() => { if (!p.conditions.some(x => x.name === c)) p.conditions.push({ name: c, age: '' }); }); fresh = new Set([id]); openEditor(id); return; }
    if (t.dataset.likev) {
      const pv = (S.people[S.probandId].variants || []).filter(v => !v.neg && v.text !== 'test').map(v => v.text);
      const put = v => { mutate(() => { p.variants = p.variants || []; const x = p.variants.find(y => y.text === v); if (x) { x.neg = false; x.zyg = 'het'; } else p.variants.push({ text: v, neg: false, zyg: 'het' }); }); fresh = new Set([id]); openEditor(id); };
      if (pv.length === 1) { put(pv[0]); return; }
      const box = $('#pickv'); box.innerHTML = `<span>Il probando ha più varianti: quale?</span>${pv.map(v => `<button type="button" class="fchip" data-pickv="${esc(v)}">${esc(v)}</button>`).join('')}`; box.hidden = false; return;
    }
    if (t.dataset.pickv) { const v = t.dataset.pickv; mutate(() => { p.variants = p.variants || []; const x = p.variants.find(y => y.text === v); if (x) { x.neg = false; x.zyg = 'het'; } else p.variants.push({ text: v, neg: false, zyg: 'het' }); }); fresh = new Set([id]); openEditor(id); return; }
    if (t.dataset.tt) { mutate(() => { Object.values(S.people).forEach(q => { if (q.twin === p.twin) { q.twinType = t.dataset.tt; q.mz = t.dataset.tt === 'MZ'; } }); }); openEditor(id); return; }
    if (t.dataset.untwin) { mutate(() => { const g = p.twin; Object.values(S.people).forEach(q => { if (q.twin === g && (q.id === id || Object.values(S.people).filter(z => z.twin === g).length <= 2)) { q.twin = null; q.twinType = ''; q.mz = false; } }); }); openEditor(id); return; }
    if (t.dataset.twin) { const w = $('#f-twinwith').value; if (!w) return; const ty = $('#f-twintype').value; try { mutate(() => { E.setTwins(S, [id, w], ty === 'MZ' ? true : ty === 'DZ' ? false : null); }); } catch (e) { fail(e); return; } fresh = new Set([id, w]); openEditor(id); return; }
    if (t.dataset.uf) { const [uid, f, v] = t.dataset.uf.split('|'); mutate(() => { const u = S.unions[uid]; if (u) u[f] = u[f] === v ? '' : v; }); openEditor(id); return; }
    if (t.dataset.pnk) { mutate(() => { p.noKids = p.noKids === t.dataset.pnk ? '' : t.dataset.pnk; }); openEditor(id); return; }
    if (t.dataset.mkunion) { const w = $('#f-unionwith').value; if (!w) return; const R = { log: [] }; try { mutate(() => { E.unionBetween(S, id, w, R); }); } catch (e) { fail(e); return; } fresh = new Set([id, w]); openEditor(id); if (R.log.length) flash(R.log[0].text.replace(/⟨(p\d+)⟩/g, (m, x) => E.layout(S).labels[x] || '')); return; }
    if (t.dataset.mksib) { const w = $('#f-sibof').value; if (!w) return; try { mutate(() => { E.linkSiblings(S, [id, w], { implicit: [] }); }); } catch (e) { fail(e); return; } fresh = new Set([id, w]); openEditor(id); return; }
    if (t.dataset.esito) {
      const [uid, k] = t.dataset.esito.split('|'); const u = S.unions[uid]; if (!u) return;
      const ga = ($('#es-ga-' + uid) || {}).value || ''; const pmaOn = ($('#es-pma-' + uid) || {}).checked;
      let nuovo = null;
      mutate(() => {
        const c = 'p' + (S.seq++);
        S.people[c] = { id: c, sex: 'U', name: '', age: '', deceased: false, deathAge: '', conditions: [], carriers: [], variants: [], parentUnion: uid, unions: [], miscarriage: false, pregnancy: false, adopted: false, twin: null, mz: false, twinType: '', noKids: '', note: '' };
        u.children.push(c); nuovo = c;
        const P0 = S.people[c];
        if (k === 'PREG') P0.pregnancy = true;
        else if (k === 'SB') { P0.stillborn = true; P0.deceased = true; }
        else { P0.miscarriage = true; P0.loss = k === 'ITG' || k === 'IVG' ? 'TOP' : k; P0.top = P0.loss === 'TOP'; if (P0.top) P0.topKind = k; }
        P0.ga = ga.trim() ? (/sett/.test(ga) ? ga.trim() : ga.trim() + ' sett.') : '';
        if (pmaOn) { P0.pma = u.pma && u.pma.eterologa ? 'PMA eterologa' : (u.pma && u.pma.tecnica[0]) || 'PMA'; u.pma = u.pma || { cicli: 0, tecnica: [], transfer: 0, falliti: 0, crio: 0, pgt: '', eterologa: '', note: [] }; }
      });
      fresh = new Set([nuovo]); openEditor(id); return;
    }
    if (t.dataset.adddon) {
      const [uid, tipo] = t.dataset.adddon.split('|'); const u = S.unions[uid]; if (!u) return;
      let nuovo = null;
      mutate(() => {
        u.donors = u.donors || [];
        if (u.donors.some(x => S.people[x] && S.people[x].donor === tipo)) return;
        const c = 'p' + (S.seq++);
        S.people[c] = { id: c, sex: tipo === 'seme' ? 'M' : 'F', name: '', age: '', deceased: false, deathAge: '', conditions: [], carriers: [], variants: [], parentUnion: null, unions: [], miscarriage: false, pregnancy: false, adopted: false, twin: null, mz: false, twinType: '', noKids: '', note: '', donor: tipo, donorFor: uid };
        u.donors.push(c); nuovo = c;
        u.pma = u.pma || { cicli: 0, tecnica: [], transfer: 0, falliti: 0, crio: 0, pgt: '', eterologa: '', note: [] };
        if (tipo !== 'surrogata' && !u.pma.eterologa) u.pma.eterologa = tipo;
      });
      if (nuovo) { fresh = new Set([nuovo]); openEditor(nuovo); } return;
    }
    if (t.dataset.rmcar != null) { mutate(() => { p.carriers.splice(+t.dataset.rmcar, 1); E.pruneConditions(S); }); fresh = new Set([id]); openEditor(id); return; }
    if (t.id === 'f-addcar') { const n = $('#f-newcar').value.trim(); if (!n) return; mutate(() => { const nm = E.registerCondition(S, n[0].toUpperCase() + n.slice(1)); p.carriers = p.carriers.filter(Boolean); if (!p.carriers.includes(nm)) p.carriers.push(nm); }); fresh = new Set([id]); openEditor(id); return; }
    if (t.dataset.rmv != null) { mutate(() => { p.variants.splice(+t.dataset.rmv, 1); }); openEditor(id); return; }
    if (t.id === 'f-addv') { const v0 = $('#f-newv').value.trim(), v = v0 && E.normVariant ? E.normVariant(v0) : v0; if (!v) return; mutate(() => { (p.variants = p.variants || []).push({ text: v, neg: false, zyg: '' }); }); openEditor(id); return; }
    if (t.dataset.rmc != null) { mutate(() => { p.conditions.splice(+t.dataset.rmc, 1); E.pruneConditions(S); }); openEditor(id); return; }
    if (t.dataset.cyc) { mutate(() => { const c = S.conditions.find(x => x.name === t.dataset.cyc); if (c) { const i = E.PALETTE.indexOf(c.color); c.color = E.PALETTE[(i + 1) % E.PALETTE.length]; } }); openEditor(id); return; }
    if (t.id === 'f-addc') {
      const n = $('#f-newc').value.trim(); if (!n) return;
      const a = $('#f-newca').value.trim();
      mutate(() => { const nm = E.registerCondition(S, n[0].toUpperCase() + n.slice(1)); if (!p.conditions.some(c => c.name === nm)) p.conditions.push({ name: nm, age: a }); });
      openEditor(id); return;
    }
    if (t.dataset.q) {
      const map = { genitori: { r: 'genitori', both: 1, word: 'genitori' }, fratello: { r: 'fratello', s: 'M' }, sorella: { r: 'fratello', s: 'F' }, figlio: { r: 'figlio', s: 'M' }, figlia: { r: 'figlio', s: 'F' }, partner: { r: 'partner', s: null, ord: 2 },
        gemello: { r: 'gemello', s: 'M' }, gemella: { r: 'gemello', s: 'F' }, figligem: { r: 'figlio', s: 'M', twins: true, n: 2 }, figliegem: { r: 'figlio', s: 'F', twins: true, n: 2 },
        patrigno: { r: 'patrigno', s: 'M' }, aborto: { r: 'aborto', s: 'U' } };
      const q = Object.assign({}, map[t.dataset.q]);
      if (q.r === 'patrigno') { const pu = p.parentUnion && S.unions[p.parentUnion]; const madre = pu && [pu.a, pu.b].find(x => x && S.people[x].sex === 'F'); q.s = madre ? 'M' : 'M'; }
      let newIds = [];
      try {
        mutate(() => { const R = { log: [], fixes: [], created: new Set(), touched: new Set(), implicit: [] }; const res = E.addRelative(S, id, q, q.n || 1, {}, R); newIds = res.created; });
      } catch (e) { const er = $('#f-err'); er.textContent = e.message; er.hidden = false; return; }
      fresh = new Set(newIds); render(); openEditor(id); setTimeout(() => { fresh = new Set(); }, 1700);
      return;
    }
    if (t.id === 'f-del') {
      if (id === S.probandId) return;
      const before = JSON.stringify(S);
      const L = E.layout(S);
      const err = E.removePerson(S, id);
      if (err) { const er = $('#f-err'); er.textContent = err.replace(/⟨(p\d+)⟩/g, (m, x) => L.labels[x] || ''); er.hidden = false; return; }
      pushUndo(before); closeEditor(); render(); save(); return;
    }
  });
  ed.addEventListener('change', ev => {
    if (!selected) return;
    const id = selected, p = S.people[id], t = ev.target;
    if (t.id === 'f-name') mutate(() => { p.name = t.value.trim(); });
    else if (t.id === 'f-age') mutate(() => { p.age = t.value.trim(); });
    else if (t.id === 'f-dec') { mutate(() => { p.deceased = t.checked; if (!t.checked) p.deathAge = ''; }); openEditor(id); }
    else if (t.id === 'f-dage') mutate(() => { p.deathAge = t.value.trim(); });
    else if (t.dataset.inh != null) { mutate(() => { E.impostaModo(S, t.dataset.inh, t.value, null); }); openEditor(id); }
    else if (t.dataset.dn != null) { mutate(() => { const c = p.conditions[+t.dataset.dn]; if (c) c.denovo = t.checked; }); openEditor(id); }
    else if (t.id === 'f-karyo') { const v = t.value.trim(); if (!v) { mutate(() => { p.karyo = ''; }); openEditor(id); } else { apply(`@${id} ha ${/cariotip/i.test(v) || /traslocaz|inversion|delezion|duplicaz|anello|robertson|isocromo|marcatore/i.test(v) ? v : 'cariotipo ' + v}`, 'Cariotipo di ' + E.layout(S).labels[id] + ': ' + v); openEditor(id); } }
    else if (t.classList.contains('cage') && t.dataset.ci != null) mutate(() => { const c = p.conditions[+t.dataset.ci]; if (c) c.age = t.value.trim(); });
    else if (t.id === 'f-car') { mutate(() => { const list = t.value.split(',').map(s => s.trim()).filter(Boolean).map(s => E.registerCondition(S, s)); p.carriers = list; E.pruneConditions(S); }); openEditor(id); }
    else if (t.id === 'f-carany') { mutate(() => { if (t.checked) { if (!p.carriers.length) p.carriers = ['']; } else p.carriers = []; E.pruneConditions(S); }); openEditor(id); }
    else if (t.id === 'f-prob' && t.checked) { mutate(() => { S.probandId = id; }); openEditor(id); }
    else if (t.id === 'f-adopt') { mutate(() => { p.adopted = t.value || false; }); openEditor(id); }
    else if (t.id === 'f-note') mutate(() => { p.note = t.value.trim(); });
    else if (t.dataset.vz != null) { mutate(() => { const v = p.variants[+t.dataset.vz]; if (v) { v.neg = t.value === 'neg'; v.carrier = t.value === 'car'; v.zyg = t.value === 'neg' ? '' : t.value === 'car' ? 'het' : t.value; } }); fresh = new Set([id]); openEditor(id); }
    else if (t.id === 'f-presympt') mutate(() => { p.presympt = t.checked; });
    else if (t.id === 'g-tipo') { const k = t.value; mutate(() => { p.pregnancy = k === 'PREG'; p.stillborn = k === 'SB'; p.deceased = k === 'SB' ? true : p.deceased && k !== 'PREG'; p.miscarriage = !['PREG', 'SB'].includes(k); p.loss = p.miscarriage ? (k === 'ITG' || k === 'IVG' ? 'TOP' : k) : ''; p.top = p.loss === 'TOP'; p.topKind = p.top ? k : ''; }); openEditor(id); }
    else if (t.id === 'g-ga') mutate(() => { const v = t.value.trim(); p.ga = v ? (/sett/.test(v) ? v : v + ' sett.') : ''; });
    else if (t.id === 'g-pma') mutate(() => { p.pma = t.value; const u = p.parentUnion && S.unions[p.parentUnion]; if (t.value && u && !u.pma) u.pma = { cicli: 0, tecnica: [], transfer: 0, falliti: 0, crio: 0, pgt: '', eterologa: '', note: [] }; });
    else if (t.id === 'g-pren') mutate(() => { p.prenatal = t.value.split('\n').map(x => x.trim()).filter(Boolean); });
    else if (t.id === 'd-tipo') { mutate(() => { p.donor = t.value; if (t.value === 'seme') p.sex = 'M'; else if (t.value !== 'embrione') p.sex = 'F'; }); openEditor(id); }
    else if (t.dataset.pmaf) {
      const [uid, f] = t.dataset.pmaf.split('|'); const u = S.unions[uid];
      mutate(() => { u.pma = u.pma || { cicli: 0, tecnica: [], transfer: 0, falliti: 0, crio: 0, pgt: '', eterologa: '', note: [] };
        if (['cicli', 'transfer', 'falliti', 'crio'].includes(f)) u.pma[f] = Math.max(0, parseInt(t.value, 10) || 0);
        else if (f === 'note') u.pma.note = t.value.split(';').map(x => x.trim()).filter(Boolean);
        else u.pma[f] = t.value.trim(); });
      openEditor(id);
    }
    else if (t.dataset.pmat) { const [uid, k] = t.dataset.pmat.split('|'); const u = S.unions[uid]; mutate(() => { u.pma = u.pma || { cicli: 0, tecnica: [], transfer: 0, falliti: 0, crio: 0, pgt: '', eterologa: '', note: [] }; const i = u.pma.tecnica.indexOf(k); if (t.checked && i < 0) u.pma.tecnica.push(k); if (!t.checked && i >= 0) u.pma.tecnica.splice(i, 1); }); openEditor(id); }
  });
}

/* ---------- export / import ---------- */
function flash(msg) { const el = $('#toast'); el.textContent = msg; el.hidden = false; clearTimeout(flash._t); flash._t = setTimeout(() => { el.hidden = true; }, 3200); }
function baseName() { return 'pedigree' + (S.code ? '-' + S.code.replace(/[^\w-]+/g, '_') : ''); }
function svgToPng(svg, W, H) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const k = 2, c = document.createElement('canvas'); c.width = Math.ceil(W * k); c.height = Math.ceil(H * k);
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob(b => b ? res(b) : rej(new Error('png')), 'image/png');
    };
    img.onerror = () => rej(new Error('img'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}
function plainSave(name, blob) {
  if (window.AndroidPedigree) { const fr = new FileReader(); fr.onload = () => window.AndroidPedigree.salvaFile(name, blob.type || 'application/octet-stream', String(fr.result).split(',')[1]); fr.readAsDataURL(blob); return; }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
async function exportAs(kind) {
  closeMenu();
  const L = E.layout(S);
  const r = svgFor(L, { exp: true });
  if (!downloads) {
    if (insideClaude) { flash('Il salvataggio dei file non è disponibile in questa vista.'); return; }
    try {
      if (kind === 'svg') plainSave(baseName() + '.svg', new Blob([r.svg], { type: 'image/svg+xml' }));
      else if (kind === 'png') plainSave(baseName() + '.png', await svgToPng(r.svg, r.W, r.H));
      else if (kind === 'json') plainSave(baseName() + '.json', new Blob([JSON.stringify({ app: 'pedigree-editor', version: 1, state: S }, null, 2)], { type: 'application/json' }));
    } catch (e) { flash('Salvataggio non riuscito.'); }
    return;
  }
  try {
    if (kind === 'svg') await downloads.save({ filename: baseName() + '.svg', data: r.svg });
    else if (kind === 'png') await downloads.save({ filename: baseName() + '.png', data: await svgToPng(r.svg, r.W, r.H) });
    else if (kind === 'json') await downloads.save({ filename: baseName() + '.json', data: JSON.stringify({ app: 'pedigree-editor', version: 1, state: S }, null, 2) });
  } catch (e) {
    if (e && e.code === 'declined') return;
    if (e && e.code === 'rate_limited') { flash('C’è già un salvataggio in attesa di conferma.'); return; }
    flash('Salvataggio non riuscito.');
  }
}
function openFile(file) {
  const fr = new FileReader();
  fr.onload = () => {
    try {
      const d = JSON.parse(fr.result); const st = d.state || d;
      if (!valid(st)) throw new Error('bad');
      pushUndo(); S = st; selected = null; closeEditor(); zoom.mode = 'fit';
      log.unshift({ cmd: 'Apri ' + file.name, items: [{ type: 'ok', text: 'Pedigree caricato' + (S.code ? ' (' + S.code + ')' : '') }] });
      render(); save();
    } catch (e) { flash('Questo file non è un pedigree salvato da questo strumento.'); }
  };
  fr.readAsText(file);
}

/* ---------- menu ---------- */
function closeMenu() { $('#menu').hidden = true; $('#menubtn').setAttribute('aria-expanded', 'false'); }
let newArmed = false;

/* ---------- init ---------- */
function init() {
  load();
  const input = $('#cmd');
  $('#composer').addEventListener('submit', ev => { ev.preventDefault(); if (aiCtl) { aiCtl.abort(); return; } const v = input.value; input.value = ''; autosize(); submit(v); });
  input.addEventListener('keydown', ev => { if (ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing) { ev.preventDefault(); $('#composer').requestSubmit(); } });
  const autosize = () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 140) + 'px'; };
  input.addEventListener('input', autosize);
  document.querySelectorAll('[data-ex]').forEach(b => b.addEventListener('click', () => { input.value = b.dataset.ex; autosize(); input.focus(); $('#examples').classList.remove('show'); }));
  $('#exbtn').addEventListener('click', () => $('#examples').classList.toggle('show'));
  $('#aibtn').addEventListener('click', () => { const A = window.PedAI; if (!A) return; if (!A.cfg.on && !A.disponibile()) { aiSettings(); return; } A.salva({ on: !A.cfg.on }); aiLabel(); if (A.cfg.on && !A.disponibile()) aiSettings(); });
  $('#aiset').addEventListener('click', aiSettings);
  if (window.PedAI) { window.PedAI.onchange = aiLabel; aiLabel(); }
  $('#logbtn').addEventListener('click', () => { const p = $('#panel'); p.classList.toggle('logopen'); $('#logbtn').textContent = p.classList.contains('logopen') ? 'Chiudi registro' : 'Registro'; });
  $('#log').addEventListener('click', ev => {
    const b = ev.target.closest('[data-ask]'); if (!b) return;
    const [i, k, j] = b.dataset.ask.split('|').map(Number);
    const a = log[i] && log[i].asks && log[i].asks[k]; if (!a || a.done) return;
    const o = a.options[j]; a.done = o.label;
    apply(o.cmd, 'Scelta: ' + o.label);
  });
  const setAnim = on => { document.body.classList.toggle('anim', on); try { localStorage.setItem('pedigree-anim', on ? '1' : '0'); } catch (e) {} const b = $('#m-anim'); if (b) b.textContent = on ? 'Animazioni: attive' : 'Animazioni: disattivate'; };
  let animOn = true; try { animOn = localStorage.getItem('pedigree-anim') !== '0'; } catch (e) {}
  setAnim(animOn);
  $('#m-anim').addEventListener('click', () => { setAnim(!document.body.classList.contains('anim')); closeMenu(); });
  $('#sheet').addEventListener('click', ev => { const g = ev.target.closest('.pn'); if (g) openEditor(g.dataset.id); });
  $('#scrim').addEventListener('click', () => { closeEditor(); render(); });
  $('#undo').addEventListener('click', doUndo);
  $('#redo').addEventListener('click', doRedo);
  $('#zin').addEventListener('click', () => { zoom.mode = 'manual'; zoom.z = Math.min(2.5, zoom.z * 1.2); render(); });
  $('#zout').addEventListener('click', () => { zoom.mode = 'manual'; zoom.z = Math.max(0.25, zoom.z / 1.2); render(); });
  $('#zfit').addEventListener('click', () => { zoom.mode = 'fit'; render(); });
  $('#code').addEventListener('change', ev => { mutate(() => { S.code = ev.target.value.trim(); }); });
  $('#menubtn').addEventListener('click', ev => { ev.stopPropagation(); const m = $('#menu'); m.hidden = !m.hidden; $('#menubtn').setAttribute('aria-expanded', String(!m.hidden)); });
  document.addEventListener('click', ev => { if (!ev.target.closest('#menu') && !ev.target.closest('#menubtn')) closeMenu(); });
  $('#m-png').addEventListener('click', () => exportAs('png'));
  $('#m-svg').addEventListener('click', () => exportAs('svg'));
  $('#m-json').addEventListener('click', () => exportAs('json'));
  $('#m-open').addEventListener('click', () => { closeMenu(); $('#filein').click(); });
  $('#filein').addEventListener('change', ev => { const f = ev.target.files[0]; if (f) openFile(f); ev.target.value = ''; });
  $('#m-new').addEventListener('click', () => {
    const b = $('#m-new');
    if (!newArmed) { newArmed = true; b.textContent = 'Tocca di nuovo per confermare'; setTimeout(() => { newArmed = false; b.textContent = 'Nuovo pedigree'; }, 3000); return; }
    newArmed = false; b.textContent = 'Nuovo pedigree'; closeMenu();
    pushUndo(); S = E.newState(); log = []; selected = null; closeEditor(); zoom.mode = 'fit'; render(); save();
  });
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape') { closeEditor(); closeMenu(); render(); }
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'z' && document.activeElement !== input && !ev.target.closest('input,textarea')) { ev.preventDefault(); ev.shiftKey ? doRedo() : doUndo(); }
  });
  editorEvents();
  // pinch zoom
  let pinch = null, raf = 0;
  const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  $('#stage').addEventListener('touchstart', ev => { if (ev.touches.length === 2) pinch = { d: dist(ev.touches), z: zoom.z }; }, { passive: true });
  $('#stage').addEventListener('touchmove', ev => {
    if (!pinch || ev.touches.length !== 2) return;
    ev.preventDefault();
    zoom.mode = 'manual'; zoom.z = Math.max(0.25, Math.min(2.5, pinch.z * dist(ev.touches) / pinch.d));
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); });
  }, { passive: false });
  $('#stage').addEventListener('touchend', ev => { if (ev.touches.length < 2) pinch = null; });
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (zoom.mode === 'fit') render(); }, 120); });
  render();
  if (insideClaude) {
    window.claude.use('downloads').then(d => { downloads = d; document.body.classList.toggle('nodl', !d); }).catch(() => { document.body.classList.add('nodl'); });
  }
}
window.PedTabletEditor = {
  apri(rec) {
    let st = rec.pedigree ? JSON.parse(JSON.stringify(rec.pedigree)) : null;
    if (!st || !valid(st)) { st = E.newState(); if (rec.sesso === 'M' || rec.sesso === 'F') st.people[st.probandId].sex = rec.sesso; }
    st.code = rec.codice;
    S = st; log = Array.isArray(rec.registro) ? rec.registro.slice() : [];
    undoStack = []; redoStack = []; cmdStack = []; aiDomanda = null; memo = null; selected = null; fresh = new Set();
    closeEditor(); zoom = { mode: 'fit', z: 1 };
    const i = $('#cmd'); if (i) i.value = '';
    render();
  },
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
