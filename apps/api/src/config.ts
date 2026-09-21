import { existsSync } from 'node:fs';

if (!process.env.VERCEL && existsSync('.env')) process.loadEnvFile('.env');

export function getConfig() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || !/^postgres(ql)?:\/\//.test(databaseUrl)) {
    throw new Error('DATABASE_URL debe contener una conexión PostgreSQL válida.');
  }
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT debe estar entre 1 y 65535.');
  }
  return {
    databaseUrl,
    port,
    host: process.env.HOST ?? (process.env.VERCEL ? '0.0.0.0' : '127.0.0.1'),
    corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:8081')
      .split(',').map((origin) => origin.trim()).filter(Boolean),
  };
}
