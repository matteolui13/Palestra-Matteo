/* ============================================================
   FIT·LOG — logica applicativa
   Tutti i dati restano in localStorage sul dispositivo.
   ============================================================ */

/* ---------------- STATE ---------------- */
const KEY='fitlog-v2';
let DB=null;

// Scansioni InBody reali (dall'Excel del 2026-05). bf = % grasso; fatkg = grasso in kg; bmr = metabolismo basale (kcal).
const INBODY_SCANS=[
  {date:'2025-08-29',peso:63.5,smm:29.0,bf:18.0,aec:0.378,visc:4,fatkg:11.4,bmr:1495,score:null,note:'Prima scansione'},
  {date:'2025-10-03',peso:66.5,smm:30.7,bf:17.6,aec:0.373,visc:4,fatkg:11.7,bmr:1553,score:null,note:''},
  {date:'2025-11-07',peso:67.4,smm:31.1,bf:17.9,aec:0.372,visc:4,fatkg:12.1,bmr:1565,score:null,note:''},
  {date:'2025-12-01',peso:67.6,smm:31.8,bf:17.1,aec:0.368,visc:4,fatkg:11.5,bmr:1581,score:75,note:'Target 70.5 kg · +3.9 kg muscolo, −1.0 kg grasso'},
  {date:'2026-01-14',peso:67.7,smm:31.6,bf:17.7,aec:0.366,visc:4,fatkg:12.0,bmr:1573,score:null,note:''},
  {date:'2026-02-17',peso:69.4,smm:32.6,bf:17.1,aec:0.368,visc:4,fatkg:11.9,bmr:1613,score:null,note:'Inizio dieta Cut'},
  {date:'2026-04-14',peso:68.7,smm:31.5,bf:18.8,aec:0.369,visc:5,fatkg:12.9,bmr:1575,score:null,note:''},
  {date:'2026-05-12',peso:67.7,smm:30.6,bf:20.1,aec:0.368,visc:5,fatkg:13.6,bmr:1539,score:null,note:''}
];
const DATA_VERSION=4; // bumpalo se aggiungi altre scansioni/dieta canoniche da propagare agli utenti esistenti
const GEM_MODEL_DEFAULT='gemini-3-flash-preview';
function seed(){
  return {
    scans: INBODY_SCANS.map((s,i)=>({id:i+1,...s})),
    schede:[], sessions:[],
    diet: JSON.parse(JSON.stringify(DIET_SEED)),
    mealTimes: {...MEAL_TIMES_DEFAULT},
    diary:{}, // '2026-07-06': { col:{st:'ok',kcal:426,note:''} }
    settings:{giorno1:1, notif:false, gemKey:'', gemModel:GEM_MODEL_DEFAULT, gemCtx:true},
    chat:[], notified:{}, dataVersion:DATA_VERSION
  };
}
function loadDB(){
  try{const r=localStorage.getItem(KEY); DB=r?JSON.parse(r):null;}catch(e){DB=null;}
  if(!DB) DB=seed();
  // migrazioni soft
  DB.notified=DB.notified||{}; DB.diary=DB.diary||{}; DB.chat=DB.chat||[];
  DB.activeWorkout=DB.activeWorkout||null; DB.exTrans=DB.exTrans||{}; // cache istruzioni tradotte in italiano
  // migrazione esercizi: target "4×8" → serie/reps/recupero strutturati
  DB.schede.forEach(s=>s.esercizi.forEach(e=>{
    if(e.sets==null){
      const m=(e.target||'').match(/(\d+)\s*[x×]\s*(\d+)/i);
      e.sets=m?parseInt(m[1]):3; e.reps=m?parseInt(m[2]):10; e.rest=e.rest||90;
    }
  }));
  // migrazione campi InBody extra (grasso in kg + metabolismo basale)
  DB.scans.forEach(s=>{ if(s.fatkg===undefined)s.fatkg=null; if(s.bmr===undefined)s.bmr=null; });
  // migrazione dati reali (una tantum, non distruttiva sulle date già presenti):
  // aggiunge le scansioni InBody mancanti e passa al piano dieta CUT attuale.
  // ogni blocco è gated sulla sua versione così non si ri-applica agli utenti già migrati
  if((DB.dataVersion||0) < 3){ // scansioni InBody aggiornate + passaggio al piano CUT
    INBODY_SCANS.forEach(cs=>{
      const ex=DB.scans.find(s=>s.date===cs.date);
      if(!ex){ DB.scans.push({...cs,id:uid()}); }
      else { if(ex.fatkg==null)ex.fatkg=cs.fatkg; if(ex.bmr==null)ex.bmr=cs.bmr; } // riempi solo i campi mancanti, non sovrascrive i tuoi dati
    });
    DB.diet = JSON.parse(JSON.stringify(DIET_SEED));
  }
  if((DB.dataVersion||0) < 4){ // modello AI di default → Gemini 3 Flash
    if(!DB.settings.gemModel || DB.settings.gemModel==='gemini-2.5-flash') DB.settings.gemModel=GEM_MODEL_DEFAULT;
  }
  if((DB.dataVersion||0) < DATA_VERSION) DB.dataVersion=DATA_VERSION;
  persist();
}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(DB));}catch(e){toast('⚠️ Salvataggio non riuscito');}}
let st_; function save(){clearTimeout(st_); st_=setTimeout(persist,250);}

/* ---------------- UTILS ---------------- */
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const fmtD=d=>{const[y,m,g]=d.split('-');return g+'.'+m+'.'+y.slice(2)};
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const uid=()=>Date.now()+Math.floor(Math.random()*999);
const isoWD=d=>{const w=d.getDay();return w===0?7:w;}; // 1=lun..7=dom
const WDNAMES=['','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica'];
function dietDayFor(date){ // 1..7
  return ((isoWD(date)-DB.settings.giorno1+7)%7)+1;
}
function mealsOfDay(dd){ // ordered [{id,nome,ora,items,kcal}]
  const day=DB.diet[dd]; if(!day)return[];
  const order=['col','spu','pra','mer','cen','post'];
  return order.filter(id=>day.meals[id]).map(id=>({
    id, nome:MEAL_NAMES[id], ora:DB.mealTimes[id]||'12:00',
    items:day.meals[id], kcal:day.meals[id].reduce((a,i)=>a+(+i.k||0),0)
  }));
}
function itemsTxt(items){return items.map(i=>i.n+(i.q?' '+i.q:'')).join(', ');}
function sortedScans(){return [...DB.scans].sort((a,b)=>a.date.localeCompare(b.date));}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),2200);}
function haptic(){if(navigator.vibrate)navigator.vibrate(12);}

/* ---------------- TABS ---------------- */
$$('nav button').forEach(b=>b.onclick=()=>{
  $$('nav button').forEach(x=>x.classList.remove('on'));
  $$('.tab').forEach(x=>x.classList.remove('on'));
  b.classList.add('on'); $('#tab-'+b.dataset.t).classList.add('on');
  window.scrollTo({top:0});
  ({home:renderHome,diet:renderDiet,gym:renderGym,corpo:renderCorpo,admin:renderAdmin})[b.dataset.t]();
});

/* ---------------- SHEETS (bottom overlay) ---------------- */
function openSheet(html){
  $('#sheet-body').innerHTML=html;
  $('#sheet-bg').classList.add('on'); $('#sheet').classList.add('on');
}
function closeSheet(){$('#sheet-bg').classList.remove('on');$('#sheet').classList.remove('on');}
$('#sheet-bg').onclick=closeSheet;

/* ================================================================
   HOME
   ================================================================ */
