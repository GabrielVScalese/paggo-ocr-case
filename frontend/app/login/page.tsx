"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
          Paggo OCR
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Faça login para continuar
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/upload" })}
          className="flex items-center justify-center gap-3 w-full py-3 bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <FcGoogle size={24} />
          <span className="text-gray-700 font-semibold">Entrar com Google</span>
        </button>

        <div className="mt-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Paggo — Todos os direitos reservados
        </div>
      </div>
    </main>
  );
}
