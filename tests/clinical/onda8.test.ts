import { describe, expect, it } from 'vitest';
import { calcularInfusao, formatar, type EntradaInfusao } from '@/lib/clinical/infusao';
import { calcularKtv, calcularTuf, classificarKtv, classificarTuf, spKtvDaugirdas } from '@/lib/clinical/hemodialise';
import { calcularSofa2, pontosBilirrubina, pontosCardio, pontosCreatinina, pontosPamSemDroga, pontosPlaquetas, pontosRespiratorio, pontosSnc, type EntradaSofa } from '@/lib/clinical/sofa2';

const inf = (o: Partial<EntradaInfusao>): EntradaInfusao => ({ sentido: 'dose-para-velocidade', quantidade: '16', unidadeQuantidade: 'mg', volume: '250', peso: '80', unidadeDose: 'mcg/kg/min', valor: '0.1', ...o });

describe('Conversor de infusão — contas feitas à mão', () => {
  it('noradrenalina 0,1 mcg/kg/min, 80 kg, 16 mg em 250 mL → 7,5 mL/h', () => {
    const r = calcularInfusao(inf({}));
    expect(r.ok && r.velocidade).toBe(7.5);
    expect(r.ok && r.texto).toContain('7,50 mL/h');
    expect(r.ok && r.concentracaoTexto).toBe('64,0 mcg/mL (0,0640 mg/mL)');
  });
  it('sentido inverso: 7,5 mL/h → 0,1 mcg/kg/min', () => {
    const r = calcularInfusao(inf({ sentido: 'velocidade-para-dose', valor: '7,5' }));
    expect(r.ok && r.dose).toBe(0.1);
  });
  it('exemplo do app original: 70 kg, 64 mcg/mL, 10 mL/h → 0,152; 0,1 → 6,56 mL/h', () => {
    const a = calcularInfusao(inf({ peso: '70', sentido: 'velocidade-para-dose', valor: '10' }));
    expect(a.ok && formatar(a.dose as number)).toBe('0,152');
    const b = calcularInfusao(inf({ peso: '70' }));
    expect(b.ok && formatar(b.velocidade as number)).toBe('6,56');
  });
  const casos: [string, Partial<EntradaInfusao>, number][] = [
    ['mcg/kg/h (fentanil 0,5; 70 kg; 500 mcg/100 mL)', { quantidade: '500', unidadeQuantidade: 'mcg', volume: '100', peso: '70', unidadeDose: 'mcg/kg/h', valor: '0.5' }, 7],
    ['mg/kg/h (propofol 2; 80 kg; 1000 mg/100 mL)', { quantidade: '1000', volume: '100', unidadeDose: 'mg/kg/h', valor: '2' }, 16],
    ['mcg/min (nitroglicerina 20; 50 mg/250 mL)', { quantidade: '50', volume: '250', unidadeDose: 'mcg/min', valor: '20' }, 6],
    ['mg/h (midazolam 5; 50 mg/50 mL)', { quantidade: '50', volume: '50', unidadeDose: 'mg/h', valor: '5' }, 5],
    ['mg/kg/min (0,01; 70 kg; 100 mg/100 mL)', { quantidade: '100', volume: '100', peso: '70', unidadeDose: 'mg/kg/min', valor: '0.01' }, 42],
    ['mcg/h (100 mcg/h; 1 mg/100 mL = 10 mcg/mL)', { quantidade: '1', volume: '100', unidadeDose: 'mcg/h', valor: '100' }, 10],
    ['mg/min (1 mg/min; 100 mg/100 mL)', { quantidade: '100', volume: '100', unidadeDose: 'mg/min', valor: '1' }, 60],
    ['UI/h (insulina 1; 100 UI/100 mL)', { quantidade: '100', unidadeQuantidade: 'UI', volume: '100', unidadeDose: 'UI/h', valor: '1' }, 1],
    ['UI/kg/h (heparina 18; 80 kg; 25000 UI/250 mL)', { quantidade: '25000', unidadeQuantidade: 'UI', volume: '250', unidadeDose: 'UI/kg/h', valor: '18' }, 14.4],
    ['UI/min (vasopressina 0,03; 20 UI/100 mL)', { quantidade: '20', unidadeQuantidade: 'UI', volume: '100', unidadeDose: 'UI/min', valor: '0.03' }, 9],
    ['quantidade em mcg e dose em mg/h (2 mg/h; 50 000 mcg/50 mL)', { quantidade: '50000', unidadeQuantidade: 'mcg', volume: '50', unidadeDose: 'mg/h', valor: '2' }, 2],
  ];
  for (const [nome, o, esperado] of casos) {
    it(`${nome} → ${esperado} mL/h e volta`, () => {
      const r = calcularInfusao(inf(o));
      expect(r.ok && r.velocidade).toBeCloseTo(esperado, 6);
      const v = calcularInfusao(inf({ ...o, sentido: 'velocidade-para-dose', valor: String(esperado) }));
      expect(v.ok && v.dose).toBeCloseTo(parseFloat(String(o.valor)), 4);
    });
  }
  it('rejeita UI misturada com mg', () => {
    const r = calcularInfusao(inf({ unidadeDose: 'UI/h' }));
    expect(r.ok).toBe(false);
    expect(!r.ok && r.campos).toEqual(['unidadeQuantidade', 'unidadeDose']);
    expect(calcularInfusao(inf({ unidadeQuantidade: 'UI' })).ok).toBe(false);
  });
  it('peso só é exigido quando a dose é por kg', () => {
    expect(calcularInfusao(inf({ peso: '', unidadeDose: 'mcg/min' })).ok).toBe(true);
    const r = calcularInfusao(inf({ peso: '' }));
    expect(!r.ok && r.campos).toEqual(['peso']);
  });
  it('limites de faixa', () => {
    expect(calcularInfusao(inf({ volume: '0.9' })).ok).toBe(false);
    expect(calcularInfusao(inf({ volume: '1' })).ok).toBe(true);
    expect(calcularInfusao(inf({ volume: '5000' })).ok).toBe(true);
    expect(calcularInfusao(inf({ volume: '5001' })).ok).toBe(false);
    expect(calcularInfusao(inf({ peso: '0.3' })).ok).toBe(true);
    expect(calcularInfusao(inf({ peso: '0.29' })).ok).toBe(false);
    expect(calcularInfusao(inf({ peso: '400' })).ok).toBe(true);
    expect(calcularInfusao(inf({ peso: '401' })).ok).toBe(false);
    expect(calcularInfusao(inf({ quantidade: '0' })).ok).toBe(false);
    expect(calcularInfusao(inf({ valor: '0' })).ok).toBe(false);
    expect(calcularInfusao(inf({ valor: '' })).ok).toBe(false);
    expect(calcularInfusao(inf({ sentido: 'velocidade-para-dose', valor: '2000' })).ok).toBe(true);
    expect(calcularInfusao(inf({ sentido: 'velocidade-para-dose', valor: '2001' })).ok).toBe(false);
    expect(calcularInfusao(inf({ unidadeDose: '' })).ok).toBe(false);
    expect(calcularInfusao(inf({ unidadeQuantidade: '' })).ok).toBe(false);
  });
  it('avisos', () => {
    const alta = calcularInfusao(inf({ quantidade: '2', valor: '1' })); // 8 mcg/mL → 1×80×60/8 = 600 mL/h
    expect(alta.ok && alta.avisos.join(' ')).toContain('acima de 500 mL/h');
    const limite = calcularInfusao(inf({ quantidade: '16', valor: '1' })); // 64 → 75 mL/h
    expect(limite.ok && limite.avisos.join(' ')).not.toContain('acima de 500');
    const baixa = calcularInfusao(inf({ valor: '0.01' })); // 0.75 mL/h
    expect(baixa.ok && baixa.avisos.join(' ')).toContain('abaixo de 1 mL/h');
    const naoBaixa = calcularInfusao(inf({ quantidade: '64', valor: '0.1' })); // 256 mcg/mL → 1.875
    expect(naoBaixa.ok && naoBaixa.avisos.join(' ')).not.toContain('abaixo de 1 mL/h');
    expect(calcularInfusao(inf({})).ok && (calcularInfusao(inf({})) as { avisos: string[] }).avisos.join(' ')).toContain('Peso usado: 80');
    const semPeso = calcularInfusao(inf({ unidadeDose: 'mg/h', valor: '1' }));
    expect(semPeso.ok && semPeso.avisos.join(' ')).not.toContain('Peso usado');
  });
  it('formatar', () => {
    expect(formatar(0.152381)).toBe('0,152');
    expect(formatar(6.5625)).toBe('6,56');
    expect(formatar(125.4)).toBe('125');
    expect(formatar(12.34)).toBe('12,3');
    expect(formatar(0)).toBe('0');
  });
});

