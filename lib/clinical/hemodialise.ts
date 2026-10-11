// Adequação da hemodiálise (Onda 8). Funções puras.
//  • spKt/V (Daugirdas, 2ª geração) = −ln(R − 0,008·t) + (4 − 3,5·R) · UF/W
//      R = ureia pós ÷ ureia pré · t = duração (h) · UF = volume ultrafiltrado (L) · W = peso pós-diálise (kg)
//  • URR (%) = 100 · (1 − R)
//  • Metas KDOQI 2015 (3 sessões/semana): spKt/V alvo 1,4 · mínimo entregue 1,2.
//  • Taxa de ultrafiltração (mL/kg/h) = UF (mL) ÷ peso seco ÷ horas.
import { dentroDaFaixa } from './faixas';

export const FAIXA_UREIA = { min: 1, max: 500 } as const; // mg/dL
export const FAIXA_HORAS_HD = { min: 0.5, max: 12 } as const;
export const FAIXA_UF_L = { min: 0, max: 10 } as const;
export const FAIXA_PESO_HD = { min: 20, max: 300 } as const;
export const META_KTV = 1.4;
export const MINIMO_KTV = 1.2;
export const LIMIAR_TUF = 13; // mL/kg/h
export const LIMIAR_TUF_INTERMEDIARIO = 10;

export type ClasseKtv = 'meta' | 'abaixo-da-meta' | 'abaixo-do-minimo';

export interface EntradaKtv { ureiaPre: string; ureiaPos: string; horas: string; uf: string; peso: string }
export interface ResultadoKtv {
  ok: true; r: number; urr: number; spKtv: number; classe: ClasseKtv; avisos: string[]; texto: string;
}
export interface ErroHd { ok: false; campos: string[]; mensagem: string }

const num = (t: string) => parseFloat(String(t).replace(',', '.'));
const br = (n: number, c = 2) => n.toFixed(c).replace('.', ',');
const arred3 = (n: number) => Math.round(n * 1000) / 1000;

/** Fórmula de Daugirdas (2ª geração). Devolve NaN se R − 0,008·t ≤ 0 (valores incompatíveis). */
export function spKtvDaugirdas(r: number, horas: number, ufL: number, pesoKg: number): number {
  const x = r - 0.008 * horas;
  if (x <= 0) return NaN;
  return -Math.log(x) + (4 - 3.5 * r) * (ufL / pesoKg);
}

export function classificarKtv(spKtvArredondado: number): ClasseKtv {
  if (spKtvArredondado >= META_KTV) return 'meta';
  if (spKtvArredondado >= MINIMO_KTV) return 'abaixo-da-meta';
  return 'abaixo-do-minimo';
}

export function calcularKtv(e: EntradaKtv): ResultadoKtv | ErroHd {
  const pre = num(e.ureiaPre), pos = num(e.ureiaPos), h = num(e.horas), uf = num(e.uf), w = num(e.peso);
  const campos: string[] = [];
  if (!(Number.isFinite(pre) && dentroDaFaixa(pre, FAIXA_UREIA))) campos.push('ureiaPre');
  if (!(Number.isFinite(pos) && dentroDaFaixa(pos, FAIXA_UREIA))) campos.push('ureiaPos');
  if (!(Number.isFinite(h) && dentroDaFaixa(h, FAIXA_HORAS_HD))) campos.push('horas');
  if (!(Number.isFinite(uf) && dentroDaFaixa(uf, FAIXA_UF_L))) campos.push('uf');
  if (!(Number.isFinite(w) && dentroDaFaixa(w, FAIXA_PESO_HD))) campos.push('peso');
  if (campos.length) return { ok: false, campos, mensagem: 'Preencha os campos destacados com valores válidos' };
  if (pos >= pre) return { ok: false, campos: ['ureiaPos'], mensagem: 'A ureia pós-diálise deve ser menor que a pré-diálise. Confira os valores e a coleta' };
  const r = pos / pre;
  if (r - 0.008 * h <= 0) return { ok: false, campos: ['ureiaPos', 'horas'], mensagem: 'Valores incompatíveis (ureia pós muito baixa para a duração informada). Confira os dados' };

  const sp = arred3(spKtvDaugirdas(r, h, uf, w));
  const urr = arred3(100 * (1 - r));
  const avisos: string[] = [];
  if (sp > 3) avisos.push('spKt/V muito alto para uma sessão convencional: confira a amostra de ureia pós (coleta tardia ou com sangue recirculado altera o resultado) e as unidades.');
  avisos.push('A ureia pós deve ser coletada com a técnica de fluxo lento (ou parada do dialisato) logo ao final: coleta precoce superestima o Kt/V e coleta tardia subestima.');
  const classe = classificarKtv(sp);
  const rotulo = classe === 'meta' ? 'Dentro da meta (≥ 1,4)' : classe === 'abaixo-da-meta' ? 'Acima do mínimo (1,2), mas abaixo da meta de 1,4' : 'Abaixo do mínimo entregue (1,2)';
  let texto = `spKt/V: ${br(sp)}\nURR: ${br(urr, 1)}%\n${rotulo}`;
  return { ok: true, r, urr, spKtv: sp, classe, avisos, texto };
}

