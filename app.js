const state={step:-1,answers:Array(Q.length).fill(null),empresa:"",result:null,unlocked:false,pdfBlob:null,pages:null};
const app=document.getElementById("app");
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
  const comps=COMPANIES.map(([n,v])=>({n,s:sim(vec,v)})).sort((a,b)=>b.s-a.s);
  const secs=SECTOR_PROFILES.map(([n,v])=>({n,v,s:sim(vec,v)})).sort((a,b)=>b.s-a.s);
  const sorted=[...AXES].sort((a,b)=>ax[b.k]-ax[a.k]);
  const prof=k=>{const i=Q.findIndex(q=>q.id===k);return state.answers[i]!=null?Q[i].o[state.answers[i]]:"";};
  const setor=prof("setor");
  const ownSector=SECTOR_PROFILES.find(s=>s[0]===setor);
  return {ax,vec,total,arch,level,comps,secs,sorted,strong:sorted[0],weak:sorted[7],setor,dim:prof("dim"),funcao:prof("funcao"),ownSector};
}

/* ---------- Intro ---------- */
function renderIntro(){
  const demo=[72,48,35,40,55,62,20,30];
  app.innerHTML=`
  <section class="intro">
    <div>
      <div class="eyebrow">Diagnóstico gratuito · LayerX</div>
      <h1>Quão <span class="gtext">AI ready</span> está a tua empresa?</h1>
      <p class="lead">20 perguntas, cerca de 4 minutos. No fim vês o perfil da tua empresa em 8 eixos, o teu arquétipo e com quem te pareces. Se quiseres, recebes também um relatório com um plano de ação.</p>
      <div class="start">
        <div><label class="lbl" for="empresa">Nome da empresa (opcional, aparece no teu cartão)</label>
        <input type="text" id="empresa" maxlength="40" placeholder="Ex.: Metalúrgica do Norte" value="${esc(state.empresa)}"></div>
        <div><button class="btn" id="go">Começar diagnóstico →</button></div>
        <div class="meta"><span>20 perguntas</span><span>8 eixos</span><span>7 arquétipos</span></div>
      </div>
    </div>
    <aside class="axes-preview" aria-label="Os 8 eixos medidos">
      <div class="eyebrow" style="color:var(--fg-3);margin-bottom:6px">Os 8 eixos · exemplo</div>
      ${AXES.map((a,i)=>`<div class="row"><span class="nm">${a.name}<small>${a.desc}</small></span>
        <span class="bar"><i style="width:${demo[i]}%"></i></span></div>`).join("")}
    </aside>
  </section>`;
  const inp=document.getElementById("empresa");
  document.getElementById("go").onclick=()=>{state.empresa=inp.value.trim();state.step=0;render();};
  inp.addEventListener("keydown",e=>{if(e.key==="Enter")document.getElementById("go").click();});
}

