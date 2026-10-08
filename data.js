/* ===== Configuração ===== */
const LOGO="assets/logo.svg", PRISM_V="assets/prism_v.jpg", MATTE_V="assets/matte_v.jpg";
const CAL_URL="https://cal.com/marioalves";
// Endpoint que recebe os leads (POST JSON). Vazio = não envia para lado nenhum.
// Ex.: "/api/lead" numa função serverless da Vercel que cria o contacto no HubSpot.
const LEAD_ENDPOINT="";

/* ===== Conteúdo: eixos, perguntas, perfis de referência e arquétipos ===== */
const AXES=[
 {k:"est",name:"Estratégia",desc:"A IA está na agenda da liderança",strong:"Liderança alinhada",weak:"Falta direção",
  i:["A IA ainda não tem lugar na agenda da liderança, por isso cada iniciativa depende de quem a puxa.","Há intenção e alguns objetivos, mas falta transformar a vontade num plano com dono e orçamento.","A IA tem patrocínio claro e objetivos mensuráveis. A estratégia está a liderar a transformação."],
  r:["Nomear um responsável pela IA e escolher 3 casos de uso com dono e KPI para os próximos 90 dias.","Converter os objetivos num roadmap trimestral com responsáveis, orçamento e métricas de sucesso.","Rever o portefólio de casos de uso a cada trimestre e cortar o que não mostra retorno."]},
 {k:"ado",name:"Adoção",desc:"As pessoas usam IA no dia a dia",strong:"Equipas que já usam",weak:"Uso ainda raro",
  i:["O uso de IA é pontual e quase sempre em contas pessoais, o que esconde ganhos e cria risco.","Parte das equipas já usa IA, mas o uso é desigual e pouco partilhado.","A IA faz parte do trabalho diário da maioria das pessoas."],
  r:["Dar licenças empresariais a uma equipa piloto e medir o tempo poupado ao fim de 30 dias.","Alargar as licenças a toda a empresa e criar uma biblioteca interna de prompts e casos que funcionam.","Passar do uso individual para fluxos de equipa, com IA integrada nas ferramentas que já usam."]},
 {k:"pro",name:"Processos",desc:"Há IA em produção, não só pilotos",strong:"IA em produção",weak:"Pilotos que não escalam",
  i:["Ainda não há IA em processos reais e o valor fica no uso individual.","Existem pilotos, mas o caminho até produção não é claro e muitos ficam pelo caminho.","Vários processos já correm com IA em produção."],
  r:["Escolher um processo repetitivo e de baixo risco e levá-lo de piloto a produção em 6 semanas.","Definir critérios de passagem a produção (qualidade, custo, risco) e um dono para cada piloto.","Medir o impacto por processo e replicar o padrão nas áreas que ainda não automatizaram."]},
 {k:"dad",name:"Dados",desc:"Informação organizada e acessível",strong:"Dados prontos a usar",weak:"Dados dispersos",
  i:["A informação crítica está dispersa em emails, folhas de cálculo e pessoas. É o maior travão à IA.","Há sistemas centrais, mas os dados ainda não estão documentados nem fáceis de consultar.","Os dados estão organizados e acessíveis, prontos a alimentar modelos e agentes."],
  r:["Mapear onde vive a informação crítica e centralizar primeiro a fonte que alimenta o caso de uso prioritário.","Documentar as fontes principais e criar uma camada de acesso única, com permissões claras.","Investir na qualidade e atualização contínua dos dados e abrir o acesso a novos casos de uso."]},
 {k:"tec",name:"Tecnologia",desc:"Sistemas e equipa capazes de integrar",strong:"Base técnica sólida",weak:"Sistemas fechados",
  i:["Os sistemas são fechados e não há quem integre soluções de IA.","Parte dos sistemas está acessível e há alguma capacidade técnica, ainda insuficiente para escalar.","A base técnica permite integrar IA nos sistemas core com autonomia."],
  r:["Identificar um parceiro técnico e expor por API o sistema que suporta o caso de uso prioritário.","Reforçar a equipa com perfis de integração e uniformizar a forma de ligar modelos aos sistemas.","Criar uma plataforma interna reutilizável (modelos, agentes, avaliação) para acelerar cada novo caso."]},
 {k:"pes",name:"Pessoas",desc:"Formação e cultura que valorizam o uso",strong:"Cultura de aprendizagem",weak:"Pouca formação",
  i:["Sem formação, cada pessoa aprende sozinha e o uso de IA é visto com desconfiança.","Há curiosidade e alguma formação, mas sem um percurso por função.","As pessoas estão preparadas e a cultura premeia quem usa e partilha."],
  r:["Fazer uma sessão de literacia em IA para toda a empresa e nomear um champion em cada equipa.","Desenhar formação por função, com casos práticos do dia a dia de cada equipa.","Reconhecer e divulgar os melhores casos internos e dar tempo protegido para experimentar."]},
 {k:"gov",name:"Governança",desc:"Regras, risco e AI Act",strong:"Risco sob controlo",weak:"Regras por definir",
  i:["Não há regras de uso nem visibilidade sobre que dados entram em ferramentas de IA.","Existem algumas regras, mas o risco e o AI Act ainda não estão mapeados.","A governança está montada e acompanha a adoção."],
  r:["Escrever uma política de uso de IA de uma página e listar os dados que nunca podem sair da empresa.","Mapear os casos de uso por nível de risco à luz do AI Act e formar as equipas na política.","Automatizar o controlo (registo de casos, revisões periódicas) para não travar a velocidade."]},
 {k:"inv",name:"Investimento",desc:"Orçamento e medição de impacto",strong:"Investimento com retorno",weak:"Sem orçamento nem métricas",
  i:["Não há orçamento dedicado nem medição, e a IA compete por recursos caso a caso.","Há algum investimento, mas o impacto é medido por perceção.","O investimento cresce suportado por ROI medido."],
  r:["Reservar orçamento para 2 pilotos e definir à partida a métrica de sucesso de cada um.","Definir KPIs por caso de uso (tempo, custo, receita) e rever os resultados todos os meses.","Alocar orçamento por retorno comprovado e reservar uma fatia para apostas de maior risco."]},
];
const AX=Object.fromEntries(AXES.map(a=>[a.k,a]));
const band=v=>v<40?0:v<70?1:2;
const BANDS=["Inicial","Em curso","Avançado"];

