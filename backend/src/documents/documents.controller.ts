import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';

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
}
