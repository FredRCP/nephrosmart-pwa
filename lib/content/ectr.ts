// Intoxicações exógenas — QUANDO indicar depuração extracorpórea (ECTR) (Onda 8). Substitui o guia de 43 agentes do app original.
// Itens com certeza incompleta foram RETIRADOS (ver PESQUISAR_EQUIPE.md).
// Fonte principal: recomendações do grupo EXTRIP (extrip-workgroup.org e artigos de cada agente), citadas em `fonte`.
// Graduação do EXTRIP: "Recomendado" (1) · "Sugerido" (2) · "Neutro" (3). Quase toda a evidência é de qualidade muito baixa (D):
// as recomendações são de consenso de especialistas. Níveis séricos só aparecem onde o EXTRIP os definiu.
// HDI = hemodiálise intermitente · CKRT = terapia renal contínua · HP = hemoperfusão · MDAC = carvão ativado em múltiplas doses.
export type Grau = 'recomendado' | 'sugerido' | 'neutro';
export type Categoria = 'indicar' | 'nao-indicar';

export interface Criterio { grau: Grau; texto: string }
export interface Agente {
  id: string;
  nome: string;
  categoria: Categoria;
  busca: string;
  resumo: string;
  /** Critérios que justificam a depuração (categoria 'indicar'). */
  criterios?: Criterio[];
  /** Quando NÃO depurar / por que não. */
  contra?: string[];
  modalidade?: string;
  parar?: string;
  /** Antídoto e cuidados clínicos essenciais (breve). */
  antidoto?: string;
  nota?: string;
  fonte: string;
}

export const PRINCIPIOS_ECTR: { titulo: string; itens: string[] }[] = [
  {
    titulo: 'Quando pensar em depuração',
    itens: [
      'O tóxico é dialisável E há gravidade clínica ou nível sérico que a justifique, E a depuração acrescenta algo ao tratamento de suporte e ao antídoto.',
      'Nunca indicar pela dose ingerida isolada. Em geral a indicação nasce da clínica (coma, convulsão, choque, arritmia, acidose) mais o nível, quando o EXTRIP o definiu.',
      'Comece o suporte (via aérea, volume, antídoto, carvão quando indicado) sem esperar o resultado do nível; a depuração é uma etapa a mais, não a primeira.',
    ],
  },
  {
    titulo: 'O que torna um tóxico “dialisável”',
    itens: [
      'Peso molecular baixo: hemodiálise de baixo fluxo remove até ~1.000 Da; alto fluxo até ~11.000 Da; hemoperfusão remove bem até ~5–10 kDa; plasmaférese não tem limite de tamanho.',
      'Baixa ligação a proteínas: acima de ~80% costuma impedir a remoção. Exceções por saturação: salicilato e valproato em dose tóxica.',
      'Volume de distribuição pequeno (< 1–2 L/kg). Exceções importantes: carbamazepina, tálio e metformina.',
      'Clearance endógeno baixo (< 4 mL/kg/min) e meia-vida longa: quanto maior a meia-vida, mais a depuração acrescenta; meia-vida < ~2 h dificilmente muda o desfecho.',
      'Classificação de dialisabilidade (remoção em 6 h): > 30% dialisável; 10–30% moderada; 3–10% pobre; < 3% não dialisável.',
    ],
  },
  {
    titulo: 'Escolha da modalidade e da sessão',
    itens: [
      'Hemodiálise intermitente (HDI) é a preferida para quase todos os agentes dialisáveis, por ter o maior clearance. CKRT é alternativa quando não há HDI ou na instabilidade hemodinâmica.',
      'HDI: razão fluxo de dialisato:fluxo de sangue ≥ 2,5:1, cateter femoral > 20 cm e filtro de alta eficiência (KoA > 600).',
      'Anticoagulação sistêmica mínima ou nenhuma se houver risco de sangramento (isso vale em especial para o metanol).',
      'Rebote: dosar o nível ~6–12 h após a sessão (lítio e carbamazepina têm rebote).',
      'Antídotos e vitaminas (N-acetilcisteína, fomepizol, tiamina, piridoxina) podem ser removidos na sessão: mantenha ou ajuste a dose durante a ECTR.',
    ],
  },
];