/* ---------- Questions ---------- */
function renderQuestion(){
  const i=state.step,q=Q[i],sel=state.answers[i];
  const tag=q.profile?["Perfil","var(--fg-3)"]:q.bonus?["Bónus","var(--lilac)"]:[AX[q.ax].name,"var(--peri)"];
  app.innerHTML=`
  <section class="quiz">
    <div class="progress"><span>${String(i+1).padStart(2,"0")} / ${Q.length}</span><span class="track"><i style="width:${(i/Q.length)*100}%"></i></span></div>
    <div class="qtag eyebrow" style="color:${tag[1]}">${tag[0]}</div>
    <h2>${esc(q.q)}</h2>
    <div class="opts ${q.grid?"grid":""}" role="radiogroup" aria-label="${esc(q.q)}">
      ${q.o.map((o,j)=>`<button class="opt ${sel===j?"sel":""}" role="radio" aria-checked="${sel===j}" data-j="${j}"><span class="k">${q.grid?"·":j+1}</span><span>${esc(o)}</span></button>`).join("")}
    </div>
    <div class="qnav">
      <button class="btn ghost" id="back">← ${i===0?"Início":"Anterior"}</button>
      <span class="hint">${q.grid?"":"1–4 para responder · ← voltar"}</span>
    </div>
  </section>`;
  app.querySelectorAll(".opt").forEach(b=>b.onclick=()=>choose(+b.dataset.j));
  document.getElementById("back").onclick=back;
  const f=app.querySelector(".opt.sel")||app.querySelector(".opt");f&&f.focus({preventScroll:true});
}
let advancing=false;
function choose(j){
  if(advancing)return;advancing=true;
  state.answers[state.step]=j;
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
  return `<svg class="c-radar" viewBox="0 0 400 380" role="img" aria-label="Radar dos 8 eixos">
    <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#96B3FF" stop-opacity=".6"/><stop offset="1" stop-color="#D5BBFF" stop-opacity=".45"/></linearGradient></defs>
    ${[.25,.5,.75,1].map(f=>`<polygon points="${ring(f)}" fill="none" stroke="#FFFFFF" stroke-opacity=".09" stroke-width="1.2"/>`).join("")}
    ${AXES.map((_,i)=>{const[x,y]=pt(i,1);return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#FFFFFF" stroke-opacity=".06"/>`;}).join("")}
    <polygon points="${poly}" fill="url(#rg)" stroke="#96B3FF" stroke-width="2.5" stroke-linejoin="round"/>
    ${AXES.map((a,i)=>{const[x,y]=pt(i,Math.max(.04,r.ax[a.k]/100));return `<circle cx="${x}" cy="${y}" r="4.5" fill="#FFFFFF"/>`;}).join("")}
    ${labels}</svg>`;
}
function cardHTML(r){
  const a=ARCH[r.arch];
  const meta=[state.empresa,r.setor&&r.setor!=="Outro"?r.setor:"",r.dim?r.dim+" pessoas":""].filter(Boolean).map(esc).join("  ·  ");
  return `<div class="card" id="card"><div class="cin">
    <div class="c-head"><img src="${LOGO}" alt="LayerX"><span class="r"></span><span class="t">O MEU RESULTADO</span></div>
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
        <div class="c-lbl" style="margin-top:1.2em">AI Ready</div>
        <div class="c-sep"></div>
        <div class="c-lbl m">Mais parecida com</div>
        <div class="c-big">${esc(r.comps[0].n)}</div>
        <div class="c-sub">${r.comps[0].s}% compatível</div>
      </div>
      <div class="c-panel">
        <div class="c-lbl">Os teus 8 eixos</div>
        <div class="c-axes">${AXES.map(x=>`<div class="c-ax"><div class="top"><span>${x.name}</span><b>${r.ax[x.k]}%</b></div><div class="tr"><i style="width:${Math.max(2,r.ax[x.k])}%"></i></div></div>`).join("")}</div>
      </div>
    </div>
    <div class="c-grid">
      <div class="c-panel"><div class="c-lbl">Outras empresas</div>
        <div class="c-list">${r.comps.slice(1,4).map(c=>`<div class="it"><span>${esc(c.n)}</span><b>${c.s}%</b></div>`).join("")}</div></div>
      <div class="c-panel"><div class="c-lbl">Setores próximos</div>
        <div class="c-list">${r.secs.slice(0,3).map(c=>`<div class="it"><span>${esc(c.n)}</span><b>${c.s}%</b></div>`).join("")}</div></div>
    </div>
    <div class="c-strip">
      <div class="c-panel"><div class="h" style="color:#96B3FF">Superpoder</div><div class="v">${esc(r.strong.strong)}</div><div class="s">${r.strong.name} · ${r.ax[r.strong.k]}%</div></div>
      <div class="c-panel"><div class="h" style="color:#D5BBFF">Calcanhar de Aquiles</div><div class="v">${esc(r.weak.weak)}</div><div class="s">${r.weak.name} · ${r.ax[r.weak.k]}%</div></div>
    </div>
    <div class="c-foot"><span>Descobre o teu perfil</span><span>LayerX · AI Ready Index</span></div>
  </div></div>`;
}

async function renderResult(){
  app.innerHTML=`<section class="computing"><div><div class="spin"></div><p>A calcular os teus 8 eixos…</p></div></section>`;
  state.result=compute();state.pdfBlob=null;state.pages=null;
  await new Promise(r=>setTimeout(r,900));
  showResult();
}
function showResult(){
  const r=state.result,a=ARCH[r.arch];
  app.innerHTML=`
  <section class="result">
    <div class="cardcol">${cardHTML(r)}<div class="note">Tira um print ao cartão para partilhar no LinkedIn ou nas stories.</div></div>
    <div class="rail">
      <div>
        <div class="eyebrow" style="color:var(--lilac)">${esc(r.level)}</div>
        <h2>${esc(a.name)}</h2>
        <p class="tagline">${esc(a.tag)}</p>
      </div>
      <div class="panel report" id="report"></div>
      <div class="panel"><div class="cta">
        <p>Queres transformar este diagnóstico num plano concreto? Fala 30 minutos com a equipa de AI Consulting da LayerX.</p>
        <a class="btn ghost" href="${CAL_URL}" target="_blank" rel="noopener">Marcar conversa ↗</a></div></div>
      <div><button class="btn ghost" id="redo">↺ Refazer o diagnóstico</button></div>
    </div>
  </section>`;
  document.getElementById("redo").onclick=()=>{state.step=-1;state.answers.fill(null);state.unlocked=false;render();};
  renderReportPanel();
  window.scrollTo({top:0});
}

const LOCK=`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#96B3FF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;
const CHECK=`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#96B3FF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>`;
function renderReportPanel(){
  const g=document.getElementById("report"),r=state.result;
  const toc=[
    ["Análise do teu arquétipo","O que caracteriza a empresa, o maior risco e onde focar"],
    ["Os 8 eixos em detalhe","Diagnóstico e recomendação para cada eixo"],
    [r.ownSector?"Comparação com o setor "+r.ownSector[0]:"Benchmark com empresas e setores","Onde estás acima e abaixo da referência"],
    ["Plano de 90 dias","Três passos, por ordem, a começar pelo eixo mais fraco"],
  ];
  const ico=state.unlocked?CHECK:LOCK;
  const list=`<ul class="toc">${toc.map(t=>`<li><span class="lk">${ico}</span><div>${esc(t[0])}<span>${esc(t[1])}</span></div></li>`).join("")}</ul>`;
  if(state.unlocked){
    g.innerHTML=`<h3>O teu relatório está pronto</h3><p>Relatório em PDF, 3 páginas, com o plano de ação para ${esc(state.empresa||"a tua empresa")}.</p>${list}
      <div style="margin-top:18px"><button class="btn" id="dlpdf">Descarregar relatório PDF</button></div>
      <div class="toast" id="toast" role="status"></div><div class="pages" id="pages"></div>`;
    document.getElementById("dlpdf").onclick=downloadPDF;
    return;
  }
  g.innerHTML=`<h3>Relatório completo · PDF</h3>
    <p>O cartão mostra onde estás. O relatório mostra o que fazer a seguir.</p>
    ${list}
    <div class="teaser" aria-hidden="true"><div class="tl">Plano de 90 dias · Dias 1 a 30</div>
      <div class="ghostline" style="width:92%"></div><div class="ghostline" style="width:78%"></div><div class="ghostline" style="width:64%"></div>
      <div class="lock"><span style="display:inline-flex;align-items:center;gap:8px">${LOCK} Desbloqueia com o teu email</span></div></div>
    <form class="lead" id="leadf" novalidate>
      <div class="two">
        <div><label class="lbl" for="lnome">Nome</label><input type="text" id="lnome" autocomplete="name" placeholder="O teu nome"></div>
        <div><label class="lbl" for="lemail">Email de trabalho</label><input type="email" id="lemail" autocomplete="email" placeholder="nome@empresa.pt" required></div>
      </div>
      <label class="check"><input type="checkbox" id="lmkt"> Quero receber conteúdos da LayerX sobre adoção de IA.</label>
      <div class="err" id="lerr" role="alert"></div>
      <div><button class="btn" type="submit" id="lsub">Receber o relatório</button></div>
      <div class="fine">A LayerX guarda o teu email e o resultado do diagnóstico para te enviar o relatório e, se aceitares, conteúdos sobre IA.</div>
    </form>`;
  document.getElementById("leadf").addEventListener("submit",async e=>{
    e.preventDefault();
    const email=document.getElementById("lemail").value.trim(),err=document.getElementById("lerr");
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){err.textContent="Escreve um email válido, por exemplo nome@empresa.pt.";return;}
    err.textContent="";
    const b=document.getElementById("lsub");b.disabled=true;b.textContent="A preparar o relatório…";
    await saveLead({email,nome:document.getElementById("lnome").value.trim(),marketing:document.getElementById("lmkt").checked});
    state.unlocked=true;renderReportPanel();
  });
}

