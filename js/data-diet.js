/* ============================================================
   FIT·LOG — dieta di partenza (piano del nutrizionista)
   kcal stimate per porzione: modificabili dalla sezione Admin.
   ============================================================ */
/* Ogni voce è collegata alla tabella alimenti (js/data-food.js) tramite `fid`:
   kcal e macro non sono scritte a mano, le calcola calcNutr() dalla quantità.
   Se cambi la quantità dall'Admin, le calorie si aggiornano da sole. */
const FOOD = {
  latte:      {fid:'latte-ps',        n:'Latte parz. scremato',   q:'200 ml'},
  fette:      {fid:'fette-biscottate',n:'Fette biscottate',       q:'4 fette'},
  pane50col:  {fid:'pane',            n:'Pane',                   q:'50 g'},
  gallette20: {fid:'gallette-riso',   n:'Gallette',               q:'20 g'},
  burro:      {fid:'burro-arachidi',  n:'Burro di arachidi',      q:'2 cucchiaini'},
  prot:       {fid:'whey',            n:'Proteine in polvere',    q:'20 g'},
  frutto:     {fid:'frutta-generica', n:'Frutto',                 q:'1 frutto'},
  fsecca:     {fid:'frutta-secca-mix',n:'Frutta secca',           q:'20 g'},
  pane50:     {fid:'pane',            n:'Pane',                   q:'50 g'},
  riso50:     {fid:'riso',            n:'Riso',                   q:'50 g'},
  riso80:     {fid:'riso',            n:'Riso',                   q:'80 g'},
  pasta80:    {fid:'pasta-secca',     n:'Pasta',                  q:'80 g'},
  gallette40: {fid:'gallette-riso',   n:'Gallette',               q:'40 g'},
  crossa:     {fid:'manzo-magro',     n:'Carne rossa',            q:'200 g'},
  cbianca:    {fid:'pollo-petto',     n:'Carne bianca',           q:'200 g'},
  legumi:     {fid:'fagioli-scatola', n:'Legumi in scatola',      q:'140 g'},
  grana:      {fid:'grana',           n:'Grana',                  q:'40 g'},
  ricotta:    {fid:'ricotta-vaccina', n:'Ricotta',                q:'100 g'},
  salmone:    {fid:'salmone',         n:'Salmone fresco',         q:'150 g'},
  pesceazz:   {fid:'sgombro',         n:'Pesce azzurro',          q:'300 g'},
  tonno:      {fid:'tonno-naturale',  n:'Tonno sgocciolato',      q:'80 g'},
  uova:       {fid:'uovo',            n:'Uova',                   q:'2 uova'},
  bresaola:   {fid:'bresaola',        n:'Bresaola / crudo magro', q:'150 g'},
  macinato:   {fid:'macinato-magro',  n:'Macinato (ragù)',        q:'80 g'},
  verdura200: {fid:'verdura-mista',   n:'Verdura',                q:'200 g'},
  verdura150: {fid:'verdura-mista',   n:'Verdura',                q:'150 g'},
  olio:       {fid:'olio-evo',        n:'Olio EVO',               q:'1 cucchiaio'},
  yogurt:     {fid:'yogurt-greco0',   n:'Yogurt greco 0%',        q:'1 vasetto'},
  avena:      {fid:'avena',           n:'Fiocchi di avena',       q:'20 g'},
  pizza:      {fid:'pizza-margherita',n:'Pizza',                  q:'1 pizza'},
  bibita:     {fid:'bibita-zucchero', n:'Bibita',                 q:'1 lattina'},
};
// copia della voce con kcal e macro già calcolate dalla quantità
const F = id => {
  const it={...FOOD[id]};
  const n=calcNutr(it.fid,it.q);
  if(n){ it.k=n.k; it.p=n.p; it.c=n.c; it.f=n.f; } else { it.k=0; }
  return it;
};

