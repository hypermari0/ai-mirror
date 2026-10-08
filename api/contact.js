// Formulário de dúvidas do AI Mirror: recebe o POST da página e envia a mensagem por email via Resend.
// Variáveis de ambiente na Vercel:
//   RESEND_API_KEY  obrigatória
//   CONTACT_TO      destino, por omissão hello@layerx.xyz
//   CONTACT_FROM    remetente num domínio verificado no Resend, por omissão "AI Mirror <ai-mirror@layerx.xyz>"
const {EMAIL_RE,clean,oneLine,esc,TEAM,readBody,sendEmail,reply}=require("./_resend");

module.exports=async(req,res)=>{
  if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).json({error:"method_not_allowed"});}
  const b=readBody(req);
  if(!b)return res.status(400).json({error:"invalid_json"});

  // Honeypot: campo escondido que só os bots preenchem. Responde ok para não lhes dar pistas.
  if(clean(b.website,200))return res.status(200).json({ok:true});

  const nome=oneLine(clean(b.nome,100)),email=oneLine(clean(b.email,200)),mensagem=clean(b.mensagem,4000);
  const lingua=b.lingua==="en"?"en":"pt";
  if(!EMAIL_RE.test(email)||!mensagem)return res.status(400).json({error:"invalid_fields"});

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

  reply(res,await sendEmail({to:[TEAM()],reply_to:email,subject:`AI Mirror: dúvida de ${nome||email}`,text,html},"contact"));
};
