import { describe, expect, it } from 'vitest';
import { calcularPrevent, type EntradaPrevent } from '@/lib/clinical/prevent';
import { COEF_PREVENT } from '@/lib/clinical/prevent-coef';

// Casos de referência do pacote 'preventr' (tests/testthat/test-estimate_risk.R), valores arredondados a 3 casas (fração):
// 50 anos, PAS 160 em tratamento, CT 200, HDL 45, sem estatina, diabetes, não fumante, TFG 90, IMC 35.
const base: EntradaPrevent = { idade: '50', sexo: 'f', colesterolTotal: '200', hdl: '45', pas: '160', imc: '35', egfr: '90', uacr: '',
  tratamentoHas: true, estatina: false, diabetes: true, fumante: false };
const r3 = (pct: number) => Math.round(pct * 10) / 1000; // % → fração com 3 casas

function rodar(e: EntradaPrevent) {
  const x = calcularPrevent(e);
  if (!x.ok) throw new Error(x.mensagem);
  return x;
}

describe('PREVENT — casos de referência', () => {
  const casos: [string, Partial<EntradaPrevent>, number[], number[]][] = [
    ['base, mulher', {}, [0.147, 0.092, 0.081], [0.53, 0.354, 0.39]],
    ['base, homem', { sexo: 'm' }, [0.163, 0.102, 0.106], [0.514, 0.349, 0.424]],
    ['UACR 92, mulher', { uacr: '92' }, [0.181, 0.111, 0.105], [0.565, 0.381, 0.437]],
    ['UACR 92, homem', { sexo: 'm', uacr: '92' }, [0.195, 0.123, 0.13], [0.535, 0.368, 0.448]],
  ];
  for (const [nome, o, dez, trinta] of casos) {
    it(nome, () => {
      const x = rodar({ ...base, ...o });
      expect([x.dez.totalCvd, x.dez.ascvd, x.dez.insuficienciaCardiaca].map(r3)).toEqual(dez);
      expect([x.trinta!.totalCvd, x.trinta!.ascvd, x.trinta!.insuficienciaCardiaca].map(r3)).toEqual(trinta);
    });
  }
});

describe('PREVENT — comportamento', () => {
  it('usa o modelo certo conforme a albuminúria', () => {
    expect(rodar(base).modelo).toBe('base');
    expect(rodar({ ...base, uacr: '30' }).modelo).toBe('uacr');
  });
  it('acima de 59 anos não estima 30 anos', () => {
    const x = rodar({ ...base, idade: '65' });
    expect(x.trinta).toBeNull();
    expect(x.avisos.join(' ')).toContain('59');
  });
  it('mais albuminúria, tabagismo, estatina ausente e TFG menor elevam/baixam o risco no sentido esperado', () => {
    const b = rodar({ ...base, uacr: '30' }).dez.totalCvd;
    expect(rodar({ ...base, uacr: '300' }).dez.totalCvd).toBeGreaterThan(b);
    expect(rodar({ ...base, uacr: '30', fumante: true }).dez.totalCvd).toBeGreaterThan(b);
    expect(rodar({ ...base, uacr: '30', egfr: '30' }).dez.totalCvd).toBeGreaterThan(b);
    expect(rodar({ ...base, uacr: '30', estatina: true }).dez.totalCvd).toBeLessThan(b);
  });
  it('valida faixas', () => {
    expect(calcularPrevent({ ...base, idade: '29', pas: '200', egfr: '10' })).toMatchObject({ ok: false, campos: ['idade', 'pas', 'egfr'] });
    expect(calcularPrevent({ ...base, sexo: '' })).toMatchObject({ ok: false, campos: ['sexo'] });
  });
  it('tabelas de coeficientes têm o tamanho certo (24/25/23 e 24+ termos)', () => {
    expect(COEF_PREVENT.base_10yr.female.ascvd).toHaveLength(23);
    expect(COEF_PREVENT.uacr_10yr.male.total_cvd).toHaveLength(25);
    expect(COEF_PREVENT.base_30yr.female.heart_failure).toHaveLength(24);
    expect(COEF_PREVENT.uacr_30yr.male.ascvd).toHaveLength(26);
  });
});
