import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { loadRestaurants, saveRestaurants } from './restaurantStorage';
import { Restaurant, RestaurantFormData } from '@/types';
import { RestaurantContextValue } from './restaurantContext.types';

const RestaurantContext = createContext<RestaurantContextValue | undefined>(undefined);

export const RestaurantProvider = ({ children }: PropsWithChildren) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    loadRestaurants()
      .then(setRestaurants)
      .finally(() => setIsLoading(false));
  }, []);
  const updateRestaurants = async (next: Restaurant[]) => {
    setRestaurants(next);
    await saveRestaurants(next);
  };
  const addRestaurant = async (data: RestaurantFormData) =>
    updateRestaurants([
      { ...data, id: String(Date.now()), createdAt: new Date().toISOString() },
      ...restaurants,
    ]);
  const removeRestaurant = async (id: string) =>
    updateRestaurants(restaurants.filter((restaurant) => restaurant.id !== id));
  return (
    <RestaurantContext.Provider value={{ restaurants, isLoading, addRestaurant, removeRestaurant }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export function useRestaurants(): RestaurantContextValue {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error('useRestaurants debe usarse dentro de RestaurantProvider');
  return context;
}
