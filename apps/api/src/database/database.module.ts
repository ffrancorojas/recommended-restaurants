import { Global, Injectable, Module, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import { getConfig } from '../config';

export const DATABASE = Symbol('DATABASE');

@Injectable()
class DatabasePool extends Pool implements OnModuleInit, OnApplicationShutdown {
  constructor() {
    super({ connectionString: getConfig().databaseUrl, max: 5, connectionTimeoutMillis: 15000, idleTimeoutMillis: 5000 });
    if (process.env.VERCEL) attachDatabasePool(this);
    this.on('error', () => console.error('Se perdió una conexión inactiva con PostgreSQL.'));
  }

  async onModuleInit() { await this.query('SELECT 1'); }
  async onApplicationShutdown() { await this.end(); }
}

@Global()
@Module({
  providers: [{ provide: DATABASE, useClass: DatabasePool }],
  exports: [DATABASE],
})
export class DatabaseModule {}
