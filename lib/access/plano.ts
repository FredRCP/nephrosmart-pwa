import type { PlanType } from './plans';

/** Colunas de `public.profiles` usadas para decidir o acesso. */
export interface PerfilAcesso {
  plano: PlanType;
  ativo: boolean;
  beta_expira: string | null; // 'AAAA-MM-DD'
}

/**
 * Plano que vale HOJE. Mesma regra do app antigo (useUserAccess.ts):
 * conta ainda não liberada (ativo = false) ou beta vencido → free.
 * O beta vale até o fim do dia indicado em beta_expira.
 */
export function planoEfetivo(perfil: PerfilAcesso | null, hoje: Date = new Date()): PlanType {
  if (!perfil || !perfil.ativo) return 'free';
  if (perfil.plano === 'beta' && perfil.beta_expira) {
    const fim = new Date(`${perfil.beta_expira}T23:59:59`);
    if (hoje > fim) return 'free';
  }
  return perfil.plano;
}
