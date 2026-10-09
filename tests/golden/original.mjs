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

// ─────────────── Cockcroft-Gault (original: CockcroftGaultCalculator.tsx, calculateClCr) ───────────────
export function cockcroftOriginal({ idade, peso, creatinina, sexo }) {
  // no app a tela já guarda o texto normalizado (normalizeInput a cada tecla)
  const age = normalizeInput(idade), weight = normalizeInput(peso), creatinine = normalizeInput(creatinina), sex = sexo;
  const ageNum = parseFloat(age);
  const weightNum = parseFloat(weight);
  const creatinineNum = parseFloat(creatinine);
  const eIdade = !age || isNaN(ageNum) || ageNum <= 0;
  const ePeso = !weight || isNaN(weightNum) || weightNum <= 0;
  const eCr = !creatinine || isNaN(creatinineNum) || creatinineNum <= 0;
  const eSexo = !sex;
  if (eIdade || ePeso || eCr || eSexo) {
    let mensagemErro = 'Por favor, insira ';
    const erros = [];
    if (eIdade) erros.push('uma idade válida (ex.: 50)');
    if (ePeso) erros.push('um peso válido (ex.: 70)');
    if (eCr) erros.push('uma creatinina válida (ex.: 0.8)');
    if (eSexo) erros.push('o sexo');
    if (erros.length === 1) {
      mensagemErro += erros[0] + '.';
    } else if (erros.length === 2) {
      mensagemErro += erros.join(' e ') + '.';
    } else {
      mensagemErro += erros.slice(0, -1).join(', ') + ' e ' + erros[erros.length - 1] + '.';
    }
    return { ok: false, erroIdade: eIdade, erroPeso: ePeso, erroCreatinina: eCr, erroSexo: eSexo, mensagem: mensagemErro };
  }
  let clcr;
  if (sex === 'm') {
    clcr = ((140 - ageNum) * weightNum) / (72 * creatinineNum);
  } else {
    clcr = ((140 - ageNum) * weightNum * 0.85) / (72 * creatinineNum);
  }
  const getClcrColor = (c) => {
    if (c >= 90) return '#22c55e';
    if (c >= 60) return '#fef08a';
    if (c >= 30) return '#f97316';
    return '#ef4444';
  };
  return { ok: true, clcr, cor: getClcrColor(clcr), texto: `Clearance de Creatinina: ${clcr.toFixed(1)} mL/min`, salvo: clcr.toString() };
}

// ─────────────── CKD-EPI 2021 Cr + Cistatina C (original: CKDEPI2021CreatCysCalculator.tsx) ───────────────
export function creatCisOriginal({ creatinina, cistatina, idade, sexo, drc, acr }) {
  const creatinine = creatinina, cystatinC = cistatina, age = idade, sex = sexo, isRenalChronic = drc;
  const cr = parseFloat(normalizeInput(creatinine));
  const cys = parseFloat(normalizeInput(cystatinC));
  const ageNum = parseFloat(normalizeInput(age)); // a tela guarda a idade já normalizada
  const acrValue = parseFloat(normalizeInput(acr));
  const isFemale = sex === 'f';
  const eCr = !creatinine || isNaN(cr) || cr <= 0;
  const eCys = !cystatinC || isNaN(cys) || cys <= 0;
  const eIdade = !age || isNaN(ageNum) || ageNum <= 0;
  const eSexo = !sex;
  const eAcr = isRenalChronic && (!acr || isNaN(acrValue) || acrValue <= 0);
  if (eCr || eCys || eIdade || eSexo || eAcr) {
    let mensagemErro = 'Por favor, insira ';
    const erros = [];
    if (eCr) erros.push('uma creatinina válida');
    if (eCys) erros.push('uma cistatina C válida');
    if (eIdade) erros.push('uma idade válida');
    if (eSexo) erros.push('o sexo');
    if (eAcr) erros.push('uma relação albumina/creatinina válida');
    if (erros.length === 1) {
      mensagemErro += erros[0] + '.';
    } else if (erros.length === 2) {
      mensagemErro += erros.join(' e ') + '.';
    } else {
      mensagemErro += erros.slice(0, -1).join(', ') + ' e ' + erros[erros.length - 1] + '.';
    }
    return { ok: false, erroCreatinina: eCr, erroCistatina: eCys, erroIdade: eIdade, erroSexo: eSexo, erroAcr: eAcr, mensagem: mensagemErro };
  }
  const kappa = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.219 : -0.144;
  const minCrKappa = Math.min(cr / kappa, 1);
  const maxCrKappa = Math.max(cr / kappa, 1);
  const minCys = Math.min(cys / 0.8, 1);
  const maxCys = Math.max(cys / 0.8, 1);
  const sexFactor = isFemale ? 1.012 : 1;
  const gfr =
    135 *
    Math.pow(minCrKappa, alpha) *
    Math.pow(maxCrKappa, -0.544) *
    Math.pow(minCys, -0.323) *
    Math.pow(maxCys, -0.778) *
    Math.pow(0.9961, ageNum) *
    sexFactor;
  let resultText = `eGFR: ${gfr.toFixed(1)} mL/min/1.73m²`;
  if (isRenalChronic && acr && !isNaN(acrValue)) {
    resultText += `\nClassificação DRC: ${classificarDRC(gfr, acrValue)}`;
  }
  return { ok: true, gfr, cor: getGfrColor(gfr), texto: resultText, salvo: gfr.toString() };
}