export const AGENTES: Agente[] = [
  {
    id: 'litio', nome: 'Lítio', categoria: 'indicar', busca: 'litio carbonato de litio',
    resumo: 'Depurar se Li > 4,0 mEq/L com função renal reduzida, ou se houver rebaixamento, convulsão ou arritmia grave.',
    criterios: [
      { grau: 'recomendado', texto: 'Função renal reduzida E lítio > 4,0 mEq/L.' },
      { grau: 'recomendado', texto: 'Rebaixamento do nível de consciência, convulsões ou arritmia com risco de vida, qualquer que seja o nível.' },
      { grau: 'sugerido', texto: 'Lítio > 5,0 mEq/L.' },
      { grau: 'sugerido', texto: 'Confusão mental.' },
      { grau: 'sugerido', texto: 'Tempo esperado para o lítio cair a < 1,0 mEq/L maior que 36 h, mesmo com o melhor tratamento.' },
    ],
    modalidade: 'HDI preferida (CKRT aceitável se não houver HDI).',
    parar: 'Lítio < 1,0 mEq/L ou melhora clínica. Se não houver nível, no mínimo 6 h. Dosar o lítio 12 h depois (rebote).',
    fonte: 'EXTRIP, Decker et al., CJASN 2015;10:875.',
  },
  {
    id: 'salicilato', nome: 'Salicilato (AAS)', categoria: 'indicar', busca: 'salicilato aspirina aas acido acetilsalicilico',
    resumo: 'Depurar se nível > 100 mg/dL, alteração mental, hipoxemia nova ou falha do bicarbonato.',
    criterios: [
      { grau: 'recomendado', texto: 'Salicilato > 7,2 mmol/L (100 mg/dL).' },
      { grau: 'recomendado', texto: 'Salicilato > 6,5 mmol/L (90 mg/dL) com função renal reduzida.' },
      { grau: 'recomendado', texto: 'Alteração do estado mental.' },
      { grau: 'recomendado', texto: 'Hipoxemia nova com necessidade de oxigênio.' },
      { grau: 'recomendado', texto: 'Falha do tratamento padrão, incluindo bicarbonato.' },
      { grau: 'sugerido', texto: 'Salicilato > 6,5 mmol/L (90 mg/dL).' },
      { grau: 'sugerido', texto: 'Salicilato > 5,8 mmol/L (80 mg/dL) com função renal reduzida.' },
      { grau: 'sugerido', texto: 'pH ≤ 7,20.' },
    ],
    modalidade: 'HDI preferida. Manter bicarbonato IV entre as sessões.',
    parar: 'Melhora clínica E salicilato < 1,4 mmol/L (19 mg/dL). Sem nível: no mínimo 4–6 h.',
    fonte: 'EXTRIP, Juurlink et al., Ann Emerg Med 2015.',
  },
  {
    id: 'metanol', nome: 'Metanol', categoria: 'indicar', busca: 'metanol alcool metilico',
    resumo: 'Depurar se coma, convulsão, déficit visual novo, pH ≤ 7,15, gap aniônico > 24 ou nível alto.',
    criterios: [
      { grau: 'recomendado', texto: 'Coma, convulsões ou déficit visual novo.' },
      { grau: 'recomendado', texto: 'pH ≤ 7,15.' },
      { grau: 'recomendado', texto: 'Acidose metabólica persistente apesar do suporte e do antídoto.' },
      { grau: 'recomendado', texto: 'Gap aniônico > 24 mmol/L.' },
      { grau: 'recomendado', texto: 'Função renal reduzida.' },
      { grau: 'recomendado', texto: 'Metanol > 700 mg/L (70 mg/dL) com fomepizol; > 600 mg/L (60 mg/dL) com etanol; > 500 mg/L (50 mg/dL) sem bloqueio da álcool desidrogenase.' },
    ],
    modalidade: 'HDI preferida (CKRT aceitável se não houver HDI).',
    parar: 'Metanol < 200 mg/L (20 mg/dL) com melhora clínica.',
    antidoto: 'Fomepizol (ou etanol) e ácido fólico; manter durante a ECTR, pois são removidos. Evitar anticoagulação sistêmica.',
    fonte: 'EXTRIP, Roberts et al., Crit Care Med 2015;43:461.',
  },
  {
    id: 'valproato', nome: 'Valproato', categoria: 'indicar', busca: 'valproato acido valproico depakene divalproato',
    resumo: 'Depurar se nível ≥ 1.300 mg/L, edema cerebral ou choque (recomendado).',
    criterios: [
      { grau: 'recomendado', texto: 'Valproato ≥ 1.300 mg/L (9.000 µmol/L).' },
      { grau: 'recomendado', texto: 'Edema cerebral ou choque.' },
      { grau: 'sugerido', texto: 'Valproato ≥ 900 mg/L (6.250 µmol/L).' },
      { grau: 'sugerido', texto: 'Coma ou depressão respiratória com necessidade de ventilação.' },
      { grau: 'sugerido', texto: 'Hiperamonemia aguda (sem ponto de corte definido).' },
      { grau: 'sugerido', texto: 'pH ≤ 7,10.' },
    ],
    modalidade: 'HDI preferida (alternativas: HP, CKRT).',
    parar: 'Melhora clínica ou nível entre 50 e 100 mg/L.',
    fonte: 'EXTRIP, Ghannoum et al., Clin Toxicol 2015;53:454.',
  },
  {
    id: 'carbamazepina', nome: 'Carbamazepina', categoria: 'indicar', busca: 'carbamazepina tegretol',
    resumo: 'Depurar se convulsões refratárias ou arritmia com risco de vida; não há ponto de corte sérico no EXTRIP.',
    criterios: [
      { grau: 'recomendado', texto: 'Convulsões múltiplas e refratárias ao tratamento.' },
      { grau: 'recomendado', texto: 'Arritmia com risco de vida.' },
      { grau: 'sugerido', texto: 'Coma prolongado ou depressão respiratória com necessidade de ventilação.' },
      { grau: 'sugerido', texto: 'Toxicidade significativa e persistente apesar do carvão em múltiplas doses.' },
    ],
    modalidade: 'HDI preferida. Manter carvão ativado em múltiplas doses.',
    parar: 'Melhora clínica ou nível < 10 mg/L. Rebote em cerca de 1/3 dos casos: monitorizar.',
    nota: 'O EXTRIP não definiu nível sérico como critério isolado.',
    fonte: 'EXTRIP, Clin Toxicol 2014;52:993.',
  },
  {
    id: 'fenobarbital', nome: 'Fenobarbital e barbitúricos de ação longa', categoria: 'indicar', busca: 'fenobarbital barbiturico gardenal',
    resumo: 'Depurar se coma prolongado, choque persistente ou toxicidade apesar do carvão; não pelo nível isolado.',
    criterios: [
      { grau: 'recomendado', texto: 'Coma prolongado (presente ou esperado).' },
      { grau: 'recomendado', texto: 'Choque persistente apesar de volume.' },
      { grau: 'recomendado', texto: 'Toxicidade persistente apesar do carvão em múltiplas doses.' },
      { grau: 'sugerido', texto: 'Nível crescente ou mantido apesar do carvão em múltiplas doses.' },
      { grau: 'sugerido', texto: 'Depressão respiratória com necessidade de ventilação.' },
    ],
    modalidade: 'HDI preferida.',
    parar: 'Melhora clínica.',
    nota: 'Não indicar só pela dose ou pelo nível.',
    fonte: 'EXTRIP, Mactier et al., AJKD 2014;64:347.',
  },
  {
    id: 'metformina', nome: 'Metformina (acidose láctica)', categoria: 'indicar', busca: 'metformina biguanida lactato acidose latica',
    resumo: 'Depurar se lactato > 20 mmol/L, pH ≤ 7,0 ou falha do suporte.',
    criterios: [
      { grau: 'recomendado', texto: 'Lactato > 20 mmol/L.' },
      { grau: 'recomendado', texto: 'pH ≤ 7,0.' },
      { grau: 'recomendado', texto: 'Falha das medidas de suporte.' },
      { grau: 'sugerido', texto: 'Lactato > 15 mmol/L ou pH ≤ 7,1.' },
      { grau: 'sugerido', texto: 'Choque e função renal reduzida baixam o limiar de indicação.' },
    ],
    modalidade: 'HDI com tampão de bicarbonato preferida.',
    parar: 'Lactato < 3 mmol/L e pH > 7,35.',
    fonte: 'EXTRIP, Calello et al., Crit Care Med 2015;43:1716.',
  },
  {
    id: 'teofilina', nome: 'Teofilina', categoria: 'indicar', busca: 'teofilina aminofilina xantina',
    resumo: 'Depurar na intoxicação aguda se > 100 mg/L ou com convulsão, arritmia ou choque.',
    criterios: [
      { grau: 'recomendado', texto: 'Intoxicação aguda com teofilina > 100 mg/L (555 µmol/L).' },
      { grau: 'recomendado', texto: 'Convulsões, arritmia com risco de vida ou choque.' },
      { grau: 'recomendado', texto: 'Nível crescente ou piora clínica apesar do tratamento.' },
      { grau: 'sugerido', texto: 'Intoxicação crônica com teofilina > 60 mg/L (333 µmol/L), ou > 50 mg/L se < 6 meses ou > 60 anos.' },
    ],
    modalidade: 'HDI preferida. Manter carvão ativado em múltiplas doses.',
    parar: 'Melhora clínica ou nível < 15 mg/L.',
    fonte: 'EXTRIP, Ghannoum et al., Clin Toxicol 2015;53:215.',
  },
  {
    id: 'fenitoina', nome: 'Fenitoína', categoria: 'indicar', busca: 'fenitoina hidantal',
    resumo: 'Raramente: apenas coma prolongado. Não depurar pela dose ou pelo nível.',
    criterios: [
      { grau: 'sugerido', texto: 'Coma prolongado.' },
      { grau: 'neutro', texto: 'Ataxia incapacitante prolongada (sem posição a favor ou contra).' },
    ],
    contra: ['Não depurar por suspeita de dose alta ou por nível isolado.'],
    modalidade: 'HDI preferida; hemoperfusão aceitável. CKRT, diálise peritoneal e exsanguineotransfusão são ineficazes.',
    fonte: 'EXTRIP, Anseeuw et al., AJKD 2016.',
  },
  {
    id: 'paracetamol', nome: 'Paracetamol', categoria: 'indicar', busca: 'paracetamol acetaminofeno nac acetilcisteina',
    resumo: 'Raro: nível muito alto sem NAC, ou alteração mental com acidose e lactato alto.',
    criterios: [
      { grau: 'recomendado', texto: 'Paracetamol > 1.000 mg/L (6.620 µmol/L) quando a N-acetilcisteína (NAC) não está disponível.' },
      { grau: 'recomendado', texto: 'Alteração mental com acidose e lactato elevado: > 700 mg/L (4.630 µmol/L) sem NAC, ou > 900 mg/L (5.960 µmol/L) mesmo com NAC.' },
    ],
    contra: ['Não depurar pela dose ingerida isolada. O critério clássico “INR > 3 / falência hepática” não é do EXTRIP.'],
    modalidade: 'HDI preferida.',
    antidoto: 'NAC é dialisável: manter e aumentar a taxa de infusão durante a ECTR.',
    fonte: 'EXTRIP, Gosselin et al., Clin Toxicol 2014.',
  },
  {
    id: 'betabloqueadores', nome: 'Betabloqueadores', categoria: 'indicar', busca: 'betabloqueador atenolol sotalol metoprolol propranolol carvedilol bisoprolol',
    resumo: 'Só atenolol e sotalol, com função renal reduzida e bradicardia/hipotensão refratárias. Propranolol: não.',
    criterios: [
      { grau: 'sugerido', texto: 'Atenolol ou sotalol com função renal reduzida e bradicardia ou hipotensão refratárias (sotalol: também torsades recorrente).' },
    ],
    contra: [
      'Propranolol: o EXTRIP recomenda NÃO depurar.',
      'Pouco dialisáveis: metoprolol e talinolol. Moderadamente: acebutolol e bisoprolol.',
      'Não dialisáveis: betaxolol, carvedilol, labetalol e timolol.',
    ],
    modalidade: 'HDI preferida.',
    fonte: 'EXTRIP, Crit Care 2021;25:201.',
  },
  {
    id: 'triciclicos', nome: 'Antidepressivos tricíclicos', categoria: 'nao-indicar', busca: 'triciclico amitriptilina nortriptilina imipramina',
    resumo: 'Não depurar: grande volume de distribuição e alta ligação proteica.',
    contra: ['O EXTRIP recomenda não realizar ECTR (1D).'],
    fonte: 'EXTRIP, Yates et al., 2014.',
  },
  {
    id: 'bcc', nome: 'Bloqueadores de canal de cálcio (amlodipina, diltiazem, verapamil)', categoria: 'nao-indicar', busca: 'bloqueador canal calcio amlodipina diltiazem verapamil nifedipina',
    resumo: 'Não depurar: alto volume de distribuição e ligação proteica.',
    contra: ['O EXTRIP recomenda não realizar ECTR para amlodipina, diltiazem e verapamil (1D); para os demais a evidência é insuficiente.'],
    fonte: 'EXTRIP, Wong et al., 2021.',
  },
  {
    id: 'cloroquina', nome: 'Cloroquina e quinina', categoria: 'nao-indicar', busca: 'cloroquina quinina hidroxicloroquina antimalarico',
    resumo: 'Não depurar; a hidroxicloroquina também não é dialisável.',
    contra: ['O EXTRIP recomenda fortemente não realizar ECTR para cloroquina e quinina.', 'A hidroxicloroquina não é dialisável.'],
    fonte: 'EXTRIP, Berling et al., JASN 2020.',
  },
  {
    id: 'metotrexato', nome: 'Metotrexato', categoria: 'nao-indicar', busca: 'metotrexato mtx glucarpidase',
    resumo: 'Não depurar sem glucarpidase; com glucarpidase, não depurar.',
    contra: ['Sem glucarpidase: o EXTRIP sugere não realizar ECTR.', 'Com glucarpidase: recomenda não realizar.'],
    fonte: 'EXTRIP, Ghannoum et al., CJASN 2022.',
  },
  {
    id: 'baclofeno', nome: 'Baclofeno', categoria: 'nao-indicar', busca: 'baclofeno',
    resumo: 'Superdose aguda: não depurar. Dose terapêutica com função renal reduzida e coma: pode.',
    contra: ['Superdose aguda grave: o EXTRIP sugere NÃO realizar ECTR além do tratamento padrão.'],
    criterios: [{ grau: 'sugerido', texto: 'Toxicidade com dose terapêutica em função renal reduzida, sobretudo com coma e ventilação mecânica.' }],
    modalidade: 'HDI preferida (quando indicada).',
    fonte: 'EXTRIP, Kidney Int 2021.',
  },
  {
    id: 'gabapentinoides', nome: 'Gabapentina e pregabalina', categoria: 'nao-indicar', busca: 'gabapentina pregabalina gabapentinoide',
    resumo: 'Função renal normal: não depurar. Função reduzida com coma e ventilação: considerar.',
    contra: ['Com função renal normal, o EXTRIP sugere NÃO realizar ECTR.'],
    criterios: [{ grau: 'sugerido', texto: 'Função renal reduzida, com coma e ventilação mecânica.' }],
    fonte: 'EXTRIP, AJKD.',
  },
  {
    id: 'isoniazida', nome: 'Isoniazida', categoria: 'nao-indicar', busca: 'isoniazida inh piridoxina',
    resumo: 'Com piridoxina disponível, não depurar. Sem ela, só se convulsão refratária.',
    contra: [
      'Com piridoxina disponível: o EXTRIP sugere NÃO realizar ECTR.',
      'Sem piridoxina: sugere apenas se convulsões refratárias aos moduladores GABA-A.',
      'Não decidir pelo nível; acidose não é indicação.',
    ],
    antidoto: 'Piridoxina 1 g para cada 1 g de isoniazida ingerida, ou 5 g no adulto se a quantidade for desconhecida.',
    fonte: 'EXTRIP, Pharmacotherapy 2021.',
  },
];

export const ROTULO_CATEGORIA: Record<Categoria, string> = {
  indicar: 'Considerar depuração',
  'nao-indicar': 'Em geral não depurar',
};
export const ROTULO_GRAU: Record<Grau, string> = { recomendado: 'Recomendado', sugerido: 'Sugerido', neutro: 'Neutro' };

const normalizar = (t: string): string => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function buscarAgentes(lista: Agente[], q: string, categoria: Categoria | 'todas'): Agente[] {
  const n = normalizar(q);
  return lista.filter((a) => (categoria === 'todas' || a.categoria === categoria) && (!n || normalizar(`${a.nome} ${a.busca}`).includes(n)));
}