let homeChart=null;
function renderHome(){
  const now=new Date(), dd=dietDayFor(now);
  const meals=mealsOfDay(dd);
  const dayLog=DB.diary[today()]||{};
  const target=meals.reduce((a,m)=>a+m.kcal,0);
  const eaten=meals.reduce((a,m)=>{
    const l=dayLog[m.id]; if(!l)return a;
    if(l.st==='ok')return a+m.kcal;
    if(l.st==='other')return a+(+l.kcal||0);
    return a;
  },0);
  $('#home-sub').textContent=WDNAMES[isoWD(now)]+' · Giorno '+dd+' della dieta'+(DB.diet[dd]&&DB.diet[dd].preAll?' · giorno di allenamento':'');

  // kcal ring
  const pct=target?Math.min(1,eaten/target):0, C=2*Math.PI*50;
  $('#ring-fg').style.strokeDasharray=C;
  requestAnimationFrame(()=>$('#ring-fg').style.strokeDashoffset=C*(1-pct));
  $('#ring-eaten').textContent=eaten;
  $('#ring-target').textContent='su '+target+' kcal';

  // prompt pasto automatico
  renderMealPrompt(meals,dayLog,now);

  // stats
  const sc=sortedScans(), first=sc[0], last=sc[sc.length-1];
  const stat=(l,v,u,d,inv)=>{
    let cls='flat',sign=d>0?'+':'';
    if(Math.abs(d)>.05)cls=(d>0)!==inv?'up':'down';
    return `<div class="stat"><div class="lbl">${l}</div><div class="val">${v}<small> ${u}</small></div>
    <div class="delta ${cls}">${sign}${d.toFixed(1)} dall'inizio</div></div>`;
  };
  $('#home-stats').innerHTML=last?(
    stat('Peso',last.peso,'kg',last.peso-first.peso,false)+
    stat('Muscolo',last.smm,'kg',last.smm-first.smm,false)+
    stat('Grasso',last.bf,'%',last.bf-first.bf,true)):'';

  if(homeChart)homeChart.destroy();
  homeChart=safeChart('#chart-home',{type:'line',
    data:{labels:sc.map(s=>fmtD(s.date)),datasets:[{data:sc.map(s=>s.peso)}]},options:lineOpts('kg')});
}
function mealVerb(id){return {col:'fatto colazione',pra:'pranzato',cen:'cenato'}[id]||'mangiato';}
function pendingMeals(meals,dayLog,now){
  const hm=now.getHours()*60+now.getMinutes();
  return meals.filter(m=>{
    const[h,mi]=m.ora.split(':').map(Number);
    return h*60+mi<=hm && !dayLog[m.id];
  });
}
function renderMealPrompt(meals,dayLog,now){
  const pend=pendingMeals(meals,dayLog,now);
  const box=$('#meal-prompt');
  if(!pend.length){
    const next=meals.find(m=>!dayLog[m.id]);
    box.innerHTML=next?
      `<div class="card anim"><span class="pill">Prossimo pasto · ${next.ora}</span>
       <div class="mealrow" style="border:none;padding-bottom:0"><div><div class="nm">${next.nome}</div>
       <div class="items">${esc(itemsTxt(next.items))}</div></div><div class="kc">${next.kcal} kcal</div></div></div>`
      :`<div class="card anim">✅ <b>Giornata completata!</b><div class="note">Tutti i pasti di oggi sono registrati.</div></div>`;
    return;
  }
  const m=pend[0];
  box.innerHTML=`<div class="card prompt anim">
    <span class="pill r">${m.nome} · ${m.ora}</span>
    <div class="q">Hai ${mealVerb(m.id)} con ${esc(itemsTxt(m.items).toLowerCase())}?</div>
    <div class="kcal">${m.kcal} kcal secondo il piano${pend.length>1?' · +'+(pend.length-1)+' pasti da confermare':''}</div>
    <div class="acts">
      <button class="btn small" style="flex:1" onclick="logMeal('${m.id}','ok')">Sì ✓</button>
      <button class="btn small soft" style="flex:1" onclick="openOtherMeal('${m.id}')">Ho mangiato altro</button>
      <button class="btn small ghost" onclick="logMeal('${m.id}','skip')">Saltato</button>
    </div></div>`;
}
function logMeal(mid,st,kcal,note){
  const t=today(); DB.diary[t]=DB.diary[t]||{};
  DB.diary[t][mid]={st,kcal:kcal??null,note:note||''};
  save(); haptic();
  toast(st==='ok'?'Pasto registrato ✓':st==='skip'?'Pasto saltato':'Registrato');
  closeSheet(); renderHome();
  if($('#tab-diet').classList.contains('on'))renderDiet();
}
function openOtherMeal(mid){
  openSheet(`<h3>${MEAL_NAMES[mid]} — cosa hai mangiato?</h3>
    <label class="f">Descrizione</label><input type="text" id="om-note" placeholder="es. panino con tacchino e insalata">
    <label class="f">Calorie stimate</label><input type="number" id="om-kcal" inputmode="numeric" placeholder="es. 450">
    <button class="btn" onclick="logMeal('${mid}','other',parseInt(document.querySelector('#om-kcal').value)||0,document.querySelector('#om-note').value.trim())">Salva</button>`);
}

/* ================================================================
   DIETA
   ================================================================ */
let dietDaySel=null;
function renderDiet(){
  const now=new Date(), todayDD=dietDayFor(now);
  if(dietDaySel===null)dietDaySel=todayDD;
  $('#diet-chips').innerHTML=[1,2,3,4,5,6,7].map(d=>{
    const wd=((d-1+DB.settings.giorno1-1)%7)+1;
    return `<button class="chip ${d===dietDaySel?'on':''}" onclick="dietDaySel=${d};renderDiet()">G${d}·${WDNAMES[wd].slice(0,3)}</button>`;
  }).join('');
  const meals=mealsOfDay(dietDaySel);
  const isToday=dietDaySel===todayDD;
  const dayLog=isToday?(DB.diary[today()]||{}):{};
  const tot=meals.reduce((a,m)=>a+m.kcal,0);
  $('#diet-day-info').innerHTML=`<span class="pill ${DB.diet[dietDaySel].preAll?'r':''}">${DB.diet[dietDaySel].preAll?'Giorno di allenamento':'Giorno di riposo'}</span>
    <span class="pill">${tot} kcal totali</span>${isToday?' <span class="pill g">Oggi</span>':''}`;
  $('#diet-meals').innerHTML=meals.map(m=>{
    const l=dayLog[m.id];
    const stCls=l?(' '+l.st):'';
    const stIc=l?(l.st==='ok'?'✓':l.st==='other'?'≠':'—'):'';
    return `<div class="mealrow">
      <div style="flex:1"><div class="nm">${m.nome} <span class="s" style="color:var(--muted);font-weight:400">${m.ora}</span></div>
      <div class="items">${esc(itemsTxt(m.items))}${l&&l.st==='other'?'<br><i>→ '+esc(l.note||'altro')+' ('+(l.kcal||0)+' kcal)</i>':''}</div></div>
      <div class="kc">${m.kcal}<br>kcal</div>
      ${isToday?`<button class="state${stCls}" onclick="cycleMeal('${m.id}')" aria-label="Stato pasto">${stIc}</button>`:''}
    </div>`;
  }).join('');
  $('#diet-note').textContent=DIET_NOTE;
}
function cycleMeal(mid){
  const t=today(); DB.diary[t]=DB.diary[t]||{};
  const cur=DB.diary[t][mid];
  if(!cur)DB.diary[t][mid]={st:'ok'};
  else if(cur.st==='ok')openOtherMeal(mid);
  else if(cur.st==='other')DB.diary[t][mid]={st:'skip'};
  else delete DB.diary[t][mid];
  save(); haptic(); renderDiet(); 
}

/* ================================================================
   PALESTRA
   ================================================================ */
function renderGym(){
  $('#resume-banner').innerHTML=DB.activeWorkout?
    `<div class="card prompt anim"><span class="pill r">Allenamento in corso</span>
     <div class="q">Hai un allenamento non terminato.</div>
     <div class="acts"><button class="btn small" style="flex:1" onclick="resumeWorkout()">Riprendi ▸</button>
     <button class="btn small ghost" onclick="PL=DB.activeWorkout;finishWorkout()">Chiudi e salva</button></div></div>`:'';
  const sel=$('#ws-scheda');
  sel.innerHTML=DB.schede.map(s=>`<option value="${s.id}">${esc(s.nome)}</option>`).join('')||'<option value="">— crea prima una scheda —</option>';
  renderSessionForm(); renderSchede(); renderSessionList(); renderProgSelect();
}
function renderSessionForm(){
  const sch=DB.schede.find(s=>s.id==$('#ws-scheda').value);
  $('#session-form').innerHTML=sch&&sch.esercizi.length?
    `<div class="note" style="margin:10px 0 0">${sch.esercizi.length} esercizi · `+
    sch.esercizi.map(e=>esc(e.nome)+' '+schemeLabel(e)).join(' · ')+'</div>'
  :'<div class="note" style="margin-top:12px">Crea una scheda e aggiungi gli esercizi qui sotto.</div>';
  $('#btn-start').style.display=sch&&sch.esercizi.length?'block':'none';
}

/* ---------------- WORKOUT PLAYER (modalità allenamento live) ---------------- */
let PL=null, plTick=null, wakeLock=null, audioCtx=null;
function lastWeight(exName){ // precompila col peso dell'ultima volta
  const ss=[...DB.sessions].sort((a,b)=>b.date.localeCompare(a.date));
  for(const s of ss){
    const e=s.entries.find(x=>x.esercizio===exName);
    if(e){const sets=entrySets(e); if(sets.length)return sets[sets.length-1].p||'';}
  }
  return '';
}
function entrySets(e){return e.sets?e.sets:[{p:e.peso||0,r:e.reps||0}];}
/* ---- schema ripetizioni per serie (es. "12-10-8-8" o "3x8 + 1x8 + MAX") ---- */
function normRep(t){return /max/i.test(t)?'MAX':(parseInt(t)||0);}
function parseScheme(str){
  if(!str)return null; const out=[];
  String(str).split('+').forEach(g=>{
    g=g.trim(); if(!g)return;
    const m=g.match(/^(\d+)\s*[x×]\s*(.+)$/i); // "3x8" oppure "3 x MAX"
    if(m){const n=Math.min(20,parseInt(m[1])||1),rep=normRep(m[2]);for(let i=0;i<n;i++)out.push(rep);return;}
    g.split(/[-,·\/]/).forEach(t=>{t=t.trim();if(t)out.push(normRep(t));});
  });
  return out.length?out:null;
}
function firstRep(scheme){const n=scheme.find(x=>typeof x==='number'&&x>0);return n||8;}
function exScheme(ex){return ex.scheme&&ex.scheme.length?ex.scheme:Array(ex.sets||3).fill(ex.reps||10);} // array target per serie
function schemeLabel(ex){const s=exScheme(ex);return s.every(x=>x===s[0])?s.length+'×'+s[0]:s.join('·');}
/* ---- vocabolario libreria esercizi → italiano ---- */
const IT_MUSC={chest:'pettorali',triceps:'tricipiti',biceps:'bicipiti',shoulders:'spalle',forearms:'avambracci',
  forearm:'avambracci',forerm:'avambracci',lats:'dorsali','middle back':'schiena centrale','upper back':'schiena alta',
  back:'schiena','lower back':'lombari',traps:'trapezi',trapezius:'trapezi',neck:'collo','neck extensors':'collo',
  'neck flexors':'collo','neck side flexors':'collo',quadriceps:'quadricipiti',hamstrings:'femorali',hamstring:'femorali',
  glutes:'glutei',gluts:'glutei',calves:'polpacci',abdominals:'addominali','lower abdominals':'addominali bassi',
  obliques:'obliqui',core:'core',arms:'braccia',adductors:'adduttori',abductors:'abduttori','hip abductors':'abduttori',
  'lateral deltoid':'deltoide laterale','rear deltoid':'deltoide posteriore','posterior deltoid':'deltoide posteriore',
  should:'spalle',bicpes:'bicipiti'};
const IT_LEVEL={beginner:'principiante',intermediate:'intermedio',expert:'avanzato',
  compound:'multiarticolare',isolation:'di isolamento',isometric:'isometrico'};
