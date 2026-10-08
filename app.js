/* ---------- Língua ---------- */
let lang,L,AXES,AX,Q,ARCH,BANDS,LEVELS;
const tr=n=>typeof n==="string"?n:n[lang];
const sectorName=k=>L.sectors[SECTOR_KEYS.indexOf(k)];
function setLang(l){
  lang=LANGS.includes(l)?l:"pt";L=STR[lang];
  AXES=AXIS_KEYS.map(k=>({k,...L.axes[k]}));
  AX=Object.fromEntries(AXES.map(a=>[a.k,a]));
  Q=Q_META.map((m,i)=>({...m,q:L.questions[i].q,o:m.id==="setor"?L.sectors:L.questions[i].o}));
  ARCH=L.arch;BANDS=L.bands;LEVELS=LEVEL_CUTS.map((c,i)=>[c,L.levels[i]]);
  document.documentElement.lang=L.htmlLang;document.title=L.title;
  const md=document.querySelector('meta[name="description"]');if(md)md.content=L.metaDesc;
  document.querySelectorAll(".lang button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.l===lang));
  const g=document.querySelector(".lang");if(g)g.setAttribute("aria-label",L.ui.langLabel);
  try{localStorage.setItem("lang",lang);}catch(_){}
}
function initialLang(){
  const p=new URLSearchParams(location.search).get("lang");if(LANGS.includes(p))return p;
  try{const s=localStorage.getItem("lang");if(LANGS.includes(s))return s;}catch(_){}
  return /^pt\b/i.test(navigator.language||"pt")?"pt":"en";
}
setLang(initialLang());

const state={step:-1,answers:Array(Q.length).fill(null),empresa:"",result:null,unlocked:false,lead:null,mail:null,pdfBlob:null,pages:null};
const app=document.getElementById("app");
document.querySelectorAll(".lang button").forEach(b=>b.onclick=()=>{
  if(b.dataset.l===lang)return;
  setLang(b.dataset.l);
  if(state.result){state.result=compute();state.pdfBlob=null;state.pages=null;}
  render();
});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* ---------- Scoring ---------- */
function sim(a,b){let s=0;for(let i=0;i<8;i++)s+=(a[i]-b[i])**2;return Math.max(0,Math.round(100-Math.sqrt(s/8)));}
function compute(){
  const acc={};AXES.forEach(a=>acc[a.k]=[]);
  Q.forEach((q,i)=>{if(q.ax&&state.answers[i]!=null)acc[q.ax].push(PTS[state.answers[i]]);});
  const ax={};AXES.forEach(a=>{const v=acc[a.k];ax[a.k]=v.length?Math.round(v.reduce((x,y)=>x+y,0)/v.length):0;});
  const vec=AXES.map(a=>ax[a.k]);
  const total=Math.round(vec.reduce((x,y)=>x+y,0)/8);
  const A=(ax.est+ax.pes+ax.inv)/3,E=(ax.dad+ax.tec+ax.pro+ax.gov)/4;
  let arch;
  if(total>=85)arch="native";
  else if(ax.ado>=60&&ax.gov<=35)arch="rebelde";
  else if(total<30)arch="observador";
  else if(A-E>=15&&E<50)arch="visionario";
  else if(E-A>=15&&A<50)arch="engenheiro";
  else if(total>=60)arch="construtor";
  else arch="explorador";
  const level=LEVELS.find(l=>total<l[0])[1];
  const comps=COMPANIES.map(([n,v],i)=>({i,n:tr(n),s:sim(vec,v)})).sort((a,b)=>b.s-a.s);
  const secs=SECTOR_PROFILES.map(([k,v])=>({n:sectorName(k),v,s:sim(vec,v)})).sort((a,b)=>b.s-a.s);
  const sorted=[...AXES].sort((a,b)=>ax[b.k]-ax[a.k]);
  const prof=k=>{const i=Q.findIndex(q=>q.id===k);return state.answers[i]!=null?Q[i].o[state.answers[i]]:"";};
  const si=state.answers[Q.findIndex(q=>q.id==="setor")];
  const sectorKey=si!=null?SECTOR_KEYS[si]:null;
  const own=SECTOR_PROFILES.find(s=>s[0]===sectorKey);
  const ownSector=own?[sectorName(own[0]),own[1]]:null;
  const levelIdx=LEVEL_CUTS.findIndex(c=>total<c);
  return {ax,vec,total,arch,level,levelIdx,comps,secs,sorted,strong:sorted[0],weak:sorted[7],setor:prof("setor"),sectorKey,dim:prof("dim"),funcao:prof("funcao"),ownSector};
}

/* ---------- Progresso guardado ---------- */
// As respostas ficam neste browser para a pessoa poder retomar se sair da página. Expiram ao fim de 30 dias.
const SAVE_KEY="ai-mirror:progress",SAVE_DAYS=30;
function saveProgress(){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify({v:1,t:Date.now(),answers:state.answers,empresa:state.empresa,unlocked:state.unlocked,lead:state.lead}));}catch(_){}
}
function clearProgress(){try{localStorage.removeItem(SAVE_KEY);}catch(_){}}
function loadProgress(){
  try{
    const s=JSON.parse(localStorage.getItem(SAVE_KEY));
    if(!s||s.v!==1||Date.now()-s.t>SAVE_DAYS*864e5||!Array.isArray(s.answers)||s.answers.length!==Q.length)return null;
    if(!s.answers.every((a,i)=>a==null||(Number.isInteger(a)&&a>=0&&a<Q[i].o.length)))return null;
    const n=s.answers.filter(a=>a!=null).length;
    return n?{...s,n,done:n===Q.length}:null;
  }catch(_){return null;}
}
let pending=loadProgress();
function resumeProgress(){
  const s=pending;pending=null;
  state.answers=s.answers.slice();state.empresa=typeof s.empresa==="string"?s.empresa:"";
  state.unlocked=!!(s.done&&s.unlocked&&s.lead);state.lead=state.unlocked?s.lead:null;state.mail=null;state.result=null;
  const next=state.answers.findIndex(a=>a==null);
  state.step=next<0?Q.length:next;
  render();
}
function resumeHTML(s){
  return `<section class="panel resume" aria-labelledby="resumeh">
    <div class="rtext">
      <div class="eyebrow" style="color:var(--lilac)">${s.done?L.ui.resumeKickerDone:L.ui.resumeKicker}${s.empresa?` · ${esc(s.empresa)}`:""}</div>
      <h2 id="resumeh">${s.done?L.ui.resumeTitleDone:L.ui.resumeTitle}</h2>
      <p>${s.done?L.ui.resumeBodyDone:L.ui.resumeBody(s.n,Q.length)}</p>
      <span class="bar"><i style="width:${Math.round(s.n/Q.length*100)}%"></i></span>
    </div>
    <div class="ractions">
      <button class="btn" id="resume">${s.done?L.ui.resumeSeeResult:L.ui.resumeContinue}</button>
      <button class="btn ghost" id="restart">${L.ui.resumeRestart}</button>
    </div>
  </section>`;
}

