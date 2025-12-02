// ARQUIVO: src/documents/documents.service.ts

import { Injectable } from '@nestjs/common';
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
    });
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
    /*if (process.env.OPENAI_API_KEY) {
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
          model: 'gpt-3.5-turbo', // Podes usar "gpt-3.5-turbo" se quiseres poupar créditos
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
  */

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
}
