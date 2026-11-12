// Ferramentas em validação: ficam no código, mas só os administradores as veem (menu, busca e endereço direto).
// Para liberar a todos, tire o slug da lista.
export const SLUGS_RESTRITOS: readonly string[] = ['equivalencia-de-diureticos', 'nefrolitiase', 'injuria-renal-aguda-ira', 'intoxicacoes-exogenas', 'vacinas-drc', 'vacinas-adultos', 'anemia-drc-dialise'];

export const EMAILS_ADMIN: readonly string[] = ['fredrcpmed@gmail.com'];

export const eRestrita = (slug: string): boolean => SLUGS_RESTRITOS.includes(slug);

export const eAdmin = (email: string | null | undefined): boolean =>
  !!email && EMAILS_ADMIN.includes(email.trim().toLowerCase());

/** Aviso: isto esconde a ferramenta na interface; o código continua no pacote do app (como o bloqueio Premium de cortesia). */
export const podeVer = (slug: string, email: string | null | undefined): boolean => !eRestrita(slug) || eAdmin(email);
