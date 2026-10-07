import { PLANS, PREMIUM_ENABLED, PREMIUM_ONLY_TOOLS, PlanType } from './plans';

/**
 * Verifica se o usuário pode acessar uma determinada ferramenta/calculadora.
 * Enquanto PREMIUM_ENABLED for false, libera acesso total (uso interno HC-UFTM).
 */
export function canAccess(toolKey: string, userPlan: PlanType = 'free'): boolean {
  if (!PREMIUM_ENABLED) return true;
  if (PLANS[userPlan].allTools) return true; // premium e beta (no app antigo, beta = acesso total)
  return !PREMIUM_ONLY_TOOLS.includes(toolKey);
}
