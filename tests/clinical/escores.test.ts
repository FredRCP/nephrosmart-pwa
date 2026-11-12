import { describe, expect, it } from 'vitest';
import { avaliarFav, calcularKfre, calcularPce, glasgow } from '@/lib/clinical/escores';

const base = { idade: '55', colesterolTotal: '213', hdl: '50', pas: '120', tratamentoHas: false, fumante: false, diabetes: false };

describe('Glasgow', () => {
  it('soma e classifica', () => {
    expect(glasgow(4, 5, 6)).toMatchObject({ total: 15, classe: 'leve', resumo: 'E4 V5 M6' });
    expect(glasgow(3, 4, 6)?.classe).toBe('leve'); // 13
    expect(glasgow(3, 3, 6)?.classe).toBe('moderado'); // 12
    expect(glasgow(2, 3, 4)?.classe).toBe('moderado'); // 9
    expect(glasgow(2, 2, 4)?.classe).toBe('grave'); // 8
    expect(glasgow(1, 1, 1)?.total).toBe(3);
  });
  it('rejeita valores fora da escala', () => {
    expect(glasgow(5, 1, 1)).toBeNull();
    expect(glasgow(1, 6, 1)).toBeNull();
    expect(glasgow(1, 1, 0)).toBeNull();
  });
});

describe('Regra dos 6 (FAV)', () => {
  it('limites inclusivos', () => {
    expect(avaliarFav('600', '6', '6', true).atendeTodos).toBe(true);
    expect(avaliarFav('599', '6', '6', true).naoAtendidos).toEqual(['Fluxo < 600 mL/min']);
    expect(avaliarFav('600', '5,9', '6', true).naoAtendidos).toEqual(['Diâmetro < 6 mm']);
    expect(avaliarFav('600', '6', '6,1', true).naoAtendidos).toEqual(['Profundidade > 6 mm']);
    expect(avaliarFav('600', '6', '6', false).naoAtendidos).toEqual(['Veia não palpável/compressível']);
  });
  it('campo vazio é pendente (não vira 0 e reprova/aprova sem dado)', () => {
    const r = avaliarFav('', '', '', null);
    expect(r.completo).toBe(false);
    expect(r.atendeTodos).toBe(false);
    expect(r.naoAtendidos).toEqual([]);
    expect(avaliarFav('700', '', '', null).atendeTodos).toBe(false);
  });
  it('valores absurdos são inválidos', () => {
    expect(avaliarFav('abc', '6', '6', true).criterios[0].situacao).toBe('invalido');
    expect(avaliarFav('600', '-1', '6', true).criterios[1].situacao).toBe('invalido');
    expect(avaliarFav('600', '6', '99', true).criterios[2].situacao).toBe('invalido');
  });
});

describe('PCE (exemplos do apêndice de Goff 2014: 55 anos, CT 213, HDL 50, PAS 120, sem tratamento/tabagismo/DM)', () => {
  const r = (sexo: 'm' | 'f', grupo: 'branco-outros' | 'afro') => {
    const x = calcularPce({ ...base, sexo, grupo });
    if (!x.ok) throw new Error('inválido');
    return x.risco;
  };
  it('reproduz os valores publicados (±0,1)', () => {
    expect(r('f', 'branco-outros')).toBeCloseTo(2.1, 1);
    expect(r('f', 'afro')).toBeCloseTo(3.0, 1);
    expect(Math.abs(r('m', 'branco-outros') - 5.3)).toBeLessThan(0.11);
    expect(r('m', 'afro')).toBeCloseTo(6.1, 1);
  });
  it('fatores de risco aumentam o risco; tratamento usa outro coeficiente', () => {
    const b = r('m', 'branco-outros');
    for (const k of ['fumante', 'diabetes', 'tratamentoHas'] as const) {
      const x = calcularPce({ ...base, sexo: 'm', grupo: 'branco-outros', [k]: true });
      expect(x.ok && x.risco).toBeGreaterThan(b);
    }
  });
  it('classifica pelas faixas 2018 nos limites', () => {
    const x = calcularPce({ ...base, sexo: 'm', grupo: 'afro' });
    expect(x.ok && x.faixa).toBe('limitrofe'); // 6,1%
    const alto = calcularPce({ ...base, idade: '75', sexo: 'm', grupo: 'afro', fumante: true, diabetes: true, tratamentoHas: true });
    expect(alto.ok && alto.faixa).toBe('alto');
  });
  it('valida faixas de entrada', () => {
    const x = calcularPce({ ...base, idade: '39', sexo: '', grupo: 'afro', hdl: '10' });
    expect(x).toMatchObject({ ok: false, campos: ['idade', 'sexo', 'hdl'] });
  });
});

describe('KFRE 4 variáveis', () => {
  const e = { idade: '60', sexo: 'm' as const, egfr: '30', acr: '500', regiao: 'america-norte' as const };
  it('bate com o cálculo independente da equação publicada', () => {
    const r = calcularKfre(e);
    if (!r.ok) throw new Error();
    const l = -0.2201 * (6 - 7.036) + 0.2467 * (1 - 0.5642) - 0.5567 * (6 - 7.222) + 0.451 * (Math.log(500) - 5.137);
    expect(r.risco2).toBeCloseTo((1 - 0.975 ** Math.exp(l)) * 100, 8);
    expect(r.risco5).toBeCloseTo((1 - 0.924 ** Math.exp(l)) * 100, 8);
    expect(r.risco2).toBeCloseTo(10.75, 1);
    expect(r.risco5).toBeCloseTo(29.88, 1);
  });
  it('calibração fora da América do Norte dá risco menor', () => {
    const a = calcularKfre(e), b = calcularKfre({ ...e, regiao: 'fora-america-norte' });
    expect(a.ok && b.ok && b.risco2 < a.risco2 && b.risco5 < a.risco5).toBe(true);
  });
  it('mais ACR, menor TFG, mais jovem e homem → maior risco', () => {
    const r = (o: object) => { const x = calcularKfre({ ...e, ...o }); return x.ok ? x.risco5 : NaN; };
    const b = r({});
    expect(r({ acr: '1000' })).toBeGreaterThan(b);
    expect(r({ egfr: '20' })).toBeGreaterThan(b);
    expect(r({ idade: '50' })).toBeGreaterThan(b);
    expect(r({ sexo: 'f' })).toBeLessThan(b);
  });
  it('avisa TFG ≥ 60 e valida entradas', () => {
    const r = calcularKfre({ ...e, egfr: '75' });
    expect(r.ok && r.avisos[0]).toContain('G3–G5');
    expect(calcularKfre({ ...e, acr: '' })).toMatchObject({ ok: false, campos: ['acr'] });
    expect(calcularKfre({ ...e, acr: '0' })).toMatchObject({ ok: false });
  });
});
