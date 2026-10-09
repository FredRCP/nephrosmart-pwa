import { describe, expect, it } from 'vitest';
import { calcularCockcroft, clcrCockcroftGault, corClCr, juntarPendencias, textoClCrSalvo } from '@/lib/clinical/cockcroft';
import { calcularCreatCistatina, tfgCreatCistatina, textoGfrSalvo } from '@/lib/clinical/ckdepi-cistatina';
import { calcularPediatrico, kSchwartz, normalizarPediatrico } from '@/lib/clinical/pediatrico';
// @ts-expect-error módulo JS de referência (lógica original do app)
import { cockcroftOriginal, creatCisOriginal, pediatricoOriginal, gradeCockcroft, gradeCreatCis, gradePediatrico } from '../golden/original.mjs';

const num = (t: string) => parseFloat(t.replace(',', '.').trim());
const dentro = (n: number, a: number, b: number) => !isNaN(n) && n >= a && n <= b;

describe('Cockcroft-Gault — novo x original (divergências CG-1/CG-2)', () => {
  it(`concorda com o original em ${gradeCockcroft.length} entradas, exceto pelas recusas de faixa`, () => {
    let aceitos = 0;
    for (const e of gradeCockcroft) {
      const orig = cockcroftOriginal(e);
      const novo = calcularCockcroft(e);
      const ctx = JSON.stringify(e);
      if (!orig.ok) {
        expect(novo.ok, ctx).toBe(false);
        if (!novo.ok) {
          expect(novo.mensagem, ctx).toBe(orig.mensagem);
          expect([novo.erroIdade, novo.erroPeso, novo.erroCreatinina, novo.erroSexo], ctx)
            .toEqual([orig.erroIdade, orig.erroPeso, orig.erroCreatinina, orig.erroSexo]);
        }
      } else if (novo.ok) {
        aceitos++;
        expect(novo.clcr, ctx).toBe(orig.clcr);
        expect(novo.texto, ctx).toBe(orig.texto);
        expect(novo.cor, ctx).toBe(orig.cor);
        expect(novo.avisos.length > 0, ctx).toBe(num(e.idade) < 18);
      } else {
        const fora = !dentro(num(e.idade), 1, 120) || !dentro(num(e.peso), 1, 500) || !dentro(num(e.creatinina), 0.1, 30);
        expect(fora, ctx).toBe(true);
      }
    }
    expect(aceitos).toBeGreaterThan(500); // garante que a comparação não ficou vazia
  });
  // conferidos à mão: homem (140−50)×70/(72×1) = 87,5 ; mulher ×0,85 = 74,375
  it('valores conferidos à mão', () => {
    expect(clcrCockcroftGault(50, 70, 1, 'm')).toBeCloseTo(87.5, 6);
    expect(clcrCockcroftGault(50, 70, 1, 'f')).toBeCloseTo(74.375, 6);
  });
  it('cores nos limites 90 / 60 / 30', () => {
    expect([corClCr(90), corClCr(89.9), corClCr(60), corClCr(59.9), corClCr(30), corClCr(29.9)])
      .toEqual(['#22c55e', '#fef08a', '#fef08a', '#f97316', '#f97316', '#ef4444']);
  });
  it('mensagens de pendência: 1, 2 e 3 ou mais', () => {
    expect(juntarPendencias(['a'])).toBe('Por favor, insira a.');
    expect(juntarPendencias(['a', 'b'])).toBe('Por favor, insira a e b.');
    expect(juntarPendencias(['a', 'b', 'c'])).toBe('Por favor, insira a, b e c.');
  });
  it('CG-2: menor de 18 anos calcula e avisa', () => {
    const r = calcularCockcroft({ idade: '10', peso: '30', creatinina: '0.6', sexo: 'm' });
    expect(r.ok && r.avisos.join()).toContain('Clearance Pediátrico');
  });
  it('recarregar usa o valor arredondado, como o original', () => {
    expect(textoClCrSalvo(null)).toEqual({ texto: 'Nenhum ClCr salvo encontrado.', cor: null });
    expect(textoClCrSalvo('89.96')).toEqual({ texto: 'Último ClCr salvo: 90.0 mL/min', cor: '#22c55e' });
  });
});

