import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '@restaurantes/contracts';
import { AuthService } from './auth.service';

export type AuthRequest = Request & { user: User; token: string };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    if (
      process.env.LOCAL_AUTH_BYPASS === 'true' &&
      process.env.NODE_ENV === 'development' &&
      !process.env.VERCEL
    ) {
      request.user = await this.auth.getLocalDevelopmentUser();
      request.token = '0'.repeat(64);
      return true;
    }
    const match = /^Bearer ([a-f0-9]{64})$/i.exec(request.headers.authorization ?? '');
    if (!match) throw new UnauthorizedException('Debes iniciar sesión.');
    request.token = match[1];
    request.user = await this.auth.authenticate(request.token);
    return true;
  }
}
