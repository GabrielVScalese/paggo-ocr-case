"use client";

import { useState } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { email, password });
      alert("Conta criada com sucesso! Faça login.");
      router.push("/");
    } catch (err) {
      alert("Erro ao criar conta. Tente outro email.");
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
          />
          <input
            type="password"
            placeholder="Senha (mínimo 6 caracteres)"
            className="p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-green-600 text-white p-2 rounded hover:bg-green-700 font-bold"
          >
            Cadastrar
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
