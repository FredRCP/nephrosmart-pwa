// ─── Plano gratuito × premium do NephroSmart ─────────────────────────────────
// PREMIUM_ENABLED liga o bloqueio: com false, todas as ferramentas ficam livres para todos.
export const PREMIUM_ENABLED = true;

// Mesmos planos do app antigo: beta (testadores, com validade), free e premium.
export type PlanType = 'beta' | 'free' | 'premium';

export const PLANS: Record<PlanType, { label: string; allTools: boolean }> = {
  beta: { label: 'Beta', allTools: true },
  free: { label: 'Gratuito', allTools: false },
  premium: { label: 'Premium', allTools: true },
};

// Ferramentas LIVRES (sem login e sem pagar), pelos slugs do catálogo. Todas as outras são Premium.
// Aviso honesto: como o app funciona offline, o código das calculadoras vai para o aparelho; o bloqueio é
// "de cortesia". O que precisa de proteção real (a base do Ajuste de Dose) será servido só a assinantes.
export const FERRAMENTAS_GRATUITAS: readonly string[] = ['ckd-epi-2021', 'clearance-de-creatinina-ped', 'cockcroft-gault', 'hipercalemia-potassio', 'imc'];

export const eGratuita = (slug: string): boolean => FERRAMENTAS_GRATUITAS.includes(slug);
