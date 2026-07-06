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
- **Dieta** — il piano dei 7 giorni del nutrizionista già caricato, con kcal per pasto
- **Palestra** — schede con libreria di 873 esercizi illustrati (illustrazione animata + istruzioni + link video YouTube), registro pesi/reps e grafico di progressione carichi
- **Corpo** — dati InBody con grafici (peso, muscolo, % grasso, AEC) — le tue 4 scansioni sono già dentro
- **Admin** — imposti che giorno della settimana è il "Giorno 1", orari dei pasti, modifichi alimenti e calorie, configuri Gemini, esporti/importi backup
- **✦ (in basso a destra)** — chat AI con Gemini sui tuoi dati (serve API key gratuita da aistudio.google.com, resta solo sul telefono)

## Cose importanti da sapere

- **Backup**: i dati stanno nel telefono. Se elimini l'app dalla Home, iOS li cancella → esporta il backup JSON da Admin ogni tanto (poi lo reimporti in 2 tap).
- **Notifiche**: iOS non permette a una PWA di programmare notifiche ad app completamente chiusa senza un server. Le notifiche funzionano con app aperta/in background; il promemoria pasti all'apertura funziona sempre ed è il meccanismo principale.
- **API key Gemini**: inseriscila SOLO dentro l'app (Admin → Gemini). Non scriverla mai nei file che carichi su GitHub.
- **Libreria esercizi**: serve connessione al primo utilizzo; poi immagini ed elenco restano in cache e funzionano offline.
- Le **calorie sono stime** per porzione, modificabili da Admin → Editor dieta. L'app non sostituisce PT e nutrizionista.
