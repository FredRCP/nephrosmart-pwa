import { describe, expect, it } from 'vitest';
import { calcularIngestaoSodio, corrigirHipernatremia, corrigirHiponatremia, fracaoAgua, limiteHiper, limiteHipo, naCorrigidoGlicose } from '@/lib/clinical/sodio';

const hipo = (o: any = {}) => corrigirHiponatremia({ naAtual: '115', naDesejado: '121', peso: '70', idade: '40', sexo: 'male', solucao: 'nacl3', tipo: 'cronica', altoRisco: false, ...o }) as any;
const hiper = (o: any = {}) => corrigirHipernatremia({ naAtual: '160', naDesejado: '150', peso: '70', idade: '40', sexo: 'male', solucao: 'sg5', tipo: 'cronica', ...o }) as any;

describe('água corporal total', () => {
  it('frações por idade e sexo', () => {
    expect(fracaoAgua(10, 'female')).toBe(0.6);
    expect(fracaoAgua(18, 'male')).toBe(0.6);
    expect(fracaoAgua(18, 'female')).toBe(0.5);
    expect(fracaoAgua(60, 'female')).toBe(0.5);
    expect(fracaoAgua(61, 'male')).toBe(0.5);
    expect(fracaoAgua(61, 'female')).toBe(0.45);
  });
});

describe('correção de hiponatremia', () => {
  it('Adrogué–Madias com NaCl 3% (70 kg, homem, 115→121)', () => {
    const r = hipo();
    expect(r.deltaPorLitro).toBeCloseTo((513 - 115) / 43, 6);
    expect(r.volumeMl).toBe(648);
    expect(r.volumeMaxMl).toBe(1080);
    expect(r.taxaMlH).toBeCloseTo(648.2 / 24, 1);
    expect(r.mudancaSegura).toBe(6);
    expect(r.texto).toContain('Volume para a meta: 648 mL');
  });
  it('limites unificados: 10 padrão; 8 alto risco ou criança', () => {
    expect(limiteHipo(40, false)).toBe(10);
    expect(limiteHipo(40, true)).toBe(8);
    expect(limiteHipo(17, false)).toBe(8);
    expect(limiteHipo(18, false)).toBe(10);
    expect(limiteHipo(80, false)).toBe(10);
  });
  it('meta acima do limite é cortada e avisa', () => {
    const r = hipo({ naAtual: '110', naDesejado: '125', altoRisco: true });
    expect(r.mudancaDesejada).toBe(15);
    expect(r.mudancaSegura).toBe(8);
    expect(r.volumeMl).toBeGreaterThan(r.volumeMaxMl);
    expect(r.taxaMlH).toBeCloseTo(r.volumeMaxMl / 24, 1);
    expect(r.avisos.join(' ')).toContain('acima do limite seguro');
    expect(r.limite24h).toBe(8);
  });
  it('bolus só para aguda com NaCl 3%', () => {
    expect(hipo({ tipo: 'aguda' }).bolus).toBe(true);
    expect(hipo({ tipo: 'aguda' }).avisos.join(' ')).toContain('100–150 mL em 10–20 min');
    expect(hipo({ tipo: 'aguda' }).texto).toContain('150 mL de NaCl 3% elevam o Na');
    expect(hipo({ tipo: 'cronica' }).bolus).toBe(false);
    expect(hipo({ tipo: 'aguda', solucao: 'nacl09' }).bolus).toBe(false);
  });
  it('avisos de idade, SIADH e limitações', () => {
    expect(hipo({ idade: '10' }).avisos.join(' ')).toContain('Criança');
    expect(hipo({ idade: '70' }).avisos.join(' ')).toContain('Idoso');
    expect(hipo({ solucao: 'nacl09' }).avisos.join(' ')).toContain('SIADH');
    expect(hipo().avisos.join(' ')).toContain('ignora perdas ativas');
  });
  it('1 ano completo já é calculado; 0,99 não', () => {
    expect(hipo({ idade: '1' }).neonato).toBe(false);
    expect(hipo({ idade: '1.5' }).neonato).toBe(false);
    expect(hipo({ idade: '0.99' }).neonato).toBe(true);
    expect(hiper({ idade: '1' }).neonato).toBe(false);
    expect(hipo().deltaPorBolus150).toBeCloseTo(0.15 * ((513 - 115) / 43), 6);
  });
  it('neonato (< 1 ano): não validado', () => {
    const r = hipo({ idade: '0.5' });
    expect(r).toMatchObject({ ok: true, neonato: true });
    expect(r.texto).toContain('Não validado para neonatos');
  });
  it('validações', () => {
    expect(hipo({ naAtual: '136' })).toMatchObject({ ok: false });
    expect(hipo({ naAtual: '136' }).campos).toContain('naAtual');
    expect(hipo({ naAtual: '49' }).campos).toContain('naAtual');
    expect(hipo({ naDesejado: '115' }).campos).toEqual(['naDesejado']);
    expect(hipo({ naDesejado: '146' }).campos).toEqual(['naDesejado']);
    expect(hipo({ naDesejado: '145' }).ok).toBe(true);
    expect(hipo({ peso: '0.5' }).campos).toEqual(['peso']);
    expect(hipo({ idade: '0' }).campos).toEqual(['idade']);
    expect(hipo({ idade: '121' }).campos).toEqual(['idade']);
    expect(hipo({ naAtual: '', peso: '' }).campos).toEqual(['naAtual', 'naDesejado', 'peso']);
  });
  it('NaCl 0,9% usa 154 mEq/L; vírgula decimal aceita', () => {
    expect(hipo({ solucao: 'nacl09' }).deltaPorLitro).toBeCloseTo((154 - 115) / 43, 6);
    expect(hipo({ naAtual: '115,5' }).ok).toBe(true);
  });
});

