import { describe, expect, it } from 'vitest';
import { estadiarKDIGO, type EntradaKDIGO } from '@/lib/clinical/kdigo';
import { calcularFuncaoEsperada } from '@/lib/clinical/funcaoEsperada';

const base: EntradaKDIGO = { basal: '', atual: '', janela: '', peso: '', volume: '', horas: '', trs: false };
const k = (p: Partial<EntradaKDIGO>) => estadiarKDIGO({ ...base, ...p });
function est(p: Partial<EntradaKDIGO>) { const r = k(p); if (!r.ok) throw new Error(r.mensagem); return r; }

describe('KDIGO: creatinina', () => {
  it('+0,3 mg/dL em até 48 h = estágio 1', () => { expect(est({ basal: '1.0', atual: '1.3', janela: 'ate48h' }).estagio).toBe(1); });
  it('+0,3 em 48 h com float (1,2 − 0,9 = 0,2999…) continua estágio 1', () => { expect(est({ basal: '0.9', atual: '1.2', janela: 'ate48h' }).estagio).toBe(1); });
  it('+0,2 mg/dL em 48 h = sem critério', () => { expect(est({ basal: '1.0', atual: '1.2', janela: 'ate48h' }).estagio).toBe(0); });
  it('+0,3 mg/dL em 2–7 dias NÃO conta (só vale em 48 h) e avisa', () => {
    const r = est({ basal: '1.0', atual: '1.3', janela: 'ate7d' });
    expect(r.estagio).toBe(0);
    expect(r.avisos.join(' ')).toContain('48 h');
  });
  it('razão 1,5× em 7 dias = estágio 1 (inclusive com float: 1,65/1,1 = 1,4999…)', () => {
    expect(est({ basal: '1.0', atual: '1.5', janela: 'ate7d' }).estagio).toBe(1);
    expect(est({ basal: '1.1', atual: '1.65', janela: 'ate7d' }).estagio).toBe(1);
  });
  it('razão 1,9× = 1; 2,0× = 2; 2,9× = 2; 3,0× = 3', () => {
    expect(est({ basal: '1.0', atual: '1.9', janela: 'ate7d' }).estagio).toBe(1);
    expect(est({ basal: '1.0', atual: '2.0', janela: 'ate7d' }).estagio).toBe(2);
    expect(est({ basal: '1.0', atual: '2.9', janela: 'ate7d' }).estagio).toBe(2);
    expect(est({ basal: '1.0', atual: '3.0', janela: 'ate7d' }).estagio).toBe(3);
  });
  it('3,0× com float (3,3 / 1,1 = 2,9999…) = estágio 3', () => { expect(est({ basal: '1.1', atual: '3.3', janela: 'ate7d' }).estagio).toBe(3); });
  it('Cr ≥ 4,0 com aumento agudo = estágio 3 (basal 2,0 → 4,0 = 2× e ≥ 4)', () => {
    expect(est({ basal: '2.0', atual: '4.0', janela: 'ate7d' }).estagio).toBe(3);
  });
  it('basal 3,5 → 4,0 em 48 h: +0,5 e Cr ≥ 4,0 = estágio 3', () => {
    expect(est({ basal: '3.5', atual: '4.0', janela: 'ate48h' }).estagio).toBe(3);
  });
  it('Cr 4,0 estável (DRC) NÃO é estágio 3 e avisa', () => {
    const r = est({ basal: '4.0', atual: '4.0', janela: 'ate7d' });
    expect(r.estagio).toBe(0);
    expect(r.avisos.join(' ')).toContain('4,0');
  });
  it('intervalo > 7 dias: o critério de creatinina não se aplica', () => {
    const r = est({ basal: '1.0', atual: '3.0', janela: 'mais7d' });
    expect(r.estagio).toBe(0);
    expect(r.avisos.join(' ')).toContain('7 dias');
  });
  it('queda da creatinina não é critério', () => { expect(est({ basal: '2.0', atual: '1.0', janela: 'ate48h' }).estagio).toBe(0); });
});

