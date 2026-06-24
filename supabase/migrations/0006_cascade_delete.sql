-- ============================================================
-- Altera constraints para impedir deletar usuário com dados
-- ============================================================

-- Remove a constraint atual que deletava em cascata
alter table public.cycles
drop constraint if exists cycles_user_id_fkey;

-- Recria sem CASCADE para impedir deleção
alter table public.cycles
add constraint cycles_user_id_fkey
foreign key (user_id)
references public.profiles(id)
on delete restrict;

-- Mesma coisa para notes
alter table public.notes
drop constraint if exists notes_user_id_fkey;

alter table public.notes
add constraint notes_user_id_fkey
foreign key (user_id)
references public.profiles(id)
on delete restrict;

-- E para cycle_shares (pelo owner)
alter table public.cycle_shares
drop constraint if exists cycle_shares_owner_id_fkey;

alter table public.cycle_shares
add constraint cycle_shares_owner_id_fkey
foreign key (owner_id)
references public.profiles(id)
on delete restrict;

-- Manter CASCADE para cycles → notes (deletar ciclo deleta anotações)
alter table public.notes
drop constraint if exists notes_cycle_id_fkey;

alter table public.notes
add constraint notes_cycle_id_fkey
foreign key (cycle_id)
references public.cycles(id)
on delete cascade;

-- Manter CASCADE para cycles → cycle_shares (deletar ciclo deleta compartilhamentos)
alter table public.cycle_shares
drop constraint if exists cycle_shares_cycle_id_fkey;

alter table public.cycle_shares
add constraint cycle_shares_cycle_id_fkey
foreign key (cycle_id)
references public.cycles(id)
on delete cascade;