/* ---------- Leads (db capability) ---------- */
async function saveLead(lead){
  const r=state.result;
  const row={...lead,empresa:state.empresa,setor:r.setor,dimensao:r.dim,funcao:r.funcao,score:r.total,arquetipo:ARCH[r.arch].name,
    nivel:r.level,eixos:r.ax,empresaParecida:r.comps[0].n,respostas:state.answers,criadoEm:new Date().toISOString()};
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
function slug(s){return (s||"empresa").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"empresa";}
async function ensurePDF(){
  if(state.pdfBlob)return;
  await Promise.all(["700 60px Inter","600 30px Inter","500 30px Inter","400 30px Inter","500 20px 'JetBrains Mono'"].map(f=>document.fonts.load(f))).catch(()=>{});
  const pages=await drawReport(state.result);
  state.pages=pages.map(p=>p.toDataURL("image/jpeg",0.9));
  const {jsPDF}=window.jspdf;
  const pdf=new jsPDF({unit:"pt",format:[1240,1754],compress:true});
  state.pages.forEach((u,i)=>{if(i)pdf.addPage([1240,1754],"portrait");pdf.addImage(u,"JPEG",0,0,1240,1754);});
  state.pdfBlob=pdf.output("blob");
}
async function downloadPDF(){
  const t=document.getElementById("toast"),b=document.getElementById("dlpdf");
  t.textContent="A gerar o relatório…";b.disabled=true;
  try{await ensurePDF();}catch(e){t.textContent="Não foi possível gerar o relatório. Tenta de novo.";b.disabled=false;return;}
  b.disabled=false;
  const filename=`relatorio-ai-ready-${slug(state.empresa)}.pdf`;
  // Fora do claude.ai: download normal do browser.
  if(!window.claude||!window.claude.use){
    const a=document.createElement("a");a.href=URL.createObjectURL(state.pdfBlob);a.download=filename;
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
    t.textContent="Relatório descarregado.";return;
  }
  let dl=null;try{dl=await window.claude.use("downloads");}catch(_){}
  if(!dl){t.textContent="Neste ecrã não é possível descarregar ficheiros. O relatório fica aqui em baixo.";showPages();return;}
  try{
    const res=await dl.save({filename,data:state.pdfBlob});
    t.textContent=res.status==="saved"?"Relatório guardado.":"";
  }catch(e){
    const c=e&&e.code;
    if(c==="declined")t.textContent="Download cancelado.";
    else if(c==="rate_limited")t.textContent="Já há um download a decorrer. Tenta de novo daqui a pouco.";
    else{t.textContent="Não foi possível descarregar aqui. O relatório fica aqui em baixo.";showPages();}
  }
}
function showPages(){const p=document.getElementById("pages");if(p&&state.pages)p.innerHTML=state.pages.map((u,i)=>`<img src="${u}" alt="Relatório, página ${i+1}">`).join("");}

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
  T(c,"LayerX · AI Ready Index",P,H-62,F(500,18),C.fg3);
  T(c,`${n} / 3`,W-P,H-62,F(500,18,1),C.fg3,"right");
}