const IT_EQUIP={barbell:'bilanciere',dumbbell:'manubri',dumbbells:'manubri',dumbell:'manubri',cable:'cavi',
  'cable machine':'ai cavi',machine:'macchina',body:'corpo libero','body only':'corpo libero',bench:'panca',
  'flat bench':'panca piana','incline bench':'panca inclinata','decline bench':'panca declinata','smith machine':'multipower',
  bar:'sbarra','parallel bars':'parallele','bench press machine':'chest press','hyperextension bench':'panca lombare',
  'chest machine':'macchina pettorali','butterfly machine':'pectoral machine','t-bar machine':'t-bar','v-bar':'maniglia a V',
  kettlebells:'kettlebell',bands:'elastici',band:'elastici','exercise band':'elastici','medicine ball':'palla medica',
  'exercise ball':'fitball','swiss ball':'fitball','stability ball':'fitball','bosu ball':'bosu','balance board':'tavoletta propriocettiva',
  'weight plate':'disco',weight:'peso','barbell or dumbbell':'bilanciere o manubri','e-z curl bar':'bilanciere EZ',
  other:'altro',none:'nessuno','foam roll':'foam roller'};
const itMap=(m,v)=>v?(m[String(v).toLowerCase()]||v):v;
function instrOL(steps){return '<ol style="padding-left:18px;font-size:.85rem;line-height:1.5;color:#44403C;margin-top:6px">'+steps.map(i=>'<li style="margin-bottom:6px">'+esc(i)+'</li>').join('')+'</ol>';}
function startWorkout(){
  const sch=DB.schede.find(s=>s.id==$('#ws-scheda').value);
  if(!sch||!sch.esercizi.length){toast('Scheda vuota');return;}
  PL={schedaId:sch.id,startTs:Date.now(),exIdx:0,setIdx:0,log:{},rest:null};
  DB.activeWorkout=PL; save();
  try{audioCtx=new (window.AudioContext||window.webkitAudioContext)();}catch(_){}
  openPlayer();
}
function resumeWorkout(){PL=DB.activeWorkout; if(!PL)return; openPlayer();}
function openPlayer(){
  $('#player').classList.add('on');
  document.body.style.overflow='hidden';
  if('wakeLock' in navigator)navigator.wakeLock.request('screen').then(w=>wakeLock=w).catch(()=>{});
  clearInterval(plTick); plTick=setInterval(plUpdate,400);
  renderPlayer();
}
function closePlayer(saveIt){
  clearInterval(plTick);
  $('#player').classList.remove('on');
  document.body.style.overflow='';
  if(wakeLock){wakeLock.release().catch(()=>{});wakeLock=null;}
  if(saveIt)finishWorkout();
}
function abortWorkout(){
  if(!confirm('Interrompere l\'allenamento? I set già fatti verranno comunque salvati.'))return;
  finishWorkout();
}
function finishWorkout(){
  if(!PL)return;
  const sch=DB.schede.find(s=>s.id===PL.schedaId);
  const entries=[];
  (sch?sch.esercizi:[]).forEach((e,i)=>{
    const sets=(PL.log[i]||[]).filter(s=>s.p||s.r);
    if(sets.length)entries.push({esercizio:e.nome,sets});
  });
  const durMin=Math.round((Date.now()-PL.startTs)/60000);
  if(entries.length){
    DB.sessions.push({id:uid(),date:today(),schedaId:PL.schedaId,dur:durMin,entries});
    // memorizza l'ultimo peso usato come suggerimento sulla scheda
    entries.forEach(en=>{
      const ex=sch&&sch.esercizi.find(x=>x.nome===en.esercizio);
      if(ex)ex.peso=en.sets[en.sets.length-1].p;
    });
    toast('Allenamento salvato ✓ '+durMin+' min');
  }
  PL=null; DB.activeWorkout=null; save();
  closePlayer(false); renderGym();
}
function plExercise(){const sch=DB.schede.find(s=>s.id===PL.schedaId);return sch?sch.esercizi[PL.exIdx]:null;}
function renderPlayer(){
  if(!PL)return;
  const sch=DB.schede.find(s=>s.id===PL.schedaId);
  const ex=plExercise(); if(!ex){finishWorkout();return;}
  const done=PL.log[PL.exIdx]||[];
  const isRest=PL.rest&&PL.rest.until>Date.now();
  const totEx=sch.esercizi.length;
  const scm=exScheme(ex), tgt=scm[PL.setIdx], tgtTxt=tgt==='MAX'?'MAX ripetizioni':tgt+' reps';
  $('#pl-title').textContent=sch.nome;
  $('#pl-dots').innerHTML=sch.esercizi.map((_,i)=>
    `<span class="dot ${i<PL.exIdx?'done':i===PL.exIdx?'cur':''}"></span>`).join('');

  if(isRest){
    $('#pl-body').innerHTML=`
      <div class="pl-rest">
        <div class="pl-lbl">Recupero</div>
        <div class="pl-timer" id="pl-timer">--</div>
        <div class="pl-ringtrack"><div class="pl-ringfill" id="pl-ringfill"></div></div>
        <div class="pl-next">Prossima: <b>${esc(ex.nome)}</b> — serie ${PL.setIdx+1} di ${scm.length} · ${tgtTxt}</div>
        <div style="display:flex;gap:10px;margin-top:20px">
          <button class="btn small soft" style="flex:1" onclick="PL.rest.until+=30000;save()">+30 s</button>
          <button class="btn small" style="flex:1" onclick="endRest()">Salta recupero ▸</button>
        </div>
      </div>`;
    plUpdate();
    return;
  }
  const sugg=ex.peso||lastWeight(ex.nome);
  const nameJs=esc(ex.nome).replace(/'/g,"\\'");
  $('#pl-body').innerHTML=`
    <div class="pl-ex">
      <div class="pl-hero noimg" id="pl-hero" onclick="openExDetailByName('${nameJs}','${ex.dbId||''}')" role="button" aria-label="Dettaglio esercizio ${esc(ex.nome)}">
        <div class="pl-hero-grad"></div>
        <div class="pl-hero-cap">
          <div class="pl-hero-sub">Esercizio ${PL.exIdx+1} di ${totEx}</div>
          <div class="pl-hero-name">${esc(ex.nome)} ▸</div>
        </div>
      </div>
      <div class="pl-setbar">${scm.map((rp,i)=>`<span class="pl-setpill ${i<PL.setIdx?'done':i===PL.setIdx?'cur':''}">${rp==='MAX'?'MAX':rp}</span>`).join('')}</div>
      <div class="pl-target">Serie <b>${PL.setIdx+1}</b> di ${scm.length} · obiettivo ${tgtTxt} · recupero ${ex.rest}s</div>
      ${ex.note?`<div class="pl-note">📌 ${esc(ex.note)}</div>`:''}
      <div class="pl-inputs">
        <div><span class="mini">Peso kg</span><input type="number" step="0.5" inputmode="decimal" id="pl-p" value="${sugg}"></div>
        <div><span class="mini">Reps</span><input type="number" inputmode="numeric" id="pl-r" value="${tgt==='MAX'?'':tgt}" placeholder="${tgt==='MAX'?'max':''}"></div>
      </div>
      <div class="pl-rpe">
        <div class="rpe-lbl"><span class="mini">Sforzo percepito (RPE)</span><span class="rpe-hint">6 facile · 10 massimale</span></div>
        <div class="rpe-row">${[6,7,8,9,10].map(v=>`<button class="rpe${plRpe===v?' on':''}" data-v="${v}" onclick="setRpe(${v})">${v}</button>`).join('')}</div>
      </div>
      ${DB.settings.gemKey?`<button class="btn small ghost" style="max-width:320px;margin:14px auto 0" onclick="suggestWeight()">✦ Peso consigliato dall'AI</button><div id="pl-ai"></div>`:''}
      <button class="btn pl-done" onclick="completeSet()">✓ Serie completata</button>
      ${done.length?`<div class="pl-log">${done.map((s,i)=>`<span class="pill g">S${i+1}: ${s.p}kg×${s.r}${s.rpe?' · RPE'+s.rpe:''}</span>`).join(' ')}</div>`:''}
      <div style="display:flex;gap:10px;margin-top:18px">
        ${PL.exIdx>0?'<button class="btn small ghost" style="flex:1" onclick="prevEx()">← Prec.</button>':''}
        <button class="btn small ghost" style="flex:1" onclick="nextEx()">${PL.exIdx<totEx-1?'Salta es. →':'Fine ✓'}</button>
      </div>
    </div>`;
  loadPlayerHero(ex);
}
// carica l'illustrazione dell'esercizio nel player (crossfade fra le 2 pose)
let plHeroT=null;
async function loadPlayerHero(ex){
  clearTimeout(plHeroT);
  const hero=$('#pl-hero'); if(!hero||!ex.dbId)return; // esercizio manuale → resta la card maroon
  try{
    await loadEXDB();
    const e=EXDB.find(x=>x.id===ex.dbId);
    if(!e||!(e.images||[]).length)return;
    const imgs=e.images.map((p,i)=>`<img class="exframe" data-i="${i}" src="${EXIMG+p}" alt="" onload="var h=this.closest('.pl-hero');if(h)h.classList.remove('noimg')" onerror="this.remove()">`).join('');
    const h=$('#pl-hero'); if(!h)return; h.insertAdjacentHTML('afterbegin',imgs);
    if(e.images.length>1)(function loop(){const hh=$('#pl-hero');if(!hh)return;hh.classList.toggle('show1');plHeroT=setTimeout(loop,1300);})();
  }catch(_){}
}
let plRpe=null;
function setRpe(v){ plRpe=(plRpe===v?null:v); $$('.pl-rpe .rpe').forEach(b=>b.classList.toggle('on',+b.dataset.v===plRpe)); haptic(); }
function completeSet(){
  const ex=plExercise(); if(!ex)return;
  const p=parseFloat($('#pl-p').value)||0, r=parseInt($('#pl-r').value)||0;
  PL.log[PL.exIdx]=PL.log[PL.exIdx]||[];
  PL.log[PL.exIdx].push({p,r,rpe:plRpe||null}); plRpe=null;
  haptic();
  const lastSetOfEx=PL.setIdx+1>=exScheme(ex).length;
  if(lastSetOfEx){
    const sch=DB.schede.find(s=>s.id===PL.schedaId);
    if(PL.exIdx+1>=sch.esercizi.length){DB.activeWorkout=PL;save();finishWorkout();return;}
    PL.rest={until:Date.now()+ex.rest*1000,total:ex.rest,thenNextEx:true};
  }else{
    PL.rest={until:Date.now()+ex.rest*1000,total:ex.rest,thenNextEx:false};
  }
  DB.activeWorkout=PL; save(); renderPlayer();
}
function endRest(){
  if(PL.rest&&PL.rest.thenNextEx){PL.exIdx++;PL.setIdx=0;}
  else PL.setIdx++;
  PL.rest=null; DB.activeWorkout=PL; save(); renderPlayer();
}
function nextEx(){
  const sch=DB.schede.find(s=>s.id===PL.schedaId);
  if(PL.exIdx+1>=sch.esercizi.length){finishWorkout();return;}
  PL.exIdx++;PL.setIdx=0;PL.rest=null;DB.activeWorkout=PL;save();renderPlayer();
}
function prevEx(){if(PL.exIdx>0){PL.exIdx--;PL.setIdx=0;PL.rest=null;DB.activeWorkout=PL;save();renderPlayer();}}
function beep(){
  if(!audioCtx)return;
  try{
    const o=audioCtx.createOscillator(),g=audioCtx.createGain();
    o.connect(g);g.connect(audioCtx.destination);
    o.frequency.value=880;g.gain.setValueAtTime(.25,audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.5);
    o.start();o.stop(audioCtx.currentTime+.5);
  }catch(_){}
}
function plUpdate(){
  if(!PL)return;
  const el=Math.floor((Date.now()-PL.startTs)/1000);
  $('#pl-elapsed').textContent=String(Math.floor(el/60)).padStart(2,'0')+':'+String(el%60).padStart(2,'0');
  if(PL.rest){
    const left=Math.ceil((PL.rest.until-Date.now())/1000);
    if(left<=0){beep();if(navigator.vibrate)navigator.vibrate([200,100,200]);endRest();return;}
    const t=$('#pl-timer'); if(t)t.textContent=left+'s';
    const f=$('#pl-ringfill'); if(f)f.style.width=Math.max(0,Math.min(100,100*left/(PL.rest.total+0.0001)))+'%';
  }
}
function addScheda(){
  const n=$('#new-scheda').value.trim(); if(!n)return;
  DB.schede.push({id:uid(),nome:n,esercizi:[]});
  $('#new-scheda').value=''; save(); renderGym(); toast('Scheda creata');
}
function delScheda(id){
  if(!confirm('Eliminare la scheda? Le sessioni registrate restano.'))return;
  DB.schede=DB.schede.filter(s=>s.id!==id); save(); renderGym();
}
function delEx(sid,idx){
  DB.schede.find(s=>s.id===sid).esercizi.splice(idx,1); save(); renderGym();
  const d=document.querySelector(`details[data-id="${sid}"]`); if(d)d.setAttribute('open','');
}
function renderSchede(){
  $('#schede-list').innerHTML=DB.schede.map(s=>
    `<details data-id="${s.id}"><summary>${esc(s.nome)}<span class="s" style="margin-right:auto;margin-left:8px;color:var(--muted)">${s.esercizi.length} esercizi</span></summary><div class="inner">`+
    (s.esercizi.map((e,i)=>`<div class="row"><div class="t">${esc(e.nome)} <span class="s">${schemeLabel(e)} · rec ${e.rest}s${e.peso?' · ultimo '+e.peso+'kg':''}</span>${e.note?`<div class="s" style="color:var(--maroon)">📌 ${esc(e.note)}</div>`:''}</div>
      <button class="x" onclick="delEx(${s.id},${i})">✕</button></div>`).join('')||'<span class="note">Nessun esercizio.</span>')+
    `<button class="btn small" style="margin-top:12px" onclick="openExSearch(${s.id})">🔍 Aggiungi dalla libreria illustrata</button>
     <label class="f" style="margin-top:12px">O a mano</label><input type="text" id="ex-n${s.id}" placeholder="es. Distensioni panca piana">
     <div class="grid2" style="margin-top:8px">
       <div><span class="mini">Ripetizioni (schema)</span><input type="text" id="ex-r${s.id}" value="4x8" placeholder="es. 12-10-8-8 o 3x8+1x8+MAX"></div>
       <div><span class="mini">Rec. (s)</span><input type="number" id="ex-w${s.id}" value="90" inputmode="numeric"></div>
     </div>
     <input type="text" id="ex-note${s.id}" placeholder="Nota (facoltativa, es. ultima serie in stripping)" style="margin-top:8px">
     <button class="btn small ghost" style="margin-top:10px" onclick="addExManual(${s.id})">Aggiungi</button>
     <button class="btn small" style="margin-top:10px;margin-left:8px;background:#EFE9DC;color:var(--maroon)" onclick="delScheda(${s.id})">Elimina scheda</button>
    </div></details>`).join('')||'<div class="card"><span class="note">Nessuna scheda: creane una qui sotto e aggiungi gli esercizi dalla libreria illustrata.</span></div>';
}
function addExManual(sid){
  const n=$('#ex-n'+sid).value.trim(); if(!n)return;
  const scheme=parseScheme($('#ex-r'+sid).value)||[8,8,8];
  DB.schede.find(s=>s.id===sid).esercizi.push({nome:n,scheme,
    sets:scheme.length,reps:firstRep(scheme),rest:parseInt($('#ex-w'+sid).value)||90,note:($('#ex-note'+sid).value||'').trim()});
  save(); renderGym();
  document.querySelector(`details[data-id="${sid}"]`)?.setAttribute('open','');
}
function delSession(id){
  if(!confirm('Eliminare la sessione?'))return;
  DB.sessions=DB.sessions.filter(s=>s.id!==id); save(); renderSessionList(); renderProgChart();
}
function renderSessionList(){
  const ss=[...DB.sessions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,15);
  $('#session-list').innerHTML=ss.length?ss.map(s=>{
    const sch=DB.schede.find(x=>x.id===s.schedaId);
    const det=s.entries.map(e=>esc(e.esercizio)+' '+entrySets(e).map(x=>x.p+'×'+x.r+(x.rpe?'@'+x.rpe:'')).join(', ')).join(' · ');
    return `<div class="row"><div><div class="t">${fmtD(s.date)} — ${sch?esc(sch.nome):'Scheda'}${s.dur?' <span class="pill">'+s.dur+' min</span>':''}</div>
    <div class="s">${det}</div></div>
    <button class="x" onclick="delSession(${s.id})">✕</button></div>`;
  }).join(''):'<span class="note">Nessuna sessione registrata.</span>';
}
let progChart=null;
function allExercises(){
  const set=new Set();
  DB.schede.forEach(s=>s.esercizi.forEach(e=>set.add(e.nome)));
  DB.sessions.forEach(s=>s.entries.forEach(e=>set.add(e.esercizio)));
  return[...set];
}
function renderProgSelect(){
  const cur=$('#prog-ex').value;
  $('#prog-ex').innerHTML=allExercises().map(e=>`<option${e===cur?' selected':''}>${esc(e)}</option>`).join('');
  renderProgChart();
}
function renderProgChart(){
  const ex=$('#prog-ex').value;
  const pts=DB.sessions.filter(s=>s.entries.some(e=>e.esercizio===ex))
    .sort((a,b)=>a.date.localeCompare(b.date))
    .map(s=>({d:fmtD(s.date),v:Math.max(...s.entries.filter(e=>e.esercizio===ex).flatMap(e=>entrySets(e).map(x=>x.p||0)))}));
  if(progChart)progChart.destroy();
  progChart=safeChart('#chart-prog',{type:'line',
    data:{labels:pts.map(p=>p.d),datasets:[{data:pts.map(p=>p.v)}]},options:lineOpts('kg')});
}

/* ---------------- LIBRERIA ESERCIZI (open source, 873 esercizi) ---------------- */
// Libreria illustrata (disegni line-art) — Everkinetic, CC BY-SA 4.0
const EXDB_URL='https://raw.githubusercontent.com/everkinetic/data/master/exercises.json';
const EXIMG='https://raw.githubusercontent.com/everkinetic/data/master/dist/svg/';
let EXDB=null, exTargetScheda=null;
const toArrLC=v=>Array.isArray(v)?v:(v?String(v).split(',').map(s=>s.trim()).filter(Boolean):[]);
// normalizza un esercizio Everkinetic nello schema usato dall'app
function normEx(e){
  const idn=e.id_num||String(e.id||'').padStart(4,'0');
  return {
    id:'ek-'+idn,
    name:e.title||e.name||'Esercizio',
    images:[idn+'-relaxation.svg', idn+'-tension.svg'], // 2 pose: inizio → fine
    primaryMuscles:[...toArrLC(e.primary), ...toArrLC(e.secondary)],
    level:e.type||'',                 // compound/isolation/isometric → tradotto da IT_LEVEL
    equipment:toArrLC(e.equipment).map(x=>itMap(IT_EQUIP,x)).join(', '),
    instructions:e.steps||[]
  };
}
const IT2EN={panca:'bench press',stacco:'deadlift',trazioni:'pull up',rematore:'row',spinte:'press',
  croci:'fly',alzate:'raise','alzate laterali':'lateral raise',affondi:'lunge',polpacci:'calf',
  'lat machine':'pulldown',bicipiti:'curl',tricipiti:'triceps',spalle:'shoulder',addominali:'ab',
  gambe:'leg',petto:'chest',schiena:'back',glutei:'glute',militare:'military press',squat:'squat'};
async function loadEXDB(){
  if(EXDB)return EXDB;
  const r=await fetch(EXDB_URL); const raw=await r.json();
  EXDB=raw.map(normEx).filter(e=>e.name);
  return EXDB;
}
function openExSearch(schedaId){
  exTargetScheda=schedaId;
  openSheet(`<h3>Libreria esercizi</h3>
    <div class="note">Esercizi illustrati con istruzioni. Cerca in inglese o italiano (es. "panca", "squat", "curl").</div>
    <input type="text" id="ex-q" placeholder="Cerca…" oninput="searchEx()" style="margin-top:10px">
    <div id="ex-results" style="margin-top:8px"><div class="note">Caricamento libreria…</div></div>
    <div class="note" style="opacity:.7;margin-top:12px">Illustrazioni: Everkinetic · CC BY-SA 4.0</div>`);
  loadEXDB().then(()=>{$('#ex-results').innerHTML='<div class="note">Scrivi per cercare.</div>';$('#ex-q').focus();})
    .catch(()=>$('#ex-results').innerHTML='<div class="note">⚠️ Libreria non raggiungibile (serve connessione). Aggiungi l\'esercizio a mano.</div>');
}
function searchEx(){
  const q=$('#ex-q').value.trim().toLowerCase();
  if(!EXDB||q.length<2){$('#ex-results').innerHTML='<div class="note">Scrivi almeno 2 lettere.</div>';return;}
  let terms=[q];
  Object.entries(IT2EN).forEach(([it,en])=>{if(q.includes(it))terms.push(en);});
  const hits=EXDB.filter(e=>terms.some(t=>e.name.toLowerCase().includes(t))).slice(0,20);
  $('#ex-results').innerHTML=hits.length?hits.map(e=>
    `<div class="exhit" onclick='pickEx(${JSON.stringify(e.id)})'>
      <img loading="lazy" src="${EXIMG+(e.images[0]||'')}" alt="" onerror="this.style.visibility='hidden'">
      <div><div class="n">${esc(e.name)}</div><div class="m">${esc((e.primaryMuscles||[]).map(m=>itMap(IT_MUSC,m)).join(', '))}${e.equipment?' · '+esc(e.equipment):''}</div></div>
      <span class="chev">▸</span>
    </div>`).join(''):'<div class="note">Nessun risultato: prova in inglese (es. "bench press").</div>';
}
function pickEx(id){
  const e=EXDB.find(x=>x.id===id); if(!e)return;
  openSheet(exDetailHTML(e)+`
    <div class="grid2" style="margin-top:14px">
      <div><span class="mini">Ripetizioni (schema)</span><input type="text" id="pk-r" value="4x8" placeholder="es. 12-10-8-8"></div>
      <div><span class="mini">Rec. (s)</span><input type="number" id="pk-w" value="90" inputmode="numeric"></div>
    </div>
    <input type="text" id="pk-note" placeholder="Nota (facoltativa, es. ultima serie in stripping)" style="margin-top:8px">
    <button class="btn" onclick='confirmPickEx(${JSON.stringify(e.id)})'>Aggiungi alla scheda</button>
    <button class="btn ghost" onclick="openExSearch(exTargetScheda)">← Torna alla ricerca</button>`);
  startExAnim(e); translateEx(e);
}
function confirmPickEx(id){
  const e=EXDB.find(x=>x.id===id);
  const sch=DB.schede.find(s=>s.id===exTargetScheda); if(!sch)return;
  const scheme=parseScheme($('#pk-r').value)||[8,8,8,8];
  sch.esercizi.push({nome:e.name,dbId:e.id,scheme,
    sets:scheme.length,reps:firstRep(scheme),rest:parseInt($('#pk-w').value)||90,note:($('#pk-note').value||'').trim()});
  save(); closeSheet(); renderGym(); toast(e.name+' aggiunto ✓');
  document.querySelector(`details[data-id="${exTargetScheda}"]`)?.setAttribute('open','');
}
function exDetailHTML(e){
  const imgs=(e.images||[]); const two=imgs.length>1;
  const meta=[(e.primaryMuscles||[]).map(m=>itMap(IT_MUSC,m)).join(', '),itMap(IT_LEVEL,e.level),itMap(IT_EQUIP,e.equipment)].filter(Boolean).join(' · ');
  const cached=DB.exTrans&&DB.exTrans[e.id];
  const steps=((cached&&cached.length)?cached:(e.instructions||[])).slice(0,8);
  const hasEng=(e.instructions||[]).length;
  const status=cached?'🇮🇹 in italiano':(hasEng?(DB.settings.gemKey?'traduco in italiano…':'in inglese · attiva l\'AI in Admin'):'');
  return `<h3>${esc(e.name)}</h3>
    <div class="note" style="text-transform:capitalize">${esc(meta)}</div>
    <div class="exview" id="ex-view">
      <div class="exview-skel"></div>
      ${imgs.map((p,i)=>`<img class="exframe" data-i="${i}" src="${EXIMG+p}" alt="Posizione ${i+1}" onload="exViewLoaded()" onerror="exViewLoaded()">`).join('')}
      ${two?'<div class="exview-badge" id="ex-frame-lbl">Posizione 1 · inizio</div><div class="exview-dots"><span class="on"></span><span></span></div>':''}
    </div>
    ${two?'<div class="note" style="margin-top:6px">Illustrazione animata dell\'esecuzione (inizio → fine).</div>':''}
    <a class="ytbtn" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent(e.name+' esecuzione tutorial')}"><span>▶</span> Guarda i video su YouTube</a>
    ${steps.length?`<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:14px;gap:10px">
      <label class="f" style="margin:0">Esecuzione</label>
      <span class="note" id="ex-trans-status" style="margin:0;text-align:right">${status}</span></div>
      <div id="ex-instr">${instrOL(steps)}</div>`:''}
    <div class="note" style="opacity:.65;margin-top:12px">Illustrazione: Everkinetic · CC BY-SA 4.0</div>`;
}
// Traduce in italiano le istruzioni (una tantum, poi in cache) usando Gemini
async function translateEx(e){
  if(!e||!(e.instructions||[]).length)return;
  if(DB.exTrans&&DB.exTrans[e.id]&&DB.exTrans[e.id].length)return; // già tradotto
  if(!DB.settings.gemKey)return;
  try{
    const prompt=`Traduci in italiano queste istruzioni dell'esercizio "${e.name}", chiare e pratiche. Rispondi SOLO con i passaggi tradotti, uno per riga, senza numeri né trattini né elenco puntato:\n`+e.instructions.join('\n');
    const t=await geminiOnce(prompt);
    const steps=t.split('\n').map(s=>s.replace(/^\s*[\d.)\-•–]+\s*/,'').trim()).filter(Boolean).slice(0,8);
    if(steps.length){
      DB.exTrans=DB.exTrans||{}; DB.exTrans[e.id]=steps; save();
      const box=$('#ex-instr'); if(box)box.innerHTML=instrOL(steps);
      const st=$('#ex-trans-status'); if(st)st.textContent='🇮🇹 in italiano';
    }
  }catch(_){ const st=$('#ex-trans-status'); if(st)st.textContent='in inglese (traduzione non riuscita)'; }
}
let exAnimT=null;
function exViewLoaded(){const v=$('#ex-view');if(v)v.classList.add('loaded');}
function startExAnim(e){ // crossfade fra le 2 pose → mini animazione dell'esecuzione
  clearTimeout(exAnimT);
  if(!e.images||e.images.length<2)return;
  (function loop(){
    const v=$('#ex-view'); if(!v)return;
    const on=v.classList.toggle('show1');
    const dots=v.querySelectorAll('.exview-dots span');
    if(dots.length){dots[0].classList.toggle('on',!on);dots[1].classList.toggle('on',on);}
    const lbl=$('#ex-frame-lbl'); if(lbl)lbl.textContent=on?'Posizione 2 · fine':'Posizione 1 · inizio';
    exAnimT=setTimeout(loop,1200);
  })();
}
async function openExDetailByName(name,dbId){
  try{
    await loadEXDB();
    const e=dbId?EXDB.find(x=>x.id===dbId):EXDB.find(x=>x.name.toLowerCase()===name.toLowerCase());
    if(e){openSheet(exDetailHTML(e));startExAnim(e);translateEx(e);return;}
  }catch(_){}
  openSheet(`<h3>${esc(name)}</h3>
    <a class="ytbtn" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent(name+' esecuzione tutorial')}"><span>▶</span> Guarda i video su YouTube</a>`);
}

