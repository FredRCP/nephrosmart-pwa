// Estratégia de produto (decisão em conversa com o Dr. Fred): foco em NEFROLOGIA, atendendo intensivista e clínico
// naquilo que eles precisam "de rim". Ferramentas gerais de medicina ficam fora por ora.
//   nucleo     = identidade do app; migrar primeiro
//   adjacente  = útil e coerente; migrar depois
//   fora       = não migrar agora (reavaliar com os dados de uso)
export type Nivel = 'nucleo' | 'adjacente' | 'fora';

export const NIVEL: Record<string, Nivel> = {
  // Função renal e dose
  'ajuste-de-dose': 'nucleo', 'ckd-epi-2021': 'nucleo', 'ckd-epi-creat-cistatina-c': 'nucleo', 'clearance-de-creatinina-ped': 'nucleo',
  'cockcroft-gault': 'nucleo', 'funcao-renal-esperada-p-idade': 'nucleo', 'injuria-renal-aguda-ira': 'nucleo',
  'conversor-de-unidades-laboratoriais': 'nucleo', 'depuracao-de-creatinina-24h': 'nucleo', 'estadiamento-da-drc-kdigo': 'nucleo', 'equivalencia-de-diureticos': 'nucleo',
  // Ácido-base
  'disturbios-acido-base': 'nucleo', 'anion-gap': 'nucleo', 'gasometria-arterial': 'nucleo', 'osmolaridade-serica': 'nucleo',
  'reposicao-de-bicarbonato': 'nucleo',
  // Eletrólitos
  'correcao-do-calcio-ca2': 'nucleo', 'correcao-do-magnesio-mg2': 'nucleo', 'correcao-de-hipernatremia-na': 'nucleo', 'correcao-de-hiponatremia-na': 'nucleo',
  'f-e-de-acido-urico': 'nucleo', 'fracao-de-excrecao-de-calcio': 'nucleo', 'fracao-de-excrecao-de-fosforo': 'nucleo', 'fracao-de-excrecao-de-magnesio': 'nucleo',
  'fracao-de-excrecao-de-potassio': 'nucleo', 'fracao-de-excrecao-de-sodio': 'nucleo', 'fracao-de-excrecao-de-ureia': 'nucleo', 'gradiente-transtubular-de-k': 'fora',
  'hipercalcemia-calcio': 'nucleo', 'hipercalemia-potassio': 'nucleo', 'hiperfosfatemia-fosforo': 'nucleo', 'hipermagnesemia-magnesio': 'nucleo',
  'hipernatremia-sodio': 'nucleo', 'hipocalcemia-calcio': 'nucleo', 'hipocalemia-potassio': 'nucleo', 'hipofosfatemia-fosforo': 'nucleo',
  'hipomagnesemia-magnesio': 'nucleo', 'hiponatremia-sodio': 'nucleo', 'hiponatremia-fluxograma-na': 'nucleo',
  // Hemodiálise e anemia/DMO
  'kt-v-hemodialise': 'nucleo', 'heparina-na-hemodialise': 'nucleo', 'intoxicacoes-exogenas': 'nucleo', 'reposicao-de-ferro': 'nucleo',
  'eritropoetina': 'nucleo', 'paricalcitol': 'nucleo',
  // Adjacentes
  'imc': 'adjacente', 'agua-corporal-total': 'adjacente', 'ingestao-diaria-de-sodio': 'adjacente', 'ist': 'adjacente', 'vacinas-drc': 'adjacente',
  'rein-score': 'adjacente', 'kdpi-epts': 'adjacente', 'nefrolitiase': 'adjacente', 'risco-de-progressao-de-drc': 'adjacente', 'risco-cardiovascular': 'adjacente',
  'glomerulopatia-por-iga': 'adjacente', 'drpad': 'adjacente', 'escore-brescia-cimino-doqi': 'adjacente', 'conversor-entre-corticoides': 'adjacente',
  'desmame-de-corticoides': 'adjacente', 'sofa': 'adjacente', 'qsofa': 'adjacente',
  // Fora por ora (medicina geral ou de alto risco de dose fora da nefrologia)
  'cid-10': 'fora', 'escala-de-coma-de-glasgow': 'fora', 'escala-de-avc-nihss': 'fora', 'escore-de-wells': 'fora', 'escore-de-tromboprofilaxia': 'fora',
  'vacinas-adultos': 'fora', 'sequencia-rapida-de-intubacao': 'fora', 'conversor-de-dose': 'fora', 'drogas-e-infusoes': 'fora', 'classificacao-de-fraturas': 'fora',
};

/** Ordem sugerida de migração (as já migradas ficam de fora). Ondas curtas, com revisão clínica entre elas. */
export const ONDAS: { titulo: string; slugs: string[] }[] = [
  { titulo: 'Onda 3 — potássio, cálcio, magnésio e fósforo', slugs: [
    'hipocalemia-potassio', 'hipocalcemia-calcio', 'hipercalcemia-calcio', 'correcao-do-calcio-ca2', 'hipomagnesemia-magnesio', 'hipermagnesemia-magnesio',
    'correcao-do-magnesio-mg2', 'hipofosfatemia-fosforo', 'hiperfosfatemia-fosforo', ] },
  { titulo: 'Onda 4 — hemodiálise, anemia e DMO', slugs: [
    'kt-v-hemodialise', 'heparina-na-hemodialise', 'intoxicacoes-exogenas', 'reposicao-de-ferro', 'eritropoetina', 'paricalcitol' ] },
  { titulo: 'Onda 5 — Ajuste de Dose (premium; depende das suas respostas em DIVERGENCIAS.md)', slugs: ['ajuste-de-dose'] },
  { titulo: 'Onda 6 — adjacentes', slugs: [
    'agua-corporal-total', 'ist', 'conversor-entre-corticoides', 'desmame-de-corticoides', 'vacinas-drc', 'nefrolitiase',
    'rein-score', 'kdpi-epts', 'risco-de-progressao-de-drc', 'risco-cardiovascular', 'glomerulopatia-por-iga', 'drpad', 'escore-brescia-cimino-doqi', 'sofa', 'qsofa' ] },
];
