/* Pedigree engine: data model, Italian command interpreter, layout */
(function (root) {
'use strict';

const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV'];
const PALETTE = ['#1B2433','#0F6B66','#9B2D2D','#B07A12','#6B3E75','#3D5A99','#5F6F2A','#2F7D9A'];

/* ---------- vocabulary ---------- */
const NUMW = {un:1,uno:1,una:1,"un'":1,due:2,tre:3,quattro:4,cinque:5,sei:6,sette:7,otto:8,nove:9,dieci:10,undici:11,dodici:12};
const NUMWORDS = ['due','tre','quattro','cinque','sei','sette','otto','nove','dieci','undici','dodici'];
const INDEF = new Set(['un','uno','una',"un'"]);
const FEM_DET = new Set(['una',"un'",'la','le']);
const DEF = new Set(['il','lo','la','i','gli','le']);
const POSS = new Set(['mio','mia','miei','mie','suo','sua','suoi','sue','tuo','tua','proprio','propria','propri','proprie','nostro','nostra']);
const ORD = {primo:1,prima:1,secondo:2,seconda:2,terzo:3,terza:3,quarto:4,quarta:4,quinto:5,quinta:5,sesto:6,sesta:6,ultimo:-1,ultima:-1,altro:'other',altra:'other',altri:'other',altre:'other'};
const APOS = {"dell'":'della',"all'":'alla',"l'":'la',"un'":'una',"nell'":'nella',"dall'":'dalla',"sull'":'sulla',"d'":'di',"quell'":'quella',"quest'":'questa',"c'":"c'"};
const PRON = new Set(['lui','lei','loro','esso','essa','questi','costui','costei']);
const TO = new Set(['a','al','alla','allo','ai','alle','agli','per']);
const OF = new Set(['di','del','della','dello','dei','delle','degli']);
const COP = new Set(['e','sono','era','erano','risulta','risultano','stato','stata','stati','state','anche','gia','invece','pure','inoltre']);
const ADDV = ['aggiungi','aggiungiamo','aggiungere','aggiungo','inserisci','inserire','inserisco','metti','mettere','crea','segna','includi','disegna'];
const REMV = ['rimuovi','rimuovere','togli','togliere','elimina','eliminare','cancella','cancellare'];
const SIDE = {paterno:'P',paterna:'P',paterni:'P',paterne:'P',materno:'M',materna:'M',materni:'M',materne:'M',pat:'P',mat:'M',patern:'P',matern:'M'};

const R_ = (r, s, o) => Object.assign({ r, s }, o || {});
const REL = {
  probando:R_('self',null), probanda:R_('self','F'), paziente:R_('self',null), consultando:R_('self',null), consultanda:R_('self','F'),
  padre:R_('padre','M'), papa:R_('padre','M'), babbo:R_('padre','M'),
  madre:R_('madre','F'), mamma:R_('madre','F'),
  genitori:R_('genitori',null,{pl:1,both:1}),
  fratello:R_('fratello','M'), fratelli:R_('fratello','M',{pl:1,gen:1}), sorella:R_('fratello','F'), sorelle:R_('fratello','F',{pl:1}),
  fratellastro:R_('fratello','M',{half:1}), fratellastri:R_('fratello','M',{half:1,pl:1,gen:1}), sorellastra:R_('fratello','F',{half:1}), sorellastre:R_('fratello','F',{half:1,pl:1}),
  gemello:R_('gemello','M'), gemelli:R_('figlio','M',{pl:1,gen:1,twins:1}), gemella:R_('gemello','F'), gemelle:R_('figlio','F',{pl:1,twins:1}),
  sorellina:R_('fratello','F'), sorelline:R_('fratello','F',{pl:1}), fratellino:R_('fratello','M'), fratellini:R_('fratello','M',{pl:1,gen:1}), fratelli_e_sorelle:R_('fratello','M',{pl:1,gen:1}),
  nonnino:R_('nonno','M'), nonnina:R_('nonno','F'), zietto:R_('zio','M'), zietta:R_('zio','F'), cuginetto:R_('cugino','M'), cuginetta:R_('cugino','F'), cuginetti:R_('cugino','M',{pl:1,gen:1}),
  figlioletto:R_('figlio','M'), figlioletta:R_('figlio','F'), nipotino:R_('nipote','M'), nipotina:R_('nipote','F'), nipotini:R_('nipote','M',{pl:1,gen:1}),
  bambino:R_('figlio','M'), bambina:R_('figlio','F'), bambini:R_('figlio','M',{pl:1,gen:1}), bambine:R_('figlio','F',{pl:1}), bimbo:R_('figlio','M'), bimba:R_('figlio','F'), bimbi:R_('figlio','M',{pl:1,gen:1}), bimbe:R_('figlio','F',{pl:1}),
  primogenito:R_('figlio','M',{ord:1,gen:1}), primogenita:R_('figlio','F',{ord:1,gen:1}), secondogenito:R_('figlio','M',{ord:2,gen:1}), secondogenita:R_('figlio','F',{ord:2,gen:1}), terzogenito:R_('figlio','M',{ord:3,gen:1}), terzogenita:R_('figlio','F',{ord:3,gen:1}),
  quartogenito:R_('figlio','M',{ord:4,gen:1}), quartogenita:R_('figlio','F',{ord:4,gen:1}), ultimogenito:R_('figlio','M',{ord:-1,gen:1}), ultimogenita:R_('figlio','F',{ord:-1,gen:1}),
  consorte:R_('partner',null), sposo:R_('partner','M'), sposa:R_('partner','F'), mogli:R_('partner','F',{pl:1}), mariti:R_('partner','M',{pl:1}),
  ivg:R_('aborto','U',{top:1}), itg:R_('aborto','U',{top:1}), natomorto:R_('figlio','U',{stillborn:1}),
  patrigno:R_('patrigno','M'), matrigna:R_('patrigno','F'), genero:R_('genero','M'), nuora:R_('genero','F'), generi:R_('genero','M',{pl:1}),
  figlio:R_('figlio','M'), figli:R_('figlio','M',{pl:1,gen:1}), figlia:R_('figlio','F'), figlie:R_('figlio','F',{pl:1}),
  nonno:R_('nonno','M'), nonni:R_('nonno',null,{pl:1,both:1}), nonna:R_('nonno','F'), nonne:R_('nonno','F',{pl:1}),
  zio:R_('zio','M'), zii:R_('zio','M',{pl:1,gen:1}), zia:R_('zio','F'), zie:R_('zio','F',{pl:1}),
  cugino:R_('cugino','M'), cugini:R_('cugino','M',{pl:1,gen:1}), cugina:R_('cugino','F'), cugine:R_('cugino','F',{pl:1}),
  nipote:R_('nipote',null), nipoti:R_('nipote',null,{pl:1,gen:1}),
  marito:R_('partner','M'), moglie:R_('partner','F'), partner:R_('partner',null), compagno:R_('partner','M'), compagna:R_('partner','F'),
  coniuge:R_('partner',null), fidanzato:R_('partner','M'), fidanzata:R_('partner','F'), convivente:R_('partner',null),
  suocero:R_('suocero','M'), suocera:R_('suocero','F'), suoceri:R_('suocero',null,{pl:1,both:1}),
  aborto:R_('aborto','U'), aborti:R_('aborto','U',{pl:1}),
  gravidanza:R_('gravidanza','U'), feto:R_('gravidanza','U'),
  bisnonno:R_('bisnonno','M'), bisnonna:R_('bisnonno','F'), bisnonni:R_('bisnonno',null,{pl:1}),
  prozio:R_('prozio','M'), prozia:R_('prozio','F'), prozii:R_('prozio','M',{pl:1}), prozie:R_('prozio','F',{pl:1}),
  cognato:R_('cognato','M'), cognata:R_('cognato','F'), cognati:R_('cognato','M',{pl:1,gen:1})
};
const RELKEYS = Object.keys(REL);
const SIDEKEYS = Object.keys(SIDE);

const STARTERS = ['un','uno','una',"un'",'il','lo','la',"l'",'i','gli','le','lui','lei','suo','sua','suoi','sue','mio','mia',
  ...NUMWORDS, ...RELKEYS, ...ADDV, ...REMV, 'anche', 'ha', 'hanno'].map(w => w.replace(/'/g, "'"));
const SPLIT_E = new RegExp("\\s+(?:e|ed|poi|e poi|inoltre)\\s+(?=(?:@p\\d+|\\d+\\s|" + STARTERS.sort((a,b)=>b.length-a.length).map(w=>w.replace(/'/,"'")).join('|') + ")(?:\\b|(?<='))(?!\\s*(?:anni|mesi)))", 'i');

/* ---------- utils ---------- */
const stripAcc = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const lowA = s => stripAcc(s.toLowerCase());
function dl(a, b) {
  const m = a.length, n = b.length; const d = [];
  for (let i = 0; i <= m; i++) { d[i] = [i]; }
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    const c = a[i-1] === b[j-1] ? 0 : 1;
    d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + c);
    if (i > 1 && j > 1 && a[i-1] === b[j-2] && a[i-2] === b[j-1]) d[i][j] = Math.min(d[i][j], d[i-2][j-2] + 1);
  }
  return d[m][n];
}
function fuzzyPick(word, list) {
  if (!word || word.length < 3 || /\d|@/.test(word)) return null;
  let best = null, bd = 99, tie = false;
  for (const c of list) {
    if (Math.abs(c.length - word.length) > 2) continue;
    if (word.length <= 5 && c[0] !== word[0]) continue;
    const d = dl(word, c);
    const lim = c.length >= 8 ? 2 : 1;
    if (d <= lim) {
      if (d < bd) { bd = d; best = c; tie = false; }
      else if (d === bd && c !== best) tie = true;
    }
  }
  return tie ? null : best;
}
function cap(s) { s = s.trim(); return s ? s[0].toUpperCase() + s.slice(1) : s; }
function agr(sex, n) { return n > 1 ? (sex === 'F' ? 'e' : 'i') : (sex === 'F' ? 'a' : 'o'); }

/* ---------- dizionari ---------- */
// Malattie: nome canonico e sinonimi/sigle (confronto senza accenti, maiuscole, punteggiatura)
const MALATTIE = [
  ['Fibrosi cistica', 'fc', 'fibrosi cistica', 'mucoviscidosi', 'cf', 'cystic fibrosis'],
  ['Atrofia muscolare spinale', 'sma', 'atrofia muscolare spinale', 'amiotrofia spinale', 'amiotrofia muscolare spinale'],
  ["Sindrome dell'X fragile", 'x fragile', "sindrome dell'x fragile", 'sindrome x fragile', 'fxs', 'sindrome di martin bell', 'x-fragile'],
  ['Sindrome di Down', 'down', 'sindrome di down', 'trisomia 21', 't21', 'mongolismo'],
  ['Sindrome di Edwards', 'edwards', 'sindrome di edwards', 'trisomia 18', 't18'],
  ['Sindrome di Patau', 'patau', 'sindrome di patau', 'trisomia 13', 't13'],
  ['Sindrome di Turner', 'turner', 'sindrome di turner', 'monosomia x', '45x', '45 x', '45x0'],
  ['Sindrome di Klinefelter', 'klinefelter', 'sindrome di klinefelter', '47xxy', '47 xxy'],
  ['Distrofia muscolare di Duchenne', 'duchenne', 'distrofia di duchenne', 'distrofia muscolare di duchenne', 'dmd'],
  ['Distrofia muscolare di Becker', 'becker', 'distrofia di becker', 'distrofia muscolare di becker', 'bmd'],
  ['Distrofia miotonica', 'steinert', 'malattia di steinert', 'distrofia miotonica', 'distrofia miotonica di steinert'],
  ['Malattia di Huntington', 'huntington', 'corea di huntington', 'malattia di huntington', 'morbo di huntington', 'hd'],
  ['Talassemia', 'talassemia', 'beta talassemia', 'beta-talassemia', 'talassemia major', 'talassemia maior', 'anemia mediterranea', 'morbo di cooley', 'thalassemia', 'talassemia intermedia'],
  ['Alfa talassemia', 'alfa talassemia', 'alfa-talassemia', 'alpha talassemia'],
  ['Anemia falciforme', 'anemia falciforme', 'drepanocitosi', 'sickle cell', 'anemia a cellule falciformi'],
  ['Emofilia A', 'emofilia a', 'emofilia'], ['Emofilia B', 'emofilia b'],
  ['Sordità congenita', 'sordita congenita', 'ipoacusia congenita', 'sordita neurosensoriale', 'ipoacusia neurosensoriale'],
  ['Sordità', 'sordita', 'ipoacusia'],
  ['Autismo', 'autismo', 'asd', 'disturbo dello spettro autistico', 'spettro autistico', 'disturbo autistico'],
  ['Disabilità intellettiva', 'disabilita intellettiva', 'ritardo mentale', 'ritardo cognitivo', 'deficit cognitivo', 'insufficienza mentale'],
  ['Ritardo dello sviluppo', 'ritardo psicomotorio', 'ritardo dello sviluppo', 'ritardo dello sviluppo psicomotorio', 'ritardo globale dello sviluppo'],
  ['Epilessia', 'epilessia', 'crisi epilettiche', 'convulsioni', 'sindrome epilettica'],
  ['Cardiomiopatia ipertrofica', 'cardiomiopatia ipertrofica', 'cmi', 'hcm'],
  ['Cardiomiopatia dilatativa', 'cardiomiopatia dilatativa', 'dcm'],
  ['Cardiopatia congenita', 'cardiopatia congenita', 'difetto cardiaco congenito'],
  ['Sindrome di Marfan', 'marfan', 'sindrome di marfan'],
  ['Neurofibromatosi tipo 1', 'neurofibromatosi', 'neurofibromatosi tipo 1', 'neurofibromatosi di tipo 1', 'malattia di von recklinghausen', 'von recklinghausen'],
  ['Rene policistico', 'rene policistico', 'reni policistici', 'adpkd', 'malattia policistica renale', 'policistosi renale'],
  ['Ipercolesterolemia familiare', 'ipercolesterolemia familiare', 'fh'],
  ['Sindrome di Lynch', 'lynch', 'sindrome di lynch', 'hnpcc'],
  ['Poliposi adenomatosa familiare', 'fap', 'poliposi adenomatosa familiare', 'poliposi familiare', 'poliposi adenomatosa'],
  ['SLA', 'sla', 'sclerosi laterale amiotrofica'],
  ['Sclerosi multipla', 'sclerosi multipla'],
  ['Malattia di Alzheimer', 'alzheimer', 'morbo di alzheimer', 'malattia di alzheimer', 'demenza di alzheimer'],
  ['Malattia di Parkinson', 'parkinson', 'morbo di parkinson', 'malattia di parkinson'],
  ['Demenza', 'demenza', 'demenza senile'],
  ['Diabete tipo 1', 'diabete tipo 1', 'diabete di tipo 1', 'diabete giovanile'],
  ['Diabete tipo 2', 'diabete tipo 2', 'diabete di tipo 2'],
  ['Diabete', 'diabete', 'diabete mellito'],
  ['Ipertensione', 'ipertensione', 'ipertensione arteriosa', 'pressione alta'],
  ['Infarto', 'infarto', 'ima', 'infarto del miocardio', 'infarto miocardico', 'infarto cardiaco'],
  ['Ictus', 'ictus', 'stroke', 'ischemia cerebrale', 'emorragia cerebrale'],
  ['Celiachia', 'celiachia', 'malattia celiaca'],
  ['Emocromatosi', 'emocromatosi'],
  ['Trombofilia', 'trombofilia'],
  ['Fenilchetonuria', 'fenilchetonuria', 'pku'],
  ['Malattia di Gaucher', 'gaucher', 'malattia di gaucher'], ['Malattia di Fabry', 'fabry', 'malattia di fabry'], ['Malattia di Tay-Sachs', 'tay sachs', 'tay-sachs', 'malattia di tay-sachs'],
  ['Malattia di Wilson', 'wilson', 'malattia di wilson', 'morbo di wilson'],
  ['Charcot-Marie-Tooth', 'charcot marie tooth', 'charcot-marie-tooth', 'cmt', 'neuropatia di charcot-marie-tooth'],
  ['Sindrome di Prader-Willi', 'prader willi', 'prader-willi', 'sindrome di prader-willi', 'sindrome di prader willi'],
  ['Sindrome di Angelman', 'angelman', 'sindrome di angelman'],
  ['Sindrome di Williams', 'williams', 'sindrome di williams', 'williams-beuren', 'sindrome di williams-beuren'],
  ['Sindrome di DiGeorge', 'digeorge', 'di george', 'sindrome di digeorge', 'sindrome di di george', 'delezione 22q11', 'delezione 22q11.2', 'microdelezione 22q11', 'sindrome velocardiofacciale'],
  ['Sindrome di Noonan', 'noonan', 'sindrome di noonan'],
  ['Acondroplasia', 'acondroplasia'], ['Osteogenesi imperfetta', 'osteogenesi imperfetta', 'ossa di vetro'],
  ['Retinite pigmentosa', 'retinite pigmentosa'], ['Glaucoma', 'glaucoma'], ['Cataratta congenita', 'cataratta congenita'],
  ['Labiopalatoschisi', 'labiopalatoschisi', 'labbro leporino', 'palatoschisi', 'cheiloschisi'],
  ['Spina bifida', 'spina bifida', 'difetto del tubo neurale', 'mielomeningocele'],
  ['Morte improvvisa', 'morte improvvisa', 'morte cardiaca improvvisa', 'morte improvvisa cardiaca'],
  ['Morte in culla (SIDS)', 'morte in culla', 'sids'],
  ['Sindrome di Brugada', 'brugada', 'sindrome di brugada'], ['Sindrome del QT lungo', 'qt lungo', 'sindrome del qt lungo', 'lqts'],
  ['Ipotiroidismo congenito', 'ipotiroidismo congenito'], ['Obesità', 'obesita'], ['Cecità', 'cecita'],
  ['Insufficienza renale', 'insufficienza renale', 'irc', 'dialisi'], ['Dislipidemia', 'dislipidemia'], ['Ipercolesterolemia', 'ipercolesterolemia'],
  ['Cardiopatia ischemica', 'cardiopatia ischemica'], ['Cardiopatia', 'cardiopatia'], ['Nefropatia', 'nefropatia'],
  ['Depressione', 'depressione'], ['Disturbo bipolare', 'disturbo bipolare', 'bipolarismo'], ['Schizofrenia', 'schizofrenia'],
  ['Aborti ricorrenti', 'aborti ricorrenti', 'poliabortivita', 'abortivita ricorrente'], ['Infertilità', 'infertilita', 'sterilita'],
  // --- sindromi e malattie genetiche
  ['Sindrome di Rett', 'rett', 'sindrome di rett'], ['Sindrome di Sotos', 'sotos', 'sindrome di sotos'], ['Sindrome di Kabuki', 'kabuki', 'sindrome di kabuki'],
  ['Sindrome di Cornelia de Lange', 'cornelia de lange', 'sindrome di cornelia de lange', 'cdls'], ['Sindrome di Smith-Magenis', 'smith magenis', 'sindrome di smith magenis', 'sms'],
  ['Sindrome di Wolf-Hirschhorn', 'wolf hirschhorn', 'sindrome di wolf hirschhorn', '4p-', 'delezione 4p'], ['Sindrome del cri du chat', 'cri du chat', 'sindrome del cri du chat', 'sindrome del grido di gatto', '5p-', 'delezione 5p'],
  ['Sindrome di Beckwith-Wiedemann', 'beckwith wiedemann', 'sindrome di beckwith wiedemann', 'bws'], ['Sindrome di Silver-Russell', 'silver russell', 'sindrome di silver russell', 'srs'],
  ['Sindrome CHARGE', 'charge', 'sindrome charge', 'sindrome di charge'], ['Sindrome di Kallmann', 'kallmann', 'sindrome di kallmann'], ['Sindrome di Alport', 'alport', 'sindrome di alport'],
  ['Sindrome di Ehlers-Danlos', 'ehlers danlos', 'sindrome di ehlers danlos', 'eds', 'ehlers-danlos'], ['Sindrome di Loeys-Dietz', 'loeys dietz', 'sindrome di loeys dietz'],
  ['Sindrome di Stickler', 'stickler', 'sindrome di stickler'], ['Sindrome di Usher', 'usher', 'sindrome di usher'], ['Sindrome di Waardenburg', 'waardenburg', 'sindrome di waardenburg'],
  ['Sindrome di Pendred', 'pendred', 'sindrome di pendred'], ['Sindrome di Holt-Oram', 'holt oram', 'sindrome di holt oram'], ['Sindrome di Treacher Collins', 'treacher collins', 'sindrome di treacher collins'],
  ['Sindrome di Crouzon', 'crouzon', 'sindrome di crouzon'], ['Sindrome di Apert', 'apert', 'sindrome di apert'], ['Sequenza di Pierre Robin', 'pierre robin', 'sindrome di pierre robin', 'sequenza di pierre robin'],
  ['Sindrome di Bardet-Biedl', 'bardet biedl', 'sindrome di bardet biedl'], ['Sindrome di Joubert', 'joubert', 'sindrome di joubert'], ['Sindrome di Dravet', 'dravet', 'sindrome di dravet'],
  ['Sindrome di West', 'sindrome di west', 'spasmi infantili'], ['Sindrome di Lennox-Gastaut', 'lennox gastaut', 'sindrome di lennox gastaut'],
  ['Sclerosi tuberosa', 'sclerosi tuberosa', 'complesso della sclerosi tuberosa', 'tsc'], ['Neurofibromatosi tipo 2', 'neurofibromatosi tipo 2', 'neurofibromatosi 2'],
  ['Sindrome di von Hippel-Lindau', 'von hippel lindau', 'sindrome di von hippel lindau', 'malattia di von hippel lindau'],
  ['Neoplasia endocrina multipla tipo 1', 'neoplasia endocrina multipla tipo 1', 'men 1', 'sindrome men1'], ['Neoplasia endocrina multipla tipo 2', 'neoplasia endocrina multipla tipo 2', 'men 2', 'sindrome men2'],
  ['Sindrome di Li-Fraumeni', 'li fraumeni', 'sindrome di li fraumeni', 'lfs'], ['Sindrome di Peutz-Jeghers', 'peutz jeghers', 'sindrome di peutz jeghers'], ['Sindrome di Cowden', 'cowden', 'sindrome di cowden', 'pten hamartoma'],
  ['Sindrome ereditaria mammella-ovaio', 'hboc', 'sindrome mammella ovaio', 'tumore ereditario mammella ovaio', 'sindrome ereditaria mammella ovaio'], ['Poliposi associata a MUTYH', 'map', 'poliposi mutyh', 'poliposi associata a mutyh'],
  ['Retinoblastoma', 'retinoblastoma'], ['Tumore di Wilms', 'wilms', 'tumore di wilms', 'nefroblastoma'], ['Neuroblastoma', 'neuroblastoma'],
  // --- neuromuscolari e neurologiche
  ['Distrofia facio-scapolo-omerale', 'fshd', 'distrofia facio scapolo omerale', 'distrofia fsh'], ['Distrofia dei cingoli', 'lgmd', 'distrofia dei cingoli', 'distrofia muscolare dei cingoli'],
  ['Miastenia gravis', 'miastenia', 'miastenia gravis'], ['Atassia di Friedreich', 'friedreich', 'atassia di friedreich'], ['Atassia spinocerebellare', 'sca', 'atassia spinocerebellare'],
  ['Paraplegia spastica ereditaria', 'paraplegia spastica', 'paraplegia spastica ereditaria', 'hsp'], ['Malattia di Pompe', 'pompe', 'malattia di pompe', 'glicogenosi tipo 2'],
  ['Malattia di Kennedy', 'kennedy', 'malattia di kennedy', 'sbma'], ['Distonia', 'distonia'], ['Demenza frontotemporale', 'demenza frontotemporale', 'ftd'], ['CADASIL', 'cadasil'],
  ['Sindrome di Tourette', 'tourette', 'sindrome di tourette'], ['ADHD', 'adhd', 'deficit di attenzione', 'disturbo da deficit di attenzione', 'iperattivita'],
  ['Paralisi cerebrale infantile', 'pci', 'paralisi cerebrale', 'paralisi cerebrale infantile'], ['Idrocefalo', 'idrocefalo'], ['Microcefalia', 'microcefalia'], ['Macrocefalia', 'macrocefalia'],
  ['Emicrania', 'emicrania'], ['Aneurisma cerebrale', 'aneurisma cerebrale', 'aneurisma intracranico'], ['Malformazione di Chiari', 'chiari', 'arnold chiari', 'malformazione di chiari', 'malformazione di arnold chiari'],
  // --- metaboliche
  ['Galattosemia', 'galattosemia'], ['Deficit di MCAD', 'mcad', 'deficit di mcad', 'mcadd'], ['Leucinosi', 'leucinosi', 'msud', 'malattia delle urine a sciroppo d acero'], ['Omocistinuria', 'omocistinuria'],
  ['Mucopolisaccaridosi', 'mucopolisaccaridosi', 'mps'], ['Malattia di Niemann-Pick', 'niemann pick', 'malattia di niemann pick'], ['Malattia di Krabbe', 'krabbe', 'malattia di krabbe'],
  ['Leucodistrofia metacromatica', 'leucodistrofia metacromatica', 'mld'], ['Adrenoleucodistrofia', 'adrenoleucodistrofia', 'x ald', 'x-ald'], ['Deficit di G6PD', 'favismo', 'deficit di g6pd', 'g6pd'],
  ['Deficit di alfa-1 antitripsina', 'deficit di alfa 1 antitripsina', 'deficit di alfa1 antitripsina', 'aatd'], ['Iperplasia surrenalica congenita', 'iperplasia surrenalica congenita', 'sindrome adrenogenitale'], ['Porfiria', 'porfiria'],
  // --- ematologiche
  ['Sferocitosi ereditaria', 'sferocitosi', 'sferocitosi ereditaria'], ['Malattia di von Willebrand', 'von willebrand', 'malattia di von willebrand', 'vwd'], ['Anemia di Fanconi', 'fanconi', 'anemia di fanconi'],
  ['Fattore V Leiden', 'fattore v leiden', 'mutazione del fattore v', 'fattore 5 leiden'],
  // --- cardiovascolari
  ['Cardiomiopatia aritmogena', 'cardiomiopatia aritmogena', 'displasia aritmogena', 'arvc', 'arvd'], ['Cardiomiopatia restrittiva', 'cardiomiopatia restrittiva'],
  ['Non compattazione del ventricolo sinistro', 'non compattazione', 'lvnc', 'ventricolo sinistro non compatto'], ['CPVT', 'cpvt', 'tachicardia ventricolare polimorfa catecolaminergica'],
  ['Aneurisma aortico', 'aneurisma aortico', 'aneurisma dell aorta', 'dissezione aortica', 'taad'], ['Valvola aortica bicuspide', 'bicuspidia', 'bicuspidia aortica', 'valvola aortica bicuspide'],
  ['Fibrillazione atriale', 'fibrillazione atriale', 'fa'], ['Ipertensione polmonare', 'ipertensione polmonare'], ['Sindrome di Wolff-Parkinson-White', 'wpw', 'wolff parkinson white'],
  ['Trombosi venosa profonda', 'trombosi venosa profonda', 'tvp', 'trombosi', 'tromboembolia', 'embolia polmonare'],
  // --- renali, oculari, uditive
  ['Sindrome nefrosica', 'sindrome nefrosica'], ['Distrofia retinica', 'distrofia retinica', 'distrofia retinica ereditaria', 'ird'], ['Amaurosi congenita di Leber', 'amaurosi di leber', 'amaurosi congenita di leber', 'lca'],
  ['Malattia di Stargardt', 'stargardt', 'malattia di stargardt'], ['Neuropatia ottica di Leber', 'lhon', 'neuropatia ottica di leber'], ['Cheratocono', 'cheratocono'], ['Albinismo', 'albinismo', 'albino'],
  ['Aniridia', 'aniridia'], ['Daltonismo', 'daltonismo', 'discromatopsia'], ['Ipovisione', 'ipovisione'], ['Miopia', 'miopia', 'miopia elevata'], ['Otosclerosi', 'otosclerosi'],
  // --- scheletriche e malformative
  ['Ipocondroplasia', 'ipocondroplasia'], ['Displasia tanatofora', 'displasia tanatofora'], ['Displasia scheletrica', 'displasia scheletrica'], ['Esostosi multiple', 'esostosi multiple', 'esostosi multipla ereditaria'],
  ['Bassa statura', 'bassa statura'], ['Scoliosi', 'scoliosi'], ['Polidattilia', 'polidattilia'], ['Sindattilia', 'sindattilia'], ['Piede torto', 'piede torto'], ['Displasia congenita dell\'anca', 'displasia dell anca', 'displasia congenita dell anca', 'lussazione congenita dell anca'],
  ['Difetto interventricolare', 'div', 'difetto interventricolare', 'difetto del setto interventricolare'], ['Difetto interatriale', 'difetto interatriale', 'difetto del setto interatriale'],
  ['Tetralogia di Fallot', 'fallot', 'tetralogia di fallot'], ['Ernia diaframmatica congenita', 'ernia diaframmatica', 'ernia diaframmatica congenita'], ['Onfalocele', 'onfalocele'], ['Gastroschisi', 'gastroschisi'],
  ['Atresia esofagea', 'atresia esofagea', 'atresia dell esofago'], ['Ipospadia', 'ipospadia'], ['Criptorchidismo', 'criptorchidismo', 'testicolo ritenuto'], ['Agenesia renale', 'agenesia renale'], ['Anencefalia', 'anencefalia'],
  ['Idronefrosi', 'idronefrosi'], ['Oloprosencefalia', 'oloprosencefalia', 'holoprosencefalia'],
  // --- endocrine e altre
  ['Diabete MODY', 'mody', 'diabete mody'], ['Diabete gestazionale', 'diabete gestazionale'], ['Ipotiroidismo', 'ipotiroidismo'], ['Ipertiroidismo', 'ipertiroidismo', 'morbo di basedow', 'basedow'],
  ['Sindrome dell\'ovaio policistico', 'pcos', 'ovaio policistico', 'sindrome dell ovaio policistico', 'micropolicistosi ovarica'], ['Insufficienza ovarica prematura', 'insufficienza ovarica prematura', 'menopausa precoce', 'pof', 'poi'],
  ['Febbre mediterranea familiare', 'fmf', 'febbre mediterranea familiare'], ['Sindrome di Gilbert', 'gilbert', 'sindrome di gilbert'], ['Psoriasi', 'psoriasi'], ['Lupus eritematoso sistemico', 'lupus', 'les', 'lupus eritematoso sistemico'],
  ['Artrite reumatoide', 'artrite reumatoide'], ['Malattia di Crohn', 'crohn', 'morbo di crohn', 'malattia di crohn'], ['Rettocolite ulcerosa', 'rettocolite', 'rettocolite ulcerosa', 'colite ulcerosa'],
  ['Osteoporosi', 'osteoporosi'], ['Asma', 'asma'], ['Allergia', 'allergia', 'allergie'],
  // --- oncologia non d'organo
  ['Leucemia', 'leucemia', 'lla', 'lma', 'llc', 'lmc', 'leucemia acuta', 'leucemia cronica'], ['Linfoma', 'linfoma', 'linfoma di hodgkin', 'linfoma non hodgkin', 'lnh'], ['Mieloma multiplo', 'mieloma', 'mieloma multiplo'],
  ['Sarcoma', 'sarcoma'], ['Glioblastoma', 'glioblastoma', 'glioma'], ['Mesotelioma', 'mesotelioma'], ['Melanoma', 'melanoma', 'melanoma cutaneo'],
  // --- prenatale
  ['Translucenza nucale aumentata', 'translucenza nucale aumentata', 'nt aumentata', 'plica nucale aumentata'], ['Ritardo di crescita intrauterino', 'iugr', 'fgr', 'ritardo di crescita intrauterino', 'restrizione di crescita fetale'],
  ['Polidramnios', 'polidramnios'], ['Oligoidramnios', 'oligoidramnios'], ['Idrope fetale', 'idrope', 'idrope fetale']
];
// organi per i tumori scritti in forma abbreviata (K polmone, ca mammella, neo colon)
const ORGANI = [
  ['mammella', 'della mammella', ['mammella', 'seno', 'mammario', 'mammaria', 'mamma']], ['ovaio', "dell'ovaio", ['ovaio', 'ovarico', 'ovaie', 'ovarica']],
  ['colon', 'del colon', ['colon', 'colon retto', 'colon-retto', 'colorettale', 'intestino']], ['retto', 'del retto', ['retto', 'rettale']],
  ['prostata', 'della prostata', ['prostata', 'prostatico']], ['polmone', 'del polmone', ['polmone', 'polmonare', 'polmoni']],
  ['stomaco', 'dello stomaco', ['stomaco', 'gastrico']], ['pancreas', 'del pancreas', ['pancreas', 'pancreatico']],
  ['utero', "dell'utero", ['utero', 'uterino', 'collo dell utero', 'cervice']], ['endometrio', "dell'endometrio", ['endometrio', 'endometriale']],
  ['tiroide', 'della tiroide', ['tiroide', 'tiroideo']], ['rene', 'del rene', ['rene', 'renale']], ['vescica', 'della vescica', ['vescica', 'vescicale']],
  ['fegato', 'del fegato', ['fegato', 'epatico']], ['cervello', 'cerebrale', ['cervello', 'cerebrale', 'encefalo']], ['pelle', 'della pelle', ['pelle', 'cute', 'cutaneo']],
  ['testicolo', 'del testicolo', ['testicolo', 'testicolare']], ['esofago', "dell'esofago", ['esofago']], ['vie biliari', 'delle vie biliari', ['vie biliari', 'colangiocarcinoma']]
];
// aggettivi clinici: «iperteso», «diabetica», «autistico» ...
const AGG_MALATTIA = [
  [/^ipertes[oaie]$/, 'Ipertensione'], [/^diabetic[oaih]e?$|^diabetic[oaie]$/, 'Diabete'], [/^epilettic[oaih]e?$|^epilettic[oaie]$/, 'Epilessia'],
  [/^autistic[oaih]e?$|^autistic[oaie]$/, 'Autismo'], [/^cardiopatic[oaih]e?$|^cardiopatic[oaie]$/, 'Cardiopatia'], [/^obes[oaie]$/, 'Obesità'],
  [/^sord[oaie]$|^ipoacusic[oaih]e?$/, 'Sordità'], [/^ciec[oaih]e?$|^cieca$/, 'Cecità'], [/^celiac[oaih]e?$/, 'Celiachia'],
  [/^talassemic[oaih]e?$/, 'Talassemia'], [/^emofilic[oaih]e?$/, 'Emofilia A'], [/^dislipidemic[oaih]e?$/, 'Dislipidemia'],
  [/^ipercolesterolemic[oaih]e?$/, 'Ipercolesterolemia'], [/^nefropatic[oaih]e?$/, 'Nefropatia'], [/^dializzat[oaie]$/, 'Insufficienza renale'],
  [/^ipovedent[ei]$/, 'Ipovisione'], [/^miop[ei]$/, 'Miopia'], [/^daltonic[oaih]e?$/, 'Daltonismo'], [/^asmatic[oaih]e?$/, 'Asma'], [/^allergic[oaih]e?$/, 'Allergia'],
  [/^depress[oaie]$/, 'Depressione'], [/^bipolar[ei]$/, 'Disturbo bipolare'], [/^schizofrenic[oaih]e?$/, 'Schizofrenia'], [/^infertil[ei]$/, 'Infertilità']
];
const AGG_PORTATORE = [[/^microcitemic[oaih]e?$|^microcitemic[oaie]$/, 'Talassemia']];
const normDiz = s => lowA(String(s)).replace(/[’'`´]/g, "'").replace(/[^a-z0-9' -]/g, ' ').replace(/\s+/g, ' ').trim();
const MAL_IDX = {};
MALATTIE.forEach(([canon, ...al]) => { [canon, ...al].forEach(a => { MAL_IDX[normDiz(a)] = canon; MAL_IDX[normDiz(a).replace(/'/g, ' ').replace(/\s+/g, ' ')] = canon; }); });
const SIGLE_MALATTIA = new Set(MALATTIE.flatMap(([c, ...al]) => al).filter(a => /^[a-z0-9]{2,6}$/.test(a)));
function tumoreDa(organo) {
  const k = normDiz(organo).replace(/^(?:al|alla|allo|ai|alle|del|della|dello|dei|delle|di|d'|dell'|all'|nel|nella|sul)\s*/, '');
  for (const [, prep, al] of ORGANI) if (al.some(a => k === a || k.startsWith(a + ' '))) return 'Tumore ' + prep;
  return null;
}
function malattiaCanonica(nome) {
  let s = String(nome || '').trim();
  let sosp = false;
  const n0 = normDiz(s);
  let n = n0.replace(/^(?:sospett[oaie]|probabile|possibile|presunt[oaie])\s+/, m => { sosp = true; return ''; })
            .replace(/\s+(?:sospett[oaie]|da confermare|\(sospett[oaie]\))$/, m => { sosp = true; return ''; })
            .replace(/^(?:una?\s+|la\s+|il\s+|l'\s*)?(?:forma|quadro|sindrome clinica)\s+(?:lieve|grave|severa|classica|atipica|lieve-moderata|moderata)?\s*(?:di|del|della|dell')\s*/, '')
            .replace(/^(?:il|lo|la|l'|i|gli|le|un|uno|una)\s+/, '').replace(/^l'/, '');
  let canon = MAL_IDX[n] || MAL_IDX[n.replace(/'/g, ' ').replace(/\s+/g, ' ')] || null;
  if (!canon) { const m = /^(?:k|ca|neo|cancro|carcinoma|tumore|neoplasia|adenocarcinoma)\s+(.+)$/.exec(n); if (m && /^(?:k|ca|neo)$/.test(n.split(' ')[0])) canon = tumoreDa(m[1]); }
  if (!canon) canon = n0 === normDiz(s) ? s : s;
  if (!MAL_IDX[n] && canon === s) { s = s.replace(/^(?:una?\s+|la\s+|il\s+)?(?:forma|quadro)\s+(?:lieve|grave|severa|classica|atipica|moderata)?\s*(?:di|del|della)\s+/i, '').replace(/^l'(?=[a-zà-ÿ])/i, ''); canon = cap(s); }
  return sosp ? canon + ' (sospetta)' : canon;
}
function sembraMalattia(t) {
  const nuda = String(t || '').replace(/\s+(?:a|ad|all'et[aà] di)\s+\d{1,3}\s*(?:anni|aa)?\s*$/i, '').replace(/^\s*(?:una?|la|il|lo|l')\s+/i, '').trim();
  if (!nuda) return false;
  return eMalattiaNota(nuda) || looksVariant(nuda) || malattiaCanonica(nuda) !== cap(nuda) || /^(?:tumore|tumori|cancro|carcinoma|ca|k|neo|neoplasia|adenocarcinoma|melanoma|linfoma|leucemia|sarcoma|mieloma|glioma|sindrome|malattia|morbo|distrofia|atrofia|deficit|deficienza|anemia|cardiomiopatia|miopatia|neuropatia|encefalopatia|epilessia|ritardo|disabilit[aà]|autismo|diabete|ipertensione|ipo\w+|iper\w+|insufficienza|malformazion\w*|cardiopatia)(?![\p{L}])/iu.test(nuda);
}
function eMalattiaNota(nome) { const n = normDiz(nome); return !!MAL_IDX[n]; }
// numeri in lettere per le eta' («quarantacinque anni»)
const UNITA = { uno: 1, un: 1, due: 2, tre: 3, quattro: 4, cinque: 5, sei: 6, sette: 7, otto: 8, nove: 9 };
const DIECI = { dieci: 10, undici: 11, dodici: 12, tredici: 13, quattordici: 14, quindici: 15, sedici: 16, diciassette: 17, diciotto: 18, diciannove: 19 };
const DECINE = { venti: 20, trenta: 30, quaranta: 40, cinquanta: 50, sessanta: 60, settanta: 70, ottanta: 80, novanta: 90, cento: 100 };
function numeroDaParola(w) {
  w = lowA(w).replace(/'$/, '');
  if (UNITA[w] != null) return UNITA[w]; if (DIECI[w] != null) return DIECI[w]; if (DECINE[w] != null) return DECINE[w];
  for (const [d, v] of Object.entries(DECINE)) {
    const radice = d.replace(/[ai]$/, '');
    if (w === radice) return v;
    for (const [u, k] of Object.entries(UNITA)) { if (w === d + u || w === radice + u) return v + k; }
  }
  return null;
}
function numeriInLettere(text) {
  return text.replace(/(?<![\p{L}])([a-zà-ÿ]+)(?:'|\s+)(anni|anno|mesi|mese|settimane|giorni)(?![\p{L}])/giu, (m, w, u) => { const n = numeroDaParola(w); return n != null && n > 1 || (n === 1 && /anno|mese/.test(u)) ? n + ' ' + u : m; });
}
// gergo, abbreviazioni, inglese, parole di riempimento
function preNormalizza(text) {
  let t = text;
  t = t.replace(/^(?:\s*(?:allora|dunque|ok|okay|bene|quindi|poi|inoltre|anzi|scusa|scusate|correggo|correzione|correggi|in realt[aà]|attenzione|nb|n\.b\.|ah|ecco|no)\s*[,:;.!]?\s+)+/i, '');
  t = numeriInLettere(t);
  t = t.replace(/(?<![\p{L}])(?:interruzion[ei]\s+(?:volontari[ae]\s+|terapeutic[ah]e?\s+|precoc[ei]\s+)?(?:di|della)\s+gravidanz[ae]|abort[oi]\s+(?:terapeutic[oi]|volontari[oi]|indott[oi])|i\.?v\.?g\.?|i\.?t\.?g\.?)(?![\p{L}])/giu, m => /terapeutic|i\.?t\.?g/i.test(m) ? 'ITG' : 'IVG');
  t = t.replace(/(?<![\p{L}])(?:nat[oaie]\s+mort[oaie]|mort[oaie]\s+alla\s+nascita|mef|morte\s+endouterina(?:\s+fetale)?)(?![\p{L}])/giu, 'natomorto');
  t = t.replace(/†\s*/g, ' deceduto ');
  t = t.replace(/(?<![\p{L}])(?:pz|paz\.|proband|index case|caso\s+indice|paziente\s+indice)(?![\p{L}])/giu, 'probando');
  t = t.replace(/(?<![\p{L}])unaffected(?![\p{L}])/giu, 'sano').replace(/(?<![\p{L}])affected(?![\p{L}])/giu, 'affetto');
  t = t.replace(/(?<![\p{L}])het(?:erozygous)?(?![\p{L}])/giu, 'eterozigote').replace(/(?<![\p{L}])hom(?:ozygous)?(?![\p{L}])/giu, 'omozigote').replace(/(?<![\p{L}])hemizygous(?![\p{L}])/giu, 'emizigote');
  t = t.replace(/(?<![\p{L}])(?:wt|wild[\s-]?type)(?![\p{L}])/giu, 'negativo');
  t = t.replace(/(?<![\p{L}])MZ(?![\p{L}])/g, 'monozigoti').replace(/(?<![\p{L}])DZ(?![\p{L}])/g, 'dizigoti');
  t = t.replace(/(?<![\p{L}])(eterozigot[ei]|omozigot[ei]|emizigot[ei]|portat(?:ore|rice|ori|rici)(?:\s+san[oaie])?|positiv[oaie]|negativ[oaie])\s+(?!per\b|di\b|a\b|della\b|del\b|alla\b|al\b)(\S+)/giu, (m, w, nx) => (isGeneTok(nx) || /^[cgp]\./i.test(nx)) && !eMalattiaNota(nx) ? `${w} per ${nx}` : m);
  const anno = new Date().getFullYear();
  t = t.replace(/(?<![\p{L}])(?:nat[oaie]\s+(?:nel|il\s+\d{1,2}[\/.-]\d{1,2}[\/.-])\s*|classe\s+)((?:19|20)\d{2})(?!\d)/giu, (m, y) => 'di ' + Math.max(0, anno - +y) + ' anni');
  t = t.replace(/(?<![\p{L}])(etero|omo|emi)zigot[ao](?![\p{L}])/giu, '$1zigote');
  t = t.replace(/(?<![\p{L}])(?:(?:e|è)\s+)?(?:venut[oaie]\s+a\s+mancare|mancat[oaie]|scompars[oaie]|spent[oaie]|ci\s+ha\s+lasciat[oaie]|exitus)(?![\p{L}])/giu, ' è deceduto');
  t = t.replace(/(?<![\p{L}])(?:ha|hanno)\s+(?:avuto\s+|ricevuto\s+)?(?:una\s+|la\s+)?diagnosi\s+(?:di|per)\s+/giu, 'è affetto da ');
  t = t.replace(/(?<![\p{L}])(?:(?:e|è|sono)\s+)?(?:stat[oaie]\s+)?(?:operat[oaie]\s+(?:di|per)|trattat[oaie]\s+per|in\s+cura\s+per|seguit[oaie]\s+per|colpit[oaie]\s+da|ammalat[oaie]\s+di|si\s+(?:e|è)\s+ammalat[oaie]\s+di|diagnosticat[oaie]\s+(?:con|di|per))\s+/giu, ' è affetto da ');
  t = t.replace(/(?<![\p{L}])ha\s+sviluppato\s+/giu, 'ha ').replace(/(?<![\p{L}])(presenta|presentano)\s+(?!una\s+variante|la\s+variante|la\s+mutazione)/giu, (m, v) => v === 'presenta' ? 'ha ' : 'hanno ');
  t = t.replace(/(?<![\p{L}])non\s+mutat[oaie](?![\p{L}])/giu, 'negativo').replace(/(?<![\p{L}])mutat[oaie]\s+(?:per\s+|in\s+|nel\s+gene\s+)?(?=\S)/giu, 'positivo per ');
  t = t.replace(/(?<![\p{L}])non\s+vedent[ei](?![\p{L}])/giu, 'cieco').replace(/(?<![\p{L}])non\s+udent[ei](?![\p{L}])/giu, 'sordo');
  t = t.replace(/(?<![\p{L}])(?:intorno|attorno)\s+ai\s+(\d{1,3})|(?<![\p{L}])verso\s+i\s+(\d{1,3})|(?<![\p{L}])sui\s+(\d{1,3})(?=\s*anni)|(?<![\p{L}])circa\s+a\s+(\d{1,3})/giu, (m, a, b, c, d) => 'a ' + (a || b || c || d));
  t = t.replace(/^\s*(?:c'erano|c'era|ci\s+sono\s+stat[ie]|abbiamo|esistono|esiste|ci\s+sono\s+anche)\s+(?:anche\s+)?/i, 'aggiungi ');
  t = t.replace(/(cugin[oaie])\s+(?:di\s+)?prim[oa]\s+grado/gi, '$1').replace(/(?<![\p{L}])(?:prim[oi]|prime)\s+(cugin[oaie])/giu, '$1');
  t = t.replace(/(?<![\p{L}])(?:trait|tratto)\s+talassemic[oa]/giu, 'talassemia').replace(/(?<![\p{L}])trait(?![\p{L}])/giu, '');
  return t;
}
// correzione dei refusi sulle parole chiave (affeto, portarice, eterozigoe, ...)
const TERMINI = ['affetto','affetta','affetti','affette','portatore','portatrice','portatori','portatrici','deceduto','deceduta','deceduti','decedute','eterozigote','eterozigoti','omozigote','omozigoti','emizigote',
  'gemello','gemella','gemelli','gemelle','monozigoti','monozigote','dizigoti','dizigote','positivo','positiva','negativo','negativa','asintomatico','asintomatica','adottato','adottata','separati','divorziati',
  'consanguinei','mutazione','variante','gemellare','gemellari','gravidanza','gravidanze','biochimica','biochimiche','ectopica','ectopiche','trimestre','aggiungi','rimuovi','probando','probanda','diagnosticato','diagnosticata','sindrome','talassemia','microcitemico','microcitemica'];
function correggiTermini(text, R) {
  return text.replace(/(?<![\p{L}\d.@_>-])([A-Za-zà-ÿ]{6,})(?![\p{L}\d.>_-])/gu, (w, _, off) => {
    const l = lowA(w);
    if (TERMINI.includes(l) || REL[l] || SIDE[l] || MAL_IDX[l] || /^[A-Z]/.test(w) && off > 0) return w;
    let best = null, bd = 9, tie = false;
    for (const c of TERMINI) { if (c[0] !== l[0] || Math.abs(c.length - l.length) > 1) continue; const d = dl(l, c); if (d <= (c.length >= 9 ? 2 : 1)) { if (d < bd) { bd = d; best = c; tie = false; } else if (d === bd && c !== best) tie = true; } }
    if (!best || tie) return w;
    if (R) R.fixes.push([w, best]);
    return best;
  });
}

/* ---------- state ---------- */
function blankPerson(id, sex) {
  return { id, sex: sex || 'U', name: '', age: '', deceased: false, deathAge: '', conditions: [], carriers: [],
    variants: [], parentUnion: null, unions: [], miscarriage: false, pregnancy: false, adopted: false, twin: null, mz: false, twinType: '', noKids: '', note: '' };
}
function newState() {
  const S = { people: {}, unions: {}, probandId: 'p1', seq: 2, useq: 1, tseq: 1, conditions: [], code: '' };
  S.people.p1 = blankPerson('p1', 'U');
  return S;
}
function mk(S, sex) { const id = 'p' + (S.seq++); S.people[id] = blankPerson(id, sex); return id; }
function orient(S, u) {
  const A = S.people[u.a], B = S.people[u.b];
  if (A && B && A.sex === 'F' && B.sex === 'M') { const t = u.a; u.a = u.b; u.b = t; }
}
function mkUnion(S, x, y) {
  const id = 'u' + (S.useq++);
  const u = { id, a: x, b: y, children: [], consang: false, separated: '', noKids: '' };
  S.unions[id] = u; orient(S, u);
  if (x) S.people[x].unions.push(id);
  if (y) S.people[y].unions.push(id);
  return u;
}
function parentU(S, id) { const p = S.people[id]; return p && p.parentUnion ? S.unions[p.parentUnion] : null; }
function fatherOf(S, id) { const u = parentU(S, id); if (!u) return null; return [u.a, u.b].find(x => x && S.people[x].sex === 'M') || u.a || null; }
function motherOf(S, id) { const u = parentU(S, id); if (!u) return null; return [u.b, u.a].find(x => x && S.people[x].sex === 'F') || u.b || null; }
function unionsOf(S, id) { return S.people[id].unions.map(u => S.unions[u]).filter(Boolean); }
function partnersOf(S, id) { return unionsOf(S, id).map(u => u.a === id ? u.b : u.a).filter(Boolean); }
function childrenOf(S, id) { return unionsOf(S, id).flatMap(u => u.children); }
function fullSibs(S, id) { const u = parentU(S, id); return u ? u.children.filter(c => c !== id) : []; }
function halfSibs(S, id) {
  const u = parentU(S, id); if (!u) return [];
  const out = [];
  [u.a, u.b].filter(Boolean).forEach(par => unionsOf(S, par).forEach(w => { if (w.id !== u.id) out.push(...w.children); }));
  return out;
}
function ensureParents(S, id, R) {
  let u = parentU(S, id);
  if (u) return u;
  const f = mk(S, 'M'), m = mk(S, 'F');
  u = mkUnion(S, f, m); u.children.push(id); S.people[id].parentUnion = u.id;
  if (R) { R.implicit.push(f, m); }
  return u;
}
function ensurePartnerUnion(S, id, R) {
  const us = unionsOf(S, id);
  if (us.length) return us[0];
  const sx = S.people[id].sex;
  const q = mk(S, sx === 'M' ? 'F' : sx === 'F' ? 'M' : 'U');
  if (R) R.implicit.push(q);
  return mkUnion(S, id, q);
}
function addChild(S, u, sex) { const c = mk(S, sex); S.people[c].parentUnion = u.id; u.children.push(c); return c; }
function ancestors(S, id) {
  const out = new Set(), q = [id];
  while (q.length) { const x = q.pop(); const u = parentU(S, x); if (!u) continue; [u.a, u.b].forEach(p => { if (p && !out.has(p)) { out.add(p); q.push(p); } }); }
  return out;
}
function related(S, a, b) {
  if (!a || !b || a === b) return false;
  const A = ancestors(S, a), B = ancestors(S, b);
  if (A.has(b) || B.has(a)) return true;
  for (const x of A) if (B.has(x)) return true;
  return false;
}
function unionBetween(S, a, b, R) {
  let u = unionsOf(S, a).find(w => w.a === b || w.b === b);
  if (u) return u;
  u = mkUnion(S, a, b);
  if (related(S, a, b)) {
    u.consang = true;
    if (R) R.log.push({ type: 'warn', text: `⟨${a}⟩ e ⟨${b}⟩ sono consanguinei: unione segnata con linea doppia.`, ids: [a, b] });
  }
  return u;
}
function isBlankPerson(S, id) {
  const p = S.people[id];
  return p && !p.name && !p.age && !p.deceased && !p.conditions.length && !p.carriers.length && !(p.variants || []).length && !p.parentUnion && p.unions.length <= 1 && id !== S.probandId;
}
function linkSiblings(S, ids, R) {
  ids = [...new Set(ids)];
  let base = ids.map(i => parentU(S, i)).find(Boolean);
  if (!base) base = ensureParents(S, ids[0], R);
  for (const id of ids) {
    const p = S.people[id], u = parentU(S, id);
    if (u && u.id === base.id) continue;
    if (!u) { p.parentUnion = base.id; base.children.push(id); continue; }
    if ([u.a, u.b].filter(Boolean).every(x => isBlankPerson(S, x))) {
      u.children.forEach(c => { S.people[c].parentUnion = base.id; if (!base.children.includes(c)) base.children.push(c); });
      [u.a, u.b].filter(Boolean).forEach(x => delete S.people[x]);
      delete S.unions[u.id];
      continue;
    }
    throw new UErr(`⟨${ids[0]}⟩ e ⟨${id}⟩ hanno già genitori diversi nel pedigree: non posso renderli fratelli. Se sono fratellastri scrivi ad esempio «un fratello da parte di padre».`);
  }
  return base;
}
function setTwins(S, ids, mz, R) {
  ids = [...new Set(ids)];
  if (ids.length < 2) throw new UErr('Per i gemelli servono almeno due persone: ad esempio «il probando e la sorella sono gemelli monozigoti».');
  const pu = ids.map(i => S.people[i].parentUnion);
  if (new Set(pu).size > 1 || !pu[0]) linkSiblings(S, ids, R);
  const P = S.people;
  let t = ids.map(i => P[i].twin).find(Boolean) || ('t' + (S.tseq++));
  const type = mz === true ? 'MZ' : mz === false ? 'DZ' : null;
  ids.forEach(i => { P[i].twin = t; });
  Object.values(P).forEach(q => { if (q.twin === t) { if (type) q.twinType = type; else if (!q.twinType) q.twinType = '?'; q.mz = q.twinType === 'MZ'; } });
  return t;
}
function conditionsOf(S, ids) { const out = []; ids.forEach(i => (S.people[i] ? S.people[i].conditions : []).forEach(c => { if (!out.includes(c.name)) out.push(c.name); })); return out; }
function variantsOf(S, ids) { const out = []; ids.forEach(i => ((S.people[i] && S.people[i].variants) || []).forEach(v => { if (!v.neg && v.text !== 'test' && !out.includes(v.text)) out.push(v.text); })); return out; }
function familyConditions(S) { return conditionsOf(S, Object.keys(S.people)); }
function familyVariants(S) { return variantsOf(S, Object.keys(S.people)); }
const SYN = { tumore:'tumore', tumori:'tumore', cancro:'tumore', carcinoma:'tumore', carcinomi:'tumore', neoplasia:'tumore', neoplasie:'tumore', ca:'tumore', adenocarcinoma:'tumore', k:'tumore', neo:'tumore',
  seno:'mammella', mammella:'mammella', mammario:'mammella', mammaria:'mammella', mammarie:'mammella',
  ovaio:'ovaio', ovaie:'ovaio', ovarico:'ovaio', ovarica:'ovaio', colon:'colon', colico:'colon', colorettale:'colon',
  retto:'retto', rettale:'retto', prostata:'prostata', prostatico:'prostata', stomaco:'stomaco', gastrico:'stomaco', gastrica:'stomaco',
  pancreas:'pancreas', pancreatico:'pancreas', polmone:'polmone', polmonare:'polmone', polmoni:'polmone', tiroide:'tiroide', tiroideo:'tiroide', tiroidea:'tiroide',
  endometrio:'endometrio', endometriale:'endometrio', utero:'utero', uterino:'utero', rene:'rene', renale:'rene', vescica:'vescica', vescicale:'vescica',
  fegato:'fegato', epatico:'fegato', cervello:'cervello', cerebrale:'cervello', infarto:'infarto', ima:'infarto', ictus:'ictus', stroke:'ictus' };
const STOPC = new Set(['il','lo','la','i','gli','le','un','uno','una','al','alla','allo','ai','alle','agli','del','della','dello','dei','delle','degli','di','da','a','in','e','ed','con','per','sul','sulla','nel','nella','maligno','maligna','malattia','dell','all','nell','sull','dall','l','d']);
function condKey(s) { return [...new Set(lowA(s).replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w && !STOPC.has(w)).map(w => SYN[w] || w))].sort().join(' '); }
function condMatches(query, name) {
  const q = condKey(query).split(' ').filter(Boolean), n = condKey(name).split(' ').filter(Boolean);
  if (!q.length) return false;
  return q.every(w => n.some(x => x === w || (w.length >= 5 && dl(w, x) <= 1) || (w.length >= 4 && x.startsWith(w))));
}
const GENES_NODIGIT = new Set(['cftr','apc','atm','htt','dmd','pten','mutyh','stk11','ret','vhl','hfe','gba','ttr','ldlr','apob','fbn1','gjb2','hbb','mefv','nf2','tsc','rb','men','smn','brca','lynch','palb','rad','chek','epcam','bard','brip','tp','cdkn2a','mitf','bap','pms','msh','mlh','pkd','col','scn','kcnq','kcnh','myh','mybpc','lmna','tnnt','pkp','dsp','dsg','fmr','dmpk','sod','c9orf72','fus','tardbp','lrrk','snca','gck','hnf','abcc','kcnj']);
function isGeneTok(raw) {
  if (/^[a-z]\d{1,4}([a-z*]|del|dup)$/i.test(raw)) return false;
  if (typeof MAL_IDX !== 'undefined' && MAL_IDX[String(raw).toLowerCase()] && !/^(dmd|apc|ret|tsc|vhl)$/i.test(raw)) return false;
  const w = raw.replace(/[^A-Za-z0-9-]/g, '');
  if (!w || w.length < 2 || w.length > 10) return false;
  const l = w.toLowerCase();
  if (/^(nm|nc|ng|enst)_/i.test(raw)) return true;
  if (/^[a-z]{2,6}\d{1,2}[a-z]?\d?$/i.test(w) && !/^(dx|ca|aa|ii|iii|iv)\d*$/i.test(w)) return true;
  if (GENES_NODIGIT.has(l) && l.length >= 3) return true;
  if (/^[A-Z][A-Z0-9]{2,7}$/.test(w) && !/^(IMA|DNA|RNA|NGS|PCR|ADHD|HIV|SLA|BPCO)$/.test(w)) return true;
  return false;
}
function looksVariant0(s) {
  if (!s) return false;
  if (/(?<![a-z])[cgpmnr]\.[\[(*\-0-9a-z]/i.test(s) || /(?:^|\s)(?:nm|nc|ng|enst)_\d/i.test(s) || /(?:^|\s)rs\d{3,}/i.test(s)) return true;
  const toks = s.trim().split(/\s+/).filter(t => !/^(la|il|una|un|mutazione|variante|patogenetica|patogena|del|nel|gene|in|di|della|sul)$/i.test(t));
  return toks.length > 0 && toks.length <= 3 && isGeneTok(toks[0]);
}
function normVariant0(s) {
  s = s.replace(/^[\s:,]+|[\s:,;.]+$/g, '').replace(/\s+/g, ' ').replace(/(?<![A-Za-z])([cgpmnr])\.\s+(?=[\d(*\-A-Za-z\[])/g, '$1.');
  while (/\)$/.test(s) && (s.match(/\(/g) || []).length < (s.match(/\)/g) || []).length) s = s.slice(0, -1);
  if ((s.match(/\(/g) || []).length > (s.match(/\)/g) || []).length) s += ')';
  s = s.replace(/^\(+/, m => (s.match(/\)/g) || []).length ? '' : m);
  s = s.replace(/^(?:(?:una|la|il|le|delle|della|di|del|nel|sul|in|per|a|al|gene|test|mutazion[ei]|variant[ei]|patogen\w*|probabilmente|genetic[ao])\s+)+/i, '');
  s = s.replace(/\s+(?:in|nel|sul)\s+(?:gene\s+)?/i, ' ');
  s = s.split(' ').map(t => {
    if (/^[a-z]\d{1,4}[a-z*]$/i.test(t) && !/^[cgpmnr]\./i.test(t)) return t.toUpperCase();          // G542X, R117H
    if (/^[a-z]\d{1,4}(del|dup|ins\w*|fs\w*)$/i.test(t)) return t[0].toUpperCase() + t.slice(1).toLowerCase(); // F508del
    return isGeneTok(t) && !/[a-z]\.\S/i.test(t) ? t.toUpperCase() : t;
  }).join(' ');
  return s.replace(/\s*:\s*(?=[cpg]\.)/i, ' ');
}
function registerCondition(S, name) {
  const eISCN = /^(?:t|inv|rob|ins|del|dup|der|r|i|upd)\(|^(?:mos\s+)?(?:4[4-9]|69|92),|^arr|^Cariotipo /.test(name);
  if (!eISCN && typeof malattiaCanonica === 'function') { const c0 = malattiaCanonica(name); if (c0 && !/\(sospetta\)$/.test(c0) || c0) name = c0 || name; }
  const k = name.toLowerCase(), key = condKey(name);
  let c = S.conditions.find(x => x.name.toLowerCase() === k) || (key ? S.conditions.find(x => condKey(x.name) === key) : null);
  if (!c) {
    const used = new Set(S.conditions.map(x => x.color));
    const color = PALETTE.find(p => !used.has(p)) || PALETTE[S.conditions.length % PALETTE.length];
    c = { name, color, inh: (S.inhUser && S.inhUser[name]) || INH[name] || '' }; S.conditions.push(c);
  }
  return c.name;
}
function pruneConditions(S) {
  const used = new Set();
  Object.values(S.people).forEach(p => { p.conditions.forEach(c => used.add(c.name.toLowerCase())); p.carriers.forEach(c => used.add(c.toLowerCase())); });
  S.conditions = S.conditions.filter(c => used.has(c.name.toLowerCase()));
}

/* ---------- relations: get ---------- */
function sexFilter(S, ids, np) {
  if (np.gen || !np.s || np.both) return ids;
  return ids.filter(id => S.people[id].sex === np.s);
}
function sideParents(S, b, side) {
  const out = [];
  if (!side || side === 'P') { const f = fatherOf(S, b); if (f) out.push(f); }
  if (!side || side === 'M') { const m = motherOf(S, b); if (m) out.push(m); }
  return out;
}
function getRel(S, b, np) {
  const P = S.people;
  let ids = [];
  switch (np.r) {
    case 'self': return [b];
    case 'padre': { const f = fatherOf(S, b); return f ? [f] : []; }
    case 'madre': { const m = motherOf(S, b); return m ? [m] : []; }
    case 'genitori': { const u = parentU(S, b); return u ? [u.a, u.b].filter(Boolean) : []; }
    case 'fratello': ids = np.half ? halfSibs(S, b) : fullSibs(S, b); if (!ids.length && !np.half) ids = halfSibs(S, b); ids = ids.filter(i => !P[i].miscarriage); break;
    case 'gemello': { const t = P[b].twin; ids = t ? fullSibs(S, b).filter(i => P[i].twin === t) : []; break; }
    case 'figlio': ids = childrenOf(S, b).filter(i => !P[i].miscarriage && !P[i].pregnancy); break;
    case 'aborto': ids = childrenOf(S, b).filter(i => P[i].miscarriage); break;
    case 'gravidanza': ids = childrenOf(S, b).filter(i => P[i].pregnancy); break;
    case 'nonno': ids = sideParents(S, b, np.side).flatMap(p => getRel(S, p, { r: 'genitori' })); break;
    case 'bisnonno': ids = sideParents(S, b, np.side).flatMap(p => getRel(S, p, { r: 'genitori' })).flatMap(p => getRel(S, p, { r: 'genitori' })); break;
    case 'zio': ids = sideParents(S, b, np.side).flatMap(p => fullSibs(S, p)).filter(i => !P[i].miscarriage); break;
    case 'prozio': ids = sideParents(S, b, np.side).flatMap(p => getRel(S, p, { r: 'genitori' })).flatMap(p => fullSibs(S, p)); break;
    case 'cugino': ids = sideParents(S, b, np.side).flatMap(p => fullSibs(S, p)).flatMap(z => childrenOf(S, z)).filter(i => !P[i].miscarriage); break;
    case 'nipote': ids = fullSibs(S, b).flatMap(s => childrenOf(S, s)); if (!ids.length) ids = childrenOf(S, b).flatMap(c => childrenOf(S, c)); ids = ids.filter(i => !P[i].miscarriage); break;
    case 'partner': ids = partnersOf(S, b); break;
    case 'suocero': ids = partnersOf(S, b).flatMap(p => getRel(S, p, { r: 'genitori' })); break;
    case 'cognato': ids = [...fullSibs(S, b).flatMap(s => partnersOf(S, s)), ...partnersOf(S, b).flatMap(p => fullSibs(S, p))]; break;
    case 'patrigno': { const par = np.s === 'F' ? fatherOf(S, b) : motherOf(S, b); const altro = np.s === 'F' ? motherOf(S, b) : fatherOf(S, b); ids = par ? partnersOf(S, par).filter(q => q !== altro) : []; break; }
    case 'genero': ids = childrenOf(S, b).flatMap(c => partnersOf(S, c)); break;
    case 'zioacq': ids = sideParents(S, b, np.side).flatMap(p => fullSibs(S, p)).flatMap(z => partnersOf(S, z)); break;
  }
  return sexFilter(S, [...new Set(ids)], np);
}
function pickOrd(ids, ord) {
  if (ord == null) return ids;
  if (ord === -1) return ids.length ? [ids[ids.length - 1]] : [];
  if (ord === 'other') return ids.length > 1 ? [ids[1]] : [];
  return ids[ord - 1] ? [ids[ord - 1]] : [];
}

/* ---------- relations: add ---------- */
class UErr extends Error {}
function needSide(np, word) {
  if (!np.side) { const F = np.s === 'F' || /[ae]$/.test(word) && np.s !== 'M'; const e = new UErr(`Paterno o materno? («${word}»)`); e.askReplace = { word, options: [word + ' ' + (F ? (np.pl ? 'paterne' : 'paterna') : (np.pl ? 'paterni' : 'paterno')), word + ' ' + (F ? (np.pl ? 'materne' : 'materna') : (np.pl ? 'materni' : 'materno'))] }; throw e; }
  if (!np.side) throw new UErr(`Per «${word}» specifica il lato: ad esempio «${word} ${/[ae]$/.test(word) && np.s === 'F' ? 'paterna' : 'paterno'}» o «${word} ${np.s === 'F' ? 'materna' : 'materno'}».`);
}
function sexFor(np, attrs) { return (attrs && attrs.sex) || np.s || 'U'; }
function addRelative(S, b, np, count, attrs, R) {
  const created = [];
  const word = np.word || np.r;
  const sx = sexFor(np, attrs);
  const P = S.people;
  const mark = id => { created.push(id); return id; };
  switch (np.r) {
    case 'self': return { ids: [b], created };
    case 'padre': case 'madre': case 'genitori': {
      const had = !!P[b].parentUnion;
      const u = ensureParents(S, b, had ? null : { implicit: [] });
      const f = fatherOf(S, b), m = motherOf(S, b);
      if (!had) created.push(f, m);
      const ids = np.r === 'padre' ? [f] : np.r === 'madre' ? [m] : [f, m];
      return { ids, created: created.filter(x => ids.includes(x)), implicit: had ? [] : [f, m].filter(x => !ids.includes(x)) };
    }
    case 'suocero': {
      const pr = partnersOf(S, b);
      if (!pr.length) throw new UErr('Prima aggiungi il partner, poi i suoi genitori.');
      const had = !!P[pr[0]].parentUnion;
      ensureParents(S, pr[0], R);
      const f = fatherOf(S, pr[0]), m = motherOf(S, pr[0]);
      const ids = np.both ? [f, m] : np.s === 'F' ? [m] : [f];
      return { ids, created: had ? [] : ids };
    }
    case 'fratello': case 'gemello': {
      let u;
      if (np.half) {
        const pu = ensureParents(S, b, R);
        const side = np.side || 'P';
        const par = side === 'P' ? fatherOf(S, b) : motherOf(S, b);
        u = unionsOf(S, par).find(w => w.id !== pu.id);
        if (!u) {
          const q = mk(S, P[par].sex === 'M' ? 'F' : 'M'); R.implicit.push(q);
          u = mkUnion(S, par, q);
        }
      } else u = ensureParents(S, b, R);
      for (let i = 0; i < count; i++) mark(addChild(S, u, sx));
      if (np.r === 'fratello' && np.twins && created.length > 1) { const t = 't' + (S.tseq++); const ty = np.mz === true ? 'MZ' : np.mz === false ? 'DZ' : '?'; created.forEach(c => { P[c].twin = t; P[c].twinType = ty; P[c].mz = ty === 'MZ'; }); }
      if (np.r === 'gemello') {
        const t = P[b].twin || ('t' + (S.tseq++));
        P[b].twin = t; created.forEach(c => { P[c].twin = t; });
        const mzv = np.mz != null ? np.mz : (attrs && attrs.mz != null ? attrs.mz : null);
        const ty = mzv === true ? 'MZ' : mzv === false ? 'DZ' : (P[b].twinType || '?');
        Object.values(P).forEach(q => { if (q.twin === t) { q.twinType = ty; q.mz = ty === 'MZ'; } });
      }
      return { ids: created, created };
    }
    case 'figlio': case 'aborto': case 'gravidanza': {
      let u;
      if (np.coParent) u = unionBetween(S, b, np.coParent, R);
      else if (np.newUnion) {
        const bs = P[b].sex; const q = mk(S, bs === 'M' ? 'F' : bs === 'F' ? 'M' : 'U'); R.implicit.push(q);
        u = mkUnion(S, b, q);
      } else u = ensurePartnerUnion(S, b, R);
      for (let i = 0; i < count; i++) {
        const c = mark(addChild(S, u, np.r === 'figlio' ? sx : (attrs && attrs.sex) || 'U'));
        if (np.r === 'aborto') { P[c].miscarriage = true; if (np.top) P[c].top = true; }
        if (np.r === 'gravidanza') P[c].pregnancy = true;
        if (np.stillborn) { P[c].stillborn = true; P[c].deceased = true; }
        if (np.adoptive) P[c].adopted = 'in';
      }
      if (np.r === 'figlio' && np.twins && count > 1) { const t = 't' + (S.tseq++); const ty = np.mz === true ? 'MZ' : np.mz === false ? 'DZ' : '?'; created.forEach(c => { P[c].twin = t; P[c].twinType = ty; P[c].mz = ty === 'MZ'; }); }
      return { ids: created, created };
    }
    case 'nonno': {
      needSide(np, word);
      ensureParents(S, b, R);
      const par = np.side === 'P' ? fatherOf(S, b) : motherOf(S, b);
      const had = !!P[par].parentUnion;
      ensureParents(S, par, R);
      const f = fatherOf(S, par), m = motherOf(S, par);
      const ids = np.both ? [f, m] : np.s === 'F' ? [m] : [f];
      return { ids, created: had ? [] : ids };
    }
    case 'zio': {
      needSide(np, word);
      ensureParents(S, b, R);
      const par = np.side === 'P' ? fatherOf(S, b) : motherOf(S, b);
      const u = ensureParents(S, par, R);
      for (let i = 0; i < count; i++) mark(addChild(S, u, sx));
      return { ids: created, created };
    }
    case 'cugino': {
      needSide(np, word);
      let zii = getRel(S, b, { r: 'zio', side: np.side, gen: 1 });
      let z;
      if (!zii.length) {
        z = addRelative(S, b, { r: 'zio', side: np.side, s: 'U', word: 'zio' }, 1, {}, R).ids[0];
        R.implicit.push(z);
        R.log.push({ type: 'warn', text: `Per collegare il cugino ho aggiunto uno zio/zia ${np.side === 'P' ? 'paterno' : 'materno'} di sesso non specificato ⟨${z}⟩: toccalo per correggerlo.` });
      } else {
        z = zii[zii.length - 1];
        if (zii.length > 1) R.log.push({ type: 'warn', text: `Ho collegato il cugino a ⟨${z}⟩. Per sceglierne un altro scrivi ad esempio «un figlio della zia paterna».` });
      }
      const u = ensurePartnerUnion(S, z, R);
      for (let i = 0; i < count; i++) mark(addChild(S, u, sx));
      return { ids: created, created };
    }
    case 'nipote': {
      const sibs = fullSibs(S, b).filter(i => !P[i].miscarriage);
      let par;
      if (sibs.length) { par = sibs[sibs.length - 1]; if (sibs.length > 1) R.log.push({ type: 'warn', text: `Ho collegato il nipote a ⟨${par}⟩. Per sceglierne un altro scrivi ad esempio «un figlio della sorella».` }); }
      else throw new UErr('Indica di chi è figlio il nipote: ad esempio «un figlio della sorella» o «una figlia del figlio».');
      const u = ensurePartnerUnion(S, par, R);
      for (let i = 0; i < count; i++) mark(addChild(S, u, sx));
      return { ids: created, created };
    }
    case 'zioacq': {
      needSide(np, 'zio');
      const zz = sideParents(S, b, np.side).flatMap(p => fullSibs(S, p)).filter(z => P[z].sex !== np.s && !P[z].miscarriage);
      if (zz.length !== 1) throw new UErr(zz.length ? `Ci sono più zii ${np.side === 'P' ? 'paterni' : 'materni'}: scrivi ad esempio «il marito della prima zia ${np.side === 'P' ? 'paterna' : 'materna'}».` : `Prima aggiungi ${np.s === 'M' ? 'la zia' : 'lo zio'} ${np.side === 'P' ? (np.s === 'M' ? 'paterna' : 'paterno') : (np.s === 'M' ? 'materna' : 'materno')}.`);
      const ex0 = partnersOf(S, zz[0]);
      if (ex0.length) return { ids: [ex0[0]], created: [] };
      const q = mark(mk(S, np.s)); mkUnion(S, zz[0], q);
      return { ids: created, created };
    }
    case 'partner': {
      const ex = partnersOf(S, b);
      if (np.ex) {
        const bs = P[b].sex; const q = mark(mk(S, np.s || (bs === 'M' ? 'F' : bs === 'F' ? 'M' : 'U')));
        const u = mkUnion(S, b, q); u.separated = 'divorziati';
        return { ids: created, created };
      }
      if (ex.length && !(typeof np.ord === 'number' && np.ord >= 2)) {
        if (np.s && P[ex[0]].sex === 'U') { P[ex[0]].sex = np.s; unionsOf(S, b).forEach(u => orient(S, u)); }
        return { ids: [ex[0]], created: [] };
      }
      const bs = P[b].sex;
      const q = mark(mk(S, np.s || (bs === 'M' ? 'F' : bs === 'F' ? 'M' : 'U')));
      mkUnion(S, b, q);
      return { ids: created, created };
    }
    case 'bisnonno': {
      const lato = np.side === 'M' ? ['materno', 'materna'] : ['paterno', 'paterna'];
      const g = np.pl ? 'i genitori' : np.s === 'F' ? 'la madre' : 'il padre';
      const e = new UErr(`Di quale nonno ${np.side ? lato[0] : ''} ${np.pl ? 'sono i genitori' : 'è genitore'}?`.replace('  ', ' '));
      const lati = np.side ? [lato] : [['paterno', 'paterna'], ['materno', 'materna']];
      e.askReplace = { word: null, whole: true, wholeRe: "(?:un[oa]?|il|la|lo|l'|i|gli|le|due|entrambi)?\\s*bisnonn[oaie](?:\\s+(?:patern|matern)[oaie])?", options: lati.flatMap(([m, f]) => [`${g} del nonno ${m}`, `${g} della nonna ${f}`]) };
      throw e;
    }
    case 'prozio': {
      const lati = np.side ? [np.side === 'M' ? ['materno', 'materna'] : ['paterno', 'paterna']] : [['paterno', 'paterna'], ['materno', 'materna']];
      const g = np.s === 'F' ? 'una sorella' : 'un fratello';
      const e = new UErr('Di quale nonno è fratello o sorella?');
      e.askReplace = { word: null, options: lati.flatMap(([m, f]) => [`${g} del nonno ${m}`, `${g} della nonna ${f}`]), whole: true };
      throw e;
    }
    case 'cognato': {
      const F = np.s === 'F', pbs = P[S.probandId].sex;
      const opz = F ? ['la moglie del fratello', pbs === 'M' ? 'la sorella della moglie' : 'la sorella del marito'] : ['il marito della sorella', pbs === 'F' ? 'il fratello del marito' : 'il fratello della moglie'];
      if (b !== S.probandId) opz.length = 1;
      const e = new UErr(F ? 'Quale cognata?' : 'Quale cognato?');
      e.askReplace = { word: null, options: opz, whole: true, wholeRe: '(?:un[oa]?|il|la|lo|l\'|un\')?\\s*cognat[oaie]' };
      throw e;
    }
    case 'patrigno': {
      ensureParents(S, b, R);
      const par = np.s === 'F' ? fatherOf(S, b) : motherOf(S, b);
      const q = mark(mk(S, np.s));
      mkUnion(S, par, q);
      return { ids: created, created };
    }
    case 'genero': {
      const figli = childrenOf(S, b).filter(c => P[c].sex === (np.s === 'M' ? 'F' : 'M') && !P[c].miscarriage);
      if (figli.length !== 1) throw new UErr(figli.length ? `Ci sono più ${np.s === 'M' ? 'figlie' : 'figli'}: scrivi ad esempio «il marito della prima figlia».` : `Prima aggiungi ${np.s === 'M' ? 'la figlia' : 'il figlio'}.`);
      const ex = partnersOf(S, figli[0]);
      if (ex.length) return { ids: [ex[0]], created: [] };
      const q = mark(mk(S, np.s)); mkUnion(S, figli[0], q);
      return { ids: created, created };
    }
  }
  throw new UErr('Relazione non gestita.');
}

/* ---------- tokenizer & clause split ---------- */
function tokenize(str) {
  const T = []; const re = /@p\d+|[a-zà-ÿ]+'|[a-zà-ÿ]+|\d+/gi; let m;
  while ((m = re.exec(str))) {
    let t = lowA(m[0]);
    if (APOS[t]) t = APOS[t];
    T.push({ t, raw: m[0], s: m.index, e: m.index + m[0].length });
  }
  return T;
}
function splitClauses(text) {
  text = text.replace(/[’`´]/g, "'");
  // le virgole dei cariotipi (47,XY,+21) non separano le frasi
  text = text.replace(/(?<![\w.])(\d{1,2}|[xXyY])\s*;\s*(\d{1,2}|[xXyY])(?![\w])/g, '$1\u204F$2');
  text = text.replace(/(?<![\d])(4[4-9]|69|92)\s*,\s*(?:X{1,3}Y{0,2}|Y)(?:\s*,\s*(?:[+\-−]\s*)?(?:\d{1,2}|X|Y|del|dup|inv|t|der|r|i|mar)[\w()?.;:+\-]*)*/gi, m => m.replace(/,/g, '\u201A'));
  const parts = []; let cur = '', depth = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '(' || ch === '[') depth++;
    else if ((ch === ')' || ch === ']') && depth > 0) depth--;
    const abbr = ch === '.' && /(?:^|[\s(])(?:pat|mat|aa|dx|sx|sig|dott|dr|ca|neo|sett|gg|nr|es|vs|cfr|paz|pz|ecc|n|a|p|c|g)$/i.test(cur);
    const fine = depth === 0 && (ch === '\n' || ch === ';' || (ch === ',' && !/\d/.test(text[i + 1] || '')) || (ch === '.' && !abbr && /\s/.test(text[i + 1] || ' ') ));
    if (fine) { parts.push(cur); cur = ''; } else cur += ch;
  }
  parts.push(cur);
  for (let k = 0; k < parts.length; k++) parts[k] = parts[k].replace(/\u201A/g, ',').replace(/\u204F/g, ';');
  const out = [];
  for (let p of parts) { p = p.trim(); if (!p) continue; out.push(...p.split(SPLIT_E).map(s => s && s.trim()).filter(Boolean)); }
  return out;
}

/* ---------- NP / reference parsing ---------- */
function matchRel(tok, R) {
  if (!tok) return null;
  if (REL[tok.t]) return tok.t;
  const f = fuzzyPick(tok.t, RELKEYS);
  if (f && R) { R.fixes.push([tok.raw, f]); tok.t = f; }
  return f;
}
function parseNP(T, j, R, opts) {
  const np = { qty: null, def: false, indef: false, ord: null, r: null, s: null, pl: false, gen: false, both: false, half: false, side: null, mz: null, twins: false, word: '' };
  const start = j;
  const fixMark = R ? R.fixes.length : 0;
  const t0 = T[j];
  if (!t0) return null;
  if (NUMW[t0.t] != null) { np.qty = NUMW[t0.t]; if (INDEF.has(t0.t)) np.indef = true; np.det = t0.t; j++; }
  else if (/^\d+$/.test(t0.t) && !(T[j+1] && /^(anni|anno|mesi|aa)$/.test(T[j+1].t))) { np.qty = +t0.t; j++; }
  else if (DEF.has(t0.t)) { np.def = true; np.det = t0.t; j++; }
  else if (!REL[t0.t] && !POSS.has(t0.t) && !ORD[t0.t]) {
    const f = fuzzyPick(t0.t, NUMWORDS);
    if (f && T[j+1] && matchRel(T[j+1], null)) { np.qty = NUMW[f]; np.det = f; if (R) { R.fixes.push([t0.raw, f]); t0.t = f; } j++; }
  }
  if (T[j] && POSS.has(T[j].t)) j++;
  if (T[j] && ORD[T[j].t] != null) { np.ord = ORD[T[j].t]; j++; }
  let preEx = false, preMezzo = false;
  if (T[j] && T[j].t === 'ex') { preEx = true; j++; }
  if (T[j] && /^mezz[oa]$/.test(T[j].t)) { preMezzo = true; j++; }
  const rk = matchRel(T[j], R);
  if (!rk) { if (R) R.fixes.length = fixMark; return null; }
  const rd = REL[rk];
  Object.assign(np, { r: rd.r, s: rd.s, pl: !!rd.pl, gen: !!rd.gen, both: !!rd.both, half: !!rd.half, word: rk });
  if (rd.twins) np.twins = true;
  if (rd.ord != null && np.ord == null) np.ord = rd.ord;
  if (rd.top) np.top = true;
  if (rd.stillborn) np.stillborn = true;
  if (preEx) np.ex = true;
  if (preMezzo && np.r === 'fratello') np.half = true;
  j++;
  if (np.s == null && !np.both && np.det) np.s = FEM_DET.has(np.det) ? 'F' : 'M';
  while (T[j]) {
    const t = T[j].t;
    if (SIDE[t]) { np.side = SIDE[t]; j++; continue; }
    if (/^(pat|mat)/.test(t) && t.length > 5) { const f = fuzzyPick(t, SIDEKEYS); if (f) { if (R) { R.fixes.push([T[j].raw, f]); T[j].t = f; } np.side = SIDE[f]; j++; continue; } }
    if ((t === 'da' || t === 'per') && T[j+1] && T[j+1].t === 'parte' && T[j+2] && OF.has(T[j+2].t) && T[j+3]) {
      const w = T[j+3].t;
      if (/^(padre|papa|babbo)$/.test(w)) { np.side = 'P'; if (np.r === 'fratello') np.half = true; j += 4; continue; }
      if (/^(madre|mamma)$/.test(w)) { np.side = 'M'; if (np.r === 'fratello') np.half = true; j += 4; continue; }
    }
    if ((t === 'dal' || t === 'lato' || t === 'ramo' || t === 'sul') && T[j+1]) {
      let k = j + 1; if (T[k].t === 'lato' || T[k].t === 'ramo') k++;
      if (T[k] && SIDE[T[k].t]) { np.side = SIDE[T[k].t]; j = k + 1; continue; }
    }
    if (t === 'maschi' || (t === 'maschio' && np.r !== 'self')) { np.s = 'M'; np.gen = false; j++; continue; }
    if (t === 'femmine' || (t === 'femmina' && np.r !== 'self')) { np.s = 'F'; np.gen = false; j++; continue; }
    if (/^gemell[oaie]$/.test(t)) { if (np.r === 'fratello' && !((np.qty || 1) > 1 && /^gemell[ie]$/.test(t))) np.r = 'gemello'; else np.twins = true; j++; continue; }
    if (/^(monozigot|identic|omozigot)/.test(t) && (np.r === 'gemello' || np.twins)) { np.mz = true; j++; continue; }
    if (/^(dizigot|eterozigot|fratern)/.test(t) && (np.r === 'gemello' || np.twins)) { np.mz = false; j++; continue; }
    if (/^(monozigot|dizigot)/.test(t)) { np.mz = /^mono/.test(t); j++; continue; }
    if (/^(spontane|interrott|precoc|biologic|naturale|naturali|vero|vera|veri|vere)/.test(t)) { j++; continue; }
    if (/^uterin[oaie]$/.test(t) && np.r === 'fratello') { np.half = true; np.side = 'M'; j++; continue; }
    if (/^consanguine[oaie]$/.test(t) && np.r === 'fratello') { np.half = true; np.side = 'P'; j++; continue; }
    if (/^german[oaie]$/.test(t)) { j++; continue; }
    if (/^adottiv[oaie]$/.test(t)) { np.adoptive = true; j++; continue; }
    if (/^af{1,2}et{1,2}[oaie]$/.test(t) && !(T[j + 1] && /^(da|di|dal|dalla|dallo|dai|dalle)$/.test(T[j + 1].t)) && np.def) { np.soloAffetti = true; j++; continue; }
    if (/^san[oaie]$/.test(t) && np.def && T[j + 1] && /^(e|ha|hanno|sono|era)$/.test(T[j + 1].t)) { np.soloSani = true; j++; continue; }
    if (/^acquisit[oaie]$/.test(t) && np.r === 'zio') { np.r = 'zioacq'; j++; continue; }
    if (/^precedente$|^vecchi[oa]$/.test(t) && np.r === 'partner') { np.ex = true; j++; continue; }
    if (t === 'maggiore' || t === 'primogenito' || t === 'primogenita') { np.ord = 1; j++; continue; }
    if (t === 'minore' || t === 'ultimogenito' || t === 'ultimogenita') { np.ord = -1; j++; continue; }
    if ((t === 'piu' || t === 'più') && T[j+1] && /^(grande|vecchi[oa])$/.test(T[j+1].t)) { np.ord = 1; j += 2; continue; }
    if ((t === 'piu' || t === 'più') && T[j+1] && /^(piccol[oa]|giovane)$/.test(T[j+1].t)) { np.ord = -1; j += 2; continue; }
    break;
  }
  np.text = T.slice(start, j).map(x => x.t).join(' ');
  np.rawText = T.slice(start, j).map(x => x.raw).join(' ');
  return { np, j };
}
function startsNP(T, j) { return !!parseNP(T, j, null); }
function startsRef(T, j) { return !!(T[j] && (T[j].t.startsWith('@') || PRON.has(T[j].t) || startsNP(T, j))); }
function parseRef(T, j, R) {
  const chain = []; let base = null; const start = j;
  while (T[j]) {
    const t = T[j];
    if (t.t.startsWith('@')) { base = [t.t.slice(1)]; j++; break; }
    if (PRON.has(t.t)) { base = { pron: t.t }; j++; break; }
    const r = parseNP(T, j, R);
    if (!r) break;
    chain.push(r.np); j = r.j;
    if (r.np.r === 'self') break;
    if (T[j] && OF.has(T[j].t) && startsRef(T, j + 1)) { j++; continue; }
    break;
  }
  if (!chain.length && !base) return null;
  return { chain, base, j, text: T.slice(start, j).map(x => x.t).join(' ') };
}
function resolveRef0(S, ref, ctx, R, create) {
  let base;
  if (ref.base && ref.base.pron) {
    const lt = ctx.lastTouched;
    if (!lt.length && !ctx.recent.length) throw new UErr(`Non so a chi si riferisce «${ref.base.pron}».`);
    if (ref.base.pron === 'loro') base = lt.slice();
    else {
      const want = /^(lei|essa|costei)$/.test(ref.base.pron) ? 'F' : /^(lui|esso|costui)$/.test(ref.base.pron) ? 'M' : null;
      const pool = [...ctx.recent.filter(i => !lt.includes(i)), ...lt].filter(i => S.people[i]);
      const m = want ? pool.filter(i => S.people[i].sex === want) : [];
      base = [m.length ? m[m.length - 1] : lt[lt.length - 1]];
    }
  } else base = ref.base ? ref.base.slice() : [ctx.pov && S.people[ctx.pov] && !(ref.chain.length && ref.chain[ref.chain.length - 1].r === 'self') ? ctx.pov : S.probandId];
  for (let k = ref.chain.length - 1; k >= 0; k--) {
    const np = ref.chain[k]; let out = [];
    for (const b of base) {
      let base0 = getRel(S, b, np);
      if (np.soloAffetti) base0 = base0.filter(i => S.people[i].conditions.length);
      if (np.soloSani) base0 = base0.filter(i => !S.people[i].conditions.length);
      if (!base0.length && np.twins && np.def) {
        const gemelli = Object.values(S.people).filter(p => p.twin);
        const recenti = (ctx.recent || []).slice().reverse().map(i => S.people[i]).find(p => p && p.twin);
        const gruppo = recenti ? recenti.twin : (new Set(gemelli.map(p => p.twin)).size === 1 ? gemelli[0].twin : null);
        if (gruppo) base0 = gemelli.filter(p => p.twin === gruppo).map(p => p.id);
      }
      if (!base0.length && np.r === 'figlio' && np.ord != null && b === S.probandId && /genit/.test(np.word)) { const pu = parentU(S, b); if (pu) base0 = sexFilter(S, pu.children.filter(c => !S.people[c].miscarriage), np); }
      let got = pickOrd(base0, np.ord);
      if (!got.length && np.r === 'figlio' && np.ord != null && b === S.probandId && /genit/.test(np.word)) { const pu = parentU(S, b); if (pu) got = pickOrd(sexFilter(S, pu.children.filter(c => !S.people[c].miscarriage), np), np.ord); }
      if (got.length > 1 && !np.pl && np.ord == null && !np.both && !np.side && /^(nonno|zio|cugino|bisnonno|prozio)$/.test(np.r)) needSide(np, np.word);
      if (got.length > 1 && !np.pl && np.ord == null && !np.both && np.text) {
        const e = new UErr(`Quale ${np.word}?`); e.askPick = { phrase: np.text, raw: np.rawText, ids: got }; throw e;
      }
      if (got.length > 1 && !np.pl && np.ord == null && !np.both) {
        throw new UErr(`Ci sono ${got.length} persone che corrispondono a «${np.text || np.word}» (${got.map(i => '⟨' + i + '⟩').join(', ')}): specifica quale, ad esempio «la prima ${np.word}», «la seconda ${np.word}» o usa la sigla.`.replace(/la (prima|seconda) (fratello|figlio|nonno|zio|cugino|nipote|marito|compagno|gemello)/g, (m, o, w) => 'il ' + (o === 'prima' ? 'primo' : 'secondo') + ' ' + w));
      }
      if (!got.length && create && (!np.pl || np.both) && (np.ord == null || np.ord === 1)) {
        const res = addRelative(S, b, np, 1, {}, R);
        got = res.ids;
        res.created.forEach(c => R.created.add(c));
        if (res.created.length) R.log.push({ type: 'ok', text: `Aggiunt${agr(np.s, res.created.length)} ${np.text || np.word} ${refSuffix(S, b)}`.trim(), ids: res.created });
      }
      out.push(...got);
    }
    base = [...new Set(out)];
    if (!base.length) return [];
  }
  return base;
}
function kinOf(S, id) {
  const P = S.people, pb = S.probandId, p = P[id]; if (!p) return null;
  const F = p.sex === 'F', has = (arr) => arr.includes(id);
  if (id === pb) return { w: F ? 'probanda' : 'probando', u: 1 };
  if (id === fatherOf(S, pb)) return { w: 'padre', u: 1 };
  if (id === motherOf(S, pb)) return { w: 'madre', u: 1 };
  if (has(partnersOf(S, pb))) return { w: F ? 'moglie' : p.sex === 'M' ? 'marito' : 'partner', u: 1 };
  if (has(fullSibs(S, pb))) return { w: F ? 'sorella' : 'fratello' };
  if (has(childrenOf(S, pb))) return { w: F ? 'figlia' : 'figlio' };
  for (const side of ['P', 'M']) {
    const sfx = side === 'P' ? (F ? 'paterna' : 'paterno') : (F ? 'materna' : 'materno');
    if (has(getRel(S, pb, { r: 'nonno', side, gen: 1 }))) return { w: (F ? 'nonna ' : 'nonno ') + sfx, u: 1 };
    if (has(getRel(S, pb, { r: 'zio', side, gen: 1 }))) return { w: (F ? 'zia ' : 'zio ') + sfx };
    if (has(getRel(S, pb, { r: 'cugino', side, gen: 1 }))) return { w: (F ? 'cugina ' : 'cugino ') + sfx };
  }
  return null;
}
function artOf(w, F) {
  if (/^[aeiouh]/i.test(w)) return "l'";
  if (F) return 'la';
  return /^(z|s[^aeiou]|gn|ps|x|y)/i.test(w) ? 'lo' : 'il';
}
function withPrep(prep, S, id) {
  const k = kinOf(S, id);
  if (!k) return `${prep} ⟨${id}⟩`;
  const F = S.people[id].sex === 'F';
  const art = artOf(k.w, F);
  const PREP = { a: { il: 'al', lo: 'allo', la: 'alla', "l'": "all'" }, di: { il: 'del', lo: 'dello', la: 'della', "l'": "dell'" } };
  const pa = PREP[prep][art];
  return `${pa}${art === "l'" ? '' : ' '}${k.w}${k.u ? '' : ' ⟨' + id + '⟩'}`;
}
function refSuffix(S, b) { return b === S.probandId ? '' : withPrep('a', S, b); }

/* ---------- attribute parsing ---------- */
const MARK = /(?<![a-z])(?:af{1,2}et{1,2}[oaie]|malat[oaie]|con diagnosi(?: di)?|diagnosi(?: di)?|soffre(?: di)?|con(?= )|dece?dut[oaie]|mort[oaie]|defunt[oaie]|scompars[oaie]|portat(?:ore|rice|ori|rici)(?: san[oaie])?|(?:etero|omo|emi)zigot[ei](?= (?:per|di|a) )|carrier|positiv[oaie](?: al test)?(?: genetico)?|negativ[oaie](?: al test)?(?: genetico)?|(?:una |la )?(?:mutazion[ei]|variant[ei])(?: patogen\w*)?)(?![a-z])/g;
function cleanCond(s) {
  s = s.replace(/^[\s:,]+|[\s:,.]+$/g, '').replace(/\s+/g, ' ');
  while (/[)\]]$/.test(s) && (s.match(/[(\[]/g) || []).length < (s.match(/[)\]]/g) || []).length) s = s.slice(0, -1);
  if (/^\(/.test(s) && !(s.match(/\)/g) || []).length) s = s.slice(1);
  s = s.replace(/^(?:il|lo|la|l'|i|gli|le|un|uno|una|un'|de[il]|della|di|da)\s+/i, '');
  return cap(s);
}
const ARTPREP = /^(?:(?:al|alla|allo|ai|alle|agli|del|della|dello|dei|delle|degli|nel|nella|nello|nei|nelle|sul|sulla|sullo)\s+|(?:all|dell|nell|sull)'\s*)/i;
function splitConds(s) {
  const parts = s.split(/\s*,\s*|\s+e\s+|\s+ed\s+/i).map(x => x.trim()).filter(Boolean);
  const out = [];
  for (const p of parts) {
    if (out.length && /^(?:di|da)\s+/i.test(p)) { out.push(p.replace(/^(?:di|da)\s+/i, '')); continue; }
    if (out.length && ARTPREP.test(p)) {
      const prev = out[out.length - 1];
      const hm = /^(.+?)\s+(?:(?:al|alla|allo|ai|alle|agli|del|della|dello|dei|delle|degli|di|nel|nella|sul|sulla)\s|(?:all|dell|nell|sull)')/i.exec(prev);
      if (hm) { out.push(hm[1] + ' ' + p); continue; }
      const fw = prev.split(' ')[0];
      if (prev.includes(' ') && fw.length > 2) { out.push(fw + ' ' + p); continue; }
      out[out.length - 1] += ' e ' + p; continue;
    }
    out.push(p);
  }
  return out.map(cleanCond).filter(x => x && x.length >= 1 && !/^(e|di|da|il|la)$/i.test(x));
}
function parseAttrs(tail) {
  const A = { conditions: [], carriers: [], variants: [], zyg: '', sex: null, name: null, age: '', deceased: false, deathAge: '', healthy: false, adopted: false, pregnant: false, mz: null, carrierAny: false, unparsed: '',
    needCond: false, condAge: '', sameCond: null, needVar: false, varNeg: false, sameVar: null, twin: false, twinOf: null, sibs: false, sibOf: null, sep: '', sepFrom: null, unionWith: null, unionPair: false, noKids: '', note: '',
    rmCarrier: null, rmCond: null, rmVar: null, untwin: false, alive: false, unsep: false, unadopt: false, varCarrier: false, vcls: '', vnote: '', inherit: null, presympt: null, childOf: null, parentOf: null };
  let src0 = (tail || '').normalize('NFC').replace(/[’`´]/g, "'");
  src0 = src0.replace(/(?:eterozigot[ei]|in\s+eterozigosi)\s+compost[oa]\s+(?:per|di|a)\s/gi, () => { A.zyg = 'comp'; return 'positivo per '; });
  src0 = src0.replace(/(?:^|\s)(?:(?:e|è)\s+)?(?:il|la)\s+(?:nuov[oa]\s+)?(?:probando|probanda)\s*$/i, () => { A.makeProband = true; return ' '; });
  let raw = ' ' + src0 + ' ';
  let low = lowA(raw);
  const blank = (i, n) => { raw = raw.slice(0, i) + ' '.repeat(n) + raw.slice(i + n); low = low.slice(0, i) + ' '.repeat(n) + low.slice(i + n); };
  let m;
  m = /(?:di nome|chiamat[oaie]|si chiama|nome)\s+([a-zà-ÿ][a-zà-ÿ'-]*)/i.exec(raw);
  if (m) {
    let nm = cap(m[1]); let len = m[0].length;
    const rest = raw.slice(m.index + len); const m2 = /^\s+([A-ZÀ-Ý][a-zà-ÿ'-]+)/.exec(rest);
    if (m2) { nm += ' ' + m2[1]; len += m2[0].length; }
    A.name = nm; blank(m.index, len);
  }
  const flag = (re, fn) => { let mm; const r = new RegExp(re.source, 'g'); while ((mm = r.exec(low))) { fn(mm); blank(mm.index, mm[0].length); r.lastIndex = mm.index + mm[0].length; } };
  const REFTAIL = "((?:(?!\\s(?:a|ad|all'eta|nel|e|ed|in|ma)\\s)[^,;])+?)(?=\\s+(?:a|ad|all'eta|nel|in)\\s+\\d|\\s+e\\s|\\s*$)";
  const refRaw = (mm, g) => { if (!mm[g]) return ''; const i = mm.index + mm[0].lastIndexOf(mm[g]); return raw.slice(i, i + mm[g].length).trim(); };
  { const pn = notaPenetranza(low); if (pn) { A.inhNota = pn; flag(/(?:(?:a|con)\s+)?penetranza\s+(?:incomplet|ridott|variabil)\w*|(?:(?:ed?|con)\s+)?espressivita\s+variabile/, () => {}); }
    let t, g = 0; while ((t = trovaModo(raw)) && g++ < 3) { A.inh = A.inh || t.modo; blank(t.i, t.n); } }
  // nota libera (va per prima: prende tutto il resto)
  m = /(?:^|\s)(?:nota|note)\s*:?\s+(.+)$/.exec(low);
  if (m) { A.note = raw.slice(m.index + m[0].length - m[1].length).trim(); blank(m.index, m[0].length); }
  // negazioni (vanno prima delle frasi positive)
  flag(new RegExp("(?<![a-z])non\\s+(?:e\\s+|sono\\s+|risulta\\s+|risultano\\s+)?(?:piu\\s+)?portat(?:ore|rice|ori|rici)(?:\\s+san[oaie])?(?:\\s+(?:di|del|della|dello|dei|delle)\\s+([^,;]+))?"), mm => { A.rmCarrier = mm[1] ? raw.slice(mm.index + mm[0].length - mm[1].length, mm.index + mm[0].length).trim() : '*'; });
  flag(new RegExp("(?<![a-z])non\\s+(?:e\\s+|sono\\s+)?(?:piu\\s+)?(?:affett[oaie]|malat[oaie])\\s+(?:da|di)\\s+([^,;]+)"), mm => { A.rmCond = raw.slice(mm.index + mm[0].length - mm[1].length, mm.index + mm[0].length).trim(); });
  flag(/(?<![a-z])non\s+(?:ha|hanno|ha piu|presenta)\s+(?:la\s+|una\s+)?(?:stessa\s+)?(?:mutazione|variante)(?:\s+familiare)?/, () => { A.needVar = true; A.varNeg = true; });
  flag(/(?<![a-z])non\s+(?:e\s+|sono\s+)?(?:piu\s+)?gemell[oaie]/, () => { A.untwin = true; });
  flag(/(?<![a-z])(?:non\s+(?:e\s+|sono\s+)?(?:piu\s+)?(?:dece?dut[oaie]|mort[oaie])|e\s+viv[oaie]|sono\s+viv[ie]|ancora\s+viv[oaie]|viv[oaie]|vivent[ei]|in\s+vita)(?![a-z])/, () => { A.alive = true; });
  flag(/(?<![a-z])non\s+(?:e\s+|sono\s+)?(?:piu\s+)?(?:separat[oaie]|divorziat[oaie])(?![a-z])|(?:sono\s+)?tornat[ie]\s+insieme/, () => { A.unsep = true; });
  flag(/(?<![a-z])non\s+(?:e\s+|sono\s+)?(?:adottat[oaie]|stat[oaie]\s+adottat[oaie])(?![a-z])/, () => { A.unadopt = true; });
  // classificazione della variante e origine
  flag(/(?<![a-z])(?:variante\s+)?(?:di\s+)?(?:vus|significato\s+incerto|incerto\s+significato)(?![a-z])/, () => { A.vcls = 'VUS'; });
  flag(/(?<![a-z])(?:probabilmente\s+patogen\w*|likely\s+pathogenic|lp)(?![a-z])/, () => { A.vcls = 'LP'; });
  flag(/(?<![a-z])(?:probabilmente\s+benign[oaie]|likely\s+benign)(?![a-z])/, () => { A.vcls = 'LB'; });
  flag(/(?<![a-z])benign[oaie](?![a-z])/, () => { A.vcls = 'B'; });
  flag(/(?<![a-z])(?:patogenetic[oaie]|patogen[oaie]|pathogenic)(?![a-z])/, () => { if (!A.vcls) A.vcls = 'P'; });
  flag(/(?<![a-z])de\s+novo(?![a-z])/, () => { A.vnote = 'de novo'; });
  flag(new RegExp("(?<![a-z])(?:ereditat[oaie]|trasmess[oaie]|ricevut[oaie])\\s+(?:dalla|dal|dallo|da)\\s+" + REFTAIL), mm => { A.inherit = { ref: refRaw(mm, 1) }; });
  flag(/(?<![a-z])(?:di\s+origine|ad\s+origine|origine)\s+(materna|paterna)(?![a-z])/, mm => { A.inherit = { side: mm[1] === 'materna' ? 'M' : 'P' }; });
  flag(/(?<![a-z])(?:non\s+testat[oaie]|test\s+non\s+eseguit[oa]|non\s+ha\s+fatto\s+il\s+test)(?![a-z])/, () => { A.note = (A.note ? A.note + '; ' : '') + 'non testato'; });
  flag(/(?<![a-z])(?:in\s+attesa\s+(?:del|di)\s+(?:risultat\w+|esit\w+|test))(?![a-z])/, () => { A.note = (A.note ? A.note + '; ' : '') + 'test in corso'; });
  flag(/(?<![a-z])(?:asintomatic[oaie]|presintomatic[oaie])(?![a-z])/, () => { A.presympt = true; });
  flag(/(?<![a-z])(?:obbligat[oaie])(?![a-z])/, () => { A.carrierAny = true; });
  // ruoli familiari tra persone gia' presenti: «sono figlie del probando», «e' il padre della sorella»
  flag(new RegExp("^\\s*(?:(?:e|sono|era|erano)\\s+)?(?:(?:il|la|i|le|l')\\s+)?(?:figli[oae]?|figlie|figliol[oaie])\\s+(?:del|della|dello|di|dell'|dei|delle)\\s+" + REFTAIL + "\\s*$"), mm => { A.childOf = { ref: refRaw(mm, 1) }; });
  flag(new RegExp("^\\s*(?:(?:e|sono|era|erano)\\s+)?(?:(?:il|la|i|l')\\s+)?(?:padre|madre|genitore|genitori|papa|mamma)\\s+(?:del|della|dello|di|dell'|dei|delle)\\s+" + REFTAIL + "\\s*$"), mm => { A.parentOf = { ref: refRaw(mm, 1) }; });
  flag(/(?<![a-z])risultat[oaie](?![a-z])/, () => {});
  flag(/(?<![a-z])sospett[oaie](?=\s+portat)/, () => { A.note = (A.note ? A.note + '; ' : '') + 'portatore sospetto'; });
  {
    const parole = low.split(/(?<=\s)|(?=\s)/);
    let pos = 0;
    for (let k = 0; k < parole.length; k++) {
      const w = parole[k]; const wt = w.trim();
      if (wt) {
        const mal = AGG_MALATTIA.find(([re]) => re.test(wt)), por = AGG_PORTATORE.find(([re]) => re.test(wt));
        if (mal || por) {
          const prima = low.slice(Math.max(0, pos - 9), pos);
          const neg = /non\s+(?:e\s+|sono\s+)?(?:piu\s+)?$/.test(prima);
          if (neg) { const m2 = /non\s+(?:e\s+|sono\s+)?(?:piu\s+)?$/.exec(prima); blank(pos - m2[0].length, m2[0].length); }
          if (mal) { if (neg) A.rmCond = mal[1]; else A.conditions.push({ name: mal[1], age: '' }); }
          else { if (neg) A.rmCarrier = por[1]; else A.carriers.push(por[1]); }
          blank(pos, w.length);
        }
      }
      pos += w.length;
    }
  }
  flag(/(?<![a-z])natomorto(?![a-z])/, () => { A.stillborn = true; A.deceased = true; });
  flag(/(?<![a-z])(?:concepit[oaie]\s+(?:con|tramite|da)\s+)?(?:l')?(ovodonazione|donazione di ovociti|ovociti di donatrice|donatrice di ovociti|donazione di seme|seme di donatore|donatore di seme|fecondazione eterologa|eterologa|maternita surrogata|gestazione per altri|madre surrogata)(?![a-z])/, mm => {
    const w = mm[1]; A.note = (A.note ? A.note + '; ' : '') + (/ovoc|ovodon/.test(w) ? 'concepito con ovodonazione' : /seme/.test(w) ? 'concepito con seme di donatore' : /surrog|gestazione/.test(w) ? 'gestazione per altri' : 'fecondazione eterologa'); });
  // stessa malattia / stessa mutazione (di qualcuno)
  flag(new RegExp("(?<![a-z])(?:(?:dalla|della|la|con la|di|per la|alla)\\s+)?(?:stess[ao]|medesim[ao])\\s+(?:malattia|patologia|condizione|diagnosi|sindrome|tumore|neoplasia|forma|quadro clinico|quadro)(?:\\s+(?:del|della|dello|di|dell'|dei|degli|delle)\\s+" + REFTAIL + ")?"), mm => { A.sameCond = { ref: refRaw(mm, 1) }; });
  const PREPREF = "\\s+(?:del|della|dello|di|dell'|dei|degli|delle)\\s*" + REFTAIL;
  flag(new RegExp("(?<![a-z])(?:(?:dalla|della|la|con la|di|per la|alla|una)\\s+)?(?:stess[ao]|medesim[ao])\\s+(?:mutazione|variante|alterazione|genotipo)(?:\\s+familiare)?(?:" + PREPREF + ")?"), mm => { A.sameVar = { ref: refRaw(mm, 1) }; });
  flag(new RegExp("(?<![a-z])(?:(?:dalla|della|la|con la|di|per la|alla|una)\\s+)?(?:mutazione|variante)\\s+(?:familiare|della famiglia|di famiglia)"), () => { A.sameVar = { ref: '' }; });
  flag(new RegExp("(?<![a-z])(?:(?:dalla|della|la|con la|di|per la|alla|una)\\s+)?(?:mutazione|variante)" + PREPREF), mm => { A.sameVar = { ref: refRaw(mm, 1) }; });
  // gemelli
  flag(new RegExp("(?<![a-z])gemell[oaie](?:\\s+(monozigot[ioae]|identic[oaie]|omozigot[ie]|dizigot[ioae]|eterozigot[ie]|fratern[oaie]))?(?:\\s+(?:del|della|dello|di|dell')\\s+" + REFTAIL + ")?"), mm => {
    A.twin = true; if (mm[1]) A.mz = /^(monoz|ident|omoz)/.test(mm[1]); if (mm[2]) A.twinOf = { ref: refRaw(mm, 2) }; });
  // fratelli tra persone gia' presenti
  flag(new RegExp("^\\s*(?:(?:il|la|i|le)\\s+)?(?:fratell[oi]|sorell[ae]|fratello e sorella|fratelli germani)(?:\\s+(?:del|della|dello|di|dell')\\s+" + REFTAIL + ")?\\s*$"), mm => { A.sibs = true; if (mm[1]) A.sibOf = { ref: refRaw(mm, 1) }; });
  // separazione / divorzio
  flag(new RegExp("(?<![a-z])(separat[oaie]|divorziat[oaie])(?:\\s+(?:da|dal|dalla|dallo)\\s+" + REFTAIL + ")?"), mm => { A.sep = /^div/.test(mm[1]) ? 'divorziati' : 'separati'; if (mm[2]) A.sepFrom = { ref: refRaw(mm, 2) }; });
  // matrimonio / unione
  flag(new RegExp("(?<![a-z])(?:ha\\s+sposato|si\\s+e\\s+sposat[oa]\\s+con|sposat[oaie]\\s+(?:con|a)|convive\\s+con|sta\\s+con|ha\\s+(?:avuto\\s+)?una\\s+relazione\\s+con|in\\s+coppia\\s+con|(?:il\\s+|la\\s+)?(?:marito|moglie|compagn[oa]|partner)\\s+(?:di|del|della|dello|dell'))\\s+" + REFTAIL), mm => { A.unionWith = { ref: refRaw(mm, 1) }; });
  flag(/(?<![a-z])(?:sposati|conviventi|una coppia|in coppia|partner)(?![a-z])/, () => { A.unionPair = true; });
  // figli
  flag(/(?<![a-z])(?:coppia\s+)?(?:sterili|sterile|infertil[ei]|con infertilita|con sterilita)(?![a-z])/, () => { A.noKids = 'infertile'; });
  flag(/(?<![a-z])(?:non ha figli|non hanno figli|senza figli|nessun figlio)(?![a-z])/, () => { A.noKids = 'nessuno'; });
  flag(/(?<![a-z])(?:dat[oaie]|ceduto|ceduta)\s+in\s+adozione(?![a-z])/, () => { A.adopted = 'out'; });
  flag(/(?<![a-z])(?:adottat[oaie])(?![a-z])/, () => { A.adopted = A.adopted || 'in'; });
  flag(/(?<![a-z])(?:gravida|incinta|in gravidanza)\s+(?:di\s+|alla\s+)?(\d{1,2})\s*(?:settimane|sett\.?|ª?\s*settimana|sg)(?![a-z])/, mm => { A.pregnant = true; A.pregWeeks = mm[1]; });
  flag(/(?<![a-z])(?:incinta|in gravidanza|gravida)(?![a-z])/, () => { A.pregnant = true; });
  flag(/(?<![a-z])(?:in omozigosi|omozigot[ei]|omozigosi)(?![a-z])(?! (?:per|di|a) )/, () => { A.zyg = 'omo'; });
  flag(/(?<![a-z])(?:eterozigote compost[oa]|in eterozigosi compost[ao]|compost[oa] eterozigote|eterozigosi composta)(?![a-z])/, () => { A.zyg = 'comp'; });
  flag(/(?<![a-z])(?:in emizigosi|emizigot[ei])(?![a-z])(?! (?:per|di|a) )/, () => { A.zyg = 'emi'; });
  flag(/(?<![a-z])(?:in eterozigosi|eterozigot[ei])(?![a-z])(?! (?:per|di|a) )/, () => { A.zyg = 'het'; });
  flag(/(?<![a-z])(?:monozigot[ioae]|identic[oaie])(?![a-z])/, () => { A.mz = true; });
  flag(/(?<![a-z])(?:dizigot[ioae])(?![a-z])/, () => { A.mz = false; });
  flag(/(?<![a-z])non (?:e |sono )?(?:affett[oaie]|malat[oaie])(?![a-z])/, () => { A.healthy = true; });
  flag(/(?<![a-z])(?<!portat(?:ore|rice|ori|rici) )san[oaie](?![a-z])/, () => { A.healthy = true; });
  flag(/(?<![a-z0-9.'@])m(?![a-z0-9.'>_])/, () => { A.sex = 'M'; });
  flag(/(?<![a-z0-9.'@])f(?![a-z0-9.'>_])/, () => { A.sex = 'F'; });
  flag(/(?<![a-z])(?:maschio|maschi|uomo|ragazzo|bambino|neonato)(?![a-z])/, () => { A.sex = 'M'; });
  flag(/^\s*(?:m)(?=\s+\d|\s*,|\s*$)/, () => { A.sex = 'M'; });
  flag(/^\s*(?:f)(?=\s+\d|\s*,|\s*$)/, () => { A.sex = 'F'; });
  flag(/(?<![a-z])(?:nel|al)\s+(primo|secondo|terzo|1|2|3)\s*(?:°|o)?\s+trimestre(?![a-z])/, mm => { A.note = (A.note ? A.note + '; ' : '') + (({ primo: 'I', secondo: 'II', terzo: 'III', 1: 'I', 2: 'II', 3: 'III' })[mm[1]]) + ' trimestre'; });
  flag(/(?<![a-z])(?:alla|a)\s+(\d{1,2})\s*(?:ª|a)?\s*settiman[ae](?![a-z])/, mm => { A.note = (A.note ? A.note + '; ' : '') + mm[1] + ' sett.'; });
  // consanguineita' e «non ha fratelli», «non noto», test eseguito
  flag(/(?<![a-z])(?:non\s+(?:sono\s+)?consanguine[oaie]|nessuna\s+consanguineita|consanguineita\s+negata|non\s+consanguineita)(?![a-z])/, () => { A.consang = false; });
  flag(/^\s*(?:(?:e|sono)\s+)?(?:cugin[ie]|parenti)(?:\s+(?:di\s+)?(?:primo|secondo|terzo)\s+grado)?\s*$/, () => { A.consang = true; });
  flag(/^\s*(?:(?:e|e'|sono)\s+)?(?:sposat[oaie]|coniugat[oaie]|convivente|con\s+(?:un\s+)?partner)\s*$/, () => { A.sposato = true; });
  flag(/(?<![a-z])(?:da\s+piccol[oaie]|da\s+bambin[oaie]|da\s+neonat[oaie]|in\s+tenera\s+eta|in\s+eta\s+infantile|nell'infanzia|in\s+infanzia|alla\s+nascita|in\s+eta\s+neonatale|in\s+giovane\s+eta|da\s+giovane)(?![a-z])/, mm => { A.deathAge = /nascita|neonat/.test(mm[0]) ? 'neonatale' : /giovane/.test(mm[0]) ? 'giovane età' : 'infanzia'; });
  flag(/(?<![a-z])(?:consanguine[oaie]|imparentat[oaie]|cugini\s+(?:di\s+)?(?:primo|secondo)\s+grado|primi\s+cugini)(?![a-z])/, () => { if (A.consang !== false) A.consang = true; });
  flag(/(?<![a-z])(?:non\s+ha\s+(?:fratelli|sorelle|fratelli\s+(?:ne|o)\s+sorelle)|figli[oa]\s+unic[oa])(?![a-z])/, () => { A.note = (A.note ? A.note + '; ' : '') + 'nessun fratello'; });
  flag(/(?<![a-z])(?:non\s+(?:e\s+)?not[oa]|sconosciut[oa]|ignot[oa])(?![a-z])/, () => { A.note = (A.note ? A.note + '; ' : '') + 'non noto'; });
  flag(/(?<![a-z])(?:ha\s+)?(?:fatto|eseguito|effettuato)\s+(?:il|lo|l'|la|un|una)?\s*(?:test|analisi|esame|ricerca|consulenza|indagine)(?:\s+genetic[oa])?(?![a-z])/, () => { A.testato = true; });
  flag(/(?<![a-z])(?:femmina|femmine|donna|ragazza|bambina|neonata)(?![a-z])/, () => { A.sex = 'F'; });
  // segments
  const marks = []; MARK.lastIndex = 0;
  while ((m = MARK.exec(low))) marks.push({ i: m.index, e: m.index + m[0].length, w: m[0] });
  const pre = marks.length ? { i: 0, e: marks[0].i } : { i: 0, e: raw.length };
  const segs = marks.map((mk, k) => ({ type: /^(dece?dut|mort|defunt|scompars)/.test(mk.w) ? 'D' : /^(portat|eterozig|omozig|emizig|carrier)/.test(mk.w) ? 'C' : /^positiv|mutazion|variant|^(una|la) (mutazion|variant)/.test(mk.w) ? 'V' : /^negativ/.test(mk.w) ? 'N' : 'A', s: mk.e, e: k + 1 < marks.length ? marks[k + 1].i : raw.length, mi: mk.i }));
  const personAge = (sRaw, sLow) => {
    let mm = /(?<!eta |eta' |a |ad |all'eta |esordio a )di\s+(\d{1,3})\s*(anni|anno|mesi|mese|settimane|giorni)/.exec(sLow)
      || /(?<![a-z])(\d{1,3})\s*enne(?![a-z])/.exec(sLow)
      || /(?<![a-z'])eta\s*:?\s*(\d{1,3})(?![0-9])/.exec(sLow);
    if (mm) { const u = mm[2] && /mes/.test(mm[2]) ? ' mesi' : mm[2] && /settim/.test(mm[2]) ? ' sett.' : mm[2] && /giorn/.test(mm[2]) ? ' gg' : ''; return { v: mm[1] + u, i: mm.index, n: mm[0].length }; }
    return null;
  };
  // person age anywhere (outside event phrases)
  const pa = personAge(raw, low);
  if (pa) { A.age = pa.v; blank(pa.i, pa.n); }
  const eventAge = (sl) => /(?:,?\s*)(?:diagnosticat[oaie]\s+|esordio\s+)?(?<![a-z'])(?:a|ad|all'eta di|all'eta|dall'eta di|nel|eta)\s+(\d{1,3})\s*(?:anni|anno|aa|a\.)?(?![0-9])|\(\s*(?:dx\s*)?(\d{1,3})\s*(?:anni|a\.?)?\s*\)|(?<![a-z])dx\s*(\d{1,3})/.exec(sl);
  for (const sg of segs) {
    let sr = raw.slice(sg.s, sg.e), sl = low.slice(sg.s, sg.e);
    if (sg.type === 'A') {
      const lead = /^\s*(?:(?:da|di|dal|dalla|dallo|della|del|per)\s+|:\s*)?/.exec(sl)[0].length;
      sr = sr.slice(lead);
      // ogni malattia con la sua eta' alla diagnosi: «X a 40 anni e Y a 52 anni»
      const pezzi = sr.split(/\s*,\s*|\s+e\s+|\s+ed\s+/i).map(x => x.trim()).filter(Boolean).map(x => {
        let xl = lowA(x), age = '';
        const ea = eventAge(xl);
        if (ea) { age = ea[1] || ea[2] || ea[3]; x = x.slice(0, ea.index) + x.slice(ea.index + ea[0].length); xl = xl.slice(0, ea.index) + xl.slice(ea.index + ea[0].length); }
        const bare = /(?<![a-z])(\d{1,3})\s*anni(?![a-z])/.exec(xl);
        if (bare) { if (!age) age = bare[1]; x = x.slice(0, bare.index) + x.slice(bare.index + bare[0].length); }
        return { x: x.replace(/^(?:diagnosticat[oaie]|esordio)\s*/i, '').trim(), age };
      });
      const items = [];
      pezzi.forEach(pz => {
        if (!pz.x) { if (items.length && pz.age && !items[items.length - 1].age) items[items.length - 1].age = pz.age; else if (pz.age) A.condAge = pz.age; return; }
        const nm = splitConds(pz.x);
        if (!nm.length) return;
        if (items.length && /^(?:(?:al|alla|allo|ai|alle|agli|del|della|dello|dei|delle|degli|nel|nella|sul|sulla)\s|(?:all|dell|nell|sull)')/i.test(pz.x)) {
          const prev = items[items.length - 1].name;
          const hm = /^(.+?)\s+(?:(?:al|alla|allo|ai|alle|agli|del|della|dello|dei|delle|degli|di|nel|nella|sul|sulla)\s|(?:all|dell|nell|sull)')/i.exec(prev);
          const head = hm ? hm[1] : (prev.includes(' ') ? prev.split(' ')[0] : '');
          items.push({ name: cleanCond(head ? head + ' ' + pz.x : pz.x), age: pz.age }); return;
        }
        nm.forEach((n, k) => items.push({ name: n, age: k === nm.length - 1 ? pz.age : '' }));
      });
      if (!items.length) { A.needCond = true; A.condAge = A.condAge || (pezzi.find(p => p.age) || {}).age || ''; }
      items.forEach(it => A.conditions.push({ name: it.name, age: it.age }));
      if (A.inh) { const gen = /^(?:malattia|patologia|condizione|sindrome|forma|disturbo|miopatia|encefalopatia|una malattia|una patologia)$/i; const k = A.conditions.findIndex(c => gen.test(c.name));
        const GEN = { AD: 'Malattia autosomica dominante', AR: 'Malattia autosomica recessiva', XLR: "Malattia recessiva legata all'X", XLD: "Malattia dominante legata all'X", XL: "Malattia legata all'X", YL: "Malattia legata all'Y", MT: 'Malattia mitocondriale', MF: 'Malattia multifattoriale', IMP: 'Malattia da imprinting', CR: 'Anomalia cromosomica' };
        if (k >= 0 || (!items.length && /malatti|patologi|sindrome|miopati|encefalopati|disturb/.test(sl))) { const nome = k >= 0 && /miopat|encefalopat/i.test(A.conditions[k].name) && A.inh === 'MT' ? cap(A.conditions[k].name) + ' mitocondriale' : GEN[A.inh]; if (k >= 0) A.conditions[k].name = nome; else A.conditions.push({ name: nome, age: '' }); A.needCond = false; } }
    } else if (sg.type === 'D') {
      A.deceased = true;
      const ea = /(?<![a-z'])(?:a|ad|all'eta di|all'eta|nel|eta)\s+(\d{1,3})\s*(?:anni|anno|aa|a\.)?(?![0-9])|(?<![a-z])(\d{1,3})\s*(?:anni|aa|a\.)(?![a-z])/.exec(sl);
      if (ea && !A.deathAge) { A.deathAge = ea[1] || ea[2]; sr = sr.slice(0, ea.index) + ' ' + sr.slice(ea.index + ea[0].length); sl = sl.slice(0, ea.index) + ' ' + sl.slice(ea.index + ea[0].length); }
      const cm = /(?:^|\s)(?:di|per|a causa di|da|in seguito a|causa)\s+(.+)$/.exec(sl);
      if (cm) { const cs = sr.slice(cm.index + cm[0].length - cm[1].length); splitConds(cs).forEach(n => A.conditions.push({ name: n, age: '' })); }
      else { const resto = sr.trim(); if (resto && splitConds(resto).every(n => eMalattiaNota(n) || /^Tumore /.test(malattiaCanonica(n)))) splitConds(resto).forEach(n => A.conditions.push({ name: n, age: '' })); }
    } else if (sg.type === 'V' || sg.type === 'N') {
      const t = sr.replace(/^\s*(?:(?:per|a|al|alla|di|del|della|nel|sul|in)\s+)?/i, '').replace(/^\s*(?:il\s+)?test(?:\s+genetico)?\s*(?:per\s+)?/i, '');
      const vs = t.split(/\s*,\s*|\s+e\s+|\s+ed\s+/i).map(normVariant).filter(Boolean);
      vs.forEach(v => A.variants.push({ text: v, neg: sg.type === 'N' }));
      if (!vs.length) { A.needVar = true; A.varNeg = sg.type === 'N'; }
    } else {
      const strip = /^\s*(?:(?:e|ed)\s+)?(?:(?:di|del|della|dello|dei|delle|per|:)\s+)?(?:(?:una|la|un|il)\s+)?(?:(?:mutazion[ei]|variant[ei]|allele|delezion[ei])\s+)?(?:(?:patogen\w*|probabilmente patogen\w*)\s+)?(?:(?:in|nel|del|di|sul|della)\s+)?(?:gene\s+)?/.exec(sl);
      const body = sr.slice(strip ? strip[0].length : 0);
      const isPort = /^portat/.test(lowA(raw.slice(sg.mi, sg.s)));
      if (body.trim() && eMalattiaNota(body.trim()) && !/(?<![a-z])[cgp]\.\S/i.test(body)) { A.carriers.push(malattiaCanonica(body.trim())); }
      else if (!body.trim() && /mutazion|variant/.test(sl)) { A.needVar = true; if (isPort) A.varCarrier = true; }
      else if (looksVariant(body) && isPort) { A.varCarrier = true; body.split(/\s*,\s*|\s+e\s+|\s+ed\s+/i).map(normVariant).filter(Boolean).forEach(v => A.variants.push({ text: v, neg: false })); }
      else if (looksVariant(body)) body.split(/\s*,\s*|\s+e\s+|\s+ed\s+/i).map(normVariant).filter(Boolean).forEach(v => A.variants.push({ text: v, neg: false }));
      else {
        const names = splitConds(body);
        if (names.length) A.carriers.push(...names); else A.carrierAny = true;
      }
    }
  }
  if (marks.some(mk => /^portat/.test(mk.w)) && (A.sameVar || A.needVar || (!A.carriers.length && A.carrierAny && /mutazion|variant/.test(low)))) A.varCarrier = true;
  marks.forEach(mk => { if (/^eterozig/.test(mk.w)) A.zyg = A.zyg || 'het'; else if (/^omozig/.test(mk.w)) A.zyg = 'omo'; else if (/^emizig/.test(mk.w)) A.zyg = 'emi'; });
  A.conditions.forEach(c => { c.name = malattiaCanonica(c.name); });
  A.carriers = A.carriers.map(malattiaCanonica);
  if (A.rmCond) A.rmCond = malattiaCanonica(A.rmCond);
  // conditions that are actually genotypes
  A.conditions = A.conditions.filter(c => { if (!eMalattiaNota(c.name) && !/^Tumore /.test(c.name) && looksVariant(c.name)) { A.variants.push({ text: normVariant(c.name), neg: false }); return false; } return true; });
  if (A.twin && A.zyg === 'het' && !A.variants.length && !A.needVar && !A.sameVar) { A.mz = false; A.zyg = ''; }
  if (A.zyg && !A.variants.length && !A.sameVar) A.needVar = true;
  if (A.sameVar) A.needVar = false;
  if ((A.sameVar || A.needVar) && A.needCond && !A.sameCond && !A.conditions.length) A.needCond = false;
  if (A.sameCond) A.needCond = false;
  if (A.carrierAny && (A.needVar || A.sameVar)) A.carrierAny = false;
  if (A.variants.some(v => !v.neg && v.text !== 'test')) A.needVar = false;
  if (A.zyg) A.variants.forEach(v => { if (!v.neg) v.zyg = A.zyg; });
  A.variants.forEach(v => { if (!v.neg) { if (A.varCarrier) { v.carrier = true; v.zyg = v.zyg || 'het'; } if (A.vcls) v.cls = A.vcls; if (A.vnote) v.note = A.vnote; } });
  if (A.rmCarrier && A.carrierAny && !A.carriers.length) A.carrierAny = false;
  // leftover in pre-segment
  let preR = raw.slice(pre.i, pre.e), preL = low.slice(pre.i, pre.e);
  const bareAge = /(?<![a-z'])(\d{1,3})\s*(anni|anno|mesi|aa|a\.)(?![a-z])/.exec(preL);
  if (bareAge && !A.age) { A.age = bareAge[1] + (/mes/.test(bareAge[2]) ? ' mesi' : ''); preL = preL.replace(bareAge[0], ' '); }
  const left = preL.split(/\s+/).filter(w => w && !COP.has(w) && !/^(ha|hanno|che|il|lo|la|i|gli|le|ed|anch|e|di|da|a|tutti|tutte|entrambi|entrambe|ma|pero)$/.test(w));
  A.unparsed = left.join(' ');
  return A;
}
function hasAttrs(A) { return A.conditions.length || A.inh || A.vnote || A.carriers.length || (A.variants && A.variants.length) || A.carrierAny || A.sex || A.name || A.age || A.deceased || A.healthy || A.adopted || A.pregnant || A.mz != null
  || A.makeProband || A.sposato || A.stillborn || A.consang != null || A.testato || A.rmCarrier || A.rmCond || A.untwin || A.alive || A.unsep || A.unadopt || A.presympt != null || A.childOf || A.parentOf || A.inherit
  || A.needCond || A.sameCond || A.needVar || A.sameVar || A.twin || A.sibs || A.sep || A.unionWith || A.unionPair || A.noKids || A.note || (A._extra && A._extra.length && (A.needCond || A.carrierAny)); }
function zygTxt(z) { return z === 'omo' ? ' in omozigosi' : z === 'emi' ? ' in emizigosi' : z === 'comp' ? ' (eterozigote composto)' : z === 'het' ? ' in eterozigosi' : ''; }
function describeAttrs(A, sex, n) {
  const e = agr(sex, n), out = [];
  if (A.healthy) out.push('san' + e);
  if (A.conditions.length && !A.deceased) out.push(`affett${e} da ` + A.conditions.map(c => c.name + (c.age ? ` (dx ${c.age})` : '')).join(', '));
  if (A.deceased) out.push(`decedut${e}` + (A.deathAge ? (/^\d+$/.test(A.deathAge) ? ` a ${A.deathAge} anni` : ` (${A.deathAge})`) : '') + (A.conditions.length ? ` (${A.conditions.map(c => c.name).join(', ')})` : ''));
  if (A.carriers.length || A.carrierAny) out.push((sex === 'F' ? (n > 1 ? 'portatrici' : 'portatrice') : (n > 1 ? 'portatori' : 'portatore')) + (A.carriers.length ? ' di ' + A.carriers.join(', ') : ''));
  if (A.inh) out.push('trasmissione ' + modoTesto(A.inh) + (A.inhNota ? ' (' + A.inhNota + ')' : ''));
  if (A.vnote === 'de novo' && !(A.variants || []).length) out.push('de novo');
  (A.variants || []).forEach(v => out.push(v.neg ? `negativ${e} ${v.text === 'test' ? 'al test' : 'per ' + v.text}` : `${v.carrier ? (sex === 'F' ? 'portatrice di ' : 'portatore di ') : 'variante '}${v.text}${v.carrier ? '' : zygTxt(v.zyg)}${v.cls ? ' (' + v.cls + ')' : ''}${v.note ? ' ' + v.note : ''}`));
  if (A.rmCarrier) out.push(A.rmCarrier === '*' ? 'non più portator' + (sex === 'F' ? 'e' : 'e') : 'non più portatore di ' + A.rmCarrier);
  if (A.rmCond) out.push('non affett' + e + ' da ' + A.rmCond);
  if (A.alive) out.push('viv' + e);
  if (A.sposato) out.push('sposat' + e);
  if (A.consang === true) out.push('consanguinei'); else if (A.consang === false) out.push('non consanguinei');
  if (A.testato && !(A.variants || []).length) out.push('test eseguito');
  if (A.makeProband) out.push('è il probando');
  if (A.untwin) out.push('non gemell' + e);
  if (A.unsep) out.push('non separati');
  if (A.unadopt) out.push('non adottat' + e);
  if (A.presympt) out.push('asintomatic' + (e === 'o' ? 'o' : e));
  if (A.childOf) out.push((n > 1 ? 'figli' : sex === 'F' ? 'figlia' : 'figlio') + ' di ' + A.childOf.ref);
  if (A.parentOf) out.push('genitore di ' + A.parentOf.ref);
  if (A.age) out.push(/mes|sett|gg/.test(A.age) ? A.age : A.age + ' anni');
  if (A.name) out.push('nome ' + A.name);
  if (A.adopted === 'out') out.push('dat' + e + ' in adozione'); else if (A.adopted) out.push('adottat' + e);
  if (A.pregnant) out.push('gravidanza in corso');
  if (A.twin) out.push(n > 1 || A.twinOf ? 'gemelli' + (A.mz === true ? ' monozigoti' : A.mz === false ? ' dizigoti' : ' (zigosità non nota)') : 'gemell' + e);
  if (A.sibs) out.push(sex === 'F' ? 'sorelle' : 'fratelli');
  if (A.unionWith || A.unionPair) out.push('coppia');
  if (A.sep) out.push(A.sep);
  if (A.noKids) out.push(A.noKids === 'infertile' ? 'coppia infertile' : 'nessun figlio');
  if (A.note) out.push('nota: ' + A.note);
  return out.join(', ');
}
function canonVariant(S, text, R) {
  // stessa variante gia' nella famiglia scritta in modo leggermente diverso (es. d508del -> F508del)
  if (text === 'test') return text;
  const fam = familyVariants(S).concat(Object.values(S.people).flatMap(p => (p.variants || []).filter(v => v.neg).map(v => v.text)));
  const t = lowA(text);
  if (fam.some(f => lowA(f) === t)) return fam.find(f => lowA(f) === t);
  const [g, ...rest] = text.split(' ');
  const r0 = lowA(rest.join(' '));
  for (const f of fam) {
    const [fg, ...fr] = f.split(' ');
    const r1 = lowA(fr.join(' '));
    if (lowA(fg) === lowA(g) && r0 && r1 && r0.length > 3 && dl(r0, r1) <= 1) {
      if (R) R.fixes.push([rest.join(' '), fr.join(' ')]);
      return f;
    }
  }
  return text;
}
function applyAttrs(S, id, A, R) {
  const p = S.people[id];
  if (A.sex && !p.miscarriage) { p.sex = A.sex; p.unions.forEach(u => orient(S, S.unions[u])); if (p.parentUnion) {} }
  if (A.name) p.name = A.name;
  if (A.age) p.age = A.age;
  if (A.deceased || (A.deathAge && /\D/.test(A.deathAge))) { p.deceased = true; if (A.deathAge) p.deathAge = A.deathAge; }
  if (A.healthy) { p.conditions = []; p.healthy = true; }
  if (A.alive) { p.deceased = false; p.deathAge = ''; }
  if (A.makeProband) S.probandId = id;
  if (A.testato && !(A.variants || []).length && !A.needVar && !A.varNeg) p.note = p.note ? (p.note.includes('testato') ? p.note : p.note + '; testato') : 'testato';
  if (A.stillborn) { p.stillborn = true; p.deceased = true; }
  if (A.unadopt) p.adopted = false;
  if (A.presympt != null) p.presympt = !!A.presympt;
  if (A.unsep) p.unions.forEach(u => { if (S.unions[u]) S.unions[u].separated = ''; });
  if (A.untwin && p.twin) { const g = p.twin; const resto = Object.values(S.people).filter(q => q.twin === g && q.id !== id); p.twin = null; p.twinType = ''; p.mz = false; if (resto.length < 2) resto.forEach(q => { q.twin = null; q.twinType = ''; q.mz = false; }); }
  if (A.rmCond) { const n0 = p.conditions.length; p.conditions = p.conditions.filter(c => !condMatches(A.rmCond, c.name)); if (n0 === p.conditions.length && R) R.log.push({ type: 'warn', text: `⟨${id}⟩ non risultava affetto da «${A.rmCond}».` }); }
  if (A.rmCarrier) {
    if (A.rmCarrier === '*') { p.carriers = []; p.variants = (p.variants || []).filter(v => !v.carrier); }
    else if (looksVariant(A.rmCarrier)) { const t = lowA(normVariant(A.rmCarrier)); p.variants = (p.variants || []).filter(v => !(lowA(v.text) === t || lowA(v.text).startsWith(t + ' '))); }
    else { p.carriers = p.carriers.filter(c => !condMatches(A.rmCarrier, c)); p.variants = (p.variants || []).filter(v => !(v.carrier && condMatches(A.rmCarrier, v.text))); }
  }
  for (const c of A.conditions) {
    const nm = registerCondition(S, c.name);
    if (p.sex === 'U' && !p.miscarriage && /^Sindrome di Turner$/.test(nm)) p.sex = 'F';
    if (p.sex === 'U' && !p.miscarriage && /^Sindrome di Klinefelter$/.test(nm)) p.sex = 'M';
    const ex = p.conditions.find(x => x.name === nm);
    if (ex) { if (c.age) ex.age = c.age; } else p.conditions.push({ name: nm, age: c.age || '' });
  }
  if (A.inh) A.conditions.forEach(c => impostaModo(S, registerCondition(S, c.name), A.inh, A.inhNota || null));
  if (A.vnote === 'de novo') {
    const tgt = A.conditions.length ? A.conditions.map(c => registerCondition(S, c.name)) : (!(A.variants || []).length && p.conditions.length ? [p.conditions[p.conditions.length - 1].name] : []);
    p.conditions.forEach(c => { if (tgt.includes(c.name)) c.denovo = true; });
    if (!A.conditions.length && !(A.variants || []).length) (p.variants || []).forEach(v => { if (!v.neg && v.text !== 'test') v.note = 'de novo'; });
  }
  for (const c of A.carriers) { const nm = registerCondition(S, c); if (!p.carriers.includes(nm)) p.carriers.push(nm); p.carriers = p.carriers.filter(x => x !== ''); }
  if (A.carrierAny && !p.carriers.length) p.carriers.push('');
  if (!p.variants) p.variants = [];
  for (const v0 of (A.variants || [])) {
    v0.text = canonVariant(S, v0.text, R);
    const v = Object.assign({}, v0);
    const ex = p.variants.find(x => lowA(x.text) === lowA(v.text));
    if (ex) { ex.neg = !!v.neg; if (v.zyg) ex.zyg = v.zyg; if (v.carrier != null) ex.carrier = !!v.carrier; if (v.cls) ex.cls = v.cls; if (v.note) ex.note = v.note; }
    else p.variants.push({ text: v.text, neg: !!v.neg, zyg: v.zyg || '', carrier: !!v.carrier, cls: v.cls || '', note: v.note || '' });
  }
  if (A.adopted) p.adopted = A.adopted === true ? 'in' : A.adopted;
  if (A.note) p.note = p.note ? (p.note.includes(A.note) ? p.note : p.note + '; ' + A.note) : A.note;
  if (A.mz != null && p.twin && !A.twin) Object.values(S.people).forEach(q => { if (q.twin === p.twin) { q.twinType = A.mz ? 'MZ' : 'DZ'; q.mz = !!A.mz; } });
  if (R && R.ctx) {
    if (A.conditions.length) R.ctx.focusCond = A.conditions.length === 1 ? registerCondition(S, A.conditions[0].name) : '';
    const pv = (A.variants || []).filter(v => !v.neg && v.text !== 'test');
    if (pv.length) R.ctx.focusVar = pv.length === 1 ? pv[0].text : '';
  }
  if (A.pregnant) {
    const u = ensurePartnerUnion(S, id, R);
    const c = addChild(S, u, 'U'); S.people[c].pregnancy = true; if (A.pregWeeks) S.people[c].note = A.pregWeeks + ' sett.'; R.created.add(c);
    R.log.push({ type: 'ok', text: `Aggiunta la gravidanza in corso di ⟨${id}⟩`, ids: [c] });
  }
  if (A.healthy || A.conditions.length || A.carriers.length) pruneConditions(S);
}

/* ---------- remove ---------- */
function removePerson(S, id) {
  const P = S.people, p = P[id];
  if (!p) return 'Persona non trovata.';
  if (id === S.probandId) return 'Non posso eliminare il probando.';
  if (unionsOf(S, id).some(u => u.children.length)) return `Non posso eliminare ⟨${id}⟩ perché collega altri familiari (ha figli nel pedigree). Elimina prima i figli, oppure toccalo per modificarne i dati.`;
  if (p.donorFor && S.unions[p.donorFor]) { const u = S.unions[p.donorFor]; u.donors = (u.donors || []).filter(x => x !== id); if (!u.donors.length && u.pma && u.pma.eterologa) u.pma.eterologa = ''; }
  if (p.parentUnion) { const u = S.unions[p.parentUnion]; u.children = u.children.filter(c => c !== id); }
  for (const u of unionsOf(S, id)) {
    const q = u.a === id ? u.b : u.a;
    (u.donors || []).forEach(d => delete P[d]);
    delete S.unions[u.id];
    if (q && P[q]) {
      P[q].unions = P[q].unions.filter(x => x !== u.id);
      if (!P[q].parentUnion && !P[q].unions.length && q !== S.probandId) delete P[q];
    }
  }
  if (p.twin) { const rest = Object.values(P).filter(q => q.twin === p.twin && q.id !== id); if (rest.length < 2) rest.forEach(q => { q.twin = null; q.mz = false; }); }
  delete P[id];
  pruneConditions(S);
  return null;
}

/* ---------- references by label / name ---------- */
function substituteRefs(S, text, labels) {
  const byLabel = {};
  Object.entries(labels || {}).forEach(([id, l]) => { byLabel[l] = id; });
  text = text.replace(/(?<![A-Za-z])([IVXivx]{1,4})\s*[-–.]\s*(\d{1,2})(?!\d)/g, (m, g, n) => { const id = byLabel[g.toUpperCase() + '-' + n]; return id ? '@' + id : m; });
  const names = {};
  Object.values(S.people).forEach(p => { if (p.name) { const k = lowA(p.name); names[k] = names[k] ? '!' : p.id; } });
  Object.entries(names).sort((a, b) => b[0].length - a[0].length).forEach(([k, id]) => {
    if (id === '!' || k.length < 2) return;
    const re = new RegExp('(?<![\\p{L}@])' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\p{L}])', 'giu');
    text = text.replace(re, (m, off, str) => lowA(m) === k ? '@' + id : m);
  });
  return text;
}


/* ---------- storia riproduttiva, PMA e prenatale ---------- */
const REPRO_TRIG = /(?<![a-z])(?:abort\w*|poliabortiv\w*|trimestr\w*|gravidanz\w*|incinta|gravida|gemellare|bigemin\w*|trigemin\w*|pma|ivf|fivet|fiv|icsi|iui|inseminazion\w*|transfer|trasferiment\w+ (?:di )?embrion\w*|embrion\w*|ovodonazion\w*|eterolog\w*|omolog\w*|donatric\w*|donator\w*|donazion\w* di (?:ovociti|seme|gameti|embrioni)|cicl[oi]|biochimic\w*|pgt\w*|preimpianto|crioconserv\w*|congelat\w*|vitrificat\w*|pick ?up|ovociti|gestazione per altri|madre surrogata|surrogat\w*|procreazione medicalmente assistita|fecondazione (?:in vitro|assistita)|ectopic\w*|extrauterin\w*|mola|ivg|itg|aborto terapeutico|interruzione|amniocentesi|villocentesi|nipt|dna fetale|cariotipo fetale|(?:\d{1,2})\s*(?:\+\s*\d\s*)?(?:settimane|sett|sg)|translucenza|igroma|feto|fetale|natomorto|stimolazion\w*)(?![a-z])/;
const REPRO_CONT = /^(?:(?:e|è)\s+nat[oaie]\s|nat[oaie]\s|esitat[oaie]\s|con\s+(?:la\s+)?nascita|culminat|conclus)|^(?:e\s+|ed\s+|con\s+|di cui\s+|poi\s+)?(?:(?:\d+|un[oa]?|un'|due|tre|quattro|cinque|sei|sette|otto|nove|dieci)\s+)?(?:altr[oie]\s+)?(?:transfer|cicl[oi]|abort[oi]|biochimic\w*|gravidanz\w*|embrion\w*|ectopic\w*|ivg|itg|pgt\w*|donatric\w*|donator\w*|eterolog\w*|omolog\w*|ovociti|fivet|icsi|iui|esito|risultat\w*|negativ\w*|positiv\w*|fallit\w*|non riuscit\w*|natomort\w*|mola|amniocentesi|villocentesi|nipt|cariotipo|feto|settiman\w*|sett(?![a-z])|translucenza|ecografi\w*|bitest|gemell\w*|maschi\w*|femmin\w*|di sesso|confermat\w*|quindi|successivamente|monocorial\w*|bicorial\w*|monoamniotic\w*|primo trimestre|secondo trimestre|terzo trimestre)/;
const NUMR = { un: 1, uno: 1, una: 1, "un'": 1, due: 2, tre: 3, quattro: 4, cinque: 5, sei: 6, sette: 7, otto: 8, nove: 9, dieci: 10, unico: 1, unica: 1 };
const NUMRE = "(\\d{1,2}|un|uno|una|un'|due|tre|quattro|cinque|sei|sette|otto|nove|dieci)";
const numDi = w => w == null ? null : (/^\d+$/.test(w) ? +w : (NUMR[w] != null ? NUMR[w] : null));
const CARIO = [
  [/(?:\+\s*21|t\s*21|trisomia\s*21|47\s*,\s*x[xy]\s*,\s*\+\s*21|sindrome di down)/, 'Sindrome di Down'],
  [/(?:\+\s*18|t\s*18|trisomia\s*18|47\s*,\s*x[xy]\s*,\s*\+\s*18|sindrome di edwards)/, 'Sindrome di Edwards'],
  [/(?:\+\s*13|t\s*13|trisomia\s*13|47\s*,\s*x[xy]\s*,\s*\+\s*13|sindrome di patau)/, 'Sindrome di Patau'],
  [/(?:45\s*,\s*x(?![xy])|45\s*x0|monosomia\s*x|sindrome di turner)/, 'Sindrome di Turner'],
  [/(?:47\s*,\s*xxy|sindrome di klinefelter)/, 'Sindrome di Klinefelter'],
  [/(?:triploidi\w*|69\s*,\s*x[xy][xy])/, 'Triploidia'],
  [/(?:22q11|del\s*\(?22\)?\s*\(?q11|sindrome di digeorge)/, 'Sindrome di DiGeorge'],
];
function reproUnion(S, ctx, R, subjIds) {
  // la coppia su cui si registra: due partner citati, oppure la persona (o il suo partner)
  const P = S.people;
  let ids = (subjIds || []).filter(i => P[i]);
  if (ids.length >= 2) { const u = unionBetween(S, ids[0], ids[1], R); return { u, donna: [u.a, u.b].find(x => x && P[x].sex === 'F') || u.b }; }
  let p = ids[0] || (ctx._ltRun && ctx.lastTouched.length ? ctx.lastTouched[ctx.lastTouched.length - 1] : S.probandId);
  if (P[p] && P[p].miscarriage && P[p].parentUnion) { const u = S.unions[P[p].parentUnion]; return { u, donna: [u.a, u.b].find(x => x && P[x].sex === 'F') || u.b }; }
  const us = unionsOf(S, p);
  const u = us.length ? us[us.length - 1] : ensurePartnerUnion(S, p, R);
  return { u, donna: [u.a, u.b].find(x => x && P[x].sex === 'F') || p };
}
function tryRepro(S, sub, ctx, R) {
  const foto = JSON.stringify({ people: S.people, unions: S.unions, seq: S.seq, useq: S.useq, tseq: S.tseq, conditions: S.conditions });
  const n0 = R.log.length, a0 = R.asks.length, c0 = new Set(R.created);
  const ok = tryRepro0(S, sub, ctx, R);
  if (!ok) { Object.assign(S, JSON.parse(foto)); R.log.length = n0; R.asks.length = a0; R.created = c0; }
  return ok;
}
function tryRepro0(S, sub, ctx, R) {
  const low = lowA(sub).replace(/[’`´]/g, "'");
  if (!REPRO_TRIG.test(low)) return false;
  // prima la "testa" della frase: soggetto esplicito («la probanda», «la sorella e il marito», «la coppia»)
  let subj = null, corpo = sub, corpoL = low;
  const mc = /^(?:la\s+)?(?:coppia|coniugi|i\s+coniugi|i\s+partner)\b\s*/.exec(low);
  if (mc) { subj = null; corpo = sub.slice(mc[0].length); corpoL = low.slice(mc[0].length); }
  else {
    const T = tokenize(sub);
    const npT = T.length ? parseNP(T, 0, null) : null;
    const nonPersona = (npT && /^(gravidanza|aborto)$/.test(npT.np.r)) || (T[0] && /^(natomorto|ivg|itg|feto|mola|aborti|gravidanze|transfer|ciclo|cicli)$/.test(T[0].t));
    if (T[0] && ADDV.includes(T[0].t)) {
      for (let k = 1; k < T.length - 1; k++) if ((TO.has(T[k].t) || OF.has(T[k].t)) && startsRef(T, k + 1) && !/^(gravidanza|aborto)$/.test((parseNP(T, k + 1, null) || { np: {} }).np.r)) { const r = parseRef(T, k + 1, R); if (r) { subj = resolveRef(S, r, ctx, R, true); break; } }
    }
    if (!subj && T.length && !nonPersona && !ADDV.includes(T[0].t) && (T[0].t.startsWith('@') || PRON.has(T[0].t) || startsNP(T, 0)) && !/^(?:un|una|uno|due|tre|\d)/.test(T[0].t)) {
      const r = parseRef(T, 0, R);
      if (r) {
        let ids = resolveRef(S, r, ctx, R, true);
        let k = r.j;
        if (T[k] && T[k].t === 'e' && startsRef(T, k + 1)) { const r2 = parseRef(T, k + 1, R); if (r2) { ids = ids.concat(resolveRef(S, r2, ctx, R, true)); k = r2.j; } }
        subj = ids;
        corpo = T[k] ? sub.slice(T[k].s) : ''; corpoL = lowA(corpo);
      }
    }
  }
  const { u, donna } = reproUnion(S, ctx, R, subj);
  const P = S.people;
  const pma = u.pma = u.pma || { cicli: 0, tecnica: [], transfer: 0, falliti: 0, crio: 0, pgt: '', eterologa: '', note: [] };
  const L = corpoL;
  const conta = re => { const m = re.exec(L); return m ? (numDi(m[1]) != null ? numDi(m[1]) : 1) : 0; };
  const fatto = [];
  // tecniche
  const tec = [];
  if (/(?<![a-z])(?:fivet|ivf|fiv|fecondazione in vitro)(?![a-z])/.test(L)) tec.push('FIVET');
  if (/(?<![a-z])icsi(?![a-z])/.test(L)) tec.push('ICSI');
  if (/(?<![a-z])(?:iui|inseminazion\w*)(?![a-z])/.test(L)) tec.push('IUI');
  tec.forEach(t => { if (!pma.tecnica.includes(t)) pma.tecnica.push(t); });
  const usaPMA = /(?<![a-z])(?:pma|ivf|fivet|fiv|icsi|iui|inseminazion\w*|transfer|embrion\w*|eterolog\w*|omolog\w*|ovodonazion\w*|procreazione|fecondazione|stimolazion\w*|pick ?up)(?![a-z])/.test(L);
  // cicli e transfer
  let n = conta(new RegExp(NUMRE + "\\s+(?:altr[oi]\\s+)?(?:cicl[oi]|tentativ[oi]|stimolazion[ei])"));
  if (!n) { const m2 = new RegExp(NUMRE + "\\s+(?:fivet|icsi|iui|ivf|inseminazioni)").exec(L); if (m2) n = numDi(m2[1]) || 1; }
  if (!n && /(?<![a-z])(?:un\s+)?ciclo(?![a-z])/.test(L)) n = 1;
  if (n) { pma.cicli += n; fatto.push(`${n} cicl${n > 1 ? 'i' : 'o'}${tec.length ? ' ' + tec.join('/') : ''}`); }
  let tr = conta(new RegExp(NUMRE + "\\s+(?:altr[oi]\\s+)?(?:transfer|trasferiment[oi](?:\\s+(?:di\\s+)?embrion\\w+)?|et)(?![a-z])"));
  if (!tr && /(?<![a-z])transfer(?![a-z])/.test(L)) tr = 1;
  const negTr = /(?:non\s+riuscit\w*|fallit\w*|negativ\w*|senza\s+(?:esito|successo|gravidanza|attecchimento)|non\s+(?:e|è)\s+andat\w+|andat\w+\s+male|mancato\s+impianto|non\s+(?:ha|hanno)\s+attecchit\w*)/.test(L);
  if (tr) { pma.transfer += tr; if (negTr) pma.falliti += tr; fatto.push(`${tr} transfer${negTr ? ' non riuscit' + (tr > 1 ? 'i' : 'o') : ''}`); }
  const crio = conta(new RegExp(NUMRE + "\\s+(?:embrion[ei]|blastocist[ie]|ovociti)\\s+(?:crioconservat\\w*|congelat\\w*|vitrificat\\w*|in\\s+crio\\w*)"));
  if (crio) { pma.crio += crio; fatto.push(`${crio} embrion${crio > 1 ? 'i' : 'e'} crioconservat${crio > 1 ? 'i' : 'o'}`); }
  const pg = /(?<![a-z])(pgt[\s-]?(?:a|m|sr)|pgd|pgs|diagnosi\s+(?:genetica\s+)?preimpianto)(?:\s+per\s+([^,;]+?))?(?=,|;|$|\s+e\s+(?:\d|un|due|tre)|\s+con\s)/.exec(L);
  if (pg) { let t = pg[1].toUpperCase().replace(/\s+/g, '-').replace(/^PGD$/, 'PGT-M').replace(/^PGS$/, 'PGT-A'); if (/preimpianto/i.test(t)) t = 'PGT'; const per = pg[2] ? corpo.slice(L.indexOf(pg[2]), L.indexOf(pg[2]) + pg[2].length).trim() : ''; pma.pgt = t + (per ? ' per ' + per : ''); fatto.push(pma.pgt); }
  // eterologa / donatori / surrogata
  let don = null;
  if (/(?:doppia\s+eterologa|embrion\w*\s+(?:donat\w*|da\s+donazione)|donazione\s+di\s+embrion\w*)/.test(L)) don = 'embrione';
  else if (/(?:ovodonazion\w*|donatric\w*|donazion\w*\s+(?:di\s+)?ovociti|ovociti\s+(?:di|da)\s+donatrice|eterologa\s+femminile)/.test(L)) don = 'ovociti';
  else if (/(?:seme\s+(?:di|da)\s+donatore|donator\w*\s+(?:di\s+)?seme|donazion\w*\s+di\s+seme|spermatozoi\s+(?:di|da)\s+donatore|eterologa\s+maschile|donatore)/.test(L)) don = 'seme';
  else if (/(?<![a-z])eterolog\w*/.test(L)) don = 'ovociti';
  const surr = /(?:gestazione\s+per\s+altri|madre\s+surrogata|maternit\w+\s+surrogat\w+|surrogat\w*|gestante\s+per\s+altri)/.test(L);
  const nuoviDonatori = [];
  const addDonor = (tipo) => {
    u.donors = u.donors || [];
    let d = u.donors.find(x => P[x] && P[x].donor === tipo);
    if (!d) {
      d = mk(S, tipo === 'seme' ? 'M' : tipo === 'embrione' ? 'U' : 'F');
      P[d].donor = tipo; P[d].donorFor = u.id; u.donors.push(d); R.created.add(d); nuoviDonatori.push(d);
    }
    const ma = new RegExp("(?:donatric\\w*|donator\\w*|donazione|surrogat\\w*|gestante)[^,;]{0,25}?(?:di\\s+)?(\\d{2})\\s*(?:anni|aa|enne)").exec(L) || /(\d{2})\s*enne\s+(?:donatric|donator)/.exec(L);
    if (ma) P[d].age = ma[1];
    return d;
  };
  if (don) { pma.eterologa = don; const d = addDonor(don); fatto.push((don === 'ovociti' ? 'eterologa con ovociti donati' : don === 'seme' ? 'eterologa con seme di donatore' : 'doppia eterologa (embrioni donati)') + (P[d].age ? ` (${don === 'seme' ? 'donatore' : 'donatrice'} ${P[d].age} anni)` : '')); }
  if (surr) { addDonor('surrogata'); fatto.push('gestazione per altri'); }
  // esiti di gravidanza
  const tagPMA = usaPMA ? (don ? 'PMA eterologa' : tec.length ? tec[0] : 'PMA') : '';
  const ga = (() => {
    const m = /(?:a|alla|di|dopo|verso|intorno\s+alle)?\s*(\d{1,2})\s*(?:esima|ma|a|°|ª)?\s*(?:\+\s*(\d))?\s*(?:settimane|settimana|sett\.?|sg|w)(?![a-z])/.exec(L);
    if (m) return m[1] + (m[2] ? '+' + m[2] : '') + ' sett.';
    const t = /(primo|secondo|terzo|i|ii|iii)\s+trimestre/.exec(L);
    return t ? ({ primo: 'I', i: 'I', secondo: 'II', ii: 'II', terzo: 'III', iii: 'III' })[t[1]] + ' trim.' : '';
  })();
  let causa = null;
  // la causa non si cerca nella frase della PGT («PGT-M per CFTR» dice per cosa si testa, non una diagnosi del feto)
  const LC = L.replace(/(?<![a-z])(?:pgt[\s-]?(?:a|m|sr)|pgd|pgs|diagnosi\s+(?:genetica\s+)?preimpianto)(?:\s+per\s+[^,;]+)?/g, ' ').replace(/(?:portat\w+|eterozigot\w+)\s+(?:di|per)\s+[^,;]+/g, ' ');
  const contestoCausa = /(?<![a-z])(?:ivg|itg|interruzion\w*|natomort\w*|fet[oi]|fetale)(?![a-z])/.test(LC);
  for (const [re, nome] of CARIO) if (re.test(LC)) { causa = nome; break; }
  if (!causa && contestoCausa) { const mm = /(?:per|causa|a\s+causa\s+di|motivo)\s+(?:una?\s+|la\s+|il\s+|l')?([^,;]+?)(?=,|;|$|\s+(?:a|alla)\s+\d|\s+dopo\s|\s+con\s)/.exec(LC); if (mm && !/^(?:motivi|ragioni|scelta|volont)/.test(mm[1])) { const testo = corpo.slice(L.indexOf(mm[1]), L.indexOf(mm[1]) + mm[1].length).trim(); if (sembraMalattia(testo) || /(?:malformazion|cardiopatia|igroma|idrope|anomali|spina|anencefal|ernia|onfalocele|gastroschisi|displasia|agenesia)/.test(lowA(testo))) causa = malattiaCanonica(testo); } }
  if (!causa) { const mf = /fet[oi]\s+(?:affett\w+\s+da|con)\s+(?:una?\s+|la\s+|il\s+)?([^,;]+?)(?=,|;|$|\s+(?:a|alla)\s+\d)/.exec(LC); if (mf) causa = malattiaCanonica(corpo.slice(L.indexOf(mf[1]), L.indexOf(mf[1]) + mf[1].length).trim()); }
  const sessoF = /(?:fet[oi]|di sesso)\s+(?:maschi\w*|maschile)|(?<![a-z])maschi(?:o|le)(?![a-z])/.test(L) ? 'M' : /(?:fet[oi]|di sesso)\s+(?:femmin\w*|femminile)|(?<![a-z])femmin(?:a|ile)(?![a-z])/.test(L) ? 'F' : null;
  const esami = [];
  const em = /(?<![a-z])(amniocentesi|villocentesi|cvs|nipt|dna\s+fetale|test\s+prenatale\s+non\s+invasivo|cariotipo(?:\s+fetale)?|array(?:-?cgh)?|cgh|qf-?pcr|ecografia(?:\s+morfologica)?|morfologica|translucenza(?:\s+nucale)?)\s*:?\s*((?:[^,;]|,(?=\s*(?:x|y|\+|-|\d)))*)/g;
  let mt; while ((mt = em.exec(L))) { const nome = mt[1].replace(/\s+/g, ' '); const esito = corpo.slice(mt.index + mt[0].length - mt[2].length, mt.index + mt[0].length).trim().replace(/^(?:con\s+)?(?:esito\s+)?/i, ''); esami.push((nome === 'nipt' || nome === 'dna fetale' ? 'NIPT' : nome === 'cvs' ? 'villocentesi' : nome) + (esito ? ': ' + esito : '')); }
  const nuovi = [];
  const prima = /prima\s+(?:della\s+nascita\s+)?(?:del|della|di|dello)\s+(probando|probanda|@p\d+|primo figlio|prima figlia)/.exec(L);
  const metti = c => { if (!prima) return; const rif = /^@/.test(prima[1]) ? prima[1].slice(1) : S.probandId; const i0 = u.children.indexOf(rif); if (i0 >= 0) { u.children = u.children.filter(x => x !== c); u.children.splice(i0, 0, c); } };
  const inCorso = () => u.children.find(x => P[x] && P[x].pregnancy);
  const perdita = (tipo, quante) => {
    for (let i = 0; i < quante; i++) {
      const g0 = i === 0 && (tipo === 'TOP' || tipo === 'SAB') ? inCorso() : null;
      const c = g0 || addChild(S, u, sessoF || 'U');
      if (g0) { P[c].pregnancy = false; if (sessoF) P[c].sex = sessoF; }
      metti(c);
      Object.assign(P[c], { miscarriage: true, loss: tipo, top: tipo === 'TOP', ga: ga || P[c].ga || '', pma: tagPMA || P[c].pma || '', prenatal: [...(P[c].prenatal || []), ...esami] });
      if (!causa && g0) { const txt = lowA((P[c].prenatal || []).join(' ')); for (const [re, nome] of CARIO) if (re.test(txt) && /(?:amnio|villo|cariotipo|array|cgh|qf)/.test(txt)) { causa = nome; break; } }
      if (tipo === 'TOP' && /(?<![a-z])ivg(?![a-z])/.test(L) && !/(?<![a-z])itg(?![a-z])/.test(L) && !causa) P[c].topKind = 'IVG'; else if (tipo === 'TOP') P[c].topKind = causa || /(?<![a-z])itg(?![a-z])/.test(L) || /terapeutic/.test(L) ? 'ITG' : 'IVG';
      if (causa) { const nm = registerCondition(S, causa); P[c].conditions.push({ name: nm, age: '' }); }
      if (!g0) R.created.add(c); else R.touched.add(c);
      nuovi.push(c);
    }
  };
  const nSAB = conta(new RegExp(NUMRE + "\\s+(?:altr[oi]\\s+)?abort[oi](?!\\s+(?:terapeutic|volontari|indott))(?:\\s+spontane[oi])?")) || (/(?<![a-z])(?:un\s+|l')?aborto(?:\s+spontaneo)?(?![a-z])(?!\s+(?:terapeutic|volontari|indott))/.test(L) && !/(?<![a-z])(?:ivg|itg)(?![a-z])/.test(L) ? 1 : 0);
  const nBIO = conta(new RegExp(NUMRE + "\\s+(?:altr[ae]\\s+)?(?:gravidanz[ae]\\s+)?biochimic[ahe]+")) || (/biochimic/.test(L) ? 1 : 0);
  const nECT = conta(new RegExp(NUMRE + "\\s+(?:gravidanz[ae]\\s+)?(?:ectopic\\w+|extrauterin\\w+|tubaric\\w+)")) || (/(?:ectopic|extrauterin|tubaric)/.test(L) ? 1 : 0);
  const nMOLA = /(?<![a-z])mola(?![a-z])/.test(L) ? 1 : 0;
  const nTOP = conta(new RegExp(NUMRE + "\\s+(?:ivg|itg|interruzion[ei])")) || (/(?<![a-z])(?:ivg|itg)(?![a-z])/.test(L) ? 1 : 0);
  const nSB = conta(new RegExp(NUMRE + "\\s+(?:figli[oe]?\\s+|bambin[oie]\\s+)?natomort\\w*")) || (/natomort/.test(L) ? 1 : 0);
  if (nSAB) { perdita('SAB', nSAB); fatto.push(`${nSAB} abort${nSAB > 1 ? 'i' : 'o'} spontane${nSAB > 1 ? 'i' : 'o'}`); }
  if (nBIO) { perdita('BIO', nBIO); fatto.push(`${nBIO} gravidanz${nBIO > 1 ? 'e' : 'a'} biochimic${nBIO > 1 ? 'he' : 'a'}`); }
  if (nECT) { perdita('ECT', nECT); fatto.push(`${nECT} gravidanz${nECT > 1 ? 'e' : 'a'} ectopic${nECT > 1 ? 'he' : 'a'}`); }
  if (nMOLA) { perdita('MOLA', 1); fatto.push('mola vescicolare'); }
  if (nTOP) { perdita('TOP', nTOP); fatto.push(`${nTOP > 1 ? nTOP + ' ' : ''}${P[nuovi[nuovi.length - 1]].topKind === 'IVG' ? 'IVG' : 'ITG'}${causa ? ' per ' + causa : ''}${ga ? ' a ' + ga : ''}`); }
  if (nSB) {
    for (let i = 0; i < nSB; i++) { const g0 = i === 0 ? inCorso() : null; const c = g0 || addChild(S, u, sessoF || 'U'); if (g0) { P[c].pregnancy = false; if (sessoF) P[c].sex = sessoF; } metti(c); Object.assign(P[c], { stillborn: true, deceased: true, ga, pma: tagPMA, prenatal: esami.slice() }); if (causa) P[c].conditions.push({ name: registerCondition(S, causa), age: '' }); R.created.add(c); nuovi.push(c); }
    fatto.push(`${nSB > 1 ? nSB + ' ' : ''}nat${nSB > 1 ? 'i' : 'o'} mort${nSB > 1 ? 'i' : 'o'}${ga ? ' a ' + ga : ''}`);
  }
  // nati vivi e gravidanza in corso
  const nati = new RegExp("(?:(?:e|è)\\s+nat[oaie]|(?:ha|hanno)\\s+avuto|nascita\\s+di|con\\s+la\\s+nascita\\s+di|esitat[oa]\\s+in|e\\s+nat[oaie]|nat[oaie])\\s+" + NUMRE + "?\\s*(figli[oae]?|figlie|bambin[oaie]|gemell[oaie]|maschi\\w*|femmin\\w*)").exec(L);
  if (nati && !nSB) {
    const qn = numDi(nati[1]) || (/gemell/.test(nati[2]) ? 2 : 1);
    const sx = /^(?:figlia|figlie|bambin[ae]|gemell[ae]|femmin)/.test(nati[2]) ? 'F' : /^(?:figlio|figli|bambin[oi]|gemell[oi]|maschi)/.test(nati[2]) && !/^figli$/.test(nati[2]) ? 'M' : (nati[2] === 'figli' ? 'M' : 'U');
    const t = /gemell/.test(nati[2]) || qn > 1 && /gemell/.test(L) ? 't' + (S.tseq++) : null;
    for (let i = 0; i < qn; i++) { const c = addChild(S, u, sx); P[c].pma = tagPMA; if (t) { P[c].twin = t; P[c].twinType = /monozigot|identic/.test(L) ? 'MZ' : /dizigot/.test(L) ? 'DZ' : '?'; P[c].mz = P[c].twinType === 'MZ'; } R.created.add(c); nuovi.push(c); }
    fatto.push(`nat${qn > 1 ? (sx === 'F' ? 'e' : 'i') : (sx === 'F' ? 'a' : 'o')} ${qn > 1 ? qn + ' ' : ''}${qn > 1 ? (sx === 'F' ? 'figlie' : 'figli') : (sx === 'F' ? 'una figlia' : 'un figlio')}${tagPMA ? ' (' + tagPMA + ')' : ''}`);
  }
  if (/(?:gravidanz\w*(?:\s+[a-z]+){0,2}\s+in\s+corso|settiman\w*\s+di\s+gravidanza|(?:e|è)\s+(?:alla|a)\s+\d{1,2}\s*(?:esima|ma|a|°)?\s*settiman|gravidanza\s+(?:gemellare|bigemina|trigemina|singola)|(?:e|è)\s+incinta|attualmente\s+incinta|(?<![a-z])gravida(?![a-z])|(?<![a-z])incinta(?![a-z])|in\s+gravidanza|gravidanza\s+(?:evolutiva|attuale)|in\s+attesa\s+di\s+un)/.test(L) && !nTOP && !nSAB) {
    const nGem = /(?:trigemin\w*|trigemellare)/.test(L) ? 3 : /(?:gemellare|bigemin\w*|gemelli|gemelle)/.test(L) ? 2 : 1;
    const esist = u.children.filter(x => P[x].pregnancy);
    const gr = esist.slice(0, nGem);
    while (gr.length < nGem) { const c = addChild(S, u, sessoF || 'U'); P[c].pregnancy = true; R.created.add(c); nuovi.push(c); gr.push(c); }
    if (nGem > 1) { const t = gr.map(x => P[x].twin).find(Boolean) || 't' + (S.tseq++); const ty = /monocorial|monoamniotic|monozigot/.test(L) ? 'MZ' : /dizigot/.test(L) ? 'DZ' : '?'; gr.forEach(x => { P[x].twin = t; P[x].twinType = ty; P[x].mz = ty === 'MZ'; }); }
    gr.forEach(c => { Object.assign(P[c], { ga: ga || P[c].ga, pma: tagPMA || P[c].pma, prenatal: [...(P[c].prenatal || []), ...esami] }); if (causa && nGem === 1) P[c].conditions.push({ name: registerCondition(S, causa), age: '' }); if (sessoF && nGem === 1) P[c].sex = sessoF; });
    fatto.push((nGem > 1 ? (nGem === 3 ? 'gravidanza trigemina' : 'gravidanza gemellare') : 'gravidanza') + ' in corso' + (ga ? ' a ' + ga : '') + (tagPMA ? ' (' + tagPMA + ')' : '') + (causa && nGem === 1 ? ', feto con ' + causa : ''));
  }
  // donatori collegati anche ai figli e alle gravidanze appena creati
  if (don) nuovi.forEach(c => { P[c].pma = 'PMA eterologa'; });
  if (!fatto.length && usaPMA) { if (!pma.note.includes('PMA')) pma.note.push('PMA'); fatto.push('percorso di PMA'); }
  if (!fatto.length && esami.length) {
    // esame prenatale senza esito di gravidanza: lo si mette sulla gravidanza in corso
    let c = u.children.find(x => P[x].pregnancy) || null;
    if (!c) { c = addChild(S, u, sessoF || 'U'); P[c].pregnancy = true; R.created.add(c); nuovi.push(c); }
    P[c].prenatal = [...(P[c].prenatal || []), ...esami]; if (ga) P[c].ga = ga;
    fatto.push('esami prenatali: ' + esami.join('; '));
  }
  if (!fatto.length) return false;
  if (!pma.cicli && !pma.transfer && !pma.crio && !pma.pgt && !pma.eterologa && !pma.tecnica.length && !pma.note.length) delete u.pma;
  [u.a, u.b].filter(Boolean).forEach(x => R.touched.add(x));
  const chi = [u.a, u.b].filter(Boolean).map(x => '⟨' + x + '⟩').join(' e ');
  R.log.push({ type: 'ok', text: `Storia riproduttiva di ${chi}: ${fatto.join(', ')}`, ids: [...nuovi, ...nuoviDonatori] });
  ctx.lastAdded = nuovi.length ? nuovi : ctx.lastAdded; ctx.subIdx = 0;
  ctx.lastTouched = [donna].filter(Boolean);
  return true;
}
function uniscicontinuazioni(clausole) {
  // «2 cicli di PMA, due transfer non riusciti con 1 aborto e una biochimica» resta una sola frase
  const out = [];
  for (const c of clausole) {
    const l = lowA(c).trim();
    if (out.length && REPRO_TRIG.test(lowA(out[out.length - 1])) && REPRO_CONT.test(l)) out[out.length - 1] += ', ' + c;
    else out.push(c);
  }
  return out;
}
function reproRiassunto(S) {
  // note a pie' di pedigree: una riga per coppia con storia di PMA
  return Object.values(S.unions).filter(u => u.pma).map(u => {
    const p = u.pma, parti = [];
    if (p.tecnica.length || p.cicli) parti.push(`${p.cicli ? p.cicli + ' cicl' + (p.cicli > 1 ? 'i' : 'o') + ' ' : ''}${p.tecnica.join('/') || 'PMA'}`);
    if (p.eterologa) parti.push(p.eterologa === 'ovociti' ? 'ovodonazione' : p.eterologa === 'seme' ? 'seme di donatore' : 'embrioni donati');
    if (p.transfer) parti.push(`${p.transfer} transfer${p.falliti ? ` (${p.falliti} non riuscit${p.falliti > 1 ? 'i' : 'o'})` : ''}`);
    if (p.pgt) parti.push(p.pgt);
    if (p.crio) parti.push(`${p.crio} embrion${p.crio > 1 ? 'i' : 'e'} crioconservat${p.crio > 1 ? 'i' : 'o'}`);
    const esiti = u.children.map(c => S.people[c]).filter(x => x && (x.miscarriage || x.pregnancy || x.stillborn) && x.pma);
    const conta = t => esiti.filter(x => x.loss === t).length;
    const e2 = [];
    if (conta('SAB')) e2.push(conta('SAB') + ' aborto spont.');
    if (conta('BIO')) e2.push(conta('BIO') + ' biochimica');
    if (conta('ECT')) e2.push(conta('ECT') + ' ectopica');
    if (conta('TOP')) e2.push(conta('TOP') + ' interruzione');
    if (e2.length) parti.push('esiti: ' + e2.join(', '));
    (p.note || []).filter(x => x !== 'PMA').forEach(x => parti.push(x));
    return { u: u.id, a: u.a, b: u.b, testo: parti.join(' · ') || 'PMA' };
  });
}

/* >>> genetica: modalità di trasmissione, citogenetica, controlli di coerenza, suggerimenti di consulenza */

/* ---------- modalità di trasmissione ---------- */
const MODI = {
  AD: { breve: 'AD', nome: 'autosomica dominante' }, AR: { breve: 'AR', nome: 'autosomica recessiva' },
  XLR: { breve: 'XLR', nome: 'recessiva legata all’X' }, XLD: { breve: 'XLD', nome: 'dominante legata all’X' },
  XL: { breve: 'XL', nome: 'legata all’X' }, YL: { breve: 'YL', nome: 'legata all’Y' },
  MT: { breve: 'MT', nome: 'mitocondriale' }, MF: { breve: 'MF', nome: 'multifattoriale' },
  CR: { breve: 'CR', nome: 'cromosomica' }, IMP: { breve: 'IMP', nome: 'da imprinting' },
};
const INH = {};
[['AR', ['Fibrosi cistica', 'Atrofia muscolare spinale', 'Talassemia', 'Alfa talassemia', 'Anemia falciforme', 'Fenilchetonuria', 'Malattia di Gaucher', 'Malattia di Tay-Sachs',
  'Malattia di Wilson', 'Emocromatosi', 'Galattosemia', 'Deficit di MCAD', 'Leucinosi', 'Omocistinuria', 'Malattia di Niemann-Pick', 'Malattia di Krabbe', 'Leucodistrofia metacromatica',
  'Deficit di alfa-1 antitripsina', 'Iperplasia surrenalica congenita', 'Anemia di Fanconi', 'Atassia di Friedreich', 'Malattia di Pompe', 'Sindrome di Usher', 'Sindrome di Pendred',
  'Sindrome di Bardet-Biedl', 'Sindrome di Joubert', 'Amaurosi congenita di Leber', 'Malattia di Stargardt', 'Albinismo', 'Poliposi associata a MUTYH', 'Febbre mediterranea familiare', 'Mucopolisaccaridosi']],
 ['AD', ['Malattia di Huntington', 'Distrofia miotonica', 'Cardiomiopatia ipertrofica', 'Cardiomiopatia dilatativa', 'Cardiomiopatia aritmogena', 'Sindrome di Marfan', 'Neurofibromatosi tipo 1',
  'Neurofibromatosi tipo 2', 'Rene policistico', 'Ipercolesterolemia familiare', 'Sindrome di Lynch', 'Poliposi adenomatosa familiare', 'Acondroplasia', 'Ipocondroplasia', 'Displasia tanatofora',
  'Osteogenesi imperfetta', 'Sindrome di Noonan', 'Sindrome di Brugada', 'Sindrome del QT lungo', 'CPVT', 'Charcot-Marie-Tooth', 'Sclerosi tuberosa', 'Sindrome di von Hippel-Lindau',
  'Neoplasia endocrina multipla tipo 1', 'Neoplasia endocrina multipla tipo 2', 'Sindrome di Li-Fraumeni', 'Sindrome di Peutz-Jeghers', 'Sindrome di Cowden', 'Sindrome ereditaria mammella-ovaio',
  'Retinoblastoma', 'Distrofia facio-scapolo-omerale', 'Sindrome di Loeys-Dietz', 'Sindrome di Stickler', 'Sindrome di Waardenburg', 'Sindrome di Holt-Oram', 'Sindrome di Treacher Collins',
  'Sindrome di Crouzon', 'Sindrome di Apert', 'Sindrome di Sotos', 'Sindrome di Kabuki', 'Sindrome CHARGE', 'Sindrome di Cornelia de Lange', 'Sindrome di Dravet', 'Atassia spinocerebellare',
  'Paraplegia spastica ereditaria', 'CADASIL', 'Sferocitosi ereditaria', 'Malattia di von Willebrand', 'Esostosi multiple', 'Diabete MODY', 'Aniridia', 'Sindrome di Ehlers-Danlos']],
 ['XLR', ['Distrofia muscolare di Duchenne', 'Distrofia muscolare di Becker', 'Emofilia A', 'Emofilia B', 'Adrenoleucodistrofia', 'Malattia di Kennedy', 'Deficit di G6PD', 'Daltonismo']],
 ['XL', ['Malattia di Fabry', "Sindrome dell'X fragile", 'Sindrome di Alport']],
 ['XLD', ['Sindrome di Rett']],
 ['MT', ['Neuropatia ottica di Leber']],
 ['IMP', ['Sindrome di Prader-Willi', 'Sindrome di Angelman', 'Sindrome di Beckwith-Wiedemann', 'Sindrome di Silver-Russell']],
 ['CR', ['Sindrome di Down', 'Sindrome di Edwards', 'Sindrome di Patau', 'Sindrome di Turner', 'Sindrome di Klinefelter', 'Sindrome di DiGeorge', 'Sindrome di Williams',
  'Sindrome di Wolf-Hirschhorn', 'Sindrome del cri du chat', 'Sindrome di Smith-Magenis', 'Triploidia']],
 ['MF', ['Diabete tipo 2', 'Labiopalatoschisi', 'Spina bifida', 'Ipertensione', 'Cardiopatia congenita', 'Autismo', 'Schizofrenia', 'Disturbo bipolare', 'Celiachia']],
].forEach(([m, nomi]) => nomi.forEach(n => { INH[n] = m; }));
// geni sul cromosoma X: per i controlli di zigosità
const GENI_X = new Set(['DMD', 'FMR1', 'F8', 'F9', 'GLA', 'ABCD1', 'AR', 'MECP2', 'CDKL5', 'PCDH19', 'OTC', 'G6PD', 'COL4A5', 'NR0B1', 'IL2RG', 'BTK', 'WAS', 'RPGR', 'RS1', 'CHM',
  'OCRL', 'PLP1', 'L1CAM', 'ATRX', 'ARX', 'SLC6A8', 'HPRT1', 'EMD', 'GJB1', 'KDM5C', 'OPHN1', 'NHS', 'PHEX', 'TAZ', 'LAMP2', 'ALAS2', 'AVPR2', 'CYBB', 'DCX', 'SMC1A', 'HDAC8', 'NSDHL', 'PORCN', 'IKBKG', 'OFD1']);
const GENE_MALATTIA = { CFTR: 'Fibrosi cistica', SMN1: 'Atrofia muscolare spinale', HBB: 'Talassemia', HBA1: 'Alfa talassemia', HBA2: 'Alfa talassemia', DMD: 'Distrofia muscolare di Duchenne',
  F8: 'Emofilia A', F9: 'Emofilia B', FMR1: "Sindrome dell'X fragile", HEXA: 'Malattia di Tay-Sachs', GBA: 'Malattia di Gaucher', GBA1: 'Malattia di Gaucher', ATP7B: 'Malattia di Wilson', HFE: 'Emocromatosi',
  PAH: 'Fenilchetonuria', GJB2: 'Sordità congenita', BRCA1: 'Sindrome ereditaria mammella-ovaio', BRCA2: 'Sindrome ereditaria mammella-ovaio', MLH1: 'Sindrome di Lynch', MSH2: 'Sindrome di Lynch',
  MSH6: 'Sindrome di Lynch', PMS2: 'Sindrome di Lynch', APC: 'Poliposi adenomatosa familiare', MUTYH: 'Poliposi associata a MUTYH', GLA: 'Malattia di Fabry', ABCD1: 'Adrenoleucodistrofia', G6PD: 'Deficit di G6PD',
  MEFV: 'Febbre mediterranea familiare', GALT: 'Galattosemia', ACADM: 'Deficit di MCAD', SERPINA1: 'Deficit di alfa-1 antitripsina', CYP21A2: 'Iperplasia surrenalica congenita', FXN: 'Atassia di Friedreich' };
function coloreGene(S, testo) { const n = GENE_MALATTIA[geneDi(testo)]; const c = n && S.conditions.find(x => x.name === n || condMatches(n, x.name)); return c ? c.color : null; }
const GENI_Y = new Set(['SRY', 'USP9Y', 'DDX3Y', 'UTY', 'KDM5D', 'DAZ1', 'RBMY1A1']);
const MODO_RE = [
  ['XLD', /(?:(?:autosomic[ao]\s+)?dominan(?:te|za)\s+(?:legat[ao]\s+(?:all'\s*|al\s+cromosoma\s+)?x(?![a-z])|x[\s-]?linked)|x[\s-]?linked\s+dominante|(?<![a-z])xld(?![a-z]))/],
  ['XLR', /(?:recessiv[ao]\s+(?:legat[ao]\s+(?:all'\s*|al\s+cromosoma\s+)?x(?![a-z])|x[\s-]?linked)|x[\s-]?linked\s+recessiv[ao]|(?<![a-z])xlr(?![a-z]))/],
  ['XL', /(?:legat[ao]\s+(?:all'\s*|al\s+cromosoma\s+)?x(?![a-z])|(?<![a-z])x[\s-]?link(?:ed)?(?![a-z])|diaginic\w*)/],
  ['YL', /(?:legat[ao]\s+(?:all'\s*|al\s+cromosoma\s+)?y(?![a-z])|(?<![a-z])y[\s-]?link(?:ed)?(?![a-z])|olandric\w*)/],
  ['AD', /(?:autosomic[ao]\s+dominante|dominante\s+autosomic[ao]|(?<![a-z])dominante(?![a-z]))/],
  ['AR', /(?:autosomic[ao]\s+recessiv[ao]|recessiv[ao]\s+autosomic[ao]|(?<![a-z])recessiv[ao](?![a-z]))/],
  ['MT', /(?:mitocondrial\w*|matrilinear\w*|ereditarieta\s+materna)/],
  ['MF', /(?:multifattorial\w*|poligenic\w*)/],
  ['IMP', /(?:da\s+)?imprinting/],
];
const MODO_CONTORNO = /(?:(?:a|con|di|ad)\s+)?(?:(?:trasmissione|ereditarieta|eredita|modalita(?:\s+di\s+trasmissione)?|modello)\s+)?(?:(?:di\s+tipo|in\s+modo|in\s+maniera|a\s+carattere)\s+)?/;
const MODO_SIGLA = /\(\s*(AD|AR|XLR|XLD|XL|YL|MT|MF)\s*\)|(?<=(?:trasmissione|ereditariet[aà]|modalit[aà])\s+)(AD|AR|XLR|XLD|XL|YL|MT|MF)(?![A-Za-z])/;
function trovaModo(raw) {
  // restituisce { modo, i, n, nota } sulla stringa originale (stesse posizioni del testo minuscolo senza accenti)
  const low = lowA(raw);
  const sg = MODO_SIGLA.exec(raw);
  if (sg) return { modo: sg[1] || sg[2], i: sg.index, n: sg[0].length };
  for (const [m, re] of MODO_RE) {
    const r = new RegExp(re.source, 'g'); const mm = r.exec(low);
    if (mm) {
      // allarga all'indietro per prendere «a trasmissione», «di tipo», «ad ereditarietà»
      const prima = low.slice(0, mm.index);
      const k = /(?:(?:(?<![a-z])(?:a|con|di|ad)\s+)?(?:(?:trasmissione|ereditarieta|eredita|modalita(?:\s+di\s+trasmissione)?)\s+)?(?:(?<![a-z])(?:di\s+tipo|in\s+modo|in\s+maniera|a\s+carattere)\s+)?)$/.exec(prima);
      const i = k ? mm.index - k[0].length : mm.index;
      return { modo: m, i, n: mm.index + mm[0].length - i };
    }
  }
  return null;
}
function notaPenetranza(low) {
  const n = [];
  if (/penetranza\s+(?:incomplet|ridott|variabil)/.test(low)) n.push('penetranza incompleta');
  if (/espressivita\s+variabil/.test(low)) n.push('espressività variabile');
  return n.join(', ');
}
function modoDi(S, nome) {
  const c = S.conditions.find(x => x.name === nome);
  if (c && c.inh) return c.inh;
  if (S.inhUser && S.inhUser[nome]) return S.inhUser[nome];
  return INH[nome] || '';
}
function impostaModo(S, nome, modo, nota) {
  S.inhUser = S.inhUser || {};
  S.inhUser[nome] = modo;
  const c = S.conditions.find(x => x.name === nome);
  if (c) { c.inh = modo; if (nota != null) c.inhNota = nota; }
}
function modoTesto(m) { return m && MODI[m] ? MODI[m].nome : ''; }

/* frase che dichiara la trasmissione di una malattia: «la fibrosi cistica è autosomica recessiva» */
function tryModo(S, sub, ctx, R) {
  const t = trovaModo(sub);
  if (!t) return false;
  const T = tokenize(sub);
  // se la frase parla di una persona («il padre è affetto da …») ci pensa l'interprete normale
  if (T.length && (T[0].t.startsWith('@') || PRON.has(T[0].t) || (startsNP(T, 0) && !/^(malattia|patologia|condizione|sindrome)$/.test(T[0].t)))) {
    const np = parseNP(T, 0, null);
    if (!(np && /^(gravidanza|aborto)$/.test(np.np.r))) return false;
  }
  let resto = (sub.slice(0, t.i) + ' ' + sub.slice(t.i + t.n)).replace(/\s+/g, ' ').trim();
  const nota = notaPenetranza(lowA(sub));
  resto = resto.replace(/\b(?:a|con)\s+penetranza\s+\w+|\b(?:ed?|con)\s+espressivit[aà]\s+variabile/gi, ' ');
  resto = resto.replace(/(?:^|\s)(?:a|ad|con|di)\s*$/i, '').replace(/^(?:la|il|lo|l'|le|i|gli)\s+/i, '').replace(/(?:^|\s)(?:è|e|ha|hanno|si\s+trasmette|si\s+eredita|segue|presenta|mostra|una?|tipo|modalit[aà]|trasmissione|ereditariet[aà]|in\s+modo|in\s+maniera|questa|quella|in\s+questa\s+famiglia|nella\s+famiglia)(?=\s|$)/gi, ' ').replace(/[,:;.]+/g, ' ').replace(/\s+/g, ' ').trim();
  const generico = !resto || /^(?:malattia|patologia|condizione|sindrome|quadro|forma|mutazione|variante)$/i.test(resto);
  let nomi = [];
  if (generico) {
    const fam = familyConditions(S);
    if (ctx.focusCond && fam.includes(ctx.focusCond)) nomi = [ctx.focusCond];
    else if (fam.length === 1) nomi = fam;
    else if (conditionsOf(S, [S.probandId]).length === 1) nomi = conditionsOf(S, [S.probandId]);
    else if (fam.length > 1) {
      R.asks.push({ text: `Quale malattia è ${MODI[t.modo].nome}?`, options: fam.map(n => ({ label: n, cmd: `la ${n} è ${MODI[t.modo].nome}` })) });
      return true;
    } else throw new UErr('Non c’è ancora una malattia nel pedigree a cui assegnare la modalità di trasmissione.');
  } else {
    const fam = S.conditions.map(c => c.name);
    nomi = fam.filter(n => condMatches(resto, n));
    if (!nomi.length) {
      const can = malattiaCanonica(resto);
      nomi = [can];
      R.log.push({ type: 'warn', text: `«${can}» non è ancora nel pedigree: la modalità verrà usata quando la aggiungerai.` });
    }
  }
  nomi.forEach(n => impostaModo(S, n, t.modo, nota));
  R.log.push({ type: 'ok', text: nomi.join(', ') + ': ' + MODI[t.modo].nome + (nota ? ' (' + nota + ')' : '') });
  ctx.focusCond = nomi.length === 1 ? nomi[0] : ctx.focusCond;
  return true;
}

/* ---------- citogenetica (ISCN) ---------- */
const CITO_TRIG = /(?<![a-z])(?:traslocazion\w*|robertsonian\w*|inversion\w*|(?:micro)?delezion\w*|(?:micro)?duplicazion\w*|anello|isocromosom\w*|marcatore|cariotip\w*|disomia\s+uniparentale|upd|mosaic\w*|riarrangiament\w*|cnv|array|arr(?=\[|\s)|t\s*\(\s*[\dxy]+\s*;|inv\s*\(|del\s*\(|dup\s*\(|der\s*\(|rob\s*\(|(?:del|dup)\s+\d{1,2}\s*[pq]|(?:4[4-9]|69|92)\s*,\s*[xy])/;
const ACROCENTRICI = new Set(['13', '14', '15', '21', '22']);
const CR_RE = '(\\d{1,2}|x|y)';
const ordCr = c => c === 'X' ? 0 : c === 'Y' ? 0.5 : +c;
const crUp = c => /^[xy]$/i.test(c) ? c.toUpperCase() : String(+c);
function bandaOk(b) { return /^[pq](?:\d{1,2}(?:\.\d{1,3})?)?$/.test(b) || /^[pq]ter$|^cen$/.test(b); }
// sindromi da delezione/duplicazione note: cromosoma, braccio+banda iniziale, tipo
const CNV_NOTE = [
  ['del', '22', /^q11/, 'Sindrome di DiGeorge'], ['dup', '22', /^q11/, 'Sindrome da duplicazione 22q11.2'],
  ['del', '7', /^q11\.2/, 'Sindrome di Williams'], ['dup', '7', /^q11\.2/, 'Sindrome da duplicazione 7q11.23'],
  ['del', '5', /^p1[45]|^p$/, 'Sindrome del cri du chat'], ['del', '4', /^p16|^p$/, 'Sindrome di Wolf-Hirschhorn'],
  ['del', '17', /^p11\.2/, 'Sindrome di Smith-Magenis'], ['dup', '17', /^p11\.2/, 'Sindrome di Potocki-Lupski'],
  ['dup', '17', /^p12/, 'Charcot-Marie-Tooth'], ['del', '17', /^p12/, 'Neuropatia con predisposizione alle paralisi da compressione (HNPP)'],
  ['del', '1', /^p36/, 'Sindrome da delezione 1p36'], ['del', '16', /^p11\.2/, 'Delezione 16p11.2'], ['dup', '16', /^p11\.2/, 'Duplicazione 16p11.2'],
  ['del', '15', /^q11\.2$/, 'Delezione 15q11.2 (BP1-BP2)'], ['dup', '15', /^q11(?:\.\d)?q13/, 'Duplicazione 15q11-q13'],
  ['del', '17', /^q21\.31/, 'Sindrome di Koolen-de Vries'], ['del', '2', /^q37/, 'Sindrome da delezione 2q37'], ['del', '18', /^q/, 'Delezione 18q'],
  ['del', 'Y', /^q11\.2/, 'Microdelezione del cromosoma Y (AZF)'], ['dup', 'X', /^q28/, 'Sindrome da duplicazione di MECP2'],
];
function nomeCNV(tipo, cr, bande) {
  const b = bande.join('');
  const r = CNV_NOTE.find(([t, c, re]) => t === tipo && c === cr && re.test(b));
  return r ? r[3] : null;
}
function karyoNorm(s) {
  // normalizza un cariotipo ISCN scritto a mano: spazi, maiuscole dei cromosomi sessuali, abbreviazioni in minuscolo
  let k = s.replace(/\s+/g, '').replace(/[‚]/g, ',');
  k = k.toLowerCase();
  k = k.replace(/^mos/, 'mos ');
  k = k.replace(/(^|[,/\s])(\d{2}),([xy]+)/g, (m, a, n, sx) => a + n + ',' + sx.toUpperCase());
  k = k.replace(/(?<=[(;+\-])([xy])(?=[;)\],]|$)/g, c => c.toUpperCase());
  k = k.replace(/(?<=,)([+\-])([xy])(?![a-z])/g, (m, s0, c) => s0 + c.toUpperCase());
  k = k.replace(/\[(\d+)\]/g, '[$1]');
  return k;
}
function classificaKaryo(k) {
  // { normale, bilanciato, sbilanciato, n, sesso:'M'|'F'|'?', anomalie:[...] }
  const parti = k.replace(/^mos\s+/, '').split('/');
  const p0 = parti.find(x => /[a-z(+\-]/.test(x.replace(/^\d+,[XY]+(\[\d+\])?/, ''))) || parti[0];
  const m = /^(\d+),([XY]+)(?:\[\d+\])?(.*)$/.exec(p0) || [];
  const n = +m[1], sx = m[2] || '', resto = (m[3] || '').replace(/^,/, '');
  const anomalie = resto ? resto.split(/,(?![^(]*\))/).filter(Boolean) : [];
  const sesso = /Y/.test(sx) ? 'M' : sx ? 'F' : '?';
  const sbil = anomalie.some(a => /^(?:[+\-]|del|dup|der|r\(|i\(|idic|dic|add|mar|\+mar|trp|ins.*der)/.test(a)) || (n !== 46 && !(n === 45 && anomalie.some(a => /^rob|^der\(\d+;\d+\)/.test(a)))) || (n === 46 && !['XX', 'XY'].includes(sx)) || (n === 45 && sx === 'X');
  const bil = !sbil && anomalie.some(a => /^(?:t|inv|rob|ins)\(|^der\(\d+;\d+\)/.test(a));
  return { normale: !anomalie.length && ((n === 46 && ['XX', 'XY'].includes(sx))), bilanciato: bil, sbilanciato: sbil, n, sesso, anomalie, mos: /^mos/.test(k) || parti.length > 1 };
}
function nomeDaKaryo(k, cl) {
  for (const [re, nome] of CARIO) if (re.test(k.toLowerCase())) return nome;
  if (cl.anomalie.length) {
    const a = cl.anomalie.find(x => /^(?:del|dup)\((\w+)\)\(([^)]+)\)/.test(x));
    if (a) { const mm = /^(del|dup)\((\w+)\)\(([^)]+)\)/.exec(a); const nn = nomeCNV(mm[1], crUp(mm[2]), [mm[3].replace(/(?<=\d)(?=[pq])/, '')]); if (nn) return nn; }
    return 'Cariotipo ' + cl.anomalie.join(',');
  }
  return null;
}
function parseCito(raw) {
  // interpreta la descrizione citogenetica; restituisce elementi { iscn, bil:true|false|null, nome, tipo, cr:[], bande:[], chiedi, note }
  const low = lowA(raw).replace(/[‚]/g, ',');
  const out = [];
  // 1) cariotipo completo scritto in ISCN
  const km = /(?:mos\s*)?(?:4[4-9]|69|92)\s*,\s*[xy]{1,5}(?:\s*\[\d+\])?(?:\s*,\s*[^\s,/]+)*(?:\s*\/\s*(?:4[4-9]|69|92)\s*,\s*[xy]{1,5}(?:\s*\[\d+\])?(?:\s*,\s*[^\s,/]+)*)*/.exec(low);
  if (km) {
    const k = karyoNorm(raw.slice(km.index, km.index + km[0].length).replace(/^mosaico\s*/i, 'mos '));
    const cl = classificaKaryo(k);
    const tipo = cl.normale ? 'normale' : 'cariotipo';
    const iscn = cl.anomalie.join(',');
    out.push({ tipo, karyo: (/mosaic/.test(low) && !/^mos/.test(k) ? 'mos ' : '') + k, iscn: iscn || k, bil: cl.normale ? null : cl.bilanciato ? true : cl.sbilanciato ? false : null, nome: cl.normale ? null : (cl.bilanciato ? null : nomeDaKaryo(k, cl)), sessoKaryo: cl.sesso, cl });
    return out;
  }
  const bilQ = /(?<![a-z])(?:non\s+bilanciat\w*|sbilanciat\w*|non\s+equilibrat\w*|squilibrat\w*)/.test(low) ? false : /(?<![a-z])(?:bilanciat\w*|equilibrat\w*)/.test(low) ? true : null;
  const portatoreQ = /(?<![a-z])portat(?:ore|rice|ori|rici)/.test(low);
  const affettoQ = /(?<![a-z])affett[oaie]/.test(low);
  // 2) ISCN parziale già scritto: t(11;22)(q23;q11.2), inv(9)(p12q13), del(22)(q11.2), rob(13;14), der(22)t(11;22)(...)
  const reI = /(der\s*\(\s*(\d{1,2}|x|y)\s*\)\s*)?(t|inv|del|dup|rob|ins|r|i)\s*\(\s*([\dxy]{1,2}(?:\s*;\s*[\dxy]{1,2})?)\s*\)\s*(?:\(\s*([pq][^)]*)\))?/g;
  let mi;
  while ((mi = reI.exec(low))) {
    const tipo = mi[3], crs = mi[4].split(/\s*;\s*/).map(crUp), bande = mi[5] ? mi[5].replace(/\s+/g, '').split(';') : [];
    out.push(costruisci(tipo, crs, bande, mi[1] ? crUp(mi[2]) : null, bilQ, portatoreQ, affettoQ, low));
  }
  if (out.length) return out;
  // 3) descrizione in italiano
  const bandeIn = s => { const r = []; const re = /(?<![a-z\d])(\d{1,2}|x|y)\s*([pq](?:\d{1,2}(?:\.\d{1,3})?)?)(?:\s*-\s*([pq]?\d{1,2}(?:\.\d{1,3})?))?(?![a-z])/g; let m; while ((m = re.exec(s))) r.push({ cr: crUp(m[1]), b: m[2], b2: m[3] ? (/^[pq]/.test(m[3]) ? m[3] : m[2][0] + m[3]) : null }); return r; };
  const crIn = s => { const r = []; const re = /(?:cromosom[ai]\s+|(?<![\w.])(?:il|lo|del|dei|e|tra|fra|,|;)\s*(?:cromosoma\s+)?)(\d{1,2}|x|y)(?![\w.]*[pq]\d)(?![\d.])/g; let m; while ((m = re.exec(s))) r.push(crUp(m[1])); const m2 = /(?<![\d.])(\d{1,2}|x|y)\s*[;/]\s*(\d{1,2}|x|y)(?![\d.])/.exec(s); if (m2) r.push(crUp(m2[1]), crUp(m2[2])); return [...new Set(r)]; };
  if (/traslocazion|robertsonian/.test(low)) {
    const rob = /robertsonian/.test(low);
    const bb = bandeIn(low);
    let crs = bb.length >= 2 ? bb.map(x => x.cr) : crIn(low);
    if (bb.length === 1 && crs.length === 1) crs = [...new Set([bb[0].cr, ...crIn(low)])];
    const bande = bb.length >= 2 ? bb.map(x => x.b) : [];
    out.push(costruisci(rob ? 'rob' : 't', crs.slice(0, 2), bande, /der(?:ivativ\w*)?\s*(?:del\s+)?(?:\(|cromosoma\s+)?\s*(\d{1,2}|x|y)/.test(low) ? crUp(/der(?:ivativ\w*)?\s*(?:del\s+)?(?:\(|cromosoma\s+)?\s*(\d{1,2}|x|y)/.exec(low)[1]) : null, bilQ, portatoreQ, affettoQ, low, crs.length < 2));
    return out;
  }
  if (/inversion/.test(low)) {
    const peri = /pericentric/.test(low), para = /paracentric/.test(low);
    const bb = bandeIn(low);
    let cr = bb.length ? bb[0].cr : (crIn(low)[0] || (/(?:del|sul|nel)\s+(\d{1,2}|x|y)(?![\w.])/.exec(low) || [])[1]);
    const soloBande = []; const comp = /(?<![a-z])([pq]\d{1,2}(?:\.\d{1,3})?)\s*([pq]\d{1,2}(?:\.\d{1,3})?)(?![\d.])/.exec(low);
    if (comp) soloBande.push(comp[1], comp[2]); else { const reB = /(?<![a-z\d])([pq]\d{1,2}(?:\.\d{1,3})?)(?![\d.])/g; let mb; while ((mb = reB.exec(low))) soloBande.push(mb[1]); }
    const bande = soloBande.length >= 2 ? soloBande.slice(0, 2) : bb.length >= 2 ? bb.slice(0, 2).map(x => x.b) : [];
    const el = costruisci('inv', cr ? [crUp(cr)] : [], bande, null, true, portatoreQ, affettoQ, low, !cr);
    if (bande.length === 2) {
      const stessoBraccio = bande[0][0] === bande[1][0];
      if (peri && stessoBraccio) el.avviso = `Inversione indicata come pericentrica ma i punti di rottura ${bande.join(' e ')} sono sullo stesso braccio (sarebbe paracentrica).`;
      if (para && !stessoBraccio) el.avviso = `Inversione indicata come paracentrica ma i punti di rottura ${bande.join(' e ')} sono su bracci diversi (sarebbe pericentrica).`;
    } else el.tipoInv = peri ? 'pericentrica' : para ? 'paracentrica' : '';
    out.push(el);
    return out;
  }
  const mDD = /(?:(?:micro)?(delezion|duplicazion)\w*|(?<![a-z])(del|dup)(?=\s*\(?\s*(?:\d{1,2}|x|y)\s*[pq\d)]))/.exec(low);
  if (mDD) {
    const tipo = (mDD[1] || mDD[2]).startsWith('del') ? 'del' : 'dup';
    const bb = bandeIn(low.slice(mDD.index));
    if (bb.length) {
      const b0 = bb[0];
      const bande = b0.b2 ? [b0.b + b0.b2] : bb.length >= 2 && bb[1].cr === b0.cr ? [b0.b + bb[1].b] : [b0.b];
      out.push(costruisci(tipo, [b0.cr], bande, null, portatoreQ ? true : false, portatoreQ, affettoQ, low));
      return out;
    }
    const br = /braccio\s+(corto|lungo)\s+(?:del(?:l')?\s*)?(?:cromosoma\s+)?(\d{1,2}|x|y)/.exec(low);
    if (br) { out.push(costruisci(tipo, [crUp(br[2])], [br[1] === 'corto' ? 'p' : 'q'], null, portatoreQ ? true : false, portatoreQ, affettoQ, low)); return out; }
  }
  const arr = /arr(?:\s*\[[^\]]*\])?\s*(\d{1,2}|x|y)([pq][\d.]+(?:[pq][\d.]+)?)\s*\(\s*([\d,_\s]+)\s*\)\s*x\s*(\d)/.exec(low);
  if (arr) {
    const cn = +arr[4], tipo = cn < 2 ? 'del' : 'dup';
    const testo = raw.slice(arr.index, arr.index + arr[0].length).replace(/\s+/g, '').replace(/^arr/i, 'arr').replace(/x(\d)$/i, 'x$1').replace(/(?<=\]|arr)(?=\d|[xy])/i, ' ');
    const el = costruisci(tipo, [crUp(arr[1])], [arr[2]], null, portatoreQ ? true : false, portatoreQ, affettoQ, low);
    el.iscn = testo.replace(/\b([xy])(?=[pq])/i, c => c.toUpperCase());
    el.karyoBase = null; el.karyo = el.iscn;
    out.push(el); return out;
  }
  const an = /(?:cromosoma\s+)?ad?\s+anello\s+(?:del\s+)?(?:cromosoma\s+)?(\d{1,2}|x|y)|anello\s+(?:del\s+)?(?:cromosoma\s+)?(\d{1,2}|x|y)/.exec(low);
  if (an) { out.push(costruisci('r', [crUp(an[1] || an[2])], [], null, false, portatoreQ, affettoQ, low)); return out; }
  const iso = /isocromosoma\s+(?:del\s+braccio\s+(lungo|corto)\s+(?:del(?:l')?\s*)?)?(?:cromosoma\s+)?(\d{1,2}|x|y)\s*([pq])?/.exec(low);
  if (iso) { const br = iso[3] || (iso[1] === 'corto' ? 'p' : 'q'); out.push(costruisci('i', [crUp(iso[2])], [br + '10'], null, false, portatoreQ, affettoQ, low)); return out; }
  if (/marcatore/.test(low)) { out.push({ tipo: 'mar', iscn: '+mar', bil: false, nome: 'Cromosoma marcatore soprannumerario', cr: [], bande: [] }); return out; }
  const upd = /(?:disomia\s+uniparentale|upd)\s*(materna|paterna|mat|pat)?\s*(?:del\s+)?(?:cromosoma\s+)?\(?(\d{1,2}|x)\)?\s*(materna|paterna|mat|pat)?/.exec(low);
  if (upd) {
    const cr = crUp(upd[2]), org = (upd[1] || upd[3] || '').slice(0, 3);
    const NOMI = { '15mat': 'Sindrome di Prader-Willi', '15pat': 'Sindrome di Angelman', '7mat': 'Sindrome di Silver-Russell', '11pat': 'Sindrome di Beckwith-Wiedemann', '14mat': 'Sindrome di Temple', '14pat': 'Sindrome di Kagami-Ogata', '6pat': 'Diabete neonatale transitorio' };
    const el = { tipo: 'upd', iscn: `upd(${cr})${org}`, bil: false, nome: NOMI[cr + org] || `Disomia uniparentale ${org === 'mat' ? 'materna' : org === 'pat' ? 'paterna' : ''} del ${cr}`.replace(/\s+/g, ' '), cr: [cr], bande: [] };
    if (!org) el.chiediOrigine = true;
    out.push(el); return out;
  }
  return out;
}
function costruisci(tipo, crs, bande, der, bilQ, portatoreQ, affettoQ, low, mancaCr) {
  const el = { tipo, cr: crs, bande, bil: null, nome: null };
  if (mancaCr || !crs.length || (/^(t|rob)$/.test(tipo) && crs.length < 2)) { el.chiediCr = true; el.iscn = tipo === 'inv' ? 'inv(?)' : tipo + '(?)'; return el; }
  // ordine ISCN: cromosomi sessuali prima, poi numerico; le bande seguono lo stesso ordine
  if (crs.length === 2) {
    const ord = [0, 1].sort((a, b) => ordCr(crs[a]) - ordCr(crs[b]));
    if (ord[0] === 1) { crs = [crs[1], crs[0]]; if (bande.length === 2) bande = [bande[1], bande[0]]; }
    el.cr = crs; el.bande = bande;
  }
  const bandeOk = bande.length && bande.every(b => /^[pq]/.test(b));
  if (tipo === 'rob') {
    el.iscn = `rob(${crs.join(';')})(q10;q10)`;
    if (!crs.every(c => ACROCENTRICI.has(c))) { el.avviso = `Non registrata: le traslocazioni robertsoniane coinvolgono solo i cromosomi acrocentrici (13, 14, 15, 21, 22), e ${crs.filter(c => !ACROCENTRICI.has(c)).join(' e ')} non lo ${crs.filter(c => !ACROCENTRICI.has(c)).length > 1 ? 'sono' : 'è'}. Se è una traslocazione reciproca scrivi «traslocazione ${crs.join(';')}».`; el.invalido = true; return el; }
    el.bil = bilQ != null ? bilQ : portatoreQ ? true : affettoQ ? false : null;
    if (el.bil === false) { const tri = crs.find(c => c === '21' || c === '13'); el.nome = tri === '21' ? 'Sindrome di Down' : tri === '13' ? 'Sindrome di Patau' : 'Robertsoniana sbilanciata'; el.karyoBase = `46,{sx},${tri ? '+' + tri + ',' : ''}rob(${crs.join(';')})(q10;q10)`.replace(/,+rob/, ',rob'); }
    else el.karyoBase = `45,{sx},rob(${crs.join(';')})(q10;q10)`;
    return el;
  }
  if (tipo === 't' || tipo === 'ins') {
    const base = `${tipo}(${crs.join(';')})` + (bandeOk && bande.length === 2 ? `(${bande.join(';')})` : '');
    el.mancaBande = !(bandeOk && bande.length === 2);
    el.bil = der ? false : bilQ != null ? bilQ : portatoreQ ? true : affettoQ ? false : null;
    el.iscn = der ? `der(${der})${base}` : base;
    el.der = der;
    el.karyoBase = el.bil === false ? (der ? `46,{sx},der(${der})${base}` : null) : `46,{sx},${base}`;
    if (el.bil === false) el.nome = (crs.join(';') === '11;22' && der === '22') ? 'Sindrome di Emanuel' : (der ? `Traslocazione sbilanciata der(${der})${base}` : `Traslocazione sbilanciata ${base}`);
    return el;
  }
  if (tipo === 'inv') {
    el.iscn = `inv(${crs[0]})` + (bande.length === 2 ? `(${bande.join('')})` : '');
    el.mancaBande = bande.length !== 2; el.bil = true;
    el.karyoBase = `46,{sx},${el.iscn}`;
    if (crs[0] === '9' && /^p1[12](?:\.\d)?q1[23]/.test(bande.join(''))) el.eteromorfismo = true;
    return el;
  }
  if (tipo === 'del' || tipo === 'dup') {
    el.iscn = `${tipo}(${crs[0]})` + (bande.length ? `(${bande.join('')})` : '');
    el.mancaBande = !bande.length || bande.every(b => /^[pq]$/.test(b));
    if (el.mancaBande && bande.length) el.iscn = `${tipo}(${crs[0]})(${bande[0]}?)`;
    el.bil = false;
    el.portatore = !!portatoreQ && !affettoQ;
    el.nome = nomeCNV(tipo, crs[0], bande) || `${tipo === 'del' ? 'Delezione' : 'Duplicazione'} ${crs[0]}${bande.join('')}`.replace(/(\d)([pq])/, '$1$2');
    el.karyoBase = `46,{sx},${el.iscn}`;
    if (tipo === 'del' && crs[0] === '15' && /^q1[12](?:\.\d)?q13/.test(bande.join('')) && !/patern|matern/.test(low)) el.chiediOrigine = true;
    if (tipo === 'del' && crs[0] === '15' && /^q1[12](?:\.\d)?q13/.test(bande.join(''))) el.nome = /patern/.test(low) ? 'Sindrome di Prader-Willi' : /matern/.test(low) ? 'Sindrome di Angelman' : 'Delezione 15q11-q13';
    return el;
  }
  if (tipo === 'r') { el.iscn = `r(${crs[0]})`; el.bil = false; el.nome = `Cromosoma ${crs[0]} ad anello`; el.karyoBase = `46,{sx},r(${crs[0]})`; return el; }
  if (tipo === 'i') { el.iscn = `i(${crs[0]})(${bande[0] || 'q10'})`; el.bil = false; el.nome = crs[0] === 'X' && /^q/.test(bande[0] || 'q') ? 'Sindrome di Turner' : `Isocromosoma ${crs[0]}${(bande[0] || 'q')[0]}`; el.karyoBase = crs[0] === 'X' ? `46,X,i(X)(${bande[0] || 'q10'})` : `46,{sx},${el.iscn}`; return el; }
  return el;
}
function soggettoFrase(S, sub, ctx, R) {
  const T = tokenize(sub);
  const lowS = lowA(sub);
  const kc = /cariotip\w*\s+(?:del|della|dello|di|dell')\s+/.exec(lowS);
  if (kc) {
    const T2 = tokenize(sub.slice(kc.index + kc[0].length));
    const r = parseRef(T2, 0, R);
    if (r) { const ids = resolveRef(S, r, ctx, R, true); if (ids.length) return ids; }
  }
  if (T.length && (T[0].t.startsWith('@') || PRON.has(T[0].t) || startsNP(T, 0))) {
    const np = parseNP(T, 0, null);
    if (!(np && /^(gravidanza|aborto)$/.test(np.np.r))) {
      const r = parseRef(T, 0, R);
      if (r) {
        let ids = resolveRef(S, r, ctx, R, true);
        let k = r.j;
        if (T[k] && T[k].t === 'e' && startsRef(T, k + 1)) { const r2 = parseRef(T, k + 1, R); if (r2) ids = ids.concat(resolveRef(S, r2, ctx, R, true)); }
        if (ids.length) return ids;
      }
    }
  }
  return ctx.lastTouched.length && ctx._ltRun ? [ctx.lastTouched[ctx.lastTouched.length - 1]] : [S.probandId];
}
function karyoPer(base, p) {
  if (!base) return '';
  const sx = p.sex === 'M' ? 'XY' : p.sex === 'F' ? 'XX' : '??';
  return base.replace('{sx}', sx);
}
function tryCito(S, sub, ctx, R) {
  const low = lowA(sub);
  if (!CITO_TRIG.test(low)) return false;
  if (/(?<![a-z])(?:ivg|itg|interruzion\w*|abort\w*|natomort\w*|fet[oi]|fetale|amniocentesi|villocentesi|nipt|gravidanz\w*|embrion\w*|pgt\w*)(?![a-z])/.test(low)) return false;
  // «portatore di fibrosi cistica» con la parola «mosaico» ecc. non è citogenetica: serve un elemento cromosomico vero
  let el = parseCito(sub);
  if (!el.length && /cariotip/.test(low) && /(?:normale|nella norma|regolare|negativo|femminile normale|maschile normale)/.test(low)) {
    const ids0 = soggettoFrase(S, sub, ctx, R);
    ids0.forEach(i => { const q = S.people[i]; q.karyo = q.sex === 'M' ? '46,XY' : q.sex === 'F' ? '46,XX' : '46,normale'; R.touched.add(i); });
    R.log.push({ type: 'ok', text: ids0.map(i => '⟨' + i + '⟩').join(', ') + ': cariotipo normale (' + ids0.map(i => S.people[i].karyo).join(', ') + ')', ids: ids0 });
    ctx.lastTouched = ids0; return true;
  }
  if (!el.length) return false;
  const ids = soggettoFrase(S, sub, ctx, R);
  const P = S.people;
  const fatto = [];
  for (const id of ids) {
    const p = P[id];
    for (const e of el) {
      if (e.avviso) R.log.push({ type: 'warn', text: e.avviso });
      if (e.invalido) { fatto.push(''); continue; }
      if (e.chiediCr) { chiediCromosomi(id, e, low, R); fatto.push(''); continue; }
      if (e.tipo === 'normale') {
        p.karyo = e.karyo;
        if (p.sex === 'U' && (e.sessoKaryo === 'M' || e.sessoKaryo === 'F')) { p.sex = e.sessoKaryo; p.unions.forEach(u => orient(S, S.unions[u])); }
        fatto.push(`cariotipo ${e.karyo} (normale)`);
        continue;
      }
      if (e.bil == null) {
        R.asks.push({ text: `La ${e.tipo === 'rob' ? 'traslocazione robertsoniana' : 'traslocazione'} ${e.iscn} di ⟨${id}⟩ è bilanciata?`,
          options: [{ label: 'bilanciata (portatore)', cmd: `@${id} ha ${e.iscn} bilanciata`, keys: ['si', 'equilibrata', 'portatrice', 'sana'] }, { label: 'sbilanciata (affetto)', cmd: `@${id} ha ${e.iscn} sbilanciata`, keys: ['no', 'non bilanciata', 'affetta', 'squilibrata'] }] });
        continue;
      }
      if (e.karyo) { p.karyo = e.karyo; if (p.sex === 'U' && (e.sessoKaryo === 'M' || e.sessoKaryo === 'F')) { p.sex = e.sessoKaryo; p.unions.forEach(u => orient(S, S.unions[u])); } }
      else if (e.karyoBase) {
        const k = karyoPer(e.karyoBase, p);
        // sostituisce un riarrangiamento dello stesso tipo scritto prima senza punti di rottura
        p.karyo = k;
      }
      const nomeCito = e.bil || e.portatore ? e.iscn : (e.nome || e.iscn);
      // stesso riarrangiamento già presente senza bande: lo sostituisco
      const pref = e.iscn.replace(/\)\(.*$/, ')');
      const vecchio = [...p.carriers, ...p.conditions.map(c => c.name)].find(x => x && x !== nomeCito && (x === pref || x === pref + '(?)' || (x.startsWith(pref) && !/\)\(/.test(x))));
      if (vecchio) { p.carriers = p.carriers.map(x => x === vecchio ? nomeCito : x); p.conditions.forEach(c => { if (c.name === vecchio) c.name = nomeCito; }); }
      const nm = registerCondition(S, nomeCito);
      const c = S.conditions.find(x => x.name === nm);
      if (c) { c.inh = c.inh || 'CR'; c.cito = e.iscn; }
      if (e.bil || e.portatore) { if (!p.carriers.includes(nm)) p.carriers = p.carriers.filter(Boolean).concat(nm); }
      else if (!p.conditions.some(x => x.name === nm)) p.conditions.push({ name: nm, age: '' });
      if (/(?<![a-z])de\s+novo(?![a-z])/.test(low) && !e.bil) { const cc = p.conditions.find(x => x.name === nm); if (cc) cc.denovo = true; }
      pruneConditions(S);
      R.touched.add(id);
      fatto.push((e.bil ? (e.tipo === 'inv' ? 'inversione bilanciata ' : 'riarrangiamento bilanciato ') : e.portatore ? 'portatore di ' : '') + (e.nome && !e.bil ? e.nome + ' – ' : '') + e.iscn + (p.karyo ? ` (cariotipo ${p.karyo})` : ''));
      // domande per completare l'ISCN
      if (e.mancaBande && e.tipo === 't' && e.cr.join(';') === '11;22') R.asks.push({ text: `Punti di rottura della t(11;22) di ⟨${id}⟩?`, options: [{ label: 't(11;22)(q23;q11.2) – la più frequente', cmd: `@${id} ha t(11;22)(q23;q11.2) ${e.bil ? 'bilanciata' : 'sbilanciata'}` }] });
      else if (e.mancaBande && e.tipo === 'inv' && e.cr[0] === '9') R.asks.push({ text: `Punti di rottura della inv(9) di ⟨${id}⟩?`, options: [{ label: 'inv(9)(p12q13) – eteromorfismo comune', cmd: `@${id} ha inv(9)(p12q13)` }, { label: 'inv(9)(p11q12)', cmd: `@${id} ha inv(9)(p11q12)` }] });
      else if (e.mancaBande) R.log.push({ type: 'tip', text: `Per un ISCN completo indica i punti di rottura, ad esempio «⟨${id}⟩ ha ${e.tipo === 'inv' ? `inv(${e.cr[0]})(p13q21)` : e.tipo === 't' ? `t(${e.cr.join(';')})(q21;p13)` : `${e.tipo}(${e.cr[0]})(q21q23)`}» (esempio di formato).` });
      if (e.chiediOrigine) R.asks.push({ text: `Origine parentale della ${e.tipo === 'upd' ? 'disomia' : 'delezione'} 15q11-q13 di ⟨${id}⟩?`, options: [
        { label: e.tipo === 'upd' ? 'materna → Prader-Willi' : 'paterna → Prader-Willi', cmd: `@${id} non è affetto da ${nm}; @${id} è affetto da Sindrome di Prader-Willi` },
        { label: e.tipo === 'upd' ? 'paterna → Angelman' : 'materna → Angelman', cmd: `@${id} non è affetto da ${nm}; @${id} è affetto da Sindrome di Angelman` }] });
      if (e.eteromorfismo) R.log.push({ type: 'tip', text: 'inv(9)(p12q13) è un eteromorfismo comune, generalmente considerato variante della norma.' });
    }
  }
  if (!fatto.length && !R.asks.length) return false;
  if (fatto.length && fatto.every(x => !x)) return true;
  if (fatto.length) R.log.push({ type: 'ok', text: ids.map(i => '⟨' + i + '⟩').join(', ') + ': ' + fatto.filter(Boolean).join('; '), ids });
  ctx.lastTouched = ids;
  return true;
}
const ROB_COMUNI = [['13', '14', 'la più frequente'], ['14', '21', 'rischio di Down da traslocazione'], ['13', '21', ''], ['15', '21', ''], ['21', '22', ''], ['13', '15', ''], ['14', '15', ''], ['21', '21', '']];
function chiediCromosomi(id, e, low, R) {
  // domanda vera, con opzioni e risposta libera: la risposta breve («rob», «14;21») viene ricollegata qui
  const bil = /(?<![a-z])(?:sbilanciat\w*|non\s+bilanciat\w*)/.test(low) ? ' sbilanciata' : /(?<![a-z])(?:bilanciat\w*|equilibrat\w*|portat(?:ore|rice))/.test(low) ? ' bilanciata' : '';
  const chi = `⟨${id}⟩`;
  if (e.tipo === 'inv') {
    R.asks.push({ text: `Su quale cromosoma è l'inversione di ${chi}?`, options: [{ label: '9 – inv(9)(p12q13), eteromorfismo comune', cmd: `@${id} ha inv(9)(p12q13)` }], open: { tmpl: `@${id} ha un'inversione {ans}`, kind: 'cr' } });
    return;
  }
  if (e.tipo === 'rob') {
    R.asks.push({ text: `Tra quali cromosomi è la traslocazione robertsoniana di ${chi}?`, options: ROB_COMUNI.map(([a, b, n]) => ({ label: `${a};${b}${n ? ' – ' + n : ''}`, cmd: `@${id} ha rob(${a};${b})(q10;q10)${bil}` })), open: { tmpl: `@${id} ha una traslocazione robertsoniana {ans}${bil}`, kind: 'crpair' } });
    return;
  }
  if (/reciproc/.test(low)) {
    R.asks.push({ text: `Tra quali cromosomi è la traslocazione reciproca di ${chi}?`, options: [{ label: '11;22 – t(11;22)(q23;q11.2), la reciproca ricorrente', cmd: `@${id} ha t(11;22)(q23;q11.2)${bil}` }], open: { tmpl: `@${id} ha una traslocazione reciproca {ans}${bil}`, kind: 'crpair' } });
    return;
  }
  R.asks.push({ text: `Che tipo di traslocazione ha ${chi}?`, options: [
    { label: 'Robertsoniana (fusione centrica di acrocentrici)', cmd: `@${id} ha una traslocazione robertsoniana${bil}`, keys: ['rob', 'robertsoniana', 'fusione centrica', 'acrocentrici'] },
    { label: 'Reciproca', cmd: `@${id} ha una traslocazione reciproca${bil}`, keys: ['reciproca', 'rcp', 'semplice', 'scambio'] }],
    open: { tmpl: `@${id} ha una traslocazione {ans}${bil}`, kind: 'crpair' } });
}
function uniscicito(clausole) {
  // «traslocazione tra il cromosoma 11 | e il 22» resta una frase sola
  const out = [];
  for (const c of clausole) {
    const l = lowA(c).trim();
    if (out.length && CITO_TRIG.test(lowA(out[out.length - 1])) && /^(?:(?:il|lo|la|i|gli)\s+)?(?:cromosom\w+\s+)?(?:\d{1,2}|x|y)(?![a-z\d])/.test(l)) out[out.length - 1] += ' e ' + c;
    else out.push(c);
  }
  return out;
}

/* ---------- controlli di coerenza e suggerimenti di consulenza ---------- */
const SOLO_F = /(?:ovai|ovario|ovarico|utero|uterin|endometri|cervice|collo dell'utero|vulva|vagin|tub[ae] di falloppio|ovaio policistico|insufficienza ovarica|menopausa|diabete gestazionale|sindrome di turner|preeclampsia|endometriosi)/;
const SOLO_M = /(?:prostat|testicol|pene|scroto|ipospadia|criptorchid|sindrome di klinefelter|seminoma|azoosperm|oligosperm|varicocele)/;
function numEta(x) { const m = /^(\d{1,3})(?!\s*(?:mesi|sett|gg))/.exec(String(x || '').trim()); return m ? +m[1] : null; }
function geneDi(t) { const g = String(t || '').trim().split(/\s+/)[0]; return /^[A-Za-z0-9-]+$/.test(g) ? g.toUpperCase() : ''; }
function verifica0(S) {
  const P = S.people, out = [];
  const add = (id, key, level, text, ask) => out.push({ id, key, level, text, ask });
  const vivi = Object.values(P).filter(p => !p.miscarriage && !p.pregnancy && !p.donor);
  const portaVar = (p, testo) => (p.variants || []).some(v => !v.neg && v.text === testo);
  const haCond = (p, n) => p && p.conditions.some(c => c.name === n);
  const portaCond = (p, n) => p && (p.carriers.includes(n) || haCond(p, n));
  for (const p of vivi) {
    const id = p.id, nomi = p.conditions.map(c => c.name);
    // sesso e organi
    nomi.forEach(n => {
      const l = lowA(n), key = condKey(n);
      if (p.sex === 'F' && SOLO_M.test(l)) add(id, 'sexm:' + id + n, 'warn', `Incongruenza: ⟨${id}⟩ è femmina ma risulta affetta da «${n}», condizione maschile. Verifica sesso o diagnosi.`);
      if (p.sex === 'M' && SOLO_F.test(l)) add(id, 'sexf:' + id + n, 'warn', `Incongruenza: ⟨${id}⟩ è maschio ma risulta affetto da «${n}», condizione femminile. Verifica sesso o diagnosi.`);
      if (p.sex === 'M' && /mammella/.test(key) && /tumore/.test(key)) add(id, 'mbc:' + id, 'warn', `Insolito: carcinoma mammario in un maschio (⟨${id}⟩). Se confermato, è un forte indicatore di predisposizione ereditaria: considera BRCA2 (e BRCA1, PALB2, CHEK2).`);
      const m = modoDi(S, n);
      if (m === 'YL' && p.sex === 'F') add(id, 'yl:' + id + n, 'warn', `Incongruenza: «${n}» è legata all'Y ma ⟨${id}⟩ è femmina.`);
      if (m === 'XLR' && p.sex === 'F') add(id, 'xlrf:' + id + n, 'tip', `«${n}» (recessiva legata all'X) in una femmina, ⟨${id}⟩: possibile per inattivazione sbilanciata dell'X, monosomia X o omozigosi. Valuta cariotipo e studio dell'inattivazione.`);
      if (p.sex === 'M' && /Sindrome di Turner/.test(n)) add(id, 'tur:' + id, 'warn', `Incongruenza: sindrome di Turner in un maschio (⟨${id}⟩).`);
    });
    // portatori di malattie X-linked e zigosità
    p.carriers.filter(Boolean).forEach(n => {
      const m = modoDi(S, n);
      if (p.sex === 'M' && (m === 'XLR' || m === 'XL')) add(id, 'xlcar:' + id + n, 'warn', `Incongruenza: ⟨${id}⟩ è maschio, quindi emizigote per i geni dell'X: per «${n}» è affetto oppure no, non portatore.`);
      if (m === 'AD' && !/^(?:t|inv|rob|ins|del|dup)\(/.test(n)) add(id, 'adcar:' + id + n, 'tip', `«${n}» è autosomica dominante: «portatore» di solito significa portatore della variante. Se ⟨${id}⟩ è asintomatico, valuta «asintomatico/presintomatico» invece del simbolo di portatore.`);
    });
    (p.variants || []).filter(v => !v.neg && v.text !== 'test').forEach(v => {
      const g = geneDi(v.text);
      if (GENI_X.has(g) && p.sex === 'M' && (v.zyg === 'het' || v.carrier || v.zyg === 'comp')) add(id, 'xhet:' + id + v.text, 'warn', `Incongruenza: ${g} è sul cromosoma X e ⟨${id}⟩ è maschio: è emizigote, non eterozigote o portatore.`);
      if (GENI_X.has(g) && p.sex === 'F' && v.zyg === 'emi' && !p.conditions.some(c => /Turner/.test(c.name))) add(id, 'xemi:' + id + v.text, 'warn', `Incongruenza: ⟨${id}⟩ è femmina, quindi non emizigote per ${g} (salvo monosomia X).`);
      if (GENI_Y.has(g) && p.sex === 'F') add(id, 'ygene:' + id + v.text, 'warn', `Incongruenza: ${g} è sul cromosoma Y ma ⟨${id}⟩ è femmina.`);
      if (!GENI_X.has(g) && v.zyg === 'emi' && !/^(?:X|Y)/i.test(g) && g) add(id, 'emiaut:' + id + v.text, 'tip', `${v.text} in emizigosi: per un gene autosomico è insolito (possibile delezione sull'altro allele). Verifica.`);
    });
    // cariotipo e sesso
    if (p.karyo) {
      const cl = classificaKaryo(p.karyo.replace(/^mos\s+/, ''));
      if (p.sex === 'F' && cl.sesso === 'M') add(id, 'kxy:' + id, 'warn', `Incongruenza: ⟨${id}⟩ è femmina ma il cariotipo ${p.karyo} contiene l'Y. Verifica il dato (o possibile DSD).`);
      if (p.sex === 'M' && cl.sesso === 'F' && !/Y/.test(p.karyo)) add(id, 'kxx:' + id, 'warn', `Incongruenza: ⟨${id}⟩ è maschio ma il cariotipo ${p.karyo} non contiene l'Y. Verifica il dato (o possibile DSD, es. 46,XX testicolare).`);
    }
    // età
    const e = numEta(p.age);
    p.conditions.forEach(c => { const dx = numEta(c.age); if (dx != null && e != null && !p.deceased && dx > e) add(id, 'dxage:' + id + c.name, 'warn', `Incongruenza: per ⟨${id}⟩ l'età alla diagnosi di «${c.name}» (${dx}) supera l'età attuale (${e}).`); const dd = numEta(p.deathAge); if (dx != null && dd != null && dx > dd) add(id, 'dxdeath:' + id + c.name, 'warn', `Incongruenza: per ⟨${id}⟩ l'età alla diagnosi di «${c.name}» (${dx}) supera l'età al decesso (${dd}).`); });
    const u = parentU(S, id);
    if (u && e != null) [u.a, u.b].filter(Boolean).forEach(g => { const eg = numEta(P[g].age); if (eg != null && !P[g].deceased && !p.deceased && eg - e < 12) add(id, 'etagen:' + g + id, 'warn', `Incongruenza di età: ⟨${g}⟩ (${eg} anni) ha un figlio, ⟨${id}⟩, di ${e} anni.`); });
  }
  // trasmissione
  for (const p of vivi) {
    const id = p.id, u = parentU(S, id);
    const pa = u ? fatherOf(S, id) : null, ma = u ? motherOf(S, id) : null;
    p.conditions.forEach(c => {
      const n = c.name, m = modoDi(S, n);
      const dn = c.denovo || (p.variants || []).some(v => v.note === 'de novo');
      if ((m === 'XLR' || m === 'XL' || m === 'XLD') && p.sex === 'M' && pa && haCond(P[pa], n) && ma && !portaCond(P[ma], n))
        add(id, 'xlmm:' + id + n, 'warn', `Incongruenza: «${n}» è legata all'X ma passerebbe da padre (⟨${pa}⟩) a figlio maschio (⟨${id}⟩): un padre trasmette ai figli maschi l'Y, non l'X.`);
      if (m === 'MT' && pa && haCond(P[pa], n) && ma && !haCond(P[ma], n)) add(id, 'mtpat:' + id + n, 'tip', `«${n}» è mitocondriale: si trasmette per via materna. Il padre affetto (⟨${pa}⟩) non spiega la malattia di ⟨${id}⟩.`);
      if (m === 'YL' && p.sex === 'M' && pa && !haCond(P[pa], n) && !dn) add(id, 'ylpat:' + id + n, 'tip', `«${n}» è legata all'Y: il padre (⟨${pa}⟩) dovrebbe condividerla, salvo evento de novo.`);
      if (m === 'AR' && pa && ma) {
        const nonPort = [pa, ma].filter(g => !portaCond(P[g], n) && !(p.variants || []).filter(v => !v.neg).some(v => portaVar(P[g], v.text)) && !(P[g].variants || []).some(v => v.carrier && !v.neg));
        if (nonPort.length) add(id, 'arpar:' + id + n, 'tip', `${nonPort.length === 2 ? 'I genitori' : 'Un genitore'} di ⟨${id}⟩, affetto da «${n}» (autosomica recessiva), ${nonPort.length === 2 ? 'sono portatori obbligati' : 'è portatore obbligato'}, salvo eventi rari (de novo, disomia uniparentale, non paternità).`,
          { text: `Segno ${nonPort.length === 2 ? 'i genitori' : nonPort.map(g => '⟨' + g + '⟩').join('')} come portator${nonPort.length === 2 ? 'i' : (P[nonPort[0]].sex === 'F' ? 'e' : 'e')} di ${n}?`, options: [{ label: 'Sì, segna come portatori', cmd: nonPort.map(g => `@${g} è ${P[g].sex === 'F' ? 'portatrice' : 'portatore'} di ${n}`).join('; ') }] });
        if (!u.consang && !related(S, pa, ma)) add(id, 'arcons:' + u.id, 'tip', `Malattia autosomica recessiva: chiedi se i genitori di ⟨${id}⟩ sono consanguinei e la loro provenienza geografica.`);
      }
      if (m === 'AR') { const het = (p.variants || []).filter(v => !v.neg && v.text !== 'test' && (v.zyg === 'het' || (!v.zyg && !v.carrier))); const altri = (p.variants || []).filter(v => !v.neg && (v.zyg === 'omo' || v.zyg === 'comp')); if (het.length === 1 && !altri.length) add(id, 'ar1:' + id + n, 'tip', `⟨${id}⟩ è affetto da «${n}» (autosomica recessiva) con una sola variante in eterozigosi: cerca il secondo allele (CNV, varianti introniche o regolatorie) o rivaluta la diagnosi.`); }
      if ((m === 'XLR' || m === 'XL') && p.sex === 'M' && ma && !portaCond(P[ma], n)) {
        const linea = [...fullSibs(S, id), ...fullSibs(S, ma), ...(motherOf(S, ma) ? [fatherOf(S, ma)] : [])].filter(Boolean).filter(x => P[x] && P[x].sex === 'M' && haCond(P[x], n));
        if (linea.length) add(id, 'xlmo:' + id + n, 'tip', `La madre di ⟨${id}⟩ è portatrice obbligata di «${n}»: c'è un altro maschio affetto nella sua linea (${linea.map(x => '⟨' + x + '⟩').join(', ')}).`,
          { text: `Segno la madre (⟨${ma}⟩) come portatrice di ${n}?`, options: [{ label: 'Sì, segna la madre portatrice', cmd: `@${ma} è portatrice di ${n}` }] });
        else if (!dn) add(id, 'xlmo2:' + id + n, 'tip', `«${n}» legata all'X in ⟨${id}⟩: la madre può essere portatrice o la variante può essere de novo. Proponi il test alla madre (⟨${ma}⟩).`);
      }
      if ((m === 'XLR' || m === 'XL') && p.sex === 'M') {
        const figlie = childrenOf(S, id).filter(x => P[x] && P[x].sex === 'F' && !P[x].miscarriage && !P[x].pregnancy && !portaCond(P[x], n));
        if (figlie.length) add(id, 'xlfig:' + id + n, 'tip', `Le figlie di ⟨${id}⟩ (${figlie.map(x => '⟨' + x + '⟩').join(', ')}) sono portatrici obbligate di «${n}».`,
          { text: `Segno ${figlie.length > 1 ? 'le figlie' : 'la figlia'} di ⟨${id}⟩ come portatric${figlie.length > 1 ? 'i' : 'e'}?`, options: [{ label: 'Sì', cmd: figlie.map(f => `@${f} è portatrice di ${n}`).join('; ') }] });
      }
      const informato = q => q && (q.healthy || q.age || q.name || q.deceased || q.conditions.length || q.carriers.length || (q.variants || []).length || q.note || q.karyo);
      if (m === 'AD' && pa && ma && !dn && (informato(P[pa]) || informato(P[ma])) && !haCond(P[pa], n) && !haCond(P[ma], n) && !P[pa].presympt && !P[ma].presympt && !(p.variants || []).filter(v => !v.neg).some(v => portaVar(P[pa], v.text) || portaVar(P[ma], v.text)))
        add(id, 'adpar:' + id + n, 'tip', `${/^Malattia autosomica/.test(n) ? 'La malattia' : '«' + n + '»'} è autosomica dominante ma nessuno dei genitori di ⟨${id}⟩ risulta affetto: considera variante de novo, penetranza incompleta, espressività variabile, mosaicismo germinale o non paternità.`);
      if (dn) {
        const vv = (p.variants || []).filter(v => !v.neg && v.note === 'de novo');
        const inGen = [pa, ma].filter(Boolean).filter(g => vv.some(v => portaVar(P[g], v.text)) || haCond(P[g], n));
        if (inGen.length) add(id, 'dnpar:' + id + n, 'warn', `Incongruenza: «${n}» di ⟨${id}⟩ è indicata come de novo ma ${inGen.map(g => '⟨' + g + '⟩').join(' e ')} ${inGen.length > 1 ? 'hanno' : 'ha'} la stessa ${vv.length ? 'variante' : 'malattia'}.`);
        else add(id, 'dn:' + id + n, 'tip', `De novo in ⟨${id}⟩: il rischio di ricorrenza per i genitori è basso ma non nullo per il possibile mosaicismo germinale. Conferma con il test di entrambi i genitori.`);
      }
    });
    (p.variants || []).filter(v => !v.neg && v.note === 'de novo' && !p.conditions.length).forEach(v => {
      const inGen = [pa, ma].filter(Boolean).filter(g => portaVar(P[g], v.text));
      if (inGen.length) add(id, 'dnv:' + id + v.text, 'warn', `Incongruenza: ${v.text} di ⟨${id}⟩ è indicata come de novo ma è presente anche in ${inGen.map(g => '⟨' + g + '⟩').join(' e ')}.`);
    });
    if (id === S.probandId) {
      const k = p.conditions.map(c => condKey(c.name) + ' ' + lowA(c.name)).join(' ');
      if (/tumore|melanoma|linfoma|leucemia|sarcoma|lynch|mammella ovaio|poliposi|li fraumeni/.test(k)) add(id, 'q:onco', 'tip', 'Per la storia oncologica: età alla diagnosi di ogni familiare affetto, tumori multipli o bilaterali, istotipo (es. triplo negativo), entrambi i rami fino al secondo-terzo grado, origine etnica (es. ebraica ashkenazita), test genetici già eseguiti in famiglia.');
      if (/autismo|disabilita intellettiva|ritardo|epilessia|microcefalia|macrocefalia|malformazion|dismorf|down|edwards|patau|williams|digeorge|angelman|prader|rett|x fragile|cri du chat|wolf|smith magenis|sotos|kabuki|cornelia|charge|dravet|delezione|duplicazione/.test(k) && !/tumore/.test(k)) add(id, 'q:neuro', 'tip', 'Domande utili: gravidanza e parto, tappe dello sviluppo, crescita e circonferenza cranica, epilessia, dismorfismi, altri familiari con disabilità intellettiva o aborti ripetuti, esami già eseguiti (array-CGH, X fragile, esoma).');
      if (/cardiomiopatia|brugada|qt lungo|cpvt|morte improvvisa|aritmogen|aneurisma aortico|marfan/.test(k)) add(id, 'q:cardio', 'tip', 'Domande utili: morti improvvise o inspiegate in giovane età, sincopi, annegamenti o incidenti senza causa, pacemaker o defibrillatori in famiglia. Proponi ECG ed ecocardiogramma ai familiari di primo grado.');
    }
    // riarrangiamenti cromosomici bilanciati
    p.carriers.filter(n => /^(?:t|inv|rob|ins)\(/.test(n || '')).forEach(n => {
      if (/^inv\(9\)\(p1[12](?:\.\d)?q1[23]/.test(n)) return;
      add(id, 'cito:' + id + n, 'tip', `${n} bilanciata in ⟨${id}⟩. In consulenza: storia di aborti ricorrenti, infertilità o figli con malformazioni/disabilità? Cariotipo ai genitori e ai fratelli del portatore. In gravidanza: diagnosi prenatale (villocentesi/amniocentesi con cariotipo o array) oppure PGT-SR.`);
      if (/^rob\((?:\d+;)?(?:14|15)|^rob\(\d+;(?:14|15)\)/.test(n)) add(id, 'robupd:' + id + n, 'tip', `${n}: con il cromosoma ${/14/.test(n) ? '14' : '15'} c'è anche un rischio di disomia uniparentale nella prole; in diagnosi prenatale valuta il test per UPD.`);
      if (/^rob\(.*21/.test(n)) add(id, 'rob21:' + id + n, 'tip', `${n}: rischio di figli con sindrome di Down da traslocazione; il rischio empirico è maggiore se il portatore è la madre.`);
    });
  }
  return out;
}

/* <<< genetica */

/* >>> ripetizioni (1.6): malattie da espansione di ripetizioni (Huntington, X fragile, DM1/DM2, Friedreich, SCA, …)
   Soglie indicative (GeneReviews/linee guida); il referto del laboratorio resta il riferimento. */
const REP = {
  HTT: { mot: 'CAG', mal: 'Malattia di Huntington', modo: 'AD', cl: [[26, 'normale', '≤26'], [35, 'intermedio', '27–35'], [39, 'pen. ridotta', '36–39'], [1e9, 'pen. completa', '≥40']], esp: 36 },
  FMR1: { mot: 'CGG', mal: "Sindrome dell'X fragile", modo: 'XL', cl: [[44, 'normale', '≤44'], [54, 'intermedio', '45–54'], [200, 'premutazione', '55–200'], [1e9, 'mut. completa', '>200']], esp: 55 },
  DMPK: { mot: 'CTG', mal: 'Distrofia miotonica tipo 1', modo: 'AD', cl: [[34, 'normale', '≤34'], [49, 'premutazione', '35–49'], [1e9, 'espanso', '≥50']], esp: 50 },
  CNBP: { mot: 'CCTG', mal: 'Distrofia miotonica tipo 2', modo: 'AD', cl: [[26, 'normale', '≤26'], [74, 'incerto', '27–74'], [1e9, 'espanso', '≥75']], esp: 75 },
  FXN: { mot: 'GAA', mal: 'Atassia di Friedreich', modo: 'AR', cl: [[33, 'normale', '≤33'], [65, 'premutazione', '34–65'], [1e9, 'espanso', '≥66']], esp: 66 },
  AR: { mot: 'CAG', mal: 'Malattia di Kennedy', modo: 'XLR', cl: [[34, 'normale', '≤34'], [37, 'incerto', '35–37'], [1e9, 'espanso', '≥38']], esp: 38 },
  ATXN1: { mot: 'CAG', mal: 'Atassia spinocerebellare tipo 1', modo: 'AD', cl: [[35, 'normale', '≤35'], [38, 'intermedio', '36–38'], [1e9, 'espanso', '≥39']], esp: 39 },
  ATXN2: { mot: 'CAG', mal: 'Atassia spinocerebellare tipo 2', modo: 'AD', cl: [[31, 'normale', '≤31'], [34, 'pen. ridotta', '32–34'], [1e9, 'pen. completa', '≥35']], esp: 32 },
  ATXN3: { mot: 'CAG', mal: 'Atassia spinocerebellare tipo 3', modo: 'AD', cl: [[44, 'normale', '≤44'], [59, 'intermedio', '45–59'], [1e9, 'espanso', '≥60']], esp: 60 },
  CACNA1A: { mot: 'CAG', mal: 'Atassia spinocerebellare tipo 6', modo: 'AD', cl: [[18, 'normale', '≤18'], [19, 'incerto', '19'], [1e9, 'espanso', '≥20']], esp: 20 },
  ATXN7: { mot: 'CAG', mal: 'Atassia spinocerebellare tipo 7', modo: 'AD', cl: [[27, 'normale', '≤27'], [33, 'intermedio', '28–33'], [36, 'pen. ridotta', '34–36'], [1e9, 'pen. completa', '≥37']], esp: 34 },
  TBP: { mot: 'CAG', mal: 'Atassia spinocerebellare tipo 17', modo: 'AD', cl: [[40, 'normale', '≤40'], [48, 'pen. ridotta', '41–48'], [1e9, 'pen. completa', '≥49']], esp: 41 },
  ATN1: { mot: 'CAG', mal: 'Atrofia dentato-rubro-pallido-luisiana', modo: 'AD', cl: [[35, 'normale', '≤35'], [47, 'intermedio', '36–47'], [1e9, 'espanso', '≥48']], esp: 48 },
  C9ORF72: { mot: 'G4C2', mal: 'SLA/demenza frontotemporale da C9orf72', modo: 'AD', cl: [[23, 'normale', '≤23'], [30, 'intermedio', '24–30'], [1e9, 'espanso', '>30']], esp: 31, nome: 'C9orf72' },
  PABPN1: { mot: 'GCN', mal: 'Distrofia muscolare oculofaringea', modo: 'AD', cl: [[10, 'normale', '10'], [11, 'incerto', '11'], [1e9, 'espanso', '≥12']], esp: 12 },
  JPH3: { mot: 'CTG', mal: 'Malattia Huntington-like 2', modo: 'AD', cl: [[28, 'normale', '≤28'], [39, 'incerto', '29–39'], [1e9, 'espanso', '≥40']], esp: 40 },
};
const REP_EXTRA_MAL = [
  ['Distrofia miotonica tipo 1', 'dm1', 'distrofia miotonica tipo 1', 'distrofia miotonica di tipo 1', 'distrofia miotonica 1'],
  ['Distrofia miotonica tipo 2', 'dm2', 'promm', 'distrofia miotonica tipo 2', 'distrofia miotonica di tipo 2', 'distrofia miotonica 2', 'miopatia miotonica prossimale'],
  ['Atassia spinocerebellare tipo 1', 'sca1', 'sca 1', 'atassia spinocerebellare tipo 1', 'atassia spinocerebellare di tipo 1'],
  ['Atassia spinocerebellare tipo 2', 'sca2', 'sca 2', 'atassia spinocerebellare tipo 2', 'atassia spinocerebellare di tipo 2'],
  ['Atassia spinocerebellare tipo 3', 'sca3', 'sca 3', 'atassia spinocerebellare tipo 3', 'atassia spinocerebellare di tipo 3', 'machado-joseph', 'malattia di machado-joseph', 'malattia di machado joseph'],
  ['Atassia spinocerebellare tipo 6', 'sca6', 'sca 6', 'atassia spinocerebellare tipo 6', 'atassia spinocerebellare di tipo 6'],
  ['Atassia spinocerebellare tipo 7', 'sca7', 'sca 7', 'atassia spinocerebellare tipo 7', 'atassia spinocerebellare di tipo 7'],
  ['Atassia spinocerebellare tipo 17', 'sca17', 'sca 17', 'atassia spinocerebellare tipo 17', 'atassia spinocerebellare di tipo 17'],
  ['Atrofia dentato-rubro-pallido-luisiana', 'drpla', 'atrofia dentato-rubro-pallido-luisiana', 'atrofia dentatorubropallidoluisiana'],
  ['SLA/demenza frontotemporale da C9orf72', 'sla/ftd', 'sla-ftd', 'sla ftd c9orf72', 'sla da c9orf72'],
  ['Distrofia muscolare oculofaringea', 'opmd', 'distrofia oculofaringea', 'distrofia muscolare oculofaringea'],
  ['Malattia Huntington-like 2', 'hdl2', 'huntington-like 2', 'malattia huntington-like 2'],
  ["Sindrome tremore/atassia associata all'X fragile", 'fxtas', 'sindrome tremore atassia x fragile', "sindrome tremore-atassia associata all'x fragile"],
  ["Insufficienza ovarica primaria associata all'X fragile", 'fxpoi', "insufficienza ovarica primaria da premutazione fmr1", "insufficienza ovarica associata all'x fragile"],
  ['CANVAS', 'canvas', 'atassia cerebellare con neuropatia e areflessia vestibolare'],
  ['FRAXE', 'fraxe', 'sindrome fraxe', 'ritardo mentale fraxe'],
  ['Epilessia mioclonica di Unverricht-Lundborg', 'unverricht-lundborg', 'epm1', 'epilessia mioclonica progressiva tipo 1'],
];
REP_EXTRA_MAL.forEach(([canon, ...al]) => { [canon, ...al].forEach(a => { MAL_IDX[normDiz(a)] = canon; MAL_IDX[normDiz(a).replace(/'/g, ' ').replace(/\s+/g, ' ')] = canon; }); });
Object.assign(INH, {
  'Distrofia miotonica tipo 1': 'AD', 'Distrofia miotonica tipo 2': 'AD', 'Atassia spinocerebellare tipo 1': 'AD', 'Atassia spinocerebellare tipo 2': 'AD', 'Atassia spinocerebellare tipo 3': 'AD',
  'Atassia spinocerebellare tipo 6': 'AD', 'Atassia spinocerebellare tipo 7': 'AD', 'Atassia spinocerebellare tipo 17': 'AD', 'Atrofia dentato-rubro-pallido-luisiana': 'AD',
  'SLA/demenza frontotemporale da C9orf72': 'AD', 'Distrofia muscolare oculofaringea': 'AD', 'Malattia Huntington-like 2': 'AD', "Sindrome tremore/atassia associata all'X fragile": 'XL',
  "Insufficienza ovarica primaria associata all'X fragile": 'XL', CANVAS: 'AR', FRAXE: 'XL', 'Epilessia mioclonica di Unverricht-Lundborg': 'AR', 'Malattia di Huntington': 'AD', 'Atassia di Friedreich': 'AR', 'Malattia di Kennedy': 'XLR',
});
Object.assign(GENE_MALATTIA, { HTT: 'Malattia di Huntington', DMPK: 'Distrofia miotonica tipo 1', CNBP: 'Distrofia miotonica tipo 2', ATXN1: 'Atassia spinocerebellare tipo 1', ATXN2: 'Atassia spinocerebellare tipo 2',
  ATXN3: 'Atassia spinocerebellare tipo 3', ATXN7: 'Atassia spinocerebellare tipo 7', TBP: 'Atassia spinocerebellare tipo 17', ATN1: 'Atrofia dentato-rubro-pallido-luisiana', C9ORF72: 'SLA/demenza frontotemporale da C9orf72',
  PABPN1: 'Distrofia muscolare oculofaringea', JPH3: 'Malattia Huntington-like 2', RFC1: 'CANVAS', AFF2: 'FRAXE', CSTB: 'Epilessia mioclonica di Unverricht-Lundborg' });

const MOTIVO_GENE = { CGG: 'FMR1', CTG: 'DMPK', CCTG: 'CNBP', GAA: 'FXN', G4C2: 'C9ORF72', GGGGCC: 'C9ORF72', GCN: 'PABPN1', GCG: 'PABPN1' };
const REP_MAL_RE = [
  [/huntington-like|hdl2/, 'JPH3'], [/huntington|(?<![a-z])hd(?![a-z])|corea/, 'HTT'], [/x\s*-?fragile|(?<![a-z])fxs|martin[\s-]bell|fxtas|fxpoi/, 'FMR1'],
  [/miotonica\s+(?:di\s+)?tipo\s*2|(?<![a-z])dm2(?![a-z\d])|promm/, 'CNBP'], [/miotonica|steinert|(?<![a-z])dm1(?![a-z\d])/, 'DMPK'], [/friedreich|(?<![a-z])fa(?=\s+gaa)/, 'FXN'],
  [/kennedy|sbma|bulbo-?spinale/, 'AR'], [/drpla|dentato/, 'ATN1'], [/oculofaring|opmd/, 'PABPN1'], [/c9orf72|(?<![a-z])sla(?![a-z])|frontotemporale|(?<![a-z])ftd(?![a-z])/, 'C9ORF72'],
  [/(?:sca\s*|spinocerebellare\s+(?:di\s+)?tipo\s*)(\d{1,2})|machado/, 'SCA'],
];
const SCA_GENE = { 1: 'ATXN1', 2: 'ATXN2', 3: 'ATXN3', 6: 'CACNA1A', 7: 'ATXN7', 17: 'TBP' };
const REP_TRIG = /(?<![a-z])(?:cag|cgg|ctg|cctg|gaa|ggggcc|g4c2|gcn|triplett\w*|ripetizion\w*|espansion\w*|espans[oaie]|premutazion\w*|premutat[oaie]|mutazione\s+complet\w*|full\s+mutation|allel\w*\s+(?:intermedi|espans|normal|patologic)\w*|intermedi[oa]|presintomatic\w*|pen(?:etranza)?\.?\s+ridott\w*)(?![a-z])/;
function geneRep(low, S, ctx) {
  const gm = /(?<![a-z0-9])(htt|fmr1|dmpk|cnbp|fxn|atxn[1237]|cacna1a|tbp|atn1|c9orf72|pabpn1|jph3)(?![a-z0-9])/.exec(low) || /(?<![a-z])(ar)\s+(?:cag|\(cag\))/.exec(low);
  if (gm) return gm[1].toUpperCase();
  for (const [re, g] of REP_MAL_RE) { const m = re.exec(low); if (m) { if (g !== 'SCA') return g; const t = m[1] ? +m[1] : 3; return SCA_GENE[t] || null; } }
  const mm = /(?<![a-z])(cgg|ctg|cctg|gaa|ggggcc|g4c2|gcn|gcg)(?![a-z])/.exec(low);
  if (mm && !(mm[1] === 'ctg' && /huntington-like/.test(low))) return MOTIVO_GENE[mm[1].toUpperCase()];
  // CAG senza gene: la malattia da ripetizioni già in famiglia o in discussione
  const fam = [ctx.focusCond, ...S.conditions.map(c => c.name)].filter(Boolean);
  for (const n of fam) { const g = Object.keys(REP).find(k => REP[k].mal === n || condMatches(REP[k].mal, n) || condMatches(n, REP[k].mal)); if (g && REP[g].mot === 'CAG') return g; }
  for (const p of Object.values(S.people)) for (const v of p.variants || []) { const m = /^(\S+)\s+CAG\s/.exec(v.text); if (m && REP[m[1].toUpperCase()]) return m[1].toUpperCase(); }
  return /(?<![a-z])cag(?![a-z])/.test(low) ? 'HTT?' : null;
}
function classeRep(g, n) { const r = REP[g]; if (!r || n == null) return null; return r.cl.find(([max]) => n <= max) || r.cl[r.cl.length - 1]; }
function nomeGeneRep(g) { return (REP[g] && REP[g].nome) || g; }
function parseRep(t) {
  // «HTT CAG 17/42 – pen. completa» → { gene, mot, alleli:[17,42], max }
  const m = /^(\S+)\s+(CAG|CGG|CTG|CCTG|GAA|G4C2|GCN)\s+(.+)$/.exec(String(t || '').trim());
  if (!m || !REP[m[1].toUpperCase()]) return null;
  const al = (m[3].match(/>?\d+/g) || []).map(x => x.startsWith('>') ? +x.slice(1) + 1 : +x);
  return { gene: m[1].toUpperCase(), mot: m[2], alleli: al, max: al.length ? Math.max(...al) : null };
}
function tryRipetizioni(S, sub, ctx, R) {
  const low0 = lowA(sub);
  if (!REP_TRIG.test(low0)) return false;
  if (/(?<![a-z])(?:rimuovi|togli|elimina|cancella)(?![a-z])/.test(low0)) return false;
  let g = geneRep(low0, S, ctx);
  if (!g) return false;
  const ids = soggettoFrase(S, sub, ctx, R);
  let presunto = false;
  if (g === 'HTT?') { g = 'HTT'; presunto = true; }
  if (g === 'CAG?') {
    R.asks.push({ text: `L'espansione CAG di ${ids.map(i => '⟨' + i + '⟩').join(', ')} in quale gene?`, options: ['HTT', 'ATXN1', 'ATXN2', 'ATXN3', 'CACNA1A', 'ATXN7', 'TBP', 'ATN1', 'AR'].map(x => ({ label: `${x} – ${REP[x].mal}`, cmd: ids.map(i => `@${i} ${sub.replace(/^.*?(?=\d|cag|CAG)/, '').trim().replace(/(?<![A-Za-z])cag(?![A-Za-z])/i, x + ' CAG')}`).join('; '), keys: [x.toLowerCase(), ...REP[x].mal.toLowerCase().split(/\s+/)] })) });
    return true;
  }
  const r = REP[g];
  // numeri delle ripetizioni (tolte età, tipi di SCA e nomi di geni con cifre)
  let l = low0.replace(/(?<![a-z0-9])(?:htt|fmr1|dmpk|cnbp|fxn|atxn[1237]|cacna1a|tbp|atn1|c9orf72|pabpn1|jph3|sca\s*\d{1,2}|dm[12])(?![a-z0-9])/g, ' ')
    .replace(/(?:spinocerebellare|miotonica)\s+(?:di\s+)?tipo\s*\d{1,2}/g, ' ')
    .replace(/(?:(?:a|ad|di|da|all'eta di|dall'eta di|verso i|intorno ai|circa|esordio a)\s+)?\d{1,3}\s*(?:anni|anno|aa|mesi|settimane)/g, ' ')
    .replace(/(?:nat[oa]|classe)\s+(?:nel\s+)?\d{4}/g, ' ');
  const alleli = [];
  const coppia = /(>?\s*\d{1,4})\s*(?:\/|;|,|e|ed|-)\s*(>?\s*\d{1,4})(?![\d.])/.exec(l);
  if (coppia) alleli.push(coppia[1].replace(/\s+/g, ''), coppia[2].replace(/\s+/g, ''));
  else { let m; const re = /(?:(?:>|oltre|piu di|maggiore di|superiore a)\s*)?(\d{1,4})(?![\d.])/g; while ((m = re.exec(l))) alleli.push((/^(?:>|oltre|piu|maggiore|superiore)/.test(m[0]) ? '>' : '') + m[1]); }
  const val = x => x.startsWith('>') ? +x.slice(1) + 1 : +x;
  let classe = null;
  if (!alleli.length) {
    if (/mutazione\s+complet|full\s+mutation/.test(low0)) classe = r.cl.find(c => /completa|espanso/.test(c[1])) || r.cl[r.cl.length - 1];
    else if (/premutazion|premutat/.test(low0)) classe = r.cl.find(c => c[1] === 'premutazione') || null;
    else if (/intermedi/.test(low0)) classe = r.cl.find(c => c[1] === 'intermedio') || null;
    else if (/pen(?:etranza)?\.?\s+ridott/.test(low0)) classe = r.cl.find(c => c[1] === 'pen. ridotta') || null;
    else if (/espans|patologic|positiv/.test(low0)) classe = r.cl.find(c => /completa|espanso/.test(c[1])) || r.cl[r.cl.length - 1];
    else if (/negativ|normal|non\s+espans/.test(low0)) classe = r.cl[0];
    if (!classe) return false;
  }
  alleli.sort((a, b) => val(a) - val(b));
  const max = alleli.length ? val(alleli[alleli.length - 1]) : null;
  if (!classe) classe = classeRep(g, max);
  const espansi = alleli.filter(a => val(a) >= r.esp).length || (!alleli.length && /espanso|completa|premutazione|pen\./.test(classe[1]) && classe[1] !== 'premutazione' ? 1 : 0);
  const testo = `${nomeGeneRep(g)} ${r.mot} ${alleli.length ? alleli.join('/') : classe[2]}`;
  const neg = classe[1] === 'normale';
  const nomina = /(?:^|\s)(?:ha|hanno|aveva|avevano|con|soffre\s+di)\s+(?:la\s+|una\s+|il\s+|l'\s*)?(?:forma\s+\w+\s+(?:di\s+)?)?(?:malattia\s+di\s+|corea\s+di\s+|morbo\s+di\s+)?(?:huntington|distrofia\s+miotonica|steinert|atassia|sca\s*\d|friedreich|kennedy|sbma|sla(?![a-z])|demenza|drpla|distrofia\s+(?:muscolare\s+)?oculofaringea|sindrome\s+dell.\s*x\s+fragile)/.test(low0);
  const aff = (/(?<![a-z])(?:affett[oaie]|malat[oaie]|sintomatic[oaie]|esordio|manifesta|diagnosi)/.test(low0) || nomina) && !/(?:asintomatic|presintomatic|non\s+(?:e\s+)?(?:affett|malat|sintomatic))/.test(low0);
  const asint = /asintomatic|presintomatic|(?<![a-z])san[oa](?![a-z])|senza\s+sintomi|nessun\s+sintomo/.test(low0);
  const fatto = [];
  for (const id of ids) {
    const p = S.people[id];
    p.variants = (p.variants || []).filter(v => !(parseRep(v.text) && parseRep(v.text).gene === g));
    const v = { text: testo, neg, zyg: 'het', carrier: false, cls: '', note: neg ? '' : classe[1] };
    let stato = '';
    const espanso = !neg && (espansi > 0 || ['premutazione', 'mut. completa', 'espanso', 'pen. completa', 'pen. ridotta'].includes(classe[1]));
    const malattia = () => { const nm = registerCondition(S, r.mal); impostaModo(S, nm, r.modo, null); if (!p.conditions.some(c => c.name === nm)) p.conditions.push({ name: nm, age: '' }); p.presympt = false; return nm; };
    if (r.modo === 'AD') {
      if (espanso && classe[1] !== 'premutazione') { if (aff) { malattia(); stato = 'affetto'; } else { p.presympt = true; stato = 'portatore presintomatico (linea verticale)'; } }
      else if (aff) { malattia(); stato = 'affetto'; }
    } else if (g === 'FMR1') {
      if (p.sex === 'M') v.zyg = 'emi';
      if (classe[1] === 'premutazione') { if (p.sex !== 'M') { v.carrier = true; stato = 'portatrice di premutazione (metà simbolo)'; } else stato = 'maschio premutato (trasmette la premutazione a tutte le figlie)'; }
      if (classe[1] === 'mut. completa') { if (p.sex === 'M' && !asint || aff) { malattia(); stato = 'affetto'; } else if (p.sex !== 'M') { stato = 'mutazione completa'; } }
    } else if (r.modo === 'XLR') {
      if (p.sex === 'M') { v.zyg = 'emi'; if (espanso) { if (aff) { malattia(); stato = 'affetto'; } else { p.presympt = true; stato = 'portatore presintomatico (linea verticale)'; } } }
      else if (espanso) { v.carrier = true; stato = 'portatrice (metà simbolo)'; }
    } else if (r.modo === 'AR') {
      if (espansi >= 2) { v.zyg = 'omo'; if (asint) { p.presympt = true; stato = 'due alleli espansi, asintomatico'; } else { malattia(); stato = 'affetto (due alleli espansi)'; } }
      else if (espansi === 1) { v.carrier = true; stato = 'portatore (metà simbolo)'; }
    }
    if (aff && !stato) { malattia(); stato = 'affetto'; }
    p.variants.push(v);
    R.touched.add(id);
    fatto.push(`⟨${id}⟩: ${testo}${neg ? ' – nella norma' : ` – ${classe[1]} (${classe[2]} ${r.mot})`}${stato ? '; ' + stato : ''}`);
  }
  pruneConditions(S);
  ctx.focusCond = r.mal; ctx.lastTouched = ids;
  R.log.push({ type: 'ok', text: fatto.join(' · '), ids });
  if (presunto) R.log.push({ type: 'tip', text: 'Espansione CAG attribuita a HTT (Huntington). Per un\u2019altra malattia da CAG scrivi il gene o la malattia, ad esempio «ATXN3 CAG 70» o «SCA2 con 40 CAG».' });
  return true;
}
function verifica(S) { const o = verifica0(S); try { o.push(...verificaRip(S)); } catch (e) { if (typeof console !== 'undefined') console.error(e); } return o; }
function verificaRip(S) {
  const P = S.people, out = [];
  const add = (id, key, level, text, ask) => out.push({ id, key, level, text, ask });
  const repDi = p => (p.variants || []).filter(v => !v.neg).map(v => Object.assign(parseRep(v.text) || {}, { v })).filter(x => x.gene);
  for (const id of Object.keys(P)) {
    const p = P[id];
    for (const x of repDi(p)) {
      const c = classeRep(x.gene, x.max), lab = c ? c[1] : x.v.note;
      if (x.gene === 'HTT') {
        if (lab === 'intermedio') add(id, 'rep-int:' + id, 'tip', `⟨${id}⟩ ha un allele HTT intermedio (27–35 CAG): non causa la malattia, ma può espandersi nella prole, soprattutto se trasmesso dal padre.`);
        if (lab === 'pen. ridotta') add(id, 'rep-pr:' + id, 'tip', `⟨${id}⟩: 36–39 CAG, penetranza ridotta. La malattia può non manifestarsi o esordire tardi; resta il rischio di espansione nei figli (50% di trasmettere l'allele).`);
        if (x.max >= 60) add(id, 'rep-juv:' + id, 'tip', `⟨${id}⟩: ≥60 CAG, range della forma giovanile; le grandi espansioni derivano più spesso da trasmissione paterna.`);
      }
      if (x.gene === 'FMR1') {
        if (lab === 'premutazione' && p.sex !== 'M') add(id, 'rep-pmF:' + id, 'tip', `⟨${id}⟩ è portatrice di premutazione FMR1: il rischio che passi a mutazione completa nei figli cresce con il numero di CGG (molto alto oltre ~100) e diminuisce con le interruzioni AGG; rischio di FXPOI e, più tardi, FXTAS. Diagnosi prenatale e PGT-M possibili.`);
        if (lab === 'premutazione' && p.sex === 'M') add(id, 'rep-pmM:' + id, 'tip', `⟨${id}⟩ è un maschio premutato: trasmette la premutazione a tutte le figlie (portatrici obbligate) e a nessun figlio maschio; rischio di FXTAS dopo i 50 anni.`);
        if (lab === 'intermedio') add(id, 'rep-gz:' + id, 'tip', `⟨${id}⟩: allele FMR1 intermedio (45–54 CGG, zona grigia). Può essere instabile ma in genere non espande a mutazione completa in una generazione.`);
      }
      if (x.gene === 'DMPK' && lab === 'premutazione') add(id, 'rep-dmp:' + id, 'tip', `⟨${id}⟩: 35–49 CTG (premutazione DM1), di solito asintomatica, ma con rischio di espansione nella prole.`);
      if (x.gene === 'DMPK' && lab === 'espanso' && p.sex === 'F') add(id, 'rep-dmc:' + id, 'tip', `⟨${id}⟩: DM1 trasmessa per via materna comporta il rischio di forma congenita nei figli; valutare diagnosi prenatale o PGT-M.`);
      if (x.gene === 'FXN' && x.v.carrier) add(id, 'rep-fxn:' + id, 'tip', `⟨${id}⟩ è portatore di espansione GAA in FXN: per il rischio riproduttivo serve lo studio del partner.`);
      if (x.gene === 'AR' && x.v.carrier) add(id, 'rep-sbma:' + id, 'tip', `⟨${id}⟩ è portatrice di SBMA: ogni figlio maschio ha il 50% di rischio di essere affetto, ogni figlia il 50% di essere portatrice.`);
      if (x.gene === 'C9ORF72' && lab === 'espanso') add(id, 'rep-c9:' + id, 'tip', `⟨${id}⟩: espansione C9orf72 (SLA e/o demenza frontotemporale), penetranza dipendente dall'età; i figli hanno il 50% di rischio di ereditarla.`);
      if (p.presympt && REP[x.gene] && REP[x.gene].modo === 'AD') { const a = numEta(p.age); if (a != null && a < 18) add(id, 'rep-min:' + id, 'warn', `⟨${id}⟩ è minorenne: il test presintomatico per malattie a esordio adulto (${REP[x.gene].mal}) non è raccomandato in assenza di sintomi.`); }
      // anticipazione: più ripetizioni del genitore che porta lo stesso gene
      const pu = p.parentUnion && S.unions[p.parentUnion];
      if (pu && x.max) for (const g0 of [pu.a, pu.b].filter(Boolean)) {
        const y = repDi(P[g0]).find(z => z.gene === x.gene);
        const nTxt = z => (z.v.text.match(/>?\d+/g) || []).pop();
        if (y && y.max && x.max > y.max && classeRep(x.gene, x.max)[1] !== 'normale') add(id, 'rep-ant:' + id + g0, 'tip', `Anticipazione: ⟨${id}⟩ ha ${nTxt(x)} ${REP[x.gene].mot} contro ${nTxt(y)} del genitore ⟨${g0}⟩ (espansione nella trasmissione ${P[g0].sex === 'M' ? 'paterna' : P[g0].sex === 'F' ? 'materna' : ''}).`);
      }
    }
  }
  return out;
}
/* <<< ripetizioni */

/* Vocabolario generato da build_vocab.py: HGNC (simboli approvati, universo 2015 + geni-malattia HPO 2025-01-16),
   termini HPO in italiano, nomi OMIM/Orphanet (HPO annotations). Serve a riconoscere geni e malattie reali. */
const VOC_GENI_STR = "A1BG A1CF A2M *A2ML1 A3GALT2 A4GALT A4GNT *AAAS AACS AADAC AADACL2 AADACL3 AADACL4 AADAT *AAGAB AAK1 AAMDC AAMP AANAT AAR2 AARD AARS *AARS1 *AARS2 AARSD1 AASDH AASDHPPT *AASS AATF AATK *ABAT *ABCA1 ABCA10 *ABCA12 ABCA13 *ABCA2 *ABCA3 *ABCA4 *ABCA5 ABCA6 *ABCA7 ABCA8 ABCA9 *ABCB1 ABCB10 *ABCB11 *ABCB4 ABCB5 *ABCB6 *ABCB7 ABCB8 ABCB9 *ABCC1 ABCC10 ABCC11 ABCC12 *ABCC2 ABCC3 ABCC4 ABCC5 *ABCC6 *ABCC8 *ABCC9 *ABCD1 ABCD2 *ABCD3 *ABCD4 ABCE1 ABCF1 ABCF2 ABCF3 ABCG1 ABCG2 ABCG4 *ABCG5 *ABCG8 ABHD1 ABHD10 ABHD11 *ABHD12 ABHD12B ABHD13 ABHD14A ABHD14B ABHD15 *ABHD16A ABHD16B ABHD17A ABHD17B ABHD17C ABHD18 ABHD2 ABHD3 ABHD4 *ABHD5 ABHD6 ABHD8 ABI1 ABI2 ABI3 ABI3BP *ABL1 ABL2 ABLIM1 ABLIM2 ABLIM3 ABO ABR ABRA ABRACL ABRAXAS1 ABRAXAS2 ABT1 ABTB1 ABTB2 ACAA1 ACAA2 *ACACA ACACB ACAD10 ACAD11 *ACAD8 *ACAD9 ACADL *ACADM *ACADS *ACADSB *ACADVL *ACAN ACAP1 ACAP2 ACAP3 *ACAT1 *ACAT2 ACBD3 ACBD4 *ACBD5 *ACBD6 ACBD7 ACCS ACCSL *ACD *ACE ACE2 ACER1 ACER2 *ACER3 ACHE ACIN1 ACKR1 ACKR2 *ACKR3 ACKR4 ACLY ACMSD ACO1 *ACO2 ACOD1 ACOT1 ACOT11 ACOT12 ACOT13 ACOT2 ACOT4 ACOT6 ACOT7 ACOT8 ACOT9 *ACOX1 *ACOX2 ACOX3 ACOXL ACP1 ACP2 *ACP4 *ACP5 ACP6 ACP7 ACPP *ACR ACRBP ACRV1 ACSBG1 ACSBG2 ACSF2 *ACSF3 ACSL1 ACSL3 *ACSL4 *ACSL5 ACSL6 ACSM1 ACSM2A ACSM2B ACSM3 ACSM4 ACSM5 ACSM6 ACSS1 ACSS2 ACSS3 *ACTA1 *ACTA2 *ACTB ACTBL2 *ACTC1 *ACTG1 *ACTG2 ACTL10 ACTL6A *ACTL6B *ACTL7A ACTL7B ACTL8 *ACTL9 *ACTN1 *ACTN2 ACTN3 *ACTN4 ACTR10 ACTR1A ACTR1B ACTR2 ACTR3 ACTR3B ACTR3C ACTR5 ACTR6 ACTR8 ACTRT1 ACTRT2 ACTRT3 *ACVR1 *ACVR1B ACVR1C ACVR2A *ACVR2B *ACVRL1 *ACY1 ACY3 ACYP1 ACYP2 *ADA *ADA2 ADAD1 ADAD2 ADAL *ADAM10 ADAM11 ADAM12 ADAM15 *ADAM17 ADAM18 ADAM19 ADAM2 ADAM20 ADAM21 *ADAM22 ADAM23 ADAM28 ADAM29 ADAM30 ADAM32 ADAM33 ADAM7 ADAM8 *ADAM9 ADAMDEC1 ADAMTS1 *ADAMTS10 ADAMTS12 *ADAMTS13 ADAMTS14 *ADAMTS15 ADAMTS16 *ADAMTS17 *ADAMTS18 *ADAMTS19 *ADAMTS2 ADAMTS20 *ADAMTS3 ADAMTS4 ADAMTS5 ADAMTS6 ADAMTS7 ADAMTS8 ADAMTS9 *ADAMTSL1 *ADAMTSL2 ADAMTSL3 *ADAMTSL4 ADAMTSL5 ADAP1 ADAP2 *ADAR *ADARB1 ADARB2 ADAT1 ADAT2 *ADAT3 ADCK1 ADCK2 ADCK5 *ADCY1 *ADCY10 ADCY2 *ADCY3 ADCY4 *ADCY5 *ADCY6 ADCY7 ADCY8 ADCY9 ADCYAP1 ADCYAP1R1 *ADD1 ADD2 *ADD3 ADGB ADGRA1 ADGRA2 ADGRA3 ADGRB1 ADGRB2 ADGRB3 ADGRD1 ADGRD2 ADGRE1 *ADGRE2 ADGRE3 ADGRE5 ADGRF1 ADGRF2 ADGRF3 ADGRF4 ADGRF5 *ADGRG1 *ADGRG2 ADGRG3 ADGRG4 ADGRG5 *ADGRG6 ADGRG7 *ADGRL1 ADGRL2 ADGRL3 ADGRL4 *ADGRV1 ADH1A *ADH1B *ADH1C ADH4 *ADH5 ADH6 ADH7 ADHFE1 ADI1 ADIG ADIPOQ ADIPOR1 ADIPOR2 ADIRF *ADK ADM ADM2 ADM5 *ADNP ADNP2 ADO ADORA1 *ADORA2A ADORA2B ADORA3 ADPGK ADPRH ADPRHL1 ADPRHL2 ADPRM *ADPRS ADRA1A ADRA1B ADRA1D *ADRA2A *ADRA2B ADRA2C *ADRB1 ADRB2 *ADRB3 ADRM1 *ADSL ADSS *ADSS1 ADSSL1 ADTRP *AEBP1 AEBP2 AEN AES AFAP1 AFAP1L1 AFAP1L2 AFDN AFF1 *AFF2 *AFF3 *AFF4 AFG1L *AFG2A *AFG2B *AFG3L2 AFM AFMID *AFP AFTPH *AGA AGAP1 AGAP2 AGAP3 AGAP4 AGAP5 AGAP6 AGAP9 *AGBL1 AGBL2 AGBL3 AGBL4 *AGBL5 AGER AGFG1 AGFG2 *AGGF1 *AGK *AGL AGMAT AGMO *AGO1 *AGO2 AGO3 AGO4 AGPAT1 *AGPAT2 AGPAT3 AGPAT4 AGPAT5 *AGPS *AGR2 AGR3 *AGRN *AGRP *AGT *AGTPBP1 *AGTR1 AGTR2 AGTRAP *AGXT *AGXT2 AHCTF1 *AHCY AHCYL1 AHCYL2 *AHDC1 *AHI1 AHNAK AHNAK2 *AHR AHRR AHSA1 *AHSG AHSP *AICDA AIDA AIF1 AIF1L *AIFM1 AIFM2 AIFM3 AIG1 AIM2 *AIMP1 *AIMP2 *AIP *AIPL1 *AIRE AJAP1 AJM1 AJUBA *AK1 *AK2 AK3 AK4 AK5 AK6 *AK7 AK8 *AK9 AKAIN1 AKAP1 AKAP10 AKAP11 AKAP12 AKAP13 AKAP14 AKAP17A AKAP2 *AKAP3 AKAP4 AKAP5 AKAP6 AKAP7 AKAP8 AKAP8L *AKAP9 AKIP1 AKIRIN1 AKIRIN2 AKNA AKNAD1 AKR1A1 AKR1B1 AKR1B10 AKR1B15 AKR1C1 *AKR1C2 AKR1C3 *AKR1C4 *AKR1D1 AKR1E2 AKR7A2 AKR7A3 AKR7L *AKT1 AKT1S1 *AKT2 *AKT3 AKTIP *ALAD ALAS1 *ALAS2 *ALB ALCAM ALDH16A1 *ALDH18A1 ALDH1A1 *ALDH1A2 *ALDH1A3 ALDH1B1 ALDH1L1 ALDH1L2 *ALDH2 ALDH3A1 *ALDH3A2 ALDH3B1 ALDH3B2 *ALDH4A1 *ALDH5A1 *ALDH6A1 *ALDH7A1 ALDH8A1 ALDH9A1 *ALDOA *ALDOB ALDOC *ALG1 ALG10 *ALG10B *ALG11 *ALG12 *ALG13 *ALG14 ALG1L ALG1L2 *ALG2 *ALG3 *ALG5 *ALG6 *ALG8 *ALG9 *ALK ALKAL1 ALKAL2 ALKBH1 ALKBH2 ALKBH3 ALKBH4 ALKBH5 ALKBH6 ALKBH7 *ALKBH8 ALLC *ALMS1 ALOX12 *ALOX12B ALOX15 ALOX15B *ALOX5 *ALOX5AP *ALOXE3 ALPG ALPI *ALPK1 ALPK2 *ALPK3 *ALPL ALPP *ALS2 ALS2CL ALS2CR12 *ALX1 *ALX3 *ALX4 ALYREF *AMACR *AMBN AMBP AMBRA1 AMD1 AMDHD1 AMDHD2 *AMELX AMELY *AMER1 AMER2 AMER3 *AMFR *AMH *AMHR2 AMIGO1 AMIGO2 AMIGO3 *AMMECR1 AMMECR1L *AMN AMN1 AMOT AMOTL1 AMOTL2 *AMPD1 *AMPD2 *AMPD3 AMPH *AMT *AMTN AMY1A AMY1B AMY1C AMY2A AMY2B AMZ1 AMZ2 *ANAPC1 ANAPC10 ANAPC11 ANAPC13 ANAPC15 ANAPC16 ANAPC2 ANAPC4 ANAPC5 *ANAPC7 *ANG ANGEL1 ANGEL2 *ANGPT1 *ANGPT2 ANGPT4 ANGPTL1 ANGPTL2 *ANGPTL3 ANGPTL4 ANGPTL5 *ANGPTL6 ANGPTL7 ANGPTL8 ANHX *ANK1 *ANK2 *ANK3 ANKAR ANKDD1A ANKDD1B ANKEF1 ANKFN1 *ANKFY1 *ANKH ANKHD1 ANKIB1 ANKK1 ANKLE1 *ANKLE2 ANKMY1 ANKMY2 ANKRA2 *ANKRD1 ANKRD10 *ANKRD11 ANKRD12 ANKRD13A ANKRD13B ANKRD13C ANKRD13D ANKRD16 *ANKRD17 ANKRD18A ANKRD18B ANKRD2 ANKRD20A1 ANKRD20A2 ANKRD20A3 ANKRD20A4 ANKRD22 ANKRD23 ANKRD24 *ANKRD26 ANKRD27 ANKRD28 ANKRD29 ANKRD30A ANKRD30B ANKRD30BL ANKRD31 ANKRD33 ANKRD33B ANKRD34A ANKRD34B ANKRD34C ANKRD35 ANKRD36 ANKRD36B ANKRD36C ANKRD37 ANKRD39 ANKRD40 ANKRD40CL ANKRD42 ANKRD44 ANKRD45 ANKRD46 ANKRD49 ANKRD50 ANKRD52 ANKRD53 ANKRD54 *ANKRD55 ANKRD6 ANKRD60 ANKRD61 ANKRD62 ANKRD63 ANKRD65 ANKRD66 ANKRD7 ANKRD9 ANKS1A ANKS1B ANKS3 ANKS4B *ANKS6 ANKUB1 ANKZF1 *ANLN *ANO1 *ANO10 ANO2 *ANO3 ANO4 *ANO5 *ANO6 ANO7 ANO8 ANO9 *ANOS1 ANP32A ANP32B ANP32D ANP32E ANPEP *ANTXR1 *ANTXR2 ANTXRL ANXA1 ANXA10 *ANXA11 ANXA13 ANXA2 ANXA2R ANXA3 ANXA4 *ANXA5 ANXA6 ANXA7 ANXA8 ANXA8L1 ANXA9 AOAH AOC1 AOC2 AOC3 *AOPEP AOX1 AP1AR *AP1B1 *AP1G1 AP1G2 AP1M1 AP1M2 *AP1S1 *AP1S2 *AP1S3 AP2A1 AP2A2 AP2B1 *AP2M1 *AP2S1 *AP3B1 *AP3B2 *AP3D1 AP3M1 AP3M2 AP3S1 AP3S2 *AP4B1 *AP4E1 *AP4M1 *AP4S1 AP5B1 AP5M1 AP5S1 *AP5Z1 APAF1 APBA1 APBA2 APBA3 APBB1 APBB1IP APBB2 APBB3 *APC *APC2 *APCDD1 APCDD1L APCS APEH APELA APEX1 APEX2 APH1A APH1B API5 APIP APLF APLN APLNR APLP1 APLP2 APMAP *APOA1 *APOA2 APOA4 *APOA5 *APOB APOBEC1 APOBEC2 APOBEC3A APOBEC3B APOBEC3C APOBEC3D APOBEC3F APOBEC3G APOBEC3H APOBEC4 APOBR APOC1 *APOC2 *APOC3 APOC4 APOD *APOE APOF APOH *APOL1 *APOL2 APOL3 *APOL4 APOL5 APOL6 *APOLD1 APOM APOO APOOL APOPT1 *APP APPBP2 *APPL1 APPL2 *APRT *APTX AQP1 AQP10 AQP11 AQP12A AQP12B *AQP2 AQP3 *AQP4 *AQP5 AQP6 AQP7 AQP8 AQP9 AQR *AR ARAF ARAP1 ARAP2 ARAP3 ARC *ARCN1 AREG AREL1 *ARF1 ARF3 ARF4 ARF5 ARF6 ARFGAP1 ARFGAP2 ARFGAP3 *ARFGEF1 *ARFGEF2 ARFGEF3 ARFIP1 ARFIP2 ARFRP1 *ARG1 ARG2 ARGFX ARGLU1 ARHGAP1 ARHGAP10 ARHGAP11A ARHGAP11B ARHGAP12 ARHGAP15 ARHGAP17 ARHGAP18 ARHGAP19 ARHGAP20 ARHGAP21 ARHGAP22 ARHGAP23 *ARHGAP24 ARHGAP25 *ARHGAP26 ARHGAP27 ARHGAP28 *ARHGAP29 ARHGAP30 *ARHGAP31 ARHGAP32 ARHGAP33 ARHGAP35 ARHGAP36 ARHGAP39 ARHGAP4 ARHGAP40 ARHGAP42 ARHGAP44 ARHGAP45 ARHGAP5 ARHGAP6 ARHGAP8 ARHGAP9 *ARHGDIA ARHGDIB ARHGDIG *ARHGEF1 *ARHGEF10 ARHGEF10L ARHGEF11 ARHGEF12 ARHGEF15 ARHGEF16 ARHGEF17 *ARHGEF18 ARHGEF19 *ARHGEF2 ARHGEF25 ARHGEF26 ARHGEF28 ARHGEF3 ARHGEF33 ARHGEF35 ARHGEF37 *ARHGEF38 ARHGEF39 ARHGEF4 ARHGEF40 ARHGEF5 ARHGEF6 ARHGEF7 *ARHGEF9 *ARID1A *ARID1B *ARID2 ARID3A ARID3B ARID3C ARID4A ARID4B ARID5A ARID5B ARIH1 ARIH2 ARIH2OS ARL1 ARL10 ARL11 ARL13A *ARL13B ARL14 ARL14EP ARL14EPL ARL15 ARL16 ARL17A ARL17B *ARL2 *ARL2BP *ARL3 ARL4A ARL4C ARL4D ARL5A ARL5B ARL5C *ARL6 *ARL6IP1 ARL6IP4 ARL6IP5 *ARL6IP6 ARL8A ARL8B ARL9 ARMC1 ARMC10 *ARMC12 *ARMC2 ARMC3 ARMC4 *ARMC5 ARMC6 ARMC7 ARMC8 *ARMC9 ARMCX1 ARMCX2 ARMCX3 ARMCX4 ARMCX5 ARMCX6 ARMH1 ARMH2 ARMH3 ARMH4 ARMS2 ARMT1 ARNT *ARNT2 ARNTL ARNTL2 ARPC1A *ARPC1B ARPC2 ARPC3 *ARPC4 *ARPC5 ARPC5L ARPIN ARPP19 ARPP21 *ARR3 ARRB1 ARRB2 ARRDC1 ARRDC2 ARRDC3 ARRDC4 ARRDC5 *ARSA *ARSB ARSD ARSE ARSF *ARSG ARSH *ARSI ARSJ *ARSK *ARSL ART1 ART3 ART4 ART5 ARTN *ARV1 *ARVCF *ARX AS3MT *ASAH1 ASAH2 ASAH2B ASAP1 ASAP2 ASAP3 ASB1 *ASB10 ASB11 ASB12 ASB13 ASB14 ASB15 ASB16 ASB17 ASB18 ASB2 ASB3 ASB4 ASB5 ASB6 ASB7 ASB8 ASB9 *ASCC1 ASCC2 *ASCC3 *ASCL1 ASCL2 ASCL3 ASCL4 ASCL5 ASDURF ASF1A ASF1B ASGR1 ASGR2 *ASH1L ASH2L ASIC1 ASIC2 ASIC3 ASIC4 ASIC5 ASIP *ASL ASMT ASMTL ASNA1 *ASNS ASNSD1 *ASPA ASPDH ASPG *ASPH ASPHD1 ASPHD2 *ASPM *ASPN *ASPRV1 *ASPSCR1 ASRGL1 *ASS1 ASTE1 *ASTL ASTN1 ASTN2 *ASXL1 *ASXL2 *ASXL3 ASZ1 *ATAD1 ATAD2 ATAD2B *ATAD3A ATAD3B ATAD3C ATAD5 ATAT1 *ATCAY ATE1 ATF1 ATF2 ATF3 ATF4 ATF5 *ATF6 ATF6B ATF7 ATF7IP ATF7IP2 ATG10 ATG101 ATG12 ATG13 ATG14 ATG16L1 ATG16L2 ATG2A ATG2B ATG3 ATG4A ATG4B ATG4C ATG4D *ATG5 *ATG7 ATG9A ATG9B *ATIC *ATL1 ATL2 *ATL3 *ATM ATMIN *ATN1 *ATOH1 *ATOH7 ATOH8 ATOX1 *ATP10A ATP10B ATP10D *ATP11A ATP11B *ATP11C ATP12A ATP13A1 *ATP13A2 *ATP13A3 ATP13A4 ATP13A5 *ATP1A1 *ATP1A2 *ATP1A3 ATP1A4 *ATP1B1 ATP1B2 ATP1B3 ATP1B4 ATP23 *ATP2A1 *ATP2A2 ATP2A3 *ATP2B1 *ATP2B2 *ATP2B3 ATP2B4 *ATP2C1 ATP2C2 ATP4A ATP4B *ATP5F1A *ATP5F1B ATP5F1C *ATP5F1D *ATP5F1E ATP5IF1 ATP5MC1 ATP5MC2 *ATP5MC3 ATP5MD ATP5ME ATP5MF ATP5MG ATP5MGL *ATP5MK ATP5MPL ATP5PB ATP5PD ATP5PF *ATP5PO *ATP6AP1 ATP6AP1L *ATP6AP2 *ATP6V0A1 *ATP6V0A2 *ATP6V0A4 ATP6V0B *ATP6V0C ATP6V0D1 ATP6V0D2 ATP6V0E1 ATP6V0E2 *ATP6V1A *ATP6V1B1 *ATP6V1B2 ATP6V1C1 ATP6V1C2 ATP6V1D *ATP6V1E1 ATP6V1E2 ATP6V1F ATP6V1FNB ATP6V1G1 ATP6V1G2 ATP6V1G3 ATP6V1H *ATP7A *ATP7B ATP8A1 *ATP8A2 *ATP8B1 ATP8B2 ATP8B3 ATP8B4 *ATP9A ATP9B ATPAF1 *ATPAF2 *ATR ATRAID *ATRIP ATRN ATRNL1 *ATRX *ATXN1 *ATXN10 ATXN1L *ATXN2 ATXN2L *ATXN3 ATXN3L *ATXN7 ATXN7L1 ATXN7L2 ATXN7L3 ATXN7L3B *ATXN8 *ATXN8OS *AUH AUNIP AUP1 *AURKA AURKAIP1 AURKB *AURKC *AUTS2 AVEN *AVIL AVL9 *AVP AVPI1 AVPR1A AVPR1B *AVPR2 AWAT1 AWAT2 AXDND1 *AXIN1 *AXIN2 *AXL AZGP1 AZI2 AZIN1 AZIN2 AZU1 *B2M B3GALNT1 *B3GALNT2 B3GALT1 B3GALT2 B3GALT4 B3GALT5 *B3GALT6 B3GAT1 B3GAT2 *B3GAT3 *B3GLCT B3GNT2 B3GNT3 B3GNT4 B3GNT5 B3GNT6 B3GNT7 B3GNT8 B3GNT9 B3GNTL1 *B4GALNT1 B4GALNT2 B4GALNT3 B4GALNT4 *B4GALT1 B4GALT2 B4GALT3 B4GALT4 B4GALT5 B4GALT6 *B4GALT7 *B4GAT1 *B9D1 *B9D2 BAALC *BAAT BABAM1 BABAM2 BACE1 BACE2 BACH1 *BACH2 BAD BAG1 BAG2 *BAG3 BAG4 *BAG5 BAG6 BAGE BAGE3 BAGE4 BAHCC1 BAHD1 BAIAP2 BAIAP2L1 BAIAP2L2 BAIAP3 BAK1 BAMBI *BANF1 BANF2 *BANK1 BANP *BAP1 *BARD1 BARHL1 BARHL2 BARX1 BARX2 BASP1 BATF BATF2 BATF3 *BAX BAZ1A *BAZ1B BAZ2A BAZ2B BBC3 *BBIP1 BBOF1 BBOX1 *BBS1 *BBS10 *BBS12 *BBS2 *BBS4 *BBS5 *BBS7 *BBS9 BBX BCAM BCAN BCAP29 *BCAP31 BCAR1 BCAR3 BCAS1 BCAS2 *BCAS3 BCAS4 BCAT1 *BCAT2 BCCIP BCDIN3D *BCHE *BCKDHA *BCKDHB *BCKDK *BCL10 *BCL11A *BCL11B *BCL2 BCL2A1 BCL2L1 BCL2L10 BCL2L11 BCL2L12 BCL2L13 BCL2L14 BCL2L15 BCL2L2 BCL3 *BCL6 BCL6B BCL7A BCL7B BCL7C BCL9 BCL9L BCLAF1 BCLAF3 *BCO1 BCO2 *BCOR *BCORL1 *BCR *BCS1L BDH1 BDH2 BDKRB1 BDKRB2 *BDNF *BDP1 *BEAN1 BECN1 BECN2 BEGAIN BEND2 BEND3 BEND4 BEND5 BEND6 BEND7 *BEST1 BEST2 BEST3 BEST4 *BET1 BET1L BEX1 BEX2 BEX3 BEX4 BEX5 BFAR *BFSP1 *BFSP2 BGLAP *BGN BHLHA15 *BHLHA9 BHLHB9 BHLHE22 BHLHE23 BHLHE40 BHLHE41 BHMG1 BHMT BHMT2 *BICC1 BICD1 *BICD2 BICDL1 BICDL2 *BICRA BICRAL BID BIK *BIN1 BIN2 BIN3 BIRC2 *BIRC3 BIRC5 BIRC6 BIRC7 BIRC8 BIVM BLCAP BLID *BLK *BLM BLMH *BLNK BLOC1S1 BLOC1S2 *BLOC1S3 BLOC1S4 *BLOC1S5 *BLOC1S6 *BLTP1 *BLVRA BLVRB BLZF1 BMF BMI1 *BMP1 BMP10 *BMP15 *BMP2 BMP2K BMP3 *BMP4 BMP5 *BMP6 BMP7 BMP8A BMP8B *BMPER *BMPR1A *BMPR1B *BMPR2 *BMS1 BMT2 BMX *BNC1 *BNC2 BNIP1 BNIP2 BNIP3 BNIP3L BNIPL BOC BOD1 BOD1L1 BOD1L2 BOK BOLA1 BOLA2 BOLA2B *BOLA3 BOLL BOP1 BORA BORCS5 BORCS6 BORCS7 BORCS8 *BPGM BPHL BPI BPIFA1 BPIFA2 BPIFA3 BPIFB1 BPIFB2 BPIFB3 BPIFB4 BPIFB6 BPIFC BPNT1 *BPNT2 *BPTF *BPY2 BPY2B BPY2C *BRAF BRAP *BRAT1 *BRCA1 *BRCA2 *BRCC3 BRD1 BRD2 BRD3 BRD3OS *BRD4 BRD7 BRD8 BRD9 *BRDT *BRF1 BRF2 BRI3 BRI3BP BRICD5 BRINP1 BRINP2 BRINP3 *BRIP1 BRIX1 BRK1 BRMS1 BRMS1L BROX *BRPF1 BRPF3 BRS3 BRSK1 BRSK2 *BRWD1 *BRWD3 *BSCL2 BSDC1 BSG BSN *BSND BSPH1 BSPRY BST1 BST2 BSX BTAF1 BTBD1 BTBD10 BTBD11 BTBD16 BTBD17 BTBD18 BTBD19 BTBD2 BTBD3 BTBD6 BTBD7 BTBD8 BTBD9 BTC *BTD BTF3 BTF3L4 BTG1 BTG2 BTG3 *BTG4 *BTK BTLA BTN1A1 BTN2A1 BTN2A2 BTN3A1 BTN3A2 BTN3A3 *BTNL2 BTNL3 BTNL8 BTNL9 *BTRC *BUB1 *BUB1B *BUB3 BUD13 *BUD23 BUD31 BVES BYSL BZW1 BZW2 C10ORF105 C10ORF113 C10ORF120 C10ORF126 C10ORF142 C10ORF143 C10ORF53 C10ORF55 C10ORF62 C10ORF67 C10ORF71 C10ORF82 C10ORF88 C10ORF90 C10ORF95 C10ORF99 C11ORF1 C11ORF16 C11ORF21 C11ORF24 C11ORF40 C11ORF42 C11ORF45 C11ORF49 C11ORF52 C11ORF53 C11ORF54 C11ORF58 C11ORF65 C11ORF68 C11ORF71 C11ORF74 C11ORF80 C11ORF86 C11ORF87 C11ORF88 C11ORF91 C11ORF94 C11ORF95 C11ORF96 C11ORF97 C11ORF98 C12ORF10 C12ORF29 C12ORF4 C12ORF40 C12ORF42 C12ORF43 C12ORF45 C12ORF49 C12ORF50 C12ORF54 C12ORF56 *C12ORF57 C12ORF60 C12ORF65 C12ORF66 C12ORF71 C12ORF73 C12ORF74 C12ORF75 C12ORF76 C12ORF81 C13ORF42 C13ORF46 C14ORF119 C14ORF132 C14ORF177 C14ORF178 C14ORF180 C14ORF28 *C14ORF39 C14ORF93 C15ORF39 C15ORF40 C15ORF41 C15ORF48 C15ORF61 C15ORF62 C15ORF65 C16ORF45 C16ORF46 C16ORF54 C16ORF58 C16ORF70 C16ORF71 C16ORF72 C16ORF74 C16ORF78 C16ORF82 C16ORF86 C16ORF87 C16ORF89 C16ORF90 C16ORF91 C16ORF92 C16ORF95 C16ORF96 C17ORF100 C17ORF107 C17ORF113 C17ORF47 C17ORF49 C17ORF50 C17ORF51 C17ORF53 C17ORF58 C17ORF64 C17ORF67 C17ORF75 C17ORF78 C17ORF80 C17ORF97 C17ORF98 C17ORF99 C18ORF21 C18ORF25 *C18ORF32 C18ORF54 C18ORF63 *C19ORF12 C19ORF18 C19ORF24 C19ORF25 C19ORF33 C19ORF38 C19ORF44 C19ORF47 C19ORF48 C19ORF53 C19ORF54 C19ORF57 C19ORF66 C19ORF67 C19ORF70 C19ORF71 C19ORF73 C19ORF81 C19ORF84 C19ORF85 C1D C1GALT1 *C1GALT1C1 C1GALT1C1L C1ORF100 C1ORF105 C1ORF109 C1ORF112 C1ORF115 C1ORF116 C1ORF122 C1ORF123 C1ORF127 C1ORF131 C1ORF141 C1ORF146 C1ORF158 C1ORF159 C1ORF162 C1ORF167 C1ORF174 C1ORF185 C1ORF189 C1ORF194 C1ORF198 C1ORF21 C1ORF210 C1ORF216 C1ORF226 C1ORF232 C1ORF35 C1ORF43 C1ORF50 C1ORF52 C1ORF53 C1ORF54 C1ORF56 C1ORF61 C1ORF68 C1ORF74 C1ORF87 C1ORF94 *C1QA *C1QB *C1QBP *C1QC C1QL1 C1QL2 C1QL3 C1QL4 C1QTNF1 C1QTNF12 C1QTNF2 C1QTNF3 C1QTNF4 *C1QTNF5 C1QTNF6 C1QTNF7 C1QTNF8 C1QTNF9 C1QTNF9B *C1R C1RL *C1S *C2 C20ORF141 C20ORF144 C20ORF173 C20ORF194 C20ORF202 C20ORF203 C20ORF204 C20ORF27 C20ORF85 C20ORF96 C21ORF58 C21ORF62 C21ORF91 C22ORF15 C22ORF23 C22ORF31 C22ORF39 C22ORF42 C22ORF46 C2CD2 C2CD2L *C2CD3 C2CD4A C2CD4B C2CD4C C2CD4D C2CD5 *C2CD6 C2ORF15 C2ORF16 C2ORF40 C2ORF42 C2ORF49 C2ORF50 C2ORF66 C2ORF68 *C2ORF69 C2ORF70 C2ORF72 C2ORF73 C2ORF74 C2ORF76 C2ORF78 C2ORF80 C2ORF81 C2ORF83 C2ORF88 C2ORF91 C2ORF92 *C3 C3AR1 C3ORF14 C3ORF18 C3ORF20 C3ORF22 C3ORF30 C3ORF33 C3ORF35 C3ORF36 C3ORF38 C3ORF49 *C3ORF52 C3ORF56 C3ORF58 C3ORF62 C3ORF67 C3ORF70 C3ORF80 C3ORF84 C3ORF85 *C4A *C4B C4BPA C4BPB C4ORF17 C4ORF19 C4ORF3 C4ORF33 C4ORF36 C4ORF45 C4ORF46 C4ORF47 C4ORF48 C4ORF50 C4ORF51 C4ORF54 *C5 C5AR1 C5AR2 C5ORF15 C5ORF22 C5ORF24 C5ORF30 C5ORF34 C5ORF38 C5ORF46 C5ORF47 C5ORF49 C5ORF51 C5ORF52 C5ORF56 C5ORF58 C5ORF60 C5ORF63 C5ORF67 *C6 C6ORF106 C6ORF118 C6ORF120 C6ORF132 C6ORF136 C6ORF141 C6ORF15 C6ORF163 C6ORF201 C6ORF203 C6ORF222 C6ORF223 C6ORF226 C6ORF47 C6ORF48 C6ORF52 C6ORF58 C6ORF62 C6ORF89 *C7 C7ORF25 C7ORF26 C7ORF31 C7ORF33 C7ORF43 C7ORF50 C7ORF57 C7ORF61 C7ORF77 *C8A *C8B C8G C8ORF33 C8ORF34 C8ORF37 C8ORF44 C8ORF48 C8ORF58 C8ORF59 C8ORF74 C8ORF76 C8ORF82 C8ORF86 C8ORF88 C8ORF89 *C9 C9ORF116 C9ORF129 C9ORF131 C9ORF135 C9ORF152 C9ORF153 C9ORF16 C9ORF24 C9ORF3 C9ORF40 C9ORF43 C9ORF47 C9ORF50 C9ORF57 C9ORF64 C9ORF66 *C9ORF72 C9ORF78 C9ORF84 C9ORF85 C9ORF92 CA1 CA10 CA11 *CA12 CA13 CA14 *CA2 CA3 *CA4 *CA5A CA5B CA6 CA7 *CA8 CA9 CAAP1 CAB39 CAB39L CABCOCO1 CABIN1 CABLES1 CABLES2 CABP1 *CABP2 *CABP4 CABP5 CABP7 CABS1 CABYR CACFD1 CACHD1 *CACNA1A *CACNA1B *CACNA1C *CACNA1D *CACNA1E *CACNA1F *CACNA1G *CACNA1H *CACNA1I *CACNA1S *CACNA2D1 *CACNA2D2 CACNA2D3 *CACNA2D4 CACNB1 *CACNB2 CACNB3 *CACNB4 CACNG1 *CACNG2 CACNG3 CACNG4 CACNG5 CACNG6 CACNG7 CACNG8 CACTIN CACUL1 CACYBP *CAD CADM1 CADM2 *CADM3 CADM4 CADPS CADPS2 CAGE1 CALB1 CALB2 CALCA CALCB CALCOCO1 CALCOCO2 *CALCR *CALCRL CALD1 CALHM1 CALHM2 CALHM3 CALHM4 CALHM5 CALHM6 *CALM1 *CALM2 *CALM3 CALML3 CALML4 CALML5 CALML6 CALN1 *CALR CALR3 CALU CALY CAMK1 CAMK1D CAMK1G *CAMK2A *CAMK2B CAMK2D *CAMK2G CAMK2N1 CAMK2N2 CAMK4 CAMKK1 CAMKK2 *CAMKMT CAMKV *CAMLG CAMP *CAMSAP1 CAMSAP2 CAMSAP3 *CAMTA1 CAMTA2 CAND1 CAND2 *CANT1 CANX CAP1 *CAP2 CAPG *CAPN1 CAPN10 CAPN11 CAPN12 CAPN13 CAPN14 *CAPN15 CAPN2 *CAPN3 *CAPN5 CAPN6 CAPN7 CAPN8 CAPN9 *CAPNS1 CAPNS2 *CAPRIN1 CAPRIN2 CAPS CAPS2 CAPSL CAPZA1 CAPZA2 CAPZA3 CAPZB *CARD10 *CARD11 *CARD14 CARD16 CARD17 CARD18 CARD19 CARD6 *CARD8 *CARD9 CARF CARHSP1 CARM1 CARMIL1 *CARMIL2 CARMIL3 CARNMT1 CARNS1 CARS *CARS1 *CARS2 *CARTPT CASC1 CASC10 CASC3 CASC4 CASD1 *CASK CASKIN1 CASKIN2 CASP1 *CASP10 CASP12 *CASP14 *CASP2 CASP3 CASP4 CASP5 CASP6 CASP7 *CASP8 CASP8AP2 CASP9 *CASQ1 *CASQ2 *CASR CASS4 *CAST CASTOR1 CASTOR2 CASTOR3 *CASZ1 *CAT *CATIP *CATSPER1 *CATSPER2 CATSPER3 CATSPER4 CATSPERB CATSPERD CATSPERE CATSPERG CATSPERZ *CAV1 CAV2 *CAV3 *CAVIN1 CAVIN2 CAVIN3 CAVIN4 CBARP CBFA2T2 CBFA2T3 *CBFB *CBL *CBLB CBLC *CBLIF CBLL1 CBLL2 CBLN1 CBLN2 CBLN3 CBLN4 CBR1 CBR3 CBR4 *CBS CBSL CBWD1 CBWD2 CBWD3 CBWD5 CBWD6 CBX1 *CBX2 CBX3 CBX4 CBX5 CBX6 CBX7 CBX8 *CBY1 CBY3 *CC2D1A CC2D1B *CC2D2A CC2D2B CCAR1 CCAR2 *CCBE1 CCDC102A CCDC102B CCDC103 CCDC105 CCDC106 CCDC107 CCDC110 CCDC112 CCDC113 CCDC114 *CCDC115 CCDC116 CCDC117 CCDC12 CCDC120 CCDC121 CCDC122 CCDC124 CCDC125 CCDC126 CCDC127 CCDC13 CCDC130 *CCDC134 CCDC136 CCDC137 CCDC138 CCDC14 CCDC140 *CCDC141 CCDC142 CCDC144A CCDC144NL *CCDC146 CCDC148 CCDC149 CCDC15 CCDC150 CCDC151 CCDC152 CCDC153 CCDC154 CCDC155 CCDC157 CCDC158 CCDC159 CCDC160 CCDC163 CCDC166 CCDC167 CCDC168 CCDC169 CCDC17 CCDC170 CCDC171 CCDC172 CCDC173 *CCDC174 CCDC175 CCDC177 CCDC178 CCDC179 CCDC18 CCDC180 CCDC181 CCDC182 CCDC183 CCDC184 CCDC185 CCDC186 CCDC187 CCDC188 CCDC189 CCDC190 CCDC191 CCDC192 CCDC194 CCDC195 CCDC196 CCDC197 CCDC198 *CCDC22 CCDC24 CCDC25 CCDC27 CCDC28A *CCDC28B CCDC3 CCDC30 *CCDC32 CCDC33 *CCDC34 CCDC36 CCDC38 *CCDC39 *CCDC40 CCDC42 CCDC43 *CCDC47 *CCDC50 CCDC51 CCDC54 CCDC57 CCDC58 CCDC59 CCDC6 CCDC60 CCDC61 *CCDC62 CCDC63 *CCDC65 CCDC66 CCDC68 CCDC69 CCDC7 CCDC70 CCDC71 CCDC71L CCDC73 CCDC74A CCDC74B CCDC77 *CCDC78 *CCDC8 CCDC80 CCDC81 CCDC82 CCDC83 CCDC84 CCDC85A CCDC85B CCDC85C CCDC86 CCDC87 *CCDC88A CCDC88B *CCDC88C CCDC89 CCDC9 CCDC90B CCDC91 CCDC92 CCDC93 CCDC96 CCDC97 CCDC9B CCER1 CCER2 CCHCR1 *CCIN CCK CCKAR CCKBR CCL1 *CCL11 CCL13 CCL14 CCL15 CCL16 CCL17 CCL18 CCL19 *CCL2 CCL20 CCL21 CCL22 CCL23 CCL24 CCL25 CCL26 CCL27 CCL28 CCL3 CCL3L3 CCL4 CCL4L2 CCL5 CCL7 CCL8 *CCM2 CCM2L *CCN2 *CCN6 CCNA1 CCNA2 CCNB1 CCNB1IP1 CCNB2 CCNB3 CCNC *CCND1 *CCND2 CCND3 CCNDBP1 CCNE1 CCNE2 *CCNF CCNG1 CCNG2 CCNH CCNI CCNI2 CCNJ CCNJL *CCNK CCNL1 CCNL2 *CCNO *CCNQ CCNT1 CCNT2 CCNY CCNYL1 CCP110 CCPG1 *CCR1 CCR10 *CCR2 CCR3 CCR4 CCR5 *CCR6 CCR7 CCR8 CCR9 CCRL2 CCS CCSAP CCSER1 CCSER2 CCT2 CCT3 CCT4 *CCT5 CCT6A CCT6B CCT7 CCT8 CCT8L2 CCZ1 CCZ1B CD101 *CD109 CD14 *CD151 CD160 CD163 CD163L1 *CD164 CD164L2 CD177 CD180 *CD19 CD1A CD1B CD1C CD1D CD1E CD2 CD200 CD200R1 CD200R1L CD207 CD209 CD22 CD226 CD24 *CD244 *CD247 CD248 *CD27 CD274 CD276 *CD28 *CD2AP CD2BP2 CD300A CD300C CD300E CD300H CD300LB CD300LD CD300LF CD300LG CD302 *CD320 CD33 CD34 *CD36 CD37 CD38 *CD3D *CD3E CD3EAP *CD3G *CD4 *CD40 *CD40LG CD44 *CD46 CD47 CD48 CD5 CD52 CD53 *CD55 CD58 *CD59 CD5L CD6 CD63 CD68 CD69 CD7 *CD70 CD72 CD74 *CD79A *CD79B CD80 *CD81 CD82 CD83 CD84 CD86 *CD8A CD8B CD9 CD93 *CD96 CD99 CD99L2 CDA CDADC1 *CDAN1 CDC123 *CDC14A CDC14B CDC14C CDC16 *CDC20 CDC20B CDC23 CDC25A CDC25B CDC25C CDC26 CDC27 CDC34 CDC37 CDC37L1 *CDC40 *CDC42 CDC42BPA *CDC42BPB CDC42BPG CDC42EP1 CDC42EP2 CDC42EP3 CDC42EP4 CDC42EP5 CDC42SE1 CDC42SE2 *CDC45 CDC5L *CDC6 CDC7 *CDC73 CDCA2 CDCA3 CDCA4 CDCA5 *CDCA7 CDCA7L CDCA8 CDCP1 CDCP2 *CDH1 CDH10 *CDH11 CDH12 CDH13 *CDH15 CDH16 CDH17 CDH18 CDH19 *CDH2 CDH20 CDH22 *CDH23 CDH24 CDH26 *CDH3 CDH4 CDH5 CDH6 CDH7 CDH8 CDH9 *CDHR1 CDHR2 CDHR3 CDHR4 CDHR5 *CDIN1 CDIP1 CDIPT CDK1 *CDK10 CDK11A CDK11B CDK12 *CDK13 CDK14 CDK15 CDK16 CDK17 CDK18 *CDK19 CDK2 CDK20 CDK2AP1 CDK2AP2 CDK3 *CDK4 *CDK5 CDK5R1 CDK5R2 CDK5RAP1 *CDK5RAP2 CDK5RAP3 *CDK6 CDK7 *CDK8 CDK9 CDKAL1 CDKL1 CDKL2 CDKL3 CDKL4 *CDKL5 *CDKN1A *CDKN1B *CDKN1C *CDKN2A CDKN2AIP CDKN2AIPNL *CDKN2B *CDKN2C CDKN2D CDKN3 CDNF CDO1 *CDON CDPF1 CDR1 CDR2 CDR2L CDRT1 CDRT15 CDRT15L2 CDRT4 CDS1 CDS2 *CDSN *CDT1 CDV3 CDX1 CDX2 CDX4 *CDY1 CDY1B *CDY2A CDY2B CDYL CDYL2 CEACAM1 *CEACAM16 CEACAM18 CEACAM19 CEACAM20 CEACAM21 *CEACAM3 CEACAM4 CEACAM5 *CEACAM6 CEACAM7 CEACAM8 *CEBPA CEBPB CEBPD *CEBPE CEBPG CEBPZ CEBPZOS CECR2 *CEL CELA1 *CELA2A CELA2B CELA3A CELA3B CELF1 *CELF2 CELF3 CELF4 CELF5 CELF6 *CELSR1 CELSR2 CELSR3 CEMIP CEMIP2 CEMP1 *CENATAC CEND1 CENPA CENPB CENPBD1 CENPC *CENPE *CENPF CENPH CENPI CENPJ CENPK CENPL CENPM CENPN CENPO CENPP CENPQ CENPS *CENPT CENPU CENPV CENPVL1 CENPVL3 CENPW CENPX *CEP104 *CEP112 *CEP120 *CEP126 CEP128 CEP131 *CEP135 *CEP152 CEP162 *CEP164 CEP170 CEP170B *CEP19 CEP192 *CEP250 *CEP290 *CEP295 CEP295NL CEP350 *CEP41 CEP44 *CEP55 *CEP57 CEP57L1 *CEP63 CEP68 CEP70 CEP72 CEP76 *CEP78 *CEP83 CEP85 *CEP85L CEP89 CEP95 CEP97 CEPT1 CER1 CERCAM CERK *CERKL *CERS1 CERS2 *CERS3 CERS4 CERS5 CERS6 *CERT1 *CES1 CES2 CES3 CES4A CES5A CETN1 CETN2 CETN3 *CETP CFAP100 CFAP126 CFAP157 CFAP161 CFAP20 CFAP206 *CFAP221 *CFAP251 *CFAP298 CFAP299 *CFAP300 CFAP36 *CFAP410 *CFAP418 *CFAP43 *CFAP44 *CFAP45 CFAP46 *CFAP47 *CFAP52 *CFAP53 CFAP54 CFAP57 *CFAP58 *CFAP61 *CFAP65 *CFAP69 *CFAP70 CFAP73 *CFAP74 CFAP77 *CFAP91 CFAP97 CFAP97D1 CFAP97D2 CFAP99 *CFB *CFC1 CFC1B *CFD CFDP1 *CFH *CFHR1 CFHR2 *CFHR3 CFHR4 *CFHR5 *CFI CFL1 *CFL2 CFLAR *CFP *CFTR CGA CGAS CGB1 CGB2 CGB3 CGB5 CGB7 CGB8 CGGBP1 CGN CGNL1 CGREF1 CGRRF1 CH25H CHAC1 CHAC2 CHAD CHADL CHAF1A CHAF1B *CHAMP1 *CHAT CHCHD1 *CHCHD10 *CHCHD2 CHCHD3 CHCHD4 CHCHD5 CHCHD6 CHCHD7 *CHD1 CHD1L *CHD2 *CHD3 *CHD4 *CHD5 *CHD6 *CHD7 *CHD8 CHD9 CHDH *CHEK1 *CHEK2 CHERP CHFR CHGA CHGB *CHI3L1 CHI3L2 CHIA CHIC1 *CHIC2 CHID1 CHIT1 *CHKA *CHKB CHL1 *CHM CHML *CHMP1A CHMP1B CHMP2A *CHMP2B CHMP3 CHMP4A *CHMP4B CHMP4C CHMP5 CHMP6 CHMP7 *CHN1 CHN2 CHODL CHORDC1 *CHP1 CHP2 CHPF CHPF2 CHPT1 CHRAC1 CHRD *CHRDL1 CHRDL2 CHRFAM7A CHRM1 CHRM2 *CHRM3 CHRM4 CHRM5 *CHRNA1 CHRNA10 *CHRNA2 *CHRNA3 *CHRNA4 CHRNA5 CHRNA6 *CHRNA7 CHRNA9 *CHRNB1 *CHRNB2 CHRNB3 CHRNB4 *CHRND *CHRNE *CHRNG CHST1 CHST10 *CHST11 CHST12 CHST13 *CHST14 CHST15 CHST2 *CHST3 CHST4 CHST5 *CHST6 CHST7 CHST8 CHST9 *CHSY1 CHSY3 CHTF18 CHTF8 CHTOP *CHUK CHURC1 CIAO1 CIAO2A CIAO2B CIAO3 CIAPIN1 CIART *CIB1 *CIB2 CIB3 CIB4 *CIBAR1 *CIC CIDEA CIDEB *CIDEC *CIITA *CILK1 CILP CILP2 CINP CIP2A CIPC CIR1 CIRBP *CIROP CISD1 *CISD2 CISD3 CISH *CIT CITED1 *CITED2 CITED4 *CIZ1 CKAP2 *CKAP2L CKAP4 CKAP5 CKB CKLF CKM CKMT1A CKMT1B CKMT2 CKS1B CKS2 CLASP1 CLASP2 CLASRP CLBA1 CLC CLCA1 CLCA2 *CLCA4 *CLCC1 *CLCF1 *CLCN1 *CLCN2 *CLCN3 *CLCN4 *CLCN5 *CLCN6 *CLCN7 *CLCNKA *CLCNKB *CLDN1 *CLDN10 *CLDN11 CLDN12 *CLDN14 CLDN15 *CLDN16 CLDN17 CLDN18 *CLDN19 *CLDN2 CLDN20 CLDN22 CLDN23 CLDN24 CLDN25 CLDN3 CLDN34 CLDN4 CLDN5 CLDN6 CLDN7 CLDN8 *CLDN9 CLDND1 CLDND2 CLEC10A CLEC11A CLEC12A CLEC12B CLEC14A CLEC16A CLEC17A CLEC18A CLEC18B CLEC18C CLEC19A CLEC1A CLEC1B CLEC20A CLEC2A CLEC2B CLEC2D CLEC2L CLEC3A *CLEC3B CLEC4A CLEC4C CLEC4D CLEC4E CLEC4F CLEC4G CLEC4M CLEC5A CLEC6A *CLEC7A CLEC9A CLECL1 CLGN CLHC1 CLIC1 *CLIC2 CLIC3 CLIC4 *CLIC5 CLIC6 CLINT1 CLIP1 *CLIP2 CLIP3 CLIP4 CLK1 CLK2 CLK3 CLK4 CLLU1OS CLMN *CLMP *CLN3 *CLN5 *CLN6 *CLN8 CLNK CLNS1A CLOCK *CLP1 *CLPB *CLPP CLPS CLPSL1 CLPSL2 CLPTM1 CLPTM1L *CLPX *CLRN1 *CLRN2 CLRN3 CLSPN CLSTN1 CLSTN2 CLSTN3 CLTA CLTB *CLTC *CLTCL1 *CLTRN CLU CLUAP1 CLUH CLUL1 CLVS1 CLVS2 *CLXN CLYBL CMA1 CMAS CMBL CMC1 CMC2 CMC4 CMIP CMKLR1 CMPK1 *CMPK2 CMSS1 CMTM1 CMTM2 CMTM3 CMTM4 CMTM5 CMTM6 CMTM7 CMTM8 CMTR1 CMTR2 CMYA5 CNBD1 CNBD2 *CNBP CNDP1 CNDP2 CNEP1R1 CNFN *CNGA1 CNGA2 *CNGA3 CNGA4 *CNGB1 *CNGB3 CNIH1 CNIH2 CNIH3 CNIH4 CNKSR1 *CNKSR2 CNKSR3 CNMD CNN1 CNN2 CNN3 CNNM1 *CNNM2 CNNM3 *CNNM4 *CNOT1 CNOT10 CNOT11 *CNOT2 *CNOT3 CNOT4 CNOT6 CNOT6L CNOT7 CNOT8 CNOT9 *CNP CNPPD1 CNPY1 CNPY2 *CNPY3 CNPY4 CNR1 CNR2 CNRIP1 CNST CNTD1 CNTD2 CNTF CNTFR CNTLN *CNTN1 *CNTN2 CNTN3 CNTN4 CNTN5 CNTN6 *CNTNAP1 *CNTNAP2 CNTNAP3 CNTNAP3B CNTNAP3C CNTNAP4 CNTNAP5 CNTRL CNTROB COA1 *COA3 COA4 *COA5 *COA6 *COA7 *COA8 *COASY COBL *COBLL1 *COCH *COG1 *COG2 *COG3 *COG4 *COG5 *COG6 *COG7 *COG8 COIL *COL10A1 *COL11A1 *COL11A2 *COL12A1 *COL13A1 *COL14A1 COL15A1 COL16A1 *COL17A1 *COL18A1 COL19A1 *COL1A1 *COL1A2 COL20A1 COL21A1 COL22A1 COL23A1 COL24A1 *COL25A1 COL26A1 *COL27A1 COL28A1 *COL2A1 *COL3A1 *COL4A1 *COL4A2 *COL4A3 COL4A3BP *COL4A4 *COL4A5 *COL4A6 *COL5A1 *COL5A2 COL5A3 *COL6A1 *COL6A2 *COL6A3 COL6A5 COL6A6 *COL7A1 COL8A1 *COL8A2 *COL9A1 *COL9A2 *COL9A3 COLCA2 *COLEC10 *COLEC11 COLEC12 *COLGALT1 COLGALT2 *COLQ COMMD1 COMMD10 COMMD2 COMMD3 COMMD4 COMMD5 COMMD6 COMMD7 COMMD8 COMMD9 *COMP *COMT COMTD1 COP1 *COPA *COPB1 *COPB2 COPE COPG1 COPG2 COPRS COPS2 COPS3 COPS4 COPS5 COPS6 COPS7A COPS7B COPS8 COPS9 COPZ1 COPZ2 COQ10A COQ10B *COQ2 COQ3 *COQ4 *COQ5 *COQ6 *COQ7 *COQ8A *COQ8B *COQ9 *CORIN *CORO1A CORO1B CORO1C CORO2A CORO2B CORO6 CORO7 CORT COTL1 *COX10 *COX11 *COX14 *COX15 *COX16 COX17 COX18 COX19 *COX20 *COX4I1 *COX4I2 *COX5A COX5B *COX6A1 *COX6A2 *COX6B1 COX6B2 COX6C COX7A1 COX7A2 COX7A2L *COX7B COX7B2 COX7C *COX8A COX8C *CP *CPA1 CPA2 CPA3 CPA4 CPA5 *CPA6 *CPAMD8 *CPAP CPB1 CPB2 CPD *CPE CPEB1 CPEB2 CPEB3 CPEB4 CPED1 *CPLANE1 CPLANE2 *CPLX1 CPLX2 CPLX3 CPLX4 CPM *CPN1 CPN2 CPNE1 CPNE2 CPNE3 CPNE4 CPNE5 CPNE6 CPNE7 CPNE8 CPNE9 CPO *CPOX CPPED1 CPQ *CPS1 *CPSF1 CPSF2 *CPSF3 CPSF4 CPSF4L CPSF6 CPSF7 *CPT1A CPT1B *CPT1C *CPT2 CPTP CPVL CPXCR1 CPXM1 CPXM2 CPZ CR1 CR1L *CR2 CRABP1 CRABP2 CRACR2A CRACR2B *CRADD CRAMP1 *CRAT *CRB1 *CRB2 CRB3 *CRBN CRCP CRCT1 *CREB1 CREB3 *CREB3L1 CREB3L2 *CREB3L3 CREB3L4 CREB5 *CREBBP CREBL2 CREBRF CREBZF CREG1 CREG2 *CRELD1 CRELD2 CREM *CRH CRHBP CRHR1 CRHR2 CRIM1 CRIP1 CRIP2 CRIP3 *CRIPT *CRIPTO CRISP1 CRISP2 CRISP3 CRISPLD1 CRISPLD2 CRK *CRKL *CRLF1 CRLF2 CRLF3 *CRLS1 CRMP1 CRNKL1 CRNN CROCC CROCC2 CROT CRP *CRPPA CRTAC1 CRTAM *CRTAP CRTC1 CRTC2 CRTC3 *CRX *CRY1 CRY2 *CRYAA CRYAA2 *CRYAB *CRYBA1 *CRYBA2 *CRYBA4 *CRYBB1 *CRYBB2 *CRYBB3 CRYBG1 CRYBG2 CRYBG3 CRYGA *CRYGB *CRYGC *CRYGD CRYGN *CRYGS CRYL1 *CRYM CRYZ CRYZL1 CS CSAD CSAG1 CSDC2 CSDE1 CSE1L CSF1 *CSF1R CSF2 *CSF2RA *CSF2RB CSF3 *CSF3R *CSGALNACT1 CSGALNACT2 CSH1 CSH2 CSHL1 CSK CSKMT CSMD1 CSMD2 CSMD3 CSN1S1 CSN2 CSN3 CSNK1A1 CSNK1A1L *CSNK1D CSNK1E CSNK1G1 CSNK1G2 CSNK1G3 *CSNK2A1 CSNK2A2 CSNK2A3 *CSNK2B CSNKA2IP CSPG4 CSPG5 *CSPP1 CSRNP1 CSRNP2 CSRNP3 CSRP1 CSRP2 *CSRP3 CST1 CST11 CST2 *CST3 CST4 CST5 *CST6 CST7 CST8 CST9 CST9L *CSTA *CSTB CSTF1 *CSTF2 CSTF2T CSTF3 CSTL1 CT45A1 CT45A10 CT45A2 CT45A3 CT45A5 CT45A6 CT45A7 CT45A8 CT45A9 CT47A1 CT47A10 CT47A11 CT47A12 CT47A2 CT47A3 CT47A4 CT47A5 CT47A6 CT47A7 CT47A8 CT47A9 CT47B1 *CT55 CT62 CT83 CTAG1A CTAG1B CTAG2 CTAGE1 CTAGE15 CTAGE4 CTAGE6 CTAGE8 CTAGE9 *CTBP1 CTBP2 CTBS *CTC1 *CTCF CTCFL CTDNEP1 *CTDP1 CTDSP1 CTDSP2 CTDSPL CTDSPL2 CTF1 CTGF *CTH *CTHRC1 CTIF *CTLA4 *CTNNA1 *CTNNA2 *CTNNA3 CTNNAL1 *CTNNB1 CTNNBIP1 *CTNNBL1 *CTNND1 *CTNND2 *CTNS *CTPS1 CTPS2 CTR9 CTRB1 CTRB2 *CTRC CTRL *CTSA *CTSB *CTSC *CTSD CTSE *CTSF CTSG *CTSH *CTSK CTSL CTSO CTSS CTSV CTSW CTSZ CTTN CTTNBP2 CTTNBP2NL CTU1 *CTU2 CTXN1 CTXN2 CTXN3 CTXND1 CTXND2 *CUBN CUEDC1 CUEDC2 CUL1 CUL2 *CUL3 CUL4A *CUL4B CUL5 *CUL7 CUL9 CUTA CUTC *CUX1 *CUX2 CUZD1 CWC15 CWC22 CWC25 *CWC27 *CWF19L1 CWF19L2 CWH43 CX3CL1 CX3CR1 CXADR CXCL1 CXCL10 CXCL11 CXCL12 CXCL13 CXCL14 CXCL16 CXCL17 CXCL2 CXCL3 CXCL5 CXCL6 CXCL8 CXCL9 CXCR1 *CXCR2 CXCR3 *CXCR4 CXCR5 CXCR6 CXORF21 CXORF36 CXORF38 CXORF40A CXORF40B CXORF49 CXORF49B CXORF51A CXORF51B CXORF56 CXORF58 CXORF65 CXORF66 CXORF67 CXXC1 CXXC4 CXXC5 *CYB561 CYB561A3 CYB561D1 CYB561D2 *CYB5A CYB5B CYB5D1 CYB5D2 CYB5R1 CYB5R2 *CYB5R3 CYB5R4 CYB5RL *CYBA *CYBB *CYBC1 CYBRD1 *CYC1 *CYCS CYFIP1 *CYFIP2 CYGB CYHR1 *CYLC1 CYLC2 *CYLD *CYP11A1 *CYP11B1 *CYP11B2 *CYP17A1 *CYP19A1 CYP1A1 CYP1A2 *CYP1B1 CYP20A1 *CYP21A2 *CYP24A1 CYP26A1 *CYP26B1 *CYP26C1 *CYP27A1 *CYP27B1 CYP27C1 CYP2A13 *CYP2A6 CYP2A7 CYP2B6 CYP2C18 CYP2C19 CYP2C8 *CYP2C9 *CYP2D6 CYP2D7 CYP2E1 CYP2F1 CYP2J2 *CYP2R1 CYP2S1 *CYP2U1 CYP2W1 CYP39A1 *CYP3A4 CYP3A43 *CYP3A5 CYP3A7 CYP46A1 CYP4A11 CYP4A22 CYP4B1 CYP4F11 CYP4F12 CYP4F2 *CYP4F22 CYP4F3 CYP4F8 *CYP4V2 CYP4X1 CYP4Z1 CYP51A1 *CYP7A1 *CYP7B1 CYP8B1 CYR61 CYREN CYS1 CYSLTR1 *CYSLTR2 CYSRT1 CYSTM1 CYTH1 CYTH2 CYTH3 CYTH4 CYTIP CYTL1 CYYR1 *D2HGDH DAAM1 *DAAM2 *DAB1 DAB2 DAB2IP DACH1 DACH2 *DACT1 DACT2 DACT3 DAD1 *DAG1 DAGLA DAGLB *DALRD3 DAND5 *DAO *DAOA DAP DAP3 DAPK1 DAPK2 DAPK3 DAPL1 DAPP1 DARS *DARS1 *DARS2 *DAW1 DAXX *DAZ1 *DAZ2 *DAZ3 *DAZ4 DAZAP1 DAZAP2 DAZL DBF4 DBF4B *DBH DBI DBN1 DBNDD1 DBNDD2 DBNL DBP *DBR1 *DBT DBX1 DBX2 DCAF1 DCAF10 DCAF11 DCAF12 DCAF12L1 DCAF12L2 DCAF13 DCAF15 DCAF16 *DCAF17 DCAF4 DCAF4L1 DCAF4L2 DCAF5 DCAF6 DCAF7 *DCAF8 DCAF8L1 DCAF8L2 DCAKD DCANP1 DCBLD1 DCBLD2 *DCC DCD DCDC1 *DCDC2 DCDC2B DCDC2C DCDC5 *DCHS1 DCHS2 DCK DCLK1 DCLK2 DCLK3 DCLRE1A *DCLRE1B *DCLRE1C *DCN DCP1A DCP1B DCP2 *DCPS DCST1 DCST2 DCSTAMP *DCT DCTD *DCTN1 DCTN2 DCTN3 *DCTN4 DCTN5 DCTN6 DCTPP1 DCUN1D1 DCUN1D2 DCUN1D3 DCUN1D4 DCUN1D5 *DCX *DCXR DDA1 DDAH1 DDAH2 *DDB1 *DDB2 *DDC *DDHD1 *DDHD2 DDI1 DDI2 DDIAS *DDIT3 DDIT4 DDIT4L DDN DDO *DDOST DDR1 *DDR2 *DDRGK1 DDT DDTL DDX1 DDX10 *DDX11 DDX17 DDX18 DDX19A DDX19B DDX20 DDX21 DDX23 DDX24 DDX25 DDX27 DDX28 DDX31 DDX39A DDX39B *DDX3X *DDX3Y DDX4 *DDX41 DDX42 DDX43 DDX46 DDX47 DDX49 DDX5 DDX50 DDX51 DDX52 DDX53 DDX54 DDX55 DDX56 DDX58 *DDX59 *DDX6 DDX60 DDX60L *DEAF1 DEC1 DECR1 DECR2 DEDD DEDD2 *DEF6 DEF8 DEFA1 DEFA1B DEFA3 DEFA4 DEFA5 DEFA6 DEFB1 DEFB103A DEFB103B DEFB104A DEFB104B DEFB105A DEFB105B DEFB106A DEFB106B DEFB107A DEFB107B DEFB108B DEFB110 DEFB112 DEFB113 DEFB114 DEFB115 DEFB116 DEFB118 DEFB119 DEFB121 DEFB123 DEFB124 DEFB125 DEFB126 DEFB127 DEFB128 DEFB129 DEFB130A DEFB130B DEFB131A DEFB131B DEFB132 DEFB133 DEFB134 DEFB135 DEFB136 DEFB4A DEFB4B *DEGS1 DEGS2 DEK DELE1 DENND1A DENND1B DENND1C DENND2A DENND2C DENND2D DENND3 DENND4A DENND4B DENND4C *DENND5A DENND5B DENND6A DENND6B DENR DEPDC1 DEPDC1B DEPDC4 *DEPDC5 DEPDC7 DEPP1 DEPTOR DERA DERL1 DERL2 DERL3 *DES DESI1 DESI2 DET1 DEUP1 DEXI DFFA DFFB *DGAT1 DGAT2 DGAT2L6 *DGCR2 *DGCR6 DGCR6L *DGCR8 DGKA DGKB DGKD *DGKE DGKG DGKH DGKI DGKK DGKQ DGKZ DGLUCY *DGUOK *DHCR24 *DHCR7 *DHDDS DHDH *DHFR DHFR2 *DHH *DHODH *DHPS DHRS1 DHRS11 DHRS12 DHRS13 DHRS2 DHRS3 DHRS4 DHRS4L2 DHRS7 DHRS7B DHRS7C DHRS9 DHRSX *DHTKD1 DHX15 *DHX16 DHX29 *DHX30 DHX32 DHX33 DHX34 DHX35 DHX36 *DHX37 *DHX38 DHX40 DHX57 DHX58 DHX8 *DHX9 *DIABLO *DIAPH1 *DIAPH2 *DIAPH3 *DICER1 DIDO1 DIMT1 *DIO1 DIO2 DIO3 DIP2A *DIP2B DIP2C DIRAS1 DIRAS2 DIRAS3 DIRC1 DIRC2 DIS3 DIS3L *DIS3L2 DISC1 *DISC2 *DISP1 DISP2 DISP3 DIXDC1 *DKC1 *DKK1 DKK2 DKK3 DKK4 DKKL1 *DLAT *DLC1 *DLD *DLEC1 DLEU7 *DLG1 DLG2 *DLG3 *DLG4 *DLG5 DLGAP1 DLGAP2 DLGAP3 DLGAP4 DLGAP5 *DLK1 DLK2 *DLL1 *DLL3 *DLL4 *DLST DLX1 DLX2 *DLX3 *DLX4 *DLX5 *DLX6 DMAC1 DMAC2 DMAC2L DMAP1 DMBT1 DMBX1 DMC1 *DMD *DMGDH DMKN *DMP1 *DMPK *DMRT1 DMRT2 DMRT3 DMRTA1 DMRTA2 DMRTB1 DMRTC1 DMRTC1B DMRTC2 DMTF1 DMTN DMWD DMXL1 *DMXL2 *DNA2 *DNAAF1 *DNAAF11 *DNAAF19 *DNAAF2 *DNAAF3 *DNAAF4 *DNAAF5 *DNAAF6 *DNAH1 *DNAH10 DNAH10OS *DNAH11 DNAH12 DNAH14 *DNAH17 *DNAH2 DNAH3 *DNAH5 DNAH6 *DNAH7 *DNAH8 *DNAH9 *DNAI1 *DNAI2 DNAJA1 DNAJA2 DNAJA3 DNAJA4 DNAJB1 *DNAJB11 DNAJB12 *DNAJB13 DNAJB14 *DNAJB2 *DNAJB4 DNAJB5 *DNAJB6 DNAJB7 DNAJB8 DNAJB9 DNAJC1 DNAJC10 DNAJC11 *DNAJC12 *DNAJC13 DNAJC14 DNAJC15 DNAJC16 DNAJC17 DNAJC18 *DNAJC19 DNAJC2 *DNAJC21 DNAJC22 DNAJC24 DNAJC25 DNAJC27 DNAJC28 *DNAJC3 *DNAJC30 DNAJC4 *DNAJC5 DNAJC5B DNAJC5G *DNAJC6 DNAJC7 DNAJC8 DNAJC9 *DNAL1 *DNAL4 *DNALI1 *DNASE1 DNASE1L1 DNASE1L2 *DNASE1L3 *DNASE2 DNASE2B DND1 DNER *DNHD1 DNLZ *DNM1 *DNM1L *DNM2 DNM3 *DNMBP *DNMT1 *DNMT3A *DNMT3B DNMT3L DNPEP DNPH1 DNTT DNTTIP1 DNTTIP2 DOC2A DOC2B DOCK1 DOCK10 *DOCK11 *DOCK2 *DOCK3 DOCK4 DOCK5 *DOCK6 *DOCK7 *DOCK8 DOCK9 *DOHH DOK1 DOK2 DOK3 DOK4 DOK5 DOK6 *DOK7 *DOLK DOLPP1 *DONSON DOP1A DOP1B DOT1L *DPAGT1 DPCD DPEP1 DPEP2 DPEP2NB DPEP3 DPF1 *DPF2 DPF3 *DPH1 *DPH2 DPH3 *DPH5 DPH6 DPH7 *DPM1 *DPM2 *DPM3 DPP10 DPP3 DPP4 *DPP6 DPP7 DPP8 *DPP9 DPPA2 DPPA3 DPPA4 DPPA5 DPRX DPT DPY19L1 *DPY19L2 DPY19L3 DPY19L4 DPY30 *DPYD *DPYS DPYSL2 DPYSL3 DPYSL4 *DPYSL5 DQX1 DR1 DRAM1 *DRAM2 DRAP1 DRAXIN *DRC1 DRC3 DRC7 DRD1 *DRD2 *DRD3 *DRD4 *DRD5 *DRG1 DRG2 DRGX DRICH1 DROSHA DRP2 DSC1 *DSC2 *DSC3 DSCAM DSCAML1 DSCC1 *DSE DSEL *DSG1 *DSG2 *DSG3 *DSG4 DSN1 *DSP *DSPP *DST DSTN *DSTYK DTD1 DTD2 DTHD1 DTL *DTNA DTNB *DTNBP1 DTWD1 DTWD2 DTX1 DTX2 DTX3 DTX3L DTX4 *DTYMK DUOX1 *DUOX2 DUOXA1 *DUOXA2 DUPD1 DUS1L DUS2 DUS3L DUS4L DUSP1 DUSP10 DUSP11 DUSP12 DUSP13 DUSP14 DUSP15 DUSP16 DUSP18 DUSP19 DUSP2 DUSP21 DUSP22 DUSP23 DUSP26 DUSP27 DUSP28 DUSP3 DUSP4 DUSP5 *DUSP6 DUSP7 DUSP8 DUSP9 *DUT *DUX4 *DUX4L1 DUXA *DVL1 DVL2 *DVL3 DXO DYDC1 DYDC2 *DYM DYNAP *DYNC1H1 DYNC1I1 *DYNC1I2 DYNC1LI1 DYNC1LI2 *DYNC2H1 *DYNC2I1 *DYNC2I2 *DYNC2LI1 DYNLL1 DYNLL2 DYNLRB1 DYNLRB2 DYNLT1 *DYNLT2B DYNLT3 *DYRK1A *DYRK1B DYRK2 DYRK3 DYRK4 *DYSF DYTN DZANK1 *DZIP1 *DZIP1L DZIP3 E2F1 E2F2 E2F3 E2F4 E2F5 E2F6 E2F7 E2F8 E4F1 EAF1 EAF2 EAPP *EARS2 EBAG9 EBF1 EBF2 *EBF3 EBF4 EBI3 EBLN1 EBLN2 EBNA1BP2 *EBP EBPL ECD *ECE1 ECE2 *ECEL1 ECH1 ECHDC1 ECHDC2 ECHDC3 *ECHS1 ECI1 ECI2 *ECM1 ECM2 ECPAS ECSCR ECSIT ECT2 ECT2L *EDA *EDA2R *EDAR *EDARADD *EDC3 EDC4 EDDM13 EDDM3A EDDM3B EDEM1 EDEM2 *EDEM3 EDF1 EDIL3 *EDN1 EDN2 *EDN3 *EDNRA *EDNRB EDRF1 EEA1 *EED EEF1A1 *EEF1A2 EEF1AKMT1 EEF1AKMT2 EEF1AKMT3 EEF1AKMT4 EEF1AKNMT EEF1B2 EEF1D EEF1E1 EEF1G *EEF2 EEF2K EEF2KMT EEFSEC EEPD1 EFCAB1 EFCAB10 EFCAB11 EFCAB12 EFCAB13 EFCAB14 EFCAB2 EFCAB3 EFCAB5 EFCAB6 EFCAB7 EFCAB8 EFCAB9 EFCC1 *EFEMP1 *EFEMP2 EFHB *EFHC1 EFHC2 EFHD1 EFHD2 *EFL1 EFNA1 EFNA2 EFNA3 EFNA4 EFNA5 *EFNB1 EFNB2 EFNB3 EFR3A EFR3B EFS *EFTUD2 *EGF EGFL6 EGFL7 EGFL8 EGFLAM *EGFR *EGLN1 EGLN2 EGLN3 EGR1 *EGR2 EGR3 EGR4 EHBP1 EHBP1L1 EHD1 EHD2 EHD3 EHD4 EHF *EHHADH *EHMT1 EHMT2 EI24 EID1 EID2 EID2B EID3 EIF1 EIF1AD EIF1AX EIF1AY EIF1B EIF2A *EIF2AK1 *EIF2AK2 *EIF2AK3 *EIF2AK4 *EIF2B1 *EIF2B2 *EIF2B3 *EIF2B4 *EIF2B5 EIF2D EIF2S1 EIF2S2 *EIF2S3 EIF2S3B EIF3A EIF3B EIF3C EIF3CL EIF3D EIF3E *EIF3F EIF3G EIF3H EIF3I EIF3J EIF3K EIF3L EIF3M EIF4A1 *EIF4A2 *EIF4A3 EIF4B EIF4E EIF4E1B EIF4E2 EIF4E3 EIF4EBP1 EIF4EBP2 EIF4EBP3 EIF4ENIF1 *EIF4G1 EIF4G2 EIF4G3 *EIF4H EIF5 *EIF5A EIF5A2 EIF5AL1 EIF5B EIF6 EIPR1 ELAC1 *ELAC2 *ELANE ELAVL1 ELAVL2 ELAVL3 ELAVL4 ELF1 ELF2 ELF3 *ELF4 ELF5 ELFN1 ELFN2 ELK1 ELK3 ELK4 ELL ELL2 ELL3 ELMO1 *ELMO2 ELMO3 ELMOD1 ELMOD2 *ELMOD3 ELMSAN1 *ELN ELOA ELOA2 ELOA3 ELOA3B ELOA3C ELOA3D ELOB ELOC ELOF1 *ELOVL1 ELOVL2 ELOVL3 *ELOVL4 *ELOVL5 ELOVL6 ELOVL7 *ELP1 *ELP2 ELP3 *ELP4 ELP5 ELP6 ELSPBP1 EMB *EMC1 *EMC10 EMC2 EMC3 EMC4 EMC6 EMC7 EMC8 EMC9 EMCN *EMD EME1 EME2 *EMG1 EMID1 *EMILIN1 EMILIN2 EMILIN3 *EML1 EML2 EML3 EML4 EML5 EML6 EMP1 *EMP2 EMP3 EMSY EMX1 *EMX2 *EN1 EN2 ENAH *ENAM ENC1 ENDOD1 ENDOG ENDOU ENDOV *ENG ENGASE ENHO ENKD1 ENKUR ENO1 ENO2 *ENO3 ENO4 ENOPH1 ENOSF1 ENOX1 ENOX2 ENPEP *ENPP1 ENPP2 ENPP3 ENPP4 ENPP5 ENPP6 ENPP7 ENSA ENTHD1 *ENTPD1 ENTPD2 ENTPD3 ENTPD4 ENTPD5 ENTPD6 ENTPD7 ENTPD8 ENTR1 ENY2 *EOGT *EOMES *EP300 EP400 *EPAS1 *EPB41 *EPB41L1 EPB41L2 EPB41L3 EPB41L4A EPB41L4B EPB41L5 *EPB42 EPC1 EPC2 *EPCAM EPDR1 *EPG5 EPGN EPHA1 *EPHA10 *EPHA2 EPHA3 EPHA4 EPHA5 EPHA6 EPHA7 EPHA8 EPHB1 *EPHB2 EPHB3 *EPHB4 EPHB6 EPHX1 *EPHX2 EPHX3 EPHX4 *EPM2A EPM2AIP1 EPN1 EPN2 EPN3 *EPO EPOP *EPOR EPPIN EPPK1 EPRS *EPRS1 EPS15 *EPS15L1 *EPS8 EPS8L1 *EPS8L2 *EPS8L3 EPSTI1 *EPX EPYC EQTN *ERAL1 *ERAP1 ERAP2 ERAS *ERBB2 *ERBB3 *ERBB4 ERBIN ERC1 ERC2 *ERCC1 *ERCC2 *ERCC3 *ERCC4 *ERCC5 *ERCC6 ERCC6L *ERCC6L2 *ERCC8 EREG *ERF ERFE *ERG ERG28 *ERGIC1 ERGIC2 ERGIC3 ERH *ERI1 ERI2 ERI3 ERICH1 ERICH2 ERICH3 ERICH4 ERICH5 ERICH6 ERICH6B ERLEC1 *ERLIN1 *ERLIN2 ERMAP *ERMARD ERMN ERMP1 ERN1 ERN2 ERO1A ERO1B ERP27 ERP29 ERP44 ERRFI1 ERV3-1 ERVFRD-1 ERVMER34-1 ERVV-1 ERVV-2 ERVW-1 *ESAM ESCO1 *ESCO2 ESD ESF1 ESM1 ESPL1 *ESPN ESPNL *ESR1 *ESR2 *ESRP1 ESRP2 ESRRA *ESRRB ESRRG *ESS2 ESX1 ESYT1 ESYT2 ESYT3 ETAA1 ETDB ETDC ETF1 *ETFA *ETFB ETFBKMT *ETFDH ETFRF1 *ETHE1 ETNK1 ETNK2 ETNPPL *ETS1 ETS2 ETV1 ETV2 ETV3 ETV3L ETV4 ETV5 *ETV6 ETV7 EVA1A EVA1B EVA1C *EVC *EVC2 EVI2A EVI2B EVI5 EVI5L EVL EVPL EVPLL EVX1 EVX2 *EWSR1 EXD1 EXD2 EXD3 EXO1 EXO5 EXOC1 EXOC1L *EXOC2 EXOC3 EXOC3L1 EXOC3L2 EXOC3L4 EXOC4 EXOC5 EXOC6 *EXOC6B *EXOC7 *EXOC8 EXOG *EXOSC1 EXOSC10 *EXOSC2 *EXOSC3 EXOSC4 *EXOSC5 EXOSC6 EXOSC7 *EXOSC8 *EXOSC9 *EXPH5 *EXT1 *EXT2 EXTL1 EXTL2 *EXTL3 *EYA1 EYA2 EYA3 *EYA4 *EYS EZH1 *EZH2 EZR *F10 *F11 F11R *F12 *F13A1 *F13B *F2 F2R F2RL1 F2RL2 F2RL3 F3 *F5 *F7 *F8 F8A1 F8A2 F8A3 *F9 *FA2H FAAH FAAH2 FAAP100 FAAP20 FAAP24 FABP1 FABP12 FABP2 FABP3 FABP4 FABP5 FABP6 FABP7 FABP9 *FADD FADS1 FADS2 FADS3 FADS6 FAF1 FAF2 *FAH FAHD1 FAHD2A FAHD2B FAIM FAIM2 FAM102A FAM102B FAM104A FAM104B FAM106A FAM107A FAM107B FAM110A FAM110B FAM110C FAM110D *FAM111A *FAM111B FAM114A1 FAM114A2 FAM117A FAM117B FAM118A FAM118B FAM120A FAM120AOS FAM120B FAM120C FAM122A FAM122B FAM122C FAM124A FAM124B FAM126A FAM126B FAM129A FAM129B FAM129C FAM131A FAM131B FAM131C FAM133A FAM133B FAM135A FAM135B FAM136A *FAM13A FAM13B FAM13C FAM149A *FAM149B1 FAM151A FAM151B FAM153A FAM153B FAM153C FAM155A FAM155B FAM156A FAM156B FAM160A1 FAM160A2 FAM160B1 FAM160B2 *FAM161A FAM161B FAM162A FAM162B FAM163A FAM163B FAM166A FAM166B FAM167A FAM167B FAM168A FAM168B FAM169A FAM169B FAM170A FAM170B FAM171A1 FAM171A2 FAM171B FAM172A FAM173A FAM173B FAM174A FAM174B FAM177A1 FAM177B FAM178B FAM180A FAM180B FAM181A FAM181B FAM183A FAM184A FAM184B FAM185A FAM186A FAM186B FAM187A FAM187B FAM189A1 FAM189A2 FAM189B FAM192A FAM193A FAM193B FAM198A FAM198B FAM199X FAM19A1 FAM19A2 FAM19A3 FAM19A4 FAM19A5 FAM200A FAM200B FAM204A FAM205A FAM205C FAM206A FAM207A FAM208A FAM208B FAM209A FAM209B *FAM20A FAM20B *FAM20C FAM210A FAM210B FAM214A FAM214B FAM216A FAM216B FAM217A FAM217B FAM218A FAM219A FAM219B FAM220A FAM221A FAM221B FAM222A FAM222B FAM227A FAM227B FAM228A FAM228B FAM229A FAM229B FAM234A FAM234B FAM236A FAM236B FAM236C FAM236D FAM237A FAM240A FAM240B FAM241A FAM241B FAM243A FAM243B FAM24A FAM24B FAM25A FAM25C FAM25G FAM32A FAM3A FAM3B FAM3C FAM3D FAM43A FAM43B FAM45A FAM47A FAM47B FAM47C FAM47E FAM49A FAM49B *FAM50A FAM50B FAM53A FAM53B FAM53C FAM57A FAM57B FAM69A FAM69B FAM69C FAM71A FAM71B FAM71C FAM71D FAM71E1 FAM71E2 FAM71F1 FAM71F2 FAM72A FAM72B FAM72C FAM72D FAM76A FAM76B FAM78A FAM78B FAM81A FAM81B FAM83A FAM83B FAM83C FAM83D FAM83E FAM83F FAM83G *FAM83H FAM84A FAM84B FAM86B1 FAM86B2 FAM86C1 FAM89A FAM89B FAM8A1 FAM90A1 FAM90A26 FAM91A1 FAM92A FAM92B FAM98A FAM98B FAM98C FAM9A FAM9B FAM9C *FAN1 *FANCA *FANCB *FANCC *FANCD2 FANCD2OS *FANCE *FANCF *FANCG *FANCI *FANCL *FANCM FANK1 FAP *FAR1 FAR2 FARP1 FARP2 *FARS2 *FARSA *FARSB *FAS *FASLG FASN FASTK FASTKD1 *FASTKD2 FASTKD3 FASTKD5 FAT1 *FAT2 FAT3 *FAT4 FATE1 FAU FAXC FAXDC2 FBF1 FBH1 FBL FBLIM1 FBLL1 *FBLN1 FBLN2 *FBLN5 FBLN7 *FBN1 *FBN2 FBN3 *FBP1 *FBP2 FBRS FBRSL1 FBXL12 FBXL13 FBXL14 FBXL15 FBXL16 FBXL17 FBXL18 FBXL19 FBXL2 FBXL20 FBXL21 FBXL22 *FBXL3 *FBXL4 FBXL5 FBXL6 FBXL7 FBXL8 FBXO10 *FBXO11 FBXO15 FBXO16 FBXO17 FBXO2 FBXO21 FBXO22 FBXO24 FBXO25 FBXO27 *FBXO28 FBXO3 FBXO30 *FBXO31 FBXO32 FBXO33 FBXO34 FBXO36 *FBXO38 FBXO39 FBXO4 FBXO40 FBXO41 FBXO42 *FBXO43 FBXO44 FBXO45 FBXO46 FBXO47 FBXO48 FBXO5 FBXO6 *FBXO7 FBXO8 FBXO9 FBXW10 *FBXW11 FBXW12 FBXW2 *FBXW4 FBXW5 *FBXW7 FBXW8 FBXW9 FCAMR FCAR FCER1A FCER1G FCER2 FCF1 FCGBP FCGR1A FCGR1B *FCGR2A *FCGR2B *FCGR2C *FCGR3A *FCGR3B FCGRT *FCHO1 FCHO2 FCHSD1 FCHSD2 FCMR FCN1 FCN2 *FCN3 FCRL1 FCRL2 FCRL3 FCRL4 FCRL5 FCRL6 FCRLA FCRLB *FCSK FDCSP *FDFT1 *FDPS FDX1 *FDX2 FDXACB1 *FDXR *FECH FEM1A FEM1B FEM1C FEN1 FER FER1L5 FER1L6 FERD3L *FERMT1 FERMT2 *FERMT3 *FERRY3 FES FETUB FEV FEZ1 FEZ2 *FEZF1 FEZF2 FFAR1 FFAR2 FFAR3 FFAR4 *FGA *FGB *FGD1 FGD2 FGD3 *FGD4 FGD5 FGD6 FGF1 *FGF10 FGF11 *FGF12 *FGF13 *FGF14 *FGF16 *FGF17 FGF18 FGF19 FGF2 *FGF20 FGF21 FGF22 *FGF23 *FGF3 FGF4 *FGF5 FGF6 FGF7 *FGF8 *FGF9 FGFBP1 FGFBP2 FGFBP3 *FGFR1 FGFR1OP FGFR1OP2 *FGFR2 *FGFR3 FGFR4 *FGFRL1 *FGG FGGY FGL1 FGL2 FGR *FH FHAD1 FHDC1 FHIT *FHL1 *FHL2 FHL3 FHL5 FHOD1 *FHOD3 FIBCD1 FIBIN *FIBP FICD *FIG4 *FIGLA FIGN FIGNL1 FIGNL2 *FILIP1 FILIP1L *FIP1L1 FIS1 FITM1 *FITM2 FIZ1 FJX1 *FKBP10 FKBP11 *FKBP14 FKBP15 FKBP1A FKBP1B FKBP2 FKBP3 FKBP4 *FKBP5 *FKBP6 FKBP7 FKBP8 FKBP9 FKBPL *FKRP *FKTN *FLAD1 *FLCN *FLG *FLG2 *FLI1 *FLII *FLNA *FLNB *FLNC FLOT1 FLOT2 *FLRT1 FLRT2 *FLRT3 *FLT1 *FLT3 FLT3LG *FLT4 *FLVCR1 *FLVCR2 FLYWCH1 FLYWCH2 FMC1 FMN1 *FMN2 FMNL1 FMNL2 FMNL3 FMO1 FMO2 *FMO3 FMO4 FMO5 FMOD *FMR1 FMR1NB *FN1 FN3K FN3KRP FNBP1 FNBP1L FNBP4 FNDC1 FNDC10 FNDC11 FNDC3A FNDC3B FNDC4 FNDC5 FNDC7 FNDC8 FNDC9 *FNIP1 FNIP2 FNTA FNTB *FOCAD FOLH1 *FOLR1 FOLR2 FOLR3 FOPNL *FOS FOSB FOSL1 *FOSL2 FOXA1 *FOXA2 FOXA3 FOXB1 FOXB2 *FOXC1 *FOXC2 FOXD1 FOXD2 *FOXD3 FOXD4 FOXD4L1 FOXD4L3 FOXD4L4 FOXD4L5 FOXD4L6 *FOXE1 *FOXE3 *FOXF1 FOXF2 *FOXG1 *FOXH1 *FOXI1 FOXI2 *FOXI3 *FOXJ1 FOXJ2 FOXJ3 FOXK1 FOXK2 *FOXL1 *FOXL2 FOXL2NB FOXM1 *FOXN1 FOXN2 FOXN3 FOXN4 *FOXO1 FOXO3 FOXO4 FOXO6 *FOXP1 *FOXP2 *FOXP3 FOXP4 FOXQ1 FOXR1 FOXR2 *FOXRED1 FOXRED2 FOXS1 FPGS FPGT FPR1 FPR2 FPR3 *FRA10AC1 *FRA16E *FRAS1 FRAT1 FRAT2 *FREM1 *FREM2 FREM3 *FRG1 FRG2 FRG2B FRG2C FRK FRMD1 FRMD3 *FRMD4A FRMD4B *FRMD5 FRMD6 *FRMD7 FRMD8 FRMPD1 FRMPD2 FRMPD3 *FRMPD4 FRRS1 *FRRS1L FRS2 FRS3 FRY FRYL *FRZB FSBP FSCB FSCN1 *FSCN2 FSCN3 FSD1 FSD1L FSD2 *FSHB *FSHR FSIP1 *FSIP2 FST FSTL1 FSTL3 FSTL4 FSTL5 *FTCD FTCDNL1 *FTH1 FTHL17 *FTL FTMT *FTO *FTSJ1 FTSJ3 FUBP1 FUBP3 *FUCA1 FUCA2 FUK FUNDC1 FUNDC2 FUOM FURIN *FUS FUT1 FUT10 FUT11 FUT2 FUT3 FUT4 FUT5 FUT6 FUT7 *FUT8 FUT9 *FUZ *FXN *FXR1 FXR2 FXYD1 *FXYD2 FXYD3 FXYD4 FXYD5 FXYD6 FXYD7 *FYB1 FYB2 *FYCO1 FYN FYTTD1 FZD1 FZD10 *FZD2 FZD3 *FZD4 *FZD5 *FZD6 FZD7 FZD8 FZD9 *FZR1 G0S2 G2E3 G3BP1 G3BP2 G6PC *G6PC1 G6PC2 *G6PC3 *G6PD *GAA *GAB1 GAB2 GAB3 GAB4 GABARAP GABARAPL1 GABARAPL2 *GABBR1 *GABBR2 GABPA GABPB1 GABPB2 *GABRA1 *GABRA2 *GABRA3 GABRA4 *GABRA5 GABRA6 *GABRB1 *GABRB2 *GABRB3 *GABRD GABRE GABRG1 *GABRG2 GABRG3 GABRP GABRQ GABRR1 GABRR2 GABRR3 *GAD1 GAD2 GADD45A GADD45B GADD45G GADD45GIP1 GADL1 GAGE1 GAGE10 GAGE12B GAGE12C GAGE12D GAGE12E GAGE12F GAGE12G GAGE12H GAGE12I GAGE12J GAGE13 GAGE2A GAGE2B GAGE2C GAGE2D GAGE2E GAK *GAL GAL3ST1 GAL3ST2 GAL3ST3 GAL3ST4 *GALC *GALE *GALK1 GALK2 *GALM *GALNS GALNT1 GALNT10 GALNT11 GALNT12 GALNT13 GALNT14 GALNT15 GALNT16 GALNT17 GALNT18 *GALNT2 *GALNT3 GALNT4 GALNT5 GALNT6 GALNT7 GALNT8 GALNT9 GALNTL5 GALNTL6 GALP GALR1 GALR2 GALR3 *GALT *GAMT *GAN *GANAB GANC GAP43 GAPDH GAPDHS GAPT *GAPVD1 GAR1 GAREM1 GAREM2 GARNL3 GARS *GARS1 GART *GAS1 *GAS2 GAS2L1 *GAS2L2 GAS2L3 GAS6 GAS7 *GAS8 GAST *GATA1 *GATA2 *GATA3 *GATA4 *GATA5 *GATA6 *GATAD1 GATAD2A *GATAD2B *GATB *GATC GATD1 GATD3A GATD3B *GATM GBA *GBA1 *GBA2 GBA3 *GBE1 *GBF1 GBGT1 GBP1 GBP2 GBP3 GBP4 GBP5 GBP6 GBP7 GBX1 GBX2 GC GCA GCAT GCC1 GCC2 *GCDH GCFC2 GCG *GCGR *GCH1 GCHFR *GCK GCKR *GCLC GCLM GCM1 *GCM2 GCN1 *GCNA GCNT1 *GCNT2 GCNT3 GCNT4 GCNT7 GCSAM GCSAML *GCSH GDA *GDAP1 GDAP1L1 *GDAP2 GDE1 *GDF1 GDF10 *GDF11 *GDF15 *GDF2 *GDF3 *GDF5 GDF5OS *GDF6 GDF7 *GDF9 *GDI1 GDI2 *GDNF GDPD1 GDPD2 GDPD3 GDPD4 GDPD5 GDPGP1 GEM GEMIN2 *GEMIN4 *GEMIN5 GEMIN6 GEMIN7 GEMIN8 GEN1 *GET3 *GET4 *GFAP *GFER *GFI1 *GFI1B *GFM1 *GFM2 GFOD1 GFOD2 *GFPT1 GFPT2 *GFRA1 GFRA2 GFRA3 GFRA4 GFRAL GFY GGA1 GGA2 GGA3 GGACT GGCT *GGCX GGH *GGN GGNBP2 *GGPS1 *GGT1 GGT2 GGT5 GGT6 GGT7 GGTLC1 GGTLC2 GGTLC3 *GH1 GH2 GHDC GHITM *GHR GHRH *GHRHR *GHRL *GHSR GID4 GID8 GIF GIGYF1 *GIGYF2 GIMAP1 GIMAP2 GIMAP4 *GIMAP5 GIMAP6 GIMAP7 GIMAP8 GIMD1 GIN1 GINM1 *GINS1 GINS2 GINS3 GINS4 GIP *GIPC1 GIPC2 *GIPC3 GIPR GIT1 GIT2 *GJA1 GJA10 *GJA3 GJA4 *GJA5 *GJA8 GJA9 *GJB1 *GJB2 *GJB3 *GJB4 GJB5 *GJB6 GJB7 GJC1 *GJC2 GJC3 GJD2 GJD3 GJD4 GJE1 *GK GK2 GK5 GKAP1 GKN1 GKN2 *GLA *GLB1 GLB1L GLB1L2 GLB1L3 GLCCI1 GLCE *GLDC *GLDN *GLE1 GLG1 *GLI1 *GLI2 *GLI3 GLI4 GLIPR1 GLIPR1L1 GLIPR1L2 GLIPR2 GLIS1 *GLIS2 *GLIS3 *GLMN GLMP GLO1 GLOD4 GLOD5 GLP1R GLP2R *GLRA1 *GLRA2 GLRA3 GLRA4 *GLRB GLRX GLRX2 GLRX3 *GLRX5 *GLS GLS2 GLT1D1 GLT6D1 *GLT8D1 GLT8D2 GLTP GLTPD2 *GLUD1 GLUD2 *GLUL GLYAT GLYATL1 GLYATL1B GLYATL2 GLYATL3 *GLYCTK GLYR1 *GM2A GMCL1 GMCL2 GMDS GMEB1 GMEB2 GMFB GMFG GMIP GML GMNC *GMNN *GMPPA *GMPPB GMPR GMPR2 GMPS *GNA11 GNA12 GNA13 *GNA14 GNA15 *GNAI1 *GNAI2 *GNAI3 *GNAL *GNAO1 *GNAQ *GNAS *GNAS-AS1 *GNAT1 *GNAT2 GNAT3 GNAZ *GNB1 GNB1L *GNB2 *GNB3 *GNB4 *GNB5 *GNE GNG10 GNG11 GNG12 GNG13 GNG14 GNG2 GNG3 GNG4 GNG5 GNG7 GNG8 GNGT1 GNGT2 GNL1 GNL2 GNL3 GNL3L GNLY *GNMT *GNPAT GNPDA1 GNPDA2 *GNPNAT1 *GNPTAB *GNPTG *GNRH1 GNRH2 *GNRHR *GNS GOLGA1 *GOLGA2 GOLGA3 GOLGA4 GOLGA5 GOLGA6A GOLGA6B GOLGA6C GOLGA6D GOLGA6L1 GOLGA6L10 GOLGA6L2 GOLGA6L22 GOLGA6L4 GOLGA6L6 GOLGA6L7 GOLGA6L9 GOLGA7 GOLGA7B GOLGA8A GOLGA8B GOLGA8F GOLGA8G GOLGA8H GOLGA8J GOLGA8K GOLGA8M GOLGA8N GOLGA8O GOLGA8Q GOLGA8R GOLGA8S GOLGA8T GOLGB1 GOLIM4 GOLM1 GOLPH3 GOLPH3L GOLT1A GOLT1B GON4L *GON7 GOPC *GORAB GORASP1 GORASP2 GOSR1 *GOSR2 GOT1 GOT1L1 *GOT2 *GP1BA *GP1BB GP2 GP5 *GP6 *GP9 GPA33 *GPAA1 GPALPP1 GPAM GPANK1 GPAT2 GPAT3 GPAT4 GPATCH1 GPATCH11 GPATCH2 GPATCH2L GPATCH3 GPATCH4 GPATCH8 GPBAR1 GPBP1 GPBP1L1 GPC1 GPC2 *GPC3 *GPC4 GPC5 *GPC6 GPCPD1 *GPD1 *GPD1L *GPD2 GPER1 GPHA2 GPHB5 *GPHN *GPI *GPIHBP1 *GPKOW GPLD1 GPM6A GPM6B GPN1 GPN2 GPN3 *GPNMB GPR1 *GPR101 GPR107 GPR108 GPR119 GPR12 GPR132 GPR135 GPR137 GPR137B GPR137C GPR139 GPR141 GPR142 *GPR143 GPR146 GPR148 GPR149 GPR15 GPR150 GPR151 GPR152 GPR153 GPR155 *GPR156 GPR157 GPR158 GPR160 *GPR161 GPR162 GPR17 GPR171 GPR173 GPR174 GPR176 *GPR179 GPR18 GPR180 GPR182 GPR183 GPR19 GPR20 GPR21 GPR22 GPR25 GPR26 GPR27 GPR3 GPR31 GPR32 GPR33 GPR34 *GPR35 GPR37 GPR37L1 GPR39 GPR4 GPR42 GPR45 GPR50 GPR52 GPR55 GPR6 GPR61 GPR62 GPR63 GPR65 *GPR68 GPR75 GPR78 GPR82 GPR83 GPR84 GPR85 GPR87 *GPR88 GPR89A GPR89B GPRASP1 *GPRASP2 GPRC5A *GPRC5B GPRC5C GPRC5D GPRC6A GPRIN1 GPRIN2 GPRIN3 GPS1 GPS2 GPSM1 *GPSM2 GPSM3 GPT *GPT2 *GPX1 GPX2 GPX3 *GPX4 GPX5 GPX6 GPX7 GPX8 GRAMD1A GRAMD1B GRAMD1C GRAMD2A GRAMD2B GRAMD4 *GRAP GRAP2 GRAPL GRASP *GRB10 GRB14 GRB2 GRB7 GREB1 *GREB1L *GREM1 *GREM2 GRHL1 *GRHL2 *GRHL3 *GRHPR *GRIA1 *GRIA2 *GRIA3 *GRIA4 GRID1 *GRID2 GRID2IP GRIFIN GRIK1 *GRIK2 GRIK3 GRIK4 GRIK5 *GRIN1 *GRIN2A *GRIN2B GRIN2C *GRIN2D GRIN3A GRIN3B GRINA *GRIP1 GRIP2 GRIPAP1 *GRK1 GRK2 GRK3 GRK4 GRK5 GRK6 GRK7 *GRM1 GRM2 GRM3 GRM4 GRM5 *GRM6 *GRM7 GRM8 *GRN GRP GRPEL1 GRPEL2 GRPR GRSF1 GRTP1 GRWD1 *GRXCR1 *GRXCR2 GSAP *GSC GSC2 GSDMA GSDMB GSDMC GSDMD *GSDME GSE1 GSG1 GSG1L GSG1L2 GSK3A GSK3B GSKIP *GSN GSPT1 GSPT2 *GSR *GSS GSTA1 GSTA2 GSTA3 GSTA4 GSTA5 GSTCD GSTK1 GSTM1 GSTM2 *GSTM3 GSTM4 GSTM5 GSTO1 GSTO2 GSTP1 GSTT2 GSTT2B GSTT4 *GSTZ1 GSX1 *GSX2 GTDC1 GTF2A1 GTF2A1L GTF2A2 GTF2B GTF2E1 *GTF2E2 GTF2F1 GTF2F2 GTF2H1 GTF2H2 GTF2H2C GTF2H3 GTF2H4 *GTF2H5 *GTF2I *GTF2IRD1 *GTF2IRD2 GTF2IRD2B GTF3A GTF3C1 GTF3C2 GTF3C3 GTF3C4 GTF3C5 GTF3C6 GTPBP1 GTPBP10 *GTPBP2 *GTPBP3 GTPBP4 GTPBP6 GTPBP8 GTSE1 GTSF1 GTSF1L *GUCA1A *GUCA1B GUCA1C GUCA2A GUCA2B GUCD1 *GUCY1A1 GUCY1A2 GUCY1B1 *GUCY2C *GUCY2D GUCY2F *GUF1 GUK1 GULP1 *GUSB GVQW1 GVQW2 GVQW3 GXYLT1 GXYLT2 *GYG1 GYG2 GYPA GYPB *GYPC GYPE *GYS1 *GYS2 *GZF1 GZMA GZMB GZMH GZMK GZMM *H1-4 *H19 H1F0 H1FNT H1FOO H1FX H2AFB1 H2AFB2 H2AFB3 H2AFJ H2AFV H2AFX H2AFY H2AFY2 H2AFZ H2BFM H2BFS H2BFWT *H3-3A *H3-3B H3F3A H3F3B H3F3C *H4C11 *H4C3 *H4C5 *H4C9 *H6PD *HAAO *HABP2 HABP4 *HACD1 HACD2 HACD3 HACD4 *HACE1 HACL1 *HADH *HADHA *HADHB *HAGH HAGHL *HAL *HAMP HAND1 *HAND2 HAO1 HAO2 HAP1 HAPLN1 HAPLN2 HAPLN3 HAPLN4 HARBI1 HARS *HARS1 *HARS2 HAS1 HAS2 HAS3 HASPIN HAT1 HAUS1 HAUS2 HAUS3 HAUS4 HAUS5 HAUS6 HAUS7 HAUS8 HAVCR1 *HAVCR2 *HAX1 HBA *HBA1 *HBA2 *HBB *HBD HBE1 HBEGF *HBG1 *HBG2 HBM HBP1 HBQ1 HBS1L HBZ HCAR1 HCAR2 HCAR3 *HCCS *HCFC1 HCFC1R1 HCFC2 HCG22 *HCK HCLS1 *HCN1 *HCN2 HCN3 *HCN4 *HCRT HCRTR1 HCRTR2 HCST HDAC1 HDAC10 HDAC11 HDAC2 HDAC3 *HDAC4 HDAC5 *HDAC6 HDAC7 *HDAC8 *HDAC9 *HDC HDDC2 HDDC3 HDGF HDGFL1 HDGFL2 HDGFL3 HDHD2 HDHD3 HDHD5 HDLBP HDX HEATR1 *HEATR3 HEATR4 HEATR5A HEATR5B HEATR6 HEATR9 HEBP1 HEBP2 HECA HECTD1 HECTD2 HECTD3 *HECTD4 HECW1 *HECW2 HEG1 HELB *HELLPAR *HELLS HELQ HELT HELZ HELZ2 HEMGN HEMK1 HENMT1 *HEPACAM HEPACAM2 HEPH *HEPHL1 HEPN1 *HERC1 *HERC2 HERC3 HERC4 HERC5 HERC6 HERPUD1 HERPUD2 HES1 HES2 HES3 HES4 HES5 HES6 *HES7 *HESX1 *HEXA *HEXB HEXD HEXIM1 HEXIM2 HEY1 *HEY2 HEYL *HFE *HFM1 *HGD *HGF HGFAC HGH1 HGS *HGSNAT *HHAT HHATL HHEX HHIP HHIPL1 HHIPL2 HHLA1 HHLA2 HHLA3 HIBADH *HIBCH *HIC1 HIC2 *HID1 HIF1A HIF1AN HIF3A HIGD1A HIGD1B HIGD1C HIGD2A HIGD2B *HIKESHI HILPDA HINFP *HINT1 HINT2 HINT3 HIP1 HIP1R HIPK1 HIPK2 HIPK3 HIPK4 *HIRA HIRIP3 HIST1H1A HIST1H1B HIST1H1C HIST1H1D HIST1H1E HIST1H1T HIST1H2AA HIST1H2AB HIST1H2AC HIST1H2AD HIST1H2AE HIST1H2AG HIST1H2AH HIST1H2AI HIST1H2AJ HIST1H2AK HIST1H2AL HIST1H2AM HIST1H2BA HIST1H2BB HIST1H2BC HIST1H2BD HIST1H2BE HIST1H2BF HIST1H2BG HIST1H2BH HIST1H2BI HIST1H2BJ HIST1H2BK HIST1H2BL HIST1H2BM HIST1H2BN HIST1H2BO HIST1H3A HIST1H3B HIST1H3C HIST1H3D HIST1H3E HIST1H3F HIST1H3G HIST1H3H HIST1H3I HIST1H3J HIST1H4A HIST1H4B HIST1H4C HIST1H4D HIST1H4E HIST1H4F HIST1H4G HIST1H4H HIST1H4I HIST1H4J HIST1H4K HIST1H4L HIST2H2AA3 HIST2H2AA4 HIST2H2AB HIST2H2AC HIST2H2BE HIST2H2BF HIST2H3A HIST2H3C HIST2H3D HIST2H4A HIST2H4B HIST3H2A HIST3H2BB HIST3H3 HIST4H4 HIVEP1 *HIVEP2 HIVEP3 HJURP *HJV *HK1 HK2 HK3 *HKDC1 HKR1 *HLA-A *HLA-B *HLA-C HLA-DMA HLA-DMB HLA-DOA HLA-DOB *HLA-DPA1 *HLA-DPB1 *HLA-DQA1 HLA-DQA2 *HLA-DQB1 HLA-DQB2 *HLA-DRA *HLA-DRB1 HLA-DRB5 HLA-E HLA-F *HLA-G *HLCS HLF HLTF HLX HM13 HMBOX1 *HMBS HMCES *HMCN1 HMCN2 HMG20A HMG20B *HMGA1 *HMGA2 HMGB1 HMGB2 *HMGB3 HMGB4 *HMGCL HMGCLL1 *HMGCR HMGCS1 *HMGCS2 HMGN1 HMGN2 HMGN3 HMGN4 HMGN5 HMGXB3 HMGXB4 HMHB1 *HMMR *HMOX1 HMOX2 HMSD *HMX1 HMX2 HMX3 *HNF1A *HNF1B *HNF4A HNF4G *HNMT HNRNPA0 *HNRNPA1 HNRNPA1L2 *HNRNPA2B1 HNRNPA3 HNRNPAB *HNRNPC HNRNPCL1 HNRNPCL2 HNRNPCL3 HNRNPCL4 HNRNPD *HNRNPDL HNRNPF *HNRNPH1 *HNRNPH2 HNRNPH3 *HNRNPK HNRNPL HNRNPLL HNRNPM *HNRNPR *HNRNPU HNRNPUL1 HNRNPUL2 *HOGA1 HOMER1 *HOMER2 HOMER3 HOMEZ HOOK1 HOOK2 HOOK3 HOPX HORMAD1 HORMAD2 *HOXA1 HOXA10 *HOXA11 *HOXA13 *HOXA2 HOXA3 HOXA4 HOXA5 HOXA6 HOXA7 HOXA9 *HOXB1 HOXB13 HOXB2 HOXB3 HOXB4 HOXB5 HOXB6 HOXB7 HOXB8 HOXB9 HOXC10 HOXC11 HOXC12 *HOXC13 HOXC4 HOXC5 HOXC6 HOXC8 HOXC9 HOXD1 *HOXD10 HOXD11 HOXD12 *HOXD13 HOXD3 HOXD4 HOXD8 HOXD9 HP HP1BP3 *HPCA HPCAL1 HPCAL4 *HPD *HPDL HPF1 *HPGD HPGDS HPN HPR *HPRT1 *HPS1 *HPS3 *HPS4 *HPS5 *HPS6 HPSE *HPSE2 HPX *HR *HRAS HRASLS HRASLS2 HRASLS5 HRC HRCT1 *HRG HRH1 HRH2 HRH3 HRH4 HRK HRNR *HROB *HRURF HS1BP3 *HS2ST1 HS3ST1 HS3ST2 HS3ST3A1 HS3ST3B1 HS3ST4 HS3ST5 *HS3ST6 *HS6ST1 *HS6ST2 HS6ST3 HSBP1 HSBP1L1 *HSCB *HSD11B1 HSD11B1L *HSD11B2 HSD17B1 *HSD17B10 HSD17B11 HSD17B12 HSD17B13 HSD17B14 HSD17B2 *HSD17B3 *HSD17B4 HSD17B6 HSD17B7 HSD17B8 HSD3B1 *HSD3B2 *HSD3B7 HSDL1 HSDL2 HSF1 HSF2 *HSF2BP *HSF4 HSF5 HSFX1 HSFX2 HSFX3 HSFX4 *HSFY1 HSFY2 HSH2D HSP90AA1 HSP90AB1 HSP90B1 HSPA12A HSPA12B HSPA13 HSPA14 HSPA1A HSPA1B HSPA1L HSPA2 HSPA4 HSPA4L HSPA5 HSPA6 HSPA8 *HSPA9 *HSPB1 HSPB11 HSPB2 *HSPB3 HSPB6 HSPB7 *HSPB8 HSPB9 HSPBAP1 HSPBP1 *HSPD1 HSPE1 *HSPG2 HSPH1 HTATIP2 HTATSF1 HTD2 HTN1 HTN3 *HTR1A HTR1B HTR1D HTR1E HTR1F *HTR2A HTR2B HTR2C HTR3A HTR3B HTR3C HTR3D HTR3E HTR4 HTR5A HTR6 HTR7 *HTRA1 *HTRA2 HTRA3 HTRA4 *HTT HUNK HUS1 HUS1B *HUWE1 HVCN1 *HYAL1 HYAL2 HYAL3 HYAL4 *HYCC1 *HYDIN HYI HYKK *HYLS1 *HYMAI *HYOU1 HYPK HYPM IAH1 IAPP IARS *IARS1 *IARS2 *IBA57 IBSP IBTK ICA1 ICA1L ICAM1 ICAM2 ICAM3 ICAM4 ICAM5 ICE1 ICE2 ICK ICMT *ICOS *ICOSLG ID1 ID2 ID3 ID4 IDE *IDH1 *IDH2 *IDH3A *IDH3B IDH3G IDI1 IDI2 IDNK IDO1 IDO2 *IDS *IDUA IER2 IER3 *IER3IP1 IER5 IER5L IFFO1 IFFO2 IFI16 IFI27 IFI27L1 IFI27L2 IFI30 IFI35 IFI44 IFI44L IFI6 *IFIH1 IFIT1 IFIT1B IFIT2 IFIT3 IFIT5 IFITM1 IFITM10 IFITM2 IFITM3 *IFITM5 IFNA1 IFNA10 IFNA13 IFNA14 IFNA16 IFNA17 IFNA2 IFNA21 IFNA4 IFNA5 IFNA6 IFNA7 IFNA8 *IFNAR1 *IFNAR2 IFNB1 IFNE *IFNG *IFNGR1 *IFNGR2 IFNK IFNL1 IFNL2 IFNL3 IFNL4 IFNLR1 IFNW1 *IFRD1 IFRD2 *IFT122 *IFT140 *IFT172 IFT20 IFT22 *IFT27 *IFT43 IFT46 *IFT52 *IFT56 *IFT57 *IFT74 *IFT80 *IFT81 *IFT88 *IGBP1 IGDCC3 IGDCC4 *IGF1 *IGF1R *IGF2 IGF2BP1 *IGF2BP2 IGF2BP3 *IGF2R *IGFALS IGFBP1 IGFBP2 IGFBP3 IGFBP4 IGFBP5 IGFBP6 *IGFBP7 IGFBPL1 IGFL1 IGFL2 IGFL3 IGFL4 IGFLR1 IGFN1 *IGH *IGHG1 *IGHG2 *IGHM *IGHMBP2 IGIP IGK *IGKC IGL *IGLL1 IGLL5 IGLON5 *IGSF1 IGSF10 IGSF11 IGSF21 IGSF22 IGSF23 *IGSF3 IGSF5 IGSF6 IGSF8 IGSF9 IGSF9B *IHH IK IKBIP *IKBKB IKBKE *IKBKG *IKZF1 IKZF2 *IKZF3 IKZF4 *IKZF5 *IL10 *IL10RA *IL10RB IL11 *IL11RA *IL12A *IL12A-AS1 *IL12B *IL12RB1 IL12RB2 *IL13 IL13RA1 IL13RA2 IL15 IL15RA IL16 IL17A IL17B IL17C IL17D *IL17F *IL17RA IL17RB *IL17RC *IL17RD IL17RE IL17REL IL18 *IL18BP IL18R1 IL18RAP IL19 IL1A *IL1B IL1F10 *IL1R1 IL1R2 IL1RAP *IL1RAPL1 IL1RAPL2 IL1RL1 IL1RL2 *IL1RN IL2 IL20 IL20RA IL20RB *IL21 *IL21R IL22 IL22RA1 IL22RA2 IL23A *IL23R IL24 IL25 IL26 IL27 IL27RA *IL2RA *IL2RB *IL2RG IL3 IL31 *IL31RA IL32 IL33 IL34 IL36A IL36B IL36G *IL36RN *IL37 IL3RA IL4 IL4I1 IL4R IL5 IL5RA *IL6 *IL6R *IL6ST *IL7 *IL7R IL9 IL9R *ILDR1 ILDR2 ILF2 ILF3 ILK ILKAP ILVBL IMMP1L IMMP2L IMMT IMP3 IMP4 *IMPA1 IMPA2 IMPACT IMPAD1 *IMPDH1 *IMPDH2 *IMPG1 *IMPG2 INA INAFM1 INAFM2 *INAVA INCA1 INCENP *INF2 *ING1 ING2 ING3 ING4 ING5 INHA INHBA INHBB INHBC INHBE INIP INKA1 INKA2 INMT INO80 INO80B INO80C INO80D INO80E INPP1 INPP4A INPP4B INPP5A INPP5B INPP5D *INPP5E INPP5F INPP5J *INPP5K *INPPL1 *INS INSC INSIG1 INSIG2 *INSL3 INSL4 INSL5 INSL6 INSM1 INSM2 *INSR INSRR INSYN1 INSYN2 INSYN2B *INTS1 INTS10 *INTS11 INTS12 INTS13 INTS14 INTS2 INTS3 INTS4 INTS5 INTS6 INTS6L INTS7 *INTS8 INTS9 *INTU *INVS IP6K1 IP6K2 IP6K3 IPCEF1 IPMK IPO11 IPO13 IPO4 IPO5 IPO7 *IPO8 IPO9 IPP IPPK *IPW IQANK1 IQCA1 IQCA1L *IQCB1 IQCC IQCD *IQCE IQCF1 IQCF2 IQCF3 IQCF5 IQCF6 IQCG IQCH IQCJ IQCK IQCM *IQCN IQGAP1 IQGAP2 IQGAP3 *IQSEC1 *IQSEC2 IQSEC3 IQUB *IRAK1 IRAK1BP1 IRAK2 IRAK3 *IRAK4 *IREB2 *IRF1 IRF2 IRF2BP1 *IRF2BP2 *IRF2BPL *IRF3 *IRF4 *IRF5 *IRF6 *IRF7 *IRF8 *IRF9 IRGC *IRGM IRGQ *IRS1 *IRS2 *IRS4 IRX1 IRX2 IRX3 IRX4 *IRX5 IRX6 *ISCA1 *ISCA2 *ISCU *ISG15 ISG20 ISG20L2 *ISL1 ISL2 ISLR ISLR2 ISM1 ISM2 ISOC1 ISOC2 ISPD IST1 ISX ISY1 ISYNA1 *ITCH ITFG1 ITFG2 ITGA1 ITGA10 ITGA11 *ITGA2 *ITGA2B *ITGA3 ITGA4 ITGA5 *ITGA6 *ITGA7 *ITGA8 ITGA9 ITGAD ITGAE ITGAL *ITGAM ITGAV ITGAX ITGB1 ITGB1BP1 ITGB1BP2 *ITGB2 *ITGB3 ITGB3BP *ITGB4 ITGB5 *ITGB6 ITGB7 ITGB8 ITGBL1 ITIH1 ITIH2 ITIH3 ITIH4 ITIH5 ITIH6 *ITK ITLN1 ITLN2 ITM2A *ITM2B ITM2C *ITPA ITPK1 ITPKA ITPKB ITPKC *ITPR1 *ITPR2 *ITPR3 ITPRID1 ITPRID2 ITPRIP ITPRIPL1 ITPRIPL2 ITSN1 ITSN2 *IVD IVL *IVNS1ABP IWS1 *IYD IZUMO1 IZUMO1R IZUMO2 IZUMO3 IZUMO4 JADE1 JADE2 JADE3 *JAG1 *JAG2 *JAGN1 *JAK1 *JAK2 *JAK3 JAKMIP1 JAKMIP2 JAKMIP3 *JAM2 *JAM3 JAML *JARID2 *JAZF1 JCAD JCHAIN JDP2 JHY JKAMP *JMJD1C JMJD4 JMJD6 JMJD7 JMJD8 JMY JOSD1 JOSD2 *JPH1 *JPH2 *JPH3 JPH4 JPT1 JPT2 *JRK JRKL JSRP1 JTB JUN JUNB JUND *JUP KAAG1 KALRN *KANK1 *KANK2 KANK3 KANK4 *KANSL1 KANSL1L KANSL2 KANSL3 KARS *KARS1 *KASH5 KAT14 KAT2A KAT2B *KAT5 *KAT6A *KAT6B KAT7 *KAT8 KATNA1 KATNAL1 KATNAL2 *KATNB1 KATNBL1 *KATNIP KAZALD1 KAZN KBTBD11 KBTBD12 *KBTBD13 KBTBD2 KBTBD3 KBTBD4 KBTBD6 KBTBD7 KBTBD8 KCMF1 *KCNA1 KCNA10 *KCNA2 KCNA3 *KCNA4 *KCNA5 KCNA6 KCNA7 KCNAB1 *KCNAB2 KCNAB3 *KCNB1 KCNB2 *KCNC1 *KCNC2 *KCNC3 KCNC4 KCND1 KCND2 *KCND3 *KCNE1 KCNE1B *KCNE2 *KCNE3 KCNE4 *KCNE5 KCNF1 KCNG1 KCNG2 KCNG3 KCNG4 *KCNH1 *KCNH2 KCNH3 KCNH4 *KCNH5 KCNH6 KCNH7 KCNH8 KCNIP1 KCNIP2 KCNIP3 KCNIP4 *KCNJ1 *KCNJ10 *KCNJ11 KCNJ12 *KCNJ13 KCNJ14 KCNJ15 *KCNJ16 *KCNJ18 *KCNJ2 *KCNJ3 KCNJ4 *KCNJ5 *KCNJ6 *KCNJ8 KCNJ9 KCNK1 KCNK10 KCNK12 KCNK13 KCNK15 KCNK16 KCNK17 *KCNK18 KCNK2 *KCNK3 *KCNK4 KCNK5 KCNK6 KCNK7 *KCNK9 *KCNMA1 KCNMB1 KCNMB2 KCNMB3 KCNMB4 KCNN1 *KCNN2 *KCNN3 *KCNN4 *KCNQ1 *KCNQ1OT1 *KCNQ2 *KCNQ3 *KCNQ4 *KCNQ5 KCNRG KCNS1 KCNS2 KCNS3 *KCNT1 *KCNT2 *KCNU1 KCNV1 *KCNV2 KCP *KCTD1 KCTD10 KCTD11 KCTD12 KCTD13 KCTD14 KCTD15 KCTD16 *KCTD17 KCTD18 KCTD19 KCTD2 KCTD20 KCTD21 KCTD3 KCTD4 KCTD5 KCTD6 *KCTD7 KCTD8 KCTD9 KDELC1 KDELC2 KDELR1 *KDELR2 KDELR3 *KDF1 *KDM1A KDM1B KDM2A KDM2B KDM3A *KDM3B KDM4A *KDM4B KDM4C KDM4D KDM4E *KDM5A *KDM5B *KDM5C *KDM5D *KDM6A *KDM6B KDM7A KDM8 *KDR *KDSR *KEAP1 KEL *KERA KHDC1 KHDC1L *KHDC3L KHDC4 KHDRBS1 KHDRBS2 KHDRBS3 *KHK KHNYN KHSRP KIAA0040 KIAA0100 KIAA0232 KIAA0319 *KIAA0319L KIAA0355 KIAA0391 KIAA0408 KIAA0513 KIAA0556 *KIAA0586 *KIAA0753 KIAA0754 *KIAA0825 KIAA0895 KIAA0895L KIAA0930 KIAA1107 KIAA1109 KIAA1143 KIAA1147 KIAA1191 KIAA1210 KIAA1211 KIAA1211L KIAA1217 KIAA1257 KIAA1324 KIAA1324L KIAA1328 KIAA1522 *KIAA1549 KIAA1549L KIAA1551 KIAA1586 KIAA1614 KIAA1671 KIAA1755 KIAA1841 KIAA1958 KIAA2012 KIAA2013 KIAA2026 *KIDINS220 *KIF11 *KIF12 KIF13A KIF13B *KIF14 *KIF15 KIF16B KIF17 KIF18A KIF18B KIF19 *KIF1A *KIF1B KIF1BP *KIF1C *KIF20A KIF20B *KIF21A KIF21B *KIF22 *KIF23 KIF24 KIF25 *KIF26A KIF26B KIF27 *KIF2A KIF2B KIF2C KIF3A *KIF3B KIF3C *KIF4A KIF4B *KIF5A KIF5B *KIF5C KIF6 *KIF7 KIF9 KIFAP3 *KIFBP KIFC1 KIFC2 KIFC3 KIN KIR2DL1 KIR2DL3 KIR2DL4 KIR2DS4 KIR3DL1 KIR3DL2 KIR3DL3 *KIRREL1 KIRREL2 KIRREL3 *KISS1 *KISS1R *KIT *KITLG *KIZ *KL KLB KLC1 *KLC2 KLC3 KLC4 *KLF1 KLF10 *KLF11 KLF12 *KLF13 KLF14 KLF15 KLF16 KLF17 KLF18 KLF2 KLF3 KLF4 KLF5 *KLF6 KLF7 KLF8 KLF9 KLHDC1 KLHDC10 KLHDC2 KLHDC3 KLHDC4 KLHDC7A KLHDC7B KLHDC8A *KLHDC8B KLHDC9 KLHL1 *KLHL10 KLHL11 KLHL12 KLHL13 KLHL14 *KLHL15 KLHL17 KLHL18 KLHL2 KLHL20 KLHL21 KLHL22 KLHL23 *KLHL24 KLHL25 KLHL26 KLHL28 KLHL29 *KLHL3 KLHL30 KLHL31 KLHL32 KLHL33 KLHL34 KLHL35 KLHL36 KLHL38 KLHL4 *KLHL40 *KLHL41 KLHL42 KLHL5 KLHL6 *KLHL7 KLHL8 *KLHL9 KLK1 KLK10 *KLK11 KLK12 KLK13 KLK14 KLK15 KLK2 KLK3 *KLK4 KLK5 KLK6 KLK7 KLK8 KLK9 *KLKB1 *KLLN KLRB1 KLRC1 KLRC2 KLRC3 *KLRC4 KLRD1 KLRF1 KLRF2 KLRG1 KLRG2 KLRK1 KMO *KMT2A *KMT2B *KMT2C *KMT2D *KMT2E KMT5A *KMT5B KMT5C KNCN KNDC1 *KNG1 *KNL1 KNOP1 *KNSTRN KNTC1 KPNA1 KPNA2 *KPNA3 KPNA4 KPNA5 KPNA6 *KPNA7 KPNB1 KPRP *KPTN *KRAS KRBA1 KRBA2 KRBOX1 KRBOX4 KRCC1 *KREMEN1 KREMEN2 KRI1 *KRIT1 KRR1 *KRT1 *KRT10 *KRT12 *KRT13 *KRT14 KRT15 *KRT16 *KRT17 *KRT18 KRT19 *KRT2 KRT20 KRT222 KRT23 KRT24 *KRT25 KRT26 KRT27 KRT28 *KRT3 KRT31 KRT32 KRT33A KRT33B KRT34 KRT35 KRT36 KRT37 KRT38 KRT39 *KRT4 KRT40 *KRT5 *KRT6A *KRT6B *KRT6C KRT7 *KRT71 KRT72 KRT73 *KRT74 KRT75 KRT76 KRT77 KRT78 KRT79 KRT8 KRT80 *KRT81 KRT82 *KRT83 KRT84 *KRT85 *KRT86 *KRT9 KRTAP1-1 KRTAP1-3 KRTAP1-4 KRTAP1-5 KRTAP10-1 KRTAP10-10 KRTAP10-11 KRTAP10-12 KRTAP10-2 KRTAP10-3 KRTAP10-4 KRTAP10-5 KRTAP10-6 KRTAP10-7 KRTAP10-8 KRTAP10-9 KRTAP11-1 KRTAP12-1 KRTAP12-2 KRTAP12-3 KRTAP12-4 KRTAP13-1 KRTAP13-2 KRTAP13-3 KRTAP13-4 KRTAP15-1 KRTAP16-1 KRTAP17-1 KRTAP19-1 KRTAP19-2 KRTAP19-3 KRTAP19-4 KRTAP19-5 KRTAP19-6 KRTAP19-7 KRTAP19-8 KRTAP2-1 KRTAP2-2 KRTAP2-3 KRTAP2-4 KRTAP20-1 KRTAP20-2 KRTAP20-3 KRTAP21-1 KRTAP21-2 KRTAP21-3 KRTAP22-1 KRTAP22-2 KRTAP23-1 KRTAP24-1 KRTAP25-1 KRTAP26-1 KRTAP27-1 KRTAP29-1 KRTAP3-1 KRTAP3-2 KRTAP3-3 KRTAP4-1 KRTAP4-11 KRTAP4-12 KRTAP4-2 KRTAP4-3 KRTAP4-4 KRTAP4-5 KRTAP4-6 KRTAP4-7 KRTAP4-8 KRTAP4-9 KRTAP5-1 KRTAP5-10 KRTAP5-11 KRTAP5-2 KRTAP5-3 KRTAP5-4 KRTAP5-5 KRTAP5-6 KRTAP5-7 KRTAP5-8 KRTAP5-9 KRTAP6-1 KRTAP6-2 KRTAP6-3 KRTAP7-1 KRTAP8-1 KRTAP9-1 KRTAP9-2 KRTAP9-3 KRTAP9-4 KRTAP9-6 KRTAP9-7 KRTAP9-8 KRTAP9-9 KRTCAP2 KRTCAP3 KRTDAP KSR1 KSR2 KTI12 KTN1 KXD1 *KY KYAT1 KYAT3 *KYNU *L1CAM L1TD1 *L2HGDH L3HYPDH L3MBTL1 L3MBTL2 L3MBTL3 L3MBTL4 *LACC1 LACRT LACTB LACTB2 LACTBL1 LAD1 LAG3 *LAGE3 LAIR1 LAIR2 LALBA *LAMA1 *LAMA2 *LAMA3 *LAMA4 *LAMA5 *LAMB1 *LAMB2 *LAMB3 LAMB4 LAMC1 *LAMC2 *LAMC3 LAMP1 *LAMP2 LAMP3 LAMP5 LAMTOR1 *LAMTOR2 LAMTOR3 LAMTOR4 LAMTOR5 LANCL1 LANCL2 LANCL3 LAP3 LAPTM4A LAPTM4B LAPTM5 *LARGE1 LARGE2 LARP1 LARP1B LARP4 LARP4B LARP6 *LARP7 LARS *LARS1 *LARS2 *LAS1L LASP1 *LAT LAT2 LATS1 LATS2 LAX1 LAYN LBH LBHD1 LBHD2 LBP *LBR *LBX1 LBX2 *LCA5 LCA5L *LCAT LCE1A LCE1B LCE1C LCE1D LCE1E LCE1F LCE2A LCE2B LCE2C LCE2D LCE3A LCE3B LCE3C LCE3D LCE3E LCE4A LCE5A LCE6A *LCK LCLAT1 LCMT1 LCMT2 LCN1 LCN10 LCN12 LCN15 LCN2 LCN6 LCN8 LCN9 LCNL1 LCOR LCORL LCP1 *LCP2 *LCT LCTL LDAH LDB1 LDB2 *LDB3 *LDHA LDHAL6A LDHAL6B *LDHB LDHC *LDHD *LDLR LDLRAD1 LDLRAD2 LDLRAD3 LDLRAD4 *LDLRAP1 LDOC1 LEAP2 LECT2 LEF1 LEFTY1 LEFTY2 LEKR1 LELP1 LEMD1 *LEMD2 *LEMD3 LENEP LENG1 LENG8 LENG9 LEO1 *LEP *LEPR LEPROT LEPROTL1 *LETM1 LETM2 LETMD1 LEUTX LEXM *LFNG LGALS1 LGALS12 LGALS13 LGALS14 LGALS16 LGALS2 LGALS3 LGALS3BP LGALS4 LGALS7 LGALS7B LGALS8 LGALS9 LGALS9B LGALS9C LGALSL *LGI1 LGI2 *LGI3 *LGI4 LGMN *LGR4 LGR5 LGR6 LGSN *LHB *LHCGR LHFPL1 LHFPL2 LHFPL3 LHFPL4 *LHFPL5 LHFPL6 LHPP *LHX1 LHX2 *LHX3 *LHX4 LHX5 LHX6 LHX8 LHX9 *LIAS LIF *LIFR *LIG1 *LIG3 *LIG4 LILRA1 LILRA2 LILRA4 LILRA5 LILRA6 LILRB1 LILRB2 LILRB3 LILRB4 LILRB5 *LIM2 LIMA1 LIMCH1 LIMD1 LIMD2 LIME1 *LIMK1 LIMK2 LIMS1 *LIMS2 LIMS3 LIMS4 LIN28A *LIN28B LIN37 LIN52 LIN54 LIN7A LIN7B LIN7C LIN9 *LINGO1 LINGO2 LINGO3 LINGO4 *LINS1 *LIPA *LIPC *LIPE LIPF LIPG *LIPH LIPI LIPJ LIPK LIPM *LIPN *LIPT1 *LIPT2 *LITAF LIX1 LIX1L LKAAEAR1 LLCFC1 LLGL1 LLGL2 LLPH *LMAN1 LMAN1L LMAN2 *LMAN2L *LMBR1 LMBR1L *LMBRD1 *LMBRD2 LMCD1 *LMF1 LMF2 LMLN LMLN2 *LMNA *LMNB1 *LMNB2 LMNTD1 LMNTD2 *LMO1 LMO2 LMO3 LMO4 LMO7 *LMOD1 *LMOD2 *LMOD3 LMTK2 LMTK3 *LMX1A *LMX1B LNP1 LNPEP *LNPK LNX1 LNX2 *LONP1 LONP2 LONRF1 LONRF2 LONRF3 LOR *LORICRIN *LOX *LOXHD1 *LOXL1 LOXL2 *LOXL3 LOXL4 LPA LPAR1 LPAR2 LPAR3 LPAR4 LPAR5 *LPAR6 LPCAT1 LPCAT2 LPCAT3 LPCAT4 LPGAT1 *LPIN1 *LPIN2 LPIN3 *LPL LPO *LPP LPXN *LRAT *LRBA LRCH1 LRCH2 LRCH3 LRCH4 LRCOL1 LRFN1 LRFN2 LRFN3 LRFN4 LRFN5 LRG1 LRGUK *LRIF1 LRIG1 *LRIG2 LRIG3 LRIT1 LRIT2 *LRIT3 *LRMDA LRMP *LRP1 LRP10 LRP11 *LRP12 LRP1B *LRP2 LRP2BP LRP3 *LRP4 *LRP5 LRP5L *LRP6 LRP8 *LRPAP1 *LRPPRC LRR1 LRRC1 LRRC10 LRRC10B LRRC14 LRRC14B LRRC15 LRRC17 LRRC18 LRRC19 LRRC2 LRRC20 *LRRC23 LRRC24 LRRC25 LRRC26 LRRC27 LRRC28 LRRC29 LRRC3 LRRC30 LRRC31 *LRRC32 LRRC34 LRRC36 LRRC37A LRRC37A2 LRRC37A3 LRRC37B LRRC38 LRRC39 LRRC3B LRRC3C LRRC4 LRRC40 LRRC41 LRRC42 LRRC43 LRRC45 LRRC46 LRRC47 LRRC49 LRRC4B LRRC4C LRRC52 LRRC53 LRRC55 *LRRC56 LRRC57 LRRC58 LRRC59 LRRC6 LRRC61 LRRC63 LRRC66 LRRC69 LRRC7 LRRC70 LRRC71 LRRC72 LRRC73 LRRC74A LRRC74B LRRC75A LRRC75B *LRRC8A LRRC8B LRRC8C LRRC8D LRRC8E LRRC9 LRRCC1 LRRD1 LRRFIP1 LRRFIP2 LRRIQ1 LRRIQ3 LRRIQ4 *LRRK1 *LRRK2 LRRN1 LRRN2 LRRN3 LRRN4 LRRN4CL LRRTM1 LRRTM2 LRRTM3 LRRTM4 *LRSAM1 LRTM1 LRTM2 *LRTOMT LRWD1 LSAMP LSG1 LSM1 LSM10 *LSM11 LSM12 LSM14A LSM14B LSM2 LSM3 LSM4 LSM5 LSM6 LSM7 LSM8 LSMEM1 LSMEM2 LSP1 LSR *LSS LST1 LTA LTA4H LTB LTB4R LTB4R2 *LTBP1 *LTBP2 *LTBP3 *LTBP4 LTBR *LTC4S LTF LTK LTN1 LTO1 *LTV1 LUC7L LUC7L2 LUC7L3 LUM LURAP1 LURAP1L *LUZP1 LUZP2 LUZP4 LUZP6 LVRN LXN LY6D LY6E LY6G5B LY6G5C LY6G6C LY6G6D LY6G6F LY6H LY6K LY6L LY75 LY86 LY9 LY96 LYAR LYG1 LYG2 LYL1 *LYN LYNX1 LYPD1 LYPD2 LYPD3 LYPD4 LYPD5 LYPD6 LYPD6B LYPD8 LYPLA1 LYPLA2 LYPLAL1 LYRM1 LYRM2 *LYRM4 *LYRM7 LYRM9 *LYSET LYSMD1 LYSMD2 LYSMD3 LYSMD4 *LYST LYVE1 *LYZ LYZL1 LYZL2 LYZL4 LYZL6 LZIC *LZTFL1 *LZTR1 *LZTS1 LZTS2 LZTS3 *M1AP M6PR MAATS1 *MAB21L1 *MAB21L2 MAB21L3 MAB21L4 MACC1 *MACF1 MACO1 MACROD1 MACROD2 *MACROH2A1 *MAD1L1 MAD2L1 MAD2L1BP *MAD2L2 MADCAM1 *MADD MAEA MAEL *MAF MAF1 *MAFA *MAFB MAFF MAFG MAFK *MAG MAGEA1 MAGEA10 MAGEA11 MAGEA12 MAGEA2 MAGEA2B MAGEA3 MAGEA4 MAGEA6 MAGEA8 MAGEA9 MAGEA9B MAGEB1 MAGEB10 MAGEB16 MAGEB17 MAGEB18 MAGEB2 MAGEB3 MAGEB4 MAGEB5 MAGEB6 MAGEC1 MAGEC2 MAGEC3 MAGED1 *MAGED2 MAGED4 MAGED4B MAGEE1 MAGEE2 MAGEF1 MAGEH1 *MAGEL2 MAGI1 *MAGI2 MAGI3 MAGIX MAGOH MAGOHB *MAGT1 MAIP1 MAJIN *MAK MAK16 MAL MAL2 MALL MALRD1 MALSU1 *MALT1 MAMDC2 MAMDC4 MAML1 MAML2 MAML3 *MAMLD1 MAMSTR MAN1A1 MAN1A2 *MAN1B1 MAN1C1 MAN2A1 MAN2A2 *MAN2B1 MAN2B2 *MAN2C1 *MANBA MANBAL MANEA MANEAL *MANF MANSC1 MANSC4 *MAOA MAOB MAP10 MAP1A *MAP1B MAP1LC3A MAP1LC3B MAP1LC3B2 MAP1LC3C MAP1S MAP2 *MAP2K1 *MAP2K2 MAP2K3 MAP2K4 MAP2K5 MAP2K6 MAP2K7 *MAP3K1 MAP3K10 MAP3K11 MAP3K12 MAP3K13 *MAP3K14 MAP3K15 MAP3K19 MAP3K2 *MAP3K20 MAP3K21 MAP3K3 MAP3K4 MAP3K5 MAP3K6 *MAP3K7 MAP3K7CL *MAP3K8 MAP3K9 MAP4 MAP4K1 MAP4K2 MAP4K3 MAP4K4 MAP4K5 MAP6 MAP6D1 MAP7 MAP7D1 MAP7D2 MAP7D3 MAP9 *MAPK1 *MAPK10 MAPK11 MAPK12 MAPK13 MAPK14 MAPK15 MAPK1IP1L MAPK3 MAPK4 MAPK6 MAPK7 MAPK8 *MAPK8IP1 MAPK8IP2 *MAPK8IP3 MAPK9 MAPKAP1 MAPKAPK2 *MAPKAPK3 *MAPKAPK5 *MAPKBP1 MAPRE1 *MAPRE2 MAPRE3 *MAPT MARC1 MARC2 MARCH1 MARCH10 MARCH11 MARCH2 MARCH3 MARCH4 MARCH5 MARCH6 MARCH7 MARCH8 MARCH9 *MARCHF6 MARCKS MARCKSL1 MARCO MARCOL MARF1 MARK1 MARK2 *MARK3 MARK4 MARS *MARS1 *MARS2 MARVELD1 *MARVELD2 MARVELD3 MAS1 MAS1L *MASP1 *MASP2 *MAST1 MAST2 *MAST3 MAST4 MASTL *MAT1A *MAT2A MAT2B MATK MATN1 MATN2 *MATN3 MATN4 *MATR3 MAU2 MAVS *MAX MAZ *MB MB21D2 MBD1 MBD2 MBD3 MBD3L1 MBD3L2 MBD3L2B MBD3L3 MBD3L4 MBD3L5 *MBD4 *MBD5 MBD6 MBIP *MBL2 MBLAC1 MBLAC2 MBNL1 MBNL2 MBNL3 MBOAT1 MBOAT2 MBOAT4 *MBOAT7 MBP MBTD1 *MBTPS1 *MBTPS2 *MC1R *MC2R MC3R *MC4R MC5R MCAM *MCAT *MCC *MCCC1 *MCCC2 MCCD1 *MCEE MCEMP1 MCF2 MCF2L MCF2L2 *MCFD2 MCHR1 MCHR2 *MCIDAS MCL1 *MCM10 *MCM2 MCM3 *MCM3AP *MCM4 *MCM5 *MCM6 *MCM7 *MCM8 *MCM9 MCMBP MCMDC2 *MCOLN1 MCOLN2 MCOLN3 *MCPH1 MCRIP1 MCRIP2 MCRS1 MCTP1 *MCTP2 *MCTS1 MCU MCUB MCUR1 MDC1 MDFI *MDFIC MDFIC2 MDGA1 MDGA2 *MDH1 MDH1B *MDH2 MDK MDM1 *MDM2 *MDM4 MDN1 MDP1 MDS2 ME1 ME2 ME3 MEA1 MEAF6 MEAK7 *MECOM *MECP2 *MECR MED1 MED10 *MED11 *MED12 *MED12L *MED13 *MED13L MED14 MED14OS MED15 MED16 *MED17 MED18 MED19 MED20 MED21 MED22 *MED23 MED24 *MED25 MED26 *MED27 MED28 MED29 MED30 MED31 MED4 MED6 MED7 MED8 MED9 MEDAG *MEF2A MEF2B *MEF2C MEF2D *MEFV *MEG3 MEG8 *MEGF10 MEGF11 MEGF6 *MEGF8 MEGF9 *MEI1 MEI4 MEIG1 MEIKIN *MEIOB MEIOC MEIS1 *MEIS2 MEIS3 MELK MELTF MEMO1 *MEN1 *MEOX1 MEOX2 MEP1A MEP1B MEPCE MEPE *MERTK *MESD MESP1 *MESP2 MEST *MET METAP1 METAP1D METAP2 METRN METRNL METTL1 METTL11B METTL14 METTL15 METTL16 METTL17 METTL18 METTL21A METTL21C METTL22 *METTL23 METTL24 METTL25 METTL26 *METTL27 METTL2A METTL2B METTL3 METTL4 *METTL5 METTL6 METTL7A METTL7B METTL8 METTL9 MEX3A MEX3B MEX3C MEX3D MFAP1 MFAP2 MFAP3 MFAP3L MFAP4 *MFAP5 *MFF MFGE8 MFHAS1 MFN1 *MFN2 MFNG *MFRP MFSD1 MFSD10 MFSD11 MFSD12 MFSD13A MFSD14A MFSD14B MFSD14C *MFSD2A MFSD2B MFSD3 MFSD4A MFSD4B MFSD5 MFSD6 MFSD6L *MFSD8 MFSD9 MGA MGAM MGAM2 MGARP MGAT1 *MGAT2 MGAT3 MGAT4A MGAT4B MGAT4C MGAT4D MGAT5 MGAT5B MGLL *MGME1 *MGMT *MGP MGRN1 MGST1 MGST2 MGST3 MIA MIA2 *MIA3 *MIB1 MIB2 MICA *MICAL1 MICAL2 MICAL3 MICALCL MICALL1 MICALL2 MICB *MICOS13 *MICU1 MICU2 MICU3 *MID1 MID1IP1 *MID2 MIDN *MIEF1 *MIEF2 MIEN1 MIER1 MIER2 MIER3 *MIF MIF4GD MIGA1 MIGA2 MIIP MILR1 MINAR1 *MINAR2 MINDY1 MINDY2 MINDY3 MINDY4 MINDY4B MINK1 MINOS1 *MINPP1 MIOS MIOX *MIP *MIPEP MIPOL1 *MIR140 *MIR17HG *MIR184 *MIR204 *MIR96 MIS12 MIS18A MIS18BP1 MISP MISP3 MITD1 *MITF MIXL1 MKI67 *MKKS MKLN1 MKNK1 MKNK2 MKRN1 MKRN2 MKRN2OS *MKRN3 *MKS1 MKX MLANA *MLC1 MLEC MLF1 MLF2 *MLH1 *MLH3 *MLIP MLKL MLLT1 *MLLT10 MLLT11 MLLT3 MLLT6 MLN MLNR *MLPH MLST8 *MLX MLXIP *MLXIPL *MLYCD *MMAA *MMAB *MMACHC *MMADHC MMD MMD2 *MME *MMEL1 MMGT1 *MMP1 MMP10 MMP11 MMP12 *MMP13 *MMP14 MMP15 MMP16 MMP17 *MMP19 *MMP2 *MMP20 *MMP21 *MMP23B MMP24 MMP24OS MMP25 MMP26 MMP27 MMP28 MMP3 MMP7 MMP8 *MMP9 MMRN1 MMRN2 MMS19 MMS22L *MMUT *MN1 MNAT1 MND1 MNDA *MNS1 MNT *MNX1 MOAP1 MOB1A MOB1B MOB2 MOB3A MOB3B MOB3C MOB4 MOBP *MOCOS *MOCS1 *MOCS2 MOCS3 *MOG MOGAT1 MOGAT2 MOGAT3 *MOGS MOK MON1A MON1B MON2 MORC1 *MORC2 MORC3 MORC4 MORF4L1 MORF4L2 MORN1 MORN2 MORN3 MORN4 MORN5 *MOS MOSMO MOSPD1 MOSPD2 MOSPD3 MOV10 *MOV10L1 MOXD1 *MPC1 MPC1L MPC2 *MPDU1 *MPDZ *MPEG1 MPG MPHOSPH10 MPHOSPH6 MPHOSPH8 MPHOSPH9 *MPI *MPIG6B *MPL *MPLKIP MPND *MPO MPP1 MPP2 MPP3 MPP4 MPP5 MPP6 MPP7 MPPE1 MPPED1 MPPED2 MPRIP MPST *MPV17 MPV17L MPV17L2 *MPZ MPZL1 *MPZL2 MPZL3 MR1 *MRAP MRAP2 *MRAS MRC1 MRC2 *MRE11 MREG MRFAP1 MRFAP1L1 MRGBP MRGPRD MRGPRE MRGPRF MRGPRG MRGPRX1 MRGPRX2 MRGPRX3 MRGPRX4 MRI1 MRLN MRM1 *MRM2 MRM3 MRNIP MRO MROH1 MROH2A MROH2B MROH5 MROH6 MROH7 MROH8 MROH9 MRPL1 MRPL10 MRPL11 *MRPL12 MRPL13 MRPL14 MRPL15 MRPL16 MRPL17 MRPL18 MRPL19 MRPL2 MRPL20 MRPL21 MRPL22 MRPL23 MRPL24 MRPL27 MRPL28 *MRPL3 MRPL30 MRPL32 MRPL33 MRPL34 MRPL35 MRPL36 MRPL37 MRPL38 *MRPL39 MRPL4 MRPL40 MRPL41 MRPL42 MRPL43 *MRPL44 MRPL45 MRPL46 MRPL47 MRPL48 MRPL49 MRPL50 MRPL51 MRPL52 MRPL53 MRPL54 MRPL55 MRPL57 MRPL58 MRPL9 MRPS10 MRPS11 MRPS12 *MRPS14 MRPS15 *MRPS16 MRPS17 MRPS18A MRPS18B MRPS18C *MRPS2 MRPS21 *MRPS22 *MRPS23 MRPS24 *MRPS25 MRPS26 MRPS27 *MRPS28 MRPS30 MRPS31 MRPS33 *MRPS34 MRPS35 MRPS36 MRPS5 MRPS6 *MRPS7 MRPS9 MRRF MRS2 *MRTFA MRTFB MRTO4 MRVI1 *MS4A1 MS4A10 MS4A12 MS4A13 MS4A14 MS4A15 MS4A18 MS4A2 MS4A3 MS4A4A MS4A4E MS4A5 MS4A6A MS4A6E MS4A7 MS4A8 MSANTD1 MSANTD2 MSANTD3 MSANTD4 MSC MSGN1 *MSH2 *MSH3 *MSH4 *MSH5 *MSH6 MSI1 MSI2 MSL1 MSL2 *MSL3 MSLN MSMB *MSMO1 MSMP *MSN *MSR1 MSRA MSRB1 MSRB2 *MSRB3 MSS51 *MST1 *MST1R *MSTN *MSTO1 *MSX1 *MSX2 *MT-ATP6 *MT-ATP8 *MT-CO1 *MT-CO2 *MT-CO3 *MT-CYB *MT-ND1 *MT-ND2 *MT-ND3 *MT-ND4 *MT-ND4L *MT-ND5 *MT-ND6 *MT-RNR1 MT-RNR2 MT-TA *MT-TC MT-TD *MT-TE *MT-TF MT-TG *MT-TH *MT-TI *MT-TK *MT-TL1 *MT-TL2 MT-TM *MT-TN *MT-TP *MT-TQ MT-TR *MT-TS1 *MT-TS2 *MT-TT *MT-TV *MT-TW MT-TY MT1A MT1B MT1E MT1F MT1G MT1H MT1HL1 MT1M MT1X MT2A MT3 MT4 MTA1 MTA2 MTA3 *MTAP MTBP MTCH1 MTCH2 MTCL1 MTCP1 MTDH MTERF1 MTERF2 MTERF3 MTERF4 MTF1 MTF2 *MTFMT MTFP1 MTFR1 MTFR1L MTFR2 MTG1 MTG2 *MTHFD1 MTHFD1L MTHFD2 MTHFD2L *MTHFR *MTHFS MTHFSD MTIF2 MTIF3 MTLN *MTM1 MTMR1 MTMR10 MTMR11 MTMR12 *MTMR14 *MTMR2 MTMR3 MTMR4 MTMR6 MTMR7 MTMR8 MTMR9 MTNR1A *MTNR1B *MTO1 *MTOR *MTPAP MTPN *MTR MTREX MTRF1 MTRF1L *MTRFR MTRNR2L1 MTRNR2L10 MTRNR2L3 MTRNR2L4 MTRNR2L5 MTRNR2L6 MTRNR2L7 MTRNR2L8 *MTRR MTSS1 MTSS1L *MTSS2 *MTTP MTURN MTUS1 MTUS2 MTX1 *MTX2 MTX3 *MUC1 MUC12 MUC13 MUC15 MUC16 MUC17 MUC19 MUC2 MUC20 MUC21 MUC22 MUC3A MUC3B MUC4 MUC5AC *MUC5B MUC6 *MUC7 MUCL1 MUCL3 MUL1 MUM1 MUM1L1 MUS81 *MUSK MUSTN1 MUT *MUTYH MVB12A MVB12B *MVD *MVK MVP MX1 MX2 MXD1 MXD3 MXD4 *MXI1 MXRA5 MXRA7 MXRA8 MYADM MYADML2 MYB MYBBP1A MYBL1 MYBL2 *MYBPC1 MYBPC2 *MYBPC3 MYBPH MYBPHL *MYC MYCBP MYCBP2 MYCBPAP MYCL *MYCN MYCT1 *MYD88 MYDGF MYEF2 MYEOV *MYF5 *MYF6 MYH1 MYH10 *MYH11 MYH13 *MYH14 MYH15 *MYH2 *MYH3 MYH4 *MYH6 *MYH7 MYH7B *MYH8 *MYH9 *MYL1 MYL10 *MYL11 MYL12A MYL12B *MYL2 *MYL3 *MYL4 MYL5 MYL6 MYL6B MYL7 *MYL9 MYLIP *MYLK *MYLK2 MYLK3 MYLK4 MYLPF *MYMK *MYMX MYNN MYO10 *MYO15A MYO15B MYO16 MYO18A *MYO18B MYO19 MYO1A MYO1B MYO1C MYO1D *MYO1E MYO1F MYO1G *MYO1H *MYO3A MYO3B *MYO5A *MYO5B MYO5C *MYO6 *MYO7A MYO7B *MYO9A MYO9B *MYOC *MYOCD MYOCOS *MYOD1 *MYOF MYOG MYOM1 MYOM2 MYOM3 *MYORG *MYOT MYOZ1 *MYOZ2 MYOZ3 *MYPN MYPOP *MYRF MYRFL MYRIP *MYSM1 MYT1 *MYT1L MYZAP MZB1 MZF1 MZT1 MZT2A MZT2B N4BP1 N4BP2 N4BP2L1 N4BP2L2 N4BP3 N6AMT1 *NAA10 NAA11 *NAA15 NAA16 *NAA20 NAA25 NAA30 NAA35 NAA38 NAA40 NAA50 *NAA60 *NAA80 NAAA NAALAD2 NAALADL1 NAALADL2 NAB1 *NAB2 *NABP1 NABP2 NACA NACA2 NACAD *NACC1 NACC2 NADK *NADK2 *NADSYN1 *NAE1 *NAF1 *NAGA NAGK *NAGLU NAGPA *NAGS NAIF1 NAIP *NALCN NAMPT NANOG NANOGNB NANOGP8 *NANOS1 NANOS2 NANOS3 NANP *NANS NAP1L1 NAP1L2 NAP1L3 NAP1L4 NAP1L5 NAPA *NAPB NAPEPLD NAPG NAPRT NAPSA NARF NARS *NARS1 *NARS2 NASP NAT1 NAT10 NAT14 NAT16 *NAT2 NAT8 NAT8B *NAT8L NAT9 NATD1 NAV1 NAV2 NAV3 *NAXD *NAXE *NBAS NBDY *NBEA NBEAL1 *NBEAL2 NBL1 *NBN NBPF1 NBPF10 NBPF11 NBPF12 NBPF14 NBPF15 NBPF19 NBPF20 NBPF26 NBPF3 NBPF4 NBPF6 NBPF9 NBR1 NCALD NCAM1 NCAM2 NCAN *NCAPD2 *NCAPD3 NCAPG *NCAPG2 *NCAPH NCAPH2 NCBP1 NCBP2 NCBP2-AS2 NCBP2L NCBP3 NCCRP1 *NCDN NCEH1 *NCF1 *NCF2 *NCF4 NCK1 NCK2 NCKAP1 *NCKAP1L NCKAP5 NCKAP5L NCKIPSD NCL NCLN NCMAP NCOA1 NCOA2 NCOA3 NCOA4 NCOA5 NCOA6 NCOA7 NCOR1 NCOR2 NCR1 NCR2 NCR3 NCR3LG1 NCS1 *NCSTN NDC1 NDC80 *NDE1 NDEL1 NDFIP1 NDFIP2 *NDN *NDNF NDOR1 *NDP *NDRG1 NDRG2 NDRG3 NDRG4 *NDST1 NDST2 NDST3 NDST4 *NDUFA1 *NDUFA10 *NDUFA11 *NDUFA12 *NDUFA13 *NDUFA2 NDUFA3 *NDUFA4 NDUFA4L2 NDUFA5 *NDUFA6 NDUFA7 *NDUFA8 *NDUFA9 NDUFAB1 *NDUFAF1 *NDUFAF2 *NDUFAF3 *NDUFAF4 *NDUFAF5 *NDUFAF6 NDUFAF7 *NDUFAF8 NDUFB1 *NDUFB10 *NDUFB11 NDUFB2 *NDUFB3 NDUFB4 NDUFB5 NDUFB6 *NDUFB7 *NDUFB8 *NDUFB9 NDUFC1 *NDUFC2 *NDUFS1 *NDUFS2 *NDUFS3 *NDUFS4 NDUFS5 *NDUFS6 *NDUFS7 *NDUFS8 *NDUFV1 *NDUFV2 NDUFV3 *NEB NEBL NECAB1 NECAB2 NECAB3 *NECAP1 NECAP2 *NECTIN1 NECTIN2 NECTIN3 *NECTIN4 NEDD1 NEDD4 *NEDD4L NEDD8 NEDD9 *NEFH *NEFL NEFM NEGR1 NEIL1 NEIL2 NEIL3 *NEK1 *NEK10 NEK11 *NEK2 NEK3 NEK4 NEK5 NEK6 NEK7 *NEK8 *NEK9 *NELFA NELFB NELFCD NELFE NELL1 NELL2 *NEMF NEMP1 NEMP2 NENF NEO1 *NEPRO NES NET1 NETO1 NETO2 *NEU1 NEU2 NEU3 NEU4 NEURL1 NEURL1B NEURL2 NEURL3 NEURL4 *NEUROD1 *NEUROD2 NEUROD4 NEUROD6 *NEUROG1 NEUROG2 *NEUROG3 *NEXMIF *NEXN *NF1 *NF2 NFAM1 *NFASC NFAT5 NFATC1 *NFATC2 NFATC2IP NFATC3 NFATC4 NFE2 NFE2L1 *NFE2L2 NFE2L3 NFE4 *NFIA *NFIB NFIC NFIL3 *NFIX *NFKB1 *NFKB2 *NFKBIA NFKBIB NFKBID NFKBIE *NFKBIL1 NFKBIZ NFRKB *NFS1 *NFU1 NFX1 NFXL1 NFYA NFYB NFYC NGB NGDN NGEF *NGF NGFR *NGLY1 NGRN *NHEJ1 *NHERF1 NHLH1 *NHLH2 *NHLRC1 *NHLRC2 NHLRC3 NHLRC4 *NHP2 *NHS NHSL1 NHSL2 NICN1 NID1 NID2 NIF3L1 NIFK NIM1K *NIN NINJ1 NINJ2 NINL NIP7 *NIPA1 *NIPA2 NIPAL1 NIPAL2 NIPAL3 *NIPAL4 *NIPBL NIPSNAP1 NIPSNAP2 NIPSNAP3A NIPSNAP3B NISCH NIT1 NIT2 NKAIN1 NKAIN2 NKAIN3 NKAIN4 *NKAP NKAPD1 NKAPL NKD1 NKD2 NKG7 NKIRAS1 NKIRAS2 NKPD1 NKRF NKTR NKX1-1 NKX1-2 *NKX2-1 NKX2-2 NKX2-3 NKX2-4 *NKX2-5 *NKX2-6 NKX2-8 NKX3-1 *NKX3-2 NKX6-1 *NKX6-2 NKX6-3 NLE1 *NLGN1 NLGN2 *NLGN3 *NLGN4X NLGN4Y NLK NLN NLRC3 *NLRC4 NLRC5 *NLRP1 NLRP10 NLRP11 *NLRP12 NLRP13 NLRP14 *NLRP2 NLRP2B *NLRP3 NLRP4 *NLRP5 NLRP6 *NLRP7 NLRP8 NLRP9 NLRX1 NMB NMBR NMD3 NME1 NME2 NME3 NME4 *NME5 NME6 NME7 *NME8 NME9 NMI *NMNAT1 NMNAT2 NMNAT3 NMRAL1 NMRK1 NMRK2 NMS NMT1 NMT2 NMU NMUR1 NMUR2 NNAT NNMT *NNT NOA1 NOB1 *NOBOX NOC2L NOC3L NOC4L NOCT NOD1 *NOD2 *NODAL *NOG NOL10 NOL11 NOL12 *NOL3 NOL4 NOL4L NOL6 NOL7 NOL8 NOL9 NOLC1 NOM1 NOMO1 NOMO2 NOMO3 *NONO *NOP10 NOP14 NOP16 NOP2 NOP53 *NOP56 NOP58 NOP9 *NOS1 *NOS1AP NOS2 *NOS3 NOSIP NOSTRIN *NOTCH1 *NOTCH2 NOTCH2NLA NOTCH2NLB *NOTCH2NLC *NOTCH3 NOTCH4 NOTO NOTUM NOV NOVA1 *NOVA2 NOX1 NOX3 NOX4 NOX5 NOXA1 NOXO1 NOXRED1 *NPAP1 NPAP1L NPAS1 NPAS2 NPAS3 NPAS4 NPAT NPB NPBWR1 NPBWR2 *NPC1 NPC1L1 *NPC2 NPDC1 NPEPL1 NPEPPS NPFF NPFFR1 NPFFR2 *NPHP1 *NPHP3 *NPHP4 *NPHS1 *NPHS2 NPIPA1 NPIPA2 NPIPA3 NPIPA5 NPIPA7 NPIPA8 NPIPB11 NPIPB13 NPIPB15 NPIPB3 NPIPB4 NPIPB5 NPIPB6 NPIPB8 NPIPB9 NPL NPLOC4 *NPM1 NPM2 NPM3 NPNT *NPPA NPPB NPPC NPR1 *NPR2 *NPR3 *NPRL2 *NPRL3 NPS NPSR1 NPTN *NPTX1 NPTX2 NPTXR NPVF NPW NPY NPY1R NPY2R NPY4R NPY4R2 NPY5R NQO1 *NQO2 *NR0B1 *NR0B2 NR1D1 NR1D2 NR1H2 NR1H3 *NR1H4 NR1I2 NR1I3 NR2C1 NR2C2 NR2C2AP NR2E1 *NR2E3 *NR2F1 *NR2F2 NR2F6 *NR3C1 *NR3C2 NR4A1 *NR4A2 *NR4A3 *NR5A1 NR5A2 NR6A1 NRAP NRARP *NRAS NRBF2 NRBP1 NRBP2 *NRCAM NRDC NRDE2 NREP NRF1 NRG1 NRG2 NRG3 NRG4 NRGN *NRIP1 NRIP2 NRIP3 NRK *NRL NRM NRN1 NRN1L NRP1 NRP2 *NRROS NRSN1 NRSN2 *NRTN *NRXN1 NRXN2 NRXN3 NSA2 *NSD1 *NSD2 NSD3 *NSDHL *NSF NSFL1C NSG1 NSG2 NSL1 NSMAF NSMCE1 *NSMCE2 *NSMCE3 NSMCE4A *NSMF *NSRP1 *NSUN2 *NSUN3 NSUN4 NSUN5 *NSUN6 NSUN7 NT5C NT5C1A NT5C1B *NT5C2 *NT5C3A NT5C3B NT5DC1 NT5DC2 NT5DC3 NT5DC4 *NT5E NT5M NTAN1 NTF3 *NTF4 *NTHL1 NTM NTMT1 *NTN1 NTN3 NTN4 NTN5 *NTNG1 *NTNG2 NTPCR *NTRK1 *NTRK2 NTRK3 NTS NTSR1 NTSR2 NUAK1 *NUAK2 NUB1 NUBP1 NUBP2 *NUBPL NUCB1 NUCB2 NUCKS1 NUDC NUDCD1 NUDCD2 NUDCD3 NUDT1 NUDT10 NUDT11 NUDT12 NUDT13 NUDT14 NUDT15 NUDT16 NUDT16L1 NUDT17 NUDT18 NUDT19 *NUDT2 NUDT21 NUDT22 NUDT3 NUDT4 NUDT4B NUDT5 NUDT6 NUDT7 NUDT8 NUDT9 NUF2 NUFIP1 NUFIP2 NUGGC *NUMA1 NUMB NUMBL *NUP107 *NUP133 NUP153 *NUP155 *NUP160 *NUP188 *NUP205 NUP210 NUP210L *NUP214 NUP35 *NUP37 NUP43 NUP50 *NUP54 NUP58 *NUP62 NUP62CL *NUP85 *NUP88 *NUP93 NUP98 NUPL2 NUPR1 NUPR2 *NUS1 NUSAP1 NUTF2 *NUTM1 NUTM2A NUTM2B *NUTM2B-AS1 NUTM2D NUTM2E NUTM2F NUTM2G NVL NWD1 NWD2 NXF1 NXF2 NXF2B NXF3 NXF5 *NXN NXNL1 NXNL2 NXPE1 NXPE2 NXPE3 NXPE4 NXPH1 NXPH2 NXPH3 NXPH4 NXT1 NXT2 NYAP1 NYAP2 NYNRIN *NYX OAF OARD1 *OAS1 OAS2 OAS3 OASL *OAT OAZ1 OAZ2 OAZ3 OBP2A OBP2B *OBSCN *OBSL1 OC90 *OCA2 OCEL1 OCIAD1 OCIAD2 OCLM *OCLN OCM OCM2 *OCRL OCSTAMP *ODAD1 *ODAD2 *ODAD3 *ODAD4 ODAM *ODAPH *ODC1 ODF1 ODF2 ODF2L ODF3 ODF3B ODF3L1 ODF3L2 ODF4 ODR4 OFCC1 *OFD1 OGA *OGDH *OGDHL OGFOD1 OGFOD2 OGFOD3 OGFR OGFRL1 *OGG1 OGN *OGT OIP5 OIT3 OLA1 OLAH OLFM1 OLFM2 OLFM3 OLFM4 OLFML1 OLFML2A OLFML2B OLFML3 OLIG1 OLIG2 OLIG3 OLR1 OMA1 OMD OMG OMP ONECUT1 ONECUT2 ONECUT3 OOEP OOSP2 OOSP3 OOSP4A OOSP4B *OPA1 *OPA3 OPALIN *OPCML *OPHN1 *OPLAH *OPN1LW *OPN1MW OPN1MW2 OPN1MW3 *OPN1SW OPN3 OPN4 OPN5 OPRD1 OPRK1 OPRL1 OPRM1 OPRPN OPTC *OPTN OR10A2 OR10A3 OR10A4 OR10A5 OR10A6 OR10A7 OR10AC1 OR10AD1 OR10AG1 OR10C1 OR10D3 OR10G2 OR10G3 OR10G4 OR10G6 OR10G7 OR10G8 OR10G9 OR10H1 OR10H2 OR10H3 OR10H4 OR10H5 OR10J1 OR10J3 OR10J4 OR10J5 OR10K1 OR10K2 OR10P1 OR10Q1 OR10R2 OR10S1 OR10T2 OR10V1 OR10W1 OR10X1 OR10Z1 OR11A1 OR11G2 OR11H1 OR11H12 OR11H2 OR11H4 OR11H6 OR11H7 OR11L1 OR12D1 OR12D2 OR12D3 OR13A1 OR13C2 OR13C3 OR13C4 OR13C5 OR13C7 OR13C8 OR13C9 OR13D1 OR13F1 OR13G1 OR13H1 OR13J1 OR14A16 OR14A2 OR14C36 OR14I1 OR14J1 OR14K1 OR1A1 OR1A2 OR1B1 OR1C1 OR1D2 OR1D4 OR1D5 OR1E1 OR1E2 OR1E3 OR1F1 OR1G1 OR1I1 OR1J1 OR1J2 OR1J4 OR1K1 OR1L1 OR1L3 OR1L4 OR1L6 OR1L8 OR1M1 OR1N1 OR1N2 OR1P1 OR1Q1 OR1S1 OR1S2 OR2A1 OR2A12 OR2A14 OR2A2 OR2A25 OR2A4 OR2A42 OR2A5 OR2A7 OR2AE1 OR2AG1 OR2AG2 OR2AJ1 OR2AK2 OR2AP1 OR2AT4 OR2B11 OR2B2 OR2B3 OR2B6 OR2C1 OR2C3 OR2D2 OR2D3 OR2F1 OR2F2 OR2G2 OR2G3 OR2G6 OR2H1 OR2H2 OR2J1 OR2J2 OR2J3 OR2K2 OR2L13 OR2L2 OR2L3 OR2L5 OR2L8 OR2M2 OR2M3 OR2M4 OR2M5 OR2M7 OR2S2 OR2T1 OR2T10 OR2T11 OR2T12 OR2T2 OR2T27 OR2T29 OR2T3 OR2T33 OR2T34 OR2T35 OR2T4 OR2T5 OR2T6 OR2T7 OR2T8 OR2V1 OR2V2 OR2W1 OR2W3 OR2W5 OR2Y1 OR2Z1 OR3A1 OR3A2 OR3A3 OR4A15 OR4A16 OR4A47 OR4A5 OR4A8 OR4B1 OR4C11 OR4C12 OR4C13 OR4C15 OR4C16 OR4C3 OR4C45 OR4C46 OR4C5 OR4C6 OR4D1 OR4D10 OR4D11 OR4D2 OR4D5 OR4D6 OR4D9 OR4E1 OR4E2 OR4F15 OR4F16 OR4F17 OR4F21 OR4F29 OR4F3 OR4F4 OR4F5 OR4F6 OR4K1 OR4K13 OR4K14 OR4K15 OR4K17 OR4K2 OR4K3 OR4K5 OR4L1 OR4M1 OR4M2 OR4N2 OR4N4 OR4N5 OR4P4 OR4Q2 OR4Q3 OR4S1 OR4S2 OR4X1 OR4X2 OR51A2 OR51A4 OR51A7 OR51B2 OR51B4 OR51B5 OR51B6 OR51D1 OR51E1 OR51E2 OR51F1 OR51F2 OR51G1 OR51G2 OR51H1 OR51I1 OR51I2 OR51J1 OR51L1 OR51M1 OR51Q1 OR51S1 OR51T1 OR51V1 OR52A1 OR52A5 OR52B2 OR52B4 OR52B6 OR52D1 OR52E1 OR52E2 OR52E4 OR52E5 OR52E6 OR52E8 OR52H1 OR52I1 OR52I2 OR52J3 OR52K1 OR52K2 OR52L1 OR52M1 OR52N1 OR52N2 OR52N4 OR52N5 OR52R1 OR52W1 OR52Z1 OR56A1 OR56A3 OR56A4 OR56A5 OR56B1 OR56B4 OR5A1 OR5A2 OR5AC1 OR5AC2 OR5AK2 OR5AL1 OR5AN1 OR5AP2 OR5AR1 OR5AS1 OR5AU1 OR5B12 OR5B17 OR5B2 OR5B21 OR5B3 OR5C1 OR5D13 OR5D14 OR5D16 OR5D18 OR5F1 OR5G3 OR5H1 OR5H14 OR5H15 OR5H2 OR5H6 OR5H8 OR5I1 OR5J2 OR5K1 OR5K2 OR5K3 OR5K4 OR5L1 OR5L2 OR5M1 OR5M10 OR5M11 OR5M3 OR5M8 OR5M9 OR5P2 OR5P3 OR5R1 OR5T1 OR5T2 OR5T3 OR5V1 OR5W2 OR6A2 OR6B1 OR6B2 OR6B3 OR6C1 OR6C2 OR6C3 OR6C4 OR6C6 OR6C65 OR6C68 OR6C70 OR6C74 OR6C75 OR6C76 OR6F1 OR6J1 OR6K2 OR6K3 OR6K6 OR6M1 OR6N1 OR6N2 OR6P1 OR6Q1 OR6S1 OR6T1 OR6V1 OR6X1 OR6Y1 OR7A10 OR7A17 OR7A5 OR7C1 OR7C2 OR7D2 OR7D4 OR7E24 OR7G1 OR7G2 OR7G3 OR8A1 OR8B12 OR8B2 OR8B3 OR8B4 OR8B8 OR8D1 OR8D2 OR8D4 OR8G1 OR8G5 OR8H1 OR8H2 OR8H3 OR8I2 OR8J1 OR8J2 OR8J3 OR8K1 OR8K3 OR8K5 OR8S1 OR8U1 OR9A2 OR9A4 OR9G1 OR9G4 OR9I1 OR9K2 OR9Q1 OR9Q2 *ORAI1 ORAI2 ORAI3 *ORC1 ORC2 ORC3 *ORC4 ORC5 *ORC6 ORM1 ORM2 ORMDL1 ORMDL2 ORMDL3 OS9 OSBP OSBP2 OSBPL10 OSBPL11 OSBPL1A *OSBPL2 OSBPL3 OSBPL5 OSBPL6 OSBPL7 OSBPL8 OSBPL9 OSCAR OSCP1 OSER1 *OSGEP OSGEPL1 OSGIN1 OSGIN2 OSM *OSMR OSR1 OSR2 OST4 OSTC OSTF1 *OSTM1 OSTN *OTC *OTOA *OTOF *OTOG *OTOGL OTOL1 OTOP1 OTOP2 OTOP3 OTOR OTOS OTP OTUB1 OTUB2 OTUD1 OTUD3 OTUD4 *OTUD5 OTUD6A *OTUD6B *OTUD7A OTUD7B *OTULIN OTULINL OTX1 *OTX2 OVCA2 OVCH1 OVCH2 OVGP1 OVOL1 *OVOL2 OVOL3 OXA1L *OXCT1 OXCT2 OXER1 *OXGR1 OXLD1 OXNAD1 *OXR1 OXSM OXSR1 OXT OXTR P2RX1 *P2RX2 P2RX3 P2RX4 P2RX5 P2RX6 P2RX7 P2RY1 P2RY10 *P2RY11 *P2RY12 P2RY13 P2RY14 P2RY2 P2RY4 P2RY6 P2RY8 *P3H1 *P3H2 P3H3 P3H4 P4HA1 *P4HA2 P4HA3 *P4HB *P4HTM PA2G4 PAAF1 PABPC1 PABPC1L PABPC1L2A PABPC1L2B PABPC3 PABPC4 PABPC4L PABPC5 *PABPN1 PABPN1L PACRG PACRGL *PACS1 *PACS2 PACSIN1 PACSIN2 PACSIN3 PADI1 PADI2 *PADI3 PADI4 *PADI6 PAEP PAF1 *PAFAH1B1 PAFAH1B2 PAFAH1B3 PAFAH2 PAG1 PAGE1 PAGE2 PAGE2B PAGE3 PAGE4 PAGE5 PAGR1 *PAH *PAICS PAIP1 PAIP2 PAIP2B *PAK1 PAK1IP1 *PAK2 *PAK3 PAK4 PAK5 PAK6 *PALB2 PALD1 *PALLD PALM PALM2 PALM3 PALMD PAM *PAM16 PAMR1 PAN2 PAN3 PANK1 *PANK2 PANK3 *PANK4 PANO1 *PANX1 PANX2 PANX3 PAOX PAPLN PAPOLA PAPOLB PAPOLG PAPPA *PAPPA2 PAPSS1 *PAPSS2 PAQR3 PAQR4 PAQR5 PAQR6 PAQR7 PAQR8 PAQR9 PARD3 PARD3B PARD6A PARD6B PARD6G PARG *PARK7 PARL PARM1 *PARN PARP1 PARP10 PARP11 PARP12 PARP14 PARP15 PARP16 PARP2 PARP3 PARP4 PARP6 PARP8 PARP9 PARPBP *PARS2 PARVA PARVB PARVG PASD1 PASK PATE1 PATE2 PATE3 PATE4 PATJ PATL1 *PATL2 PATZ1 PAWR *PAX1 *PAX2 *PAX3 *PAX4 PAX5 *PAX6 *PAX7 *PAX8 *PAX9 PAXBP1 PAXIP1 PAXX PBDC1 PBK PBLD PBOV1 *PBRM1 *PBX1 PBX2 PBX3 PBX4 PBXIP1 *PC *PCARE *PCBD1 PCBD2 PCBP1 PCBP2 PCBP3 PCBP4 *PCCA *PCCB PCDH1 PCDH10 PCDH11X PCDH11Y *PCDH12 *PCDH15 PCDH17 PCDH18 *PCDH19 PCDH20 PCDH7 PCDH8 PCDH9 PCDHA@ PCDHB@ PCDHG@ *PCDHGC4 PCED1A PCED1B PCF11 PCGF1 *PCGF2 PCGF3 PCGF5 PCGF6 PCID2 PCIF1 *PCK1 *PCK2 PCLAF *PCLO PCM1 PCMT1 PCMTD1 PCMTD2 *PCNA PCNP *PCNT PCNX1 PCNX2 PCNX3 PCNX4 PCOLCE PCOLCE2 PCP2 PCP4 PCP4L1 *PCSK1 PCSK1N PCSK2 PCSK4 PCSK5 PCSK6 PCSK7 *PCSK9 PCTP PCYOX1 PCYOX1L *PCYT1A PCYT1B *PCYT2 PDAP1 PDC *PDCD1 *PDCD10 PDCD11 PDCD1LG2 PDCD2 PDCD2L PDCD4 PDCD5 PDCD6 *PDCD6IP PDCD7 PDCL PDCL2 PDCL3 *PDE10A *PDE11A PDE12 PDE1A PDE1B *PDE1C *PDE2A *PDE3A PDE3B PDE4A PDE4B PDE4C *PDE4D PDE4DIP PDE5A *PDE6A *PDE6B *PDE6C *PDE6D *PDE6G *PDE6H PDE7A PDE7B PDE8A *PDE8B PDE9A PDF PDGFA *PDGFB PDGFC PDGFD *PDGFRA *PDGFRB *PDGFRL *PDHA1 *PDHA2 *PDHB *PDHX PDIA2 PDIA3 PDIA4 PDIA5 PDIA6 PDIK1L PDILT PDK1 PDK2 *PDK3 PDK4 PDLIM1 PDLIM2 PDLIM3 *PDLIM4 PDLIM5 PDLIM7 *PDP1 PDP2 PDPK1 *PDPN PDPR PDRG1 PDS5A PDS5B *PDSS1 *PDSS2 *PDX1 PDXDC1 *PDXK PDXP *PDYN PDZD11 PDZD2 PDZD3 PDZD4 *PDZD7 *PDZD8 PDZD9 PDZK1 PDZK1IP1 PDZRN3 PDZRN4 PEA15 PEAK1 PEAK3 PEAR1 PEBP1 PEBP4 PECAM1 PECR PEF1 PEG10 PEG3 PELI1 PELI2 PELI3 PELO PELP1 PEMT PENK *PEPD PER1 *PER2 *PER3 *PERCC1 PERM1 *PERP PES1 *PET100 *PET117 *PEX1 *PEX10 PEX11A *PEX11B PEX11G *PEX12 *PEX13 *PEX14 *PEX16 *PEX19 *PEX2 *PEX26 *PEX3 *PEX5 PEX5L *PEX6 *PEX7 PF4 PF4V1 PFAS PFDN1 PFDN2 PFDN4 PFDN5 PFDN6 PFKFB1 PFKFB2 PFKFB3 PFKFB4 PFKL *PFKM PFKP *PFN1 PFN2 PFN3 PFN4 PGA3 PGA4 PGA5 PGAM1 *PGAM2 PGAM4 PGAM5 *PGAP1 *PGAP2 *PGAP3 PGBD1 PGBD2 PGBD3 PGBD4 PGBD5 PGC PGD PGF PGGHG PGGT1B *PGK1 PGK2 PGLS PGLYRP1 PGLYRP2 PGLYRP3 PGLYRP4 *PGM1 PGM2 *PGM2L1 *PGM3 PGM5 PGP PGPEP1 PGPEP1L *PGR PGRMC1 PGRMC2 PGS1 *PHACTR1 PHACTR2 PHACTR3 PHACTR4 PHAX PHB *PHB1 PHB2 *PHC1 PHC2 PHC3 PHETA1 PHETA2 *PHEX PHF1 PHF10 PHF11 PHF12 PHF13 PHF14 PHF19 PHF2 PHF20 PHF20L1 *PHF21A PHF21B PHF23 PHF24 PHF3 PHF5A *PHF6 PHF7 *PHF8 *PHGDH PHGR1 *PHIP *PHKA1 *PHKA2 *PHKB *PHKG1 *PHKG2 PHLDA1 PHLDA2 PHLDA3 *PHLDB1 PHLDB2 PHLDB3 PHLPP1 PHLPP2 PHOSPHO1 PHOSPHO2 *PHOX2A *PHOX2B PHPT1 PHRF1 PHTF1 PHTF2 *PHYH PHYHD1 PHYHIP PHYHIPL *PHYKPL PI15 PI16 PI3 *PI4K2A PI4K2B *PI4KA *PI4KB PIANP PIAS1 PIAS2 PIAS3 PIAS4 *PIBF1 *PICALM PICK1 PID1 *PIDD1 *PIEZO1 *PIEZO2 PIF1 PIFO *PIGA *PIGB PIGBOS1 *PIGC *PIGF *PIGG *PIGH *PIGK *PIGL *PIGM *PIGN *PIGO *PIGP *PIGQ PIGR *PIGS *PIGT *PIGU *PIGV *PIGW PIGX *PIGY PIGZ PIH1D1 PIH1D2 PIH1D3 PIK3AP1 *PIK3C2A PIK3C2B PIK3C2G PIK3C3 *PIK3CA PIK3CB *PIK3CD *PIK3CG PIK3IP1 *PIK3R1 *PIK3R2 PIK3R3 PIK3R4 *PIK3R5 PIK3R6 *PIKFYVE PILRA PILRB PIM1 PIM2 PIM3 PIMREG PIN1 PIN4 *PINK1 PINLYP PINX1 PIP PIP4K2A PIP4K2B PIP4K2C PIP4P1 PIP4P2 PIP5K1A PIP5K1B *PIP5K1C PIP5KL1 PIPOX PIR PIRT *PISD PITHD1 PITPNA PITPNB PITPNC1 PITPNM1 PITPNM2 *PITPNM3 *PITRM1 *PITX1 *PITX2 *PITX3 PIWIL1 PIWIL2 PIWIL3 PIWIL4 PJA1 PJA2 *PJVK *PKD1 *PKD1L1 PKD1L2 PKD1L3 *PKD2 PKD2L1 PKD2L2 *PKDCC PKDREJ *PKHD1 *PKHD1L1 PKIA PKIB PKIG *PKLR PKM PKMYT1 PKN1 PKN2 PKN3 PKNOX1 PKNOX2 *PKP1 *PKP2 PKP3 PKP4 PLA1A PLA2G10 PLA2G12A PLA2G12B PLA2G15 PLA2G16 PLA2G1B *PLA2G2A PLA2G2C PLA2G2D PLA2G2E PLA2G2F PLA2G3 *PLA2G4A PLA2G4B PLA2G4C PLA2G4D PLA2G4E PLA2G4F *PLA2G5 *PLA2G6 *PLA2G7 PLA2R1 *PLAA *PLAAT3 PLAC1 PLAC8 PLAC8L1 PLAC9 *PLAG1 *PLAGL1 PLAGL2 PLAT *PLAU PLAUR PLB1 PLBD1 PLBD2 *PLCB1 PLCB2 *PLCB3 *PLCB4 *PLCD1 PLCD3 PLCD4 *PLCE1 *PLCG1 *PLCG2 *PLCH1 PLCH2 PLCL1 PLCL2 PLCXD1 PLCXD2 PLCXD3 *PLCZ1 *PLD1 PLD2 *PLD3 PLD4 PLD5 PLD6 *PLEC PLEK PLEK2 PLEKHA1 PLEKHA2 PLEKHA3 PLEKHA4 PLEKHA5 PLEKHA6 PLEKHA7 PLEKHA8 PLEKHB1 PLEKHB2 PLEKHD1 PLEKHF1 PLEKHF2 PLEKHG1 *PLEKHG2 PLEKHG3 *PLEKHG4 PLEKHG4B *PLEKHG5 PLEKHG6 PLEKHG7 PLEKHH1 PLEKHH2 PLEKHH3 PLEKHJ1 *PLEKHM1 PLEKHM2 PLEKHM3 PLEKHN1 PLEKHO1 PLEKHO2 PLEKHS1 PLET1 *PLG PLGLB1 PLGLB2 PLGRKT *PLIN1 PLIN2 PLIN3 *PLIN4 PLIN5 PLK1 PLK2 PLK3 *PLK4 PLK5 PLLP *PLN *PLOD1 *PLOD2 *PLOD3 *PLP1 PLP2 *PLPBP PLPP1 PLPP2 PLPP3 PLPP4 PLPP5 PLPP6 PLPP7 PLPPR1 PLPPR2 PLPPR3 PLPPR4 PLPPR5 PLRG1 *PLS1 *PLS3 PLSCR1 PLSCR2 PLSCR3 PLSCR4 PLSCR5 PLTP *PLVAP PLXDC1 PLXDC2 *PLXNA1 PLXNA2 PLXNA3 PLXNA4 PLXNB1 PLXNB2 PLXNB3 PLXNC1 *PLXND1 PM20D1 PM20D2 PMAIP1 PMCH PMEL PMEPA1 PMF1 *PMFBP1 PMIS2 *PML PMM1 *PMM2 *PMP2 *PMP22 *PMPCA *PMPCB *PMS1 *PMS2 *PMVK PNCK PNISR *PNKD *PNKP *PNLDC1 *PNLIP PNLIPRP1 PNLIPRP2 PNLIPRP3 PNMA1 PNMA2 PNMA3 PNMA5 PNMA6A PNMA6E PNMA6F PNMA8A PNMA8B PNMA8C PNMT PNN PNO1 PNOC *PNP *PNPLA1 *PNPLA2 PNPLA3 PNPLA4 PNPLA5 *PNPLA6 PNPLA7 *PNPLA8 *PNPO *PNPT1 PNRC1 PNRC2 *POC1A *POC1B POC5 PODN PODNL1 *PODXL PODXL2 *POF1B *POFUT1 POFUT2 POGK *POGLUT1 *POGZ *POLA1 POLA2 POLB *POLD1 POLD2 POLD3 POLD4 POLDIP2 POLDIP3 *POLE POLE2 POLE3 POLE4 *POLG *POLG2 *POLH POLI POLK POLL POLM POLN POLQ *POLR1A *POLR1B *POLR1C *POLR1D POLR1E *POLR2A POLR2B POLR2C POLR2D POLR2E POLR2F POLR2G POLR2H POLR2I POLR2J POLR2J2 POLR2J3 POLR2K POLR2L POLR2M *POLR3A *POLR3B POLR3C POLR3D POLR3E *POLR3F POLR3G *POLR3GL *POLR3H *POLR3K *POLRMT POM121 POM121C POM121L12 POM121L2 *POMC *POMGNT1 *POMGNT2 *POMK *POMP *POMT1 *POMT2 POMZP3 *PON1 *PON2 *PON3 *POP1 POP4 POP5 POP7 *POPDC1 POPDC2 *POPDC3 *POR *PORCN POSTN *POT1 POTEB POTEB2 POTEB3 POTEC POTED POTEE POTEF POTEG POTEH POTEI POTEJ POTEM *POU1F1 *POU2AF1 POU2F1 POU2F2 POU2F3 POU3F1 POU3F2 *POU3F3 *POU3F4 *POU4F1 POU4F2 *POU4F3 POU5F1 POU5F1B POU5F2 POU6F1 *POU6F2 PP2D1 PPA1 *PPA2 PPAN PPARA PPARD *PPARG *PPARGC1A PPARGC1B PPAT PPBP PPCDC *PPCS PPDPF PPDPFL PPEF1 PPEF2 PPFIA1 PPFIA2 PPFIA3 PPFIA4 *PPFIBP1 PPFIBP2 PPHLN1 PPIA PPIAL4A PPIAL4C PPIAL4D PPIAL4E PPIAL4F PPIAL4G PPIAL4H *PPIB PPIC PPID PPIE PPIF PPIG PPIH *PPIL1 PPIL2 PPIL3 PPIL4 PPIL6 PPIP5K1 *PPIP5K2 PPL PPM1A *PPM1B *PPM1D PPM1E PPM1F PPM1G PPM1H PPM1J *PPM1K PPM1L PPM1M PPM1N PPME1 *PPOX PPP1CA *PPP1CB PPP1CC PPP1R10 PPP1R11 *PPP1R12A PPP1R12B PPP1R12C PPP1R13B *PPP1R13L PPP1R14A PPP1R14B PPP1R14C PPP1R14D PPP1R15A *PPP1R15B PPP1R16A PPP1R16B *PPP1R17 PPP1R18 PPP1R1A PPP1R1B PPP1R1C PPP1R2 *PPP1R21 PPP1R26 PPP1R27 PPP1R2B PPP1R2C PPP1R32 PPP1R35 PPP1R36 PPP1R37 *PPP1R3A PPP1R3B PPP1R3C PPP1R3D PPP1R3E PPP1R3F PPP1R3G PPP1R42 PPP1R7 PPP1R8 PPP1R9A PPP1R9B *PPP2CA PPP2CB *PPP2R1A *PPP2R1B PPP2R2A *PPP2R2B PPP2R2C PPP2R2D PPP2R3A PPP2R3B *PPP2R3C PPP2R5A PPP2R5B PPP2R5C *PPP2R5D PPP2R5E *PPP3CA PPP3CB PPP3CC PPP3R1 PPP3R2 PPP4C PPP4R1 PPP4R2 PPP4R3A PPP4R3B PPP4R3C PPP4R4 PPP5C PPP5D1 PPP6C PPP6R1 PPP6R2 PPP6R3 PPRC1 *PPT1 PPT2 PPTC7 PPWD1 PPY *PQBP1 PQLC1 PQLC2 PQLC2L PQLC3 PRAC1 PRAC2 PRADC1 PRAF2 PRAG1 PRAM1 PRAME PRAMEF1 PRAMEF10 PRAMEF11 PRAMEF12 PRAMEF14 PRAMEF15 PRAMEF17 PRAMEF18 PRAMEF19 PRAMEF2 PRAMEF20 PRAMEF25 PRAMEF26 PRAMEF27 PRAMEF33 PRAMEF4 PRAMEF5 PRAMEF6 PRAMEF7 PRAMEF8 PRAMEF9 PRAP1 PRB1 PRB2 PRB3 PRB4 PRC1 *PRCC *PRCD PRCP PRDM1 *PRDM10 PRDM11 *PRDM12 *PRDM13 PRDM14 PRDM15 *PRDM16 PRDM2 PRDM4 *PRDM5 *PRDM6 PRDM7 *PRDM8 PRDM9 *PRDX1 PRDX2 *PRDX3 PRDX4 PRDX5 PRDX6 PREB PRELID1 PRELID2 PRELID3A PRELID3B PRELP PREP *PREPL PREX1 PREX2 *PRF1 PRG2 PRG3 *PRG4 PRH1 PRH2 *PRICKLE1 PRICKLE2 *PRICKLE3 PRICKLE4 *PRIM1 PRIM2 PRIMA1 *PRIMPOL PRKAA1 PRKAA2 PRKAB1 PRKAB2 *PRKACA *PRKACB *PRKACG PRKAG1 *PRKAG2 PRKAG3 *PRKAR1A *PRKAR1B PRKAR2A PRKAR2B PRKCA PRKCB *PRKCD PRKCE *PRKCG *PRKCH PRKCI PRKCQ *PRKCSH *PRKCZ *PRKD1 PRKD2 PRKD3 *PRKDC *PRKG1 *PRKG2 *PRKN *PRKRA PRKRIP1 PRKX PRL PRLH PRLHR *PRLR PRM1 PRM2 PRM3 PRMT1 PRMT2 PRMT3 PRMT5 PRMT6 *PRMT7 PRMT8 PRMT9 PRND *PRNP PROB1 *PROC PROCA1 PROCR *PRODH PRODH2 PROK1 *PROK2 PROKR1 *PROKR2 *PROM1 PROM2 *PROP1 *PRORP PRORY *PROS1 PROSER1 PROSER2 PROSER3 PROX1 PROX2 PROZ PRPF18 PRPF19 *PRPF3 *PRPF31 PRPF38A PRPF38B PRPF39 *PRPF4 PRPF40A PRPF40B PRPF4B *PRPF6 *PRPF8 *PRPH *PRPH2 *PRPS1 PRPS1L1 PRPS2 PRPSAP1 PRPSAP2 PRR11 *PRR12 PRR13 PRR14 PRR14L PRR15 PRR15L PRR16 PRR18 PRR19 PRR20A PRR20B PRR20C PRR20D PRR20E PRR20G PRR22 PRR23A PRR23B PRR23C PRR23D1 PRR23D2 PRR25 PRR26 PRR27 PRR29 PRR3 PRR30 PRR32 PRR33 PRR35 PRR36 PRR4 PRR5 PRR5L PRR7 PRR9 PRRC1 PRRC2A PRRC2B PRRC2C PRRG1 PRRG2 PRRG3 PRRG4 PRRT1 PRRT1B *PRRT2 PRRT3 PRRT4 *PRRX1 PRRX2 *PRSS1 *PRSS12 PRSS16 *PRSS2 PRSS21 PRSS22 PRSS23 PRSS27 PRSS3 PRSS33 PRSS35 PRSS36 PRSS37 PRSS38 PRSS41 PRSS42 PRSS43 PRSS45 PRSS48 PRSS50 PRSS51 PRSS53 PRSS54 PRSS55 *PRSS56 PRSS57 PRSS58 PRSS8 PRTFDC1 PRTG *PRTN3 *PRUNE1 PRUNE2 *PRX PRXL2A PRXL2B PRXL2C *PRY *PRY2 *PSAP PSAPL1 *PSAT1 PSCA PSD PSD2 PSD3 PSD4 *PSEN1 *PSEN2 *PSENEN PSG1 PSG11 PSG2 PSG3 PSG4 PSG5 PSG6 PSG7 PSG8 PSG9 PSIP1 PSKH1 PSKH2 PSMA1 PSMA2 PSMA3 PSMA4 PSMA5 PSMA6 PSMA7 PSMA8 *PSMB1 *PSMB10 PSMB11 PSMB2 PSMB3 *PSMB4 PSMB5 PSMB6 PSMB7 *PSMB8 *PSMB9 *PSMC1 PSMC2 *PSMC3 *PSMC3IP PSMC4 PSMC5 PSMC6 PSMD1 PSMD10 PSMD11 *PSMD12 PSMD13 PSMD14 PSMD2 PSMD3 PSMD4 PSMD5 PSMD6 PSMD7 PSMD8 PSMD9 PSME1 PSME2 PSME3 PSME4 PSMF1 PSMG1 *PSMG2 PSMG3 PSMG4 PSORS1C1 PSORS1C2 PSPC1 *PSPH PSPN PSRC1 PSTK *PSTPIP1 PSTPIP2 PTAFR PTAR1 PTBP1 PTBP2 PTBP3 PTCD1 PTCD2 *PTCD3 *PTCH1 *PTCH2 *PTCHD1 PTCHD3 PTCHD4 PTCRA *PTDSS1 PTDSS2 *PTEN PTER *PTF1A PTGDR PTGDR2 PTGDS PTGER1 *PTGER2 PTGER3 PTGER4 PTGES PTGES2 PTGES3 PTGES3L PTGFR PTGFRN PTGIR *PTGIS PTGR1 PTGR2 PTGS1 PTGS2 *PTH *PTH1R PTH2 PTH2R *PTHLH PTK2 PTK2B PTK6 PTK7 PTMA PTMS PTN PTOV1 PTP4A1 PTP4A2 PTP4A3 *PTPA PTPDC1 PTPMT1 *PTPN1 *PTPN11 *PTPN12 PTPN13 *PTPN14 PTPN18 *PTPN2 PTPN20 PTPN21 *PTPN22 *PTPN23 *PTPN3 PTPN4 PTPN5 *PTPN6 PTPN7 PTPN9 PTPRA PTPRB *PTPRC PTPRCAP PTPRD PTPRE *PTPRF PTPRG PTPRH *PTPRJ PTPRK PTPRM PTPRN PTPRN2 *PTPRO *PTPRQ PTPRR PTPRS PTPRT PTPRU PTPRZ1 PTRH1 *PTRH2 *PTRHD1 *PTS PTTG1 PTTG1IP PTTG2 PTX3 PTX4 PUDP *PUF60 *PUM1 PUM2 PUM3 *PURA PURB PURG *PUS1 PUS10 *PUS3 *PUS7 PUS7L PUSL1 PVALB PVALEF PVR PVRIG *PWAR1 PWP1 PWP2 *PWRN1 PWWP2A PWWP2B PXDC1 *PXDN PXDNL *PXK PXMP2 PXMP4 PXN PXT1 PXYLP1 PYCARD *PYCR1 *PYCR2 PYCR3 PYDC1 PYDC2 PYDC5 PYGB *PYGL *PYGM PYGO1 PYGO2 PYHIN1 PYM1 *PYROXD1 PYROXD2 PYURF PYY PZP QARS *QARS1 *QDPR QKI QPCT QPCTL QPRT QRFP QRFPR *QRICH1 *QRICH2 *QRSL1 QSER1 QSOX1 QSOX2 QTRT1 QTRT2 R3HCC1 R3HCC1L R3HDM1 R3HDM2 R3HDM4 R3HDML RAB10 RAB11A *RAB11B RAB11FIP1 RAB11FIP2 RAB11FIP3 RAB11FIP4 RAB11FIP5 RAB12 RAB13 RAB14 RAB15 RAB17 *RAB18 RAB19 RAB1A RAB1B RAB20 RAB21 RAB22A *RAB23 RAB24 RAB25 RAB26 *RAB27A RAB27B *RAB28 RAB29 RAB2A RAB2B RAB30 RAB31 RAB32 RAB33A *RAB33B *RAB34 RAB35 RAB36 RAB37 RAB38 RAB39A *RAB39B RAB3A RAB3B RAB3C RAB3D *RAB3GAP1 *RAB3GAP2 RAB3IL1 RAB3IP RAB40A RAB40AL RAB40B RAB40C RAB41 RAB42 RAB43 RAB44 RAB4A RAB4B RAB5A RAB5B RAB5C *RAB5IF RAB6A RAB6B RAB6C RAB6D *RAB7A RAB7B RAB8A RAB8B RAB9A RAB9B RABAC1 RABEP1 RABEP2 RABEPK RABGAP1 RABGAP1L RABGEF1 RABGGTA RABGGTB RABIF RABL2A RABL2B *RABL3 RABL6 *RAC1 *RAC2 *RAC3 *RACGAP1 RACK1 RAD1 RAD17 RAD18 *RAD21 RAD21L1 RAD23A RAD23B *RAD50 *RAD51 RAD51AP1 RAD51AP2 RAD51B *RAD51C *RAD51D RAD52 *RAD54B *RAD54L RAD54L2 RAD9A RAD9B RADIL RADX RAE1 RAET1E RAET1G RAET1L *RAF1 *RAG1 *RAG2 *RAI1 RAI14 RAI2 *RALA RALB RALBP1 *RALGAPA1 RALGAPA2 RALGAPB RALGDS RALGPS1 RALGPS2 RALY RALYL RAMAC RAMP1 RAMP2 RAMP3 RAN RANBP1 RANBP10 RANBP17 *RANBP2 RANBP3 RANBP3L RANBP6 RANBP9 RANGAP1 *RANGRF RAP1A *RAP1B RAP1GAP RAP1GAP2 *RAP1GDS1 RAP2A RAP2B RAP2C RAPGEF1 *RAPGEF2 RAPGEF3 RAPGEF4 RAPGEF5 RAPGEF6 RAPGEFL1 RAPH1 *RAPSN *RARA *RARB RARG RARRES1 RARRES2 RARRES3 RARS *RARS1 *RARS2 *RASA1 *RASA2 RASA3 RASA4 RASA4B RASAL1 RASAL2 RASAL3 RASD1 RASD2 RASEF RASGEF1A RASGEF1B RASGEF1C RASGRF1 RASGRF2 *RASGRP1 *RASGRP2 RASGRP3 RASGRP4 RASIP1 RASL10A RASL10B RASL11A RASL11B RASL12 RASSF1 RASSF10 RASSF2 RASSF3 RASSF4 RASSF5 RASSF6 RASSF7 RASSF8 RASSF9 RAVER1 RAVER2 *RAX *RAX2 *RB1 *RB1CC1 RBAK RBBP4 RBBP5 RBBP6 RBBP7 *RBBP8 RBBP8NL RBBP9 *RBCK1 RBFA RBFOX1 RBFOX2 RBFOX3 RBKS RBL1 *RBL2 *RBM10 RBM11 *RBM12 RBM12B RBM14 RBM15 RBM15B RBM17 RBM18 RBM19 *RBM20 RBM22 RBM23 RBM24 RBM25 RBM26 RBM27 *RBM28 RBM3 RBM33 RBM34 RBM38 RBM39 RBM4 RBM41 RBM42 RBM43 RBM44 RBM45 RBM46 RBM47 RBM48 RBM4B RBM5 RBM6 RBM7 *RBM8A RBMS1 RBMS2 RBMS3 *RBMX RBMX2 RBMXL1 RBMXL2 RBMXL3 *RBMY1A1 RBMY1B RBMY1D RBMY1E RBMY1F RBMY1J RBP1 RBP2 *RBP3 *RBP4 RBP5 RBP7 *RBPJ RBPJL RBPMS RBPMS2 RBSN RBX1 RC3H1 RC3H2 RCAN1 RCAN2 RCAN3 *RCBTB1 RCBTB2 RCC1 RCC1L RCC2 RCCD1 RCE1 RCHY1 RCL1 RCN1 RCN2 RCN3 RCOR1 RCOR2 RCOR3 RCSD1 RCVRN *RD3 RD3L RDH10 *RDH11 *RDH12 RDH13 RDH14 RDH16 *RDH5 RDH8 RDM1 *RDX *REC114 REC8 RECK *RECQL *RECQL4 RECQL5 REELD1 *REEP1 *REEP2 REEP3 REEP4 REEP5 *REEP6 REG1A REG1B REG3A REG3G REG4 *REL *RELA *RELB RELCH RELL1 RELL2 *RELN *RELT REM1 REM2 *REN RENBP REP15 REPIN1 *REPS1 REPS2 RER1 *RERE RERG RERGL RESP18 *REST *RET *RETN RETNLB *RETREG1 RETREG2 RETREG3 RETSAT REV1 *REV3L REX1BD REXO1 REXO2 REXO4 REXO5 *RFC1 *RFC2 RFC3 RFC4 RFC5 RFESD RFFL RFK RFLNA RFLNB RFNG RFPL1 RFPL2 RFPL3 RFPL4A RFPL4AL1 RFPL4B *RFT1 RFTN1 RFTN2 *RFWD3 RFX1 RFX2 RFX3 RFX4 *RFX5 *RFX6 *RFX7 RFX8 *RFXANK *RFXAP RGCC RGL1 RGL2 RGL3 RGL4 RGMA RGMB RGN RGP1 RGPD1 RGPD2 RGPD3 RGPD4 RGPD5 RGPD6 RGPD8 *RGR RGS1 RGS10 RGS11 RGS12 RGS13 RGS14 RGS16 RGS17 RGS18 RGS19 RGS2 RGS20 RGS21 RGS22 RGS3 RGS4 *RGS5 RGS6 RGS7 RGS7BP RGS8 *RGS9 *RGS9BP RGSL1 *RHAG RHBDD1 RHBDD2 RHBDD3 RHBDF1 *RHBDF2 RHBDL1 RHBDL2 RHBDL3 RHBG *RHCE RHCG *RHD RHEB RHEBL1 RHEX RHNO1 *RHO *RHOA RHOB RHOBTB1 *RHOBTB2 RHOBTB3 RHOC RHOD RHOF RHOG *RHOH RHOJ RHOQ RHOT1 RHOT2 RHOU RHOV RHOXF1 RHOXF2 RHOXF2B RHPN1 RHPN2 RIBC1 RIBC2 *RIC1 RIC3 RIC8A RIC8B RICTOR RIDA RIF1 *RIGI RIIAD1 RILP *RILPL1 RILPL2 RIMBP2 RIMBP3 RIMBP3B RIMBP3C RIMKLA RIMKLB *RIMS1 *RIMS2 RIMS3 RIMS4 RIN1 *RIN2 RIN3 RING1 RINL *RINT1 RIOK1 RIOK2 RIOK3 RIOX1 RIOX2 *RIPK1 RIPK2 RIPK3 *RIPK4 RIPOR1 *RIPOR2 RIPOR3 RIPPLY1 *RIPPLY2 RIPPLY3 *RIT1 RIT2 RITA1 *RLBP1 RLF *RLIM RLN1 RLN2 RLN3 RMC1 RMDN1 RMDN2 RMDN3 RMI1 RMI2 *RMND1 RMND5A RMND5B *RMRP RNASE1 RNASE10 RNASE11 RNASE12 RNASE13 RNASE2 RNASE3 RNASE4 RNASE6 RNASE7 RNASE8 RNASE9 *RNASEH1 *RNASEH2A *RNASEH2B *RNASEH2C RNASEK *RNASEL *RNASET2 RND1 RND2 RND3 RNF10 RNF103 RNF11 RNF111 RNF112 *RNF113A RNF113B RNF114 RNF115 RNF121 RNF122 RNF123 *RNF125 RNF126 RNF128 *RNF13 RNF130 RNF133 *RNF135 RNF138 *RNF139 RNF14 RNF141 RNF144A RNF144B RNF145 RNF146 RNF148 RNF149 RNF150 RNF151 RNF152 RNF157 RNF165 RNF166 RNF167 *RNF168 RNF169 RNF17 *RNF170 RNF175 RNF180 RNF181 RNF182 RNF183 RNF185 RNF186 RNF187 RNF19A RNF19B *RNF2 RNF20 RNF207 RNF208 *RNF212 RNF212B *RNF213 RNF214 RNF215 *RNF216 RNF217 RNF219 *RNF220 RNF222 RNF223 RNF224 RNF225 RNF227 RNF24 RNF25 RNF26 *RNF31 RNF32 RNF34 RNF38 RNF39 RNF4 RNF40 RNF41 *RNF43 RNF44 RNF5 *RNF6 RNF7 RNF8 RNFT1 RNFT2 RNGTT *RNH1 RNLS RNMT *RNPC3 RNPEP RNPEPL1 RNPS1 *RNU12 *RNU4-2 *RNU4ATAC *RNU7-1 *ROBO1 *ROBO2 *ROBO3 *ROBO4 ROCK1 ROCK2 *ROGDI *ROM1 ROMO1 ROPN1 ROPN1B ROPN1L *ROR1 *ROR2 *RORA *RORB *RORC *ROS1 *RP1 *RP1L1 *RP2 *RP9 *RPA1 RPA2 RPA3 RPA4 RPAIN RPAP1 RPAP2 RPAP3 RPE *RPE65 RPEL1 RPF1 RPF2 *RPGR *RPGRIP1 *RPGRIP1L RPH3A RPH3AL *RPIA *RPL10 RPL10A *RPL10L *RPL11 RPL12 *RPL13 RPL13A RPL14 *RPL15 RPL17 *RPL18 RPL18A RPL19 *RPL21 RPL22 RPL22L1 RPL23 RPL23A RPL24 *RPL26 RPL26L1 *RPL27 RPL27A RPL28 RPL29 RPL3 RPL30 *RPL31 RPL32 RPL34 *RPL35 *RPL35A RPL36 RPL36A RPL36AL RPL37 RPL37A RPL38 RPL39 RPL39L *RPL3L RPL4 RPL41 *RPL5 RPL6 RPL7 RPL7A RPL7L1 *RPL8 *RPL9 RPLP0 RPLP1 RPLP2 RPN1 RPN2 RPP14 RPP21 RPP25 RPP25L RPP30 RPP38 RPP40 RPRD1A RPRD1B RPRD2 RPRM RPRML *RPS10 RPS11 RPS12 RPS13 *RPS14 RPS15 *RPS15A RPS16 *RPS17 RPS18 *RPS19 RPS19BP1 RPS2 *RPS20 RPS21 *RPS23 *RPS24 RPS25 *RPS26 *RPS27 RPS27A RPS27L *RPS28 *RPS29 RPS3 RPS3A RPS4X RPS4Y1 *RPS4Y2 RPS5 RPS6 RPS6KA1 RPS6KA2 *RPS6KA3 RPS6KA4 RPS6KA5 RPS6KA6 RPS6KB1 RPS6KB2 RPS6KC1 RPS6KL1 *RPS7 RPS8 RPS9 *RPSA RPTN RPTOR RPUSD1 RPUSD2 RPUSD3 RPUSD4 RRAD RRAGA RRAGB *RRAGC *RRAGD *RRAS *RRAS2 RRBP1 *RREB1 RRH *RRM1 RRM2 *RRM2B RRN3 RRNAD1 RRP1 RRP12 RRP15 RRP1B RRP36 *RRP7A RRP8 RRP9 RRS1 *RS1 RSAD1 RSAD2 RSBN1 RSBN1L RSC1A1 RSF1 RSL1D1 RSL24D1 *RSPH1 RSPH10B RSPH10B2 RSPH14 *RSPH3 *RSPH4A RSPH6A *RSPH9 *RSPO1 *RSPO2 RSPO3 *RSPO4 *RSPRY1 *RSRC1 RSRC2 RSRP1 RSU1 RTBDN RTCA RTCB *RTEL1 RTF1 RTF2 RTKN RTKN2 *RTL1 RTL10 RTL3 RTL4 RTL5 RTL6 RTL8A RTL8B RTL8C RTL9 RTN1 *RTN2 RTN3 RTN4 *RTN4IP1 *RTN4R RTN4RL1 RTN4RL2 RTP1 RTP2 RTP3 RTP4 RTP5 RTRAF *RTTN *RUBCN RUBCNL RUFY1 RUFY2 RUFY3 RUFY4 RUNDC1 RUNDC3A RUNDC3B *RUNX1 RUNX1T1 *RUNX2 RUNX3 RUSC1 *RUSC2 RUVBL1 RUVBL2 RWDD1 RWDD2A RWDD2B RWDD3 RWDD4 RXFP1 RXFP2 RXFP3 RXFP4 RXRA RXRB RXRG *RXYLT1 RYBP RYK *RYR1 *RYR2 *RYR3 S100A1 S100A10 S100A11 S100A12 S100A13 S100A14 S100A16 S100A2 S100A3 S100A4 S100A5 S100A6 S100A7 S100A7A S100A8 S100A9 S100B S100G S100P S100PBP S100Z S1PR1 *S1PR2 S1PR3 S1PR4 S1PR5 *SAA1 SAA2 SAA4 SAAL1 SAC3D1 SACM1L *SACS SAE1 SAFB SAFB2 *SAG SAGE1 *SALL1 *SALL2 SALL3 *SALL4 SAMD1 SAMD10 SAMD11 *SAMD12 SAMD13 SAMD14 SAMD15 SAMD3 SAMD4A SAMD4B SAMD5 *SAMD7 SAMD8 *SAMD9 *SAMD9L *SAMHD1 SAMM50 SAMSN1 SAP130 SAP18 SAP25 SAP30 SAP30BP SAP30L SAPCD1 SAPCD2 SAR1A *SAR1B SARAF *SARDH SARM1 SARNP SARS *SARS1 *SARS2 SART1 SART3 *SASH1 *SASH3 *SASS6 *SAT1 SAT2 *SATB1 *SATB2 SATL1 SAV1 SAXO1 SAXO2 SAYSD1 *SBDS *SBF1 *SBF2 SBK1 SBK2 SBK3 SBNO1 SBNO2 SBSN SBSPON *SC5D SCAF1 SCAF11 *SCAF4 SCAF8 SCAI SCAMP1 SCAMP2 SCAMP3 SCAMP4 SCAMP5 SCAND1 SCAP *SCAPER SCARA3 SCARA5 SCARB1 *SCARB2 SCARF1 *SCARF2 SCCPDH SCD *SCD5 SCEL SCFD1 SCFD2 SCG2 SCG3 SCG5 SCGB1A1 SCGB1C1 SCGB1C2 SCGB1D1 SCGB1D2 SCGB1D4 SCGB2A1 SCGB2A2 SCGB2B2 SCGB3A1 *SCGB3A2 SCGN SCHIP1 SCIMP SCIN *SCLT1 SCLY SCMH1 SCML1 SCML2 SCML4 *SCN10A *SCN11A *SCN1A *SCN1B *SCN2A *SCN2B *SCN3A *SCN3B *SCN4A *SCN4B *SCN5A SCN7A *SCN8A *SCN9A *SCNM1 *SCNN1A *SCNN1B SCNN1D *SCNN1G *SCO1 *SCO2 SCOC *SCP2 SCP2D1 SCPEP1 SCRG1 SCRIB SCRN1 SCRN2 SCRN3 SCRT1 SCRT2 SCT SCTR SCUBE1 SCUBE2 *SCUBE3 SCX SCYGR1 SCYGR10 SCYGR2 SCYGR3 SCYGR4 SCYGR5 SCYGR6 SCYGR7 SCYGR8 SCYGR9 *SCYL1 *SCYL2 SCYL3 SDAD1 SDC1 SDC2 *SDC3 SDC4 SDCBP SDCBP2 *SDCCAG8 SDE2 SDF2 SDF2L1 SDF4 *SDHA *SDHAF1 *SDHAF2 SDHAF3 SDHAF4 *SDHB *SDHC *SDHD SDIM1 SDK1 SDK2 SDR16C5 SDR39U1 SDR42E1 SDR42E2 *SDR9C7 SDS SDSL SEBOX SEC11A SEC11C SEC13 SEC14L1 SEC14L2 SEC14L3 SEC14L4 SEC14L5 SEC14L6 SEC16A SEC16B SEC22A SEC22B SEC22C *SEC23A *SEC23B SEC23IP SEC24A SEC24B *SEC24C *SEC24D *SEC31A SEC31B *SEC61A1 SEC61A2 SEC61B SEC61G SEC62 *SEC63 *SECISBP2 SECISBP2L SECTM1 SEH1L SEL1L SEL1L2 SEL1L3 SELE *SELENBP1 SELENOF SELENOH *SELENOI SELENOK SELENOM *SELENON SELENOO SELENOP SELENOS SELENOT SELENOV SELENOW SELL SELP SELPLG *SEM1 *SEMA3A SEMA3B *SEMA3C *SEMA3D *SEMA3E SEMA3F SEMA3G *SEMA4A SEMA4B SEMA4C *SEMA4D SEMA4F SEMA4G *SEMA5A SEMA5B SEMA6A *SEMA6B SEMA6C SEMA6D *SEMA7A SEMG1 SEMG2 SENP1 SENP2 SENP3 SENP5 SENP6 SENP7 SENP8 SEPHS1 SEPHS2 *SEPSECS SEPT1 SEPT10 SEPT11 SEPT12 SEPT14 SEPT2 SEPT3 SEPT4 SEPT5 SEPT6 SEPT7 SEPT8 SEPT9 *SEPTIN12 *SEPTIN9 *SERAC1 SERBP1 SERF1A SERF1B SERF2 SERGEF SERHL2 SERINC1 SERINC2 SERINC3 SERINC4 SERINC5 SERP1 SERP2 *SERPINA1 SERPINA10 SERPINA11 *SERPINA12 SERPINA2 SERPINA3 SERPINA4 SERPINA5 *SERPINA6 SERPINA7 SERPINA9 SERPINB1 SERPINB10 SERPINB11 SERPINB12 SERPINB13 SERPINB2 SERPINB3 SERPINB4 SERPINB5 *SERPINB6 *SERPINB7 *SERPINB8 SERPINB9 *SERPINC1 *SERPIND1 *SERPINE1 SERPINE2 SERPINE3 *SERPINF1 *SERPINF2 *SERPING1 *SERPINH1 *SERPINI1 SERPINI2 SERTAD1 SERTAD2 SERTAD3 SERTAD4 SERTM1 SERTM2 SESN1 SESN2 SESN3 SESTD1 *SET *SETBP1 *SETD1A *SETD1B *SETD2 SETD3 SETD4 *SETD5 SETD6 SETD7 SETD9 SETDB1 SETDB2 SETMAR SETSIP *SETX SEZ6 SEZ6L SEZ6L2 SF1 SF3A1 SF3A2 SF3A3 *SF3B1 *SF3B2 SF3B3 *SF3B4 SF3B5 SF3B6 SFI1 SFMBT1 SFMBT2 SFN SFPQ SFR1 SFRP1 SFRP2 *SFRP4 SFRP5 SFSWAP SFT2D1 SFT2D2 SFT2D3 SFTA2 SFTA3 *SFTPA1 *SFTPA2 *SFTPB *SFTPC SFTPD SFXN1 SFXN2 SFXN3 *SFXN4 SFXN5 *SGCA *SGCB *SGCD *SGCE *SGCG SGCZ SGF29 SGIP1 SGK1 SGK2 SGK3 SGMS1 *SGMS2 *SGO1 SGO2 *SGPL1 SGPP1 SGPP2 *SGSH SGSM1 SGSM2 SGSM3 SGTA SGTB *SH2B1 SH2B2 *SH2B3 *SH2D1A SH2D1B SH2D2A SH2D3A SH2D3C SH2D4A SH2D4B SH2D5 SH2D6 SH2D7 SH3BGR SH3BGRL SH3BGRL2 SH3BGRL3 SH3BP1 *SH3BP2 SH3BP4 SH3BP5 SH3BP5L SH3D19 SH3D21 *SH3GL1 SH3GL2 SH3GL3 SH3GLB1 SH3GLB2 *SH3KBP1 SH3PXD2A *SH3PXD2B SH3RF1 SH3RF2 SH3RF3 SH3TC1 *SH3TC2 SH3YL1 SHANK1 SHANK2 *SHANK3 *SHARPIN SHB SHBG SHC1 SHC2 SHC3 SHC4 SHCBP1 SHCBP1L SHD SHE SHF *SHH SHISA2 SHISA3 SHISA4 SHISA5 SHISA6 SHISA7 SHISA8 SHISA9 SHISAL1 SHISAL2A SHISAL2B SHKBP1 SHLD1 SHLD2 SHLD3 SHMT1 *SHMT2 *SHOC1 *SHOC2 *SHOX SHOX2 *SHPK SHPRH *SHQ1 SHROOM1 SHROOM2 SHROOM3 *SHROOM4 SHTN1 *SI SIAE *SIAH1 SIAH2 SIAH3 SIDT1 SIDT2 SIGIRR SIGLEC1 SIGLEC10 SIGLEC11 SIGLEC12 SIGLEC14 SIGLEC15 SIGLEC16 SIGLEC5 SIGLEC6 SIGLEC7 SIGLEC8 SIGLEC9 SIGLECL1 *SIGMAR1 *SIK1 SIK1B SIK2 *SIK3 SIKE1 *SIL1 *SIM1 SIM2 SIMC1 *SIN3A *SIN3B SINHCAF SIPA1 SIPA1L1 SIPA1L2 *SIPA1L3 SIRPA SIRPB1 SIRPB2 SIRPD SIRPG SIRT1 SIRT2 SIRT3 SIRT4 SIRT5 SIRT6 SIRT7 SIT1 SIVA1 *SIX1 *SIX2 *SIX3 SIX4 *SIX5 *SIX6 SKA1 SKA2 SKA3 SKAP1 SKAP2 *SKI *SKIC2 *SKIC3 SKIDA1 SKIL SKIV2L SKOR1 SKOR2 SKP1 SKP2 SLA SLA2 SLAIN1 SLAIN2 SLAMF1 SLAMF6 SLAMF7 SLAMF8 SLAMF9 SLBP *SLC10A1 *SLC10A2 SLC10A3 SLC10A4 SLC10A5 SLC10A6 *SLC10A7 *SLC11A1 *SLC11A2 *SLC12A1 *SLC12A2 *SLC12A3 SLC12A4 *SLC12A5 *SLC12A6 SLC12A7 SLC12A8 SLC12A9 SLC13A1 SLC13A2 *SLC13A3 SLC13A4 *SLC13A5 SLC14A1 SLC14A2 SLC15A1 SLC15A2 SLC15A3 SLC15A4 SLC15A5 *SLC16A1 SLC16A10 SLC16A11 *SLC16A12 SLC16A13 SLC16A14 *SLC16A2 SLC16A3 SLC16A4 SLC16A5 SLC16A6 SLC16A7 SLC16A8 SLC16A9 SLC17A1 SLC17A2 SLC17A3 SLC17A4 *SLC17A5 SLC17A6 SLC17A7 *SLC17A8 *SLC17A9 SLC18A1 *SLC18A2 *SLC18A3 SLC18B1 *SLC19A1 *SLC19A2 *SLC19A3 *SLC1A1 *SLC1A2 *SLC1A3 *SLC1A4 SLC1A5 SLC1A6 SLC1A7 SLC20A1 *SLC20A2 SLC22A1 SLC22A10 SLC22A11 *SLC22A12 SLC22A13 SLC22A14 SLC22A15 SLC22A16 SLC22A17 *SLC22A18 SLC22A18AS SLC22A2 SLC22A23 SLC22A24 SLC22A25 SLC22A3 SLC22A31 *SLC22A4 *SLC22A5 SLC22A6 SLC22A7 SLC22A8 SLC22A9 SLC23A1 SLC23A2 SLC23A3 *SLC24A1 SLC24A2 SLC24A3 *SLC24A4 *SLC24A5 *SLC25A1 *SLC25A10 *SLC25A11 *SLC25A12 *SLC25A13 SLC25A14 *SLC25A15 SLC25A16 SLC25A17 SLC25A18 *SLC25A19 SLC25A2 *SLC25A20 *SLC25A21 *SLC25A22 SLC25A23 *SLC25A24 SLC25A25 *SLC25A26 SLC25A27 SLC25A28 SLC25A29 *SLC25A3 SLC25A30 SLC25A31 *SLC25A32 SLC25A33 SLC25A34 SLC25A35 *SLC25A36 SLC25A37 *SLC25A38 SLC25A39 *SLC25A4 SLC25A40 SLC25A41 *SLC25A42 SLC25A43 SLC25A44 SLC25A45 *SLC25A46 SLC25A47 SLC25A48 SLC25A5 SLC25A51 SLC25A52 SLC25A53 SLC25A6 *SLC26A1 SLC26A10 SLC26A11 *SLC26A2 *SLC26A3 *SLC26A4 *SLC26A5 SLC26A6 SLC26A7 *SLC26A8 *SLC26A9 SLC27A1 SLC27A2 SLC27A3 *SLC27A4 SLC27A5 SLC27A6 *SLC28A1 SLC28A2 SLC28A3 SLC29A1 SLC29A2 *SLC29A3 SLC29A4 *SLC2A1 *SLC2A10 SLC2A11 SLC2A12 SLC2A13 SLC2A14 *SLC2A2 *SLC2A3 SLC2A4 SLC2A4RG SLC2A5 SLC2A6 SLC2A7 SLC2A8 *SLC2A9 SLC30A1 *SLC30A10 *SLC30A2 SLC30A3 SLC30A4 SLC30A5 SLC30A6 *SLC30A7 *SLC30A8 *SLC30A9 *SLC31A1 SLC31A2 *SLC32A1 *SLC33A1 *SLC34A1 *SLC34A2 *SLC34A3 *SLC35A1 *SLC35A2 *SLC35A3 SLC35A4 SLC35A5 SLC35B1 *SLC35B2 SLC35B3 SLC35B4 *SLC35C1 SLC35C2 *SLC35D1 SLC35D2 SLC35D3 SLC35E1 SLC35E2A SLC35E2B SLC35E3 SLC35E4 SLC35F1 SLC35F2 SLC35F3 SLC35F4 SLC35F5 SLC35F6 SLC35G1 SLC35G2 SLC35G3 SLC35G4 SLC35G5 SLC35G6 SLC36A1 *SLC36A2 SLC36A3 SLC36A4 SLC37A1 SLC37A2 SLC37A3 *SLC37A4 SLC38A1 SLC38A10 SLC38A11 SLC38A2 *SLC38A3 SLC38A4 SLC38A5 SLC38A6 SLC38A7 *SLC38A8 SLC38A9 SLC39A1 SLC39A10 SLC39A11 SLC39A12 *SLC39A13 *SLC39A14 SLC39A2 SLC39A3 *SLC39A4 *SLC39A5 SLC39A6 *SLC39A7 *SLC39A8 SLC39A9 *SLC3A1 SLC3A2 *SLC40A1 *SLC41A1 SLC41A2 SLC41A3 SLC43A1 SLC43A2 SLC43A3 *SLC44A1 SLC44A2 SLC44A3 *SLC44A4 SLC44A5 *SLC45A1 *SLC45A2 SLC45A3 SLC45A4 *SLC46A1 SLC46A2 SLC46A3 SLC47A1 SLC47A2 SLC48A1 SLC49A3 *SLC4A1 *SLC4A10 *SLC4A11 SLC4A1AP *SLC4A2 *SLC4A3 *SLC4A4 SLC4A5 SLC4A7 SLC4A8 SLC4A9 SLC50A1 *SLC51A *SLC51B *SLC52A1 *SLC52A2 *SLC52A3 *SLC5A1 SLC5A10 SLC5A11 SLC5A12 *SLC5A2 SLC5A3 SLC5A4 *SLC5A5 *SLC5A6 *SLC5A7 SLC5A8 SLC5A9 *SLC6A1 SLC6A11 SLC6A12 SLC6A13 *SLC6A14 SLC6A15 SLC6A16 *SLC6A17 *SLC6A18 *SLC6A19 *SLC6A2 *SLC6A20 *SLC6A3 *SLC6A4 *SLC6A5 *SLC6A6 SLC6A7 *SLC6A8 *SLC6A9 SLC7A1 SLC7A10 SLC7A11 SLC7A13 *SLC7A14 SLC7A2 SLC7A3 SLC7A4 SLC7A5 SLC7A6 *SLC7A6OS *SLC7A7 SLC7A8 *SLC7A9 SLC8A1 SLC8A2 SLC8A3 SLC8B1 *SLC9A1 SLC9A2 *SLC9A3 SLC9A3R1 SLC9A3R2 SLC9A4 SLC9A5 *SLC9A6 *SLC9A7 SLC9A8 SLC9A9 SLC9B1 SLC9B2 SLC9C1 SLC9C2 SLCO1A2 *SLCO1B1 *SLCO1B3 SLCO1B7 SLCO1C1 *SLCO2A1 SLCO2B1 SLCO3A1 SLCO4A1 SLCO4C1 SLCO5A1 SLCO6A1 SLF1 *SLF2 SLFN11 SLFN12 SLFN12L SLFN13 *SLFN14 SLFN5 SLFNL1 SLIRP SLIT1 SLIT2 SLIT3 *SLITRK1 *SLITRK2 SLITRK3 SLITRK4 SLITRK5 *SLITRK6 SLK *SLMAP SLN SLPI SLTM SLU7 *SLURP1 SLURP2 SLX1A SLX1B *SLX4 SLX4IP SMAD1 *SMAD2 *SMAD3 *SMAD4 SMAD5 *SMAD6 *SMAD7 *SMAD9 SMAGP SMAP1 SMAP2 SMARCA1 *SMARCA2 *SMARCA4 SMARCA5 *SMARCAD1 *SMARCAL1 *SMARCB1 *SMARCC1 *SMARCC2 *SMARCD1 *SMARCD2 SMARCD3 *SMARCE1 *SMC1A SMC1B SMC2 *SMC3 SMC4 *SMC5 SMC6 *SMCHD1 SMCO1 SMCO2 SMCO3 SMCO4 SMCP SMCR8 SMDT1 SMG1 SMG5 SMG6 SMG7 *SMG8 *SMG9 SMIM1 SMIM10 SMIM10L1 SMIM10L2A SMIM10L2B SMIM11A SMIM11B SMIM12 SMIM13 SMIM14 SMIM15 SMIM17 SMIM18 SMIM19 SMIM2 SMIM20 SMIM21 SMIM22 SMIM23 SMIM24 SMIM26 SMIM27 SMIM28 SMIM29 SMIM3 SMIM30 SMIM31 SMIM32 SMIM33 SMIM34A SMIM34B SMIM35 SMIM36 SMIM4 SMIM5 SMIM6 SMIM7 SMIM8 SMIM9 SMKR1 SMLR1 *SMN1 *SMN2 SMNDC1 *SMO *SMOC1 *SMOC2 SMOX *SMPD1 SMPD2 SMPD3 *SMPD4 SMPDL3A SMPDL3B *SMPX SMR3A SMR3B *SMS SMTN SMTNL1 SMTNL2 SMU1 SMUG1 SMURF1 SMURF2 SMYD1 SMYD2 SMYD3 SMYD4 SMYD5 SNAI1 *SNAI2 SNAI3 SNAP23 *SNAP25 *SNAP29 SNAP47 SNAP91 SNAPC1 SNAPC2 SNAPC3 *SNAPC4 SNAPC5 SNAPIN *SNCA *SNCAIP *SNCB SNCG SND1 SNED1 *SNF8 SNHG14 *SNIP1 SNN *SNORA31 SNORC SNORD115 *SNORD115-1 SNORD116 *SNORD116-1 *SNORD118 SNPH SNRK *SNRNP200 SNRNP25 SNRNP27 SNRNP35 SNRNP40 SNRNP48 SNRNP70 SNRPA SNRPA1 *SNRPB SNRPB2 SNRPC SNRPD1 SNRPD2 SNRPD3 *SNRPE SNRPF SNRPG *SNRPN *SNTA1 SNTB1 SNTB2 SNTG1 SNTG2 SNTN SNU13 *SNUPN SNURF SNW1 SNX1 *SNX10 SNX11 SNX12 SNX13 *SNX14 SNX15 SNX16 SNX17 SNX18 SNX19 SNX2 SNX20 SNX21 SNX22 SNX24 SNX25 SNX27 SNX29 SNX3 SNX30 SNX31 SNX32 SNX33 SNX4 SNX5 SNX6 SNX7 SNX8 SNX9 SOAT1 SOAT2 *SOBP *SOCS1 SOCS2 SOCS3 SOCS4 SOCS5 SOCS6 SOCS7 *SOD1 SOD2 SOD3 SOGA1 SOGA3 *SOHLH1 SOHLH2 *SON SORBS1 SORBS2 SORBS3 SORCS1 SORCS2 SORCS3 *SORD *SORL1 SORT1 *SOS1 *SOS2 *SOST SOSTDC1 SOWAHA SOWAHB SOWAHC SOWAHD SOX1 *SOX10 *SOX11 SOX12 SOX13 SOX14 SOX15 *SOX17 *SOX18 *SOX2 SOX21 *SOX3 SOX30 *SOX4 *SOX5 *SOX6 SOX7 SOX8 *SOX9 SP1 SP100 *SP110 SP140 SP140L SP2 SP3 SP4 SP5 *SP6 *SP7 SP8 SP9 SPA17 SPAAR *SPACA1 SPACA3 SPACA4 SPACA5 SPACA5B SPACA6 SPACA7 SPACA9 *SPAG1 SPAG11A SPAG11B SPAG16 *SPAG17 SPAG4 SPAG5 SPAG6 SPAG7 SPAG8 SPAG9 SPAM1 SPANXA1 SPANXA2 SPANXB1 SPANXC SPANXD SPANXN1 SPANXN2 SPANXN3 SPANXN4 SPANXN5 *SPARC SPARCL1 *SPART *SPAST SPATA1 SPATA12 SPATA13 *SPATA16 SPATA17 SPATA18 SPATA19 SPATA2 SPATA20 SPATA21 *SPATA22 SPATA24 SPATA25 SPATA2L SPATA3 SPATA31A1 SPATA31A3 SPATA31A5 SPATA31A6 SPATA31A7 SPATA31D1 SPATA31D3 SPATA31D4 SPATA31E1 SPATA32 SPATA33 SPATA4 SPATA45 SPATA46 SPATA48 SPATA5 SPATA5L1 SPATA6 SPATA6L *SPATA7 SPATA9 SPATC1 SPATC1L SPATS1 SPATS2 SPATS2L SPC24 SPC25 SPCS1 SPCS2 SPCS3 SPDEF SPDL1 SPDYA SPDYC SPDYE1 SPDYE16 SPDYE2 SPDYE2B SPDYE3 SPDYE4 SPDYE5 SPDYE6 SPECC1 *SPECC1L SPEF1 *SPEF2 *SPEG SPEM1 SPEM2 SPEM3 *SPEN SPERT SPESP1 *SPG11 *SPG21 *SPG7 SPHAR SPHK1 SPHK2 SPHKAP *SPI1 *SPIB SPIC SPICE1 *SPIDR SPIN1 SPIN2A SPIN2B SPIN3 *SPIN4 SPINDOC *SPINK1 SPINK13 SPINK14 *SPINK2 SPINK4 *SPINK5 SPINK6 SPINK7 SPINK8 SPINK9 SPINT1 *SPINT2 SPINT3 SPINT4 SPIRE1 SPIRE2 SPN SPNS1 *SPNS2 SPNS3 SPO11 SPOCD1 SPOCK1 SPOCK2 SPOCK3 SPON1 SPON2 *SPOP SPOPL SPOUT1 *SPP1 SPP2 *SPPL2A SPPL2B SPPL2C SPPL3 *SPR *SPRED1 *SPRED2 SPRED3 SPRN SPRR1A SPRR1B SPRR2A SPRR2B SPRR2D SPRR2E SPRR2F SPRR2G SPRR3 SPRR4 SPRR5 *SPRTN SPRY1 *SPRY2 SPRY3 *SPRY4 SPRYD3 SPRYD4 SPRYD7 SPSB1 SPSB2 SPSB3 SPSB4 *SPTA1 *SPTAN1 *SPTB *SPTBN1 *SPTBN2 *SPTBN4 SPTBN5 *SPTLC1 *SPTLC2 SPTLC3 *SPTSSA SPTSSB SPTY2D1 SPTY2D1OS SPX SPZ1 SQLE *SQOR *SQSTM1 *SRA1 SRARP SRBD1 *SRC *SRCAP SRCIN1 SRD5A1 *SRD5A2 *SRD5A3 *SREBF1 SREBF2 SREK1 SREK1IP1 SRF SRFBP1 *SRGAP1 SRGAP2 SRGAP2B SRGAP2C SRGAP3 SRGN SRI SRL SRM SRMS SRP14 *SRP19 *SRP54 *SRP68 *SRP72 SRP9 SRPK1 SRPK2 *SRPK3 SRPRA SRPRB SRPX *SRPX2 SRR SRRD SRRM1 *SRRM2 SRRM3 SRRM4 SRRM5 SRRT SRSF1 SRSF10 SRSF11 SRSF12 *SRSF2 SRSF3 SRSF4 SRSF5 SRSF6 SRSF7 SRSF8 SRSF9 SRXN1 *SRY SS18 SS18L1 SS18L2 SSB *SSBP1 SSBP2 SSBP3 SSBP4 SSC4D SSC5D SSH1 SSH2 SSH3 SSMEM1 SSNA1 SSPN SSPO SSR1 SSR2 SSR3 *SSR4 SSRP1 SSSCA1 SST SSTR1 SSTR2 SSTR3 SSTR4 SSTR5 SSU72 SSUH2 *SSX1 *SSX2 SSX2B SSX2IP SSX3 SSX4 SSX4B SSX5 SSX7 ST13 *ST14 ST18 ST20 ST3GAL1 ST3GAL2 *ST3GAL3 ST3GAL4 *ST3GAL5 ST3GAL6 ST5 ST6GAL1 ST6GAL2 ST6GALNAC1 ST6GALNAC2 ST6GALNAC3 ST6GALNAC4 ST6GALNAC5 ST6GALNAC6 ST7 ST7L ST8SIA1 ST8SIA2 ST8SIA3 ST8SIA4 ST8SIA5 ST8SIA6 *STAB1 STAB2 STAC STAC2 *STAC3 *STAG1 *STAG2 *STAG3 STAM STAM2 *STAMBP STAMBPL1 STAP1 STAP2 *STAR STARD10 STARD13 STARD3 STARD3NL STARD4 STARD5 STARD6 *STARD7 STARD8 STARD9 *STAT1 *STAT2 *STAT3 *STAT4 STAT5A *STAT5B *STAT6 STATH STAU1 STAU2 STBD1 STC1 STC2 STEAP1 STEAP1B STEAP2 *STEAP3 STEAP4 *STEEP1 STH *STIL *STIM1 STIM2 STIMATE *STING1 STIP1 STK10 *STK11 STK11IP STK16 STK17A STK17B STK19 STK24 STK25 STK26 STK3 STK31 STK32A STK32B STK32C *STK33 STK35 *STK36 STK38 STK38L STK39 *STK4 STK40 STKLD1 STMN1 STMN2 STMN3 STMN4 STMND1 STMP1 *STN1 STOM STOML1 STOML2 STOML3 STON1 STON2 *STOX1 STOX2 STPG1 STPG2 STPG3 STPG4 *STRA6 STRA8 *STRADA STRADB STRAP STRBP *STRC STRIP1 STRIP2 STRN STRN3 STRN4 *STS *STT3A *STT3B *STUB1 STUM STX10 *STX11 STX12 *STX16 STX17 STX18 STX19 *STX1A *STX1B STX2 *STX3 *STX4 *STX5 STX6 STX7 STX8 *STXBP1 *STXBP2 STXBP3 STXBP4 STXBP5 STXBP5L STXBP6 STYK1 STYX STYXL1 SUB1 *SUCLA2 *SUCLG1 SUCLG2 SUCNR1 SUCO SUDS3 *SUFU *SUGCT SUGP1 SUGP2 SUGT1 SULF1 SULF2 SULT1A1 SULT1A2 SULT1A3 SULT1A4 SULT1B1 SULT1C2 SULT1C3 SULT1C4 SULT1E1 SULT2A1 *SULT2B1 SULT4A1 SULT6B1 *SUMF1 SUMF2 *SUMO1 SUMO2 SUMO3 SUMO4 SUN1 SUN2 SUN3 *SUN5 *SUOX *SUPT16H SUPT20H SUPT20HL1 SUPT3H SUPT4H1 SUPT5H SUPT6H SUPT7L SUPV3L1 *SURF1 SURF2 SURF4 SURF6 SUSD1 SUSD2 SUSD3 SUSD4 SUSD5 SUSD6 SUV39H1 SUV39H2 *SUZ12 *SV2A SV2B SV2C *SVBP SVEP1 *SVIL SVIP SVOP SVOPL SWAP70 SWI5 SWSAP1 SWT1 SYAP1 SYBU *SYCE1 SYCE1L SYCE2 SYCE3 SYCN SYCP1 *SYCP2 *SYCP2L *SYCP3 SYDE1 SYDE2 SYF2 *SYK SYMPK *SYN1 *SYN2 SYN3 SYNC SYNCRIP SYNDIG1 SYNDIG1L *SYNE1 *SYNE2 SYNE3 *SYNE4 *SYNGAP1 SYNGR1 SYNGR2 SYNGR3 SYNGR4 *SYNJ1 SYNJ2 SYNJ2BP SYNM SYNPO SYNPO2 SYNPO2L SYNPR SYNRG *SYP SYPL1 SYPL2 SYS1 *SYT1 SYT10 SYT11 SYT12 SYT13 *SYT14 SYT15 SYT16 SYT17 *SYT2 SYT3 SYT4 SYT5 SYT6 SYT7 SYT8 SYT9 SYTL1 SYTL2 SYTL3 SYTL4 SYTL5 SYVN1 SZRD1 *SZT2 TAAR1 TAAR2 TAAR5 TAAR6 TAAR8 TAAR9 TAB1 *TAB2 TAB3 TAC1 *TAC3 TAC4 TACC1 TACC2 TACC3 *TACO1 TACR1 TACR2 *TACR3 *TACSTD2 TADA1 TADA2A TADA2B TADA3 *TAF1 TAF10 TAF11 TAF12 *TAF13 *TAF15 *TAF1A TAF1B TAF1C TAF1D TAF1L *TAF2 TAF3 *TAF4 *TAF4B TAF5 TAF5L *TAF6 TAF6L TAF7 TAF7L *TAF8 TAF9 TAF9B *TAFAZZIN TAGAP TAGLN TAGLN2 TAGLN3 *TAL1 *TAL2 *TALDO1 *TAMM41 TANC1 *TANC2 *TANGO2 TANGO6 TANK *TAOK1 TAOK2 TAOK3 *TAP1 *TAP2 *TAPBP TAPBPL *TAPT1 TARBP1 TARBP2 *TARDBP TARM1 TARS *TARS1 *TARS2 TARSL2 TAS1R1 TAS1R2 TAS1R3 TAS2R1 TAS2R10 TAS2R13 TAS2R14 *TAS2R16 TAS2R19 TAS2R20 TAS2R3 TAS2R30 TAS2R31 TAS2R38 TAS2R39 TAS2R4 TAS2R40 TAS2R41 TAS2R42 TAS2R43 TAS2R46 TAS2R5 TAS2R50 TAS2R60 TAS2R7 TAS2R8 TAS2R9 *TASP1 *TAT TATDN1 TATDN2 TATDN3 TAX1BP1 TAX1BP3 TAZ TBATA TBC1D1 TBC1D10A TBC1D10B TBC1D10C TBC1D12 TBC1D13 TBC1D14 TBC1D15 TBC1D16 TBC1D17 TBC1D19 TBC1D2 *TBC1D20 TBC1D21 TBC1D22A TBC1D22B *TBC1D23 *TBC1D24 TBC1D25 TBC1D26 TBC1D28 *TBC1D2B TBC1D3 TBC1D30 TBC1D31 TBC1D32 TBC1D3B TBC1D3C TBC1D3D TBC1D3E TBC1D3F TBC1D3G TBC1D3H TBC1D3I TBC1D3K TBC1D3L TBC1D4 TBC1D5 *TBC1D7 TBC1D8 *TBC1D8B TBC1D9 TBC1D9B TBCA TBCB TBCC TBCCD1 *TBCD *TBCE TBCEL *TBCK *TBK1 TBKBP1 *TBL1X *TBL1XR1 *TBL1Y *TBL2 TBL3 *TBP TBPL1 TBPL2 *TBR1 TBRG1 TBRG4 *TBX1 TBX10 *TBX15 *TBX18 *TBX19 *TBX2 *TBX20 *TBX21 *TBX22 *TBX3 *TBX4 *TBX5 *TBX6 *TBXA2R *TBXAS1 *TBXT TC2N TCAF1 TCAF2 TCAIM *TCAP TCEA1 TCEA2 TCEA3 *TCEAL1 TCEAL2 TCEAL3 TCEAL4 TCEAL5 TCEAL6 TCEAL7 TCEAL8 TCEAL9 TCEANC TCEANC2 TCERG1 TCERG1L *TCF12 TCF15 TCF19 *TCF20 TCF21 TCF23 TCF24 TCF25 *TCF3 *TCF4 TCF7 TCF7L1 *TCF7L2 TCFL5 *TCHH TCHHL1 TCHP TCIM *TCIRG1 TCL1A TCL1B TCN1 *TCN2 *TCOF1 TCP1 TCP10 TCP10L TCP10L2 TCP11 TCP11L1 TCP11L2 TCP11X1 TCP11X2 TCTA TCTE1 TCTE3 TCTEX1D1 TCTEX1D2 TCTEX1D4 *TCTN1 *TCTN2 *TCTN3 TDG TDGF1 *TDO2 *TDP1 *TDP2 TDRD1 TDRD10 TDRD12 TDRD15 TDRD3 TDRD5 TDRD6 *TDRD7 *TDRD9 TDRKH TDRP *TEAD1 TEAD2 TEAD3 TEAD4 TEC TECPR1 *TECPR2 *TECR *TECRL *TECTA TECTB TEDC1 TEDC2 TEDDM1 TEF *TEFM *TEK TEKT1 TEKT2 *TEKT3 TEKT4 TEKT5 *TELO2 TEN1 TENM1 TENM2 *TENM3 *TENM4 TENT2 TENT4A TENT4B *TENT5A TENT5B TENT5C TENT5D TEP1 TEPP TEPSIN *TERB1 *TERB2 *TERC TERF1 TERF2 *TERF2IP *TERT TES TESC TESK1 TESK2 TESMIN TESPA1 TET1 *TET2 *TET3 TEX10 TEX101 *TEX11 TEX12 TEX13A TEX13B TEX13C TEX13D *TEX14 *TEX15 TEX19 TEX2 TEX22 TEX26 TEX261 TEX264 TEX28 TEX29 TEX30 TEX33 TEX35 TEX36 TEX37 TEX38 TEX43 TEX44 TEX45 TEX46 TEX47 TEX48 TEX49 TEX50 TEX51 TEX52 TEX53 TEX54 TEX9 *TF *TFAM *TFAP2A *TFAP2B TFAP2C TFAP2D TFAP2E TFAP4 TFB1M TFB2M TFCP2 TFCP2L1 TFDP1 TFDP2 TFDP3 *TFE3 TFEB TFEC TFF1 TFF2 TFF3 *TFG TFIP11 TFPI TFPI2 TFPT *TFR2 *TFRC *TG *TGDS *TGFA *TGFB1 TGFB1I1 *TGFB2 *TGFB3 *TGFBI *TGFBR1 *TGFBR2 *TGFBR3 TGFBR3L TGFBRAP1 *TGIF1 TGIF2 TGIF2LX TGIF2LY *TGM1 TGM2 *TGM3 TGM4 *TGM5 *TGM6 TGM7 TGOLN2 TGS1 *TH THADA *THAP1 THAP10 THAP11 THAP12 THAP2 THAP3 THAP4 THAP5 THAP6 THAP7 THAP8 THAP9 *THBD THBS1 *THBS2 THBS3 THBS4 THEG THEGL THEM4 THEM5 THEM6 THEMIS THEMIS2 *THG1L THNSL1 THNSL2 *THOC1 *THOC2 THOC3 THOC5 *THOC6 THOC7 THOP1 *THPO *THRA THRAP3 *THRB THRSP *THSD1 *THSD4 THSD7A THSD7B THSD8 THTPA *THUMPD1 THUMPD2 THUMPD3 THY1 THYN1 *TIA1 TIAF1 TIAL1 *TIAM1 TIAM2 *TICAM1 TICAM2 TICRR *TIE1 TIFA TIFAB TIGAR TIGD1 TIGD2 TIGD3 TIGD4 TIGD5 TIGD6 TIGD7 TIGIT TIMD4 *TIMELESS TIMM10 TIMM10B TIMM13 TIMM17A TIMM17B TIMM21 *TIMM22 TIMM23 TIMM23B TIMM29 TIMM44 *TIMM50 *TIMM8A TIMM8B TIMM9 *TIMMDC1 TIMP1 TIMP2 *TIMP3 TIMP4 TINAG TINAGL1 TINCR *TINF2 TIPARP TIPIN TIPRL TIRAP TJAP1 TJP1 *TJP2 TJP3 TK1 *TK2 *TKFC *TKT TKTL1 TKTL2 TLCD1 TLCD2 *TLCD3B TLDC2 TLE1 TLE2 TLE3 TLE4 *TLE6 TLE7 TLK1 *TLK2 *TLL1 TLL2 TLN1 TLN2 TLNRD1 TLR1 TLR10 *TLR2 *TLR3 *TLR4 TLR5 TLR6 *TLR7 *TLR8 TLR9 TLX1 TLX2 TLX3 TM2D1 TM2D2 TM2D3 TM4SF1 TM4SF18 TM4SF19 *TM4SF20 TM4SF4 TM4SF5 TM6SF1 TM6SF2 TM7SF2 TM7SF3 TM9SF1 TM9SF2 TM9SF3 TM9SF4 TMA16 TMA7 TMBIM1 TMBIM4 TMBIM6 *TMC1 TMC2 TMC3 TMC4 TMC5 *TMC6 TMC7 *TMC8 TMCC1 TMCC2 TMCC3 *TMCO1 TMCO2 TMCO3 TMCO4 TMCO5A TMCO6 TMED1 TMED10 TMED2 TMED3 TMED4 TMED5 TMED6 TMED7 TMED8 TMED9 TMEFF1 TMEFF2 TMEM100 TMEM101 TMEM102 TMEM104 TMEM106A *TMEM106B TMEM106C *TMEM107 TMEM108 TMEM109 TMEM11 TMEM114 TMEM115 TMEM116 TMEM117 TMEM119 TMEM120A TMEM120B TMEM121 TMEM121B TMEM123 TMEM125 *TMEM126A *TMEM126B *TMEM127 TMEM128 TMEM129 TMEM130 TMEM131 TMEM131L TMEM132A TMEM132B TMEM132C TMEM132D *TMEM132E TMEM134 TMEM135 TMEM136 *TMEM138 TMEM139 TMEM140 TMEM141 TMEM143 TMEM144 TMEM145 *TMEM147 TMEM14A TMEM14B TMEM14C TMEM150A TMEM150B TMEM150C *TMEM151A TMEM151B TMEM154 TMEM155 TMEM156 TMEM158 TMEM159 TMEM160 TMEM161A TMEM161B *TMEM163 TMEM164 *TMEM165 TMEM167A TMEM167B TMEM168 TMEM169 TMEM17 TMEM170A TMEM170B TMEM171 TMEM173 TMEM174 TMEM175 TMEM176A TMEM176B TMEM177 TMEM178A TMEM178B TMEM179 TMEM179B TMEM18 TMEM181 TMEM182 TMEM183A TMEM184A TMEM184B TMEM184C *TMEM185A TMEM185B TMEM186 TMEM187 TMEM189 TMEM19 TMEM190 TMEM191B TMEM191C TMEM192 TMEM196 TMEM198 *TMEM199 TMEM200A TMEM200B TMEM200C TMEM201 TMEM202 TMEM203 TMEM204 TMEM205 TMEM206 TMEM207 TMEM208 TMEM209 TMEM210 TMEM211 TMEM212 TMEM213 TMEM214 TMEM215 *TMEM216 TMEM217 *TMEM218 TMEM219 TMEM220 TMEM221 *TMEM222 TMEM223 TMEM225 TMEM225B TMEM229A TMEM229B TMEM230 *TMEM231 TMEM232 TMEM233 TMEM234 TMEM235 TMEM236 *TMEM237 TMEM238 TMEM239 *TMEM240 TMEM241 TMEM242 TMEM243 TMEM244 TMEM245 TMEM246 TMEM247 TMEM248 TMEM249 TMEM25 TMEM250 TMEM251 TMEM252 TMEM253 TMEM254 TMEM255A TMEM255B TMEM256 TMEM258 TMEM259 TMEM26 *TMEM260 TMEM262 TMEM263 TMEM265 TMEM266 TMEM267 TMEM268 TMEM269 *TMEM270 TMEM271 TMEM272 TMEM273 TMEM30A TMEM30B TMEM31 TMEM33 TMEM35A TMEM35B TMEM37 TMEM38A *TMEM38B TMEM39A TMEM39B TMEM40 TMEM41A TMEM41B TMEM42 *TMEM43 TMEM44 TMEM45A TMEM45B TMEM47 TMEM50A TMEM50B TMEM51 TMEM52 TMEM52B *TMEM53 TMEM54 TMEM56 TMEM59 TMEM59L TMEM60 TMEM61 TMEM62 *TMEM63A TMEM63B *TMEM63C TMEM64 TMEM65 *TMEM67 TMEM68 TMEM69 *TMEM70 TMEM71 TMEM72 TMEM74 TMEM74B TMEM78 TMEM79 TMEM80 TMEM81 TMEM82 TMEM86A TMEM86B TMEM87A TMEM87B TMEM88 TMEM88B TMEM89 TMEM8A TMEM8B TMEM9 TMEM91 TMEM92 *TMEM94 TMEM95 TMEM97 *TMEM98 TMEM99 TMEM9B TMF1 *TMIE TMIGD1 TMIGD2 TMIGD3 *TMLHE TMOD1 TMOD2 TMOD3 TMOD4 *TMPO TMPPE TMPRSS11A TMPRSS11B TMPRSS11D TMPRSS11E TMPRSS11F TMPRSS12 TMPRSS13 *TMPRSS15 TMPRSS2 *TMPRSS3 TMPRSS4 TMPRSS5 *TMPRSS6 TMPRSS7 TMPRSS9 TMSB10 TMSB15A TMSB15B TMSB4X TMSB4Y TMTC1 TMTC2 *TMTC3 *TMTC4 TMUB1 TMUB2 TMX1 *TMX2 TMX3 TMX4 *TNC *TNF TNFAIP1 TNFAIP2 *TNFAIP3 TNFAIP6 TNFAIP8 TNFAIP8L1 TNFAIP8L2 TNFAIP8L3 TNFRSF10A *TNFRSF10B TNFRSF10C TNFRSF10D *TNFRSF11A *TNFRSF11B TNFRSF12A *TNFRSF13B *TNFRSF13C TNFRSF14 TNFRSF17 TNFRSF18 TNFRSF19 *TNFRSF1A *TNFRSF1B TNFRSF21 TNFRSF25 *TNFRSF4 TNFRSF6B TNFRSF8 *TNFRSF9 TNFSF10 *TNFSF11 *TNFSF12 TNFSF13 TNFSF13B TNFSF14 *TNFSF15 TNFSF18 *TNFSF4 TNFSF8 TNFSF9 *TNIK *TNIP1 TNIP2 TNIP3 TNK1 TNK2 TNKS TNKS1BP1 TNKS2 TNMD TNN *TNNC1 *TNNC2 TNNI1 *TNNI2 *TNNI3 *TNNI3K *TNNT1 *TNNT2 *TNNT3 TNP1 TNP2 TNPO1 *TNPO2 *TNPO3 *TNR TNRC18 *TNRC6A *TNRC6B TNRC6C TNS1 TNS2 TNS3 TNS4 *TNXB TOB1 TOB2 *TOE1 *TOGARAM1 TOGARAM2 TOLLIP *TOM1 TOM1L1 TOM1L2 TOMM20 TOMM20L TOMM22 TOMM34 *TOMM40 TOMM40L TOMM5 TOMM6 *TOMM7 TOMM70 *TONSL TOP1 TOP1MT TOP2A TOP2B *TOP3A TOP3B *TOP6BL TOPAZ1 TOPBP1 *TOPORS *TOR1A *TOR1AIP1 TOR1AIP2 TOR1B TOR2A TOR3A TOR4A TOX TOX2 TOX3 TOX4 *TP53 TP53AIP1 TP53BP1 TP53BP2 TP53I11 TP53I13 TP53I3 TP53INP1 TP53INP2 *TP53RK TP53TG3 TP53TG3B TP53TG3C TP53TG3D TP53TG3E TP53TG3F TP53TG5 *TP63 *TP73 TPBG TPBGL TPCN1 TPCN2 TPD52 TPD52L1 TPD52L2 TPD52L3 TPGS1 TPGS2 TPH1 *TPH2 *TPI1 *TPK1 *TPM1 *TPM2 *TPM3 *TPM4 *TPMT *TPO *TPP1 *TPP2 TPPP TPPP2 TPPP3 *TPR TPRA1 TPRG1 TPRG1L *TPRKB *TPRN TPRX1 TPSAB1 TPSB2 TPSD1 TPSG1 TPST1 TPST2 TPT1 TPTE TPTE2 TPX2 TRA TRA2A TRA2B TRABD TRABD2A TRABD2B *TRAC TRADD TRAF1 TRAF2 *TRAF3 *TRAF3IP1 *TRAF3IP2 TRAF3IP3 TRAF4 TRAF5 *TRAF6 *TRAF7 TRAFD1 *TRAIP *TRAK1 TRAK2 TRAM1 TRAM1L1 TRAM2 *TRANK1 TRAP1 TRAPPC1 *TRAPPC10 *TRAPPC11 *TRAPPC12 TRAPPC13 *TRAPPC14 *TRAPPC2 TRAPPC2B *TRAPPC2L TRAPPC3 TRAPPC3L *TRAPPC4 TRAPPC5 TRAPPC6A *TRAPPC6B TRAPPC8 *TRAPPC9 TRARG1 TRAT1 TRB TRD TRDMT1 *TRDN *TREH TREM1 *TREM2 TREML1 TREML2 TREML4 TRERF1 *TREX1 TREX2 TRG *TRH TRHDE *TRHR TRIAP1 TRIB1 TRIB2 TRIB3 TRIL TRIM10 TRIM11 TRIM13 TRIM14 TRIM15 TRIM16 TRIM16L TRIM17 *TRIM2 TRIM21 TRIM22 TRIM23 TRIM24 TRIM25 TRIM26 TRIM27 *TRIM28 TRIM29 TRIM3 TRIM31 *TRIM32 TRIM33 TRIM34 TRIM35 *TRIM36 *TRIM37 TRIM38 TRIM39 TRIM4 TRIM40 TRIM41 TRIM42 TRIM43 TRIM43B *TRIM44 TRIM45 TRIM46 TRIM47 TRIM48 TRIM49 TRIM49B TRIM49C TRIM49D1 TRIM49D2 TRIM5 TRIM50 TRIM51 TRIM52 TRIM54 TRIM55 TRIM56 TRIM58 TRIM59 TRIM6 TRIM60 TRIM61 TRIM62 TRIM63 TRIM64 TRIM64B TRIM64C TRIM65 TRIM66 TRIM67 TRIM68 TRIM69 TRIM7 *TRIM71 TRIM72 TRIM73 TRIM74 TRIM77 *TRIM8 TRIM9 TRIML1 TRIML2 *TRIO *TRIOBP TRIP10 *TRIP11 *TRIP12 *TRIP13 *TRIP4 TRIP6 TRIQK TRIR *TRIT1 TRMO *TRMT1 *TRMT10A TRMT10B *TRMT10C TRMT11 TRMT112 TRMT12 TRMT13 TRMT1L TRMT2A TRMT2B TRMT44 *TRMT5 TRMT6 TRMT61A TRMT61B TRMT9B *TRMU TRNAU1AP TRNP1 *TRNT1 TRO TROAP TROVE2 *TRPA1 TRPC1 *TRPC3 TRPC4 TRPC4AP TRPC5 TRPC5OS *TRPC6 TRPC7 *TRPM1 TRPM2 *TRPM3 *TRPM4 TRPM5 *TRPM6 *TRPM7 TRPM8 *TRPS1 TRPT1 TRPV1 TRPV2 *TRPV3 *TRPV4 TRPV5 *TRPV6 *TRRAP *TRU-TCA1-1 TRUB1 TRUB2 TSACC TSBP1 *TSC1 *TSC2 TSC22D1 TSC22D2 TSC22D3 TSC22D4 *TSEN15 *TSEN2 *TSEN34 *TSEN54 *TSFM TSG101 *TSGA10 TSGA10IP TSGA13 *TSHB *TSHR *TSHZ1 TSHZ2 TSHZ3 TSIX TSKS TSKU TSLP TSN TSNARE1 TSNAX TSNAXIP1 TSPAN1 TSPAN10 TSPAN11 *TSPAN12 TSPAN13 TSPAN14 TSPAN15 TSPAN16 TSPAN17 TSPAN18 TSPAN19 TSPAN2 TSPAN3 TSPAN31 TSPAN32 TSPAN33 TSPAN4 TSPAN5 TSPAN6 *TSPAN7 TSPAN8 TSPAN9 *TSPEAR TSPO TSPO2 *TSPOAP1 *TSPY1 TSPY10 TSPY2 TSPY3 TSPY4 TSPY8 *TSPYL1 TSPYL2 TSPYL4 TSPYL5 TSPYL6 TSR1 *TSR2 TSR3 TSSC4 TSSK1B TSSK2 TSSK3 TSSK4 TSSK6 TST TSTA3 TSTD1 TSTD2 TSTD3 TTBK1 *TTBK2 TTC1 *TTC12 TTC13 TTC14 TTC16 TTC17 *TTC19 *TTC21A *TTC21B TTC22 TTC23 TTC23L TTC24 TTC25 TTC26 TTC27 TTC28 *TTC29 TTC3 TTC30A TTC30B TTC31 TTC32 TTC33 TTC34 TTC36 TTC37 TTC38 TTC39A TTC39B TTC39C TTC4 *TTC5 TTC6 *TTC7A TTC7B *TTC8 TTC9 TTC9B TTC9C TTF1 TTF2 *TTI1 *TTI2 TTK TTL TTLL1 TTLL10 TTLL11 TTLL12 TTLL2 TTLL3 TTLL4 *TTLL5 TTLL6 TTLL7 TTLL8 TTLL9 *TTN *TTPA TTPAL *TTR TTYH1 TTYH2 TTYH3 *TUB *TUBA1A TUBA1B TUBA1C TUBA3C *TUBA3D TUBA3E *TUBA4A TUBA4B *TUBA8 TUBAL3 *TUBB *TUBB1 *TUBB2A *TUBB2B *TUBB3 *TUBB4A *TUBB4B *TUBB6 *TUBB8 TUBD1 TUBE1 *TUBG1 TUBG2 *TUBGCP2 TUBGCP3 *TUBGCP4 TUBGCP5 *TUBGCP6 *TUFM *TUFT1 *TULP1 TULP2 *TULP3 TULP4 TUSC1 TUSC2 *TUSC3 TUT1 TUT4 TUT7 TVP23A TVP23B TVP23C TWF1 TWF2 *TWIST1 *TWIST2 TWISTNB *TWNK TWSG1 TXK TXLNA TXLNB TXLNG TXN *TXN2 TXNDC11 TXNDC12 *TXNDC15 TXNDC16 TXNDC17 TXNDC2 TXNDC5 TXNDC8 TXNDC9 TXNIP TXNL1 *TXNL4A TXNL4B TXNRD1 *TXNRD2 TXNRD3 TXNRD3NB *TYK2 *TYMP *TYMS *TYR TYRO3 *TYROBP *TYRP1 TYSND1 TYW1 TYW1B TYW3 TYW5 U2AF1 U2AF1L4 U2AF1L5 *U2AF2 U2SURP UACA UAP1 UAP1L1 *UBA1 *UBA2 UBA3 *UBA5 UBA52 UBA6 UBA7 UBAC1 *UBAC2 UBALD1 UBALD2 *UBAP1 UBAP1L UBAP2 *UBAP2L UBASH3A UBASH3B *UBB UBC UBD *UBE2A UBE2B UBE2C UBE2D1 UBE2D2 UBE2D3 UBE2D4 UBE2E1 UBE2E2 UBE2E3 UBE2F UBE2G1 UBE2G2 UBE2H UBE2I UBE2J1 UBE2J2 UBE2K *UBE2L3 UBE2L5 UBE2L6 UBE2M UBE2N UBE2NL UBE2O UBE2Q1 UBE2Q2 UBE2QL1 UBE2R2 UBE2S *UBE2T UBE2U UBE2V1 UBE2V2 UBE2W UBE2Z *UBE3A *UBE3B *UBE3C UBE3D *UBE4A *UBE4B UBFD1 *UBIAD1 UBL3 UBL4A UBL4B UBL5 UBL7 UBLCP1 UBN1 UBN2 UBOX5 UBP1 UBQLN1 *UBQLN2 UBQLN3 UBQLN4 UBQLNL *UBR1 UBR2 UBR3 UBR4 UBR5 *UBR7 UBTD1 UBTD2 *UBTF UBTFL1 UBXN1 UBXN10 UBXN11 UBXN2A UBXN2B UBXN4 UBXN6 UBXN7 UBXN8 *UCHL1 UCHL3 UCHL5 UCK1 UCK2 UCKL1 UCMA UCN UCN2 UCN3 UCP1 *UCP2 *UCP3 UEVLD *UFC1 *UFD1 UFL1 *UFM1 UFSP1 *UFSP2 UGCG *UGDH UGGT1 UGGT2 *UGP2 UGT1A *UGT1A1 UGT2A1 UGT2A3 UGT2B10 UGT2B11 UGT2B15 UGT2B17 UGT2B28 UGT2B4 UGT2B7 UGT3A1 UGT3A2 UGT8 UHMK1 *UHRF1 UHRF1BP1 UHRF1BP1L UHRF2 UIMC1 ULBP1 ULBP2 ULBP3 ULK1 ULK2 ULK3 ULK4 UMAD1 *UMOD UMODL1 *UMPS *UNC119 UNC119B *UNC13A UNC13B UNC13C *UNC13D *UNC45A *UNC45B UNC50 UNC5A UNC5B UNC5C UNC5CL UNC5D UNC79 *UNC80 UNC93A *UNC93B1 UNCX *UNG UNK UNKL *UPB1 UPF1 UPF2 UPF3A *UPF3B UPK1A UPK1B UPK2 UPK3A UPK3B UPK3BL1 UPK3BL2 UPP1 UPP2 UPRT UQCC1 *UQCC2 *UQCC3 UQCR10 UQCR11 *UQCRB *UQCRC1 *UQCRC2 *UQCRFS1 *UQCRH UQCRHL *UQCRQ URAD URB1 URB2 URGCP URI1 URM1 *UROC1 *UROD *UROS *USB1 USE1 USF1 USF2 *USF3 *USH1C *USH1G *USH2A USHBP1 USO1 USP1 USP10 USP11 USP12 USP13 USP14 USP15 USP16 USP17L1 USP17L10 USP17L11 USP17L12 USP17L13 USP17L15 USP17L17 USP17L18 USP17L19 USP17L2 USP17L20 USP17L21 USP17L22 USP17L23 USP17L24 USP17L25 USP17L26 USP17L27 USP17L28 USP17L29 USP17L3 USP17L30 USP17L4 USP17L5 USP17L7 USP17L8 *USP18 USP19 USP2 USP20 USP21 USP22 USP24 USP25 *USP26 *USP27X USP28 USP29 USP3 USP30 USP31 USP32 USP33 USP34 USP35 USP36 USP37 USP38 USP39 USP4 USP40 USP41 USP42 USP43 USP44 *USP45 USP46 USP47 *USP48 USP49 USP5 USP50 USP51 *USP53 USP54 USP6 USP6NL *USP7 *USP8 *USP9X *USP9Y USPL1 UST UTF1 UTP11 UTP14A UTP14C UTP15 UTP18 UTP20 UTP23 UTP25 UTP3 UTP4 UTP6 UTRN UTS2 UTS2B UTS2R UTY UVRAG *UVSSA UXS1 UXT *VAC14 *VAMP1 *VAMP2 VAMP3 VAMP4 VAMP5 *VAMP7 VAMP8 *VANGL1 *VANGL2 VAPA *VAPB VARS *VARS1 *VARS2 VASH1 VASH2 VASN VASP VAT1 VAT1L VAV1 VAV2 VAV3 *VAX1 VAX2 VBP1 VCAM1 *VCAN *VCL *VCP VCPIP1 VCPKMT VCX VCX2 VCX3A VCX3B *VCY VCY1B VDAC1 VDAC2 VDAC3 *VDR VEGFA VEGFB *VEGFC VEGFD VENTX VEPH1 *VEZF1 VEZT VGF VGLL1 VGLL2 VGLL3 VGLL4 *VHL VHLL VIL1 VILL *VIM VIP *VIPAS39 VIPR1 VIPR2 VIRMA VIT *VKORC1 VKORC1L1 *VLDLR *VMA21 VMAC VMO1 VMP1 VN1R1 VN1R2 VN1R3 VN1R4 VN1R5 VNN1 VNN2 VNN3 VOPP1 VPREB1 VPREB3 *VPS11 *VPS13A *VPS13B *VPS13C *VPS13D *VPS16 VPS18 VPS25 VPS26A VPS26B VPS26C VPS28 VPS29 *VPS33A *VPS33B *VPS35 *VPS35L VPS36 *VPS37A VPS37B VPS37C *VPS37D VPS39 *VPS41 *VPS45 *VPS4A VPS4B *VPS50 *VPS51 VPS52 *VPS53 VPS54 VPS72 VPS8 VPS9D1 *VRK1 VRK2 VRK3 VRTN VSIG1 VSIG10 VSIG10L VSIG10L2 VSIG2 VSIG4 VSIG8 VSIR VSNL1 VSTM1 VSTM2A VSTM2B VSTM2L VSTM4 VSTM5 *VSX1 *VSX2 VTA1 VTCN1 VTI1A VTI1B VTN *VWA1 VWA2 VWA3A *VWA3B VWA5A VWA5B1 VWA5B2 VWA7 *VWA8 VWC2 VWC2L VWCE VWDE *VWF VXN *WAC WAPL WARS *WARS1 *WARS2 *WAS *WASF1 WASF2 WASF3 WASHC1 WASHC2A WASHC2C WASHC3 *WASHC4 *WASHC5 WASL WBP1 *WBP11 WBP1L *WBP2 WBP2NL *WBP4 WDCP WDFY1 WDFY2 *WDFY3 WDFY4 WDHD1 *WDPCP *WDR1 *WDR11 WDR12 WDR13 WDR17 WDR18 *WDR19 WDR20 WDR24 WDR25 *WDR26 WDR27 WDR3 WDR31 WDR33 WDR34 *WDR35 *WDR36 *WDR37 WDR38 *WDR4 WDR41 WDR43 WDR44 *WDR45 *WDR45B WDR46 WDR47 *WDR48 WDR49 WDR5 WDR53 WDR54 WDR55 WDR59 WDR5B WDR6 WDR60 WDR61 *WDR62 WDR63 WDR64 WDR66 WDR7 WDR70 *WDR72 *WDR73 WDR74 WDR75 WDR76 WDR77 WDR78 *WDR81 WDR82 WDR83 WDR83OS WDR86 WDR87 WDR88 WDR89 WDR90 WDR91 WDR92 WDR93 WDR97 WDSUB1 WDTC1 WDYHV1 WEE1 *WEE2 WFDC1 WFDC10A WFDC10B WFDC11 WFDC12 WFDC13 WFDC2 WFDC3 WFDC5 WFDC6 WFDC8 WFDC9 WFIKKN1 WFIKKN2 *WFS1 WHAMM *WHRN WIF1 *WIPF1 WIPF2 WIPF3 WIPI1 *WIPI2 WISP1 WISP2 WISP3 WIZ *WLS *WNK1 WNK2 *WNK3 *WNK4 *WNT1 *WNT10A *WNT10B WNT11 WNT16 WNT2 *WNT2B *WNT3 *WNT3A *WNT4 *WNT5A WNT5B WNT6 *WNT7A *WNT7B WNT8A WNT8B WNT9A *WNT9B *WRAP53 WRAP73 WRB *WRN WRNIP1 WSB1 WSB2 WSCD1 WSCD2 *WT1 WTAP WTIP WWC1 WWC2 WWC3 *WWOX WWP1 WWP2 WWTR1 XAB2 XAF1 XAGE1A XAGE1B XAGE1C XAGE1D XAGE1E XAGE2 XAGE3 XAGE5 XBP1 XCL1 XCL2 XCR1 *XDH XG *XIAP XIRP1 XIRP2 XIST *XK XKR3 XKR4 XKR5 XKR6 XKR7 XKR8 XKR9 XKRX *XKRY *XPA *XPC XPNPEP1 *XPNPEP2 *XPNPEP3 XPO1 XPO4 XPO5 XPO6 XPO7 XPOT *XPR1 *XRCC1 *XRCC2 *XRCC3 *XRCC4 XRCC5 XRCC6 XRN1 XRN2 XRRA1 XXYLT1 XYLB *XYLT1 *XYLT2 YAE1 YAF2 *YAP1 YARS *YARS1 *YARS2 YBEY YBX1 YBX2 YBX3 YDJC *YEATS2 YEATS4 YES1 YIF1A *YIF1B YIPF1 YIPF2 YIPF3 YIPF4 *YIPF5 YIPF6 YIPF7 YJEFN3 YJU2 YKT6 YLPM1 *YME1L1 YOD1 YPEL1 YPEL2 YPEL3 YPEL4 YPEL5 *YRDC YTHDC1 YTHDC2 YTHDF1 YTHDF2 YTHDF3 YWHAB *YWHAE *YWHAG YWHAH YWHAQ YWHAZ *YY1 *YY1AP1 YY2 ZACN ZADH2 ZAN *ZAP70 ZAR1 ZAR1L ZBBX ZBED1 ZBED2 ZBED3 ZBED4 ZBED5 ZBED6 ZBED6CL ZBED8 ZBED9 ZBP1 ZBTB1 ZBTB10 *ZBTB11 ZBTB12 ZBTB14 *ZBTB16 ZBTB17 *ZBTB18 ZBTB2 *ZBTB20 ZBTB21 ZBTB22 *ZBTB24 ZBTB25 ZBTB26 ZBTB3 ZBTB32 ZBTB33 ZBTB34 ZBTB37 ZBTB38 ZBTB39 ZBTB4 ZBTB40 ZBTB41 *ZBTB42 ZBTB43 ZBTB44 ZBTB45 ZBTB46 ZBTB47 ZBTB48 ZBTB49 ZBTB5 ZBTB6 *ZBTB7A ZBTB7B ZBTB7C ZBTB8A ZBTB8B ZBTB8OS ZBTB9 ZC2HC1A ZC2HC1B ZC2HC1C ZC3H10 ZC3H11A ZC3H11B ZC3H12A ZC3H12B ZC3H12C ZC3H12D ZC3H13 *ZC3H14 ZC3H15 ZC3H18 ZC3H3 ZC3H4 ZC3H6 ZC3H7A ZC3H7B ZC3H8 ZC3HAV1 ZC3HAV1L ZC3HC1 *ZC4H2 ZCCHC10 ZCCHC12 ZCCHC13 ZCCHC14 ZCCHC17 ZCCHC18 ZCCHC2 ZCCHC24 ZCCHC3 ZCCHC4 ZCCHC7 *ZCCHC8 ZCCHC9 ZCRB1 ZCWPW1 ZCWPW2 ZDBF2 ZDHHC1 ZDHHC11 ZDHHC11B ZDHHC12 ZDHHC13 ZDHHC14 ZDHHC15 ZDHHC16 ZDHHC17 ZDHHC18 ZDHHC19 ZDHHC2 ZDHHC20 ZDHHC21 ZDHHC22 ZDHHC23 ZDHHC24 ZDHHC3 ZDHHC4 ZDHHC5 ZDHHC6 ZDHHC7 ZDHHC8 *ZDHHC9 *ZEB1 *ZEB2 ZER1 ZFAND1 ZFAND2A ZFAND2B ZFAND3 ZFAND4 ZFAND5 ZFAND6 *ZFAT ZFC3H1 *ZFHX2 *ZFHX3 *ZFHX4 ZFP1 ZFP14 ZFP2 ZFP28 ZFP3 ZFP30 ZFP36 ZFP36L1 *ZFP36L2 ZFP37 ZFP41 ZFP42 *ZFP57 ZFP62 ZFP64 ZFP69 ZFP69B ZFP82 ZFP90 ZFP91 ZFP92 ZFPL1 ZFPM1 *ZFPM2 *ZFR ZFR2 *ZFTA *ZFX ZFY ZFYVE1 ZFYVE16 *ZFYVE19 ZFYVE21 *ZFYVE26 ZFYVE27 ZFYVE28 ZFYVE9 ZG16 ZG16B ZGLP1 ZGPAT ZGRF1 ZHX1 ZHX2 ZHX3 *ZIC1 *ZIC2 *ZIC3 ZIC4 ZIC5 ZIK1 ZIM2 ZIM3 ZKSCAN1 ZKSCAN2 ZKSCAN3 ZKSCAN4 ZKSCAN5 ZKSCAN7 ZKSCAN8 ZMAT1 ZMAT2 ZMAT3 ZMAT4 ZMAT5 *ZMIZ1 ZMIZ2 *ZMPSTE24 ZMYM1 *ZMYM2 *ZMYM3 ZMYM4 ZMYM5 ZMYM6 *ZMYND10 *ZMYND11 ZMYND12 *ZMYND15 ZMYND19 ZMYND8 ZNF10 ZNF100 ZNF101 ZNF106 ZNF107 ZNF112 ZNF114 ZNF117 ZNF12 ZNF121 ZNF124 ZNF131 ZNF132 ZNF133 ZNF134 ZNF135 ZNF136 ZNF138 ZNF14 ZNF140 *ZNF141 *ZNF142 ZNF143 ZNF146 *ZNF148 ZNF154 ZNF155 ZNF157 ZNF16 ZNF160 ZNF165 ZNF169 ZNF17 ZNF174 ZNF175 ZNF177 ZNF18 ZNF180 ZNF181 ZNF182 ZNF184 ZNF185 ZNF189 ZNF19 ZNF195 ZNF197 ZNF2 ZNF20 ZNF200 ZNF202 ZNF205 ZNF207 ZNF208 ZNF211 ZNF212 ZNF213 ZNF214 ZNF215 ZNF217 ZNF219 ZNF22 ZNF221 ZNF222 ZNF223 ZNF224 ZNF225 ZNF226 ZNF227 ZNF229 ZNF23 ZNF230 ZNF232 ZNF233 ZNF234 ZNF235 ZNF236 ZNF239 ZNF24 ZNF248 ZNF25 ZNF250 ZNF251 ZNF253 ZNF254 ZNF256 ZNF257 ZNF26 ZNF260 ZNF263 ZNF264 ZNF266 ZNF267 ZNF268 ZNF273 ZNF274 ZNF275 ZNF276 ZNF277 ZNF28 ZNF280A ZNF280B ZNF280C ZNF280D ZNF281 ZNF282 ZNF283 ZNF284 ZNF285 ZNF286A ZNF286B ZNF287 *ZNF292 ZNF296 ZNF3 ZNF30 ZNF300 ZNF302 ZNF304 ZNF311 ZNF316 ZNF317 ZNF318 ZNF319 ZNF32 ZNF320 ZNF322 ZNF324 ZNF324B ZNF326 ZNF329 ZNF330 ZNF331 ZNF333 ZNF334 *ZNF335 ZNF337 ZNF33A ZNF33B ZNF34 *ZNF341 ZNF343 ZNF345 ZNF346 ZNF347 ZNF35 ZNF350 ZNF354A ZNF354B ZNF354C ZNF358 ZNF362 *ZNF365 ZNF366 ZNF367 ZNF37A ZNF382 ZNF383 ZNF384 ZNF385A ZNF385B ZNF385C ZNF385D ZNF391 ZNF394 ZNF395 ZNF396 ZNF397 ZNF398 ZNF404 *ZNF407 *ZNF408 ZNF41 ZNF410 ZNF414 ZNF415 ZNF416 ZNF417 ZNF418 ZNF419 ZNF420 *ZNF423 ZNF425 ZNF426 ZNF428 ZNF429 ZNF43 ZNF430 ZNF431 ZNF432 ZNF433 ZNF436 ZNF438 ZNF439 ZNF44 ZNF440 ZNF441 ZNF442 ZNF443 ZNF444 ZNF445 ZNF446 ZNF449 ZNF45 ZNF451 ZNF454 ZNF460 ZNF461 *ZNF462 ZNF467 ZNF468 *ZNF469 ZNF470 ZNF471 ZNF473 ZNF474 ZNF479 ZNF48 ZNF480 ZNF483 ZNF484 ZNF485 ZNF486 ZNF487 ZNF488 ZNF490 ZNF491 ZNF492 ZNF493 ZNF496 ZNF497 ZNF500 ZNF501 ZNF502 ZNF503 ZNF506 ZNF507 ZNF510 ZNF511 ZNF512 ZNF512B *ZNF513 ZNF514 ZNF516 ZNF517 ZNF518A ZNF518B ZNF519 ZNF521 ZNF524 ZNF525 *ZNF526 ZNF527 ZNF528 ZNF529 ZNF530 ZNF532 ZNF534 ZNF536 ZNF540 ZNF541 ZNF543 ZNF544 ZNF546 ZNF547 ZNF548 ZNF549 ZNF550 ZNF551 ZNF552 ZNF554 ZNF555 ZNF556 ZNF557 ZNF558 ZNF559 ZNF560 ZNF561 ZNF562 ZNF563 ZNF564 ZNF565 ZNF566 ZNF567 ZNF568 ZNF569 ZNF57 ZNF570 ZNF571 ZNF572 ZNF573 ZNF574 ZNF575 ZNF576 ZNF577 ZNF578 ZNF579 ZNF580 ZNF581 ZNF582 ZNF583 ZNF584 ZNF585A ZNF585B ZNF586 ZNF587 ZNF587B ZNF589 *ZNF592 ZNF593 ZNF594 ZNF595 ZNF596 ZNF597 ZNF598 ZNF599 ZNF600 ZNF605 ZNF606 ZNF607 ZNF608 ZNF609 ZNF610 ZNF611 ZNF613 ZNF614 ZNF615 ZNF616 ZNF618 ZNF619 ZNF620 ZNF621 ZNF622 ZNF623 ZNF624 ZNF625 ZNF626 ZNF627 ZNF628 ZNF629 ZNF630 ZNF638 ZNF639 ZNF641 *ZNF644 ZNF646 ZNF648 ZNF649 ZNF652 ZNF653 ZNF654 ZNF655 ZNF658 ZNF66 ZNF660 ZNF662 ZNF664 ZNF665 ZNF667 *ZNF668 ZNF669 ZNF670 ZNF671 ZNF672 ZNF674 ZNF675 ZNF676 ZNF677 ZNF678 ZNF679 ZNF680 ZNF681 ZNF682 ZNF683 ZNF684 *ZNF687 ZNF688 ZNF689 ZNF69 ZNF691 ZNF692 ZNF695 ZNF696 ZNF697 *ZNF699 ZNF7 ZNF70 ZNF700 ZNF701 ZNF703 ZNF704 ZNF705A ZNF705B ZNF705D ZNF705E ZNF705G ZNF706 ZNF707 ZNF708 ZNF709 ZNF71 ZNF710 *ZNF711 ZNF713 ZNF714 ZNF716 ZNF717 ZNF718 ZNF720 ZNF721 ZNF723 ZNF724 ZNF726 ZNF727 ZNF728 ZNF729 ZNF730 ZNF732 ZNF735 ZNF736 ZNF737 ZNF738 ZNF74 ZNF740 ZNF746 ZNF747 ZNF749 *ZNF750 ZNF75A ZNF75D ZNF76 ZNF761 ZNF763 ZNF764 ZNF765 ZNF766 ZNF768 ZNF77 ZNF770 ZNF771 ZNF772 ZNF773 ZNF774 ZNF775 ZNF776 ZNF777 ZNF778 ZNF780A ZNF780B ZNF781 ZNF782 ZNF783 ZNF784 ZNF785 ZNF786 ZNF787 ZNF789 ZNF79 ZNF790 ZNF791 ZNF792 ZNF793 ZNF799 ZNF8 ZNF80 ZNF800 ZNF804A ZNF804B ZNF805 ZNF808 ZNF81 ZNF813 ZNF814 ZNF816 ZNF821 ZNF823 ZNF827 ZNF829 ZNF83 ZNF830 ZNF831 ZNF835 ZNF836 ZNF837 ZNF839 ZNF84 ZNF841 ZNF843 ZNF844 ZNF845 ZNF846 ZNF85 ZNF850 ZNF852 ZNF853 ZNF860 ZNF862 ZNF865 ZNF878 ZNF879 ZNF880 ZNF883 ZNF888 ZNF891 ZNF90 ZNF91 ZNF92 ZNF93 ZNF98 ZNF99 *ZNFX1 ZNHIT1 ZNHIT2 *ZNHIT3 ZNHIT6 ZNRD1 ZNRF1 ZNRF2 *ZNRF3 ZNRF4 *ZP1 *ZP2 *ZP3 ZP4 *ZPBP ZPBP2 ZPLD1 *ZPR1 ZRANB1 ZRANB2 ZRANB3 ZRSR2 ZSCAN1 ZSCAN10 ZSCAN12 ZSCAN16 ZSCAN18 ZSCAN2 ZSCAN20 ZSCAN21 ZSCAN22 ZSCAN23 ZSCAN25 ZSCAN26 ZSCAN29 ZSCAN30 ZSCAN31 ZSCAN32 ZSCAN4 ZSCAN5A ZSCAN5B ZSCAN5C ZSCAN9 ZSWIM1 ZSWIM2 ZSWIM3 ZSWIM4 ZSWIM5 *ZSWIM6 *ZSWIM7 ZSWIM8 ZSWIM9 ZUP1 ZW10 ZWILCH ZWINT ZXDA ZXDB ZXDC ZYG11A ZYG11B ZYX ZZEF1 ZZZ3";
const VOC_PAROLE_STR = "aalfs aapoaiv aarskog aase abbraccio abcd abdominal abducens abducente abduction abductor abduzione aberrant abeta abetal abetalipoproteinemia abidi abituale ablepharon abnormal abnormalitie abnormalities abnormality abnormalpalmar abolizione aborti abortita abortivita aborto abruzzo abscedens abscess absence absences absent absorptive acalvaria acantholytic acanthosis acantocitosi acantolisi acantosi acatalasemia acatisia accartocciato accelerata acces accessoria accessorie accessorio accessory acciottolato accorciamento accorciato accumulation accumulo acephalic aceruloplasminemia acetabolare acetabolari acetabolo acetabuli acetazolamide acetil acetilcolina acetophenetidin acetyl acetylaspartate acetylation acetylcholine acetylcholinesterase acetylgalactosaminidase acetylglutamate acetylhydrolase acetyltransferase achalasia achard acheiropodia acheiropody achille achilleo achondrogenesis achondroplasia achoo achromatopsia acid acidemia acidi acidificazione acido acidosi acidosis aciduria acilcarnitina acilia acinesia acitretin ackerman acne acoliche acondroplasia acquedotto acqueduttale acquired acquisita acquisizione acral acrale acro acrocallosal acrocapitofemoral acrocardiofacial acrocephalopolydactylous acrocephalopolydactyly acrocraniofacial acrocyanosis acrodermatitis acrodysostosis acrodysplasia acrofacial acrofrontofacionasal acrogeria acrogigantism acrokeratoderma acrokeratoelastoidosis acrokeratosis acrokeratotic acroleukopathy acromegaloid acromegaly acromelia acromelic acromesomelic acromial acromicria acromicric acroosteolisi acroosteolysis acrootoocular acroparestesia acropectoral acropectorovertebral acropigmentation acrorenal acth actin actinic activated activating activation activator activity acufene acuita aculeiform acuta acute acutezza acuto acyl acylcarnitine acyltransferase acys adactylia adamantinoma adams adattamento addison addisonianism addominale addormentamento adducted adductor adduttile adduttore adelaide adenine adenocarcinoma adenohypophysitis adenoma adenomas adenomatous adenosina adenosine adenosylhomocysteine adenosyltransferase adenylate adenylosuccinase adenylosuccinate aderenza adhesion adie adiponectina adiposis adiposo adld adnatum adnp adolescent adolescenza adp adrenal adrenals adrenarca adrenocortical adrenocorticotropo adrenoleukodystrophy adrenomyeloneuropathy adrenomyodystrophy adult adulto adults advance advanced afasia affaticabile affaticamento affective affettivo affetto affollamento affusolate affusolato afibrinogenemia african aftosa agammaglobulinemia agangliare aganglionosis age agel agenesia agenesis agenti agglutinin aggravated aggrecan aggregate aggregates aggregazione aggressive aggressivita aggressivo aging agitazione agli aglossia agnathia aguirre ahdc aica aicardi aids ain aird aires airway akhtar akinesia akt ala alacrima alacrimia alae alagille alajouanine aland alanina alar alazami alba albers albescens albinism albinismo albipunctatus albright albuminuria alcalina alcaline alcalosi alcohol alcolismo aldh aldolase aldolasi aldosterone aldosteronism aldrich alect alexander alfa alfadhel alg algerian alimentare alimentari alimentazione aliu alkalosis alkaptonuria alkuraya all alla allan allargamento allargata allargate allargato alle allele allergeni allergia allergic allineamento allo alloimmune alloimmunization alluce allucinazione allucinazioni almeida almurshedi alobar alobare alopecia alpers alpha alport alstrom alta alterata alterations alterato altered alternanza alternata alternating altezza altitude alto altri alveolar alveolare alveolari alveolatura alveolus alzahrani alzheimer amartoma amartomatosa amastia amaurosis ambigui ambiguous ambiguus ambliopia amblyopia ambras ambulation amed amegakaryocytic amelia amelo amelocerebrohypohidrotic amelogenesi amelogenesis amenorrea american amiel amino aminoacidi aminoaciduria aminoacylase aminoadipic aminoglycoside aminoisobutyric aminopterin aminotransferase aminotransferasi amiotrofia amish amme amminoaciduria amniotico amobarbital amoebae amoebiasis amoebic amorph amorphous ampia ampiamente ampiezza ampio amyloid amyloidosis amyotonia amyotrophic amyotrophy amytrophic anadysplasia anagen anal analbuminemia anale anaplastic anartria anasarca anauxetic anca anchiloglossia anchilosi and andatura anddeafness anddeformity andersen anderson andother andprogressive andproportionate androgen androgenetic andskeletal andtransverse ane anello anemia anemiadue anemias anemico anencefalia anencephaly anendocrinosis anergy anesthesia anetoderma anetodermia aneuploidy aneurisma aneurysm aneurysmal aneurysms angel angelman angiitis angiocheratoma angioedema angiofibroma angiofibromi angiokeratoma angiolipomatosis angioma angiomatoid angiomatosis angiomiolipoma angioosteohypotrophic angiopathic angiopathy angiostrongyliasis angiotensin angle angolare angolate angoli angolo anguli anhalt anhidrosis anhidrotic anhydramnios anhydrase anidramnios anidrosi anion aniridia anisocitosi anisometropia anisopoikilocitosi ank ankyloblepharon ankyloglossia ankylosing ankylosis ankyrin anni annular ano anoctamin anoctaminopathy anodontia anodonzia anogenital anomala anomale anomali anomalia anomalie anomalies anomaliesbranchial anomalo anomalous anomaly anomica anonychia anophthalmia anorectal anoressia anorexia anormale anormali anormalita anormalmente anosmia anotia ansia antagonist antecubital antenatal anterior anteriore anteriori anteriormente anthrax anti antibodies antibody anticoagulante anticorpale anticorpi anticorpo antidiuresis antidiuretico antielica antigene antihelix antimitocondriali antimulleriano antinucleari antiphospholipid antiplasmin antisynthetase antitetanico antithrombin antithyroid antitragus antitrombina antitrypsin antiversione antley antral antrali anulare anus aorta aortae aortic aortica aortico aortitis aorto aortopolmonari apatia apc apert aperta aperto aphakia aphalangia aphalangy aphasia aphonia aplasia aplastic aplastica apnea apneici apolipoprotein apoplexy app apparato apparent appearance appendage appendages appendicitis appendicolare appendix appetito appiattimento apprendimento appuntita appuntito aprassia apraxia aprosencephaly aptitude aptoglobina aquagenic aqueduct arachidonico arachnodactyly arachnoid arachnoiditis aracnodattilia aracnoidea arancioni arboleda arch arco arctic arcuate arcuato arcuatura areata aredyld areflessia areflexia areflexic areolar argente arginine argininemia argininosuccinic arhinia arima aritmia arm armfield arms arnold aromatase aromatic arrencefalia arrest arresto arrhinia arrhythmia arrhythmias arrhythmogenic arricciate arrossamento arrotondamento arroyo arteria arterial arterie arteries arteriolare arteriopathy arteriosa arteriosclerosi arteriosclerosis arterioso arteriosus arteriovenous arteritis artery arthritis arthrochalasia arthrogryposis arthropathy arti articolare articolari articolazione articolazioni articular artiglio arto artralgia artrite artrogriposi artropatia artrosi arts arx asbestos ascellare ascendente ascending ascessi ascesso ascher ascite ascites aseptic asherman asimmetria asimmetrico asistolia asma asparagine aspartato aspartylglucosaminuria asperger aspergillosis aspetto asphyxiating aspiration aspirazione aspirin asplenia assembly assente assenti assenza assiale assistita associata associated association associationvacterl assonale assottigliamento astatic astenia asthma astigmatismo astley astrocitoma astrocytoma asymmetry asymptomatic atad atassia ataxia ataxic atelettasia atelis atelosteogenesis aterosclerosi atetosi athabaskan athelia atherosclerosis athetoid athrombia athyreosis atic atipica atipico atkin atlanto atlantoaxial atonic atonica atoniche atopic atopica atp atpase atr atransferrinemia atresia atrial atriale atriali atrichia atrio atrioventricolare atrioventricular atrium atrofia atrofica atrofiche atrophia atrophic atrophicans atrophoderma atrophy attaccato attaccatura attacco attention attenuated attenuazione attenzione attiva attivita attorcigliati attr attrv atypical auditory aumentata aumentati aumentato aumento aura aural auralcephalosyndactyly aureus auricolare auricular auriculo auriculocondylar auriculoosteodysplasia auroneurodental autism autismo autistic autistico autoamputazione autoantigen autoerythrocyte autoimmune autoimmunehemolytic autoimmuni autoimmunita autoimmunity autoinflammation autoinflammatory autolesionistico automutilazione autonomic autonomica autonomo autophagic autophagy autorigenerante autosomal autosomaldominant autosomalrecessive autostoppista auts avambraccio avanzata avascular avellino avian avium avversione awakening axenfeld axial axin axonal ayme azione azoospermia azoto babesiosis babinski baby bacino bacterial bain bainbridge bakalinova baker balbuzie balding baller bamforth band banda bands bangstad banka banki bannayan baraitser barakat baralle barber bardet bare barel barnes baron barr barre barrett barrow barsy bart barth bartsocas bartter basal basale basali basaloid basan base basedow basel basement basilar basilare basilicata basocellulare bassa basse bassi bassissima basso bastoncelli bastoncello bathing batteriche batteriemia baumann bauser bazex bcgite bcgosi beare beauce beaulieu beccatura beck becker beckwith beemer beevor behavior behavioral behcet behmel behnke behr bellen belly bencze benign benigna benigno bent bernard berry bersaglio bertini beryllium best bestrophinopathy beta bethlem between beukes beuren bhoj bianca bianche bianco bicarbonato bicd bickel bickerstaff bicornuto bicoronal bicoronale bicuspid bicuspide biedl biemond bienvenu biesecker bietti bifid bifida bifide bifido bifocal bifunctional bifurcati bigeminia bignami bigtoes bilambdoid bilateral bilaterale bilaterali bile biliare biliari biliary bilirubin bilirubina bilobata bilobato binder binding biogenesis biosynthesis biotin biotinidase biphasic bipolare birdshot birk birt birth bisphosphatase bite biventricolare bixler bjornsson bjornstad blackfan bladder blastoma blasts blau bleb blebs bleeding blefarite blefarocalasi blefarofimosi blepharo blepharochalasis blepharocheilodontic blepharonasofacial blepharophimosis blepharoptosis blepharospasm blind blindness blistering blizzard blocco block blocker blok blomstrand blood bloom blount blu blue bmiq bnar bocca bodies bodmer body bogaert bohring boichis bolk bolla bolloso boltshauser bone bones bonnemann bonni book boomerang boonstra bor borderline bordi bordo borer borghgraef borjeson borne bornholm borochowitz borsite bosch bosma bothnia bothnian botulism boucher boudin boutonneuse bowel bowen bowing bowman boycott braccia braccio brachial brachicefalia brachidattilia brachiturrorifalia brachmann brachycephaly brachydactylous brachydactyly brachyectrodactyly brachymorphism brachyolmia brachyphalangy brachytelephalangic brachytelephalangy braddock bradicardia bradicinesia bradiopsia brady bradyopsia brain brainstem branca branch branched branchial branchiale branching branchio branchiogenic branchiooculofacial branchiootic branchiootorenal branchioskeletogenital brauer braun breakage breast breasts breath bresek bresheck breve brevetto bridge bridged brischiati brittle broad brocks brocq brody bronchial bronchiectasie bronchiectasis bronchiolite bronchiolitis bronchite bronchogenic bronchopulmonary broncoalveolare broncogena broncomalacia broncopolmonari brooke brown brubakk brucellosis bruck brugada brunet brunner brushfield brussels bruxismo bryant buchem bucklers budd buenos buerger bulbar bulbare bulbi bulbo bulboso bulimia bullae bullosa bullous bundle buratti burkitt burn burning burst buschke butterfly butylmercaptan butyrylcholinesterase cabezas cacchione cacciavite cach cachessia cachexia cadds cadenti cadute cafe caffey cahmr caignec cakut calcagno calcific calcificans calcification calcifications calcificazione calcificazioni calcified calcinosis calcio calciphylaxis calcitonina calcitriolo calcium calcolosi caliceal calici called callosal callosities calloso callosum calore calpain calprotectina calvaria calvarial calvariale calvarialhyperostosis calvario calve cambiamenti camera camminare camos campana campeau campo campomelia campomelic camptobrachydactyly camptocormia camptodactyly camptodattilia camptomelic camptosynpolydactyly camurati canada canadian canal canale canavan cancer cancro candida candidiasis candidosi canine cantagrel cantrell cantu cap capacita capelli capello capelluto capezzoli capezzolo capillare capillaries capillary capital capitale capitis cappuccio capsula car carabelli carasil caratteristiche carbamoyl carbimazole carbinolamine carbon carbonic carboxykinase carboxylase carboxypeptidase carcinoid carcinoide carcinoma carcinomacloacogenic card cardiac cardiaca cardiaco cardio cardioacrofacial cardioauditory cardiocranial cardiocutaneous cardiodysrhythmic cardioencephalomyopathy cardiofacial cardiofaciocutaneous cardiofacioneurodevelopmental cardiogenic cardiogeno cardiomegalia cardiomegaly cardiomiopatia cardiomyopathic cardiomyopathy cardiomyovasculopathy cardioneuromyopathy cardiopathy cardiopatia cardiorespiratorio cardiospondylocarpofacial cardiovascolare cardiovascular carenza carey cariati caribbean carichi carinatum cariotipo carne carney carnitine carnose carnosinase carnosinemia caroli carolina carotenemia carotid carotide carotidea carpal carpale carpali carpenter carpo carpotarsal carrier carriers carrying carta cartilage cartilages cartilagine carvajal cascata cascos caseosa casq castleman cat catania cataract cataracts cataratta catastrophic catecholaminergic catel catena catifa catosterolo caudal caudato caused causing cava cavallo cavernoso cavernous caviglia cavita cavitary cavitating cavum cavus cayler cayman cbl cbla cblb cblc cbld cble cblf cblg cblj cblx cdags cdg cdkl cebalid cecita cednik cefalea cefaloematoma ceide celiac celiaca celiachia cell cells cellular cellulare cellule cellulite cellulitis celsi cemento cementoma cenani central centrale centrali centralopathic centrifugal centrofacial centromere centromeric centronuclear centrotemporal centrotemporali cephalic cephalin cephalocele cephalopolysyndactyly cerchiati cerchio cerebellar cerebellare cerebellari cerebellofaciodental cerebelloparenchymal cerebral cerebrale cerebrali cerebro cerebrocostomandibular cerebrofacioarticular cerebrofaciothoracic cerebrofrontofacial cerebrooculofacioskeletal cerebrooculonasal cerebroosteodysplasia cerebroosteonephrodysplasia cerebroretinal cerebrospinale cerebrotendinous cernunnos ceroid cerotto cerulean ceruloplasmina cervelletto cervello cervical cervicale cervicali cervice cervicothoracicsomite ces cesareo cfhr chaddock chahrour chain chalazion chamber chanarin chand chands changes channel char characteristic charcot charge charlevoix charlie chassaing chat chaudhry chauveau chavany che chediak cheek cheilite cheilitis cheilo cheloidi chemotactic chemotaxis chemotaxix cheney cheratinociti cheratite cheratocongiuntivite cheratocono cheratoderma cheratosi cherubism chester chetoacidosi chetonuria chetosi chetotica chiare chiari chiasma chiazze chikungunya chilblain childhood chilotorace chilton chime chimerism chinasi chinata chitayat chiusura chloramphenicol chloride choanal cholangiocarcinoma cholangitis cholelithiasis cholera cholestasis cholestatic cholesterol cholesteryl chondrocalcinosis chondrodysplasia chondroectodermal chondroitin chondromalacia chondromatosis chondrosarcoma chopra chops chordoma chorea choreathetosis choreoacanthocytosis choreoathetoid choreoathetosis choriocarcinoma chorioretinal chorioretinopathy choroid choroidal choroideremia choroidocerebral chotzen christianson christol chromatid chromomycosis chromosomal chromosome chronic chst chudley chung chylomicron chylomicronemia chylous cianosi cianotico cicatrice cicatrici cicatricial cicatrizzazione ciclo cidec cielo cifoscoliosi cifosi ciglia ciliare ciliary ciliarydyskinesia ciliegia cilliers cimdag cinca cincinnati cinetico cingolo cinotti cipolla circinate circolante circolanti circolazione circolo circulating circumferential circumpolare circumscribed circumscriptus circumvallate cirrhosis cirrosi ciste cisterna cisti cistica cistico cistifellea cistite cistoide citocromo citomegalovirus citrin citrullina citrulline citrullinemia claes clapo clark clasped class classe classic classical claudicazione clausen clavicle clavicola clavicolare clavicole clcn clear clearance cleavage cleft clefting clefts cleidocranial cleidorhizomelic clinodactyly clinodattilia clitoridea clivus cll cln cloaca cloacal clonica clono cloruro closed closure clotting clouston cloverleaf cloves clubbing clubfoot cluster cmo cmt cmv cntnap coa coach coagulation coagulativa coagulazione coalition coarctation coarse coartazione coasy coats cobblestone cocaine cocardes coccidioidomycosis coccigee cochlear cochleosaccular cock cockayne coclea coda codas coenzyme coexisting cofactor coffin cofs cog cogan cognitiva cognitive cognitivo cognizione cohen coinvolge colangite colchicine cold cole colelitiasi colestasi colesteatoma colesterolo coli colipase colite colitis collagen collagene collagenoma collagenosis collagenous collapse collaterali collezionismo colli collins collo collodion coloboma colobomata colobomatous colon colonic colorazione colorblindness colore colorectal colpisce colpocefalia coltura columella column coma combinata combined comedogenic comedones comedonicus commissura commissural common communicating communication commutate compaction compattazione complement complementation complessa complessi complesso completa complete completo complex complicated component comportamentale comportamenti comportamento composizione composto compreso compression compressione compromessa compromissione compton compulsive compulsivi compulsivo comune comunicante con concava concentrazione concentric condensing condilo condrocalcinosi conduction conductive conduttivo conduzione condylar cone confluente confusione confuso congenita congenital congenitalcataracts congenitalhypofibrinogenemia congenitally congenite congenito congestive congestizia congiuntivale congiuntivite congo coni conico coniugata coniugati coniugato conjugated conjugation conjunctiva conlin connatal connective connessione connettivo cono conodysplasia conotruncal conradi consapevole consapevolezza conservata constricting conta contagioso contatto contenuto contiguous continua continue continuous contractural contracture contractures contrattura contratture contrazione contrazioni contro controllo convertase convessa convulsioni convulsions convulsive convulsivo cooks coombs cooper coordinazione coppa copper coproporfirina coproporphyria coq cor coracoclavicular coralliform cord corde cordialita cordiera cordoglio cordone core corea corectopia coreoatetosi cores coriocapillare corioideo corioretinica corioretinico cormier cornea corneal corneale corneali cornelia corneodermatoosseous corneoretinal corner coroideo coroideremia coronale coronaria coronarica coronarico coronarie coronary coronavirus corpi corpo corporatura corporeo corporis corpus corpuscolare corrected correre corta corte corteccia corti cortical corticale corticali corticalis cortico corticobasal corticomeningeal corticosteroid corticosterone cortisolo cortisone corto costa costale coste costello costipazione costocoracoid costole costovertebral costrittiva costrizione costruttiva cough coumarin cousin covid cowchock cowden cox coxa coxoauricular coxopodopatellar coxsackievirus crac cramp crampo cramps crandall crane cranial cranialis cranica cranici cranio cranioacrofacial craniodiaphyseal craniodigital cranioectodermal craniofacial craniofaciofrontodigital craniofacioskeletal craniofrontonasal craniolenticulosutural craniometadiaphyseal craniometaphyseal craniopharyngioma craniorachischisis craniosinostosi craniosynostosis craniotelencephalic craniotubular crasso crease creases creatina creatinchinasi creatine creatinina crebbp cree crepitii crescita cresta creste creutzfeldt creveld cri crigler crimean criptococcica criptorchidismo crises crisi crisponi criss croce crohn crome cromer cromosomica cronica cronico cronkhite cronotropa cross crossed crossing crouzon cryofibrinogenemia cryoglobulinemia cryoglobulinemic cryohydrocytosis cryptococcosis cryptogenic cryptomicrotia cryptophthalmos cryptorchidism cryptotia crystallin crystalline ctcf ctla ctpa cubiti cubito cubitus culler cumming cuoio cuore cupido currarino curry curth curva curved cuscinetto cushing cuspide cutanea cutanee cutanei cutaneo cutaneous cutis cwf cyanide cyanosis cyclase cycle cyclic cylindromatosis cyp cyst cystathionine cystathioninuria cysteine cystic cysticercosis cystinosis cystinuria cystitis cystoid cysts cytidineuria cytochrome cytokine cytomegalovirus cytopenia cytopenias cytosolic czech czeizel dacryoadenitis dacryocystitis dagher dahlberg daire dal dall dallo dalton dandy danish danks danlos danon danubian darier darwin darwinian dattani dauber davignon dbh dclre ddost deaf deafness deambulazione deaminase deaminasi deardorff death debarquement debole debolezza debranching decade decalvans decarbossilasi decarboxylase decline decr decreased decrescente deeah deemed deep defect defective defects defectsudden deferens deficency deficiencies deficiency deficiencymultiple deficient deficit deficits deflusso deformata deformation deformazione deformed deformita deformity degcags degeneration degenerationand degenerativa degenerative degenerazione degli deglycosylation degos dehydratase dehydrated dehydrogenase dei deidrocolesterolo deidrogenasi deiodinase dejerine del delay delayed deleted deletion deletions delezioni dell della delle dello delpire delta deltoide delusione dementia demenza demielinizzante demielinizzazione demirhan demyelinating den denborough dend dendritic dengue densi densita density dent dental dentale dentaria dentate dentato dentatorubral dente dentellato denti dentici dentin dentinogenesi dentinogenesis dentition dentizione dento denys deoxyribose dependence dependent deperimento depigmentation depletion deplezione deposit deposition deposits deposizione depressa depressione depressive depresso depressor der derivatives derived dermal dermatite dermatitis dermatocasia dermatofibrosarcoma dermatofitosi dermatoleukodystrophy dermatomyositis dermatoosteolysis dermatopathia dermatosi dermatosis dermatosparaxis dermico dermochondrocorneal dermodistortive dermoepidermica dermoid dermoide dermoids dermolysis dermoodontodysplasia dermopathy dermotrichic desanto desaturasi desbuquois descemet desminopathy desmoid desmoplastic desmosterolo desmosterolosis desquamata desquamativa desquamative desquamativum desquamazione destra destro destrocardia destroposizione destruction deterioramento deterioration deutan develomental developed development developmental deviazione dextro dextrocardia dguok diabete diabetes diabetic diafisaria diafisi diaframmatica diagnostica dialisi diametro diaminopentanuria diamond diaper diaph diaphanospondylodysostosis diaphragm diaphragmatic diaphyseal diarrea diarrhea diastasi diastasis diastema diastematomyelia diastolica diastolico diastrophic diathesis dibasic dicarbossilica dicarboxylicamino didelfo dieker diencephalic dienoyl dietary diethylstilbestrol diets dietz difetti difetto difference differentiated differenziazione difficolta difficulties diffusa diffuse diffusion diffusione diffuso diffusum digenic digeorge digit digital digitale digitotalar digits dihydrofolate dihydrolipoamide dihydropteridine dihydropyridine dihydropyrimidine dihydropyrimidinuria dilatata dilatation dilatato dilatazione dilated dimelia dimensioni dimenticanza dimero dimethylglycine diminuita diminuzione dimples dinucleotide dipendenza diphallia diplegia diplopia diplopodia diprosopus dirette disabilita disabilities disability disabling disartria disassate disc discalculia discendente discinesia disco discoid discoide discoordination discordante discorso discrete discrimination discromatopsia disdiadochinesia disease diseases disestesia disfagia disfonia disfunzione disgenesia disidratazione disinibizione disintegrative dislessia dislipidemia dislocation dislocations dislocazione dismetria dismielinizzazione dismotilita disomy disorder disordered disorders disordine disorganization disostosi dispersion displacement displasia displasica displasico displastica dispnea disproportion disregolazione disruption dissecans dissecante dissecting dissection disseminata disseminated disseminatum dissezione dissociation dissociazione distacco distal distale distali distalmente distanza distanziate distanziati distelmaier distensae distensione distichiasis distinctive distocia distonia distress distretto distrofia distroglicano disturbance disturbi disturbo disulfiduria dita dito diutinum divergence diverticolo diverticolosi diverticula diverticuli diverticulosis diverticulum divisa division divry dlco dna dnajb dnm dock dohle dolicocefalia dolore dolorosa dominant dominantchondrodysplasia donato dondolamento dondolo donnai donnell donohue doors dopa dopamine dopaminergici dopo doppia doppio dorfman dorsiflessione dorsiflessori dorso dorsocervicale dos dosage dotto double doublecortin doughnut dovuta dovuto dowling down doyne dpagt dpm dracunculiasis drash dravet dreifuss drepanocitosi driscoll drop drought drug drugs drusen dsdna duane dube dubin dubowitz duchenne duclos duct ductus dudley due dueto dunnigan duodenal duodenale duplicated duplication duplicazione dupre dupuytren dural durale durante duro dutch dwarfism dworschak dyggve dyrk dysalbuminemic dysarthria dysautonomia dysbetalipoproteinemia dyschondrosteosis dyschondrostosis dyschromatosis dyscrasia dysequilibrium dyserythropoiesis dyserythropoietic dysferlin dysfibrinogenemia dysfunction dysfunctional dysfunctions dysgenesia dysgenesis dysgenetic dysgyria dyshormonogenesis dysinnervation dyskeratoma dyskeratosis dyskeratotic dyskinesia dyslexia dysmorphic dysmorphism dysmotility dysmyelinating dysmyelination dysosteosclerosis dysostosis dysphagia dysphalangism dysphasia dysphoria dysphoric dysplasia dysplastic dyspraxia dysraphism dysregulation dysrhythmia dyssegmental dysspondyloenchondromatosis dyssynostosis dystasia dystelephalangy dystonia dystonic dystransthyretinemic dystroglycan dystroglycanopathy dystrophia dystrophic dystrophica dystrophy dyt eales ear earlobe earlobes early earlydeath earring ears east eaton ebola ebstein eccessiva eccessivamente eccessivo ecchimosi ecg echinococcosis echo eclabion eclampsia ecogenicita ecogeno ecografia ecolalia ectasia ectodermal ectopia ectopic ectopica ectopico ectrodactyly ectropion eczematoide edema edict edinburgh eds eec eeg eem effetto effettrice effusion ehlers eichner eiezione eiken eisenmenger elahi elasticum elastoderma elastosis elbow elbows electrical electrocardiographicabnormalities electroencephalographic electrolyte electroretinal electroretinograms elejalde elements elettrofisiologia elettroretinogramma elevata elevated elevati elevation elevato elevatum elevazione elfica elica elice eliche elliptocytosis ellis ellison ellitocitosi eloquio elsahy emaciation emangioma emangiomatosi emanuel ematico ematochezia ematomi ematuria embolia embrionale embriotoxon embryo embryofetopathy embryonal embryonic embryopathy embryotoxon emeralopia emery emg emiaritmia emiclonica emicrania emifacciale eminenza emiparesi emiplegia emissione emissioni emivertebre emocromatosi emofagocitosi emofilia emoglobina emolitica emorragia emosiderina emotiva emottisi emozioni emphysema empiema empty enamel encasement encefalico encefalite encefalocele encefalopatia encephalitis encephalo encephalocardiomyopathic encephalocele encephalocraniocutaneous encephalomalacia encephalomyelitis encephalomyelopathy encephalomyopathic encephalomyopathy encephalopathy enchondromatosis encondromatosi end ende endemic endocardial endocarditis endocrine endocrinopathy endolymphatic endometrial endometrio endometriosi endometriosis endomisiale endomyocardial endopeptidase endosteal endothelial endove enfisema eng engelmann enhanced enlarged enlargement enoyl entamoeba enteric enterocolitis enterocyte enterokinase enteropathica enteropathy enteropatia enterovirus entesite enthesitis entrapment entropion enuresi enuresis envenomation enzyme eosinofila eosinofilia eosinophil eosinophilia eosinophilic eosinophilopenia epatica epatiche epatico epatite epatocellulare epatomegalia epatopatia epatosplenomegalia epcidina ependimoma ependymoma epiblepharon epicanthus epicanto epidermal epidermica epidermodysplasia epidermoid epidermoidea epidermolitica epidermolysis epidermolytic epididimite epifisaria epifisi epiglottide epilepsy epileptic epilepticus epilessia epilettica epilettiche epilettico epilettiforme epilettiformi epimerase epinefrina epiphyseal epiphysealis epiphyses episodes episodi episodic episodica episodico episodio epispadias epistassi epistaxis epitelio epitelioma epithelial epithelioma epithelium epitope epsilon epstein equinovarus erdheim ereditaria ereditario eri erickson eritema eritematosa eritematoso eritrociti eritroderma eritroide eritropoiesi eritrosedimentazione ermine ernia erniazione erosion erosione erosive ertbruggen eruption eruptive eruttivi eruzione erythema erythematosus erythermalgia erythroblastheterochromatin erythroblastopenia erythrocyte erythrocytes erythrocytic erythrocytosis erythroderma erythroid erythrokeratoderma erythrokeratodermia erythroleukemia erythromelalgia erythropoiesis erythropoietic esagerata esagerato esch escissione escobar escopresi esecutivo esercizio esile esodeviazione esofagea esofagite esofago esophageal esophagitis esophagus esordio esostosi esotropia espansione espettorato esposizione espressione espressiva espressivo essential essudativa estensione estensori ester esterificazione esterna esterni esterno esterocettiva esteso estradiolo estrazione estroflesso estrogen estruzione eta eterocromia eterotopia eterotropia ethanolaminosis ethylene ethylmalonic etiology etretinate eulenburg euthyroidal evans even eversione everted evidenti evocati evocato ewing exacerbationin exanthematous excavatum excess excessive exchange exchondrosis excluding excretion exencephaly exercise exertion exfoliation exocrine exostoses exotropia expansile expansion expansions expression exstrophy extensive extensor external extracranial extracutaneous extracutenous extrahepatic extramammary extraocular extraocularinvolvement extraoral extrapiramidale extrapyramidal extraskeletal extrasystoles extreme extremity exudative eye eyebrow eyebrows eyelashes eyelid eyelids fabry faccia facciale facciali face facial facialfeatures facies facilita facio facioauriculothoracic faciocardiomelic faciocardiomusculoskeletal faciocardiorenal faciocranial faciodigitogenital faciomandibular facioscapulohumeral factor factors fadd faden fahrner failure faivre falange falangee falangi falce fallot familial familiare fanconi farber farfalla faringe faringea farmaci fascial fascicolare fascicolazioni fasciculations fasciitis fascio fast fatal fatale fatco fattore fatty faundes favism favorevole fbln fdg features febbre febbrile febrile fecale fecali feci feeding feet fegato feil feingold felice felty female femmine femminile femminili femoral femorale femorali femore femur femurs fenditura fenestrated fenomeno feocromocitoma ferguson ferite ferritin ferritina ferro fessura fessurato fessure fetal fetale fetalis feto fetomaternal fetoprotein fetus feuerstein fev fever fevers fgfr fiber fibers fibre fibrillation fibrillazione fibrinogen fibrinogeno fibrinolytic fibroadenomas fibroadipose fibroblasti fibrochondrogenesis fibrodysplasia fibroelastosis fibrofollicoloma fibrolipomatous fibroma fibromata fibromatosi fibromatosis fibromuscular fibronectin fibrosi fibrosing fibrosis fibrothecoma fibrous fibula fibular fibulare fibulo ficolin fifth filaments filaminopathy filariasis filetto filiforme filippi filtering filtrazione filtro fimosi fine fineman finger fingernail fingerprint fingerprints fingers fingertip fini finkel finnish first fischiante fish fisher fisico fisiologia fissazione fission fisso fistola fistula fistulae fistulas fitoemoagglutinina fixation fixed fkbp fkrp flagelli flaitz flammei flammeo flammeus flash flat flaujeac flavin fleck flessione flessori flexural fliedner flna floating florid flotch fluctuans fluent flutter flynn fmn fobia focal focale focali focalizzazione foci focolai focomelia foerster foix folate folati folding foliaceus folinic follicle follicolare follicoli follicolite follicolo follicular follicularis folliculitis folto fondo fong fonici fonofobia fontaine fontanella fontanelle foodborne foot for forame foramina forbice forearm forehead forelock form forma formazione forme formiminoglutamic formiminotransferase forms forssman forsythe foruncolosi fosfatasi fosfati fosfato fosfolipidi fossa fosse fossetta fotofobia fotopsia fotosensibilita fountain fourie fourth fovea foveal foveomacular fowler foxg foxn foxp fra fracture fractures fragile fragili fragilita fragility franceschetti frank fraser frasier frattura fratture fraumeni fraxe fraxf frazione freddo free freeman freezing french frenchman frenula frenulo frequente frequenti frequenza frequenze frias fried friedreich from froment front frontal frontale frontali fronte fronto frontofacionasal frontometaphyseal frontonasal frontoocular frontoparietal frontorhiny frontotemporal frontotemporale fructose fructosuria fruste frustrazione frutta frutti fry fryns fuchs fucosidosis fucosylation fuga fugax fujimoto fukuyama fuldauer full fulminans fulminant fulminante fumarase fumarico function functional functioning fundal fundus fungiform fungina fungine fungoides funzionalita funzionamento funzione fusa fusariosis fuse fused fusion fusione fusions fvc gaba gabbia gabriele gaisbock gait galactokinase galactorrhea galactose galactosemia galactosialidosis galactosylhydroxylysyl galattocerebrosidasi galattorrea galattosidasi galattosio galen gallbladder galloway galt gambe gambo gamborg gamma gammopathy gancio gangli ganglia gangliocytoma ganglion ganglioneuroblastoma ganglioneuroma ganglionopathy ganglioside gangliosidosis gangrenoso gangrenosum gapo gardner garg gastaut gastric gastrica gastrico gastrinoma gastrite gastritis gastrocutaneous gastroenterite gastroenteritis gastroesofageo gastroesophageal gastrointestinal gastrointestinale gastroparesi gastroschisi gastroschisis gastroschisisabdominal gastrostomico gata gattonare gaucher gazali gaze gbbb gcgr gelatinous geleophysic gelso gemignani gemini gene generalisata generalized generalizedpolyneuropathy generalizzata generalizzate generalizzati generalizzato generalizzazione genetic genevieve gengiva gengivale gengive gengivite geniospasm genital genitale genitali genitalia genitopalatocardiac genitopatellar genitourinario genitourinary genochondromatosis genu gerbode germ german geroderma gerold gerstmann gestational gestationis gestazionale ghiandola ghiandole ghorgani ghosal ghr ghsr giacheti giallo giant giardia giardiasi gibbs gibson giedion giganti gigantiform gigantism gilbert gilford gilles gillespie gillessen ginecomastia gingiva gingival ginocchio giovanile girdle giroscopico gist gistelinck gitelman giunzione gjc glabella glabellare gland glands glandularis glanzmann glasgow glass glaucoma gli glicerato glicina glicogeno glicosilazione glicosuria glioblastoma glioma gliosi global globale globo globozoospermia globuli globulin globus glomerular glomerulare glomerulocystic glomerulonefrite glomerulonephritis glomerulopathy glomerulosclerosi glomerulosclerosis glomuvenous glory glossopharyngeal glossoptosi glucagonoma glucoamylase glucocorticoid glucoglycinuria glucokinase glucose glucosio glucosuria glucosyltransferase glut glutamate glutamiltransferasi glutamine glutammato glutammico glutammina glutamylcysteine glutaric glutarica glutaricaciduria glutarilcarnitina glutaryl glutathione glutathioninuria glyceric glycerol glycine glycinuria glycogen glycogenin glycogenosis glycol glycoprotein glycoproteins glycosaminoglycans glycosylation glycosylphosphatidylinositol glyoxalase gmppb gms gnathodiaphyseal gnb gne goccioline goffaggine goiter gola golabi goldberg goldblatt gollop gombo gomez gomito gonadal gonadoblastoma gonadotropic gonfiore good goodpasture gordon gorham gorlin gotta gout goutieres gowers gpapp gracile grade grado graft graham grand grande grandi grange grant granular granule granules granuli granulociti granulocyte granuloma granulomas granulomatosis granulomatous granulosis granulovacuolar grasbeck grassa grassi grasso grave gravemente graves gravi gravidanza gravidarum gravior gravis gray graying great grebe green greenberg greig grfoma gria grid grido griggs grigia grimacing grin gripp griscelli groenouw groove gross grossolana grossolane group grouped groups grovigli growth grubben guadalajara guance guancia guanidinoacetate guanine guarigione guillain guillermo guinea guion gunn guo gupta gurrieri guscio gustatory gustavson guttata gynecomastia gyrata gyrate gyration gyrus haaften haan haar habitus hackman haddad hadziselimovic haemophilus hailey haim hair hairs hairy hajdu hakola halal halitosis hall hallermann hallucal halluces hallux hamamy hamartoma hamartomas hamartomatous hamel hamp hanac hand handigodu handmaker hands hao haploinsufficiency haploinsuffiency harada harbor hard harderoporphyria hardikar harel harlequin harrod hartnup hartsfield hartung hashimoto hatipoglu hattab hauser hawkinsinuria hay hayek hayward hdl head headache headaches headed heads healing hearing heart heat heavy hec hedera heel heimler heinz heise helical helicobacter helix hellp helper helsmoortel hemangioblastoma hemangioma hemangiomas hemangiomatosis hemangiopericytoma hematodiaphyseal hematologic hematopoietic hematuria heme hemiagenesis hemiatrophy hemicrania hemidysplasia hemidystonia hemifacial hemihyperplasia hemihypertrophy hemimegalencephaly hemimelia hemimelica hemiparkinsonism hemiplegia hemiplegic hemispheric hemivagina hemivertebrae hemizygous hemochromatosis hemoglobin hemoglobinuria hemolysis hemolytic hemophagocytic hemophilia hemopoietic hemorrhage hemorrhagic hemosiderosis hengel hennekam heparan heparin hepatic hepatitis hepatocellular hepatocerebral hepatoerythropoietic hepatomegaly hepatopathy hepatoportal hepatorenocardiac hepatosplenomegaly hereditaria hereditarium hereditary heritable herlitz hermansky hernandez herndon hernia herpes herpetiformis herrmann heterochromic heteroplasia heterotaxy heterotopia heterozygotes hexadactyly hexokinase heyn hfe hgprt hhhh hiatt hiatus hib hibernation hiccup hidea hidrotic higashi high hindbrain hinman hip hippel hirschhorn hirschsprung his histidine histidinemia histidinuria histiocyte histiocytoid histiocytoma histiocytosis histolytica hitz hjv hmg hnf hnpp hoarseness hobaek hodes hodgkin hoeijmakers hoffmann hogg holding holes holmes holmgren holocarboxylase holoprosencephaly holt holzgreve homocarnosinosis homocitrullinemia homocitrullinuria homocysteinemia homocystinuria homolog homozygous honeycomb hooft hoover hopf hopkins horan horizontal hormone hormonogenesis horn horner host hot houge hour house howell hoxha hoyeraal hozay hprt hpv hreidarsson hsd htlv huang hubshman huet hughes humero humerofemoral humeroradial humerus humoral hunter huntington huriez hurler hutchinson huttenlocher hutterite hyaline hyalinosis hyaluronidase hydantoin hydatidiform hydranencephaly hydrarthrosis hydratase hydroa hydrocephalus hydrocephaly hydrolase hydrolethalus hydrops hydroxy hydroxyacyl hydroxyglutaric hydroxyisobutryl hydroxyisobutyric hydroxyisobutyryl hydroxykynureninuria hydroxylacyl hydroxylase hydroxylation hydroxylysinuria hydroxyprolinemia hydroxysteroid hyper hyperactivation hyperactivity hyperaldosteronism hyperalphalipoproteinemia hyperammonemia hyperandrogenism hyperbilirubinemia hyperbiliverdinemia hypercalcemia hypercalcinuria hypercalciuria hypercalciuric hyperchlorhidrosis hypercholanemia hypercholesterolemia hyperekplexia hyperemesis hypereosinophilic hyperextensibility hyperferritinemia hyperfunction hypergammaglobulinemia hyperglucagonemia hyperglycinemia hypergonadotropic hyperheparinemia hyperhidrosis hyperhomocysteinemia hyperimmunoglobulinemia hyperinflammation hyperinsulinemic hyperinsulinism hyperkalemic hyperkeratosis hyperkinetic hyperlaxity hyperleucine hyperlexia hyperlipidemia hyperlipoproteinemia hyperlysinemia hyperlysinuria hypermanganesemia hypermelanosis hypermelanotic hypermetabolism hypermethioninemia hypermethylation hypermobile hypermobility hypernatremia hyperopia hyperornithinemia hyperostosis hyperostotic hyperoxaluria hyperparathyroidism hyperpepsinogenemic hyperphagia hyperphenylalaninemia hyperphosphatasia hyperphosphatemic hyperpigmentation hyperplasia hyperplastic hyperproinsulinemia hyperprolactinemia hyperprolinemia hypersecretion hypersegmentation hypersensitivity hypersomnia hyperstimulation hypersulfaturia hypertelorism hypertension hyperthermia hyperthyroidism hyperthyroxinemia hypertonia hypertonic hypertrichosis hypertrichotic hypertriglyceridemia hypertrophia hypertrophic hypertrophy hypertryptophanemia hyperuricemia hyperuricemic hypervalinemia hyperzincemia hypesthesia hypo hypoadrenocorticism hypoalbuminemia hypoaldosteronism hypoalphalipoproteinemia hypoascorbemia hypobetalipoproteinemia hypocalcemia hypocalcemic hypocalciuric hypochondroplasia hypochromic hypocomplementemic hypodactylia hypodactyly hypodontia hypodysplasia hypofibrinogenemia hypogammaglobulinemia hypogenitalism hypoglossia hypoglycemia hypogonadism hypogonadotropic hypohidrosis hypohidrotic hypohomocysteinemia hypoinsulinemic hypokalemic hypokeratosis hypokinesia hypomagnesemia hypomandibular hypomaturation hypomelanosis hypomelia hypomethylation hypomyelinating hypomyelination hypoparathyroidism hypoperistalsis hypophosphatasia hypophosphatemia hypophosphatemic hypopigmentation hypopituitarism hypoplasia hypoplasiacongenita hypoplasminogenemia hypoplastic hyposegmented hyposmia hypospadias hypotaurinemic hypotension hypotensive hypothalamic hypothermia hypothyroidism hypotonia hypotonic hypotrichosis hypotrophy hypouricemia hypoventilation hypoxanthine hypoxanthineguanine hystrix iaa ialoideo iato iatrogenic icc icf ichthyosiform ichthyosis ichthyotic ictus idiopathic idiopatica idiopatico idranencefalia idrocefalo idrocele idronefrosi idrope idrossibutirrico idrossiglutarato idrossiglutarico idrossiindolacetico idrossipropionico idrossisteroide idrouretere iduronato ifap iga igd ige igg igm igroma iia iiaa iib iibb iic iid iie iif iig iih iii iiia iiib iiic iiid iij iik iil iim iin iio iip iiq iir iit iiw iix iiy iiz ikegawa ileal ileale ileite ileo ileus ilia iliaca iliache iliaco illness imagawa image imaging imbalance imbricata imene imerslund iminoglycinuria immagini immotile immune immunity immuno immunocompetent immunodeficiency immunodeficienza immunodysregulation immunoerythromyeloid immunoglobulin immunoglobuline immunologic immunoneurologic immunoosseous immunoskeletal impacted impaired impairment imperfecta imperfetta imperforate imperforation imperforato impetigo impianto impression imprinting improving improvvisa impulsivita impulsivo inability inappropriata inappropriate inappropriato inarcamento inaspettata incapacita incassato incessant incisivi incisivo incisor incisors inclinata inclinate inclinati included inclusion inclusione inclusioni inclusions incompetence incompetenza incompleta incomplete incompleto incontinentia incontinenza incoordinazione increased incrociata incudostapedialabnormalities incuneamento independent index indian indifference individuo indolent indolylacroyl indomethacin indotta indotte induced infancy infant infantile infantili infantilism infants infanzia infarcts infarctsand infarti infarto infection infections infectious inferiore inferiori infertilita infertility infestazione infettiva infezione infezioni infiammatorio infiammazione infiltrating infiltration infiltrato infiltrazione infiltrazioni inflammation inflammatory inflessibile influenza influenzae infraorbitale infundibulopelvic ingrigimento ingrossamento ingrossata ingrossati ingrossato inguinal inguinale inh inhalational inherited inhibition inhibitor inhibitors inhibitory iniencephaly inizio injury innalzamento inner innes inosina inosine insect inseguimento insensibilita insensitivity insertion inserzione insipido insipidus insistenza insomnia insonnia insorgenza inspiratori inspiratorio insr instabile instabilita instability insufficiency insufficiente insufficienza insulin insulina insulino insulinoma insulinomatosis intact intaglio intake integrin integrine integrity intellectual intellettiva intellettuale intensita intention intenzionale interacting interatrial interatriale interazione interazioni interfalangea interfalangee interferone interhemispheric interictale interleuchina interleukin intermamillare intermedia intermediate intermittent intermittente interna internal internalized internamente interno interosseo interpedicolare interphalangeal interrogativo interrotto interruption interruzione interstitial interstiziale interstiziali interval intervallo interventricular intervertebrale intervertebrali intestinal intestinale intestinali intestine intestino into intolerance intolleranza intorno intoxication intraalveolari intracardiac intracellular intracerebrali intracranial intracranica intractable intradural intraepatica intraepithelial intragenic intrahepatic intramiocellulari intranuclear intraocular intraoculare intraosseous intrappolamento intrauterine intrauterino intraventricolare intrinseci intrinseco intrinsic intussusception invagination invaginazione invasive invecchiato inversa inversione inverso inversus inverted invertite invertiti involontari involuntary involuting involved involvement involving iodine iodothyronine ionizing iowa iperacusia iperalaninemia iperalbuminemia iperammoniemia iperattivi iperattivita iperattivo iperautofluorescenza iperbilirubinemia ipercalcemia ipercalciuria ipercalemia ipercellularita ipercheratosi ipercinetiche ipercinetici ipercloremica ipercolesterolemia iperconvessa iperecogeni iperecogenicita iperestensibile iperestensibili iperestensibilita iperfalangia iperfenilalaninemia iperfosfatemia iperfosfaturia ipergalattosemia ipergastrinemia iperglicemia iperglicinemia iperglicinuria iperglutaminemia ipergonadotropo ipergranulosi iperidrosi iperinsulinemia iperintensa iperintensi iperintensita iperisoleucinemia iperleucinemia iperlipidemia iperlordosi ipermagnesiuria ipermelanotica ipermetioninemia ipermetriche ipermetropia ipermobilita ipernasale ipernatremia ipernatriemica iperomocistinemia iperossaluria iperostosi iperparatiroidismo iperpigmentate iperpigmentazione iperplasia iperreflessia iperriflessia iperrosinemia ipersessualita ipersonnia ipersplenismo ipertaurinemia ipertelorismo ipertensione ipertensiva ipertermia ipertiroidismo ipertonia ipertricosi ipertrigliceridemia ipertrofia ipertrofica iperuricemia iperuricosuria ipervalinemia iperventilazione ipoacusia ipoalbuminemia ipoarginemia ipoautofluorescente ipocalcemia ipocalcemica ipocalcemiche ipocalciuria ipocellularita ipocinesia ipocistinemia ipocitraturia ipocloremia ipocolesterolemia ipocromica ipodonzia ipoestesia ipofibrinogenemia ipofisario ipofisi ipofosfatemia ipoglicemia ipoglutamminemia ipogonadismo ipogonadotropo ipoidrosi ipoinsulinemia ipointensi ipoisoleucinemia ipokaliemia ipoleucinemia ipolordosi ipomagnesiemia ipomaturo ipomelanotica ipometriche ipomielinizzazione ipomimico ipomineralizzazione iponatremia iponatriuria ipoomocisteinemia ipoparatiroidismo ipopigmentata ipopigmentate ipopigmentazione ipopituitarismo ipoplasia ipoplasica ipoplasiche ipoplasici ipoplasico ipoplastica ipoplastiche ipoproteinemia iporeflessia iposmia ipospadia ipostenuria ipotalamico ipotelorismo ipotenaria ipotensione ipotermia ipotiroidismo ipotonia ipovalinemia ipoventilazione ipovisione ipovolemia ipoxantina ippocampale ippocampo ippurico ipsaritmia ira irapa irf irida iride iridea iridocorneal iridocyclitis iridogoniodysgenesis iris iron irregolare irregolari irregolarita irrequietezza irritabilita irritazione irsutismo irvan isaacs ischemia ischemic ischemico ischia ischiocoxopodopatellar ischiopubic isidor island islands islet isobutyric isobutyryl isochromosomy isoelettrica isoforma isolated isoleucinemia isomaltase isomerase isomerasedeficiency isomerism isosthenuria isotretinoin isotypes isovaleric ispd ispessimento ispessita ispessite ispessito istoplasmosi isunknown italian itch itm ito itterizia ittero ittiosi ittiosiforme iva ivb ivemark ivic ixa ixb ixc jaberi jabs jackson jacobsen jadassohn jak jakob jalili james jampel jansen japanese jaundice jaw jawad jean jee jeffries jeghers jejunal jensen jervell jessner jeune jirovecii johanson johansson johnson joint joints jokela jolly jones jongmans joseph joubert juberg jumping junction junctional jung juvenile kabuki kaesbach kaeser kagami kahrizi kaissi kallmann kalscheuer kantaputra kanzaki kaposi kaposiform kappa kapur karyomegalic kasabach kat katsanis kaufman kaveggia kawasaki kaya kbfragile kbg kcnq kdm kearns keipert keloids kendall kennedy kenny keppen keratitis keratoacanthoma keratoconjunctivitis keratoconus keratoderma keratoendotheliitis keratohyalin keratolytic keratopathy keratoses keratosis keratotic kerion kernohan ketamine keto ketoacyl ketoadipic ketoglutarate ketosis ketothiolase keutel khan kid kidney kidneys kienbock kifafa kikuchi killer killian kilquist kimberley kimura kinase kindler kinesigenic king kingsmore kinsship kir kirghizian kitamura klatskin kleeblattschaedel kleefstra kleffner kleine klhl kline klippel kniest knobloch knorr known knuckle kobberling kohlschutter kohn koilonychia kolk kondo koolen korsakoff kosaki koyanagi kozlowski krabbe kraepelin krakow kreienkamp krt kruszka kubisch kucinskas kufor kufs kuhn kuijpers kury kuskokwim kuster kuwahara kyphomelic kyphoscoliosis kyphoscoliotic kyphosis kyrle laband labbra labbro labia labiale labile labilita labiopalatoschisi labiopalmo labioschisi labioscrotal labyrinthine lac lacerato lacombe lacrimal lacrimale lacrimoauriculodentodigital lactase lactate lactic lacticaciduria lad laere lafora laing lait lakhani lamb lambdoidea lambert lamblia lambotte lamellar lamellari lamina laminar laminin laminopathy lamtor landau lange langer langerhans langslet language lanosi lanuginosa larga large larghe larghi largo laringe laringea laringite laringomalacia laringotracheale laringotracheomalacia laron larsen larsson laryngeal laryngomalacia laryngoonychocutaneous laryngotracheoesophageal larynx lassa lassita lassueur late lateral laterale lateralis laterality lateralmente lathosterolosis lato lattato latte lattica lattice latticini laubry laurence laurin lavorativa lavorativo laxa laxity laxova layer lazarus lca lcat ldl lead leak learning lebanese leber lecithin lectin ledderhose lefevre left leg legg legionnaires legius legs legspasticity lehmann leigh leiomyoma leiomyomatosis leishmaniasis lelis lembo lemli length lennox lens lenta lente lenti lenticularis lentiggine lentiggini lentigginosi lentigines lentiginosis lentis lento lenz leopard leporino leprechaunism leprosy leptin leptodactylic leptospirosis leri leroy lesch lesione lesions lessel lester letargia lethal lethality lethargica letterer leucemia leucine leucocitaria leucocitosi leucocoria leucodistrofia leucodystrophy leucoencefalopatia leucomalacia leucopenia leucoplachia leukemia leukocyte leukocytes leukocytosis leukodystrophy leukoencephalitis leukoencephalopathy leukoma leukomelanoderma leukonychia leukotriene levator level levi levin levy lewis lewy leydig lhermitte liability liang liberfarb liberi lichen lichtenstein liddle lieve lievemente lig ligament ligamentof ligase light like limb limbal limbare limbic limbs limitata limitation limitato limitazione limited lindau line linea linear lineare linearis linfadenite linfangectasia linfangiomiomatosi linfedema linfoadenopatia linfoangioma linfoblastica linfocitaria linfociti linfocitopenia linfocitosi linfoma linfonodi linfopenia linfoproliferativo lingua linguaggio linguale linguali linkata linked lip lipase lipe lipedema lipid lipidiche lipidosis lipoatrofia lipoatrophy lipochrome lipodistrofia lipodystrophic lipodystrophy lipofuscinosis lipogranulomatosis lipoid lipoidica lipoma lipomatosis lipomatous lipomembranous lipomi lipoprotein lipoproteinlipase liposarcoma lipoyltransferase lips liquido liquor lis lisch liscio lissencephaly listeriosis lithium little livedo livedoid livelli livello liver liverdisease living lmna lobar lobare lobe lobi lobo lobular lobulata localized localizzata locked locking locus loeffler loeys loken lombare lombari lombosacrale long longitudinal longus looped loops loose lopes lopez lorda losing losonci loss low lowe lower lowry lubinsky lubs luce lucida lui lujan lujo lumbar lumbosacral luminanza lumish lundborg lung lunga lunghe lunghezza lunghi lungo lungs luo lupski lupus luria luscan lusoria lussazione lussazioni luteinizinghormone luteinizzante luxation lvnc lwd lyase lyme lymphadenopathy lymphangiectasia lymphangioendotheliomatosis lymphangioleiomyomatosis lymphangiomatosis lymphatic lymphedema lymphoblastic lymphocyte lymphocytic lymphocytosis lymphohistiocytosis lymphoid lymphokine lymphoma lymphomatous lymphopenia lymphopenic lymphoproliferation lymphoproliferative lynch lysine lysinuric lysosomal lysyl mabille macchia macchiato macchie macdermot macdonald machado maciel macken macklin maclean macroadenoma macroaneurysm macroblepharon macrocefalia macrocephaly macrocytosis macrodactyly macrodontia macrofagi macroglobulinemia macroglossia macronodular macroorchidism macroorchidismo macrophage macrophagic macrophakia macrophthalmia macroscopica macrosomia macrostomia macrothrombocytopenia macrozia macs macula macular maculare macule macules maculo maculopapular maculopathy maculopatia maculosa madelungo madras maffucci mag magenis magna magnesio magnesium magnetica magnum magrezza mahvash maine majeed majewski major mal malabsorption malabsorptive malakoplakia malan malare malaria malassorbimento malattia maldergem male malehypogonadism malessere maleylacetoacetate malformation malformations malformazione malformazioni malformed maligna malignancy malignant maligno malnutrizione malocclusion malocclusione malonic malonyl malouf malposizione malrotation malrotazione malsegmentation malt maltase mammary mammella man mancanza mancata mancato mandible mandibola mandibolare mandibular mandibuloacral mandibulofacial mandorla manganese mani manifestations manipolazione manitoba mannose mannosidosis mano mantenimento mantle manzke mapbp maple marbach marburg marcato marchesani marchiafava marcia marcus marden mare marfan marfanoid margin marie marinesco mark markesbery markouizos marmorata maroofian maroteaux marrone marrow marshall marsili martello martin martinez martsolf masa mascella mascellare maschera maschi maschile maschili maschio mask mason masp mass masses masson mast masticazione mastocitosi mastocytoma mastocytosis mastoideo mastoidite materia materna maternal maternally materno matrilin matsumoto matter matthew mattutina matura maturation maturazione maturity maxillary maxillarydiastema maxillofacial maxillonasal mayer mayne mazabraud mcalpine mccort mccullough mccune mcdermid mcdonough mcfarlane mcgillivray mckeown mckusick mcleod mcneill mds meacham meara meatal meato meckel meconio meconium mecp med media medial mediale median mediana mediano mediante mediastinica mediated medio mediosternal mediterranean medium mednik medulla medullary medulloblastoma meesmann meester mega megabladder megacalycosis megacariociti megacariocitopenia megacolon megaconial megacystis megaepiphyseal megalencefalia megalencephalic megalencephaly megaloblastic megaloblastica megaloblastico megalocornea megalolenticonus megarbane megaureter megauretere mehmo meier meige meinecke meiotic melanocitico melanocortin melanocytic melanocytosis melanolysosomal melanoma melanosis melanotica melanotico melas melchior meleda melioidosis melkersson melki mellito mellitus melnick melorheostosis membrana membrane membranes membranoproliferative membranous memoria mend mendelian mendenhall menetrier meniere meningioma meningite meningitis meningocele meningococcal menke menkes menopausa menopause menorragia menstrual mental mentale mentalretardation mento mepan meralgia mercaptolactate mercury merosin merrf merritt merten merzbacher mesangial mesangiale mesencefalo mesencephalic mesenteric mesi mesoassiale mesoaxial mesodermal mesomelia mesomelic mesomelico mesosomatous mesothelioma metabolic metabolica metabolism metacarpal metacarpals metacarpi metacarpo metachondromatosis metachromatic metafisaria metafisi metameric metaphyseal metaphysealis metaplasia metatarsal metatarsali metatarsaliv metatarsals metatarso metatarsus metatarsusadductus metatropic methanol methemoglobin methemoglobinemia methimazole methionine methotrexate methylacetoacetic methylacyl methylbutyryl methylcobalamin methylcrotonyl methylene methylenetetrahydrofolatereductase methylglutaconic methylglutaric methylglutaryl methylmalonate methylmalonic methylmalonyl methylmercury methyloxidase methyltransferase metilglutaconica metilglutarica metilmalonica metopic metopica mevalonic meyer mff mfm mgat mglur mhc mialgia mibelli micobatteri micobatteriche micro microangiopathy microbrachycephaly microcefalia microcephalic microcephalus microcephaly microcitemia microcitica microcolon microcoria microcornea microcytic microcytosis microdeletion microdontia microduplication microform microftalmia microgastria microglossia micrognathia micrognazia micrografia microhydranencephaly microlissencefalia microlissencephaly microlithiasis micromelia micromelic micronodulare micropene micropenis microphthalmia microretrognatia microscopic microscopica microsferofachia microsomia microspherophakia microsporidiosis microstomia microtia microtriplication microtubules microvescicolare microvillous microvillus mid midbrain middle midface midfacial midgut midline midollare midollari midollo midriasi mielinizzate mielinizzazione mielocatessi mielodisplasia mielofibrosi mieloide mieloma mielomeningocele mielomonocitica mielopatia mietens mignot migraine migrating migratory mild miles milia miller milroy milza mims minerale mineralocorticoid minicore minifascicular minima minora minori minoxidil miocardio miocardite miochimia miochimiche mioclonia mioclonica mioclonici mioclonico mioclono miofibre mioglobina mioglobinuria miopatia miopatica miopatiche miopia miopico miosi miosis miosite miotonia miozzo mirage mirizzi mirror misalignment mishra mismatch misshapen missouri mista misto mitchell mitochondria mitochondrial mitocondriale mitocondrio mitogeni mitomycin mitral mitrale mitralica mitraliche mitralico miura mixed miyoshi mkb mmep mngie mobilita mobitz modeling modello moderata moderatamente moderate moderato modifier modo mody moebius mofetil mogs mohr molar molare molari mole molecolare molecular molle mollusco molluscoidi molto molybdenum momo monilethrix monoamine monoblastic monocarboxylate monochromacy monochromatism monocitosi monoclonal monoculare monocyte monocytic monocytopenia monodactylous monodactyly monodattilia monomelic mononeuropathy monophalangy monophosphate monosodium monosomy monotonia monoxide montreal moon morbid morbida morbo morel morfologia morfologica morgagni morm morning morphea morquio morso morte mortier morvan mosaic mosaicism moss motilita motion motoneurone motor motori motoria motorio motricita mottled moulin mounier mountaineers mouse mouth movement movements movimenti movimento mowat moyamoya moynahan mpdu mpi mrs mseleni msh mto mucinous muckle mucocutanea mucocutaneous mucoepithelial mucolipidosis mucopolisaccariduria mucopolysaccharidosis mucosa mucosal mucous mueller muenke muir mulchandani mulibrey mullerian multicentric multicistica multicore multicystic multiflagellar multifocal multifocale multifocali multilocular multiminicore multinodular multinucleated multipla multiple multiplex multipli multisystem multisystemic mungan munk muscle muscles muscolare muscolari muscolatura muscoli muscolo muscular musculocontractural musculorum musculoskeletal musk mut mutarotase mutase mutation mutations mutilans mutilating mutismo mutyh myalgia myasthenia myasthenic mycetoma mycobacterial mycobacteriosis mycobacterium mycophenolate mycosis myelin myelinated myelination myelitis myelocytic myelodysplasia myelodysplastic myelofibrosis myeloid myelolymphatic myeloma myelomonocytic myelopathy myeloperoxidase myeloproliferative myh myhre myoadenylate myoclonia myoclonic myoclonus myofasciitis myofibrillar myofibromatosis myogenic myoglobinuria myohyperplasia myokymia myopathic myopathy myopia myopic myosclerosis myosin myositis myotilinopathy myotonia myotonic myotonica myotubular myt myxoid myxoma myxomatous myxopapillary nabais nablus naegeli nagashima nager nail nails naive najjar najm nance nanism nanismo nanophthalmos nape narcolepsy narici narp narrowedzygomatic nasal nasale nasali nascimento nascita nasi naso nasofaringe nasogastrico nasolabiale nasolacrimal nasolacrimale nasopalpebral nasopharyngeal nasu natal natale nathalie native natriuretico natural naumoff nausea naxos naz nebulin neck necrobiosis necrolysis necrosi necrosis necrotizing needles nefrite nefritico nefroblastoma nefrocalcinosi nefrolitiasi nefropatia nefrosica negative negli negrete nei nel nell nella nelle nello nelson nemalici nemaline neonatal neonatale neoplasia neoplasm neoplasms neovascular nephritis nephroblastoma nephrocalcinosis nephrogenic nephrolithiasis nephronophthisis nephropathic nephropathy nephrosialidosis nephrosis nephrotic nerve nerveoptic nerves nervi nervo nervosa nervose nervoso nervous nescav nessuna nestor netherton netter neu neuhauser neural neuralgia neuralgic neuraminidase neuro neuroaxonal neuroblastoma neurocardiofaciodigital neurocutaneous neurocutaneousspinal neurocytoma neurodegeneration neurodegenerative neurodegenerazione neurodevelopemental neurodevelopmental neurodysraphic neuroectodermal neuroendocrine neurofaciodigitorenal neurofacioskeletal neuroferritinopathy neurofibrillari neurofibroma neurofibromatosis neurofunctional neurogastrointestinal neurogena neurogenic neurohypophyseal neuroleptic neurologic neurological neurologico neuromuscular neuromyelitis neuromyopathy neuromyotonia neuron neuronal neuroni neuronopathy neurons neuroocular neurooculocardiogenitourinary neurooculorenal neuroophthalmic neuropathy neuropatia neuropsychiatric neurosensoriale neurosensory neuroserpin neurosviluppo neurotrophic neurotrophica neutral neutrofila neutrofili neutrofilia neutropenia neutrophil neutrophilia neutrophilic neutropile nevi nevo nevoid nevus new newborn newcomer newfoundland nfkb nicolaides nictalopia nielsen niemann nievergelt night nigra nigricana nigricans nijmegen nipah nipple nipples nishimura nistagmo nivelon nizon nkx nmda nocardiosis nocturnal node nodosa nodosum nodular nodulare nodule noduli nodulo nodulosis non nonaka nonalcoholic nonarteritic nonautoimmune nonbacterial noncirrhotic noncompaction nondisjunction nonepidermolytic nonepileptic noneruption nongoitrous nonimmune noninsulin nonkinesigenic nonmedullary nonnephropathic nonobstructive nonopposable nonpapillary nonpersistence nonphotosensitive nonpolyposis nonprogressive nonresponsive nonspecific nonspherocytic nonsyndromic noonan normal normale norman norme normocitica normophosphatemic normosmic normoteso norrie north northern nose nostril notturna notturne novelli nphp nrem nthl nucale nuchal nuclear nucleare nucleate nucleazione nuclei nucleo nucleoside null number numero nut nutans nutcracker nutrition nutrizione nyhan nystagmus obesita obesity oblique obliquo obliterans obsessive obstruction obstructive occhi occhio occipital occipitale occipitali occipite occlusion occlusione occlusive occult occulta ocular oculare oculari oculo oculoauricular oculoauriculofrontonasal oculoauriculovertebral oculocerebral oculocerebrocutaneous oculocerebrofacial oculocerebrorenal oculocutaneous oculodentodigital oculoectodermal oculofaciocardiodental oculogastrointestinal oculogira oculomaxillofacial oculomotor oculomotore oculomotoria oculopalatocerebral oculopharyngeal oculopharyngodistal oculorenal oculorenocerebellar oculoskeletodental oculotrichoanal odd odontic odonto odontochondrodysplasia odontodysplasia odontoid odontoideo odontoideum odontomatosis odontomicronychial odontoonychodermal odontotrichoungual oeis oflobodontia oftalite oftalmoparesi oftalmoplegia ogata ogden ogna oguchi ohdo okamoto okinawa okt okur olfattivo oligoarticular oligoclonali oligocone oligodactyly oligodattilia oligodontia oligodonzia oligoidramnios oligomeganephronia oligomenorrea oligosaccariduria oligospermia oligosyndactyly oligozoospermia oliver olivopontocerebellar ollendorff ollier olmsted oloprosencefalia olsen ombelicale omenn omerale omero omodysplasia omotoria omovanillico omphalocele oncocytoma oncogenic onda onde ondeggiante ondontochondrodysplasia onfalocele onicolisi onicomicosi onicotillomania only onset onycho onychodysplasia onychodystrophy onychotrichodysplasia oocyte opacification opacita opacities open ophryogenesis ophthalmia ophthalmic ophthalmological ophthalmomandibulomelic ophthalmoparesis ophthalmoplegia ophthalmoplegic opiomelanocortin opisthotonus opistotono opitz opitzsyndrome oppenheim opporre opsismodysplasia opsoclonus optic optica opticocochleodentate oral orale oram orbicolare orbital orbite ordinamento orecchie orecchio orf organ organica organizing organo organomegaly orhypogonadotropic orientation origin origine oris orizzontale orizzontali ormone ornithine ornithinemia oro orofacciale orofacial orofaciodigital orofaringe oromandibolare oromandibular oromotor oropharynx orotic oroticaciduria orthostatic orticaria ortocheratosi ortostatica osgood oslam osmolalita osmotica ossa ossalato ossea ossee ossei osseo osseous ossessivo ossicular ossidasi ossidativo ossificans ossification ossificazione ossified osso osteitis osteoarthritis osteoarthropathy osteoartrite osteocalcina osteochondritis osteochondrodysplasia osteochondromas osteochondroplastica osteochondrosis osteoclastic osteocondrite osteodysplasia osteodysplastic osteodysplastica osteodysplasticum osteodysplasty osteodystrophy osteofibrous osteogenesi osteogenesis osteoglophonic osteoglosphonic osteolitici osteolysis osteoma osteomalacia osteomas osteomesopyknosis osteomielite osteomyelitis osteootohepatoenteric osteopathia osteopenia osteopetrosis osteopoikilosis osteoporosi osteoporosis osteosarcoma osteosclerosis osteosclerotic ostium ostruttiva ostruzione other otite otitis otoacustiche otocephaly otodental otofaciocervical otoonychoperoneal otopalatodigital otosclerosis otospondylomegaepiphyseal ottica ottico outer outgrowth outlet outstanding ovaie ovaio ovale ovalocytosis ovarian ovarica ovarico ovary overbite overgrowth overhydrated overlap overlapping overload overweight ovoidali ovotesticular oxalate oxidase oxidative oxidoreductase oxoacid oxoglutarate oxoglutaric oxoprolinase oxygenase pachigiria pachydermodactyly pachydermoperiostosis pachygyria pachymeningitis pachyonychia pacman padiglione pads paganini paget pagnamenta pagod pai paia pain paine painful palagonia palatal palate palato palatopharyngeal palatoschisi pallidoluysian pallidus pallister pallore palm palmar palmare palmaris palmato palmitoyl palmitoyltransferase palmo palmomentale palmoplantar palmoplantare palmoplantaris palms palpebra palpebrale palpebrali palpebre palpitazioni palsies palsy panbronchiolitis pancitopenia pancreas pancreatic pancreatica pancreatiche pancreatite pancreatitis pancreatoblastoma pancreatogenous pancytopenia pandas panencephalitis panfollicular panhypophysitis panhypopituitarism panic panico panmyelosis panner panniculite panniculitis pansclerotic pantothenate panuveitis papa papas papilla papillae papillary papilledema papilliferum papilloma papillomatosis papillon papillorenal pappas pappenheimer papula papular papule papules papulosa papulosis papulotranslucent paraesthetica paraganglioma paragangliomas paralisi paralitico paralysis paramolar paramyotonia parana paranasali paraneoplastic paraoxonase paraparesi paraparesis paraparetic paraplegia parasagittal parasomnia parasonnia parastremmatic parathormon parathyroid paratiroide paratiroideo paravenous parc parenteral parenterale parenti paresis parestesia parietal parietale parietali parieto paris parkes parkinson parkinsonian parkinsonism parkinsonismo parlare parlato parodontite parola parossistica parotid parotidomegaly parotite paroxysmal part parte partial partialis partially partington partizione parto parvovirus parziale passage passarge passi pastosa patella patello patent paternal pathogenic pathology pathway patients patterned patternless patterson pauci paura pcna pde pearson pechet pectus peculiar peculiarity pedali pediatric peduncoli peeling peho pelger pelizaeus pellagra pelle pellucido pellucidum pelvi pelvic pelvica pelvico pelvis pelviscapular pemphigoid pemphigoides pemphigus pena pendente pendolare pendred pene penile penoscrotal penoscrotale pentalogy pentasomy pentosuria penttinen pepper peptide peptidic peptiduria per pera percentile percentuale perceptive percezione perching percussione perdita perez perforans perforating perforazione perianale periauricolari pericardial pericardico pericardite pericarditis pericentral periferica periferiche periferico perifollicolare perifolliculitis perifoveale perimembranoso perinatal perinatale perineoscrotal periodic periodontal periodontitis perioral periorbitale periorificial peripapillare peripartum peripheral periportale perisilviana perisylvian peritoneal peritonei peritonite perivascolare periventricolare periventricolari periventricular perlman permanens permanent permanente permanenti pernicious perodactyly peroneal peroneale peroneus perossidasi peroxidase peroxisomal peroxisome perrault perry persistence persistent persistente persistenza person perstans perthes pes pesata peso petecchie peters pettigrew pettorale petty peutz pex peyronie pezzi pfapa pfeiffer pgm phace phacoanaphylactic phakomatosis phalangeal phalanges phalango phalangoepiphyseal pharyngeal phase phaver phelan phenformin phenobarbital phenomenon phenotype phenylketonuria pheochromocytoma philadelphia philtrum phip phlebectasia phocomelia phosphatase phosphate phosphoenolpyruvate phosphofructokinase phosphogluconolactonase phosphoglycerate phosphohydroxylysinuria phosphokinase phospholipid phosphoribosylaminoimidazole phosphoribosylpyrophosphate phosphoribosyltransferase phosphorylase phosphorylation phosphoserine photogenic photomyoclonus photoparoxysmal photophobia photosensitive photosensitivity phthisis pianto piastre piastrine piastrinica piastrinico piastrinopenia piatta piatto pica piccardi picchi picco piccola piccole piccoli piccolo pick piebald piebaldism piede piedi piega pieghe pielectasia pielonefrite piene pienezza pierpont pierre pierson piezogene pigment pigmentaria pigmentary pigmentation pigmentato pigmentazione pigmented pigmenti pigmentokeratotica pigmentosa pigmentosum pigmentovascularis pilare pilaris pilarowski pilastro pili pilocitico pilomatrixoma pilonidal pilorge pilorica pineal pineale pineoblastoma pineocytoma pinguecola pinna pinnae pioderma piramidale piruvato pits pitt pituicytoma pituitaria pituitary pityriasis piuria plaa placca placenta placental placoid plagiocefalia plagiocephaly plague plana planopilaris plantare plantari plantaris planus plaques plasma plasmablasti plasmatica plasmin plasminogen platelet platelets platisiaca platispondia platybasia platyspondylic platyspondyly plcg plec plectin pleomorphic pleonosteosis plessiforme plesso pleural pleurico pleuropulmonary plexus plin plummer plus pmm pmp pneumatizzazione pneumatocele pneumociti pneumococco pneumocystis pneumocystosis pneumonia pneumonitis pneumothorax pneumotorace poche poco podalica podocitario poems poichilocitosi poikiloderma point pointes poirier poisoning poland polar polare pole poliabortivita poliarticolare policistica policistiche policistico policromia polidattilia polidipsia polidramnios poliembolocoilamania polifagia polimicrogiria poliminimoclono polimorfa polineuropatia poliomyelitis polipi poliposi polisaccaridici polisaccaridico polisplenia polisporiche poliuria pollice pollici polmonare polmonari polmone polmonite polpaccio polpastrelli polpastrello polso poly polyagglutination polyangiitis polyarteritis polyarticular polychondritis polychromatic polyclonal polycystic polycythemia polydactyly polyembryoma polyendocrine polyendocrinopathy polyglucosan polyhydramnios polymerase polymicrogyria polymorphic polymorphism polymorphous polymyoclonus polymyositis polyneuropathy polyploid polyposis polyps polyradiculoneuropathy polyrrhinia polysaccharide polysyndactyly pomgnt pomt pons ponte pontiac pontine pontocerebellar pontocerebellare pool poor poorly popliteal porencefalica porencephaly poretti porfobilinogeno porokeratosis porphyria porphyrinmetabolism porpora port portal portale porteous positiva positive positivita positivo positroni posizionato posizione possible possibly post postassiale postauricolare postaxial postencephalitic posterior posteriore posteriormente posteriorstridor posterolaterale posticus postinfectious postnatal postnatale postorgasmic postpoliomyelitis postreceptor postsynaptic posttransplant postura postural posturale potassio potassium potenziale potenziali potocki pouchitis pparg ppoma prader pre preassiale preauricolare preauricular preaxial precalcaneal precentral precoce precocemente precocious predisposition predominant predominantly predominanza preeclampsia pregnancy preimplantation prekallikrein prelinguale premascellare prematura premature prematurita prematurity premolare prenatal prenatale prenatali prensione prepapillary prepubertal presa presenile present presentazione presenza presincope pressione pressure presynaptic preterm pretermine pretibial preus prevalence prevalenza prieto prima primari primaria primario primary prime primitiva primitive primitivo primo primordial primrose primum prion prkar pro proanp problems probnp proboscide proboscis probst processing processo proctitis prodotti producing produttiva produzione profilo profonda profondamente profonde profondi profondo progeria progeroid progeroide progesterone prognathism prognatismo progrediens progression progressiva progressive progressivi progressivo prohormone proiezione prolactin prolactinoma prolapse prolasso prolattina prolidase proliferating proliferation proliferative proliferazione prolonged prolungamento prolungata prolungato prominent prominente prominenti prominenza promyelocytic pronazione prone proneness pronominale pronunciati proofreading propeller properdin propionic proportionate proporzionale proporzionata proporzione proprioception propriocezione proprotein proptosi prosaposin prosopagnosia prossimale prostacyclin prostata prostate prostatic protan proteasome proteica protein proteina proteinc proteine proteinosis proteinuria proteus prothrombin proton protoporfirina protoporphyria protrombina protrudente protrusio protrusion protuberans protuberant proximal prune pruriginosa prurigo pruritic prurito pruritus pseudo pseudoachondroplasia pseudoaminopterin pseudoarthrosis pseudoatrophoderma pseudobulbare pseudocamptodactyly pseudodiastrophic pseudoepifisi pseudoglioma pseudohermaphroditism pseudohyperkalemia pseudohypertrophic pseudohypertrophy pseudohypoaldosteronism pseudohypoparathyroidism pseudoinflammatory pseudoipertrofia pseudoleprechaunism pseudomyxoma pseudoobstruction pseudopelade pseudoprogeria pseudopseudohypoparathyroidism pseudorheumatoid pseudosinistro pseudotrisomy pseudotumor pseudotumori pseudouridinuria pseudovaginal pseudoxanthoma pseudoxanthomatous psicomotorio psicosi psicotici psoriasi psoriasiform psoriasiforme psoriasis psychogenic psychomotor psychomotorretardation psychosis pter pterigio pterin pterygia pterygium ptosi ptosis puberta puberty pubic pubica pubico pudendal pudlak pulmonary pulmonic pulp pulverulent pump pumphrey punctal punctata punctate punctatecalcifications punctiform punctum punetha punta punte punteggiata punteggiati punto pupil pupillae pupillary pupils pura pure purine purpura pustolosa pustular pustulosis pycnodysostosis pycr pygmy pyknoachondrogenesis pyle pylori pyloric pyoderma pyogenic pyomyositis pyorrhea pyramidal pyridoxal pyridoxamine pyridoxine pyrophosphate pyropoikilocytosis pyruvate pyruvoyl qazi qtc qter quadrata quadricuspide quadrifoglio quadriplegia quadriplegic quadrupedica quantitative quarto quasi quebec question quinone quinquaud quinto quotidiana rabdoide rabdomiolisi rabdomioma rabdomiosarcoma rabies rabin rabson rac racemase racemosa rachide rachitico rachitismo rade radi radial radiale radiation radice radiculoneuropathy radio radiohumeral radioresistance radiotibial radioulnar radioulnare radius rado rafiq rag ragged raggio raggrinzimento raggruppamento rahman rai raindrop raine rajab rakeb rallentamento rallentate rallison ralpha rame ramon ramos random rapadilino raphe rapid rapide rapidly rapido rapp rapporto raqad rare rars ras rash rasmussen rat rathke rauca rauch rautenstrauch ravine ray raymond raynaud rcad reabsorbed reaction reactive reading rearrangement reattiva receptor recessione recessive recettore reciprocita recognition recombinant recon rectal recti rectum rectus recurrent recurvatum red redcell reduced reducing reductase reduction reese reflex reflexes reflusso reflux refractory refrattaria refsum regenerative region regional regioni regions regolatorie regression regressione regulator reich reifenstein reinclusion reinhardt reis relapsing related relateddrug relativa relative relazioni release releasing remediable remitting remnant renal renale renali rene reni renin renina renotubular renpenning renu repair rere resistance resistant resistente resistenza respiratoria respiratorie respiratorio respiratory respirazione response responsive responsiveness resti restless restricted restriction restrictive restringimento restrittivo retained retardation retardationand retardationsyndrome retarded retention reti reticolanti reticolare reticolocitopenia reticolocitosi reticular reticularis reticulate reticuloendotheliosis reticulohistiocytosis reticulum retina retinal retinica retinici retinico retinite retinitis retino retinoblastoma retinopathy retinopatia retinoschisis retraction retrocerebellare retrocollis retrognazia retroperitoneal retroruotate retrusion retrusione rett rettale rettilinea retto rettocele rettocolite return reumatoide reversal reversible revesz reynolds rft rhabdoid rhabdomyolysis rhabdomyosarcoma rheumatic rheumatoid rhiny rhizomelic rhombencephalosynapsis rhyns riazuddin rib ribbing riboflavin ribonucleoproteina ribose ribosiduria ribs ricci ricerca ricettivo rich richards richiede richieri rickets ricorrente ricorrenti riddle ridges ridondante ridotta ridotte ridotti ridotto riduzione rieger riflessi riflesso rifrazione rift rigata rigenerativa riggs right rigid rigida rigidita rigidity rigido rigurgito rilevabile riley rimmed rin ring ringed rings rinite rinofaringe ripetitiva ripiegata riposo rippling risata risk risonanza rispetto risposta ristagno ristocetina ristretta ristretto ritardata ritardo ritenzione ritmo ritorno ritscher rizomelia rmn rnf rnu roberts robin robinet robinow robinson rocco roch rod rodan rodrigues rodriguez rods rogers roifman rokitansky rolandic rolland romano romberg rombo ropers rosai rosario rosenberg rosenthal rosse rossi rosso rotated rotation rotatorio rotazione rothmund rotolamento rotolare rotondo rotor rott rottura rotula rotulea rotuleo round roussy routine rovesciata rttn rubber rubcn rubella rubinstein rubra rudiger rudimentary rugosa ruijs rundle ruotate ruote rupture russe russell rustad rutherfurd ruvalcaba ruvidi ryanodine ryukyuan sabinas saccadi saccadici saccharopinuria saccular sachs sacral sacrale sacrali sacralneural sacro saethre sagittal sagittale sagliker saguenay saint sakati sale salire salivary salla salt samaritan sanchez sanctis sandalo sandestig sandhoff sandifer sandrow sandwich sangue sanguigna sanguigni sanguinamento sanjad santos sapho saposin sarcoglycan sarcoidosis sarcoma sarcoplasmic sarcosinemia satb satoyoshi saturazione saul savarirayan say sayre sbandamento sbattimento sbavatura sbbys scafocefalia scalcinati scale scalp scaphocephaly scaphoid scapolare scapole scapolo scapular scapulohumeroperoneal scapuloperoneal scarf scariche scarring scarsa scarso scatenato scattered scatti scedosporiosis schaaf scheie scheinker scheletrica scheletriche scheletrico scheletro schema scheuermann schiena schilbach schilder schimke schimmelpenning schindler schinzel schisi schisis schistocitosi schiumose schizencephaly schizofrenia schizophrenia schlatter schmid schmidt schneckenbecken schnitzler schnyder schoch schols scholte scholz schonberg schopf schulz schuurs schwannoma schwannomatosis schwartz scialle scid scimitar scimitarra scissione sclerae sclerale sclere scleroderma sclerodermia scleromyxedema sclerosante sclerosi sclerosing sclerosis sclerosteosis sclerotic sclerotica scoliosi scoliosis scompenso scorpion scotoma scott scratch scrivano scrotal scrotalis scroto scrotum scrub scudo scure sea sebacee sebaceous sebaceus sebocystomatosis seborrhea seborrheic seborroica sec secca secchi seckel second secondaria secondario secondary secondo secreting secretion secretoria secretory secrezione secundum sedaghatian sedersi sedimentazione sedoheptulokinase seech seemanova segawa segment segmental segmentaria segmentation segmentazione segmento segnale segni segno seizure seizures selective selettivo self sella semantic semi semialdehyde semicircolare semilobar semilobare semplice semplificato sengers senior seno sensazione sensibilita sensibility sensitive sensitivity sensitivo sensitization senso sensomotoria sensoriale sensoriali sensorineural sensorineuraldeafness sensory senza separation separazione sepiapterin sepsi sepsis septal septo septooptic septopreoptic septum sequence sequenza series serkal serotonin serpiginosa serpiginosum serraggio serrate serrated sertoli serum sessile setd setleis settale settata setto severe sex sezary sfenoide sferocitosi sferofachia sforzo sguardo shaffer shagreen shah shaheen shaltout shaped shapes shashi shawl sheehan sheen sheldon shfm shields shiga shigellosis shinawi shock shohat short shortening shoulder shovel shox shprintzen shrimpton shukla shunt shwachman sialadenitis sialic sialidosis sialuria sick sickle sickness siddiqi siderius sideroblastic sideroblastica sideroblasts siderosis sids sierica sierico siero sifrim sigaretta signal signs silent silfout sillence silva silver silverman silviana sim simha similar simile simosa simple simplex simplified simpson sin sincinesia sincope sindattilia sinding sindrome sine sinfalangismo sinfisi single singleton singola singulto sinister sinistra sinistro sinoatrial sinoatrialblock sinofrite sinorespiratory sinostosi sintasi sintesi sintomi sinus sinusale sinuses sinusite sinusoidale sirenomelia siringomielia siris sistema sistemica sistemico sister sistolica site sitosterolemia situs siwe six sjaastad sjogren skeletal skills skin skinanomalies skraban skull skunk sla slack slc sleep sleepwalking slender slipped slovenian slow slowed slowly slurred small smalto smeets smell smerigliato smirin smith smooth snakebite snc sneddon snijders snow snowflake snyder social sociale sociali sodio sodium soffio soft solar solcata soles solfatasi solitary sollevato solubile somatic somatica somatomammotropinoma somatosensoriale somatosensoriali somatostatinoma sondino sonno sonnolenza sonoda soppressione sopracciglio soprannumerarie soprannumerario sopranucleare sopraorbitali sopraorbitarie sopravalvolare sopraventricolare sorauf sorbitol sordita sorsby sostanza sostegno sostituzione sotos sottas sottile sottili sotto sottocalcaneale sottocapsulare sottocorteccia sottocorticale sottocorticali sottocrescita sottocutaneo sottoglottica sottomucosa sottomucoso sottosviluppate sottosviluppato sottotubulazione soulier sovradimensionate sovrappeso sovrapposto sox spaccatura space spaced spahr spalla spalle spanish sparse spasm spasmi spasmo spasms spasmus spastic spastica spasticita spasticity spatial spatolati spavento spazi spaziale spazio spazzola specc specific specifica specifiche specifici specifico spectrin spectrum speech spells sperm spermatici spermatogenic spermatozoa spermatozoi spessa spesse spessi spesso spessore spettro spherocytosis spheroids sphincter sphingomyelinase spicole spiegler spike spikephenomenon spikes spina spinal spinale spine spinocerebellar spinocerebellare spinta spinulosa splenica splenogonadal splenomegalia splenomegaly splenoportal split spokes sponastrime spondiloepifisaria spondiloepimetafisaria spondilolistesi spondylar spondylo spondyloarthropathy spondylocamptodactyly spondylocarpostarsal spondylocarpotarsal spondylocostal spondylodysplastic spondyloenchondrodysplasia spondyloepimetaphyseal spondyloepiphyseal spondylolisthesis spondylomegaepiphyseal spondylometaepiphyseal spondylometaphyseal spondyloocular spondyloperipheral spondylosis spondylospinal sponge spongiform spontanea spontanei spontaneo spontaneous spontaneously sporadic sporadica sporadico sporgente sprangertype sprengel sproporzionata sproul squadrate squalene squalo squamosa squamose squamoso squamous squilibrio srd ssr stadio stafiloma stag stagionale stagnazione stalk stanchezza standstill stanescu stankiewicz stapes staphylococcal staphylococcus staphyloma star stare stargardt stat static statica stationary stato statura stature status steatocystoma steatorrea steatosi steel stefanova steindl steiner steinert steinfeld stellato stem stenosi stenosis steppante stereotipati stereotipato stereotipia stereotypic sterile sterilita sternal sterno steroid steroidogenesis stessi stesso stevens stevenson stewart stickler stiff stiffness still stimmler stimolante stimolazione stimulating sting stings stippling stitichezza stocco stoll stomach stomaco stomatin stomatite stomatocitosi stomatocytosis stones storage stormorken stout stovin strabismo strabismus stracciato stratakis straussler streaming streeten streiff stress stretta strette stretto striae striata striatal striate striatonigral striatum stridore striopallidodentate strizzamento stroke strom stromal stromme structural structured strudwick stt stub sturge stuttering stuve stxbp sub subacute subaortic subarachnoid subaracnoidea subaracnoideo subcorneal subcortical subcutaneous subdurale subependimali subependymal subependymoma subglottica sublussazione submandibular submucosal submucous subnormality subpleurica substance subtelomeric subtypes subunit subvalvolare succinate succinic succinyl succlavia sucrase sucrosuria sudden sudorazione sudoripare suffodiens sugarman suggesting sui suicidio suit suleiman sulfatase sulfate sulfaturia sulfhemoglobinemia sulfide sulfite sulfocisteina sulfocisteinuria sulfocysteinuria sulle sullivan sunct superactivity superficial superficiale superficiali superior superiore superiori supernumerary supinazione suppression suppressor suppurative suprabulbar supranuclear supraumbilical supravalvular sur surfaceglycoprotein surfactant surrenale surrenalica surrene susac susceptibility suscettibilita sutherland sutton sutura sutural suzione svasata svasate svasatura sveinsson sventola svezzamento sviluppate sviluppo sweat sweating swedish sweeney sweet sydenham sydrome sylvius symbrachydactyly symmetric symmetrica symmetrical symoens sympathetic symphalangism symptomatic symptoms syn synaptic syncopal syncope syndactyly syndesmodysplasic syndrom syndrome syndromefoveal syndromes syndromic synechia synergistic syngap synkinesis synostoses synostosis synostosishumeroradial synostotic synovial synpolydactyly synthase synthesis synthetase syphilis syringocystadenoma syringomas syringomyelia syrup system systemic tachicardia tachipnea tachyarrhythmia tachycardia tafro tag tags takayasu takenouchi tako talamica talassemia talipe talipes tall talloni talo talonavicular talus tan tandem tangier tapetoretinal tappe tarda tardiva tardive tardivo tarlov tarp tarsal tarsus tartaglia task tateyama tatsumi tattile tatton taurina taurinuria taurodontism tawil tay taybi taylor tbck tcr tdp tecpr teebi teeth tegmental tegumentary telangectasia telangiectasia telangiectatica telecanthus teller telo telomere telomeric telomero telopeptide tempi temple tempo temporal temporale temporali temporo temporooccipital temra temtamy tendine tendinee tendinei tendon tendons tenorio tenosynovial tenue ter teratocarcinoma teratoid teratoide teratoma teratozoospermia terminal terminale terminalis termine terrore tertius terzo tessadori tessuto test testa testes testicolare testicolo testicular testosterone tetania tetanus tetra tetraamelia tetradecenoilcarnitina tetragametic tetrahydrobiopterin tetrahydrofolate tetrahydropterin tetralogia tetralogy tetramelic tetraparesi tetraparesis tetraplegia tetraploidy tetrasomy tetto thakker thalamic thalassemia thalidomide tham thanatophoric thauvin the thenar therapy thermal thermoanalgesia thermodysregulation theta thiamine thickened thiel thiemann thin thiolase thiopurine thiry thoc thomas thompson thomsen thomson thoracic thoraco thoracoabdominal thoracolaryngopelvic thoracomelic thoracopelvic thorax threoninemia threshold thrive thrombasthenia thrombocythemia thrombocytopenia thrombocytopenic thrombocytosis thromboembolic thromboembolism thrombomodulin thrombophilia thrombophiliavenous thrombosis thrombotic thumb thumbs thymic thymoma thymus thyrocerebrorenal thyrocerebroretinal thyroid thyroiditis thyrotoxic thyrotropin tibia tibial tibiale tic tick tietz tigna tigre timidezza timo timoma timothy tinea tinschert tip tipica tipo tirata tireoglobulina tiroide tiroidea tiroideo tiroidite tirosin tissue titubazione tmem toe toes tolchin toledo tolleranza toluene tomografia tone tongue tonic tonica tonico tonne tono tonsillite tonz tooth torace toracica toraciche toracolombare torch torcicollo toriello torrance torre torsade torsion torsione torti torticollis torticollo torto tortuose tortuosita tortuosity tosse total totale totali totalis touch tourette toutain townes toxic toxicity toxin toxoplasmosis tpp tra trabecolarizzazione tracheal tracheo tracheobronchomegaly tracheobronchopathia tracheobroncomalacia tracheoesophageal tracheomalacia trachyonychia tract trago trait tranebjaerg transaldolase transaminase transaminasi transcarbamylase transcobalamin transcription transferase transferrina transformation transgrediens transient transillumination transilluminazione transitional transitorio transizionali transketolase translocase translocation translucenza transplacental transplant transport transporter transposition transthyretin transverse trappc trasformazione traslucenza trasposizione trasversale trattenuta tratti tratto trauma traumatic trazione treacher trec trehalase tremor tremore trenaunay triacylglycerol triad triangolare triatrium tricarboxylic trichilemmal trichinellosis tricho trichodental trichodentoosseous trichodermodysplasia trichodiscomas trichodysplasia trichoepithelioma trichohepatoenteric trichohepatoneurodevelopmental trichomegaly trichoodontoonychial trichorhinophalangeal trichothiodystrophy trichotillomania trichromacy tricuspid tricuspidale tricuspide tridente trifalangeo trifosfato trifunctional trigeminal trigger triglyceride trigonocefalia trigonocephaly trim trimethadione trimethylaminuria triokinase triose triosephosphate triphalangeal triphosphatase triphosphate triple triplication triplogia triploidy trismus trisomy trisosfatasi tristichiasis tritanopia trocanteri trochlea trombocitopenia trombocitosi tromboembolismo trombofilia tromboflebite trombosi troncale tronco trophoblastic tropical troponina troppo trousseau truncal truncus trunk trypanosomiasis tryptophan tryptophanuria tsh tsubo tsuruta tuba tubb tube tubercle tubercolari tubercolo tuberculous tuberi tuberous tubo tubular tubulare tubulinopathy tubulointerstitial tubulointerstiziale tubulopathy tubulopatia tud tufted tufting tuftsin tukel tularemia tumidus tumor tumoral tumorale tumore tumori tumors tune tunnel turcica turcot turner turnpenny turricefalia tutte twitch two tylosis tylosisdiffuse type types typhoid typhus typical tyrosine tyrosinemia tyrosinosis tyshchenko ubiquinone uccello ucp uditiva uditivi uditivo udito ugola ulbright ulcer ulcera ulceration ulcerative ulcerazione ulcerosa ulerythema ullrich ulna ulnar ulnare ultrabassa ultrarapid ultrastructurally umbilical umbilicus uncertain unclassified uncombable uncorrected uncoupled undefined underlying undifferentiated undritz unghia unghie ungueale unico unicoronal uniformita unilateral unilaterale unilaterali uniparental unique univentricular universalis unknown unna unresponsive unresponsiveness unusual unverricht uova upgaze upington upper upward urachal urachus uraciluria urato urbach urban ureico ureidopropionase uremic ureter ureteral ureterale uretero ureterocele urethra urethral uretrale urgenza urico uridiltransferasi uridine urina urinaria urinario urinary urine urobilinogeno urocanase urocanic urofacial urogenital urolithiasis uromodulina urticaria urticarial uruguay uscita usher usmani uterina uterine utero uterus uveal uveite uveitis uvula vaccini vacciniforme vaccino vacterl vacuolar vacuoles vacuoli vacuolization vacuolizzazione vagina vaginal vaginale valga valgo valgum valgus valinemia valley valproate valsalva valvar valve valvola valvolare valvular valvulopatia van vanagaite vanhorick vanishing vara variabilis variabilita variable variant variante variants variazione variazioni varicella varicocele varicose variegata variegate variegated varioliformis varismo varon varum varus vas vascolare vascular vasculature vasculite vasculitis vasculopathy vasi vasoconstriction vasopressin vasovagal vater vcp vedova vegetativo veglia vein veins velo velocardiofacial velocita velocity velofaringea velopharyngeal velum vena vene veno venoocclusive venosa venoso venosus venous ventilator ventilatore ventilatorio ventilazione ventoso ventrale ventricle ventricolare ventricolo ventricolomegalia ventricular ventriculomegaly venular vera verheij veriabilis verloes verloove verma verme vermiculata vermiglio vermis vernal vernice vernix vernon verrucae verruche verruciformis verrucosis verrucous versamento versione verso versus vertebrae vertebral vertebrale vertebrali vertebre vertical verticale verticaltalus verticis vertigine vertigini ververi very vescica vesciche vescicoureterale vesicles vesicoureteral vesicular vessel vestibolare vestibular vestibulocochlear vestibulopathy vetro vexas via vialetto vib vibratoria vibrazione vibrazioni vic vici vie vii viia viib viii villi vinson violento vipoma viral virale virali virchow viremia virus visceral vision visione visiva visivi visivo viso viss vissers vista visual visualization visuo vita vitale vitamin vitamina vitelliform vitiligine vitiligo vitrea vitreoretinal vitreoretinochoroidopathy vitreoretinopathy vitreoretinopatia vitreous vitro vldl vocal vocali vocalizzazione voce vogel vogt vohwinkel volkmann voltage voltaggio volto volume volvolo volvulus vomiting vomito von vps vries vulgaris vulto vulva vulvovaginal vulvovaginale vuota waardenburg wac wagner wagr wagro wahab waisman wake wakeling waldenstrom walker walking wall wang warburg ward warm wars warsaw warty wasting water waters watson wave wbs weakness weaver web webb webbed weber weight weill weismann weiss weisz welander well wells werner wernicke weyers which whim whipple whistling white whorled widely wieacker wiedemann wiethe wild wildervanck willebrand willi williams wilms wilson winchester wine winter wiskott with withor without witkop witteveen wolcott wolf wolff wolfgang wolfram wolman wood woodhouse woods woolly wormian wormiane woronets worster worth woude wound wrinkly wrist writer wwox wyburn xantelasma xanthinuria xanthogranuloma xanthoma xanthomatosis xantinuria xantomatosi xantomi xeroderma xerosis xfe xia xiap xii xiii xiiib xiv xix xlf xvi xvii xviii xxii xxiii xxxxy xxxy xxxyy xxyy xylt xyy xyyy xyyyy yamamoto yang yao yellow yemenite yoon yosef you young yuan yuksel yunis zaki zap zeb zebra zechi zellweger zeta zhao ziegler zigomatico zika zimmermann zinc ziter znf zollinger zonal zonular zoster zttk zweier zygomycosis zygote";

/* >>> v16: geni e malattie reali (con conferma), punto di vista su un familiare, note generali */

// ---------- vocabolario ----------
const VOC_GENI = new Set(), VOC_GENI_MAL = new Set();
VOC_GENI_STR.split(' ').forEach(g => { if (g[0] === '*') { g = g.slice(1); VOC_GENI_MAL.add(g); } VOC_GENI.add(g); });
const VOC_PAROLE_RAW = VOC_PAROLE_STR.split(' ');
const radiceVoc = w => (w.length >= 5 ? w.replace(/(?:[aeiou]|he|hi)$/, '') : w);
const VOC_PAROLE = new Set(VOC_PAROLE_STR.split(' ').map(radiceVoc));
const VOC_CONF = { geni: new Set(), malattie: new Set() };
(function () {
  // anche le parole del dizionario delle malattie e degli organi
  const add = s => lowA(String(s)).split(/[^a-z]+/).filter(w => w.length >= 3).forEach(w => VOC_PAROLE.add(radiceVoc(w)));
  Object.keys(MAL_IDX).forEach(add); Object.values(MAL_IDX).forEach(add);
  Object.keys(SYN).forEach(add); Object.keys(INH).forEach(add); Object.values(GENE_MALATTIA).forEach(add);
  if (typeof ORGANI !== 'undefined') ORGANI.forEach(o => (o[2] || []).forEach(add));
})();
function aggiungiVocabolario(v) {
  if (!v) return;
  (v.geni || []).forEach(g => VOC_CONF.geni.add(String(g).toUpperCase()));
  (v.malattie || []).forEach(m => VOC_CONF.malattie.add(normDiz(m)));
}
function vocabolarioConfermato() { return { geni: [...VOC_CONF.geni], malattie: [...VOC_CONF.malattie] }; }
function geneReale(g, S) {
  const G = String(g || '').toUpperCase().replace(/^HLA-([A-Z]+\d?)\*?.*$/, 'HLA-$1');
  if (!G) return true;
  if (VOC_GENI.has(G) || VOC_CONF.geni.has(G) || GENI_VAR.has(G) || REP[G] || GENE_ALIAS[G]) return true;
  if (S && S.vocab && (S.vocab.geni || []).some(x => x.toUpperCase() === G)) return true;
  return false;
}
const PAROLE_GENERICHE = new Set(['sindrome', 'malattia', 'morbo', 'tipo', 'forma', 'del', 'della', 'dello', 'dei', 'delle', 'degli', 'di', 'da', 'con', 'per', 'tra', 'il', 'la', 'lo', 'le', 'gli', 'una', 'uno', 'un', 'sospetta', 'sospetto', 'non', 'nota', 'noto', 'altro', 'altra']);
function malattiaReale(nome, S) {
  const n = String(nome || '').replace(/\s*\(sospett[ao]\)$/i, '').trim();
  if (!n) return true;
  const nd = normDiz(n);
  if (eMalattiaNota(n) || VOC_CONF.malattie.has(nd) || INH[n] || Object.values(GENE_MALATTIA).includes(n)) return true;
  if (S && S.vocab && (S.vocab.malattie || []).some(x => normDiz(x) === nd)) return true;
  if (/^(?:t|inv|rob|ins|del|dup|der|r|i|upd)\(|^(?:mos\s+)?(?:4[4-9]|69|92),|^arr|^Cariotipo /i.test(n)) return true;
  if (/^(?:Tumore|Tumori|Cancro|Carcinoma|Neoplasia|Adenocarcinoma|Linfoma|Leucemia|Melanoma|Sarcoma|Mieloma|Glioma|Glioblastoma|Delezione|Duplicazione|Microdelezione|Microduplicazione|Traslocazione|Cromosoma|Isocromosoma|Disomia|Robertsoniana|Trisomia|Monosomia|Triploidia|Tetraploidia|Anomalia cromosomica|Mosaicismo|Malattia (?:autosomica|recessiva|dominante|legata|mitocondriale|multifattoriale|da imprinting))(?![\p{L}])/iu.test(n)) return true;
  if (typeof CNV_NOTE !== 'undefined' && CNV_NOTE.some(r => r[3] === n)) return true;
  // ogni parola significativa deve esistere nel lessico medico (HPO in italiano, OMIM/Orphanet, dizionario)
  const parole = lowA(n).split(/[^a-z]+/).filter(w => w.length >= 3 && !PAROLE_GENERICHE.has(w) && !/^(?:i{1,3}|iv|vi{0,3}|ix|x{1,3})$/.test(w));
  if (!parole.length) return true;
  return parole.every(w => VOC_PAROLE.has(radiceVoc(w)) || VOC_PAROLE.has(w));
}
function suggerisciGene(g) {
  const G = String(g).toUpperCase(), out = [];
  for (const x of VOC_GENI) { if (Math.abs(x.length - G.length) > 1) continue; const d = dl(G, x); if (d === 1) out.push([d, x]); }
  if (out.length < 3) for (const x of VOC_GENI) { if (Math.abs(x.length - G.length) > 2 || out.some(o => o[1] === x)) continue; if (x[0] === G[0] && dl(G, x) === 2) out.push([2, x]); }
  const peso = x => (GENE_MALATTIA[x] || REP[x] || GENI_VAR.has(x) ? 0 : VOC_GENI_MAL.has(x) ? 0.3 : 0.6) + ([...x].sort().join('') === [...G].sort().join('') ? -0.5 : 0);
  return out.sort((a, b) => (a[0] + peso(a[1])) - (b[0] + peso(b[1]))).slice(0, 3).map(o => o[1]);
}
function suggerisciMalattia(nome) {
  const n = normDiz(nome), out = [];
  const nomi = [...new Set(Object.values(MAL_IDX).filter(x => typeof x === 'string'))];
  nomi.forEach(c => { const d = dl(n, normDiz(c)); if (d <= Math.max(2, Math.floor(n.length / 6))) out.push([d, c]); });
  // «Sindrome di Nooman» → «Sindrome di Noonan» con le parole del lessico
  const m = /^((?:sindrome|malattia|morbo|corea|atassia|distrofia)\s+(?:di|del|della)\s+)(.+)$/.exec(n);
  if (m) {
    const w = m[2].split(' ');
    const fix = w.map(x => { if (VOC_PAROLE.has(radiceVoc(x)) || x.length < 4) return x; const lim = x.length >= 7 ? 2 : 1; let best = null, bd = lim + 1; for (const y of VOC_PAROLE_RAW) { if (y[0] !== x[0] || Math.abs(y.length - x.length) > lim) continue; const d = dl(x, y); if (d < bd) { bd = d; best = y; } } return best && bd <= lim ? best : null; });
    if (fix.every(Boolean)) { const s = cap(m[1] + fix.join(' ')).replace(/(\s(?:di|del|della)\s)(\S)/, (a, b, c) => b + c.toUpperCase()); if (!out.some(o => normDiz(o[1]) === normDiz(s))) out.push([1.5, s]); }
  }
  return out.sort((a, b) => a[0] - b[0]).map(o => o[1]).filter((x, i, a) => a.indexOf(x) === i && normDiz(x) !== n).slice(0, 3);
}
function fotoVoci(S) {
  const f = {};
  Object.values(S.people).forEach(p => { f[p.id] = { c: new Set(p.conditions.map(c => c.name)), k: new Set(p.carriers), v: new Set((p.variants || []).map(v => v.text)) }; });
  return f;
}
function cmdVoce(S, id, it, nome) {
  const p = S.people[id], F = p.sex === 'F';
  if (it.kind === 'cond') return `@${id} è ${F ? 'affetta' : 'affetto'} da ${nome}${it.age ? ` a ${it.age} anni` : ''}${it.denovo ? ' de novo' : ''}`;
  if (it.kind === 'car') return `@${id} è ${F ? 'portatrice' : 'portatore'} di ${nome}`;
  const v = it.v;
  if (v.neg) return `@${id} è ${F ? 'negativa' : 'negativo'} per ${nome}`;
  if (v.carrier) return `@${id} è ${F ? 'portatrice' : 'portatore'} di ${nome}`;
  if (v.cls === 'VUS') return `@${id} ha una VUS in ${nome}`;
  return `@${id} è ${v.zyg === 'omo' ? 'omozigote' : v.zyg === 'emi' ? 'emizigote' : v.zyg === 'comp' ? 'eterozigote composto' : 'eterozigote'} per ${nome}${v.note === 'de novo' ? ' de novo' : ''}`;
}
function controllaRealta(S, prima, R) {
  const dubbi = [];
  Object.values(S.people).forEach(p => {
    const f = prima[p.id] || { c: new Set(), k: new Set(), v: new Set() };
    p.conditions = p.conditions.filter(c => { if (f.c.has(c.name) || malattiaReale(c.name, S)) return true; dubbi.push({ id: p.id, kind: 'cond', nome: c.name, age: c.age, denovo: c.denovo }); return false; });
    p.carriers = p.carriers.filter(c => { if (!c || f.k.has(c) || malattiaReale(c, S)) return true; dubbi.push({ id: p.id, kind: 'car', nome: c }); return false; });
    p.variants = (p.variants || []).filter(v => {
      if (f.v.has(v.text) || v.text === 'test') return true;
      const g = geneDi(v.text);
      if (!g || /^[cgpmnr]\./i.test(v.text) || !/^[A-Za-z]/.test(g) || geneReale(g, S)) return true;
      dubbi.push({ id: p.id, kind: 'var', nome: v.text, gene: g, v }); return false;
    });
  });
  if (!dubbi.length) return;
  pruneConditions(S);
  const gruppi = {};
  dubbi.forEach(d => { const k = d.kind === 'var' ? 'g:' + d.gene : 'm:' + normDiz(d.nome); (gruppi[k] = gruppi[k] || []).push(d); });
  for (const [k, ds] of Object.entries(gruppi)) {
    const d0 = ds[0], chi = [...new Set(ds.map(d => d.id))];
    const cmds = sost => ds.map(d => cmdVoce(S, d.id, d, sost(d))).join('; ');
    if (d0.kind === 'var') {
      const sug = suggerisciGene(d0.gene);
      R.log.push({ type: 'warn', text: `Non ho inserito «${d0.nome}»: il gene ${d0.gene} non risulta tra i geni umani (HGNC).`, ids: chi });
      R.log.forEach(l => { if (l.type === 'ok' && l.text.includes(d0.nome)) l.text = l.text.split(d0.nome).join(d0.nome + ' (da confermare)'); });
      R.asks.push({ text: `Il gene «${d0.gene}» non risulta tra i geni umani. ${sug.length ? 'Intendevi…?' : 'È corretto?'}`,
        options: sug.map(s => ({ label: s, cmd: cmds(d => d.nome.replace(new RegExp('^' + d.gene.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), s)) }))
          .concat([{ label: `«${d0.gene}» è corretto: inseriscilo`, cmd: `conferma gene «${d0.gene}»; ` + cmds(d => d.nome), keys: ['si', 'corretto', 'giusto', 'confermo', 'inserisci', 'inseriscilo'] }]) });
    } else {
      const sug = suggerisciMalattia(d0.nome);
      R.log.push({ type: 'warn', text: `Non ho inserito «${d0.nome}»: non risulta tra le malattie e i termini clinici che conosco.`, ids: chi });
      R.log.forEach(l => { if (l.type === 'ok' && l.text.includes(d0.nome)) l.text = l.text.split(d0.nome).join(d0.nome + ' (da confermare)'); });
      R.asks.push({ text: `Non riconosco «${d0.nome}». ${sug.length ? 'Intendevi…?' : 'La inserisco comunque?'}`,
        options: sug.map(s => ({ label: s, cmd: cmds(() => s) }))
          .concat([{ label: `«${d0.nome}» è corretta: inseriscila`, cmd: `conferma malattia «${d0.nome}»; ` + cmds(d => d.nome), keys: ['si', 'corretta', 'corretto', 'giusta', 'confermo', 'inserisci', 'inseriscila'] }]) });
    }
  }
}
function estraiConferme(S, input, R) {
  // «conferma gene «XYZ»; …» e «conferma malattia «…»; …»: entrano nel vocabolario e il resto prosegue
  let t = String(input || ''), m;
  while ((m = /^\s*conferma\s+(gene|malattia)\s+«([^»]+)»\s*;?\s*/i.exec(t))) {
    const tipo = m[1].toLowerCase() === 'gene' ? 'geni' : 'malattie', val = m[2].trim();
    S.vocab = S.vocab || { geni: [], malattie: [] };
    S.vocab[tipo] = S.vocab[tipo] || [];
    if (!S.vocab[tipo].includes(val)) S.vocab[tipo].push(val);
    aggiungiVocabolario({ [tipo]: [val] });
    R.vocabNuovo = R.vocabNuovo || { geni: [], malattie: [] }; R.vocabNuovo[tipo].push(val);
    R.log.push({ type: 'ok', text: `${tipo === 'geni' ? 'Gene' : 'Malattia'} «${val}» confermato e aggiunto al vocabolario.` });
    t = t.slice(m[0].length);
  }
  return t;
}

// ---------- punto di vista: «collocati sulla sorella», «torna al probando» ----------
const POV_RE = /^(?:(?:ora|adesso|allora|ok)\s+)?(?:collocati|collocarsi|colloca(?:mo)?ci|spostati|spostiamoci|sposta(?:ti)?\s+il\s+(?:riferimento|punto\s+di\s+vista)|posizionati|mettiti|centrati|concentrati|passa|passiamo|parliamo|parlo|prendi\s+come\s+riferimento|usa\s+come\s+riferimento|riferimento|riferiamoci|punto\s+di\s+vista|dal\s+punto\s+di\s+vista|vista\s+da|ragiona\s+da|descrivo\s+(?:la\s+famiglia\s+)?(?:del(?:la|lo)?|di))\s*(?::|sulla|sullo|sulle|sull'|sul|sui|su|alla|allo|all'|al|ai|a|della|dello|dell'|del|di|dalla|dallo|dall'|dal|da)?\s*(.+)$/i;
function tryPuntoDiVista(S, sub, ctx, R) {
  const t = sub.trim().replace(/[.!]+$/, '');
  if (/^(?:torna(?:\s+indietro)?|ritorna|riparti|rimettiti|ricollocati|riposizionati)\s+(?:al|sul|dal)\s+(?:probando|probanda|caso\s+indice)$|^(?:riferimento|punto\s+di\s+vista)\s*:?\s*(?:il\s+|del\s+|la\s+|della\s+)?(?:probando|probanda)$|^(?:basta|fine)\s+riferimento$/i.test(t)) {
    const era = ctx.pov; ctx.pov = null;
    R.log.push({ type: 'ok', text: era ? 'Le parentele tornano riferite al probando.' : 'Le parentele sono già riferite al probando.' });
    return true;
  }
  const m = POV_RE.exec(t);
  if (!m) return false;
  const resto = m[1].trim();
  const T = tokenize(resto);
  if (!startsRef(T, 0)) return false;
  const r = parseRef(T, 0, R);
  if (!r || r.j < T.length) return false;
  const ids = resolveRef(S, r, ctx, R, false);
  if (!ids.length) throw new UErr(`Non trovo «${r.text}» nel pedigree.`);
  if (ids.length > 1) throw Object.assign(new UErr(`«${r.text}» indica più persone: su quale mi colloco?`), {});
  const id = ids[0];
  ctx.pov = id === S.probandId ? null : id;
  ctx.lastTouched = [id];
  R.log.push({ type: 'ok', text: id === S.probandId ? 'Le parentele tornano riferite al probando.' : `Da ora le parentele («la zia», «il padre», «aggiungi un fratello»…) sono riferite a ⟨${id}⟩. Scrivi «torna al probando» per tornare.`, ids: [id] });
  return true;
}

function resolveRef(S, ref, ctx, R, create) {
  // con un punto di vista attivo: prima la persona già esistente rispetto al riferimento, poi rispetto al probando, solo alla fine si crea
  if (!ctx || !ctx.pov || !S.people[ctx.pov] || ref.base) return resolveRef0(S, ref, ctx, R, create);
  let ids = null;
  try { ids = resolveRef0(S, ref, ctx, R, false); } catch (e) { if (!(e instanceof UErr)) throw e; }
  if (ids && ids.length) return ids;
  const pov = ctx.pov; ctx.pov = null;
  let alt = null;
  try { alt = resolveRef0(S, ref, ctx, R, false); } catch (e) { if (!(e instanceof UErr)) { ctx.pov = pov; throw e; } } finally { ctx.pov = pov; }
  if (alt && alt.length) return alt;
  return resolveRef0(S, ref, ctx, R, create);
}

// ---------- note generali in basso a sinistra ----------
function tryNoteGenerali(S, sub, ctx, R) {
  const t = sub.trim();
  const rm = /^(?:togli|rimuovi|elimina|cancella|svuota)\s+(?:(?:la|le|tutte\s+le)\s+)?note?\s+(?:general[ei]|dell'albero|del\s+pedigree|della\s+famiglia|in\s+basso)\s*$/i.exec(t);
  if (rm) { const n = (S.noteGen || []).length; S.noteGen = []; R.log.push({ type: n ? 'ok' : 'warn', text: n ? 'Note generali cancellate.' : 'Non ci sono note generali.' }); return true; }
  const m = /^(?:(?:aggiungi|aggiungo|metti|scrivi|inserisci)\s+(?:una\s+|la\s+|nelle\s+)?)?(?:nota|note|annotazione|annotazioni|commento)\s+(?:general[ei]|dell'albero|del\s+pedigree|della\s+famiglia|in\s+basso|a\s+pi[eè]\s+di\s+pagina)\s*(?::|-|–|—)?\s*(.+)$/i.exec(t);
  if (!m) return false;
  const testo = m[1].replace(/\u2063/g, '').replace(/\u2024/g, '.').replace(/\u201A/g, ',').replace(/\u204F/g, ';').trim().replace(/^[«"“]|[»"”]$/g, '');
  if (!testo) return false;
  S.noteGen = S.noteGen || [];
  S.noteGen.push(testo.charAt(0).toUpperCase() + testo.slice(1));
  R.log.push({ type: 'ok', text: `Nota generale aggiunta: «${testo}»` });
  return true;
}
/* <<< v16 */

/* >>> dialogo (1.5): avverbi, nomenclatura storica delle varianti, rimozione di voci,
   risposte brevi alle domande in sospeso, «eliminala», colori dei portatori */

// ---------- avverbi che non fanno parte del nome di malattie o varianti ----------
const AVV = '(?:anche|pure|inoltre|altresi|altresì|invece|ancora|tuttora|comunque|sempre|gia|già)';
function togliAvverbi(t) {
  t = t.replace(new RegExp(`(?<![\\p{L}])(portat(?:ore|rice|ori|rici)(?:\\s+san[oaie])?|affett[oaie]|malat[oaie]|eterozigot[ei]|omozigot[ei]|emizigot[ei]|positiv[oaie]|negativ[oaie]|carrier)\\s+(?:${AVV}\\s+)+`, 'giu'), '$1 ');
  t = t.replace(new RegExp(`(?<![\\p{L}])(di|da|per|del|della|dello|dei|delle)\\s+(?:${AVV}\\s+)+`, 'giu'), '$1 ');
  return t;
}

// ---------- «eliminala», «annulla», «torna indietro» ----------
function eAnnulla(raw) {
  const l = lowA(String(raw || '')).replace(/[.!?,;]+$/g, '').trim();
  return /^(?:annulla(?:la|lo|le|li)?(?:\s+(?:l'?ultima(?:\s+(?:modifica|cosa|frase))?|quello|questo))?|undo|indietro|torna\s+indietro|(?:elimina|togli|cancella|rimuovi)(?:la|lo|le|li)|no,?\s+(?:sbagliato|errore|non\s+(?:era|e)\s+cosi)|sbagliato|hai\s+sbagliato|errore)$/.test(l);
}

// ---------- nomenclatura storica (legacy) delle varianti più frequenti ----------
// [gene, nome mostrato, HGVS, alias]; gli alias con «~» valgono solo se il gene è scritto
const VAR_STORICHE = [
  ['CFTR', 'F508del', 'c.1521_1523del p.(Phe508del)', ['f508del', 'deltaf508', 'df508', 'delf508', 'deltaf508del', 'f508delctt', '508del', '~f508', 'c1521_1523delctt']],
  ['CFTR', 'G542X', 'c.1624G>T p.(Gly542Ter)', ['g542x', 'g542*', 'g542ter']],
  ['CFTR', 'N1303K', 'c.3909C>G p.(Asn1303Lys)', ['n1303k']],
  ['CFTR', 'W1282X', 'c.3846G>A p.(Trp1282Ter)', ['w1282x', 'w1282*']],
  ['CFTR', 'R117H', 'c.350G>A p.(Arg117His)', ['r117h']],
  ['CFTR', 'G551D', 'c.1652G>A p.(Gly551Asp)', ['g551d']],
  ['CFTR', 'R553X', 'c.1657C>T p.(Arg553Ter)', ['r553x', 'r553*']],
  ['CFTR', 'R1162X', 'c.3484C>T p.(Arg1162Ter)', ['r1162x', 'r1162*']],
  ['CFTR', 'R334W', 'c.1000C>T p.(Arg334Trp)', ['r334w']],
  ['CFTR', 'T338I', 'c.1013C>T p.(Thr338Ile)', ['t338i']],
  ['CFTR', 'R347P', 'c.1040G>C p.(Arg347Pro)', ['r347p']],
  ['CFTR', 'D1152H', 'c.3454G>C p.(Asp1152His)', ['d1152h']],
  ['CFTR', 'L206W', 'c.617T>G p.(Leu206Trp)', ['l206w']],
  ['CFTR', 'I507del', 'c.1519_1521del p.(Ile507del)', ['i507del', 'deltai507']],
  ['CFTR', '2789+5G>A', 'c.2657+5G>A', ['2789+5g>a', '2789+5']],
  ['CFTR', '621+1G>T', 'c.489+1G>T', ['621+1g>t', '621+1']],
  ['CFTR', '711+1G>T', 'c.579+1G>T', ['711+1g>t', '711+1']],
  ['CFTR', '1717-1G>A', 'c.1585-1G>A', ['1717-1g>a', '17171g>a']],
  ['CFTR', '3849+10kbC>T', 'c.3718-2477C>T', ['3849+10kbc>t', '3849+10kb']],
  ['CFTR', '1811+1.6kbA>G', 'c.1680-886A>G', ['1811+16kba>g', '1811+16kb']],
  ['CFTR', '2183AA>G', 'c.2051_2052delinsG', ['2183aa>g', '2183a>g']],
  ['CFTR', '2184delA', 'c.2052del', ['2184dela']],
  ['CFTR', '3659delC', 'c.3528del', ['3659delc']],
  ['CFTR', '5T', 'c.1210-12T[5]', ['~5t', '~t5', '~poli5t', '~polit5']],
  ['HBB', 'cod39', 'c.118C>T p.(Gln40Ter)', ['cod39', 'cd39', 'codone39', 'codon39', 'b039', 'b0cod39', 'q39x', 'cod39c>t', 'cd39c>t', 'codone39c>t']],
  ['HBB', 'IVS-I-110', 'c.93-21G>A', ['ivsi110', 'ivs1110', 'ivsi110g>a', 'ivs1110g>a', 'b+ivsi110', 'b+110']],
  ['HBB', 'IVS-I-1', 'c.92+1G>A', ['ivsi1', 'ivsi1g>a', '~ivs11', 'ivs1nt1']],
  ['HBB', 'IVS-I-5', 'c.92+5G>C', ['ivsi5', 'ivsi5g>c', '~ivs15']],
  ['HBB', 'IVS-I-6', 'c.92+6T>C', ['ivsi6', 'ivsi6t>c', '~ivs16', 'ivs1nt6']],
  ['HBB', 'IVS-II-1', 'c.315+1G>A', ['ivsii1', 'ivsii1g>a', '~ivs21']],
  ['HBB', 'IVS-II-654', 'c.316-197C>T', ['ivsii654', '~ivs2654']],
  ['HBB', 'IVS-II-745', 'c.316-106C>G', ['ivsii745', 'ivsii745c>g', '~ivs2745']],
  ['HBB', '-87 C>G', 'c.-137C>G', ['87c>g', 'promotore87', '~87']],
  ['HBB', '-101 C>T', 'c.-151C>T', ['101c>t', 'promotore101', '~101']],
  ['HBB', 'cod44 (-C)', 'c.135del p.(Phe46LeufsTer16)', ['cod44', 'cd44', 'codone44', 'cod44c', 'cd44c']],
  ['HBB', 'cod8 (-AA)', 'c.25_26del p.(Lys9ValfsTer14)', ['cod8', 'cd8', 'codone8', 'cod8aa', 'cd8aa']],
  ['HBB', 'cod5 (-CT)', 'c.17_18del p.(Pro6ArgfsTer17)', ['cod5', 'cd5', 'codone5', 'cod5ct', 'cd5ct']],
  ['HBB', 'cod15 (G>A)', 'c.48G>A p.(Trp16Ter)', ['cod15', 'cd15', 'codone15', 'w15x']],
  ['HBB', 'HbS', 'c.20A>T p.(Glu7Val)', ['hbs', 'emoglobinas', 'e6v', 'glu6val']],
  ['HBB', 'HbC', 'c.19G>A p.(Glu7Lys)', ['hbc', 'emoglobinac', 'e6k', 'glu6lys']],
  ['HBB', 'HbE', 'c.79G>A p.(Glu27Lys)', ['hbe', 'emoglobinae', 'e26k']],
  ['HBB', 'HbD-Punjab', 'c.364G>C p.(Glu122Gln)', ['hbdpunjab', 'hbdlosangeles', 'e121q', '~hbd']],
  ['HBA', '-α3.7', '', ['a37', 'alfa37', 'alpha37', 'del37', '~37']],
  ['HBA', '-α4.2', '', ['a42', 'alfa42', 'alpha42', 'del42', '~42']],
  ['HBA', '--MED', '', ['mmed', 'delmed', '~med']],
  ['HBA', '--SEA', '', ['msea', 'delsea', '~sea']],
  ['HBA', '-(α)20.5', '', ['a205', 'alfa205', '~205']],
  ['GJB2', '35delG', 'c.35del p.(Gly12ValfsTer2)', ['35delg', 'c35delg', 'g12fs']],
  ['GJB2', '167delT', 'c.167del p.(Leu56ArgfsTer26)', ['167delt', 'c167delt']],
  ['GJB2', '235delC', 'c.235del p.(Leu79CysfsTer3)', ['235delc', 'c235delc']],
  ['GJB2', 'M34T', 'c.101T>C p.(Met34Thr)', ['m34t']],
  ['GJB2', 'V37I', 'c.109G>A p.(Val37Ile)', ['v37i']],
  ['HFE', 'C282Y', 'c.845G>A p.(Cys282Tyr)', ['c282y']],
  ['HFE', 'H63D', 'c.187C>G p.(His63Asp)', ['h63d']],
  ['HFE', 'S65C', 'c.193A>T p.(Ser65Cys)', ['s65c']],
  ['MEFV', 'M694V', 'c.2080A>G p.(Met694Val)', ['m694v']],
  ['MEFV', 'M694I', 'c.2082G>A p.(Met694Ile)', ['m694i']],
  ['MEFV', 'M680I', 'c.2040G>C p.(Met680Ile)', ['m680i']],
  ['MEFV', 'V726A', 'c.2177T>C p.(Val726Ala)', ['v726a']],
  ['MEFV', 'E148Q', 'c.442G>C p.(Glu148Gln)', ['e148q']],
  ['F5', 'Leiden (R506Q)', 'c.1601G>A p.(Arg534Gln)', ['leiden', 'fattorevleiden', 'fattore5leiden', 'fvleiden', 'r506q', '1691g>a', 'g1691a']],
  ['F2', 'G20210A', 'c.*97G>A', ['g20210a', '20210g>a', 'protrombinag20210a', 'fiig20210a']],
  ['MTHFR', 'C677T', 'c.665C>T p.(Ala222Val)', ['c677t', '677c>t', 'a222v']],
  ['MTHFR', 'A1298C', 'c.1286A>C p.(Glu429Ala)', ['a1298c', '1298a>c', 'e429a']],
  ['SERPINA1', 'PiZ', 'c.1096G>A p.(Glu366Lys)', ['piz', 'alleloz', 'e342k', '~z']],
  ['SERPINA1', 'PiS', 'c.863A>T p.(Glu288Val)', ['pis', 'alleleS', 'e264v', '~s']],
  ['G6PD', 'Mediterranea', 'c.563C>T p.(Ser188Phe)', ['g6pdmediterranea', 'mediterranean', 's188f', '~mediterranea', '~med']],
  ['BRCA1', '5382insC', 'c.5266dup p.(Gln1756ProfsTer74)', ['5382insc', '5382dupc']],
  ['BRCA1', '185delAG', 'c.68_69del p.(Glu23ValfsTer17)', ['185delag', 'e23fs']],
  ['BRCA2', '6174delT', 'c.5946del p.(Ser1982ArgfsTer22)', ['6174delt']],
  ['PAH', 'R408W', 'c.1222C>T p.(Arg408Trp)', ['r408w']],
  ['PAH', 'IVS10-11G>A', 'c.1066-11G>A', ['ivs1011g>a', 'ivs10nt11', 'ivs10-11']],
  ['GBA1', 'N370S', 'c.1226A>G p.(Asn409Ser)', ['n370s']],
  ['GBA1', 'L444P', 'c.1448T>C p.(Leu483Pro)', ['l444p']],
  ['ATP7B', 'H1069Q', 'c.3207C>A p.(His1069Gln)', ['h1069q']],
  ['HEXA', '1278insTATC', 'c.1274_1277dup p.(Tyr427IlefsTer5)', ['1278instatc', '1278ins4']],
].map(([gene, nome, hgvs, al]) => {
  const forti = new Set(), deboli = new Set();
  al.forEach(a => (a.startsWith('~') ? deboli : forti).add(chiaveVar(a.replace(/^~/, ''))));
  // gli HGVS valgono come alias: «c.1521_1523del», «p.Phe508del», «Phe508del»
  hgvs.split(/\s+/).filter(x => /^[cpg]\./.test(x)).forEach(x => { const k = chiaveVar(x.replace(/[()]/g, '')); forti.add(k); if (/^p/.test(k)) forti.add(k.slice(1)); });
  return { gene, nome, hgvs, forti, deboli };
});
const GENI_VAR = new Set([...VAR_STORICHE.map(v => v.gene), 'HBA1', 'HBA2', 'GBA', 'FVL', ...Object.keys(GENE_MALATTIA)]);
const GENE_ALIAS = { HBA1: 'HBA', HBA2: 'HBA', GBA: 'GBA1', FV: 'F5', FII: 'F2', PROTROMBINA: 'F2', ALFA1: 'SERPINA1', A1AT: 'SERPINA1' };
function chiaveVar(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[δ∆Δ]/g, 'delta').replace(/[αɑ]/g, 'a').replace(/β/g, 'b').replace(/[°º]/g, '0')
    .replace(/[\s\-–.()_:,;'’/\[\]]/g, '')
    .replace(/beta/g, 'b').replace(/alfa|alpha/g, 'a').replace(/bzero/g, 'b0').replace(/zero(?=\d)/g, '0');
}
function cifre(k) { return k.replace(/\D/g, ''); }
function geneCanon(g) { const G = String(g || '').toUpperCase(); return GENE_ALIAS[G] || G; }
function cercaVariante(testo) {
  if (!testo) return null;
  let t = String(testo).trim().replace(/^(?:la|il|una|un)\s+(?:variante|mutazione)\s+/i, '').replace(/^(?:variante|mutazione|allele)\s+/i, '');
  const toks = t.split(/\s+/);
  let gene = null, resto = t;
  const g0 = toks[0] && toks[0].replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (toks.length > 1 && g0 && GENI_VAR.has(g0) && !VAR_STORICHE.some(v => v.forti.has(chiaveVar(toks[0])))) { gene = geneCanon(g0); resto = toks.slice(1).join(' '); }
  else if (toks.length > 1 && /^(?:fattore|f)$/i.test(toks[0]) && /^(?:v|5|ii|2)$/i.test(toks[1])) { gene = /^(v|5)$/i.test(toks[1]) ? 'F5' : 'F2'; resto = toks.slice(2).join(' ') || 'leiden'; }
  resto = resto.replace(/^(?:del|nel|in|gene)\s+/i, '');
  const k = chiaveVar(resto);
  if (!k) return null;
  const compat = v => !gene || v.gene === gene || (gene === 'HBA' && v.gene === 'HBA');
  // 1) esatto
  let cand = VAR_STORICHE.filter(v => compat(v) && (v.forti.has(k) || (gene && v.deboli.has(k))));
  if (!gene) cand = cand.filter(v => k.length >= 3);
  if (cand.length === 1) return { gene: cand[0].gene, nome: cand[0].nome, hgvs: cand[0].hgvs, testo: cand[0].gene + ' ' + cand[0].nome, corretto: false };
  if (cand.length > 1) return null;
  // 2) refuso evidente (stesse cifre, una lettera sbagliata) solo se non è già una variante valida
  if (/^[cpgmn]\./i.test(resto.trim()) || /^[a-z]\d{1,4}[a-z*]$/i.test(k) || /^[a-z]{3}\d{1,4}[a-z]{3}$/i.test(k)) return null;
  if (k.length < 5 || !cifre(k)) return null;
  const vicini = [];
  VAR_STORICHE.forEach(v => { if (!compat(v)) return; [...v.forti, ...(gene ? v.deboli : [])].forEach(a => { if (a.length >= 5 && cifre(a) === cifre(k) && dl(a, k) === 1 && !vicini.includes(v)) vicini.push(v); }); });
  if (vicini.length === 1) return { gene: vicini[0].gene, nome: vicini[0].nome, hgvs: vicini[0].hgvs, testo: vicini[0].gene + ' ' + vicini[0].nome, corretto: true };
  return null;
}
function hgvsDi(testo) { const v = cercaVariante(testo); return v && v.testo.toLowerCase() === String(testo).trim().toLowerCase() ? v.hgvs : ''; }
let _fixVar = null;
function canonVar(t) {
  if (!t || t === 'test' || /(?:^|\s)[cpgmn]\.\S/i.test(t)) return t;   // HGVS scritto dall'utente: resta com'è
  const v = cercaVariante(t);
  if (!v) return t;
  if (_fixVar && lowA(v.testo).replace(/\s+/g, '') !== lowA(t).replace(/\s+/g, '')) _fixVar.push([t, v.testo + (v.corretto ? '' : '')]);
  return v.testo;
}
function normVariant(s) { return canonVar(normVariant0(s)); }
function looksVariant1(t) { return looksVariant0(t) || (t.split(/\s+/).length <= 4 && !!cercaVariante(t)); }
function looksVariant(s) {
  if (!s) return false;
  const t = String(s).trim();
  if (looksVariant1(t)) return true;
  // elenco di varianti: «HBB cod39 e CFTR F508del», «CFTR F508del, GJB2 35delG»
  const pezzi = t.split(/\s*,\s*|\s+e\s+|\s+ed\s+/).map(x => x.replace(/^(?:di|per|la|il)\s+/i, '').trim()).filter(Boolean);
  return pezzi.length > 1 && pezzi.every(x => looksVariant1(x) && !eMalattiaNota(x));
}
// «metti la sorella portatrice di …», «segna il padre affetto da …» = descrizione, non aggiunta
function mettiComeDescrizione(t) {
  return t.replace(/^\s*(?:metti|mettere|metto|segna|segnare|segno|imposta|impostare|rendi|fai)\s+((?:il|lo|la|l'|i|gli|le)\s*\S.*?)\s+(?=(?:portat(?:ore|rice|ori|rici)|affett[oaie]|eterozigot[ei]|omozigot[ei]|emizigot[ei]|positiv[oaie]|negativ[oaie]|san[oaie]|decedut[oaie]|malat[oaie])(?![\p{L}]))/iu, '$1 è ');
}

// ---------- «elimina la voce X», «togli X» senza persona ----------
function tryRimuoviVoce(S, sub, ctx, R) {
  const m = /^(?:rimuovi|rimuovere|togli|togliere|elimina|eliminare|cancella|cancellare|leva|levare)\s+(?:(?:la|il|lo|l'|le|i|gli|quella|quel)\s*)?(?:(voce|voci|condizione|malattia|patologia|diagnosi|variante|mutazione|stato\s+di\s+portatore|portatore|portatrice|etichetta|scritta|dicitura)\s+)?(.+)$/i.exec(sub.trim());
  if (!m) return false;
  const nome = !!m[1];
  let resto = m[2].trim();
  // persona eventualmente indicata in coda: «… dal probando», «… alla madre»
  let ids = null;
  const reP = /\s+(?:a|al|alla|allo|ai|alle|agli|da|dal|dalla|dallo|dai|dalle|dagli|per|nel|nella)\s+(?=\S)/gi;
  let mm, ultimo = null;
  while ((mm = reP.exec(resto))) ultimo = mm;
  if (ultimo) {
    const coda = resto.slice(ultimo.index + ultimo[0].length);
    const T = tokenize(coda);
    if (startsRef(T, 0)) { try { const r = parseRef(T, 0, R); if (r && r.j >= T.length) { const x = resolveRef(S, r, ctx, R, false); if (x.length) { ids = x; resto = resto.slice(0, ultimo.index).trim(); } } } catch (e) {} }
  }
  if (!nome && !ids && startsRef(tokenize(resto), 0)) return false;
  let cosa = resto.replace(/^[«"“']+|[»"”']+$/g, '').replace(/^(?:di|del|della|dello|dei|delle)\s+/i, '').trim();
  if (!cosa) return false;
  const cl = lowA(cosa), cs = lowA(togliAvverbi('di ' + cosa).replace(/^di\s+/, ''));
  const vq = lowA(normVariant(cosa));
  const simile = n => { const x = lowA(n || ''); return !!x && (x === cl || x === cs || condMatches(cosa, n) || condMatches(cs, n) || (cl.length >= 4 && x.includes(cl))); };
  const trovati = [];
  const persone = ids || Object.keys(S.people);
  persone.forEach(id => {
    const p = S.people[id]; if (!p) return;
    const c = p.conditions.filter(x => simile(x.name)).map(x => x.name);
    const k = p.carriers.filter(x => x && simile(x));
    const v = (p.variants || []).filter(x => x.text !== 'test' && (lowA(x.text) === vq || simile(x.text) || lowA(x.text).startsWith(vq + ' '))).map(x => x.text);
    if (c.length || k.length || v.length) trovati.push({ id, c, k, v });
  });
  if (!trovati.length) {
    if (nome || ids) throw new UErr(`Non trovo la voce «${cosa}»${ids ? ' per ' + ids.map(i => '⟨' + i + '⟩').join(', ') : ' nel pedigree'}.`);
    return false;
  }
  if (trovati.length > 1 && !ids) {
    R.asks.push({ text: `«${cosa}» compare in più persone: da chi la tolgo?`, options: trovati.map(t => ({ label: `⟨${t.id}⟩`, cmd: `rimuovi la voce «${cosa}» da @${t.id}` })).concat([{ label: 'da tutti', cmd: trovati.map(t => `rimuovi la voce «${cosa}» da @${t.id}`).join('; '), keys: ['tutti', 'tutte', 'ovunque'] }]) });
    return true;
  }
  const tolti = [];
  trovati.forEach(t => {
    const p = S.people[t.id];
    p.conditions = p.conditions.filter(x => !t.c.includes(x.name));
    p.carriers = p.carriers.filter(x => !t.k.includes(x));
    p.variants = (p.variants || []).filter(x => !t.v.includes(x.text));
    tolti.push(...t.c, ...t.k, ...t.v);
    R.touched.add(t.id);
  });
  pruneConditions(S);
  const chi = trovati.map(t => t.id);
  R.log.push({ type: 'ok', text: `Tolto ${[...new Set(tolti)].map(x => '«' + x + '»').join(', ')} a ${chi.map(i => '⟨' + i + '⟩').join(', ')}`, ids: chi });
  ctx.lastTouched = chi;
  return true;
}

// ---------- domande in sospeso e risposte brevi ----------
const RISP_SI = /^(?:si|s|certo|esatto|confermo|ok|okay|va bene|giusto|corretto|yes|affermativo|si grazie|procedi|fallo|si certo|certamente)$/;
const RISP_NO = /^(?:no|nessuno|nessuna|niente|lascia|lascia stare|lascia cosi|non serve|no grazie|non ora|lascia perdere)$/;
const STOP_RISP = new Set(['la', 'il', 'lo', 'l', 'una', 'un', 'uno', 'di', 'del', 'della', 'e', 'ed', 'tipo', 'quella', 'quello', 'opzione', 'scelta', 'direi', 'credo', 'forse', 'allora', 'era', 'una', 'traslocazione', 'cromosomi', 'cromosoma', 'tra', 'fra']);
function normRisp(s) { return lowA(String(s || '')).replace(/⟨p\d+⟩/g, ' ').replace(/[«»"“”'’()\[\].,:!?–—\-→>]/g, ' ').replace(/\s+/g, ' ').trim(); }
function crDi(s) { return (normRisp(s).replace(/;/g, ' ').match(/(?<![a-z\d])(?:\d{1,2}|x|y)(?![a-z\d])/g) || []); }
function abbinaRisposta(pend, input) {
  const raw = String(input || '').trim();
  if (!raw || /@p\d/.test(raw)) return null;
  let a = normRisp(raw).replace(/;/g, ' ');
  if (a.split(' ').length > 7) return null;
  const asks = (pend.asks || []).filter(x => x && x.options);
  for (const ask of asks) {
    const opts = ask.options;
    const base = { ask };
    const kSi = o => /^si\b/.test(normRisp(o.label)) || (o.keys || []).some(k => normRisp(k) === 'si'), kNo = o => /^no\b/.test(normRisp(o.label)) || (o.keys || []).some(k => normRisp(k) === 'no');
    if (RISP_SI.test(a)) { const o = opts.find(kSi) || (opts.length === 1 ? opts[0] : null); if (o) return Object.assign(base, { cmd: o.cmd, label: o.label, forte: true }); continue; }
    if (RISP_NO.test(a)) { const o = opts.find(kNo); if (o) return Object.assign(base, { cmd: o.cmd, label: o.label, forte: true }); return Object.assign(base, { dismiss: true, forte: true }); }
    const a2 = a.replace(/^(?:si|e|direi|credo|forse|allora|ok)\s+(?=\S)/, '');
    const nessunaCifra = opts.every(o => !/\d/.test(normRisp(o.label)));
    const om = /^(?:la |il |l |lo )?(prim|second|terz|quart|quint|sest|ultim)[oaie]?(?: opzione| scelta| risposta)?$/.exec(a2) || (nessunaCifra ? /^(?:opzione |numero )?([1-9])$/.exec(a2) : null);
    if (om) { const I = { prim: 0, second: 1, terz: 2, quart: 3, quint: 4, sest: 5, ultim: opts.length - 1 }; const i = /^\d$/.test(om[1]) ? +om[1] - 1 : I[om[1]]; if (opts[i]) return Object.assign(base, { cmd: opts[i].cmd, label: opts[i].label, forte: true }); }
    const ca = crDi(a2);
    if (ca.length >= 1 && !nessunaCifra) {
      const tops = opts.filter(o => { const co = crDi(o.label.split(/\s+[–-]\s+/)[0]); return co.length === ca.length && ca.every(x => co.includes(x)); });
      if (tops.length === 1) return Object.assign(base, { cmd: tops[0].cmd, label: tops[0].label, forte: true });
    }
    const aw = a2.split(' ').filter(w => w && !STOP_RISP.has(w));
    if (aw.length) {
      const score = o => {
        const lab = normRisp(o.label), lw = lab.split(' ').concat(...(o.keys || []).map(k => normRisp(k).split(' ')));
        if (lab === aw.join(' ') || (o.keys || []).some(k => normRisp(k) === aw.join(' '))) return 3;
        if (aw.every(w => lab.split(' ').includes(w))) return 2;
        if (aw.every(w => lw.some(x => (w.length >= 2 && x.startsWith(w)) || (w.length >= 5 && x.length >= 5 && dl(w, x) <= 1)))) return 1;
        return 0;
      };
      const sc = opts.map(score), best = Math.max(0, ...sc);
      if (best > 0) {
        const tops = opts.filter((o, i) => sc[i] === best);
        if (tops.length === 1) return Object.assign(base, { cmd: tops[0].cmd, label: tops[0].label, forte: best >= 2 });
        return Object.assign(base, { narrow: { text: ask.text, options: tops, open: ask.open || null }, forte: best >= 2 });
      }
    }
    if (ask.open) return Object.assign(base, { cmd: rispostaAperta(ask.open, raw), label: raw, forte: false, aperta: true });
  }
  return null;
}
function rispostaAperta(open, raw) {
  let ans = raw.trim().replace(/[.!?]+$/, '');
  const l = lowA(ans);
  if (open.kind === 'crpair') { const m = /(?<![\w.])(\d{1,2}|x|y)\s*(?:;|,|\/|-|e|ed|con|\s)\s*(\d{1,2}|x|y)(?![\w.])/.exec(l); if (m) ans = `tra il cromosoma ${m[1].toUpperCase()} e il ${m[2].toUpperCase()}`; }
  else if (open.kind === 'cr') { const m = /(?<![\w.])(\d{1,2}|x|y)(?![\w.])/.exec(l); if (m) ans = `del cromosoma ${m[1].toUpperCase()}`; }
  return open.tmpl.replace('{ans}', ans).replace(/\s+/g, ' ').trim();
}
function nuovoR() { return { log: [], fixes: [], created: new Set(), touched: new Set(), implicit: [], undo: false, reset: false, asks: [] }; }
function run(S, input, labels, memo) {
  const pend = memo && memo.pending && (memo.pending.asks || []).length ? memo.pending : null;
  let risp = null;
  if (pend && !eAnnulla(input)) {
    const m = abbinaRisposta(pend, input);
    if (m) {
      let usa = m.forte;
      if (!usa) {
        try {
          const prova = run1(JSON.parse(JSON.stringify(S)), input, labels, memo ? JSON.parse(JSON.stringify(memo)) : null);
          usa = !prova.undo && !prova.reset && !prova.log.some(l => l.type === 'ok') && !(prova.asks || []).length;
        } catch (e) { usa = true; }
      }
      if (usa) risp = m;
    }
  }
  if (risp && (risp.dismiss || risp.narrow)) {
    const R = nuovoR();
    if (risp.dismiss) { R.log.push({ type: 'ok', text: 'Va bene, lascio com’è.' }); R.answered = { text: risp.ask.text, label: 'no' }; }
    else R.asks.push(Object.assign({}, risp.narrow, { text: 'Intendi…? (' + risp.ask.text.replace(/\?$/, '') + ')' }));
    R.memo = Object.assign({}, memo || {}, { pending: risp.narrow ? { asks: [risp.narrow], age: 0 } : null });
    return R;
  }
  const R = run1(S, risp ? risp.cmd : input, labels, memo);
  if (risp) { R.answered = { text: risp.ask.text, label: risp.label }; R.log.unshift({ type: 'ans', text: `Risposta a «${risp.ask.text.replace(/⟨(p\d+)⟩/g, '⟨$1⟩')}»: ${risp.label}` }); }
  const nuove = (R.asks || []).filter(a => a && a.options);
  R.memo.pending = nuove.length ? { asks: nuove.map(a => ({ text: a.text, options: a.options.map(o => ({ label: o.label, cmd: o.cmd, keys: o.keys })), open: a.open || null })), age: 0 }
    : (pend && !risp && !R.undo && !R.reset && !/@p\d/.test(input) && (pend.age || 0) < 2 ? Object.assign({}, pend, { age: (pend.age || 0) + 1 }) : null);
  return R;
}
function uniscilista(clausole) {
  // «portatrice di CFTR F508del, HBB cod39 e GJB2 35delG»: la virgola non separa le varianti dell'elenco
  const out = [];
  for (const c of clausole) {
    const prev = out.length ? lowA(out[out.length - 1]) : '';
    const pezzi = c.split(/\s*,\s*|\s+e\s+|\s+ed\s+/).map(x => x.replace(/^(?:di|per)\s+/i, '').trim()).filter(Boolean);
    if (prev && /(?<![a-z])(?:portat|eterozigot|omozigot|positiv|negativ)/.test(prev) && pezzi.length && pezzi.every(x => looksVariant(x) && !eMalattiaNota(x))) out[out.length - 1] += ', ' + c;
    else if (prev && /^(?:(?:ancora|per ora|al momento|attualmente)\s+)?(?:a|pre)?sintomatic[oaie]$|^(?:ancora\s+)?san[oaie]$|^senza\s+sintomi$|^con\s+sintomi$/.test(lowA(c).trim()) && REP_TRIG.test(prev)) out[out.length - 1] += ', ' + c;
    else out.push(c);
  }
  return out;
}
function elencoPortatore(t) {
  // «portatrice di X, di Y e di Z» → «portatrice di X, Y e Z»
  return t.replace(/((?:portat(?:ore|rice|ori|rici)|eterozigot[ei]|positiv[oaie])\s+(?:san[oaie]\s+)?(?:di|per)\s+)([^;.\n]+)/gi, (m, a, b) => a + b.replace(/(,|\s+e|\s+ed)\s+(?:di|per|del|della)\s+(?=\S)/gi, '$1 '));
}
const NOTA_GEN_RE = /^\s*(?:(?:aggiungi|aggiungo|metti|scrivi|inserisci)\s+(?:una\s+|la\s+|nelle\s+)?)?(?:nota|note|annotazione|annotazioni|commento)\s+(?:general[ei]|dell'albero|del\s+pedigree|della\s+famiglia|in\s+basso|a\s+pi[eè]\s+di\s+pagina)(?![\p{L}])/iu;
function run1(S, input, labels, memo) {
  input = String(input || '');
  // la nota generale resta una frase sola: virgole, punti e «e» non la spezzano
  if (NOTA_GEN_RE.test(input)) input = input.replace(/\n+/g, ' / ').replace(/,/g, '\u201A').replace(/;/g, '\u204F').replace(/\.(?=\s|$)/g, '\u2024').replace(/\s(e|ed|poi|inoltre)\s/gi, ' \u2063$1\u2063 ');
  else input = elencoPortatore(input);
  const R0 = nuovoR();
  input = estraiConferme(S, input, R0);
  if (S.vocab) aggiungiVocabolario(S.vocab);
  const prima = fotoVoci(S);
  _fixVar = [];
  try {
    const R = input.trim() ? run0(S, input, labels, memo) : Object.assign(nuovoR(), { memo: Object.assign({}, memo || {}, { pending: null }) });
    if (R0.log.length) R.log.unshift(...R0.log);
    if (R0.vocabNuovo) R.vocabNuovo = R0.vocabNuovo;
    if (!R.undo && !R.reset) controllaRealta(S, prima, R);
    if (_fixVar.length) {
      const f = _fixVar.filter(([a, b], i) => _fixVar.findIndex(x => x[0] === a) === i);
      const txt = 'Variante riconosciuta: ' + f.map(([a, b]) => `${a} → ${b}`).join(', ');
      if (!R.log.some(l => l.text === txt)) R.log.unshift({ type: 'fix', text: txt });
    }
    return R;
  } finally { _fixVar = null; }
}

// ---------- colori dei portatori: ogni condizione o gene portato ha il suo colore ----------
const PALETTE_PORT = ['#C2551F', '#2E8B57', '#8A4FBF', '#C23B6E', '#1F6FB2', '#8C6D1F', '#2A9D8F', '#A0522D', '#5B6B7A'];
function geneChiave(t) { const g = geneDi(t); return g && GENI_VAR.has(geneCanon(g)) ? geneCanon(g) : (g || String(t)); }
function coloreMalattiaDaGene(S, t) { const g = geneDi(t); const n = GENE_MALATTIA[g] || GENE_MALATTIA[geneCanon(g)] || (geneCanon(g) === 'HBA' ? GENE_MALATTIA.HBA1 : null); const c = n && S.conditions.find(x => x.name === n || condMatches(n, x.name)); return c ? c : null; }
function mappaPortatori(S) {
  // gene → { colore, varianti[] } per le varianti portate che non hanno già una malattia in legenda
  const usati = new Set(S.conditions.map(c => c.color.toLowerCase()));
  const out = {}; let k = 0;
  Object.keys(S.people).sort((a, b) => (+a.slice(1) || 0) - (+b.slice(1) || 0)).forEach(id => {
    (S.people[id].variants || []).filter(v => v.carrier && !v.neg && v.text !== 'test').forEach(v => {
      if (coloreMalattiaDaGene(S, v.text)) return;
      const g = geneChiave(v.text);
      if (!out[g]) { let col; do { col = PALETTE_PORT[k++ % PALETTE_PORT.length]; } while (usati.has(col.toLowerCase()) && k < 40); out[g] = { colore: col, varianti: [] }; }
      if (!out[g].varianti.includes(v.text)) out[g].varianti.push(v.text);
    });
  });
  return out;
}
function portatoriDi(S, p, mappa) {
  // elenco di ciò che la persona porta, un colore per voce, senza doppioni
  mappa = mappa || mappaPortatori(S);
  const out = [];
  const add = (key, label, color) => { if (!out.some(x => x.color === color && x.key === key) && !out.some(x => x.color === color)) out.push({ key, label, color }); };
  p.carriers.filter(Boolean).forEach(c => { const cc = S.conditions.find(x => x.name === c); add(c, c, cc ? cc.color : '#4A5563'); });
  (p.variants || []).filter(v => v.carrier && !v.neg && v.text !== 'test').forEach(v => {
    const cm = coloreMalattiaDaGene(S, v.text);
    if (cm) add(cm.name, v.text, cm.color);
    else { const g = geneChiave(v.text); add(g, v.text, (mappa[g] || {}).colore || '#4A5563'); }
  });
  if (!out.length && p.carriers.includes('')) out.push({ key: '', label: 'portatore', color: '#4A5563' });
  return out;
}
/* <<< dialogo */

/* ---------- command runner ---------- */
function verbOf(t, list, R) {
  if (!t) return null;
  if (list.includes(t.t)) return t.t;
  if (t.t.length >= 5) { const f = fuzzyPick(t.t, list); if (f) { R.fixes.push([t.raw, f]); return f; } }
  return null;
}
function domandeDa(e, frase) {
  const esc = w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = w => new RegExp('(?<![\\p{L}])' + w.split(/\s+/).map(x => esc(x).replace(/a/g, '[aàá]').replace(/e/g, '[eèé]')).join("[\\s']+") + '(?![\\p{L}])', 'iu');
  if (e.askReplace) {
    if (e.askReplace.whole) {
      const rw = e.askReplace.wholeRe ? new RegExp('(?<![\\p{L}])' + e.askReplace.wholeRe + '(?![\\p{L}])', 'iu') : /(?<![\p{L}])(?:un[oa]?|il|la|lo|l')?\s*(?:prozi[oa]|prozii|prozie)(?:\s+(?:paterno|paterna|materno|materna))?(?![\p{L}])/iu;
      return e.askReplace.options.map(o => ({ label: o, cmd: frase.replace(rw, ' ' + o) }));
    }
    const re = pattern(e.askReplace.word);
    if (!re.test(frase)) return [];
    return e.askReplace.options.map(o => ({ label: o, cmd: frase.replace(re, o) }));
  }
  if (e.askPick) {
    let parole = e.askPick.phrase.split(' ').filter(w => !/^(il|lo|la|i|gli|le)$/.test(w));
    const prova = ws => new RegExp("(?<![\\p{L}@])(?:(?:il|lo|la|l'|i|gli|le)\\s*)?" + ws.map(x => esc(lowA(x))).join("[\\s']+") + '(?![\\p{L}])', 'iu');
    if (!prova(parole).test(lowA(frase)) && e.askPick.raw) parole = e.askPick.raw.split(' ').filter(w => !/^(il|lo|la|l'|i|gli|le)$/i.test(w));
    const re = new RegExp("(?<![\\p{L}@])(?:(?:il|lo|la|l'|i|gli|le)\\s*)?" + parole.map(x => esc(x)).join("[\\s']+") + '(?![\\p{L}])', 'iu');
    if (!re.test(lowA(frase))) return [];
    const m = re.exec(lowA(frase));
    return e.askPick.ids.map(id => ({ label: '⟨' + id + '⟩', cmd: frase.slice(0, m.index) + '@' + id + frase.slice(m.index + m[0].length) }));
  }
  return [];
}
function run0(S, input, labels, memo) {
  const R = { log: [], fixes: [], created: new Set(), touched: new Set(), implicit: [], undo: false, reset: false, asks: [] };
  const alive = a => (a || []).filter(id => S.people[id]);
  const ctx = { addAnchor: null, lastAdded: alive(memo && memo.lastAdded), subIdx: (memo && memo.subIdx) || 0, lastTouched: alive(memo && memo.lastTouched), recent: alive(memo && memo.recent), pending: [] };
  Object.defineProperty(ctx, 'lastTouched', { get() { return this._lt || []; }, set(v) { this._lt = v; this._ltRun = true; (v || []).forEach(id => { this.recent = this.recent.filter(x => x !== id); this.recent.push(id); }); if (this.recent.length > 20) this.recent = this.recent.slice(-20); } });
  ctx._lt = alive(memo && memo.lastTouched);
  ctx.focusCond = (memo && memo.focusCond) || ''; ctx.focusVar = (memo && memo.focusVar) || '';
  ctx.pov = memo && memo.pov && S.people[memo.pov] ? memo.pov : null;
  R.ctx = ctx;
  let primaVerifica = new Set();
  try { primaVerifica = new Set(verifica(S).map(v => v.key)); } catch (e) {}
  const queue = uniscilista(uniscicito(uniscicontinuazioni(splitClauses(input.normalize('NFC')))));
  let guard = 0;
  while (queue.length && guard++ < 80) {
    const c = queue.shift();
    const fixStart = R.fixes.length;
    try { clause(S, c, ctx, R, queue, labels); if (R.undo) { R.rest = queue.splice(0).join('; '); break; } }
    catch (e) {
      if (e instanceof UErr && (e.askReplace || e.askPick)) {
        const opts = domandeDa(e, c);
        if (opts.length) { R.asks.push({ text: e.message, options: opts }); continue; }
      }
      if (e instanceof UErr) R.log.push({ type: 'err', text: e.message });
      else { R.log.push({ type: 'err', text: 'Errore interno su «' + c + '»: ' + e.message }); if (typeof console !== 'undefined') console.error(e); }
    }
    void fixStart;
  }
  try {
    for (const v of verifica(S)) if (!primaVerifica.has(v.key)) { R.log.push({ type: v.level === 'warn' ? 'warn' : 'tip', text: v.text, ids: [v.id] }); if (v.ask) R.asks.push(v.ask); }
  } catch (e) { if (typeof console !== 'undefined') console.error(e); }
  R.memo = { lastAdded: ctx.lastAdded.slice(), subIdx: ctx.subIdx, lastTouched: ctx.lastTouched.slice(), recent: ctx.recent.slice(), focusCond: ctx.focusCond, focusVar: ctx.focusVar, pov: ctx.pov || null };
  if (R.fixes.length) {
    const seen = new Set();
    const f = R.fixes.filter(([a, b]) => { const k = a + b; if (seen.has(k) || lowA(a) === b) return false; seen.add(k); return true; });
    if (f.length) R.log.unshift({ type: 'fix', text: 'Corretto: ' + f.map(([a, b]) => `${a} → ${b}`).join(', ') });
  }
  return R;
}

function clause(S, raw, ctx, R, queue, labels) {
  if (eAnnulla(raw)) { R.undo = true; return; }
  raw = mettiComeDescrizione(togliAvverbi(raw));
  let text = correggiTermini(preNormalizza(raw.trim()), R);
  let same = false;
  const sm = /^(?:(?:e|ed)\s+)?(?:anche|pure|idem(?:\s+per)?|stessa cosa (?:per|vale per)|lo stesso(?: vale)? per|vale lo stesso per|vale anche per)\s+(?!aggiung|inserisc|rimuov|elimin|togli)/i.exec(text);
  if (sm) { same = true; text = text.slice(sm[0].length); }
  if (/^(?:allora|dunque|ok|okay|bene|quindi|anzi|scusa|scusate|correggo|correzione|in realt[aà]|ecco|no|si|sì)[.!?]*$/i.test(text.trim())) return;
  text = text.replace(/^(?:e|ed|poi|inoltre|e poi|infine|quindi)\s+/i, '').replace(/^(tutti|tutte)\s+(?=(?:i|gli|le)\s)/i, '').trim();
  if (!text) return;
  const lowt = lowA(text);
  if (/^(annulla|undo|indietro)$/.test(lowt)) { R.undo = true; return; }
  if (/^(cancella tutto|ricomincia|azzera|nuovo(?: pedigree| albero)?)$/.test(lowt)) { R.reset = true; return; }
  if (/^(?:nessuna|non\s+c'?\s*e|assenza\s+di|esclusa|negata|nega)\s+(?:la\s+)?consanguineit|^consanguineita\s+(?:negata|esclusa|assente)|^non\s+consanguinei$/.test(lowt)) {
    const u = parentU(S, S.probandId);
    if (u) u.consang = false;
    R.log.push({ type: 'ok', text: 'Nessuna consanguineità tra i genitori ' + withPrep('di', S, S.probandId) });
    return;
  }
  // consanguinity
  if (/consanguine|cugin[ie]\s+(?:prim|second|di prim|di second)|(?:prim|second)i\s+cugini/.test(lowt) && /genitori|matrimonio|coppia/.test(lowt)) {
    let anchor = S.probandId;
    const mm = /genitori\s+(?:del|della|dello|di)\s+(.+?)\s+(?:sono|e|erano|risultano)\b/.exec(lowt);
    if (mm) { const T2 = tokenize(substituteRefs(S, mm[1], labels)); const r = parseRef(T2, 0, R); if (r) { const ids = resolveRef(S, r, ctx, R, true); if (ids[0]) anchor = ids[0]; } }
    const neg = /non\s+(?:sono\s+)?consanguine/.test(lowt);
    const u = ensureParents(S, anchor, R);
    u.consang = !neg;
    R.touched.add(u.a); R.touched.add(u.b);
    R.log.push({ type: 'ok', text: (neg ? 'Tolta' : 'Segnata') + ' la consanguineità tra i genitori ' + withPrep('di', S, anchor), ids: [u.a, u.b] });
    return;
  }
  // «il caso indice» = probando
  text = text.replace(/(?<![\p{L}])(?:il\s+|la\s+)?(?:caso|paziente)\s+indice(?![\p{L}])/giu, 'il probando');
  // «variante del probando è X», «mutazione della madre: X», «diagnosi del probando fibrosi cistica», «variante familiare X»
  {
    const subN = substituteRefs(S, text, labels);
    const TN = tokenize(subN.replace(/[:=]/g, ' '));
    let k = 0;
    if (TN[k] && DEF.has(TN[k].t)) k++;
    const NOUNV = /^(variante|varianti|mutazione|mutazioni|genotipo|alterazione|alterazioni)$/, NOUNC = /^(diagnosi|malattia|patologia|condizione|sindrome)$/;
    if (TN[k] && (NOUNV.test(TN[k].t) || NOUNC.test(TN[k].t)) && TN[k + 1]) {
      const kind = NOUNV.test(TN[k].t) ? 'V' : 'C'; k++;
      while (TN[k] && /^(genetica|patogenetica|patogena|identificata|riscontrata|trovata|nota|causativa|clinica|principale)$/.test(TN[k].t)) k++;
      let ids = null;
      if (TN[k] && /^(familiare|famigliare)$/.test(TN[k].t)) { ids = [S.probandId]; k++; }
      else if (TN[k] && (OF.has(TN[k].t) || TN[k].t === 'nella' || TN[k].t === 'in') && TN[k + 1] && TN[k + 1].t === 'famiglia') { ids = [S.probandId]; k += 2; }
      else if (TN[k] && OF.has(TN[k].t) && startsRef(TN, k + 1)) { const r = parseRef(TN, k + 1, R); if (r) { ids = resolveRef(S, r, ctx, R, true); k = r.j; } }
      while (TN[k] && /^(e|sono|risulta|risultano|consiste|presenta)$/.test(TN[k].t)) k++;
      if (ids && ids.length && TN[k]) {
        const val = subN.replace(/[:=]/g, ' ').slice(TN[k].s);
        const A = withCome(S, ctx, R, val, x => parseAttrs((kind === 'V' ? 'positivo per ' : 'affetto da ') + x));
        return doModify(S, ids, A, ctx, R, null);
      }
    }
  }
  // age at diagnosis appended in a separate clause
  const dxm = /^(?:diagnosticat[oaie]|diagnosi|esordio)\s+(?:a|ad|all'eta di|all'eta|nel|a circa)\s+(\d{1,3})/.exec(lowt);
  if (dxm && ctx.lastTouched.length) {
    const p = S.people[ctx.lastTouched[ctx.lastTouched.length - 1]];
    if (p && p.conditions.length) { p.conditions[p.conditions.length - 1].age = dxm[1]; R.touched.add(p.id); R.log.push({ type: 'ok', text: `Età alla diagnosi ${dxm[1]} anni per ⟨${p.id}⟩`, ids: [p.id] }); return; }
  }
  const sub = substituteRefs(S, text, labels);
  if (tryNoteGenerali(S, text, ctx, R)) return;
  if (tryPuntoDiVista(S, sub, ctx, R)) return;
  if (!/^(?:rimuovi|togli|elimina|cancella)\b/i.test(sub) && tryRipetizioni(S, sub, ctx, R)) return;
  if (!/^(?:rimuovi|togli|elimina|cancella)\b/i.test(sub) && tryModo(S, sub, ctx, R)) return;
  if (!/^(?:rimuovi|togli|elimina|cancella)\b/i.test(sub) && tryCito(S, sub, ctx, R)) return;
  if (!/^(?:rimuovi|togli|elimina|cancella)\b/i.test(sub) && tryRepro(S, sub, ctx, R)) return;
  if (trySelector(S, sub, ctx, R)) return;
  const T = tokenize(sub);
  if (!T.length) return;
  let j = 0;
  // rename: "chiama X Nome"
  if (/^(chiama|rinomina)$/.test(T[0].t)) {
    const r = parseRef(T, 1, R);
    if (r && T[r.j]) {
      const ids = resolveRef(S, r, ctx, R, false);
      const nm = cap(sub.slice(T[r.j].s).replace(/^(come|con il nome|col nome)\s+/i, '').trim());
      if (!ids.length) throw new UErr(`Non trovo «${r.text}» nel pedigree.`);
      ids.forEach(id => { S.people[id].name = nm; R.touched.add(id); });
      ctx.lastTouched = ids;
      R.log.push({ type: 'ok', text: `Nome ${nm} per ⟨${ids[0]}⟩`, ids });
      return;
    }
  }
  if (verbOf(T[0], REMV, R) && tryRimuoviVoce(S, sub, ctx, R)) return;
  // «togli la talassemia alla madre», «rimuovi il diabete dal padre», «togli la nota alla zia»
  if (verbOf(T[0], REMV, R)) {
    const mm = /^\S+\s+(?:(?:il|lo|la|l'|i|gli|le|un|una)\s*)?(.+?)\s+(?:(?:alla|allo|alle|agli|al|ai|a|dalla|dallo|dalle|dagli|dal|dai|da|per|della|dello|delle|degli|del|dei|di)\s+|(?:all|dall|dell)')(.+)$/i.exec(sub);
    if (mm && !startsRef(tokenize(mm[1]), 0)) {
      const ids = refIdsFromText(S, ctx, R, mm[2]);
      const cosa = mm[1].trim(), lc = lowA(cosa);
      let fatto = [];
      ids.forEach(id => {
        const p = S.people[id];
        if (/^(malattia|malattie|diagnosi|patologia|patologie|condizione|condizioni|affezione)$/.test(lc)) { if (p.conditions.length) fatto.push('malattie'); p.conditions = []; }
        else if (/^(nota|note)$/.test(lc)) { p.note = ''; fatto.push('nota'); }
        else if (/^(nome)$/.test(lc)) { p.name = ''; fatto.push('nome'); }
        else if (/^(eta)$/.test(lc)) { p.age = ''; fatto.push('età'); }
        else if (/^(decesso|morte)$/.test(lc)) { p.deceased = false; p.deathAge = ''; fatto.push('decesso'); }
        else if (/^(gemellarita|gemello|gemella)$/.test(lc)) { applyAttrs(S, id, { conditions: [], carriers: [], untwin: true }, R); fatto.push('gemellarità'); }
        else if (/^(portatore|punto|stato di portatore|portatrice)$/.test(lc)) { p.carriers = []; p.variants = (p.variants || []).filter(v => !v.carrier); fatto.push('stato di portatore'); }
        else if (/^(variante|varianti|mutazione|mutazioni)$/.test(lc)) { p.variants = []; fatto.push('varianti'); }
        else if (looksVariant(cosa) && !eMalattiaNota(cosa)) { const t = lowA(normVariant(cosa)); const n0 = (p.variants || []).length; p.variants = (p.variants || []).filter(v => !(lowA(v.text) === t || lowA(v.text).startsWith(t + ' ') || t.startsWith(lowA(v.text)))); if (p.variants.length < n0) fatto.push(cosa); }
        else {
          const n0 = p.conditions.length + p.carriers.length;
          p.conditions = p.conditions.filter(c => !condMatches(malattiaCanonica(cosa), c.name) && !condMatches(cosa, c.name));
          p.carriers = p.carriers.filter(c => !c || (!condMatches(malattiaCanonica(cosa), c) && !condMatches(cosa, c)));
          if (p.conditions.length + p.carriers.length < n0) fatto.push(cosa);
        }
        R.touched.add(id);
      });
      pruneConditions(S);
      if (!fatto.length) throw new UErr(`Non risulta «${cosa}» per ${ids.map(i => '⟨' + i + '⟩').join(', ')}.`);
      R.log.push({ type: 'ok', text: `Tolto «${cosa}» a ${ids.map(i => '⟨' + i + '⟩').join(', ')}`, ids });
      ctx.lastTouched = ids;
      return;
    }
  }
  // remove
  if (verbOf(T[0], REMV, R)) {
    const r = parseRef(T, 1, R);
    if (!r) throw new UErr(`Non ho capito chi eliminare in «${text}». Esempio: «rimuovi la seconda sorella».`);
    const ids = resolveRef(S, r, ctx, R, false);
    if (!ids.length) throw new UErr(`Non trovo «${r.text}» nel pedigree.`);
    const labs = ids.map(i => `⟨${i}⟩`).join(', '); const remSex = S.people[ids[0]].sex;
    const errs = [];
    ids.slice().reverse().forEach(id => { const e = removePerson(S, id); if (e) errs.push(e); });
    const ok = ids.filter(id => !S.people[id]);
    if (ok.length) R.log.push({ type: 'ok', text: `Eliminat${agr(remSex, ok.length)} ${r.text}`, ids: [] });
    errs.forEach(e => R.log.push({ type: 'err', text: e }));
    void labs;
    ctx.lastTouched = [];
    return;
  }
  {
    const pezzi = lowA(sub).split(/\s*,\s*|\s+e\s+|\s+ed\s+/).map(x => x.trim()).filter(Boolean);
    if (pezzi.length && pezzi.every(x => eMalattiaNota(x) || /^(?:k|ca|neo)\s+\S+/.test(x) && malattiaCanonica(x).startsWith('Tumore') || AGG_MALATTIA.some(([re]) => re.test(x)))) {
      const targets = ctx.lastTouched.length ? ctx.lastTouched.slice() : [S.probandId];
      return doModify(S, targets, parseAttrs('affetto da ' + sub), ctx, R, null);
    }
  }
  // frase senza soggetto che descrive l'ultima persona citata («, positiva per BRCA1», «affetta anche lei»)
  if (/^(?:gravida|incinta|in gravidanza|af{1,2}et{1,2}[oaie]|malat[oaie]|positiv|negativ|portat(?:ore|rice|ori|rici)|dece?dut|mort[oaie]\s|defunt|eterozigot|omozigot|emizigot|san[oaie](?:\s|$)|gemell|steril|infertil|separat|divorziat|adottat|dat[oaie] in adozione|di \d+ anni|concepit)/.test(lowA(sub))) {
    const targets = ctx.lastTouched.length ? ctx.lastTouched.slice() : [S.probandId];
    return doModify(S, targets, withCome(S, ctx, R, sub, parseAttrs), ctx, R, null);
  }
  // add verb
  let mode = null, subject = null;
  if (verbOf(T[0], ADDV, R)) { mode = 'add'; j = 1; if (T[j] && T[j].t === 'anche') j++; }
  else if (T[0].t === "c'" && T[1] && T[1].t === 'e') { mode = 'add'; j = 2; }
  else if (T[0].t === 'ci' && T[1] && T[1].t === 'sono') { mode = 'add'; j = 2; }
  else if (T[0].t === 'ha' || T[0].t === 'hanno') {
    j = 1; if (T[j] && (T[j].t === 'avuto' || T[j].t === 'anche')) j++; if (T[j] && T[j].t === 'anche') j++;
    if (startsNP(T, j)) { const anc = ctx.lastTouched.length ? ctx.lastTouched[ctx.lastTouched.length - 1] : (ctx.addAnchor || S.probandId); return doAdd(S, T, j, sub, ctx, R, queue, [anc]); }
    subject = ctx.lastTouched.length ? [ctx.lastTouched[ctx.lastTouched.length - 1]] : [S.probandId];
    return doModify(S, subject, withCome(S, ctx, R, sub.slice(T[j] ? T[j].s : sub.length), haveAttrs), ctx, R, 'ha');
  }
  if (mode === 'add') return doAdd(S, T, j, sub, ctx, R, queue, null);
  // «una delle cugine è sorda», «uno dei fratelli del padre è affetto»
  if (T[0] && /^(uno|una|un)$/.test(T[0].t) && T[1] && /^(dei|delle|degli|tra|fra)$/.test(T[1].t)) {
    let k = 2; if (/^(tra|fra)$/.test(T[1].t) && T[2] && /^(i|gli|le)$/.test(T[2].t)) k = 3;
    const T2 = T.slice(k);
    const r2 = parseRef(T2, 0, R);
    if (r2 && r2.chain.length) {
      r2.chain[0].pl = true;
      const cand = resolveRef(S, r2, ctx, R, false);
      if (!cand.length) throw new UErr(`Non trovo «${r2.text}» nel pedigree.`);
      let j2 = r2.j; while (T2[j2] && COP.has(T2[j2].t)) j2++;
      const tail2 = T2[j2] ? sub.slice(T2[j2].s) : '';
      const A2 = withCome(S, ctx, R, tail2, parseAttrs);
      const libero = cand.find(i => !A2.conditions.length || !S.people[i].conditions.some(c => A2.conditions.some(x => condMatches(x.name, c.name)))) || cand[0];
      return doModify(S, [libero], A2, ctx, R, null);
    }
  }
  // subset of last added
  const ss = trySubset(T, ctx);
  if (ss) {
    let k = ss.j; while (T[k] && COP.has(T[k].t)) k++;
    if (T[k] && (T[k].t === 'ha' || T[k].t === 'hanno')) {
      k++; if (T[k] && T[k].t === 'avuto') k++;
      if (startsNP(T, k)) return doAdd(S, T, k, sub, ctx, R, queue, ss.ids);
      return doModify(S, ss.ids, withCome(S, ctx, R, sub.slice(T[k] ? T[k].s : sub.length), haveAttrs), ctx, R, ss.label);
    }
    return doModify(S, ss.ids, withCome(S, ctx, R, T[k] ? sub.slice(T[k].s) : '', parseAttrs), ctx, R, ss.label);
  }
  // implicit add: indefinite / number + relation
  if (T[0] && (NUMW[T[0].t] != null || /^\d+$/.test(T[0].t) || fuzzyPick(T[0].t, NUMWORDS)) && startsNP(T, 0)) {
    const np = parseNP(T, 0, null).np;
    if (np.qty != null && /^(figlio|aborto)$/.test(np.r) && !ctx.addAnchor && ctx.lastTouched.length === 1) return doAdd(S, T, 0, sub, ctx, R, queue, [ctx.lastTouched[0]]);
    if (np.qty != null && np.r !== 'self') return doAdd(S, T, 0, sub, ctx, R, queue, null);
  }
  // reference + (copula) + attrs / have
  const r = parseRef(T, 0, R);
  if (!r) {
    // ultima possibilita': la frase e' solo una malattia o una variante («carcinoma mammario a 33 anni», «CFTR F508del»)
    const nuda = sub.replace(/\s+(?:a|ad|all'et[aà] di)\s+\d{1,3}\s*(?:anni|aa)?\s*$/i, '').replace(/^(?:una?|la|il|lo|l')\s+/i, '').trim();
    if (nuda && sembraMalattia(nuda)) {
    }
    if (nuda && (eMalattiaNota(nuda) || looksVariant(nuda) || malattiaCanonica(nuda) !== cap(nuda) || /^(?:tumore|tumori|cancro|carcinoma|ca|k|neo|neoplasia|adenocarcinoma|melanoma|linfoma|leucemia|sarcoma|mieloma|glioma|sindrome|malattia|morbo|distrofia|atrofia|deficit|deficienza|anemia|cardiomiopatia|miopatia|neuropatia|encefalopatia|epilessia|ritardo|disabilit[aà]|autismo|diabete|ipertensione|ipo\w+|iper\w+|insufficienza|malformazion\w*|cardiopatia)(?![\p{L}])/iu.test(nuda))) {
      const targets = ctx.lastTouched.length ? ctx.lastTouched.slice() : [S.probandId];
      const A = looksVariant(nuda) ? parseAttrs('positivo per ' + sub) : parseAttrs('affetto da ' + sub);
      if (hasAttrs(A)) return doModify(S, targets, A, ctx, R, null);
    }
    throw new UErr(`Non ho capito «${text}». Prova ad esempio «aggiungi due sorelle», «il padre è affetto da …», «rimuovi la zia paterna».`);
  }
  j = r.j;
  while (T[j] && COP.has(T[j].t)) j++;
  if (T[j] && (T[j].t === 'ha' || T[j].t === 'hanno' || T[j].t === 'aveva' || T[j].t === 'avevano')) {
    const plurale = /^(hanno|avevano)$/.test(T[j].t);
    const hj = j;
    j++; if (T[j] && (T[j].t === 'avuto' || T[j].t === 'anche')) j++; if (T[j] && T[j].t === 'anche') j++;
    const withPending = ids => { if (plurale && ctx.pending.length) ids = [...ctx.pending.filter(x => !ids.includes(x)), ...ids]; ctx.pending = []; return ids; };
    if (T[j] && /^(sposato|una|convissuto)$/.test(T[j].t) && /^(?:sposato|una relazione|avuto una relazione|convissuto)/.test(lowA(sub.slice(T[j].s)))) {
      const ids = withPending(resolveRef(S, r, ctx, R, true));
      return doModify(S, ids, withCome(S, ctx, R, 'ha ' + sub.slice(T[j].s).replace(/^convissuto/i, 'convive'), parseAttrs), ctx, R, r.text);
    }
    if (startsNP(T, j)) { const ids = withPending(resolveRef(S, r, ctx, R, true)); if (!ids.length) throw new UErr(`Non trovo «${r.text}».`); return doAdd(S, T, j, sub, ctx, R, queue, ids); }
    void hj;
    const ids = withPending(resolveRef(S, r, ctx, R, true));
    if (!ids.length) throw new UErr(`Non trovo «${r.text}» nel pedigree.`);
    return doModify(S, ids, withCome(S, ctx, R, sub.slice(T[j] ? T[j].s : sub.length), haveAttrs), ctx, R, r.text);
  }
  const ids = resolveRef(S, r, ctx, R, true);
  if (!ids.length) throw new UErr(`Non trovo «${r.text}» nel pedigree${r.chain.some(n => n.pl) ? '' : ''}.`);
  const self = r.chain.length === 1 && r.chain[0].r === 'self';
  if (self && r.chain[0].s === 'F' && S.people[S.probandId].sex === 'U') { S.people[S.probandId].sex = 'F'; R.touched.add(S.probandId); }
  const plural = T[r.j] && /^(sono|erano|risultano|hanno|avevano)$/.test(T[r.j].t);
  let merged = false;
  if (ctx.pending.length && plural) { ids.unshift(...ctx.pending.filter(x => !ids.includes(x))); merged = true; }
  ctx.pending = [];
  const tail = T[j] ? sub.slice(T[j].s) : '';
  const A = withCome(S, ctx, R, tail, parseAttrs);
  if (A.unparsed && !A.conditions.length && !A.variants.length && sembraMalattia(tail)) { const B = parseAttrs((looksVariant(tail.replace(/\s+(?:a|ad)\s+\d.*$/, '')) ? 'positivo per ' : 'affetto da ') + tail); if (B.conditions.length || B.variants.length) Object.assign(A, B); }
  const sameTail = /^\s*(?:pure|anche|idem|lo stesso|uguale|stessa cosa|anche lui|anche lei|anche loro)\s*$/i.test(lowA(tail))
    || (!tail.trim() && T.slice(r.j, j).some(t => t.t === 'pure' || t.t === 'anche'));
  if (!hasAttrs(A) && (same || sameTail) && ctx.lastAttrs) {
    return doModify(S, ids, sameAttrs(ctx.lastAttrs), ctx, R, merged ? null : r.text);
  }
  if (!hasAttrs(A)) {
    if (same && !ctx.lastAttrs) throw new UErr(`«anche» rimanda alla frase precedente, ma non c'è nulla da ripetere.`);
    if (!T[j]) ctx.pending = ids.slice();
    if (A.unparsed || tail.trim()) R.log.push({ type: 'warn', text: `Non ho capito «${(A.unparsed || tail).trim()}» riferito a ${r.text}.` });
    ids.forEach(id => R.touched.add(id));
    ctx.lastTouched = ids;
    return;
  }
  return doModify(S, ids, A, ctx, R, merged ? null : r.text);
}
function sameAttrs(A) {
  return { conditions: A.conditions.map(c => ({ name: c.name, age: '' })), carriers: A.carriers.slice(), variants: (A.variants || []).map(v => Object.assign({}, v)),
    carrierAny: A.carrierAny, healthy: A.healthy, deceased: A.deceased, deathAge: '', sex: null, name: null, age: '', adopted: false, pregnant: false, mz: null, unparsed: '' };
}
function takeCome(S, ctx, R, str) {
  const low = lowA(str);
  const m = /(?:^|\s)(?:cosi come|così come|esattamente come|proprio come|come|al pari di|uguale a)\s+(.+)$/.exec(low);
  if (!m) return { tail: str, extra: [] };
  const refStr = str.slice(low.length - m[1].length);
  const T = tokenize(refStr);
  const r = parseRef(T, 0, R);
  if (!r) return { tail: str, extra: [] };
  let k = r.j;
  while (T[k] && /^(e|anche|pure|del resto)$/.test(T[k].t)) k++;
  if (T[k]) return { tail: str, extra: [] };
  const ids = resolveRef(S, r, ctx, R, true);
  return { tail: str.slice(0, m.index), extra: ids };
}
function withCome(S, ctx, R, str, fn) {
  const c = takeCome(S, ctx, R, str);
  const A = fn(c.tail);
  A._extra = c.extra;
  if (c.extra.length && A.needCond && !A.conditions.length) { A.sameCond = { ids: c.extra }; A.needCond = false; A._extra = []; }
  else if (c.extra.length && (A.carrierAny || A.needVar) && !A.carriers.length && !A.variants.length) {
    if (variantsOf(S, c.extra).length) { A.sameVar = { ids: c.extra }; A.needVar = false; A.carrierAny = false; }
    else { const cs = []; c.extra.forEach(i => S.people[i].carriers.filter(Boolean).forEach(x => { if (!cs.includes(x)) cs.push(x); })); if (cs.length) { A.carriers.push(...cs); A.carrierAny = false; } }
    A._extra = [];
  }
  return A;
}
function refIdsFromText(S, ctx, R, text, create) {
  const t = (text || '').trim();
  if (!t) return null;
  const T = tokenize(t);
  const r = parseRef(T, 0, R);
  if (!r) throw new UErr(`Non capisco a chi si riferisce «${t}».`);
  const ids = resolveRef(S, r, ctx, R, !!create);
  if (!ids.length) throw new UErr(`Non trovo «${r.text}» nel pedigree.`);
  return ids;
}
function resolveRelational(S, ctx, R, A, ids) {
  const out = { askCond: null, askVar: null };
  const nomi = x => x.map(i => '⟨' + i + '⟩').join(', ');
  if (A.needCond || A.sameCond) {
    let pool, who = null;
    if (A.sameCond && A.sameCond.ids) { who = A.sameCond.ids; pool = conditionsOf(S, who); }
    else if (A.sameCond && A.sameCond.ref) { who = refIdsFromText(S, ctx, R, A.sameCond.ref); pool = conditionsOf(S, who); }
    else if (A.sameCond) { who = [S.probandId]; pool = conditionsOf(S, who); }
    else if (ctx.focusCond && familyConditions(S).includes(ctx.focusCond)) pool = [ctx.focusCond];
    else { pool = conditionsOf(S, [S.probandId]); if (!pool.length) pool = familyConditions(S); }
    if (!pool.length) throw new UErr(who ? `${nomi(who)} non ha malattie registrate: scrivi quale, ad esempio «affetto da …».` : 'Non so di quale malattia si tratta: scrivi ad esempio «affetta da carcinoma mammario».');
    if (pool.length === 1) A.conditions.push({ name: pool[0], age: A.condAge || '' });
    else out.askCond = pool;
    A.needCond = false; A.sameCond = null;
  }
  if (A.needVar || A.sameVar) {
    let pool, who = null;
    if (A.sameVar && A.sameVar.ids) { who = A.sameVar.ids; pool = variantsOf(S, who); }
    else if (A.sameVar && A.sameVar.ref) { who = refIdsFromText(S, ctx, R, A.sameVar.ref); pool = variantsOf(S, who); }
    else if (A.sameVar) { who = [S.probandId]; pool = variantsOf(S, who); if (!pool.length) { who = null; pool = familyVariants(S); } }
    else if (ctx.focusVar && familyVariants(S).includes(ctx.focusVar)) pool = [ctx.focusVar];
    else { pool = variantsOf(S, [S.probandId]); if (!pool.length) pool = familyVariants(S); }
    if (!pool.length) {
      if (A.varNeg) A.variants.push({ text: 'test', neg: true });
      else throw new UErr(who ? `${nomi(who)} non ha varianti registrate.` : 'Non so di quale variante si tratta: scrivi ad esempio «eterozigote per BRCA1 c.68_69del».');
    } else if (pool.length === 1) {
      let zyg = A.varNeg ? '' : A.zyg;
      if (!zyg && !A.varNeg && who) { const src = who.map(i => (S.people[i].variants || []).find(v => v.text === pool[0])).find(Boolean); if (src) zyg = src.zyg || ''; }
      A.variants.push({ text: pool[0], neg: !!A.varNeg, zyg: A.varCarrier && !A.varNeg ? 'het' : (zyg || ''), carrier: !!A.varCarrier && !A.varNeg });
    } else out.askVar = pool;
    A.needVar = false; A.sameVar = null;
  }
  if (A.twin) {
    const others = A.twinOf ? refIdsFromText(S, ctx, R, A.twinOf.ref) : [];
    const group = [...ids, ...others];
    if (group.length < 2 && !ids.includes(S.probandId) && fullSibs(S, S.probandId).includes(ids[0])) group.push(S.probandId);
    setTwins(S, group, A.mz, R);
    group.forEach(i => R.touched.add(i));
  }
  if (A.sibs) {
    const others = A.sibOf ? refIdsFromText(S, ctx, R, A.sibOf.ref) : [];
    const g = [...ids, ...others];
    if (g.length < 2) throw new UErr('Indica di chi è fratello o sorella: ad esempio «il nonno paterno è fratello della nonna materna».');
    linkSiblings(S, g, R);
    g.forEach(i => R.touched.add(i));
  }
  if (A.unionWith) {
    const o = refIdsFromText(S, ctx, R, A.unionWith.ref, true);
    ids.forEach(i => { unionBetween(S, i, o[0], R); R.touched.add(o[0]); });
  }
  if (A.unionPair && ids.length === 2) unionBetween(S, ids[0], ids[1], R);
  if (A.sep) {
    let u = null;
    if (A.sepFrom) u = unionBetween(S, ids[0], refIdsFromText(S, ctx, R, A.sepFrom.ref)[0], R);
    else if (ids.length === 2) u = unionBetween(S, ids[0], ids[1], R);
    else {
      const us = unionsOf(S, ids[0]);
      if (us.length === 1) u = us[0];
      else if (!us.length) throw new UErr(`${nomi(ids)} non ha un partner nel pedigree.`);
      else throw new UErr(`${nomi(ids)} ha più partner: scrivi ad esempio «separato dalla prima moglie».`);
    }
    u.separated = A.sep;
  }
  if (A.childOf || A.parentOf) {
    const figli = A.childOf ? ids : refIdsFromText(S, ctx, R, A.parentOf.ref);
    const gen = A.childOf ? refIdsFromText(S, ctx, R, A.childOf.ref)[0] : ids[0];
    reparent(S, figli, gen, R);
    [...figli, gen].forEach(i => R.touched.add(i));
  }
  if (A.inherit) {
    const pos = (A.variants || []).filter(v => !v.neg);
    const vs = pos.length ? pos : variantsOf(S, ids).map(t => ({ text: t, zyg: 'het' }));
    if (!vs.length) throw new UErr('Quale variante è stata ereditata? Scrivi ad esempio «eterozigote per CFTR F508del ereditata dalla madre».');
    ids.forEach(i => {
      const src = A.inherit.side ? [A.inherit.side === 'M' ? motherOf(S, i) : fatherOf(S, i)].filter(Boolean) : refIdsFromText(S, ctx, R, A.inherit.ref);
      if (!src.length) { ensureParents(S, i, R); src.push(A.inherit.side === 'P' ? fatherOf(S, i) : motherOf(S, i)); }
      src.forEach(g => { const q = S.people[g]; q.variants = q.variants || []; const nuove = vs.filter(v => !q.variants.some(x => x.text === v.text && !x.neg));
        nuove.forEach(v => { q.variants = q.variants.filter(x => x.text !== v.text); q.variants.push({ text: v.text, neg: false, zyg: 'het' }); }); R.touched.add(g);
        if (nuove.length) R.log.push({ type: 'ok', text: `⟨${g}⟩: variante ${nuove.map(v => v.text).join(', ')} (trasmessa)`, ids: [g] }); });
    });
  }
  if (A.sposato) ids.forEach(i => { ensurePartnerUnion(S, i, R); });
  if (A.consang != null) {
    let u = null;
    if (ids.length === 2) u = A.consang ? unionBetween(S, ids[0], ids[1], R) : unionsOf(S, ids[0]).find(w => w.a === ids[1] || w.b === ids[1]);
    else if (ids.length === 1) u = unionsOf(S, ids[0])[0] || parentU(S, ids[0]);
    if (u) u.consang = !!A.consang; else if (A.consang) throw new UErr('Indica la coppia: ad esempio «i genitori sono consanguinei» o «i nonni paterni sono consanguinei».');
  }
  if (A.noKids) {
    if (ids.length === 2) unionBetween(S, ids[0], ids[1], R).noKids = A.noKids;
    else ids.forEach(i => { const us = unionsOf(S, i); if (us.length === 1 && !us[0].children.length) us[0].noKids = A.noKids; else S.people[i].noKids = A.noKids; });
  }
  return out;
}
function reparent(S, figli, gen, R) {
  const P = S.people;
  if (!P[gen]) throw new UErr('Genitore non trovato.');
  for (const f of figli) {
    if (f === gen || ancestors(S, gen).has(f)) throw new UErr(`⟨${f}⟩ non può essere figlio di ⟨${gen}⟩: è un suo antenato.`);
  }
  const u = ensurePartnerUnion(S, gen, R);
  for (const f of figli) {
    const old = parentU(S, f);
    if (old && old.id === u.id) continue;
    if (old) {
      old.children = old.children.filter(c => c !== f);
      if (!old.children.length && [old.a, old.b].filter(Boolean).every(x => isBlankPerson(S, x) && P[x].unions.length === 1)) {
        [old.a, old.b].filter(Boolean).forEach(x => delete P[x]); delete S.unions[old.id];
      }
    }
    P[f].parentUnion = u.id; u.children.push(f);
  }
}
function pushAsks(S, R, ids, A, rel) {
  if (!rel) return;
  const sx = S.people[ids[0]] ? S.people[ids[0]].sex : 'U';
  const e = agr(sx, 1);
  const chi = ids.map(i => '⟨' + i + '⟩').join(', ');
  if (rel.askCond) R.asks.push({ text: `Quale malattia per ${chi}?`, options: rel.askCond.map(c => ({ label: c, cmd: ids.map(i => `@${i} è affett${agr(S.people[i].sex, 1)} da ${c}${A.condAge ? ` a ${A.condAge} anni` : ''}`).join('; ') })) });
  const zygDi = v => { if (A.zyg) return A.zyg; const src = [S.probandId, ...Object.keys(S.people)].map(i => (S.people[i].variants || []).find(x => x.text === v && !x.neg)).find(Boolean); return src ? (src.zyg || '') : ''; };
  if (rel.askVar) R.asks.push({ text: `Quale variante per ${chi}?`, options: rel.askVar.map(v => ({ label: v, cmd: ids.map(i => A.varCarrier && !A.varNeg ? `@${i} è ${S.people[i].sex === 'F' ? 'portatrice' : 'portatore'} di ${v}` : `@${i} è ${A.varNeg ? 'negativ' + agr(S.people[i].sex, 1) : 'positiv' + agr(S.people[i].sex, 1)} per ${v}${A.varNeg ? '' : zygTxt(zygDi(v))}`).join('; ') })) });
  void e;
}
const SEL_RE = /^(?:(?:chi|quelli|quelle|coloro|le persone|i soggetti|i pazienti|i familiari|gli individui|i parenti)\s+(?:che\s+)?((?:ha|hanno)(?:\s+avuto)?|(?:e|sono)\s+(?:affett[oaie]\s+da|malat[oaie]\s+di|portat\w+\s+di|positiv\w+\s+(?:per|a))|soffr\w+\s+di|present\w+|con|affett[oaie]\s+da|portat\w+\s+di)\s+|(?:gli|i|le)\s+(affett[ie]\s+da|malat[ie]\s+di|portat(?:ori|rici)\s+di|positiv[ie]\s+(?:per|a))\s+)/;
function trySelector(S, sub, ctx, R) {
  const low = lowA(sub);
  const m = SEL_RE.exec(low);
  if (!m) return false;
  const head = m[1] || m[2] || '';
  const carrierSel = /portat|positiv/.test(head);
  const restL = ' ' + low.slice(m[0].length) + ' ', restR = ' ' + sub.slice(m[0].length) + ' ';
  const VR = /\s(ha anche|hanno anche|ha|hanno|e|sono|era|erano|risulta|risultano|presenta|presentano|porta|portano)\s/g;
  let vm;
  while ((vm = VR.exec(restL))) {
    const query = restR.slice(0, vm.index).trim();
    if (!query) continue;
    const predRaw = restR.slice(vm.index + vm[0].length);
    const fn = /^(ha|hanno|presenta|porta)/.test(vm[1]) ? haveAttrs : parseAttrs;
    const A = withCome(S, ctx, R, predRaw, fn);
    if (!hasAttrs(A)) { VR.lastIndex = vm.index + 1; continue; }
    const q = query.replace(/^(?:il|lo|la|l'|i|gli|le|un|uno|una|un')\s+/i, '').trim();
    const qv = looksVariant(q);
    const qGene = qv ? lowA(normVariant(q)) : '';
    const ids = Object.values(S.people).filter(p => {
      if (carrierSel || qv) return p.carriers.some(c => c && condMatches(q, c)) || (p.variants || []).some(v => !v.neg && (lowA(v.text) === qGene || lowA(v.text).startsWith(qGene + ' ') || qGene.startsWith(lowA(v.text))));
      return p.conditions.some(c => condMatches(q, c.name));
    }).map(p => p.id);
    if (!ids.length && !carrierSel && !qv) Object.values(S.people).forEach(p => { if (p.carriers.some(c => c && condMatches(q, c))) ids.push(p.id); });
    if (!ids.length) throw new UErr(`Nessuno nel pedigree risulta ${carrierSel || qv ? 'portatore di' : 'affetto da'} «${q}». Controlla il nome nella legenda.`);
    doModify(S, ids, A, ctx, R, `chi ha ${q}`, true);
    return true;
  }
  return false;
}
function haveAttrs(rest) {
  let l = lowA(rest).trim();
  const tm = /^(?:fatto|eseguito|effettuato)\s+(?:il|lo|l'|la|un|una)?\s*(?:test|analisi|esame|ricerca|consulenza|indagine)(?:\s+genetic[oa])?\s*/.exec(l);
  if (tm) { const resto = rest.trim().slice(tm[0].length).replace(/^(?:ed?|ma)\s+(?:e|è)?\s*/i, ''); const A = parseAttrs(resto); A.testato = true; return A; }
  let m = /^(\d{1,3})\s*(anni|anno|mesi)/.exec(l);
  if (m) return parseAttrs('di ' + rest);
  m = /^(?:una?\s+|la\s+)?(?:mutazion[ei]|variant[ei]|delezion[ei]|duplicazion[ei])\b/.exec(l);
  if (m || looksVariant(rest.replace(/\s+(?:in|ed?)\s+(?:omo|etero|emi)zigo\w*.*$/i, ''))) return parseAttrs('positivo per ' + rest);
  return parseAttrs('affetto da ' + rest);
}
function trySubset(T, ctx) {
  if (!ctx.lastAdded.length) return null;
  let j = 0;
  if (T[0] && T[0].t === 'di' && T[1] && T[1].t === 'cui') j = 2;
  const t = T[j] && T[j].t;
  if (!t) return null;
  const skipOf = k => { if (T[k] && /^(di|dei|delle|tra|fra)$/.test(T[k].t) && T[k+1] && /^(loro|quali|essi|esse|questi|queste)$/.test(T[k+1].t)) return k + 2; return k; };
  if ((t === 'uno' || t === 'una' || t === 'un') && !startsNP(T, j)) {
    const id = ctx.lastAdded[ctx.subIdx] || ctx.lastAdded[ctx.lastAdded.length - 1];
    ctx.subIdx++;
    return { ids: [id], j: skipOf(j + 1), label: `⟨${id}⟩` };
  }
  if (/^(entrambi|entrambe|ambedue|tutti|tutte)$/.test(t)) {
    let k = j + 1; if (T[k] && T[k].t === 'e' && T[k+1] && NUMW[T[k+1].t]) k += 2;
    return { ids: ctx.lastAdded.slice(), j: k, label: t };
  }
  if ((DEF.has(t) && T[j+1] && ORD[T[j+1].t] != null && !(T[j+2] && REL[T[j+2].t])) || (ORD[t] != null && !(T[j+1] && REL[T[j+1].t]))) {
    const o = DEF.has(t) ? ORD[T[j+1].t] : ORD[t];
    const k = DEF.has(t) ? j + 2 : j + 1;
    let ids;
    if (o === 'other') ids = ctx.lastAdded.slice(Math.max(ctx.subIdx, 1));
    else ids = pickOrd(ctx.lastAdded, o);
    if (!ids.length) return null;
    return { ids, j: skipOf(k), label: ids.map(i => `⟨${i}⟩`).join(', ') };
  }
  return null;
}
function doAdd(S, T, j, sub, ctx, R, queue, anchorIds) {
  let anchor = anchorIds;
  if (!anchor && T[j] && TO.has(T[j].t) && startsRef(T, j + 1)) {
    const r = parseRef(T, j + 1, R);
    if (r && startsNP(T, r.j)) { anchor = resolveRef(S, r, ctx, R, true); j = r.j; }
  }
  const npr = parseNP(T, j, R);
  if (!npr) throw new UErr(`Non ho capito chi aggiungere in «${sub.slice(T[j] ? T[j].s : 0)}». Esempio: «aggiungi una zia paterna».`);
  const np = npr.np; j = npr.j;
  if (!anchor && T[j] && (TO.has(T[j].t) || OF.has(T[j].t)) && startsRef(T, j + 1)) {
    const r = parseRef(T, j + 1, R);
    if (r) { anchor = resolveRef(S, r, ctx, R, true); j = r.j; if (!anchor.length) throw new UErr(`Non trovo «${r.text}».`); }
  }
  if (!anchor) anchor = [ctx.addAnchor || (ctx.pov && S.people[ctx.pov] ? ctx.pov : null) || S.probandId];
  if (/^(figlio|aborto|gravidanza)$/.test(np.r) && T[j] && /^(con|da|dal|dalla|dallo|dai|dalle)$/.test(T[j].t)) {
    const first = T[j].t;
    let done = false;
    const k0 = (first === 'con' || first === 'da') ? j + 1 : j + 1;
    if (startsRef(T, k0)) {
      const r2 = parseRef(T, k0, R);
      const ids2 = r2 ? resolveRef(S, r2, ctx, R, false) : [];
      if (ids2.length) { np.coParent = ids2[0]; j = r2.j; done = true; }
    }
    if (!done) {
      const rest = lowA(sub.slice(T[j].s));
      const mm = /^(?:con|da|dal|dalla|dallo)\s+(?:(?:un|una|un'|il|la|lo|l')\s*)?(?:(?:altr[oa]|nuov[oa]|precedente|primo|prima|second[oa]|ex)\s+)*(?:matrimonio|relazione|unione|compagn[oa]|partner|uomo|donna|marito|moglie|fidanzat[oa]|padre diverso|madre diversa)(?![a-z])(?:\s+(?:precedente|diverso|diversa))?/.exec(rest);
      if (mm) { np.newUnion = true; const end = T[j].s + mm[0].length; while (T[j] && T[j].s < end) j++; done = true; }
    }
    if (!done && first === 'con' && startsRef(T, j + 1)) {
      const r2 = parseRef(T, j + 1, R);
      throw new UErr(`Non trovo «${r2 ? r2.text : ''}» nel pedigree. Per un nuovo partner scrivi ad esempio «con un nuovo compagno».`);
    }
  }
  if (/^(figlio|aborto|gravidanza)$/.test(np.r) && anchor.length === 2 && !np.coParent && !np.newUnion) { np.coParent = anchor[1]; anchor = [anchor[0]]; }
  let tail = '';
  if (T[j]) {
    let k = j; while (T[k] && /^(e|ed|poi|anche)$/.test(T[k].t)) k++;
    if (T[k] && startsNP(T, k) && (NUMW[T[k].t] != null || /^\d+$/.test(T[k].t))) queue.unshift(sub.slice(T[k].s));
    else tail = sub.slice(T[j].s);
  }
  if (/^(figlio|aborto|gravidanza)$/.test(np.r) && !np.coParent && !np.newUnion) {
    const nu = /(?:^|\s)(?:da|con|dal|dalla)\s+(?:(?:un|una|un'|il|la|l')\s*)?(?:(?:altr[oa]|nuov[oa]|precedente|primo|prima|second[oa]|ex)\s+)+(?:matrimonio|relazione|unione|compagn[oa]|partner|marito|moglie|fidanzat[oa])(?![a-zà-ÿ])/i.exec(tail);
    if (nu) { np.newUnion = true; tail = tail.slice(0, nu.index) + ' ' + tail.slice(nu.index + nu[0].length); if (anchor.length === 1) {} }
  }
  const dc = /(?:^|[\s,])(?:di cui|dei quali|delle quali|tra cui|fra cui)\s+/i.exec(tail);
  if (dc) { queue.unshift('di cui ' + tail.slice(dc.index + dc[0].length)); tail = tail.slice(0, dc.index); }
  const A = withCome(S, ctx, R, tail, parseAttrs);
  let count = np.qty;
  if (count == null) {
    if (np.both || np.r === 'genitori' || !np.pl) count = 1;
    else throw new UErr(`Quant${np.s === 'F' ? 'e' : 'i'} ${np.word}? Scrivi ad esempio «due ${np.word}».`);
  }
  if (np.pl && count === 1 && np.qty == null && !np.both) count = 1;
  if (np.r === 'self') {
    return doModify(S, [S.probandId], A, ctx, R, 'probando');
  }
  if (np.twins && np.r === 'figlio') np.twins = true;
  const allIds = [], allCreated = [];
  for (const a of anchor) {
    const res = addRelative(S, a, np, count, A, R);
    allIds.push(...res.ids); allCreated.push(...res.created);
    if (res.implicit) R.implicit.push(...res.implicit);
  }
  const rel = resolveRelational(S, ctx, R, A, allIds);
  pushAsks(S, R, allIds, A, rel);
  allIds.forEach(id => applyAttrs(S, id, Object.assign({}, A, { pregnant: false, twin: false, sibs: false, sep: '', unionWith: null, unionPair: false, noKids: '' }), R));
  let extraMsg = null;
  if (A._extra && A._extra.length) { A._extra.forEach(id => { applyAttrs(S, id, Object.assign({}, A, { pregnant: false, name: null, age: '', sex: null }), R); R.touched.add(id); }); extraMsg = { type: 'ok', text: `Stesse caratteristiche anche per ${A._extra.map(i => '⟨' + i + '⟩').join(', ')}`, ids: A._extra }; }
  if (A.pregnant) allIds.forEach(id => applyAttrs(S, id, { conditions: [], carriers: [], pregnant: true }, R));
  allCreated.forEach(id => R.created.add(id));
  allIds.forEach(id => R.touched.add(id));
  let sx = allIds.length ? S.people[allIds[0]].sex : np.s;
  if (sx === 'U' && np.det && FEM_DET.has(np.det)) sx = 'F';
  np.text = (np.text || '').replace(/\b(la|il|lo) ex\b/, "l'ex").replace(/\bivg\b/g, 'IVG').replace(/\bnatomorto\b/g, 'nato morto');
  const verb = allCreated.length ? `Aggiunt${agr(sx, allIds.length)}` : `Aggiornat${agr(sx, allIds.length)}`;
  let anc = anchor.length === 1 ? refSuffix(S, anchor[0]) : '';
  if (np.coParent) anc += ' e ' + withPrep('a', S, np.coParent).replace(/^(al|alla|allo|all'|a)\s?/, '');
  if (np.newUnion) anc += ' (nuova unione)';
  const attrsTxt = describeAttrs(A, sx, allIds.length);
  R.log.push({ type: 'ok', text: `${verb} ${np.text} ${anc}`.replace(/\s+/g, ' ').trim() + (attrsTxt ? ': ' + attrsTxt : ''), ids: allIds });
  if (extraMsg) R.log.push(extraMsg);
  if (A.unparsed) R.log.push({ type: 'warn', text: `Ho ignorato «${A.unparsed}».` });
  ctx.addAnchor = anchor[0];
  if (hasAttrs(A)) ctx.lastAttrs = A;
  ctx.lastAdded = allIds; ctx.subIdx = 0; ctx.lastTouched = allIds;
}
function doModify(S, ids, A, ctx, R, label, showIds) {
  if (!hasAttrs(A)) { throw new UErr(A.unparsed ? `Non ho capito «${A.unparsed}».` : 'Non ho trovato nulla da modificare in questa frase.'); }
  const base = ids.slice();
  if (A._extra && A._extra.length) { ids = [...new Set([...ids, ...A._extra])]; showIds = true; }
  const rel = resolveRelational(S, ctx, R, A, ids);
  pushAsks(S, R, ids, A, rel);
  if (!hasAttrs(A) && (rel.askCond || rel.askVar)) { ctx.lastTouched = ids; return; }
  ids.forEach(id => { const B = id && base.includes(id) ? A : Object.assign({}, A, { name: null, age: '', sex: null }); applyAttrs(S, id, B, R); R.touched.add(id); });
  ctx.lastAttrs = A;
  const sx = S.people[ids[0]] ? S.people[ids[0]].sex : 'U';
  let who = label && !/[⟨@]/.test(label) && label !== 'ha' ? label : base.map(i => `⟨${i}⟩`).join(', ');
  if (showIds) who += ' (' + base.map(i => `⟨${i}⟩`).join(', ') + ')' + (A._extra && A._extra.length ? ' e ' + A._extra.filter(x => !base.includes(x)).map(i => `⟨${i}⟩`).join(', ') : '');
  R.log.push({ type: 'ok', text: `${cap(who)}: ${describeAttrs(A, sx, ids.length)}`, ids });
  if (A.unparsed) R.log.push({ type: 'warn', text: `Ho ignorato «${A.unparsed}».` });
  ctx.lastTouched = ids;
}

/* ---------- layout ---------- */
function computeGenerations(S) {
  const P = S.people, gen = {};
  const seeds = [S.probandId, ...Object.keys(P)];
  for (const sd of seeds) {
    if (gen[sd] != null || !P[sd]) continue;
    gen[sd] = 0; const q = [sd];
    while (q.length) {
      const id = q.shift(); const p = P[id]; const g = gen[id];
      const push = (x, d) => { if (x && P[x] && gen[x] == null) { gen[x] = g + d; q.push(x); } };
      if (p.parentUnion) { const u = S.unions[p.parentUnion]; push(u.a, -1); push(u.b, -1); u.children.forEach(c => push(c, 0)); }
      p.unions.forEach(uid => { const u = S.unions[uid]; push(u.a, 0); push(u.b, 0); u.children.forEach(c => push(c, 1)); (u.donors || []).forEach(d => push(d, 0)); });
      if (p.donorFor && S.unions[p.donorFor]) { const u = S.unions[p.donorFor]; push(u.a, 0); push(u.b, 0); }
    }
  }
  // vincoli: i figli stanno sotto entrambi i genitori; chi entra per matrimonio sta alla generazione del partner
  for (let it = 0; it < 40; it++) {
    let changed = false;
    for (const u of Object.values(S.unions)) {
      const ps = [u.a, u.b].filter(x => x && gen[x] != null);
      if (!ps.length) continue;
      const top = Math.max(...ps.map(x => gen[x]));
      for (const c of u.children) if (gen[c] != null && gen[c] < top + 1) { gen[c] = top + 1; changed = true; }
      if (ps.length === 2) {
        const [x, y] = ps;
        if (!P[x].parentUnion && gen[x] !== gen[y] && P[x].unions.length === 1) { gen[x] = gen[y]; changed = true; }
        else if (!P[y].parentUnion && gen[y] !== gen[x] && P[y].unions.length === 1) { gen[y] = gen[x]; changed = true; }
      }
    }
    if (!changed) break;
  }
  const mn = Math.min(...Object.values(gen));
  Object.keys(gen).forEach(k => { gen[k] -= mn; });
  return gen;
}
function orderRows(S, gen) {
  const P = S.people, rows = {}, vP = new Set(), vU = new Set();
  const emit = id => { if (!id || vP.has(id) || !P[id]) return; vP.add(id); (rows[gen[id]] = rows[gen[id]] || []).push(id); };
  const pu = id => P[id] && P[id].parentUnion ? S.unions[P[id].parentUnion] : null;
  function otherUnions(x, excl, side) {
    for (const uid of P[x].unions) {
      if (uid === excl || vU.has(uid)) continue;
      const w = S.unions[uid]; vU.add(uid);
      const q = w.a === x ? w.b : w.a;
      if (side === 'L') { emit(q); w.children.forEach(emitDown); }
      else { emit(q); w.children.forEach(emitDown); }
    }
  }
  function emitAbove(u, X, side) {
    if (vU.has(u.id)) return; vU.add(u.id);
    const A = u.a, B = u.b;
    if (A && pu(A) && !vU.has(pu(A).id)) emitAbove(pu(A), A, 'L');
    if (A) { otherUnions(A, u.id, 'L'); }
    emit(A); emit(B);
    if (B) { otherUnions(B, u.id, 'R'); }
    if (B && pu(B) && !vU.has(pu(B).id)) emitAbove(pu(B), B, 'R');
    u.children.filter(c => c !== X).forEach(emitDown);
  }
  function emitDown(p) {
    if (vP.has(p)) return;
    const us = P[p].unions.filter(u => !vU.has(u)).map(u => S.unions[u]);
    if (!us.length) { emit(p); return; }
    if (us.length === 1) {
      const u = us[0]; vU.add(u.id);
      const q = u.a === p ? u.b : u.a;
      if (u.a === p) {
        emit(p); emit(q);
        u.children.forEach(emitDown);
        if (q && pu(q) && !vU.has(pu(q).id)) emitAbove(pu(q), q, 'R');
      } else {
        if (q && pu(q) && !vU.has(pu(q).id)) emitAbove(pu(q), q, 'L');
        emit(q); emit(p);
        u.children.forEach(emitDown);
      }
      return;
    }
    emit(p);
    us.forEach(u => { vU.add(u.id); const q = u.a === p ? u.b : u.a; emit(q); u.children.forEach(emitDown); if (q && pu(q) && !vU.has(pu(q).id)) emitAbove(pu(q), q, 'R'); });
  }
  function emitUnion(u) {
    if (vU.has(u.id)) return; vU.add(u.id);
    const A = u.a, B = u.b;
    if (A && pu(A) && !vU.has(pu(A).id)) emitAbove(pu(A), A, 'L');
    if (A) otherUnions(A, u.id, 'L');
    emit(A); emit(B);
    u.children.forEach(emitDown);
    if (B) otherUnions(B, u.id, 'R');
    if (B && pu(B) && !vU.has(pu(B).id)) emitAbove(pu(B), B, 'R');
  }
  const pb = S.probandId;
  if (pu(pb)) emitUnion(pu(pb)); else emitDown(pb);
  Object.keys(P).forEach(id => { if (!vP.has(id)) { const u = pu(id); if (u && !vU.has(u.id)) emitUnion(u); else emitDown(id); } });
  // i donatori stanno accanto alla coppia che hanno aiutato
  Object.values(S.unions).forEach(u => (u.donors || []).forEach(d => {
    if (!P[d] || gen[d] == null) return;
    const row = rows[gen[d]]; if (!row) return;
    const k0 = row.indexOf(d); if (k0 >= 0) row.splice(k0, 1);
    const idx = Math.max(row.indexOf(u.a), row.indexOf(u.b));
    row.splice(idx >= 0 ? idx + 1 : row.length, 0, d);
  }));
  riordina(S, rows, gen);
  return rows;
}
function riordina(S, rows, gen) {
  /* Dopo la visita: 1) ogni riga segue l'ordine dei genitori (baricentro), 2) le coppie di consanguinei
     vengono affiancate spostando ciascun partner sul bordo della propria fratria verso l'altro. */
  const P = S.people;
  const gks = Object.keys(rows).map(Number).sort((a, b) => a - b);
  const pos = {};
  const index = g => rows[g].forEach((id, i) => { pos[id] = i / Math.max(1, rows[g].length - 1); });
  const partnerIn = (id, row) => {
    if (P[id].donorFor && S.unions[P[id].donorFor]) { const u = S.unions[P[id].donorFor]; const cand = [u.b, u.a].filter(q => q && row.includes(q)); return cand.sort((x, y) => row.indexOf(y) - row.indexOf(x))[0]; }
    return P[id].unions.map(u => S.unions[u]).map(u => u.a === id ? u.b : u.a).find(q => q && row.includes(q));
  };
  gks.forEach((g, gi) => {
    let row = rows[g];
    if (gi > 0) {
      // gruppi: fratria (stessa unione dei genitori) + coniugi senza genitori attaccati
      const groups = [], gOf = {};
      row.forEach((id, i) => {
        const p = P[id];
        const key = p.parentUnion && S.unions[p.parentUnion] ? p.parentUnion : null;
        if (key) {
          let gr = groups.find(x => x.key === key);
          if (!gr) { gr = { key, ids: [], first: i }; groups.push(gr); }
          gr.ids.push(id); gOf[id] = gr;
        }
      });
      row.forEach((id, i) => {
        if (gOf[id]) return;
        const q = partnerIn(id, row);
        if (q && gOf[q]) { const gr = gOf[q]; const at = gr.ids.indexOf(q); const before = row.indexOf(id) < row.indexOf(q); gr.ids.splice(before ? at : at + 1, 0, id); gOf[id] = gr; }
        else { const gr = { key: null, ids: [id], first: i }; groups.push(gr); gOf[id] = gr; }
      });
      groups.forEach(gr => {
        if (gr.key) { const u = S.unions[gr.key]; const ps = [u.a, u.b].filter(x => x && pos[x] != null); gr.k = ps.length ? ps.reduce((a, x) => a + pos[x], 0) / ps.length : gr.first / row.length; }
        else gr.k = null;
      });
      // i gruppi senza genitori restano accanto al vicino che li precedeva
      groups.forEach((gr, i) => { if (gr.k == null) { const prev = groups.slice(0, i).reverse().find(x => x.k != null); gr.k = prev ? prev.k + 1e-6 * (i + 1) : -1 + i * 1e-6; } });
      const sorted = groups.map((gr, i) => ({ gr, i })).sort((a, b) => (a.gr.k - b.gr.k) || (a.i - b.i)).map(x => x.gr);
      row = rows[g] = [].concat(...sorted.map(gr => gr.ids));
    }
    // affianca i partner consanguinei nella stessa riga
    for (const u of Object.values(S.unions)) {
      if (!u.a || !u.b || !row.includes(u.a) || !row.includes(u.b)) continue;
      let ia = row.indexOf(u.a), ib = row.indexOf(u.b);
      if (Math.abs(ia - ib) === 1) continue;
      const [L, Rr] = ia < ib ? [u.a, u.b] : [u.b, u.a];
      const seg = id => { const pu = P[id].parentUnion; if (!pu) return [id]; let i = row.indexOf(id), a = i, b = i;
        const same = x => x && (P[x].parentUnion === pu || (!P[x].parentUnion && P[x].unions.some(w => { const z = S.unions[w]; const o = z.a === x ? z.b : z.a; return o && P[o].parentUnion === pu; })));
        while (a > 0 && same(row[a - 1])) a--; while (b < row.length - 1 && same(row[b + 1])) b++; return [a, b]; };
      const move = (id, toEnd) => {
        const sg = seg(id); if (sg.length === 1) return;
        const [a, b] = sg; const block = [id];
        // il coniuge esterno (senza genitori) segue la persona
        const sp = P[id].unions.map(w => S.unions[w]).map(w => w.a === id ? w.b : w.a).filter(q => q && !P[q].parentUnion && row.includes(q) && row.indexOf(q) >= a && row.indexOf(q) <= b);
        sp.forEach(q => block.push(q));
        const part = row.slice(a, b + 1).filter(x => !block.includes(x));
        const nuovo = toEnd ? [...part, ...block.filter(x => x !== id), id] : [id, ...block.filter(x => x !== id), ...part];
        row.splice(a, b - a + 1, ...nuovo);
      };
      move(L, true); move(Rr, false);
      rows[g] = row;
    }
    index(g);
  });
}
function personLines(S, p, label) {
  const L = [{ t: label, c: 'id' }];
  if (p.name) L.push({ t: p.name, c: 'nm' });
  if (p.donor) L.push({ t: (p.donor === 'seme' ? 'donatore' : p.donor === 'surrogata' ? 'gestante per altri' : p.donor === 'embrione' ? 'embrione donato' : 'donatrice') + (p.age ? ', ' + p.age + ' a' : ''), c: 'ag' });
  if (p.miscarriage) L.push({ t: ({ SAB: 'aborto sp.', BIO: 'biochimica', ECT: 'ectopica', MOLA: 'mola', TOP: p.topKind || 'ITG' })[p.loss || (p.top ? 'TOP' : 'SAB')] + (p.ga ? ' ' + p.ga : '') + (p.sex !== 'U' && p.miscarriage ? (p.sex === 'M' ? ' ♂' : ' ♀') : ''), c: 'ag' });
  else if (p.stillborn) L.push({ t: 'nato morto' + (p.ga ? ' ' + p.ga : ''), c: 'ag' });
  else if (p.pregnancy) L.push({ t: 'gravidanza' + (p.ga ? ' ' + p.ga : ''), c: 'ag' });
  if (p.pma) L.push({ t: p.pma, c: 'pm' });
  (p.prenatal || []).forEach(x => wrap(x, 22).forEach(w => L.push({ t: w, c: 'nt' })));
  if (p.age && p.donor) {} else if (p.deceased && !p.stillborn) L.push({ t: 'd.' + (p.deathAge ? ' ' + p.deathAge + (/^\d+$/.test(p.deathAge) ? ' a' : '') : ''), c: 'ag' });
  else if (p.age) L.push({ t: /mes|sett|gg/.test(p.age) ? p.age : p.age + ' a', c: 'ag' });
  p.conditions.forEach(c => wrap(c.name + (c.age ? ' (' + c.age + ')' : '') + (c.denovo ? ' – de novo' : ''), 18).forEach(x => L.push({ t: x, c: 'cd', k: c.name })));
  if (p.karyo) { const pz = p.karyo.split(/,(?![^(]*\))/); let cur = ''; pz.forEach((x, i) => { const add = (i ? ',' : '') + x; if ((cur + add).length > 22 && cur) { L.push({ t: cur + ',', c: 'ky' }); cur = x; } else cur += add; }); if (cur) L.push({ t: cur, c: 'ky' }); }
  if (p.note) wrap(p.note, 22).forEach(x => L.push({ t: x, c: 'nt' }));
  p.carriers.forEach(c => { if (p.karyo && c && /^(?:t|inv|rob|ins)\(/.test(c) && p.karyo.includes(c)) return; wrap('port. ' + (c || ''), 22).forEach(x => L.push({ t: x.trim(), c: 'cr', k: c })); });
  (p.variants || []).forEach(v => wrap(v.neg ? (v.text === 'test' ? 'test neg.' : v.text + ' neg.') : (v.carrier ? 'port. ' : '') + v.text + (v.zyg === 'omo' ? ' omo' : v.zyg === 'emi' ? ' emi' : v.zyg === 'comp' ? ' comp.' : '') + (v.cls && v.cls !== 'P' ? ' (' + v.cls + ')' : '') + (v.note ? ' ' + v.note : ''), 20).forEach(x => L.push({ t: x, c: v.neg ? 'vn' : 'vr', k: v.carrier && !v.neg ? v.text : '' })));
  return L;
}
function wrap(s, n) {
  const words = s.split(' '); const out = []; let cur = '';
  for (const w of words) { if ((cur + ' ' + w).trim().length > n && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
  if (cur) out.push(cur);
  return out;
}
function pava(D, W, G) {
  const n = D.length; const C = [0];
  for (let i = 1; i < n; i++) C[i] = C[i-1] + G[i-1];
  const pools = [];
  for (let i = 0; i < n; i++) {
    pools.push({ s: (D[i] - C[i]) * W[i], w: W[i], a: i, b: i });
    while (pools.length > 1) {
      const p2 = pools[pools.length - 1], p1 = pools[pools.length - 2];
      if (p1.s / p1.w > p2.s / p2.w) { p1.s += p2.s; p1.w += p2.w; p1.b = p2.b; pools.pop(); } else break;
    }
  }
  const x = new Array(n);
  pools.forEach(p => { const y = p.s / p.w; for (let i = p.a; i <= p.b; i++) x[i] = y + C[i]; });
  return x;
}
const SYM = 36;
function layout(S) {
  const P = S.people;
  const gen = computeGenerations(S);
  const rows = orderRows(S, gen);
  const gks = Object.keys(rows).map(Number).sort((a, b) => a - b);
  const labels = {};
  gks.forEach((g, gi) => rows[g].forEach((id, i) => { labels[id] = ROMAN[gi] + '-' + (i + 1); }));
  const lines = {}, wid = {};
  Object.values(P).forEach(p => { lines[p.id] = personLines(S, p, labels[p.id]); wid[p.id] = Math.max(SYM + 8, ...lines[p.id].map(l => l.t.length * 6.3)); });
  const isPartner = (a, b) => P[a].unions.some(u => { const w = S.unions[u]; return (w.a === a && w.b === b) || (w.a === b && w.b === a); });
  const sameSib = (a, b) => P[a].parentUnion && P[a].parentUnion === P[b].parentUnion;
  const unionOf = (a, b) => P[a].unions.map(u => S.unions[u]).find(w => w && ((w.a === a && w.b === b) || (w.a === b && w.b === a)));
  const gap = (a, b) => {
    const uu = unionOf(a, b);
    if (uu && uu.pma) return Math.max(SYM + 26, Math.max(wid[a], wid[b]) + 12) + 22;
    const base = Math.max(SYM + 30, (wid[a] + wid[b]) / 2 + 14);
    if (isPartner(a, b)) return Math.max(SYM + 26, Math.max(wid[a], wid[b]) + 12);
    return sameSib(a, b) ? base : base + 22;
  };
  const blocks = {};
  const x = {};
  gks.forEach(g => {
    const row = rows[g]; const bl = [];
    row.forEach((id, i) => {
      if (i > 0 && isPartner(row[i-1], id)) { const b = bl[bl.length - 1]; b.off.push(b.off[b.off.length - 1] + gap(row[i-1], id)); b.m.push(id); }
      else bl.push({ m: [id], off: [0] });
    });
    blocks[g] = bl;
    let cx = 0;
    bl.forEach((b, k) => { if (k > 0) { const pb = bl[k-1]; cx += pb.off[pb.off.length - 1] + gap(pb.m[pb.m.length - 1], b.m[0]); } b.x = cx; b.m.forEach((id, i) => { x[id] = cx + b.off[i]; }); });
  });
  const unionMid = u => { const ps = [u.a, u.b].filter(v => v && x[v] != null); return ps.length ? ps.reduce((s, v) => s + x[v], 0) / ps.length : null; };
  function placeRow(g, useUp, useDown) {
    const bl = blocks[g]; if (!bl) return;
    const D = [], W = [], G = [];
    bl.forEach((b, k) => {
      let s = 0, w = 0;
      b.m.forEach((id, i) => {
        const p = P[id];
        if (useUp && p.parentUnion) { const mid = unionMid(S.unions[p.parentUnion]); if (mid != null) { s += (mid - b.off[i]) * 1; w += 1; } }
        if (useDown) p.unions.forEach(uid => {
          const u = S.unions[uid]; if (!u.children.length) return;
          const q = u.a === id ? u.b : u.a;
          const qi = b.m.indexOf(q);
          if (qi >= 0 && qi < i) return;
          const c = u.children.reduce((a, cid) => a + x[cid], 0) / u.children.length;
          const target = qi >= 0 ? c - (b.off[i] + b.off[qi]) / 2 : c - b.off[i];
          s += target * 1.2; w += 1.2;
        });
      });
      if (!w) { s = b.x * 0.05; w = 0.05; }
      D.push(s / w); W.push(w);
      if (k > 0) { const pb = bl[k-1]; G.push(pb.off[pb.off.length - 1] + gap(pb.m[pb.m.length - 1], b.m[0])); }
    });
    const nx = pava(D, W, G);
    bl.forEach((b, k) => { b.x = nx[k]; b.m.forEach((id, i) => { x[id] = b.x + b.off[i]; }); });
  }
  for (let it = 0; it < 40; it++) {
    for (const g of gks) placeRow(g, true, true);
    for (const g of gks.slice().reverse()) placeRow(g, true, true);
  }
  const minX = Math.min(...Object.keys(x).map(id => x[id] - Math.max(wid[id] / 2, id === S.probandId ? 68 : 0)));
  Object.keys(x).forEach(id => { x[id] -= minX; });
  const y = {}, rowY = {};
  let cy = SYM / 2 + 10;
  gks.forEach((g, gi) => {
    rowY[g] = cy;
    rows[g].forEach(id => { y[id] = cy; });
    const maxL = Math.max(...rows[g].map(id => lines[id].length));
    cy += SYM / 2 + 14 + maxL * 13.5 + 46 + SYM / 2;
  });
  const maxX = Math.max(...Object.keys(x).map(id => x[id] + wid[id] / 2));
  const maxY = Math.max(...Object.keys(y).map(id => y[id] + SYM / 2 + 14 + lines[id].length * 13.5));
  const consang = new Set(Object.values(S.unions).filter(u => u.consang || related(S, u.a, u.b)).map(u => u.id));
  return { x, y, labels, lines, rows, gks, rowY, width: maxX, height: maxY, gen, consang };
}

function kinWord(S, id) { const k = kinOf(S, id); return k ? k.w : ''; }
function nomiMalattie() { return MALATTIE.map(m => m[0]); }
function summary(S) {
  const L = layout(S);
  return Object.values(S.people).map(p => ({ pid: p.id, sigla: L.labels[p.id] || '', parentela: p.miscarriage || p.pregnancy ? 'gravidanza' : p.donor ? 'donatore' : kinWord(S, p.id), nome: p.name || '', sesso: p.sex,
    deceduto: !!p.deceased, eta: p.age || '', probando: p.id === S.probandId, aborto: !!(p.miscarriage || p.pregnancy), donatore: !!p.donor,
    condizioni: p.conditions.map(c => ({ nome: c.name, eta: c.age || '' })), portatore: p.carriers.filter(Boolean),
    varianti: (p.variants || []).map(v => ({ testo: v.text, esito: v.neg ? 'negativo' : v.carrier ? 'portatore' : (v.zyg || 'positivo') })) }));
}
const api = { aggiungiVocabolario, vocabolarioConfermato, malattiaReale, geneReale, parseRep, classeRep, REP, normVariant, hgvsDi, cercaVariante, portatoriDi, mappaPortatori, eAnnulla, togliAvverbi, coloreGene, verifica, modoDi, impostaModo, MODI, INH, parseCito, karyoNorm, summary, reproRiassunto, nomiMalattie, malattiaCanonica, kinWord, setTwins, linkSiblings, unionBetween, related, familyConditions, familyVariants, conditionsOf, variantsOf, newState, run, layout, labelsOf: S => layout(S).labels, removePerson, addRelative, registerCondition, pruneConditions, parseAttrs, splitClauses, orient,
  ensureParents, ensurePartnerUnion, fatherOf, motherOf, partnersOf, childrenOf, PALETTE, ROMAN, SYM, UErr };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PedEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
