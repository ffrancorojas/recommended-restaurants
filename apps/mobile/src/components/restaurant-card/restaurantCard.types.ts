import { Restaurant } from '@/types';

export type RestaurantCardProps = {
  restaurant: Restaurant;
  onDelete: () => void;
  onEdit: () => void;
  onVisit: () => void;
};
