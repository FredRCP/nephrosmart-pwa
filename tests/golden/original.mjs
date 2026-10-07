// Gera os resultados ESPERADOS a partir da lógica ORIGINAL do app (React Native).
// As contas abaixo foram copiadas literalmente de:
//   - IMCCalculator.tsx  (calcularIMC)           -> tests/golden/original/IMCCalculator.calcularIMC.txt
//   - ClearanceForm.tsx  (calcularCKDEPI2021 ...) -> tests/golden/original/ClearanceForm.calculo.txt
// Só os efeitos de tela (setState, haptics, animação, AsyncStorage) foram trocados por "return".
// Módulo de REFERÊNCIA: os testes comparam a implementação nova com esta, caso a caso.

// ───────────────────────── IMC (original) ─────────────────────────
export function imcOriginal(peso, altura) {
  const pesoNum = parseFloat(peso.replace(',', '.'));
  const alturaNum = parseFloat(altura.replace(',', '.')) / 100;
  const erroPeso = !peso.trim() || isNaN(pesoNum) || pesoNum <= 0;
  const erroAltura = !altura.trim() || isNaN(alturaNum) || alturaNum <= 0;

  if (!peso.trim() || isNaN(pesoNum) || pesoNum <= 0 || !altura.trim() || isNaN(alturaNum) || alturaNum <= 0) {
    let mensagemErro = 'Por favor, insira ';
    const erros = [];
    if (!peso.trim() || isNaN(pesoNum) || pesoNum <= 0) erros.push('um peso válido (ex.: 70.5)');
    if (!altura.trim() || isNaN(alturaNum) || alturaNum <= 0) erros.push('uma altura válida (ex.: 1.75)');
    if (erros.length === 1) {
      mensagemErro += erros[0] + '.';
    } else {
      mensagemErro += erros.join(' e ') + '.';
    }
    return { ok: false, erroPeso, erroAltura, mensagem: mensagemErro };
  }

  const imc = pesoNum / (alturaNum * alturaNum);
  let classificacao = '';
  if (imc < 18.5) classificacao = 'Abaixo do peso';
  else if (imc < 25) classificacao = 'Peso normal';
  else if (imc < 30) classificacao = 'Sobrepeso';
  else if (imc < 35) classificacao = 'Obesidade Grau I';
  else if (imc < 40) classificacao = 'Obesidade Grau II';
  else classificacao = 'Obesidade Grau III';
  const resultText = `IMC: ${imc.toFixed(1)} kg/m²\nClassificação: ${classificacao}`;
  return { ok: true, imc, classificacao, texto: resultText };
}

// ─────────────────── CKD-EPI 2021 (original) ───────────────────
const normalizeInput = (text) => {
  let normalized = text.replace(',', '.').trim();
  if (normalized.startsWith('.')) normalized = '0' + normalized;
  return normalized;
};
const getGfrColor = (gfr) => {
  if (gfr >= 90) return '#22c55e';
  if (gfr >= 60) return '#fef08a';
  if (gfr >= 45) return '#facc15';
  if (gfr >= 30) return '#f97316';
  if (gfr >= 15) return '#ef4444';
  return '#dc2626';
};
const classificarDRC = (eGFR, acrValue) => {
  let g = '';
  if (eGFR >= 90) g = 'G1';
  else if (eGFR >= 60) g = 'G2';
  else if (eGFR >= 45) g = 'G3a';
  else if (eGFR >= 30) g = 'G3b';
  else if (eGFR >= 15) g = 'G4';
  else g = 'G5';
  let a = '';
  if (acrValue < 30) a = 'A1';
  else if (acrValue <= 300) a = 'A2';
  else a = 'A3';
  return `${g} ${a}`;
};
const calcularBSA = (alturaCm, pesoKg) => 0.007184 * Math.pow(pesoKg, 0.425) * Math.pow(alturaCm, 0.725);

