import { describe, expect, it } from 'vitest';
import { calcularIMC } from '@/lib/clinical/imc';
// @ts-expect-error módulo JS de referência (lógica original do app)
import { imcOriginal, gradeImc } from '../golden/original.mjs';

const dentro = (n: number, min: number, max: number) => n >= min && n <= max;

describe('IMC — novo x original (com a divergência aprovada IMC-1)', () => {
  it(`concorda com o original em ${gradeImc.length} entradas, exceto fora da faixa plausível`, () => {
    for (const e of gradeImc) {
      const orig = imcOriginal(e.peso, e.altura);
      const novo = calcularIMC(e.peso, e.altura);
      const ctx = JSON.stringify(e);

      if (orig.ok) {
        const pesoOk = dentro(parseFloat(e.peso.replace(',', '.')), 1, 500);
        const alturaOk = dentro(parseFloat(e.altura.replace(',', '.')), 50, 250);
        if (pesoOk && alturaOk) {
          expect(novo, ctx).toEqual(orig); // mesmo resultado, idêntico
        } else {
          expect(novo.ok, ctx).toBe(false); // divergência aprovada: fora da faixa não calcula
          expect(!novo.ok && novo.mensagem, ctx).toContain('fora da faixa esperada');
        }
      } else {
        expect(novo.ok, ctx).toBe(false);
        if (!novo.ok) {
          // campos que já eram inválidos continuam sinalizados; o exemplo da altura agora é em cm
          if (orig.erroPeso) expect(novo.erroPeso, ctx).toBe(true);
          if (orig.erroAltura) expect(novo.erroAltura, ctx).toBe(true);
          const base = orig.mensagem.replace('uma altura válida (ex.: 1.75)', 'uma altura válida em cm (ex.: 175)');
          expect(novo.mensagem.startsWith(base), ctx).toBe(true);
        }
      }
    }
  });

  it('casos de referência', () => {
    const r = calcularIMC('70', '175');
    expect(r.ok && r.imc.toFixed(1)).toBe('22.9');
    expect(r.ok && r.classificacao).toBe('Peso normal');
  });

  it('IMC-1: altura digitada em metros (1.75) é recusada e orienta usar cm', () => {
    const r = calcularIMC('70', '1.75');
    expect(r.ok).toBe(false);
    expect(!r.ok && r.erroAltura).toBe(true);
    expect(!r.ok && r.mensagem).toBe('Altura fora da faixa esperada (50 a 250 cm). Digite a altura em centímetros (ex.: 175).');
  });

  it('limites da faixa são aceitos; fora deles, não', () => {
    expect(calcularIMC('1', '50').ok).toBe(true);
    expect(calcularIMC('500', '250').ok).toBe(true);
    expect(calcularIMC('0.9', '170').ok).toBe(false);
    expect(calcularIMC('501', '170').ok).toBe(false);
    expect(calcularIMC('70', '49.9').ok).toBe(false);
    expect(calcularIMC('70', '250.1').ok).toBe(false);
  });

  it('peso e altura inválidos ao mesmo tempo, mensagem única', () => {
    const r = calcularIMC('', '1.75');
    expect(!r.ok && r.mensagem).toContain('Por favor, insira um peso válido (ex.: 70.5).');
    expect(!r.ok && r.mensagem).toContain('Altura fora da faixa esperada');
  });
});
