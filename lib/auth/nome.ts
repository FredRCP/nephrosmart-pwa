/** Primeiro nome para a saudação: usa o nome do perfil; sem nome, usa a parte do e-mail antes do "@". */
export function primeiroNome(nome: string | null | undefined, email: string | null | undefined): string {
  const bruto = (nome ?? '').trim().split(/\s+/)[0] || (email ?? '').split('@')[0] || '';
  if (!bruto) return '';
  return bruto.charAt(0).toUpperCase() + bruto.slice(1);
}
