import { describe, expect, it } from 'vitest';
import { calcularAnionGap, calcularBicarbonato, calcularCompensacao, calcularGasometria, calcularOsmolaridade, corDoseBic } from '@/lib/clinical/acidobase';

const comp = (disturbio: any, fase: any, hco3: string, pco2: string) => calcularCompensacao({ disturbio, fase, hco3, pco2 }) as any;

describe('compensação esperada', () => {
  it('acidose metabólica: Winter 1,5·HCO₃+8 ±2', () => {
    expect(comp('acidose-metabolica', 'aguda', '10', '23')).toMatchObject({ ok: true, esperado: 23, adequada: true });
    expect(comp('acidose-metabolica', 'aguda', '10', '25').adequada).toBe(true);
    expect(comp('acidose-metabolica', 'aguda', '10', '26').adequada).toBe(false);
    expect(comp('acidose-metabolica', 'aguda', '10', '30').associado).toBe('acidose respiratória associada');
    expect(comp('acidose-metabolica', 'aguda', '10', '15').associado).toBe('alcalose respiratória associada');
  });
  it('alcalose metabólica: 0,7·HCO₃+21 ±2 (fórmula única)', () => {
    expect(comp('alcalose-metabolica', 'aguda', '36', '46').esperado).toBe(46);
    expect(comp('alcalose-metabolica', 'aguda', '36', '48').adequada).toBe(true);
    expect(comp('alcalose-metabolica', 'aguda', '36', '49').adequada).toBe(false);
    expect(comp('alcalose-metabolica', 'aguda', '36', '55').associado).toBe('acidose respiratória associada');
  });
  it('respiratórios: inclinações aguda/crônica', () => {
    expect(comp('acidose-respiratoria', 'aguda', '26', '60').esperado).toBe(26);
    expect(comp('acidose-respiratoria', 'cronica', '31', '60').esperado).toBe(31);
    expect(comp('alcalose-respiratoria', 'aguda', '20', '20').esperado).toBe(20);
    expect(comp('alcalose-respiratoria', 'cronica', '16', '20').esperado).toBe(16);
    expect(comp('acidose-respiratoria', 'aguda', '40', '60').associado).toBe('alcalose metabólica associada');
    expect(comp('alcalose-respiratoria', 'aguda', '10', '20').associado).toBe('acidose metabólica associada');
  });
  it('tolerâncias: ±2 agudo, ±4 crônico', () => {
    expect(comp('acidose-respiratoria', 'aguda', '28', '60').adequada).toBe(true);
    expect(comp('acidose-respiratoria', 'aguda', '29', '60').adequada).toBe(false);
    expect(comp('acidose-respiratoria', 'cronica', '35', '60').adequada).toBe(true);
    expect(comp('acidose-respiratoria', 'cronica', '36', '60').adequada).toBe(false);
  });
  it('valida faixas (HCO₃ 2–50, PCO₂ 5–150)', () => {
    expect(comp('acidose-metabolica', 'aguda', '1', '30')).toMatchObject({ ok: false, erroHco3: true, erroPco2: false });
    expect(comp('acidose-metabolica', 'aguda', '10', '151')).toMatchObject({ ok: false, erroPco2: true });
    expect(comp('acidose-metabolica', 'aguda', '', '')).toMatchObject({ ok: false, erroHco3: true, erroPco2: true });
    expect(comp('acidose-metabolica', 'aguda', '2', '5').ok).toBe(true);
    expect(comp('acidose-metabolica', 'aguda', '50', '150').ok).toBe(true);
  });
});

