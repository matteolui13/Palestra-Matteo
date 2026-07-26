/* ============================================================
   FIT·LOG — TABELLA ALIMENTI

   Serve a non digitare più le calorie a mano: scegli l'alimento,
   scrivi la quantità ("150 g", "2 cucchiai", "1 vasetto") e kcal
   e macro vengono calcolate da sole.

   VALORI: per 100 g (o 100 ml per i liquidi) di prodotto come
   viene consumato. Fonte di riferimento: tabelle di composizione
   degli alimenti CREA/INRAN, arrotondate. Sono stime da tabella,
   non pesate del tuo piatto: per i prodotti confezionati l'etichetta
   vince sempre — puoi correggere il valore a mano quando serve.

   CAMPI
     id   identificativo stabile (le voci della dieta lo salvano)
     n    nome
     k    kcal per 100 g/ml
     p    proteine (g/100)
     c    carboidrati (g/100)
     f    grassi (g/100)
     cat  categoria (per i filtri)
     al   alias di ricerca
     u    'ml' se si misura in volume (default 'g')
     porz porzioni casalinghe: {nome: grammi}
   ============================================================ */

const FOOD_CAT = [
  {id:'cereali',  n:'Cereali e derivati'},
  {id:'carne',    n:'Carne'},
  {id:'pesce',    n:'Pesce'},
  {id:'uova',     n:'Uova'},
  {id:'latticini',n:'Latte e derivati'},
  {id:'legumi',   n:'Legumi'},
  {id:'verdura',  n:'Verdura'},
  {id:'frutta',   n:'Frutta'},
  {id:'frutsecca',n:'Frutta secca e semi'},
  {id:'grassi',   n:'Condimenti e grassi'},
  {id:'dolci',    n:'Dolci e snack'},
  {id:'bevande',  n:'Bevande'},
  {id:'integr',   n:'Integratori'},
  {id:'pronti',   n:'Piatti pronti e fuori casa'}
];

/* Porzioni casalinghe generiche, usate quando l'alimento non ne definisce di proprie */
const PORZ_GENERICHE = {cucchiaio:15, cucchiaino:5, tazza:200, bicchiere:200, pizzico:1};

