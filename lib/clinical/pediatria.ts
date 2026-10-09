// TFG em crianças e adolescentes — DRC estável (CKiD U25) e estadiamento de LRA (KDIGO).
// Substitui, na tela pediátrica, as contas portadas do app original (Schwartz 0,70/0,55 e a aba "Chen"),
// que estavam desatualizadas. Fontes e dúvidas clínicas: REVISAO_CLINICA_PEDIATRIA.md.
//   CKiD U25 (Pierce CB et al., Kidney Int 2021) — NIDDK: 1 a 25 anos, altura em METROS, creatinina enzimática (mg/dL),
//   cistatina C padronizada IFCC (mg/L). Bedside Schwartz 2009 = 41,3 × altura(m) / creatinina.
import { dentroDaFaixa, FAIXAS, fmt } from './faixas';
import { normalizarNumero } from './numeros';
import type { Sexo } from './ckdepi';
import { CONDUTA_LRA, AVISOS } from './pediatria-conduta';

export type UnidadeIdade = 'dias' | 'meses' | 'anos';
export const FAIXAS_PED = {
  alturaCm: { min: 30, max: 220 },
  creatininaMgDl: { min: 0.1, max: 15 },
  idadeAnos: { min: 0, max: 25 },
} as const;

export const idadeEmAnos = (valor: number, unidade: UnidadeIdade): number =>
  unidade === 'dias' ? valor / 365.25 : unidade === 'meses' ? valor / 12 : valor;

// ───────────── Equações ─────────────
/** κ da CKiD U25 por creatinina (idade em anos, válida a partir de 1 ano). */
export function kCkidCr(idade: number, sexo: Sexo): number {
  const f = sexo === 'f';
  if (idade < 12) return (f ? 36.1 : 39.0) * Math.pow(1.008, idade - 12);
  if (idade < 18) return f ? 36.1 * Math.pow(1.023, idade - 12) : 39.0 * Math.pow(1.045, idade - 12);
  return f ? 41.4 : 50.8;
}
/** κ da CKiD U25 por cistatina C. */
export function kCkidCys(idade: number, sexo: Sexo): number {
  if (sexo === 'f') {
    if (idade < 12) return 79.9 * Math.pow(1.004, idade - 12);
    if (idade < 18) return 79.9 * Math.pow(0.974, idade - 12);
    return 68.3;
  }
  if (idade < 15) return 87.2 * Math.pow(1.011, idade - 15);
  if (idade < 18) return 87.2 * Math.pow(0.96, idade - 15);
  return 77.1;
}
export const egfrCkidCr = (idade: number, sexo: Sexo, alturaCm: number, cr: number) => (kCkidCr(idade, sexo) * (alturaCm / 100)) / cr;
export const egfrCkidCys = (idade: number, sexo: Sexo, cys: number) => kCkidCys(idade, sexo) / cys;
export const egfrCkidCombinada = (idade: number, sexo: Sexo, alturaCm: number, cr: number, cys: number) =>
  (egfrCkidCr(idade, sexo, alturaCm, cr) + egfrCkidCys(idade, sexo, cys)) / 2;
/** Schwartz bedside 2009: 0,413 × altura(cm) / creatinina. */
export const egfrBedside = (alturaCm: number, cr: number) => (0.413 * alturaCm) / cr;
/** Lactentes < 1 ano: constantes de Schwartz (0,45 termo; 0,33 prematuro/baixo peso). Pouco confiável. */
export const egfrLactente = (alturaCm: number, cr: number, prematuro: boolean) => ((prematuro ? 0.33 : 0.45) * alturaCm) / cr;

/** Categoria G do KDIGO. */
export function categoriaG(e: number): string {
  if (e >= 90) return 'G1 (≥ 90)';
  if (e >= 60) return 'G2 (60–89)';
  if (e >= 45) return 'G3a (45–59)';
  if (e >= 30) return 'G3b (30–44)';
  if (e >= 15) return 'G4 (15–29)';
  return 'G5 (< 15)';
}

// ───────────── Entradas comuns ─────────────
interface Comum { altura: string; creatinina: string; idade: string; unidade: UnidadeIdade; sexo: '' | Sexo }

interface Erros { erroAltura: boolean; erroCreatinina: boolean; erroIdade: boolean; erroSexo: boolean }
const SEM_ERRO: Erros = { erroAltura: false, erroCreatinina: false, erroIdade: false, erroSexo: false };

function validarComum(e: Comum, exigirSexoAcimaDe1 = true) {
  const h = parseFloat(normalizarNumero(e.altura));
  const cr = parseFloat(normalizarNumero(e.creatinina));
  const n = parseFloat(normalizarNumero(e.idade));
  const anos = idadeEmAnos(n, e.unidade);
  const erroAltura = !e.altura.trim() || !dentroDaFaixa(h, FAIXAS_PED.alturaCm);
  const erroCreatinina = !e.creatinina.trim() || !dentroDaFaixa(cr, FAIXAS_PED.creatininaMgDl);
  const erroIdade = !e.idade.trim() || isNaN(n) || !dentroDaFaixa(anos, FAIXAS_PED.idadeAnos);
  const erroSexo = exigirSexoAcimaDe1 && !erroIdade && anos >= 1 && !e.sexo;
  return { h, cr, anos, erros: { erroAltura, erroCreatinina, erroIdade, erroSexo } as Erros };
}

