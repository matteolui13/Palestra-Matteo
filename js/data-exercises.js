/* ============================================================
   FIT·LOG — LIBRERIA ESERCIZI (italiana, offline)

   Sostituisce la vecchia libreria Everkinetic scaricata a runtime:
   quella era in inglese, con soli 293 esercizi sbilanciati (56 di
   bicipiti contro 14 di dorso), 24 senza illustrazione e nessun
   nome delle macchine come le chiamiamo in palestra.

   Qui gli esercizi sono catalogati con i nomi italiani reali, quelli
   che si usano in una sala attrezzata (linea Panatta e simili):
   Pressa 45°, Hack Squat, Pendulum Squat, Belt Squat, Glute Drive,
   Chest Press convergente, Pectoral Machine, Rear Delt, Lat Machine,
   Low Row, Pulldown, Leg Extension, Leg Curl, Adductor/Abductor,
   Calf seduto/in piedi, Panca Scott, Multipower, Cable Cross…
   Gli alias (`al`) servono alla ricerca: puoi cercare "glute drive",
   "hip thrust", "pressa", "leg press" o "45" e trovi lo stesso esercizio.

   CAMPI
     id  identificativo stabile (non cambiarlo: le schede lo salvano)
     n   nome italiano
     al  alias di ricerca (nomi macchina, inglese, gergo)
     g   gruppo muscolare  → EX_GRUPPI
     m   muscoli coinvolti (il primo è il primario)
     at  attrezzo          → EX_ATTREZZI
     t   'multiarticolare' | 'isolamento'
     ek  id illustrazione Everkinetic (CC BY-SA 4.0) o null se non
         esiste un disegno che rappresenti davvero il movimento:
         meglio nessuna figura che una figura sbagliata
     ex  esecuzione, in italiano, già pronta (niente traduzione AI)
   ============================================================ */

const EX_GRUPPI = [
  {id:'petto',     n:'Petto'},
  {id:'dorso',     n:'Dorso'},
  {id:'spalle',    n:'Spalle'},
  {id:'bicipiti',  n:'Bicipiti'},
  {id:'tricipiti', n:'Tricipiti'},
  {id:'gambe',     n:'Gambe'},
  {id:'glutei',    n:'Glutei'},
  {id:'polpacci',  n:'Polpacci'},
  {id:'addome',    n:'Addome'}
];

const EX_ATTREZZI = [
  {id:'macchina',    n:'Macchina'},
  {id:'bilanciere',  n:'Bilanciere'},
  {id:'manubri',     n:'Manubri'},
  {id:'cavi',        n:'Cavi'},
  {id:'multipower',  n:'Multipower'},
  {id:'corpolibero', n:'Corpo libero'}
];

