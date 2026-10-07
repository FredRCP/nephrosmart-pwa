// Traduz erros do Supabase Auth para mensagens claras em português (sem revelar detalhes internos).
interface ErroAuth { code?: string; message?: string; status?: number }

export function mensagemDeErro(erro: ErroAuth | null | undefined): string {
  if (!erro) return '';
  const codigo = erro.code ?? '';
  const texto = (erro.message ?? '').toLowerCase();
  if (codigo === 'invalid_credentials' || texto.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (codigo === 'email_not_confirmed' || texto.includes('email not confirmed'))
    return 'Confirme seu e-mail antes de entrar: procure a mensagem de confirmação na sua caixa de entrada (e no spam).';
  if (codigo === 'weak_password') return 'Essa senha é fraca demais. Use uma senha mais longa e menos previsível.';
  if (codigo === 'same_password') return 'A nova senha precisa ser diferente da anterior.';
  if (codigo === 'over_request_rate_limit' || codigo === 'over_email_send_rate_limit' || erro.status === 429)
    return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.';
  if (codigo === 'signup_disabled') return 'Novos cadastros estão temporariamente fechados.';
  if (texto.includes('failed to fetch') || texto.includes('network')) return 'Sem conexão com o servidor. Verifique a internet e tente de novo.';
  return 'Não foi possível concluir agora. Tente novamente em instantes.';
}