describe('KDIGO: diurese', () => {
  it('70 kg, 270 mL em 8 h = 0,48 mL/kg/h por 8 h → estágio 1', () => { expect(est({ peso: '70', volume: '270', horas: '8' }).estagio).toBe(1); });
  it('70 kg, 400 mL em 12 h = 0,48 → estágio 2', () => { expect(est({ peso: '70', volume: '400', horas: '12' }).estagio).toBe(2); });
  it('70 kg, 350 mL em 10 h = exatamente 0,5 → sem critério (é "< 0,5")', () => {
    const r = est({ peso: '70', volume: '350', horas: '10' });
    expect(r.estagio).toBe(0);
  });
  it('70 kg, 450 mL em 24 h = 0,27 mL/kg/h → estágio 3', () => { expect(est({ peso: '70', volume: '450', horas: '24' }).estagio).toBe(3); });
  it('70 kg, 800 mL em 24 h = 0,48 → estágio 2 (não chega a < 0,3)', () => { expect(est({ peso: '70', volume: '800', horas: '24' }).estagio).toBe(2); });
  it('70 kg, 200 mL em 12 h = 0,24 mL/kg/h: só estágio 2 (estágio 3 exige 24 h)', () => { expect(est({ peso: '70', volume: '200', horas: '12' }).estagio).toBe(2); });
  it('70 kg, 504 mL em 24 h = exatamente 0,3 → estágio 2 (estágio 3 é "< 0,3")', () => { expect(est({ peso: '70', volume: '504', horas: '24' }).estagio).toBe(2); });
  it('48 h é aceito (800 mL em 48 h = 0,24 → estágio 3); 73 h é recusado', () => {
    expect(est({ peso: '70', volume: '800', horas: '48' }).estagio).toBe(3);
    expect(k({ peso: '70', volume: '800', horas: '73' }).ok).toBe(false);
  });
  it('anúria por 12 h = estágio 3; por 8 h = estágio 1', () => {
    expect(est({ peso: '70', volume: '0', horas: '12' }).estagio).toBe(3);
    expect(est({ peso: '70', volume: '0', horas: '8' }).estagio).toBe(1);
  });
  it('período < 6 h é insuficiente', () => {
    const r = est({ peso: '70', volume: '10', horas: '5' });
    expect(r.estagio).toBe(0);
    expect(r.avisos.join(' ')).toContain('6 horas');
  });
  it('aceita vírgula decimal no volume e no peso', () => { expect(est({ peso: '70,5', volume: '400,5', horas: '12' }).estagio).toBe(2); });
});

describe('KDIGO: combinações, TRS e validação', () => {
  it('o estágio final é o mais grave: creatinina 1 + diurese 2 = 2', () => {
    const r = est({ basal: '1.0', atual: '1.5', janela: 'ate7d', peso: '70', volume: '400', horas: '12' });
    expect(r.estagio).toBe(2);
    expect(r.motivos).toHaveLength(2);
  });
  it('terapia renal substitutiva = estágio 3', () => { expect(est({ trs: true }).estagio).toBe(3); });
  it('nada informado: erro', () => { const r = k({}); expect(r.ok).toBe(false); });
  it('creatinina sem intervalo: marca "janela"', () => {
    const r = k({ basal: '1.0', atual: '2.0' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.campos).toEqual(['janela']);
  });
  it('só uma creatinina: marca a que falta', () => {
    const r = k({ basal: '1.0', janela: 'ate48h' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.campos).toEqual(['atual']);
  });
  it('diurese incompleta: marca o que falta', () => {
    const r = k({ peso: '70', volume: '400' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.campos).toEqual(['horas']);
  });
  it('valores fora da faixa são recusados (peso 0, horas 100, Cr 0,05)', () => {
    expect(k({ peso: '0', volume: '1', horas: '10' }).ok).toBe(false);
    expect(k({ peso: '70', volume: '1', horas: '100' }).ok).toBe(false);
    expect(k({ basal: '0.05', atual: '1', janela: 'ate48h' }).ok).toBe(false);
  });
  it('sem critérios: texto avisa que não exclui IRA', () => {
    const r = est({ basal: '1.0', atual: '1.1', janela: 'ate48h' });
    expect(r.texto).toContain('Sem critérios');
  });
});

describe('Função renal esperada (140 − idade)', () => {
  const v = (i: string) => { const r = calcularFuncaoEsperada(i); if (!r.ok) throw new Error(r.mensagem); return r; };
  it('40 anos → 100; 65,5 anos → 74,5', () => { expect(v('40').valor).toBe(100); expect(v('65,5').valor).toBe(74.5); });
  it('faixas: 29 → >110; 30 → 110 (90–110); 50 → 90; 51 → 89 (70–90); 70 → 70; 71 → 69 (<70)', () => {
    expect(v('29').interpretacao).toContain('acima de 110');
    expect(v('30').valor).toBe(110); expect(v('30').interpretacao).toContain('30 a 50');
    expect(v('50').valor).toBe(90); expect(v('50').interpretacao).toContain('30 a 50');
    expect(v('51').valor).toBe(89); expect(v('51').interpretacao).toContain('51 a 70');
    expect(v('70').valor).toBe(70); expect(v('70').interpretacao).toContain('51 a 70');
    expect(v('71').valor).toBe(69); expect(v('71').interpretacao).toContain('abaixo de 70');
  });
  it('texto sem marcação markdown e com aviso de estimativa', () => {
    const r = v('40');
    expect(r.texto).not.toContain('**');
    expect(r.avisos.join(' ')).toContain('CKD-EPI');
  });
  it('menor de 18 anos aponta o Clearance Pediátrico; 121, vazio e texto são recusados', () => {
    const c = calcularFuncaoEsperada('17');
    expect(c.ok).toBe(false);
    if (!c.ok) expect(c.mensagem).toContain('Clearance Pediátrico');
    expect(calcularFuncaoEsperada('121').ok).toBe(false);
    expect(calcularFuncaoEsperada('').ok).toBe(false);
    expect(calcularFuncaoEsperada('abc').ok).toBe(false);
    expect(calcularFuncaoEsperada('0').ok).toBe(false);
  });
});
