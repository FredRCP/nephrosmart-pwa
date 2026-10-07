export const SENHA_MINIMA = 8;

/** Validação simples de formato (a confirmação real é o e-mail enviado pelo Supabase). */
export function emailValido(email: string): boolean {
  const e = email.trim();
  return e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

export function validarSenha(senha: string, email = ''): string | null {
  if (senha.length < SENHA_MINIMA) return `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`;
  if (email && senha.toLowerCase() === email.trim().toLowerCase()) return 'A senha não pode ser igual ao e-mail.';
  return null;
}

export interface DadosCadastro { nome: string; email: string; senha: string; confirmacao: string; aceite: boolean }

/** Primeiro problema encontrado no formulário de cadastro, ou null se estiver tudo certo. */
export function validarCadastro(d: DadosCadastro): string | null {
  if (!emailValido(d.email)) return 'Informe um e-mail válido.';
  const senha = validarSenha(d.senha, d.email);
  if (senha) return senha;
  if (d.senha !== d.confirmacao) return 'A confirmação da senha não confere.';
  if (d.nome.trim().length > 120) return 'O nome pode ter no máximo 120 caracteres.';
  if (!d.aceite) return 'Para criar a conta, aceite os Termos de Uso e a Política de Privacidade.';
  return null;
}
