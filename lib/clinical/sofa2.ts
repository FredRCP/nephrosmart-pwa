// SOFA-2 (Ranzani OT et al., JAMA 2025;doi:10.1001/jama.2025.20516; Moreno R et al., JAMA Netw Open 2025). Função pura.
// Total 0–24 (6 sistemas × 0–4). Usar o PIOR valor das 24 h. Dado ausente no 1º dia = 0 (sinalizado ao usuário).
// Diferenças em relação ao SOFA original: relação P/F com suporte ventilatório avançado (inclui cateter nasal de alto fluxo e VNI),
// SpO2/FiO2 como substituto, ECMO, bilirrubina/plaquetas/creatinina com novos cortes, delirium no SNC,
// noradrenalina+adrenalina somadas (como BASE), suporte circulatório mecânico e critérios de TRS no renal.
import { dentroDaFaixa } from './faixas';

export type UnidadeLab = 'mg/dL' | 'umol/L';
export type DiureseSofa = '' | 'normal' | '6-12h' | '12h' | '24h';

export interface EntradaSofa {
  // respiratório
  pao2: string; spo2: string; fio2: string; suporteAvancado: boolean; ecmoResp: boolean;
  // coagulação
  plaquetas: string;
  // fígado
  bilirrubina: string;
  // SNC
  gcs: string; deliriumFarmaco: boolean; motorGrave: boolean;
  // renal
  creatinina: string; diurese: DiureseSofa; emTrs: boolean; criteriosTrs: boolean;
  // cardiovascular
  pam: string; noradrenalina: string; adrenalina: string; dopamina: string; outroVaso: boolean; suporteMecanico: boolean; semVasoativosPorLimite: boolean;
  unidade: UnidadeLab;
}

export type Sistema = 'resp' | 'coag' | 'figado' | 'snc' | 'renal' | 'cardio';
export interface PontoSistema { pontos: number; semDado: boolean; motivo: string }
export interface ResultadoSofa { ok: true; total: number; sistemas: Record<Sistema, PontoSistema>; semDado: Sistema[]; avisos: string[]; texto: string }
export interface ErroSofa { ok: false; campos: string[]; mensagem: string }

export const NOMES_SISTEMA: Record<Sistema, string> = {
  resp: 'Respiratório', coag: 'Coagulação', figado: 'Fígado', snc: 'Sistema nervoso central', renal: 'Renal', cardio: 'Cardiovascular',
};

const num = (t: string) => parseFloat(String(t).replace(',', '.'));
const vazio = (t: string) => t.trim() === '';
const arred3 = (n: number) => Math.round(n * 1000) / 1000;
const br = (n: number) => String(arred3(n)).replace('.', ',');

export const FATOR_BILIRRUBINA = 17.104; // µmol/L por mg/dL
export const FATOR_CREATININA = 88.4; // µmol/L por mg/dL

// ── pontuação por sistema (exportadas para teste) ────────────────────────────
/** razao = P/F (mmHg) ou S/F; suporte = suporte ventilatório avançado. */
export function pontosRespiratorio(razao: number, suporte: boolean, ehSpo2: boolean): number {
  const r = arred3(razao);
  const cortes = ehSpo2 ? { c1: 300, c2: 250, c3: 200, c4: 120 } : { c1: 300, c2: 225, c3: 150, c4: 75 };
  let p = 0;
  if (r <= cortes.c1) p = 1;
  if (r <= cortes.c2) p = 2;
  if (r <= cortes.c3) p = 3;
  if (r <= cortes.c4) p = 4;
  return suporte ? p : Math.min(p, 2);
}
export const pontosPlaquetas = (p: number): number => (p > 150 ? 0 : p > 100 ? 1 : p > 80 ? 2 : p > 50 ? 3 : 4);
export const pontosBilirrubina = (mgDl: number): number => { const b = arred3(mgDl); return b <= 1.2 ? 0 : b <= 3 ? 1 : b <= 6 ? 2 : b <= 12 ? 3 : 4; };
export function pontosSnc(gcs: number, delirium: boolean, motorGrave: boolean): number {
  if (motorGrave) return 4;
  const g = gcs <= 5 ? 4 : gcs <= 8 ? 3 : gcs <= 12 ? 2 : gcs <= 14 ? 1 : 0;
  return g === 0 && delirium ? 1 : g;
}
export function pontosCreatinina(mgDl: number): number { const c = arred3(mgDl); return c <= 1.2 ? 0 : c <= 2 ? 1 : c <= 3.5 ? 2 : 3; }
export const PONTOS_DIURESE: Record<Exclude<DiureseSofa, ''>, number> = { normal: 0, '6-12h': 1, '12h': 2, '24h': 3 };
export const pontosPamSemDroga = (pam: number): number => (pam >= 70 ? 0 : pam >= 60 ? 1 : pam >= 50 ? 2 : pam >= 40 ? 3 : 4);

