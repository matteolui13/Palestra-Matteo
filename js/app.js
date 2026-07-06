/* ============================================================
   FIT·LOG — logica applicativa
   Tutti i dati restano in localStorage sul dispositivo.
   ============================================================ */

/* ---------------- STATE ---------------- */
const KEY='fitlog-v2';
let DB=null;

function seed(){
  return {
    scans:[
      {id:1,date:'2025-08-29',peso:63.5,smm:29.0,bf:18.0,aec:0.378,score:null,visc:null,note:'Prima scansione'},
      {id:2,date:'2025-10-03',peso:66.5,smm:30.7,bf:17.6,aec:0.373,score:null,visc:null,note:''},
      {id:3,date:'2025-11-07',peso:67.4,smm:31.1,bf:17.9,aec:0.372,score:null,visc:null,note:''},
      {id:4,date:'2025-12-01',peso:67.6,smm:31.8,bf:17.1,aec:0.368,score:75,visc:4,note:'Target 70.5 kg · +3.9 kg muscolo, −1.0 kg grasso'}
    ],
    schede:[], sessions:[],
    diet: JSON.parse(JSON.stringify(DIET_SEED)),
    mealTimes: {...MEAL_TIMES_DEFAULT},
    diary:{}, // '2026-07-06': { col:{st:'ok',kcal:426,note:''} }
    settings:{giorno1:1, notif:false, gemKey:'', gemModel:'gemini-2.5-flash', gemCtx:true},
    chat:[], notified:{}
  };
}
function loadDB(){
  try{const r=localStorage.getItem(KEY); DB=r?JSON.parse(r):null;}catch(e){DB=null;}
  if(!DB) DB=seed();
  // migrazioni soft
  DB.notified=DB.notified||{}; DB.diary=DB.diary||{}; DB.chat=DB.chat||[];
  DB.activeWorkout=DB.activeWorkout||null;
  // migrazione esercizi: target "4×8" → serie/reps/recupero strutturati
  DB.schede.forEach(s=>s.esercizi.forEach(e=>{
    if(e.sets==null){
      const m=(e.target||'').match(/(\d+)\s*[x×]\s*(\d+)/i);
      e.sets=m?parseInt(m[1]):3; e.reps=m?parseInt(m[2]):10; e.rest=e.rest||90;
    }
  }));
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
  homeChart=new Chart($('#chart-home'),{type:'line',
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
    sch.esercizi.map(e=>esc(e.nome)+' '+e.sets+'×'+e.reps).join(' · ')+'</div>'
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
  $('#pl-title').textContent=sch.nome;
  $('#pl-dots').innerHTML=sch.esercizi.map((_,i)=>
    `<span class="dot ${i<PL.exIdx?'done':i===PL.exIdx?'cur':''}"></span>`).join('');

  if(isRest){
    $('#pl-body').innerHTML=`
      <div class="pl-rest">
        <div class="pl-lbl">Recupero</div>
        <div class="pl-timer" id="pl-timer">--</div>
        <div class="pl-ringtrack"><div class="pl-ringfill" id="pl-ringfill"></div></div>
        <div class="pl-next">Prossima: <b>${esc(ex.nome)}</b> — serie ${PL.setIdx+1} di ${ex.sets}</div>
        <div style="display:flex;gap:10px;margin-top:20px">
          <button class="btn small soft" style="flex:1" onclick="PL.rest.until+=30000;save()">+30 s</button>
          <button class="btn small" style="flex:1" onclick="endRest()">Salta recupero ▸</button>
        </div>
      </div>`;
    plUpdate();
    return;
  }
  const sugg=ex.peso||lastWeight(ex.nome);
  $('#pl-body').innerHTML=`
    <div class="pl-ex">
      <div class="pl-lbl">Esercizio ${PL.exIdx+1} di ${totEx}</div>
      <a href="#" class="pl-exname" onclick="openExDetailByName('${esc(ex.nome).replace(/'/g,"\\'")}','${ex.dbId||''}');return false">${esc(ex.nome)} ▸</a>
      <div class="pl-target">Serie <b>${PL.setIdx+1}</b> di ${ex.sets} · obiettivo ${ex.reps} reps · recupero ${ex.rest}s</div>
      <div class="pl-inputs">
        <div><span class="mini">Peso kg</span><input type="number" step="0.5" inputmode="decimal" id="pl-p" value="${sugg}"></div>
        <div><span class="mini">Reps</span><input type="number" inputmode="numeric" id="pl-r" value="${ex.reps}"></div>
      </div>
      <button class="btn pl-done" onclick="completeSet()">✓ Serie completata</button>
      ${done.length?`<div class="pl-log">${done.map((s,i)=>`<span class="pill g">S${i+1}: ${s.p}kg×${s.r}</span>`).join(' ')}</div>`:''}
      <div style="display:flex;gap:10px;margin-top:18px">
        ${PL.exIdx>0?'<button class="btn small ghost" style="flex:1" onclick="prevEx()">← Prec.</button>':''}
        <button class="btn small ghost" style="flex:1" onclick="nextEx()">${PL.exIdx<totEx-1?'Salta es. →':'Fine ✓'}</button>
      </div>
    </div>`;
}
function completeSet(){
  const ex=plExercise(); if(!ex)return;
  const p=parseFloat($('#pl-p').value)||0, r=parseInt($('#pl-r').value)||0;
  PL.log[PL.exIdx]=PL.log[PL.exIdx]||[];
  PL.log[PL.exIdx].push({p,r});
  haptic();
  const lastSetOfEx=PL.setIdx+1>=ex.sets;
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
    (s.esercizi.map((e,i)=>`<div class="row"><div class="t">${esc(e.nome)} <span class="s">${e.sets}×${e.reps} · rec ${e.rest}s${e.peso?' · ultimo '+e.peso+'kg':''}</span></div>
      <button class="x" onclick="delEx(${s.id},${i})">✕</button></div>`).join('')||'<span class="note">Nessun esercizio.</span>')+
    `<button class="btn small" style="margin-top:12px" onclick="openExSearch(${s.id})">🔍 Aggiungi dalla libreria (873 esercizi)</button>
     <label class="f" style="margin-top:12px">O a mano</label><input type="text" id="ex-n${s.id}" placeholder="es. Panca piana">
     <div class="grid3" style="margin-top:8px">
       <div><span class="mini">Serie</span><input type="number" id="ex-s${s.id}" value="4" inputmode="numeric"></div>
       <div><span class="mini">Reps</span><input type="number" id="ex-r${s.id}" value="8" inputmode="numeric"></div>
       <div><span class="mini">Rec. (s)</span><input type="number" id="ex-w${s.id}" value="90" inputmode="numeric"></div>
     </div>
     <button class="btn small ghost" style="margin-top:10px" onclick="addExManual(${s.id})">Aggiungi</button>
     <button class="btn small" style="margin-top:10px;margin-left:8px;background:#EFE9DC;color:var(--maroon)" onclick="delScheda(${s.id})">Elimina scheda</button>
    </div></details>`).join('')||'<div class="card"><span class="note">Nessuna scheda: creane una qui sotto e aggiungi gli esercizi dalla libreria illustrata.</span></div>';
}
function addExManual(sid){
  const n=$('#ex-n'+sid).value.trim(); if(!n)return;
  DB.schede.find(s=>s.id===sid).esercizi.push({nome:n,
    sets:parseInt($('#ex-s'+sid).value)||3,reps:parseInt($('#ex-r'+sid).value)||10,rest:parseInt($('#ex-w'+sid).value)||90});
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
    const det=s.entries.map(e=>esc(e.esercizio)+' '+entrySets(e).map(x=>x.p+'×'+x.r).join(', ')).join(' · ');
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
  progChart=new Chart($('#chart-prog'),{type:'line',
    data:{labels:pts.map(p=>p.d),datasets:[{data:pts.map(p=>p.v)}]},options:lineOpts('kg')});
}

/* ---------------- LIBRERIA ESERCIZI (open source, 873 esercizi) ---------------- */
const EXDB_URL='https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const EXIMG='https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
let EXDB=null, exTargetScheda=null;
const IT2EN={panca:'bench press',stacco:'deadlift',trazioni:'pull up',rematore:'row',spinte:'press',
  croci:'fly',alzate:'raise','alzate laterali':'lateral raise',affondi:'lunge',polpacci:'calf',
  'lat machine':'pulldown',bicipiti:'curl',tricipiti:'triceps',spalle:'shoulder',addominali:'ab',
  gambe:'leg',petto:'chest',schiena:'back',glutei:'glute',militare:'military press',squat:'squat'};
async function loadEXDB(){
  if(EXDB)return EXDB;
  const r=await fetch(EXDB_URL); EXDB=await r.json(); return EXDB;
}
function openExSearch(schedaId){
  exTargetScheda=schedaId;
  openSheet(`<h3>Libreria esercizi</h3>
    <div class="note">873 esercizi con illustrazioni e istruzioni. Cerca in inglese o italiano (es. "panca", "squat", "curl").</div>
    <input type="text" id="ex-q" placeholder="Cerca…" oninput="searchEx()" style="margin-top:10px">
    <div id="ex-results" style="margin-top:8px"><div class="note">Caricamento libreria…</div></div>`);
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
      <img loading="lazy" src="${EXIMG+e.images[0]}" alt="">
      <div><div class="n">${esc(e.name)}</div><div class="m">${esc((e.primaryMuscles||[]).join(', '))} · ${esc(e.equipment||'')}</div></div>
    </div>`).join(''):'<div class="note">Nessun risultato: prova in inglese (es. "bench press").</div>';
}
function pickEx(id){
  const e=EXDB.find(x=>x.id===id); if(!e)return;
  openSheet(exDetailHTML(e)+`
    <div class="grid3" style="margin-top:14px">
      <div><span class="mini">Serie</span><input type="number" id="pk-s" value="4" inputmode="numeric"></div>
      <div><span class="mini">Reps</span><input type="number" id="pk-r" value="8" inputmode="numeric"></div>
      <div><span class="mini">Rec. (s)</span><input type="number" id="pk-w" value="90" inputmode="numeric"></div>
    </div>
    <button class="btn" onclick='confirmPickEx(${JSON.stringify(e.id)})'>Aggiungi alla scheda</button>
    <button class="btn ghost" onclick="openExSearch(exTargetScheda)">← Torna alla ricerca</button>`);
  startExAnim(e);
}
function confirmPickEx(id){
  const e=EXDB.find(x=>x.id===id);
  const sch=DB.schede.find(s=>s.id===exTargetScheda); if(!sch)return;
  sch.esercizi.push({nome:e.name,dbId:e.id,
    sets:parseInt($('#pk-s').value)||4,reps:parseInt($('#pk-r').value)||8,rest:parseInt($('#pk-w').value)||90});
  save(); closeSheet(); renderGym(); toast(e.name+' aggiunto ✓');
  document.querySelector(`details[data-id="${exTargetScheda}"]`)?.setAttribute('open','');
}
function exDetailHTML(e){
  const instr=(e.instructions||[]).slice(0,5).map(i=>'<li style="margin-bottom:6px">'+esc(i)+'</li>').join('');
  return `<h3>${esc(e.name)}</h3>
    <div class="note" style="text-transform:capitalize">${esc((e.primaryMuscles||[]).join(', '))} · ${esc(e.level||'')} · ${esc(e.equipment||'')}</div>
    <div class="exdetail"><img id="ex-anim" src="${EXIMG+e.images[0]}" alt="Esecuzione"></div>
    <a class="ytbtn" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent(e.name+' esecuzione tutorial')}"><span>▶</span> Guarda i video su YouTube</a>
    ${instr?'<label class="f" style="margin-top:14px">Esecuzione</label><ol style="padding-left:18px;font-size:.85rem;line-height:1.5;color:#44403C">'+instr+'</ol>':''}`;
}
let exAnimT=null;
function startExAnim(e){ // alterna le 2 immagini → mini animazione dell'esecuzione
  clearTimeout(exAnimT);
  if(!e.images||e.images.length<2)return;
  let i=0;
  (function loop(){
    const img=$('#ex-anim'); if(!img)return;
    i=1-i; img.src=EXIMG+e.images[i];
    exAnimT=setTimeout(loop,900);
  })();
}
async function openExDetailByName(name,dbId){
  try{
    await loadEXDB();
    const e=dbId?EXDB.find(x=>x.id===dbId):EXDB.find(x=>x.name.toLowerCase()===name.toLowerCase());
    if(e){openSheet(exDetailHTML(e));startExAnim(e);return;}
  }catch(_){}
  openSheet(`<h3>${esc(name)}</h3>
    <a class="ytbtn" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent(name+' esecuzione tutorial')}"><span>▶</span> Guarda i video su YouTube</a>`);
}

