import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import type { AuthSession, User } from '@restaurantes/contracts';
import { DATABASE } from '../database/database.module';
import { FirebaseTokenService } from './firebase-token.service';

type UserRow = { id: string; email: string; name: string; nick: string | null; created_at: Date };
const publicUser = (user: UserRow): User => ({
  id: user.id, email: user.email, name: user.name, nick: user.nick, createdAt: user.created_at.toISOString(),
});
const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');

@Injectable()
export class AuthService {
  constructor(@Inject(DATABASE) private readonly db: Pool, private readonly firebase: FirebaseTokenService) {}

  async loginWithGoogle(idToken: string): Promise<AuthSession> {
    const identity = await this.firebase.verify(idToken);
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      // Link by immutable Firebase UID, never by an email supplied by the client.
      // Password accounts keep their data and require an explicit future migration.
      const result = await client.query<UserRow>(
        `INSERT INTO users (id, firebase_uid, email, name, email_verified_at)
         VALUES ($1, $2, $3, $4, now())
         ON CONFLICT (firebase_uid) DO UPDATE SET name = EXCLUDED.name
         RETURNING *`,
        [randomUUID(), identity.uid, identity.email, identity.name],
      );
      const user = result.rows[0];
      const accessToken = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await client.query('DELETE FROM sessions WHERE user_id = $1 AND expires_at <= now()', [user.id]);
      await client.query(
        'INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)',
        [tokenHash(accessToken), user.id, expiresAt],
      );
      await client.query('COMMIT');
      return { accessToken, expiresAt: expiresAt.toISOString(), user: publicUser(user) };
    } catch (error) {
      await client.query('ROLLBACK');
      if ((error as { code?: string }).code === '23505') {
        throw new ConflictException('Este correo ya pertenece a otra cuenta. Contacta con soporte para recuperar su acceso.');
      }
      throw error;
    } finally { client.release(); }
  }

  async authenticate(token: string): Promise<User> {
    if (!/^[a-f0-9]{64}$/.test(token)) throw new UnauthorizedException('Sesión no válida.');
    const result = await this.db.query<UserRow>(
      `SELECT u.* FROM users u JOIN sessions s ON s.user_id = u.id
       WHERE s.token_hash = $1 AND s.expires_at > now() AND u.firebase_uid IS NOT NULL`, [tokenHash(token)],
    );
    if (!result.rows[0]) throw new UnauthorizedException('La sesión ha caducado o no es válida.');
    return publicUser(result.rows[0]);
  }

  async logout(token: string): Promise<void> {
    await this.db.query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash(token)]);
  }
}
