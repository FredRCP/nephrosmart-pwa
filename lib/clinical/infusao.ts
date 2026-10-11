// Conversor de infusão contínua (Onda 8). Função pura.
// Converte DOSE ↔ VELOCIDADE (mL/h) a partir da quantidade de fármaco na solução, do volume final e (se a dose for por kg) do peso.
//   concentração (C)  = quantidade ÷ volume final            (ex.: 16 mg em 250 mL = 0,064 mg/mL = 64 mcg/mL)
//   velocidade (mL/h) = dose por hora ÷ C                       (dose por hora = dose × peso, se "por kg"; × 60, se "por min")
//   dose              = velocidade × C ÷ (peso se "por kg") ÷ (60 se "por min")
// Tudo é feito na unidade-base do fármaco (mcg para massa; UI para unidades internacionais).

export type Massa = 'mcg' | 'mg' | 'UI';
export interface UnidadeDose { id: string; texto: string; massa: Massa; porKg: boolean; porMin: boolean }

export const UNIDADES_DOSE: UnidadeDose[] = [
  { id: 'mcg/kg/min', texto: 'mcg/kg/min', massa: 'mcg', porKg: true, porMin: true },
  { id: 'mcg/kg/h', texto: 'mcg/kg/h', massa: 'mcg', porKg: true, porMin: false },
  { id: 'mg/kg/min', texto: 'mg/kg/min', massa: 'mg', porKg: true, porMin: true },
  { id: 'mg/kg/h', texto: 'mg/kg/h', massa: 'mg', porKg: true, porMin: false },
  { id: 'mcg/min', texto: 'mcg/min', massa: 'mcg', porKg: false, porMin: true },
  { id: 'mcg/h', texto: 'mcg/h', massa: 'mcg', porKg: false, porMin: false },
  { id: 'mg/min', texto: 'mg/min', massa: 'mg', porKg: false, porMin: true },
  { id: 'mg/h', texto: 'mg/h', massa: 'mg', porKg: false, porMin: false },
  { id: 'UI/kg/h', texto: 'UI/kg/h', massa: 'UI', porKg: true, porMin: false },
  { id: 'UI/h', texto: 'UI/h', massa: 'UI', porKg: false, porMin: false },
  { id: 'UI/min', texto: 'UI/min', massa: 'UI', porKg: false, porMin: true },
];

export type Sentido = 'dose-para-velocidade' | 'velocidade-para-dose';

export const FAIXA_QUANTIDADE = { min: 0.001, max: 1_000_000 } as const; // na unidade informada
export const FAIXA_VOLUME_ML = { min: 1, max: 5000 } as const;
export const FAIXA_PESO_INFUSAO = { min: 0.3, max: 400 } as const; // kg (neonato a obeso)
export const FAIXA_DOSE = { min: 0.0001, max: 100000 } as const;
export const FAIXA_VELOCIDADE = { min: 0.01, max: 2000 } as const; // mL/h
/** Acima disso, a bomba comum raramente consegue e quase sempre é erro de unidade. */
export const VELOCIDADE_ALTA = 500; // mL/h
export const VELOCIDADE_BAIXA = 1; // mL/h

export interface EntradaInfusao {
  sentido: Sentido;
  /** quantidade total do fármaco na solução */
  quantidade: string;
  /** unidade da quantidade: mg, mcg ou UI */
  unidadeQuantidade: Massa | '';
  /** volume FINAL da solução (fármaco + diluente), em mL */
  volume: string;
  peso: string;
  unidadeDose: string;
  /** dose desejada (sentido 1) ou velocidade da bomba em mL/h (sentido 2) */
  valor: string;
}

export interface ResultadoInfusao {
  ok: true;
  velocidade: number | null; // mL/h
  dose: number | null;
  unidadeDose: string;
  concentracaoTexto: string;
  avisos: string[];
  texto: string;
}
export interface ErroInfusao { ok: false; campos: string[]; mensagem: string }

const num = (t: string) => parseFloat(String(t).replace(',', '.'));
const BASE: Record<Massa, number> = { mcg: 1, mg: 1000, UI: 1 }; // fator para a unidade-base (mcg ou UI)

