# AI Ready Index

Diagnóstico de prontidão para IA da LayerX: 20 perguntas, perfil em 8 eixos, cartão partilhável e relatório em PDF em troca do email.

## Correr localmente

Precisa de um servidor local (abrir o ficheiro diretamente bloqueia o carregamento das imagens no PDF):

```bash
npx serve .
```

Depois abrir http://localhost:3000.

## Continuar no Claude Code

```bash
cd ai-ready-index
claude
```

O `CLAUDE.md` tem o contexto completo: fluxo, regras de scoring, estrutura dos ficheiros, marca e próximos passos. Um bom primeiro pedido:

> Publica isto na Vercel e cria uma função /api/lead que envia os leads para o HubSpot.

## Publicar na Vercel

```bash
npx vercel
```

É um site estático, sem build.

## Onde mudar o quê

- Perguntas, eixos, arquétipos, recomendações e perfis de referência: `data.js`
- Link de agendamento e endpoint dos leads: topo de `data.js`
- Visual: `styles.css`
- Lógica, cartão e PDF: `app.js`
