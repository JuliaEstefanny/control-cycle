"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    if (error) {
      setErro("Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.");
    } else {
      setEnviado(true);
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
          {enviado ? (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">E-mail enviado!</h2>
              <p className="text-sm text-gray-500 text-center">
                Verifique sua caixa de entrada e clique no link para redefinir sua senha.
              </p>
              <Link href="/login" className="text-sm text-rose-500 font-medium hover:underline mt-2">
                Voltar para o login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Esqueci minha senha</h2>
              <p className="text-sm text-gray-400 mb-5">
                Informe seu e-mail e enviaremos um link para redefinir sua senha.
              </p>

              <form onSubmit={handleEnviar} className="flex flex-col gap-4">
                <Input
                  label="E-mail"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                {erro && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{erro}</p>
                )}

                <Button type="submit" loading={carregando} size="lg" className="w-full mt-1">
                  Enviar link
                </Button>
              </form>

              <p className="text-sm text-center text-gray-500 mt-5">
                Lembrou a senha?{" "}
                <Link href="/login" className="text-rose-500 font-medium hover:underline">
                  Entrar
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
