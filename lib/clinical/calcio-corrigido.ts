// Estimativa do cálcio pela albumina (fórmula clássica de Payne: +0,8 mg/dL para cada 1 g/dL de albumina abaixo de 4,0). Função pura.
// Desde 2024–2026 a fórmula é rebaixada: o cálcio total NÃO corrigido concorda mais com o iônico, e a posição conjunta IOF/IFCC/EFLM (2026)
// recomenda parar de reportar o "corrigido". O app mostra o total medido como dado principal e o Payne só como estimativa.
export const FAIXA_CALCIO = { min: 2, max: 20 } as const; // mg/dL
export const FAIXA_ALBUMINA = { min: 0.5, max: 7 } as const; // g/dL
export const REFERENCIA_CALCIO = { min: 8.5, max: 10.2 } as const; // mg/dL (varia conforme o laboratório)

export type FaixaCalcio = 'baixo' | 'normal' | 'alto';
export type ResultadoCalcio =
  | { ok: true; corrigido: number; medido: number; ajustado: boolean; faixa: FaixaCalcio; faixaTotal: FaixaCalcio; discordante: boolean; texto: string; avisos: string[] }
  | { ok: false; campos: ('calcio' | 'albumina')[]; mensagem: string };

const r1 = (n: number) => Math.round(n * 10) / 10;
const num = (t: string) => (t.trim() === '' ? NaN : Number(t.trim().replace(',', '.')));

export function corrigirCalcio(entrada: { calcio: string; albumina: string }): ResultadoCalcio {
  const ca = num(entrada.calcio);
  const alb = num(entrada.albumina);
  const campos: ('calcio' | 'albumina')[] = [];
  if (!(ca >= FAIXA_CALCIO.min && ca <= FAIXA_CALCIO.max)) campos.push('calcio');
  if (!(alb >= FAIXA_ALBUMINA.min && alb <= FAIXA_ALBUMINA.max)) campos.push('albumina');
  if (campos.length) {
    const partes = campos.map((c) => (c === 'calcio' ? `um cálcio total entre ${FAIXA_CALCIO.min} e ${FAIXA_CALCIO.max} mg/dL` : `uma albumina entre ${FAIXA_ALBUMINA.min} e ${FAIXA_ALBUMINA.max} g/dL`));
    return { ok: false, campos, mensagem: `Por favor, insira ${partes.join(' e ')}.` };
  }
  const ajustado = alb < 4;
  const corrigido = ajustado ? ca + 0.8 * (4 - alb) : ca;
  const c = r1(corrigido);
  const medido = r1(ca);
  const classificar = (v: number): FaixaCalcio => (v < REFERENCIA_CALCIO.min ? 'baixo' : v > REFERENCIA_CALCIO.max ? 'alto' : 'normal');
  const faixa = classificar(c);
  const faixaTotal = classificar(medido);
  const discordante = ajustado && faixa !== faixaTotal;
  const avisos: string[] = [];
  if (ajustado) {
    avisos.push('A fórmula de Payne é aproximada e pouco confiável: o cálcio total sem correção concorda mais com o iônico (JAMA Netw Open 2024) e a posição IOF/IFCC/EFLM de 2026 recomenda não usar cálcio "corrigido". Em DRC, diálise, doença crítica, acidose, citrato ou hipoalbuminemia grave, dose o cálcio iônico.');
    if (alb < 2) avisos.push('Albumina < 2,0 g/dL: a estimativa é ainda menos confiável. Meça o cálcio iônico.');
  }
  if (discordante) avisos.push('O total medido e a estimativa de Payne caem em faixas diferentes: não conclua por nenhum dos dois. Dose o cálcio iônico.');
  const nome = { baixo: 'abaixo', alto: 'acima', normal: 'dentro' } as const;
  const texto = `Cálcio total medido: ${medido.toFixed(1)} mg/dL (${nome[faixaTotal]} da referência 8,5–10,2)` +
    (ajustado ? `\nEstimativa pela fórmula de Payne: ${c.toFixed(1)} mg/dL (aproximada)` : '\nAlbumina ≥ 4,0 g/dL: sem ajuste');
  return { ok: true, corrigido: c, medido, ajustado, faixa, faixaTotal, discordante, avisos, texto };
}
