import { Restaurant } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@restaurantes-recomendados/v1';

export async function loadRestaurants(): Promise<Restaurant[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Restaurant[]) : [];
}
export async function saveRestaurants(restaurants: Restaurant[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants));
}