function mensagemErros(er: Erros): string {
  const m: string[] = [];
  if (er.erroAltura) m.push(`altura entre ${FAIXAS_PED.alturaCm.min} e ${FAIXAS_PED.alturaCm.max} cm`);
  if (er.erroCreatinina) m.push(`creatinina entre ${fmt(FAIXAS_PED.creatininaMgDl.min)} e ${FAIXAS_PED.creatininaMgDl.max} mg/dL (se estiver em µmol/L, divida por 88,4)`);
  if (er.erroIdade) m.push(`idade entre 0 e ${FAIXAS_PED.idadeAnos.max} anos`);
  if (er.erroSexo) m.push('o sexo');
  return 'Por favor, informe ' + (m.length > 1 ? m.slice(0, -1).join(', ') + ' e ' + m[m.length - 1] : m[0]) + '.';
}

// ───────────── DRC / estável ─────────────
export interface EntradaDrc extends Comum { cistatina: string; prematuro: boolean }

export type ResultadoDrc =
  | ({ ok: false; mensagem: string } & Erros & { erroCistatina: boolean })
  | { ok: true; egfr: number; metodo: string; categoria: string; avisos: string[]; texto: string; alternativa?: { egfr: number; metodo: string } };

export function calcularDrc(e: EntradaDrc): ResultadoDrc {
  const v = validarComum(e);
  const cysTxt = e.cistatina.trim();
  const cys = parseFloat(normalizarNumero(e.cistatina));
  const erroCistatina = cysTxt !== '' && !dentroDaFaixa(cys, FAIXAS.cistatinaMgL);
  if (Object.values(v.erros).some(Boolean) || erroCistatina) {
    const er = v.erros;
    const msg = erroCistatina && !Object.values(er).some(Boolean)
      ? `Cistatina C fora da faixa esperada (${fmt(FAIXAS.cistatinaMgL.min)} a ${FAIXAS.cistatinaMgL.max} mg/L).`
      : mensagemErros(er) + (erroCistatina ? ` Cistatina C entre ${fmt(FAIXAS.cistatinaMgL.min)} e ${FAIXAS.cistatinaMgL.max} mg/L.` : '');
    return { ok: false, mensagem: msg, ...er, erroCistatina };
  }
  const sexo = e.sexo as Sexo;
  const avisos: string[] = [AVISOS.estavel];
  let egfr: number, metodo: string, alternativa: { egfr: number; metodo: string } | undefined;

  if (v.anos < 1) {
    egfr = egfrLactente(v.h, v.cr, e.prematuro);
    metodo = `Schwartz lactente (k = ${e.prematuro ? '0,33 prematuro' : '0,45 termo'})`;
    avisos.push(AVISOS.lactente);
  } else if (cysTxt !== '') {
    egfr = egfrCkidCombinada(v.anos, sexo, v.h, v.cr, cys);
    metodo = 'CKiD U25 creatinina + cistatina C (média)';
    alternativa = { egfr: egfrCkidCr(v.anos, sexo, v.h, v.cr), metodo: 'CKiD U25 só creatinina' };
  } else {
    egfr = egfrCkidCr(v.anos, sexo, v.h, v.cr);
    metodo = 'CKiD U25 (creatinina)';
    alternativa = { egfr: egfrBedside(v.h, v.cr), metodo: 'Schwartz bedside 2009' };
    avisos.push(AVISOS.massaMuscular);
  }
  if (v.anos >= 1 && v.anos < 2) avisos.push(AVISOS.menor2anos);
  const categoria = categoriaG(egfr);
  let texto = `TFG estimada: ${egfr.toFixed(1)} mL/min/1.73m²\nMétodo: ${metodo}\nCategoria KDIGO: ${categoria}`;
  if (alternativa) texto += `\n\nComparação — ${alternativa.metodo}: ${alternativa.egfr.toFixed(1)} mL/min/1.73m²`;
  return { ok: true, egfr, metodo, categoria, avisos, texto, alternativa };
}

// ───────────── LRA ─────────────
export type Janela = '48h' | '7d';
export type Diurese = 'normal' | 'e1' | 'e2' | 'e3';
export const ROTULO_DIURESE: Record<Diurese, string> = {
  normal: 'Diurese preservada (≥ 0,5 mL/kg/h) ou não avaliada',
  e1: '< 0,5 mL/kg/h por 6–12 h',
  e2: '< 0,5 mL/kg/h por ≥ 12 h',
  e3: '< 0,3 mL/kg/h por ≥ 24 h ou anúria ≥ 12 h',
};

export interface EntradaLra extends Comum { creatininaBasal: string; janela: Janela; diurese: Diurese; prematuro: boolean }

