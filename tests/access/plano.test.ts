import { describe, expect, it, vi } from 'vitest';
import { canAccess } from '@/lib/access/canAccess';
import { planoEfetivo } from '@/lib/access/plano';
import { FERRAMENTAS_GRATUITAS } from '@/lib/access/plans';
import { porSlug } from '@/lib/tools/catalogo';

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

describe('canAccess (bloqueio ligado)', () => {
  it('a lista de ferramentas gratuitas é exatamente a combinada', () => {
    expect([...FERRAMENTAS_GRATUITAS].sort()).toEqual(['ckd-epi-2021', 'clearance-de-creatinina-ped', 'cockcroft-gault', 'conversor-de-unidades-laboratoriais', 'hipercalemia-potassio', 'imc']);
  });
  it('toda ferramenta gratuita existe no catálogo', () => {
    for (const slug of FERRAMENTAS_GRATUITAS) expect(porSlug(slug), slug).toBeDefined();
  });
  it('gratuitas: liberadas para qualquer plano', () => {
    for (const slug of FERRAMENTAS_GRATUITAS) for (const plano of ['free', 'beta', 'premium'] as const) expect(canAccess(slug, plano)).toBe(true);
  });
  it('as demais: só beta e premium', () => {
    expect(canAccess('ajuste-de-dose', 'free')).toBe(false);
    expect(canAccess('ajuste-de-dose')).toBe(false); // visitante = free
    expect(canAccess('ajuste-de-dose', 'beta')).toBe(true);
    expect(canAccess('ajuste-de-dose', 'premium')).toBe(true);
  });
  it('com o bloqueio desligado, tudo fica livre', async () => {
    vi.resetModules();
    vi.doMock('@/lib/access/plans', async (original) => ({ ...(await original<typeof import('@/lib/access/plans')>()), PREMIUM_ENABLED: false }));
    const { canAccess: livre } = await import('@/lib/access/canAccess');
    expect(livre('ajuste-de-dose', 'free')).toBe(true);
    vi.doUnmock('@/lib/access/plans');
  });
});
