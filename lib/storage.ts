// Acesso seguro ao localStorage (pode falhar em modo privado / armazenamento cheio).
// Só guarda PREFERÊNCIAS e últimos valores calculados — nunca dado identificável de paciente.
export function lerLocal(chave: string): string | null {
  try { return window.localStorage.getItem(chave); } catch { return null; }
}
export function gravarLocal(chave: string, valor: string): void {
  try { window.localStorage.setItem(chave, valor); } catch { /* sem armazenamento: segue sem salvar */ }
}
export function lerJson<T>(chave: string, padrao: T): T {
  const bruto = lerLocal(chave);
  if (!bruto) return padrao;
  try { return JSON.parse(bruto) as T; } catch { return padrao; }
}
