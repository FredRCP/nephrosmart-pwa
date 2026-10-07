// CKD-EPI 2021 (creatinina) — portado de ClearanceForm.tsx (app original) COM as correções aprovadas:
//   CKD-1: aviso para menores de 18 anos, apontando o Clearance Pediátrico
//   CKD-2: faixas de plausibilidade (idade, creatinina, altura, peso) e aviso quando a idade é truncada
//   CKD-3: informa se o valor enviado ao Ajuste de Dose é INDEXADO ou ABSOLUTO
import { dentroDaFaixa, FAIXAS, fmt } from './faixas';
import { normalizarNumero } from './numeros';

export type Sexo = 'f' | 'm';

/** TFG indexada, mL/min/1,73 m². Fórmula CKD-EPI 2021 (sem raça). */
export function tfgCkdEpi2021(creatininaMgDl: number, idadeAnos: number, sexo: Sexo): number {
  const isMulher = sexo === 'f';
  const k = isMulher ? 0.7 : 0.9;
  const alpha = isMulher ? -0.241 : -0.302;
  const minCrK = Math.min(creatininaMgDl / k, 1);
  const maxCrK = Math.max(creatininaMgDl / k, 1);
  const fatorSexo = isMulher ? 1.012 : 1;
  return 142 * Math.pow(minCrK, alpha) * Math.pow(maxCrK, -1.2) * Math.pow(0.9938, idadeAnos) * fatorSexo;
}

/** Superfície corporal (m²), fórmula de DuBois & DuBois como no app original. */
export function superficieCorporal(alturaCm: number, pesoKg: number): number {
  return 0.007184 * Math.pow(pesoKg, 0.425) * Math.pow(alturaCm, 0.725);
}

/** TFG absoluta (desindexada), mL/min. */
export function tfgAbsoluta(tfgIndexada: number, alturaCm: number, pesoKg: number): number {
  return tfgIndexada * (superficieCorporal(alturaCm, pesoKg) / 1.73);
}

export function corTfg(gfr: number): string {
  if (gfr >= 90) return '#22c55e';
  if (gfr >= 60) return '#fef08a';
  if (gfr >= 45) return '#facc15';
  if (gfr >= 30) return '#f97316';
  if (gfr >= 15) return '#ef4444';
  return '#dc2626';
}

export function classificarDRC(eGFR: number, acrValue: number): string {
  let g: string;
  if (eGFR >= 90) g = 'G1';
  else if (eGFR >= 60) g = 'G2';
  else if (eGFR >= 45) g = 'G3a';
  else if (eGFR >= 30) g = 'G3b';
  else if (eGFR >= 15) g = 'G4';
  else g = 'G5';
  let a: string;
  if (acrValue < 30) a = 'A1';
  else if (acrValue <= 300) a = 'A2';
  else a = 'A3';
  return `${g} ${a}`;
}

export interface EntradaCkdEpi {
  creatinina: string;
  idade: string;
  sexo: '' | Sexo;
  altura: string;
  peso: string;
  drc: boolean;
  acr: string;
}

export type TipoTfg = 'indexado' | 'absoluto';

export type ResultadoCkdEpi =
  | {
      ok: false;
      erroCreatinina: boolean;
      erroIdade: boolean;
      erroSexo: boolean;
      erroAltura: boolean;
      erroPeso: boolean;
      mensagem: string;
    }
  | {
      ok: true;
      gfrIndexado: number;
      gfrAbsoluto?: number;
      classificacao?: string;
      erroAcr: boolean;
      texto: string;
      cor: string;
      /** Avisos que NÃO impedem o cálculo (menor de 18 anos, idade truncada, creatinina incomum). */
      avisos: string[];
      /** Valor guardado como "último TFG" para pré-preencher o Ajuste de Dose (absoluto se houver, senão indexado). */
      valorParaAjuste: string;
      /** Qual dos dois valores foi enviado ao Ajuste de Dose. */
      tipoParaAjuste: TipoTfg;
    };

export const AVISO_PEDIATRICO =
  'Esta fórmula foi desenvolvida para adultos (18 anos ou mais). Em crianças e adolescentes, use o Clearance Pediátrico (Schwartz).';

