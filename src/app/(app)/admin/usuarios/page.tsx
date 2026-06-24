import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { EditarTipoAcesso } from "./EditarTipoAcesso";
import type { Profile } from "@/types/db";

function dataSegura(valor: string | null | undefined): string {
  if (!valor) return "—";
  try {
    const [ano, mes, dia] = valor.split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
  } catch { return "—"; }
}

const TIPO_ACESSO_LABELS: Record<string, string> = {
  "Usuario": "Usuária",
  "Adm": "Administrador(a)",
};

const TIPO_USUARIO_LABELS: Record<string, string> = {
  "aluna": "Aluna",
  "instrutora": "Instrutora",
  "convidada": "Convidado(a)",
};

export default async function UsuariosPage() {
  const supabase = await createClient();

  const { data: usuarios, error } = await supabase
    .rpc("get_todos_usuarios")
    .returns<Profile[]>();

  const listaUsuarios = Array.isArray(usuarios) ? usuarios : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Usuários cadastrados</h2>
          <p className="text-sm text-gray-500 mt-0.5">Total: {listaUsuarios.length}</p>
        </div>
      </div>

      <Card className="overflow-x-auto">
        {listaUsuarios.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Nome</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">E-mail</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Tipo de Acesso</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Tipo de Usuária</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Cadastrada em</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {listaUsuarios.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-800 font-medium">{user.nome}</td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <EditarTipoAcesso usuarioId={user.id} tipoAcesoAtual={user.tipo_acesso} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {user.tipo_usuario ? TIPO_USUARIO_LABELS[user.tipo_usuario] || user.tipo_usuario : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{dataSegura(user.created_at)}</td>
                  <td className="px-4 py-3"></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-400">
            Nenhum usuário cadastrado
          </div>
        )}
      </Card>
    </div>
  );
}
