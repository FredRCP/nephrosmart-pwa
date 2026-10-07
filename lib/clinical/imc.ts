// Índice de Massa Corporal — portado de IMCCalculator.tsx (app original) COM as correções aprovadas:
//   IMC-1: altura sempre em cm, com validação de faixa plausível (antes: 1.75 → IMC de 228 mil).
import { dentroDaFaixa, FAIXAS, fmt } from './faixas';

export type ClassificacaoIMC =
  | 'Abaixo do peso'
  | 'Peso normal'
  | 'Sobrepeso'
  | 'Obesidade Grau I'
  | 'Obesidade Grau II'
  | 'Obesidade Grau III';

export function classificarIMC(imc: number): ClassificacaoIMC {
  if (imc < 18.5) return 'Abaixo do peso';
  if (imc < 25) return 'Peso normal';
  if (imc < 30) return 'Sobrepeso';
  if (imc < 35) return 'Obesidade Grau I';
  if (imc < 40) return 'Obesidade Grau II';
  return 'Obesidade Grau III';
}

export type ResultadoIMC =
  | { ok: false; erroPeso: boolean; erroAltura: boolean; mensagem: string }
  | { ok: true; imc: number; classificacao: ClassificacaoIMC; texto: string };

/** @param pesoTxt peso em kg (texto digitado) @param alturaTxt altura em CENTÍMETROS (texto digitado) */
export function calcularIMC(pesoTxt: string, alturaTxt: string): ResultadoIMC {
  const pesoKg = parseFloat(pesoTxt.replace(',', '.'));
  const alturaCm = parseFloat(alturaTxt.replace(',', '.'));

  // Entrada vazia ou não numérica (regra do app original)
  const pesoInvalido = !pesoTxt.trim() || isNaN(pesoKg) || pesoKg <= 0;
  const alturaInvalida = !alturaTxt.trim() || isNaN(alturaCm) || alturaCm <= 0;
  // Número válido, mas fora da faixa plausível (correção aprovada)
  const pesoFora = !pesoInvalido && !dentroDaFaixa(pesoKg, FAIXAS.pesoKg);
  const alturaFora = !alturaInvalida && !dentroDaFaixa(alturaCm, FAIXAS.alturaCm);

  if (pesoInvalido || alturaInvalida || pesoFora || alturaFora) {
    const partes: string[] = [];

    const faltando: string[] = [];
    if (pesoInvalido) faltando.push('um peso válido (ex.: 70.5)');
    if (alturaInvalida) faltando.push('uma altura válida em cm (ex.: 175)');
    if (faltando.length) partes.push('Por favor, insira ' + faltando.join(' e ') + '.');

    if (pesoFora) partes.push(`Peso fora da faixa esperada (${fmt(FAIXAS.pesoKg.min)} a ${fmt(FAIXAS.pesoKg.max)} kg).`);
    if (alturaFora) {
      partes.push(
        `Altura fora da faixa esperada (${fmt(FAIXAS.alturaCm.min)} a ${fmt(FAIXAS.alturaCm.max)} cm). Digite a altura em centímetros (ex.: 175).`,
      );
    }
    return { ok: false, erroPeso: pesoInvalido || pesoFora, erroAltura: alturaInvalida || alturaFora, mensagem: partes.join(' ') };
  }

  const alturaM = alturaCm / 100;
  const imc = pesoKg / (alturaM * alturaM);
  const classificacao = classificarIMC(imc);
  return { ok: true, imc, classificacao, texto: `IMC: ${imc.toFixed(1)} kg/m²\nClassificação: ${classificacao}` };
}