/** 3 algarismos significativos, vírgula decimal (0,152 · 6,56 · 125 · 0,0640). */
export function formatar(n: number): string {
  if (n === 0) return '0';
  const dec = n >= 100 ? 0 : n >= 10 ? 1 : n >= 1 ? 2 : n >= 0.1 ? 3 : n >= 0.01 ? 4 : 5;
  return n.toFixed(dec).replace('.', ',');
}

function textoConcentracao(qtdBase: number, volume: number, massa: Massa): string {
  const c = qtdBase / volume; // mcg/mL ou UI/mL
  if (massa === 'UI') return `${formatar(c)} UI/mL`;
  return `${formatar(c)} mcg/mL (${formatar(c / 1000)} mg/mL)`;
}

export function calcularInfusao(e: EntradaInfusao): ResultadoInfusao | ErroInfusao {
  const u = UNIDADES_DOSE.find((x) => x.id === e.unidadeDose);
  const campos: string[] = [];
  const q = num(e.quantidade), vol = num(e.volume), valor = num(e.valor), peso = num(e.peso);
  const d2v = e.sentido === 'dose-para-velocidade';
  if (!(Number.isFinite(q) && q >= FAIXA_QUANTIDADE.min && q <= FAIXA_QUANTIDADE.max)) campos.push('quantidade');
  if (!e.unidadeQuantidade) campos.push('unidadeQuantidade');
  if (!(Number.isFinite(vol) && vol >= FAIXA_VOLUME_ML.min && vol <= FAIXA_VOLUME_ML.max)) campos.push('volume');
  if (!u) campos.push('unidadeDose');
  if (u?.porKg && !(Number.isFinite(peso) && peso >= FAIXA_PESO_INFUSAO.min && peso <= FAIXA_PESO_INFUSAO.max)) campos.push('peso');
  const faixaValor = d2v ? FAIXA_DOSE : FAIXA_VELOCIDADE;
  if (!(Number.isFinite(valor) && valor >= faixaValor.min && valor <= faixaValor.max)) campos.push('valor');
  if (campos.length) return { ok: false, campos, mensagem: 'Preencha os campos destacados com valores válidos' };

  const un = u as UnidadeDose;
  const massaQ = e.unidadeQuantidade as Massa;
  // UI só combina com UI; mg e mcg combinam entre si.
  if ((massaQ === 'UI') !== (un.massa === 'UI')) {
    return { ok: false, campos: ['unidadeQuantidade', 'unidadeDose'], mensagem: 'A unidade da dose precisa ser compatível com a do fármaco (mg/mcg com mg/mcg; UI com UI)' };
  }
  const qtdBase = q * BASE[massaQ];
  const c = qtdBase / vol; // base por mL
  const fatorDose = BASE[un.massa] * (un.porKg ? peso : 1) * (un.porMin ? 60 : 1); // base por hora para dose = 1
  const avisos: string[] = [];
  let velocidade: number | null = null;
  let dose: number | null = null;
  let texto: string;
  if (d2v) {
    velocidade = Math.round(((valor * fatorDose) / c) * 1000) / 1000;
    texto = `${formatar(valor)} ${un.texto} → ${formatar(velocidade)} mL/h`;
    if (velocidade > VELOCIDADE_ALTA) avisos.push(`Velocidade acima de ${VELOCIDADE_ALTA} mL/h: confira as unidades (mg × mcg) e o volume; considere uma solução mais concentrada.`);
    else if (velocidade < VELOCIDADE_BAIXA) avisos.push('Velocidade abaixo de 1 mL/h: a precisão da bomba cai nessa faixa; considere uma solução mais diluída.');
  } else {
    dose = Math.round(((valor * c) / fatorDose) * 100000) / 100000;
    texto = `${formatar(valor)} mL/h → ${formatar(dose)} ${un.texto}`;
  }
  texto += `\nConcentração: ${textoConcentracao(qtdBase, vol, massaQ === 'UI' ? 'UI' : 'mcg')}`;
  if (un.porKg) avisos.push(`Peso usado: ${formatar(peso)} kg. Confirme qual peso o protocolo do fármaco pede (real, ideal ou ajustado).`);
  return { ok: true, velocidade, dose, unidadeDose: un.texto, concentracaoTexto: textoConcentracao(qtdBase, vol, massaQ === 'UI' ? 'UI' : 'mcg'), avisos, texto };
}
