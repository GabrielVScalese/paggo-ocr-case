export default function DocumentsPage() {
  const docs = [];
  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Documentos</h1>
      {docs.length === 0 && <p>Nenhum documento enviado.</p>}
    </main>
  );
}
