import { NextResponse, type NextRequest } from 'next/server';
import { caminhoSeguro } from '@/lib/auth/caminho';
import { createClient } from '@/lib/supabase/server';

// Destino dos links enviados por e-mail (confirmação de cadastro e recuperação de senha).
// Troca o código de uso único por uma sessão e leva a pessoa a um caminho INTERNO do app.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const destino = caminhoSeguro(searchParams.get('next'));

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${destino}`);
    } catch {
      // erro inesperado (rede, configuração): cai no aviso abaixo, em vez de mostrar uma tela de erro
    }
  }
  return NextResponse.redirect(`${origin}/entrar?erro=link`);
}
