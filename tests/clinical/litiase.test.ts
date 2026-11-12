import { describe, expect, it } from 'vitest';
import { avaliarLitiase, tipoPorDensidade, type EntradaLitiase } from '@/lib/clinical/litiase';

const base: EntradaLitiase = {
  sexo: '', composicao: '', hu: '', volume: '', calcio: '', oxalato: '', citrato: '', acidoUrico: '', sodio: '', ph: '',
  calcioSerico: '', pth: '', acidoUricoSerico: '', bicarbonato: '', potassio: '',
  infeccaoUrease: false, trato: false, nefrocalcinose: false, precoce: false, farmacos: [],
};
const r = (p: Partial<EntradaLitiase>) => avaliarLitiase({ ...base, ...p });
const ids = (p: Partial<EntradaLitiase>) => r(p).hipoteses.map((h) => h.id);
const st = (p: Partial<EntradaLitiase>, id: string) => r(p).achados.find((a) => a.id === id)?.status;

describe('limiares da urina de 24 h', () => {
  it('calciúria: 300 mg é normal no homem e alta na mulher; limite é exclusivo', () => {
    expect(st({ calcio: '300', sexo: 'm' }, 'calcio')).toBe('normal');
    expect(st({ calcio: '301', sexo: 'm' }, 'calcio')).toBe('alto');
    expect(st({ calcio: '251', sexo: 'f' }, 'calcio')).toBe('alto');
    expect(st({ calcio: '250', sexo: 'f' }, 'calcio')).toBe('normal');
  });
  it('oxalato > 40, citrato < 320, ácido úrico por sexo, sódio > 200', () => {
    expect(st({ oxalato: '40' }, 'oxalato')).toBe('normal');
    expect(st({ oxalato: '41' }, 'oxalato')).toBe('alto');
    expect(st({ citrato: '320' }, 'citrato')).toBe('normal');
    expect(st({ citrato: '319' }, 'citrato')).toBe('baixo');
    expect(st({ acidoUrico: '780', sexo: 'f' }, 'urico-u')).toBe('alto');
    expect(st({ acidoUrico: '780', sexo: 'm' }, 'urico-u')).toBe('normal');
    expect(st({ sodio: '201' }, 'sodio')).toBe('alto');
  });
  it('aceita vírgula decimal e volume < 2,5 L', () => {
    expect(st({ volume: '2,4' }, 'volume')).toBe('baixo');
    expect(st({ volume: '2,5' }, 'volume')).toBe('normal');
    expect(ids({ volume: '1,6' })).toContain('volume');
  });
});

describe('hipóteses de causa', () => {
  it('hipercalcemia + PTH alto → hiperparatireoidismo primário (forte)', () => {
    const h = r({ calcioSerico: '11,2', pth: '120' }).hipoteses.find((x) => x.id === 'hpt')!;
    expect(h.nivel).toBe('forte');
  });
  it('hipercalcemia com PTH baixo → causa independente do PTH', () => {
    expect(ids({ calcioSerico: '11,5', pth: '8' })).toContain('hipercalcemia-pth-baixo');
    expect(ids({ calcioSerico: '11,5', pth: '8' })).not.toContain('hpt');
  });
  it('cálcio normal com PTH alto não gera hiperparatireoidismo primário', () => {
    expect(ids({ calcioSerico: '9,5', pth: '120' })).not.toContain('hpt');
  });
  it('acidose + pH urinário alto + sinais → acidose tubular distal forte; sem sinais, possível', () => {
    const forte = r({ bicarbonato: '16', ph: '6,8', potassio: '3,0', citrato: '100' }).hipoteses.find((x) => x.id === 'atr')!;
    expect(forte.nivel).toBe('forte');
    const fraca = r({ bicarbonato: '18', ph: '6,2' }).hipoteses.find((x) => x.id === 'atr')!;
    expect(fraca.nivel).toBe('possivel');
    expect(ids({ bicarbonato: '25', ph: '6,8' })).not.toContain('atr');
  });
  it('pH ácido → ácido úrico; hiperuricosúria junto torna forte', () => {
    expect(r({ ph: '5,2' }).hipoteses.find((x) => x.id === 'urico')!.nivel).toBe('possivel');
    expect(r({ ph: '5,2', acidoUrico: '900', sexo: 'm' }).hipoteses.find((x) => x.id === 'urico')!.nivel).toBe('forte');
  });
  it('hiperoxalúria: entérica com contexto; primária se marcada e início precoce; senão dietética', () => {
    expect(ids({ oxalato: '70', trato: true })).toContain('oxal-enterica');
    expect(r({ oxalato: '110', precoce: true }).hipoteses.find((x) => x.id === 'oxal-primaria')!.nivel).toBe('forte');
    expect(ids({ oxalato: '55' })).toContain('oxal-dieta');
    expect(ids({ oxalato: '55' })).not.toContain('oxal-primaria');
  });
  it('estruvita por urease/ composição; pH > 7 sem cultura só gera pendência', () => {
    expect(ids({ infeccaoUrease: true })).toContain('estruvita');
    expect(ids({ composicao: 'estruvita' })).toContain('estruvita');
    const x = r({ ph: '7,6' });
    expect(x.hipoteses.map((h) => h.id)).not.toContain('estruvita');
    expect(x.lacunas.join(' ')).toContain('urocultura');
  });
  it('cistina pela composição; início precoce sem composição só sugere', () => {
    expect(r({ composicao: 'cistina' }).hipoteses.find((x) => x.id === 'cistinuria')!.nivel).toBe('forte');
    expect(r({ precoce: true }).hipoteses.find((x) => x.id === 'cistinuria')!.nivel).toBe('possivel');
  });
  it('fármaco litogênico entra com o nome', () => {
    const h = r({ farmacos: ['topiramato'] }).hipoteses.find((x) => x.id === 'farmaco')!;
    expect(h.motivos[0]).toContain('Topiramato');
  });
  it('ordena forte antes de possível', () => {
    const lista = r({ volume: '1,5', calcioSerico: '11', pth: '100' }).hipoteses;
    expect(lista[0].nivel).toBe('forte');
  });
});

describe('lacunas e densidade', () => {
  it('sem urina de 24 h pede a coleta; sem composição pede análise', () => {
    const x = r({ calcioSerico: '9' });
    expect(x.lacunas.join(' ')).toContain('urina de 24 h');
    expect(x.lacunas.join(' ')).toContain('composição');
  });
  it('densidade só orienta quando a composição é desconhecida', () => {
    expect(r({ hu: '350' }).tipoPorTc).toContain('ácido úrico');
    expect(r({ hu: '1400' }).tipoPorTc).toContain('cálcio');
    expect(r({ hu: '350', composicao: 'oxalato' }).tipoPorTc).toBeNull();
    expect(tipoPorDensidade(700)).toContain('cistina');
  });
});
