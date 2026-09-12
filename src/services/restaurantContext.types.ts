import { Restaurant, RestaurantFormData } from '@/types';

export type RestaurantContextValue = {
  restaurants: Restaurant[];
  isLoading: boolean;
  addRestaurant: (data: RestaurantFormData) => Promise<void>;
  removeRestaurant: (id: string) => Promise<void>;
};
