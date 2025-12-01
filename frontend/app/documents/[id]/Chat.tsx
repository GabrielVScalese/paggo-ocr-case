"use client";
import { useState } from "react";
import { api } from "@/utils/api";

interface ChatProps {
  documentId: string;
}

export default function Chat({ documentId }: ChatProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);

  async function send() {
    if (!question.trim()) return;

    const res = await api.post(`/documents/${documentId}/chat`, { question });

    setMessages((prev) => [
      ...prev,
      { role: "user", text: question },
      { role: "assistant", text: res.data.answer },
    ]);

    setQuestion("");
  }

  return (
    <div className="mt-4 p-4 bg-white border rounded">
      <h2 className="font-bold mb-2">Chat com LLM</h2>
      <div className="mb-4 h-40 overflow-y-auto border p-2 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className="mb-2">
            <strong>{m.role === "assistant" ? "LLM" : "Você"}:</strong> {m.text}
          </div>
        ))}
      </div>

      <input
        type="text"
        className="border p-2 w-full mb-2"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={send}
      >
        Enviar
      </button>
    </div>
  );
}
