import type { AuthSession, Credentials, Registration } from '@restaurantes/contracts';
import { apiFetch } from './apiConnection';

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await apiFetch(`/auth/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join('\n') : data.message ?? 'No se pudo completar la solicitud.');
  return data as T;
}

export const register = (data: Registration) => post<{ message: string }>('register', data);
export const login = (data: Credentials) => post<AuthSession>('login', data);
export const resendConfirmation = (email: string) => post<{ message: string }>('resend-confirmation', { email });

export async function authenticatedRequest<T>(token: string, path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await apiFetch(path, {
    method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (response.status === 204) return undefined as T;
  const data = await response.json();
  if (!response.ok) throw new Error(data.message ?? 'No se pudo completar la solicitud.');
  return data as T;
}