describe('correção de hipernatremia', () => {
  it('Adrogué–Madias com SG 5% (70 kg, homem, 160→150)', () => {
    const r = hiper();
    expect(r.deltaPorLitro).toBeCloseTo(-160 / 43, 6);
    expect(r.volumeMl).toBe(2688);
    expect(r.mudancaSegura).toBe(10);
    expect(r.taxaNaPorHora).toBeCloseTo(10 / 24, 6);
    expect(r.taxaMlH).toBeCloseTo(2687.5 / 24, 0);
  });
  it('NaCl 0,45% (77 mEq/L) usa a mesma fórmula (sem usar déficit de água)', () => {
    const r = hiper({ solucao: 'nacl045' });
    expect(r.deltaPorLitro).toBeCloseTo((77 - 160) / 43, 6);
    expect(r.volumeMl).toBe(Math.round((10 / (83 / 43)) * 1000));
  });
  it('perdas contínuas somam ao volume', () => {
    expect(hiper({ perdasMlDia: '500' }).volumeMl).toBe(3188);
    expect(hiper({ perdasMlDia: '' }).volumeMl).toBe(2688);
  });
  it('limites: aguda 12, crônica 10, criança 8', () => {
    expect(limiteHiper(40, 'aguda')).toBe(12);
    expect(limiteHiper(40, 'cronica')).toBe(10);
    expect(limiteHiper(10, 'aguda')).toBe(8);
    expect(limiteHiper(80, 'cronica')).toBe(10);
    const r = hiper({ naAtual: '170', naDesejado: '150', tipo: 'cronica' });
    expect(r.mudancaSegura).toBe(10);
    expect(r.avisos.join(' ')).toContain('acima do limite seguro');
    expect(hiper({ naAtual: '170', naDesejado: '150', tipo: 'aguda' }).mudancaSegura).toBe(12);
    expect(hiper({ naAtual: '170', naDesejado: '150', idade: '8' }).mudancaSegura).toBe(8);
  });
  it('avisa se o ritmo ultrapassar 0,5 mEq/L/h só nunca no limite de 10/24h', () => {
    expect(hiper().avisos.join(' ')).not.toContain('acima de 0,5');
  });
  it('neonato e validações', () => {
    expect(hiper({ idade: '0.9' })).toMatchObject({ ok: true, neonato: true });
    expect(hiper({ naAtual: '145' }).campos).toContain('naAtual');
    expect(hiper({ naAtual: '201' }).campos).toContain('naAtual');
    expect(hiper({ naDesejado: '134' }).campos).toEqual(['naDesejado']);
    expect(hiper({ naDesejado: '160' }).campos).toEqual(['naDesejado']);
    expect(hiper({ naDesejado: '135' }).ok).toBe(true);
    expect(hiper({ perdasMlDia: '-1' }).campos).toEqual(['perdas']);
    expect(hiper({ perdasMlDia: '20001' }).campos).toEqual(['perdas']);
    expect(hiper({ peso: '' }).campos).toEqual(['peso']);
  });
});

