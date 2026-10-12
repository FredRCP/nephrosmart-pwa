import { describe, expect, it } from 'vitest';
import { corrigirCalcio } from '@/lib/clinical/calcio-corrigido';

const ok = (c: string, a: string) => { const r = corrigirCalcio({ calcio: c, albumina: a }); if (!r.ok) throw new Error(r.mensagem); return r; };

describe('Cálcio corrigido (Payne)', () => {
  it('corrige 0,8 por g/dL abaixo de 4', () => {
    expect(ok('7.5', '2.5').corrigido).toBe(8.7);
    expect(ok('8,0', '3.0').corrigido).toBe(8.8);
  });
  it('albumina ≥ 4 não ajusta', () => {
    const r = ok('9.0', '4.5');
    expect(r.corrigido).toBe(9);
    expect(r.ajustado).toBe(false);
    expect(ok('9.0', '4.0').ajustado).toBe(false);
  });
  it('faixas pela referência 8,5–10,2 (limites inclusos)', () => {
    expect(ok('8.4', '4').faixa).toBe('baixo');
    expect(ok('8.5', '4').faixa).toBe('normal');
    expect(ok('10.2', '4').faixa).toBe('normal');
    expect(ok('10.3', '4').faixa).toBe('alto');
  });
  it('avisos: albumina < 2 e correção em DRC/UTI', () => {
    expect(ok('6', '1.5').avisos.join(' ')).toContain('< 2,0');
    expect(ok('8', '3').avisos.join(' ')).toContain('cálcio iônico');
    expect(ok('9', '4.2').avisos).toEqual([]);
  });
  it('limites das faixas de entrada são inclusivos', () => {
    expect(corrigirCalcio({ calcio: '2', albumina: '0.5' }).ok).toBe(true);
    expect(corrigirCalcio({ calcio: '20', albumina: '7' }).ok).toBe(true);
    expect(corrigirCalcio({ calcio: '1.9', albumina: '4' }).ok).toBe(false);
  });
  it('rejeita vazio, texto, zero e fora da faixa, apontando o campo', () => {
    for (const [c, a] of [['', '4'], ['abc', '4'], ['0', '4'], ['25', '4']]) { const r = corrigirCalcio({ calcio: c, albumina: a }); expect(r.ok).toBe(false); if (!r.ok) expect(r.campos).toEqual(['calcio']); }
    const r = corrigirCalcio({ calcio: '9', albumina: '0' });
    expect(!r.ok && r.campos).toEqual(['albumina']);
    const d = corrigirCalcio({ calcio: '', albumina: '' });
    expect(!d.ok && d.campos).toEqual(['calcio', 'albumina']);
  });
});
