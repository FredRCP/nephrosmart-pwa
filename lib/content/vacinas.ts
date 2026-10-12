// Vacinas do adulto — com e sem DRC (Onda 8). Substitui as duas telas do app original (calendário geral e DRC).
// Conteúdo reescrito a partir de: SBIm Calendário do Adulto 2026-27, SBIm Pacientes Especiais 2026-27 (pp. 12-13),
// Guia SBIm/ABTO de transplante 2025-26, Manual dos CRIE 2023-24, CDC Adult Schedule 2026.
// 2ª revisão (out/2026): acrescentados dengue, meningocócicas e detalhes do Calendário SBIm do Adulto 2026-27 (conferido no texto). Lista em ordem alfabética.
// Itens com certeza incompleta foram RETIRADOS (ver PESQUISAR_EQUIPE.md). Revisão de outubro/2026: seção DRC da SBIm (pp. 12-13) e
// recomendações da ABTO (out/2025) conferidas no texto. NÃO verificados: Manual CRIE vigente, calendário do PNI adulto no gov.br,
// texto da KDIGO 2024 e da AST 2019. Itens de confiança menor estão marcados em `confianca`.
export type Confianca = 'alta' | 'media' | 'baixa';
export type GrupoDrc = 'todos' | 'naoDialitica' | 'dialise';

export interface Vacina {
  id: string;
  nome: string;
  /** Vacina de vírus vivo atenuado (regra especial na imunossupressão). */
  vivo?: boolean;
  /** Palavras extras para a busca (nomes comerciais, doença). */
  busca: string;
  /** Resumo mostrado com o cartão fechado. */
  resumoGeral: string;
  resumoDrc: string;
  geral: string[];
  /** Orientação para o adulto com DRC (vale para todos os grupos). */
  drc: string[];
  /** Linhas específicas de cada grupo de DRC. */
  porGrupo?: Partial<Record<Exclude<GrupoDrc, 'todos'>, string[]>>;
  /** Nomes comerciais usados no Brasil (exemplos; a oferta varia). */
  comerciais?: string;
  disponibilidade?: string;
  atencao?: string;
  confianca: Confianca;
}

export const ROTULO_GRUPO: Record<GrupoDrc, string> = {
  todos: 'Todos os grupos',
  naoDialitica: 'Não dialítica',
  dialise: 'Diálise',
};

export const PRINCIPIOS_DRC: string[] = [
  'Vacinas inativadas, recombinantes e de subunidade: podem ser dadas em qualquer estágio da DRC, em diálise e em imunossupressão. Quanto mais cedo na doença, melhor a resposta.',
  'Vacinas de vírus vivo (tríplice viral, varicela, febre amarela e dengue): a DRC e a diálise, sozinhas, NÃO são contraindicação (SBIm). Na imunossupressão grave são contraindicadas; na moderada, a decisão é clínica e depende do risco epidemiológico (SBIm). Após o transplante, enquanto houver imunossupressão, não use.',
  'Vivas antes do transplante, em quem ainda não está imunossuprimido: a ABTO (2025) pede 30 dias entre a tríplice viral e o transplante e 3 semanas para varicela e febre amarela. Confirme o prazo com o centro transplantador.',
  'Resposta humoral é menor na DRC avançada e na diálise: dosar anticorpos quando existir marcador (hepatite B) e não adiar a vacinação à espera de “melhorar a resposta”.',
];

