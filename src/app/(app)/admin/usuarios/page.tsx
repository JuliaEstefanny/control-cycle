import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
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

  const { data: usuarios } = await supabase
    .from("profiles")
    .select("id, nome, email, tipo_acesso, tipo_usuario, created_at, updated_at")
    .order("created_at", { ascending: false })
    .returns<Profile[]>();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Usuários cadastrados</h2>
          <p className="text-sm text-gray-500 mt-0.5">Total: {usuarios?.length ?? 0}</p>
        </div>
      </div>

      <Card className="overflow-x-auto">
        {usuarios && usuarios.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Nome</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">E-mail</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Tipo de Acesso</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Tipo de Usuária</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Cadastrada em</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-800 font-medium">{user.nome}</td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.tipo_acesso === "Adm"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {TIPO_ACESSO_LABELS[user.tipo_acesso] || user.tipo_acesso}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {user.tipo_usuario ? TIPO_USUARIO_LABELS[user.tipo_usuario] || user.tipo_usuario : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{dataSegura(user.created_at)}</td>
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
