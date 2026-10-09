// Estadiamento da IRA pelo KDIGO 2012 (Onda 2). Função pura.
// Diferenças em relação ao app original: janelas de tempo explícitas (0,3 mg/dL só em 48 h; 1,5× em até 7 dias),
// Cr ≥ 4,0 mg/dL só conta se houver aumento agudo, bordas sem erro de ponto flutuante e diurese com vírgula.
import { FAIXAS, dentroDaFaixa } from './faixas';

export type JanelaCr = 'ate48h' | 'ate7d' | 'mais7d';
export type EstagioKDIGO = 0 | 1 | 2 | 3;

export interface EntradaKDIGO {
  basal: string; atual: string; janela: JanelaCr | '';
  peso: string; volume: string; horas: string;
  trs: boolean;
}
export interface ResultadoKDIGO { ok: true; estagio: EstagioKDIGO; motivos: string[]; avisos: string[]; texto: string }
export interface ErroKDIGO { ok: false; campos: string[]; mensagem: string }

const num = (t: string) => parseFloat(String(t).replace(',', '.'));
const vazio = (t: string) => t.trim() === '';
const r3 = (n: number) => Math.round(n * 1000) / 1000;
const br = (n: number, c = 1) => n.toFixed(c).replace('.', ',');

export const FAIXA_HORAS = { min: 1, max: 72 } as const;
export const FAIXA_VOLUME_ML = { min: 0, max: 20000 } as const;

export function estadiarKDIGO(e: EntradaKDIGO): ResultadoKDIGO | ErroKDIGO {
  const temCr = !vazio(e.basal) || !vazio(e.atual);
  const temUrina = !vazio(e.peso) || !vazio(e.volume) || !vazio(e.horas);
  if (!temCr && !temUrina && !e.trs) {
    return { ok: false, campos: ['basal', 'atual'], mensagem: 'Informe creatinina basal e atual OU peso, volume e período da diurese (ou marque terapia renal substitutiva)' };
  }

  const campos: string[] = [];
  const b = num(e.basal), a = num(e.atual);
  if (temCr) {
    if (!(Number.isFinite(b) && dentroDaFaixa(b, FAIXAS.creatininaMgDl))) campos.push('basal');
    if (!(Number.isFinite(a) && dentroDaFaixa(a, FAIXAS.creatininaMgDl))) campos.push('atual');
    if (e.janela === '') campos.push('janela');
  }
  const p = num(e.peso), v = num(e.volume), h = num(e.horas);
  if (temUrina) {
    if (!(Number.isFinite(p) && dentroDaFaixa(p, FAIXAS.pesoKg))) campos.push('peso');
    if (!(Number.isFinite(v) && dentroDaFaixa(v, FAIXA_VOLUME_ML))) campos.push('volume');
    if (!(Number.isFinite(h) && dentroDaFaixa(h, FAIXA_HORAS))) campos.push('horas');
  }
  if (campos.length) {
    return { ok: false, campos, mensagem: campos.includes('janela') && campos.length === 1
      ? 'Informe o intervalo entre a creatinina basal e a atual'
      : 'Preencha os campos destacados com valores válidos' };
  }

  let estagio: EstagioKDIGO = 0;
  const motivos: string[] = [];
  const avisos: string[] = [];
  const marcar = (s: EstagioKDIGO, motivo: string) => { motivos.push(`${motivo} → estágio ${s}`); if (s > estagio) estagio = s; };

  // ── Creatinina ──
  if (temCr) {
    const razao = r3(a / b);
    const delta = r3(a - b);
    if (e.janela === 'mais7d') {
      avisos.push('Intervalo maior que 7 dias: o critério de creatinina do KDIGO não se aplica (considere doença renal aguda/subaguda ou DRC agudizada).');
    } else {
      const aumento03 = e.janela === 'ate48h' && delta >= 0.3; // 0,3 mg/dL só vale em até 48 h
      const razao15 = razao >= 1.5; // 1,5× vale em até 7 dias
      const criterio = aumento03 || razao15;
      if (razao >= 3) marcar(3, `Creatinina ${br(razao)}× a basal`);
      else if (razao >= 2) marcar(2, `Creatinina ${br(razao)}× a basal`);
      else if (razao15) marcar(1, `Creatinina ${br(razao)}× a basal`);
      else if (aumento03) marcar(1, `Aumento de ${br(delta, 2)} mg/dL em até 48 h`);
      if (criterio && a >= 4.0) marcar(3, `Creatinina ≥ 4,0 mg/dL (${br(a, 2)}) com aumento agudo`);
      if (!criterio && a >= 4.0) avisos.push('Creatinina ≥ 4,0 mg/dL sem aumento agudo documentado não classifica estágio 3 (pode ser DRC prévia).');
      if (!criterio && e.janela === 'ate7d' && delta >= 0.3) avisos.push('Aumento ≥ 0,3 mg/dL só conta como IRA se ocorreu em até 48 h.');
    }
  }

  // ── Diurese ──
  if (temUrina) {
    const taxa = r3(v / (p * h));
    if (h < 6) {
      avisos.push('Período menor que 6 horas: insuficiente para o critério de diurese do KDIGO.');
    } else if (v === 0 && h >= 12) {
      marcar(3, `Anúria por ${br(h, 0)} h`);
    } else if (taxa < 0.3 && h >= 24) {
      marcar(3, `Diurese ${br(taxa, 2)} mL/kg/h por ${br(h, 0)} h`);
    } else if (taxa < 0.5 && h >= 12) {
      marcar(2, `Diurese ${br(taxa, 2)} mL/kg/h por ${br(h, 0)} h`);
    } else if (taxa < 0.5) {
      marcar(1, `Diurese ${br(taxa, 2)} mL/kg/h por ${br(h, 0)} h`);
    }
    if (h >= 6 && taxa >= 0.5) avisos.push('Diurese ≥ 0,5 mL/kg/h: sem critério de diurese. A média do período pode esconder períodos de oligúria.');
  }

  // ── Terapia renal substitutiva ──
  if (e.trs) marcar(3, 'Início de terapia renal substitutiva');

  const texto = estagio === 0
    ? 'Sem critérios de IRA pelo KDIGO com os dados informados.\nIsto não exclui IRA: confira a creatinina basal e o período da diurese.'
    : `Estágio KDIGO ${estagio}\n${motivos.join('\n')}`;
  return { ok: true, estagio, motivos, avisos, texto };
}