describe('anion gap', () => {
  const ag = (o: any) => calcularAnionGap({ na: '140', cl: '100', hco3: '14', comK: false, corrigir: false, ...o }) as any;
  it('calcula, classifica e aceita vírgula', () => {
    expect(ag({})).toMatchObject({ ok: true, ag: 26, valor: 26, classe: 'alto' });
    expect(ag({ hco3: '28' }).classe).toBe('normal');
    expect(ag({ hco3: '31', na: '138' }).classe).toBe('baixo');
    expect(ag({ na: '140,5', hco3: '14' }).ag).toBeCloseTo(26.5);
  });
  it('limites 8–12: 8 e 12 são normais', () => {
    expect(ag({ hco3: '32' }).classe).toBe('normal'); // AG 8
    expect(ag({ hco3: '28' }).valor).toBe(12);
    expect(ag({ hco3: '28' }).classe).toBe('normal');
    expect(ag({ hco3: '27' }).classe).toBe('alto'); // 13
    expect(ag({ hco3: '33' }).classe).toBe('baixo'); // 7
  });
  it('potássio e albumina', () => {
    expect(ag({ comK: true, k: '4' })).toMatchObject({ ag: 30, faixa: '12–16' });
    expect(ag({ corrigir: true, albumina: '2' })).toMatchObject({ ag: 26, agCorrigido: 31, valor: 31 });
    expect(ag({ corrigir: true, albumina: '4' }).agCorrigido).toBe(26);
  });
  it('avisos: faixa varia por laboratório; AG>20; sem correção', () => {
    const r = ag({});
    expect(r.avisos.join(' ')).toContain('varia conforme o método do laboratório');
    expect(r.avisos.join(' ')).toContain('AG > 20');
    expect(r.avisos.join(' ')).toContain('Sem correção');
    expect(ag({ corrigir: true, albumina: '4', hco3: '28' }).avisos.join(' ')).not.toContain('Sem correção');
  });
  it('valida campos', () => {
    expect(ag({ na: '' })).toMatchObject({ ok: false, campos: ['na'] });
    expect(ag({ comK: true, k: '' })).toMatchObject({ ok: false, campos: ['k'] });
    expect(ag({ corrigir: true, albumina: '0' })).toMatchObject({ ok: false, campos: ['albumina'] });
    expect(ag({ na: '', cl: '', hco3: '' }).mensagem).toBe('Por favor, insira um sódio válido, um cloreto válido e um bicarbonato válido.');
  });
});

describe('gasometria', () => {
  const g = (o: any = {}) => calcularGasometria({ ph: '7.20', pco2: '25', hco3: '10', na: '140', cl: '100', albumina: '4', lactato: '', ...o }) as any;
  it('GASO-1: albumina em branco NÃO corrige o AG', () => {
    const sem = g({ albumina: '' });
    expect(sem.ag).toBe('Ânion Gap: 30.0 (sem correção)');
    expect(sem.avisoAlbumina).toContain('Albumina não informada');
    expect(g({ albumina: '4' }).ag).toContain('corrigido (albumina): 30.0');
    expect(g({ albumina: '2' }).ag).toContain('corrigido (albumina): 35.0');
  });
  it('acidose metabólica com AG elevado simples e compensação adequada', () => {
    const r = g({ pco2: '23', hco3: '10', ph: '7.25' });
    expect(r.disturbio).toBe('Acidose metabólica com AG elevado simples');
    expect(r.compStatus).toContain('adequada');
    expect(r.compEsperada).toContain('23.0');
  });
  it('acidose metabólica + acidose respiratória concomitante', () => {
    const r = g({ pco2: '40', hco3: '10', ph: '7.0' });
    expect(r.compStatus).toContain('acidose respiratória concomitante');
    expect(r.disturbio).toContain('Acidose respiratória concomitante');
  });
  it('alcalose metabólica usa a MESMA fórmula da tela de compensação (0,7·HCO₃+21 ±2)', () => {
    const r = g({ ph: '7.55', hco3: '36', pco2: '46', na: '140', cl: '95' });
    expect(r.compEsperada).toContain('46.2');
    expect(r.compStatus).toContain('adequada');
  });
  it('alcalose respiratória crônica usa 0,4', () => {
    const r = g({ ph: '7.46', pco2: '20', hco3: '16', na: '140', cl: '110' });
    expect(r.compEsperada).toContain('−0,4');
    expect(r.compEsperada).toContain('16.0');
  });
  it('equilíbrio normal e lactato', () => {
    const r = g({ ph: '7.40', pco2: '40', hco3: '24', na: '140', cl: '104', lactato: '5' });
    expect(r.disturbio).toBe('✅ Equilíbrio ácido-base normal');
    expect(r.lactato).toContain('> 4');
    expect(g({ ph: '7.40', pco2: '40', hco3: '24', lactato: '1' }).lactato).toContain('Normal');
    expect(g({ ph: '7.40', pco2: '40', hco3: '24', lactato: '3' }).lactato).toContain('2–4');
  });
  it('delta-delta indeterminado com HCO₃ ≈ 24', () => {
    expect(g({ ph: '7.40', pco2: '40', hco3: '24' }).deltaGap).toBe('Delta-Delta: indeterminado');
  });
  it('valida faixas e campos opcionais inválidos', () => {
    expect(g({ ph: '9' })).toMatchObject({ ok: false, campos: ['ph'] });
    expect(g({ na: '90' }).campos).toContain('na');
    expect(g({ albumina: '9' }).campos).toContain('albumina');
    expect(g({ lactato: 'x' }).campos).toContain('lactato');
  });
});

