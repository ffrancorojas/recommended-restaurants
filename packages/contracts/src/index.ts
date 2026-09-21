export const RESTAURANT_TYPES = [
  'Hamburguesería', 'Sushi', 'Carne', 'Pescado', 'Italiano',
  'Mexicano', 'Tapas', 'Vegetariano', 'Mediterráneo', 'Japonés', 'Chino', 'Turco', 'Otro',
] as const;

export type RestaurantType = (typeof RESTAURANT_TYPES)[number];

// Convert previously saved single selections to the current array format.
export function normalizeRestaurantTypes(value: unknown): RestaurantType[] {
  const values = Array.isArray(value) ? value : typeof value === 'string' && value ? [value] : [];
  return [...new Set(values.filter((item): item is RestaurantType => RESTAURANT_TYPES.includes(item)))];
}

export const RESTAURANT_RATINGS = [
  { value: 'loved', emoji: '😍', label: 'Me encantó' },
  { value: 'liked', emoji: '😊', label: 'Me gustó' },
  { value: 'neutral', emoji: '😐', label: 'Normal' },
  { value: 'disliked', emoji: '🙁', label: 'No me gustó' },
  { value: 'disappointed', emoji: '😞', label: 'Me decepcionó' },
] as const;
export type RestaurantRating = (typeof RESTAURANT_RATINGS)[number]['value'] | '';
export const RESTAURANT_RATING_VALUES = ['', ...RESTAURANT_RATINGS.map((option) => option.value)];

export const PRICE_RANGES = [
  { value: 'under20', label: 'Menos de 20 €' },
  { value: '20to40', label: '20–40 €' },
  { value: '40to60', label: '40–60 €' },
  { value: '60to80', label: '60–80 €' },
  { value: '80to100', label: '80–100 €' },
  { value: 'over100', label: 'Más de 100 €' },
] as const;
export type PriceRange = '' | (typeof PRICE_RANGES)[number]['value'];
export const PRICE_RANGE_VALUES = ['', ...PRICE_RANGES.map((range) => range.value)];

// Discard obsolete free-text prices and remove the retired field from saved data.
export function normalizeRestaurantPrice<T extends { price: string; legacyPrice?: string }>(restaurant: T) {
  const { legacyPrice: _discarded, ...current } = restaurant;
  const valid = PRICE_RANGE_VALUES.includes(restaurant.price);
  return {
    ...current,
    price: (valid ? restaurant.price : '') as PriceRange,
  };
}

export type RestaurantFormData = {
  name: string;
  locality: string;
  dishes: string;
  price: PriceRange;
  type: RestaurantType[];
  notes: string;
  recommendedBy: string;
  visited: boolean;
  opinion: string;
  rating: RestaurantRating;
};

// PostgreSQL genera un BIGINT consecutivo; se transporta como texto para no perder precisión en JavaScript.
export type Restaurant = RestaurantFormData & { id: string; createdAt: string };
export type User = { id: string; email: string; name: string; nick: string | null; createdAt: string };
export type AuthSession = { accessToken: string; expiresAt: string; user: User };
export type RestaurantPage = { items: Restaurant[]; limit: number; offset: number };