/* ================================================================
   CORPO
   ================================================================ */
Chart.defaults.font.family='Inter'; Chart.defaults.color='#857F74';
const lineOpts=unit=>({responsive:true,maintainAspectRatio:false,
  plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.parsed.y+(unit?' '+unit:'')}}},
  scales:{x:{grid:{display:false}},y:{grid:{color:'#EFEBE0'},ticks:{precision:1}}},
  elements:{line:{tension:.3,borderWidth:2.5,borderColor:'#8E241E'},
            point:{radius:4,backgroundColor:'#8E241E',borderColor:'#fff',borderWidth:2}}});
let bodyChart=null, metric='peso';
const METRICS={peso:'kg',smm:'kg',bf:'%',aec:''};
function setMetric(m,el){metric=m;$$('#metric-chips .chip').forEach(x=>x.classList.remove('on'));el.classList.add('on');renderBodyChart();}
function renderCorpo(){
  $('#sc-date').value=today();
  renderBodyChart(); renderScanList(); renderBFRange();
}
function renderBodyChart(){
  const sc=sortedScans();
  if(bodyChart)bodyChart.destroy();
  bodyChart=new Chart($('#chart-body'),{type:'line',
    data:{labels:sc.map(s=>fmtD(s.date)),datasets:[{data:sc.map(s=>s[metric])}]},options:lineOpts(METRICS[metric])});
}
function renderBFRange(){
  const sc=sortedScans(),last=sc[sc.length-1];
  if(!last||last.bf==null){$('#bf-range-card').innerHTML='';return;}
  const min=5,max=30,pos=Math.min(97,Math.max(3,(last.bf-min)/(max-min)*100));
  $('#bf-range-card').innerHTML=`<div class="lbl" style="font-family:'Barlow Condensed';font-weight:600;text-transform:uppercase;letter-spacing:.06em;font-size:.78rem;color:var(--muted)">% Grasso — range normale 10–20%</div>
    <div class="val" style="font-size:1.5rem;font-weight:700">${last.bf}<small style="font-size:.8rem;color:var(--muted)"> %</small></div>
    <div class="rangebar"><div class="track"><div class="dot" style="left:${pos}%"></div></div>
    <div class="ends"><span>5</span><span>10</span><span>20</span><span>30</span></div></div>`;
}
function addScan(){
  const d=$('#sc-date').value,p=parseFloat($('#sc-peso').value);
  if(!d||!p){toast('Servono almeno data e peso');return;}
  DB.scans.push({id:uid(),date:d,peso:p,
    smm:parseFloat($('#sc-smm').value)||null, bf:parseFloat($('#sc-bf').value)||null,
    aec:parseFloat($('#sc-aec').value)||null, score:parseInt($('#sc-score').value)||null,
    visc:parseInt($('#sc-visc').value)||null, note:$('#sc-note').value.trim()});
  ['#sc-peso','#sc-smm','#sc-bf','#sc-aec','#sc-score','#sc-visc','#sc-note'].forEach(s=>$(s).value='');
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
    <div class="s">Muscolo ${s.smm??'–'} kg · Grasso ${s.bf??'–'}% · AEC ${s.aec??'–'}${s.score?' · Punteggio '+s.score:''}${s.visc?' · Viscerale '+s.visc:''}${s.note?'<br>'+esc(s.note):''}</div></div>
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
  openSheet(`<h3>Assistente AI ✦</h3>
    <div class="note">Interroga Gemini sui tuoi dati. Non sostituisce PT e nutrizionista. ${DB.settings.gemKey?'':'<b>Configura prima la API key in Admin → Gemini.</b>'}</div>
    <div class="chat" id="chat"></div>
    <div class="askrow"><input type="text" id="ai-q" placeholder="es. Come va la ricomposizione?" onkeydown="if(event.key==='Enter')askAI()">
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
  let c='Sono Matteo, 25 anni, 179 cm, alleno dal 14/08/2025 con PT e nutrizionista. Target InBody: 70.5 kg (+3.9 kg muscolo, −1.0 kg grasso).\n\nSCANSIONI INBODY:\n';
  sc.forEach(s=>c+=`- ${s.date}: ${s.peso}kg, muscolo ${s.smm??'-'}kg, grasso ${s.bf??'-'}%, AEC ${s.aec??'-'}\n`);
  c+='\nDIETA DI OGGI (giorno '+dd+'):\n';
  mealsOfDay(dd).forEach(m=>c+=`- ${m.nome} ${m.ora}: ${itemsTxt(m.items)} (${m.kcal} kcal)\n`);
  const dl=DB.diary[today()]||{};
  const done=Object.entries(dl).map(([k,v])=>MEAL_NAMES[k]+': '+(v.st==='ok'?'seguito':v.st==='other'?('altro — '+(v.note||'')+' '+(v.kcal||0)+'kcal'):'saltato')).join('; ');
  if(done)c+='Registrato oggi: '+done+'\n';
  if(DB.sessions.length){
    c+='\nULTIMI ALLENAMENTI:\n';
    [...DB.sessions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6).forEach(s=>
      c+=`- ${s.date}: `+s.entries.map(e=>`${e.esercizio} ${e.peso}kg×${e.reps}`).join(', ')+'\n');
  }
  c+='\nRispondi in italiano, conciso. Non sostituire PT/nutrizionista.';
  return c;
}
async function askAI(){
  const q=$('#ai-q').value.trim(); if(!q)return;
  if(!DB.settings.gemKey){toast('Configura la API key in Admin');return;}
  $('#ai-q').value='';
  DB.chat.push({r:'me',t:q}); renderChat();
  const c=$('#chat'); const th=document.createElement('div'); th.className='msg ai'; th.textContent='…'; c.appendChild(th);
  const contents=[];
  if(DB.settings.gemCtx)contents.push({role:'user',parts:[{text:buildContext()}]},{role:'model',parts:[{text:'Ok, ho i tuoi dati. Chiedimi pure.'}]});
  DB.chat.slice(-12).forEach(m=>contents.push({role:m.r==='me'?'user':'model',parts:[{text:m.t}]}));
  try{
    const res=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(DB.settings.gemModel)+':generateContent?key='+encodeURIComponent(DB.settings.gemKey),{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents})});
    const d=await res.json(); th.remove();
    if(d.error)throw new Error(d.error.message||'Errore API');
    const t=(d.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join('').trim()||'(risposta vuota)';
    DB.chat.push({r:'ai',t});
  }catch(e){
    th.remove();
    DB.chat.push({r:'err',t:'Errore: '+e.message+'\nControlla API key e nome modello in Admin.'});
  }
  save(); renderChat();
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
