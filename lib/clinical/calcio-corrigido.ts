// Cálcio total corrigido pela albumina (fórmula clássica de Payne: +0,8 mg/dL para cada 1 g/dL de albumina abaixo de 4,0). Função pura.
export const FAIXA_CALCIO = { min: 2, max: 20 } as const; // mg/dL
export const FAIXA_ALBUMINA = { min: 0.5, max: 7 } as const; // g/dL
export const REFERENCIA_CALCIO = { min: 8.5, max: 10.2 } as const; // mg/dL (varia conforme o laboratório)

export type FaixaCalcio = 'baixo' | 'normal' | 'alto';
export type ResultadoCalcio =
  | { ok: true; corrigido: number; medido: number; ajustado: boolean; faixa: FaixaCalcio; texto: string; avisos: string[] }
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
  const faixa: FaixaCalcio = c < REFERENCIA_CALCIO.min ? 'baixo' : c > REFERENCIA_CALCIO.max ? 'alto' : 'normal';
  const avisos: string[] = [];
  if (alb < 2) avisos.push('Albumina < 2,0 g/dL: a correção é pouco confiável. Meça o cálcio iônico.');
  if (ajustado) avisos.push('Em DRC, diálise, acidose grave, UTI ou uso de citrato, o cálcio iônico é o exame de escolha: a correção pode errar.');
  return { ok: true, corrigido: c, medido: r1(ca), ajustado, faixa, avisos,
    texto: `Cálcio corrigido: ${c.toFixed(1)} mg/dL (${faixa === 'baixo' ? 'abaixo' : faixa === 'alto' ? 'acima' : 'dentro'} da referência 8,5–10,2)\nCálcio medido: ${r1(ca).toFixed(1)} mg/dL${ajustado ? '' : '\nAlbumina ≥ 4,0 g/dL: sem ajuste'}` };
}