describe('Kt/V — contas feitas à mão', () => {
  const base = { ureiaPre: '100', ureiaPos: '30', horas: '4', uf: '2.5', peso: '70'};
  it('R=0,3; t=4; UF 2,5 L; 70 kg → spKt/V 1,422; URR 70%', () => {
    const r = calcularKtv(base);
    expect(r.ok && r.spKtv).toBe(1.422);
    expect(r.ok && r.urr).toBe(70);
    expect(r.ok && r.classe).toBe('meta');
    expect(r.ok && r.texto).toContain('spKt/V: 1,42');
    expect(r.ok && r.texto).toContain('URR: 70,0%');
  });
  it('funções puras', () => {
    expect(spKtvDaugirdas(0.3, 4, 0, 70)).toBeCloseTo(-Math.log(0.268), 10);
    expect(spKtvDaugirdas(0.008 * 4, 4, 0, 70)).toBeNaN();
  });
  it('classificação nos limites (inclusivos)', () => {
    expect(classificarKtv(1.4)).toBe('meta');
    expect(classificarKtv(1.399)).toBe('abaixo-da-meta');
    expect(classificarKtv(1.2)).toBe('abaixo-da-meta');
    expect(classificarKtv(1.199)).toBe('abaixo-do-minimo');
  });
  it('validações', () => {
    expect(calcularKtv({ ...base, ureiaPos: '100' }).ok).toBe(false); // pós = pré
    expect(calcularKtv({ ...base, ureiaPos: '120' }).ok).toBe(false);
    const inc = calcularKtv({ ...base, ureiaPre: '100', ureiaPos: '3', horas: '4' }); // R=0,03 < 0,032
    expect(!inc.ok && inc.mensagem).toContain('incompatíveis');
    expect(calcularKtv({ ...base, ureiaPos: '3.2', horas: '4' }).ok).toBe(false); // R−0,032 = 0 exatamente
    expect(calcularKtv({ ...base, ureiaPos: '3.3', horas: '4' }).ok).toBe(true);
    expect(calcularKtv({ ...base, horas: '0.4' }).ok).toBe(false);
    expect(calcularKtv({ ...base, horas: '0.5' }).ok).toBe(true);
    expect(calcularKtv({ ...base, horas: '12' }).ok).toBe(true);
    expect(calcularKtv({ ...base, horas: '12.1' }).ok).toBe(false);
    expect(calcularKtv({ ...base, uf: '0' }).ok).toBe(true);
    expect(calcularKtv({ ...base, uf: '-1' }).ok).toBe(false);
    expect(calcularKtv({ ...base, uf: '10.1' }).ok).toBe(false);
    expect(calcularKtv({ ...base, peso: '19' }).ok).toBe(false);
    expect(calcularKtv({ ...base, peso: '20' }).ok).toBe(true);
    expect(calcularKtv({ ...base, peso: '301' }).ok).toBe(false);
    expect(calcularKtv({ ...base, ureiaPre: '501', ureiaPos: '30' }).ok).toBe(false);
    expect(calcularKtv({ ...base, ureiaPre: '', }).ok).toBe(false);
  });
  it('aviso de spKt/V > 3', () => {
    const r = calcularKtv({ ...base, ureiaPos: '4', horas: '4' }); // R=0,04
    expect(r.ok && r.spKtv).toBeGreaterThan(3);
    expect(r.ok && r.avisos.join(' ')).toContain('muito alto');
    expect(calcularKtv(base).ok && (calcularKtv(base) as { avisos: string[] }).avisos.join(' ')).not.toContain('muito alto');
  });
});

