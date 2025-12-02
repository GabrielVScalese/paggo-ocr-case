// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt'; // <--- Importar o JwtModule
import { ConfigModule } from '@nestjs/config'; // Usamos o ConfigModule para ler o .env
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true, // Para que possamos usar as variáveis de ambiente
    }),
    JwtModule.register({
      // Lê a chave do ambiente e define o tempo de expiração
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' }, // O token expira em 7 dias
      global: true, // O módulo JWT fica disponível em toda a aplicação
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService], // Exportamos o serviço para ser usado em outros módulos (opcional)
})
export class AuthModule {}
