-- ============================================================
-- Adiciona tipo de acesso (Usuario/Adm) na tabela profiles
-- ============================================================

alter table public.profiles
add column tipo_acesso text not null default 'Usuario'
check (tipo_acesso in ('Usuario', 'Adm'));

-- Atualiza todos os usuários existentes para 'Usuario'
update public.profiles set tipo_acesso = 'Usuario' where tipo_acesso is null;