describe('osmolaridade', () => {
  const o = (x: any) => calcularOsmolaridade({ na: '140', glicose: '90', ureia: '30', ...x }) as any;
  it('2·Na + glicose/18 + ureia/6', () => {
    expect(o({}).osm).toBe(290);
    expect(o({}).texto).toBe('Osmolaridade Sérica: 290 mOsm/L');
    expect(o({ etanol: '46' }).osm).toBe(300);
  });
  it('gap osmolar', () => {
    const r = o({ medida: '320' });
    expect(r.gap).toBe(30);
    expect(r.texto).toContain('Gap osmolar: 30');
    expect(r.avisos.join(' ')).toContain('álcoois tóxicos');
    expect(o({ medida: '295' }).avisos).toEqual([]);
  });
  it('valida', () => {
    expect(o({ na: '' })).toMatchObject({ ok: false, campos: ['na'] });
    expect(o({ na: '', glicose: '0', ureia: '' }).mensagem).toBe('Por favor, insira um sódio válido (ex.: 140), uma glicose válida (ex.: 90) e uma ureia válida (ex.: 30).');
    expect(o({ etanol: '-1' }).campos).toEqual(['etanol']);
    expect(o({ medida: '0' }).campos).toEqual(['medida']);
  });
});

describe('bicarbonato', () => {
  const b = (x: any) => calcularBicarbonato({ modo: 'padrao', peso: '70', bicAtual: '10', bicDesejado: '20', baseExcess: '', dose: '1.5', concentracao: '1', grave: false, ...x }) as any;
  it('padrão: 50% de (Δ × peso × 0,4), em 3 doses', () => {
    const r = b({});
    expect(r.doseMeq).toBe(140);
    expect(r.volumeMl).toBe(140);
    expect(r.texto).toContain('Dose de bicarbonato: 140 mEq (140 mL de bicarbonato 8,4% (1 mEq/mL))');
    expect(r.texto).toContain('3 doses de 47 mEq (47 mL)');
    expect(b({ grave: true }).doseMeq).toBe(175);
    expect(b({ concentracao: '0.5' }).volumeMl).toBe(280);
  });
  it('base excess: 50% de |BE| × peso × 0,3 (0,5 se grave)', () => {
    expect(b({ modo: 'be', baseExcess: '-10' }).doseMeq).toBe(105);
    expect(b({ modo: 'be', baseExcess: '-10', grave: true }).doseMeq).toBe(175);
  });
  it('empírica: texto sem volume inflado e rotulagem correta da diluída', () => {
    const r = b({ modo: 'empirica' });
    expect(r.doseMeq).toBe(105);
    expect(r.texto).toContain('Correr 105 mEq (105 mL) a cada 8 horas');
    expect(r.texto).toContain('administrar 315 mL em infusão contínua');
    expect(b({ modo: 'empirica', concentracao: '0.1' }).texto).toContain('solução diluída (0,1 mEq/mL)');
    expect(b({ modo: 'empirica', concentracao: '0.1' }).texto).not.toContain('Diluída');
  });
  it('cores da dose', () => {
    expect(corDoseBic(100)).toBe('#22c55e');
    expect(corDoseBic(100.1)).toBe('#facc15');
    expect(corDoseBic(200)).toBe('#facc15');
    expect(corDoseBic(201)).toBe('#ef4444');
  });
  it('sempre devolve os avisos do BICAR-ICU', () => {
    expect(b({}).avisos.join(' ')).toContain('BICAR-ICU');
    expect(b({}).avisos.join(' ')).toContain('acidose láctica');
  });
  it('valida', () => {
    expect(b({ peso: '' })).toMatchObject({ ok: false, campos: ['peso'] });
    expect(b({ bicDesejado: '10' }).campos).toEqual(['bicDesejado']);
    expect(b({ bicDesejado: '31' }).campos).toEqual(['bicDesejado']);
    expect(b({ bicDesejado: '30' }).ok).toBe(true);
    expect(b({ bicAtual: '0' }).campos).toContain('bicAtual');
    expect(b({ modo: 'be', baseExcess: '5' }).campos).toEqual(['baseExcess']);
    expect(b({ modo: 'be', baseExcess: '-41' }).campos).toEqual(['baseExcess']);
    expect(b({ modo: 'be', baseExcess: '-40' }).ok).toBe(true);
    expect(b({ modo: 'empirica', peso: '501' }).campos).toEqual(['peso']);
    expect(b({ modo: 'be', baseExcess: '', peso: '' }).mensagem).toBe('Por favor, insira um peso válido e um Base Excess negativo (ex.: -10 ou -5.5).');
  });
});

