import type { RestaurantFilters } from '@/types';
import { initialFilters } from './restaurantListScreen.tools';
import { useEffect, useMemo, useState } from 'react';
import { useRestaurants } from '@/services';
import { Alert } from 'react-native';
import type { FiltersOpen, KeyFiltersOpenAction, RestaurantFilterAction } from '@/types/restaurant';

export const useRestaurantListScreen = () => {
  const { restaurants, removeRestaurant, restaurantTypes, typesError, reloadTypes } =
    useRestaurants();
  const [filters, setFilters] = useState<RestaurantFilters>(initialFilters);
  const [filtersOpen, setFiltersOpen] = useState<FiltersOpen>({
    typesOpen: false,
    priceOpen: false,
    filtersVisible: false,
  });
  const activeFilterCount =
    [filters.query, filters.locality, filters.price].filter(Boolean).length +
    (filters.types.length ? 1 : 0) +
    (filters.visitedOnly ? 1 : 0);
  const matchingRestaurants = useMemo(
    () =>
      restaurants.filter((restaurant) => {
        const words =
          `${restaurant.name} ${restaurant.locality} ${restaurant.dishes} ${restaurant.notes} ${restaurant.recommendedBy}`.toLowerCase();
        return (
          (!filters.visitedOnly || restaurant.visited) &&
          words.includes(filters.query.toLowerCase()) &&
          (!filters.locality ||
            restaurant.locality.toLowerCase().includes(filters.locality.toLowerCase())) &&
          (!filters.price || restaurant.price === filters.price)
        );
      }),
    [restaurants, filters.query, filters.locality, filters.price, filters.visitedOnly]
  );

  const availableTypes = useMemo(
    () =>
      restaurantTypes.filter((type) =>
        matchingRestaurants.some((restaurant) => restaurant.type.includes(type))
      ),
    [restaurantTypes, matchingRestaurants]
  );
  const selectedTypes = filters.types.filter((type) => availableTypes.includes(type));
  const results = matchingRestaurants.filter(
    (restaurant) =>
      !selectedTypes.length || restaurant.type.some((type) => selectedTypes.includes(type))
  );
  const confirmDelete = (id: string) =>
    Alert.alert('Eliminar entrada', '¿Quieres eliminar este restaurante?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          void removeRestaurant(id).catch(() =>
            Alert.alert('No se pudo eliminar', 'Comprueba la conexión e inténtalo de nuevo.')
          );
        },
      },
    ]);

  const updateFiltersOpen = ({ key, value }: KeyFiltersOpenAction) =>
    setFiltersOpen((current) => ({
      ...current,
      ...(key === 'typesOpen' && value ? { priceOpen: false } : {}),
      ...(key === 'priceOpen' && value ? { typesOpen: false } : {}),
      [key]: value,
    }));

  const updateFiltersValue = ({ key, value }: RestaurantFilterAction) =>
    setFilters((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    setFilters((current) => {
      const types = current.types.filter((type) => availableTypes.includes(type));
      return types.length === current.types.length ? current : { ...current, types };
    });
  }, [availableTypes]);

  return {
    filters,
    filtersOpen,
    availableTypes,
    activeFilterCount,
    results,
    typesError,
    restaurants,

    confirmDelete,
    reloadTypes,
    updateFiltersValue,
    updateFiltersOpen,
  };
};
