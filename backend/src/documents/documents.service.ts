import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Tesseract from 'tesseract.js';
import OpenAI from 'openai';
import { generateDocumentReport } from 'src/utils/pdf-generator.util';

@Injectable()
export class DocumentsService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  async findAll(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        filename: true,
        createdAt: true,
        llmSummary: true,
        fileUrl: true,
        extractedText: true,
      },
    });
  }

  async queryDocument(documentId: string, userId: string, question: string) {
    const document = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        userId: userId,
      },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado ou acesso negado.');
    }

    const context = document.extractedText;

    if (!context) {
      return {
        answer:
          'O texto do documento não foi extraído. Não é possível responder.',
      };
    }

    if (!process.env.OPENAI_API_KEY) {
      return { answer: 'LLM desativado. Chave de API não configurada.' };
    }

    try {
      // O array messages define o histórico de conversação com o modelo
      const completion = await this.openai.chat.completions.create({
        messages: [
          // É necessário primeiro definir um contexto, antes de o modelo analisar a pergunta do usuário
          {
            role: 'system',
            content: `Responda à pergunta do usuário APENAS com base no seguinte texto do documento: ${context}`,
          },
          {
            role: 'user',
            content: question,
          },
        ],
        model: 'llama-3.1-8b-instant',
      });

      const answer =
        completion.choices[0].message.content ||
        'A IA não conseguiu gerar uma resposta.';

      return {
        documentId,
        question,
        answer,
      };
    } catch (error) {
      console.error('Erro na OpenAI durante a query:', error);
      throw new Error('Falha ao processar a consulta LLM.');
    }
  }

  async create(file: Express.Multer.File, userId: string) {
    console.log(`1. Iniciando processamento do arquivo: ${file.filename}`);

    const {
      data: { text: extractedText },
    } = await Tesseract.recognize(file.path, 'por');
    console.log(
      '2. OCR concluído. Texto extraído (início):',
      extractedText.substring(0, 50),
    );

    let llmSummary = 'Não foi possível gerar o resumo (Sem chave API).';

    if (process.env.OPENAI_API_KEY) {
      try {
        const completion = await this.openai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content:
                'Analise o texto deste documento e forneça um resumo conciso e o contexto.',
            },
            { role: 'user', content: extractedText },
          ],
          model: 'llama-3.1-8b-instant',
        });
        llmSummary =
          completion.choices[0].message.content ||
          'A IA não retornou nenhum texto.';
        console.log('3. IA concluiu a análise.');
      } catch (error) {
        console.error('Erro na OpenAI:', error);
        llmSummary = 'Erro ao contactar a IA.';
      }
    }

    return this.prisma.document.create({
      data: {
        filename: file.originalname,
        fileUrl: file.path,
        extractedText: extractedText,
        llmSummary: llmSummary,
        userId: userId,
      },
    });
  }

  async downloadDocument(documentId: string, userId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, userId: userId },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado.');
    }

    const pdfBuffer = await generateDocumentReport({
      filename: document.filename,
      createdAt: document.createdAt,
      id: document.id,
      llmSummary: document.llmSummary,
      extractedText: document.extractedText,
      fileUrl: document.fileUrl,
    });

    return {
      filename: `${document.filename}_analise.pdf`,
      content: pdfBuffer,
    };
  }
}
