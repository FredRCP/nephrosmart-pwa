// Anemia na DRC — regras da KDIGO 2026 (Kidney Int 2026;109(1S)), Onda 9. Função pura.
// SÓ entram regras com trecho literal conferido no PDF oficial. Não prescreve: mostra a recomendação, o grau e a fonte.
//   Rec 2.1 (2D) G5HD: iniciar ferro se ferritina ≤ 500 ng/mL e TSAT ≤ 30%.  Rec 2.2 (2D): preferir ferro IV.
//   Rec 2.3 (2D) sem diálise ou DP: ferritina < 100 e TSAT < 40%, ou ferritina ≥ 100 e < 300 com TSAT < 25%.  Rec 2.4 (2D): oral ou IV.
//   PP 2.2: é razoável suspender o ferro de rotina se ferritina > 700 ng/mL ou TSAT ≥ 40%.  PP 2.8: considerar suspender na infecção sistêmica.
//   Rec 3.2.1 (2D) diálise: sugere AEE se Hb ≤ 9,0–10,0 g/dL.  Rec 3.3.1 (1D): Hb-alvo abaixo de 11,5 g/dL.
//   PP 3.4.1.2: Hb > 1,0 g/dL em 2–4 semanas após iniciar AEE → reduzir a dose em 25–50%.
//   Rec 3.1.1 (2D): AEE, e não HIF-PHI, como 1ª linha.  PP 3.7.1–3.7.6: hiporresponsividade, HIF-PHI e aplasia pura de série vermelha.
import { dentroDaFaixa } from './faixas';

export type TipoPaciente = '' | 'hd' | 'dp' | 'nd';
export type NivelAlerta = 'info' | 'atencao' | 'perigo';

export interface EntradaAnemia {
  tipo: TipoPaciente;
  hb: string; ferritina: string; tsat: string;
  emAee: boolean;
  /** AEE iniciado há 4 semanas ou menos (para a regra de subida rápida da Hb) */
  aeeRecente: boolean;
  hbAnterior: string; semanas: string;
  infeccao: boolean;
  hipoResposta: boolean;
  suspeitaAplasia: boolean;
  malignidade: boolean; eventoCv: boolean; trombose: boolean; gravidez: boolean; hepatopatia: boolean;
}
export interface Alerta { id: string; nivel: NivelAlerta; titulo: string; texto: string; fonte: string }
export interface ResultadoAnemia { ok: true; alertas: Alerta[] }
export interface ErroAnemia { ok: false; campos: string[]; mensagem: string }

export const FAIXA_HB = { min: 3, max: 25 } as const;
export const FAIXA_FERRITINA = { min: 1, max: 10000 } as const;
export const FAIXA_TSAT = { min: 1, max: 100 } as const;
export const FAIXA_SEMANAS = { min: 0.5, max: 52 } as const;
export const HB_ALVO_MAX = 11.5;
export const HB_INICIO_AEE = 10;
export const FERRITINA_SUSPENDER = 700;
export const TSAT_SUSPENDER = 40;

const num = (t: string) => parseFloat(String(t).replace(',', '.'));
const vazio = (t: string) => t.trim() === '';
const arred3 = (n: number) => Math.round(n * 1000) / 1000;
const br = (n: number) => String(arred3(n)).replace('.', ',');

export const CAUSAS_HIPORRESPONSIVIDADE: string[] = [
  'Deficiência de ferro e inflamação (as mais comuns): infecções, cateter de diálise, doença autoimune.',
  'Hiperparatireoidismo.',
  'Perdas sanguíneas: trato gastrointestinal, procedimento de diálise, menstruação.',
  'Diálise inadequada.',
  'Malignidade.',
  'Doenças hematológicas: hemoglobinopatias, mieloma múltiplo, hemólise, aplasia pura de série vermelha mediada por anticorpos.',
  'Deficiências de cobre, zinco, folato, vitamina B12, carnitina e vitamina E.',
  'Medicamentos: inibição do sistema renina-angiotensina.',
  'Sem causa esclarecida em cerca de 30% dos casos.',
];

