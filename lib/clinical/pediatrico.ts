// TFG pediátrica (Schwartz bedside + estimativa cinética "Chen") — portado de ClCrPediatricCalculator.tsx.
// Portado SEM mudanças de cálculo, validação ou texto. Pontos que mereceram atenção ficam em DIVERGENCIAS.md
// (PED-1: creatinina anterior e intervalo não entram na conta; PED-2: sexo não é exigido). Nada foi alterado sem aprovação.

export type Aba = 'schwartz' | 'chen';
export type UnidadeIdade = 'dias' | 'meses' | 'anos';
export type SexoPed = 'male' | 'female' | null;

/** Igual ao `normalize` do original (aplicado a cada tecla). */
export function normalizarPediatrico(text: string): string {
  let t = text.trim();
  if (t === '.' || t === ',') return '0.';
  if (t.startsWith('.') || t.startsWith(',')) t = '0' + t;
  t = t.replace(',', '.');
  t = t.replace(/^0+(\d)/, '$1');
  t = t.replace(/[^0-9.]/g, '');
  const parts = t.split('.');
  if (parts.length > 2) t = parts[0] + '.' + parts.slice(1).join('');
  return t;
}

export interface EntradaPediatrica {
  aba: Aba;
  altura: string;
  creatinina: string;
  idade: string;
  unidade: UnidadeIdade;
  sexo: SexoPed;
  prematuro: boolean;
  creatininaAnterior: string;
  horas: string;
}

export type ResultadoPediatrico =
  | { ok: false; erroAltura: boolean; erroCreatinina: boolean; erroIdade: boolean; mensagem: string }
  | { ok: true; tfg: number; texto: string };

export function kSchwartz(idadeAnos: number, prematuro: boolean, sexo: SexoPed): number {
  let k = 0.413;
  if (idadeAnos < 1) k = prematuro ? 0.33 : 0.45;
  else if (idadeAnos >= 13) k = sexo === 'male' ? 0.7 : 0.55;
  return k;
}

export function calcularPediatrico(e: EntradaPediatrica): ResultadoPediatrico {
  const h = parseFloat(e.altura);
  const c = parseFloat(e.creatinina);

  const erroAltura = isNaN(h) || h < 30 || h > 200;
  const erroCreatinina = isNaN(c) || c <= 0 || c > 10;

  let idadeAnos = 0;
  let idadeValida = true;
  const n = parseFloat(e.idade);
  if (e.unidade === 'dias') {
    if (isNaN(n) || n < 0 || n > 365 * 18) idadeValida = false;
    else idadeAnos = n / 365.25;
  } else if (e.unidade === 'meses') {
    if (isNaN(n) || n < 0 || n > 12 * 18) idadeValida = false;
    else idadeAnos = n / 12;
  } else if (isNaN(n) || n < 0 || n > 18) idadeValida = false;
  else idadeAnos = n;
  const erroIdade = !idadeValida || !e.idade.trim();

  if (erroAltura || erroCreatinina || erroIdade) {
    return { ok: false, erroAltura, erroCreatinina, erroIdade, mensagem: 'Corrija os campos destacados em vermelho.' };
  }
  const semErro = { erroAltura: false, erroCreatinina: false, erroIdade: false };

  if (e.aba === 'schwartz') {
    const k = kSchwartz(idadeAnos, e.prematuro, e.sexo);
    const tfg = (k * h) / c;
    let estagio = 'Função renal normal';
    if (tfg < 90) estagio = 'DRC G2';
    if (tfg < 60) estagio = 'DRC G3a–G3b';
    if (tfg < 30) estagio = 'DRC G4–G5';
    return {
      ok: true,
      tfg,
      texto:
        `TFG estimada: ${tfg.toFixed(1)} mL/min/1.73m²\n` +
        `Método: Schwartz Bedside 2009\n` +
        `Classificação: ${estagio}\n\n` +
        `(Valores normais aproximados em crianças: 90–140)`,
    };
  }

  const prev = parseFloat(e.creatininaAnterior);
  const horas = parseFloat(e.horas) || 24;
  if (isNaN(prev) || prev <= 0 || prev > 10) {
    return { ok: false, ...semErro, mensagem: 'Creatinina anterior inválida (0.01–10 mg/dL).' };
  }
  if (horas <= 0 || horas > 168) {
    return { ok: false, ...semErro, mensagem: 'Intervalo deve estar entre 1 e 168 horas.' };
  }
  const base = (0.413 * h) / c;
  const tfg = Math.max(base * 0.85, 5);
  return {
    ok: true,
    tfg,
    texto:
      `TFG estimada (kinetic): ${tfg.toFixed(1)} mL/min/1.73m²\n` +
      `Método: Estimativa cinética adaptada (base Schwartz)\n\n` +
      `Indicado para LRA com creatinina em ascensão`,
  };
}