describe('Taxa de ultrafiltração', () => {
  it('2,6 L; 65 kg; 4 h → 10,0 mL/kg/h (intermediária)', () => {
    const r = calcularTuf({ uf: '2.6', pesoSeco: '65', horas: '4', ganho: '' });
    expect(r.ok && r.tuf).toBe(10);
    expect(r.ok && r.classe).toBe('intermediaria');
  });
  it('limiares 10 e 13 (inclusivos)', () => {
    expect(classificarTuf(9.999)).toBe('baixa');
    expect(classificarTuf(10)).toBe('intermediaria');
    expect(classificarTuf(12.999)).toBe('intermediaria');
    expect(classificarTuf(13)).toBe('alta');
    const r = calcularTuf({ uf: '3.38', pesoSeco: '65', horas: '4', ganho: '' }); // 3380/65/4 = 13
    expect(r.ok && r.classe).toBe('alta');
    expect(r.ok && r.avisos.join(' ')).toContain('Taxa ≥ 13');
  });
  it('ganho interdialítico em % do peso seco', () => {
    const r = calcularTuf({ uf: '2', pesoSeco: '80', horas: '4', ganho: '2.4' });
    expect(r.ok && r.ganhoPct).toBe(3);
    expect(r.ok && r.texto).toContain('3,0%');
    expect(calcularTuf({ uf: '2', pesoSeco: '80', horas: '4', ganho: '' }).ok && (calcularTuf({ uf: '2', pesoSeco: '80', horas: '4', ganho: '' }) as { ganhoPct: null }).ganhoPct).toBeNull();
  });
  it('validações', () => {
    expect(calcularTuf({ uf: '0', pesoSeco: '80', horas: '4', ganho: '' }).ok).toBe(false);
    expect(calcularTuf({ uf: '2', pesoSeco: '19', horas: '4', ganho: '' }).ok).toBe(false);
    expect(calcularTuf({ uf: '2', pesoSeco: '80', horas: '0.4', ganho: '' }).ok).toBe(false);
    expect(calcularTuf({ uf: '2', pesoSeco: '80', horas: '4', ganho: '-1' }).ok).toBe(false);
    expect(calcularTuf({ uf: '2', pesoSeco: '80', horas: '4', ganho: '16' }).ok).toBe(false);
    expect(calcularTuf({ uf: '2', pesoSeco: '80', horas: '4', ganho: '15' }).ok).toBe(true);
    expect(calcularTuf({ uf: '10', pesoSeco: '80', horas: '4', ganho: '' }).ok).toBe(true);
    expect(calcularTuf({ uf: '10.1', pesoSeco: '80', horas: '4', ganho: '' }).ok).toBe(false);
  });
});

