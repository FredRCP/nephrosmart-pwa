import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_KEY, SUPABASE_SCHEMA, SUPABASE_URL } from './env';

// Cliente para componentes 'use client'.
// Usa o schema isolado 'nefrosmart' do projeto "produção médica".
export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
      'Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local'
    );
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY, {
    db: { schema: SUPABASE_SCHEMA },
  });
}
