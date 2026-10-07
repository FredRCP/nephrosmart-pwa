/**
 * Só aceita caminhos INTERNOS do app como destino após o login/confirmação de e-mail.
 * Bloqueia "https://outro-site", "//outro-site" e "/\outro-site" (redirecionamento aberto, usado em golpes).
 */
export function caminhoSeguro(destino: string | null | undefined, padrao = '/conta'): string {
  if (!destino) return padrao;
  if (!destino.startsWith('/')) return padrao;
  if (destino.startsWith('//') || destino.startsWith('/\\')) return padrao;
  if (/[\u0000-\u001f]/.test(destino)) return padrao;
  return destino;
}
