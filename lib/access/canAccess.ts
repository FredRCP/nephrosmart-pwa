import { eGratuita, PLANS, PREMIUM_ENABLED, type PlanType } from './plans';

/**
 * Pode usar esta ferramenta? Livre se o bloqueio estiver desligado, se a ferramenta for gratuita
 * ou se o plano (premium/beta) libera tudo. Visitantes e plano free só acessam as gratuitas.
 */
export function canAccess(toolKey: string, userPlan: PlanType = 'free'): boolean {
  if (!PREMIUM_ENABLED) return true;
  if (PLANS[userPlan].allTools) return true;
  return eGratuita(toolKey);
}
