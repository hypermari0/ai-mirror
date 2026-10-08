// Formulário de dúvidas do AI Mirror: recebe o POST da página e envia a mensagem por email via Resend.
// Variáveis de ambiente na Vercel:
//   RESEND_API_KEY  obrigatória
//   CONTACT_TO      destino, por omissão hello@layerx.xyz
//   CONTACT_FROM    remetente num domínio verificado no Resend, por omissão "AI Mirror <ai-mirror@layerx.xyz>"
const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean=(v,max)=>typeof v==="string"?v.trim().slice(0,max):"";
const oneLine=s=>s.replace(/[\r\n]+/g," ");
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

module.exports=async(req,res)=>{
  if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).json({error:"method_not_allowed"});}
  let b=req.body||{};
  if(typeof b==="string"){try{b=JSON.parse(b);}catch(_){return res.status(400).json({error:"invalid_json"});}}

  // Honeypot: campo escondido que só os bots preenchem. Responde ok para não lhes dar pistas.
  if(clean(b.website,200))return res.status(200).json({ok:true});

  const nome=oneLine(clean(b.nome,100)),email=oneLine(clean(b.email,200)),mensagem=clean(b.mensagem,4000);
  const lingua=b.lingua==="en"?"en":"pt";
  if(!EMAIL_RE.test(email)||!mensagem)return res.status(400).json({error:"invalid_fields"});

  const key=process.env.RESEND_API_KEY;
  if(!key){console.error("contact: RESEND_API_KEY em falta");return res.status(503).json({error:"not_configured"});}

  const ctx=b.contexto&&typeof b.contexto==="object"?b.contexto:null;
  const linhas=[
    ["Nome",nome||"(não indicado)"],["Email",email],["Língua",lingua.toUpperCase()],
    ...(ctx?[["Empresa",clean(ctx.empresa,60)],["Setor",clean(ctx.setor,60)],["Score",Number.isFinite(ctx.score)?ctx.score+"%":""],
      ["Arquétipo",clean(ctx.arquetipo,60)],["Nível",clean(ctx.nivel,60)]]:[]),
  ].filter(([,v])=>v);

  const text=`${linhas.map(([k,v])=>`${k}: ${v}`).join("\n")}\n\n${mensagem}`;
  const html=`<table style="font:14px/1.5 Arial,sans-serif;border-collapse:collapse">${linhas.map(([k,v])=>
    `<tr><td style="color:#6F7686;padding:2px 16px 2px 0">${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</table>
    <p style="font:14px/1.6 Arial,sans-serif;white-space:pre-wrap;margin-top:20px">${esc(mensagem)}</p>`;

  try{
    const r=await fetch("https://api.resend.com/emails",{
      method:"POST",
      headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},
      body:JSON.stringify({
        from:process.env.CONTACT_FROM||"AI Mirror <ai-mirror@layerx.xyz>",
        to:[process.env.CONTACT_TO||"hello@layerx.xyz"],
        reply_to:email,
        subject:`AI Mirror: dúvida de ${nome||email}`,
        text,html,
      }),
    });
    if(!r.ok){console.error("contact: Resend",r.status,await r.text());return res.status(502).json({error:"send_failed"});}
    return res.status(200).json({ok:true});
  }catch(e){
    console.error("contact:",e);
    return res.status(502).json({error:"send_failed"});
  }
};