describe('SOFA-2 — cortes por sistema', () => {
  it('respiratório P/F com suporte avançado', () => {
    expect(pontosRespiratorio(300.001, true, false)).toBe(0);
    expect(pontosRespiratorio(300, true, false)).toBe(1);
    expect(pontosRespiratorio(225.001, true, false)).toBe(1);
    expect(pontosRespiratorio(225, true, false)).toBe(2);
    expect(pontosRespiratorio(150.001, true, false)).toBe(2);
    expect(pontosRespiratorio(150, true, false)).toBe(3);
    expect(pontosRespiratorio(75.001, true, false)).toBe(3);
    expect(pontosRespiratorio(75, true, false)).toBe(4);
  });
  it('respiratório sem suporte avançado: máximo 2', () => {
    expect(pontosRespiratorio(60, false, false)).toBe(2);
    expect(pontosRespiratorio(140, false, false)).toBe(2);
    expect(pontosRespiratorio(250, false, false)).toBe(1);
    expect(pontosRespiratorio(350, false, false)).toBe(0);
  });
  it('respiratório S/F', () => {
    expect(pontosRespiratorio(301, true, true)).toBe(0);
    expect(pontosRespiratorio(300, true, true)).toBe(1);
    expect(pontosRespiratorio(250, true, true)).toBe(2);
    expect(pontosRespiratorio(200, true, true)).toBe(3);
    expect(pontosRespiratorio(120, true, true)).toBe(4);
    expect(pontosRespiratorio(121, true, true)).toBe(3);
    expect(pontosRespiratorio(100, false, true)).toBe(2);
  });
  it('plaquetas', () => {
    expect([151, 150, 101, 100, 81, 80, 51, 50].map(pontosPlaquetas)).toEqual([0, 1, 1, 2, 2, 3, 3, 4]);
  });
  it('bilirrubina', () => {
    expect([1.2, 1.201, 3, 3.001, 6, 6.001, 12, 12.001].map(pontosBilirrubina)).toEqual([0, 1, 1, 2, 2, 3, 3, 4]);
  });
  it('SNC', () => {
    expect([15, 14, 13, 12, 9, 8, 6, 5, 3].map((g) => pontosSnc(g, false, false))).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4]);
    expect(pontosSnc(15, true, false)).toBe(1);
    expect(pontosSnc(10, true, false)).toBe(2);
    expect(pontosSnc(15, false, true)).toBe(4);
  });
  it('creatinina', () => {
    expect([1.2, 1.201, 2, 2.001, 3.5, 3.501].map(pontosCreatinina)).toEqual([0, 1, 1, 2, 2, 3]);
  });
  it('PAM sem droga (limite terapêutico)', () => {
    expect([70, 69.9, 60, 59.9, 50, 49.9, 40, 39.9].map(pontosPamSemDroga)).toEqual([0, 1, 1, 2, 2, 3, 3, 4]);
  });
  const c = (o: Partial<Parameters<typeof pontosCardio>[0]>) => pontosCardio({ pam: 80, ne: 0, epi: 0, dopa: 0, outro: false, mecanico: false, limite: false, ...o }).pontos;
  it('cardiovascular', () => {
    expect(c({})).toBe(0);
    expect(c({ pam: 69 })).toBe(1);
    expect(c({ pam: 70 })).toBe(0);
    expect(c({ pam: null })).toBe(0);
    expect(c({ ne: 0.05 })).toBe(2);
    expect(c({ ne: 0.2 })).toBe(2);
    expect(c({ ne: 0.1, epi: 0.1 })).toBe(2); // soma 0,2
    expect(c({ ne: 0.1, epi: 0.11 })).toBe(3);
    expect(c({ ne: 0.4 })).toBe(3);
    expect(c({ ne: 0.401 })).toBe(4);
    expect(c({ ne: 0.2, outro: true })).toBe(3);
    expect(c({ ne: 0.3, outro: true })).toBe(4);
    expect(c({ ne: 0.1, dopa: 5 })).toBe(3);
    expect(c({ outro: true })).toBe(2);
    expect(c({ mecanico: true })).toBe(4);
    expect(c({ dopa: 20 })).toBe(2);
    expect(c({ dopa: 21 })).toBe(3);
    expect(c({ dopa: 40 })).toBe(3);
    expect(c({ dopa: 41 })).toBe(4);
    expect(c({ pam: 55, limite: true })).toBe(2);
    expect(c({ pam: 55, limite: false })).toBe(1);
    expect(c({ pam: 30, limite: true })).toBe(4);
  });
});

