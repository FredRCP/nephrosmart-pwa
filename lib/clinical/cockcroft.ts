// Cockcroft-Gault — portado de CockcroftGaultCalculator.tsx (app original).
// Conta, cores, textos e mensagens iguais ao original. Acréscimos (ver DIVERGENCIAS.md, CG-1/CG-2):
//   CG-1: faixas de plausibilidade (idade, peso, creatinina), como IMC-1/CKD-2
//   CG-2: aviso (não bloqueia) para menores de 18 anos
import { dentroDaFaixa, FAIXAS, fmt } from './faixas';
import { normalizarNumero } from './numeros';
import type { Sexo } from './ckdepi';

/** ClCr em mL/min (não indexado). Idade em anos, peso em kg, creatinina em mg/dL. */
export function clcrCockcroftGault(idade: number, pesoKg: number, creatininaMgDl: number, sexo: Sexo): number {
  const base = ((140 - idade) * pesoKg) / (72 * creatininaMgDl);
  return sexo === 'm' ? base : ((140 - idade) * pesoKg * 0.85) / (72 * creatininaMgDl);
}

export function corClCr(clcr: number): string {
  if (clcr >= 90) return '#22c55e';
  if (clcr >= 60) return '#fef08a';
  if (clcr >= 30) return '#f97316';
  return '#ef4444';
}

export interface EntradaCockcroft { idade: string; peso: string; creatinina: string; sexo: '' | Sexo }

export type ResultadoCockcroft =
  | { ok: false; erroIdade: boolean; erroPeso: boolean; erroCreatinina: boolean; erroSexo: boolean; mensagem: string }
  | { ok: true; clcr: number; texto: string; cor: string; avisos: string[] };

export const AVISO_PEDIATRICO_CG =
  'Esta fórmula foi desenvolvida para adultos (18 anos ou mais). Em crianças e adolescentes, use o Clearance Pediátrico (Schwartz).';

/** Junta as pendências como o original: "A.", "A e B.", "A, B e C." */
export function juntarPendencias(erros: string[]): string {
  let m = 'Por favor, insira ';
  if (erros.length === 1) m += erros[0] + '.';
  else if (erros.length === 2) m += erros.join(' e ') + '.';
  else m += erros.slice(0, -1).join(', ') + ' e ' + erros[erros.length - 1] + '.';
  return m;
}

export function calcularCockcroft(e: EntradaCockcroft): ResultadoCockcroft {
  const age = parseFloat(normalizarNumero(e.idade));
  const peso = parseFloat(normalizarNumero(e.peso));
  const cr = parseFloat(normalizarNumero(e.creatinina));

  // 1) Regras do original
  const erroIdade = !e.idade || isNaN(age) || age <= 0;
  const erroPeso = !e.peso || isNaN(peso) || peso <= 0;
  const erroCreatinina = !e.creatinina || isNaN(cr) || cr <= 0;
  const erroSexo = !e.sexo;
  if (erroIdade || erroPeso || erroCreatinina || erroSexo) {
    const erros: string[] = [];
    if (erroIdade) erros.push('uma idade válida (ex.: 50)');
    if (erroPeso) erros.push('um peso válido (ex.: 70)');
    if (erroCreatinina) erros.push('uma creatinina válida (ex.: 0.8)');
    if (erroSexo) erros.push('o sexo');
    return { ok: false, erroIdade, erroPeso, erroCreatinina, erroSexo, mensagem: juntarPendencias(erros) };
  }

  // 2) Faixas de plausibilidade (CG-1)
  const idadeFora = !dentroDaFaixa(age, FAIXAS.idadeAnos);
  const pesoFora = !dentroDaFaixa(peso, FAIXAS.pesoKg);
  const crFora = !dentroDaFaixa(cr, FAIXAS.creatininaMgDl);
  if (idadeFora || pesoFora || crFora) {
    const m: string[] = [];
    if (idadeFora) m.push(`Idade fora da faixa esperada (${FAIXAS.idadeAnos.min} a ${FAIXAS.idadeAnos.max} anos).`);
    if (pesoFora) m.push(`Peso fora da faixa esperada (${FAIXAS.pesoKg.min} a ${FAIXAS.pesoKg.max} kg).`);
    if (crFora) {
      m.push(`Creatinina fora da faixa esperada (${fmt(FAIXAS.creatininaMgDl.min)} a ${fmt(FAIXAS.creatininaMgDl.max)} mg/dL). ` +
        'Informe em mg/dL (se estiver em µmol/L, divida por 88,4).');
    }
    return { ok: false, erroIdade: idadeFora, erroPeso: pesoFora, erroCreatinina: crFora, erroSexo: false, mensagem: m.join(' ') };
  }

  const clcr = clcrCockcroftGault(age, peso, cr, e.sexo as Sexo);
  const avisos: string[] = [];
  if (age < 18) avisos.push(AVISO_PEDIATRICO_CG);
  return { ok: true, clcr, texto: `Clearance de Creatinina: ${clcr.toFixed(1)} mL/min`, cor: corClCr(clcr), avisos };
}

/** Texto e cor do botão "recarregar": usa o valor arredondado, como o original. */
export function textoClCrSalvo(valor: string | null): { texto: string; cor: string | null } {
  if (valor === null) return { texto: 'Nenhum ClCr salvo encontrado.', cor: null };
  const v = parseFloat(valor).toFixed(1);
  return { texto: `Último ClCr salvo: ${v} mL/min`, cor: corClCr(parseFloat(v)) };
}
