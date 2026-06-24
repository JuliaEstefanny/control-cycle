import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/db";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tipo_acesso")
    .eq("id", user.id)
    .single<Pick<Profile, "tipo_acesso">>();

  if (profile?.tipo_acesso !== "Adm") {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Administração</h1>
        <p className="text-gray-500 text-sm mt-0.5">Gerencie usuários e configurações</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-8 overflow-x-auto">
          <Link
            href="/admin/usuarios"
            className="py-3 px-1 text-sm font-medium text-gray-600 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-300 transition-colors whitespace-nowrap"
          >
            Usuários
          </Link>
        </nav>
      </div>

      {children}
    </div>
  );
}
