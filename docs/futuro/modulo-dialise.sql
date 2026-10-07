-- ═══════════════════════════════════════════════════════════════════════════
-- ARQUIVO PARA O FUTURO — NÃO RODAR NO PROJETO DO NEPHROSMART.
-- Esboço do módulo de avaliação mensal de diálise (Fase 2 da Chatiane). Ele guarda DADO DE PACIENTE,
-- então precisa de um ambiente próprio (projeto Supabase separado, plano pago com backups, RLS revisada
-- e testes), nunca junto das contas do NephroSmart. Os nomes de schema abaixo ainda são os do esboço.
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════
-- NefroSmart 2.0 — Schema inicial do módulo de avaliação mensal de diálise
-- Rodar no SQL Editor do projeto Supabase "produção médica"
-- Pré-requisito: CREATE SCHEMA IF NOT EXISTS nefrosmart; (já executado)
-- ═══════════════════════════════════════════════════════════════════════

-- Pacientes em acompanhamento dialítico
create table if not exists nefrosmart.pacientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  data_nascimento date,
  sexo text check (sexo in ('M', 'F')),
  modalidade text check (modalidade in ('HD', 'DP')), -- Hemodiálise / Diálise Peritoneal
  data_inicio_dialise date,
  nefrologista_responsavel uuid references auth.users(id),
  ativo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Exames laboratoriais (histórico, um registro por coleta)
create table if not exists nefrosmart.exames_laboratoriais (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references nefrosmart.pacientes(id) on delete cascade,
  data_coleta date not null,
  -- Anemia / ESA / Ferro
  hemoglobina numeric,
  ferritina numeric,
  saturacao_transferrina numeric,
  -- Metabolismo mineral / PTH
  pth numeric,
  calcio numeric,
  fosforo numeric,
  vitamina_d numeric,
  -- Eletrólitos
  potassio numeric,
  sodio numeric,
  bicarbonato numeric,
  -- Adequação dialítica
  kt_v numeric,
  ureia_pre numeric,
  ureia_pos numeric,
  created_at timestamptz default now()
);

-- Avaliação mensal consolidada (o "veredito" do nefrologista sobre o mês)
create table if not exists nefrosmart.avaliacoes_mensais (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references nefrosmart.pacientes(id) on delete cascade,
  exame_id uuid references nefrosmart.exames_laboratoriais(id),
  mes_referencia date not null, -- primeiro dia do mês avaliado
  peso_seco numeric,
  pressao_arterial text,
  alertas jsonb default '[]'::jsonb, -- gerados pelo motor de regras determinístico
  conduta text, -- decisão final do nefrologista
  observacoes text,
  avaliado_por uuid references auth.users(id),
  created_at timestamptz default now()
);

-- ─── Row Level Security ───────────────────────────────────────────────
-- Cada nefrologista só acessa pacientes sob sua responsabilidade

alter table nefrosmart.pacientes enable row level security;
alter table nefrosmart.exames_laboratoriais enable row level security;
alter table nefrosmart.avaliacoes_mensais enable row level security;

create policy "Nefrologista vê seus próprios pacientes"
  on nefrosmart.pacientes for select
  using (auth.uid() = nefrologista_responsavel);

create policy "Nefrologista gerencia seus próprios pacientes"
  on nefrosmart.pacientes for all
  using (auth.uid() = nefrologista_responsavel);

create policy "Exames visíveis via paciente vinculado"
  on nefrosmart.exames_laboratoriais for all
  using (
    exists (
      select 1 from nefrosmart.pacientes p
      where p.id = paciente_id and p.nefrologista_responsavel = auth.uid()
    )
  );

create policy "Avaliações visíveis via paciente vinculado"
  on nefrosmart.avaliacoes_mensais for all
  using (
    exists (
      select 1 from nefrosmart.pacientes p
      where p.id = paciente_id and p.nefrologista_responsavel = auth.uid()
    )
  );

-- ─── Índices úteis ────────────────────────────────────────────────────
create index if not exists idx_exames_paciente_data
  on nefrosmart.exames_laboratoriais(paciente_id, data_coleta desc);

create index if not exists idx_avaliacoes_paciente_mes
  on nefrosmart.avaliacoes_mensais(paciente_id, mes_referencia desc);
