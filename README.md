# AI Mirror

Diagnóstico de prontidão para IA da LayerX, em português e inglês: 20 perguntas, perfil em 8 eixos, cartão partilhável, relatório em PDF em troca do email e formulário de dúvidas.

## Correr localmente

Precisa de um servidor local (abrir o ficheiro diretamente bloqueia o carregamento das imagens no PDF):

```bash
npx serve .
```

Depois abrir http://localhost:3000. Para testar também o formulário de dúvidas (`api/contact.js`), usar `vercel dev` com `RESEND_API_KEY` definida.

## Continuar no Claude Code

```bash
cd ai-mirror
claude
```

O `CLAUDE.md` tem o contexto completo: fluxo, regras de scoring, estrutura dos ficheiros, marca e próximos passos. Um bom primeiro pedido:

> Cria uma função /api/lead que envia os leads para o HubSpot.

## Publicar na Vercel

Já está ligado à Vercel (projeto `ai-mirror`) e ao GitHub: cada push para `main` vai para produção. É um site estático, sem build, mais a função `api/contact.js`.

## Onde mudar o quê

- Perguntas, eixos, arquétipos, recomendações e todos os textos, em PT e EN: `STR` em `data.js`
- Perfis de referência: `COMPANIES` e `SECTOR_PROFILES` em `data.js`
- Link de agendamento, endpoint dos leads e email de contacto: topo de `data.js`
- Envio das dúvidas por email: `api/contact.js`
- Visual: `styles.css`
- Lógica, cartão e PDF: `app.js`
