"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome },
      },
    });

    if (error) {
      setErro(error.message === "User already registered"
        ? "Este e-mail já está cadastrado."
        : "Erro ao criar conta. Tente novamente.");
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
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Criar conta</h2>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <Input
              label="Nome"
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              minLength={6}
              required
            />

            {erro && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{erro}</p>
            )}

            <Button type="submit" loading={carregando} size="lg" className="w-full mt-1">
              Criar conta
            </Button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-5">
            Já tem conta?{" "}
            <Link href="/login" className="text-rose-500 font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
