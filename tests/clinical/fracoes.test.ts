import { describe, expect, it } from 'vitest';
import { calcularFE, classificarFE, CONFIG_FE, TIPOS_FE, type TipoFE } from '@/lib/clinical/fracoes';

const fe = (tipo: TipoFE, uSoluto: string, sSoluto: string, uCr: string, sCr: string, contexto?: 'hipocalemia' | 'hipercalemia') =>
  calcularFE({ tipo, uSoluto, sSoluto, uCr, sCr, contexto });
function ok(r: ReturnType<typeof calcularFE>) { if (!r.ok) throw new Error('esperava ok: ' + r.mensagem); return r; }

describe('FE: fórmula geral (contas feitas à mão)', () => {
  it('FENa = 20×1 / (140×100) × 100 = 0,14%', () => {
    const r = ok(fe('sodio', '20', '140', '100', '1'));
    expect(r.valor).toBe(0.14);
    expect(r.classe).toBe('baixa');
    expect(r.texto).toContain('0,14 %');
  });
  it('FENa = 60×2 / (140×40) × 100 = 2,14%', () => {
    const r = ok(fe('sodio', '60', '140', '40', '2'));
    expect(r.valor).toBe(2.14);
    expect(r.classe).toBe('alta');
  });
  it('aceita vírgula decimal', () => {
    expect(ok(fe('sodio', '20,0', '140', '100', '1,0')).valor).toBe(0.14);
  });
  it('FEUr = 7×1 / (20×1) × 100 = 35% (borda: intermediária, sem erro de ponto flutuante)', () => {
    const r = ok(fe('ureia', '7', '20', '1', '1'));
    expect(r.valor).toBe(35);
    expect(r.classe).toBe('intermediaria');
  });
  it('FECa = 5×1 / (9×100) × 100 = 0,56% → baixa', () => {
    const r = ok(fe('calcio', '5', '9', '100', '1'));
    expect(r.valor).toBe(0.56);
    expect(r.classe).toBe('baixa');
  });
  it('FEP = 40×1 / (4×100) × 100 = 10% → intermediária', () => {
    const r = ok(fe('fosforo', '40', '4', '100', '1'));
    expect(r.valor).toBe(10);
    expect(r.classe).toBe('intermediaria');
  });
});

describe('FEMg: o Mg sérico é DIVIDIDO por 0,7 (o app original errava)', () => {
  it('FEMg = 5×1 / (0,7×1,8×100) × 100 = 3,97%', () => {
    const r = ok(fe('magnesio', '5', '1.8', '100', '1'));
    expect(r.valor).toBe(3.97);
    expect(r.classe).toBe('intermediaria');
  });
  it('o resultado seria diferente se o fator fosse multiplicado no resultado (0,7 × valor)', () => {
    const r = ok(fe('magnesio', '5', '1.8', '100', '1'));
    expect(r.valor).not.toBeCloseTo(5 / (1.8 * 100) * 100 * 0.7, 1);
  });
  it('FEMg > 4% = perda renal', () => {
    expect(ok(fe('magnesio', '10', '1.5', '100', '1')).classe).toBe('alta'); // 10/(0,7×1,5×100)=9,52%
  });
  it('FEMg < 2% = resposta renal apropriada', () => {
    expect(ok(fe('magnesio', '2', '1.5', '100', '1')).classe).toBe('baixa'); // 1,90%
  });
});

describe('FE: pontos de corte nas bordas', () => {
  const casos: [TipoFE, number, number, string][] = [
    ['sodio', 0.99, 0, 'baixa'], ['sodio', 1, 0, 'intermediaria'], ['sodio', 2, 0, 'intermediaria'], ['sodio', 2.01, 0, 'alta'],
    ['ureia', 34.99, 0, 'baixa'], ['ureia', 35, 0, 'intermediaria'], ['ureia', 50, 0, 'intermediaria'], ['ureia', 50.01, 0, 'alta'],
    ['calcio', 0.99, 0, 'baixa'], ['calcio', 1, 0, 'intermediaria'], ['calcio', 2, 0, 'intermediaria'], ['calcio', 2.01, 0, 'alta'],
    ['fosforo', 4.99, 0, 'baixa'], ['fosforo', 5, 0, 'intermediaria'], ['fosforo', 20, 0, 'intermediaria'], ['fosforo', 20.01, 0, 'alta'],
    ['acido-urico', 4.99, 0, 'baixa'], ['acido-urico', 5, 0, 'intermediaria'], ['acido-urico', 10, 0, 'intermediaria'], ['acido-urico', 10.01, 0, 'alta'],
    ['magnesio', 1.99, 0, 'baixa'], ['magnesio', 2, 0, 'intermediaria'], ['magnesio', 4, 0, 'intermediaria'], ['magnesio', 4.01, 0, 'alta'],
    ['potassio', 5.99, 0, 'baixa'], ['potassio', 6, 0, 'intermediaria'], ['potassio', 9.5, 0, 'intermediaria'], ['potassio', 9.51, 0, 'alta'],
  ];
  it.each(casos)('%s: %s%% → %s', (tipo, valor, _x, classe) => {
    expect(classificarFE(tipo, valor)).toBe(classe);
  });
  it('valores como 34,9999999 e 35,0000001 (ruído de ponto flutuante) tratam-se como 35', () => {
    expect(classificarFE('ureia', 34.9999999)).toBe('intermediaria');
    expect(classificarFE('sodio', 1.0000001)).toBe('intermediaria');
    expect(classificarFE('sodio', 2.0000001)).toBe('intermediaria');
  });
});

