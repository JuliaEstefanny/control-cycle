"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error) {
      setErro("E-mail ou senha incorretos. Tente novamente.");
    } else {
      router.push("/");
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
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Entrar</h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1">
              <Input
                label="Senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <div className="flex justify-end">
                <Link href="/esqueci-senha" className="text-xs text-rose-400 hover:underline">
                  Esqueci minha senha
                </Link>
              </div>
            </div>

            {erro && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{erro}</p>
            )}

            <Button type="submit" loading={carregando} size="lg" className="w-full mt-1">
              Entrar
            </Button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-5">
            Não tem conta?{" "}
            <Link href="/signup" className="text-rose-500 font-medium hover:underline">
              Criar conta
            </Link>
          </p>

          <div className="border-t border-gray-100 mt-5 pt-4">
            <p className="text-xs text-center text-gray-400">
              Precisa de ajuda?{" "}
              <a
                href="mailto:aitheotec.global@gmail.com"
                className="text-rose-400 hover:underline font-medium"
              >
                aitheotec.global@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
