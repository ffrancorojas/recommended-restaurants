import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CredentialsDto } from './credentials.dto';

export class RegisterDto extends CredentialsDto {
  @ApiProperty({ maxLength: 160 })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name!: string;

  @ApiProperty({ minLength: 3, maxLength: 40 })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @Matches(/^[a-z0-9_]{3,40}$/)
  nick!: string;
}

export class ResendConfirmationDto {
  @ApiProperty()
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail()
  @MaxLength(254)
  email!: string;
}

export class ConfirmEmailDto {
  @ApiProperty()
  @Matches(/^[a-f0-9]{64}$/)
  token!: string;
}
