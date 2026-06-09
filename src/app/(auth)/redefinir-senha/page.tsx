"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleRedefinir(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });

    if (error) {
      setErro("Não foi possível redefinir a senha. O link pode ter expirado. Solicite um novo.");
    } else {
      router.push("/?senha_redefinida=1");
      router.refresh();
    }

    setCarregando(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-rose-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-rose-600">Control Cycle</h1>
          <p className="text-gray-500 text-sm mt-1">Seu caderno digital do MOB</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Nova senha</h2>
          <p className="text-sm text-gray-400 mb-5">Escolha uma nova senha para sua conta.</p>

          <form onSubmit={handleRedefinir} className="flex flex-col gap-4">
            <Input
              label="Nova senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <Input
              label="Confirmar nova senha"
              type="password"
              placeholder="Repita a senha"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
            />

            {erro && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{erro}</p>
            )}

            <Button type="submit" loading={carregando} size="lg" className="w-full mt-1">
              Redefinir senha
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
