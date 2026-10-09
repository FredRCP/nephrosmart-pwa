import { describe, expect, it } from 'vitest';
import {
  calcularDrc, calcularLra, categoriaG, egfrBedside, egfrCkidCombinada, egfrCkidCr, egfrCkidCys, egfrLactente, idadeEmAnos, kCkidCr, kCkidCys,
  type EntradaDrc, type EntradaLra,
} from '@/lib/clinical/pediatria';

// Valores de referência calculados à parte (python, a partir das tabelas do NIDDK para a CKiD U25).
describe('CKiD U25 — equações', () => {
  it('menina 10 anos, 140 cm, Cr 0,6 → 82,90', () => expect(egfrCkidCr(10, 'f', 140, 0.6)).toBeCloseTo(82.9016, 3));
  it('menino 14 anos, 165 cm, Cr 0,9 → 78,08', () => expect(egfrCkidCr(14, 'm', 165, 0.9)).toBeCloseTo(78.0798, 3));
  it('menino 16 anos, cistatina 1,1 → 76,10', () => expect(egfrCkidCys(16, 'm', 1.1)).toBeCloseTo(76.1018, 3));
  it('menina 5 anos, cistatina 0,9 → 86,33', () => expect(egfrCkidCys(5, 'f', 0.9)).toBeCloseTo(86.3313, 3));
  it('combinada = média das duas', () => expect(egfrCkidCombinada(10, 'f', 140, 0.6, 1.0)).toBeCloseTo(81.0831, 3));
  it('18 anos usa o κ adulto (50,8 menino)', () => expect(egfrCkidCr(18, 'm', 175, 1)).toBeCloseTo(88.9, 6));
  it('κ nas emendas das faixas etárias', () => {
    expect(kCkidCr(12, 'f')).toBeCloseTo(36.1, 9);
    expect(kCkidCr(12, 'm')).toBeCloseTo(39.0, 9);
    expect(kCkidCys(15, 'm')).toBeCloseTo(87.2, 9);
    expect(kCkidCys(12, 'f')).toBeCloseTo(79.9, 9);
    // contínuo na emenda 12 anos (creatinina): valores logo antes e depois são quase iguais
    expect(Math.abs(kCkidCr(11.999, 'm') - kCkidCr(12, 'm'))).toBeLessThan(0.01);
    expect(Math.abs(kCkidCys(14.999, 'm') - kCkidCys(15, 'm'))).toBeLessThan(0.01);
  });
  it('bedside e lactente', () => {
    expect(egfrBedside(100, 0.5)).toBeCloseTo(82.6, 9);
    expect(egfrLactente(50, 0.4, false)).toBeCloseTo(56.25, 9);
    expect(egfrLactente(50, 0.4, true)).toBeCloseTo(41.25, 9);
  });
  it('categorias G nos limites', () => {
    expect([90, 89.9, 60, 59.9, 45, 44.9, 30, 29.9, 15, 14.9].map(categoriaG).map((c) => c.split(' ')[0]))
      .toEqual(['G1', 'G2', 'G2', 'G3a', 'G3a', 'G3b', 'G3b', 'G4', 'G4', 'G5']);
  });
  it('conversão de idade', () => {
    expect(idadeEmAnos(365.25, 'dias')).toBeCloseTo(1, 9);
    expect(idadeEmAnos(18, 'meses')).toBeCloseTo(1.5, 9);
  });
});

const drc: EntradaDrc = { altura: '140', creatinina: '0,6', idade: '10', unidade: 'anos', sexo: 'f', prematuro: false, cistatina: '' };
describe('Pediatria — DRC / estável', () => {
  it('usa a CKiD U25 por creatinina e compara com o bedside', () => {
    const r = calcularDrc(drc);
    expect(r.ok && r.egfr).toBeCloseTo(82.9016, 3);
    expect(r.ok && r.texto).toContain('Método: CKiD U25 (creatinina)');
    expect(r.ok && r.texto).toContain('Schwartz bedside 2009: 96.4');
    expect(r.ok && r.avisos.join(' ')).toContain('creatinina ESTÁVEL');
  });
  it('com cistatina usa a combinada', () => {
    const r = calcularDrc({ ...drc, cistatina: '1,0' });
    expect(r.ok && r.egfr).toBeCloseTo(81.0831, 3);
    expect(r.ok && r.metodo).toContain('creatinina + cistatina C');
  });
  it('sexo é obrigatório a partir de 1 ano (corrige PED-2)', () => {
    const r = calcularDrc({ ...drc, sexo: '' });
    expect(r).toMatchObject({ ok: false, erroSexo: true });
  });
  it('menor de 1 ano: Schwartz lactente, sem exigir sexo, com aviso', () => {
    const r = calcularDrc({ ...drc, altura: '50', creatinina: '0.4', idade: '3', unidade: 'meses', sexo: '' });
    expect(r.ok && r.egfr).toBeCloseTo(56.25, 6);
    expect(r.ok && r.avisos.join(' ')).toContain('baixa confiabilidade');
    const p = calcularDrc({ ...drc, altura: '50', creatinina: '0.4', idade: '30', unidade: 'dias', sexo: '', prematuro: true });
    expect(p.ok && p.egfr).toBeCloseTo(41.25, 6);
  });
  it('1 a 2 anos: aviso de TFG fisiologicamente menor', () => {
    const r = calcularDrc({ ...drc, altura: '80', creatinina: '0.3', idade: '18', unidade: 'meses' });
    expect(r.ok && r.avisos.join(' ')).toContain('fisiologicamente menor');
  });
  it('recusa valores fora de faixa e cistatina inválida', () => {
    expect(calcularDrc({ ...drc, altura: '1.4' })).toMatchObject({ ok: false, erroAltura: true });
    expect(calcularDrc({ ...drc, creatinina: '53' })).toMatchObject({ ok: false, erroCreatinina: true });
    expect(calcularDrc({ ...drc, idade: '26' })).toMatchObject({ ok: false, erroIdade: true });
    expect(calcularDrc({ ...drc, cistatina: '50' })).toMatchObject({ ok: false, erroCistatina: true });
    expect(calcularDrc({ ...drc, idade: '' })).toMatchObject({ ok: false, erroIdade: true });
  });
});

