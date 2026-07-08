# FIT·LOG — Handoff per Claude Code

Documento di contesto per riprendere e modificare il progetto. Leggilo tutto prima di toccare il codice.

---

## 1. Cos'è

App PWA personale (single-user) per un ragazzo di 25 anni che si allena in palestra seguito da PT e nutrizionista. Serve a tracciare **dieta**, **allenamenti** e **composizione corporea** (scansioni InBody mensili), con un assistente **Gemini** opzionale.

- **Non è un prodotto multi-utente.** Un solo utente ("Matteo"), nessun login, nessun backend.
- **Tutti i dati stanno in `localStorage`** sul dispositivo. Nessun server, nessun database, nessuna auth.
- Va usata **da iPhone**, installata come PWA dalla Home di Safari.
- Deploy previsto su **GitHub Pages** (repo pubblico). Nessun dato sensibile nel codice: dieta/pesi/API key vivono solo nel browser dell'utente.

Lingua UI: **italiano**. Mantienila.

---

## 2. Stack e vincoli

- **Vanilla JS, HTML, CSS.** Nessun framework, nessun build step, nessun bundler. Si apre direttamente in browser.
- Unica dipendenza esterna a runtime: **Chart.js 4.4.4** (via CDN cdnjs) per i grafici.
- Libreria esercizi: **free-exercise-db** (yuhonas su GitHub), fetchata a runtime da `raw.githubusercontent.com` — 873 esercizi con 2 immagini ciascuno + istruzioni.
- **Nessun processo di build**: le modifiche ai file sono immediatamente attive. Per testare basta servire la cartella (`python3 -m http.server`) o aprire `index.html`.
- Deve restare **installabile e offline-capace** (service worker già presente). Se aggiungi file statici nuovi, aggiungili alla lista `SHELL` in `sw.js` e **bumpa la costante `CACHE`** (es. `fitlog-v1` → `fitlog-v2`) altrimenti il vecchio SW serve la cache stale.