describe('CKD-EPI 2021 Creatinina + Cistatina C — novo x original (CYS-1/CYS-2)', () => {
  it(`concorda com o original em ${gradeCreatCis.length} entradas, exceto pelas recusas de faixa`, () => {
    let aceitos = 0;
    for (const e of gradeCreatCis) {
      const orig = creatCisOriginal(e);
      const novo = calcularCreatCistatina(e);
      const ctx = JSON.stringify(e);
      if (!orig.ok) {
        expect(novo.ok, ctx).toBe(false);
        if (!novo.ok) {
          expect(novo.mensagem, ctx).toBe(orig.mensagem);
          expect([novo.erroCreatinina, novo.erroCistatina, novo.erroIdade, novo.erroSexo, novo.erroAcr], ctx)
            .toEqual([orig.erroCreatinina, orig.erroCistatina, orig.erroIdade, orig.erroSexo, orig.erroAcr]);
        }
      } else if (novo.ok) {
        aceitos++;
        expect(novo.gfr, ctx).toBe(orig.gfr);
        expect(novo.texto, ctx).toBe(orig.texto);
        expect(novo.cor, ctx).toBe(orig.cor);
        expect(novo.avisos.length > 0, ctx).toBe(num(e.idade) < 18);
      } else {
        const fora = !dentro(num(e.creatinina), 0.1, 30) || !dentro(num(e.cistatina), 0.1, 20) || !dentro(num(e.idade), 1, 120);
        expect(fora, ctx).toBe(true);
      }
    }
    expect(aceitos).toBeGreaterThan(500);
  });
  // homem, 50 anos, Cr 1,0, CisC 1,0: 135 × (1/0,9)^-0,544 × (1/0,8)^-0,778 × 0,9961^50 ≈ 88,1 (conta à mão)
  it('homem 50 anos, Cr 1,0 e Cis C 1,0 ≈ 88,1', () => {
    expect(tfgCreatCistatina(1, 1, 50, 'm')).toBeCloseTo(88.1, 1);
  });
  it('mulher tem o fator 1,012 e kappa 0,7', () => {
    // Cr = kappa e Cis = 0,8 → os termos de creatinina e cistatina valem 1
    expect(tfgCreatCistatina(0.7, 0.8, 40, 'f')).toBeCloseTo(135 * Math.pow(0.9961, 40) * 1.012, 6);
    expect(tfgCreatCistatina(0.9, 0.8, 40, 'm')).toBeCloseTo(135 * Math.pow(0.9961, 40), 6);
  });
  it('recarregar: indexado (padrão) ou absoluto (CYS-3)', () => {
    expect(textoGfrSalvo(null, null)).toEqual({ texto: 'Nenhum GFR salvo encontrado.', cor: null });
    expect(textoGfrSalvo('72.34', null).texto).toBe('Último GFR salvo: 72.3 mL/min/1.73m²');
    expect(textoGfrSalvo('72.34', 'indexado').texto).toBe('Último GFR salvo: 72.3 mL/min/1.73m²');
    expect(textoGfrSalvo('72.34', 'absoluto').texto).toContain('valor absoluto');
  });
});

describe('TFG pediátrica — novo IDÊNTICO ao original', () => {
  it(`concorda com o original em ${gradePediatrico.length} entradas`, () => {
    for (const e of gradePediatrico) {
      const orig = pediatricoOriginal(e);
      const novo = calcularPediatrico(e);
      expect(novo, JSON.stringify(e)).toEqual(orig);
    }
  });
  // conferidos à mão
  it('k por faixa etária e sexo', () => {
    expect(kSchwartz(0.5, false, null)).toBe(0.45);
    expect(kSchwartz(0.5, true, null)).toBe(0.33);
    expect(kSchwartz(1, true, null)).toBe(0.413); // prematuro só vale abaixo de 1 ano
    expect(kSchwartz(12.99, false, 'male')).toBe(0.413);
    expect(kSchwartz(13, false, 'male')).toBe(0.7);
    expect(kSchwartz(13, false, 'female')).toBe(0.55);
  });
  const base = { aba: 'schwartz' as const, altura: '100', creatinina: '0.5', idade: '5', unidade: 'anos' as const, sexo: null, prematuro: false, creatininaAnterior: '', horas: '' };
  it('Schwartz: 0,413 × 100 / 0,5 = 82,6', () => {
    const r = calcularPediatrico(base);
    expect(r.ok && r.tfg).toBeCloseTo(82.6, 6);
    expect(r.ok && r.texto).toContain('Classificação: DRC G2');
  });
  it('idade em dias e meses vira anos (365,25 dias; 12 meses)', () => {
    expect(calcularPediatrico({ ...base, idade: '364', unidade: 'dias' }).ok && 1).toBe(1);
    const dias364 = calcularPediatrico({ ...base, idade: '364', unidade: 'dias', altura: '50', creatinina: '0.4' });
    expect(dias364.ok && dias364.tfg).toBeCloseTo((0.45 * 50) / 0.4, 6); // < 1 ano
    const dias366 = calcularPediatrico({ ...base, idade: '366', unidade: 'dias', altura: '50', creatinina: '0.4' });
    expect(dias366.ok && dias366.tfg).toBeCloseTo((0.413 * 50) / 0.4, 6); // ≥ 1 ano
    const meses156 = calcularPediatrico({ ...base, idade: '156', unidade: 'meses', sexo: 'male', altura: '160', creatinina: '0.8' });
    expect(meses156.ok && meses156.tfg).toBeCloseTo((0.7 * 160) / 0.8, 6); // 13 anos
  });
  it('Chen: 0,413 × 100 / 1 × 0,85 = 35,1; piso de 5', () => {
    const chen = { ...base, aba: 'chen' as const, creatinina: '1', creatininaAnterior: '0.8', horas: '12' };
    const r = calcularPediatrico(chen);
    expect(r.ok && r.tfg).toBeCloseTo(35.105, 6);
    const piso = calcularPediatrico({ ...chen, altura: '30', creatinina: '10' });
    expect(piso.ok && piso.tfg).toBe(5);
  });
  it('mensagens de erro do Chen', () => {
    const chen = { ...base, aba: 'chen' as const };
    expect(calcularPediatrico({ ...chen, creatininaAnterior: '' })).toMatchObject({ ok: false, mensagem: 'Creatinina anterior inválida (0.01–10 mg/dL).' });
    expect(calcularPediatrico({ ...chen, creatininaAnterior: '1', horas: '200' })).toMatchObject({ ok: false, mensagem: 'Intervalo deve estar entre 1 e 168 horas.' });
  });
  it('normalização de digitação igual à do original', () => {
    expect(normalizarPediatrico(',5')).toBe('0.5');
    expect(normalizarPediatrico('.')).toBe('0.');
    expect(normalizarPediatrico('007')).toBe('7');
    expect(normalizarPediatrico('1,2,3')).toBe('1.23');
    expect(normalizarPediatrico('12abc')).toBe('12');
  });
});
