// 0003: cadastro novo nasce ativo e gratuito, sem abrir nenhuma brecha de promoção.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';

let db: PGlite;
const ANTIGO = '11111111-1111-1111-1111-111111111111';
const NOVO = '22222222-2222-2222-2222-222222222222';

async function comoUsuario(uid: string, sql: string) {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${uid}', false)`);
  try { return { rows: (await db.query(sql)).rows as Record<string, unknown>[] }; }
  catch (e) { return { erro: String((e as Error).message) }; }
  finally { await db.exec('reset role'); }
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(readFileSync('tests/db/stub-supabase.sql', 'utf-8'));
  await db.exec(readFileSync('supabase/migrations/0001_base.sql', 'utf-8'));
  await db.exec(readFileSync('supabase/migrations/0002_aceite_no_cadastro.sql', 'utf-8'));
  await db.exec(`insert into auth.users(id, email) values ('${ANTIGO}', 'antigo@exemplo.com')`); // criado ANTES do 0003
  await db.exec(readFileSync('supabase/migrations/0003_cadastro_gratuito.sql', 'utf-8'));
  await db.exec(`insert into auth.users(id, email) values ('${NOVO}', 'novo@exemplo.com')`);
}, 60_000);

describe('0003 — cadastro gratuito', () => {
  it('cadastro novo nasce ativo e com plano free', async () => {
    const r = await db.query<{ plano: string; ativo: boolean }>(`select plano, ativo from public.profiles where id = '${NOVO}'`);
    expect(r.rows[0]).toEqual({ plano: 'free', ativo: true });
  });
  it('conta criada antes da migração NÃO é alterada', async () => {
    const r = await db.query<{ ativo: boolean }>(`select ativo from public.profiles where id = '${ANTIGO}'`);
    expect(r.rows[0].ativo).toBe(false);
  });
  it('o novo usuário continua sem conseguir se promover nem se reativar', async () => {
    for (const col of ["plano = 'premium'", "plano = 'beta'", 'ativo = true', 'ativo = false', "beta_expira = '2099-12-31'"]) {
      const r = await comoUsuario(NOVO, `update public.profiles set ${col} where id = '${NOVO}'`);
      expect(r.erro, col).toMatch(/permission denied/);
    }
  });
  it('só o administrador promove: o comando do 05 funciona e o usuário passa a ter o plano', async () => {
    await db.exec(`update public.profiles set plano = 'premium' where id = (select id from auth.users where email = 'novo@exemplo.com')`);
    const r = await comoUsuario(NOVO, `select plano from public.profiles where id = '${NOVO}'`);
    expect(r.rows?.[0]?.plano).toBe('premium');
  });
});
