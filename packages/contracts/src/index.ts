export const RESTAURANT_TYPES = [
  'Hamburguesería', 'Sushi', 'Carne', 'Pescado', 'Italiano',
  'Mexicano', 'Tapas', 'Vegetariano', 'Mediterráneo', 'Japonés', 'Chino', 'Turco', 'Otro',
] as const;

export type RestaurantType = (typeof RESTAURANT_TYPES)[number] | '';

export const RESTAURANT_RATINGS = [
  { value: 'loved', emoji: '😍', label: 'Me encantó' },
  { value: 'liked', emoji: '😊', label: 'Me gustó' },
  { value: 'neutral', emoji: '😐', label: 'Normal' },
  { value: 'disliked', emoji: '🙁', label: 'No me gustó' },
  { value: 'disappointed', emoji: '😞', label: 'Me decepcionó' },
] as const;
export type RestaurantRating = (typeof RESTAURANT_RATINGS)[number]['value'] | '';
export const RESTAURANT_RATING_VALUES = ['', ...RESTAURANT_RATINGS.map((option) => option.value)];

export type RestaurantFormData = {
  name: string;
  locality: string;
  dishes: string;
  price: string;
  type: RestaurantType;
  notes: string;
  recommendedBy: string;
  visited: boolean;
  opinion: string;
  rating: RestaurantRating;
};

// PostgreSQL genera un BIGINT consecutivo; se transporta como texto para no perder precisión en JavaScript.
export type Restaurant = RestaurantFormData & { id: string; createdAt: string };
export type User = { id: string; email: string; name: string; nick: string | null; createdAt: string };
export type Registration = Credentials & { name: string; nick: string };
export type Credentials = { email: string; password: string };
export type AuthSession = { accessToken: string; expiresAt: string; user: User };
export type RestaurantPage = { items: Restaurant[]; limit: number; offset: number };
