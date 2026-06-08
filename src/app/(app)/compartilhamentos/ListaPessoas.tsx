"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface Pessoa {
  id: string;
  nome: string | null;
  email: string;
  pendente: boolean;
  aceito: boolean;
  tipo: "recebido" | "enviado";
  href: string;
}

function BadgeStatus({ pendente, aceito }: { pendente: boolean; aceito: boolean }) {
  if (pendente && aceito) return (
    <div className="flex gap-1">
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Aceito</span>
      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">Pendente</span>
    </div>
  );
  if (aceito) return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Aceito</span>;
  if (pendente) return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">Aguardando</span>;
  return null;
}

function CartaoPessoa({ pessoa }: { pessoa: Pessoa }) {
  return (
    <Link href={pessoa.href}>
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-rose-600">
                {(pessoa.nome ?? pessoa.email)[0].toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="font-medium text-gray-800 text-sm">
                {pessoa.nome ?? pessoa.email}
              </p>
              {pessoa.nome && <p className="text-xs text-gray-400">{pessoa.email}</p>}
              <BadgeStatus pendente={pessoa.pendente} aceito={pessoa.aceito} />
            </div>
          </div>
          <span className="text-gray-300 text-lg shrink-0">›</span>
        </div>
      </Card>
    </Link>
  );
}

interface ListaPessoasProps {
  pessoasRecebidas: Pessoa[];
  pessoasEnviadas: Pessoa[];
}

export function ListaPessoas({ pessoasRecebidas, pessoasEnviadas }: ListaPessoasProps) {
  const [busca, setBusca] = useState("");
  const [aba, setAba] = useState<"recebidos" | "enviados">("recebidos");

  const lista = aba === "recebidos" ? pessoasRecebidas : pessoasEnviadas;

  const filtrada = busca.trim()
    ? lista.filter((p) =>
        p.nome?.toLowerCase().includes(busca.toLowerCase()) ||
        p.email.toLowerCase().includes(busca.toLowerCase())
      )
    : lista;

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Compartilhamentos</h1>
        <p className="text-gray-500 text-sm mt-0.5">Gerencie gráficos enviados e recebidos</p>
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setAba("recebidos")}
          className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
            aba === "recebidos" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Recebidos {pessoasRecebidas.length > 0 && `(${pessoasRecebidas.length})`}
        </button>
        <button
          onClick={() => setAba("enviados")}
          className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
            aba === "enviados" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Enviados {pessoasEnviadas.length > 0 && `(${pessoasEnviadas.length})`}
        </button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-200 bg-white"
        />
      </div>

      {/* Lista */}
      {filtrada.length === 0 ? (
        <Card>
          <p className="text-gray-400 text-center py-8 text-sm">
            {busca ? "Nenhum resultado para essa busca." : aba === "recebidos"
              ? "Nenhum compartilhamento recebido ainda."
              : "Você ainda não compartilhou nenhum gráfico."}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtrada.map((pessoa) => (
            <CartaoPessoa key={`${pessoa.tipo}-${pessoa.id}`} pessoa={pessoa} />
          ))}
        </div>
      )}
    </div>
  );
}
