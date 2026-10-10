// Depuração de creatinina em urina de 24 h (Onda 7, ferramenta nova). Função pura.
// ClCr (mL/min) = (Cr urinária × volume) / (Cr sérica × minutos da coleta). A Cr urinária e a sérica na mesma unidade (mg/dL).
// Adequação da coleta: excreção de creatinina em mg/kg/24 h. Referências usadas (adultos): homens 15–25, mulheres 12–20.
import { FAIXAS, dentroDaFaixa } from './faixas';

export type Sexo = 'M' | 'F';
export const FAIXA_VOLUME_24H = { min: 50, max: 10000 } as const; // mL
export const FAIXA_HORAS_COLETA = { min: 1, max: 48 } as const;
export const FAIXA_CR_URINARIA_24H = { min: 1, max: 600 } as const; // mg/dL
export const REFERENCIA_EXCRECAO: Record<Sexo, { min: number; max: number }> = { M: { min: 15, max: 25 }, F: { min: 12, max: 20 } };

export interface EntradaClearance24h { volume: string; horas: string; uCr: string; sCr: string; peso: string; altura: string; sexo: Sexo | '' }
export interface ResultadoClearance24h {
  ok: true; clearance: number; normalizado: number | null; asc: number | null;
  excrecaoMgKg: number | null; adequacao: 'adequada' | 'baixa' | 'alta' | null; avisos: string[]; texto: string;
}
export interface ErroClearance24h { ok: false; campos: string[]; mensagem: string }

const num = (t: string) => parseFloat(String(t).replace(',', '.'));
const vazio = (t: string) => t.trim() === '';
const br = (n: number, c = 1) => n.toFixed(c).replace('.', ',');

/** Superfície corporal de Mosteller: √(altura cm × peso kg / 3600). */
export const superficieCorporal = (alturaCm: number, pesoKg: number): number => Math.sqrt((alturaCm * pesoKg) / 3600);

export function calcularClearance24h(e: EntradaClearance24h): ResultadoClearance24h | ErroClearance24h {
  const campos: string[] = [];
  const v = num(e.volume), h = num(e.horas), uC = num(e.uCr), sC = num(e.sCr);
  if (!(Number.isFinite(v) && dentroDaFaixa(v, FAIXA_VOLUME_24H))) campos.push('volume');
  if (!(Number.isFinite(h) && dentroDaFaixa(h, FAIXA_HORAS_COLETA))) campos.push('horas');
  if (!(Number.isFinite(uC) && dentroDaFaixa(uC, FAIXA_CR_URINARIA_24H))) campos.push('uCr');
  if (!(Number.isFinite(sC) && dentroDaFaixa(sC, FAIXAS.creatininaMgDl))) campos.push('sCr');
  const temPeso = !vazio(e.peso), temAltura = !vazio(e.altura);
  const p = num(e.peso), alt = num(e.altura);
  if (temPeso && !(Number.isFinite(p) && dentroDaFaixa(p, FAIXAS.pesoKg))) campos.push('peso');
  if (temAltura && !(Number.isFinite(alt) && dentroDaFaixa(alt, FAIXAS.alturaCm))) campos.push('altura');
  if (temAltura && !temPeso && !campos.includes('peso')) campos.push('peso'); // altura sozinha não serve
  if (campos.length) return { ok: false, campos, mensagem: campos.length === 1 && campos[0] === 'peso' && temAltura && !temPeso ? 'Para corrigir pela superfície corporal informe também o peso' : 'Preencha os campos destacados com valores válidos' };

  const clearance = (uC * v) / (sC * h * 60);
  const avisos: string[] = [];
  let asc: number | null = null, normalizado: number | null = null;
  if (temPeso && temAltura) { asc = superficieCorporal(alt, p); normalizado = (clearance * 1.73) / asc; }

  // Excreção de creatinina: mg/24 h = Cr urinária (mg/dL) × volume (mL) / 100, escalada para 24 h.
  let excrecaoMgKg: number | null = null;
  let adequacao: 'adequada' | 'baixa' | 'alta' | null = null;
  if (temPeso) {
    excrecaoMgKg = ((uC * v) / 100) * (24 / h) / p;
    if (e.sexo) {
      const ref = REFERENCIA_EXCRECAO[e.sexo];
      const x = Math.round(excrecaoMgKg * 10) / 10;
      adequacao = x < ref.min ? 'baixa' : x > ref.max ? 'alta' : 'adequada';
      if (adequacao === 'baixa') avisos.push(`Excreção de creatinina abaixo do esperado (${ref.min}–${ref.max} mg/kg/24 h): coleta possivelmente incompleta, ou massa muscular baixa/idoso. A depuração pode estar subestimada.`);
      if (adequacao === 'alta') avisos.push(`Excreção de creatinina acima do esperado (${ref.min}–${ref.max} mg/kg/24 h): confira o volume e o tempo, ou considere massa muscular alta/ingestão de carne cozida.`);
    }
  }
  if (h < 24) avisos.push('Coleta com menos de 24 h: o cálculo vale, mas a variação do dia reduz a precisão.');
  avisos.push('A depuração de creatinina SUPERESTIMA a TFG (secreção tubular de creatinina), mais ainda quando a TFG é baixa.');

  const linhas = [`Depuração: ${br(clearance)} mL/min`];
  if (normalizado !== null) linhas.push(`Corrigida (1,73 m²): ${br(normalizado)} mL/min/1,73 m²`);
  if (excrecaoMgKg !== null) linhas.push(`Excreção de creatinina: ${br(excrecaoMgKg)} mg/kg/24 h${adequacao ? ` (${adequacao === 'adequada' ? 'coleta adequada' : adequacao === 'baixa' ? 'abaixo do esperado' : 'acima do esperado'})` : ''}`);
  return { ok: true, clearance: Math.round(clearance * 100) / 100, normalizado: normalizado === null ? null : Math.round(normalizado * 100) / 100,
    asc: asc === null ? null : Math.round(asc * 1000) / 1000, excrecaoMgKg: excrecaoMgKg === null ? null : Math.round(excrecaoMgKg * 100) / 100, adequacao, avisos, texto: linhas.join('\n') };
}
