// Frações de excreção (Onda 2): FENa, FEUr, FEK, FECa, FEP, FEUA e FEMg. Funções puras; a tela só chama e exibe.
// Fórmula geral: FE(%) = (U_soluto × Cr_sérica) / (S_soluto × Cr_urinária) × 100.
// Exceção: no magnésio o Mg sérico é dividido por 0,7 (só ~70% é ultrafiltrável). O app original MULTIPLICAVA (erro).
// Pontos de corte e fontes: DIVERGENCIAS_ONDA2.md. O TTKG foi retirado (decisão do Fred).
import { FAIXAS, dentroDaFaixa } from './faixas';

export type TipoFE = 'sodio' | 'ureia' | 'potassio' | 'calcio' | 'fosforo' | 'acido-urico' | 'magnesio';
export type ContextoK = 'hipocalemia' | 'hipercalemia';
export type ClasseFE = 'baixa' | 'intermediaria' | 'alta' | 'sem-corte';

export interface ConfigFE {
  tipo: TipoFE;
  sigla: string;
  nome: string;
  /** Unidade do soluto (urina e soro na MESMA unidade). */
  unidade: string;
  /** Fator aplicado ao soluto sérico (0,7 no magnésio; 1 nos demais). */
  fatorSoro: number;
  /** Cortes [inferior, superior] em %: abaixo do 1º = baixa; até o 2º (inclusive) = intermediária; acima = alta. */
  cortes: [number, number] | null;
  /** Chave do localStorage (mantida igual à do app original). */
  chave: string;
  /** Texto da janela de informações. */
  formula: string;
  referenciaTexto: string[];
  usos: string[];
  limites: string[];
  fontes: string[];
  textoBaixa: string;
  textoIntermediaria: string;
  textoAlta: string;
}

const GERAL = 'FE (%) = (U_soluto × Cr_sérica) / (S_soluto × Cr_urinária) × 100';

