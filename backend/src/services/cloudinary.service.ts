import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'paggo-case',
          resource_type: 'auto',
        },
        (error, result) => {
          // 1. Caso de erro claro (rede, API key inválida, etc.)
          if (error) {
            return reject(error);
          }

          // 2. Verificação Defensiva: Garante que o objeto de resultado existe
          if (!result || !result.secure_url) {
            return reject(
              new Error(
                'Cloudinary returned success but failed to provide a public URL.',
              ),
            );
          }

          // Se tudo deu certo, resolve com a URL
          resolve(result.secure_url);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
