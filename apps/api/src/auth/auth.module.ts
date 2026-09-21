import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { FirebaseTokenService } from './firebase-token.service';

@Module({ controllers: [AuthController], providers: [AuthService, AuthGuard, FirebaseTokenService], exports: [AuthGuard, AuthService] })
export class AuthModule {}
