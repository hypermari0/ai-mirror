/* Páginas de rankings: empresas (AIDE Index) e países (Microsoft AI Diffusion Report).
   A página escolhe-se por <body data-page="companies|countries">. Partilha a língua com o diagnóstico (localStorage "lang"). */
const LANGS=["pt","en"];
const R_STR={
pt:{
 htmlLang:"pt-PT",locale:"pt-PT",langLabel:"Língua",navLabel:"Navegação principal",
 nav:{quiz:"AI Mirror",companies:"Empresas",countries:"Países"},
 search:"Pesquisar",showMore:n=>`Mostrar mais ${n}`,showAll:n=>`Mostrar todas (${n})`,noResults:"Sem resultados para este filtro.",
 ctaTitle:"E a tua empresa?",ctaText:"Faz o diagnóstico AI Mirror: 20 perguntas, 4 minutos, o perfil em 8 eixos e um plano de 90 dias.",ctaBtn:"Fazer o diagnóstico →",
 companies:{
  title:"Ranking de empresas · AI Mirror",
  desc:"As 500 empresas do S&P 500 ordenadas pela maturidade em IA, segundo o AIDE Index 2026.",
  eyebrow:"Ranking global · Empresas",
  h1:'Que grandes empresas estão mais <span class="gtext">avançadas em IA</span>?',
  lead:"As 500 empresas do S&P 500, avaliadas pelo AIDE Index 2026 apenas com dados públicos: relatórios anuais, apresentações de resultados, patentes, ofertas de emprego e LinkedIn.",
  stats:(n,s,t)=>[[n,"empresas"],[s,"setores"],[t,"Trailblazers"]],
  sectorsTitle:"Mediana por setor",sectorsHint:"Carrega num setor para filtrar a tabela.",
  cohortsTitle:"As quatro coortes do AIDE",
  cohorts:{
   "Trailblazer":"Estratégia e execução avançadas ao mesmo tempo.",
   "Visionary":"A ambição está à frente da execução. Parecido com o nosso Visionário de Slides.",
   "Stealth":"Executam mais do que comunicam. Parecido com o nosso Engenheiro Silencioso.",
   "Emerging Adopters":"Ainda no início, tanto na estratégia como na execução.",
  },
  tableTitle:"Ranking completo",allSectors:"Todos os setores",allCohorts:"Todas as coortes",
  cols:["#","Empresa","Setor","Coorte","Score AIDE"],
  searchPh:"Empresa ou ticker",
  strategic:"Intenção estratégica",operational:"Integração operacional",
  source:'Fonte: <a href="https://aideinstitute.com/rankings" target="_blank" rel="noopener">AIDE Index 2026</a>, AI-Driven Enterprise Institute. Publicado com autorização. Score de 0 a 100, normalizado dentro do S&P 500; empatados partilham a posição. Metodologia completa em <a href="https://aideinstitute.com/methodology" target="_blank" rel="noopener">aideinstitute.com</a>.',
  sectors:{"information-technology":"Tecnologias de informação","health-care":"Saúde","financials":"Financeiro","industrials":"Indústria","utilities":"Utilities","consumer-staples":"Bens de consumo básico","consumer-discretionary":"Consumo discricionário","energy":"Energia","materials":"Materiais","communication-services":"Serviços de comunicação","real-estate":"Imobiliário"},
 },
 countries:{
  title:"Ranking de países · AI Mirror",
  desc:"147 economias ordenadas pela percentagem da população em idade ativa que usa IA generativa, segundo a Microsoft.",
  eyebrow:"Ranking global · Países",
  h1:'Onde se <span class="gtext">usa mais IA</span> no mundo?',
  lead:"Percentagem da população em idade ativa (15 a 64 anos) que usou IA generativa no segundo trimestre de 2026, em 147 economias. Dados do Microsoft AI Diffusion Report.",
  stats:(n,w,top)=>[[n,"economias"],[w,"média mundial"],[top,"líder"]],
  ptTitle:"Portugal",
  ptLine:(rank,n,v)=>`${rank}.º lugar em ${n}, com ${v} da população em idade ativa a usar IA generativa.`,
  ptDelta:(d,mv)=>`${d} face ao trimestre anterior${mv}.`,
  ptMove:m=>m===0?", mantendo a posição":m>0?`, a subir ${m} ${m===1?"lugar":"lugares"}`:`, a descer ${-m} ${m===-1?"lugar":"lugares"}`,
  tableTitle:"Ranking completo",searchPh:"País",
  cols:["#","País","Uso de IA","Variação","Posição"],
  colsHint:"Variação em pontos percentuais e posição face ao Q1 2026.",
  pp:"p.p.",new:"novo",
  method:"Mede o uso, não a capacidade técnica nem o investimento. A Microsoft calcula-o a partir de telemetria agregada e anónima, ajustada por quota de mercado, acesso a dispositivos e à internet e população.",
  source:'Fonte: <a href="https://www.microsoft.com/en-us/corporate-responsibility/topics/ai-economy-institute/reports/global-ai-diffusion-report/" target="_blank" rel="noopener">Microsoft AI Diffusion Report, Q2 2026</a> (AI Economy Institute). Dados em <a href="https://github.com/microsoft/ai-diffusion-report" target="_blank" rel="noopener">github.com/microsoft/ai-diffusion-report</a>, licença MIT.',
 },
},
en:{
 htmlLang:"en",locale:"en-GB",langLabel:"Language",navLabel:"Main navigation",
 nav:{quiz:"AI Mirror",companies:"Companies",countries:"Countries"},
 search:"Search",showMore:n=>`Show ${n} more`,showAll:n=>`Show all (${n})`,noResults:"No results for this filter.",
 ctaTitle:"What about your company?",ctaText:"Take the AI Mirror assessment: 20 questions, 4 minutes, your profile across 8 axes and a 90-day plan.",ctaBtn:"Take the assessment →",
 companies:{
  title:"Company ranking · AI Mirror",
  desc:"The 500 S&P 500 companies ranked by AI maturity, according to the AIDE Index 2026.",
  eyebrow:"Global ranking · Companies",
  h1:'Which large companies are most <span class="gtext">advanced in AI</span>?',
  lead:"The 500 S&P 500 companies, assessed by the AIDE Index 2026 using public data only: annual reports, earnings calls, patents, job postings and LinkedIn.",
  stats:(n,s,t)=>[[n,"companies"],[s,"sectors"],[t,"Trailblazers"]],
  sectorsTitle:"Median by sector",sectorsHint:"Click a sector to filter the table.",
  cohortsTitle:"The four AIDE cohorts",
  cohorts:{
   "Trailblazer":"Advanced strategy and execution at the same time.",
   "Visionary":"Ambition is ahead of execution. Similar to our Slide-Deck Visionary.",
   "Stealth":"They execute more than they communicate. Similar to our Silent Engineer.",
   "Emerging Adopters":"Still early, in both strategy and execution.",
  },
  tableTitle:"Full ranking",allSectors:"All sectors",allCohorts:"All cohorts",
  cols:["#","Company","Sector","Cohort","AIDE score"],
  searchPh:"Company or ticker",
  strategic:"Strategic intent",operational:"Operational integration",
  source:'Source: <a href="https://aideinstitute.com/rankings" target="_blank" rel="noopener">AIDE Index 2026</a>, AI-Driven Enterprise Institute. Published with permission. Score from 0 to 100, normalised within the S&P 500; ties share a position. Full methodology at <a href="https://aideinstitute.com/methodology" target="_blank" rel="noopener">aideinstitute.com</a>.',
  sectors:{"information-technology":"Information technology","health-care":"Health care","financials":"Financials","industrials":"Industrials","utilities":"Utilities","consumer-staples":"Consumer staples","consumer-discretionary":"Consumer discretionary","energy":"Energy","materials":"Materials","communication-services":"Communication services","real-estate":"Real estate"},
 },
 countries:{
  title:"Country ranking · AI Mirror",
  desc:"147 economies ranked by the share of the working-age population using generative AI, according to Microsoft.",
  eyebrow:"Global ranking · Countries",
  h1:'Where in the world is <span class="gtext">AI used most</span>?',
  lead:"Share of the working-age population (15 to 64) that used generative AI in the second quarter of 2026, across 147 economies. Data from the Microsoft AI Diffusion Report.",
  stats:(n,w,top)=>[[n,"economies"],[w,"world average"],[top,"leader"]],
  ptTitle:"Portugal",
  ptLine:(rank,n,v)=>`Ranked ${rank} of ${n}, with ${v} of the working-age population using generative AI.`,
  ptDelta:(d,mv)=>`${d} on the previous quarter${mv}.`,
  ptMove:m=>m===0?", holding its position":m>0?`, up ${m} ${m===1?"place":"places"}`:`, down ${-m} ${m===-1?"place":"places"}`,
  tableTitle:"Full ranking",searchPh:"Country",
  cols:["#","Country","AI use","Change","Rank"],
  colsHint:"Change in percentage points and rank versus Q1 2026.",
  pp:"pp",new:"new",
  method:"This measures use, not technical capacity or investment. Microsoft derives it from aggregated, anonymised telemetry, adjusted for market share, device and internet access, and population.",
  source:'Source: <a href="https://www.microsoft.com/en-us/corporate-responsibility/topics/ai-economy-institute/reports/global-ai-diffusion-report/" target="_blank" rel="noopener">Microsoft AI Diffusion Report, Q2 2026</a> (AI Economy Institute). Data at <a href="https://github.com/microsoft/ai-diffusion-report" target="_blank" rel="noopener">github.com/microsoft/ai-diffusion-report</a>, MIT licence.',
 },
},
};

