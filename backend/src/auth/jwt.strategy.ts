// ARQUIVO: src/auth/jwt.strategy.ts

import { ExtractJwt, Strategy } from 'passport-jwt'; // <-- GARANTA QUE ESSES ESTÃO AQUI
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET não está definido no .env');
    }

    super({
      // 1. Diz ao Passport onde encontrar o token (no cabeçalho Bearer)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. Não ignora a expiração do token (Segurança!)
      ignoreExpiration: false,
      // 3. Chave Secreta para verificar a assinatura do token
      secretOrKey: secret,
    });
  }

  // Se o token for válido, este método é chamado com o payload decifrado.
  async validate(payload: { email: string; sub: string }) {
    // sub é o ID do usuário (definido no Auth Service)
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      return null;
    }

    // Retorna o objeto do usuário, que será anexado a req.user
    const { password, ...result } = user;
    return result;
  }
}