/* ---------- Intro ---------- */
function renderIntro(){
  const demo=[72,48,35,40,55,62,20,30];
  app.innerHTML=`${pending?resumeHTML(pending):""}
  <section class="intro${pending?" has-resume":""}">
    <div>
      <div class="eyebrow">${L.ui.eyebrow}</div>
      <h1>${L.ui.h1}</h1>
      <p class="lead">${L.ui.lead}</p>
      <div class="start">
        <div><label class="lbl" for="empresa">${L.ui.companyLabel}</label>
        <input type="text" id="empresa" maxlength="40" placeholder="${esc(L.ui.companyPh)}" value="${esc(state.empresa)}"></div>
        <div><button class="btn" id="go">${L.ui.start}</button></div>
        <div class="meta">${L.ui.meta.map(m=>`<span>${m}</span>`).join("")}</div>
      </div>
    </div>
    <aside class="axes-preview" aria-label="${esc(L.ui.axesPreviewAria)}">
      <div class="eyebrow" style="color:var(--fg-3);margin-bottom:6px">${L.ui.axesPreview}</div>
      ${AXES.map((a,i)=>`<div class="row"><span class="nm">${a.name}<small>${a.desc}</small></span>
        <span class="bar"><i style="width:${demo[i]}%"></i></span></div>`).join("")}
    </aside>
  </section>`;
  const inp=document.getElementById("empresa");
  inp.oninput=()=>{state.empresa=inp.value;};
  document.getElementById("go").onclick=()=>{pending=null;state.empresa=inp.value.trim();state.step=0;render();};
  if(pending){
    document.getElementById("resume").onclick=resumeProgress;
    document.getElementById("restart").onclick=()=>{pending=null;clearProgress();renderIntro();document.getElementById("empresa").focus();};
  }
  inp.addEventListener("keydown",e=>{if(e.key==="Enter")document.getElementById("go").click();});
}

/* ---------- Questions ---------- */
function renderQuestion(){
  const i=state.step,q=Q[i],sel=state.answers[i];
  const tag=q.profile?[L.ui.tagProfile,"var(--fg-3)"]:q.bonus?[L.ui.tagBonus,"var(--lilac)"]:[AX[q.ax].name,"var(--peri)"];
  app.innerHTML=`
  <section class="quiz">
    <div class="progress"><span>${String(i+1).padStart(2,"0")} / ${Q.length}</span><span class="track"><i style="width:${(i/Q.length)*100}%"></i></span></div>
    <div class="qtag eyebrow" style="color:${tag[1]}">${tag[0]}</div>
    <h2>${esc(q.q)}</h2>
    <div class="opts ${q.grid?"grid":""}" role="radiogroup" aria-label="${esc(q.q)}">
      ${q.o.map((o,j)=>`<button class="opt ${sel===j?"sel":""}" role="radio" aria-checked="${sel===j}" data-j="${j}"><span class="k">${q.grid?"·":j+1}</span><span>${esc(o)}</span></button>`).join("")}
    </div>
    <div class="qnav">
      <button class="btn ghost" id="back">← ${i===0?L.ui.home:L.ui.back}</button>
      <span class="hint">${q.grid?"":L.ui.keyHint}</span>
    </div>
  </section>`;
  app.querySelectorAll(".opt").forEach(b=>b.onclick=()=>choose(+b.dataset.j));
  document.getElementById("back").onclick=back;
  const f=app.querySelector(".opt.sel")||app.querySelector(".opt");f&&f.focus({preventScroll:true});
}
let advancing=false;
function choose(j){
  if(advancing)return;advancing=true;
  state.answers[state.step]=j;state.result=null;
  app.querySelectorAll(".opt").forEach(b=>{const on=+b.dataset.j===j;b.classList.toggle("sel",on);b.setAttribute("aria-checked",on);});
  setTimeout(()=>{advancing=false;state.step++;render();},220);
}
function back(){state.step--;render();}
document.addEventListener("keydown",e=>{
  if(state.step<0||state.step>=Q.length||e.target.tagName==="INPUT")return;
  if(!Q[state.step].grid&&/^[1-4]$/.test(e.key))choose(+e.key-1);
  else if(e.key==="ArrowLeft")back();
});