// ── Taxa de ultrafiltração ────────────────────────────────────────────────────
export type ClasseTuf = 'baixa' | 'intermediaria' | 'alta';
export interface EntradaTuf { uf: string; pesoSeco: string; horas: string; ganho: string }
export interface ResultadoTuf { ok: true; tuf: number; classe: ClasseTuf; ganhoPct: number | null; avisos: string[]; texto: string }

export function classificarTuf(tufArredondada: number): ClasseTuf {
  if (tufArredondada >= LIMIAR_TUF) return 'alta';
  if (tufArredondada >= LIMIAR_TUF_INTERMEDIARIO) return 'intermediaria';
  return 'baixa';
}

export function calcularTuf(e: EntradaTuf): ResultadoTuf | ErroHd {
  const uf = num(e.uf), w = num(e.pesoSeco), h = num(e.horas);
  const temGanho = e.ganho.trim() !== '';
  const g = num(e.ganho);
  const campos: string[] = [];
  if (!(Number.isFinite(uf) && uf > 0 && uf <= FAIXA_UF_L.max)) campos.push('uf');
  if (!(Number.isFinite(w) && dentroDaFaixa(w, FAIXA_PESO_HD))) campos.push('pesoSeco');
  if (!(Number.isFinite(h) && dentroDaFaixa(h, FAIXA_HORAS_HD))) campos.push('horas');
  if (temGanho && !(Number.isFinite(g) && g >= 0 && g <= 15)) campos.push('ganho');
  if (campos.length) return { ok: false, campos, mensagem: 'Preencha os campos destacados com valores válidos' };
  const tuf = arred3((uf * 1000) / w / h);
  const classe = classificarTuf(tuf);
  const ganhoPct = temGanho ? arred3((g / w) * 100) : null;
  const avisos: string[] = [];
  if (classe === 'alta') avisos.push('Taxa ≥ 13 mL/kg/h: em estudos observacionais (HEMO, Flythe 2011) associou-se a maior mortalidade cardiovascular. Considere sessão mais longa, mais sessões ou menor ganho interdialítico.');
  if (classe === 'intermediaria') avisos.push('Taxa entre 10 e 13 mL/kg/h: faixa intermediária de risco nos estudos observacionais.');
  avisos.push('Não existe meta oficial em diretriz; 13 mL/kg/h é um limiar de qualidade/observacional. Avalie sempre com a pressão, os sintomas intradialíticos e o peso seco.');
  const rotulo = classe === 'alta' ? 'Taxa alta (≥ 13)' : classe === 'intermediaria' ? 'Taxa intermediária (10 a < 13)' : 'Taxa baixa (< 10)';
  let texto = `Taxa de UF: ${br(tuf, 1)} mL/kg/h\n${rotulo}`;
  if (ganhoPct !== null) texto += `\nGanho interdialítico: ${br(ganhoPct, 1)}% do peso seco`;
  return { ok: true, tuf, classe, ganhoPct, avisos, texto };
}