describe('Na corrigido pela glicose', () => {
  it('1,6 por 100 mg/dL acima de 100 e 2,4 acima de 400', () => {
    const r = naCorrigidoGlicose('125', '500') as any;
    expect(r.fator16).toBeCloseTo(125 + 1.6 * 4, 6);
    expect(r.fator24).toBeCloseTo(125 + 2.4 * 4, 6);
    expect(r.texto).toContain('Na corrigido: 134.6 mEq/L (fator 2,4; glicose > 400)');
    expect((naCorrigidoGlicose('125', '300') as any).texto).toContain('Na corrigido: 128.2 mEq/L (fator 1,6)');
    expect((naCorrigidoGlicose('125', '400') as any).texto).toContain('(fator 1,6)');
    expect((naCorrigidoGlicose('125', '401') as any).texto).toContain('(fator 2,4; glicose > 400)');
    expect((naCorrigidoGlicose('125', '80') as any).fator16).toBe(125);
  });
  it('valida', () => {
    expect(naCorrigidoGlicose('', '300')).toMatchObject({ ok: false, campos: ['na'] });
    expect(naCorrigidoGlicose('125', '10')).toMatchObject({ ok: false, campos: ['glicose'] });
  });
});

describe('ingestão de sódio', () => {
  it('converte mEq → g de sódio e g de sal, e separa sódio de NaCl nas faixas', () => {
    const r = calcularIngestaoSodio('100', '2') as any;
    expect(r.meq24h).toBe(200);
    expect(r.sodioG).toBeCloseTo(4.6, 6);
    expect(r.salG).toBeCloseTo(11.7, 6);
    expect(r.classe).toBe('alta');
    expect(r.texto).toContain('4.6 g de sódio/dia (≈ 11.7 g de sal/dia)');
    expect(r.comentario).not.toContain('**');
  });
  it('faixas: <1 baixa, ≤2 adequada, ≤3,5 moderada, >3,5 alta (em g de sódio)', () => {
    const c = (meq: number) => (calcularIngestaoSodio(String(meq), '1') as any).classe;
    expect(c(40)).toBe('baixa');            // 0,92 g
    expect(c(87)).toBe('moderada');         // 2,001 g
  });
  it('limites exatos', () => {
    const c = (na: string, vol: string) => (calcularIngestaoSodio(na, vol) as any).classe;
    expect(c('43.478', '1')).toBe('adequada');   // ≈1,0 g
    expect(c('86.957', '1')).toBe('adequada');    // ≈2,0 g
    expect(c('152.174', '1')).toBe('moderada');     // ≈3,5 g
    expect(c('153', '1')).toBe('alta');
  });
  it('valida', () => {
    expect(calcularIngestaoSodio('9', '2')).toMatchObject({ ok: false, campos: ['na'] });
    expect(calcularIngestaoSodio('501', '2')).toMatchObject({ ok: false });
    expect(calcularIngestaoSodio('100', '0.4')).toMatchObject({ ok: false, campos: ['volume'] });
    expect(calcularIngestaoSodio('100', '5.1')).toMatchObject({ ok: false });
    expect((calcularIngestaoSodio('', '') as any).mensagem).toBe('Por favor, insira um sódio urinário válido (10–500 mEq/L) e um volume urinário válido (0,5–5 L/24h).');
    expect(calcularIngestaoSodio('10', '0.5').ok).toBe(true);
    expect(calcularIngestaoSodio('500', '5').ok).toBe(true);
  });
});
