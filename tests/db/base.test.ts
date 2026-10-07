// Testa as REGRAS DE SEGURANÇA do banco (supabase/migrations/0001_base.sql) num Postgres de verdade (PGlite),
// com usuários simulados. Se alguém afrouxar uma regra por engano, estes testes reprovam.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';

const A = '11111111-1111-1111-1111-111111111111';
const B = '22222222-2222-2222-2222-222222222222';
let db: PGlite;

async function como(uid: string | null, papel: 'anon' | 'authenticated', sql: string) {
  await db.exec(`set role ${papel}; select set_config('request.jwt.claim.sub', '${uid ?? ''}', false)`);
  try { return { rows: (await db.query(sql)).rows as Record<string, unknown>[] }; }
  catch (e) { return { erro: String((e as Error).message) }; }
  finally { await db.exec('reset role'); }
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(readFileSync('tests/db/stub-supabase.sql', 'utf-8'));
  await db.exec(readFileSync('supabase/migrations/0001_base.sql', 'utf-8'));
  await db.exec(`insert into auth.users(id, email, raw_user_meta_data) values
    ('${A}', 'a@exemplo.com', '{"nome":"Ana"}'), ('${B}', 'b@exemplo.com', '{}');`);
}, 60_000);

describe('perfil e plano', () => {
  it('cadastro novo cria perfil automático: plano free e ativo = false (precisa ser liberado)', async () => {
    const r = await db.query<{ plano: string; ativo: boolean; nome: string | null }>(`select plano, ativo, nome from public.profiles where id = '${A}'`);
    expect(r.rows[0]).toEqual({ plano: 'free', ativo: false, nome: 'Ana' });
  });
  it('cada usuário lê só o próprio perfil', async () => {
    const r = await como(A, 'authenticated', 'select id from public.profiles');
    expect(r.rows?.map((x) => x.id)).toEqual([A]);
  });
  it('visitante sem login não lê perfis', async () => {
    const r = await como(null, 'anon', 'select id from public.profiles');
    expect(r.erro).toMatch(/permission denied/);
  });
  it('o usuário consegue mudar o próprio nome', async () => {
    const r = await como(A, 'authenticated', `update public.profiles set nome = 'Ana Maria' where id = '${A}' returning nome`);
    expect(r.rows?.[0]?.nome).toBe('Ana Maria');
  });
  it('o usuário NÃO consegue se promover: plano, ativo e validade são bloqueados', async () => {
    for (const col of ["plano = 'premium'", 'ativo = true', "beta_expira = '2099-12-31'"]) {
      const r = await como(A, 'authenticated', `update public.profiles set ${col} where id = '${A}'`);
      expect(r.erro, col).toMatch(/permission denied/);
    }
    const r = await db.query<{ plano: string; ativo: boolean }>(`select plano, ativo from public.profiles where id = '${A}'`);
    expect(r.rows[0]).toEqual({ plano: 'free', ativo: false });
  });
  it('o usuário NÃO consegue editar o perfil de outra pessoa', async () => {
    const r = await como(A, 'authenticated', `update public.profiles set nome = 'invadido' where id = '${B}' returning id`);
    expect(r.rows).toEqual([]);
  });
  it('o usuário NÃO consegue criar nem apagar perfis pela API', async () => {
    expect((await como(A, 'authenticated', `insert into public.profiles(id) values (gen_random_uuid())`)).erro).toMatch(/permission denied/);
    expect((await como(A, 'authenticated', 'delete from public.profiles')).erro).toMatch(/permission denied/);
  });
});

describe('aceite de termos', () => {
  it('registra o próprio aceite e vê só os seus', async () => {
    const ok = await como(A, 'authenticated', `insert into public.aceites_termos(user_id, versao_termos, versao_privacidade) values ('${A}', '2026-03-11', '2026-03-12') returning id`);
    expect(ok.rows?.length).toBe(1);
    const vistos = await como(B, 'authenticated', 'select * from public.aceites_termos');
    expect(vistos.rows).toEqual([]);
  });
  it('não registra aceite em nome de outra pessoa', async () => {
    const r = await como(A, 'authenticated', `insert into public.aceites_termos(user_id, versao_termos, versao_privacidade) values ('${B}', 'x', 'y')`);
    expect(r.erro).toMatch(/row-level security/);
  });
  it('visitante sem login não registra aceite', async () => {
    const r = await como(null, 'anon', `insert into public.aceites_termos(user_id, versao_termos, versao_privacidade) values ('${A}', 'x', 'y')`);
    expect(r.erro).toMatch(/permission denied/);
  });
});

describe('uso anônimo das ferramentas', () => {
  it('visitante sem login registra uso', async () => {
    const r = await como(null, 'anon', `insert into public.eventos_uso(evento, ferramenta, plataforma) values ('ferramenta_aberta', 'imc', 'pwa-ios')`);
    expect(r.erro).toBeUndefined();
  });
  it('NINGUÉM lê o uso pela API (nem logado, nem anônimo)', async () => {
    expect((await como(A, 'authenticated', 'select * from public.eventos_uso')).erro).toMatch(/permission denied/);
    expect((await como(null, 'anon', 'select * from public.eventos_uso')).erro).toMatch(/permission denied/);
  });
  it('a tabela não tem coluna de e-mail nem de valor clínico', async () => {
    const r = await db.query<{ column_name: string }>(`select column_name from information_schema.columns where table_name = 'eventos_uso' order by 1`);
    expect(r.rows.map((x) => x.column_name)).toEqual(['criado_em', 'evento', 'ferramenta', 'id', 'instalacao_id', 'plataforma', 'versao_app']);
  });
  it('recusa textos enormes (anti-abuso) e plataformas inventadas', async () => {
    expect((await como(null, 'anon', `insert into public.eventos_uso(evento) values (repeat('x', 500))`)).erro).toMatch(/check constraint/);
    expect((await como(null, 'anon', `insert into public.eventos_uso(evento, plataforma) values ('a', 'outra')`)).erro).toMatch(/check constraint/);
  });
});

describe('exclusão de conta', () => {
  it('visitante sem login não consegue executar', async () => {
    expect((await como(null, 'anon', 'select public.excluir_minha_conta()')).erro).toMatch(/permission denied/);
  });
  it('apaga SÓ a própria conta, com perfil e aceites; a outra pessoa permanece', async () => {
    const r = await como(A, 'authenticated', 'select public.excluir_minha_conta()');
    expect(r.erro).toBeUndefined();
    const usuarios = await db.query<{ id: string }>('select id from auth.users order by 1');
    expect(usuarios.rows.map((x) => x.id)).toEqual([B]);
    expect((await db.query('select 1 from public.profiles where id = $1', [A])).rows).toEqual([]);
    expect((await db.query('select 1 from public.aceites_termos where user_id = $1', [A])).rows).toEqual([]);
    expect((await db.query('select 1 from public.profiles where id = $1', [B])).rows.length).toBe(1);
  });
});
