"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Document {
  id: string;
  filename: string;
  createdAt: string;
  llmSummary: string;
}

export default function Dashboard() {
  const { isAuthenticated, logout, loading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  // NOVO: Estado para o carregamento dos documentos
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  const fetchDocuments = async () => {
    // Inicia o carregamento
    setLoadingDocuments(true);
    try {
      const res = await api.get("/documents");
      setDocuments(res.data);
    } catch (error) {
      console.error("Erro ao buscar documentos", error);
    } finally {
      // Finaliza o carregamento
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchDocuments();
  }, [isAuthenticated]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Documento enviado e processado!");
      setFile(null);
      fetchDocuments(); // Atualiza a lista na hora
    } catch (error) {
      alert("Erro no upload. Verifique o backend.");
    } finally {
      setUploading(false);
    }
  };

  // Mostra "Carregando" enquanto verifica o login
  if (loading || !isAuthenticated)
    return <p className="text-center mt-10 text-black">A carregar...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Os Meus Documentos
          </h1>
          <button
            onClick={logout}
            className="text-red-500 hover:text-red-700 font-semibold border border-red-200 px-4 py-1 rounded"
          >
            Sair
          </button>
        </header>

        <div className="bg-white p-6 rounded shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Novo Upload</h2>
          <div className="flex gap-4 items-center">
            <input
              type="file"
              accept="image/*, application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="border p-2 rounded w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 font-bold whitespace-nowrap"
            >
              {uploading ? "A enviar..." : "Enviar"}
            </button>
          </div>
        </div>

        {/* Exibe o carregamento enquanto os documentos estão sendo buscados */}
        {loadingDocuments ? (
          <p className="text-center mt-10 text-gray-600 font-medium">
            Carregando documentos...
          </p>
        ) : (
          <div className="grid gap-4">
            {documents.length === 0 && (
              <p className="text-gray-500 text-center">
                Nenhum documento enviado ainda.
              </p>
            )}

            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-5 rounded shadow border-l-4 border-blue-500 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {doc.filename}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Enviado a: {new Date(doc.createdAt).toLocaleDateString()}{" "}
                      às {new Date(doc.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/dashboard/${doc.id}`)}
                    className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm"
                  >
                    Ver Detalhes & Chat
                  </button>
                </div>
                <div className="mt-3 bg-gray-50 p-3 rounded text-sm text-gray-700">
                  <strong>Resumo Inicial:</strong>{" "}
                  {doc.llmSummary
                    ? doc.llmSummary.substring(0, 150) + "..."
                    : "A processar..."}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
