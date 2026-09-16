import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { allocateRestaurantId, loadRestaurants, saveRestaurants } from './restaurantStorage';
import { Restaurant, RestaurantFormData, RestaurantType } from '@/types';
import { loadRestaurantTypes } from './restaurantTypes';
import { RestaurantContextValue } from './restaurantContext.types';
import { authenticatedRequest } from './authApi';
import type { AuthSession, RestaurantPage } from '@restaurantes/contracts';
import { RESTAURANT_TYPES } from '@restaurantes/contracts';
import { Alert } from 'react-native';

const RestaurantContext = createContext<RestaurantContextValue | undefined>(undefined);

export const RestaurantProvider = ({ children, session }: PropsWithChildren<{ session?: AuthSession }>) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restaurantTypes, setRestaurantTypes] = useState<RestaurantType[]>([]);
  const [typesError, setTypesError] = useState<string | null>(null);
  const reloadTypes = async () => {
    setTypesError(null);
    if (!session) {
      setRestaurantTypes([...RESTAURANT_TYPES]);
      return;
    }
    try {
      setRestaurantTypes(await loadRestaurantTypes());
    } catch {
      setTypesError('No se pudieron cargar los tipos. Pulsa para reintentar.');
    }
  };
  useEffect(() => { void reloadTypes(); }, []);
  useEffect(() => {
    const load = async () => {
      if (!session) return loadRestaurants();
      const items: Restaurant[] = [];
      for (let offset = 0; ; offset += 100) {
        const page = await authenticatedRequest<RestaurantPage>(session.accessToken, `/restaurants?limit=100&offset=${offset}`);
        items.push(...page.items);
        if (page.items.length < 100) return items;
      }
    };
    load()
      .then(setRestaurants)
      .catch(() => Alert.alert('No se pudo cargar el listado', 'Comprueba la conexión y vuelve a iniciar sesión.'))
      .finally(() => setIsLoading(false));
  }, []);
  const updateRestaurants = async (next: Restaurant[]) => {
    await saveRestaurants(next);
    setRestaurants(next);
  };
  const addRestaurant = async (data: RestaurantFormData) => {
    if (session) {
      const restaurant = await authenticatedRequest<Restaurant>(session.accessToken, '/restaurants', 'POST', data);
      setRestaurants((current) => [restaurant, ...current]);
      return;
    }
    const id = await allocateRestaurantId();
    await updateRestaurants([
      { ...data, id, createdAt: new Date().toISOString() },
      ...restaurants,
    ]);
  };
  const removeRestaurant = async (id: string) => {
    if (session) {
      await authenticatedRequest(session.accessToken, `/restaurants/${id}`, 'DELETE');
      setRestaurants((current) => current.filter((restaurant) => restaurant.id !== id));
      return;
    }
    await updateRestaurants(restaurants.filter((restaurant) => restaurant.id !== id));
  };
  const editRestaurant = async (id: string, data: Partial<RestaurantFormData>) => {
    if (session) {
      const updated = await authenticatedRequest<Restaurant>(session.accessToken, `/restaurants/${id}`, 'PATCH', data);
      setRestaurants((current) => current.map((restaurant) => restaurant.id === id ? updated : restaurant));
      return;
    }
    if (!restaurants.some((restaurant) => restaurant.id === id)) {
      throw new Error('El restaurante ya no existe.');
    }
    await updateRestaurants(restaurants.map((restaurant) =>
      restaurant.id === id ? { ...restaurant, ...data, id: restaurant.id, createdAt: restaurant.createdAt } : restaurant));
  };
  return (
    <RestaurantContext.Provider value={{ restaurants, isLoading, restaurantTypes, typesError, reloadTypes, addRestaurant, editRestaurant, removeRestaurant }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export function useRestaurants(): RestaurantContextValue {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error('useRestaurants debe usarse dentro de RestaurantProvider');
  return context;
}
