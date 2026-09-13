import { Body, Controller, Get, Header, HttpCode, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ConfirmEmailDto, RegisterDto, ResendConfirmationDto } from './register.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard, AuthRequest } from './auth.guard';
import { AuthService } from './auth.service';
import { CredentialsDto } from './credentials.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  register(@Body() credentials: RegisterDto) { return this.auth.register(credentials); }

  @Post('resend-confirmation')
  @HttpCode(200)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  resend(@Body() data: ResendConfirmationDto) { return this.auth.resend(data.email); }

  @Get('confirm-email')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  @Header('Referrer-Policy', 'no-referrer')
  confirmationPage(@Query() data: ConfirmEmailDto) {
    return `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Activar cuenta</title><body><main><h1>Confirma tu correo</h1><p>Pulsa el botón para activar tu cuenta de Restaurantes recomendados.</p><form method="post" action="confirm-email"><input type="hidden" name="token" value="${data.token}"><button type="submit">Activar cuenta</button></form></main></body></html>`;
  }

  @Post('confirm-email')
  @HttpCode(200)
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  async confirmPage(@Body() data: ConfirmEmailDto) {
    const result = await this.auth.confirm(data.token);
    return `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Cuenta activada</title><body><h1>Cuenta activada</h1><p>${result.message}</p></body></html>`;
  }

  @Post('verify-email')
  @HttpCode(200)
  verify(@Body() data: ConfirmEmailDto) { return this.auth.confirm(data.token); }

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  login(@Body() credentials: CredentialsDto) { return this.auth.login(credentials); }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  me(@Req() request: AuthRequest) { return request.user; }

  @Post('logout')
  @HttpCode(204)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  logout(@Req() request: AuthRequest) { return this.auth.logout(request.token); }
}
