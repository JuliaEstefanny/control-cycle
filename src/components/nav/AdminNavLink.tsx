"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/db";

export function AdminNavLink() {
  const pathname = usePathname();
  const [isAdm, setIsAdm] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setCarregando(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("tipo_acesso")
        .eq("id", user.id)
        .single<Pick<Profile, "tipo_acesso">>();

      setIsAdm(profile?.tipo_acesso === "Adm");
      setCarregando(false);
    };

    checkAdminAccess();
  }, []);

  if (carregando || !isAdm) return null;

  const active = pathname.startsWith("/admin");

  return (
    <Link
      href="/admin/usuarios"
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        active
          ? "bg-purple-50 text-purple-600"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <Settings size={18} />
      Admin
    </Link>
  );
}
