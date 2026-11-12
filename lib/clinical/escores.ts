// Escores migrados do app antigo e REVISADOS contra a literatura (ver DIVERGENCIAS_ESCORES.md).
// Fórmulas publicadas: Glasgow (Teasdale & Jennett 1974), PCE (Goff 2014, Circulation) e KFRE 4 variáveis (Tangri 2011/2016).

// ── Escala de Coma de Glasgow ───────────────────────────────────────────────
export type ClasseGlasgow = 'leve' | 'moderado' | 'grave';
export interface ResultadoGlasgow { total: number; classe: ClasseGlasgow; rotulo: string; resumo: string }

export function glasgow(ocular: number, verbal: number, motora: number): ResultadoGlasgow | null {
  const ok = (v: number, max: number) => Number.isInteger(v) && v >= 1 && v <= max;
  if (!ok(ocular, 4) || !ok(verbal, 5) || !ok(motora, 6)) return null;
  const total = ocular + verbal + motora;
  const classe: ClasseGlasgow = total >= 13 ? 'leve' : total >= 9 ? 'moderado' : 'grave';
  const rotulo = classe === 'leve' ? 'Leve (13–15)' : classe === 'moderado' ? 'Moderado (9–12)' : 'Grave (≤ 8)';
  return { total, classe, rotulo, resumo: `E${ocular} V${verbal} M${motora}` };
}

// ── Maturação da FAV (regra dos 6) ──────────────────────────────────────────
export type SituacaoCriterio = 'ok' | 'falha' | 'pendente' | 'invalido';
export interface CriterioFav { id: 'fluxo' | 'diametro' | 'profundidade' | 'palpavel'; texto: string; situacao: SituacaoCriterio }
export interface ResultadoFav { criterios: CriterioFav[]; completo: boolean; atendeTodos: boolean; naoAtendidos: string[] }

const numero = (t: string): number | null => {
  const n = t.replace(',', '.').trim();
  if (n === '') return null;
  const v = Number(n);
  return Number.isFinite(v) ? v : NaN;
};

function avaliar(t: string, max: number, ok: (v: number) => boolean): SituacaoCriterio {
  const v = numero(t);
  if (v === null) return 'pendente';
  if (Number.isNaN(v) || v < 0 || v > max) return 'invalido';
  return ok(v) ? 'ok' : 'falha';
}

/** Fluxo ≥ 600 mL/min, diâmetro ≥ 6 mm, profundidade ≤ 6 mm e veia palpável/compressível (KDOQI). */
export function avaliarFav(fluxo: string, diametro: string, profundidade: string, palpavel: boolean | null): ResultadoFav {
  const criterios: CriterioFav[] = [
    { id: 'fluxo', texto: 'Fluxo < 600 mL/min', situacao: avaliar(fluxo, 5000, (v) => v >= 600) },
    { id: 'diametro', texto: 'Diâmetro < 6 mm', situacao: avaliar(diametro, 30, (v) => v >= 6) },
    { id: 'profundidade', texto: 'Profundidade > 6 mm', situacao: avaliar(profundidade, 50, (v) => v <= 6) },
    { id: 'palpavel', texto: 'Veia não palpável/compressível', situacao: palpavel === null ? 'pendente' : palpavel ? 'ok' : 'falha' },
  ];
  const completo = criterios.every((c) => c.situacao === 'ok' || c.situacao === 'falha');
  return {
    criterios, completo,
    atendeTodos: criterios.every((c) => c.situacao === 'ok'),
    naoAtendidos: criterios.filter((c) => c.situacao === 'falha').map((c) => c.texto),
  };
}

// ── Pooled Cohort Equations (ASCVD em 10 anos) ──────────────────────────────
export type GrupoPce = 'branco-outros' | 'afro';
export interface EntradaPce { idade: string; sexo: 'm' | 'f' | ''; grupo: GrupoPce; colesterolTotal: string; hdl: string; pas: string; tratamentoHas: boolean; fumante: boolean; diabetes: boolean }
export type FaixaPce = 'baixo' | 'limitrofe' | 'intermediario' | 'alto';
export type ResultadoPce = { ok: true; risco: number; faixa: FaixaPce; rotulo: string } | { ok: false; campos: string[]; mensagem: string };

