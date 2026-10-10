import { describe, it, expect } from 'vitest';
import { converterUnidade, formatarValor } from '@/lib/clinical/unidades';
import { calcularClearance24h, superficieCorporal } from '@/lib/clinical/clearance24h';
import { categoriaG, categoriaA, estadiarDRC, RISCO, FREQUENCIA } from '@/lib/clinical/drc-estadiamento';
import { converterDiuretico } from '@/lib/clinical/diureticos';

const conv = (analito: any, valor: string, de: string) => { const r = converterUnidade({ analito, valor, de }); if (!r.ok) throw new Error(r.mensagem); return r; };

describe('Conversor de unidades', () => {
  it('creatinina 1 mg/dL = 88,4 µmol/L e volta', () => {
    expect(conv('creatinina', '1', 'mgdl').saidas[0].valor).toBeCloseTo(88.4, 1);
    expect(conv('creatinina', '88,4', 'umol').saidas[0].valor).toBeCloseTo(1.0, 2);
  });
  it('ureia 60,06 mg/dL = 10 mmol/L; BUN 28,014 = 60,06 mg/dL de ureia', () => {
    const r = conv('ureia', '60,06', 'ureia-mgdl');
    expect(r.saidas.find((s) => s.id === 'ureia-mmol')!.valor).toBeCloseTo(10, 6);
    expect(r.saidas.find((s) => s.id === 'bun-mgdl')!.valor).toBeCloseTo(28.014, 3);
    expect(conv('ureia', '28.014', 'bun-mgdl').saidas.find((s) => s.id === 'ureia-mgdl')!.valor).toBeCloseTo(60.06, 3);
  });
  it('cálcio 10 mg/dL = 2,495 mmol/L = 4,99 mEq/L', () => {
    const r = conv('calcio', '10', 'mgdl');
    expect(r.saidas.find((s) => s.id === 'mmol')!.valor).toBeCloseTo(2.495, 3);
    expect(r.saidas.find((s) => s.id === 'meq')!.valor).toBeCloseTo(4.99, 2);
  });
  it('magnésio, fósforo, glicose, ácido úrico', () => {
    expect(conv('magnesio', '2', 'mgdl').saidas[0].valor).toBeCloseTo(0.823, 3); // mmol
    expect(conv('fosforo', '3,1', 'mgdl').saidas[0].valor).toBeCloseTo(1.0009, 3);
    expect(conv('glicose', '100', 'mgdl').saidas[0].valor).toBeCloseTo(5.55, 2);
    expect(conv('acido-urico', '6', 'mgdl').saidas[0].valor).toBeCloseTo(356.9, 0);
  });
  it('albumina, hemoglobina, PTH e vitamina D', () => {
    expect(conv('albumina', '4', 'gdl').saidas[0].valor).toBeCloseTo(40, 6);
    expect(conv('hemoglobina', '120', 'gl').saidas[0].valor).toBeCloseTo(12, 6);
    expect(conv('pth', '100', 'pgml').saidas[0].valor).toBeCloseTo(10.6, 1);
    expect(conv('vitamina-d', '30', 'ngml').saidas[0].valor).toBeCloseTo(74.9, 1);
  });
  it('formata com vírgula e 4 algarismos significativos', () => {
    expect(formatarValor(88.4)).toBe('88,4');
    expect(formatarValor(2.49476)).toBe('2,495');
    expect(formatarValor(1234.567)).toBe('1235');
  });
  it('rejeita entradas inválidas', () => {
    for (const valor of ['', 'abc', '0', '-1', '2000000']) expect(converterUnidade({ analito: 'creatinina', valor, de: 'mgdl' }).ok).toBe(false);
    expect(converterUnidade({ analito: 'creatinina', valor: '1', de: '' }).ok).toBe(false);
    expect(converterUnidade({ analito: '' as any, valor: '1', de: 'mgdl' }).ok).toBe(false);
  });
});

describe('Depuração de creatinina 24 h', () => {
  const base = { volume: '1500', horas: '24', uCr: '80', sCr: '1', peso: '', altura: '', sexo: '' as const };
  it('ClCr = 83,3 mL/min', () => {
    const r = calcularClearance24h(base);
    expect(r.ok && r.clearance).toBeCloseTo(83.333, 2);
    expect(r.ok && r.normalizado).toBeNull();
  });
  it('normaliza para 1,73 m² e avalia a excreção', () => {
    expect(superficieCorporal(175, 70)).toBeCloseTo(1.8446, 3);
    const r = calcularClearance24h({ ...base, peso: '70', altura: '175', sexo: 'F' });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.normalizado).toBeCloseTo(78.15, 1);
      expect(r.excrecaoMgKg).toBeCloseTo(17.14, 2);
      expect(r.adequacao).toBe('adequada');
    }
  });
  it('excreção baixa sugere coleta incompleta', () => {
    const r = calcularClearance24h({ ...base, volume: '600', peso: '70', altura: '175', sexo: 'M' });
    expect(r.ok && r.adequacao).toBe('baixa'); // 480 mg/70 = 6,9
  });
  it('limites da adequação são inclusivos (F 12–20)', () => {
    const b = { horas: '24', sCr: '1', peso: '100', altura: '', sexo: 'F' as const };
    const baixo = calcularClearance24h({ ...b, volume: '1500', uCr: '80' }); // 12,0 mg/kg
    const alto = calcularClearance24h({ ...b, volume: '2000', uCr: '100' }); // 20,0 mg/kg
    expect(baixo.ok && baixo.adequacao).toBe('adequada');
    expect(alto.ok && alto.adequacao).toBe('adequada');
  });
  it('coleta de 12 h é anualizada por tempo', () => {
    const r = calcularClearance24h({ ...base, volume: '750', horas: '12' });
    expect(r.ok && r.clearance).toBeCloseTo(83.333, 2);
  });
  it('valida campos', () => {
    const r = calcularClearance24h({ ...base, volume: '', sCr: '0' });
    expect(!r.ok && r.campos).toEqual(expect.arrayContaining(['volume', 'sCr']));
    expect(calcularClearance24h({ ...base, altura: '175' }).ok).toBe(false); // altura sozinha não serve
    const r2 = calcularClearance24h({ ...base, peso: '70' }); // peso sozinho avalia só a excreção
    expect(r2.ok && r2.normalizado).toBeNull();
    expect(r2.ok && r2.excrecaoMgKg).toBeCloseTo(17.14, 2);
  });
});

