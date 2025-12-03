import { IsString, IsNotEmpty, MinLength } from 'class-validator';

// Garante que uma requisição recebida com o campo question siga tais determinações
export class DocumentQueryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'A pergunta deve ter pelo menos 5 caracteres.' })
  question: string;
}