export const CONFIG_FE: Record<TipoFE, ConfigFE> = {
  sodio: {
    tipo: 'sodio', sigla: 'FENa', nome: 'Fração de excreção de sódio', unidade: 'mEq/L', fatorSoro: 1, cortes: [1, 2], chave: 'ultimaFENa',
    formula: `${GERAL}\nSoluto = sódio (mesma unidade na urina e no soro; creatinina em mg/dL).`,
    referenciaTexto: ['< 1%: sugere azotemia pré-renal.', '1–2%: faixa indeterminada.', '> 2%: sugere lesão tubular (NTA).'],
    usos: ['Diferenciar IRA pré-renal de necrose tubular aguda em paciente com oligúria.'],
    limites: [
      'Diuréticos AUMENTAM a FENa (a tornam falsamente alta): nesse caso prefira a FEUr.',
      'Pode ser < 1% apesar de lesão tubular em contraste, rabdomiólise, glomerulonefrite aguda e sepse inicial.',
      'Pode ser > 1% em pré-renal com DRC prévia, uso de diurético ou bicarbonato e glicosúria.',
      'Pouco útil na IRA não oligúrica e quando a amostra for colhida muito depois do início do quadro. Nunca decide sozinha.',
    ],
    fontes: ['Espinel CH. JAMA 1976;236:579', 'Pépin MN et al. Am J Kidney Dis 2007;50:566', 'Gotfried J et al. Hospitalist/Kidney 2012 (revisão FENa × FEUr)'],
    textoBaixa: 'FENa < 1%: sugere azotemia pré-renal (avidez tubular por sódio). Também pode ocorrer em contraste, rabdomiólise, glomerulonefrite aguda e sepse inicial.',
    textoIntermediaria: 'FENa entre 1 e 2%: indeterminada. Pode ocorrer em pré-renal com diurético ou DRC, e em necrose tubular aguda.',
    textoAlta: 'FENa > 2%: sugere lesão tubular (NTA). Também ocorre com diurético, DRC e fase pós-obstrutiva.',
  },
  ureia: {
    tipo: 'ureia', sigla: 'FEUr', nome: 'Fração de excreção de ureia', unidade: 'mg/dL', fatorSoro: 1, cortes: [35, 50], chave: 'ultimaFEUr',
    formula: `${GERAL}\nSoluto = ureia (mesma unidade na urina e no soro; creatinina em mg/dL).`,
    referenciaTexto: ['< 35%: sugere azotemia pré-renal.', '35–50%: faixa indeterminada.', '> 50%: sugere lesão tubular (NTA).'],
    usos: ['Diferenciar pré-renal de NTA, sobretudo em paciente que usa diurético (a ureia é pouco afetada pelo diurético).'],
    limites: [
      'Estudos usam cortes entre 30% e 40% para pré-renal; o 35% é o mais difundido.',
      'Desempenho pior na sepse. Dados de validação limitados em crianças e neonatos.',
      'Não substitui a avaliação clínica, o sedimento urinário e a resposta à reposição volêmica.',
    ],
    fontes: ['Carvounis CP et al. Kidney Int 2002;62:2223', 'Diskin CJ et al. Ren Fail 2010;32:1', 'Pépin MN et al. Am J Kidney Dis 2007;50:566'],
    textoBaixa: 'FEUr < 35%: sugere azotemia pré-renal. Mantém boa acurácia mesmo com diurético.',
    textoIntermediaria: 'FEUr entre 35 e 50%: indeterminada. Reavalie com sedimento urinário, volemia e evolução.',
    textoAlta: 'FEUr > 50%: sugere lesão tubular (NTA).',
  },
  potassio: {
    tipo: 'potassio', sigla: 'FEK', nome: 'Fração de excreção de potássio', unidade: 'mEq/L', fatorSoro: 1, cortes: [6, 9.5], chave: 'ultimaFEK',
    formula: `${GERAL}\nSoluto = potássio (mesma unidade na urina e no soro; creatinina em mg/dL).`,
    referenciaTexto: ['Hipocalemia: < 6% sugere perda extrarrenal; > 9,5% sugere perda renal; entre 6 e 9,5% é zona cinzenta.', 'Hipercalemia: não há ponto de corte validado.'],
    usos: ['Investigar a causa da hipocalemia (renal × extrarrenal) e, com cautela, a hipercalemia.'],
    limites: [
      'Os cortes vêm de estudos pequenos (média 8% em normais, ~2,8% na hipocalemia extrarrenal e ~15% na renal).',
      'A FEK aumenta com o potássio sérico e cai com a queda da TFG.',
      'Na hipercalemia, um FEK baixo para o K⁺ sérico sugere defeito de secreção distal (hipoaldosteronismo, IECA/BRA, espironolactona, trimetoprima, DRC).',
    ],
    fontes: ['Elisaf M et al. Nephrol Dial Transplant 1995;10:1415 (FEK em normais e hipocalemia)', 'Mount DB. UpToDate: causes of hypokalemia'],
    textoBaixa: 'FEK baixa na hipocalemia: sugere perda extrarrenal (gastrointestinal, redistribuição, baixa ingesta).',
    textoIntermediaria: 'FEK em zona cinzenta: não permite separar perda renal de extrarrenal. Correlacione com clínica, gasometria e pressão arterial.',
    textoAlta: 'FEK alta na hipocalemia: sugere perda renal de potássio (diuréticos, hiperaldosteronismo, tubulopatias, hipomagnesemia, fase poliúrica).',
  },
  calcio: {
    tipo: 'calcio', sigla: 'FECa', nome: 'Fração de excreção de cálcio', unidade: 'mg/dL', fatorSoro: 1, cortes: [1, 2], chave: 'ultimaFECa',
    formula: `${GERAL}\nSoluto = cálcio total (mesma unidade na urina e no soro; creatinina em mg/dL).\nFECa < 1% equivale a depuração Ca/Cr < 0,01.`,
    referenciaTexto: ['< 1%: baixa (hipocalciúria).', '1–2%: faixa usual / intermediária.', '> 2%: elevada (hipercalciúria).'],
    usos: ['Hipercalcemia PTH-dependente: FECa < 1% sugere hipercalcemia hipocalciúrica familiar (FHH).', 'Avaliar hipercalciúria e uso de diuréticos.'],
    limites: [
      'Para FHH, a depuração Ca/Cr < 0,01 (FECa < 1%) sugere o diagnóstico; 0,01–0,02 é indeterminada; confirme com PTH e, se preciso, estudo genético.',
      'Tiazídicos, depleção de volume, uso de vitamina D e DRC avançada alteram o resultado.',
      'Idealmente em urina de 24 h; amostra isolada em jejum é aceitável.',
    ],
    fontes: ['Christensen SE et al. Clin Endocrinol 2008;69:713 (depuração Ca/Cr e FHH)', 'Eastell R et al. J Clin Endocrinol Metab 2014 (hiperparatireoidismo primário)'],
    textoBaixa: 'FECa < 1%: excreção baixa de cálcio. Em hipercalcemia com PTH inapropriado, sugere hipercalcemia hipocalciúrica familiar. Também ocorre com tiazídico e depleção de volume.',
    textoIntermediaria: 'FECa entre 1 e 2%: faixa usual/intermediária; não é discriminativa isoladamente.',
    textoAlta: 'FECa > 2%: excreção elevada de cálcio (hipercalciúria). Considere hiperparatireoidismo primário, hipercalcemia de outras causas, diuréticos de alça ou hipercalciúria idiopática.',
  },
  fosforo: {
    tipo: 'fosforo', sigla: 'FEP', nome: 'Fração de excreção de fósforo', unidade: 'mg/dL', fatorSoro: 1, cortes: [5, 20], chave: 'ultimaFEP',
    formula: `${GERAL}\nSoluto = fósforo (mesma unidade na urina e no soro; creatinina em mg/dL).`,
    referenciaTexto: ['< 5%: baixa.', '5–20%: faixa usual.', '> 20%: elevada.', 'Na hipofosfatemia, FEP > 5% (alguns serviços usam > 10%) sugere perda renal.'],
    usos: ['Hipofosfatemia: separar perda renal de causa extrarrenal.', 'Hiperfosfatemia/DRC: avaliar a excreção residual.'],
    limites: [
      'A FEP sobe fisiologicamente com a queda da TFG e com a carga de fósforo (valores acima de 20% são esperados na DRC avançada).',
      'Varia com a ingestão e o ritmo circadiano; prefira amostra em jejum.',
      'Se disponível, o TmP/TFG é mais preciso para perda renal de fosfato.',
    ],
    fontes: ['Bijvoet OLM. Clin Sci 1969;37:23 (TmP/GFR)', 'Walton RJ, Bijvoet OLM. Lancet 1975;2:309', 'Amanzadeh J, Reilly RF. Nat Clin Pract Nephrol 2006;2:136'],
    textoBaixa: 'FEP < 5%: excreção baixa de fósforo (avidez renal). Esperado na hipofosfatemia de causa extrarrenal e na depleção de fósforo.',
    textoIntermediaria: 'FEP entre 5 e 20%: faixa usual. Se houver hipofosfatemia, valor acima de ~5% já sugere perda renal de fosfato.',
    textoAlta: 'FEP > 20%: excreção elevada. Perda renal de fosfato (hiperparatireoidismo, tubulopatias, excesso de FGF23) ou DRC avançada com fósforo elevado.',
  },
  'acido-urico': {
    tipo: 'acido-urico', sigla: 'FEUA', nome: 'Fração de excreção de ácido úrico', unidade: 'mg/dL', fatorSoro: 1, cortes: [5, 10], chave: 'ultimaFEUA',
    formula: `${GERAL}\nSoluto = ácido úrico (mesma unidade na urina e no soro; creatinina em mg/dL).`,
    referenciaTexto: ['< 5%: baixa.', '5–10%: faixa usual (cerca de 10% em euvolêmicos).', '> 10%: elevada.', 'Em hiponatremia: > 12% favorece SIADH; < 8% favorece depleção de volume.'],
    usos: ['Hiponatremia: ajuda a separar SIADH de hipovolemia, inclusive com diurético.', 'Avaliar a hiperuricemia (sub-excretora × super-produtora).'],
    limites: [
      'Em hiponatremia com diurético, FEUA > 12% teve especificidade e valor preditivo positivo de 100% para SIADH em estudos pequenos.',
      'Fármacos uricosúricos (losartana, fenofibrato, SGLT2) e glicosúria aumentam a FEUA; ácidos orgânicos (lactato, cetoácidos) e baixa TFG a diminuem.',
      'A TFG muito reduzida eleva a FEUA de forma adaptativa.',
    ],
    fontes: ['Maesaka JK, Fishbane S. Am J Kidney Dis 1998;32:1 (uricosúria em SIADH)', 'Fenske W et al. J Clin Endocrinol Metab 2008;93:2991', 'Decaux G. Am J Med 2001;110:582'],
    textoBaixa: 'FEUA < 5%: excreção baixa de urato (hipovolemia, sub-excreção, ácidos orgânicos, alguns diuréticos).',
    textoIntermediaria: 'FEUA entre 5 e 10%: faixa usual. Não é discriminativa isoladamente.',
    textoAlta: 'FEUA > 10%: excreção elevada de urato (uricosúria): SIADH, tubulopatias (Fanconi), hipouricemia renal, glicosúria, fármacos uricosúricos.',
  },
  magnesio: {
    tipo: 'magnesio', sigla: 'FEMg', nome: 'Fração de excreção de magnésio', unidade: 'mg/dL', fatorSoro: 0.7, cortes: [2, 4], chave: 'ultimaFEMg',
    formula: 'FEMg (%) = (U_Mg × Cr_sérica) / (0,7 × S_Mg × Cr_urinária) × 100\nO Mg sérico é multiplicado por 0,7 no denominador porque só ~70% é ultrafiltrável (o app antigo errava esse passo).',
    referenciaTexto: ['< 2%: resposta renal apropriada (perda extrarrenal).', '2–4%: zona intermediária.', '> 4%: sugere perda renal.'],
    usos: ['Hipomagnesemia: separar perda renal (FEMg elevada) de perda gastrointestinal ou baixa ingesta (FEMg baixa).'],
    limites: [
      'Interprete apenas em hipomagnesemia e com TFG preservada; na DRC os valores normais são mais altos.',
      'Há duas convenções: > 2% (Elisaf) e > 4% (Kroll) para perda renal; o app mostra a zona intermediária entre elas.',
      'Diuréticos, aminoglicosídeos, cisplatina, anfotericina, ciclosporina/tacrolimo e tubulopatias elevam a FEMg.',
    ],
    fontes: ['Elisaf M et al. Magnes Res 1997;10:315', 'Kroll MH, Elin RJ. Clin Chem 1985;31:244', 'Ayuk J, Gittoes NJL. Int J Nephrol Renovasc Dis 2014 (revisão de hipomagnesemia)'],
    textoBaixa: 'FEMg < 2%: resposta renal apropriada à hipomagnesemia. Sugere perda extrarrenal (gastrointestinal, baixa ingesta, IBP).',
    textoIntermediaria: 'FEMg entre 2 e 4%: zona intermediária. Pode haver perda renal leve; correlacione com clínica e medicamentos.',
    textoAlta: 'FEMg > 4%: sugere perda renal de magnésio (diuréticos, aminoglicosídeos, cisplatina, anfotericina, inibidores de calcineurina, tubulopatias).',
  },
};

