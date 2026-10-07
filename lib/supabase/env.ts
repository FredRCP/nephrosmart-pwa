// Next só injeta variáveis NEXT_PUBLIC_* quando acessadas de forma literal.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// O NephroSmart tem projeto Supabase PRÓPRIO (supabase/migrations/0001_base.sql): usa o schema padrão.
export const SUPABASE_SCHEMA = 'public';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