const EX_LIB = [

/* ==================== PETTO ==================== */
{id:'pet-panca-bil', n:'Panca piana con bilanciere', al:['bench press','distensioni su panca piana','piana'], g:'petto', m:['pettorali','tricipiti','deltoide anteriore'], at:'bilanciere', t:'multiarticolare', ek:'0042', ex:[
 'Sdraiati sulla panca con i piedi ben piantati a terra e le scapole addotte e depresse.',
 'Impugna il bilanciere poco più largo delle spalle e staccalo dai supporti sopra lo sterno.',
 'Scendi controllato fino a sfiorare il petto, gomiti a circa 45° dal busto.',
 'Spingi verso l\'alto senza far rimbalzare il bilanciere sul torace.']},

{id:'pet-panca-man', n:'Panca piana con manubri', al:['dumbbell bench press','distensioni con manubri'], g:'petto', m:['pettorali','tricipiti','deltoide anteriore'], at:'manubri', t:'multiarticolare', ek:'0055', ex:[
 'Siediti sulla panca con i manubri sulle cosce, poi sdraiati accompagnandoli al petto.',
 'Parti con i manubri all\'altezza del petto, gomiti sotto ai polsi.',
 'Spingi in alto avvicinando leggermente i manubri, senza farli sbattere.',
 'Scendi lentamente fino a sentire l\'allungamento sul pettorale.']},

{id:'pet-inc-bil', n:'Panca inclinata con bilanciere', al:['incline bench press','inclinata bilanciere','30 gradi'], g:'petto', m:['pettorale alto','deltoide anteriore','tricipiti'], at:'bilanciere', t:'multiarticolare', ek:'0043', ex:[
 'Regola lo schienale a 30-45°: oltre i 45° il lavoro passa quasi tutto sulle spalle.',
 'Impugna il bilanciere poco più largo delle spalle, scapole addotte.',
 'Scendi verso la parte alta del petto, appena sotto le clavicole.',
 'Spingi in alto senza staccare la schiena dallo schienale.']},

{id:'pet-inc-man', n:'Panca inclinata con manubri', al:['incline dumbbell press','inclinata manubri'], g:'petto', m:['pettorale alto','deltoide anteriore','tricipiti'], at:'manubri', t:'multiarticolare', ek:'0061', ex:[
 'Schienale a 30-45°, manubri all\'altezza delle spalle.',
 'Spingi verso l\'alto lungo una traiettoria leggermente convergente.',
 'Controlla la discesa fino a sentire il pettorale alto in allungamento.']},

{id:'pet-dec-bil', n:'Panca declinata con bilanciere', al:['decline bench press','declinata'], g:'petto', m:['pettorale basso','tricipiti'], at:'bilanciere', t:'multiarticolare', ek:'0051', ex:[
 'Blocca le gambe negli appoggi della panca declinata.',
 'Stacca il bilanciere e portalo sopra la parte bassa del petto.',
 'Scendi fino a sfiorare il torace e spingi, mantenendo i gomiti raccolti.']},

{id:'pet-dec-man', n:'Panca declinata con manubri', al:['decline dumbbell press'], g:'petto', m:['pettorale basso','tricipiti'], at:'manubri', t:'multiarticolare', ek:'0052', ex:[
 'Blocca le gambe e parti con i manubri ai lati del petto basso.',
 'Spingi verso l\'alto convergendo leggermente.',
 'Scendi controllato senza perdere la posizione delle scapole.']},

{id:'pet-chest-press', n:'Chest press alla macchina', al:['chest press','pectoral press','macchina pettorali','chest press convergente','panatta chest press'], g:'petto', m:['pettorali','tricipiti','deltoide anteriore'], at:'macchina', t:'multiarticolare', ek:'0066', ex:[
 'Regola il sedile in modo che le maniglie siano all\'altezza della linea capezzoli.',
 'Schiena e scapole appoggiate allo schienale, piedi a terra.',
 'Spingi in avanti fino quasi al blocco dei gomiti, senza incassare le spalle.',
 'Torna indietro lentamente fermandoti prima che le spalle vengano tirate avanti.']},

{id:'pet-chest-press-inc', n:'Chest press inclinata alla macchina', al:['incline chest press','chest press alto','shoulder chest press'], g:'petto', m:['pettorale alto','deltoide anteriore','tricipiti'], at:'macchina', t:'multiarticolare', ek:null, ex:[
 'Impugna le maniglie alte con il petto in fuori e le scapole appoggiate.',
 'Spingi in avanti e leggermente verso l\'alto.',
 'Rientra controllato, mantenendo la tensione sul pettorale alto.']},

{id:'pet-pectoral', n:'Pectoral machine (butterfly)', al:['pectoral machine','butterfly','peck deck','macchina croci','panatta pectoral'], g:'petto', m:['pettorali'], at:'macchina', t:'isolamento', ek:null, ex:[
 'Siedi con la schiena aderente e i gomiti all\'altezza delle spalle.',
 'Chiudi le braccia davanti al petto stringendo i pettorali, senza sbattere le maniglie.',
 'Riapri lentamente fino a sentire l\'allungamento, senza superare la linea del busto.']},

{id:'pet-croci-piana', n:'Croci su panca piana con manubri', al:['dumbbell fly','croci manubri','aperture'], g:'petto', m:['pettorali'], at:'manubri', t:'isolamento', ek:'0056', ex:[
 'Sdraiato sulla panca, manubri sopra il petto con i gomiti leggermente flessi.',
 'Apri le braccia ad arco fino all\'altezza delle spalle: il gomito resta fisso.',
 'Richiudi contraendo i pettorali, come se abbracciassi un tronco.']},

{id:'pet-croci-inc', n:'Croci su panca inclinata con manubri', al:['incline fly','croci inclinate'], g:'petto', m:['pettorale alto'], at:'manubri', t:'isolamento', ek:'0062', ex:[
 'Schienale a 30°, manubri sopra il petto con gomiti morbidi.',
 'Apri ad arco controllando l\'allungamento del pettorale alto.',
 'Richiudi senza far toccare i manubri, mantenendo la tensione.']},

{id:'pet-cable-cross', n:'Croci ai cavi alti (cable cross)', al:['cable crossover','cable cross','croci ai cavi','crossover'], g:'petto', m:['pettorali'], at:'cavi', t:'isolamento', ek:'0048', ex:[
 'Cavi in alto, un passo avanti al centro con il busto leggermente inclinato.',
 'Porta le maniglie verso il basso e al centro incrociando davanti all\'addome.',
 'Torna su lentamente fino all\'allungamento, gomiti sempre morbidi.']},

{id:'pet-cable-basso', n:'Croci ai cavi bassi', al:['low cable fly','croci basse','cavi dal basso'], g:'petto', m:['pettorale alto'], at:'cavi', t:'isolamento', ek:null, ex:[
 'Cavi in basso, maniglie ai fianchi, busto leggermente inclinato in avanti.',
 'Porta le mani verso l\'alto e al centro, all\'altezza delle clavicole.',
 'Scendi controllato mantenendo i gomiti fissi.']},

{id:'pet-croci-cavi-panca', n:'Croci ai cavi su panca piana', al:['flat bench cable fly'], g:'petto', m:['pettorali'], at:'cavi', t:'isolamento', ek:'0057', ex:[
 'Panca al centro della cable cross, cavi bassi, manubri sostituiti dalle maniglie.',
 'Apri e chiudi ad arco come nelle croci, ma con tensione costante.']},

{id:'pet-pullover', n:'Pullover con manubrio', al:['dumbbell pullover','pullover'], g:'petto', m:['pettorali','gran dorsale','tricipiti'], at:'manubri', t:'multiarticolare', ek:'0079', ex:[
 'Sdraiati sulla panca con un manubrio tenuto a due mani sopra il petto.',
 'Porta il manubrio dietro la testa mantenendo i gomiti quasi tesi.',
 'Riporta sopra il petto controllando: non inarcare la zona lombare.']},

{id:'pet-dip', n:'Dip alle parallele (versione petto)', al:['chest dips','parallele','dips'], g:'petto', m:['pettorale basso','tricipiti','deltoide anteriore'], at:'corpolibero', t:'multiarticolare', ek:'0054', ex:[
 'Sali sulle parallele con le braccia tese e il busto inclinato in avanti.',
 'Scendi fino a portare le spalle all\'altezza dei gomiti, gomiti aperti.',
 'Risali spingendo, senza incassare le spalle: se serve usa la macchina ad assistenza.']},

{id:'pet-piegamenti', n:'Piegamenti sulle braccia', al:['push up','flessioni','piegamenti'], g:'petto', m:['pettorali','tricipiti','core'], at:'corpolibero', t:'multiarticolare', ek:'0077', ex:[
 'Mani poco più larghe delle spalle, corpo in linea dalla testa ai talloni.',
 'Scendi fino a sfiorare il pavimento con il petto, gomiti a 45°.',
 'Spingi mantenendo addome e glutei contratti.']},

{id:'pet-panca-mp', n:'Panca piana al multipower', al:['smith machine bench press','panca al multipower','smith'], g:'petto', m:['pettorali','tricipiti'], at:'multipower', t:'multiarticolare', ek:'0078', ex:[
 'Posiziona la panca in modo che il bilanciere scenda sopra lo sterno.',
 'Sblocca i ganci e scendi controllato fino al petto.',
 'Spingi verso l\'alto: il multipower guida la traiettoria, concentrati sulla spinta.']},

{id:'pet-inc-mp', n:'Panca inclinata al multipower', al:['smith machine incline press','inclinata al multipower'], g:'petto', m:['pettorale alto','deltoide anteriore'], at:'multipower', t:'multiarticolare', ek:'0081', ex:[
 'Panca inclinata a 30-45° sotto al bilanciere guidato.',
 'Scendi verso la parte alta del petto e spingi in alto.']},

{id:'pet-panca-stretta', n:'Panca stretta con bilanciere', al:['close grip bench press','panca presa stretta'], g:'petto', m:['tricipiti','pettorali'], at:'bilanciere', t:'multiarticolare', ek:'0049', ex:[
 'Impugna il bilanciere alla larghezza delle spalle, non più stretto.',
 'Scendi tenendo i gomiti vicini al busto, verso la parte bassa del petto.',
 'Spingi concentrandoti sui tricipiti.']},

/* ==================== DORSO ==================== */
{id:'dor-lat-avanti', n:'Lat machine avanti presa larga', al:['lat pulldown','lat machine','pulldown','trazioni alla lat','panatta lat machine'], g:'dorso', m:['gran dorsale','bicipiti','romboidi'], at:'macchina', t:'multiarticolare', ek:'0093', ex:[
 'Regola il cuscinetto sulle cosce in modo da restare bloccato al sedile.',
 'Presa prona più larga delle spalle, petto in fuori e busto leggermente indietro.',
 'Tira la sbarra verso la parte alta del petto portando i gomiti in basso e indietro.',
 'Risali controllando, lasciando allungare il dorsale senza alzarti dal sedile.']},

{id:'dor-lat-inversa', n:'Lat machine presa inversa', al:['reverse grip pulldown','lat presa supina','underhand pulldown'], g:'dorso', m:['gran dorsale','bicipiti'], at:'macchina', t:'multiarticolare', ek:'0095', ex:[
 'Presa supina alla larghezza delle spalle.',
 'Tira verso lo sterno tenendo i gomiti vicini al busto.',
 'Risali lentamente fino al completo allungamento.']},

{id:'dor-lat-neutra', n:'Lat machine presa neutra (triangolo)', al:['v bar pulldown','presa a v','triangolo','close grip pulldown'], g:'dorso', m:['gran dorsale','bicipiti'], at:'macchina', t:'multiarticolare', ek:'0096', ex:[
 'Aggancia la maniglia a V o a triangolo.',
 'Tira verso lo sterno mantenendo il busto quasi verticale.',
 'Controlla la risalita fino all\'allungamento completo.']},

{id:'dor-pulldown', n:'Pulldown alla macchina', al:['pulldown machine','pull down','panatta pulldown','lat machine convergente'], g:'dorso', m:['gran dorsale','romboidi','bicipiti'], at:'macchina', t:'multiarticolare', ek:null, ex:[
 'Siedi con il petto contro il pad e impugna le leve indipendenti.',
 'Tira verso il basso portando i gomiti dietro la linea del corpo.',
 'Risali fino all\'allungamento del dorsale senza staccare il petto dal pad.']},

{id:'dor-trazioni', n:'Trazioni alla sbarra (presa prona)', al:['pull up','trazioni','pullup','sbarra'], g:'dorso', m:['gran dorsale','bicipiti','romboidi'], at:'corpolibero', t:'multiarticolare', ek:'0087', ex:[
 'Presa prona poco più larga delle spalle, corpo compatto.',
 'Tira portando il mento sopra la sbarra, gomiti verso il basso.',
 'Scendi controllato fino a braccia distese senza dondolare.']},

{id:'dor-trazioni-sup', n:'Trazioni presa supina', al:['chin up','trazioni supine','chinup'], g:'dorso', m:['gran dorsale','bicipiti'], at:'corpolibero', t:'multiarticolare', ek:'0091', ex:[
 'Presa supina alla larghezza delle spalle.',
 'Tira portando il petto verso la sbarra.',
 'Scendi controllato: i bicipiti lavorano molto in questa variante.']},

{id:'dor-trazioni-neutre', n:'Trazioni presa neutra', al:['neutral grip pull up','trazioni parallele'], g:'dorso', m:['gran dorsale','bicipiti','brachiale'], at:'corpolibero', t:'multiarticolare', ek:'0090', ex:[
 'Impugna le maniglie parallele, palmi affacciati.',
 'Tira verso l\'alto tenendo i gomiti vicini al busto.',
 'Scendi lentamente a braccia tese.']},

{id:'dor-trazioni-assist', n:'Trazioni alla macchina assistita', al:['assisted pull up','chin assist','macchina trazioni','gravitron'], g:'dorso', m:['gran dorsale','bicipiti'], at:'macchina', t:'multiarticolare', ek:null, ex:[
 'Imposta il contrappeso: più peso metti, più la macchina ti aiuta.',
 'Sali sulla pedana e impugna la sbarra, poi esegui la trazione completa.',
 'Riduci il contrappeso man mano che diventi più forte.']},

{id:'dor-rematore-bil', n:'Rematore con bilanciere', al:['barbell row','bent over row','rematore'], g:'dorso', m:['dorsali','romboidi','trapezio','bicipiti'], at:'bilanciere', t:'multiarticolare', ek:'0026', ex:[
 'Piedi a larghezza anche, busto inclinato a circa 45°, schiena in posizione neutra.',
 'Impugna il bilanciere e tiralo verso l\'ombelico portando i gomiti indietro.',
 'Scendi controllato senza raddrizzare il busto per aiutarti.']},

{id:'dor-rematore-man', n:'Rematore con manubrio a un braccio', al:['one arm dumbbell row','rematore manubrio','pulley manubrio'], g:'dorso', m:['gran dorsale','romboidi','bicipiti'], at:'manubri', t:'multiarticolare', ek:null, ex:[
 'Appoggia ginocchio e mano sulla panca, schiena parallela al pavimento.',
 'Tira il manubrio verso il fianco portando il gomito oltre il busto.',
 'Scendi fino all\'allungamento completo del dorsale.']},

{id:'dor-tbar', n:'Rematore T-bar', al:['t-bar row','t bar','rematore tbar','panatta t-bar'], g:'dorso', m:['dorsali','romboidi','trapezio'], at:'macchina', t:'multiarticolare', ek:'0029', ex:[
 'Petto contro il pad (o a busto libero), presa sulle maniglie.',
 'Tira verso l\'addome stringendo le scapole.',
 'Scendi controllato senza far cadere il peso.']},

{id:'dor-low-row', n:'Pulley basso (low row)', al:['seated cable row','low row','pulley','pulley basso','panatta low row','rematore ai cavi'], g:'dorso', m:['dorsali','romboidi','trapezio medio','bicipiti'], at:'cavi', t:'multiarticolare', ek:'0025', ex:[
 'Seduto con i piedi sulla pedana e le ginocchia leggermente flesse.',
 'Busto verticale, tira la maniglia verso l\'addome stringendo le scapole.',
 'Torna avanti lasciando allungare il dorsale senza curvare la schiena.']},

{id:'dor-rematore-macchina', n:'Rematore alla macchina', al:['machine row','seated row machine','vertical row','panatta row'], g:'dorso', m:['dorsali','romboidi','trapezio medio'], at:'macchina', t:'multiarticolare', ek:null, ex:[
 'Petto contro il pad, regola il sedile per avere le maniglie all\'altezza dello sterno.',
 'Tira portando i gomiti indietro e stringendo le scapole.',
 'Rientra controllato mantenendo il petto appoggiato.']},

{id:'dor-pullover-cavi', n:'Pullover ai cavi (braccia tese)', al:['straight arm pulldown','pullover cavi','straight arm push down'], g:'dorso', m:['gran dorsale','tricipiti'], at:'cavi', t:'isolamento', ek:'0092', ex:[
 'In piedi davanti alla puleggia alta, braccia quasi tese e busto leggermente inclinato.',
 'Spingi la sbarra verso le cosce con un arco ampio, senza piegare i gomiti.',
 'Risali controllando fino all\'allungamento del dorsale.']},

{id:'dor-stacco', n:'Stacco da terra', al:['deadlift','stacco','stacchi'], g:'dorso', m:['erettori spinali','glutei','femorali','trapezio'], at:'bilanciere', t:'multiarticolare', ek:'0099', ex:[
 'Piedi sotto al bilanciere, presa poco più larga delle gambe.',
 'Schiena neutra, petto alto, spingi con le gambe portando il bilanciere lungo le tibie.',
 'Estendi anche e ginocchia insieme, poi riporta a terra controllando.']},

{id:'dor-stacco-rumeno', n:'Stacco rumeno', al:['romanian deadlift','rdl','stacco a gambe semitese'], g:'dorso', m:['femorali','glutei','erettori spinali'], at:'bilanciere', t:'multiarticolare', ek:'0118', ex:[
 'Parti in piedi con il bilanciere alle cosce, ginocchia leggermente flesse.',
 'Porta il bacino indietro facendo scendere il bilanciere lungo le gambe.',
 'Scendi fino a sentire i femorali in tensione, poi risali spingendo il bacino avanti.']},

{id:'dor-iperest', n:'Iperestensioni lombari (panca 45°)', al:['hyperextension','back extension','lombari','panca lombare','iperestensioni'], g:'dorso', m:['erettori spinali','glutei','femorali'], at:'macchina', t:'isolamento', ek:'0103', ex:[
 'Regola il cuscino appena sotto le creste iliache.',
 'Scendi flettendo le anche mantenendo la schiena neutra.',
 'Risali fino ad allineare busto e gambe: non iperestendere la lombare.']},

{id:'dor-good-morning', n:'Good morning', al:['good morning','buongiorno'], g:'dorso', m:['femorali','erettori spinali','glutei'], at:'bilanciere', t:'multiarticolare', ek:'0101', ex:[
 'Bilanciere sui trapezi come nello squat, ginocchia morbide.',
 'Fletti le anche portando il busto avanti con la schiena neutra.',
 'Risali contraendo glutei e femorali. Usa carichi conservativi.']},

{id:'dor-shrug-bil', n:'Scrollate con bilanciere', al:['barbell shrug','scrollate','shrug','trapezi'], g:'dorso', m:['trapezio superiore'], at:'bilanciere', t:'isolamento', ek:'0030', ex:[
 'Bilanciere davanti alle cosce, braccia tese.',
 'Alza le spalle verso le orecchie senza ruotarle.',
 'Scendi lentamente fino al completo allungamento del trapezio.']},

{id:'dor-shrug-man', n:'Scrollate con manubri', al:['dumbbell shrug','scrollate manubri'], g:'dorso', m:['trapezio superiore'], at:'manubri', t:'isolamento', ek:'0005', ex:[
 'Manubri ai fianchi, braccia distese, sguardo avanti.',
 'Solleva le spalle il più in alto possibile e trattieni un secondo.',
 'Scendi controllato.']},

{id:'dor-shrug-mp', n:'Scrollate al multipower', al:['smith machine shrug','scrollate smith'], g:'dorso', m:['trapezio superiore'], at:'multipower', t:'isolamento', ek:'0041', ex:[
 'In piedi dentro al multipower con il bilanciere davanti alle cosce.',
 'Alza le spalle verticalmente e scendi controllando.']},

{id:'dor-rematore-inv', n:'Rematore inverso al TRX o sbarra', al:['inverted row','body row','rematore australiano'], g:'dorso', m:['dorsali','romboidi','bicipiti'], at:'corpolibero', t:'multiarticolare', ek:'0086', ex:[
 'Sbarra all\'altezza dei fianchi, corpo teso in linea sotto la sbarra.',
 'Tira il petto verso la sbarra stringendo le scapole.',
 'Scendi controllato: più orizzontale sei, più è difficile.']},

{id:'dor-superman', n:'Superman a terra', al:['superman','estensioni a terra'], g:'dorso', m:['erettori spinali','glutei'], at:'corpolibero', t:'isolamento', ek:'0105', ex:[
 'Prono a terra, braccia distese avanti.',
 'Solleva contemporaneamente braccia e gambe di pochi centimetri.',
 'Trattieni 2 secondi e scendi.']},

/* ==================== SPALLE ==================== */
{id:'spa-military', n:'Lento avanti con bilanciere', al:['military press','overhead press','lento avanti','shoulder press bilanciere'], g:'spalle', m:['deltoide anteriore','deltoide laterale','tricipiti'], at:'bilanciere', t:'multiarticolare', ek:'0004', ex:[
 'Bilanciere all\'altezza delle clavicole, presa poco più larga delle spalle.',
 'Spingi sopra la testa portando il capo leggermente indietro al passaggio.',
 'Scendi controllato fino al mento senza inarcare la schiena.']},

{id:'spa-lento-man', n:'Lento avanti con manubri', al:['dumbbell shoulder press','shoulder press manubri','distensioni sopra la testa'], g:'spalle', m:['deltoide anteriore','deltoide laterale','tricipiti'], at:'manubri', t:'multiarticolare', ek:'0031', ex:[
 'Seduto con schienale alto, manubri all\'altezza delle orecchie.',
 'Spingi verso l\'alto senza far sbattere i manubri in cima.',
 'Scendi fino a formare un angolo di 90° al gomito.']},

{id:'spa-shoulder-press', n:'Shoulder press alla macchina', al:['shoulder press machine','macchina spalle','panatta shoulder press','lento macchina'], g:'spalle', m:['deltoide anteriore','deltoide laterale','tricipiti'], at:'macchina', t:'multiarticolare', ek:null, ex:[
 'Regola il sedile con le maniglie all\'altezza delle spalle.',
 'Spingi verso l\'alto mantenendo la schiena appoggiata.',
 'Rientra controllato senza scendere sotto la linea delle orecchie.']},

{id:'spa-arnold', n:'Arnold press', al:['arnold press','arnold'], g:'spalle', m:['deltoide anteriore','deltoide laterale'], at:'manubri', t:'multiarticolare', ek:null, ex:[
 'Parti con i manubri davanti al petto e i palmi rivolti verso di te.',
 'Ruota i polsi verso l\'esterno mentre spingi sopra la testa.',
 'Torna alla posizione iniziale invertendo la rotazione.']},

{id:'spa-alzate-lat', n:'Alzate laterali con manubri', al:['lateral raise','alzate laterali','side raise'], g:'spalle', m:['deltoide laterale'], at:'manubri', t:'isolamento', ek:'0018', ex:[
 'In piedi, manubri ai fianchi, gomiti leggermente flessi.',
 'Alza le braccia lateralmente fino all\'altezza delle spalle, mignolo appena più alto del pollice.',
 'Scendi lentamente: il carico giusto è quello che ti permette di non usare slancio.']},

{id:'spa-alzate-cavi', n:'Alzate laterali ai cavi', al:['cable lateral raise','alzate ai cavi'], g:'spalle', m:['deltoide laterale'], at:'cavi', t:'isolamento', ek:null, ex:[
 'Cavo basso dietro alla schiena, maniglia nella mano opposta.',
 'Alza il braccio lateralmente fino all\'altezza della spalla.',
 'Scendi controllando: il cavo mantiene tensione anche in basso.']},

{id:'spa-alzate-macchina', n:'Alzate laterali alla macchina', al:['lateral raise machine','macchina alzate laterali','panatta lateral raise'], g:'spalle', m:['deltoide laterale'], at:'macchina', t:'isolamento', ek:null, ex:[
 'Regola il sedile in modo che l\'asse di rotazione sia all\'altezza della spalla.',
 'Spingi i pad verso l\'esterno fino all\'altezza delle spalle.',
 'Rientra lentamente senza far toccare i pesi.']},

{id:'spa-alzate-front', n:'Alzate frontali con manubri', al:['front raise','alzate frontali'], g:'spalle', m:['deltoide anteriore'], at:'manubri', t:'isolamento', ek:'0033', ex:[
 'Manubri davanti alle cosce, braccia quasi tese.',
 'Alza fino all\'altezza delle spalle, un braccio alla volta o entrambi.',
 'Scendi controllato senza dondolare il busto.']},

{id:'spa-alzate-front-cavi', n:'Alzate frontali ai cavi', al:['front cable raise'], g:'spalle', m:['deltoide anteriore'], at:'cavi', t:'isolamento', ek:'0008', ex:[
 'Cavo basso dietro di te, maniglia impugnata davanti alle cosce.',
 'Alza il braccio davanti fino all\'altezza della spalla e scendi controllato.']},

{id:'spa-rear-delt', n:'Rear delt machine (pectoral inversa)', al:['rear delt','reverse pec deck','pectoral inversa','macchina deltoide posteriore','panatta rear delt'], g:'spalle', m:['deltoide posteriore','romboidi','trapezio medio'], at:'macchina', t:'isolamento', ek:null, ex:[
 'Petto contro lo schienale, braccia tese davanti a te.',
 'Apri le braccia indietro all\'altezza delle spalle stringendo le scapole.',
 'Rientra lentamente senza far cadere il peso.']},

{id:'spa-alzate-post', n:'Alzate posteriori con manubri', al:['bent over lateral raise','rear delt fly','alzate a 90 gradi'], g:'spalle', m:['deltoide posteriore','romboidi'], at:'manubri', t:'isolamento', ek:'0032', ex:[
 'Busto inclinato in avanti (o petto appoggiato a una panca inclinata).',
 'Apri le braccia lateralmente fino all\'altezza delle spalle.',
 'Scendi lentamente senza usare slancio.']},

{id:'spa-alzate-post-cavi', n:'Alzate posteriori ai cavi', al:['bent over cable lateral raise','rear delt cavi'], g:'spalle', m:['deltoide posteriore'], at:'cavi', t:'isolamento', ek:'0017', ex:[
 'Cavi incrociati bassi, busto inclinato in avanti.',
 'Apri le braccia lateralmente all\'altezza delle spalle.',
 'Rientra controllando la tensione.']},

{id:'spa-face-pull', n:'Face pull ai cavi', al:['face pull','tirate al viso'], g:'spalle', m:['deltoide posteriore','trapezio medio','extrarotatori'], at:'cavi', t:'isolamento', ek:null, ex:[
 'Corda agganciata alla puleggia all\'altezza del viso.',
 'Tira verso la fronte separando le mani e ruotando le spalle verso l\'esterno.',
 'Rientra controllato: ottimo esercizio per la salute della spalla.']},

{id:'spa-tirate-mento', n:'Tirate al mento con bilanciere', al:['upright row','tirate al mento'], g:'spalle', m:['deltoide laterale','trapezio'], at:'bilanciere', t:'multiarticolare', ek:'0014', ex:[
 'Presa prona alla larghezza delle spalle (non troppo stretta).',
 'Tira il bilanciere verso l\'alto portando i gomiti sopra i polsi.',
 'Fermati all\'altezza dello sterno per non stressare la spalla.']},

{id:'spa-tirate-cavi', n:'Tirate al mento ai cavi', al:['cable upright row'], g:'spalle', m:['deltoide laterale','trapezio'], at:'cavi', t:'multiarticolare', ek:'0015', ex:[
 'Sbarra agganciata alla puleggia bassa.',
 'Tira verso l\'alto con i gomiti alti e scendi controllato.']},

{id:'spa-rotazioni', n:'Extrarotazioni ai cavi', al:['external rotation','cuffia dei rotatori','rotazioni esterne'], g:'spalle', m:['extrarotatori','deltoide posteriore'], at:'cavi', t:'isolamento', ek:'0034', ex:[
 'Gomito al fianco piegato a 90°, maniglia impugnata davanti all\'addome.',
 'Ruota l\'avambraccio verso l\'esterno mantenendo il gomito fermo.',
 'Rientra lentamente. Carichi leggeri, è lavoro di prevenzione.']},

/* ==================== BICIPITI ==================== */
{id:'bic-curl-bil', n:'Curl con bilanciere', al:['barbell curl','curl bilanciere','curl in piedi'], g:'bicipiti', m:['bicipiti','brachiale'], at:'bilanciere', t:'isolamento', ek:'0211', ex:[
 'In piedi, presa supina alla larghezza delle spalle, gomiti al fianco.',
 'Fletti le braccia portando il bilanciere verso le spalle senza muovere i gomiti.',
 'Scendi lentamente fino all\'estensione quasi completa.']},

{id:'bic-curl-ez', n:'Curl con bilanciere EZ', al:['ez bar curl','curl ez','curl sagomato'], g:'bicipiti', m:['bicipiti','brachiale'], at:'bilanciere', t:'isolamento', ek:'0226', ex:[
 'Impugna il bilanciere EZ nelle sedi inclinate: meno stress sui polsi.',
 'Fletti i gomiti tenendoli fermi al fianco.',
 'Scendi controllato fino quasi a braccia distese.']},

{id:'bic-curl-man', n:'Curl con manubri', al:['dumbbell curl','curl manubri'], g:'bicipiti', m:['bicipiti'], at:'manubri', t:'isolamento', ek:'0224', ex:[
 'Manubri ai fianchi con presa supina o neutra in partenza.',
 'Fletti supinando il polso durante la salita.',
 'Scendi lentamente controllando la fase negativa.']},

{id:'bic-curl-alt', n:'Curl alternato con manubri', al:['alternating curl','curl alternato'], g:'bicipiti', m:['bicipiti'], at:'manubri', t:'isolamento', ek:'0223', ex:[
 'Alterna un braccio alla volta mantenendo il busto fermo.',
 'Supina il polso mentre sali, ruota indietro mentre scendi.']},

{id:'bic-hammer', n:'Hammer curl', al:['hammer curl','curl a martello','presa neutra'], g:'bicipiti', m:['brachiale','brachioradiale','bicipiti'], at:'manubri', t:'isolamento', ek:'0227', ex:[
 'Presa neutra, palmi affacciati, manubri ai fianchi.',
 'Fletti senza ruotare il polso.',
 'Scendi controllato: lavora molto sul brachiale e sullo spessore del braccio.']},

{id:'bic-hammer-alt', n:'Hammer curl alternato', al:['alternating hammer curl'], g:'bicipiti', m:['brachiale','brachioradiale'], at:'manubri', t:'isolamento', ek:'0213', ex:[
 'Presa neutra, alterna un braccio alla volta.',
 'Mantieni il gomito fermo al fianco per tutta l\'esecuzione.']},

{id:'bic-cross-hammer', n:'Curl a martello incrociato', al:['cross body hammer curl','curl incrociato'], g:'bicipiti', m:['brachiale','bicipiti'], at:'manubri', t:'isolamento', ek:'0221', ex:[
 'Presa neutra, porta il manubrio verso la spalla opposta.',
 'Scendi controllato e alterna le braccia.']},

{id:'bic-scott-bil', n:'Curl su panca Scott con bilanciere', al:['preacher curl','panca scott','scott'], g:'bicipiti', m:['bicipiti'], at:'bilanciere', t:'isolamento', ek:'0239', ex:[
 'Ascelle appoggiate al pad, braccia distese sul piano inclinato.',
 'Fletti i gomiti portando il bilanciere verso le spalle.',
 'Scendi lentamente senza estendere di scatto: la posizione è molto allungata.']},

{id:'bic-scott-man', n:'Curl su panca Scott con manubrio', al:['one arm preacher curl','scott manubrio'], g:'bicipiti', m:['bicipiti'], at:'manubri', t:'isolamento', ek:'0237', ex:[
 'Un braccio alla volta appoggiato sul pad della panca Scott.',
 'Fletti fino alla contrazione massima e scendi controllato.']},

{id:'bic-scott-macchina', n:'Curl alla macchina (Scott machine)', al:['preacher curl machine','biceps machine','macchina bicipiti','panatta biceps'], g:'bicipiti', m:['bicipiti'], at:'macchina', t:'isolamento', ek:'0236', ex:[
 'Regola il sedile in modo che i gomiti coincidano con l\'asse della macchina.',
 'Fletti le braccia fino alla contrazione completa.',
 'Rientra lentamente senza far toccare i pesi.']},

{id:'bic-curl-cavi', n:'Curl ai cavi', al:['cable curl','curl al cavo basso'], g:'bicipiti', m:['bicipiti'], at:'cavi', t:'isolamento', ek:'0212', ex:[
 'Sbarra o corda alla puleggia bassa, gomiti al fianco.',
 'Fletti mantenendo la tensione costante del cavo.',
 'Scendi controllato senza portare i gomiti indietro.']},

{id:'bic-curl-cavi-alti', n:'Curl ai cavi alti (doppio bicipite)', al:['high cable curl','curl cavi alti','doppio bicipite'], g:'bicipiti', m:['bicipiti'], at:'cavi', t:'isolamento', ek:'0229', ex:[
 'In mezzo alla cable cross con le pulegge alte, braccia aperte a croce.',
 'Fletti i gomiti portando le mani verso le orecchie.',
 'Rientra controllando: ottimo per il picco del bicipite.']},

{id:'bic-concentrato', n:'Curl concentrato', al:['concentration curl','curl concentrato'], g:'bicipiti', m:['bicipiti'], at:'manubri', t:'isolamento', ek:'0220', ex:[
 'Seduto, gomito appoggiato all\'interno coscia.',
 'Fletti il braccio fino alla contrazione massima.',
 'Scendi lentamente fino all\'estensione completa.']},

{id:'bic-spider', n:'Spider curl', al:['spider curl','curl su panca inclinata prono'], g:'bicipiti', m:['bicipiti'], at:'bilanciere', t:'isolamento', ek:'0245', ex:[
 'Petto appoggiato a una panca inclinata, braccia perpendicolari al pavimento.',
 'Fletti i gomiti mantenendo le braccia verticali.',
 'Scendi controllato: tensione massima in contrazione.']},

{id:'bic-curl-inc', n:'Curl su panca inclinata', al:['incline curl','curl inclinato'], g:'bicipiti', m:['bicipiti (capo lungo)'], at:'manubri', t:'isolamento', ek:'0214', ex:[
 'Seduto su panca inclinata a 45°, braccia che pendono dietro il busto.',
 'Fletti senza portare i gomiti avanti.',
 'Scendi fino al massimo allungamento del capo lungo.']},

{id:'bic-curl-inverso', n:'Curl inverso (presa prona)', al:['reverse curl','curl presa prona','avambracci'], g:'bicipiti', m:['brachioradiale','avambracci','brachiale'], at:'bilanciere', t:'isolamento', ek:'0257', ex:[
 'Presa prona alla larghezza delle spalle.',
 'Fletti i gomiti mantenendo i polsi rigidi.',
 'Scendi controllato: carichi più bassi del curl classico.']},

{id:'bic-zottman', n:'Zottman curl', al:['zottman curl','zottman'], g:'bicipiti', m:['bicipiti','brachioradiale','avambracci'], at:'manubri', t:'isolamento', ek:'0251', ex:[
 'Sali con presa supina come in un curl normale.',
 'In alto ruota i polsi in pronazione e scendi lentamente.',
 'In basso torna in supinazione e ripeti.']},

{id:'bic-drag', n:'Drag curl', al:['drag curl'], g:'bicipiti', m:['bicipiti (capo lungo)'], at:'bilanciere', t:'isolamento', ek:'0222', ex:[
 'Fai salire il bilanciere strisciando lungo il busto portando i gomiti indietro.',
 'Fermati all\'altezza dell\'addome alto e scendi controllato.']},

/* ==================== TRICIPITI ==================== */
{id:'tri-pushdown', n:'Push down ai cavi con barra', al:['triceps pushdown','pushdown','spinte in basso'], g:'tricipiti', m:['tricipiti'], at:'cavi', t:'isolamento', ek:'0205', ex:[
 'Puleggia alta, presa prona alla larghezza delle spalle, gomiti al fianco.',
 'Estendi le braccia verso il basso senza muovere i gomiti.',
 'Risali controllando fino a 90° al gomito.']},

{id:'tri-pushdown-corda', n:'Push down con corda', al:['rope pushdown','pushdown corda','corda tricipiti'], g:'tricipiti', m:['tricipiti (capo laterale)'], at:'cavi', t:'isolamento', ek:'0206', ex:[
 'Corda alla puleggia alta, gomiti fermi al fianco.',
 'Estendi le braccia allargando le estremità della corda in fondo.',
 'Risali lentamente mantenendo la tensione.']},

{id:'tri-pushdown-v', n:'Push down con maniglia a V', al:['v bar pushdown','pushdown v'], g:'tricipiti', m:['tricipiti'], at:'cavi', t:'isolamento', ek:'0207', ex:[
 'Maniglia a V alla puleggia alta.',
 'Estendi le braccia mantenendo i gomiti aderenti al busto.']},

{id:'tri-pushdown-inv', n:'Push down presa inversa', al:['reverse grip pushdown','push down supino'], g:'tricipiti', m:['tricipiti (capo mediale)'], at:'cavi', t:'isolamento', ek:'0189', ex:[
 'Presa supina sulla barra alla puleggia alta.',
 'Estendi le braccia verso il basso tenendo i gomiti fermi.',
 'Risali controllato con carichi moderati.']},

{id:'tri-french-ez', n:'French press con bilanciere EZ', al:['skull crusher','french press','estensioni sdraiato'], g:'tricipiti', m:['tricipiti (capo lungo)'], at:'bilanciere', t:'isolamento', ek:'0179', ex:[
 'Sdraiato sulla panca, bilanciere EZ sopra la fronte, braccia verticali.',
 'Fletti i gomiti portando il bilanciere dietro la testa.',
 'Estendi senza muovere le braccia: solo l\'avambraccio si sposta.']},

{id:'tri-french-man', n:'French press con manubri', al:['dumbbell skull crusher','estensioni manubri sdraiato'], g:'tricipiti', m:['tricipiti'], at:'manubri', t:'isolamento', ek:'0181', ex:[
 'Sdraiato con i manubri sopra il petto, presa neutra.',
 'Fletti i gomiti portando i manubri ai lati della testa.',
 'Estendi contraendo i tricipiti.']},

{id:'tri-estensioni-testa', n:'Estensioni sopra la testa con bilanciere', al:['overhead triceps extension','estensioni sopra la testa'], g:'tricipiti', m:['tricipiti (capo lungo)'], at:'bilanciere', t:'isolamento', ek:'0193', ex:[
 'Seduto con schienale, bilanciere EZ sopra la testa a braccia tese.',
 'Scendi dietro la nuca flettendo solo i gomiti.',
 'Estendi risalendo, gomiti stretti verso l\'interno.']},

{id:'tri-estensioni-man', n:'Estensioni sopra la testa con manubrio', al:['overhead dumbbell extension','estensioni manubrio'], g:'tricipiti', m:['tricipiti (capo lungo)'], at:'manubri', t:'isolamento', ek:'0194', ex:[
 'Manubrio tenuto a due mani sopra la testa.',
 'Scendi dietro la nuca e risali estendendo i gomiti.']},

{id:'tri-estensioni-cavi', n:'Estensioni sopra la testa ai cavi', al:['overhead cable extension','estensioni cavi dietro la testa'], g:'tricipiti', m:['tricipiti (capo lungo)'], at:'cavi', t:'isolamento', ek:'0177', ex:[
 'Corda alla puleggia bassa, dai le spalle alla macchina.',
 'Braccia sopra la testa, estendi in avanti mantenendo i gomiti alti.',
 'Rientra controllando l\'allungamento.']},

{id:'tri-macchina', n:'Triceps machine', al:['triceps extension machine','macchina tricipiti','panatta triceps'], g:'tricipiti', m:['tricipiti'], at:'macchina', t:'isolamento', ek:'0210', ex:[
 'Regola il sedile con i gomiti allineati all\'asse della macchina.',
 'Estendi le braccia fino quasi al blocco.',
 'Rientra lentamente senza far toccare i pesi.']},

{id:'tri-dip-macchina', n:'Dip alla macchina', al:['dip machine','triceps dip machine','macchina dip'], g:'tricipiti', m:['tricipiti','pettorale basso'], at:'macchina', t:'multiarticolare', ek:'0171', ex:[
 'Busto eretto contro lo schienale, gomiti flessi a 90°.',
 'Spingi verso il basso estendendo le braccia.',
 'Rientra controllato.']},

{id:'tri-dip-parallele', n:'Dip alle parallele (versione tricipiti)', al:['triceps dips','parallele tricipiti'], g:'tricipiti', m:['tricipiti','pettorale basso'], at:'corpolibero', t:'multiarticolare', ek:'0172', ex:[
 'Busto il più verticale possibile, gomiti stretti al corpo.',
 'Scendi fino a 90° al gomito e risali spingendo.',
 'Se serve usa la macchina ad assistenza o un elastico.']},

{id:'tri-panca-dip', n:'Dip fra due panche', al:['bench dips','dip panca'], g:'tricipiti', m:['tricipiti'], at:'corpolibero', t:'multiarticolare', ek:'0162', ex:[
 'Mani sul bordo della panca dietro di te, gambe distese avanti.',
 'Scendi flettendo i gomiti fino a 90°.',
 'Risali spingendo con i tricipiti.']},

{id:'tri-kickback', n:'Kickback con manubrio', al:['triceps kickback','estensioni busto flesso'], g:'tricipiti', m:['tricipiti'], at:'manubri', t:'isolamento', ek:'0204', ex:[
 'Busto inclinato, braccio piegato con il gomito all\'altezza del fianco.',
 'Estendi l\'avambraccio indietro fino a braccio disteso.',
 'Rientra controllato senza muovere il gomito.']},

{id:'tri-panca-stretta-mp', n:'Panca stretta al multipower', al:['smith machine close grip','panca stretta smith'], g:'tricipiti', m:['tricipiti','pettorali'], at:'multipower', t:'multiarticolare', ek:'0195', ex:[
 'Presa alla larghezza delle spalle sul bilanciere guidato.',
 'Scendi con i gomiti vicini al busto e spingi.']},

{id:'tri-jm', n:'JM press', al:['jm press'], g:'tricipiti', m:['tricipiti'], at:'bilanciere', t:'multiarticolare', ek:'0175', ex:[
 'Via di mezzo fra panca stretta e french press: il bilanciere scende verso il mento.',
 'Fletti i gomiti portando il bilanciere alla gola, avambracci quasi verticali.',
 'Estendi spingendo. Esercizio avanzato: parti leggero.']},

/* ==================== GAMBE ==================== */
{id:'gam-squat', n:'Squat con bilanciere', al:['barbell squat','squat','back squat','accosciata'], g:'gambe', m:['quadricipiti','glutei','erettori spinali'], at:'bilanciere', t:'multiarticolare', ek:'0122', ex:[
 'Bilanciere sui trapezi, piedi a larghezza spalle, punte leggermente extraruotate.',
 'Scendi portando indietro il bacino e fuori le ginocchia, schiena neutra.',
 'Scendi almeno fino a cosce parallele, poi risali spingendo con tutto il piede.']},

{id:'gam-front-squat', n:'Front squat', al:['front squat','squat frontale'], g:'gambe', m:['quadricipiti','glutei','core'], at:'bilanciere', t:'multiarticolare', ek:'0138', ex:[
 'Bilanciere appoggiato sui deltoidi anteriori, gomiti alti.',
 'Scendi mantenendo il busto verticale.',
 'Risali spingendo, gomiti sempre alti per non perdere il bilanciere.']},

{id:'gam-hack', n:'Hack squat alla macchina', al:['hack squat','hack','macchina hack squat','panatta hack squat'], g:'gambe', m:['quadricipiti','glutei'], at:'macchina', t:'multiarticolare', ek:'0123', ex:[
 'Schiena e bacino aderenti al carrello, piedi a metà pedana.',
 'Sblocca e scendi fino ad almeno 90° al ginocchio.',
 'Spingi con tutta la pianta senza staccare la schiena dal supporto.']},

{id:'gam-hack-stretto', n:'Hack squat a base stretta', al:['narrow hack squat','hack stretto'], g:'gambe', m:['vasto laterale','quadricipiti'], at:'macchina', t:'multiarticolare', ek:'0145', ex:[
 'Piedi vicini e in basso sulla pedana: enfasi sul vasto laterale.',
 'Scendi controllato e spingi mantenendo le ginocchia in linea con i piedi.']},

{id:'gam-pressa', n:'Pressa 45°', al:['leg press','pressa','pressa 45','leg press 45','panatta pressa','pressa inclinata'], g:'gambe', m:['quadricipiti','glutei','femorali'], at:'macchina', t:'multiarticolare', ek:'0127', ex:[
 'Piedi a larghezza spalle a metà pedana, schiena e bacino aderenti al sedile.',
 'Sblocca i fermi e scendi fino a circa 90° al ginocchio, senza far staccare il bacino.',
 'Spingi senza bloccare completamente le ginocchia in cima.']},

{id:'gam-pressa-stretta', n:'Pressa a base stretta', al:['narrow leg press','pressa stretta'], g:'gambe', m:['quadricipiti (vasto laterale)'], at:'macchina', t:'multiarticolare', ek:'0143', ex:[
 'Piedi vicini e centrali sulla pedana.',
 'Scendi controllato e spingi mantenendo le ginocchia allineate.']},

{id:'gam-pressa-alta', n:'Pressa con piedi alti (enfasi glutei/femorali)', al:['high foot leg press','pressa piedi alti'], g:'gambe', m:['glutei','femorali','quadricipiti'], at:'macchina', t:'multiarticolare', ek:null, ex:[
 'Piedi alti e larghi sulla pedana.',
 'Scendi profondo mantenendo il bacino appoggiato.',
 'Spingi con i talloni per enfatizzare glutei e femorali.']},

{id:'gam-leg-ext', n:'Leg extension', al:['leg extension','estensioni gambe','panatta leg extension','quadricipiti macchina'], g:'gambe', m:['quadricipiti'], at:'macchina', t:'isolamento', ek:'0142', ex:[
 'Regola lo schienale e il rullo appena sopra il collo del piede.',
 'Estendi le gambe fino a completa distensione, contraendo un secondo in alto.',
 'Scendi lentamente senza far sbattere i pesi.']},

{id:'gam-leg-curl-sd', n:'Leg curl sdraiato', al:['lying leg curl','leg curl prono','femorali sdraiato'], g:'gambe', m:['femorali','polpacci'], at:'macchina', t:'isolamento', ek:'0117', ex:[
 'Prono sulla macchina, rullo appena sopra i talloni.',
 'Fletti le ginocchia portando i talloni verso i glutei.',
 'Scendi controllato senza staccare il bacino dal supporto.']},

{id:'gam-leg-curl-sed', n:'Leg curl seduto', al:['seated leg curl','femorali seduto','panatta leg curl'], g:'gambe', m:['femorali'], at:'macchina', t:'isolamento', ek:'0119', ex:[
 'Seduto con il rullo sopra i talloni e il pad che blocca le cosce.',
 'Fletti le ginocchia spingendo i talloni verso il basso.',
 'Rientra lentamente fino all\'allungamento.']},

{id:'gam-leg-curl-ip', n:'Leg curl in piedi (monopodalico)', al:['standing leg curl','leg curl in piedi'], g:'gambe', m:['femorali'], at:'macchina', t:'isolamento', ek:'0120', ex:[
 'In piedi appoggiato al supporto, una gamba alla volta.',
 'Fletti il ginocchio portando il tallone verso il gluteo.',
 'Scendi controllato e cambia gamba.']},

{id:'gam-affondi-bil', n:'Affondi con bilanciere', al:['barbell lunges','affondi'], g:'gambe', m:['quadricipiti','glutei','femorali'], at:'bilanciere', t:'multiarticolare', ek:'0114', ex:[
 'Bilanciere sui trapezi, passo avanti deciso.',
 'Scendi fino a sfiorare il pavimento con il ginocchio posteriore.',
 'Spingi con il tallone della gamba avanti per tornare in piedi.']},

{id:'gam-affondi-man', n:'Affondi con manubri', al:['dumbbell lunges','affondi manubri'], g:'gambe', m:['quadricipiti','glutei'], at:'manubri', t:'multiarticolare', ek:'0115', ex:[
 'Manubri ai fianchi, busto eretto.',
 'Fai un passo avanti e scendi controllato.',
 'Spingi per tornare e alterna le gambe.']},

{id:'gam-affondi-camm', n:'Affondi in camminata', al:['walking lunges','affondi camminata'], g:'gambe', m:['quadricipiti','glutei','femorali'], at:'manubri', t:'multiarticolare', ek:'0121', ex:[
 'Avanza con affondi alternati mantenendo il busto eretto.',
 'Ginocchio posteriore vicino al pavimento a ogni passo.']},

{id:'gam-affondi-inv', n:'Affondi all\'indietro', al:['reverse lunges','affondi indietro'], g:'gambe', m:['glutei','quadricipiti'], at:'manubri', t:'multiarticolare', ek:'0129', ex:[
 'Passo indietro invece che avanti: più gentile per il ginocchio.',
 'Scendi fino a sfiorare il pavimento e risali spingendo con la gamba avanti.']},

{id:'gam-bulgaro', n:'Affondo bulgaro', al:['bulgarian split squat','split squat','bulgaro'], g:'gambe', m:['quadricipiti','glutei'], at:'manubri', t:'multiarticolare', ek:null, ex:[
 'Piede posteriore appoggiato su una panca, gamba avanti a circa 60-70 cm.',
 'Scendi verticalmente fino a cosce quasi parallele.',
 'Spingi con il tallone della gamba avanti. Busto più inclinato = più glutei.']},

{id:'gam-squat-mp', n:'Squat al multipower', al:['smith machine squat','squat smith','squat guidato'], g:'gambe', m:['quadricipiti','glutei'], at:'multipower', t:'multiarticolare', ek:'0124', ex:[
 'Piedi leggermente avanti rispetto al bilanciere guidato.',
 'Scendi fino a cosce parallele e risali spingendo.']},

{id:'gam-goblet', n:'Goblet squat', al:['goblet squat','squat con manubrio'], g:'gambe', m:['quadricipiti','glutei','core'], at:'manubri', t:'multiarticolare', ek:null, ex:[
 'Manubrio o kettlebell tenuto al petto a due mani.',
 'Scendi profondo mantenendo il busto eretto e i gomiti fra le ginocchia.',
 'Risali spingendo con i talloni.']},

{id:'gam-pendulum', n:'Pendulum squat', al:['pendulum squat','squat pendolare','panatta pendulum'], g:'gambe', m:['quadricipiti','glutei'], at:'macchina', t:'multiarticolare', ek:null, ex:[
 'Schiena aderente al pad, piedi sulla pedana.',
 'Scendi seguendo l\'arco della macchina, ginocchia in linea con i piedi.',
 'Spingi risalendo: l\'arco riduce il carico sulla lombare rispetto allo squat libero.']},

{id:'gam-belt-squat', n:'Belt squat', al:['belt squat','squat con cintura','panatta belt squat'], g:'gambe', m:['quadricipiti','glutei'], at:'macchina', t:'multiarticolare', ek:null, ex:[
 'Cintura agganciata al carico attorno ai fianchi, piedi sulle pedane.',
 'Scendi in accosciata mantenendo il busto eretto.',
 'Risali spingendo: nessun carico sulla colonna, ottimo se hai la schiena affaticata.']},

{id:'gam-sissy', n:'Sissy squat', al:['sissy squat'], g:'gambe', m:['quadricipiti (retto femorale)'], at:'corpolibero', t:'isolamento', ek:'0158', ex:[
 'In piedi, scendi portando le ginocchia avanti e il bacino indietro con il busto in linea.',
 'Scendi fin dove controlli e risali contraendo i quadricipiti.',
 'Esercizio impegnativo per il ginocchio: introducilo gradualmente.']},

{id:'gam-adductor', n:'Adductor machine (macchina adduttori)', al:['adductor machine','adduttori','hip adduction','macchina adduttori','panatta adductor'], g:'gambe', m:['adduttori'], at:'macchina', t:'isolamento', ek:'0157', ex:[
 'Seduto con le ginocchia contro i pad interni, gambe aperte.',
 'Chiudi le gambe contraendo gli adduttori.',
 'Riapri lentamente fino a un allungamento confortevole.']},

{id:'gam-abductor', n:'Abductor machine (macchina abduttori)', al:['abductor machine','abduttori','hip abduction','macchina abduttori','panatta abductor'], g:'gambe', m:['medio gluteo','abduttori'], at:'macchina', t:'isolamento', ek:'0156', ex:[
 'Seduto con le ginocchia contro i pad esterni, gambe chiuse.',
 'Apri le gambe contraendo il medio gluteo.',
 'Rientra lentamente. Busto avanti = più gluteo, busto indietro = più tensore.']},

{id:'gam-step-up', n:'Step up', al:['step up','salita al box'], g:'gambe', m:['quadricipiti','glutei'], at:'manubri', t:'multiarticolare', ek:'0137', ex:[
 'Sali su un box o panca alta con una gamba, spingendo con il tallone.',
 'Scendi controllato con la stessa gamba e alterna.']},

{id:'gam-stacco-sumo', n:'Stacco sumo', al:['sumo deadlift','stacco sumo'], g:'gambe', m:['glutei','adduttori','quadricipiti'], at:'bilanciere', t:'multiarticolare', ek:'0152', ex:[
 'Piedi molto larghi, punte extraruotate, presa dentro le gambe.',
 'Scendi con il busto più verticale rispetto allo stacco classico.',
 'Spingi con le gambe e chiudi con i glutei.']},

/* ==================== GLUTEI ==================== */
{id:'glu-hip-thrust', n:'Hip thrust con bilanciere', al:['hip thrust','ponte con bilanciere','spinte in alto'], g:'glutei', m:['glutei','femorali'], at:'bilanciere', t:'multiarticolare', ek:null, ex:[
 'Scapole appoggiate al bordo di una panca, bilanciere sul bacino con protezione.',
 'Spingi il bacino verso l\'alto fino ad allineare busto e cosce.',
 'Contrai i glutei un secondo in alto, poi scendi controllato senza appoggiare a terra.']},

{id:'glu-glute-drive', n:'Hip thrust alla macchina (glute drive)', al:['glute drive','hip thrust machine','macchina glutei','panatta glute drive','glute machine'], g:'glutei', m:['glutei','femorali'], at:'macchina', t:'multiarticolare', ek:null, ex:[
 'Schiena appoggiata al supporto, pad sul bacino, piedi ben piantati.',
 'Spingi il bacino in avanti fino alla completa estensione dell\'anca.',
 'Contrai un secondo e rientra controllato senza scaricare la tensione.']},

{id:'glu-ponte', n:'Ponte per glutei a terra', al:['glute bridge','ponte','bridging'], g:'glutei', m:['glutei','femorali'], at:'corpolibero', t:'multiarticolare', ek:'0109', ex:[
 'Supino con le ginocchia piegate e i piedi a terra vicino ai glutei.',
 'Solleva il bacino contraendo i glutei fino ad allineare busto e cosce.',
 'Scendi lentamente senza appoggiare completamente.']},

{id:'glu-kickback-cavi', n:'Slanci per glutei ai cavi', al:['cable kickback','slanci glutei','glute kickback'], g:'glutei', m:['glutei'], at:'cavi', t:'isolamento', ek:'0112', ex:[
 'Cavigliera alla puleggia bassa, mani appoggiate al supporto.',
 'Porta la gamba indietro estendendo l\'anca, senza inarcare la lombare.',
 'Rientra controllato e cambia gamba.']},

{id:'glu-kickback-macchina', n:'Slanci per glutei alla macchina', al:['glute kickback machine','macchina slanci','glute extension'], g:'glutei', m:['glutei','femorali'], at:'macchina', t:'isolamento', ek:null, ex:[
 'Appoggia il busto al pad e posiziona il piede sulla pedana.',
 'Estendi l\'anca spingendo indietro fino alla contrazione del gluteo.',
 'Rientra lentamente mantenendo il bacino fermo.']},

{id:'glu-abduzioni-cavi', n:'Abduzioni ai cavi', al:['cable abduction','abduzioni','slanci laterali'], g:'glutei', m:['medio gluteo'], at:'cavi', t:'isolamento', ek:null, ex:[
 'Cavigliera alla puleggia bassa, di fianco alla macchina.',
 'Porta la gamba lateralmente mantenendo il busto fermo.',
 'Rientra controllato senza ruotare il bacino.']},

{id:'glu-slanci-gamba', n:'Slanci posteriori a corpo libero', al:['donkey kick','slanci a terra','body leg lifts'], g:'glutei', m:['glutei'], at:'corpolibero', t:'isolamento', ek:'0111', ex:[
 'In quadrupedia, schiena neutra e addome attivo.',
 'Porta un ginocchio verso l\'alto contraendo il gluteo.',
 'Scendi senza appoggiare e ripeti.']},

/* ==================== POLPACCI ==================== */
{id:'pol-calf-ip', n:'Calf in piedi alla macchina', al:['standing calf raise','calf in piedi','macchina polpacci','panatta calf'], g:'polpacci', m:['gastrocnemio','soleo'], at:'macchina', t:'isolamento', ek:'0282', ex:[
 'Spalle sotto i pad, avampiede sulla pedana con i talloni nel vuoto.',
 'Scendi lentamente fino al massimo allungamento del polpaccio.',
 'Sali sulle punte il più in alto possibile e trattieni un secondo.']},

{id:'pol-calf-sed', n:'Calf seduto alla macchina', al:['seated calf raise','calf seduto','soleo'], g:'polpacci', m:['soleo'], at:'macchina', t:'isolamento', ek:'0279', ex:[
 'Seduto con i pad sopra le ginocchia e l\'avampiede sulla pedana.',
 'Scendi in allungamento e sali sulle punte contraendo.',
 'Con il ginocchio flesso lavori soprattutto il soleo.']},

{id:'pol-calf-pressa', n:'Calf alla pressa', al:['calf press','calf alla pressa','leg press calf'], g:'polpacci', m:['gastrocnemio','soleo'], at:'macchina', t:'isolamento', ek:'0273', ex:[
 'Avampiedi sul bordo basso della pedana della pressa, gambe quasi tese.',
 'Spingi con le punte estendendo la caviglia.',
 'Torna in allungamento controllando: tieni i fermi di sicurezza inseriti.']},

{id:'pol-calf-mp', n:'Calf al multipower', al:['smith machine calf raise','calf smith'], g:'polpacci', m:['gastrocnemio'], at:'multipower', t:'isolamento', ek:'0280', ex:[
 'Bilanciere guidato sui trapezi, avampiedi su un rialzo.',
 'Sali sulle punte e scendi in allungamento.']},

{id:'pol-calf-bil', n:'Calf in piedi con bilanciere', al:['barbell calf raise','calf bilanciere'], g:'polpacci', m:['gastrocnemio'], at:'bilanciere', t:'isolamento', ek:'0281', ex:[
 'Bilanciere sui trapezi, avampiedi su un rialzo.',
 'Sali sulle punte e scendi lentamente.']},

{id:'pol-calf-man', n:'Calf a una gamba con manubrio', al:['single leg calf raise','calf monopodalico'], g:'polpacci', m:['gastrocnemio','soleo'], at:'manubri', t:'isolamento', ek:'0276', ex:[
 'Manubrio nella mano dello stesso lato, avampiede su un rialzo.',
 'Sali sulla punta e scendi in allungamento completo, poi cambia gamba.']},

{id:'pol-donkey', n:'Donkey calf raise', al:['donkey calf','calf a busto flesso'], g:'polpacci', m:['gastrocnemio'], at:'macchina', t:'isolamento', ek:'0275', ex:[
 'Busto flesso in avanti con appoggio, avampiedi su un rialzo.',
 'Sali sulle punte e scendi in massimo allungamento.']},

/* ==================== ADDOME ==================== */
{id:'add-crunch', n:'Crunch a terra', al:['crunch','addominali a terra'], g:'addome', m:['retto addominale'], at:'corpolibero', t:'isolamento', ek:'0291', ex:[
 'Supino, ginocchia piegate, mani alle tempie senza tirare il collo.',
 'Solleva le scapole da terra arrotondando la colonna.',
 'Scendi controllato senza appoggiare completamente la testa.']},

{id:'add-crunch-macchina', n:'Crunch alla macchina', al:['ab crunch machine','macchina addominali','abdominal machine','panatta abdominal'], g:'addome', m:['retto addominale'], at:'macchina', t:'isolamento', ek:null, ex:[
 'Regola il sedile con i pad appoggiati al petto o le maniglie all\'altezza delle spalle.',
 'Fletti il busto avvicinando lo sterno al bacino.',
 'Rientra lentamente mantenendo la tensione.']},

{id:'add-crunch-cavi', n:'Crunch ai cavi in ginocchio', al:['cable crunch','crunch alla corda','rope crunch'], g:'addome', m:['retto addominale'], at:'cavi', t:'isolamento', ek:'0288', ex:[
 'In ginocchio davanti alla puleggia alta, corda ai lati della testa.',
 'Arrotonda la colonna portando i gomiti verso le cosce.',
 'Risali controllato senza usare le braccia per tirare.']},

{id:'add-leg-raise', n:'Sollevamento gambe a terra', al:['leg raise','sollevamento gambe','addominali bassi'], g:'addome', m:['retto addominale basso','ileopsoas'], at:'corpolibero', t:'isolamento', ek:'0287', ex:[
 'Supino con le mani sotto i glutei per proteggere la lombare.',
 'Solleva le gambe tese fino a 90° e scendi senza toccare il pavimento.',
 'Mantieni la lombare aderente a terra per tutta l\'esecuzione.']},

{id:'add-leg-raise-panca', n:'Sollevamento gambe su panca', al:['flat bench leg raise','gambe su panca'], g:'addome', m:['retto addominale basso'], at:'corpolibero', t:'isolamento', ek:'0021', ex:[
 'Sdraiato su una panca, mani che afferrano il bordo dietro la testa.',
 'Solleva le gambe verso l\'alto e scendi controllato.']},

{id:'add-leg-raise-sbarra', n:'Sollevamento gambe alla sbarra', al:['hanging leg raise','gambe alla sbarra','sospensione'], g:'addome', m:['retto addominale basso','flessori dell\'anca'], at:'corpolibero', t:'isolamento', ek:null, ex:[
 'Appeso alla sbarra o alle maniglie a gomito, corpo fermo.',
 'Solleva le ginocchia (o le gambe tese) portando il bacino in retroversione.',
 'Scendi senza dondolare: il movimento deve partire dall\'addome, non dallo slancio.']},

{id:'add-crunch-obliqui', n:'Crunch obliquo', al:['oblique crunch','crunch incrociato','obliqui'], g:'addome', m:['obliqui'], at:'corpolibero', t:'isolamento', ek:'0289', ex:[
 'Supino, porta il gomito verso il ginocchio opposto ruotando il busto.',
 'Alterna i lati controllando il movimento.']},

{id:'add-side-bend', n:'Flessioni laterali con manubrio', al:['side bend','flessioni laterali'], g:'addome', m:['obliqui','quadrato dei lombi'], at:'manubri', t:'isolamento', ek:'0294', ex:[
 'In piedi con un manubrio in una mano, l\'altra alla tempia.',
 'Fletti lateralmente il busto verso il lato del manubrio e risali.',
 'Non ruotare il busto: il movimento è solo sul piano frontale.']},

{id:'add-plank', n:'Plank frontale', al:['plank','isometria addome'], g:'addome', m:['core','retto addominale','trasverso'], at:'corpolibero', t:'isolamento', ek:null, ex:[
 'Appoggio su avambracci e punte dei piedi, corpo in linea.',
 'Contrai addome e glutei senza far cadere il bacino né alzarlo.',
 'Mantieni la posizione per il tempo previsto respirando normalmente.']},

{id:'add-side-plank', n:'Plank laterale', al:['side plank','plank laterale'], g:'addome', m:['obliqui','core'], at:'corpolibero', t:'isolamento', ek:'0113', ex:[
 'Appoggio su un avambraccio e sul bordo del piede, corpo in linea.',
 'Solleva il bacino e mantieni la posizione, poi cambia lato.']},

{id:'add-russian', n:'Russian twist', al:['russian twist','torsioni russe'], g:'addome', m:['obliqui'], at:'corpolibero', t:'isolamento', ek:null, ex:[
 'Seduto con il busto inclinato indietro e i piedi sollevati.',
 'Ruota il busto da un lato all\'altro, con o senza peso.',
 'Il movimento parte dal busto, non dalle braccia.']},

{id:'add-ab-wheel', n:'Ab wheel (ruota addominale)', al:['ab wheel','ab rollout','ruota'], g:'addome', m:['retto addominale','core','dorsali'], at:'corpolibero', t:'isolamento', ek:'0286', ex:[
 'In ginocchio con la ruota davanti a te.',
 'Rotola in avanti mantenendo il bacino in retroversione e la lombare piatta.',
 'Torna indietro contraendo l\'addome. Se la schiena si inarca, hai esagerato.']},

{id:'add-bicycle', n:'Bicycle crunch', al:['air bike','bicycle crunch','bicicletta'], g:'addome', m:['retto addominale','obliqui'], at:'corpolibero', t:'isolamento', ek:'0284', ex:[
 'Supino, porta alternativamente il gomito verso il ginocchio opposto.',
 'Mantieni la lombare a terra e un ritmo controllato.']},

{id:'add-woodchopper', n:'Woodchopper ai cavi', al:['woodchopper','torsioni ai cavi','pallof'], g:'addome', m:['obliqui','core'], at:'cavi', t:'isolamento', ek:null, ex:[
 'Cavo alto di lato, maniglia impugnata a due mani.',
 'Porta le braccia in diagonale verso il ginocchio opposto ruotando il busto.',
 'Rientra controllato e cambia lato.']}

];

/* ---- indice di ricerca: testo normalizzato per ogni esercizio ---- */
const exNorm = s => String(s||'').toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'')  // via gli accenti: "45°" e "però" cercabili senza
  .replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();

const EX_GRUPPO_NOME  = Object.fromEntries(EX_GRUPPI.map(g=>[g.id,g.n]));
const EX_ATTREZZO_NOME= Object.fromEntries(EX_ATTREZZI.map(a=>[a.id,a.n]));

EX_LIB.forEach(e=>{
  e._s = exNorm([e.n, e.al.join(' '), e.m.join(' '), EX_GRUPPO_NOME[e.g], EX_ATTREZZO_NOME[e.at]].join(' '));
});

/* Illustrazioni: line-art Everkinetic (CC BY-SA 4.0).
   Il nome file è l'id a 4 cifre + posa, quindi non serve scaricare il JSON
   della libreria: l'app funziona anche completamente offline. */
const EX_IMG_BASE='https://raw.githubusercontent.com/everkinetic/data/master/dist/svg/';
const exImages = ek => ek ? [EX_IMG_BASE+ek+'-relaxation.svg', EX_IMG_BASE+ek+'-tension.svg'] : [];