const app=document.getElementById("app"),PAGE=document.body.dataset.page;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let lang,S,P,nf,nf1,regionName;
const view={q:"",sector:"",cohort:"",shown:25};

function initialLang(){
  const p=new URLSearchParams(location.search).get("lang");if(LANGS.includes(p))return p;
  try{const s=localStorage.getItem("lang");if(LANGS.includes(s))return s;}catch(_){}
  return /^pt\b/i.test(navigator.language||"pt")?"pt":"en";
}
function setLang(l){
  lang=LANGS.includes(l)?l:"pt";S=R_STR[lang];P=S[PAGE];
  nf=new Intl.NumberFormat(S.locale,{maximumFractionDigits:1});
  nf1=new Intl.NumberFormat(S.locale,{minimumFractionDigits:1,maximumFractionDigits:1});
  const dn=new Intl.DisplayNames([S.locale],{type:"region"});regionName=c=>{try{return dn.of(c);}catch(_){return c;}};
  document.documentElement.lang=S.htmlLang;document.title=P.title;
  const md=document.querySelector('meta[name="description"]');if(md)md.content=P.desc;
  document.querySelectorAll("[data-nav]").forEach(a=>{a.querySelector("span").textContent=S.nav[a.dataset.nav];});
  const nav=document.querySelector(".nav");if(nav)nav.setAttribute("aria-label",S.navLabel);
  document.querySelectorAll(".lang button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.l===lang));
  const g=document.querySelector(".lang");if(g)g.setAttribute("aria-label",S.langLabel);
  try{localStorage.setItem("lang",lang);}catch(_){}
  render();
}
document.querySelectorAll(".lang button").forEach(b=>b.onclick=()=>{if(b.dataset.l!==lang)setLang(b.dataset.l);});

/* ---------- Blocos comuns ---------- */
const pct=v=>nf1.format(v)+"%";
const signed=(v,unit)=>(v>0?"+":v<0?"−":"±")+nf1.format(Math.abs(v))+(unit?" "+unit:"");
function hero(stats){
  return `<section class="rk-hero">
    <div class="eyebrow">${P.eyebrow}</div><h1>${P.h1}</h1><p class="lead">${P.lead}</p>
    <div class="rk-stats">${stats.map(([v,l])=>`<div><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join("")}</div>
  </section>`;
}
function cta(){
  return `<section class="panel rk-cta"><div><h2>${S.ctaTitle}</h2><p>${S.ctaText}</p></div><a class="btn" href="/">${S.ctaBtn}</a></section>`;
}
// Mostra as linhas aos poucos para a tabela não ficar enorme à primeira.
function moreButtons(total){
  if(view.shown>=total)return "";
  const n=Math.min(50,total-view.shown);
  return `<div class="rk-more"><button class="btn ghost" data-more="${n}">${S.showMore(n)}</button><button class="btn ghost" data-more="all">${S.showAll(total)}</button></div>`;
}
function bindTable(rerender){
  app.querySelectorAll("[data-more]").forEach(b=>b.onclick=()=>{view.shown=b.dataset.more==="all"?1e9:view.shown+(+b.dataset.more);rerender();});
}
// Posição por competição: empatados partilham o número.
function ranks(values){let prev=null,rank=0;return values.map((v,i)=>{if(v!==prev){rank=i+1;prev=v;}return rank;});}

/* ---------- Empresas ---------- */
// Cada página só carrega o seu ficheiro de dados.
const CO=typeof AIDE_COMPANIES==="undefined"?[]:AIDE_COMPANIES.map(([name,ticker,sector,score,cohort,strategic,operational])=>({name,ticker,sector,score,cohort,strategic,operational}));
ranks(CO.map(c=>c.score)).forEach((r,i)=>CO[i].rank=r);
const COHORTS=["Trailblazer","Visionary","Stealth","Emerging Adopters"];
const cohortCls=c=>"ch-"+c.split(" ")[0].toLowerCase();

function renderCompanies(){
  const secs=AIDE_SECTORS.map(([id,median,count,tb,vi,st,em])=>({id,median,count,tb,vi,st,em}));
  const counts=Object.fromEntries(COHORTS.map(c=>[c,CO.filter(x=>x.cohort===c).length]));
  app.innerHTML=`${hero(P.stats(String(CO.length),String(secs.length),String(counts.Trailblazer)))}
  <div class="rk-two">
    <section class="panel"><h3>${P.sectorsTitle}</h3><p class="rk-hint">${P.sectorsHint}</p>
      <div class="rk-bars">${secs.map(s=>`<button class="rk-bar ${view.sector===s.id?"on":""}" data-sector="${s.id}" aria-pressed="${view.sector===s.id}">
        <span class="nm">${esc(P.sectors[s.id])}<small>${s.count}</small></span><span class="bar"><i style="width:${s.median}%"></i></span><b>${nf1.format(s.median)}</b></button>`).join("")}</div>
    </section>
    <section class="panel"><h3>${P.cohortsTitle}</h3>
      <div class="rk-cohorts">${COHORTS.map(c=>`<button class="rk-cohort ${view.cohort===c?"on":""}" data-cohort="${esc(c)}" aria-pressed="${view.cohort===c}">
        <span class="tagc ${cohortCls(c)}">${esc(c)}</span><b>${counts[c]}</b><p>${esc(P.cohorts[c])}</p></button>`).join("")}</div>
    </section>
  </div>
  <section class="panel rk-table-wrap" id="table"></section>
  ${cta()}
  <p class="rk-source">${P.source}</p>`;
  app.querySelectorAll("[data-sector]").forEach(b=>b.onclick=()=>{view.sector=view.sector===b.dataset.sector?"":b.dataset.sector;view.shown=25;renderCompanies();document.getElementById("table").scrollIntoView({behavior:"smooth",block:"start"});});
  app.querySelectorAll("[data-cohort]").forEach(b=>b.onclick=()=>{view.cohort=view.cohort===b.dataset.cohort?"":b.dataset.cohort;view.shown=25;renderCompanies();document.getElementById("table").scrollIntoView({behavior:"smooth",block:"start"});});
  renderCompanyTable();
}
function renderCompanyTable(){
  const t=document.getElementById("table"),q=view.q.trim().toLowerCase();
  const rows=CO.filter(c=>(!view.sector||c.sector===view.sector)&&(!view.cohort||c.cohort===view.cohort)&&(!q||c.name.toLowerCase().includes(q)||c.ticker.toLowerCase()===q));
  const vis=rows.slice(0,view.shown);
  t.innerHTML=`<div class="rk-head"><h3>${P.tableTitle}</h3>
    <div class="rk-filters">
      <input type="search" id="q" placeholder="${esc(P.searchPh)}" aria-label="${esc(S.search)}" value="${esc(view.q)}">
      <select id="fs" aria-label="${esc(P.cols[2])}"><option value="">${P.allSectors}</option>${AIDE_SECTORS.map(([id])=>`<option value="${id}" ${view.sector===id?"selected":""}>${esc(P.sectors[id])}</option>`).join("")}</select>
      <select id="fc" aria-label="${esc(P.cols[3])}"><option value="">${P.allCohorts}</option>${COHORTS.map(c=>`<option ${view.cohort===c?"selected":""}>${esc(c)}</option>`).join("")}</select>
    </div></div>
    ${vis.length?`<table class="rk-table co"><thead><tr>${P.cols.map((c,i)=>`<th class="c${i}" scope="col">${c}</th>`).join("")}</tr></thead><tbody>
    ${vis.map(c=>`<tr><td class="c0">${c.rank}</td>
      <td class="c1"><span class="nm">${esc(c.name)}</span><span class="tk">${esc(c.ticker)}</span><span class="sub">${esc(P.sectors[c.sector])} · <span class="tagc ${cohortCls(c.cohort)}">${esc(c.cohort)}</span></span></td>
      <td class="c2">${esc(P.sectors[c.sector])}</td>
      <td class="c3"><span class="tagc ${cohortCls(c.cohort)}">${esc(c.cohort)}</span></td>
      <td class="c4" title="${esc(P.strategic)}: ${nf.format(c.strategic)} · ${esc(P.operational)}: ${nf.format(c.operational)}"><span class="sc"><span class="bar"><i style="width:${c.score}%"></i></span><b>${nf1.format(c.score)}</b></span></td></tr>`).join("")}
    </tbody></table>`:`<p class="rk-empty">${S.noResults}</p>`}
    ${moreButtons(rows.length)}`;
  const qi=document.getElementById("q");
  qi.oninput=()=>{view.q=qi.value;view.shown=25;renderCompanyTable();const n=document.getElementById("q");n.focus();n.setSelectionRange(n.value.length,n.value.length);};
  document.getElementById("fs").onchange=e=>{view.sector=e.target.value;view.shown=25;renderCompanies();};
  document.getElementById("fc").onchange=e=>{view.cohort=e.target.value;view.shown=25;renderCompanies();};
  bindTable(renderCompanyTable);
}

/* ---------- Países ---------- */
function renderCountries(){
  const q1Order=[...DIFFUSION].sort((a,b)=>b[3]-a[3]).map(r=>r[0]);
  const rk=ranks(DIFFUSION.map(r=>r[4])),rk1=ranks([...DIFFUSION].sort((a,b)=>b[3]-a[3]).map(r=>r[3]));
  const q1Rank=Object.fromEntries(q1Order.map((c,i)=>[c,rk1[i]]));
  const rows=DIFFUSION.map(([code,,,q1,q2],i)=>({code,name:regionName(code),v:q2,d:+(q2-q1).toFixed(1),rank:rk[i],move:q1Rank[code]-rk[i]}));
  const pt=rows.find(r=>r.code==="PT");
  app.innerHTML=`${hero(P.stats(String(rows.length),pct(DIFFUSION_WORLD),`${rows[0].name} · ${pct(rows[0].v)}`))}
  ${pt?`<section class="panel rk-pt"><div><div class="eyebrow" style="color:var(--lilac)">${P.ptTitle}</div>
    <p class="big">${P.ptLine(pt.rank,rows.length,pct(pt.v))}</p><p>${P.ptDelta(signed(pt.d,P.pp),P.ptMove(pt.move))}</p></div>
    <div class="rk-ptn"><b class="gtext">${pt.rank}</b><span>/ ${rows.length}</span></div></section>`:""}
  <section class="panel rk-table-wrap" id="table"></section>
  <p class="rk-method">${P.method}</p>
  ${cta()}
  <p class="rk-source">${P.source}</p>`;
  renderCountryTable(rows);
}
function renderCountryTable(all){
  const t=document.getElementById("table"),q=view.q.trim().toLowerCase();
  const norm=s=>s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
  const rows=q?all.filter(r=>norm(r.name).includes(norm(q))):all;
  const vis=rows.slice(0,view.shown),max=all[0].v;
  const mv=m=>m===0?`<span class="mv eq">=</span>`:`<span class="mv ${m>0?"up":"dn"}">${m>0?"▲":"▼"} ${Math.abs(m)}</span>`;
  t.innerHTML=`<div class="rk-head"><div><h3>${P.tableTitle}</h3><p class="rk-hint">${P.colsHint}</p></div>
    <div class="rk-filters"><input type="search" id="q" placeholder="${esc(P.searchPh)}" aria-label="${esc(S.search)}" value="${esc(view.q)}"></div></div>
    ${vis.length?`<table class="rk-table ct"><thead><tr>${P.cols.map((c,i)=>`<th class="c${i}" scope="col">${c}</th>`).join("")}</tr></thead><tbody>
    ${vis.map(r=>`<tr class="${r.code==="PT"?"hl":""}"><td class="c0">${r.rank}</td><td class="c1"><span class="nm">${esc(r.name)}</span></td>
      <td class="c2"><span class="sc"><span class="bar"><i style="width:${r.v/max*100}%"></i></span><b>${pct(r.v)}</b></span></td>
      <td class="c3"><span class="dl ${r.d>0?"up":r.d<0?"dn":""}">${signed(r.d,P.pp)}</span></td><td class="c4">${mv(r.move)}</td></tr>`).join("")}
    </tbody></table>`:`<p class="rk-empty">${S.noResults}</p>`}
    ${moreButtons(rows.length)}`;
  const qi=document.getElementById("q");
  qi.oninput=()=>{view.q=qi.value;view.shown=25;renderCountryTable(all);const n=document.getElementById("q");n.focus();n.setSelectionRange(n.value.length,n.value.length);};
  bindTable(()=>renderCountryTable(all));
}

function render(){PAGE==="companies"?renderCompanies():renderCountries();}
setLang(initialLang());
