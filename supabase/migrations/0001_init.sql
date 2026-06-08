-- ============================================================
-- Control Cycle — Schema inicial
-- ============================================================

-- Extensão para UUID
create extension if not exists "uuid-ossp";

-- ============================================================
-- Tabela: profiles
-- Criada automaticamente via trigger no signup do Auth
-- ============================================================
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  nome           text not null default '',
  email          text not null default '',
  objetivo       text,
  data_nascimento date,
  preferencias   jsonb default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ============================================================
-- Tabela: cycles
-- Só pode haver um ciclo ativo por usuária (unique parcial)
-- ============================================================
create table if not exists public.cycles (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  nome              text,
  data_inicial      date not null,
  data_final        date,
  status            text not null default 'ativo'
                    check (status in ('ativo', 'encerrado', 'arquivado')),
  observacoes_gerais text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Garante Regra 6: só um ciclo ativo por usuária
create unique index if not exists cycles_user_ativo_unique
  on public.cycles (user_id)
  where status = 'ativo';

-- ============================================================
-- Tabela: notes
-- Uma anotação por dia por ciclo (Regras 3 e 4)
-- ============================================================
create table if not exists public.notes (
  id              uuid primary key default uuid_generate_v4(),
  cycle_id        uuid not null references public.cycles(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  data            date not null,
  dia_ciclo       int not null,
  -- Campos obrigatórios (Regras 1 e 2)
  sensacao        text not null,
  sensacao_outra  text,
  aparencia       text not null,
  aparencia_outra text,
  -- Campos opcionais
  relacao_sexual  boolean not null default false,
  relacao_periodo text,
  sangramento     text not null default 'nenhum'
                  check (sangramento in ('nenhum','mancha','leve','moderado','intenso')),
  simbolo_mob     text
                  check (simbolo_mob in ('vermelho','manchas','verde','amarelo','branco','R1','R2','R3','1','2','3')),
  regra_mob       text
                  check (regra_mob in ('Regra 1','Regra 2','Regra 3','Regra do Ápice','Não se aplica')),
  observacoes     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- Regras 3 e 4: uma anotação por data por ciclo
  unique (cycle_id, data)
);

-- ============================================================
-- Trigger: atualiza updated_at automaticamente
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger cycles_updated_at
  before update on public.cycles
  for each row execute function public.handle_updated_at();

create trigger notes_updated_at
  before update on public.notes
  for each row execute function public.handle_updated_at();

-- ============================================================
-- Trigger: cria profile automaticamente no signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, nome)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security (RLS)
-- Cada usuária só acessa os próprios dados
-- ============================================================
alter table public.profiles enable row level security;
alter table public.cycles   enable row level security;
alter table public.notes    enable row level security;

-- Políticas: profiles
create policy "Usuária lê próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuária atualiza próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Políticas: cycles
create policy "Usuária lê próprios ciclos"
  on public.cycles for select
  using (auth.uid() = user_id);

create policy "Usuária cria próprios ciclos"
  on public.cycles for insert
  with check (auth.uid() = user_id);

create policy "Usuária atualiza próprios ciclos"
  on public.cycles for update
  using (auth.uid() = user_id);

create policy "Usuária exclui próprios ciclos"
  on public.cycles for delete
  using (auth.uid() = user_id);

-- Políticas: notes
create policy "Usuária lê próprias anotações"
  on public.notes for select
  using (auth.uid() = user_id);

create policy "Usuária cria próprias anotações"
  on public.notes for insert
  with check (auth.uid() = user_id);

create policy "Usuária atualiza próprias anotações"
  on public.notes for update
  using (auth.uid() = user_id);

create policy "Usuária exclui próprias anotações"
  on public.notes for delete
  using (auth.uid() = user_id);
