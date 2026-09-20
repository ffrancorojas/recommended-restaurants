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

export type RestaurantFieldProps = Pick<RestaurantFormProps, 'value' | 'onChange' | 'visitOnly'>;

export type RestaurantNameFieldProps = RestaurantFieldProps;

export type RestaurantPriceFieldProps = RestaurantFieldProps & Pick<RestaurantFormProps, 'legacyPrice'>;

export type RestaurantTypesFieldProps = Pick<RestaurantFieldProps, 'value' | 'visitOnly'> & {
  restaurantTypes: RestaurantFormData['type'];
  typesError: string | null;
  reloadTypes: () => void;
  onToggleType: (type: RestaurantFormData['type'][number]) => void;
};
