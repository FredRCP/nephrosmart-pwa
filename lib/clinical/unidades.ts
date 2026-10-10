// Conversor de unidades laboratoriais (Onda 7, ferramenta nova). Funções puras.
// Os fatores vêm das massas molares (g/mol), não de números decorados:
//   creatinina 113,12 · ureia 60,06 · nitrogênio 28,014 · cálcio 40,078 · magnésio 24,305 · fósforo 30,974 · glicose 180,156 · ácido úrico 168,11.
// 1 mmol/L = MM/10 mg/dL e 1 µmol/L = MM/10000 mg/dL. PTH (1-84): 1 pmol/L = 9,43 pg/mL. 25-OH vitamina D: 1 nmol/L = 0,4006 ng/mL.
// Sódio, potássio, cloreto e bicarbonato: mEq/L = mmol/L (não precisam de conversão).

export type IdAnalito = 'creatinina' | 'ureia' | 'calcio' | 'magnesio' | 'fosforo' | 'glicose' | 'acido-urico' | 'albumina' | 'hemoglobina' | 'pth' | 'vitamina-d';

/** `fator` = quanto vale 1 desta unidade na unidade BASE do analito (a primeira da lista). */
export interface Unidade { id: string; rotulo: string; fator: number }
export interface Analito { id: IdAnalito; nome: string; unidades: Unidade[]; nota?: string }

export const ANALITOS: Analito[] = [
  { id: 'creatinina', nome: 'Creatinina', unidades: [
    { id: 'mgdl', rotulo: 'mg/dL', fator: 1 }, { id: 'umol', rotulo: 'µmol/L', fator: 113.12 / 10000 }] },
  { id: 'ureia', nome: 'Ureia / BUN', nota: 'Ureia (mg/dL) = BUN × 2,14. O "BUN" dos EUA mede só o nitrogênio da ureia.', unidades: [
    { id: 'ureia-mgdl', rotulo: 'Ureia (mg/dL)', fator: 1 }, { id: 'bun-mgdl', rotulo: 'BUN (mg/dL)', fator: 60.06 / 28.014 },
    { id: 'ureia-mmol', rotulo: 'Ureia (mmol/L)', fator: 60.06 / 10 }] },
  { id: 'calcio', nome: 'Cálcio total', unidades: [
    { id: 'mgdl', rotulo: 'mg/dL', fator: 1 }, { id: 'mmol', rotulo: 'mmol/L', fator: 40.078 / 10 }, { id: 'meq', rotulo: 'mEq/L', fator: 40.078 / 20 }] },
  { id: 'magnesio', nome: 'Magnésio', unidades: [
    { id: 'mgdl', rotulo: 'mg/dL', fator: 1 }, { id: 'mmol', rotulo: 'mmol/L', fator: 24.305 / 10 }, { id: 'meq', rotulo: 'mEq/L', fator: 24.305 / 20 }] },
  { id: 'fosforo', nome: 'Fósforo (fosfato)', nota: 'mg/dL de fósforo elementar.', unidades: [
    { id: 'mgdl', rotulo: 'mg/dL', fator: 1 }, { id: 'mmol', rotulo: 'mmol/L', fator: 30.974 / 10 }] },
  { id: 'glicose', nome: 'Glicose', unidades: [
    { id: 'mgdl', rotulo: 'mg/dL', fator: 1 }, { id: 'mmol', rotulo: 'mmol/L', fator: 180.156 / 10 }] },
  { id: 'acido-urico', nome: 'Ácido úrico', unidades: [
    { id: 'mgdl', rotulo: 'mg/dL', fator: 1 }, { id: 'umol', rotulo: 'µmol/L', fator: 168.11 / 10000 }] },
  { id: 'albumina', nome: 'Albumina', unidades: [{ id: 'gdl', rotulo: 'g/dL', fator: 1 }, { id: 'gl', rotulo: 'g/L', fator: 0.1 }] },
  { id: 'hemoglobina', nome: 'Hemoglobina', unidades: [{ id: 'gdl', rotulo: 'g/dL', fator: 1 }, { id: 'gl', rotulo: 'g/L', fator: 0.1 }] },
  { id: 'pth', nome: 'PTH', nota: 'PTH intacto (1-84). pg/mL = ng/L.', unidades: [{ id: 'pgml', rotulo: 'pg/mL', fator: 1 }, { id: 'pmol', rotulo: 'pmol/L', fator: 9.43 }] },
  { id: 'vitamina-d', nome: 'Vitamina D (25-OH)', unidades: [{ id: 'ngml', rotulo: 'ng/mL', fator: 1 }, { id: 'nmol', rotulo: 'nmol/L', fator: 0.4006 }] },
];

export const FAIXA_VALOR_UNIDADE = { min: 0.0001, max: 1000000 } as const;

export interface SaidaConversao { id: string; rotulo: string; valor: number; texto: string }
export interface ResultadoConversao { ok: true; analito: string; entrada: string; saidas: SaidaConversao[]; texto: string }
export interface ErroConversao { ok: false; mensagem: string }

/** 4 algarismos significativos, vírgula decimal, sem notação científica. */
export function formatarValor(v: number): string {
  const n = Number(v.toPrecision(4));
  return String(n).replace('.', ',');
}

export function converterUnidade(e: { analito: IdAnalito; valor: string; de: string }): ResultadoConversao | ErroConversao {
  const a = ANALITOS.find((x) => x.id === e.analito);
  const origem = a?.unidades.find((u) => u.id === e.de);
  if (!a || !origem) return { ok: false, mensagem: 'Escolha o exame e a unidade de origem' };
  const v = parseFloat(String(e.valor).replace(',', '.'));
  if (!Number.isFinite(v) || v < FAIXA_VALOR_UNIDADE.min || v > FAIXA_VALOR_UNIDADE.max) return { ok: false, mensagem: 'Digite um valor maior que zero' };
  const base = v * origem.fator;
  const saidas = a.unidades.filter((u) => u.id !== origem.id).map((u) => {
    const valor = base / u.fator;
    return { id: u.id, rotulo: u.rotulo, valor, texto: `${formatarValor(valor)} ${u.rotulo}` };
  });
  const entrada = `${formatarValor(v)} ${origem.rotulo}`;
  return { ok: true, analito: a.nome, entrada, saidas, texto: `${entrada} =\n${saidas.map((s) => s.texto).join('\n')}` };
}
