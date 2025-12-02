import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Get,
  Req,
  Param,
  Body,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { DocumentQueryDto } from './dto/document-query.dto';
import express from 'express';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get() // GET /documents
  @UseGuards(AuthGuard('jwt')) // Protegido!
  findAll(@Req() req) {
    // Pega o ID do usuário que o JWT validou
    const userId = req.user.id;

    // Chama o novo método com o ID do usuário
    return this.documentsService.findAll(userId);
  }

  @Post('upload')
  @UseGuards(AuthGuard('jwt')) // Garante que a requisição tem um req.user válido
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  // Recebe o arquivo E o objeto de Requisição
  create(@UploadedFile() file: Express.Multer.File, @Req() req) {
    // 1. Extrai o ID REAL do objeto de requisição (req.user foi populado pelo JWT)
    const userId = req.user.id;

    // 2. Passa o ID REAL para o serviço
    return this.documentsService.create(file, userId);
  }

  @Post(':id/query') // Rota: POST /documents/UUID-DO-DOC/query
  @UseGuards(AuthGuard('jwt'))
  async query(
    @Param('id') documentId: string,
    @Body() queryDto: DocumentQueryDto,
    @Req() req,
  ) {
    const userId = req.user.id;

    return this.documentsService.queryDocument(
      documentId,
      userId,
      queryDto.question,
    );
  }

  @Get(':id/download') // GET /documents/UUID-DO-DOC/download
  @UseGuards(AuthGuard('jwt'))
  async download(
    @Param('id') documentId: string,
    @Req() req,
    @Res() res: express.Response, // Injetar o objeto de resposta
  ) {
    const userId = req.user.id;

    // 1. Obter o conteúdo
    const downloadData = await this.documentsService.downloadDocument(
      documentId,
      userId,
    );

    // 2. Configurar os cabeçalhos para forçar o download no navegador
    res.set({
      'Content-Type': 'text/plain', // Tipo do arquivo que está sendo enviado
      'Content-Disposition': `attachment; filename="${downloadData.filename}"`, // Força o download com o nome
    });

    // 3. Enviar o conteúdo de volta
    res.status(HttpStatus.OK).send(downloadData.content);
  }
}
