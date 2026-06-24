-- ============================================================
-- Funções RPC para painel de administrador
-- ============================================================

-- Retorna todos os usuários (apenas admins podem chamar)
create or replace function public.get_todos_usuarios()
returns table (
  id uuid,
  nome text,
  email text,
  tipo_acesso text,
  tipo_usuario text,
  created_at timestamptz,
  updated_at timestamptz
) language sql security definer set search_path = public as $$
  select id, nome, email, tipo_acesso, tipo_usuario, created_at, updated_at
  from profiles
  order by created_at desc;
$$;

-- Permite ao admin alterar o tipo de acesso de um usuário
create or replace function public.alterar_tipo_acesso(
  usuario_id uuid,
  novo_tipo text
)
returns json language plpgsql security definer as $$
declare
  v_tipo_acesso text;
begin
  -- Verifica se quem chamou é admin
  select tipo_acesso into v_tipo_acesso
  from profiles
  where id = auth.uid();

  if v_tipo_acesso != 'Adm' then
    return json_build_object('erro', 'Apenas administradores podem alterar tipo de acesso');
  end if;

  -- Validar tipo
  if novo_tipo not in ('Usuario', 'Adm') then
    return json_build_object('erro', 'Tipo de acesso inválido');
  end if;

  -- Atualizar
  update profiles
  set tipo_acesso = novo_tipo
  where id = usuario_id;

  return json_build_object('sucesso', true, 'mensagem', 'Tipo de acesso alterado com sucesso');
end;
$$;
