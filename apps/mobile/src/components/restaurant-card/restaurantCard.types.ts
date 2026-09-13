import { Restaurant } from '@/types';

export type RestaurantCardProps = {
  restaurant: Restaurant;
  onDelete: () => void;
  onEdit: () => void;
};
export type InFoParams = {
  label: string;
  text: string;
};