describe('gasometria — fronteiras (mutação)', () => {
  const g = (o: any = {}) => calcularGasometria({ ph: '7.20', pco2: '25', hco3: '14', na: '140', cl: '110', albumina: '4', lactato: '', ...o }) as any;
  it('albumina em branco: delta-delta e alerta usam o AG sem correção', () => {
    const r = g({ albumina: '', cl: '96' }); // AG 30, ΔHCO₃ 10 → delta 1,8
    expect(r.deltaGap).toBe('Delta-Delta (Gap-Gap): 1.80');
    expect(g({ albumina: '4', cl: '96' }).deltaGap).toBe('Delta-Delta (Gap-Gap): 1.80');
    expect(g({ albumina: '', cl: '110' }).agAlerta).toBeUndefined(); // AG 16
    expect(g({ albumina: '', cl: '104' }).agAlerta).toContain('AG 22.0 > 20'); // sem "corrigido" no texto
  });
  it('faixas do delta-delta: 0,4 / 1,0 / 2,0 / 2,1', () => {
    // ΔHCO₃ = 10 (HCO₃ 14); AG = 140 − cl − 14
    const interp = (cl: string) => g({ cl }).deltaGapInterp;
    expect(interp('111')).toContain('hiperclorêmica (com gap normal) pura'); // AG 15 → 0,3
    expect(interp('110')).toContain('acidose com AG + acidose hiperclorêmica'); // AG 16 → 0,4
    expect(interp('109')).toContain('acidose com AG + acidose hiperclorêmica'); // 0,5
    expect(interp('105')).toContain('acidose com AG + acidose hiperclorêmica'); // AG 21 → 0,9
    expect(interp('104')).toContain('AG elevado simples'); // AG 22 → 1,0
    expect(interp('94')).toContain('AG elevado simples'); // AG 32 → 2,0
    expect(interp('93')).toContain('alcalose metabólica'); // AG 33 → 2,1
  });
  it('pH 7,35 e 7,45 ainda são normais; 7,34 e 7,46 já são distúrbios', () => {
    const d = (ph: string, o: any = {}) => g({ ph, pco2: '40', hco3: '24', cl: '104', ...o }).disturbio;
    expect(d('7.35')).toBe('✅ Equilíbrio ácido-base normal');
    expect(d('7.45')).toBe('✅ Equilíbrio ácido-base normal');
    expect(d('7.34')).toBe('Acidose (origem indeterminada)');
    expect(d('7.46')).toBe('Alcalose (origem indeterminada)');
  });
  it('HCO₃ 22/26 e PCO₂ 35/45 ainda são normais', () => {
    const cl = (h: string) => String(140 - Number(h) - 8); // AG 8: o delta-delta não interfere
    const d = (o: any) => g({ ph: '7.30', cl: cl(o.hco3), ...o }).disturbio;
    expect(d({ hco3: '22', pco2: '40' })).toBe('Acidose (origem indeterminada)');
    expect(d({ hco3: '21', pco2: '40' })).toBe('Acidose metabólica');
    expect(d({ hco3: '24', pco2: '45' })).toBe('Acidose (origem indeterminada)');
    expect(d({ hco3: '24', pco2: '46' })).toBe('Acidose respiratória');
    const a = (o: any) => g({ ph: '7.50', cl: cl(o.hco3), ...o }).disturbio;
    expect(a({ hco3: '26', pco2: '40' })).toBe('Alcalose (origem indeterminada)');
    expect(a({ hco3: '27', pco2: '40' })).toBe('Alcalose metabólica');
    expect(a({ hco3: '24', pco2: '35' })).toBe('Alcalose (origem indeterminada)');
    expect(a({ hco3: '24', pco2: '34' })).toBe('Alcalose respiratória');
  });
  it('alerta de AG > 20 só acima de 20', () => {
    expect(g({ cl: '106' }).agAlerta).toBeUndefined(); // AG 20
    expect(g({ cl: '105' }).agAlerta).toContain('> 20'); // AG 21
  });
});

describe('osmolaridade — fronteiras (mutação)', () => {
  const o = (x: any) => calcularOsmolaridade({ na: '140', glicose: '90', ureia: '30', ...x }) as any;
  it('gap osmolar: 10 não alerta, 11 alerta', () => {
    expect(o({ medida: '300' }).avisos).toEqual([]);
    expect(o({ medida: '301' }).avisos.length).toBe(1);
  });
  it('osmolaridade: 320 não alerta, acima alerta', () => {
    expect(o({ na: '159', glicose: '18', ureia: '6' }).osm).toBe(320);
    expect(o({ na: '159', glicose: '18', ureia: '6' }).avisos).toEqual([]);
    expect(o({ na: '159', glicose: '18', ureia: '9' }).avisos.length).toBe(1); // 320,5
  });
});