/* ---------- Result ---------- */
function radarSVG(r){
  const cx=200,cy=190,R=135,pt=(i,f)=>{const a=-Math.PI/2+i*Math.PI/4;return[cx+Math.cos(a)*R*f,cy+Math.sin(a)*R*f];};
  const ring=f=>AXES.map((_,i)=>pt(i,f).join(",")).join(" ");
  const poly=AXES.map((a,i)=>pt(i,Math.max(.04,r.ax[a.k]/100)).join(",")).join(" ");
  const labels=AXES.map((a,i)=>{const[x,y]=pt(i,1.22);const c=Math.cos(-Math.PI/2+i*Math.PI/4);const an=Math.abs(c)<.2?"middle":c>0?"start":"end";
    return `<text x="${x.toFixed(1)}" y="${(y+6).toFixed(1)}" text-anchor="${an}" fill="#8A91A2" font-size="15" font-weight="600" letter-spacing="2" font-family="Inter,Arial,sans-serif">${a.name.slice(0,3).toUpperCase()}</text>`;}).join("");
  return `<svg class="c-radar" viewBox="0 0 400 380" role="img" aria-label="${esc(L.ui.radarAria)}">
    <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#96B3FF" stop-opacity=".6"/><stop offset="1" stop-color="#D5BBFF" stop-opacity=".45"/></linearGradient></defs>
    ${[.25,.5,.75,1].map(f=>`<polygon points="${ring(f)}" fill="none" stroke="#FFFFFF" stroke-opacity=".09" stroke-width="1.2"/>`).join("")}
    ${AXES.map((_,i)=>{const[x,y]=pt(i,1);return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#FFFFFF" stroke-opacity=".06"/>`;}).join("")}
    <polygon points="${poly}" fill="url(#rg)" stroke="#96B3FF" stroke-width="2.5" stroke-linejoin="round"/>
    ${AXES.map((a,i)=>{const[x,y]=pt(i,Math.max(.04,r.ax[a.k]/100));return `<circle cx="${x}" cy="${y}" r="4.5" fill="#FFFFFF"/>`;}).join("")}
    ${labels}</svg>`;
}
function cardHTML(r){
  const a=ARCH[r.arch];
  const meta=[state.empresa,r.sectorKey&&r.sectorKey!=="other"?r.setor:"",r.dim?r.dim+" "+L.ui.people:""].filter(Boolean).map(esc).join("  ·  ");
  return `<div class="card" id="card"><div class="cin">
    <div class="c-head"><img src="${LOGO}" alt="LayerX"><span class="r"></span><span class="t">${L.ui.cardHead}</span></div>
    <div>
      <div class="c-kick">${esc(r.level)}</div>
      <div class="c-name">${esc(a.name)}</div>
      <div class="c-tag">${esc(a.tag)}</div>
      ${meta?`<div class="c-meta">${meta}</div>`:""}
    </div>
    <div class="c-grid">
      <div class="c-panel">
        ${radarSVG(r)}
        <div class="c-score"><span class="gtext" style="font-size:1em">${r.total}</span><span class="gtext">%</span></div>
        <div class="c-lbl" style="margin-top:1.2em">${L.ui.scoreLbl}</div>
        <div class="c-sep"></div>
        <div class="c-lbl m">${L.ui.closest}</div>
        <div class="c-big">${esc(r.comps[0].n)}</div>
        <div class="c-sub">${r.comps[0].s}% ${L.ui.compatible}</div>
      </div>
      <div class="c-panel">
        <div class="c-lbl">${L.ui.yourAxes}</div>
        <div class="c-axes">${AXES.map(x=>`<div class="c-ax"><div class="top"><span>${x.name}</span><b>${r.ax[x.k]}%</b></div><div class="tr"><i style="width:${Math.max(2,r.ax[x.k])}%"></i></div></div>`).join("")}</div>
      </div>
    </div>
    <div class="c-grid">
      <div class="c-panel"><div class="c-lbl">${L.ui.otherCompanies}</div>
        <div class="c-list">${r.comps.slice(1,4).map(c=>`<div class="it"><span>${esc(c.n)}</span><b>${c.s}%</b></div>`).join("")}</div></div>
      <div class="c-panel"><div class="c-lbl">${L.ui.nearSectors}</div>
        <div class="c-list">${r.secs.slice(0,3).map(c=>`<div class="it"><span>${esc(c.n)}</span><b>${c.s}%</b></div>`).join("")}</div></div>
    </div>
    <div class="c-strip">
      <div class="c-panel"><div class="h" style="color:#96B3FF">${L.ui.superpower}</div><div class="v">${esc(r.strong.strong)}</div><div class="s">${r.strong.name} · ${r.ax[r.strong.k]}%</div></div>
      <div class="c-panel"><div class="h" style="color:#D5BBFF">${L.ui.achilles}</div><div class="v">${esc(r.weak.weak)}</div><div class="s">${r.weak.name} · ${r.ax[r.weak.k]}%</div></div>
    </div>
    <div class="c-foot"><span>${L.ui.cardFootL}</span><span>LayerX · AI Mirror</span></div>
  </div></div>`;
}

async function renderResult(){
  app.innerHTML=`<section class="computing"><div><div class="spin"></div><p>${L.ui.computing}</p></div></section>`;
  state.result=compute();state.pdfBlob=null;state.pages=null;
  await new Promise(r=>setTimeout(r,900));
  showResult();
}
function showResult(){
  const r=state.result,a=ARCH[r.arch];
  app.innerHTML=`
  <section class="result">
    <div class="cardcol">${cardHTML(r)}<div class="note">${L.ui.shareNote}</div></div>
    <div class="rail">
      <div>
        <div class="eyebrow" style="color:var(--lilac)">${esc(r.level)}</div>
        <h2>${esc(a.name)}</h2>
        <p class="tagline">${esc(a.tag)}</p>
      </div>
      <div class="panel report" id="report"></div>
      <div class="panel"><div class="cta">
        <p>${L.ui.ctaText}</p>
        <a class="btn ghost" href="${CAL_URL}" target="_blank" rel="noopener">${L.ui.ctaBtn}</a></div></div>
      <div><button class="btn ghost" id="redo">${L.ui.redo}</button></div>
      <div class="panel contact" id="contact"></div>
    </div>
  </section>`;
  document.getElementById("redo").onclick=()=>{state.step=-1;state.answers.fill(null);state.result=null;state.unlocked=false;state.lead=null;state.mail=null;clearProgress();render();};
  renderReportPanel();
  renderContact();
  window.scrollTo({top:0});
}

const LOCK=`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#96B3FF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;
const CHECK=`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#96B3FF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>`;
function renderReportPanel(){
  const g=document.getElementById("report"),r=state.result;
  const toc=L.ui.toc.map(t=>t||[r.ownSector?L.ui.tocSector(r.ownSector[0]):L.ui.tocBench,L.ui.tocBenchSub]);
  const ico=state.unlocked?CHECK:LOCK;
  const list=`<ul class="toc">${toc.map(t=>`<li><span class="lk">${ico}</span><div>${esc(t[0])}<span>${esc(t[1])}</span></div></li>`).join("")}</ul>`;
  if(state.unlocked){
    g.innerHTML=`<h3>${L.ui.reportReady}</h3><p>${L.ui.reportReadyP(esc(state.empresa||L.ui.yourCompany))}</p>${list}
      <div style="margin-top:18px"><button class="btn" id="dlpdf">${L.ui.download}</button></div>
      <div class="toast" id="toast" role="status"></div>
      ${state.mail?`<div class="toast mailst" role="status">${L.ui["mail_"+state.mail](esc(state.lead.email))}</div>`:""}
      <div class="pages" id="pages"></div>`;
    document.getElementById("dlpdf").onclick=downloadPDF;
    return;
  }
  g.innerHTML=`<h3>${L.ui.reportTitle}</h3>
    <p>${L.ui.reportP}</p>
    ${list}
    <div class="teaser" aria-hidden="true"><div class="tl">${L.ui.teaser}</div>
      <div class="ghostline" style="width:92%"></div><div class="ghostline" style="width:78%"></div><div class="ghostline" style="width:64%"></div>
      <div class="lock"><span style="display:inline-flex;align-items:center;gap:8px">${LOCK} ${L.ui.unlock}</span></div></div>
    <form class="lead" id="leadf" novalidate>
      <div class="two">
        <div><label class="lbl" for="lnome">${L.ui.name}</label><input type="text" id="lnome" autocomplete="name" placeholder="${esc(L.ui.namePh)}"></div>
        <div><label class="lbl" for="lemail">${L.ui.workEmail}</label><input type="email" id="lemail" autocomplete="email" placeholder="${esc(L.ui.emailPh)}" required></div>
      </div>
      <label class="check"><input type="checkbox" id="lmkt"> ${L.ui.optin}</label>
      <div class="err" id="lerr" role="alert"></div>
      <div><button class="btn" type="submit" id="lsub">${L.ui.getReport}</button></div>
      <div class="fine">${L.ui.fine}</div>
    </form>`;
  document.getElementById("leadf").addEventListener("submit",async e=>{
    e.preventDefault();
    const email=document.getElementById("lemail").value.trim(),err=document.getElementById("lerr");
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){err.textContent=L.ui.badEmail;return;}
    err.textContent="";
    const b=document.getElementById("lsub");b.disabled=true;b.textContent=L.ui.preparing;
    const nome=document.getElementById("lnome").value.trim();
    await saveLead({email,nome,marketing:document.getElementById("lmkt").checked});
    state.lead={email,nome};state.unlocked=true;state.mail="sending";saveProgress();renderReportPanel();renderContact();
    emailReport();
  });
}

