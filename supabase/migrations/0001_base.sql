-- ═══════════════════════════════════════════════════════════════════════════
-- NephroSmart — base do projeto Supabase PRÓPRIO do NephroSmart
-- Rodar no SQL Editor do projeto novo (ou com `supabase db push`).
-- Este projeto NÃO guarda dado de paciente: só conta, plano, aceite de termos e uso anônimo.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Perfil e plano ────────────────────────────────────────────────────────
-- Todo cadastro novo nasce com ativo = false: só entra no app depois de liberado por você
-- (convite/aprovação), como no app antigo ("Acesso não autorizado" até liberar).
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nome        text check (char_length(nome) <= 120),
  plano       text not null default 'free' check (plano in ('beta', 'free', 'premium')),
  ativo       boolean not null default false,
  beta_expira date,
  criado_em   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "usuário lê o próprio perfil" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "usuário edita o próprio perfil" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- O usuário só pode alterar o NOME. Plano, ativo e validade do beta só pelo painel (ou service_role).
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (nome) on public.profiles to authenticated;

-- Cria o perfil automaticamente quando alguém se cadastra
create function public.novo_usuario() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, nome) values (new.id, nullif(left(new.raw_user_meta_data ->> 'nome', 120), ''));
  return new;
end $$;
revoke execute on function public.novo_usuario() from public, anon, authenticated;

create trigger ao_criar_usuario after insert on auth.users
  for each row execute function public.novo_usuario();

-- ─── Aceite de Termos e Política (com versão) ──────────────────────────────
create table public.aceites_termos (
  id                 bigint generated always as identity primary key,
  user_id            uuid not null references auth.users(id) on delete cascade,
  versao_termos      text not null check (char_length(versao_termos) <= 40),
  versao_privacidade text not null check (char_length(versao_privacidade) <= 40),
  aceito_em          timestamptz not null default now()
);

alter table public.aceites_termos enable row level security;

create policy "usuário vê os próprios aceites" on public.aceites_termos
  for select to authenticated using (user_id = (select auth.uid()));
create policy "usuário registra o próprio aceite" on public.aceites_termos
  for insert to authenticated with check (user_id = (select auth.uid()));

revoke all on public.aceites_termos from anon, authenticated;
grant select, insert on public.aceites_termos to authenticated;

-- ─── Uso das ferramentas (ANÔNIMO) ─────────────────────────────────────────
-- Sem e-mail, sem conta e sem valores clínicos. `instalacao_id` é um número aleatório gerado no aparelho.
-- Qualquer visitante pode registrar; ninguém pode ler pela API (você lê pelo painel do Supabase).
create table public.eventos_uso (
  id            bigint generated always as identity primary key,
  criado_em     timestamptz not null default now(),
  evento        text not null check (char_length(evento) <= 40),
  ferramenta    text check (char_length(ferramenta) <= 80),
  instalacao_id uuid,
  plataforma    text check (plataforma in ('web', 'pwa-android', 'pwa-ios', 'desktop')),
  versao_app    text check (char_length(versao_app) <= 20)
);

alter table public.eventos_uso enable row level security;

create policy "qualquer visitante registra uso" on public.eventos_uso
  for insert to anon, authenticated with check (true);

revoke all on public.eventos_uso from anon, authenticated;
grant insert on public.eventos_uso to anon, authenticated;

-- ─── Exclusão de conta (exigência da loja e da LGPD) ───────────────────────
-- Apaga o usuário; perfil e aceites saem junto (on delete cascade).
create function public.excluir_minha_conta() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null then
    raise exception 'não autenticado';
  end if;
  delete from auth.users where id = (select auth.uid());
end $$;
revoke execute on function public.excluir_minha_conta() from public, anon;
grant execute on function public.excluir_minha_conta() to authenticated;