/* ================================================================
   CORPO
   ================================================================ */
// Se Chart.js non è disponibile (offline/CDN giù), l'app deve comunque funzionare:
// questa riga non deve mai interrompere il caricamento dello script.
if(typeof Chart!=='undefined'){Chart.defaults.font.family='Inter'; Chart.defaults.color='#857F74';}
// Crea un grafico solo se Chart c'è e il canvas esiste; altrimenti non fa nulla (nessun crash).
function safeChart(sel,cfg){const cv=$(sel); if(!cv||typeof Chart==='undefined')return null; try{return new Chart(cv,cfg);}catch(_){return null;}}
const lineOpts=unit=>({responsive:true,maintainAspectRatio:false,
  plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.parsed.y+(unit?' '+unit:'')}}},
  scales:{x:{grid:{display:false}},y:{grid:{color:'#EFEBE0'},ticks:{precision:1}}},
  elements:{line:{tension:.3,borderWidth:2.5,borderColor:'#8E241E'},
            point:{radius:4,backgroundColor:'#8E241E',borderColor:'#fff',borderWidth:2}}});
let bodyChart=null, metric='peso';
const METRICS={peso:'kg',smm:'kg',bf:'%',fatkg:'kg',aec:'',bmr:'kcal'};
const METRIC_LABELS={peso:'Peso',smm:'Muscolo',bf:'% Grasso',fatkg:'Grasso kg',aec:'AEC',bmr:'Basale'};
const METRIC_INV={peso:false,smm:false,bf:true,fatkg:true,aec:true,bmr:false}; // inv=true → in calo è positivo (verde)
const METRIC_DEC={peso:1,smm:1,bf:1,fatkg:1,aec:3,bmr:0};
const DASH_KEYS=['peso','smm','bf','fatkg','aec','bmr'];
function fmtN(v,k){return v==null?'–':(+v).toFixed(METRIC_DEC[k]);}
function deltaCls(d,k){ if(d==null||d===0)return 'flat'; return ((d>0)!==METRIC_INV[k])?'up':'down'; }
function deltaHTML(d,k,suffix){ if(d==null)return ''; const a=d>0?'▲':d<0?'▼':'■'; const s=(d>0?'+':'')+(+d).toFixed(METRIC_DEC[k]); return `<span class="delta ${deltaCls(d,k)}">${a} ${s}${suffix||''}</span>`; }

