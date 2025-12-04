"use client";

import { useState } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // NOVO: Estado de carregamento do login
  const [loadingLogin, setLoadingLogin] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoadingLogin(true); // Inicia o carregamento

    try {
      const response = await api.post("/auth/login", { email, password });

      login(response.data.access_token);
      // O router.push ocorre dentro da função login, então não é necessário aqui
    } catch (err) {
      setError("Falha no login. Verifique as credenciais.");
    } finally {
      setLoadingLogin(false); // Finaliza o carregamento
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 text-black">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
        {error && (
          <p className="text-red-500 mb-4 text-sm text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loadingLogin} // Desabilita durante o carregamento
          />
          <input
            type="password"
            placeholder="Senha"
            className="p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loadingLogin} // Desabilita durante o carregamento
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loadingLogin} // Desabilita o botão
          >
            {/* Altera o texto baseado no estado de carregamento */}
            {loadingLogin ? "Validando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Não tem conta?{" "}
          <Link href="/register" className="text-blue-500 hover:underline">
            Registe-se aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
