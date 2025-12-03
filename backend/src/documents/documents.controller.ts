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

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Req() req) {
    const userId = req.user.id;

    return this.documentsService.findAll(userId);
  }

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
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
  create(@UploadedFile() file: Express.Multer.File, @Req() req) {
    // req.user foi populado pelo JWT
    const userId = req.user.id;

    return this.documentsService.create(file, userId);
  }

  @Post(':id/query')
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

  @Get(':id/download')
  @UseGuards(AuthGuard('jwt'))
  async download(
    @Param('id') documentId: string,
    @Req() req,
    @Res() res: express.Response,
  ) {
    const userId = req.user.id;

    const downloadData = await this.documentsService.downloadDocument(
      documentId,
      userId,
    );

    // Configurar os cabeçalhos para forçar o download no navegador
    res.set({
      'Content-Type': 'text/plain', // Tipo do arquivo que está sendo enviado
      'Content-Disposition': `attachment; filename="${downloadData.filename}"`, // Força o download com o nome
    });

    res.status(HttpStatus.OK).send(downloadData.content);
  }
}
