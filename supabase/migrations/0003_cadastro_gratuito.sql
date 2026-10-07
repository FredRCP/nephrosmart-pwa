-- ═══════════════════════════════════════════════════════════════════════════
-- 0003 — modelo freemium: o cadastro novo nasce ATIVO com plano gratuito.
-- Daqui em diante, "ativo = false" significa CONTA SUSPENSA (bloqueio manual).
-- O plano (beta/premium) continua só alterável por você, pelo painel (colunas protegidas no 0001).
-- Contas criadas ANTES desta migração não mudam. Se quiser ativá-las:
--   update public.profiles set ativo = true where not ativo;
-- ═══════════════════════════════════════════════════════════════════════════
alter table public.profiles alter column ativo set default true;