export function ckdepiOriginal({ creatinina, idade, sexo, altura, peso, isRenalCronico, acr }) {
  const cr = parseFloat(normalizeInput(creatinina));
  const age = parseInt(idade);
  const acrValue = parseFloat(normalizeInput(acr));
  const alturaNum = parseFloat(normalizeInput(altura));
  const pesoNum = parseFloat(normalizeInput(peso));
  const isMulher = sexo === 'f';

  if (
    !creatinina || isNaN(cr) || cr <= 0 ||
    !idade || isNaN(age) || age <= 0 ||
    !sexo
  ) {
    return {
      ok: false,
      erroCreatinina: !creatinina || isNaN(cr) || cr <= 0,
      erroIdade: !idade || isNaN(age) || age <= 0,
      erroSexo: !sexo,
      mensagem: 'Por favor, preencha creatinina, idade e sexo.',
    };
  }
  const erroAcr = isRenalCronico && (!acr || isNaN(acrValue) || acrValue <= 0);

  const k = isMulher ? 0.7 : 0.9;
  const alpha = isMulher ? -0.241 : -0.302;
  const minCrK = Math.min(cr / k, 1);
  const maxCrK = Math.max(cr / k, 1);
  const fatorSexo = isMulher ? 1.012 : 1;
  const gfrIndexado = 142 *
    Math.pow(minCrK, alpha) *
    Math.pow(maxCrK, -1.200) *
    Math.pow(0.9938, age) *
    fatorSexo;

  let gfrAbsoluto = undefined;
  let textoAbsoluto = '';
  if (!isNaN(alturaNum) && !isNaN(pesoNum) && alturaNum > 0 && pesoNum > 0) {
    const bsa = calcularBSA(alturaNum, pesoNum);
    gfrAbsoluto = gfrIndexado * (bsa / 1.73);
    textoAbsoluto = `\n\nValor absoluto (desindexado):\n${gfrAbsoluto.toFixed(1)} mL/min\n(recomendado para ajuste de dose)`;
  } else {
    textoAbsoluto = '\n\n💡 Toque na seção "Valor desindexado" acima\npara inserir altura e peso (recomendado)';
  }
  let textoResultado = `TFG estimada:\n${gfrIndexado.toFixed(1)} mL/min/1.73m²${textoAbsoluto}`;
  let classificacao = undefined;
  if (isRenalCronico && !isNaN(acrValue)) {
    classificacao = classificarDRC(gfrIndexado, acrValue);
    textoResultado += `\n\nClassificação DRC: ${classificacao}`;
  }
  const valorParaAjuste = gfrAbsoluto || gfrIndexado;
  return {
    ok: true,
    gfrIndexado,
    gfrAbsoluto,
    classificacao,
    erroAcr,
    texto: textoResultado,
    cor: getGfrColor(gfrIndexado),
    valorParaAjuste: valorParaAjuste.toFixed(1),
  };
}

// ───────────────────────── grades de entrada ─────────────────────────
const pesos = ['70', '70,5', '100.2', '45', '0', '', '  ', 'abc', '-5', '7,0,1'];
const alturas = ['175', '1.75', '1,75', '160', '210', '150.5', '0', '', 'abc', '-170', '17500'];
export const gradeImc = [];
for (const p of pesos) for (const a of alturas) gradeImc.push({ peso: p, altura: a });

const creats = ['0.4', '0,6', '0.7', '0.9', '1', '1,5', '2.3', '4', '8.2', '15', '.5', ' 1.1 ', '0', '', 'abc', '-1'];
const idades = ['18', '35', '50', '65', '80', '95', '45.9', '0', '', 'abc', '-3'];
const sexos = ['f', 'm', ''];
const antropo = [['', ''], ['170', '70'], ['150,5', '45'], ['180', '0'], ['abc', '70']];
const drcs = [[false, ''], [true, '10'], [true, '30'], [true, '30,1'], [true, '300'], [true, '301'], [true, '1000'], [true, ''], [true, 'abc'], [true, '0']];
export const gradeCkdEpi = [];
for (const c of creats) for (const i of idades) for (const s of sexos) for (const [al, pe] of antropo) for (const [d, ac] of drcs) {
  gradeCkdEpi.push({ creatinina: c, idade: i, sexo: s, altura: al, peso: pe, drc: d, acr: ac });
}
