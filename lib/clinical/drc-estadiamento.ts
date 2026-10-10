// Estadiamento da DRC por TFG (G) e albuminúria (A) e risco (KDIGO 2012; mantido na diretriz KDIGO 2024). Função pura.
export type CategoriaG = 'G1' | 'G2' | 'G3a' | 'G3b' | 'G4' | 'G5';
export type CategoriaA = 'A1' | 'A2' | 'A3';
export type Risco = 'baixo' | 'moderado' | 'alto' | 'muito-alto';
/** rac = relação albumina/creatinina (mg/g); aer = excreção de albumina 24 h (mg/24 h); pcr = proteína/creatinina (mg/g); per = proteína 24 h (mg/24 h). */
export type TipoAlbuminuria = 'rac' | 'aer' | 'pcr' | 'per';

export const FAIXA_TFG = { min: 0.1, max: 200 } as const;
export const FAIXA_ALBUMINURIA = { min: 0, max: 100000 } as const;

export const CATEGORIAS_G: { id: CategoriaG; faixa: string; descricao: string }[] = [
  { id: 'G1', faixa: '≥ 90', descricao: 'normal ou alta' }, { id: 'G2', faixa: '60–89', descricao: 'levemente diminuída' },
  { id: 'G3a', faixa: '45–59', descricao: 'leve a moderadamente diminuída' }, { id: 'G3b', faixa: '30–44', descricao: 'moderada a gravemente diminuída' },
  { id: 'G4', faixa: '15–29', descricao: 'gravemente diminuída' }, { id: 'G5', faixa: '< 15', descricao: 'falência renal' },
];
export const CATEGORIAS_A: { id: CategoriaA; descricao: string }[] = [
  { id: 'A1', descricao: 'normal a levemente aumentada' }, { id: 'A2', descricao: 'moderadamente aumentada' }, { id: 'A3', descricao: 'gravemente aumentada' },
];

/** Mapa de risco do KDIGO: linhas G, colunas A. */
export const RISCO: Record<CategoriaG, [Risco, Risco, Risco]> = {
  G1: ['baixo', 'moderado', 'alto'], G2: ['baixo', 'moderado', 'alto'],
  G3a: ['moderado', 'alto', 'muito-alto'], G3b: ['alto', 'muito-alto', 'muito-alto'],
  G4: ['muito-alto', 'muito-alto', 'muito-alto'], G5: ['muito-alto', 'muito-alto', 'muito-alto'],
};
/** Frequência de monitoramento sugerida (vezes por ano) pelo KDIGO; "4+" = 4 ou mais. */
export const FREQUENCIA: Record<CategoriaG, [string, string, string]> = {
  G1: ['1 (se DRC)', '1', '2'], G2: ['1 (se DRC)', '1', '2'], G3a: ['1', '2', '3'], G3b: ['2', '3', '3'], G4: ['3', '3', '4+'], G5: ['4+', '4+', '4+'],
};
export const ROTULO_RISCO: Record<Risco, string> = {
  baixo: 'Risco baixo', moderado: 'Risco moderadamente aumentado', alto: 'Risco alto', 'muito-alto': 'Risco muito alto',
};

const r3 = (n: number) => Math.round(n * 1000) / 1000;

export function categoriaG(tfg: number): CategoriaG {
  const t = r3(tfg);
  if (t >= 90) return 'G1';
  if (t >= 60) return 'G2';
  if (t >= 45) return 'G3a';
  if (t >= 30) return 'G3b';
  if (t >= 15) return 'G4';
  return 'G5';
}

/** Cortes: RAC e AER 30 e 300; PCR e PER 150 e 500. A2 inclui os limites (30–300 e 150–500). */
export function categoriaA(tipo: TipoAlbuminuria, valor: number): CategoriaA {
  const [c1, c2] = tipo === 'rac' || tipo === 'aer' ? [30, 300] : [150, 500];
  const v = r3(valor);
  if (v < c1) return 'A1';
  if (v <= c2) return 'A2';
  return 'A3';
}

export interface ResultadoDRC {
  ok: true; g: CategoriaG; a: CategoriaA; risco: Risco; frequencia: string; encaminhar: boolean; texto: string; avisos: string[];
}
export interface ErroDRC { ok: false; campos: string[]; mensagem: string }

const num = (t: string) => parseFloat(String(t).replace(',', '.'));

export function estadiarDRC(e: { tfg: string; tipo: TipoAlbuminuria | ''; albuminuria: string }): ResultadoDRC | ErroDRC {
  const campos: string[] = [];
  const t = num(e.tfg), a = num(e.albuminuria);
  if (!(Number.isFinite(t) && t >= FAIXA_TFG.min && t <= FAIXA_TFG.max)) campos.push('tfg');
  if (e.tipo === '') campos.push('tipo');
  if (!(Number.isFinite(a) && a >= FAIXA_ALBUMINURIA.min && a <= FAIXA_ALBUMINURIA.max)) campos.push('albuminuria');
  if (campos.length) return { ok: false, campos, mensagem: campos.includes('tipo') && campos.length === 1 ? 'Escolha o tipo de exame de albuminúria/proteinúria' : 'Preencha a TFG e a albuminúria com valores válidos' };

  const g = categoriaG(t);
  const ca = categoriaA(e.tipo as TipoAlbuminuria, a);
  const gi = CATEGORIAS_G.findIndex((x) => x.id === g), ai = CATEGORIAS_A.findIndex((x) => x.id === ca);
  const risco = RISCO[g][ai];
  const frequencia = FREQUENCIA[g][ai];
  const encaminhar = g === 'G4' || g === 'G5' || ca === 'A3';
  const avisos: string[] = [];
  if ((g === 'G1' || g === 'G2') && ca === 'A1') avisos.push('TFG G1/G2 com albuminúria normal NÃO caracteriza DRC sem outro marcador de lesão renal (sedimento, imagem, histologia, doença tubular).');
  else if (g === 'G1' || g === 'G2') avisos.push('G1/G2 só caracteriza DRC com marcador de lesão renal (aqui, a albuminúria alterada) presente por mais de 3 meses.');
  else avisos.push('O diagnóstico de DRC exige alteração persistente por mais de 3 meses.');
  if (e.tipo === 'per' || e.tipo === 'pcr') avisos.push('A proteinúria total inclui proteínas que não são albumina; para o seguimento a RAC é preferível.');
  if (encaminhar) avisos.push('TFG < 30 ou albuminúria A3 (RAC > 300 mg/g): considere encaminhar ao nefrologista (KDIGO).');
  const texto = `${g}${ca} — ${ROTULO_RISCO[risco]}\nTFG ${CATEGORIAS_G[gi].faixa} mL/min/1,73 m²: ${CATEGORIAS_G[gi].descricao}\nAlbuminúria ${ca}: ${CATEGORIAS_A[ai].descricao}\nMonitoramento sugerido: ${frequencia} vez(es) por ano`;
  return { ok: true, g, a: ca, risco, frequencia, encaminhar, texto, avisos };
}
