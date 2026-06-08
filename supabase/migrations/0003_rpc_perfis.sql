-- Função para buscar perfis públicos por lista de IDs
-- SECURITY DEFINER: executa com permissão do criador, contornando RLS de profiles
-- Expõe apenas nome e email — sem dados sensíveis
create or replace function public.get_perfis_publicos(ids uuid[])
returns table (id uuid, nome text, email text)
language sql
security definer
stable
as $$
  select id, nome, email
  from public.profiles
  where id = any(ids);
$$;

-- Concede execução para usuários autenticados
grant execute on function public.get_perfis_publicos(uuid[]) to authenticated;

-- Função para buscar perfis públicos por lista de emails
create or replace function public.get_perfis_por_email(emails text[])
returns table (id uuid, nome text, email text)
language sql
security definer
stable
as $$
  select id, nome, email
  from public.profiles
  where email = any(emails);
$$;

grant execute on function public.get_perfis_por_email(text[]) to authenticated;