/* ---------- Relatório por email ---------- */
// Gera o PDF no browser e envia-o para api/report.js, que o manda por email como anexo.
async function emailReport(){
  const setMail=m=>{state.mail=m;if(state.unlocked&&document.getElementById("report"))renderReportPanel();};
  try{
    const blob=await ensurePDF();
    const pdf=await new Promise((ok,ko)=>{const fr=new FileReader();fr.onload=()=>ok(String(fr.result).split(",")[1]);fr.onerror=ko;fr.readAsDataURL(blob);});
    const r=state.result;
    const res=await fetch(REPORT_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      email:state.lead.email,nome:state.lead.nome,lingua:lang,empresa:state.empresa,arquetipo:ARCH[r.arch].name,score:r.total,
      filename:L.ui.fileName(slug(state.empresa)),pdf})});
    if(!res.ok)throw new Error("HTTP "+res.status);
    setMail("sent");
  }catch(e){console.warn("report not emailed",e);setMail("failed");}
}

/* ---------- Contacto ---------- */
function renderContact(){
  const g=document.getElementById("contact");if(!g)return;
  const ld=state.lead||{};
  g.innerHTML=`<h3>${L.ui.contactTitle}</h3><p>${L.ui.contactP}</p>
    <form class="lead" id="contactf" novalidate>
      <div class="two">
        <div><label class="lbl" for="cnome">${L.ui.name}</label><input type="text" id="cnome" autocomplete="name" maxlength="100" placeholder="${esc(L.ui.namePh)}" value="${esc(ld.nome||"")}"></div>
        <div><label class="lbl" for="cemail">${L.ui.workEmail}</label><input type="email" id="cemail" autocomplete="email" maxlength="200" placeholder="${esc(L.ui.emailPh)}" value="${esc(ld.email||"")}" required></div>
      </div>
      <div><label class="lbl" for="cmsg">${L.ui.message}</label><textarea id="cmsg" rows="4" maxlength="4000" placeholder="${esc(L.ui.messagePh)}" required></textarea></div>
      <div class="hp" aria-hidden="true"><label>Website<input type="text" id="cweb" tabindex="-1" autocomplete="off"></label></div>
      <div class="err" id="cerr" role="alert"></div>
      <div><button class="btn ghost" type="submit" id="csub">${L.ui.send}</button></div>
    </form>`;
  document.getElementById("contactf").addEventListener("submit",async e=>{
    e.preventDefault();
    const email=document.getElementById("cemail").value.trim(),mensagem=document.getElementById("cmsg").value.trim(),err=document.getElementById("cerr");
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){err.textContent=L.ui.badEmail;return;}
    if(!mensagem){err.textContent=L.ui.emptyMsg;return;}
    err.textContent="";
    const b=document.getElementById("csub");b.disabled=true;b.textContent=L.ui.sending;
    const r=state.result;
    const body={nome:document.getElementById("cnome").value.trim(),email,mensagem,website:document.getElementById("cweb").value,lingua:lang,
      contexto:r?{empresa:state.empresa,setor:r.setor,score:r.total,arquetipo:ARCH[r.arch].name,nivel:r.level}:null};
    try{
      const res=await fetch(CONTACT_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      if(!res.ok)throw new Error("HTTP "+res.status);
      g.innerHTML=`<h3>${L.ui.contactTitle}</h3><p role="status">${L.ui.sent(esc(email))}</p>`;
    }catch(_){
      err.textContent=L.ui.sendFail(CONTACT_EMAIL);b.disabled=false;b.textContent=L.ui.send;
    }
  });
}

