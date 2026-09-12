import { RestaurantFormData } from '@/types';

export type RestaurantFormProps = {
  value: RestaurantFormData;
  onChange: (key: keyof RestaurantFormData, value: string) => void;
  onSave: () => void;
};
