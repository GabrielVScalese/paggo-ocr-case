"use client";

import { useState } from "react";
import api from "@/services/api";
import { useParams, useRouter } from "next/navigation";

export default function DocumentDetail() {
  const { id } = useParams(); // Pega o ID da URL
  const router = useRouter();

  const [question, setQuestion] = useState("");
  // Guarda o histórico do chat localmente
  const [chatHistory, setChatHistory] = useState<{ q: string; a: string }[]>(
    []
  );
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  // Função para fazer perguntas à IA
  const handleAsk = async () => {
    if (!question) return;
    setLoadingAnswer(true);
    try {
      const res = await api.post(`/documents/${id}/query`, { question });

      // Adiciona a pergunta e a resposta ao histórico visual
      setChatHistory([...chatHistory, { q: question, a: res.data.answer }]);
      setQuestion("");
    } catch (error) {
      alert("Erro ao comunicar com a Inteligência Artificial.");
    } finally {
      setLoadingAnswer(false);
    }
  };

  // Função para baixar o ficheiro com o texto extraído
  const handleDownload = async () => {
    try {
      const response = await api.get(`/documents/${id}/download`, {
        responseType: "blob",
      });
      // Cria um link temporário para forçar o download no navegador
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "analise_paggo.txt");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Erro ao fazer download.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 text-gray-500 hover:text-black font-medium"
        >
          ← Voltar
        </button>

        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded shadow">
          <h1 className="text-2xl font-bold">Chat com o Documento</h1>
          <button
            onClick={handleDownload}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold text-sm"
          >
            📥 Baixar Ficheiro Completo
          </button>
        </div>

        {/* Área de Chat */}
        <div className="bg-white p-6 rounded shadow min-h-[400px] mb-4 flex flex-col gap-4 border border-gray-200">
          {chatHistory.length === 0 && (
            <div className="text-center mt-20 text-gray-400">
              <p className="text-lg">Olá! Eu li o seu documento.</p>
              <p className="text-sm">Faça uma pergunta sobre ele abaixo.</p>
            </div>
          )}

          {chatHistory.map((chat, i) => (
            <div key={i} className="flex flex-col gap-2">
              {/* Pergunta do Utilizador */}
              <div className="self-end max-w-[80%]">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg rounded-bl-lg shadow">
                  {chat.q}
                </div>
              </div>
              {/* Resposta da IA */}
              <div className="self-start max-w-[80%]">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-t-lg rounded-br-lg shadow border">
                  {chat.a}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Campo de Input */}
        <div className="flex gap-2 bg-white p-2 rounded shadow">
          <input
            className="flex-1 border p-3 rounded outline-none focus:border-blue-500"
            placeholder="Ex: Qual o valor total da fatura?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          />
          <button
            onClick={handleAsk}
            disabled={loadingAnswer || !question}
            className="bg-blue-600 text-white px-8 rounded hover:bg-blue-700 disabled:bg-gray-300 font-bold transition-colors"
          >
            {loadingAnswer ? "Pensando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
