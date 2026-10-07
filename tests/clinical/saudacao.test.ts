import { describe, expect, it } from 'vitest';
import { saudacaoPara } from '@/lib/saudacao';

const as = (h: number, m = 0) => new Date(2026, 9, 8, h, m);

describe('saudação por hora (regra do app original)', () => {
  it.each([
    [0, 'Boa noite'], [3, 'Boa noite'], [5, 'Boa noite'], [5.99, 'Boa noite'],
    [6, 'Bom dia'], [9, 'Bom dia'], [11, 'Bom dia'],
    [12, 'Boa tarde'], [15, 'Boa tarde'], [17, 'Boa tarde'],
    [18, 'Boa noite'], [21, 'Boa noite'], [23, 'Boa noite'],
  ])('%sh → %s', (h, esperado) => {
    const hora = Math.floor(h);
    expect(saudacaoPara(as(hora, h % 1 ? 59 : 0))).toBe(esperado);
  });
  it('limites exatos: 5h59 é noite, 6h00 é dia, 11h59 é dia, 12h00 é tarde, 17h59 é tarde, 18h00 é noite', () => {
    expect(saudacaoPara(as(5, 59))).toBe('Boa noite');
    expect(saudacaoPara(as(6, 0))).toBe('Bom dia');
    expect(saudacaoPara(as(11, 59))).toBe('Bom dia');
    expect(saudacaoPara(as(12, 0))).toBe('Boa tarde');
    expect(saudacaoPara(as(17, 59))).toBe('Boa tarde');
    expect(saudacaoPara(as(18, 0))).toBe('Boa noite');
  });
});
