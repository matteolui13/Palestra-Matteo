# FIT·LOG — la tua app personale

Diario di allenamento, dieta e composizione corporea. PWA installabile su iPhone, dati salvati solo sul tuo dispositivo.

## Come metterla online (GitHub Pages, ~5 minuti)

1. Vai su **github.com** → **New repository** → nome `fitlog` → **Create**
2. **Add file → Upload files** → trascina TUTTO il contenuto di questa cartella (index.html, sw.js, manifest.webmanifest e le cartelle css, js, icons) → **Commit**
3. **Settings → Pages** → Source: `Deploy from a branch` → Branch: `main`, cartella `/ (root)` → **Save**
4. Dopo 1-2 minuti l'app è su `https://TUONOME.github.io/fitlog/`

## Installazione su iPhone

1. Apri il link con **Safari** (non Chrome)
2. Tasto **Condividi** (quadrato con freccia) → **Aggiungi a schermata Home**
3. Apri l'app dall'icona: schermo intero, funziona anche offline

## Cosa fa

- **Home** — anello calorie del giorno + prompt automatico: in base a giorno della settimana e orario ti chiede "Hai pranzato con…?" e confermi con un tap (calorie contate da sole)
- **Dieta** — il piano dei 7 giorni del nutrizionista già caricato, con kcal e macro (P/C/G) per pasto
- **Palestra** — schede con libreria di **146 esercizi in italiano**, con i nomi delle macchine come si usano in sala (Pressa 45°, Hack Squat, Glute Drive, Lat Machine, Low Row, Chest Press, Leg Curl, Pectoral Machine, Multipower, Panca Scott…). Illustrazione animata dove esiste, esecuzione passo-passo, link ai video YouTube, registro pesi/reps e grafico di progressione carichi
- **Corpo** — dati InBody con grafici (peso, muscolo, % grasso, AEC) — le tue scansioni sono già dentro
- **Admin** — imposti che giorno della settimana è il "Giorno 1", orari dei pasti, modifichi alimenti e quantità, configuri Gemini, esporti/importi backup
- **✦ (in basso a destra)** — chat AI con Gemini sui tuoi dati (serve API key gratuita da aistudio.google.com, resta solo sul telefono)

## Le calorie si calcolano da sole

Non si digitano più le kcal a mano. `js/data-food.js` contiene una tabella di
**164 alimenti italiani** con kcal, proteine, carboidrati e grassi per 100 g.

Scegli l'alimento e scrivi la quantità nel modo che ti viene naturale:

| Scrivi | L'app capisce |
|---|---|
| `150 g` · `150g` · `1,5 etti` | peso in grammi |
| `200 ml` · `33 cl` · `1 l` | volume |
| `2 cucchiai` · `1 cucchiaino` | porzioni da cucina |
| `1 vasetto` · `1 scatoletta` · `1 misurino` | confezioni |
| `4 fette` · `3 quadretti` · `1 lattina` | pezzi |
| `1/2 tazza` · `1 e 1/2 tazza` · `mezzo` | frazioni |
| `2` (su una mela) | 2 mele |
| `150` (su del pane) | 150 grammi |

Cambi la quantità → kcal e macro si aggiornano. Nel piano dieta le voci sono
già collegate alla tabella; in Admin il pulsante 🔍 collega una voce nuova e 🔗
la scollega se vuoi tornare a scrivere le kcal a mano (utile per una ricetta di
casa o l'etichetta di un prodotto specifico). Per un pasto fuori programma usa
"Ho mangiato altro": componi il piatto alimento per alimento e il totale si somma.

I valori sono **stime da tabella** (riferimento CREA/INRAN), non pesate del tuo
piatto: per i prodotti confezionati l'etichetta vince sempre.

## Promemoria dei pasti

Ci sono due meccanismi, perché uno solo non basta.

**1. Notifiche della PWA** (Admin → Notifiche promemoria pasti). Funzionano
**solo** con l'app installata sulla schermata Home, iOS 16.4+, permesso
concesso. Arrivano quando l'app è aperta o l'hai appena messa in background.
Il pannello Admin dice a colpo d'occhio se sono attive e, se non lo sono, qual è
l'ostacolo; il pulsante **"Invia una notifica di prova"** ti fa verificare subito
che il permesso funzioni davvero. Se in passato hai toccato "Non consentire", da
dentro l'app non si può più rimediare: Impostazioni iOS → Notifiche → FIT·LOG.

Con l'app in primo piano il promemoria non parte di proposito: la card in Home
sta già chiedendo la stessa cosa.

**2. Calendario di iPhone** (Admin → 📅 Esporta i pasti nel calendario).
Questo è l'unico modo per avere un avviso puntuale **ad app chiusa**: Safari non
può svegliare una PWA chiusa (non esiste Notification Triggers, e il Web Push
richiederebbe un server, mentre GitHub Pages serve solo file statici). L'export
genera un `.ics` con un evento ricorrente settimanale e una sveglia per ogni
pasto del piano: lo apri, lo aggiungi al calendario e da lì in poi gli avvisi
li dà iOS. Rigeneralo se cambi gli orari dei pasti o il piano.

## Cose importanti da sapere

- **Backup**: i dati stanno nel telefono. Se elimini l'app dalla Home, iOS li cancella → esporta il backup JSON da Admin ogni tanto (poi lo reimporti in 2 tap). L'import chiede conferma e ti dice cosa contiene il file prima di sostituire i dati.
- ⚠️ **Il backup contiene anche la tua API key Gemini**: non mandarlo a nessuno e non caricarlo su GitHub.
- **API key Gemini**: inseriscila SOLO dentro l'app (Admin → Gemini). Non scriverla mai nei file che carichi su GitHub.
- **Chat AI**: la conversazione si cancella ogni volta che chiudi il pannello. Riapri sempre da zero, e niente si accumula nella memoria del telefono.
- **Libreria esercizi**: elenco, ricerca e istruzioni funzionano **completamente offline**. Solo le illustrazioni arrivano dalla rete (Everkinetic, CC BY-SA 4.0) al primo utilizzo, poi restano in cache. 119 esercizi su 146 hanno l'illustrazione: dove non esiste un disegno fedele al movimento non ne viene mostrato uno sbagliato, c'è il link ai video.
- Le **calorie sono stime** per porzione, modificabili da Admin → Editor dieta. L'app non sostituisce PT e nutrizionista.

## Struttura dei file

```
index.html            interfaccia (5 tab + player allenamento + bottom sheet)
css/style.css         design system "referto InBody"
js/data-food.js       tabella alimenti + parser delle quantità → kcal e macro
js/data-exercises.js  libreria esercizi in italiano + mappa illustrazioni
js/data-diet.js       piano del nutrizionista (voci collegate agli alimenti)
js/app.js             logica: stato, render, player, grafici, AI, backup
sw.js                 service worker (offline). Bumpa CACHE a ogni rilascio.
```

**Quando modifichi i file**: cambia `const CACHE` in `sw.js` (`fitlog-v4` → `fitlog-v5`),
altrimenti l'iPhone continua a servire la versione vecchia dalla cache.
L'ordine degli script in `index.html` è obbligatorio: `data-food.js` deve
caricarsi prima di `data-diet.js`, che usa le sue funzioni per le kcal.
