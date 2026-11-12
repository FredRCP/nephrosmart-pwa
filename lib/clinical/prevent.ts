// PREVENT (AHA, Khan SS et al., Circulation 2024;149:430–449): risco de DCV total, DCVAS (ASCVD) e insuficiência cardíaca
// em 10 e 30 anos. Modelo base e modelo com albuminúria (UACR). Os modelos com HbA1c e SDI NÃO são usados.
// Transformações e coeficientes conferidos com o pacote público 'preventr' (0.12.2), ver prevent-coef.ts.
import { COEF_PREVENT, type ChaveModelo, type Desfecho } from './prevent-coef';

export interface EntradaPrevent {
  idade: string; sexo: 'm' | 'f' | ''; colesterolTotal: string; hdl: string; pas: string; imc: string; egfr: string; uacr: string;
  tratamentoHas: boolean; estatina: boolean; diabetes: boolean; fumante: boolean;
}
export interface RiscosPrevent { totalCvd: number; ascvd: number; insuficienciaCardiaca: number }
export type ResultadoPrevent =
  | { ok: true; modelo: 'base' | 'uacr'; dez: RiscosPrevent; trinta: RiscosPrevent | null; avisos: string[] }
  | { ok: false; campos: string[]; mensagem: string };

const MMOL = 0.02586; // mg/dL → mmol/L (colesterol)
const num = (t: string): number | null => {
  const n = t.replace(',', '.').trim();
  if (n === '') return null;
  const v = Number(n);
  return Number.isFinite(v) ? v : NaN;
};

export interface TermosPrevent { idade: number; nonHdl: number; hdl: number; sbpMenor110: number; sbpMaior110: number; imcMenor30: number; imcMaior30: number; egfrMenor60: number; egfrMaior60: number }

/** Termos do modelo, na ordem dos coeficientes. `trintaAnos` inclui idade²; `uacr` inclui ln(UACR) e o indicador de ausente (0). */
export function montarTermos(p: { idade: number; ct: number; hdl: number; pas: number; imc: number; egfr: number; dm: boolean; fuma: boolean; has: boolean; estatina: boolean; uacr: number | null }, trintaAnos: boolean, modeloUacr: boolean): number[] {
  const age = (p.idade - 55) / 10;
  const nonHdl = (p.ct - p.hdl) * MMOL - 3.5;
  const hdl = (p.hdl * MMOL - 1.3) / 0.3;
  const sbpLt = (Math.min(p.pas, 110) - 110) / 20;
  const sbpGte = (Math.max(p.pas, 110) - 130) / 20;
  const bmiLt = (Math.min(p.imc, 30) - 25) / 5;
  const bmiGte = (Math.max(p.imc, 30) - 30) / 5;
  const egfrLt = (Math.min(p.egfr, 60) - 60) / -15;
  const egfrGte = (Math.max(p.egfr, 60) - 90) / -15;
  const dm = p.dm ? 1 : 0, sm = p.fuma ? 1 : 0, tx = p.has ? 1 : 0, st = p.estatina ? 1 : 0;
  const t = [age, ...(trintaAnos ? [age * age] : []), nonHdl, hdl, sbpLt, sbpGte, dm, sm, bmiLt, bmiGte, egfrLt, egfrGte, tx, st,
    tx * sbpGte, st * nonHdl, age * nonHdl, age * hdl, age * sbpGte, age * dm, age * sm, age * bmiGte, age * egfrLt];
  if (modeloUacr) t.push(p.uacr !== null ? Math.log(p.uacr) : 0, p.uacr !== null ? 0 : 1);
  t.push(1);
  return t;
}

export function logistica(coef: number[], termos: number[]): number {
  if (coef.length !== termos.length) throw new Error('PREVENT: número de termos diferente do número de coeficientes');
  const lo = coef.reduce((s, c, i) => s + c * termos[i], 0);
  return Math.exp(lo) / (1 + Math.exp(lo));
}

export function calcularPrevent(e: EntradaPrevent): ResultadoPrevent {
  const idade = num(e.idade), ct = num(e.colesterolTotal), hdl = num(e.hdl), pas = num(e.pas), imc = num(e.imc), egfr = num(e.egfr), uacr = num(e.uacr);
  const dentro = (v: number | null, a: number, b: number) => v !== null && !Number.isNaN(v) && v >= a && v <= b;
  const campos: string[] = [], msgs: string[] = [];
  if (!dentro(idade, 30, 79)) { campos.push('idade'); msgs.push('idade de 30 a 79 anos'); }
  if (!e.sexo) { campos.push('sexo'); msgs.push('o sexo'); }
  if (!dentro(ct, 130, 320)) { campos.push('colesterolTotal'); msgs.push('colesterol total de 130 a 320 mg/dL'); }
  if (!dentro(hdl, 20, 100)) { campos.push('hdl'); msgs.push('HDL de 20 a 100 mg/dL'); }
  if (!dentro(pas, 90, 180)) { campos.push('pas'); msgs.push('pressão sistólica de 90 a 180 mmHg'); }
  if (!dentro(imc, 18.5, 39.9)) { campos.push('imc'); msgs.push('IMC de 18,5 a 39,9 kg/m²'); }
  if (!dentro(egfr, 15, 140)) { campos.push('egfr'); msgs.push('TFG estimada de 15 a 140 mL/min/1,73 m²'); }
  if (e.uacr.trim() !== '' && !dentro(uacr, 0.1, 25000)) { campos.push('uacr'); msgs.push('albuminúria (ACR) de 0,1 a 25.000 mg/g, ou deixe em branco'); }
  if (campos.length) return { ok: false, campos, mensagem: `Informe ${msgs.join('; ')}.` };

  const p = { idade: idade as number, ct: ct as number, hdl: hdl as number, pas: pas as number, imc: imc as number, egfr: egfr as number,
    dm: e.diabetes, fuma: e.fumante, has: e.tratamentoHas, estatina: e.estatina, uacr: e.uacr.trim() === '' ? null : (uacr as number) };
  const modeloUacr = p.uacr !== null;
  const sexo = e.sexo === 'f' ? 'female' : 'male';
  const calc = (anos: 10 | 30): RiscosPrevent => {
    const chave = `${modeloUacr ? 'uacr' : 'base'}_${anos}yr` as ChaveModelo;
    const termos = montarTermos(p, anos === 30, modeloUacr);
    const r = (d: Desfecho) => logistica(COEF_PREVENT[chave][sexo][d], termos) * 100;
    return { totalCvd: r('total_cvd'), ascvd: r('ascvd'), insuficienciaCardiaca: r('heart_failure') };
  };
  const avisos: string[] = [];
  const trinta = p.idade <= 59 ? calc(30) : null;
  if (!trinta) avisos.push('Risco em 30 anos só é estimado até 59 anos.');
  if (!modeloUacr) avisos.push('Sem albuminúria informada: modelo base. Na DRC, informar o ACR melhora a estimativa.');
  return { ok: true, modelo: modeloUacr ? 'uacr' : 'base', dez: calc(10), trinta, avisos };
}