const FOOD_DB = [

/* ---------- CEREALI E DERIVATI ---------- */
{id:'pasta-secca', w:1, n:'Pasta di semola (cruda)', k:353, p:11, c:71, f:1.4, cat:'cereali', al:['pasta','spaghetti','penne','fusilli']},
{id:'pasta-integrale', n:'Pasta integrale (cruda)', k:335, p:13, c:63, f:2.5, cat:'cereali', al:['pasta integrale']},
{id:'pasta-cotta', n:'Pasta cotta', k:158, p:5, c:31, f:0.6, cat:'cereali', al:['pasta scolata','pasta lessa']},
{id:'riso', w:1, n:'Riso (crudo)', k:360, p:7, c:80, f:0.6, cat:'cereali', al:['riso bianco','riso brillato']},
{id:'riso-integrale', n:'Riso integrale (crudo)', k:337, p:7.5, c:69, f:1.9, cat:'cereali', al:['riso integrale']},
{id:'riso-cotto', n:'Riso cotto', k:132, p:2.5, c:29, f:0.3, cat:'cereali', al:['riso lesso']},
{id:'pane', w:1, n:'Pane comune', k:270, p:8.6, c:55, f:0.4, cat:'cereali', al:['pane bianco','panino','filone'], porz:{fetta:30, panino:70}},
{id:'pane-integrale', n:'Pane integrale', k:243, p:7.5, c:49, f:1.3, cat:'cereali', al:['pane nero'], porz:{fetta:30}},
{id:'pane-segale', n:'Pane di segale', k:219, p:6, c:45, f:1, cat:'cereali', al:['segale'], porz:{fetta:30}},
{id:'fette-biscottate', n:'Fette biscottate', k:408, p:11, c:76, f:6, cat:'cereali', al:['fetta biscottata'], porz:{fetta:8, pezzo:8}},
{id:'gallette-riso', n:'Gallette di riso', k:387, p:8, c:82, f:2.4, cat:'cereali', al:['galletta','gallette','gallette di mais'], porz:{galletta:8, pezzo:8}},
{id:'avena', n:'Fiocchi di avena', k:389, p:13, c:62, f:7, cat:'cereali', al:['avena','porridge','oats']},
{id:'cornflakes', n:'Cereali da colazione (cornflakes)', k:361, p:7, c:83, f:0.9, cat:'cereali', al:['cornflakes','cereali']},
{id:'farro', n:'Farro (crudo)', k:335, p:15, c:67, f:2.5, cat:'cereali', al:['farro perlato']},
{id:'orzo', n:'Orzo perlato (crudo)', k:319, p:10, c:71, f:1.4, cat:'cereali', al:['orzo']},
{id:'quinoa', n:'Quinoa (cruda)', k:368, p:14, c:64, f:6, cat:'cereali', al:['quinoa']},
{id:'cuscus', n:'Cous cous (crudo)', k:376, p:13, c:77, f:0.6, cat:'cereali', al:['couscous','cuscus']},
{id:'polenta', n:'Farina di mais (polenta)', k:362, p:8, c:80, f:1.5, cat:'cereali', al:['polenta','mais']},
{id:'patate', n:'Patate', k:78, p:2, c:18, f:0.1, cat:'cereali', al:['patata','patate lesse']},
{id:'patate-dolci', n:'Patate dolci', k:86, p:1.6, c:20, f:0.1, cat:'cereali', al:['patata dolce','batata']},
{id:'crackers', n:'Crackers', k:428, p:10, c:73, f:10, cat:'cereali', al:['cracker'], porz:{pacchetto:25}},
{id:'grissini', n:'Grissini', k:433, p:12, c:69, f:12, cat:'cereali', al:['grissino'], porz:{grissino:5}},
{id:'piadina', n:'Piadina', k:320, p:8, c:50, f:9, cat:'cereali', al:['piadina'], porz:{piadina:100}},
{id:'tortilla', n:'Tortilla di frumento', k:310, p:8, c:52, f:7, cat:'cereali', al:['wrap','tortilla'], porz:{tortilla:45}},

/* ---------- CARNE ---------- */
{id:'pollo-petto', w:1, n:'Petto di pollo', k:110, p:23, c:0, f:1.6, cat:'carne', al:['pollo','carne bianca','petto pollo']},
{id:'pollo-coscia', n:'Coscia di pollo (senza pelle)', k:135, p:19, c:0, f:6.5, cat:'carne', al:['coscia pollo','fuso']},
{id:'tacchino', n:'Fesa di tacchino', k:107, p:24, c:0, f:1.2, cat:'carne', al:['tacchino','fesa']},
{id:'manzo-magro', n:'Manzo magro (fesa, girello)', k:127, p:22, c:0, f:4, cat:'carne', al:['manzo','carne rossa','fesa di manzo','girello']},
{id:'bistecca', n:'Bistecca di manzo (controfiletto)', k:180, p:21, c:0, f:11, cat:'carne', al:['bistecca','controfiletto','entrecote']},
{id:'macinato-magro', n:'Macinato di manzo magro (5% grassi)', k:137, p:21, c:0, f:5, cat:'carne', al:['macinato','trito','ragù','hamburger magro']},
{id:'macinato', n:'Macinato di manzo (15% grassi)', k:215, p:19, c:0, f:15, cat:'carne', al:['macinato grasso','hamburger']},
{id:'vitello', n:'Vitello magro', k:107, p:21, c:0, f:2.5, cat:'carne', al:['vitello']},
{id:'maiale-lonza', n:'Lonza di maiale', k:143, p:21, c:0, f:6, cat:'carne', al:['maiale','lonza','filetto di maiale']},
{id:'bresaola', n:'Bresaola', k:151, p:32, c:0.5, f:2, cat:'carne', al:['bresaola'], porz:{fetta:12}},
{id:'prosciutto-crudo', n:'Prosciutto crudo magro', k:159, p:28, c:0, f:5, cat:'carne', al:['crudo','prosciutto crudo'], porz:{fetta:15}},
{id:'prosciutto-cotto', n:'Prosciutto cotto', k:132, p:20, c:1, f:5.5, cat:'carne', al:['cotto','prosciutto cotto'], porz:{fetta:20}},
{id:'speck', n:'Speck', k:195, p:29, c:0.5, f:8.5, cat:'carne', al:['speck'], porz:{fetta:12}},
{id:'salame', n:'Salame', k:400, p:26, c:1, f:33, cat:'carne', al:['salame'], porz:{fetta:10}},
{id:'wurstel', n:'Würstel', k:270, p:12, c:2, f:24, cat:'carne', al:['wurstel','hot dog'], porz:{pezzo:50}},

/* ---------- PESCE ---------- */
{id:'salmone', n:'Salmone fresco', k:185, p:20, c:0, f:12, cat:'pesce', al:['salmone']},
{id:'salmone-affumicato', n:'Salmone affumicato', k:147, p:25, c:0, f:5, cat:'pesce', al:['salmone affumicato'], porz:{fetta:20}},
{id:'tonno-naturale', w:1, n:'Tonno al naturale (sgocciolato)', k:103, p:24, c:0, f:0.8, cat:'pesce', al:['tonno','tonno al naturale'], porz:{scatoletta:80}},
{id:'tonno-olio', n:'Tonno sott\'olio (sgocciolato)', k:192, p:25, c:0, f:10, cat:'pesce', al:['tonno olio'], porz:{scatoletta:80}},
{id:'tonno-fresco', n:'Tonno fresco', k:159, p:21, c:0, f:8, cat:'pesce', al:['tonno fresco','tonno pinne gialle']},
{id:'merluzzo', n:'Merluzzo / nasello', k:82, p:17, c:0, f:0.7, cat:'pesce', al:['merluzzo','nasello','baccalà fresco']},
{id:'orata', n:'Orata', k:121, p:20, c:0, f:4.5, cat:'pesce', al:['orata']},
{id:'branzino', n:'Branzino / spigola', k:97, p:19, c:0, f:2, cat:'pesce', al:['branzino','spigola']},
{id:'sgombro', n:'Sgombro', k:170, p:17, c:0, f:11, cat:'pesce', al:['sgombro','pesce azzurro','maccarello']},
{id:'alici', n:'Alici / acciughe fresche', k:96, p:17, c:0, f:2.6, cat:'pesce', al:['alici','acciughe','pesce azzurro']},
{id:'sardine', n:'Sardine', k:129, p:21, c:0, f:4.5, cat:'pesce', al:['sardine','pesce azzurro']},
{id:'gamberi', n:'Gamberi', k:71, p:13.6, c:0, f:0.6, cat:'pesce', al:['gamberi','gamberetti','mazzancolle']},
{id:'calamari', n:'Calamari / seppie', k:68, p:12.6, c:0.7, f:1.3, cat:'pesce', al:['calamari','seppie','totano']},
{id:'polpo', n:'Polpo', k:57, p:10.6, c:1.4, f:1, cat:'pesce', al:['polpo','moscardini']},

/* ---------- UOVA ---------- */
{id:'uovo', w:1, n:'Uovo di gallina intero', k:143, p:12.4, c:0.7, f:9.5, cat:'uova', al:['uovo','uova'], porz:{uovo:55, pezzo:55}},
{id:'albume', n:'Albume', k:52, p:11, c:0.7, f:0.2, cat:'uova', al:['albume','bianco d\'uovo','chiara'], porz:{albume:33}},
{id:'tuorlo', n:'Tuorlo', k:325, p:16, c:0.6, f:29, cat:'uova', al:['tuorlo','rosso d\'uovo'], porz:{tuorlo:17}},

/* ---------- LATTE E DERIVATI ---------- */
{id:'latte-intero', n:'Latte intero', k:64, p:3.3, c:4.9, f:3.6, cat:'latticini', u:'ml', al:['latte intero'], porz:{bicchiere:200, tazza:250}},
{id:'latte-ps', w:1, n:'Latte parzialmente scremato', k:46, p:3.3, c:5, f:1.5, cat:'latticini', u:'ml', al:['latte','latte parzialmente scremato'], porz:{bicchiere:200, tazza:250}},
{id:'latte-scremato', n:'Latte scremato', k:36, p:3.4, c:5.2, f:0.2, cat:'latticini', u:'ml', al:['latte scremato'], porz:{bicchiere:200, tazza:250}},
{id:'bevanda-soia', n:'Bevanda di soia non zuccherata', k:38, p:3.3, c:1.2, f:2, cat:'latticini', u:'ml', al:['latte di soia','soia'], porz:{bicchiere:200}},
{id:'bevanda-mandorla', n:'Bevanda di mandorla non zuccherata', k:24, p:0.6, c:1, f:1.9, cat:'latticini', u:'ml', al:['latte di mandorla'], porz:{bicchiere:200}},
{id:'yogurt-greco0', w:1, n:'Yogurt greco 0%', k:57, p:10, c:4, f:0.2, cat:'latticini', al:['yogurt greco','greco 0','skyr'], porz:{vasetto:150, vasetto_piccolo:125}},
{id:'yogurt-greco2', n:'Yogurt greco 2%', k:73, p:9, c:4, f:2, cat:'latticini', al:['yogurt greco 2'], porz:{vasetto:150}},
{id:'yogurt-bianco', n:'Yogurt bianco intero', k:66, p:3.8, c:4.3, f:3.9, cat:'latticini', al:['yogurt','yogurt intero'], porz:{vasetto:125}},
{id:'yogurt-magro', n:'Yogurt bianco magro', k:36, p:3.3, c:4.3, f:0.9, cat:'latticini', al:['yogurt magro'], porz:{vasetto:125}},
{id:'grana', w:1, n:'Grana Padano / Parmigiano', k:392, p:33, c:0, f:29, cat:'latticini', al:['grana','parmigiano','parmigiano reggiano'], porz:{cucchiaio:8}},
{id:'ricotta-vaccina', n:'Ricotta vaccina', k:146, p:8.8, c:3.5, f:10.9, cat:'latticini', al:['ricotta']},
{id:'fiocchi-latte', n:'Fiocchi di latte (cottage)', k:98, p:12, c:3.4, f:4, cat:'latticini', al:['fiocchi di latte','cottage cheese']},
{id:'mozzarella', n:'Mozzarella vaccina', k:253, p:18.7, c:0.7, f:19.5, cat:'latticini', al:['mozzarella','fiordilatte'], porz:{mozzarella:125}},
{id:'mozzarella-bufala', n:'Mozzarella di bufala', k:288, p:16.7, c:0.4, f:24.4, cat:'latticini', al:['bufala'], porz:{mozzarella:125}},
{id:'philadelphia', n:'Formaggio spalmabile', k:236, p:6, c:4, f:22, cat:'latticini', al:['philadelphia','formaggio spalmabile'], porz:{cucchiaio:15}},
{id:'formaggio-stagionato', n:'Formaggio stagionato (pecorino, provolone)', k:392, p:26, c:1, f:32, cat:'latticini', al:['pecorino','provolone','formaggio stagionato','emmental']},
{id:'burro', n:'Burro', k:758, p:0.8, c:1, f:83, cat:'latticini', al:['burro'], porz:{noce:10, cucchiaino:5}},

/* ---------- LEGUMI ---------- */
{id:'ceci-scatola', n:'Ceci in scatola (sgocciolati)', k:120, p:7, c:16, f:2.5, cat:'legumi', al:['ceci','legumi in scatola'], porz:{scatola:240}},
{id:'fagioli-scatola', n:'Fagioli in scatola (sgocciolati)', k:91, p:6.5, c:12, f:0.5, cat:'legumi', al:['fagioli','borlotti','cannellini','legumi in scatola'], porz:{scatola:240}},
{id:'lenticchie-scatola', n:'Lenticchie in scatola (sgocciolate)', k:92, p:6.9, c:12, f:0.5, cat:'legumi', al:['lenticchie','legumi in scatola'], porz:{scatola:240}},
{id:'ceci-secchi', n:'Ceci secchi', k:343, p:19, c:47, f:6, cat:'legumi', al:['ceci secchi']},
{id:'lenticchie-secche', n:'Lenticchie secche', k:325, p:23, c:51, f:1, cat:'legumi', al:['lenticchie secche']},
{id:'fagioli-secchi', n:'Fagioli secchi', k:311, p:23, c:47, f:2, cat:'legumi', al:['fagioli secchi']},
{id:'piselli', n:'Piselli surgelati', k:76, p:5.5, c:9, f:0.5, cat:'legumi', al:['piselli']},
{id:'edamame', n:'Edamame', k:122, p:11, c:5, f:5, cat:'legumi', al:['edamame','soia verde']},
{id:'tofu', n:'Tofu', k:76, p:8, c:1.9, f:4.8, cat:'legumi', al:['tofu']},
{id:'hummus', n:'Hummus', k:177, p:7.4, c:14, f:9.6, cat:'legumi', al:['hummus'], porz:{cucchiaio:20}},

/* ---------- VERDURA ---------- */
{id:'verdura-mista', n:'Verdura mista (media)', k:25, p:1.8, c:3.5, f:0.3, cat:'verdura', al:['verdura','contorno','insalata mista','verdure']},
{id:'insalata', n:'Insalata (lattuga)', k:19, p:1.8, c:2.2, f:0.4, cat:'verdura', al:['insalata','lattuga','songino']},
{id:'pomodori', n:'Pomodori', k:19, p:1, c:3.5, f:0.2, cat:'verdura', al:['pomodoro','pomodorini','ciliegino']},
{id:'zucchine', n:'Zucchine', k:11, p:1.3, c:1.4, f:0.1, cat:'verdura', al:['zucchina','zucchine']},
{id:'melanzane', n:'Melanzane', k:18, p:1.1, c:2.6, f:0.4, cat:'verdura', al:['melanzana']},
{id:'peperoni', n:'Peperoni', k:22, p:0.9, c:4.2, f:0.3, cat:'verdura', al:['peperone']},
{id:'broccoli', n:'Broccoli', k:27, p:3, c:3.1, f:0.4, cat:'verdura', al:['broccolo','cime di rapa']},
{id:'spinaci', n:'Spinaci', k:31, p:3.4, c:3, f:0.7, cat:'verdura', al:['spinaci']},
{id:'finocchi', n:'Finocchi', k:9, p:1.2, c:1, f:0.2, cat:'verdura', al:['finocchio']},
{id:'carote', n:'Carote', k:35, p:1.1, c:7.6, f:0.2, cat:'verdura', al:['carota']},
{id:'cavolfiore', n:'Cavolfiore', k:25, p:3.2, c:2.7, f:0.2, cat:'verdura', al:['cavolfiore','cavolo']},
{id:'fagiolini', n:'Fagiolini', k:18, p:2.1, c:2.4, f:0.1, cat:'verdura', al:['fagiolini']},
{id:'funghi', n:'Funghi champignon', k:20, p:3.7, c:0.8, f:0.2, cat:'verdura', al:['funghi','champignon']},
{id:'passata', n:'Passata di pomodoro', k:32, p:1.5, c:5.8, f:0.3, cat:'verdura', al:['passata','sugo di pomodoro','pelati'], porz:{cucchiaio:15}},
{id:'rucola', n:'Rucola', k:28, p:2.6, c:3.7, f:0.7, cat:'verdura', al:['rucola']},

/* ---------- FRUTTA ---------- */
{id:'mela', w:1, n:'Mela', k:53, p:0.3, c:13, f:0.1, cat:'frutta', al:['mela'], porz:{mela:180, pezzo:180}},
{id:'banana', w:1, n:'Banana', k:89, p:1.1, c:23, f:0.3, cat:'frutta', al:['banana'], porz:{banana:120, pezzo:120}},
{id:'pera', n:'Pera', k:57, p:0.4, c:15, f:0.1, cat:'frutta', al:['pera'], porz:{pera:180, pezzo:180}},
{id:'arancia', n:'Arancia', k:47, p:0.9, c:12, f:0.1, cat:'frutta', al:['arancia'], porz:{arancia:200, pezzo:200}},
{id:'kiwi', n:'Kiwi', k:61, p:1.1, c:15, f:0.5, cat:'frutta', al:['kiwi'], porz:{kiwi:90, pezzo:90}},
{id:'fragole', n:'Fragole', k:32, p:0.7, c:7.7, f:0.3, cat:'frutta', al:['fragola','fragole']},
{id:'ananas', n:'Ananas', k:50, p:0.5, c:13, f:0.1, cat:'frutta', al:['ananas']},
{id:'pesca', n:'Pesca', k:39, p:0.9, c:9.5, f:0.3, cat:'frutta', al:['pesca'], porz:{pesca:150, pezzo:150}},
{id:'uva', n:'Uva', k:69, p:0.7, c:18, f:0.2, cat:'frutta', al:['uva']},
{id:'anguria', n:'Anguria', k:30, p:0.6, c:7.6, f:0.2, cat:'frutta', al:['anguria','cocomero','melone rosso']},
{id:'melone', n:'Melone', k:34, p:0.8, c:8, f:0.2, cat:'frutta', al:['melone']},
{id:'mirtilli', n:'Mirtilli', k:57, p:0.7, c:14, f:0.3, cat:'frutta', al:['mirtilli','frutti di bosco']},
{id:'avocado', n:'Avocado', k:160, p:2, c:1.8, f:15, cat:'frutta', al:['avocado'], porz:{avocado:150}},
{id:'frutta-generica', n:'Frutto (medio)', k:55, p:0.6, c:13, f:0.2, cat:'frutta', al:['frutto','frutta','1 frutto'], porz:{frutto:160, pezzo:160}},

/* ---------- FRUTTA SECCA E SEMI ---------- */
{id:'mandorle', n:'Mandorle', k:603, p:22, c:4.6, f:55, cat:'frutsecca', al:['mandorle','frutta secca'], porz:{mandorla:1.2}},
{id:'noci', n:'Noci', k:654, p:15, c:5, f:65, cat:'frutsecca', al:['noci','noce','frutta secca'], porz:{noce:5}},
{id:'nocciole', n:'Nocciole', k:628, p:15, c:5, f:61, cat:'frutsecca', al:['nocciole','frutta secca']},
{id:'anacardi', n:'Anacardi', k:553, p:18, c:30, f:44, cat:'frutsecca', al:['anacardi','frutta secca']},
{id:'pistacchi', n:'Pistacchi', k:560, p:20, c:28, f:45, cat:'frutsecca', al:['pistacchi','frutta secca']},
{id:'arachidi', n:'Arachidi', k:598, p:26, c:16, f:49, cat:'frutsecca', al:['arachidi','noccioline']},
{id:'burro-arachidi', n:'Burro di arachidi', k:588, p:25, c:20, f:50, cat:'frutsecca', al:['burro di arachidi','peanut butter'], porz:{cucchiaio:16, cucchiaino:8}},
{id:'semi-chia', n:'Semi di chia', k:486, p:17, c:42, f:31, cat:'frutsecca', al:['chia','semi']},
{id:'semi-lino', n:'Semi di lino', k:534, p:18, c:29, f:42, cat:'frutsecca', al:['lino','semi']},
{id:'datteri', n:'Datteri', k:277, p:1.8, c:75, f:0.2, cat:'frutsecca', al:['datteri'], porz:{dattero:8}},
{id:'frutta-secca-mix', n:'Frutta secca mista', k:610, p:18, c:12, f:54, cat:'frutsecca', al:['frutta secca','mix frutta secca']},

/* ---------- CONDIMENTI E GRASSI ---------- */
{id:'olio-evo', w:1, n:'Olio extravergine di oliva', k:899, p:0, c:0, f:99.9, cat:'grassi', u:'ml', al:['olio','olio evo','olio di oliva'], porz:{cucchiaio:10, cucchiaino:5}},
{id:'olio-semi', n:'Olio di semi', k:899, p:0, c:0, f:99.9, cat:'grassi', u:'ml', al:['olio di semi','girasole'], porz:{cucchiaio:10, cucchiaino:5}},
{id:'aceto-balsamico', n:'Aceto balsamico', k:88, p:0.5, c:17, f:0, cat:'grassi', u:'ml', al:['aceto','balsamico'], porz:{cucchiaio:15}},
{id:'maionese', n:'Maionese', k:655, p:1.1, c:1.5, f:72, cat:'grassi', al:['maionese'], porz:{cucchiaio:15}},
{id:'ketchup', n:'Ketchup', k:98, p:1.2, c:23, f:0.1, cat:'grassi', al:['ketchup'], porz:{cucchiaio:15}},
{id:'salsa-soia', n:'Salsa di soia', k:53, p:5.5, c:5, f:0.1, cat:'grassi', u:'ml', al:['salsa di soia'], porz:{cucchiaio:15}},
{id:'zucchero', n:'Zucchero', k:392, p:0, c:100, f:0, cat:'grassi', al:['zucchero'], porz:{cucchiaino:5, zolletta:5, bustina:5}},
{id:'miele', n:'Miele', k:304, p:0.6, c:80, f:0, cat:'grassi', al:['miele'], porz:{cucchiaino:7, cucchiaio:20}},

/* ---------- DOLCI E SNACK ---------- */
{id:'biscotti-secchi', n:'Biscotti secchi', k:416, p:7, c:76, f:9, cat:'dolci', al:['biscotti','frollini'], porz:{biscotto:8}},
{id:'cioccolato-fondente', n:'Cioccolato fondente 70%', k:579, p:8, c:33, f:43, cat:'dolci', al:['cioccolato','fondente'], porz:{quadretto:5, tavoletta:100}},
{id:'cioccolato-latte', n:'Cioccolato al latte', k:545, p:7.3, c:57, f:31, cat:'dolci', al:['cioccolato al latte'], porz:{quadretto:5}},
{id:'crema-nocciola', n:'Crema di nocciole', k:539, p:6, c:57, f:31, cat:'dolci', al:['nutella','crema spalmabile'], porz:{cucchiaio:15, cucchiaino:7}},
{id:'cornetto', n:'Cornetto / brioche', k:410, p:7, c:47, f:21, cat:'dolci', al:['cornetto','brioche','croissant'], porz:{cornetto:60}},
{id:'gelato', n:'Gelato (media)', k:207, p:4, c:24, f:11, cat:'dolci', al:['gelato'], porz:{coppetta:100, cono:120, pallina:50}},
{id:'patatine', n:'Patatine in busta', k:536, p:6, c:53, f:33, cat:'dolci', al:['patatine','chips'], porz:{busta:25}},
{id:'barretta-proteica', n:'Barretta proteica', k:370, p:32, c:32, f:12, cat:'dolci', al:['barretta','protein bar'], porz:{barretta:50}},
{id:'torta', n:'Torta da forno (media)', k:370, p:5, c:50, f:16, cat:'dolci', al:['torta','dolce'], porz:{fetta:80}},

/* ---------- BEVANDE ---------- */
{id:'acqua', n:'Acqua', k:0, p:0, c:0, f:0, cat:'bevande', u:'ml', al:['acqua'], porz:{bicchiere:200, bottiglia:500}},
{id:'caffe', n:'Caffè espresso (senza zucchero)', k:2, p:0.1, c:0.3, f:0, cat:'bevande', u:'ml', al:['caffè','espresso'], porz:{tazzina:30}},
{id:'cappuccino', n:'Cappuccino', k:54, p:3, c:5, f:2, cat:'bevande', u:'ml', al:['cappuccino'], porz:{tazza:150}},
{id:'te', n:'Tè / tisana senza zucchero', k:1, p:0, c:0.2, f:0, cat:'bevande', u:'ml', al:['tè','tisana','the'], porz:{tazza:250}},
{id:'bibita-zucchero', n:'Bibita zuccherata (cola, aranciata)', k:42, p:0, c:10.6, f:0, cat:'bevande', u:'ml', al:['bibita','coca cola','aranciata','fanta'], porz:{lattina:330, bicchiere:200, bottiglia:500}},
{id:'bibita-zero', n:'Bibita zero / light', k:1, p:0, c:0, f:0, cat:'bevande', u:'ml', al:['bibita zero','coca zero','light'], porz:{lattina:330}},
{id:'succo', n:'Succo di frutta', k:47, p:0.3, c:11, f:0.1, cat:'bevande', u:'ml', al:['succo','spremuta'], porz:{brick:200, bicchiere:200}},
{id:'birra', n:'Birra chiara', k:43, p:0.5, c:3.6, f:0, cat:'bevande', u:'ml', al:['birra'], porz:{media:400, piccola:200, bottiglia:330}},
{id:'vino-rosso', n:'Vino rosso', k:85, p:0.2, c:2.6, f:0, cat:'bevande', u:'ml', al:['vino','vino rosso'], porz:{bicchiere:125}},
{id:'vino-bianco', n:'Vino bianco', k:79, p:0.1, c:2.5, f:0, cat:'bevande', u:'ml', al:['vino bianco'], porz:{bicchiere:125}},

/* ---------- INTEGRATORI ---------- */
{id:'whey', w:1, n:'Proteine in polvere (whey)', k:390, p:80, c:6, f:5, cat:'integr', al:['proteine','whey','proteine in polvere','shake'], porz:{misurino:30, scoop:30}},
{id:'caseine', n:'Caseine', k:370, p:78, c:5, f:2, cat:'integr', al:['caseine'], porz:{misurino:30}},
{id:'creatina', n:'Creatina monoidrato', k:0, p:0, c:0, f:0, cat:'integr', al:['creatina'], porz:{cucchiaino:5, misurino:5}},
{id:'maltodestrine', n:'Maltodestrine', k:380, p:0, c:95, f:0, cat:'integr', al:['maltodestrine','carbo']},

/* ---------- PIATTI PRONTI E FUORI CASA ---------- */
{id:'pizza-margherita', n:'Pizza margherita', k:270, p:11, c:35, f:9, cat:'pronti', al:['pizza','margherita'], porz:{pizza:330, trancio:120}},
{id:'pizza-farcita', n:'Pizza farcita (diavola, capricciosa)', k:300, p:12, c:32, f:13, cat:'pronti', al:['pizza diavola','capricciosa','pizza farcita'], porz:{pizza:350}},
{id:'panino-farcito', n:'Panino farcito (medio)', k:250, p:12, c:28, f:10, cat:'pronti', al:['panino','sandwich','toast'], porz:{panino:200}},
{id:'insalata-pollo', n:'Insalatona con pollo', k:110, p:11, c:5, f:5, cat:'pronti', al:['insalatona','insalata di pollo'], porz:{porzione:350}},
{id:'sushi', n:'Sushi (media)', k:145, p:7, c:25, f:2, cat:'pronti', al:['sushi','nigiri','uramaki'], porz:{pezzo:30}},
{id:'poke', n:'Poke bowl (media)', k:150, p:9, c:19, f:4.5, cat:'pronti', al:['poke','poke bowl'], porz:{porzione:450}},
{id:'lasagne', n:'Lasagne al forno', k:180, p:9, c:15, f:9, cat:'pronti', al:['lasagne','pasta al forno'], porz:{porzione:300}},
{id:'kebab', n:'Kebab con piadina', k:215, p:13, c:20, f:9.5, cat:'pronti', al:['kebab'], porz:{porzione:350}},
{id:'hamburger-panino', n:'Hamburger nel panino (fast food)', k:255, p:13, c:24, f:12, cat:'pronti', al:['hamburger','burger','mcdonald'], porz:{panino:220}},
{id:'patatine-fritte', n:'Patatine fritte', k:312, p:3.4, c:41, f:15, cat:'pronti', al:['patatine fritte','french fries'], porz:{porzione:150}}

];

