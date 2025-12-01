"use client";

import { useState } from "react";
import { api } from "@/utils/api";

export default function UploadForm() {
  // Tipagem explícita: o estado aceita File ou null
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Handler com tipagem do evento
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    // e.target.files pode ser FileList | null
    const selected = e.target.files?.[0] ?? null; // converte undefined -> null
    setFile(selected);
  }

  async function handleUpload() {
    if (!file) {
      setMsg("Selecione um arquivo primeiro.");
      return;
    }

    setLoading(true);
    setMsg("");

    const fd = new FormData();
    fd.append("file", file); // File é compatível com FormData

    try {
      const res = await api.post("/documents/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMsg("Upload concluído!");
      // opcional: redirecionar para /documents/:id ou atualizar lista
      // router.push(`/documents/${res.data.id}`)
    } catch (err: any) {
      console.error(err);
      setMsg(err?.response?.data?.message ?? "Erro ao enviar arquivo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 border rounded bg-white shadow">
      <input
        type="file"
        className="mb-4"
        onChange={handleFileChange}
        accept="image/*,application/pdf"
      />
      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Enviar"}
      </button>

      {msg && <p className="mt-2">{msg}</p>}
    </div>
  );
}