export function pontosCardio(a: { pam: number | null; ne: number; epi: number; dopa: number; outro: boolean; mecanico: boolean; limite: boolean }): { pontos: number; motivo: string } {
  const soma = arred3(a.ne + a.epi);
  const outro = a.outro || a.dopa > 0;
  if (a.mecanico) return { pontos: 4, motivo: 'suporte circulatório mecânico' };
  if (soma > 0.4) return { pontos: 4, motivo: 'noradrenalina + adrenalina > 0,4 µg/kg/min' };
  if (soma > 0.2) return outro ? { pontos: 4, motivo: 'noradrenalina + adrenalina > 0,2–0,4 com outro agente' } : { pontos: 3, motivo: 'noradrenalina + adrenalina > 0,2–0,4 µg/kg/min' };
  if (soma > 0) return outro ? { pontos: 3, motivo: 'noradrenalina + adrenalina ≤ 0,2 com outro agente' } : { pontos: 2, motivo: 'noradrenalina + adrenalina ≤ 0,2 µg/kg/min' };
  if (a.dopa > 40) return { pontos: 4, motivo: 'dopamina > 40 µg/kg/min' };
  if (a.dopa > 20) return { pontos: 3, motivo: 'dopamina > 20–40 µg/kg/min' };
  if (a.dopa > 0) return { pontos: 2, motivo: 'dopamina ≤ 20 µg/kg/min' };
  if (outro) return { pontos: 2, motivo: 'outro vasopressor/inotrópico' };
  if (a.pam === null) return { pontos: 0, motivo: 'sem dado' };
  if (a.limite) return { pontos: pontosPamSemDroga(a.pam), motivo: `sem vasoativos (limite terapêutico): PAM ${br(a.pam)}` };
  return { pontos: a.pam >= 70 ? 0 : 1, motivo: a.pam >= 70 ? 'PAM ≥ 70 sem vasoativos' : 'PAM < 70 sem vasoativos' };
}

