import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { ConfirmationMailService } from './confirmation-mail.service';

@Module({ controllers: [AuthController], providers: [AuthService, AuthGuard, ConfirmationMailService], exports: [AuthGuard, AuthService] })
export class AuthModule {}
