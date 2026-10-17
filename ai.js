/* Interpretazione delle frasi con un'AI: traduce la frase nei comandi canonici del motore,
   che poi li esegue e li verifica. L'AI non modifica mai l'albero direttamente. */
(function () {
'use strict';
const KEY = 'pedigree-tablet-ai.v1';
const insideClaude = false;
const DEF = { on: false, mode: 'fallback', provider: insideClaude ? 'claude' : 'anthropic', key: '', model: '' };
const MODELLI = { anthropic: 'claude-haiku-5-5', openai: 'gpt-4o-mini', gemini: 'gemini-2.5-flash' };
const CHIAVE_PREDEFINITA = '';
let cfg = Object.assign({}, DEF);
let salvato = null;
try { salvato = JSON.parse(localStorage.getItem(KEY) || 'null'); cfg = Object.assign({}, DEF, salvato || {}); } catch (e) {}
if (CHIAVE_PREDEFINITA && !cfg.key && !cfg.senzaPredefinita) { cfg.key = CHIAVE_PREDEFINITA; cfg.provider = salvato && salvato.provider && salvato.provider !== 'anthropic' && salvato.key ? cfg.provider : 'anthropic'; if (!salvato) { cfg.on = true; cfg.mode = 'fallback'; } }
let sampleFn = null, sampleOk = null;
if (false) window.claude.use('sample').then(f => { sampleFn = f; sampleOk = !!f; if (window.PedAI.onchange) window.PedAI.onchange(); }).catch(() => { sampleOk = false; });

const GRAMMATICA = `Sei l'interprete di un editor di pedigree per la consulenza genetica, in italiano.
Traduci la frase del genetista in uno o più COMANDI nel formato canonico qui sotto: un motore a regole li eseguirà.
Rispondi SOLO con un oggetto JSON, senza altro testo: {"comandi": ["..."], "domanda": null}

REGOLE
- Le persone già presenti si indicano SEMPRE con il loro codice @pN preso dall'elenco della famiglia.
- Per creare persone nuove usa i comandi «aggiungi …», riferiti al probando o a una persona @pN.
- Un comando per ogni azione, nell'ordine logico (prima crea, poi descrivi). Le persone appena create con «aggiungi» non hanno ancora un codice: descrivile nello stesso comando (es. «aggiungi una zia paterna affetta da X») oppure con riferimenti di parentela («la zia paterna è …»).
- «stessa malattia», «la mutazione familiare», «quella del probando»: scrivi esplicitamente la condizione o la variante prese dall'elenco, con la grafia dell'elenco.
- Non inventare dati che la frase non dice. Se manca un dato indispensabile restituisci "comandi": [] e una "domanda" breve in italiano; non chiedere mai due volte la stessa cosa.
- Avverbi e riempitivi («anche», «pure», «inoltre», «invece», «ancora») NON fanno parte del nome di malattie o varianti: ignorali.
- Correggi da solo i refusi evidenti e usa la nomenclatura corrente delle varianti con il gene davanti: «f508eel»/«delta F508» → CFTR F508del, «cod39»/«β°39»/«codone 39» → HBB cod39, «IVS1-110» → HBB IVS-I-110, «HbS» → HBB HbS, «35delG» → GJB2 35delG. Non chiedere conferma per questo.
- «Eliminala», «toglila», «annulla», «ho sbagliato» riferiti all'ultima modifica = comando «annulla» (poi gli altri comandi della frase).
- Se nel CONTESTO c'è una domanda ancora aperta e la frase è una risposta breve («Rob», «sì», «paterna», «la prima», «14;21», «bilanciata»), usa la domanda e la frase originale per produrre i comandi completi (di solito il comando dell'opzione scelta).
- «Portatore/portatrice sano/a» di una variante o di una malattia recessiva = portatore (metà simbolo colorata). «Eterozigote» senza «portatore» = variante in eterozigosi.

COMANDI (esempi del formato esatto)
aggiungi due sorelle | aggiungi una zia paterna | aggiungi i nonni materni | aggiungi un figlio a @p4 | aggiungi due figlie gemelle monozigoti a @p1
aggiungi un fratello da parte di padre | aggiungi il marito di @p5 | aggiungi la madre di @p9 | aggiungi un figlio a @p3 con @p7 | aggiungi un figlio a @p3 con un nuovo compagno
@p4 è femmina | @p4 ha 52 anni | @p4 si chiama Anna | @p4 è affetta da Carcinoma mammario a 45 anni | @p4 è deceduto a 70 anni per infarto
@p4 è eterozigote per CFTR F508del | @p4 è omozigote per CFTR F508del | @p4 è emizigote per DMD c.123del | @p4 è eterozigote composto per CFTR F508del e CFTR G542X
@p4 è portatore di CFTR F508del | @p4 è portatrice di fibrosi cistica | @p4 è negativo per BRCA1 c.68_69del | @p4 ha una VUS in BRCA2 c.123A>G
@p4 non è portatore | @p4 non è affetto da Diabete | @p4 è sano | @p4 è vivo | @p4 è asintomatico | @p4 nota: testo libero
@p4 e @p5 sono gemelli monozigoti | @p4 e @p5 sono gemelli dizigoti | @p4 non è gemello | @p4 è fratello di @p9 | @p4 è figlio di @p2
@p4 ha sposato @p8 | @p4 è separato da @p8 | @p4 è divorziato da @p8 | @p4 non ha figli | @p4 è infertile
@p4 è adottato | @p4 è stato dato in adozione | @p3 ha avuto due aborti spontanei | @p4 è incinta
i genitori di @p1 sono consanguinei | rimuovi @p6 | @p4 è il probando
@p4 non è portatore di HBB cod39 | rimuovi la voce «Anche di hbb cod39» da @p4 | annulla
collocati su @p5 (da qui le parentele senza «di …» sono riferite a @p5) | torna al probando | nota generale: testo libero (in basso a sinistra dell'albero)
ESPANSIONI DI RIPETIZIONI (scrivi gene, motivo e alleli): @p2 ha HTT CAG 17/42 | @p2 è affetto da Malattia di Huntington con HTT CAG 18/45 | @p3 ha FMR1 CGG 30/85 | @p4 ha FMR1 CGG >200 | @p5 ha DMPK CTG 5/150 | @p6 ha FXN GAA 9/800 | @p7 ha ATXN3 CAG 23/70 | @p8 ha C9orf72 G4C2 >30
- Usa solo geni umani reali (simboli HGNC) e malattie reali: se un gene o una malattia non esistono, non inventare: chiedi nella "domanda".
STORIA RIPRODUTTIVA E PRENATALE (una frase per coppia o gravidanza; la donna o la coppia come soggetto)
@p1 ha fatto 2 cicli di ICSI, 2 transfer non riusciti con 1 aborto e una biochimica | @p1 ha fatto PMA eterologa con donatrice di 25 anni | @p1 ha 3 embrioni crioconservati dopo PGT-M per CFTR
@p3 ha avuto un aborto spontaneo a 9 settimane | @p3 ha avuto una ITG a 14 settimane per Sindrome di Down dopo amniocentesi: 47,XY,+21 | @p3 ha avuto una IVG a 8 settimane
@p3 ha avuto una gravidanza ectopica | @p3 ha avuto un nato morto a 32 settimane, maschio | @p3 è incinta di 12 settimane, NIPT: basso rischio | @p3 ha una gravidanza gemellare in corso di 16 settimane, monocoriale
TRASMISSIONE, DE NOVO E CITOGENETICA (scrivi l'ISCN corretto: cromosomi in ordine, sessuali prima)
la Fibrosi cistica è autosomica recessiva | la Sindrome di Marfan è autosomica dominante a penetranza incompleta | la Retinite pigmentosa è recessiva legata all'X | la Neuropatia ottica di Leber è mitocondriale
@p4 ha la Distrofia muscolare di Duchenne de novo | @p4 ha una variante de novo in SCN1A c.1234C>T
@p2 ha t(11;22)(q23;q11.2) bilanciata | @p3 è portatrice di rob(14;21)(q10;q10) | @p3 ha inv(9)(p12q13) | @p4 ha del(22)(q11.2) | @p4 ha dup(15)(q11q13)
@p4 ha cariotipo 47,XY,+21 | il cariotipo di @p2 è normale | @p4 ha arr[GRCh38] 16p11.2(29500000_30200000)x1 | @p4 ha una disomia uniparentale materna del 15`;

function descriviFamiglia(S, E) {
  const L = E.layout(S);
  const righe = Object.values(S.people).map(p => {
    const parti = ['@' + p.id, L.labels[p.id] || '', E.kinWord(S, p.id) || (p.id === S.probandId ? 'probando' : ''), p.sex === 'M' ? 'maschio' : p.sex === 'F' ? 'femmina' : 'sesso non noto'];
    if (p.miscarriage) parti.push('aborto spontaneo');
    if (p.age) parti.push(p.age + ' anni');
    if (p.deceased) parti.push('deceduto' + (p.deathAge ? ' a ' + p.deathAge : ''));
    if (p.conditions.length) parti.push('affetto: ' + p.conditions.map(c => c.name + (c.age ? ' (dx ' + c.age + ')' : '')).join(', '));
    const v = (p.variants || []).map(x => x.text + (x.neg ? ' negativo' : x.carrier ? ' portatore' : x.zyg === 'omo' ? ' omozigote' : x.zyg === 'emi' ? ' emizigote' : x.zyg === 'comp' ? ' et. composto' : ' eterozigote'));
    if (v.length) parti.push('varianti: ' + v.join(', '));
    if (p.carriers.length) parti.push('portatore di: ' + p.carriers.map(c => c || 'n.s.').join(', '));
    if (p.twin) { const altri = Object.values(S.people).filter(q => q.twin === p.twin && q.id !== p.id).map(q => '@' + q.id); parti.push('gemello di ' + altri.join(', ') + ' (' + (p.twinType || '?') + ')'); }
    const pu = p.parentUnion && S.unions[p.parentUnion];
    if (pu) parti.push('genitori: ' + [pu.a, pu.b].filter(Boolean).map(x => '@' + x).join(' e '));
    const partner = p.unions.map(u => S.unions[u]).filter(Boolean).map(u => u.a === p.id ? u.b : u.a).filter(Boolean);
    if (partner.length) parti.push('partner: ' + partner.map(x => '@' + x).join(', '));
    return parti.filter(Boolean).join(' | ');
  });
  return righe.join('\n');
}
function estraiJSON(t) {
  t = String(t || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const i = t.indexOf('{'), j = t.lastIndexOf('}');
  if (i < 0 || j < i) throw Object.assign(new Error('risposta non valida'), { code: 'invalid_json' });
  const o = JSON.parse(t.slice(i, j + 1));
  return { comandi: Array.isArray(o.comandi) ? o.comandi.filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()).slice(0, 30) : [], domanda: typeof o.domanda === 'string' && o.domanda.trim() ? o.domanda.trim() : null };
}
async function geminiChiama(utente, signal) {
  // come sul server: riprova se il modello è sovraccarico e passa al successivo, ricordando quello che ha funzionato
  let buono = ''; try { buono = localStorage.getItem('pedigree-tablet-gemini-ok') || ''; } catch (e) {}
  const lista = [cfg.model, buono, 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-flash-latest'].filter((x, i, a) => x && a.indexOf(x) === i);
  let ultimo = null;
  for (const m of lista) {
    for (let t = 0; t < 2; t++) {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent`, { method: 'POST', signal, headers: { 'content-type': 'application/json', 'x-goog-api-key': cfg.key },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: GRAMMATICA }] }, contents: [{ role: 'user', parts: [{ text: utente }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0 } }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok) { try { localStorage.setItem('pedigree-tablet-gemini-ok', m); } catch (e) {} const c = (d.candidates || [])[0]; return estraiJSON(((c && c.content && c.content.parts) || []).map(p => p.text || '').join('')); }
      ultimo = Object.assign(new Error((d.error && d.error.message) || ('errore ' + r.status)), { code: 'http_' + r.status });
      if (r.status === 400 || r.status === 401 || r.status === 403) throw ultimo;
      if (r.status === 404) break;
      if ((r.status === 429 || r.status >= 500) && t === 0) { await new Promise(res => setTimeout(res, 1500)); continue; }
      break;
    }
  }
  throw ultimo || new Error('Gemini non disponibile');
}
async function traduci(frase, S, E, signal, contesto) {
  if (navigator.onLine === false) throw Object.assign(new Error('senza rete'), { code: 'offline' });
  const utente = `FAMIGLIA ATTUALE (una persona per riga):\n${descriviFamiglia(S, E)}\n\n${contesto ? 'CONTESTO DELLA CONVERSAZIONE:\n' + contesto + '\n\n' : ''}FRASE DEL GENETISTA:\n${frase}`;
  if (cfg.provider === 'claude') {
    if (!sampleFn) throw Object.assign(new Error('Claude non disponibile in questa vista'), { code: 'not_available' });
    const r = await sampleFn(GRAMMATICA + '\n\n' + utente, { modelTier: 'quick', signal, cache: false });
    return estraiJSON(r.text);
  }
  if (!cfg.key) throw Object.assign(new Error('Manca la chiave API nelle impostazioni AI'), { code: 'no_key' });
  if (cfg.provider === 'anthropic') {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', signal, headers: { 'content-type': 'application/json', 'x-api-key': cfg.key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: cfg.model || MODELLI.anthropic, max_tokens: 1000, system: GRAMMATICA, messages: [{ role: 'user', content: utente }] }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error((d.error && d.error.message) || ('errore ' + r.status)), { code: 'http_' + r.status });
    return estraiJSON((d.content || []).map(c => c.text || '').join(''));
  }
  if (cfg.provider === 'gemini') return geminiChiama(utente, signal);
  if (cfg.provider === 'openai') {
    const r = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', signal, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + cfg.key },
      body: JSON.stringify({ model: cfg.model || MODELLI.openai, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: GRAMMATICA }, { role: 'user', content: utente }] }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error((d.error && d.error.message) || ('errore ' + r.status)), { code: 'http_' + r.status });
    return estraiJSON(d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content);
  }
  throw new Error('fornitore sconosciuto');
}
function messaggioErrore(e) {
  const c = e && e.code;
  if (c === 'not_granted') return 'Uso di Claude non autorizzato in questa vista.';
  if (c === 'rate_limited') return 'Troppe richieste ravvicinate: riprova tra poco.';
  if (c === 'cancelled' || (e && e.name === 'AbortError')) return 'Interpretazione AI interrotta.';
  if (c === 'no_key') return 'Manca la chiave API: aprila da «AI» › Impostazioni.';
  if (c === 'offline') return 'Senza rete: l\u2019AI non è raggiungibile.';
  if (c === 'http_401' || c === 'http_403') return 'Chiave API non valida o senza permessi.';
  if (c === 'http_429') return 'Limite di richieste del servizio AI raggiunto: riprova tra poco.';
  if (c === 'http_503') return 'Il servizio AI è sovraccarico in questo momento.';
  if (c === 'invalid_json') return "L'AI ha risposto in un formato non valido.";
  if (e instanceof TypeError) return 'Il servizio AI non è raggiungibile (controlla la connessione).';
  return 'AI non disponibile: ' + ((e && e.message) || 'errore');
}
window.PedAI = {
  get cfg() { return cfg; },
  insideClaude,
  modelli: MODELLI,
  salva(n) { cfg = Object.assign({}, cfg, n); if (n && 'key' in n && !n.key) cfg.senzaPredefinita = true; try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) {} },
  disponibile() { if (cfg.provider === 'claude') return insideClaude && sampleOk !== false; if (insideClaude) return false; return !!cfg.key; },
  traduci, messaggioErrore, descriviFamiglia,
  onchange: null,
};
})();