/* ---------- Leads (db capability) ---------- */
async function saveLead(lead){
  const r=state.result;
  // Valores sempre em PT, para os leads serem comparáveis independentemente da língua escolhida.
  const pt=STR.pt,ans=id=>{const i=Q_META.findIndex(q=>q.id===id),j=state.answers[i];return j==null?"":(id==="setor"?pt.sectors:pt.questions[i].o)[j];};
  const comp=COMPANIES[r.comps[0].i][0];
  const row={...lead,empresa:state.empresa,setor:ans("setor"),dimensao:ans("dim"),funcao:ans("funcao"),score:r.total,arquetipo:pt.arch[r.arch].name,
    nivel:pt.levels[r.levelIdx],eixos:r.ax,empresaParecida:typeof comp==="string"?comp:comp.pt,respostas:state.answers,lingua:lang,criadoEm:new Date().toISOString()};
  if(LEAD_ENDPOINT){
    try{await fetch(LEAD_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(row)});}
    catch(e){console.warn("lead not sent",e);}
  }
  // Dentro de um artifact do claude.ai, guarda também na base de dados do artifact.
  try{
    const c=window.claude;if(!c||!c.use)return;
    const [db,user]=await Promise.all([c.use("db"),c.use("user")]);
    if(!db||!user)return;
    const id=await user.id();if(!id)return;
    await db.doc("leads/"+id).set(row);
  }catch(e){console.warn("lead not stored",e);}
}

