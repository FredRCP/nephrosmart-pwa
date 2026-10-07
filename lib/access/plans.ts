// ─── Flags de feature do NephroSmart PWA ─────────────────────────────────────
// Para ativar o paywall/premium no futuro, basta mudar PREMIUM_ENABLED para true.
// Enquanto false, canAccess() sempre libera acesso total pra todo mundo.

export const PREMIUM_ENABLED = false;

// Mesmos planos do app antigo: beta (todos os testadores, com validade), free e premium.
export type PlanType = 'beta' | 'free' | 'premium';

export const PLANS: Record<PlanType, { label: string; allTools: boolean }> = {
  beta: { label: 'Beta', allTools: true },
  free: { label: 'Gratuito', allTools: false },
  premium: { label: 'Premium', allTools: true },
};

// Lista de ferramentas consideradas "premium" quando o paywall estiver ativo.
// Preencha aqui quando for ativar (ex: nomes de rota das calculadoras).
export const PREMIUM_ONLY_TOOLS: string[] = [];
