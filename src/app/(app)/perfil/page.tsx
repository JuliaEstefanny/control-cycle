import { createClient } from "@/lib/supabase/server";
import { PerfilForm } from "./PerfilForm";
import type { Profile } from "@/types/db";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single<Profile>();

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Perfil</h1>
        <p className="text-gray-500 text-sm mt-0.5">Suas informações pessoais</p>
      </div>

      <PerfilForm profile={profile} userId={user!.id} />
    </div>
  );
}
