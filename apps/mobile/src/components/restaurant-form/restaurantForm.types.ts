import { RestaurantFormData } from '@/types';

export type RestaurantFormProps = {
  value: RestaurantFormData;
  onChange: <K extends keyof RestaurantFormData>(key: K, value: RestaurantFormData[K]) => void;
  onSave: () => void;
  visitOnly?: boolean;
  onOpinionLayout?: (y: number) => void;
  opinionMinHeight?: number;
  legacyPrice?: string;
};