const lra: EntradaLra = { altura: '150', creatinina: '1', idade: '12', unidade: 'anos', sexo: 'm', prematuro: false, creatininaBasal: '0.5', janela: '7d', diurese: 'normal' };
const est = (o: Partial<EntradaLra>) => { const r = calcularLra({ ...lra, ...o }); if (!r.ok) throw new Error(r.mensagem); return r.estagio; };
describe('Pediatria — LRA (KDIGO)', () => {
  it('estágios pela razão da creatinina', () => {
    expect(est({ creatinina: '0.7' })).toBe(0);          // 1,4×
    expect(est({ creatinina: '0.75' })).toBe(1);         // 1,5×
    expect(est({ creatinina: '1.0' })).toBe(2);          // 2,0×
    expect(est({ creatinina: '1.49' })).toBe(2);
    expect(est({ creatinina: '1.5' })).toBe(3);          // 3,0×
  });
  it('limites exatos não se perdem por ponto flutuante (0,6/0,4 = 1,4999…)', () => {
    expect(est({ creatininaBasal: '0.4', creatinina: '0.6' })).toBe(1);
    expect(est({ creatininaBasal: '0.2', creatinina: '0.6' })).toBe(3);
  });
  it('aumento ≥ 0,3 mg/dL só vale em 48 h', () => {
    expect(est({ creatininaBasal: '1.0', creatinina: '1.3', janela: '48h' })).toBe(1);
    expect(est({ creatininaBasal: '1.0', creatinina: '1.3', janela: '7d' })).toBe(0);
    expect(est({ creatininaBasal: '1.0', creatinina: '1.29', janela: '48h' })).toBe(0);
    expect(est({ creatininaBasal: '0.9', creatinina: '1.2', janela: '48h' })).toBe(1); // 1,2 − 0,9 = 0,2999… em ponto flutuante
    expect(est({ creatininaBasal: '0.7', creatinina: '1.0', janela: '48h' })).toBe(1);
  });
  it('estágio 3 pelo critério pediátrico: LRA por creatinina e TFG < 35', () => {
    // 150 cm, menino 12 anos: Cr 1,8 → TFG ≈ 32,5 (< 35); razão 1,5× (estágio 1 por creatinina) → sobe para 3
    expect(est({ creatininaBasal: '1.2', creatinina: '1.8' })).toBe(3);
    // mesma TFG baixa, mas sem LRA por creatinina (DRC prévia estável) → continua 0
    expect(est({ creatininaBasal: '1.8', creatinina: '1.8' })).toBe(0);
    // Cr 1,6 → TFG ≈ 36,6 (≥ 35): fica no estágio 1
    expect(est({ creatininaBasal: '1.06', creatinina: '1.6' })).toBe(1);
  });
  it('diurese entra como critério independente e isolada não ativa o critério de TFG < 35', () => {
    expect(est({ creatinina: '0.5', diurese: 'e1' })).toBe(1);
    expect(est({ creatinina: '0.5', diurese: 'e2' })).toBe(2);
    expect(est({ creatinina: '0.5', diurese: 'e3' })).toBe(3);
    // DRC prévia (TFG baixa, creatinina estável) + diurese e1 → estágio 1, não 3
    expect(est({ creatininaBasal: '2.0', creatinina: '2.0', diurese: 'e1' })).toBe(1);
  });
  it('o maior estágio entre creatinina e diurese vale', () => {
    expect(est({ creatinina: '1.0', diurese: 'e3' })).toBe(3);
    expect(est({ creatinina: '1.5', diurese: 'e1' })).toBe(3);
  });
  it('sem basal: estima (TFG 120) e avisa que é provisório', () => {
    // 150 cm, menino 12 anos: basal = 39×1,5/120 = 0,4875; Cr 1,0 → ≈ 2,05×
    const r = calcularLra({ ...lra, creatininaBasal: '', creatinina: '1.0' });
    expect(r.ok && r.basalEstimada).toBe(true);
    expect(r.ok && r.estagio).toBe(2);
    expect(r.ok && r.avisos.join(' ')).toContain('ESTIMADA');
  });
  it('lactente sem basal é recusado', () => {
    expect(calcularLra({ ...lra, idade: '2', unidade: 'meses', creatininaBasal: '' })).toMatchObject({ ok: false, erroBasal: true });
  });
  it('o texto traz o teto, o estágio e a orientação de dose', () => {
    const r = calcularLra({ ...lra, creatinina: '1.5' });
    expect(r.ok && r.texto).toContain('LRA — KDIGO estágio 3');
    expect(r.ok && r.texto).toContain('é um TETO');
    expect(r.ok && r.texto).toContain('Ajuste de dose: dose como TFG < 15');
  });
  it('creatinina abaixo da basal: sem LRA, com aviso', () => {
    const r = calcularLra({ ...lra, creatinina: '0.4' });
    expect(r.ok && r.estagio).toBe(0);
    expect(r.ok && r.avisos.join(' ')).toContain('abaixo da basal');
  });
});