// ─────────────── TFG pediátrica (original: ClCrPediatricCalculator.tsx, calculate) ───────────────
export function pediatricoOriginal({ aba, altura, creatinina, idade, unidade, sexo, prematuro, creatininaAnterior, horas }) {
  const activeTab = aba, height = altura, creatinine = creatinina, age = idade, ageUnit = unidade, sex = sexo;
  const isPremature = prematuro, prevCreatinine = creatininaAnterior, timeHours = horas;
  const h = parseFloat(height);
  const c = parseFloat(creatinine);
  let hasError = false;
  let heightError = false, creatinineError = false, ageError = false;
  if (isNaN(h) || h < 30 || h > 200) { heightError = true; hasError = true; }
  if (isNaN(c) || c <= 0 || c > 10) { creatinineError = true; hasError = true; }
  let ageInYears = 0;
  let ageValid = true;
  if (ageUnit === 'dias') {
    const days = parseFloat(age);
    if (isNaN(days) || days < 0 || days > 365 * 18) ageValid = false;
    else ageInYears = days / 365.25;
  } else if (ageUnit === 'meses') {
    const months = parseFloat(age);
    if (isNaN(months) || months < 0 || months > 12 * 18) ageValid = false;
    else ageInYears = months / 12;
  } else {
    const years = parseFloat(age);
    if (isNaN(years) || years < 0 || years > 18) ageValid = false;
    else ageInYears = years;
  }
  if (!ageValid || !age.trim()) { ageError = true; hasError = true; }
  if (hasError) {
    return { ok: false, erroAltura: heightError, erroCreatinina: creatinineError, erroIdade: ageError, mensagem: 'Corrija os campos destacados em vermelho.' };
  }
  let tfg = 0;
  let method = '';
  if (activeTab === 'schwartz') {
    let k = 0.413;
    if (ageInYears < 1) {
      k = isPremature ? 0.33 : 0.45;
    } else if (ageInYears >= 13) {
      k = sex === 'male' ? 0.70 : 0.55;
    }
    tfg = (k * h) / c;
    method = 'Schwartz Bedside 2009';
    let stage = 'Função renal normal';
    if (tfg < 90) stage = 'DRC G2';
    if (tfg < 60) stage = 'DRC G3a–G3b';
    if (tfg < 30) stage = 'DRC G4–G5';
    return {
      ok: true, tfg,
      texto:
        `TFG estimada: ${tfg.toFixed(1)} mL/min/1.73m²\n` +
        `Método: ${method}\n` +
        `Classificação: ${stage}\n\n` +
        `(Valores normais aproximados em crianças: 90–140)`,
    };
  }
  const prev = parseFloat(prevCreatinine);
  const hours = parseFloat(timeHours) || 24;
  if (isNaN(prev) || prev <= 0 || prev > 10) {
    return { ok: false, erroAltura: false, erroCreatinina: false, erroIdade: false, mensagem: 'Creatinina anterior inválida (0.01–10 mg/dL).' };
  }
  if (hours <= 0 || hours > 168) {
    return { ok: false, erroAltura: false, erroCreatinina: false, erroIdade: false, mensagem: 'Intervalo deve estar entre 1 e 168 horas.' };
  }
  const base = (0.413 * h) / c;
  tfg = Math.max(base * 0.85, 5);
  method = 'Estimativa cinética adaptada (base Schwartz)';
  return {
    ok: true, tfg,
    texto:
      `TFG estimada (kinetic): ${tfg.toFixed(1)} mL/min/1.73m²\n` +
      `Método: ${method}\n\n` +
      `Indicado para LRA com creatinina em ascensão`,
  };
}

