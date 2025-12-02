import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs'; // Para criptografar a senha
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto'; // Iremos criar este DTO
import { LoginDto } from './dto/login.dto'; // Iremos criar este DTO
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  // Injeta o Prisma para acessar o banco
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 1. REGISTRO DE NOVO USUÁRIO
  async signUp(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    // Verifica se o usuário já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedException('O email já está em uso.');
    }

    // Criptografa a senha antes de salvar no banco (Best Practice!)
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
      },
    });
  }

  // 2. VALIDAÇÃO DE LOGIN (Sem JWT ainda, só valida a senha)
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user && (await bcrypt.compare(pass, user.password))) {
      // Se a senha for válida, retornamos o usuário, mas sem a senha criptografada
      const { password, ...result } = user;
      return result;
    }
    return null; // Senha ou email incorretos
  }

  async login(user: any) {
    // O payload é o que será criptografado no token. Usamos o ID do usuário.
    const payload = { email: user.email, sub: user.id };

    return {
      // Retornamos o token JWT
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
