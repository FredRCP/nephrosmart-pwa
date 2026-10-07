// Leitura das variáveis do Supabase. Next só injeta NEXT_PUBLIC_* quando acessadas de forma literal.
const bruta = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  chave: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

/** Tira espaços, quebras de linha e aspas que costumam vir junto ao colar o valor (ex.: "https://xxx.supabase.co"). */
const limpar = (v: string | undefined): string => (v ?? '').trim().replace(/^["']+|["']+$/g, '').trim();

function urlValida(v: string): boolean {
  if (!/^https?:\/\//i.test(v)) return false;
  try { new URL(v); return true; } catch { return false; }
}

const url = limpar(bruta.url);
const chave = limpar(bruta.chave);

export type DiagnosticoSupabase = 'ok' | 'sem-variaveis' | 'url-invalida' | 'chave-ausente';

/** Diz o que está errado SEM mostrar nenhum valor. */
export const DIAGNOSTICO_SUPABASE: DiagnosticoSupabase =
  !url && !chave ? 'sem-variaveis' : !urlValida(url) ? 'url-invalida' : !chave ? 'chave-ausente' : 'ok';

export const SUPABASE_URL: string = DIAGNOSTICO_SUPABASE === 'ok' ? url : '';
export const SUPABASE_KEY: string = DIAGNOSTICO_SUPABASE === 'ok' ? chave : '';

// O NephroSmart tem projeto Supabase PRÓPRIO (supabase/migrations/0001_base.sql): usa o schema padrão.
export const SUPABASE_SCHEMA = 'public';

/** Valor inválido ou ausente = login desligado; o site e as ferramentas continuam funcionando. */
export const isSupabaseConfigured = DIAGNOSTICO_SUPABASE === 'ok';
