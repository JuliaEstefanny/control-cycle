-- ============================================================
-- Control Cycle — Compartilhamento de gráficos + tipo_usuario
-- ============================================================

-- Adiciona tipo_usuario em profiles
alter table public.profiles
  add column if not exists tipo_usuario text
  check (tipo_usuario in ('aluna', 'instrutora', 'convidada'));

-- ============================================================
-- Tabela: cycle_shares
-- ============================================================
create table if not exists public.cycle_shares (
  id              uuid primary key default uuid_generate_v4(),
  cycle_id        uuid not null references public.cycles(id) on delete cascade,
  owner_id        uuid not null references public.profiles(id) on delete cascade,
  recipient_email text not null,
  status          text not null default 'pendente'
                  check (status in ('pendente', 'aceito', 'recusado')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (cycle_id, recipient_email)
);

drop trigger if exists cycle_shares_updated_at on public.cycle_shares;
create trigger cycle_shares_updated_at
  before update on public.cycle_shares
  for each row execute function public.handle_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.cycle_shares enable row level security;

-- Limpa policies existentes antes de recriar
drop policy if exists "Dono lê compartilhamentos enviados" on public.cycle_shares;
drop policy if exists "Dono cria compartilhamentos" on public.cycle_shares;
drop policy if exists "Dono atualiza compartilhamentos" on public.cycle_shares;
drop policy if exists "Dono exclui compartilhamentos" on public.cycle_shares;
drop policy if exists "Destinatário lê compartilhamentos recebidos" on public.cycle_shares;
drop policy if exists "Destinatário atualiza status" on public.cycle_shares;
drop policy if exists "Destinatário lê ciclo compartilhado" on public.cycles;
drop policy if exists "Destinatário lê notas do ciclo compartilhado" on public.notes;

-- Dono: lê e gerencia os próprios compartilhamentos
create policy "Dono lê compartilhamentos enviados"
  on public.cycle_shares for select
  using (auth.uid() = owner_id);

create policy "Dono cria compartilhamentos"
  on public.cycle_shares for insert
  with check (auth.uid() = owner_id);

create policy "Dono atualiza compartilhamentos"
  on public.cycle_shares for update
  using (auth.uid() = owner_id);

create policy "Dono exclui compartilhamentos"
  on public.cycle_shares for delete
  using (auth.uid() = owner_id);

-- Destinatário: lê compartilhamentos recebidos via email
create policy "Destinatário lê compartilhamentos recebidos"
  on public.cycle_shares for select
  using (
    recipient_email = (
      select email from public.profiles where id = auth.uid()
    )
  );

-- Destinatário: pode aceitar ou recusar
create policy "Destinatário atualiza status"
  on public.cycle_shares for update
  using (
    recipient_email = (
      select email from public.profiles where id = auth.uid()
    )
  );

-- Destinatário pode ler o ciclo compartilhado
create policy "Destinatário lê ciclo compartilhado"
  on public.cycles for select
  using (
    exists (
      select 1 from public.cycle_shares cs
      join public.profiles p on p.id = auth.uid()
      where cs.cycle_id = cycles.id
        and cs.recipient_email = p.email
        and cs.status = 'aceito'
    )
  );

-- Destinatário pode ler notas do ciclo compartilhado
create policy "Destinatário lê notas do ciclo compartilhado"
  on public.notes for select
  using (
    exists (
      select 1 from public.cycle_shares cs
      join public.profiles p on p.id = auth.uid()
      where cs.cycle_id = notes.cycle_id
        and cs.recipient_email = p.email
        and cs.status = 'aceito'
    )
  );