export function calcularCkdEpi(e: EntradaCkdEpi): ResultadoCkdEpi {
  const cr = parseFloat(normalizarNumero(e.creatinina));
  const age = parseInt(e.idade);
  const acrValue = parseFloat(normalizarNumero(e.acr));
  const alturaNum = parseFloat(normalizarNumero(e.altura));
  const pesoNum = parseFloat(normalizarNumero(e.peso));

  const semErroExtra = { erroAltura: false, erroPeso: false };

  // 1) Obrigatórios ausentes ou inválidos (regra do app original)
  const erroCreatinina = !e.creatinina || isNaN(cr) || cr <= 0;
  const erroIdade = !e.idade || isNaN(age) || age <= 0;
  const erroSexo = !e.sexo;
  if (erroCreatinina || erroIdade || erroSexo) {
    return { ok: false, erroCreatinina, erroIdade, erroSexo, ...semErroExtra, mensagem: 'Por favor, preencha creatinina, idade e sexo.' };
  }

  // 2) Faixas de plausibilidade (correção CKD-2)
  const crFora = !dentroDaFaixa(cr, FAIXAS.creatininaMgDl);
  const idadeFora = !dentroDaFaixa(age, FAIXAS.idadeAnos);
  if (crFora || idadeFora) {
    const m: string[] = [];
    if (crFora) {
      m.push(
        `Creatinina fora da faixa esperada (${fmt(FAIXAS.creatininaMgDl.min)} a ${fmt(FAIXAS.creatininaMgDl.max)} mg/dL). ` +
          'Informe em mg/dL (se estiver em µmol/L, divida por 88,4).',
      );
    }
    if (idadeFora) m.push(`Idade fora da faixa esperada (${FAIXAS.idadeAnos.min} a ${FAIXAS.idadeAnos.max} anos).`);
    return { ok: false, erroCreatinina: crFora, erroIdade: idadeFora, erroSexo: false, ...semErroExtra, mensagem: m.join(' ') };
  }

  // 3) Valor desindexado: se qualquer campo foi preenchido, os dois precisam ser válidos (antes eram ignorados em silêncio)
  const informouAntropometria = e.altura.trim() !== '' || e.peso.trim() !== '';
  const alturaOk = !isNaN(alturaNum) && dentroDaFaixa(alturaNum, FAIXAS.alturaCm);
  const pesoOk = !isNaN(pesoNum) && dentroDaFaixa(pesoNum, FAIXAS.pesoKg);
  if (informouAntropometria && !(alturaOk && pesoOk)) {
    return {
      ok: false,
      erroCreatinina: false,
      erroIdade: false,
      erroSexo: false,
      erroAltura: !alturaOk,
      erroPeso: !pesoOk,
      mensagem:
        `Para o valor desindexado, informe altura (${FAIXAS.alturaCm.min} a ${FAIXAS.alturaCm.max} cm) ` +
        `e peso (${FAIXAS.pesoKg.min} a ${FAIXAS.pesoKg.max} kg) válidos, ou deixe os dois em branco.`,
    };
  }

  const erroAcr = e.drc && (!e.acr || isNaN(acrValue) || acrValue <= 0);

  const gfrIndexado = tfgCkdEpi2021(cr, age, e.sexo as Sexo);

  let gfrAbsoluto: number | undefined;
  let textoAbsoluto: string;
  if (informouAntropometria) {
    gfrAbsoluto = tfgAbsoluta(gfrIndexado, alturaNum, pesoNum);
    textoAbsoluto = `\n\nValor absoluto (desindexado):\n${gfrAbsoluto.toFixed(1)} mL/min\n(recomendado para ajuste de dose)`;
  } else {
    textoAbsoluto = '\n\n💡 Toque na seção "Valor desindexado" acima\npara inserir altura e peso (recomendado)';
  }

  let texto = `TFG estimada:\n${gfrIndexado.toFixed(1)} mL/min/1.73m²${textoAbsoluto}`;
  let classificacao: string | undefined;
  if (e.drc && !isNaN(acrValue)) {
    classificacao = classificarDRC(gfrIndexado, acrValue);
    texto += `\n\nClassificação DRC: ${classificacao}`;
  }

  // Avisos (não bloqueiam)
  const avisos: string[] = [];
  if (age < 18) avisos.push(AVISO_PEDIATRICO);
  if (!/^\s*\d+\s*$/.test(e.idade)) avisos.push(`Idade considerada como ${age} anos (a parte decimal é ignorada).`);
  if (cr < 0.4 || cr > 15) avisos.push('Valor de creatinina incomum: confira se está em mg/dL.');

  const valorParaAjuste = (gfrAbsoluto || gfrIndexado).toFixed(1);
  const tipoParaAjuste: TipoTfg = gfrAbsoluto ? 'absoluto' : 'indexado';
  return { ok: true, gfrIndexado, gfrAbsoluto, classificacao, erroAcr, texto, cor: corTfg(gfrIndexado), avisos, valorParaAjuste, tipoParaAjuste };
}