/* ---------- PDF ---------- */
function slug(s){return (s||L.ui.slugFallback).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||L.ui.slugFallback;}
// Uma só geração por resultado: o envio por email e o botão de download partilham o mesmo PDF.
let pdfJob=null;
function ensurePDF(){
  if(state.pdfBlob)return Promise.resolve(state.pdfBlob);
  const result=state.result;
  if(pdfJob&&pdfJob.result===result)return pdfJob.p;
  const p=(async()=>{
    await Promise.all(["700 60px Inter","600 30px Inter","500 30px Inter","400 30px Inter","500 20px 'JetBrains Mono'"].map(f=>document.fonts.load(f))).catch(()=>{});
    const pages=(await drawReport(result)).map(p=>p.toDataURL("image/jpeg",0.9));
    const {jsPDF}=window.jspdf;
    const pdf=new jsPDF({unit:"pt",format:[1240,1754],compress:true});
    pages.forEach((u,i)=>{if(i)pdf.addPage([1240,1754],"portrait");pdf.addImage(u,"JPEG",0,0,1240,1754);});
    const blob=pdf.output("blob");
    if(state.result===result){state.pages=pages;state.pdfBlob=blob;}
    return blob;
  })();
  pdfJob={result,p};p.catch(()=>{if(pdfJob&&pdfJob.p===p)pdfJob=null;});
  return p;
}
async function downloadPDF(){
  const t=document.getElementById("toast"),b=document.getElementById("dlpdf");
  t.textContent=L.ui.generating;b.disabled=true;
  try{await ensurePDF();}catch(e){t.textContent=L.ui.genFail;b.disabled=false;return;}
  b.disabled=false;
  const filename=L.ui.fileName(slug(state.empresa));
  // Fora do claude.ai: download normal do browser.
  if(!window.claude||!window.claude.use){
    const a=document.createElement("a");a.href=URL.createObjectURL(state.pdfBlob);a.download=filename;
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
    t.textContent=L.ui.downloaded;return;
  }
  let dl=null;try{dl=await window.claude.use("downloads");}catch(_){}
  if(!dl){t.textContent=L.ui.noDownloads;showPages();return;}
  try{
    const res=await dl.save({filename,data:state.pdfBlob});
    t.textContent=res.status==="saved"?L.ui.saved:"";
  }catch(e){
    const c=e&&e.code;
    if(c==="declined")t.textContent=L.ui.dlCancelled;
    else if(c==="rate_limited")t.textContent=L.ui.dlBusy;
    else{t.textContent=L.ui.dlFail;showPages();}
  }
}
function showPages(){const p=document.getElementById("pages");if(p&&state.pages)p.innerHTML=state.pages.map((u,i)=>`<img src="${u}" alt="${esc(L.ui.pageAlt(i+1))}">`).join("");}

/* Canvas helpers */
const C={bg:"#060912",panel:"rgba(10,14,28,0.82)",line:"rgba(255,255,255,0.10)",chip:"rgba(255,255,255,0.10)",fg:"#FFFFFF",fg2:"#B4BAC8",fg3:"#7A8193",peri:"#96B3FF",lilac:"#D5BBFF"};
const F=(w,s,m)=>`${w} ${s}px ${m?"'JetBrains Mono', monospace":"Inter, 'Helvetica Neue', Arial, sans-serif"}`;
function rr(x,y,w,h,r,c){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function T(c,s,x,y,font,color,align="left",ls=0){c.font=font;c.fillStyle=color;c.textAlign=align;if("letterSpacing"in c)c.letterSpacing=ls+"px";c.fillText(s,x,y);if("letterSpacing"in c)c.letterSpacing="0px";}
function wrap(c,s,max,font){c.font=font;const out=[];let cur="";for(const w of s.split(" ")){const t=cur?cur+" "+w:w;if(c.measureText(t).width>max&&cur){out.push(cur);cur=w;}else cur=t;}if(cur)out.push(cur);return out;}
function para(c,s,x,y,max,font,color,lh){const L=wrap(c,s,max,font);L.forEach((l,i)=>T(c,l,x,y+i*lh,font,color));return y+L.length*lh;}
function grad(c,x,w){const g=c.createLinearGradient(x,0,x+w,0);g.addColorStop(0,"#96B3FF");g.addColorStop(1,"#D5BBFF");return g;}
function bar(c,x,y,w,v,h=10,col){rr(x,y,w,h,h/2,c);c.fillStyle=C.chip;c.fill();if(v>0){rr(x,y,Math.max(h,w*v/100),h,h/2,c);c.fillStyle=col||grad(c,x,w);c.fill();}}
function panelC(c,x,y,w,h){rr(x,y,w,h,24,c);c.fillStyle=C.panel;c.fill();c.strokeStyle=C.line;c.lineWidth=2;c.stroke();}
function loadImg(src){return new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src;});}
function cover(c,img,W,H,dark){if(img){const s=Math.max(W/img.width,H/img.height),w=img.width*s,h=img.height*s;c.drawImage(img,W-w,0,w,h);}else{c.fillStyle=C.bg;c.fillRect(0,0,W,H);}
  const g=c.createLinearGradient(0,0,W,0);g.addColorStop(0,`rgba(6,9,18,${dark})`);g.addColorStop(1,`rgba(6,9,18,${Math.max(0,dark-.45)})`);c.fillStyle=g;c.fillRect(0,0,W,H);}
function radarC(c,r,cx,cy,R){
  c.lineWidth=1.5;
  [.25,.5,.75,1].forEach(f=>{c.beginPath();AXES.forEach((_,i)=>{const a=-Math.PI/2+i*Math.PI/4;const x=cx+Math.cos(a)*R*f,y=cy+Math.sin(a)*R*f;i?c.lineTo(x,y):c.moveTo(x,y);});c.closePath();c.strokeStyle="rgba(255,255,255,0.10)";c.stroke();});
  c.beginPath();AXES.forEach((ax,i)=>{const a=-Math.PI/2+i*Math.PI/4,f=Math.max(.04,r.ax[ax.k]/100);const x=cx+Math.cos(a)*R*f,y=cy+Math.sin(a)*R*f;i?c.lineTo(x,y):c.moveTo(x,y);});c.closePath();
  const g=c.createLinearGradient(cx-R,cy-R,cx+R,cy+R);g.addColorStop(0,"rgba(150,179,255,0.6)");g.addColorStop(1,"rgba(213,187,255,0.45)");c.fillStyle=g;c.fill();c.strokeStyle=C.peri;c.lineWidth=3;c.stroke();
  AXES.forEach((ax,i)=>{const a=-Math.PI/2+i*Math.PI/4;const cs=Math.cos(a);const lx=cx+cs*(R+26),ly=cy+Math.sin(a)*(R+26)+7;
    T(c,ax.name,lx,ly,F(600,17),C.fg3,Math.abs(cs)<.2?"center":cs>0?"left":"right");});
}
function pageFrame(c,W,H,P,logo,n,label){
  if(logo){const lh=34;c.drawImage(logo,P,70,lh*logo.width/logo.height,lh);}
  T(c,label,W-P,96,F(600,17),C.fg2,"right",4);
  c.fillStyle="rgba(255,255,255,0.14)";c.fillRect(P,H-104,W-P*2,2);
  T(c,L.ui.pdfFoot,P,H-62,F(500,18),C.fg3);
  T(c,`${n} / 3`,W-P,H-62,F(500,18,1),C.fg3,"right");
}