export function calcularSofa2(e: EntradaSofa): ResultadoSofa | ErroSofa {
  const campos: string[] = [];
  const opc = (campo: string, v: string, min: number, max: number): number | null => {
    if (vazio(v)) return null;
    const n = num(v);
    if (!(Number.isFinite(n) && dentroDaFaixa(n, { min, max }))) { campos.push(campo); return null; }
    return n;
  };
  const kUnid = e.unidade === 'umol/L';
  const pao2 = opc('pao2', e.pao2, 10, 700);
  const spo2 = opc('spo2', e.spo2, 50, 100);
  const fio2 = opc('fio2', e.fio2, 21, 100);
  const plaq = opc('plaquetas', e.plaquetas, 1, 2000);
  const bil = opc('bilirrubina', e.bilirrubina, kUnid ? 1 : 0.05, kUnid ? 1000 : 60);
  const gcs = opc('gcs', e.gcs, 3, 15);
  const cr = opc('creatinina', e.creatinina, kUnid ? 10 : 0.1, kUnid ? 2700 : 30);
  const pam = opc('pam', e.pam, 10, 200);
  const ne = opc('noradrenalina', e.noradrenalina, 0, 5);
  const epi = opc('adrenalina', e.adrenalina, 0, 5);
  const dopa = opc('dopamina', e.dopamina, 0, 100);
  if (gcs !== null && !Number.isInteger(gcs)) campos.push('gcs');
  if ((pao2 !== null || spo2 !== null) && fio2 === null && !campos.includes('fio2')) campos.push('fio2');
  if (pao2 === null && spo2 !== null && spo2 >= 98) campos.push('spo2');
  if (campos.length) {
    const spo2Alto = campos.includes('spo2') && spo2 !== null && spo2 >= 98;
    return { ok: false, campos, mensagem: spo2Alto ? 'A relação SpO₂/FiO₂ só vale com SpO₂ < 98%. Informe a PaO₂ ou confira a saturação' : 'Preencha os campos destacados com valores válidos' };
  }

  const sistemas = {} as Record<Sistema, PontoSistema>;
  // Respiratório
  if (e.ecmoResp) sistemas.resp = { pontos: 4, semDado: false, motivo: 'ECMO respiratória' };
  else if (pao2 !== null && fio2 !== null) {
    const r = pao2 / (fio2 / 100);
    sistemas.resp = { pontos: pontosRespiratorio(r, e.suporteAvancado, false), semDado: false, motivo: `PaO₂/FiO₂ = ${br(r)} mmHg${e.suporteAvancado ? ' com suporte avançado' : ' sem suporte avançado (máx. 2)'}` };
  } else if (spo2 !== null && fio2 !== null) {
    const r = spo2 / (fio2 / 100);
    sistemas.resp = { pontos: pontosRespiratorio(r, e.suporteAvancado, true), semDado: false, motivo: `SpO₂/FiO₂ = ${br(r)}${e.suporteAvancado ? ' com suporte avançado' : ' sem suporte avançado (máx. 2)'}` };
  } else sistemas.resp = { pontos: 0, semDado: true, motivo: 'sem dado (conta 0)' };
  // Coagulação
  sistemas.coag = plaq === null ? { pontos: 0, semDado: true, motivo: 'sem dado (conta 0)' } : { pontos: pontosPlaquetas(plaq), semDado: false, motivo: `plaquetas ${br(plaq)} ×10³/µL` };
  // Fígado
  if (bil === null) sistemas.figado = { pontos: 0, semDado: true, motivo: 'sem dado (conta 0)' };
  else { const mg = kUnid ? bil / FATOR_BILIRRUBINA : bil; sistemas.figado = { pontos: pontosBilirrubina(mg), semDado: false, motivo: `bilirrubina ${br(mg)} mg/dL` }; }
  // SNC
  if (gcs === null && !e.deliriumFarmaco && !e.motorGrave) sistemas.snc = { pontos: 0, semDado: true, motivo: 'sem dado (conta 0)' };
  else {
    const pts = pontosSnc(gcs ?? 15, e.deliriumFarmaco, e.motorGrave);
    sistemas.snc = { pontos: pts, semDado: false, motivo: e.motorGrave ? 'resposta motora em extensão/ausente ou mioclonia generalizada' : `Glasgow ${gcs ?? 15}${e.deliriumFarmaco ? ' + fármaco para delirium' : ''}` };
  }
  // Renal
  const trs = e.emTrs || e.criteriosTrs;
  if (trs) sistemas.renal = { pontos: 4, semDado: false, motivo: e.emTrs ? 'em terapia renal substitutiva' : 'preenche critérios de TRS' };
  else if (cr === null && !e.diurese) sistemas.renal = { pontos: 0, semDado: true, motivo: 'sem dado (conta 0)' };
  else {
    const pc = cr === null ? 0 : pontosCreatinina(kUnid ? cr / FATOR_CREATININA : cr);
    const pd = e.diurese ? PONTOS_DIURESE[e.diurese] : 0;
    sistemas.renal = { pontos: Math.max(pc, pd), semDado: false, motivo: pd > pc ? 'débito urinário' : cr !== null ? `creatinina ${br(kUnid ? cr / FATOR_CREATININA : cr)} mg/dL` : 'débito urinário' };
  }
  // Cardiovascular
  const temCardio = pam !== null || (ne ?? 0) > 0 || (epi ?? 0) > 0 || (dopa ?? 0) > 0 || e.outroVaso || e.suporteMecanico;
  if (!temCardio) sistemas.cardio = { pontos: 0, semDado: true, motivo: 'sem dado (conta 0)' };
  else {
    const c = pontosCardio({ pam, ne: ne ?? 0, epi: epi ?? 0, dopa: dopa ?? 0, outro: e.outroVaso, mecanico: e.suporteMecanico, limite: e.semVasoativosPorLimite });
    sistemas.cardio = { pontos: c.pontos, semDado: false, motivo: c.motivo };
  }

  const ordem: Sistema[] = ['resp', 'coag', 'figado', 'snc', 'renal', 'cardio'];
  const total = ordem.reduce((s, k) => s + sistemas[k].pontos, 0);
  const semDado = ordem.filter((k) => sistemas[k].semDado);
  if (semDado.length === ordem.length) return { ok: false, campos: [], mensagem: 'Informe pelo menos um parâmetro de algum sistema' };
  const avisos: string[] = [];
  if (semDado.length) avisos.push(`Sem dado em: ${semDado.map((k) => NOMES_SISTEMA[k]).join(', ')}. No 1º dia o SOFA-2 considera 0, o que pode subestimar o escore.`);
  avisos.push('Use o pior valor de cada parâmetro nas últimas 24 h. Se estiver sedado, use o último Glasgow antes da sedação.');
  const texto = `SOFA-2: ${total} / 24\n${ordem.map((k) => `${NOMES_SISTEMA[k]}: ${sistemas[k].pontos}`).join('\n')}`;
  return { ok: true, total, sistemas, semDado, avisos, texto };
}
