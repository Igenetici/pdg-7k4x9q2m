(function () {
'use strict';
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const E = window.PedEngine;
const FORMATO = 'pedigree-genetico-scambio', FORMATO_CIFRATO = 'pedigree-genetico-cifrato';
const CAMPI = ['codice', 'data_consulenza', 'cognome', 'nome', 'data_nascita', 'sesso', 'indicazione', 'medico', 'note'];
const p2 = n => String(n).padStart(2, '0');
const ora = () => { const d = new Date(); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`; };
const oggi = () => ora().slice(0, 10);
const fmtData = d => d ? String(d).slice(0, 10).split('-').reverse().join('/') : '';
const ANDROID = !!window.AndroidPedigree;
const IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && 'ontouchend' in document);
function salvaBlob(nome, blob) {
  // nell'app Android si sceglie dove salvare (Download, Drive, chiavetta…); nel browser va nei Download
  if (ANDROID) { const fr = new FileReader(); fr.onload = () => window.AndroidPedigree.salvaFile(nome, blob.type || 'application/octet-stream', String(fr.result).split(',')[1]); fr.readAsDataURL(blob); return; }
  const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = nome; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 5000);
  flash('File salvato nei Download.');
}
window.PedAndroidSalvato = (ok, nome) => flash(ok ? `File «${nome}» salvato.` : 'Salvataggio annullato o non riuscito.');
const fmtOra = d => d ? String(d).slice(0, 16).replace(/^(\d{4})-(\d\d)-(\d\d)[ T]/, '$3/$2/$1 ') : '';

/* ---------- archivio locale ---------- */
let dbp = null;
function db() {
  if (!dbp) dbp = new Promise((res, rej) => {
    const r = indexedDB.open('pedigree-tablet', 1);
    r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('consulenze')) d.createObjectStore('consulenze', { keyPath: 'codice' }); if (!d.objectStoreNames.contains('impostazioni')) d.createObjectStore('impostazioni'); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  return dbp;
}
async function tx(store, mode, fn) {
  const d = await db();
  return new Promise((res, rej) => {
    const t = d.transaction(store, mode); const st = t.objectStore(store); let out;
    Promise.resolve(fn(st)).then(v => { out = v; });
    t.oncomplete = () => res(out); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
  });
}
const req = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const tutte = () => tx('consulenze', 'readonly', st => req(st.getAll()));
const leggi = codice => tx('consulenze', 'readonly', st => req(st.get(codice)));
const scrivi = rec => tx('consulenze', 'readwrite', st => req(st.put(rec)));
const cancella = codice => tx('consulenze', 'readwrite', st => req(st.delete(codice)));

/* ---------- stato dell'interfaccia ---------- */
let corrente = null;        // record aperto nell'editor
let selezione = new Set();
let filtro = '';
let tSalva = 0, inSalvataggio = Promise.resolve();

function daEsportare(r) { return !r.esportato || (r.modificato && r.modificato > r.esportato); }
function condizioniDi(r) { const st = r.pedigree; return st && Array.isArray(st.conditions) ? st.conditions.map(c => c.name) : []; }
function personeDi(r) { const st = r.pedigree; return st && st.people ? Object.values(st.people).filter(p => !p.miscarriage && !p.donor).length : 0; }
function flash(msg) { const el = $('#toast'); if (!el) return; el.textContent = msg; el.hidden = false; clearTimeout(flash._t); flash._t = setTimeout(() => { el.hidden = true; }, 3600); }

/* ---------- salvataggio dall'editor (chiamato da editor.js a ogni modifica) ---------- */
window.PedTablet = {
  salva(S, log) {
    if (!corrente) return;
    corrente.pedigree = JSON.parse(JSON.stringify(S));
    corrente.pedigree.code = corrente.codice;
    corrente.registro = (log || []).slice(0, 200);
    corrente.modificato = ora();
    clearTimeout(tSalva);
    tSalva = setTimeout(() => { const r = corrente; inSalvataggio = scrivi(r).catch(e => flash('Salvataggio non riuscito: ' + e.message)); }, 300);
  },
};
window.indietroAndroid = () => {
  if (!$('#ta-dlg').hidden) { chiudiDialogo(); return true; }
  const aid = $('#aidlg'); if (aid && !aid.hidden) { aid.hidden = true; aid.innerHTML = ''; return true; }
  const menu = $('#menu'); if (menu && !menu.hidden) { menu.hidden = true; return true; }
  const ed = $('#editor'); if (ed && !ed.hidden) { const c = $('#edclose'); if (c) c.click(); else ed.hidden = true; return true; }
  if (corrente) { chiudi(); return true; }
  return false;
};
window.PedTabletFlush = () => { salvaOra(); };
async function salvaOra() { clearTimeout(tSalva); if (corrente) await scrivi(corrente); await inSalvataggio; }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') salvaOra(); });
window.addEventListener('pagehide', () => { salvaOra(); });

/* ---------- viste ---------- */
function mostraArchivio() {
  document.body.classList.add('in-archivio');
  $('#tab-arch').hidden = false;
  disegna();
}
async function apri(codice) {
  await salvaOra();
  const r = await leggi(codice); if (!r) return;
  corrente = r;
  window.PedTabletEditor.apri(r);
  $('#tab-arch').hidden = true;
  document.body.classList.remove('in-archivio');
  $('#ta-titolo').textContent = r.codice + (r.cognome ? ' · ' + r.cognome + (r.nome ? ' ' + r.nome : '') : '');
  history.replaceState(null, '', '#c=' + encodeURIComponent(codice));
}
async function chiudi() {
  await salvaOra();
  corrente = null;
  history.replaceState(null, '', '#');
  mostraArchivio();
}

async function disegna() {
  const elenco = $('#ta-elenco');
  let rs = await tutte();
  rs.sort((a, b) => String(b.modificato || '').localeCompare(String(a.modificato || '')));
  const q = filtro.trim().toLowerCase();
  if (q) rs = rs.filter(r => [r.codice, r.cognome, r.nome, r.indicazione, r.medico, ...condizioniDi(r)].join(' ').toLowerCase().includes(q));
  selezione = new Set([...selezione].filter(c => rs.some(r => r.codice === c)));
  const nDa = rs.filter(daEsportare).length;
  $('#ta-conta').textContent = rs.length === 1 ? '1 consulenza' : rs.length + ' consulenze';
  $('#ta-daesp').textContent = nDa ? `${nDa} da esportare` : 'tutto esportato';
  $('#ta-daesp').classList.toggle('warn', !!nDa);
  if (!rs.length) {
    elenco.innerHTML = q ? '<p class="ta-vuoto">Nessuna consulenza corrisponde alla ricerca.</p>'
      : '<div class="ta-vuoto"><p>Nessuna consulenza su questo dispositivo.</p><p>Creane una nuova, oppure importa un file esportato dal server.</p></div>';
  } else {
    elenco.innerHTML = rs.map(r => {
      const cond = condizioniDi(r);
      return `<div class="ta-riga${selezione.has(r.codice) ? ' sel' : ''}" data-cod="${esc(r.codice)}">
        <label class="ta-chk" title="Seleziona"><input type="checkbox" data-sel="${esc(r.codice)}" ${selezione.has(r.codice) ? 'checked' : ''} aria-label="Seleziona ${esc(r.codice)}"></label>
        <button type="button" class="ta-apri" data-apri="${esc(r.codice)}">
          <span class="ta-cod">${esc(r.codice)}</span>
          <span class="ta-nome"><b>${esc(r.cognome)}</b> ${esc(r.nome)}${r.data_consulenza ? ` <small>${fmtData(r.data_consulenza)}</small>` : ''}</span>
          <span class="ta-cond">${cond.slice(0, 4).map(c => `<span class="chip">${esc(c)}</span>`).join('')}${cond.length > 4 ? `<span class="chip">+${cond.length - 4}</span>` : ''}</span>
          <span class="ta-meta">${personeDi(r)} persone · modificata ${fmtOra(r.modificato)}${r.origine === 'server' ? ' · dal server' : ''}</span>
          <span class="ta-badge ${daEsportare(r) ? 'da' : 'ok'}">${daEsportare(r) ? 'da esportare' : 'esportata ' + fmtOra(r.esportato)}</span>
        </button></div>`;
    }).join('');
  }
  aggiornaSel();
  spazio();
}
function aggiornaSel() {
  const n = selezione.size;
  $('#ta-nsel').textContent = n ? (n === 1 ? '1 selezionata' : n + ' selezionate') : '';
  $('#ta-esporta').disabled = !n;
  $('#ta-elimina').disabled = !n;
  document.querySelectorAll('.ta-riga').forEach(el => el.classList.toggle('sel', selezione.has(el.dataset.cod)));
}
async function spazio() {
  const el = $('#ta-spazio'); if (!el) return;
  if (ANDROID) { el.textContent = 'Se disinstalli l\u2019app le consulenze si cancellano: esportale prima.'; return; }
  if (!navigator.storage) return;
  try {
    const [p, est] = await Promise.all([navigator.storage.persisted ? navigator.storage.persisted() : false, navigator.storage.estimate ? navigator.storage.estimate() : null]);
    el.textContent = (p ? 'Archivio protetto dalla pulizia automatica del browser.' : 'Il browser potrebbe liberare spazio cancellando i dati: esporta con regolarità.')
      + (est && est.usage ? ` Spazio usato: ${(est.usage / 1048576).toFixed(1)} MB.` : '');
  } catch (e) {}
}

/* ---------- finestre ---------- */
function dialogo(titolo, html) {
  const d = $('#ta-dlg');
  d.innerHTML = `<div class="ta-box" role="dialog" aria-modal="true" aria-label="${esc(titolo)}"><div class="ta-bh"><b>${esc(titolo)}</b><button type="button" class="ghost" data-chiudi>Chiudi</button></div><div class="ta-bb">${html}</div></div>`;
  d.hidden = false;
  d.querySelectorAll('[data-chiudi]').forEach(b => b.onclick = chiudiDialogo);
  d.onclick = ev => { if (ev.target === d) chiudiDialogo(); };
  return d;
}
function chiudiDialogo() { const d = $('#ta-dlg'); d.hidden = true; d.innerHTML = ''; }

function formAnagrafica(a, nuova) {
  a = a || {};
  const v = k => esc(a[k] || '');
  const opt = (k, val, t) => `<option value="${val}"${(a[k] || '') === val ? ' selected' : ''}>${t}</option>`;
  return `<form id="ta-fa" class="ta-form" autocomplete="off">
    <div class="g2"><label>Codice consulenza *<input name="codice" required maxlength="40" value="${v('codice')}"></label>
      <label>Data consulenza<input type="date" name="data_consulenza" value="${esc(a.data_consulenza || (nuova ? oggi() : ''))}"></label></div>
    <div class="g2"><label>Cognome probando<input name="cognome" value="${v('cognome')}"></label><label>Nome<input name="nome" value="${v('nome')}"></label></div>
    <div class="g2"><label>Data di nascita<input type="date" name="data_nascita" value="${v('data_nascita')}"></label>
      <label>Sesso<select name="sesso">${opt('sesso', '', '—')}${opt('sesso', 'F', 'Femmina')}${opt('sesso', 'M', 'Maschio')}</select></label></div>
    <label>Indicazione<input name="indicazione" value="${v('indicazione')}"></label>
    <label>Medico<input name="medico" value="${v('medico')}"></label>
    <label>Note<textarea name="note" rows="3">${v('note')}</textarea></label>
    <p class="err" id="ta-fa-err" hidden></p>
    <div class="acts"><button type="button" class="ghost" data-chiudi>Annulla</button><button type="submit" class="send">${nuova ? 'Crea e apri il pedigree' : 'Salva'}</button></div>
  </form>`;
}
function datiForm(f) { const o = {}; new FormData(f).forEach((v, k) => { o[k] = String(v).trim(); }); return o; }
const CODICE_RE = /^[A-Za-z0-9][A-Za-z0-9._/\- ]{0,39}$/;

function nuovaConsulenza() {
  const d = dialogo('Nuova consulenza', formAnagrafica({}, true));
  d.querySelectorAll('[data-chiudi]').forEach(b => b.onclick = chiudiDialogo);
  d.querySelector('#ta-fa').addEventListener('submit', async ev => {
    ev.preventDefault();
    const o = datiForm(ev.target), er = $('#ta-fa-err');
    try {
      if (!CODICE_RE.test(o.codice)) throw new Error('Codice non valido: lettere, numeri, punto, trattino o barra (max 40).');
      if (await leggi(o.codice)) throw new Error(`Su questo dispositivo esiste già la consulenza ${o.codice}.`);
      const rec = Object.assign({}, o, { stato: 'aperta', pedigree: null, registro: [], creato: ora(), modificato: ora(), esportato: null, origine: 'tablet', versione_server: null });
      await scrivi(rec);
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
      chiudiDialogo();
      apri(rec.codice);
    } catch (e) { er.textContent = e.message; er.hidden = false; }
  });
}
function anagrafica() {
  if (!corrente) return;
  const d = dialogo('Anagrafica della consulenza', formAnagrafica(corrente, false));
  d.querySelectorAll('[data-chiudi]').forEach(b => b.onclick = chiudiDialogo);
  d.querySelector('#ta-fa').addEventListener('submit', async ev => {
    ev.preventDefault();
    const o = datiForm(ev.target), er = $('#ta-fa-err');
    try {
      if (!CODICE_RE.test(o.codice)) throw new Error('Codice non valido.');
      await salvaOra();
      const vecchio = corrente.codice;
      if (o.codice !== vecchio && await leggi(o.codice)) throw new Error(`Esiste già la consulenza ${o.codice}.`);
      Object.assign(corrente, o, { modificato: ora() });
      if (corrente.pedigree) corrente.pedigree.code = corrente.codice;
      await scrivi(corrente);
      if (o.codice !== vecchio) await cancella(vecchio);
      $('#ta-titolo').textContent = corrente.codice + (corrente.cognome ? ' · ' + corrente.cognome + (corrente.nome ? ' ' + corrente.nome : '') : '');
      chiudiDialogo(); flash('Anagrafica salvata.');
    } catch (e) { er.textContent = e.message; er.hidden = false; }
  });
}

/* ---------- cifratura (stesso formato del server: PBKDF2-SHA256 + AES-256-GCM) ---------- */
const b64 = buf => { let s = ''; const b = new Uint8Array(buf); for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const cifraturaDisponibile = () => !!(window.crypto && crypto.subtle);
async function chiave(password, sale, iter) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: sale, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function cifra(dati, password) {
  const sale = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12)), iter = 210000;
  const k = await chiave(password, sale, iter);
  const c = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, new TextEncoder().encode(JSON.stringify(dati)));
  return { formato: FORMATO_CIFRATO, versione: 1, kdf: 'PBKDF2-SHA256', iter, cifra: 'AES-256-GCM', salt: b64(sale), iv: b64(iv), dati: b64(c) };
}
async function decifra(d, password) {
  const k = await chiave(password, unb64(d.salt), d.iter || 210000);
  try { const p = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(d.iv) }, k, unb64(d.dati)); return JSON.parse(new TextDecoder().decode(p)); }
  catch (e) { throw new Error('Password errata o file danneggiato.'); }
}

/* ---------- esportazione ---------- */
function nomeDispositivo() { try { return localStorage.getItem('pedigree-tablet-nome') || 'tablet'; } catch (e) { return 'tablet'; } }
async function esporta() {
  await salvaOra();
  const cod = [...selezione]; if (!cod.length) return;
  const recs = (await Promise.all(cod.map(leggi))).filter(Boolean);
  const okCifra = cifraturaDisponibile();
  const d = dialogo('Esporta consulenze', `<p>${recs.length === 1 ? '1 consulenza' : recs.length + ' consulenze'}: ${recs.map(r => esc(r.codice)).join(', ')}.</p>
    <p class="note">Il file si importa nel programma del server da «Importa dal tablet». Contiene dati sanitari: se lo invii per email o lo copi su una chiavetta, proteggilo con una password.</p>
    ${okCifra ? `<label class="chk"><input type="checkbox" id="ta-pw-on" checked> Proteggi con password</label>
    <div id="ta-pw-box" class="g2"><label>Password (min. 6 caratteri)<input type="password" id="ta-pw1" autocomplete="new-password"></label><label>Ripeti<input type="password" id="ta-pw2" autocomplete="new-password"></label></div>`
    : `<p class="note avviso">La protezione con password richiede l’app installata (connessione sicura); il file verrà salvato senza cifratura.</p>`}
    <label>Nome del dispositivo (compare nel registro del server)<input id="ta-disp" value="${esc(nomeDispositivo())}"></label>
    <p class="err" id="ta-esp-err" hidden></p>
    <div class="acts"><button type="button" class="ghost" data-chiudi>Annulla</button><button type="button" class="send" id="ta-esp-ok">Crea il file</button></div>`);
  const pwOn = d.querySelector('#ta-pw-on');
  if (pwOn) pwOn.onchange = () => { d.querySelector('#ta-pw-box').hidden = !pwOn.checked; };
  d.querySelector('#ta-esp-ok').onclick = async () => {
    const er = $('#ta-esp-err'); er.hidden = true;
    try {
      const disp = d.querySelector('#ta-disp').value.trim() || 'tablet';
      try { localStorage.setItem('pedigree-tablet-nome', disp); } catch (e) {}
      let pw = null;
      if (pwOn && pwOn.checked) {
        pw = d.querySelector('#ta-pw1').value;
        if (pw.length < 6) throw new Error('La password deve avere almeno 6 caratteri.');
        if (pw !== d.querySelector('#ta-pw2').value) throw new Error('Le due password non coincidono.');
      }
      const casi = recs.map(r => {
        const st = r.pedigree || E.newState();
        if (!r.pedigree && (r.sesso === 'M' || r.sesso === 'F')) st.people[st.probandId].sex = r.sesso;
        let indice = null; try { indice = E.summary(st); } catch (e) {}
        return Object.assign({}, ...CAMPI.map(k => ({ [k]: r[k] || '' })), { stato: r.stato || 'aperta', modificato: r.modificato, modificato_da: disp, versione_server: r.versione_server, pedigree: st, registro: r.registro || [], indice });
      });
      let dati = { formato: FORMATO, versione: 1, creato: new Date().toISOString(), dispositivo: disp, consulenze: casi };
      if (pw) dati = await cifra(dati, pw);
      const stamp = ora().slice(0, 16).replace(/[-:]/g, '').replace(' ', '_');
      const nome = `pedigree_tablet_${stamp}_${casi.length}casi.${pw ? 'pedx' : 'json'}`;
      const blob = new Blob([JSON.stringify(dati)], { type: 'application/json' });
      const adesso = ora();
      for (const r of recs) { r.esportato = adesso; await scrivi(r); }
      const file = new File([blob], nome, { type: 'application/json' });
      const puoCondividere = navigator.canShare && navigator.canShare({ files: [file] });
      d.querySelector('.ta-bb').innerHTML = `<p>File pronto: <b>${esc(nome)}</b>${pw ? ' (protetto da password)' : ''}.</p>
        <p class="note">Le consulenze risultano esportate. Se dopo le modifichi, torneranno «da esportare».</p>
        <div class="acts">${puoCondividere ? `<button type="button" class="ghost" id="ta-share">${IOS ? 'Condividi / Salva su File…' : 'Condividi (email, Drive…)'}</button>` : ''}<button type="button" class="send" id="ta-save">${ANDROID ? 'Scegli dove salvare…' : IOS ? 'Scarica (va in File › Download)' : 'Salva nei Download'}</button></div>`;
      const sv = d.querySelector('#ta-save');
      sv.onclick = () => salvaBlob(nome, blob);
      const sh = d.querySelector('#ta-share');
      if (sh) sh.onclick = () => navigator.share({ files: [file], title: 'Pedigree – consulenze esportate' }).catch(() => {});
      selezione.clear(); disegna();
    } catch (e) { er.textContent = e.message; er.hidden = false; }
  };
}

/* ---------- importazione (file del server o di un altro tablet) ---------- */
async function importa(file) {
  let d;
  try { d = JSON.parse(await file.text()); } catch (e) { flash('Il file non è un’esportazione di Pedigree.'); return; }
  if (d && d.formato === FORMATO_CIFRATO) {
    if (!cifraturaDisponibile()) { flash('Per aprire file protetti da password serve l’app installata (connessione sicura).'); return; }
    const dd = dialogo('File protetto', `<label>Password del file<input type="password" id="ta-ipw" autocomplete="off"></label><p class="err" id="ta-ipw-err" hidden></p>
      <div class="acts"><button type="button" class="ghost" data-chiudi>Annulla</button><button type="button" class="send" id="ta-ipw-ok">Apri</button></div>`);
    setTimeout(() => dd.querySelector('#ta-ipw').focus(), 30);
    dd.querySelector('#ta-ipw-ok').onclick = async () => {
      try { const x = await decifra(d, dd.querySelector('#ta-ipw').value); anteprima(x); }
      catch (e) { const er = $('#ta-ipw-err'); er.textContent = e.message; er.hidden = false; }
    };
    return;
  }
  if (d && d.app && d.state) d = { formato: FORMATO, consulenze: [Object.assign({}, d.consulenza || {}, { pedigree: d.state })] };
  if (!d || d.formato !== FORMATO || !Array.isArray(d.consulenze)) { flash('Il file non è un’esportazione di Pedigree.'); return; }
  anteprima(d);
}
async function anteprima(d) {
  const righe = [];
  for (const k of d.consulenze) {
    const cod = String(k.codice || '').trim();
    const ok = CODICE_RE.test(cod) && k.pedigree && k.pedigree.people && k.pedigree.people[k.pedigree.probandId];
    const loc = ok ? await leggi(cod) : null;
    righe.push({ k, cod, ok, loc, def: !ok ? 'salta' : !loc ? 'nuova' : daEsportare(loc) ? 'copia' : 'sovrascrivi' });
  }
  const opz = r => !r.ok ? '<option value="salta">non valida</option>' : !r.loc
    ? '<option value="nuova">importa</option><option value="salta">salta</option>'
    : `<option value="sovrascrivi"${r.def === 'sovrascrivi' ? ' selected' : ''}>sostituisci quella del dispositivo</option><option value="copia"${r.def === 'copia' ? ' selected' : ''}>importa come copia</option><option value="salta">salta</option>`;
  const dd = dialogo('Importa consulenze', `<p>${d.dispositivo ? 'Da: ' + esc(d.dispositivo) + '. ' : ''}${righe.length} consulenz${righe.length === 1 ? 'a' : 'e'} nel file.</p>
    <div class="ta-imp">${righe.map((r, i) => `<div class="ta-imp-r"><div><b>${esc(r.cod)}</b> ${esc(r.k.cognome || '')} ${esc(r.k.nome || '')}
      ${r.loc ? `<small class="${daEsportare(r.loc) ? 'warn' : ''}">già sul dispositivo${daEsportare(r.loc) ? ', con modifiche non esportate' : ''}</small>` : ''}</div>
      <select data-imp="${i}">${opz(r)}</select></div>`).join('')}</div>
    <div class="acts"><button type="button" class="ghost" data-chiudi>Annulla</button><button type="button" class="send" id="ta-imp-ok">Importa</button></div>`);
  dd.querySelector('#ta-imp-ok').onclick = async () => {
    let n = 0;
    for (const [i, r] of righe.entries()) {
      const sc = dd.querySelector(`[data-imp="${i}"]`).value;
      if (sc === 'salta' || !r.ok) continue;
      let cod = r.cod;
      if (sc === 'copia') { let j = 1; do { cod = `${r.cod}-copia${j > 1 ? j : ''}`; j++; } while (await leggi(cod)); }
      const st = r.k.pedigree; st.code = cod;
      await scrivi(Object.assign({}, ...CAMPI.map(k => ({ [k]: r.k[k] || '' })), { codice: cod, stato: 'aperta', pedigree: st, registro: Array.isArray(r.k.registro) ? r.k.registro : [],
        creato: ora(), modificato: ora(), esportato: ora(), origine: /server/i.test(d.dispositivo || '') ? 'server' : 'tablet', versione_server: r.k.versione_server != null ? r.k.versione_server : null }));
      n++;
    }
    chiudiDialogo(); flash(n === 1 ? '1 consulenza importata.' : n + ' consulenze importate.'); disegna();
  };
}

/* ---------- eliminazione locale ---------- */
async function elimina() {
  const cod = [...selezione]; if (!cod.length) return;
  const recs = (await Promise.all(cod.map(leggi))).filter(Boolean);
  const nonEsp = recs.filter(daEsportare);
  const d = dialogo('Eliminare dal dispositivo?', `<p>${recs.length === 1 ? 'La consulenza' : 'Le ' + recs.length + ' consulenze'} ${recs.map(r => '<b>' + esc(r.codice) + '</b>').join(', ')} ${recs.length === 1 ? 'verrà cancellata' : 'verranno cancellate'} da questo dispositivo. Sul server non cambia nulla.</p>
    ${nonEsp.length ? `<p class="note avviso">Attenzione: ${nonEsp.map(r => esc(r.codice)).join(', ')} ha${nonEsp.length > 1 ? 'nno' : ''} modifiche non ancora esportate, che andranno perse.</p>` : ''}
    <div class="acts"><button type="button" class="ghost" data-chiudi>Annulla</button><button type="button" class="danger" id="ta-del-ok">Elimina dal dispositivo</button></div>`);
  d.querySelector('#ta-del-ok').onclick = async () => { for (const r of recs) await cancella(r.codice); selezione.clear(); chiudiDialogo(); flash('Eliminate dal dispositivo.'); disegna(); };
}

/* ---------- avvio ---------- */
function monta() {
  document.body.insertAdjacentHTML('afterbegin', `
  <section id="tab-arch" aria-label="Consulenze sul dispositivo">
    <header class="ta-head"><div class="ta-brand"><svg width="26" height="22" viewBox="0 0 26 22" aria-hidden="true"><rect x="1" y="1" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="21" cy="5" r="4" fill="currentColor"/><path d="M9 5h8M13 5v8M5 13h16M5 13v3M21 13v3" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="5" cy="19" r="2.6" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="18.4" y="16.4" width="5.2" height="5.2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg><span>Pedigree <em>${ANDROID ? 'tablet' : /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document ? 'mobile' : 'tablet'}</em></span></div>
      <span id="ta-rete" class="ta-rete"></span></header>
    <div class="ta-top"><h1>Consulenze <small id="ta-conta"></small> <small id="ta-daesp" class="ta-daesp"></small></h1>
      <input id="ta-q" type="search" placeholder="Cerca codice, cognome, condizione…" aria-label="Cerca">
      <button type="button" class="send" id="ta-nuova">Nuova consulenza</button></div>
    <div class="ta-azioni">
      <button type="button" class="ghost" id="ta-seltutte">Seleziona tutte</button>
      <button type="button" class="ghost" id="ta-selda">Seleziona da esportare</button>
      <span id="ta-nsel"></span>
      <span class="ta-sp"></span>
      <button type="button" class="ghost" id="ta-importa">Importa file</button>
      <button type="button" class="ghost" id="ta-elimina" disabled>Elimina</button>
      <button type="button" class="send" id="ta-esporta" disabled>Esporta selezionate</button>
    </div>
    <div id="ta-elenco"></div>
    <p class="ta-nota">Le consulenze sono salvate solo su questo dispositivo e funzionano senza rete. Per portarle altrove: selezionale, «Esporta selezionate» e scegli dove salvare il file; nel programma del server usa «Importa dal tablet». <span id="ta-spazio"></span></p>
  </section>
  <div id="ta-dlg" hidden></div>
  <input type="file" id="ta-file" accept=".json,.pedx,application/json" hidden>`);
  const hb = document.querySelector('header .brand');
  if (hb) hb.insertAdjacentHTML('afterend', '<button type="button" class="ghost" id="ta-back">← Consulenze</button><button type="button" class="ta-titolo" id="ta-titolo" title="Anagrafica"></button>');
  $('#ta-back').onclick = chiudi;
  $('#ta-titolo').onclick = anagrafica;
  $('#ta-nuova').onclick = nuovaConsulenza;
  $('#ta-q').oninput = ev => { filtro = ev.target.value; disegna(); };
  $('#ta-seltutte').onclick = () => { const tuttiSel = [...document.querySelectorAll('[data-sel]')].every(c => selezione.has(c.dataset.sel)); document.querySelectorAll('[data-sel]').forEach(c => { if (tuttiSel) selezione.delete(c.dataset.sel); else selezione.add(c.dataset.sel); c.checked = !tuttiSel; }); aggiornaSel(); };
  $('#ta-selda').onclick = async () => { const rs = await tutte(); selezione = new Set(rs.filter(daEsportare).map(r => r.codice)); document.querySelectorAll('[data-sel]').forEach(c => { c.checked = selezione.has(c.dataset.sel); }); aggiornaSel(); };
  $('#ta-esporta').onclick = esporta;
  $('#ta-elimina').onclick = elimina;
  $('#ta-importa').onclick = () => $('#ta-file').click();
  $('#ta-file').onchange = ev => { const f = ev.target.files[0]; if (f) importa(f); ev.target.value = ''; };
  $('#ta-elenco').addEventListener('change', ev => { const c = ev.target.closest('[data-sel]'); if (!c) return; if (c.checked) selezione.add(c.dataset.sel); else selezione.delete(c.dataset.sel); aggiornaSel(); });
  $('#ta-elenco').addEventListener('click', ev => { const b = ev.target.closest('[data-apri]'); if (b) apri(b.dataset.apri); });
  const rete = () => { if (ANDROID) return; const el = $('#ta-rete'); el.textContent = navigator.onLine ? 'in rete' : 'senza rete'; el.classList.toggle('off', !navigator.onLine); };
  window.addEventListener('online', rete); window.addEventListener('offline', rete); rete();
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !$('#ta-dlg').hidden) chiudiDialogo(); });
  const m = /#c=([^&]+)/.exec(location.hash);
  if (m) leggi(decodeURIComponent(m[1])).then(r => r ? apri(r.codice) : mostraArchivio()); else mostraArchivio();
  if (!ANDROID && 'serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('sw.js').catch(() => {});
  if (ANDROID) { $('#ta-rete').textContent = 'app'; $('#ta-rete').classList.remove('off'); }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', monta); else monta();
})();
