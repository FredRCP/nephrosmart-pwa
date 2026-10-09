// CKD-EPI 2021 creatinina + cistatina C — portado de CKDEPI2021CreatCysCalculator.tsx (app original).
// Conta, cores e textos iguais ao original. Acréscimos (DIVERGENCIAS.md, CYS-1/CYS-2/CYS-3):
//   CYS-1: faixas de plausibilidade (idade, creatinina, cistatina C)
//   CYS-2: aviso (não bloqueia) para menores de 18 anos
//   CYS-3: ao recarregar, informa se o último TFG guardado é absoluto (vindo do CKD-EPI com altura e peso)
import { classificarDRC, corTfg, type Sexo } from './ckdepi';
import { juntarPendencias } from './cockcroft';
import { dentroDaFaixa, FAIXAS, fmt } from './faixas';
import { normalizarNumero } from './numeros';

/** TFG indexada (mL/min/1,73 m²), CKD-EPI 2021 creatinina + cistatina C, sem raça. */
export function tfgCreatCistatina(cr: number, cys: number, idade: number, sexo: Sexo): number {
  const mulher = sexo === 'f';
  const kappa = mulher ? 0.7 : 0.9;
  const alpha = mulher ? -0.219 : -0.144;
  return (
    135 *
    Math.pow(Math.min(cr / kappa, 1), alpha) *
    Math.pow(Math.max(cr / kappa, 1), -0.544) *
    Math.pow(Math.min(cys / 0.8, 1), -0.323) *
    Math.pow(Math.max(cys / 0.8, 1), -0.778) *
    Math.pow(0.9961, idade) *
    (mulher ? 1.012 : 1)
  );
}

export interface EntradaCreatCis { creatinina: string; cistatina: string; idade: string; sexo: '' | Sexo; drc: boolean; acr: string }

export type ResultadoCreatCis =
  | { ok: false; erroCreatinina: boolean; erroCistatina: boolean; erroIdade: boolean; erroSexo: boolean; erroAcr: boolean; mensagem: string }
  | { ok: true; gfr: number; texto: string; cor: string; avisos: string[]; classificacao?: string };

export const AVISO_PEDIATRICO_CYS =
  'Esta fórmula foi desenvolvida para adultos (18 anos ou mais). Em crianças e adolescentes, use o Clearance Pediátrico (Schwartz).';

export function calcularCreatCistatina(e: EntradaCreatCis): ResultadoCreatCis {
  const cr = parseFloat(normalizarNumero(e.creatinina));
  const cys = parseFloat(normalizarNumero(e.cistatina));
  const age = parseFloat(normalizarNumero(e.idade));
  const acrValue = parseFloat(normalizarNumero(e.acr));

  const erroCreatinina = !e.creatinina || isNaN(cr) || cr <= 0;
  const erroCistatina = !e.cistatina || isNaN(cys) || cys <= 0;
  const erroIdade = !e.idade || isNaN(age) || age <= 0;
  const erroSexo = !e.sexo;
  const erroAcr = e.drc && (!e.acr || isNaN(acrValue) || acrValue <= 0);
  if (erroCreatinina || erroCistatina || erroIdade || erroSexo || erroAcr) {
    const erros: string[] = [];
    if (erroCreatinina) erros.push('uma creatinina válida');
    if (erroCistatina) erros.push('uma cistatina C válida');
    if (erroIdade) erros.push('uma idade válida');
    if (erroSexo) erros.push('o sexo');
    if (erroAcr) erros.push('uma relação albumina/creatinina válida');
    return { ok: false, erroCreatinina, erroCistatina, erroIdade, erroSexo, erroAcr, mensagem: juntarPendencias(erros) };
  }

  // Faixas de plausibilidade (CYS-1)
  const crFora = !dentroDaFaixa(cr, FAIXAS.creatininaMgDl);
  const cysFora = !dentroDaFaixa(cys, FAIXAS.cistatinaMgL);
  const idadeFora = !dentroDaFaixa(age, FAIXAS.idadeAnos);
  if (crFora || cysFora || idadeFora) {
    const m: string[] = [];
    if (crFora) {
      m.push(`Creatinina fora da faixa esperada (${fmt(FAIXAS.creatininaMgDl.min)} a ${fmt(FAIXAS.creatininaMgDl.max)} mg/dL). ` +
        'Informe em mg/dL (se estiver em µmol/L, divida por 88,4).');
    }
    if (cysFora) m.push(`Cistatina C fora da faixa esperada (${fmt(FAIXAS.cistatinaMgL.min)} a ${fmt(FAIXAS.cistatinaMgL.max)} mg/L).`);
    if (idadeFora) m.push(`Idade fora da faixa esperada (${FAIXAS.idadeAnos.min} a ${FAIXAS.idadeAnos.max} anos).`);
    return { ok: false, erroCreatinina: crFora, erroCistatina: cysFora, erroIdade: idadeFora, erroSexo: false, erroAcr: false, mensagem: m.join(' ') };
  }

  const gfr = tfgCreatCistatina(cr, cys, age, e.sexo as Sexo);
  let texto = `eGFR: ${gfr.toFixed(1)} mL/min/1.73m²`;
  let classificacao: string | undefined;
  if (e.drc && e.acr && !isNaN(acrValue)) {
    classificacao = classificarDRC(gfr, acrValue);
    texto += `\nClassificação DRC: ${classificacao}`;
  }
  const avisos: string[] = [];
  if (age < 18) avisos.push(AVISO_PEDIATRICO_CYS);
  return { ok: true, gfr, texto, cor: corTfg(gfr), avisos, classificacao };
}

/** Texto/cor do botão "recarregar". `tipo` vem de ultimoGFR_tipo (CKD-EPI creatinina grava "absoluto" quando há altura e peso). */
export function textoGfrSalvo(valor: string | null, tipo: string | null): { texto: string; cor: string | null } {
  if (valor === null) return { texto: 'Nenhum GFR salvo encontrado.', cor: null };
  const v = parseFloat(valor).toFixed(1);
  const unidade = tipo === 'absoluto' ? 'mL/min (valor absoluto, desindexado)' : 'mL/min/1.73m²';
  return { texto: `Último GFR salvo: ${v} ${unidade}`, cor: corTfg(parseFloat(v)) };
}