// ───────────────────────── grades (novas ferramentas) ─────────────────────────
const idadesCG = ['18', '35', '50', '65', '80', '95', '45.9', '45,9', '139', '140', '150', '0', '', 'abc', '-3', '120', '121', '5'];
const pesosCG = ['70', '70,5', '45', '120', '500', '501', '0.5', '0', '', 'abc', '-5'];
const creatsCG = ['0.4', '0,6', '0.8', '1', '1,5', '2.3', '8.2', '30', '31', '0.05', '.5', ' 1.1 ', '0', '', 'abc', '-1'];
export const gradeCockcroft = [];
for (const i of idadesCG) for (const p of pesosCG) for (const c of creatsCG) for (const s of ['f', 'm', '']) {
  gradeCockcroft.push({ idade: i, peso: p, creatinina: c, sexo: s });
}

const cysVals = ['0.5', '0,8', '0.9', '1', '1,5', '2.5', '5', '20', '21', '0.05', '.7', '0', '', 'abc', '-1'];
const creatsCys = ['0.4', '0,6', '0.7', '0.9', '1', '1,5', '4', '30', '31', '.5', '0', '', 'abc'];
const idadesCys = ['18', '35', '50', '65', '80', '45.9', '45,9', '120', '121', '10', '0', '', 'abc', '-3'];
const drcsCys = [[false, ''], [true, '10'], [true, '30'], [true, '300'], [true, '301'], [true, ''], [true, 'abc'], [true, '0']];
export const gradeCreatCis = [];
for (const c of creatsCys) for (const y of cysVals) for (const i of idadesCys) for (const s of ['f', 'm', '']) for (const [d, ac] of drcsCys) {
  gradeCreatCis.push({ creatinina: c, cistatina: y, idade: i, sexo: s, drc: d, acr: ac });
}

const alturasPed = ['30', '29', '50', '75', '100.5', '120', '150', '175', '200', '201', '0', '', 'abc'];
const creatsPed = ['0.2', '0.4', '0.8', '1', '1.5', '3', '10', '10.1', '0', '', 'abc'];
const idadesPed = ['364', '365', '366', '4748', '4749', '0', '3', '10', '30', '180', '1', '6', '12', '12.9', '13', '16', '18', '19', '', 'abc'];
export const gradePediatrico = [];
for (const aba of ['schwartz', 'chen']) for (const al of alturasPed) for (const c of creatsPed) for (const i of idadesPed) for (const u of ['dias', 'meses', 'anos'])
  for (const [sx, pr] of [[null, false], ['male', false], ['female', false], ['male', true], [null, true]])
    for (const [pa, hr] of (aba === 'chen' ? [['', ''], ['1', ''], ['1.2', '12'], ['0', '24'], ['11', '24'], ['1', '200'], ['1', '0']] : [['', '']])) {
      gradePediatrico.push({ aba, altura: al, creatinina: c, idade: i, unidade: u, sexo: sx, prematuro: pr, creatininaAnterior: pa, horas: hr });
    }