function setMetric(m){ metric=m; renderDashboard(); renderBodyChart(); }
function renderCorpo(){
  $('#sc-date').value=today();
  renderSummary(); renderComposition(); renderDashboard(); renderBodyChart(); renderGauges(); renderDietVsWeight(); renderScanList();
}
function renderSummary(){
  const sc=sortedScans(); const box=$('#corpo-summary'); if(!box)return;
  if(!sc.length){box.innerHTML='<span class="note">Nessuna scansione.</span>';return;}
  const last=sc[sc.length-1], prev=sc.length>1?sc[sc.length-2]:null, first=sc[0];
  const tile=k=>{
    const v=last[k]; if(v==null)return '';
    const dp=prev&&prev[k]!=null?+(v-prev[k]).toFixed(3):null;
    const df=first[k]!=null&&first!==last?+(v-first[k]).toFixed(3):null;
    return `<div class="stat"><div class="lbl">${METRIC_LABELS[k]}</div>
      <div class="val">${fmtN(v,k)}<small> ${METRICS[k]}</small></div>
      ${dp!=null?`<div class="delta ${deltaCls(dp,k)}">${dp>0?'▲':dp<0?'▼':'■'} ${(dp>0?'+':'')+fmtN(dp,k)} vs scorsa</div>`:''}
      ${df!=null?`<div class="delta flat" style="opacity:.7">${(df>0?'+':'')+fmtN(df,k)} dall'inizio</div>`:''}</div>`;
  };
  box.innerHTML=`<div class="rlabel">Ultima analisi · ${fmtD(last.date)}${last.note?' · '+esc(last.note):''}</div>
    <div class="grid3" style="margin-top:10px">${tile('peso')}${tile('smm')}${tile('bf')}</div>
    <button class="btn ghost small" style="width:100%;margin-top:12px" onclick="analyzeBody()">✦ Analizza i miei progressi con l'AI</button>`;
}
function renderComposition(){
  const box=$('#corpo-composition'); if(!box)return;
  const last=[...sortedScans()].reverse().find(s=>s.peso!=null&&s.fatkg!=null);
  if(!last){box.innerHTML='';return;}
  const peso=last.peso, grasso=last.fatkg, magra=+(peso-grasso).toFixed(1);
  const musc=last.smm||0, resto=+(magra-musc).toFixed(1);
  const pc=v=>Math.max(0,v)/peso*100;
  const seg=(v,col)=>`<div class="seg" style="width:${pc(v)}%;background:${col}">${pc(v)>13?`<span>${v}</span>`:''}</div>`;
  box.innerHTML=`<div class="rlabel">Composizione corporea · ${peso} kg</div>
    <div class="compbar">${seg(musc,'#8E241E')}${seg(resto,'#1B8A55')}${seg(grasso,'#B4552D')}</div>
    <div class="complegend">
      <span><i style="background:#8E241E"></i>Muscolo <b>${musc}</b> kg</span>
      <span><i style="background:#1B8A55"></i>Resto magra <b>${resto}</b> kg</span>
      <span><i style="background:#B4552D"></i>Grasso <b>${grasso}</b> kg · ${last.bf}%</span>
    </div>
    <div class="note">Massa magra ${magra} kg (di cui muscolo scheletrico ${musc} kg) · Massa grassa ${grasso} kg.</div>`;
}
function sparkline(vals,active){
  const clean=vals.filter(v=>v!=null);
  if(clean.length<2)return '<svg class="spark" viewBox="0 0 100 26" preserveAspectRatio="none"></svg>';
  const min=Math.min(...clean),max=Math.max(...clean),rng=(max-min)||1,n=clean.length;
  const pts=clean.map((v,i)=>[i/(n-1)*100, 23-((v-min)/rng)*20]);
  const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  const col=active?'#8E241E':'#C3B4AB';
  return `<svg class="spark" viewBox="0 0 100 26" preserveAspectRatio="none">
    <path d="${d}" fill="none" stroke="${col}" stroke-width="${active?2.4:1.6}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
}
function renderDashboard(){
  const box=$('#corpo-dashboard'); if(!box)return;
  const sc=sortedScans();
  box.innerHTML='<div class="dashgrid">'+DASH_KEYS.map(k=>{
    const series=sc.map(s=>s[k]);
    const clean=series.filter(v=>v!=null);
    const last=clean[clean.length-1], prev=clean.length>1?clean[clean.length-2]:null;
    const d=(last!=null&&prev!=null)?+(last-prev).toFixed(3):null;
    return `<button class="dashcard${k===metric?' sel':''}" onclick="setMetric('${k}')" aria-pressed="${k===metric}">
      <div class="lbl">${METRIC_LABELS[k]}</div>
      <div class="dv">${fmtN(last,k)}<small>${METRICS[k]?' '+METRICS[k]:''}</small></div>
      ${d!=null?deltaHTML(d,k):'<span class="delta flat">—</span>'}
      ${sparkline(series,k===metric)}</button>`;
  }).join('')+'</div>';
}
function renderBodyChart(){
  const sc=sortedScans();
  if(bodyChart)bodyChart.destroy();
  const opts=lineOpts(METRICS[metric]);
  if(metric==='peso')opts.scales.y.suggestedMax=71; // così la linea target 70.5 resta visibile
  if(metric==='aec')opts.scales.y.ticks.precision=3;
  // banda/linea di riferimento disegnata sotto ai dati (nessun plugin esterno)
  const refPlugin={id:'corpoRef',beforeDatasetsDraw(chart){
    const {ctx,chartArea:ca,scales:{y}}=chart; if(!ca)return; ctx.save();
    if(metric==='bf'){ const y1=y.getPixelForValue(20),y2=y.getPixelForValue(10);
      ctx.fillStyle='rgba(27,138,85,.10)'; ctx.fillRect(ca.left,y1,ca.right-ca.left,y2-y1);
      ctx.fillStyle='rgba(27,138,85,.6)'; ctx.font='10px Inter'; ctx.fillText('range sano 10–20%',ca.left+6,y1+13);
    } else if(metric==='peso'){ const yt=y.getPixelForValue(70.5);
      ctx.strokeStyle='rgba(142,36,30,.55)'; ctx.setLineDash([5,4]); ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(ca.left,yt); ctx.lineTo(ca.right,yt); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle='rgba(142,36,30,.7)'; ctx.font='10px Inter'; ctx.fillText('target 70.5',ca.right-64,yt-5);
    }
    ctx.restore();
  }};
  bodyChart=safeChart('#chart-body',{type:'line',
    data:{labels:sc.map(s=>fmtD(s.date)),datasets:[{data:sc.map(s=>s[metric]),label:METRIC_LABELS[metric],spanGaps:true}]},
    options:opts, plugins:[refPlugin]});
}
function renderGauges(){
  const box=$('#corpo-gauges'); if(!box)return;
  const last=[...sortedScans()].reverse().find(s=>s.bf!=null||s.aec!=null||s.visc!=null);
  if(!last){box.innerHTML='';return;}
  const parts=[];
  if(last.bf!=null)  parts.push(gauge('% Grasso corporeo','range sano 10–20%',last.bf,'%',5,30,10,20));
  if(last.aec!=null) parts.push(gauge('Rapporto AEC — idratazione','equilibrato ≤ 0.380',last.aec,'',0.360,0.400,0.360,0.380));
  if(last.visc!=null)parts.push(gauge('Grasso viscerale','sano sotto 10',last.visc,'',1,20,1,9));
  box.innerHTML=parts.join('<div style="height:16px"></div>')||'<span class="note">Dati non disponibili.</span>';
}
function gauge(label,sub,val,unit,min,max,nlo,nhi){
  const pos=Math.min(97,Math.max(3,(val-min)/(max-min)*100));
  const gl=Math.max(0,(nlo-min)/(max-min)*100), gh=Math.min(100,(nhi-min)/(max-min)*100);
  const ok=val>=nlo&&val<=nhi;
  const bg=`linear-gradient(90deg,#E9E4D8 0 ${gl}%,var(--green-soft) ${gl}% ${gh}%,#F3DED7 ${gh}% 100%)`;
  return `<div><div class="rlabel" style="margin:0">${label}
      <span class="pill ${ok?'g':'r'}" style="margin-left:8px">${ok?'nella norma':'fuori norma'}</span></div>
    <div class="val" style="font-size:1.4rem;font-weight:700;font-variant-numeric:tabular-nums;margin-top:2px">${val}<small style="font-size:.8rem;color:var(--muted)"> ${unit}</small></div>
    <div class="rangebar"><div class="track" style="background:${bg}"><div class="dot" style="left:${pos}%"></div></div>
    <div class="ends">${[...new Set([min,nlo,nhi,max])].map(e=>'<span>'+e+'</span>').join('')}</div></div>
    <div class="note" style="margin-top:5px">${sub}</div></div>`;
}

/* ---------------- DIETA vs PESO (small multiples, stesso asse tempo) ---------------- */
let kcalChart=null, pesoDvChart=null, dvpWin=90; // giorni finestra; 0 = tutto
const fmtISO=dt=>dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');
function dietDayForStr(ds){const[y,m,d]=ds.split('-').map(Number);return dietDayFor(new Date(y,m-1,d));}
function setDvWin(w){dvpWin=w;renderDietVsWeight();}
function dvpDays(){
  const end=new Date(), endD=new Date(end.getFullYear(),end.getMonth(),end.getDate());
  let start;
  if(dvpWin===0){const f=sortedScans()[0]; const[y,m,d]=(f?f.date:today()).split('-').map(Number); start=new Date(y,m-1,d);}
  else {start=new Date(endD); start.setDate(endD.getDate()-dvpWin+1);}
  const days=[]; for(let d=new Date(start); d<=endD; d.setDate(d.getDate()+1)) days.push(fmtISO(d));
  return days;
}
function renderDietVsWeight(){
  const chips=$('#dvp-chips');
  if(chips)chips.innerHTML=[[30,'30 giorni'],[90,'90 giorni'],[0,'Tutto']].map(([w,l])=>
    `<button class="chip ${dvpWin===w?'on':''}" onclick="setDvWin(${w})">${l}</button>`).join('');
  const days=dvpDays(), labels=days.map(fmtD);
  const eaten=[], plan=[], peso=[];
  days.forEach(ds=>{
    const meals=mealsOfDay(dietDayForStr(ds)), log=DB.diary[ds]||{};
    plan.push(meals.reduce((a,m)=>a+m.kcal,0));
    if(Object.keys(log).length){
      let e=0; meals.forEach(m=>{const l=log[m.id]; if(l){ if(l.st==='ok')e+=m.kcal; else if(l.st==='other')e+=(+l.kcal||0);}});
      eaten.push(e);
    } else eaten.push(null);
    const s=DB.scans.find(x=>x.date===ds); peso.push(s?s.peso:null);
  });
  const xopt={grid:{display:false},ticks:{autoSkip:true,maxTicksLimit:6,maxRotation:0}};
  if(kcalChart)kcalChart.destroy();
  kcalChart=safeChart('#chart-kcal',{type:'line',
    data:{labels,datasets:[
      {label:'Piano',data:plan,borderColor:'#C3B4AB',borderDash:[5,4],borderWidth:1.5,pointRadius:0,tension:.2},
      {label:'Assunte',data:eaten,borderColor:'#8E241E',borderWidth:2.5,pointRadius:3,pointBackgroundColor:'#8E241E',pointBorderColor:'#fff',pointBorderWidth:1.5,spanGaps:false,tension:.2}
    ]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:true,position:'bottom',labels:{boxWidth:12,boxHeight:2,font:{size:11}}},
        tooltip:{callbacks:{label:c=>c.dataset.label+': '+(c.parsed.y==null?'—':c.parsed.y+' kcal')}}},
      scales:{x:xopt,y:{grid:{color:'#EFEBE0'},ticks:{precision:0}}}}});
  const ws=DB.scans.map(s=>s.peso).filter(v=>v!=null);
  const yMin=ws.length?Math.floor(Math.min(...ws)-2):undefined, yMax=ws.length?Math.ceil(Math.max(...ws)+2):undefined;
  const pesoInWin=peso.some(v=>v!=null);
  if(pesoDvChart)pesoDvChart.destroy();
  pesoDvChart=safeChart('#chart-peso-dv',{type:'line',
    data:{labels,datasets:[{label:'Peso',data:peso,borderColor:'#8E241E',borderWidth:2.5,pointRadius:3,pointBackgroundColor:'#8E241E',pointBorderColor:'#fff',pointBorderWidth:1.5,spanGaps:true,tension:.3}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.parsed.y==null?'—':c.parsed.y+' kg'}}},
      scales:{x:xopt,y:{grid:{color:'#EFEBE0'},ticks:{precision:1},suggestedMin:yMin,suggestedMax:yMax}}}});
  const note=$('#dvp-note');
  if(note)note.textContent=!eaten.some(v=>v!=null)
    ? 'Registra i pasti da Home o Dieta: qui vedrai le calorie assunte contro il piano, allineate al peso.'
    : pesoInWin
      ? 'Calorie assunte vs piano (sopra) e peso (sotto), allineati sullo stesso periodo.'
      : 'Nessuna pesata in questo periodo: le scansioni InBody sono mensili — usa «Tutto» per vedere il trend del peso.';
}
function addScan(){
  const d=$('#sc-date').value,p=parseFloat($('#sc-peso').value);
  if(!d||!p){toast('Servono almeno data e peso');return;}
  DB.scans.push({id:uid(),date:d,peso:p,
    smm:parseFloat($('#sc-smm').value)||null, bf:parseFloat($('#sc-bf').value)||null,
    fatkg:parseFloat($('#sc-fatkg').value)||null, bmr:parseInt($('#sc-bmr').value)||null,
    aec:parseFloat($('#sc-aec').value)||null, score:parseInt($('#sc-score').value)||null,
    visc:parseInt($('#sc-visc').value)||null, note:$('#sc-note').value.trim()});
  ['#sc-peso','#sc-smm','#sc-bf','#sc-fatkg','#sc-bmr','#sc-aec','#sc-score','#sc-visc','#sc-note'].forEach(s=>$(s).value='');
  save(); haptic(); toast('Scansione salvata ✓'); renderCorpo();
}
function delScan(id){
  if(!confirm('Eliminare questa scansione?'))return;
  DB.scans=DB.scans.filter(s=>s.id!==id); save(); renderCorpo();
}
function renderScanList(){
  const sc=sortedScans().reverse();
  $('#scan-list').innerHTML=sc.length?sc.map(s=>
    `<div class="row"><div><div class="t">${fmtD(s.date)} — ${s.peso} kg</div>
    <div class="s">Muscolo ${s.smm??'–'} kg · Grasso ${s.bf??'–'}%${s.fatkg!=null?' ('+s.fatkg+' kg)':''} · AEC ${s.aec??'–'}${s.bmr?' · Basale '+s.bmr+' kcal':''}${s.score?' · Punteggio '+s.score:''}${s.visc?' · Viscerale '+s.visc:''}${s.note?'<br>'+esc(s.note):''}</div></div>
    <button class="x" onclick="delScan(${s.id})">✕</button></div>`).join(''):'<span class="note">Nessuna scansione.</span>';
}

