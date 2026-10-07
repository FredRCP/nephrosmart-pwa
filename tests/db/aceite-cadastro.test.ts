// 0002: o aceite dos Termos é gravado no cadastro, e as permissões continuam fechadas.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';

let db: PGlite;
const U1 = '11111111-1111-1111-1111-111111111111';
const U2 = '22222222-2222-2222-2222-222222222222';
const U3 = '33333333-3333-3333-3333-333333333333';

beforeAll(async () => {
  db = new PGlite();
  await db.exec(readFileSync('tests/db/stub-supabase.sql', 'utf-8'));
  await db.exec(readFileSync('supabase/migrations/0001_base.sql', 'utf-8'));
  await db.exec(readFileSync('supabase/migrations/0002_aceite_no_cadastro.sql', 'utf-8'));
  await db.exec(`insert into auth.users(id, email, raw_user_meta_data) values
    ('${U1}', 'a@exemplo.com', '{"nome":"Ana","versao_termos":"2026-03-11","versao_privacidade":"2026-03-12"}'),
    ('${U2}', 'b@exemplo.com', '{"nome":"Bia"}'),
    ('${U3}', 'c@exemplo.com', '{"versao_termos":"${'x'.repeat(100)}","versao_privacidade":"y"}');`);
}, 60_000);

describe('0002 — aceite no cadastro', () => {
  it('cadastro com versões grava o aceite com as versões informadas', async () => {
    const r = await db.query<{ versao_termos: string; versao_privacidade: string }>(`select versao_termos, versao_privacidade from public.aceites_termos where user_id = '${U1}'`);
    expect(r.rows).toEqual([{ versao_termos: '2026-03-11', versao_privacidade: '2026-03-12' }]);
  });
  it('cadastro sem as versões não grava aceite (mas o perfil é criado)', async () => {
    expect((await db.query(`select 1 from public.aceites_termos where user_id = '${U2}'`)).rows).toEqual([]);
    const p = await db.query<{ nome: string; ativo: boolean }>(`select nome, ativo from public.profiles where id = '${U2}'`);
    expect(p.rows[0]).toEqual({ nome: 'Bia', ativo: false });
  });
  it('texto gigante nas versões é cortado em 40 caracteres e o cadastro não falha', async () => {
    const r = await db.query<{ n: number }>(`select char_length(versao_termos) as n from public.aceites_termos where user_id = '${U3}'`);
    expect(r.rows[0].n).toBe(40);
  });
  it('a função do cadastro continua NÃO chamável pela API', async () => {
    const r = await db.query<{ anon: boolean; logado: boolean }>(`select
      has_function_privilege('anon', 'public.novo_usuario()', 'execute') as anon,
      has_function_privilege('authenticated', 'public.novo_usuario()', 'execute') as logado`);
    expect(r.rows[0]).toEqual({ anon: false, logado: false });
  });
});
