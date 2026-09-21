import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard, AuthRequest } from './auth.guard';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './google-login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('google')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  google(@Body() data: GoogleLoginDto) { return this.auth.loginWithGoogle(data.idToken); }

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
