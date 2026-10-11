// Vacinas do adulto — com e sem DRC (Onda 8). Substitui as duas telas do app original (calendário geral e DRC).
// Conteúdo reescrito a partir de: SBIm Calendário do Adulto 2026-27, SBIm Pacientes Especiais 2026-27 (pp. 12-13),
// Guia SBIm/ABTO de transplante 2025-26, Manual dos CRIE 2023-24, CDC Adult Schedule 2026.
// Itens com certeza incompleta foram RETIRADOS (ver PESQUISAR_EQUIPE.md). NÃO verificados nesta revisão (conferir antes de decidir): Manual CRIE vigente, calendário do PNI adulto no gov.br,
// texto da KDIGO 2024 e da AST 2019. Itens de baixa confiança estão marcados em `confianca`.
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
  'Vacinas de vírus vivo (tríplice viral, varicela e febre amarela): a DRC e a diálise, sozinhas, NÃO são contraindicação (SBIm). São contraindicadas na imunossupressão e após o transplante enquanto houver imunossupressão.',
  'Resposta humoral é menor na DRC avançada e na diálise: dosar anticorpos quando existir marcador (hepatite B) e não adiar a vacinação à espera de “melhorar a resposta”.',
];

export const VACINAS: Vacina[] = [
  {
    id: 'influenza', nome: 'Influenza (gripe)', busca: 'gripe influenza trivalente alta dose', confianca: 'alta',
    resumoGeral: 'Dose única anual.', resumoDrc: 'Indicada todo ano em qualquer estágio da DRC.',
    geral: [
      'Dose única, todo ano.',
      'A partir de 60 anos: vacina trivalente de alta dose é preferida (SBIm).',
    ],
    drc: [
      'Indicada anualmente em todos os estágios da DRC, em diálise e no transplante.',
      'A partir de 60 anos, preferir a de alta dose quando disponível. No SUS (UBS/CRIE) costuma haver apenas a trivalente de dose padrão: use a que houver, sem adiar.',
    ],
    disponibilidade: 'SUS (campanha anual); alta dose na rede privada.',
  },
  {
    id: 'pneumococo', nome: 'Pneumocócica', busca: 'pneumococo vpc20 vpc13 vpp23 prevenar', confianca: 'alta',
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
  },
  {
    id: 'hepatiteB', nome: 'Hepatite B', busca: 'hepatite b hbv anti-hbs engerix recombivax heplisav', confianca: 'media',
    resumoGeral: '3 doses (0, 1 e 6 meses).', resumoDrc: 'Dose dobrada e 4 doses na hemodiálise; dosar anti-HBs.',
    geral: ['3 doses: 0, 1 e 6 meses.'],
    drc: [
      'Pré-dialítica e hemodiálise: esquema de 4 doses (0, 1, 2 e 6 meses) com o DOBRO do volume (40 mcg); disponível nos CRIE.',
      'Dosar o anti-HBs 1 a 2 meses após a última dose. Imune se ≥ 10 mUI/mL.',
    ],
    porGrupo: {
      naoDialitica: ['Vacinar cedo: a resposta cai com a progressão da doença. Mesmo esquema de 4 doses.'],
      dialise: ['Repetir o anti-HBs todo ano; se < 10 mUI/mL, fazer dose de reforço.'],
    },
    disponibilidade: 'SUS/CRIE (dose dobrada para renais crônicos e dialíticos).',
  },
  {
    id: 'zoster', nome: 'Herpes-zóster (recombinante)', busca: 'zoster cobreiro shingrix herpes', confianca: 'media',
    resumoGeral: '≥ 50 anos: 2 doses (0 e 2 meses).', resumoDrc: 'Indicada na DRC; melhor antes da imunossupressão.',
    geral: ['A partir de 50 anos: 2 doses (0 e 2 meses). Recomendada também em imunossuprimidos.'],
    drc: [
      'SBIm: considerar a partir dos 18 anos na DRC. Não é fornecida na UBS/CRIE.',
    ],
    disponibilidade: 'Rede privada.',
  },
  {
    id: 'dtpa', nome: 'dT / dTpa (tétano, difteria e coqueluche)', busca: 'tetano difteria coqueluche dtpa dt', confianca: 'alta',
    resumoGeral: 'dTpa a cada 10 anos.', resumoDrc: 'Sem particularidade na DRC.',
    geral: [
      'Reforço com dTpa a cada 10 anos.',
      'Esquema incompleto ou desconhecido: 1 dTpa + 2 dT (0, 2 e 4–8 meses).',
    ],
    drc: ['Sem recomendação específica para DRC: segue o calendário do adulto. Inativada, pode ser dada em qualquer fase.'],
    disponibilidade: 'SUS: dT; dTpa para gestantes, puérperas e profissionais de saúde. Rede privada: dTpa.',
  },
  {
    id: 'hpv', nome: 'HPV', busca: 'hpv papilomavirus gardasil', confianca: 'media',
    resumoGeral: '≥ 20 anos não vacinados: HPV9, 3 doses.', resumoDrc: 'Imunossuprimido: 3 doses, de preferência antes.',
    geral: [
      'A partir de 20 anos, não vacinados: HPV9 em 3 doses (0, 1–2 e 6 meses).',
      'Acima de 45 anos: decisão compartilhada.',
    ],
    drc: [
      'DRC sem imunossupressão: segue o calendário por idade.',
      'Pré-transplante ou imunossuprimido: 3 doses, idealmente ≥ 14 dias antes da imunossupressão.',
    ],
    disponibilidade: 'SUS: HPV4 para imunossuprimidos de 9 a 45 anos, 3 doses (0, 2 e 6 meses). HPV9 na rede privada.',
  },
  {
    id: 'hepatiteA', nome: 'Hepatite A', busca: 'hepatite a havrix', confianca: 'media',
    resumoGeral: '2 doses (0 e 6 meses).', resumoDrc: 'Sem particularidade na DRC.',
    geral: ['2 doses (0 e 6 meses).'],
    drc: ['Sem recomendação específica para DRC nas fontes consultadas: segue o calendário do adulto.'],
    disponibilidade: 'Rede privada.',
  },
  {
    id: 'triplice', nome: 'Tríplice viral (sarampo, caxumba, rubéola)', vivo: true, busca: 'triplice viral sarampo caxumba rubeola mmr', confianca: 'alta',
    resumoGeral: '2 doses (SBIm).', resumoDrc: 'Viva: permitida na DRC sem imunossupressão.',
    geral: ['SBIm: 2 doses. PNI: até 29 anos, 2 doses; de 30 a 59 anos, 1 dose.'],
    drc: [
      'DRC e diálise sem imunossupressão: não é contraindicação.',
      'Contraindicada em imunossuprimidos.',
    ],
    disponibilidade: 'SUS.',
  },
  {
    id: 'varicela', nome: 'Varicela', vivo: true, busca: 'varicela catapora', confianca: 'media',
    resumoGeral: '2 doses (1 a 2 meses).', resumoDrc: 'Viva: permitida na DRC sem imunossupressão.',
    geral: ['2 doses com intervalo de 1 a 2 meses. Rede privada.'],
    drc: ['DRC e diálise sem imunossupressão: não é contraindicação. Contraindicada em imunossuprimidos.'],
    disponibilidade: 'Rede privada; CRIE para indicações específicas.',
  },
  {
    id: 'febreAmarela', nome: 'Febre amarela', vivo: true, busca: 'febre amarela', confianca: 'media',
    resumoGeral: 'SBIm: 2 doses; PNI: dose única.', resumoDrc: 'Viva: só em quem não está imunossuprimido.',
    geral: [
      'SBIm: 2 doses (a 2ª, 10 anos após a 1ª). PNI: dose única se a primeira foi dada a partir dos 5 anos.',
      'O “reforço vitalício em áreas de risco” não consta nas fontes consultadas.',
    ],
    drc: ['DRC e diálise sem imunossupressão: não é contraindicação. Contraindicada em imunossuprimidos.'],
    disponibilidade: 'SUS.',
    atencao: 'As fontes divergem (SBIm × PNI) sobre uma ou duas doses.',
  },
];

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