async function drawReport(r){
  const W=1240,H=1754,P=88,a=ARCH[r.arch];
  const [logo,prism,matte]=await Promise.all([loadImg(LOGO),loadImg(PRISM_V),loadImg(MATTE_V)]);
  const mk=()=>{const cv=document.createElement("canvas");cv.width=W;cv.height=H;return cv;};
  const today=new Date().toLocaleDateString("pt-PT",{day:"numeric",month:"long",year:"numeric"});
  const name=state.empresa||"A tua empresa";

  /* Page 1: overview + archetype */
  const p1=mk(),c=p1.getContext("2d");
  cover(c,prism,W,H,.9);pageFrame(c,W,H,P,logo,1,"RELATÓRIO AI READY");
  T(c,today.toUpperCase(),P,210,F(500,18,1),C.fg3,"left",2);
  let fs=72;c.font=F(700,fs);while(c.measureText(name).width>W-P*2&&fs>40){fs-=2;c.font=F(700,fs);}
  T(c,name,P,290,F(700,fs),C.fg,"left",-1);
  const meta=[r.setor&&r.setor!=="Outro"?r.setor:"",r.dim?r.dim+" pessoas":"",r.funcao].filter(Boolean).join("  ·  ");
  if(meta)T(c,meta,P,336,F(400,22),C.fg2);
  // score block
  panelC(c,P,390,W-P*2,470);
  radarC(c,r,P+250,625,150);
  const sx=P+520;
  T(c,"ÍNDICE AI READY",sx,470,F(600,18),C.fg2,"left",4);
  c.font=F(700,150);const tw=c.measureText(String(r.total)).width;
  const g1=grad(c,sx,tw+90);T(c,String(r.total),sx,610,F(700,150),g1,"left",-4);T(c,"%",sx+tw+6,610,F(700,80),g1);
  T(c,r.level.toUpperCase(),sx,666,F(600,18),C.lilac,"left",4);
  T(c,"ARQUÉTIPO",sx,734,F(600,16),C.fg3,"left",4);
  let afs=44;c.font=F(700,afs);while(c.measureText(a.name).width>W-P-sx-40&&afs>28){afs-=2;c.font=F(700,afs);}
  T(c,a.name,sx,784,F(700,afs),C.fg);
  T(c,a.tag,sx,822,F(400,20),C.fg2);
  // archetype analysis
  let y=940;
  T(c,"ANÁLISE DO ARQUÉTIPO",P,y,F(600,18),C.peri,"left",4);
  y=para(c,a.desc,P,y+46,W-P*2,F(400,26),C.fg,40);
  y+=36;
  const colW=(W-P*2-28)/2;
  const blocks=[["MAIOR RISCO",a.risk,C.lilac],["ONDE FOCAR",a.focus,C.peri]];
  const bh=Math.max(...blocks.map(b=>wrap(c,b[1],colW-64,F(500,24)).length))*34+110;
  blocks.forEach((b,i)=>{const x=P+i*(colW+28);panelC(c,x,y,colW,bh);T(c,b[0],x+32,y+52,F(600,16),b[2],"left",4);para(c,b[1],x+32,y+96,colW-64,F(500,24),C.fg,34);});
  y+=bh+28;
  const sw=[["SUPERPODER",r.strong.strong,`${r.strong.name} · ${r.ax[r.strong.k]}%`,C.peri],["CALCANHAR DE AQUILES",r.weak.weak,`${r.weak.name} · ${r.ax[r.weak.k]}%`,C.lilac]];
  sw.forEach((b,i)=>{const x=P+i*(colW+28);panelC(c,x,y,colW,150);T(c,b[0],x+32,y+50,F(600,16),b[3],"left",4);T(c,b[1],x+32,y+94,F(600,28),C.fg);T(c,b[2],x+32,y+128,F(400,19),C.fg3);});

  /* Page 2: 8 axes */
  const p2=mk(),d=p2.getContext("2d");
  cover(d,matte,W,H,.7);pageFrame(d,W,H,P,logo,2,"OS 8 EIXOS EM DETALHE");
  T(d,"Os 8 eixos em detalhe",P,220,F(700,52),C.fg,"left",-1);
  T(d,"Do mais fraco para o mais forte. Começa pelo topo.",P,266,F(400,22),C.fg2);
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
  cover(e,matte,W,H,.7);pageFrame(e,W,H,P,logo,3,"BENCHMARK E PLANO");
  T(e,"Benchmark e plano de 90 dias",P,220,F(700,52),C.fg,"left",-1);
  y=290;
  if(r.ownSector){
    const sv=r.ownSector[1];
    T(e,`A TUA EMPRESA VS. MÉDIA ESTIMADA DO SETOR ${r.ownSector[0].toUpperCase()}`,P,y,F(600,16),C.peri,"left",3);
    panelC(e,P,y+24,W-P*2,8*46+60);
    AXES.forEach((ax,i)=>{const yy=y+82+i*46,v=r.ax[ax.k],s=sv[i],dlt=v-s;
      T(e,ax.name,P+32,yy+8,F(500,21),C.fg);
      const bx=P+260,bw=W-P*2-260-150;
      rr(bx,yy-8,bw,10,5,e);e.fillStyle=C.chip;e.fill();
      rr(bx,yy-8,Math.max(10,bw*v/100),10,5,e);e.fillStyle=grad(e,bx,bw);e.fill();
      e.fillStyle="#FFFFFF";e.fillRect(bx+bw*s/100-1.5,yy-14,3,22);
      T(e,(dlt>0?"+":"")+dlt,W-P-32,yy+8,F(600,21,1),dlt>=0?C.peri:C.lilac,"right");});
    y+=24+8*46+60+24;
    T(e,"Barra: a tua empresa  ·  Marca branca: média estimada do setor  ·  Valor: diferença em pontos",P,y,F(400,17),C.fg3);
    y+=44;
  }
  const colW3=(W-P*2-28)/2,listH=5*44+86;
  panelC(e,P,y,colW3,listH);panelC(e,P+colW3+28,y,colW3,listH);
  T(e,"EMPRESAS MAIS PARECIDAS",P+32,y+50,F(600,16),C.fg2,"left",3);
  r.comps.slice(0,5).forEach((cc,i)=>{const yy=y+100+i*44;T(e,cc.n,P+32,yy,F(500,22),C.fg);T(e,cc.s+"%",P+colW3-32,yy,F(600,22),C.fg,"right");});
  const x2=P+colW3+28;
  T(e,"SETORES MAIS PRÓXIMOS",x2+32,y+50,F(600,16),C.fg2,"left",3);
  r.secs.slice(0,5).forEach((cc,i)=>{const yy=y+100+i*44;T(e,cc.n,x2+32,yy,F(500,22),C.fg);T(e,cc.s+"%",x2+colW3-32,yy,F(600,22),C.fg,"right");});
  y+=listH+52;
  T(e,"PLANO DE 90 DIAS",P,y,F(600,16),C.lilac,"left",3);y+=24;
  const weak3=[...r.sorted].reverse().slice(0,3),phases=["Dias 1 a 30","Dias 31 a 60","Dias 61 a 90"];
  const ph=Math.floor((H-150-y-2*16)/3);
  weak3.forEach((ax,i)=>{const yy=y+i*(ph+16);panelC(e,P,yy,W-P*2,ph);
    T(e,phases[i].toUpperCase(),P+32,yy+44,F(600,15,1),C.peri,"left",2);
    T(e,ax.name,P+32,yy+84,F(600,26),C.fg);
    para(e,ax.r[band(r.ax[ax.k])],P+260,yy+(ph>110?62:56),W-P*2-292,F(400,21),C.fg2,30);});
  e.font=F(400,15);
  T(e,"Perfis de referência estimados pela LayerX a partir de informação pública. Marca uma conversa: "+CAL_URL.replace("https://",""),P,H-130,F(400,15),C.fg3);
  return [p1,p2,p3];
}

function render(){
  if(state.step<0)renderIntro();
  else if(state.step<Q.length)renderQuestion();
  else renderResult();
}
render();