/* ================================================================
   ADMIN
   ================================================================ */
let admDietDay=1;
function renderAdmin(){
  // impostazioni
  $('#ad-giorno1').innerHTML=[1,2,3,4,5,6,7].map(d=>`<option value="${d}"${DB.settings.giorno1===d?' selected':''}>${WDNAMES[d]}</option>`).join('');
  ['col','spu','pra','mer','cen','post'].forEach(id=>{const e=$('#mt-'+id);if(e)e.value=DB.mealTimes[id]||'';});
  $('#ad-notif').checked=DB.settings.notif;
  $('#gem-key').value=DB.settings.gemKey||''; $('#gem-model').value=DB.settings.gemModel||'gemini-2.5-flash';
  $('#gem-ctx').checked=DB.settings.gemCtx!==false;
  renderAdmDiet();
}
function saveSettings(){
  DB.settings.giorno1=parseInt($('#ad-giorno1').value);
  ['col','spu','pra','mer','cen','post'].forEach(id=>{const v=$('#mt-'+id).value;if(v)DB.mealTimes[id]=v;});
  DB.settings.gemKey=$('#gem-key').value.trim();
  DB.settings.gemModel=$('#gem-model').value.trim()||'gemini-2.5-flash';
  DB.settings.gemCtx=$('#gem-ctx').checked;
  save(); toast('Impostazioni salvate ✓'); dietDaySel=null;
}
async function toggleNotif(){
  const want=$('#ad-notif').checked;
  if(want){
    if(!('Notification' in window)){toast('Notifiche non supportate');$('#ad-notif').checked=false;return;}
    const p=await Notification.requestPermission();
    if(p!=='granted'){toast('Permesso negato');$('#ad-notif').checked=false;return;}
    toast('Notifiche attive ✓');
  }
  DB.settings.notif=$('#ad-notif').checked; save();
}
function renderAdmDiet(){
  $('#adm-diet-chips').innerHTML=[1,2,3,4,5,6,7].map(d=>
    `<button class="chip ${d===admDietDay?'on':''}" onclick="admDietDay=${d};renderAdmDiet()">G${d}</button>`).join('');
  const day=DB.diet[admDietDay];
  const order=['col','spu','pra','mer','cen','post'];
  $('#adm-diet-body').innerHTML=
    `<label class="f" style="display:flex;align-items:center;gap:8px"><input type="checkbox" ${day.preAll?'checked':''} onchange="admTogglePre(this.checked)"> Giorno di allenamento (cena pre-workout + spuntino post)</label>`+
    order.filter(id=>day.meals[id]).map(id=>
      `<label class="f" style="margin-top:14px">${MEAL_NAMES[id]}</label>`+
      day.meals[id].map((it,i)=>
        `<div style="display:grid;grid-template-columns:1fr 76px 64px 34px;gap:6px;margin-bottom:6px">
        <input type="text" value="${esc(it.n)}" onchange="admEditItem('${id}',${i},'n',this.value)" placeholder="Alimento">
        <input type="text" value="${esc(it.q||'')}" onchange="admEditItem('${id}',${i},'q',this.value)" placeholder="Qtà">
        <input type="number" value="${it.k}" onchange="admEditItem('${id}',${i},'k',parseInt(this.value)||0)" placeholder="kcal" inputmode="numeric">
        <button class="x" onclick="admDelItem('${id}',${i})">✕</button></div>`).join('')+
      `<button class="btn small ghost" onclick="admAddItem('${id}')">+ alimento</button>`
    ).join('');
}
function admTogglePre(v){
  const day=DB.diet[admDietDay]; day.preAll=v;
  if(v&&!day.meals.post)day.meals.post=postAll();
  if(!v)delete day.meals.post;
  save(); renderAdmDiet();
}
function admEditItem(mid,i,field,val){DB.diet[admDietDay].meals[mid][i][field]=val;save();}
function admDelItem(mid,i){DB.diet[admDietDay].meals[mid].splice(i,1);save();renderAdmDiet();}
function admAddItem(mid){DB.diet[admDietDay].meals[mid].push({n:'',q:'',k:0});save();renderAdmDiet();}

