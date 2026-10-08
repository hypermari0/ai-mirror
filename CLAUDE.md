# AI Ready Index · LayerX

Diagnóstico de prontidão para IA em formato quiz, inspirado no 12axes.vercel.app. A pessoa responde a 20 perguntas, vê um cartão partilhável com o perfil da empresa em 8 eixos e, em troca do email, descarrega um relatório em PDF com plano de ação. É uma ferramenta de geração de leads para a oferta de AI Consulting da LayerX.

Toda a copy é em português europeu (PT-PT). Sem travessões longos no texto: usar vírgula ou dois pontos.

## Estrutura

Site estático, sem build. Abre-se `index.html` num servidor local.

| Ficheiro | O que tem |
|---|---|
| `index.html` | Esqueleto da página, fontes e scripts |
| `styles.css` | Tokens de cor e tipografia, ecrãs e cartão |
| `data.js` | Configuração (`CAL_URL`, `LEAD_ENDPOINT`) e todo o conteúdo: eixos, perguntas, perfis de referência, arquétipos, níveis |
| `app.js` | Estado, scoring, ecrãs, cartão, captura de leads e geração do PDF |
| `assets/` | Wordmark LayerX, fundo prism (vertical e horizontal) e fundo matte do Deck Kit |

Dependência externa única: jsPDF 2.5.1 (cdnjs). Fontes: Inter e JetBrains Mono (Google Fonts).

## Fluxo

1. **Intro**: nome da empresa (opcional, aparece no cartão e no PDF).
2. **20 perguntas**, uma por ecrã, avanço automático, teclas 1 a 4, seta esquerda para voltar.
   - 3 de perfil, não pontuadas: setor, dimensão, função.
   - 16 pontuadas, 2 por eixo.
   - 1 bónus ("Se a IA desaparecesse amanhã…"), que conta para Adoção.
3. **Resultado**: cartão em HTML (para print) e painel do relatório bloqueado.
4. **Email**: desbloqueia o PDF. O cartão nunca fica atrás do email; a informação reservada (recomendações, benchmark de setor, plano de 90 dias) só existe no PDF.

## Scoring

- Cada opção vale 0, 33, 67 ou 100. Eixo = média das suas perguntas. Total = média dos 8 eixos.
- Eixos e chaves: `est` Estratégia, `ado` Adoção, `pro` Processos, `dad` Dados, `tec` Tecnologia, `pes` Pessoas, `gov` Governança, `inv` Investimento. A ordem dos vetores é sempre esta.
- Super-eixos: Ambição = média(est, pes, inv); Execução = média(dad, tec, pro, gov).
- Arquétipo, pela primeira regra que se aplica:
  1. total ≥ 85 → AI-Native
  2. ado ≥ 60 e gov ≤ 35 → O Rebelde
  3. total < 30 → O Observador
  4. Ambição − Execução ≥ 15 e Execução < 50 → O Visionário de Slides
  5. Execução − Ambição ≥ 15 e Ambição < 50 → O Engenheiro Silencioso
  6. total ≥ 60 → O Construtor
  7. resto → O Explorador
- Nível pelo total: <25 Arranque, <50 Experimentação, <70 Adoção, <85 Escala, resto AI-Native.
- Banda por eixo (escolhe o diagnóstico e a recomendação): <40 Inicial, <70 Em curso, resto Avançado.
- Semelhança com empresas e setores: `100 − RMS(diferença)` entre vetores de 8 eixos.

## Perfis de referência

`COMPANIES` e `SECTOR_PROFILES` em `data.js` são **estimativas da LayerX** a partir de posicionamento público, não dados medidos. Por isso o cartão diz "mais parecida com" e o PDF tem uma nota de rodapé. Não atribuir scores a empresas portuguesas concretas. Quando houver respostas suficientes, substituir as médias de setor pelas médias reais recolhidas.

## Leads

`saveLead()` em `app.js` monta um objeto com email, nome, opt-in de marketing, empresa, setor, dimensão, função, score, arquétipo, nível, eixos, empresa mais parecida, respostas e data. Depois:
- se `LEAD_ENDPOINT` estiver definido, faz POST JSON para lá;
- se estiver a correr como artifact no claude.ai, guarda também em `leads/{userId}` na base de dados do artifact (este ramo é ignorado fora do claude.ai).

## PDF

Gerado no browser: três páginas A4 desenhadas em `<canvas>` (1240×1754) com Inter, convertidas para JPEG e juntas com jsPDF. Funções `drawReport()` e `ensurePDF()`. Página 1: capa, índice, radar, arquétipo, risco e foco. Página 2: 8 eixos do mais fraco para o mais forte. Página 3: comparação com o setor, empresas e setores parecidos, plano de 90 dias (3 eixos mais fracos).

Ao mexer em textos do PDF, confirmar que nada sai das caixas: o texto é quebrado com `wrap()` mas as alturas das caixas são calculadas à mão.

## Marca

Segue o branding LayerX (dark-first):
- Canvas navy-black `#060912`, superfícies translúcidas com borda `rgba(255,255,255,.10)`.
- Acentos: periwinkle `#96B3FF` (principal) e lilás `#D5BBFF` (kickers e destaques), em gradiente nos números grandes e nas barras.
- Inter com `font-feature-settings: 'cv05'`; JetBrains Mono para dados e metadados.
- Fundos prism e matte do Deck Kit. Não usar verde.
- Cartão: tudo em `em`, com `1em = 1/108` da largura (container query), para escalar como uma imagem 1080 de largura.

## Próximos passos

- [ ] Publicar na Vercel (site estático).
- [ ] Criar `api/lead.js` (função serverless) que recebe o POST e cria ou atualiza o contacto no HubSpot, com score e arquétipo em propriedades personalizadas; definir `LEAD_ENDPOINT="/api/lead"`.
- [ ] Enviar o PDF também por email (Resend ou HubSpot), para o lead receber o relatório na caixa de correio.
- [ ] Meta tags Open Graph e imagem de partilha.
- [ ] Analytics do funil: início, conclusão das perguntas, email submetido, PDF descarregado.
- [ ] Rever com a equipa de AI Consulting os textos das recomendações e os perfis de referência.
