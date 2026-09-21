import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseTokenService {
  async verify(idToken: string): Promise<{ uid: string; email: string; name: string }> {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      throw new ServiceUnavailableException('El acceso con Google no está configurado.');
    }
    const appName = 'auth-' + projectId;
    const app = getApps().find((candidate) => candidate.name === appName)
      ?? initializeApp({ projectId }, appName);
    let token;
    try {
      // Public Google certificates validate signature, issuer, audience and expiry.
      // No service-account private key is needed for this verification.
      token = await getAuth(app).verifyIdToken(idToken);
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === 'auth/internal-error' || code === 'app/network-error' || code === 'app/network-timeout') {
        throw new ServiceUnavailableException('No se pudo comprobar el acceso con Google. Inténtalo de nuevo.');
      }
      throw new UnauthorizedException('El acceso con Google no es válido o ha caducado.');
    }
    if (token.firebase?.sign_in_provider !== 'google.com' || token.email_verified !== true
      || typeof token.email !== 'string' || !token.email || token.email.length > 254) {
      throw new UnauthorizedException('Utiliza una cuenta de Google con correo verificado.');
    }
    return {
      uid: token.uid,
      email: token.email.trim().toLowerCase(),
      name: typeof token.name === 'string' ? token.name.trim().slice(0, 160) : '',
    };
  }
}