const SECTORS=["Banca e seguros","Indústria","Retalho e consumo","Tecnologia","Saúde","Logística e transportes","Serviços profissionais","Setor público","Energia e utilities","Turismo e hotelaria","Telecomunicações","Outro"];
const Q=[
 {id:"setor",profile:true,grid:true,q:"Em que setor está a tua empresa?",o:SECTORS},
 {id:"dim",profile:true,q:"Quantas pessoas trabalham na empresa?",o:["1 a 10","11 a 50","51 a 250","Mais de 250"]},
 {id:"funcao",profile:true,q:"Qual é a tua função?",o:["Administração / C-level","Gestão intermédia","Perfil técnico","Outra"]},
 {ax:"est",q:"A IA aparece na estratégia da empresa?",o:["Não se fala disso","Fala-se, mas sem plano","Há objetivos definidos para este ano","Tem dono, orçamento e KPIs"]},
 {ax:"est",q:"Quem lidera a IA na empresa?",o:["Ninguém","Iniciativa individual de alguns","Uma área ou equipa","A administração, com patrocínio explícito"]},
 {ax:"ado",q:"Que percentagem das pessoas usa IA generativa todas as semanas?",o:["Menos de 10%","Entre 10% e 30%","Entre 30% e 60%","Mais de 60%"]},
 {ax:"ado",q:"Que ferramentas de IA usam?",o:["Contas pessoais gratuitas","Licenças pagas para alguns","Licenças empresariais para todos","IA integrada nos sistemas internos"]},
 {ax:"pro",q:"Quantos processos têm IA em produção?",o:["Nenhum","Um piloto","Entre 2 e 5","Mais de 5"]},
 {ax:"pro",q:"O que acontece a um piloto de IA que funciona?",o:["Não fazemos pilotos","Fica no PowerPoint","Às vezes escala","Há um caminho definido até produção"]},
 {ax:"dad",q:"Onde vive a informação crítica da empresa?",o:["Em emails, Excels e na cabeça das pessoas","Em vários sistemas desligados","Em sistemas centrais, com algum acesso","Centralizada, documentada e acessível por API"]},
 {ax:"dad",q:"Se pedires hoje as vendas por cliente dos últimos 3 anos, quanto tempo demoram a dar-tas?",o:["Semanas","Dias","Horas","Já estão num dashboard"]},
 {ax:"tec",q:"Os sistemas core têm APIs ou estão na cloud?",o:["Não","Poucos","A maioria","Todos, com acesso programático"]},
 {ax:"tec",q:"Quem integraria uma solução de IA nos vossos sistemas?",o:["Ninguém","Um fornecedor externo, pontualmente","Alguns perfis internos","Uma equipa dedicada"]},
 {ax:"pes",q:"Que formação em IA existe na empresa?",o:["Nenhuma","Cada um aprende sozinho","Sessões pontuais","Programa estruturado por função"]},
 {ax:"pes",q:"Como é visto quem usa IA no trabalho?",o:["Com desconfiança","Ninguém sabe que usa","É tolerado","É celebrado e partilhado"]},
 {ax:"gov",q:"Existe uma política de uso de IA?",o:["Não","Informal","Escrita","Escrita, com formação e revista regularmente"]},
 {ax:"gov",q:"Em relação ao AI Act e aos dados sensíveis…",o:["Não sabemos o que é","Sabemos, mas ainda não fizemos nada","Mapeámos os riscos","Temos um processo de compliance"]},
 {ax:"inv",q:"Que orçamento anual existe para IA?",o:["Zero","Ad hoc, quando surge","Uma linha dedicada","Crescente, justificado por ROI"]},
 {ax:"inv",q:"Medem o impacto da IA?",o:["Não","Por perceção","Com alguns KPIs","ROI por caso de uso"]},
 {ax:"ado",bonus:true,q:"Se a IA desaparecesse amanhã, a empresa…",o:["Nem notava","Alguns ficavam chateados","Perdia produtividade visível","Parava operações"]},
];
const PTS=[0,33,67,100];

