import { afterEach, describe, expect, it, vi } from 'vitest';

async function carregar(url?: string, chave?: string, publicavel?: string) {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', url ?? '');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', chave ?? '');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', publicavel ?? '');
  return import('@/lib/supabase/env');
}
afterEach(() => vi.unstubAllEnvs());

describe('variáveis do Supabase', () => {
  it('valores corretos: configurado', async () => {
    const e = await carregar('https://abc.supabase.co', 'chave-publica');
    expect(e.isSupabaseConfigured).toBe(true);
    expect(e.DIAGNOSTICO_SUPABASE).toBe('ok');
    expect(e.SUPABASE_URL).toBe('https://abc.supabase.co');
  });
  it('sem variáveis: desligado, sem erro', async () => {
    const e = await carregar();
    expect(e.isSupabaseConfigured).toBe(false);
    expect(e.DIAGNOSTICO_SUPABASE).toBe('sem-variaveis');
  });
  it('URL sem https:// (o erro que derrubou o site): desligado, nunca exposto ao cliente do Supabase', async () => {
    const e = await carregar('abc.supabase.co', 'chave-publica');
    expect(e.isSupabaseConfigured).toBe(false);
    expect(e.DIAGNOSTICO_SUPABASE).toBe('url-invalida');
    expect(e.SUPABASE_URL).toBe('');
  });
  it('URL entre aspas, com espaços ou quebra de linha: é corrigida automaticamente', async () => {
    for (const bruta of ['"https://abc.supabase.co"', "'https://abc.supabase.co'", '  https://abc.supabase.co\n', '"https://abc.supabase.co"\r\n']) {
      const e = await carregar(bruta, ' "chave-publica" \n');
      expect(e.SUPABASE_URL, JSON.stringify(bruta)).toBe('https://abc.supabase.co');
      expect(e.SUPABASE_KEY).toBe('chave-publica');
      expect(e.isSupabaseConfigured).toBe(true);
    }
  });
  it('lixo no lugar da URL (a chave colada no campo errado, texto qualquer)', async () => {
    for (const lixo of ['eyJhbGciOiJIUzI1NiJ9.x.y', 'production', 'https://', 'https:// abc', 'ftp://abc.supabase.co', 'javascript:alert(1)', 'abc:123']) {
      expect((await carregar(lixo, 'chave')).isSupabaseConfigured, lixo).toBe(false);
    }
  });
  it('falta a chave', async () => {
    const e = await carregar('https://abc.supabase.co', '');
    expect(e.isSupabaseConfigured).toBe(false);
    expect(e.DIAGNOSTICO_SUPABASE).toBe('chave-ausente');
  });
  it('aceita http local (Supabase em desenvolvimento) e prefere a chave "publishable" quando as duas existem', async () => {
    const e = await carregar('http://127.0.0.1:54321', 'anon', 'sb_publishable_xyz');
    expect(e.isSupabaseConfigured).toBe(true);
    expect(e.SUPABASE_KEY).toBe('sb_publishable_xyz');
  });
  it('"publishable" vazia cai para a "anon"', async () => {
    expect((await carregar('https://abc.supabase.co', 'anon', '')).SUPABASE_KEY).toBe('anon');
  });
});
