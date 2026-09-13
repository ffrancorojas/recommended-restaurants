import type { RestaurantType } from '@/types';
import { apiFetch } from './apiConnection';

export async function loadRestaurantTypes(): Promise<RestaurantType[]> {
  const response = await apiFetch('/restaurant-types');
  if (!response.ok) throw new Error('No se pudieron cargar los tipos de restaurante.');
  const types: unknown = await response.json();
  if (!Array.isArray(types) || !types.every((type) => typeof type === 'string' && type.length > 0)) {
    throw new Error('El catálogo de tipos no es válido.');
  }
  return [...new Set(types)] as RestaurantType[];
}