interface CoefPce { lnIdade: number; lnIdade2: number; lnCt: number; lnIdadeCt: number; lnHdl: number; lnIdadeHdl: number; lnPasTrat: number; lnIdadePasTrat: number; lnPasNao: number; lnIdadePasNao: number; fuma: number; lnIdadeFuma: number; dm: number; media: number; s10: number }
const Z = 0;
// Goff DC Jr et al., Circulation 2014;129(25 Suppl 2):S49–S73 — Apêndice 7, Tabela A.
export const COEF_PCE: Record<GrupoPce, Record<'m' | 'f', CoefPce>> = {
  'branco-outros': {
    m: { lnIdade: 12.344, lnIdade2: Z, lnCt: 11.853, lnIdadeCt: -2.664, lnHdl: -7.990, lnIdadeHdl: 1.769, lnPasTrat: 1.797, lnIdadePasTrat: Z, lnPasNao: 1.764, lnIdadePasNao: Z, fuma: 7.837, lnIdadeFuma: -1.795, dm: 0.658, media: 61.18, s10: 0.9144 },
    f: { lnIdade: -29.799, lnIdade2: 4.884, lnCt: 13.540, lnIdadeCt: -3.114, lnHdl: -13.578, lnIdadeHdl: 3.149, lnPasTrat: 2.019, lnIdadePasTrat: Z, lnPasNao: 1.957, lnIdadePasNao: Z, fuma: 7.574, lnIdadeFuma: -1.665, dm: 0.661, media: -29.18, s10: 0.9665 },
  },
  afro: {
    m: { lnIdade: 2.469, lnIdade2: Z, lnCt: 0.302, lnIdadeCt: Z, lnHdl: -0.307, lnIdadeHdl: Z, lnPasTrat: 1.916, lnIdadePasTrat: Z, lnPasNao: 1.809, lnIdadePasNao: Z, fuma: 0.549, lnIdadeFuma: Z, dm: 0.645, media: 19.54, s10: 0.8954 },
    f: { lnIdade: 17.114, lnIdade2: Z, lnCt: 0.940, lnIdadeCt: Z, lnHdl: -18.920, lnIdadeHdl: 4.475, lnPasTrat: 29.291, lnIdadePasTrat: -6.432, lnPasNao: 27.820, lnIdadePasNao: -6.087, fuma: 0.691, lnIdadeFuma: Z, dm: 0.874, media: 86.61, s10: 0.9533 },
  },
};

export function calcularPce(e: EntradaPce): ResultadoPce {
  const idade = numero(e.idade), ct = numero(e.colesterolTotal), hdl = numero(e.hdl), pas = numero(e.pas);
  const dentro = (v: number | null, a: number, b: number) => v !== null && !Number.isNaN(v) && v >= a && v <= b;
  const campos: string[] = [];
  const msgs: string[] = [];
  if (!dentro(idade, 40, 79) || !Number.isInteger(idade)) { campos.push('idade'); msgs.push('idade de 40 a 79 anos'); }
  if (!e.sexo) { campos.push('sexo'); msgs.push('o sexo'); }
  if (!dentro(ct, 130, 320)) { campos.push('colesterolTotal'); msgs.push('colesterol total de 130 a 320 mg/dL'); }
  if (!dentro(hdl, 20, 100)) { campos.push('hdl'); msgs.push('HDL de 20 a 100 mg/dL'); }
  if (!dentro(pas, 90, 200)) { campos.push('pas'); msgs.push('pressão sistólica de 90 a 200 mmHg'); }
  if (campos.length) return { ok: false, campos, mensagem: `Informe ${msgs.join('; ')}.` };

  const c = COEF_PCE[e.grupo][e.sexo as 'm' | 'f'];
  const lnI = Math.log(idade as number), lnCt = Math.log(ct as number), lnHdl = Math.log(hdl as number), lnPas = Math.log(pas as number);
  let soma = c.lnIdade * lnI + c.lnIdade2 * lnI * lnI + c.lnCt * lnCt + c.lnIdadeCt * lnI * lnCt + c.lnHdl * lnHdl + c.lnIdadeHdl * lnI * lnHdl;
  soma += e.tratamentoHas ? c.lnPasTrat * lnPas + c.lnIdadePasTrat * lnI * lnPas : c.lnPasNao * lnPas + c.lnIdadePasNao * lnI * lnPas;
  if (e.fumante) soma += c.fuma + c.lnIdadeFuma * lnI;
  if (e.diabetes) soma += c.dm;
  const risco = (1 - Math.pow(c.s10, Math.exp(soma - c.media))) * 100;
  // Faixas da diretriz AHA/ACC 2018 (Grundy et al.): baixo < 5%, limítrofe 5–7,4%, intermediário 7,5–19,9%, alto ≥ 20%.
  const r = Math.round(risco * 10) / 10;
  const faixa: FaixaPce = r < 5 ? 'baixo' : r < 7.5 ? 'limitrofe' : r < 20 ? 'intermediario' : 'alto';
  const rotulo = { baixo: 'Baixo (< 5%)', limitrofe: 'Limítrofe (5% a < 7,5%)', intermediario: 'Intermediário (7,5% a < 20%)', alto: 'Alto (≥ 20%)' }[faixa];
  return { ok: true, risco: r, faixa, rotulo };
}

