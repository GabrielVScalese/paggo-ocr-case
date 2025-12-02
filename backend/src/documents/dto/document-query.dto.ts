import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class DocumentQueryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'A pergunta deve ter pelo menos 5 caracteres.' })
  question: string;
}