describe('FEK: contexto clínico', () => {
  it('hipocalemia: 20×1 / (3×100) × 100 = 6,67% → zona cinzenta', () => {
    const r = ok(fe('potassio', '20', '3', '100', '1', 'hipocalemia'));
    expect(r.valor).toBe(6.67);
    expect(r.classe).toBe('intermediaria');
  });
  it('hipocalemia: FEK 1,0% → perda extrarrenal; 15% → perda renal', () => {
    expect(ok(fe('potassio', '3', '3', '100', '1', 'hipocalemia')).classe).toBe('baixa');
    expect(ok(fe('potassio', '45', '3', '100', '1', 'hipocalemia')).classe).toBe('alta');
  });
  it('hipercalemia: sem ponto de corte validado', () => {
    const r = ok(fe('potassio', '20', '6', '100', '1', 'hipercalemia'));
    expect(r.classe).toBe('sem-corte');
    expect(r.interpretacao).toContain('não há ponto de corte');
  });
  it('sem contexto informado, assume hipocalemia', () => {
    expect(ok(fe('potassio', '3', '3', '100', '1')).classe).toBe('baixa');
  });
});

describe('FEUA em hiponatremia', () => {
  it('13% → aviso de SIADH (> 12)', () => {
    const r = ok(fe('acido-urico', '65', '5', '100', '1'));
    expect(r.valor).toBe(13);
    expect(r.avisos.join(' ')).toContain('SIADH');
  });
  it('7,5% → aviso de depleção de volume (< 8); 12% → sem aviso (corte é > 12)', () => {
    expect(ok(fe('acido-urico', '37.5', '5', '100', '1')).avisos.join(' ')).toContain('depleção de volume');
    expect(ok(fe('acido-urico', '60', '5', '100', '1')).avisos.join(' ')).not.toMatch(/SIADH|depleção/);
  });
  it('8% → sem aviso; 6% → aviso de depleção de volume (< 8)', () => {
    expect(ok(fe('acido-urico', '40', '5', '100', '1')).avisos.join(' ')).not.toMatch(/SIADH|depleção/);
    expect(ok(fe('acido-urico', '30', '5', '100', '1')).avisos.join(' ')).toContain('depleção de volume');
  });
});

describe('FE: avisos e validação', () => {
  it('acima de 100% avisa para conferir as unidades', () => {
    const r = ok(fe('sodio', '200', '1', '1', '1'));
    expect(r.avisos.join(' ')).toContain('acima de 100%');
  });
  it('150% também avisa; 100% exato não avisa', () => {
    expect(ok(fe('ureia', '150', '100', '1', '1')).avisos.join(' ')).toContain('acima de 100%');
    expect(ok(fe('ureia', '100', '100', '1', '1')).avisos.join(' ')).not.toContain('acima de 100%');
  });
  it('soluto igual a zero na urina ou no sangue é recusado', () => {
    const a = fe('sodio', '0', '140', '100', '1'); expect(a.ok).toBe(false); if (!a.ok) expect(a.campos).toEqual(['uSoluto']);
    const b = fe('sodio', '20', '0', '100', '1'); expect(b.ok).toBe(false); if (!b.ok) expect(b.campos).toEqual(['sSoluto']);
  });
  it('FENa sempre lembra o limite com diurético', () => {
    expect(ok(fe('sodio', '20', '140', '100', '1')).avisos.join(' ')).toContain('FEUr');
  });
  it('campos vazios, zero ou negativos são recusados e marcados', () => {
    const r = fe('sodio', '', '140', '100', '1');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.campos).toEqual(['uSoluto']);
    const z = fe('sodio', '20', '0', '100', '1');
    expect(z.ok).toBe(false);
    expect(fe('sodio', '-1', '140', '100', '1').ok).toBe(false);
  });
  it('creatinina fora da faixa de plausibilidade é recusada (0,05 sérica; 0,5 e 700 urinária)', () => {
    const a = fe('sodio', '20', '140', '100', '0.05'); expect(a.ok).toBe(false); if (!a.ok) expect(a.campos).toEqual(['sCr']);
    const b = fe('sodio', '20', '140', '0.5', '1'); expect(b.ok).toBe(false); if (!b.ok) expect(b.campos).toEqual(['uCr']);
    expect(fe('sodio', '20', '140', '700', '1').ok).toBe(false);
  });
  it('texto não numérico é recusado', () => {
    expect(fe('sodio', 'abc', '140', '100', '1').ok).toBe(false);
  });
  it('as 7 frações existem, com chave de armazenamento igual à do app original', () => {
    expect(TIPOS_FE).toHaveLength(7);
    expect(Object.values(CONFIG_FE).map((c) => c.chave).sort()).toEqual(
      ['ultimaFECa', 'ultimaFEK', 'ultimaFEMg', 'ultimaFENa', 'ultimaFEP', 'ultimaFEUA', 'ultimaFEUr']);
  });
  it('FENa: texto não afirma que diurético causa FENa falsamente baixa', () => {
    const t = [CONFIG_FE.sodio.limites.join(' '), CONFIG_FE.sodio.textoAlta].join(' ');
    expect(t).not.toMatch(/falsamente baix/i);
    expect(CONFIG_FE.sodio.limites.join(' ')).toMatch(/AUMENTAM a FENa/);
  });
});
