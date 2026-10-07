import { describe, expect, it } from 'vitest';
import { canAccess } from '@/lib/access/canAccess';
import { planoEfetivo } from '@/lib/access/plano';

const dia = (iso: string) => new Date(`${iso}T12:00:00`);

describe('plano efetivo (mesma regra do app antigo)', () => {
  it('sem perfil, ou conta ainda não liberada → free', () => {
    expect(planoEfetivo(null)).toBe('free');
    expect(planoEfetivo({ plano: 'premium', ativo: false, beta_expira: null })).toBe('free');
  });
  it('conta liberada mantém o plano', () => {
    expect(planoEfetivo({ plano: 'premium', ativo: true, beta_expira: null })).toBe('premium');
    expect(planoEfetivo({ plano: 'free', ativo: true, beta_expira: null })).toBe('free');
  });
  it('beta vale até o fim do dia de validade e depois vira free', () => {
    const beta = { plano: 'beta' as const, ativo: true, beta_expira: '2026-12-31' };
    expect(planoEfetivo(beta, dia('2026-10-07'))).toBe('beta');
    expect(planoEfetivo(beta, new Date('2026-12-31T23:00:00'))).toBe('beta');
    expect(planoEfetivo(beta, dia('2027-01-01'))).toBe('free');
  });
  it('beta sem validade não expira', () => {
    expect(planoEfetivo({ plano: 'beta', ativo: true, beta_expira: null }, dia('2030-01-01'))).toBe('beta');
  });
});

describe('canAccess com paywall ligado (PREMIUM_ENABLED = false hoje: tudo liberado)', () => {
  it('com o paywall desligado, qualquer plano acessa', () => {
    expect(canAccess('qualquer-ferramenta', 'free')).toBe(true);
  });
});