// ── KFRE (Kidney Failure Risk Equation), 4 variáveis ────────────────────────
// Tangri N et al. JAMA 2011;305:1553 e JAMA 2016;315:164. ACR em mg/g.
export type RegiaoKfre = 'fora-america-norte' | 'america-norte';
export const S0_KFRE: Record<RegiaoKfre, { dois: number; cinco: number }> = {
  'america-norte': { dois: 0.9750, cinco: 0.9240 },
  'fora-america-norte': { dois: 0.9832, cinco: 0.9365 },
};
export interface EntradaKfre { idade: string; sexo: 'm' | 'f' | ''; egfr: string; acr: string; regiao: RegiaoKfre }
export type ResultadoKfre = { ok: true; risco2: number; risco5: number; avisos: string[] } | { ok: false; campos: string[]; mensagem: string };

export function calcularKfre(e: EntradaKfre): ResultadoKfre {
  const idade = numero(e.idade), egfr = numero(e.egfr), acr = numero(e.acr);
  const dentro = (v: number | null, a: number, b: number) => v !== null && !Number.isNaN(v) && v >= a && v <= b;
  const campos: string[] = [];
  const msgs: string[] = [];
  if (!dentro(idade, 18, 120)) { campos.push('idade'); msgs.push('idade de 18 a 120 anos'); }
  if (!e.sexo) { campos.push('sexo'); msgs.push('o sexo'); }
  if (!dentro(egfr, 1, 150)) { campos.push('egfr'); msgs.push('TFG estimada de 1 a 150 mL/min/1,73 m²'); }
  if (!dentro(acr, 0.1, 50000)) { campos.push('acr'); msgs.push('relação albumina/creatinina em mg/g (maior que 0)'); }
  if (campos.length) return { ok: false, campos, mensagem: `Informe ${msgs.join('; ')}.` };

  const l = -0.2201 * ((idade as number) / 10 - 7.036) + 0.2467 * ((e.sexo === 'm' ? 1 : 0) - 0.5642)
    - 0.5567 * ((egfr as number) / 5 - 7.222) + 0.4510 * (Math.log(acr as number) - 5.137);
  const s = S0_KFRE[e.regiao];
  const risco2 = (1 - Math.pow(s.dois, Math.exp(l))) * 100;
  const risco5 = (1 - Math.pow(s.cinco, Math.exp(l))) * 100;
  const avisos: string[] = [];
  if ((egfr as number) >= 60) avisos.push('TFG ≥ 60: o KFRE foi desenvolvido em DRC estágios G3–G5; use com cautela.');
  if ((idade as number) < 18) avisos.push('Não validado em menores de 18 anos.');
  return { ok: true, risco2, risco5, avisos };
}
