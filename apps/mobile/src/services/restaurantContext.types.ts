import { Restaurant, RestaurantFormData, RestaurantType } from '@/types';

export type RestaurantContextValue = {
  restaurants: Restaurant[];
  isLoading: boolean;
  restaurantTypes: RestaurantType[];
  typesError: string | null;
  reloadTypes: () => Promise<void>;
  addRestaurant: (data: RestaurantFormData) => Promise<void>;
  editRestaurant: (id: string, data: Partial<RestaurantFormData>) => Promise<void>;
  removeRestaurant: (id: string) => Promise<void>;
};
