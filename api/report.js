// Envia o relatório PDF do AI Mirror por email à pessoa que o pediu. O PDF é gerado no browser e chega em base64.
// Usa as mesmas variáveis de ambiente que api/contact.js (RESEND_API_KEY, CONTACT_FROM, CONTACT_TO).
// As respostas ao email vão para a equipa (CONTACT_TO).
const {EMAIL_RE,clean,oneLine,esc,TEAM,readBody,sendEmail,reply}=require("./_resend");

const CAL_URL="https://cal.com/marioalves";
// O relatório tem 3 páginas JPEG e fica bem abaixo disto; o limite da Vercel para o pedido é 4,5 MB.
const MAX_PDF_BYTES=3*1024*1024;

const COPY={
  pt:{
    subject:e=>e?`O relatório AI Mirror da ${e}`:"O teu relatório AI Mirror",
    hi:n=>n?`Olá ${n},`:"Olá,",
    body:(a,s)=>`Obrigado por fazeres o diagnóstico AI Mirror. Em anexo está o relatório completo: ${s}% AI Ready, arquétipo ${a}, a análise dos 8 eixos, a comparação com o setor e um plano de 90 dias.`,
    cta:"Se quiseres transformar o diagnóstico num plano concreto, marca 30 minutos com a equipa de AI Consulting da LayerX:",
    ctaBtn:"Marcar conversa",
    reply:"Tens alguma dúvida? Basta responder a este email.",
    sign:"Equipa LayerX",
  },
  en:{
    subject:e=>e?`AI Mirror report: ${e}`:"Your AI Mirror report",
    hi:n=>n?`Hi ${n},`:"Hi,",
    body:(a,s)=>`Thanks for taking the AI Mirror assessment. Attached is your full report: ${s}% AI Ready, archetype ${a}, the analysis of the 8 axes, the sector comparison and a 90-day plan.`,
    cta:"If you'd like to turn the assessment into a concrete plan, book 30 minutes with LayerX's AI Consulting team:",
    ctaBtn:"Book a call",
    reply:"Any questions? Just reply to this email.",
    sign:"The LayerX team",
  },
};

module.exports=async(req,res)=>{
  if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).json({error:"method_not_allowed"});}
  const b=readBody(req);
  if(!b)return res.status(400).json({error:"invalid_json"});

  const email=oneLine(clean(b.email,200)),nome=oneLine(clean(b.nome,100)),empresa=oneLine(clean(b.empresa,40));
  const arquetipo=oneLine(clean(b.arquetipo,60)),score=Number.isFinite(b.score)?Math.max(0,Math.min(100,Math.round(b.score))):null;
  const t=COPY[b.lingua==="en"?"en":"pt"];
  if(!EMAIL_RE.test(email)||!arquetipo||score==null)return res.status(400).json({error:"invalid_fields"});

  // Só aceita um PDF de verdade e de tamanho razoável, para a função não servir para enviar outros anexos.
  const pdf=typeof b.pdf==="string"?b.pdf:"";
  const bytes=Buffer.from(pdf,"base64");
  if(!bytes.length||bytes.length>MAX_PDF_BYTES||bytes.subarray(0,5).toString("latin1")!=="%PDF-")
    return res.status(400).json({error:"invalid_pdf"});
  const filename=(clean(b.filename,80).toLowerCase().replace(/[^a-z0-9.-]/g,"").replace(/^[.-]+/,"")||"ai-mirror.pdf").replace(/(\.pdf)?$/,".pdf");

  const text=[t.hi(nome),"",t.body(arquetipo,score),"",t.cta,CAL_URL,"",t.reply,"",t.sign].join("\n");
  const p="margin:0 0 16px;font:15px/1.6 Arial,sans-serif;color:#1B2030";
  const html=`<div style="max-width:560px">
    <p style="${p}">${esc(t.hi(nome))}</p>
    <p style="${p}">${esc(t.body(arquetipo,score))}</p>
    <p style="${p}">${esc(t.cta)}</p>
    <p style="margin:0 0 24px"><a href="${CAL_URL}" style="display:inline-block;background:#060912;color:#fff;text-decoration:none;font:600 14px Arial,sans-serif;padding:12px 22px;border-radius:999px">${esc(t.ctaBtn)}</a></p>
    <p style="${p}">${esc(t.reply)}</p>
    <p style="${p}">${esc(t.sign)}</p></div>`;

  reply(res,await sendEmail({
    to:[email],reply_to:TEAM(),subject:t.subject(empresa),text,html,
    attachments:[{filename,content:pdf}],
  },"report"));
};