const vazioS: EntradaSofa = {
  pao2: '', spo2: '', fio2: '', suporteAvancado: false, ecmoResp: false, plaquetas: '', bilirrubina: '', gcs: '', deliriumFarmaco: false, motorGrave: false,
  creatinina: '', diurese: '', emTrs: false, criteriosTrs: false, pam: '', noradrenalina: '', adrenalina: '', dopamina: '', outroVaso: false, suporteMecanico: false, semVasoativosPorLimite: false, unidade: 'mg/dL',
};
const sofa = (o: Partial<EntradaSofa>) => calcularSofa2({ ...vazioS, ...o });

describe('SOFA-2 — cálculo total', () => {
  it('paciente hipotético: P/F 140 com VM (3), plaq 90 (2), bili 2,5 (1), GCS 10 (2), Cr 2,5 (2), NE 0,25 (3) = 13', () => {
    const r = sofa({ pao2: '70', fio2: '50', suporteAvancado: true, plaquetas: '90', bilirrubina: '2.5', gcs: '10', creatinina: '2.5', pam: '65', noradrenalina: '0.25' });
    expect(r.ok && r.total).toBe(13);
    expect(r.ok && r.sistemas.resp.pontos).toBe(3);
    expect(r.ok && r.sistemas.cardio.pontos).toBe(3);
  });
  it('tudo normal = 0', () => {
    const r = sofa({ pao2: '90', fio2: '21', plaquetas: '200', bilirrubina: '0.8', gcs: '15', creatinina: '0.9', pam: '85' });
    expect(r.ok && r.total).toBe(0);
    expect(r.ok && r.semDado).toEqual([]);
  });
  it('máximo teórico = 24', () => {
    const r = sofa({ ecmoResp: true, plaquetas: '30', bilirrubina: '15', motorGrave: true, emTrs: true, suporteMecanico: true });
    expect(r.ok && r.total).toBe(24);
  });
  it('sem dado conta 0 e é sinalizado', () => {
    const r = sofa({ plaquetas: '40' });
    expect(r.ok && r.total).toBe(4);
    expect(r.ok && r.semDado.length).toBe(5);
    expect(r.ok && r.avisos.join(' ')).toContain('Sem dado em');
  });
  it('nada informado → erro', () => {
    const r = sofa({});
    expect(r.ok).toBe(false);
  });
  it('SpO2/FiO2 só com SpO2 < 98%', () => {
    expect(sofa({ spo2: '98', fio2: '40' }).ok).toBe(false);
    const r = sofa({ spo2: '90', fio2: '40', suporteAvancado: true }); // 225
    expect(r.ok && r.sistemas.resp.pontos).toBe(2);
    expect(sofa({ spo2: '97', fio2: '40' }).ok).toBe(true);
  });
  it('PaO2 tem prioridade sobre SpO2; FiO2 obrigatória', () => {
    const r = sofa({ pao2: '300', spo2: '80', fio2: '100' });
    expect(r.ok && r.sistemas.resp.pontos).toBe(1);
    const f = sofa({ pao2: '200' });
    expect(!f.ok && f.campos).toContain('fio2');
  });
  it('ECMO respiratória = 4 no respiratório', () => {
    const r = sofa({ ecmoResp: true });
    expect(r.ok && r.sistemas.resp.pontos).toBe(4);
  });
  it('unidades µmol/L (bilirrubina 17,104 · creatinina 88,4)', () => {
    const r = sofa({ unidade: 'umol/L', bilirrubina: '51.3', creatinina: '106' }); // 3,0 mg/dL → 1 ; 1,199 mg/dL → 0
    expect(r.ok && r.sistemas.figado.pontos).toBe(1);
    expect(r.ok && r.sistemas.renal.pontos).toBe(0);
    const r2 = sofa({ unidade: 'umol/L', bilirrubina: '205.3', creatinina: '310' }); // 12,003 → 4 ; 3,507 → 3
    expect(r2.ok && r2.sistemas.figado.pontos).toBe(4);
    expect(r2.ok && r2.sistemas.renal.pontos).toBe(3);
  });
  it('renal: TRS, critérios e diurese', () => {
    const a = sofa({ emTrs: true });
    expect(a.ok && a.sistemas.renal.pontos).toBe(4);
    const b = sofa({ criteriosTrs: true });
    expect(b.ok && b.sistemas.renal.pontos).toBe(4);
    const d = sofa({ creatinina: '0.8', diurese: '12h' });
    expect(d.ok && d.sistemas.renal.pontos).toBe(2);
    const e = sofa({ creatinina: '3', diurese: '6-12h' });
    expect(e.ok && e.sistemas.renal.pontos).toBe(2);
    const f = sofa({ diurese: '24h' });
    expect(f.ok && f.sistemas.renal.pontos).toBe(3);
    const g = sofa({ diurese: 'normal' });
    expect(g.ok && g.sistemas.renal.pontos).toBe(0);
    expect(g.ok && g.sistemas.renal.semDado).toBe(false);
  });
  it('SNC: delirium com Glasgow 15 = 1', () => {
    const r = sofa({ gcs: '15', deliriumFarmaco: true });
    expect(r.ok && r.sistemas.snc.pontos).toBe(1);
    const s = sofa({ deliriumFarmaco: true });
    expect(s.ok && s.sistemas.snc.pontos).toBe(1);
  });
  it('validações de faixa', () => {
    expect(sofa({ gcs: '2' }).ok).toBe(false);
    expect(sofa({ gcs: '16' }).ok).toBe(false);
    expect(sofa({ gcs: '3' }).ok).toBe(true);
    expect(sofa({ gcs: '12.5' }).ok).toBe(false);
    expect(sofa({ plaquetas: '0' }).ok).toBe(false);
    expect(sofa({ fio2: '20', pao2: '90' }).ok).toBe(false);
    expect(sofa({ fio2: '21', pao2: '90' }).ok).toBe(true);
    expect(sofa({ fio2: '100', pao2: '90' }).ok).toBe(true);
    expect(sofa({ fio2: '101', pao2: '90' }).ok).toBe(false);
    expect(sofa({ noradrenalina: '5.1' }).ok).toBe(false);
    expect(sofa({ pam: '9' }).ok).toBe(false);
    expect(sofa({ bilirrubina: '0.04' }).ok).toBe(false);
    expect(sofa({ creatinina: '31' }).ok).toBe(false);
  });
});