/* ---------- indice di ricerca ---------- */
const foodNorm = s => String(s||'').toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();

const FOOD_CAT_NOME = Object.fromEntries(FOOD_CAT.map(c=>[c.id,c.n]));
FOOD_DB.forEach(f=>{ f._s = foodNorm(f.n+' '+(f.al||[]).join(' ')+' '+FOOD_CAT_NOME[f.cat]); });
const FOOD_BY_ID = Object.fromEntries(FOOD_DB.map(f=>[f.id,f]));

/* ============================================================
   PARSER DELLE QUANTITÀ
   "150 g" · "2 cucchiai" · "1 vasetto" · "mezza scatoletta"
   · "200ml" · "3" (pezzi) · "1 e 1/2 fetta"
   Restituisce i grammi (o ml) corrispondenti, usando le porzioni
   dell'alimento e in fallback quelle generiche.
   ============================================================ */
const NUM_PAROLA = {mezzo:.5, mezza:.5, meta:.5, un:1, uno:1, una:1, due:2, tre:3, quattro:4,
  cinque:5, sei:6, sette:7, otto:8, nove:9, dieci:10, dodici:12};

// singolare/plurale delle porzioni: "2 cucchiai" → cucchiaio, "3 fette" → fetta
function porzKey(word, table){
  const w = foodNorm(word);
  if(!w) return null;
  const cand = [w, w.replace(/i$/,'o'), w.replace(/e$/,'a'), w.replace(/i$/,'e'), w+'o', w+'a'];
  for(const c of cand){ if(table[c]!=null) return c; }
  return null;
}