const LISTA: Vacina[] = [
  {
    id: 'covid', nome: 'COVID-19', busca: 'covid coronavirus sars-cov-2', confianca: 'media',
    comerciais: 'Comirnaty (Pfizer), Spikevax (Moderna)',
    resumoGeral: 'Seguir o esquema vigente do PNI.', resumoDrc: 'A SBIm não traz esquema próprio para DRC: seguir o PNI.',
    geral: [
      'Esquema e número de doses mudam com o tempo: seguir o informe vigente do PNI/Ministério da Saúde.',
      'O Calendário SBIm do Adulto 2026-27 também remete aos dados atualizados do PNI sobre os grupos contemplados.',
    ],
    drc: ['A seção de DRC da SBIm 2026-27 não traz esquema específico e remete aos grupos contemplados pelo PNI vigente.'],
    disponibilidade: 'SUS (UBS e CRIE), segundo a SBIm 2026-27.',
    atencao: 'Esquema detalhado (doses e intervalos por grupo) em pesquisa com a equipe.',
  },
  {
    id: 'dengue', nome: 'Dengue', vivo: true, busca: 'dengue qdenga butantan-dv', confianca: 'media',
    comerciais: 'Qdenga (Takeda), Butantan-DV (Instituto Butantan)',
    resumoGeral: 'Qdenga: 2 doses (0 e 3 meses), até 60 anos.', resumoDrc: 'Viva: contraindicada na imunossupressão grave.',
    geral: [
      'Qdenga: 2 doses com intervalo de 3 meses (0-3). Pode ser usada em adultos até 60 anos, independentemente de contato prévio com o vírus (SBIm).',
      'Butantan-DV: dose única, via subcutânea. Registro da Anvisa (dez/2025) para 12 a 59 anos.',
      'Vacinas de vírus vivo atenuado. A Qdenga é contraindicada em gestantes e lactantes (SBIm).',
    ],
    drc: [
      'É de vírus vivo atenuado: contraindicada na imunossupressão grave. Na moderada, a decisão é clínica (SBIm Pacientes Especiais).',
      'Na seção de DRC, a SBIm manda seguir o calendário por faixa etária; a DRC e a diálise, sozinhas, não aparecem como contraindicação.',
    ],
    disponibilidade: 'Qdenga: rede privada (SBIm 2026-27); no SUS, estratégia para 10 a 14 anos em localidades prioritárias (FAQ do Ministério da Saúde). Butantan-DV: licenciada para 12 a 59 anos; no SUS, recomendada para 15 a 59 anos, em estratégia por município iniciada em jan/2026 (Nota Técnica 5/2026 do PNI). A lista de municípios muda: confira o informe vigente.',
    atencao: 'Prazo da vacina antes do transplante e conduta em DRC avançada/diálise: sem fonte conferida, em pesquisa com a equipe.',
  },
  {
    id: 'dtpa', nome: 'dTpa / dT (tétano, difteria e coqueluche)', busca: 'tetano difteria coqueluche dtpa dt polio vip', confianca: 'alta',
    comerciais: 'Boostrix (GSK), Adacel (Sanofi)',
    resumoGeral: 'dTpa a cada 10 anos.', resumoDrc: 'Sem particularidade na DRC.',
    geral: [
      'Esquema completo: reforço com dTpa a cada 10 anos.',
      'Esquema incompleto: 1 dTpa e completar com dT até 3 doses com componente tetânico.',
      'Não vacinado ou histórico desconhecido: 1 dTpa + 2 dT (0, 2 e 4–8 meses).',
      'A dTpa exige intervalo mínimo de 4 semanas da última dT ou TT.',
      'Quem viaja para país com poliomielite endêmica pode usar a dTpa-VIP no lugar da dTpa (rede privada).',
    ],
    drc: ['Sem recomendação específica para DRC: segue o calendário do adulto. Inativada, pode ser dada em qualquer fase.'],
    disponibilidade: 'SUS: dT; dTpa para gestantes, puérperas e profissionais de saúde. Rede privada: dTpa e dTpa-VIP.',
  },
  {
    id: 'febreAmarela', nome: 'Febre amarela', vivo: true, busca: 'febre amarela', confianca: 'media',
    comerciais: 'Vacina 17DD (Bio-Manguinhos), Stamaril (Sanofi)',
    resumoGeral: 'SBIm: 2 doses; PNI: dose única.', resumoDrc: 'Viva: só em quem não está imunossuprimido.',
    geral: [
      'SBIm: 2 doses, a segunda 10 anos após a primeira (há possibilidade de falha vacinal).',
      'PNI: dose única se a primeira foi dada a partir dos 5 anos; quem recebeu antes dos 5 anos faz uma segunda dose.',
      'Se exigida para o certificado internacional (CIVP), aplicar até 10 dias antes da viagem.',
      'Contraindicada em nutrizes até o bebê completar 6 meses, salvo suspensão do aleitamento por 10 dias.',
      'O “reforço vitalício em áreas de risco” não consta nas fontes consultadas.',
    ],
    drc: [
      'DRC e diálise sem imunossupressão: não é contraindicação. Contraindicada em imunossuprimidos.',
      'Candidato a transplante ainda sem imunossupressão: a ABTO (2025) pede 3 semanas entre a vacina e o transplante.',
    ],
    disponibilidade: 'SUS e rede privada.',
    atencao: 'As fontes divergem (SBIm × PNI) sobre uma ou duas doses.',
  },
  {
    id: 'hepatiteA', nome: 'Hepatite A', busca: 'hepatite a havrix twinrix', confianca: 'media',
    comerciais: 'Havrix (GSK); combinada A+B: Twinrix (GSK)',
    resumoGeral: '2 doses (0 e 6 meses).', resumoDrc: 'Sem particularidade na DRC.',
    geral: [
      '2 doses (0 e 6 meses).',
      'A vacina combinada A+B (3 doses: 0, 1 e 6 meses) pode substituir as vacinas isoladas.',
    ],
    drc: ['A seção de DRC da SBIm manda seguir o calendário por faixa etária; não há indicação específica pela DRC nas fontes consultadas.'],
    disponibilidade: 'Rede privada (não consta no PNI para o adulto, segundo a SBIm 2026-27).',
  },
  {
    id: 'hepatiteB', nome: 'Hepatite B', busca: 'hepatite b hbv anti-hbs engerix recombivax heplisav twinrix', confianca: 'media',
    comerciais: 'Engerix-B (GSK); combinada A+B: Twinrix (GSK)',
    resumoGeral: '3 doses (0, 1 e 6 meses).', resumoDrc: 'Dose dobrada e 4 doses na hemodiálise; dosar anti-HBs.',
    geral: ['3 doses: 0, 1 e 6 meses.', 'A vacina combinada A+B (3 doses: 0, 1 e 6 meses) pode substituir as vacinas isoladas.'],
    drc: [
      'Pré-dialítica e hemodiálise: esquema de 4 doses (0, 1, 2 e 6 meses) com o DOBRO do volume (40 mcg); disponível nos CRIE.',
      'Dosar o anti-HBs 1 a 2 meses após a última dose. Imune se ≥ 10 mUI/mL.',
      'Se o anti-HBs vier negativo (< 10 mUI/mL), repetir o esquema de 4 doses uma única vez (SBIm 2026-27).',
    ],
    porGrupo: {
      naoDialitica: ['Vacinar cedo: a resposta cai com a progressão da doença. Mesmo esquema de 4 doses.'],
      dialise: ['Repetir o anti-HBs todo ano; se < 10 mUI/mL, fazer dose de reforço.'],
    },
    disponibilidade: 'SUS; dose dobrada para renais crônicos e dialíticos nos CRIE.',
  },
  {
    id: 'zoster', nome: 'Herpes-zóster (recombinante)', busca: 'zoster cobreiro shingrix herpes', confianca: 'media',
    comerciais: 'Shingrix (GSK)',
    resumoGeral: '≥ 50 anos: 2 doses (0 e 2 meses).', resumoDrc: 'Indicada na DRC; melhor antes da imunossupressão.',
    geral: [
      'A partir de 50 anos: vacina inativada recombinante, 2 doses com intervalo de 2 meses (0-2). Recomendada também em imunossuprimidos.',
      'Vale mesmo para quem já teve zóster (aguardar 6 meses ou a resolução do quadro) e para quem já recebeu a vacina atenuada (intervalo mínimo de 2 meses).',
    ],
    drc: [
      'SBIm: considerar a partir dos 18 anos na DRC. Não é fornecida na UBS/CRIE.',
    ],
    disponibilidade: 'Rede privada (não consta no PNI, segundo a SBIm 2026-27).',
    atencao: 'O intervalo entre as doses diverge: SBIm 0 e 2 meses; ABTO (transplante, out/2025) 3 meses entre as doses.',
  },
  {
    id: 'hpv', nome: 'HPV', busca: 'hpv papilomavirus gardasil', confianca: 'media',
    comerciais: 'Gardasil 9 (MSD)',
    resumoGeral: '≥ 20 anos não vacinados: HPV9, 3 doses.', resumoDrc: 'Imunossuprimido: 3 doses, de preferência antes.',
    geral: [
      'A partir de 20 anos, não vacinados: HPV9 em 3 doses (0, 1–2 e 6 meses).',
      'Licenciada até 45 anos; acima disso, decisão compartilhada com o médico.',
      'Contraindicada na gestação.',
    ],
    drc: [
      'DRC sem imunossupressão: segue o calendário por idade.',
      'Pré-transplante ou imunossuprimido: 3 doses, idealmente ≥ 14 dias antes da imunossupressão.',
    ],
    disponibilidade: 'SUS: HPV4 em 3 doses (0, 2 e 6 meses) para grupos específicos: imunossuprimidos de 9 a 45 anos, vítimas de violência sexual e usuários de PrEP de 15 a 45 anos, entre outros. HPV9 na rede privada.',
  },
  {
    id: 'influenza', nome: 'Influenza (gripe)', busca: 'gripe influenza trivalente alta dose efluelda', confianca: 'alta',
    comerciais: 'Vaxigrip, Influvac; alta dose: Efluelda (Sanofi)',
    resumoGeral: 'Dose única anual.', resumoDrc: 'Indicada todo ano em qualquer estágio da DRC.',
    geral: [
      'Dose única, todo ano.',
      'Adulto com fator de risco, quando a situação epidemiológica justificar: segunda dose a partir de 3 meses (SBIm).',
      'A partir de 60 anos: vacina trivalente de alta dose é preferida (SBIm).',
    ],
    drc: [
      'Indicada anualmente em todos os estágios da DRC, em diálise e no transplante.',
      'A partir de 60 anos, preferir a de alta dose quando disponível. No SUS (UBS/CRIE) costuma haver apenas a trivalente de dose padrão: use a que houver, sem adiar.',
    ],
    disponibilidade: 'SUS (campanha anual, trivalente, para grupos de risco); trivalente, quadrivalente e alta dose na rede privada.',
  },
  {
    id: 'menACWY', nome: 'Meningocócica ACWY', busca: 'meningococo meningite meningocócica acwy menveo nimenrix menc', confianca: 'media',
    comerciais: 'Menveo (GSK), Nimenrix (Pfizer)',
    resumoGeral: 'Dose única; reforço conforme a epidemiologia.', resumoDrc: 'Sem indicação própria pela DRC: seguir o calendário por idade.',
    geral: [
      'Dose única de vacina conjugada ACWY. A indicação e a necessidade de reforço dependem da situação epidemiológica.',
      'Se a ACWY não estiver disponível, substituir pela meningocócica C conjugada.',
    ],
    drc: ['A seção de DRC da SBIm manda seguir o calendário por faixa etária; a DRC, sozinha, não aparece como indicação específica.'],
    disponibilidade: 'Rede privada (não consta no PNI para o adulto, segundo a SBIm 2026-27).',
    atencao: 'Indicações de risco (asplenia, deficiência de complemento, transplante) e do CRIE: em pesquisa com a equipe.',
  },
  {
    id: 'menB', nome: 'Meningocócica B', busca: 'meningococo meningite meningocócica b bexsero trumenba', confianca: 'media',
    comerciais: 'Bexsero (GSK)',
    resumoGeral: '2 doses, intervalo mínimo de 1 mês.', resumoDrc: 'Sem indicação própria pela DRC: seguir o calendário por idade.',
    geral: [
      'Bexsero: 2 doses com intervalo mínimo de 1 mês. A indicação depende da situação epidemiológica.',
      'Licenciada até os 50 anos; acima disso, uso fora da bula (off label).',
      'Duração da proteção desconhecida: reforços não definidos.',
    ],
    drc: ['A seção de DRC da SBIm manda seguir o calendário por faixa etária; a DRC, sozinha, não aparece como indicação específica.'],
    disponibilidade: 'Rede privada (não consta no PNI, segundo a SBIm 2026-27).',
    atencao: 'Indicações de risco (asplenia, deficiência de complemento, transplante) e do CRIE: em pesquisa com a equipe.',
  },
  {
    id: 'pneumococo', nome: 'Pneumocócica', busca: 'pneumococo vpc20 vpc13 vpp23 prevenar', confianca: 'alta',
    comerciais: 'Prevenar 20 (Pfizer)',
    resumoGeral: 'VPC20 em dose única (≥ 50 anos ou fator de risco).', resumoDrc: 'DRC em qualquer estágio: esquema com VPC20.',
    geral: [
      'VPC20 em dose única: rotina a partir de 50 anos e em qualquer idade com condição de risco.',
      'Esquemas antigos (VPC13 + VPP23) foram simplificados com a VPC20.',
    ],
    drc: [
      'Nunca vacinado: VPC20 em dose única.',
      'Já recebeu VPP23: aguardar 1 ano e dar VPC20.',
      'Esquema incompleto de VPC13/15 ou VPP23: completar com VPC20 (2 meses após a última VPC13/15, ou 1 ano após a VPP23).',
      'Esquema completo (VPC13 + VPP23): uma dose de VPC20 a critério do médico.',
    ],
    disponibilidade: 'SBIm, calendário do adulto: nas UBS só para acamados, hospitalizados e institucionalizados; nos CRIE para pessoas com comorbidades. A tabela de DRC da SBIm marca UBS e CRIE. A ABTO (out/2025) ainda a descrevia só na rede privada. Confira a oferta local.',
  },
  {
    id: 'triplice', nome: 'Tríplice viral (sarampo, caxumba, rubéola)', vivo: true, busca: 'triplice viral sarampo caxumba rubeola mmr tetraviral', confianca: 'alta',
    comerciais: 'Priorix (GSK)',
    resumoGeral: '2 doses, intervalo mínimo de 1 mês.', resumoDrc: 'Viva: permitida na DRC sem imunossupressão.',
    geral: [
      'SBIm: 2 doses acima de 1 ano de idade, com intervalo mínimo de 1 mês. Terceira dose de rotina não é indicada em adulto com esquema completo, salvo risco epidemiológico.',
      'PNI: até 29 anos, 2 doses; de 30 a 59 anos, 1 dose.',
      'Em suscetíveis, a tetraviral (SCRV) pode ser considerada.',
    ],
    drc: [
      'DRC e diálise sem imunossupressão: não é contraindicação.',
      'Contraindicada em imunossuprimidos.',
      'Candidato a transplante ainda sem imunossupressão: a ABTO (2025) pede 30 dias entre a vacina e o transplante.',
    ],
    disponibilidade: 'SUS (conforme a faixa etária do PNI) e rede privada.',
  },
  {
    id: 'varicela', nome: 'Varicela', vivo: true, busca: 'varicela catapora varivax varilrix tetraviral', confianca: 'media',
    comerciais: 'Varilrix (GSK), Varivax (MSD)',
    resumoGeral: '2 doses (1 a 2 meses).', resumoDrc: 'Viva: permitida na DRC sem imunossupressão.',
    geral: [
      'Para suscetíveis: 2 doses com intervalo de 1 a 2 meses.',
      'A tetraviral (SCRV) pode ser considerada em suscetíveis.',
    ],
    drc: [
      'DRC e diálise sem imunossupressão: não é contraindicação. Contraindicada em imunossuprimidos.',
      'Candidato a transplante ainda sem imunossupressão: a ABTO (2025) pede 3 semanas entre a vacina e o transplante.',
    ],
    disponibilidade: 'Rede privada. CRIE: 2 doses com intervalo de 3 meses (SBIm 2026-27).',
  },
  {
    id: 'vsr', nome: 'VSR (vírus sincicial respiratório)', busca: 'vsr sincicial respiratorio arexvy abrysvo', confianca: 'media',
    comerciais: 'Arexvy (GSK), Abrysvo (Pfizer)',
    resumoGeral: 'Dose única; não é de rotina.', resumoDrc: 'Nefropatia: recomendada a partir dos 50 anos; 18 a 49 a critério médico.',
    geral: [
      'Dose única, intramuscular. Não é recomendada como rotina.',
      'A partir de 18 anos, para quem tem doença cardiovascular ou respiratória crônica relevante (SBIm adulto).',
      'Gestantes: somente a Abrysvo, a partir de 28 semanas, em cada gestação (24 a 27 semanas a critério médico).',
      'Não há dados que comprovem necessidade de doses adicionais.',
    ],
    drc: [
      'A partir dos 50 anos: recomendada na nefropatia, pelo risco de evolução grave ou descompensação. Prioridade para frágeis, acamados e residentes em instituições de longa permanência.',
      'De 18 a 49 anos: uso a critério médico.',
    ],
    disponibilidade: 'SUS só para gestantes; adultos em geral: rede privada (SBIm 2026-27).',
  },
];

/** Em ordem alfabética (sem acento, sem diferenciar maiúsculas). */
export const VACINAS: Vacina[] = [...LISTA].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));

/** Remove acentos e caixa para a busca. */
export const normalizarBusca = (t: string): string => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function buscarVacinas(lista: Vacina[], q: string): Vacina[] {
  const n = normalizarBusca(q);
  if (!n) return lista;
  return lista.filter((v) => normalizarBusca(`${v.nome} ${v.busca}`).includes(n));
}

/** Linhas de DRC que se aplicam ao grupo escolhido ('todos' mostra tudo, com o nome do grupo). */
export function linhasDrc(v: Vacina, grupo: GrupoDrc): string[] {
  const base = [...v.drc];
  const ordem: Exclude<GrupoDrc, 'todos'>[] = ['naoDialitica', 'dialise'];
  for (const g of ordem) {
    if (grupo !== 'todos' && grupo !== g) continue;
    const extra = v.porGrupo?.[g];
    if (!extra) continue;
    for (const l of extra) base.push(grupo === 'todos' ? `${ROTULO_GRUPO[g]}: ${l}` : l);
  }
  return base;
}