async function drawReport(r){
  const W=1240,H=1754,P=88,a=ARCH[r.arch];
  const [logo,prism,matte]=await Promise.all([loadImg(LOGO),loadImg(PRISM_V),loadImg(MATTE_V)]);
  const mk=()=>{const cv=document.createElement("canvas");cv.width=W;cv.height=H;return cv;};
  const today=new Date().toLocaleDateString(L.locale,{day:"numeric",month:"long",year:"numeric"});
  const name=state.empresa||L.ui.pdfNameFallback;

  /* Page 1: overview + archetype */
  const p1=mk(),c=p1.getContext("2d");
  cover(c,prism,W,H,.9);pageFrame(c,W,H,P,logo,1,L.ui.pdfLabel1);
  T(c,today.toUpperCase(),P,210,F(500,18,1),C.fg3,"left",2);
  let fs=72;c.font=F(700,fs);while(c.measureText(name).width>W-P*2&&fs>40){fs-=2;c.font=F(700,fs);}
  T(c,name,P,290,F(700,fs),C.fg,"left",-1);
  const meta=[r.sectorKey&&r.sectorKey!=="other"?r.setor:"",r.dim?r.dim+" "+L.ui.people:"",r.funcao].filter(Boolean).join("  ·  ");
  if(meta)T(c,meta,P,336,F(400,22),C.fg2);
  // score block
  panelC(c,P,390,W-P*2,470);
  // O radar ocupa a coluna da esquerda e encolhe até os rótulos dos eixos (que mudam de largura com a língua) caberem na caixa.
  const sx=P+540,rx0=P+32,rx1=sx-32,half=(rx1-rx0)/2;
  c.font=F(600,17);
  const rR=Math.min(150,...AXES.map((ax,i)=>{const cs=Math.abs(Math.cos(-Math.PI/2+i*Math.PI/4));return cs<.2?Infinity:(half-c.measureText(ax.name).width)/cs-26;}));
  radarC(c,r,rx0+half,625,Math.floor(rR));
  T(c,L.ui.pdfIndex,sx,470,F(600,18),C.fg2,"left",4);
  c.font=F(700,150);const tw=c.measureText(String(r.total)).width;
  const g1=grad(c,sx,tw+90);T(c,String(r.total),sx,610,F(700,150),g1,"left",-4);T(c,"%",sx+tw+6,610,F(700,80),g1);
  T(c,r.level.toUpperCase(),sx,666,F(600,18),C.lilac,"left",4);
  T(c,L.ui.pdfArch,sx,734,F(600,16),C.fg3,"left",4);
  let afs=44;c.font=F(700,afs);while(c.measureText(a.name).width>W-P-sx-40&&afs>28){afs-=2;c.font=F(700,afs);}
  T(c,a.name,sx,784,F(700,afs),C.fg);
  T(c,a.tag,sx,822,F(400,20),C.fg2);
  // archetype analysis
  let y=940;
  T(c,L.ui.pdfArchAnalysis,P,y,F(600,18),C.peri,"left",4);
  y=para(c,a.desc,P,y+46,W-P*2,F(400,26),C.fg,40);
  y+=36;
  const colW=(W-P*2-28)/2;
  const blocks=[[L.ui.pdfRisk,a.risk,C.lilac],[L.ui.pdfFocus,a.focus,C.peri]];
  const bh=Math.max(...blocks.map(b=>wrap(c,b[1],colW-64,F(500,24)).length))*34+110;
  blocks.forEach((b,i)=>{const x=P+i*(colW+28);panelC(c,x,y,colW,bh);T(c,b[0],x+32,y+52,F(600,16),b[2],"left",4);para(c,b[1],x+32,y+96,colW-64,F(500,24),C.fg,34);});
  y+=bh+28;
  const sw=[[L.ui.pdfSuper,r.strong.strong,`${r.strong.name} · ${r.ax[r.strong.k]}%`,C.peri],[L.ui.pdfAchilles,r.weak.weak,`${r.weak.name} · ${r.ax[r.weak.k]}%`,C.lilac]];
  sw.forEach((b,i)=>{const x=P+i*(colW+28);panelC(c,x,y,colW,150);T(c,b[0],x+32,y+50,F(600,16),b[3],"left",4);T(c,b[1],x+32,y+94,F(600,28),C.fg);T(c,b[2],x+32,y+128,F(400,19),C.fg3);});

  /* Page 2: 8 axes */
  const p2=mk(),d=p2.getContext("2d");
  cover(d,matte,W,H,.7);pageFrame(d,W,H,P,logo,2,L.ui.pdfLabel2);
  T(d,L.ui.pdfAxesTitle,P,220,F(700,52),C.fg,"left",-1);
  T(d,L.ui.pdfAxesSub,P,266,F(400,22),C.fg2);
  y=320;
  const order=[...r.sorted].reverse();
  const items=order.map(ax=>{const v=r.ax[ax.k],b=band(v);return{ax,v,b,il:wrap(d,ax.i[b],W-P*2-64,F(400,21)),rl:wrap(d,"→ "+ax.r[b],W-P*2-64,F(500,21))};});
  const totalLines=items.reduce((s,it)=>s+it.il.length+it.rl.length,0);
  const lh=Math.max(24,Math.min(30,Math.floor((H-150-y-8*84)/totalLines)));const base=84;
  items.forEach(it=>{const h=base+(it.il.length+it.rl.length)*lh;
    panelC(d,P,y,W-P*2,h-12);
    T(d,it.ax.name,P+32,y+48,F(600,26),C.fg);
    const tag=BANDS[it.b].toUpperCase();d.font=F(600,14);const tgw=d.measureText(tag).width+(("letterSpacing"in d)?tag.length*3:0)+24;
    const tx=P+32+d.measureText("").width;d.font=F(600,26);const nw=d.measureText(it.ax.name).width;
    rr(P+48+nw,y+26,tgw,28,14,d);d.fillStyle=it.b===0?"rgba(213,187,255,0.16)":"rgba(150,179,255,0.16)";d.fill();
    T(d,tag,P+60+nw,y+45,F(600,14),it.b===0?C.lilac:C.peri,"left",3);
    bar(d,W-P-32-90-200,y+33,200,it.v,10);
    T(d,it.v+"%",W-P-32,y+48,F(600,26),C.fg,"right");
    let yy=y+50+lh+4;
    it.il.forEach(l=>{T(d,l,P+32,yy,F(400,21),C.fg2);yy+=lh;});
    it.rl.forEach(l=>{T(d,l,P+32,yy,F(500,21),C.fg);yy+=lh;});
    y+=h;});

  /* Page 3: benchmark + 90-day plan */
  const p3=mk(),e=p3.getContext("2d");
  cover(e,matte,W,H,.7);pageFrame(e,W,H,P,logo,3,L.ui.pdfLabel3);
  T(e,L.ui.pdfBenchTitle,P,220,F(700,52),C.fg,"left",-1);
  y=290;
  if(r.ownSector){
    const sv=r.ownSector[1];
    T(e,L.ui.pdfVsSector(r.ownSector[0]),P,y,F(600,16),C.peri,"left",3);
    panelC(e,P,y+24,W-P*2,8*46+60);
    AXES.forEach((ax,i)=>{const yy=y+82+i*46,v=r.ax[ax.k],s=sv[i],dlt=v-s;
      T(e,ax.name,P+32,yy+8,F(500,21),C.fg);
      const bx=P+260,bw=W-P*2-260-150;
      rr(bx,yy-8,bw,10,5,e);e.fillStyle=C.chip;e.fill();
      rr(bx,yy-8,Math.max(10,bw*v/100),10,5,e);e.fillStyle=grad(e,bx,bw);e.fill();
      e.fillStyle="#FFFFFF";e.fillRect(bx+bw*s/100-1.5,yy-14,3,22);
      T(e,(dlt>0?"+":"")+dlt,W-P-32,yy+8,F(600,21,1),dlt>=0?C.peri:C.lilac,"right");});
    y+=24+8*46+60+24;
    T(e,L.ui.pdfLegend,P,y,F(400,17),C.fg3);
    y+=44;
  }
  const colW3=(W-P*2-28)/2,listH=5*44+86;
  panelC(e,P,y,colW3,listH);panelC(e,P+colW3+28,y,colW3,listH);
  T(e,L.ui.pdfCompanies,P+32,y+50,F(600,16),C.fg2,"left",3);
  r.comps.slice(0,5).forEach((cc,i)=>{const yy=y+100+i*44;T(e,cc.n,P+32,yy,F(500,22),C.fg);T(e,cc.s+"%",P+colW3-32,yy,F(600,22),C.fg,"right");});
  const x2=P+colW3+28;
  T(e,L.ui.pdfSectors,x2+32,y+50,F(600,16),C.fg2,"left",3);
  r.secs.slice(0,5).forEach((cc,i)=>{const yy=y+100+i*44;T(e,cc.n,x2+32,yy,F(500,22),C.fg);T(e,cc.s+"%",x2+colW3-32,yy,F(600,22),C.fg,"right");});
  y+=listH+52;
  T(e,L.ui.pdfPlan,P,y,F(600,16),C.lilac,"left",3);y+=24;
  const weak3=[...r.sorted].reverse().slice(0,3),phases=L.ui.pdfPhases;
  const ph=Math.floor((H-150-y-2*16)/3);
  weak3.forEach((ax,i)=>{const yy=y+i*(ph+16);panelC(e,P,yy,W-P*2,ph);
    T(e,phases[i].toUpperCase(),P+32,yy+44,F(600,15,1),C.peri,"left",2);
    T(e,ax.name,P+32,yy+84,F(600,26),C.fg);
    para(e,ax.r[band(r.ax[ax.k])],P+260,yy+(ph>110?62:56),W-P*2-292,F(400,21),C.fg2,30);});
  e.font=F(400,15);
  T(e,L.ui.pdfNote+CAL_URL.replace("https://",""),P,H-130,F(400,15),C.fg3);
  return [p1,p2,p3];
}

function render(){
  if(state.step>=0)saveProgress();
  if(state.step<0)renderIntro();
  else if(state.step<Q.length)renderQuestion();
  else if(state.result)showResult();
  else renderResult();
}
render();
