import PDFDocument = require('pdfkit');

interface PdfData {
  filename: string;
  createdAt: Date;
  id: string;
  llmSummary: string | null;
  extractedText: string | null;
  fileUrl: string | null;
}

export async function generateDocumentReport(data: PdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    // Captura os dados do stream
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    // Cabeçalho
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('Relatório de Análise', { align: 'center' });
    doc.moveDown();

    // Informações do Arquivo (Metadados)
    doc.fontSize(10).font('Helvetica').fillColor('#555555');
    doc.text(`Documento Original: ${data.filename}`);
    doc.text(
      `Data de Processamento: ${data.createdAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`,
    );
    doc.text(`ID do Documento: ${data.id}`);
    doc.moveDown();

    // Linha Separadora
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#aaaaaa').stroke();
    doc.moveDown(2);

    if (data.fileUrl) {
      doc.fillColor('black');
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('1. Acesso ao Documento Original');
      doc.moveDown(0.5);

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(
          'Clique no link abaixo para visualizar ou fazer download do documento:',
        );
      doc.moveDown(0.5);

      // Link clicável
      doc
        .fillColor('#0000FF')
        .font('Helvetica-Bold')
        .text('Acessar documento original', {
          link: data.fileUrl,
          underline: true,
        });

      doc.moveDown(2);
    }

    doc.fillColor('black');
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('2. Resumo da Inteligência Artificial');
    doc.moveDown(0.5);
    doc
      .fontSize(11)
      .font('Helvetica')
      .text(data.llmSummary || 'Resumo não disponível.', {
        align: 'justify',
        lineGap: 2,
      });
    doc.moveDown(2);

    // Texto Extraído
    doc.fontSize(14).font('Helvetica-Bold').text('3. Texto Extraído (OCR)');
    doc.moveDown(0.5);

    // Uso de fonte monoespaçada (Courier) para o OCR parecer texto bruto
    doc
      .fontSize(10)
      .font('Courier')
      .text(data.extractedText || 'Texto não extraído.', {
        align: 'justify',
      });

    doc.end();
  });
}
