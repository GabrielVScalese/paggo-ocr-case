"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { useParams, useRouter } from "next/navigation";

// Definimos a interface para sabermos o que esperar do documento
interface DocumentDetail {
  id: string;
  filename: string;
  createdAt: string;
  llmSummary: string;
  extractedText: string;
}

export default function DocumentDetail() {
  const { id } = useParams();
  const router = useRouter();

  // Estado para guardar os dados do documento
  const [documentData, setDocumentData] = useState<DocumentDetail | null>(null);

  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<{ q: string; a: string }[]>(
    []
  );
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  // 1. Efeito para carregar os detalhes do documento
  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        // Como ainda não criamos uma rota específica GET /documents/:id no backend,
        // buscamos a lista e filtramos localmente (funciona bem para protótipos).
        const res = await api.get("/documents");
        const foundDoc = res.data.find((doc: DocumentDetail) => doc.id === id);

        if (foundDoc) {
          setDocumentData(foundDoc);
        } else {
          alert("Documento não encontrado na lista.");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes", error);
      }
    };

    if (id) {
      fetchDocumentDetails();
    }
  }, [id, router]);

  // Função para perguntar ao Chat
  const handleAsk = async () => {
    if (!question) return;
    setLoadingAnswer(true);
    try {
      const res = await api.post(`/documents/${id}/query`, { question });
      setChatHistory([...chatHistory, { q: question, a: res.data.answer }]);
      setQuestion("");
    } catch (error) {
      alert("Erro ao comunicar com a IA.");
    } finally {
      setLoadingAnswer(false);
    }
  };

  // Função de Download do PDF
  const handleDownload = async () => {
    try {
      const response = await api.get(`/documents/${id}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `analise_${documentData?.filename || "doc"}.pdf`
      );
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
        {/* Botão Voltar */}
        <button
          onClick={() => router.back()}
          className="mb-4 text-gray-500 hover:text-black font-medium flex items-center gap-2"
        >
          <span>←</span> Voltar para a lista
        </button>

        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Detalhes do Documento
            </h1>
            {documentData && (
              <p className="text-gray-500 text-sm mt-1">
                Arquivo: <strong>{documentData.filename}</strong> • Enviado em:{" "}
                {new Date(documentData.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <button
            onClick={handleDownload}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-bold text-sm flex items-center gap-2 shadow-sm"
          >
            📄 Baixar PDF
          </button>
        </div>

        {/* --- NOVA SEÇÃO: Resumo da IA --- */}
        <div className="bg-white p-6 rounded shadow border-l-4 border-purple-500 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            🤖 Resumo Completo da Análise
          </h2>
          <div className="bg-gray-50 p-4 rounded text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100">
            {documentData ? (
              documentData.llmSummary ||
              "O resumo ainda não foi gerado ou está indisponível."
            ) : (
              <span className="text-gray-400 italic">
                A carregar informações...
              </span>
            )}
          </div>
        </div>

        {/* Área de Chat */}
        <div className="bg-white p-6 rounded shadow min-h-[400px] mb-4 flex flex-col gap-4 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2">
            💬 Chat Interativo
          </h2>

          {chatHistory.length === 0 && (
            <div className="text-center mt-10 text-gray-400">
              <p className="text-lg">Tem dúvidas sobre este documento?</p>
              <p className="text-sm">
                Pergunte algo abaixo (ex: "Qual o valor do imposto?").
              </p>
            </div>
          )}

          {chatHistory.map((chat, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="self-end max-w-[80%]">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg rounded-bl-lg shadow text-sm">
                  {chat.q}
                </div>
              </div>
              <div className="self-start max-w-[80%]">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-t-lg rounded-br-lg shadow border text-sm whitespace-pre-wrap">
                  {chat.a}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2 bg-white p-2 rounded shadow border border-gray-200">
          <input
            className="flex-1 border-none p-3 outline-none focus:ring-0 text-gray-700"
            placeholder="Faça uma pergunta sobre o documento..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          />
          <button
            onClick={handleAsk}
            disabled={loadingAnswer || !question}
            className="bg-blue-600 text-white px-6 rounded hover:bg-blue-700 disabled:bg-gray-300 font-bold transition-colors shadow-sm"
          >
            {loadingAnswer ? "Pensando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
