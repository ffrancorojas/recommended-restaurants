import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './register.dto';
import { ConfirmationMailService } from './confirmation-mail.service';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import type { AuthSession, User } from '@restaurantes/contracts';
import { DATABASE } from '../database/database.module';
import { CredentialsDto } from './credentials.dto';
import { hashPassword, verifyPassword } from './password';

type UserRow = { id: string; email: string; name: string; nick: string | null; email_verified_at: Date | null; created_at: Date; password_hash: string };
const publicUser = (user: UserRow): User => ({
  id: user.id, email: user.email, name: user.name, nick: user.nick, createdAt: user.created_at.toISOString(),
});
const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');

@Injectable()
export class AuthService {
  private readonly dummyHash = hashPassword(randomBytes(32).toString('hex'));

  constructor(@Inject(DATABASE) private readonly db: Pool, private readonly mail: ConfirmationMailService) {}

  async register(credentials: RegisterDto): Promise<{ message: string }> {
    const passwordHash = await hashPassword(credentials.password);
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query<UserRow>(
        'INSERT INTO users (id, email, password_hash, name, nick) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [randomUUID(), credentials.email, passwordHash, credentials.name, credentials.nick],
      );
      await this.sendConfirmation(result.rows[0], client);
      await client.query('COMMIT');
      return { message: 'Revisa tu correo para activar la cuenta. El enlace caduca en 24 horas.' };
    } catch (error) {
      await client.query('ROLLBACK');
      if ((error as { code?: string }).code === '23505') {
        throw new ConflictException('El correo o el nick ya están registrados.');
      }
      throw error;
    } finally { client.release(); }
  }

  async login(credentials: CredentialsDto): Promise<AuthSession> {
    const result = await this.db.query<UserRow>('SELECT * FROM users WHERE email = $1', [credentials.email]);
    const user = result.rows[0];
    const valid = await verifyPassword(credentials.password, user?.password_hash ?? await this.dummyHash);
    if (!user || !valid) throw new UnauthorizedException('Correo o contraseña incorrectos.');
    if (!user.email_verified_at) throw new ForbiddenException('Confirma tu correo antes de iniciar sesión.');
    return this.createSession(user, this.db);
  }

  private async createSession(user: UserRow, connection: Pick<Pool, 'query'>): Promise<AuthSession> {
    const accessToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await connection.query('DELETE FROM sessions WHERE user_id = $1 AND expires_at <= now()', [user.id]);
    await connection.query(
      'INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)',
      [tokenHash(accessToken), user.id, expiresAt],
    );
    return { accessToken, expiresAt: expiresAt.toISOString(), user: publicUser(user) };
  }

  async authenticate(token: string): Promise<User> {
    if (!/^[a-f0-9]{64}$/.test(token)) throw new UnauthorizedException('Sesión no válida.');
    const result = await this.db.query<UserRow>(
      `SELECT u.* FROM users u JOIN sessions s ON s.user_id = u.id
       WHERE s.token_hash = $1 AND s.expires_at > now() AND u.email_verified_at IS NOT NULL`, [tokenHash(token)],
    );
    if (!result.rows[0]) throw new UnauthorizedException('La sesión ha caducado o no es válida.');
    return publicUser(result.rows[0]);
  }

  async logout(token: string): Promise<void> {
    await this.db.query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash(token)]);
  }

  private async sendConfirmation(user: UserRow, connection: Pick<Pool, 'query'>) {
    const token = randomBytes(32).toString('hex');
    await connection.query(`INSERT INTO email_confirmations (user_id, token_hash, expires_at)
      VALUES ($1, $2, now() + interval '24 hours')
      ON CONFLICT (user_id) DO UPDATE SET token_hash = EXCLUDED.token_hash, expires_at = EXCLUDED.expires_at`,
      [user.id, tokenHash(token)]);
    await this.mail.send(user.email, token);
  }

  async resend(email: string) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query<UserRow>('SELECT * FROM users WHERE email = $1 AND email_verified_at IS NULL FOR UPDATE', [email]);
      if (result.rows[0]) {
        const recent = await client.query("SELECT 1 FROM email_confirmations WHERE user_id = $1 AND expires_at > now() + interval '23 hours 59 minutes'", [result.rows[0].id]);
        if (!recent.rows.length) await this.sendConfirmation(result.rows[0], client);
      }
      await client.query('COMMIT');
      return { message: 'Si la cuenta está pendiente de activar, recibirás un correo. Espera un minuto entre solicitudes.' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  }

  async confirm(token: string) {
    const result = await this.db.query(`WITH consumed AS (
      DELETE FROM email_confirmations WHERE token_hash = $1 AND expires_at > now() RETURNING user_id
    ) UPDATE users SET email_verified_at = now() FROM consumed WHERE users.id = consumed.user_id RETURNING users.id`, [tokenHash(token)]);
    if (!result.rowCount) throw new BadRequestException('El enlace no es válido o ha caducado. Solicita otro correo desde la app.');
    return { message: 'Cuenta activada. Ya puedes volver a la app e iniciar sesión.' };
  }
}
