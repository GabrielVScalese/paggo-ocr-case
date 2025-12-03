// ARQUIVO: src/utils/pdf-generator.util.ts

import PDFDocument = require('pdfkit');

// Definimos uma interface para saber exatamente o que o gerador precisa
interface PdfData {
  filename: string;
  createdAt: Date;
  id: string;
  llmSummary: string | null;
  extractedText: string | null;
}

export async function generateDocumentReport(data: PdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // 1. Cria o documento
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    // 2. Captura os dados do stream
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    // --- INÍCIO DO DESENHO DO PDF ---

    // Cabeçalho
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('Relatório de Análise Paggo', { align: 'center' });
    doc.moveDown();

    // Informações do Arquivo (Metadados)
    doc.fontSize(10).font('Helvetica').fillColor('#555555');
    doc.text(`Ficheiro Original: ${data.filename}`);
    doc.text(
      `Data de Processamento: ${data.createdAt.toLocaleString('pt-PT')}`,
    );
    doc.text(`ID do Documento: ${data.id}`);
    doc.moveDown();

    // Linha Separadora
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#aaaaaa').stroke();
    doc.moveDown(2);

    // Seção 1: Resumo IA
    doc.fillColor('black');
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('1. Resumo da Inteligência Artificial');
    doc.moveDown(0.5);
    doc
      .fontSize(11)
      .font('Helvetica')
      .text(data.llmSummary || 'Resumo não disponível.', {
        align: 'justify',
        lineGap: 2,
      });
    doc.moveDown(2);

    // Seção 2: Texto Extraído
    doc.fontSize(14).font('Helvetica-Bold').text('2. Texto Extraído (OCR)');
    doc.moveDown(0.5);

    // Usamos uma fonte monoespaçada (Courier) para o OCR parecer "código" ou texto bruto
    doc
      .fontSize(10)
      .font('Courier')
      .text(data.extractedText || 'Texto não extraído.', {
        align: 'justify',
      });

    // Rodapé simples
    const pageCount = doc.bufferedPageRange().count;
    // Nota: paginação automática no pdfkit é mais complexa, deixaremos simples por enquanto.

    // Finaliza o documento
    doc.end();
  });
}
