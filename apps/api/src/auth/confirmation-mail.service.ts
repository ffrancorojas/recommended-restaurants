import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class ConfirmationMailService {
  async send(email: string, token: string): Promise<void> {
    const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD, MAIL_FROM, PUBLIC_API_URL } = process.env;
    if (!SMTP_HOST || !MAIL_FROM || !PUBLIC_API_URL) {
      throw new ServiceUnavailableException('El envío de correos no está configurado. Inténtalo más tarde.');
    }
    const link = new URL(`${PUBLIC_API_URL.replace(/\/$/, '')}/auth/confirm-email`);
    link.searchParams.set('token', token);
    const transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      requireTLS: process.env.NODE_ENV === 'production',
      ...(SMTP_USER ? { auth: { user: SMTP_USER, pass: SMTP_PASSWORD } } : {}),
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
    });
    try {
      const sent = await transport.sendMail({
        from: MAIL_FROM, to: email,
        subject: 'Confirma tu cuenta de Restaurantes recomendados',
        text: `Para activar tu cuenta, abre este enlace y pulsa «Activar cuenta»:\n\n${link}\n\nEl enlace caduca en 24 horas. Si no has solicitado esta cuenta, ignora este correo.`,
      });
      if (!sent.accepted.length) throw new Error('Correo rechazado');
    } catch {
      throw new ServiceUnavailableException('No se pudo enviar el correo. Inténtalo de nuevo.');
    } finally { transport.close(); }
  }
}
