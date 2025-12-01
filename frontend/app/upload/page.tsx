import ProtectedPage from "@/components/ProtectedPage";
import UploadForm from "./UploadForm";
export default function UploadPage() {
  return (
    <ProtectedPage>
      <main className="p-6">
        <h1 className="text-xl font-bold mb-4">Upload de Nota Fiscal</h1>
        <UploadForm />
      </main>
    </ProtectedPage>
  );
}