// come foodNorm ma conserva / . , perché servono a "1/2" e "1,5"
const qtaNorm = s => String(s||'').toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9\/., ]/g,' ').replace(/\s+/g,' ').trim();

function parseQta(str, food){
  if(!String(str||'').trim()) return null;
  const s = qtaNorm(str);
  const table = Object.assign({}, PORZ_GENERICHE, (food && food.porz) || {});
  const unita = (food && food.u) === 'ml' ? 'ml' : 'g';

  // quantità numerica: "1,5" · "1/2" · "1 e 1/2" · parole ("due", "mezzo")
  let n = null;
  const misto = s.match(/(\d+)\s+e\s+(\d+)\s*\/\s*(\d+)/);   // "1 e 1/2"
  const frac  = s.match(/(\d+)\s*\/\s*(\d+)/);               // "1/2"
  const dec   = s.match(/(\d+(?:[.,]\d+)?)/);                // "150" · "1,5"
  if(misto)     n = parseInt(misto[1]) + parseInt(misto[2])/parseInt(misto[3]);
  else if(frac) n = parseInt(frac[1]) / parseInt(frac[2]);
  else if(dec)  n = parseFloat(dec[1].replace(',','.'));
  else { for(const [w,v] of Object.entries(NUM_PAROLA)) if(new RegExp('\\b'+w+'\\b').test(s)) { n = v; break; } }
  const conNumero = n != null;
  if(!conNumero) n = 1;

  // unità di peso/volume esplicita
  if(/\bkg\b|\bkilo/.test(s))      return {g:n*1000, unita:'g', modo:'peso'};
  if(/\b(l|lt|litri?)\b/.test(s))  return {g:n*1000, unita:'ml', modo:'peso'};
  if(/\bcl\b/.test(s))             return {g:n*10, unita:'ml', modo:'peso'};
  if(/\bml\b/.test(s))             return {g:n, unita:'ml', modo:'peso'};
  if(/\b(g|gr|grammi?|etti?|etto)\b/.test(s))
    return {g:/\bett/.test(s) ? n*100 : n, unita:'g', modo:'peso'};

  // porzione casalinga nominata ("2 cucchiai", "1 vasetto", "3 fette")
  const parole = s.replace(/[\d\/.,]+/g,' ').split(' ').filter(Boolean);
  for(const w of parole){
    const k = porzKey(w, table);
    if(k) return {g:n*table[k], unita, modo:'porzione', porzione:k};
  }
  // niente numero, niente unità, niente porzione: è un refuso.
  // Meglio dirlo che spacciare "abc" per 1 grammo.
  if(!conNumero) return null;
  // numero nudo: "1" su una mela = 1 mela, ma "150" su del pane = 150 g.
  // Interpretiamo a pezzi solo se il numero è plausibile come conteggio (≤12)
  // e la porzione è un pezzo intero (≥20 g), non una mandorla o un quadretto.
  if(food && food.porz){
    const first = Object.keys(food.porz)[0], size = food.porz[first];
    if(n <= 12 && size >= 20) return {g:n*size, unita, modo:'porzione', porzione:first};
  }
  return {g:n, unita, modo:'peso'};   // altrimenti: grammi (o ml)
}