describe('SOFA-2 — reforços (mutação)', () => {
  it('S/F: 251 e 201 ficam na faixa anterior', () => {
    expect(pontosRespiratorio(251, true, true)).toBe(1);
    expect(pontosRespiratorio(201, true, true)).toBe(2);
  });
  it('diurese <0,5 por 6–12 h = 1 ponto sozinha', () => {
    const r = sofa({ diurese: '6-12h' });
    expect(r.ok && r.sistemas.renal.pontos).toBe(1);
  });
  it('doses fracionadas de dopamina e outro agente', () => {
    expect(pontosCardio({ pam: 80, ne: 0.1, epi: 0, dopa: 0.5, outro: false, mecanico: false, limite: false }).pontos).toBe(3);
    expect(pontosCardio({ pam: 80, ne: 0, epi: 0, dopa: 0.5, outro: false, mecanico: false, limite: false }).pontos).toBe(2);
  });
  it('vasoativo informado sem PAM já conta como dado cardiovascular', () => {
    expect(sofa({ noradrenalina: '0.5' }).ok && (sofa({ noradrenalina: '0.5' }) as { sistemas: { cardio: { pontos: number; semDado: boolean } } }).sistemas.cardio).toEqual({ pontos: 4, semDado: false, motivo: 'noradrenalina + adrenalina > 0,4 µg/kg/min' });
    const e = sofa({ adrenalina: '0.5', plaquetas: '200' });
    expect(e.ok && e.sistemas.cardio.semDado).toBe(false);
    const d = sofa({ dopamina: '0.5' });
    expect(d.ok && d.sistemas.cardio.pontos).toBe(2);
  });
  it('S/F calculado com FiO2 em % (96/0,80 = 120 → 4 com suporte)', () => {
    const r = sofa({ spo2: '96', fio2: '80', suporteAvancado: true });
    expect(r.ok && r.sistemas.resp.pontos).toBe(4);
  });
  it('limites de entrada aceitos/recusados', () => {
    const casos: [Partial<EntradaSofa>, boolean][] = [
      [{ pao2: '10', fio2: '50' }, true], [{ pao2: '9.9', fio2: '50' }, false], [{ pao2: '700', fio2: '50' }, true], [{ pao2: '700.1', fio2: '50' }, false],
      [{ spo2: '50', fio2: '50' }, true], [{ spo2: '49.9', fio2: '50' }, false], [{ spo2: '97.9', fio2: '50' }, true],
      [{ plaquetas: '1' }, true], [{ plaquetas: '0.9' }, false], [{ plaquetas: '2000' }, true], [{ plaquetas: '2000.1' }, false],
      [{ bilirrubina: '0.05' }, true], [{ bilirrubina: '0.049' }, false], [{ bilirrubina: '60' }, true], [{ bilirrubina: '60.1' }, false],
      [{ unidade: 'umol/L', bilirrubina: '1' }, true], [{ unidade: 'umol/L', bilirrubina: '0.9' }, false], [{ unidade: 'umol/L', bilirrubina: '1000' }, true], [{ unidade: 'umol/L', bilirrubina: '1001' }, false],
      [{ creatinina: '0.1' }, true], [{ creatinina: '0.09' }, false], [{ creatinina: '30' }, true],
      [{ unidade: 'umol/L', creatinina: '10' }, true], [{ unidade: 'umol/L', creatinina: '9.9' }, false], [{ unidade: 'umol/L', creatinina: '2700' }, true], [{ unidade: 'umol/L', creatinina: '2701' }, false],
      [{ pam: '10' }, true], [{ pam: '200' }, true], [{ pam: '200.1' }, false],
      [{ noradrenalina: '0' }, true], [{ noradrenalina: '5' }, true], [{ adrenalina: '5' }, true], [{ adrenalina: '5.1' }, false], [{ adrenalina: '-0.1' }, false],
      [{ dopamina: '100' }, true], [{ dopamina: '100.1' }, false], [{ dopamina: '-1' }, false],
    ];
    for (const [o, ok] of casos) expect(sofa({ plaquetas: '200', ...o }).ok, JSON.stringify(o)).toBe(ok);
  });
});