export type ResultadoLra =
  | ({ ok: false; mensagem: string } & Erros & { erroBasal: boolean })
  | { ok: true; estagio: 0 | 1 | 2 | 3; motivos: string[]; teto: number; metodoTeto: string; basalEstimada: boolean; avisos: string[]; texto: string };

export function calcularLra(e: EntradaLra): ResultadoLra {
  const v = validarComum(e);
  const basalTxt = e.creatininaBasal.trim();
  const basal = parseFloat(normalizarNumero(e.creatininaBasal));
  const erroBasal = basalTxt !== '' && !dentroDaFaixa(basal, FAIXAS_PED.creatininaMgDl);
  if (Object.values(v.erros).some(Boolean) || erroBasal) {
    return { ok: false, mensagem: mensagemErros(v.erros) + (erroBasal ? ' Creatinina basal fora da faixa.' : ''), ...v.erros, erroBasal };
  }
  const sexo = (e.sexo || 'm') as Sexo;
  const lactente = v.anos < 1;
  if (lactente && basalTxt === '') {
    return { ok: false, mensagem: 'Em menores de 1 ano a creatinina basal não pode ser estimada: informe a creatinina anterior.', ...SEM_ERRO, erroBasal: true };
  }

  // TFG "teto": o que a creatinina atual daria se estivesse estável (a TFG real é MENOR enquanto a creatinina sobe)
  const teto = lactente ? egfrLactente(v.h, v.cr, e.prematuro) : egfrCkidCr(v.anos, sexo, v.h, v.cr);
  const metodoTeto = lactente ? 'Schwartz lactente' : 'CKiD U25 (creatinina)';

  // Creatinina basal: informada, ou a que daria TFG de 120 mL/min/1,73 m² (convenção da literatura pRIFLE/KDIGO pediátrico)
  const basalEstimada = basalTxt === '';
  const crBasal = basalEstimada ? (kCkidCr(v.anos, sexo) * (v.h / 100)) / 120 : basal;
  const razao = Math.round((v.cr / crBasal) * 1000) / 1000; // arredonda p/ não perder o limite por ponto flutuante (0,6/0,4 = 1,4999…)
  const delta = Math.round((v.cr - crBasal) * 1000) / 1000; // evita erro de ponto flutuante no limite (0,9 → 1,2 dá 0,2999…)

  let est = 0;
  const motivos: string[] = [];
  const marcar = (n: 1 | 2 | 3, m: string) => { if (n > est) est = n; motivos.push(`Estágio ${n}: ${m}`); };
  if (razao >= 3) marcar(3, `creatinina ${razao.toFixed(1).replace('.', ',')}× a basal`);
  else if (razao >= 2) marcar(2, `creatinina ${razao.toFixed(1).replace('.', ',')}× a basal`);
  else if (razao >= 1.5) marcar(1, `creatinina ${razao.toFixed(1).replace('.', ',')}× a basal`);
  if (!basalEstimada && e.janela === '48h' && delta >= 0.3 && razao < 1.5) marcar(1, `aumento de ${fmt(Number(delta.toFixed(2)))} mg/dL em até 48 h`);
  // critério pediátrico de estágio 3 vale quando já há LRA POR CREATININA (diurese isolada não basta: pode ser DRC prévia)
  if (est >= 1 && teto < 35) marcar(3, 'TFG estimada pela creatinina atual < 35 mL/min/1.73m² (critério pediátrico)');
  if (e.diurese === 'e1') marcar(1, 'diurese < 0,5 mL/kg/h por 6–12 h');
  if (e.diurese === 'e2') marcar(2, 'diurese < 0,5 mL/kg/h por ≥ 12 h');
  if (e.diurese === 'e3') marcar(3, 'diurese < 0,3 mL/kg/h por ≥ 24 h ou anúria ≥ 12 h');

  const estagio = est as 0 | 1 | 2 | 3;
  const avisos: string[] = [];
  if (basalEstimada) avisos.push(AVISOS.basalEstimada);
  if (estagio === 0 && razao < 1) avisos.push(AVISOS.caindo);
  if (lactente) avisos.push(AVISOS.lactente);

  const cab = estagio === 0 ? 'Sem critério de LRA (KDIGO)' : `LRA — KDIGO estágio ${estagio}`;
  let texto = `${cab}\n${motivos.length ? motivos.join('\n') : `Creatinina ${razao.toFixed(2).replace('.', ',')}× a basal (${crBasal.toFixed(2).replace('.', ',')} mg/dL${basalEstimada ? ', estimada' : ''})`}`;
  texto += `\n\nTFG pela creatinina atual: ${teto.toFixed(1)} mL/min/1.73m²\n(${metodoTeto}${estagio > 0 ? ' — é um TETO: a TFG real é menor enquanto a creatinina sobe' : ''})`;
  texto += `\n\nAjuste de dose: ${CONDUTA_LRA[estagio]}`;
  return { ok: true, estagio, motivos, teto, metodoTeto, basalEstimada, avisos, texto };
}
