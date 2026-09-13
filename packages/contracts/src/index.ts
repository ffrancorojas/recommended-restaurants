export const RESTAURANT_TYPES = [
  'Hamburguesería', 'Sushi', 'Carne', 'Pescado', 'Italiano',
  'Mexicano', 'Tapas', 'Vegetariano', 'Otro',
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
  visited: boolean;
  opinion: string;
};

// PostgreSQL genera un BIGINT consecutivo; se transporta como texto para no perder precisión en JavaScript.
export type Restaurant = RestaurantFormData & { id: string; createdAt: string };
export type User = { id: string; email: string; name: string; nick: string | null; createdAt: string };
export type Registration = Credentials & { name: string; nick: string };
export type Credentials = { email: string; password: string };
export type AuthSession = { accessToken: string; expiresAt: string; user: User };
export type RestaurantPage = { items: Restaurant[]; limit: number; offset: number };