describe('Reforços de mutação — infusão e hemodiálise', () => {
  it('formatar: limites de casas decimais', () => {
    expect([100, 10, 1, 0.1, 0.01, 0.005].map(formatar)).toEqual(['100', '10,0', '1,00', '0,100', '0,0100', '0,00500']);
    expect(formatar(2)).toBe('2,00');
    expect(formatar(11)).toBe('11,0');
    expect(formatar(0.11)).toBe('0,110');
    expect(formatar(0.02)).toBe('0,0200');
  });
  it('limites inclusivos de quantidade e dose', () => {
    expect(calcularInfusao(inf({ quantidade: '0.001' })).ok).toBe(true);
    expect(calcularInfusao(inf({ quantidade: '1000000' })).ok).toBe(true);
    expect(calcularInfusao(inf({ quantidade: '1000001' })).ok).toBe(false);
    expect(calcularInfusao(inf({ valor: '0.0001' })).ok).toBe(true);
    expect(calcularInfusao(inf({ sentido: 'velocidade-para-dose', valor: '0.01' })).ok).toBe(true);
    expect(calcularInfusao(inf({ sentido: 'velocidade-para-dose', valor: '0.009' })).ok).toBe(false);
    expect(calcularInfusao(inf({ valor: '100000' })).ok).toBe(true);
    expect(calcularInfusao(inf({ valor: '100001' })).ok).toBe(false);
  });
  it('aviso de velocidade: exatamente 500 e exatamente 1 mL/h não avisam', () => {
    const a = calcularInfusao(inf({ quantidade: '100', unidadeQuantidade: 'mg', volume: '100', unidadeDose: 'mg/h', valor: '500' }));
    expect(a.ok && a.velocidade).toBe(500);
    expect(a.ok && a.avisos.join(' ')).not.toContain('acima de');
    const b = calcularInfusao(inf({ quantidade: '100', volume: '100', unidadeDose: 'mg/h', valor: '1' }));
    expect(b.ok && b.velocidade).toBe(1);
    expect(b.ok && b.avisos.join(' ')).not.toContain('abaixo de');
  });
  it('texto do Kt/V com casas decimais', () => {
    const r = calcularKtv({ ureiaPre: '100', ureiaPos: '30', horas: '4', uf: '2.5', peso: '70' });
    expect(r.ok && r.texto).toBe('spKt/V: 1,42\nURR: 70,0%\nDentro da meta (≥ 1,4)');
    const rotulos = calcularKtv({ ureiaPre: '100', ureiaPos: '40', horas: '4', uf: '0', peso: '70' }); // -ln(.368)=0.9997
    expect(rotulos.ok && rotulos.texto).toContain('Abaixo do mínimo');
  });
  it('spKt/V da fórmula com UF grande', () => {
    expect(spKtvDaugirdas(0.3, 4, 5, 50)).toBeCloseTo(-Math.log(0.268) + 2.95 * 0.1, 9);
  });
  it('aviso de spKt/V entre 3 e 4', () => {
    const r = calcularKtv({ ureiaPre: '100', ureiaPos: '6', horas: '4', uf: '2.5', peso: '70' });
    expect(r.ok && r.spKtv).toBeGreaterThan(3);
    expect(r.ok && r.spKtv).toBeLessThan(4);
    expect(r.ok && r.avisos.join(' ')).toContain('muito alto');
  });
  it('TUF: UF e ganho pequenos válidos', () => {
    expect(calcularTuf({ uf: '0.5', pesoSeco: '80', horas: '4', ganho: '0' }).ok).toBe(true);
    expect(calcularTuf({ uf: '0.5', pesoSeco: '80', horas: '4', ganho: '0.5' }).ok).toBe(true);
    expect(calcularTuf({ uf: '0.5', pesoSeco: '80', horas: '4', ganho: '0' }).ok && (calcularTuf({ uf: '0.5', pesoSeco: '80', horas: '4', ganho: '0' }) as { ganhoPct: number }).ganhoPct).toBe(0);
  });
  it('TUF: rótulos', () => {
    const r = calcularTuf({ uf: '1', pesoSeco: '80', horas: '4', ganho: '' });
    expect(r.ok && r.texto).toBe('Taxa de UF: 3,1 mL/kg/h\nTaxa baixa (< 10)');
    const m = calcularTuf({ uf: '3', pesoSeco: '65', horas: '4', ganho: '' });
    expect(m.ok && m.texto).toContain('intermediária (10 a < 13)');
    const a = calcularTuf({ uf: '4', pesoSeco: '65', horas: '4', ganho: '' });
    expect(a.ok && a.texto).toContain('Taxa alta (≥ 13)');
  });
  it('SOFA: faixas e mensagens de SpO2', () => {
    expect(sofa({ pao2: '90', spo2: '100.5', fio2: '50' }).ok).toBe(false);
    expect(sofa({ adrenalina: '0' }).ok).toBe(false); // nenhum dado além de zero
    const m98 = sofa({ spo2: '98', fio2: '40' }), m99 = sofa({ spo2: '99', fio2: '40' });
    expect(!m98.ok && m98.mensagem).toContain('só vale com SpO₂ < 98%');
    expect(!m99.ok && m99.mensagem).toContain('só vale com SpO₂ < 98%');
    const nulo = sofa({ pam: '80' });
    expect(nulo.ok && nulo.sistemas.coag.pontos).toBe(0);
    expect(nulo.ok && nulo.sistemas.coag.semDado).toBe(true);
  });
});
