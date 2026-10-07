// Faixas de plausibilidade aprovadas pelo Fred (DIVERGENCIAS.md: IMC-1, CKD-2).
// Valores fora da faixa NÃO são calculados: quase sempre indicam erro de digitação ou de unidade.
export const FAIXAS = {
  pesoKg: { min: 1, max: 500 },
  alturaCm: { min: 50, max: 250 },
  idadeAnos: { min: 1, max: 120 },
  creatininaMgDl: { min: 0.1, max: 30 },
} as const;

export const dentroDaFaixa = (valor: number, f: { min: number; max: number }): boolean => valor >= f.min && valor <= f.max;

/** Formata número para mensagens em português: 0.1 → "0,1". */
export const fmt = (n: number): string => String(n).replace('.', ',');
