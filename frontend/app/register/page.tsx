"use client";

import { useState } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // NOVO: Estado para o carregamento do registro
  const [loadingRegister, setLoadingRegister] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingRegister(true); // Inicia o carregamento

    try {
      await api.post("/auth/register", { email, password });
      alert("Conta criada com sucesso! Faça login.");
      router.push("/");
    } catch (err) {
      alert("Erro ao criar conta. Tente outro email.");
    } finally {
      setLoadingRegister(false); // Finaliza o carregamento
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 text-black">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">Criar Conta</h1>
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loadingRegister} // Desabilita durante o carregamento
          />
          <input
            type="password"
            placeholder="Senha (mínimo 6 caracteres)"
            className="p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loadingRegister} // Desabilita durante o carregamento
          />
          <button
            type="submit"
            className="bg-green-600 text-white p-2 rounded hover:bg-green-700 font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loadingRegister} // Desabilita o botão
          >
            {/* Altera o texto baseado no estado de carregamento */}
            {loadingRegister ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
        <Link
          href="/"
          className="mt-4 block text-center text-blue-500 hover:underline"
        >
          Voltar para Login
        </Link>
      </div>
    </div>
  );
}
