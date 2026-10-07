import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_KEY, SUPABASE_URL, isSupabaseConfigured } from '@/lib/supabase/env';

const LIMITE_MS = 2500;

/** Espera a promessa, mas desiste depois do limite: o site não pode ficar lento por causa do login. */
async function comLimite<T>(promessa: Promise<T>, ms: number): Promise<void> {
  let relogio: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([promessa, new Promise<void>((resolve) => { relogio = setTimeout(resolve, ms); })]);
  } finally {
    if (relogio) clearTimeout(relogio);
  }
}

// Renova a sessão do Supabase a cada request.
// REGRA: nada aqui pode derrubar o site. Sem configuração, com valor inválido, com o Supabase fora do ar
// ou lento, a página segue normalmente (as ferramentas gratuitas nem dependem do login).
export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.next();

  let response = NextResponse.next({ request });
  try {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    await comLimite(supabase.auth.getUser(), LIMITE_MS);
  } catch (erro) {
    console.error('proxy: não foi possível renovar a sessão (o site segue funcionando):', erro instanceof Error ? erro.message : 'erro desconhecido');
    return NextResponse.next();
  }
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|serwist|sw\\.js|manifest\\.webmanifest|favicon\\.ico|icons|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)',
  ],
};
