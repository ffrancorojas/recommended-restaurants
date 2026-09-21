export function getApiUrl(): string {
  return (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1').replace(/\/$/, '');
}

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const baseUrl = getApiUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    return await fetch(`${baseUrl}${path}`, { ...options, signal: options?.signal ?? controller.signal });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Comprueba tu conexión y vuelve a intentarlo.');
  } finally { clearTimeout(timeout); }
}
