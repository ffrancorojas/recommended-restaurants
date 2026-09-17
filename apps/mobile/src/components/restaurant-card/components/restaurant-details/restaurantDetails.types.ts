import type { Restaurant } from '@/types';

export type RestaurantDetailsProps = {
  restaurant: Restaurant;
  onDelete: () => void;
};
