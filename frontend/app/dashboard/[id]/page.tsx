"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { useParams, useRouter } from "next/navigation";

// Interface atualizada
interface DocumentDetail {
  id: string;
  filename: string;
  createdAt: string;
  llmSummary: string;
  extractedText: string;
  fileUrl: string; // URL pública do Cloudinary (ou outro storage)
}

export default function DocumentDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [documentData, setDocumentData] = useState<DocumentDetail | null>(null);

  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<{ q: string; a: string }[]>(
    []
  );
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  // Carregar os detalhes do documento
  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
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

  // Função de Download do PDF de ANÁLISE
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

  // --- FUNÇÃO DE PRÉ-VISUALIZAÇÃO DO ARQUIVO ORIGINAL ---
  const renderDocumentPreview = () => {
    if (!documentData || !documentData.fileUrl) {
      return (
        <div className="text-gray-400 italic mt-4">
          URL do documento indisponível.
        </div>
      );
    }

    const fileUrl = documentData.fileUrl;
    const isPdf = fileUrl.toLowerCase().includes(".pdf");

    return (
      <div className="bg-white p-4 rounded shadow border border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-bold mb-3 text-gray-800 flex items-center gap-2">
          🖼️ Pré-visualização do Original
        </h2>
        <div className="border rounded overflow-hidden bg-gray-100 flex justify-center max-h-[450px]">
          {isPdf ? (
            // Usa iframe para PDF
            <iframe
              src={fileUrl}
              className="w-full h-[450px] border-0"
              title={`Documento: ${documentData.filename}`}
            />
          ) : (
            // Usa <img> para Imagens
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fileUrl}
              alt={`Documento: ${documentData.filename}`}
              className="max-w-full h-auto max-h-[450px] object-contain"
            />
          )}
        </div>
        <div className="mt-3 text-right">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-xs"
          >
            Abrir arquivo original ↗
          </a>
        </div>
      </div>
    );
  };
  // -------------------------------------------------------------------

  return (
    // Removendo o padding da div mais externa
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Adicionando w-full para preencher a largura e p-8 para o padding da página */}
      <div className="w-full mx-auto px-8 py-8">
        <button
          onClick={() => router.back()}
          className="mb-4 text-gray-500 hover:text-black font-medium flex items-center gap-2"
        >
          <span>←</span> Voltar para a lista
        </button>

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
            📄 Baixar PDF de Análise
          </button>
        </div>

        {/* --- LAYOUT DE TRÊS COLUNAS (3:6:3) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* COLUNA 1 (Esquerda): RESUMO DA IA (lg:col-span-3) */}
          <div className="lg:col-span-3">
            {/* 1. RESUMO DA IA (Com altura aumentada) */}
            <div className="bg-white p-6 rounded shadow border-l-4 border-purple-500 flex-shrink-0">
              <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                🤖 Resumo Completo da Análise
              </h2>
              <div className="bg-gray-50 p-4 rounded text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100 max-h-[500px] overflow-y-auto">
                {documentData ? (
                  documentData.llmSummary ||
                  "O resumo ainda não foi gerado ou está indisponível."
                ) : (
                  <span className="text-gray-400 italic">
                    Carregando informações...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* COLUNA 2 (Centro): CHAT INTERATIVO (lg:col-span-6) */}
          <div className="lg:col-span-6">
            <div className="bg-white p-6 rounded shadow flex flex-col gap-4 border border-gray-200 h-full min-h-[calc(100vh-200px)]">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">
                💬 Chat Interativo
              </h2>

              {/* HISTÓRICO DO CHAT: Ocupa o espaço restante e é SCROLLÁVEL */}
              <div className="flex-grow overflow-y-auto pr-2 max-h-[calc(100vh-350px)]">
                {chatHistory.length === 0 && (
                  <div className="text-center mt-10 text-gray-400">
                    <p className="text-lg">Tem dúvidas sobre este documento?</p>
                    <p className="text-sm">
                      Pergunte algo abaixo (ex: "Qual o valor do imposto?").
                    </p>
                  </div>
                )}

                {chatHistory.map((chat, i) => (
                  <div key={i} className="flex flex-col gap-2 mb-4">
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

              {/* INPUT BAR FIXO */}
              <div className="flex gap-2 p-2 rounded border border-gray-200 -mx-6 -mb-6 bg-white shadow-md">
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

          {/* COLUNA 3 (Direita): PRÉ-VISUALIZAÇÃO (lg:col-span-3) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {renderDocumentPreview()}
          </div>
        </div>
      </div>
    </div>
  );
}