export const TIPOS_FE = Object.keys(CONFIG_FE) as TipoFE[];

/** Faixas de plausibilidade da creatinina na urina (mg/dL). A sérica usa FAIXAS.creatininaMgDl. */
export const FAIXA_CR_URINARIA = { min: 1, max: 600 } as const;

export interface EntradaFE {
  tipo: TipoFE;
  /** Soluto na urina, soluto no soro, creatinina urinária e sérica (texto digitado; vírgula ou ponto). */
  uSoluto: string; sSoluto: string; uCr: string; sCr: string;
  contexto?: ContextoK;
}
export interface ResultadoFE {
  ok: true; tipo: TipoFE; sigla: string; valor: number; classe: ClasseFE; interpretacao: string; avisos: string[]; texto: string;
}
export interface ErroFE { ok: false; campos: string[]; mensagem: string }

const num = (t: string) => parseFloat(String(t).replace(',', '.'));
const br = (n: number, casas = 2) => n.toFixed(casas).replace('.', ',');

export function classificarFE(tipo: TipoFE, valor: number, contexto: ContextoK = 'hipocalemia'): ClasseFE {
  const c = CONFIG_FE[tipo].cortes;
  if (!c || (tipo === 'potassio' && contexto === 'hipercalemia')) return 'sem-corte';
  const v = Math.round(valor * 1000) / 1000; // evita erro de ponto flutuante nas bordas
  if (v < c[0]) return 'baixa';
  if (v <= c[1]) return 'intermediaria';
  return 'alta';
}