describe('Estadiamento da DRC', () => {
  it('limites de G', () => {
    const t: [number, string][] = [[90, 'G1'], [89.9, 'G2'], [60, 'G2'], [59.9, 'G3a'], [45, 'G3a'], [44.9, 'G3b'], [30, 'G3b'], [29.9, 'G4'], [15, 'G4'], [14.9, 'G5']];
    for (const [v, g] of t) expect(categoriaG(v), String(v)).toBe(g);
  });
  it('limites de A', () => {
    expect(categoriaA('rac', 29.9)).toBe('A1'); expect(categoriaA('rac', 30)).toBe('A2');
    expect(categoriaA('aer', 300)).toBe('A2'); expect(categoriaA('aer', 300.1)).toBe('A3');
    expect(categoriaA('pcr', 149.9)).toBe('A1'); expect(categoriaA('pcr', 150)).toBe('A2');
    expect(categoriaA('per', 500)).toBe('A2'); expect(categoriaA('per', 501)).toBe('A3');
  });
  it('matriz de risco KDIGO completa', () => {
    expect(RISCO).toEqual({
      G1: ['baixo', 'moderado', 'alto'], G2: ['baixo', 'moderado', 'alto'], G3a: ['moderado', 'alto', 'muito-alto'],
      G3b: ['alto', 'muito-alto', 'muito-alto'], G4: ['muito-alto', 'muito-alto', 'muito-alto'], G5: ['muito-alto', 'muito-alto', 'muito-alto'] });
    expect(FREQUENCIA.G3a).toEqual(['1', '2', '3']);
    expect(FREQUENCIA.G4).toEqual(['3', '3', '4+']);
  });
  it('estadia G3b/A2 como muito alto e G4 encaminha', () => {
    const r = estadiarDRC({ tfg: '35', tipo: 'rac', albuminuria: '100' });
    expect(r.ok && [r.g, r.a, r.risco, r.frequencia]).toEqual(['G3b', 'A2', 'muito-alto', '3']);
    const r2 = estadiarDRC({ tfg: '20', tipo: 'rac', albuminuria: '10' });
    expect(r2.ok && r2.encaminhar).toBe(true);
    const r3 = estadiarDRC({ tfg: '95', tipo: 'rac', albuminuria: '10' });
    expect(r3.ok && r3.encaminhar).toBe(false);
    expect(r3.ok && r3.avisos.join(' ')).toMatch(/outro marcador/);
  });
  it('valida', () => {
    expect(estadiarDRC({ tfg: '', tipo: 'rac', albuminuria: '1' }).ok).toBe(false);
    expect(estadiarDRC({ tfg: '50', tipo: '', albuminuria: '1' }).ok).toBe(false);
    expect(estadiarDRC({ tfg: '50', tipo: 'rac', albuminuria: '-1' }).ok).toBe(false);
  });
});

describe('Equivalência de diuréticos', () => {
  const eq = (de: string, dose: string) => { const r = converterDiuretico({ de, dose }); if (!r.ok) throw new Error(r.mensagem); return Object.fromEntries(r.equivalentes.map((e) => [e.id, e.dose])); };
  it('furosemida VO 40 mg', () => {
    expect(eq('furosemida-vo', '40')).toEqual({ 'furosemida-iv': 20, bumetanida: 1, torasemida: 20, 'acido-etacrinico': 50 });
  });
  it('torasemida 40 → furosemida VO 80', () => { expect(eq('torasemida', '40')['furosemida-vo']).toBe(80); });
  it('tiazídicos só convertem entre si', () => {
    expect(eq('hidroclorotiazida', '50')).toEqual({ clortalidona: 25 });
    expect(eq('clortalidona', '25')).toEqual({ hidroclorotiazida: 50 });
  });
  it('valida', () => {
    for (const dose of ['', '0', 'x', '5000']) expect(converterDiuretico({ de: 'bumetanida', dose }).ok).toBe(false);
    expect(converterDiuretico({ de: 'nada', dose: '1' }).ok).toBe(false);
  });
});
