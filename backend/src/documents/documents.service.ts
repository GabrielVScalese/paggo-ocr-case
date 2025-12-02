// ARQUIVO: src/documents/documents.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Tesseract from 'tesseract.js'; // O pacote de OCR
import OpenAI from 'openai'; // O pacote da IA

@Injectable()
export class DocumentsService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    // Inicializamos a OpenAI lendo a chave do arquivo .env
    // Nota: Se não tiveres chave, o código vai falhar na parte do GPT
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  async findAll(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }, // Opcional: ordenar do mais recente para o mais antigo
      select: {
        // Opcional: Selecionar apenas campos relevantes para a listagem
        id: true,
        filename: true,
        createdAt: true,
        llmSummary: true,
        // Não incluir o 'extractedText' completo na lista para manter a resposta leve
      },
    });
  }

  async queryDocument(documentId: string, userId: string, question: string) {
    // 1. Buscar o Documento no Banco
    // Garantir que o documento existe E pertence ao usuário autenticado (Segurança!)
    const document = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        userId: userId,
      },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado ou acesso negado.');
    }

    // 2. Preparar o Prompt para a IA
    const context = document.extractedText;

    if (!context) {
      return {
        answer:
          'O texto do documento não foi extraído. Não é possível responder.',
      };
    }

    // 3. Chamar a IA com a Pergunta e o Contexto
    if (!process.env.OPENAI_API_KEY) {
      return { answer: 'LLM desativado. Chave de API não configurada.' };
    }

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `És um assistente analítico. Responde à pergunta do usuário APENAS com base no seguinte texto do documento: ${context}`,
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

    // --- ETAPA 1: OCR (Extrair texto da imagem) ---
    // O Tesseract lê o arquivo salvo na pasta 'uploads' e extrai o texto
    // 'eng' é inglês. Podes mudar para 'por' (português) se quiseres.
    const {
      data: { text: extractedText },
    } = await Tesseract.recognize(file.path, 'eng');
    console.log(
      '2. OCR concluído. Texto extraído (início):',
      extractedText.substring(0, 50),
    );

    // --- ETAPA 2: LLM (Gerar explicação com IA) ---
    let llmSummary = 'Não foi possível gerar o resumo (Sem chave API).';

    // Só chamamos a OpenAI se a chave estiver configurada para evitar erros
    if (process.env.OPENAI_API_KEY) {
      try {
        const completion = await this.openai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content:
                'És um assistente financeiro útil. Analisa o texto desta fatura/documento e fornece um resumo conciso e o contexto.',
            },
            { role: 'user', content: extractedText },
          ],
          model: 'llama-3.1-8b-instant', // Podes usar "gpt-3.5-turbo" se quiseres poupar créditos
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

    // --- ETAPA 4: Persistência ---
    // Salva tudo na tabela Document
    return this.prisma.document.create({
      data: {
        filename: file.originalname, // Nome original (ex: fatura.png)
        fileUrl: file.path, // Caminho no disco
        extractedText: extractedText,
        llmSummary: llmSummary,
        userId: userId,
      },
    });
  }

  async downloadDocument(documentId: string, userId: string) {
    // 1. Buscar o Documento no Banco (Verificação de Acesso)
    const document = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        userId: userId,
      },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado ou acesso negado.');
    }

    // 2. Criar o Conteúdo do Arquivo de Anexos
    const fileContent = `--- DOCUMENTO ORIGINAL: ${document.filename} ---

[Caminho do Arquivo Original: ${document.fileUrl}]
[Data de Upload: ${document.createdAt.toLocaleString()}]

-------------------------------------------------------------------
|  RESUMO DA INTELIGÊNCIA ARTIFICIAL (LLM)  |
-------------------------------------------------------------------
${document.llmSummary || 'Resumo não disponível.'}

-------------------------------------------------------------------
|  TEXTO BRUTO EXTRAÍDO POR OCR  |
-------------------------------------------------------------------
${document.extractedText || 'Texto bruto não disponível.'}
`;

    // 3. Retornar o Conteúdo e os Metadados para o Controller
    return {
      filename: `${document.filename}_analise.txt`,
      content: fileContent,
      originalFilePath: document.fileUrl,
    };
  }
}
