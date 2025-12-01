import ProtectedPage from "@/components/ProtectedPage";
import Chat from "./Chat";

interface DocumentDetailProps {
  params: {
    id: string;
  };
}

export default function DocumentDetail({ params }: DocumentDetailProps) {
  return (
    <ProtectedPage>
      <main className="p-6">
        <h1 className="text-xl font-bold">Documento #{params.id}</h1>
        <Chat documentId={params.id} />
      </main>
    </ProtectedPage>
  );
}
