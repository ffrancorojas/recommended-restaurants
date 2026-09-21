import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({ description: 'ID token de Firebase Authentication obtenido al entrar con Google.' })
  @IsString()
  @Length(20, 16384)
  @Matches(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
  idToken!: string;
}
