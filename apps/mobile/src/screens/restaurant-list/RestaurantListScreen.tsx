import { AppText, RestaurantCard } from '@/components';
import { Header } from '@/screens';
import { useRestaurants } from '@/services';
import { RestaurantFilters } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Keyboard, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './restaurantListScreen.styles';
import { RestaurantListScreenProps } from './restaurantListScreen.types';
import { matchesPriceRange, PRICE_RANGES, PriceRange } from './priceRanges';

type ListFilters = Omit<RestaurantFilters, 'price'> & { price: PriceRange };
const initialFilters: ListFilters = { query: '', locality: '', price: '', types: [], visitedOnly: false };
export const RestaurantListScreen = ({ navigation }: RestaurantListScreenProps) => {
  const { restaurants, removeRestaurant, restaurantTypes, typesError, reloadTypes } = useRestaurants();
  const [filters, setFilters] = useState<ListFilters>(initialFilters);
  const [typesOpen, setTypesOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const activeFilterCount = [filters.query, filters.locality, filters.price].filter(Boolean).length
    + (filters.types.length ? 1 : 0) + (filters.visitedOnly ? 1 : 0);
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
          matchesPriceRange(restaurant.price, filters.price)
        );
      }),
    [restaurants, filters.query, filters.locality, filters.price, filters.visitedOnly]
  );
  const availableTypes = useMemo(() => restaurantTypes.filter((type) =>
    matchingRestaurants.some((restaurant) => restaurant.type === type)), [restaurantTypes, matchingRestaurants]);
  useEffect(() => {
    setFilters((current) => {
      const types = current.types.filter((type) => availableTypes.includes(type));
      return types.length === current.types.length ? current : { ...current, types };
    });
  }, [availableTypes]);
  const selectedTypes = filters.types.filter((type) => availableTypes.includes(type));
  const results = matchingRestaurants.filter((restaurant) =>
    !selectedTypes.length || selectedTypes.includes(restaurant.type));
  const confirmDelete = (id: string) =>
    Alert.alert('Eliminar entrada', '¿Quieres eliminar este restaurante?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => {
        void removeRestaurant(id).catch(() => Alert.alert('No se pudo eliminar', 'Comprueba la conexión e inténtalo de nuevo.'));
      } },
    ]);
  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Mi listado" onBack={() => navigation.goBack()} />
      <View style={styles.page}>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Añadir una entrada"
            style={styles.addButton}
            onPress={() => navigation.navigate('NewRestaurant')}
          >
            <AppText style={styles.addButtonText} text="＋ Nueva entrada" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros'}${activeFilterCount ? `, ${activeFilterCount} activos` : ''}`}
            accessibilityState={{ expanded: filtersVisible }}
            style={[styles.filtersToggle, filtersVisible && styles.filtersToggleOpen]}
            onPress={() => {
              Keyboard.dismiss();
              setFiltersVisible((visible) => !visible);
            }}
          >
            <View accessible={false} pointerEvents="none" style={styles.filterIcon}>
              <View style={styles.filterFunnel} />
              <View style={styles.filterStem} />
            </View>
            {activeFilterCount ? (
              <View style={styles.filterBadge}>
                <AppText style={styles.filterBadgeText} text={String(activeFilterCount)} />
              </View>
            ) : null}
          </Pressable>
        </View>
        {filtersVisible ? (
          <View>
            <View style={styles.dropdownTrigger}>
              <AppText style={styles.dropdownLabel} text="Solo visitados" />
              <Switch
                accessibilityLabel="Solo visitados"
                value={filters.visitedOnly}
                onValueChange={(visitedOnly) => setFilters((current) => ({ ...current, visitedOnly }))}
              />
            </View>
            <TextInput
              style={styles.search}
              placeholder="Buscar en mis recomendaciones"
              placeholderTextColor="#9A9088"
              value={filters.query}
              onChangeText={(query) => setFilters({ ...filters, query })}
            />
            <View style={styles.filters}>
              <TextInput
                style={styles.mini}
                accessibilityLabel="Filtrar por localidad"
                placeholder="Localidad: ej. Madrid"
                placeholderTextColor="#9A9088"
                value={filters.locality}
                onChangeText={(locality) => setFilters({ ...filters, locality })}
              />
              <Pressable
                style={[styles.mini, styles.priceTrigger]}
                accessibilityRole="button"
                accessibilityLabel={`Filtrar por precio: ${PRICE_RANGES.find((range) => range.value === filters.price)?.label}`}
                accessibilityState={{ expanded: priceOpen }}
                onPress={() => {
                  Keyboard.dismiss();
                  setTypesOpen(false);
                  setPriceOpen((open) => !open);
                }}
              >
                <AppText style={styles.dropdownLabel} text={PRICE_RANGES.find((range) => range.value === filters.price)?.label ?? 'Todos los precios'} />
                <AppText style={styles.dropdownLabel} text={priceOpen ? '▴' : '▾'} />
              </Pressable>
            </View>
            {priceOpen ? (
              <View style={styles.dropdown}>
                <ScrollView style={styles.options} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                  {PRICE_RANGES.map((range) => (
                    <Pressable
                      key={range.value}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: filters.price === range.value }}
                      style={[styles.option, filters.price === range.value && styles.priceOptionSelected]}
                      onPress={() => {
                        setFilters((current) => ({ ...current, price: range.value }));
                        setPriceOpen(false);
                      }}
                    >
                      <AppText style={styles.dropdownLabel} text={range.label} />
                      {filters.price === range.value ? <AppText style={styles.dropdownLabel} text="✓" /> : null}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Filtrar por tipos de comida"
              accessibilityState={{ expanded: typesOpen }}
              style={styles.dropdownTrigger}
              onPress={() => { setPriceOpen(false); setTypesOpen((open) => !open); }}
            >
              <AppText
                style={styles.dropdownLabel}
                text={filters.types.length ? 'Tipos de comida (' + filters.types.length + ')' : 'Todos los tipos de comida'}
              />
              <AppText style={styles.dropdownLabel} text={typesOpen ? '▴' : '▾'} />
            </Pressable>
            {typesOpen ? (
              <View style={styles.dropdown}>
                {typesError ? <Pressable accessibilityRole="button" onPress={reloadTypes}><AppText text={typesError} /></Pressable> : null}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setFilters((current) => ({ ...current, types: [] }))}
                  style={styles.option}
                >
                  <AppText style={styles.dropdownLabel} text="Limpiar selección · Mostrar todos" />
                </Pressable>
                <ScrollView style={styles.options} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                  {availableTypes.map((type) => {
                    const selected = filters.types.includes(type);
                    return (
                      <Pressable
                        key={type}
                        accessibilityRole="checkbox"
                        accessibilityLabel={type}
                        accessibilityState={{ checked: selected }}
                        style={styles.option}
                        onPress={() => setFilters((current) => ({
                          ...current,
                          types: current.types.includes(type)
                            ? current.types.filter((item) => item !== type)
                            : [...current.types, type],
                        }))}
                      >
                        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                          <AppText style={styles.checkmark} text={selected ? '✓' : ''} />
                        </View>
                        <AppText style={styles.dropdownLabel} text={type} />
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}
          </View>
        ) : null}
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              onDelete={() => confirmDelete(item.id)}
              onEdit={() => navigation.navigate('NewRestaurant', { restaurantId: item.id })}
              onVisit={() => navigation.navigate('NewRestaurant', { restaurantId: item.id, mode: 'visit' })}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <AppText style={styles.emptyTitle} text="Aún no hay resultados" />
              <AppText
                style={styles.emptyText}
                text={restaurants.length ? 'Prueba a cambiar o limpiar los filtros.' : 'Pulsa «Nueva entrada» para añadir tu primera recomendación.'}
              />
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};
