/* ============================================================
   FIT·LOG — dieta di partenza (piano del nutrizionista)
   kcal stimate per porzione: modificabili dalla sezione Admin.
   ============================================================ */
const FOOD = {
  latte:      {n:'Latte parz. scremato', q:'200 ml', k:92},
  fette:      {n:'Fette biscottate', q:'4', k:160},
  pane50col:  {n:'Pane', q:'50 g', k:135},
  gallette20: {n:'Gallette', q:'20 g', k:78},
  burro:      {n:'Burro di arachidi', q:'2 cucchiaini', k:96},
  prot:       {n:'Proteine in polvere', q:'20 g', k:78},
  frutto:     {n:'Frutto', q:'1', k:90},
  fsecca:     {n:'Frutta secca', q:'20 g', k:120},
  pane50:     {n:'Pane', q:'50 g', k:135},
  riso50:     {n:'Riso', q:'50 g', k:180},
  riso80:     {n:'Riso', q:'80 g', k:288},
  pasta80:    {n:'Pasta', q:'80 g', k:285},
  gallette40: {n:'Gallette', q:'40 g', k:155},
  crossa:     {n:'Carne rossa', q:'200 g', k:340},
  cbianca:    {n:'Carne bianca', q:'200 g', k:230},
  legumi:     {n:'Legumi in scatola', q:'140 g', k:130},
  grana:      {n:'Grana', q:'40 g', k:157},
  ricotta:    {n:'Ricotta', q:'100 g', k:146},
  salmone:    {n:'Salmone fresco', q:'150 g', k:280},
  pesceazz:   {n:'Pesce azzurro', q:'300 g', k:420},
  tonno:      {n:'Tonno sgocciolato', q:'80 g', k:90},
  uova:       {n:'2 uova + 1 albume', q:'', k:160},
  bresaola:   {n:'Bresaola / crudo magro', q:'150 g', k:230},
  macinato:   {n:'Macinato (ragù)', q:'80 g', k:150},
  verdura200: {n:'Verdura', q:'200 g', k:50},
  verdura150: {n:'Verdura', q:'150 g', k:38},
  olio:       {n:'Olio EVO', q:'1 cucchiaio', k:90},
  yogurt:     {n:'Yogurt greco 0%', q:'1 vasetto', k:90},
  avena:      {n:'Fiocchi di avena', q:'20 g', k:78},
  pizza:      {n:'Pizza', q:'1', k:900},
  bibita:     {n:'Bibita', q:'1', k:140},
};
const F = id => ({...FOOD[id]});

// Pasti-tipo (id, nome, orario di default)
const MEAL_TIMES_DEFAULT = {col:'07:30', spu:'10:30', pra:'13:00', mer:'16:30', cen:'20:00', post:'22:15'};
const MEAL_NAMES = {col:'Colazione', spu:'Spuntino', pra:'Pranzo', mer:'Merenda', cen:'Cena', post:'Spuntino post-allenamento'};

function colazioneFette(){ return [F('latte'),F('fette'),F('burro'),F('prot')]; }
function colazionePane(){ return [F('latte'),F('pane50col'),F('burro'),F('prot')]; }
function colazioneGallette(){ return [F('latte'),F('gallette20'),F('burro'),F('prot')]; }
function spuntino(){ return [F('frutto'),F('fsecca')]; }
function merendaAvena(){ return [F('yogurt'),F('avena')]; }
function merendaFrutta(){ return [F('yogurt'),F('fsecca'),F('frutto')]; }
function postAll(){ return [F('latte'),F('prot'),F('pane50')]; }

// preAll = true → il giorno prevede allenamento (cena pre-workout + spuntino post)
const DIET_SEED = {
  1:{preAll:true, meals:{
    col:colazioneFette(), spu:spuntino(),
    pra:[F('pane50'),F('crossa'),F('verdura200'),F('olio')],
    mer:merendaAvena(),
    cen:[F('pasta80'),F('macinato'),F('verdura150'),F('olio')],
    post:postAll() }},
  2:{preAll:false, meals:{
    col:colazionePane(), spu:spuntino(),
    pra:[F('riso50'),F('legumi'),F('grana'),F('verdura200'),F('olio')],
    mer:merendaFrutta(),
    cen:[F('gallette40'),F('pesceazz'),F('verdura200'),F('olio')] }},
  3:{preAll:true, meals:{
    col:colazioneFette(), spu:spuntino(),
    pra:[F('pane50'),F('cbianca'),F('verdura200'),F('olio')],
    mer:merendaAvena(),
    cen:[F('pasta80'),F('tonno'),F('verdura150'),F('olio')],
    post:postAll() }},
  4:{preAll:false, meals:{
    col:colazionePane(), spu:spuntino(),
    pra:[F('riso50'),F('legumi'),F('ricotta'),F('verdura200'),F('olio')],
    mer:merendaFrutta(),
    cen:[F('gallette40'),F('pesceazz'),F('verdura200'),F('olio')] }},
  5:{preAll:true, meals:{
    col:colazioneFette(), spu:spuntino(),
    pra:[F('pane50'),F('cbianca'),F('verdura200'),F('olio')],
    mer:merendaAvena(),
    cen:[F('pasta80'),F('uova'),F('verdura150'),F('olio')],
    post:postAll() }},
  6:{preAll:false, meals:{
    col:colazionePane(), spu:spuntino(),
    pra:[F('riso80'),F('salmone'),F('verdura200'),F('olio')],
    mer:merendaFrutta(),
    cen:[F('gallette40'),F('bresaola'),F('verdura200'),F('olio')] }},
  7:{preAll:false, meals:{
    col:colazioneGallette(), spu:spuntino(),
    pra:[F('cbianca'),F('verdura200'),F('olio')],
    mer:merendaFrutta(),
    cen:[F('pizza'),F('bibita')] }},
};

const DIET_NOTE = 'Consiglio cereali integrali (pasta, pane, riso, fette biscottate). Rispetto totale e rigoroso dello schema per 4 settimane.';
