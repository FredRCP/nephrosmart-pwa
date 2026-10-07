-- ═══════════════════════════════════════════════════════════════════════════
-- 0002 — registra o aceite dos Termos e da Política NO MOMENTO DO CADASTRO.
-- O app envia as versões aceitas junto do cadastro (campos versao_termos e versao_privacidade);
-- o gatilho guarda o aceite com a data do servidor. Rodar depois do 0001, no mesmo projeto.
-- (create or replace mantém as permissões já restritas da função.)
-- ═══════════════════════════════════════════════════════════════════════════
create or replace function public.novo_usuario() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, nullif(left(new.raw_user_meta_data ->> 'nome', 120), ''));

  if nullif(new.raw_user_meta_data ->> 'versao_termos', '') is not null
     and nullif(new.raw_user_meta_data ->> 'versao_privacidade', '') is not null then
    insert into public.aceites_termos (user_id, versao_termos, versao_privacidade)
    values (new.id,
            left(new.raw_user_meta_data ->> 'versao_termos', 40),
            left(new.raw_user_meta_data ->> 'versao_privacidade', 40));
  end if;
  return new;
end $$;