export function avaliarAnemia(e: EntradaAnemia): ResultadoAnemia | ErroAnemia {
  const campos: string[] = [];
  if (!e.tipo) campos.push('tipo');
  const opc = (campo: string, v: string, f: { min: number; max: number }): number | null => {
    if (vazio(v)) return null;
    const n = num(v);
    if (!(Number.isFinite(n) && dentroDaFaixa(n, f))) { campos.push(campo); return null; }
    return n;
  };
  const hb = opc('hb', e.hb, FAIXA_HB);
  const fer = opc('ferritina', e.ferritina, FAIXA_FERRITINA);
  const ts = opc('tsat', e.tsat, FAIXA_TSAT);
  const hbAnt = opc('hbAnterior', e.hbAnterior, FAIXA_HB);
  const sem = opc('semanas', e.semanas, FAIXA_SEMANAS);
  if ((hbAnt === null) !== (sem === null) && !campos.includes('hbAnterior') && !campos.includes('semanas')) campos.push(hbAnt === null ? 'hbAnterior' : 'semanas');
  if (hbAnt !== null && hb === null && !campos.includes('hb')) campos.push('hb');
  if (campos.length) return { ok: false, campos, mensagem: campos.length === 1 && campos[0] === 'tipo' ? 'Escolha o tipo de paciente' : 'Preencha os campos destacados com valores válidos' };

  const a: Alerta[] = [];
  const dialise = e.tipo === 'hd' || e.tipo === 'dp';

  // ── Ferro ──
  if (fer !== null && ts !== null) {
    const suspender = fer > FERRITINA_SUSPENDER || ts >= TSAT_SUSPENDER;
    if (suspender) {
      a.push({ id: 'ferro-suspender', nivel: 'atencao', titulo: 'Ferro de rotina: considerar suspender',
        texto: `Ferritina ${br(fer)} ng/mL, TSAT ${br(ts)}%. A KDIGO considera razoável suspender o ferro de rotina se ferritina > 700 ng/mL ou TSAT ≥ 40%.`, fonte: 'KDIGO 2026, ponto de prática 2.2' });
    } else if (e.tipo === 'hd' && fer <= 500 && ts <= 30) {
      a.push({ id: 'ferro-iniciar', nivel: 'atencao', titulo: 'Considerar iniciar ferro (hemodiálise)',
        texto: `Ferritina ${br(fer)} ng/mL e TSAT ${br(ts)}%: dentro dos critérios de ferritina ≤ 500 e TSAT ≤ 30%. A KDIGO sugere ferro intravenoso em vez de oral ao iniciar. Recomendação condicional.`, fonte: 'KDIGO 2026, recomendações 2.1 e 2.2 (2D)' });
    } else if (e.tipo !== 'hd' && ((fer < 100 && ts < 40) || (fer >= 100 && fer < 300 && ts < 25))) {
      a.push({ id: 'ferro-iniciar', nivel: 'atencao', titulo: e.tipo === 'dp' ? 'Considerar iniciar ferro (diálise peritoneal)' : 'Considerar iniciar ferro (sem diálise)',
        texto: `Ferritina ${br(fer)} ng/mL e TSAT ${br(ts)}%: dentro dos critérios para sugerir ferro. A escolha entre ferro oral e intravenoso (sem hemodiálise) segue os valores e preferências do paciente. Recomendação condicional.`, fonte: 'KDIGO 2026, recomendações 2.3 e 2.4 (2D)' });
    } else {
      a.push({ id: 'ferro-sem-criterio', nivel: 'info', titulo: 'Ferro: sem critério de início nem de suspensão',
        texto: 'Os valores informados não preenchem os critérios de início nem de suspensão do ferro da KDIGO 2026.', fonte: 'KDIGO 2026, recomendações 2.1–2.4 e ponto de prática 2.2' });
    }
    if (e.infeccao) {
      a.push({ id: 'ferro-infeccao', nivel: 'atencao', titulo: 'Infecção sistêmica ativa',
        texto: 'Considere suspender temporariamente o ferro durante a infecção sistêmica (consenso, sem grau).', fonte: 'KDIGO 2026, ponto de prática 2.8' });
    }
  } else if (e.infeccao) {
    a.push({ id: 'ferro-infeccao', nivel: 'atencao', titulo: 'Infecção sistêmica ativa',
      texto: 'Considere suspender temporariamente o ferro durante a infecção sistêmica (consenso, sem grau).', fonte: 'KDIGO 2026, ponto de prática 2.8' });
  }

  // ── Hemoglobina e AEE ──
  if (hb !== null) {
    if (e.emAee) {
      if (hb >= HB_ALVO_MAX) {
        a.push({ id: 'hb-acima', nivel: 'perigo', titulo: 'Hb acima do alvo durante o AEE',
          texto: `Hb ${br(hb)} g/dL. A KDIGO recomenda manter a Hb abaixo de 11,5 g/dL. Reavalie o tratamento; a dose não é alterada automaticamente.`, fonte: 'KDIGO 2026, recomendação 3.3.1 (1D)' });
      }
    } else if (dialise && hb <= HB_INICIO_AEE) {
      a.push({ id: 'aee-iniciar', nivel: 'atencao', titulo: 'Faixa em que se sugere considerar AEE (diálise)',
        texto: `Hb ${br(hb)} g/dL. Em diálise, a KDIGO sugere considerar AEE com Hb ≤ 9,0–10,0 g/dL, depois de abordar as causas corrigíveis e individualizar o risco e o benefício. Não é um corte universal.`, fonte: 'KDIGO 2026, recomendação 3.2.1 (2D)' });
    } else if (e.tipo === 'nd') {
      a.push({ id: 'aee-nd', nivel: 'info', titulo: 'Sem diálise: individualizar o início do AEE',
        texto: 'Não há limiar fixo: a KDIGO pede individualizar conforme sintomas, riscos do AEE e riscos de transfusão. O limiar da diálise não se aplica automaticamente.', fonte: 'KDIGO 2026, capítulo 3' });
    }
  }

  // ── Subida rápida da Hb ──
  if (hb !== null && hbAnt !== null && sem !== null && e.emAee && e.aeeRecente) {
    const delta = arred3(hb - hbAnt);
    if (sem <= 4 && delta > 1) {
      a.push({ id: 'hb-subida', nivel: 'atencao', titulo: 'Aumento rápido da Hb após iniciar o AEE',
        texto: `Hb de ${br(hbAnt)} para ${br(hb)} g/dL (+${br(delta)}) em ${br(sem)} semanas. A KDIGO orienta reduzir a dose do AEE em 25–50% quando a Hb sobe mais de 1,0 g/dL em 2–4 semanas. Decisão do médico.`, fonte: 'KDIGO 2026, ponto de prática 3.4.1.2' });
    }
  }

  // ── Hiporresponsividade ──
  if (e.hipoResposta) {
    a.push({ id: 'hipo', nivel: 'info', titulo: 'Hiporresponsividade ao AEE',
      texto: 'Hb que não atinge a meta apesar de aumento significativo da dose, ou que exige doses altas para se manter. A KDIGO não define um corte único de dose. Conduta: 1) investigar e tratar as causas; 2) reavaliar a Hb e a dose; 3) não escalar o AEE automaticamente.', fonte: 'KDIGO 2026, seção 3.7, ponto de prática 3.7.1' });
  }
  if (e.suspeitaAplasia) {
    a.push({ id: 'prca', nivel: 'perigo', titulo: 'Suspeita de aplasia pura de série vermelha (AEE)',
      texto: 'Queda súbita da Hb apesar do AEE, com reticulocitopenia e leucócitos e plaquetas normais. A KDIGO orienta suspender o AEE, transfundir conforme a clínica e considerar encaminhar à hematologia.', fonte: 'KDIGO 2026, ponto de prática 3.7.6' });
  }

  // ── HIF-PHI ──
  const naoUsar = [e.malignidade && 'malignidade ativa', e.eventoCv && 'evento cardiovascular recente', e.trombose && 'trombose vascular recente'].filter(Boolean) as string[];
  if (naoUsar.length) {
    a.push({ id: 'hif-nao', nivel: 'perigo', titulo: 'HIF-PHI: não usar',
      texto: `Fator presente: ${naoUsar.join(', ')}. A KDIGO orienta não usar inibidores da prolil-hidroxilase (HIF-PHI) nessa situação.`, fonte: 'KDIGO 2026, ponto de prática 3.7.5' });
  }
  if (e.gravidez) {
    a.push({ id: 'hif-gravidez', nivel: 'perigo', titulo: 'HIF-PHI: gravidez',
      texto: 'Contraindicação descrita na tabela 6 da KDIGO 2026. Conferir a bula do fármaco.', fonte: 'KDIGO 2026, tabela 6 (conferir página)' });
  }
  if (e.hepatopatia) {
    a.push({ id: 'hif-figado', nivel: 'atencao', titulo: 'HIF-PHI: insuficiência hepática significativa',
      texto: 'Uso não recomendado (tabela 6). Conferir a bula específica.', fonte: 'KDIGO 2026, tabela 6 (conferir página)' });
  }
  return { ok: true, alertas: a };
}
