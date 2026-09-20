import type { Restaurant } from '@/types';

export type RestaurantVisitStatusProps = {
  restaurant: Restaurant;
  onVisit: () => void;
};