export function calcularFE(e: EntradaFE): ResultadoFE | ErroFE {
  const cfg = CONFIG_FE[e.tipo];
  const uS = num(e.uSoluto), sS = num(e.sSoluto), uC = num(e.uCr), sC = num(e.sCr);
  const campos: string[] = [];
  if (!(Number.isFinite(uS) && uS > 0)) campos.push('uSoluto');
  if (!(Number.isFinite(sS) && sS > 0)) campos.push('sSoluto');
  if (!(Number.isFinite(uC) && dentroDaFaixa(uC, FAIXA_CR_URINARIA))) campos.push('uCr');
  if (!(Number.isFinite(sC) && dentroDaFaixa(sC, FAIXAS.creatininaMgDl))) campos.push('sCr');
  if (campos.length) return { ok: false, campos, mensagem: 'Preencha todos os campos com valores válidos (maiores que zero e na mesma unidade da urina e do sangue)' };

  const bruto = (uS * sC) / ((sS * cfg.fatorSoro) * uC) * 100;
  const valor = Math.round(bruto * 100) / 100;
  const contexto = e.contexto ?? 'hipocalemia';
  const classe = classificarFE(e.tipo, bruto, contexto);

  let interpretacao: string;
  if (classe === 'sem-corte') {
    interpretacao = 'Em hipercalemia não há ponto de corte validado para a FEK. Compare com o K⁺ sérico e a TFG: FEK baixa para um K⁺ alto sugere defeito de secreção distal (hipoaldosteronismo, IECA/BRA, espironolactona, trimetoprima, DRC).';
  } else {
    interpretacao = classe === 'baixa' ? cfg.textoBaixa : classe === 'intermediaria' ? cfg.textoIntermediaria : cfg.textoAlta;
  }

  const avisos: string[] = [];
  if (valor > 100) avisos.push('FE acima de 100%: confira as unidades e se os valores de urina e sangue não foram trocados.');
  if (e.tipo === 'sodio') avisos.push('A FENa é pouco confiável com diurético, DRC, sepse e contraste: considere a FEUr e interprete com a clínica.');
  if (e.tipo === 'acido-urico') {
    if (valor > 12) avisos.push('Em hiponatremia, FEUA > 12% favorece SIADH, mesmo em uso de diurético.');
    else if (valor < 8) avisos.push('Em hiponatremia, FEUA < 8% favorece depleção de volume efetivo.');
  }
  if (e.tipo === 'magnesio') avisos.push('Interprete a FEMg apenas em hipomagnesemia e com TFG preservada.');
  if (e.tipo === 'potassio' && contexto === 'hipocalemia') avisos.push('A FEK varia com o K⁺ sérico e com a TFG; use junto com gasometria, pressão arterial e história.');

  const texto = `${cfg.sigla}: ${br(valor)} %\n${interpretacao}`;
  return { ok: true, tipo: e.tipo, sigla: cfg.sigla, valor, classe, interpretacao, avisos, texto };
}
