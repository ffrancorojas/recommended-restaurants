export const RESTAURANT_TYPES = [
  'Hamburguesería',
  'Sushi',
  'Carne',
  'Pescado',
  'Italiano',
  'Mexicano',
  'Tapas',
  'Vegetariano',
  'Otro',
] as const;

export type RestaurantType = (typeof RESTAURANT_TYPES)[number] | '';

export type RestaurantFormData = {
  name: string;
  locality: string;
  dishes: string;
  price: string;
  type: RestaurantType;
  notes: string;
  recommendedBy: string;
};

export type Restaurant = RestaurantFormData & { id: string; createdAt: string };

export type RestaurantFilters = {
  query: string;
  locality: string;
  price: string;
  types: RestaurantType[];
};

export const EMPTY_RESTAURANT_FORM: RestaurantFormData = {
  name: '',
  locality: '',
  dishes: '',
  price: '',
  type: '',
  notes: '',
  recommendedBy: '',
};