// Pasti-tipo (id, nome, orario di default)
const MEAL_TIMES_DEFAULT = {col:'07:30', spu:'10:30', pra:'13:00', mer:'16:30', cen:'20:00', post:'22:15'};
const MEAL_NAMES = {col:'Colazione', spu:'Spuntino', pra:'Pranzo', mer:'Merenda', cen:'Cena', post:'Spuntino post-allenamento'};

function colazioneFette(){ return [F('latte'),F('fette'),F('burro'),F('prot')]; }
function colazionePane(){ return [F('latte'),F('pane50col'),F('burro'),F('prot')]; }
function colazioneGallette(){ return [F('latte'),F('gallette20'),F('burro'),F('prot')]; }
function spuntino(){ return [F('frutto'),F('fsecca')]; }
function merendaAvena(){ return [F('yogurt'),F('avena')]; }
function merendaFrutta(){ return [F('yogurt'),F('fsecca'),F('frutto')]; }
function merendaCut(){ return [F('yogurt'),F('avena'),F('frutto')]; } // merenda della dieta Cut (uguale ogni giorno)
function postAll(){ return [F('latte'),F('prot'),F('pane50')]; } // spuntino post-allenamento generico

// Dieta CUT (piano attuale del nutrizionista) — organizzata per giorno della settimana.
// Giorno 1 = Lunedì … Giorno 7 = Domenica (con settings.giorno1 = 1).
// preAll = true → giorno di allenamento (aggiunge lo spuntino post). Impostabile per giorno dall'Admin.
const DIET_SEED = {
  1:{preAll:false, meals:{ // Lunedì
    col:colazioneFette(), spu:spuntino(),
    pra:[F('pane50'),F('cbianca'),F('verdura200'),F('olio')],
    mer:merendaCut(),
    cen:[F('pasta80'),F('uova'),F('verdura150'),F('olio')] }},
  2:{preAll:false, meals:{ // Martedì
    col:colazioneFette(), spu:spuntino(),
    pra:[F('riso50'),F('legumi'),F('grana'),F('verdura200'),F('olio')],
    mer:merendaCut(),
    cen:[F('pane50'),F('pesceazz'),F('verdura200'),F('olio')] }},
  3:{preAll:false, meals:{ // Mercoledì
    col:colazioneFette(), spu:spuntino(),
    pra:[F('pasta80'),F('tonno'),F('verdura150'),F('olio')],
    mer:merendaCut(),
    cen:[F('pane50'),F('cbianca'),F('verdura200'),F('olio')] }},
  4:{preAll:false, meals:{ // Giovedì
    col:colazioneFette(), spu:spuntino(),
    pra:[F('pizza'),F('bibita')],
    mer:merendaCut(),
    cen:[F('pane50'),F('bresaola'),F('verdura200'),F('olio')] }},
  5:{preAll:false, meals:{ // Venerdì
    col:colazioneFette(), spu:spuntino(),
    pra:[F('riso50'),F('legumi'),F('ricotta'),F('verdura200'),F('olio')],
    mer:merendaCut(),
    cen:[F('pane50'),F('salmone'),F('verdura200'),F('olio')] }},
  6:{preAll:false, meals:{ // Sabato
    col:colazioneFette(), spu:spuntino(),
    pra:[F('pasta80'),F('macinato'),F('verdura150'),F('olio')],
    mer:merendaCut(),
    cen:[F('pane50'),F('crossa'),F('verdura200'),F('olio')] }},
  7:{preAll:false, meals:{ // Domenica
    col:colazioneFette(), spu:spuntino(),
    pra:[F('cbianca'),F('verdura200'),F('olio')],
    mer:merendaCut(),
    cen:[F('pizza'),F('bibita')] }},
};

const DIET_NOTE = 'Dieta Cut. Cereali integrali quando possibile (pasta, pane, riso, fette). Rispetto totale e rigoroso dello schema.';