### Regole importanti
- **NON usare `localStorage` per dati temporanei in modo incoerente**: c'è un unico oggetto `DB` serializzato sotto la chiave `fitlog-v2`. Tutte le modifiche passano da `DB` + `save()`.
- **NON introdurre `<form>` con submit nativo** (l'app non fa navigazione di pagina).
- Se cambi lo **schema di `DB`**, aggiungi una **migrazione soft** in `loadDB()` (vedi come è fatto per `activeWorkout` e per la conversione `target → sets/reps/rest`), così i dati esistenti dell'utente non si rompono. Non resettare mai `DB` silenziosamente.
- Mantieni lo stile visivo (vedi §5). È deliberato.

---

## 3. Struttura file

```
fitlog/
├── index.html              # markup di tutte le tab + overlay (sheet, player, FAB, nav)
├── manifest.webmanifest    # PWA manifest
├── sw.js                   # service worker (app shell offline + cache runtime libreria esercizi)
├── README.md               # istruzioni deploy/install per l'utente finale
├── css/
│   └── style.css           # design system completo (variabili CSS in :root)
├── js/
│   ├── data-diet.js        # dieta di partenza (7 giorni) + tabella alimenti/kcal + costanti pasti
│   └── app.js              # TUTTA la logica: stato, render, dieta engine, workout player, corpo, admin, AI
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    └── apple-touch-icon.png
```

`app.js` è volutamente monolitico e diviso in sezioni con banner di commento (`/* ==== HOME ==== */`, `/* ==== DIETA ==== */`, ecc.). Se cresce troppo puoi splittarlo, ma allora aggiorna gli `<script>` in `index.html` e la lista `SHELL` in `sw.js`.

---

## 4. Modello dati (`DB`, chiave localStorage `fitlog-v2`)

```js
{
  scans: [                    // scansioni InBody (4 reali già caricate)
    { id, date:'YYYY-MM-DD', peso, smm, bf, aec, score, visc, note }
  ],
  schede: [                   // schede di allenamento
    { id, nome, esercizi: [
      { nome, dbId?, sets:Number, reps:Number, rest:Number/*sec*/, peso?/*ultimo usato*/ }
    ]}
  ],
  sessions: [                 // allenamenti completati
    { id, date, schedaId, dur/*min*/, entries: [
      { esercizio, sets: [ { p/*peso*/, r/*reps*/ } ] }
    ]}
  ],
  diet: { 1..7: {             // 7 giorni; chiave = numero giorno dieta (non giorno settimana)
    preAll:Bool,              // true = giorno di allenamento (ha cena pre-workout + spuntino post)
    meals: { col?, spu?, pra?, mer?, cen?, post?: [ {n/*nome*/, q/*qtà*/, k/*kcal*/} ] }
  }},
  mealTimes: { col,spu,pra,mer,cen,post: 'HH:MM' },  // orari default pasti
  diary: { 'YYYY-MM-DD': { <mealId>: { st:'ok'|'other'|'skip', kcal, note } } },
  settings: { giorno1:1..7 /*a che giorno settimana corrisponde il Giorno 1*/, notif:Bool,
              gemKey, gemModel, gemCtx:Bool },
  chat: [ { r:'me'|'ai'|'err', t } ],   // storico chat Gemini
  notified: { 'YYYY-MM-DD': { <mealId>:1 } }, // dedup notifiche
  activeWorkout: null | {     // stato workout in corso (per resume)
    schedaId, startTs, exIdx, setIdx, log:{<exIdx>:[{p,r}]}, rest:null|{until,total,thenNextEx}
  }
}
```

`meal id` = uno di: `col` (colazione), `spu` (spuntino), `pra` (pranzo), `mer` (merenda), `cen` (cena), `post` (spuntino post-allenamento). Nomi estesi in `MEAL_NAMES` (data-diet.js).

`seed()` in `app.js` genera lo stato iniziale (include le 4 scansioni InBody reali dell'utente e la dieta da `DIET_SEED`).

---

## 5. Design system (non snaturarlo)

Estetica ispirata al **referto cartaceo InBody**: "carta + inchiostro + rosso maroon".

Variabili in `css/style.css :root`:
- `--paper:#F6F4EE` (sfondo), `--surface:#FFFFFF`, `--ink:#201D1B`, `--maroon:#8E241E` (accento)
- `--muted:#857F74`, `--line:#E3DED2`, `--green:#2E7A54` (positivo), `--amber:#B4552D`
- Font: **Barlow Condensed** (titoli/etichette maiuscole) + **Inter** (testo). Numeri sempre `font-variant-numeric: tabular-nums`.

Elementi caratteristici da riusare per coerenza:
- `.rhead` → titolo sezione con `<h2>` condensato maiuscolo + `.rule` (barretta maroon animata).
- `.card`, `.stat`, `.chip`/`.chip.on`, `.pill`/`.pill.g`/`.pill.r`, `.btn`/`.btn.ghost`/`.btn.soft`/`.btn.small`.
- `.anim` → entrata con stagger (le sezioni con classe `anim` si animano in sequenza quando la tab diventa `.on`).
- Bottom sheet: `openSheet(html)` / `closeSheet()` (overlay `#sheet`).
- `toast(msg)` per feedback brevi; `haptic()` per vibrazione leggera.
- Rispetta `@media (prefers-reduced-motion: reduce)` (già gestito).

Navigazione a 5 tab in fondo: **Home / Dieta / Palestra / Corpo / Admin**. Ogni tab ha `id="tab-<nome>"` e un render function chiamato allo switch (`renderHome`, `renderDiet`, `renderGym`, `renderCorpo`, `renderAdmin`).

---

## 6. Funzionalità chiave (dove mettere le mani)

### Home (`renderHome`, `renderMealPrompt`)
Anello calorie del giorno + **prompt pasto automatico**: in base a `dietDayFor(now)` e `mealTimes`, se un pasto è "scaduto" e non ancora loggato, mostra "Hai pranzato con …?" con azioni Sì / Ho mangiato altro / Saltato (`logMeal`, `openOtherMeal`).

### Dieta (`renderDiet`, `cycleMeal`)
Selettore G1–G7, lista pasti con kcal, e per "oggi" i cerchietti di stato tappabili.

### Palestra + Workout Player (LA parte più complessa)
- `startWorkout()` → crea `DB.activeWorkout` e apre l'overlay full-screen `#player`.
- `renderPlayer()` alterna schermata **esercizio** (input peso/reps precompilati con `lastWeight()`) e schermata **recupero** (countdown grande con barra, `+30s`, `salta`).
- `completeSet()` logga la serie; a fine serie parte il rest; a fine esercizio avanza; a fine scheda `finishWorkout()` salva la `session`.
- **Resume**: se l'app si chiude a metà, `activeWorkout` resta in `DB`; all'avvio viene proposto il ripristino. Il player usa `wakeLock` (schermo acceso), `beep()` (WebAudio) e `navigator.vibrate` a fine recupero.
- Editor schede: aggiunta esercizi **dalla libreria** (`openExSearch` → `searchEx` → `pickEx` → `confirmPickEx`, con ricerca IT→EN via `IT2EN`) o **a mano** (`addExManual`). Dettaglio esercizio con immagine animata (`startExAnim` alterna le 2 foto) + link YouTube (`exDetailHTML`).
- Grafico progressione: miglior peso per sessione (`renderProgChart`).

### Corpo (`renderCorpo`, `addScan`)
Grafici Chart.js con metrica selezionabile (peso/smm/bf/aec), barra range % grasso, form nuova scansione, storico.

### Admin (`renderAdmin`)
Impostazioni settimana (`giorno1`), orari pasti, editor dieta completo (alimenti + kcal modificabili, `admEditItem`/`admAddItem`/`admDelItem`), config Gemini, **backup export/import JSON** (`exportBackup`/`importBackup`).

### AI Gemini (`openAIChat`, `askAI`, `buildContext`)
FAB ✦ apre chat. `buildContext()` costruisce il prompt con scansioni, dieta di oggi, log e ultimi allenamenti. Chiamata a `generativelanguage.googleapis.com/v1beta/models/<model>:generateContent`. API key da Admin, salvata solo in `DB.settings.gemKey`.

### Notifiche (`checkNotifications`)
Best-effort: `setInterval` ogni 60s + su `visibilitychange`. Limite iOS noto: una PWA non può schedulare notifiche ad app completamente chiusa senza push server. Il prompt in Home è il meccanismo primario. **Non promettere notifiche garantite ad app chiusa.**

---

## 7. Come testare localmente

```bash
cd fitlog
python3 -m http.server 8000
# apri http://localhost:8000
```

Per testare da iPhone sulla stessa rete: `http://<ip-del-mac>:8000`. Per PWA/service worker servono `https` (GitHub Pages) o `localhost`.

Checklist rapida dopo ogni modifica:
- `node --check js/app.js` e `node --check js/data-diet.js` (sintassi).
- Verifica che ogni `id` usato in `$('#...')` esista nel markup.
- Se hai aggiunto file statici: aggiornati `SHELL` in `sw.js` **e** bumpa `CACHE`.
- Prova un giro completo: crea scheda → aggiungi esercizio → avvia allenamento → completa una serie → verifica rest timer → termina → controlla che la sessione compaia e che il grafico progressione si aggiorni.

---

## 8. Convenzioni

- Helper globali: `$`/`$$` (querySelector), `esc()` (escape HTML — **usalo sempre** su input utente inserito via innerHTML), `fmtD()` (data → GG.MM.AA), `today()`, `uid()`, `toast()`, `haptic()`, `sortedScans()`.
- Salvataggio: muta `DB`, poi `save()` (debounced 250ms) o `persist()` (immediato). Non scrivere `localStorage` a mano.
- Render idempotenti: ogni `render*` ricostruisce l'HTML della sua sezione da `DB`.
- IDs DOM in kebab-case, funzioni in camelCase.

---

## 9. Cose da NON fare

- Non aggiungere backend/login/account: è single-user locale by design.
- Non hardcodare l'API key Gemini nel codice.
- Non rompere le migrazioni: utente ha già dati reali salvati.
- Non rimuovere il supporto offline / la registrazione del service worker.
- Non cambiare la chiave localStorage senza migrazione (perderesti i dati dell'utente).

---

## 10. Idee/estensioni già in mente (se te le chiede)

- Notifiche più affidabili (richiederebbero un push server → cambierebbe l'architettura).
- Foto progressi, misure con metro, calcolo 1RM.
- Grafici sovrapposti dieta-vs-peso.
- Export CSV oltre al backup JSON.

Quando implementi qualcosa di questi, resta dentro i vincoli §2 e §9.
