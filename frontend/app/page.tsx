"use client";

import { useState } from "react";
import api from "@/services/api"; // Importa da raiz
import { useAuth } from "@/context/AuthContext"; // Importa da raiz
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Envia email/senha para o NestJS
      const response = await api.post("/auth/login", { email, password });

      // 2. Se der certo, pega o token e manda para o Contexto
      // O Contexto vai salvar no cookie e redirecionar para o Dashboard
      login(response.data.access_token);
    } catch (err) {
      setError("Falha no login. Verifique as credenciais.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 text-black">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">Login Paggo</h1>
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
          />
          <input
            type="password"
            placeholder="Senha"
            className="p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-bold"
          >
            Entrar
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
