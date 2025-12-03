import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Essa classe garante uma camada de proteção sobre rotas que requerem autenticação
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET não está definido no .env');
    }

    super({
      // Diz ao Passport onde encontrar o token (no cabeçalho Bearer)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { email: string; sub: string }) {
    // sub é o ID do usuário
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
