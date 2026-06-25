-- ============================================================
-- Função corrigida para deletar usuário incluindo auth
-- ============================================================

create or replace function public.deletar_usuario(usuario_id uuid)
returns json language plpgsql security definer as $$
declare
  v_tipo_acesso text;
begin
  -- Verifica se quem chamou é admin
  select tipo_acesso into v_tipo_acesso
  from profiles
  where id = auth.uid();

  if v_tipo_acesso != 'Adm' then
    return json_build_object('erro', 'Apenas administradores podem deletar usuários');
  end if;

  -- Não permite admin deletar a si mesmo
  if usuario_id = auth.uid() then
    return json_build_object('erro', 'Você não pode deletar sua própria conta');
  end if;

  -- Delete cascata: compartilhamentos → ciclos → anotações → usuário
  delete from public.cycle_shares where cycle_id in (
    select id from public.cycles where user_id = usuario_id
  );

  delete from public.notes where cycle_id in (
    select id from public.cycles where user_id = usuario_id
  );

  delete from public.cycles where user_id = usuario_id;

  delete from public.profiles where id = usuario_id;

  -- Deleta da auth.users (isso cascata deleta profiles automaticamente)
  delete from auth.users where id = usuario_id;

  return json_build_object('sucesso', true, 'mensagem', 'Usuário deletado com sucesso');
end;
$$;
