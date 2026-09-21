import type { AuthSession } from '@restaurantes/contracts';
import { apiFetch } from './apiConnection';

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await apiFetch(`/auth/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join('\n') : data.message ?? 'No se pudo completar la solicitud.');
  return data as T;
}

export const exchangeGoogleToken = (idToken: string) => post<AuthSession>('google', { idToken });

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) { super(message); }
}

let expiredHandler: ((token: string) => void) | undefined;
export function onSessionExpired(handler?: (token: string) => void) { expiredHandler = handler; }

export async function authenticatedRequest<T>(token: string, path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await apiFetch(path, {
    method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (response.status === 401) expiredHandler?.(token);
  if (response.status === 204) return undefined as T;
  const data = await response.json();
  if (!response.ok) throw new ApiError(data.message ?? 'No se pudo completar la solicitud.', response.status);
  return data as T;
}
