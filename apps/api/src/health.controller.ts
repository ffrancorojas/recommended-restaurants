import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Pool } from 'pg';
import { DATABASE } from './database/database.module';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@Inject(DATABASE) private readonly db: Pool) {}

  @Get()
  async check() {
    try {
      await this.db.query('SELECT 1 FROM users LIMIT 0');
      return { status: 'ok' };
    } catch { throw new ServiceUnavailableException('Base de datos no disponible o sin migraciones.'); }
  }
}
