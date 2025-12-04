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
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { DocumentQueryDto } from './dto/document-query.dto';
import express from 'express';
import { CloudinaryService } from 'src/services/cloudinary.service';

@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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
      storage: memoryStorage(), // Guarda na RAM para enviar ao Cloudinary
    }),
  )
  async create(@UploadedFile() file: Express.Multer.File, @Req() req) {
    const userId = req.user.id;
    const publicUrl = await this.cloudinaryService.uploadFile(file);
    const fileData = {
      ...file,
      path: publicUrl,
      filename: file.originalname,
    };

    return this.documentsService.create(fileData, userId);
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
