"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AcoesPendente({ shareId, recipientEmail }: { shareId: string; recipientEmail: string }) {
  const router = useRouter();
  const [carregando, setCarregando] = useState<"aceitar" | "recusar" | null>(null);

  async function responder(status: "aceito" | "recusado") {
    setCarregando(status === "aceito" ? "aceitar" : "recusar");
    const supabase = createClient();
    await supabase
      .from("cycle_shares")
      .update({ status })
      .eq("id", shareId)
      .eq("recipient_email", recipientEmail);
    router.refresh();
    setCarregando(null);
  }

  return (
    <div className="flex flex-col gap-2 shrink-0">
      <button
        onClick={() => responder("aceito")}
        disabled={carregando !== null}
        className="text-sm text-white bg-rose-500 hover:bg-rose-600 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        {carregando === "aceitar" ? "..." : "Aceitar"}
      </button>
      <button
        onClick={() => responder("recusado")}
        disabled={carregando !== null}
        className="text-sm text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg font-medium border border-gray-200 transition-colors disabled:opacity-50"
      >
        {carregando === "recusar" ? "..." : "Recusar"}
      </button>
    </div>
  );
}
