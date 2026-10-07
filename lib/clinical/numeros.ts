/**
 * Igual ao `normalizeInput` do app original (ClearanceForm.tsx):
 * troca a PRIMEIRA vírgula por ponto, apara espaços e prefixa "0" se começar com ".".
 */
export function normalizarNumero(texto: string): string {
  let n = texto.replace(',', '.').trim();
  if (n.startsWith('.')) n = '0' + n;
  return n;
}