// Reference profiles [est, ado, pro, dad, tec, pes, gov, inv], estimated from public positioning.
const COMPANIES=[
 ["Shopify",[95,95,80,85,90,85,65,85]],["Klarna",[95,85,90,85,90,70,60,90]],["Duolingo",[95,85,80,85,90,70,60,85]],
 ["JPMorgan Chase",[90,70,75,90,90,75,95,95]],["Siemens",[85,60,75,80,80,70,85,85]],["Moderna",[90,80,75,90,85,80,75,80]],
 ["IKEA",[70,55,55,70,70,70,70,65]],["Scale-up SaaS típica",[80,85,65,75,85,70,55,70]],["Startup tech típica",[60,85,50,55,75,55,20,40]],
 ["Banco tradicional",[55,35,30,55,45,35,70,40]],["Consultora tradicional",[55,65,30,40,40,50,40,35]],["Agência criativa",[45,80,35,30,40,55,20,30]],
 ["Retalhista tradicional",[35,30,20,40,40,25,30,25]],["Organismo público",[30,20,15,30,25,20,50,20]],["PME industrial típica",[25,25,10,25,25,15,10,15]],
];
const SECTOR_PROFILES=[
 ["Tecnologia",[70,80,60,70,80,60,45,60]],["Banca e seguros",[65,50,50,70,65,50,80,65]],["Telecomunicações",[65,55,55,70,70,50,65,60]],
 ["Energia e utilities",[55,40,45,60,55,40,65,50]],["Serviços profissionais",[55,65,35,45,45,50,45,40]],["Retalho e consumo",[45,40,35,50,50,35,35,35]],
 ["Logística e transportes",[40,30,35,45,40,25,30,30]],["Indústria",[40,30,30,40,40,30,30,30]],["Saúde",[40,35,25,40,35,30,55,30]],
 ["Setor público",[30,25,15,30,25,20,50,20]],["Turismo e hotelaria",[30,35,20,30,30,20,25,20]],
];
const ARCH={
 native:{name:"AI-Native",tag:"A IA já é o sistema operativo da empresa.",
  desc:"A IA está na estratégia, no dia a dia e nos sistemas. O desafio agora é manter a vantagem: escolher bem onde investir a seguir e medir o retorno com rigor.",
  risk:"Complacência: a vantagem de hoje desaparece se a empresa deixar de experimentar.",focus:"Escalar com disciplina de ROI e levar agentes a processos críticos."},
 rebelde:{name:"O Rebelde",tag:"Toda a gente usa, ninguém controla.",
  desc:"As equipas adotaram IA mais depressa do que a empresa conseguiu organizar-se. Há energia e ganhos reais, mas também dados a sair por ferramentas pessoais e pouca visibilidade sobre o impacto.",
  risk:"Fuga de dados e decisões tomadas com ferramentas sem controlo.",focus:"Canalizar a energia: licenças empresariais, política clara e casos de uso oficiais."},
 observador:{name:"O Observador",tag:"Ainda a ver para onde vai o vento.",
  desc:"A IA ainda não entrou na empresa de forma consistente. É o ponto de partida mais comum e também o mais barato para começar bem: um caso de uso escolhido com critério chega para mudar a conversa.",
  risk:"Ficar para trás enquanto a concorrência ganha produtividade e aprende mais depressa.",focus:"Um caso de uso com valor visível em 90 dias e literacia básica para toda a equipa."},
 visionario:{name:"O Visionário de Slides",tag:"A estratégia está pronta, falta o resto.",
  desc:"Há vontade e patrocínio da liderança, mas os dados, os sistemas e os processos ainda não acompanham. A ambição corre o risco de se gastar em pilotos que nunca chegam a produção.",
  risk:"Pilotos que nunca chegam a produção por falta de base técnica.",focus:"Arrumar dados e sistemas para o primeiro caso de uso chegar a produção."},
 engenheiro:{name:"O Engenheiro Silencioso",tag:"Terreno fértil, falta direção.",
  desc:"A base técnica está melhor do que a maioria: dados, sistemas e regras. Falta a liderança apontar o caminho e as pessoas ganharem o hábito. Com uma prioridade clara, avança depressa.",
  risk:"Capacidade técnica parada à espera de uma prioridade de negócio.",focus:"Patrocínio da liderança e 2 ou 3 prioridades claras."},
 construtor:{name:"O Construtor",tag:"A IA já faz parte da casa.",
  desc:"A empresa passou da experimentação à adoção. Há casos em produção, pessoas que usam e alguma disciplina. O próximo salto é escalar o que funciona e reforçar os eixos que ficaram para trás.",
  risk:"Crescimento desigual, com eixos atrasados a travar a escala.",focus:"Replicar o que funciona e reforçar os eixos mais fracos."},
 explorador:{name:"O Explorador",tag:"Já começou a viagem, falta o mapa.",
  desc:"Há experiências e algum uso, mas ainda sem uma direção partilhada. É a fase em que escolher 2 ou 3 prioridades faz mais diferença do que fazer mais coisas.",
  risk:"Dispersão: muitas experiências, pouco impacto acumulado.",focus:"Escolher 2 ou 3 prioridades e dar-lhes dono, orçamento e métrica."},
};
const LEVELS=[[25,"Nível 1 · Arranque"],[50,"Nível 2 · Experimentação"],[70,"Nível 3 · Adoção"],[85,"Nível 4 · Escala"],[101,"Nível 5 · AI-Native"]];

