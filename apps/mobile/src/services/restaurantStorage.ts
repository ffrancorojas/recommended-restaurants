import { Restaurant } from '@/types';
import { normalizeRestaurantPrice, normalizeRestaurantTypes } from '@restaurantes/contracts';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@restaurantes-recomendados/v1';
const SEQUENTIAL_STORAGE_KEY = '@restaurantes-recomendados/v2';
type StoredRestaurants = { items: Restaurant[]; nextId: number };

async function readStore(): Promise<StoredRestaurants> {
  const current = await AsyncStorage.getItem(SEQUENTIAL_STORAGE_KEY);
  if (current) return JSON.parse(current) as StoredRestaurants;
  const legacy = await AsyncStorage.getItem(STORAGE_KEY);
  const items = legacy ? JSON.parse(legacy) as Restaurant[] : [];
  const ordered = [...items].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  const ids = new Map(ordered.map((item, index) => [item.id, String(index + 1)]));
  const store = { items: items.map((item) => ({ ...item, id: ids.get(item.id)! })), nextId: items.length + 1 };
  await AsyncStorage.setItem(SEQUENTIAL_STORAGE_KEY, JSON.stringify(store));
  return store;
}

let pending: Promise<unknown> = Promise.resolve();
function withStore<T>(operation: (store: StoredRestaurants) => T): Promise<T> {
  const result = pending.then(async () => {
    const store = await readStore();
    const value = operation(store);
    await AsyncStorage.setItem(SEQUENTIAL_STORAGE_KEY, JSON.stringify(store));
    return value;
  });
  pending = result.catch(() => undefined);
  return result;
}

export function allocateRestaurantId(): Promise<string> {
  return withStore((store) => {
    if (!Number.isSafeInteger(store.nextId) || store.nextId < 1 || store.nextId >= Number.MAX_SAFE_INTEGER) {
      throw new Error('No se pudo generar un identificador.');
    }
    return String(store.nextId++);
  });
}

export async function loadRestaurants(): Promise<Restaurant[]> {
  const store = await readStore();
  return store.items.map((restaurant) => ({
        ...normalizeRestaurantPrice(restaurant),
        type: normalizeRestaurantTypes(restaurant.type),
        recommendedBy: restaurant.recommendedBy ?? '',
        visited: restaurant.visited ?? false,
        opinion: restaurant.opinion ?? '',
        rating: restaurant.rating ?? '',
      }));
}
export async function saveRestaurants(restaurants: Restaurant[]): Promise<void> {
  await withStore((store) => { store.items = restaurants; });
}