/* ---------------- BACKUP ---------------- */
function exportBackup(){
  const blob=new Blob([JSON.stringify(DB,null,1)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download='fitlog-backup-'+today()+'.json';
  a.click(); URL.revokeObjectURL(a.href); toast('Backup esportato ✓');
}
function importBackup(input){
  const f=input.files[0]; if(!f)return;
  const r=new FileReader();
  r.onload=()=>{try{
    const d=JSON.parse(r.result);
    if(!d.diet||!d.settings)throw new Error('File non valido');
    DB=d; persist(); toast('Backup importato ✓'); renderAdmin(); 
  }catch(e){toast('⚠️ File non valido');}};
  r.readAsText(f);
}

/* ================================================================
   AI — Gemini
   ================================================================ */
function openAIChat(){
  const chips=DB.settings.gemKey?`<div class="chips" style="margin-top:10px">
    <button class="chip" onclick="askQuick('Come sta andando la mia ricomposizione corporea? Guarda le scansioni InBody.')">Come va il fisico?</button>
    <button class="chip" onclick="askQuick('Valuta la mia dieta di oggi e dimmi da nutrizionista cosa miglioreresti.')">Valuta la dieta</button>
    <button class="chip" onclick="askQuick('In base agli ultimi allenamenti, come dovrei progredire con i carichi?')">Carichi</button>
  </div>`:'';
  openSheet(`<h3>Assistente AI ✦</h3>
    <div class="note">Il tuo PT e nutrizionista virtuale: ragiona sui tuoi dati reali (scansioni, dieta, allenamenti). Non sostituisce i professionisti. ${DB.settings.gemKey?'':'<b>Configura prima la API key in Admin → Gemini.</b>'}</div>
    ${chips}
    <div class="chat" id="chat"></div>
    <div class="askrow"><input type="text" id="ai-q" placeholder="es. Sto perdendo muscolo?" onkeydown="if(event.key==='Enter')askAI()">
    <button onclick="askAI()" aria-label="Invia">➤</button></div>`);
  renderChat();
}
function renderChat(){
  const c=$('#chat'); if(!c)return;
  c.innerHTML=DB.chat.map(m=>`<div class="msg ${m.r}">${esc(m.t)}</div>`).join('')||'<div class="note">Fai una domanda sui tuoi progressi, sulla dieta o sugli allenamenti.</div>';
  $('#sheet').scrollTop=1e6;
}
function buildContext(){
  const sc=sortedScans(); const now=new Date(); const dd=dietDayFor(now);
  const last=sc[sc.length-1], first=sc[0];
  let c='Agisci come il mio personal trainer e nutrizionista: pratico, diretto e motivante, in italiano. Basati SOLO sui dati qui sotto; se un dato manca, dillo invece di inventarlo. Niente diagnosi mediche.\n\n';
  c+='PROFILO: Matteo, 25 anni, 179 cm, programmatore. Alleno dal 14/08/2025. Fase di CUT dal 17/02/2026, creatina dal 01/02/2026. Target storico InBody 70.5 kg.\n\nSCANSIONI INBODY (dalla più vecchia alla più recente):\n';
  sc.forEach(s=>c+=`- ${s.date}: peso ${s.peso}kg, muscolo scheletrico ${s.smm??'-'}kg, grasso ${s.bf??'-'}% (${s.fatkg??'-'}kg), AEC ${s.aec??'-'}, viscerale ${s.visc??'-'}${s.bmr?', metab.basale '+s.bmr+'kcal':''}\n`);
  if(last&&first&&last!==first){
    const dv=(a,b,u)=>{const x=(a||0)-(b||0);return (x>=0?'+':'')+x.toFixed(1)+u;};
    c+=`Variazione totale dall'inizio: peso ${dv(last.peso,first.peso,'kg')}, muscolo ${dv(last.smm,first.smm,'kg')}, grasso ${dv(last.bf,first.bf,'%')} (${dv(last.fatkg,first.fatkg,'kg')}).\n`;
  }
  c+='\nDIETA DI OGGI (giorno '+dd+'):\n';
  mealsOfDay(dd).forEach(m=>c+=`- ${m.nome} ${m.ora}: ${itemsTxt(m.items)} (${m.kcal} kcal)\n`);
  const dl=DB.diary[today()]||{};
  const done=Object.entries(dl).map(([k,v])=>MEAL_NAMES[k]+': '+(v.st==='ok'?'seguito':v.st==='other'?('altro — '+(v.note||'')+' '+(v.kcal||0)+'kcal'):'saltato')).join('; ');
  if(done)c+='Registrato oggi: '+done+'\n';
  if(DB.sessions.length){
    c+='\nULTIMI ALLENAMENTI:\n';
    [...DB.sessions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6).forEach(s=>{
      const det=s.entries.map(e=>e.esercizio+' '+entrySets(e).map(x=>x.p+'kg×'+x.r+(x.rpe?'@RPE'+x.rpe:'')).join('/')).join('; ');
      c+=`- ${s.date}: ${det}\n`;
    });
  }
  c+='\nRispondi conciso (max ~8 righe) con consigli concreti.';
  return c;
}
// Chiamata singola all'API Gemini (riusata da chat, analisi progressi e peso consigliato)
async function geminiCall(contents){
  const res=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(DB.settings.gemModel||GEM_MODEL_DEFAULT)+':generateContent?key='+encodeURIComponent(DB.settings.gemKey),{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({contents,generationConfig:{thinkingConfig:{thinkingLevel:'minimal'}}})});
  const d=await res.json();
  if(d.error)throw new Error(d.error.message||'Errore API');
  return (d.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join('').trim()||'(risposta vuota)';
}
function geminiOnce(prompt){ return geminiCall([{role:'user',parts:[{text:prompt}]}]); }
function askQuick(q){ if(!$('#ai-q'))openAIChat(); const i=$('#ai-q'); if(i){i.value=q; askAI();} }
function analyzeBody(){
  if(!DB.settings.gemKey){openAIChat();toast('Configura la API key AI in Admin');return;}
  askQuick('Analizza le mie ultime scansioni InBody: come sta andando il fisico in questa fase di cut? Cosa va bene, cosa dovrei aggiustare tra allenamento e dieta?');
}
async function askAI(){
  const q=$('#ai-q').value.trim(); if(!q)return;
  if(!DB.settings.gemKey){toast('Configura la API key in Admin');return;}
  $('#ai-q').value='';
  DB.chat.push({r:'me',t:q}); renderChat();
  const c=$('#chat'); const th=document.createElement('div'); th.className='msg ai'; th.textContent='…'; c.appendChild(th); $('#sheet').scrollTop=1e6;
  const contents=[];
  if(DB.settings.gemCtx)contents.push({role:'user',parts:[{text:buildContext()}]},{role:'model',parts:[{text:'Ok, ho i tuoi dati. Chiedimi pure.'}]});
  DB.chat.slice(-12).forEach(m=>contents.push({role:m.r==='me'?'user':'model',parts:[{text:m.t}]}));
  try{
    const t=await geminiCall(contents); th.remove(); DB.chat.push({r:'ai',t});
  }catch(e){
    th.remove(); DB.chat.push({r:'err',t:'Errore: '+e.message+'\nControlla API key e nome modello in Admin.'});
  }
  save(); renderChat();
}
// Peso consigliato dall'AI durante l'allenamento
async function suggestWeight(){
  const ex=plExercise(); if(!ex)return;
  if(!DB.settings.gemKey){toast('Configura la API key AI in Admin');return;}
  const box=$('#pl-ai'); if(box)box.innerHTML='<div class="pl-ai-tip">✦ Calcolo il peso consigliato…</div>';
  const hist=[];
  [...DB.sessions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8).forEach(s=>{
    const en=s.entries.find(x=>x.esercizio===ex.nome);
    if(en)hist.push(s.date+': '+entrySets(en).map(x=>x.p+'kg×'+x.r).join(', '));
  });
  const prompt=`Sei il mio personal trainer. Esercizio: "${ex.nome}". Oggi: serie ${PL.setIdx+1} di ${ex.sets}, obiettivo ${ex.reps} ripetizioni. Sono in fase di cut.\nStorico recente di questo esercizio:\n${hist.join('\n')||'nessuno storico registrato'}\nSuggerisci il PESO di lavoro in kg per la prossima serie, con progressione graduale e sicura. Rispondi in UNA sola riga: "<numero> kg — <motivo breve>".`;
  try{
    const t=await geminiOnce(prompt);
    const m=t.match(/(\d+(?:[.,]\d+)?)\s*kg/i);
    const w=m?m[1].replace(',','.'):null;
    if(box)box.innerHTML=`<div class="pl-ai-tip">✦ ${esc(t)}</div>`+
      (w?`<button class="btn small soft" style="max-width:300px;margin:8px auto 0" onclick="var i=document.querySelector('#pl-p');if(i){i.value='${w}';haptic();toast('Peso impostato: ${w} kg');}">Usa ${w} kg</button>`:'');
  }catch(e){ if(box)box.innerHTML='<div class="pl-ai-tip">Errore AI: '+esc(e.message)+'</div>'; }
}

/* ================================================================
   NOTIFICHE (best-effort: iOS non permette notifiche programmate
   ad app chiusa senza un server push — il prompt in Home resta
   il meccanismo principale)
   ================================================================ */
function checkNotifications(){
  if(!DB.settings.notif||!('Notification'in window)||Notification.permission!=='granted')return;
  const now=new Date(), t=today(), dd=dietDayFor(now);
  const dayLog=DB.diary[t]||{}; DB.notified[t]=DB.notified[t]||{};
  const hm=now.getHours()*60+now.getMinutes();
  mealsOfDay(dd).forEach(m=>{
    const[h,mi]=m.ora.split(':').map(Number), mt=h*60+mi;
    if(hm>=mt&&hm<=mt+30&&!dayLog[m.id]&&!DB.notified[t][m.id]){
      DB.notified[t][m.id]=1; save();
      const body=`Hai ${mealVerb(m.id)} con ${itemsTxt(m.items).toLowerCase()}? (${m.kcal} kcal)`;
      navigator.serviceWorker?.ready.then(reg=>reg.showNotification('FIT·LOG — '+m.nome,{body,icon:'icons/icon-192.png',badge:'icons/icon-192.png'}))
        .catch(()=>{try{new Notification('FIT·LOG — '+m.nome,{body});}catch(_){}}); 
    }
  });
}
setInterval(checkNotifications,60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){renderHome();checkNotifications();}});

/* ---------------- INIT ---------------- */
loadDB();
renderHome();
checkNotifications();
if(DB.activeWorkout){
  setTimeout(()=>{if(confirm('Hai un allenamento non terminato. Vuoi riprenderlo?'))resumeWorkout();},400);
}