/* Calcola kcal e macro di un alimento data una quantità testuale.
   Torna null se la quantità non è interpretabile. */
function calcNutr(foodId, qta){
  const f = FOOD_BY_ID[foodId];
  if(!f) return null;
  const q = parseQta(qta, f);
  if(!q || !(q.g > 0)) return null;
  const r = q.g / 100;
  return {
    g: Math.round(q.g * 10) / 10,
    unita: q.unita,
    k: Math.round(f.k * r),
    p: Math.round(f.p * r * 10) / 10,
    c: Math.round(f.c * r * 10) / 10,
    f: Math.round(f.f * r * 10) / 10
  };
}

/* Quantità di default suggerita quando scegli un alimento */
function qtaDefault(f){
  if(!f) return '100 g';
  if(f.porz){
    const k = Object.keys(f.porz)[0];
    return '1 ' + k.replace(/_/g,' ');
  }
  return (f.u === 'ml' ? '200 ml' : '100 g');
}

/* Ricerca alimenti: match su nome, alias e categoria, i più corti prima */
function searchFood(q, cat){
  const s = foodNorm(q);
  let list = FOOD_DB;
  if(cat) list = list.filter(f => f.cat === cat);
  if(!s) return list.slice(0, 40);
  const terms = s.split(' ').filter(Boolean);
  return list
    .filter(f => terms.every(t => f._s.includes(t)))
    .sort((a, b) => {
      const ai = a._s.indexOf(terms[0]), bi = b._s.indexOf(terms[0]);
      return ((b.w||0) - (a.w||0)) || (ai - bi) || (a.n.length - b.n.length);
    })
    .slice(0, 40);
}
