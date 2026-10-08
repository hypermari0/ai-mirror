// Utilitários partilhados pelas funções que enviam email. O prefixo "_" impede a Vercel de expor este ficheiro como rota.
const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean=(v,max)=>typeof v==="string"?v.trim().slice(0,max):"";
const oneLine=s=>s.replace(/[\r\n]+/g," ");
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const FROM=()=>process.env.CONTACT_FROM||"AI Mirror <ai-mirror@layerx.xyz>";
const TEAM=()=>process.env.CONTACT_TO||"hello@layerx.xyz";

function readBody(req){
  let b=req.body||{};
  if(typeof b==="string"){try{b=JSON.parse(b);}catch(_){return null;}}
  return b&&typeof b==="object"?b:null;
}

// Envia pela API do Resend. Devolve true se o Resend aceitou o email.
async function sendEmail(payload,tag){
  const key=process.env.RESEND_API_KEY;
  if(!key){console.error(`${tag}: RESEND_API_KEY em falta`);return "not_configured";}
  try{
    const r=await fetch("https://api.resend.com/emails",{
      method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},
      body:JSON.stringify({from:FROM(),...payload}),
    });
    if(!r.ok){console.error(`${tag}: Resend`,r.status,await r.text());return "send_failed";}
    return "ok";
  }catch(e){console.error(`${tag}:`,e);return "send_failed";}
}

function reply(res,result){
  if(result==="ok")return res.status(200).json({ok:true});
  return res.status(result==="not_configured"?503:502).json({error:result});
}

module.exports={EMAIL_RE,clean,oneLine,esc,FROM,TEAM,readBody,sendEmail,reply};
