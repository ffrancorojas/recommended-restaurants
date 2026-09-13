export function getApiUrl(): string {
  return (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1').replace(/\/$/, '');
}

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const baseUrl = getApiUrl();
  try {
    return await fetch(`${baseUrl}${path}`, options);
  } catch {
    throw new Error(`No se pudo conectar con ${baseUrl}. Comprueba que la API está arrancada y que el móvil y el ordenador están en la misma red Wi-Fi.`);
  }
}
