import { AppText, RestaurantCard } from '@/components';
import { Header } from '@/screens';
import { useRestaurants } from '@/services';
import { RESTAURANT_TYPES, RestaurantFilters } from '@/types';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Keyboard, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './restaurantListScreen.styles';
import { RestaurantListScreenProps } from './restaurantListScreen.types';

const initialFilters: RestaurantFilters = { query: '', locality: '', price: '', types: [] };
export const RestaurantListScreen = ({ navigation }: RestaurantListScreenProps) => {
  const { restaurants, removeRestaurant } = useRestaurants();
  const [filters, setFilters] = useState<RestaurantFilters>(initialFilters);
  const [typesOpen, setTypesOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const activeFilterCount = [filters.query, filters.locality, filters.price].filter(Boolean).length
    + (filters.types.length ? 1 : 0);
  const results = useMemo(
    () =>
      restaurants.filter((restaurant) => {
        const words =
          `${restaurant.name} ${restaurant.locality} ${restaurant.dishes} ${restaurant.notes} ${restaurant.recommendedBy}`.toLowerCase();
        return (
          words.includes(filters.query.toLowerCase()) &&
          (!filters.locality ||
            restaurant.locality.toLowerCase().includes(filters.locality.toLowerCase())) &&
          (!filters.price ||
            restaurant.price.toLowerCase().includes(filters.price.toLowerCase())) &&
          (!filters.types.length || filters.types.includes(restaurant.type))
        );
      }),
    [restaurants, filters]
  );
  const confirmDelete = (id: string) =>
    Alert.alert('Eliminar entrada', '¿Quieres eliminar este restaurante?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => removeRestaurant(id) },
    ]);
  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Mi listado" onBack={() => navigation.goBack()} />
      <View style={styles.page}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: filtersVisible }}
          style={styles.filtersToggle}
          onPress={() => {
            Keyboard.dismiss();
            setFiltersVisible((visible) => !visible);
          }}
        >
          <AppText
            style={styles.dropdownLabel}
            text={`${filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros'}${activeFilterCount ? ` (${activeFilterCount} activos)` : ''}`}
          />
          <AppText style={styles.dropdownLabel} text={filtersVisible ? '▴' : '▾'} />
        </Pressable>
        {filtersVisible ? (
          <View>
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
                placeholder="Localidad"
                value={filters.locality}
                onChangeText={(locality) => setFilters({ ...filters, locality })}
              />
              <TextInput
                style={styles.mini}
                placeholder="Precio"
                value={filters.price}
                onChangeText={(price) => setFilters({ ...filters, price })}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Filtrar por tipos de comida"
              accessibilityState={{ expanded: typesOpen }}
              style={styles.dropdownTrigger}
              onPress={() => setTypesOpen((open) => !open)}
            >
              <AppText
                style={styles.dropdownLabel}
                text={filters.types.length ? 'Tipos de comida (' + filters.types.length + ')' : 'Todos los tipos de comida'}
              />
              <AppText style={styles.dropdownLabel} text={typesOpen ? '▴' : '▾'} />
            </Pressable>
            {typesOpen ? (
              <View style={styles.dropdown}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setFilters((current) => ({ ...current, types: [] }))}
                  style={styles.option}
                >
                  <AppText style={styles.dropdownLabel} text="Limpiar selección · Mostrar todos" />
                </Pressable>
                <ScrollView style={styles.options} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                  {RESTAURANT_TYPES.map((type) => {
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
            <RestaurantCard restaurant={item} onDelete={() => confirmDelete(item.id)} />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <AppText style={styles.emptyTitle} text="Aún no hay resultados" />
              <AppText
                style={styles.emptyText}
                text={restaurants.length ? 'Prueba a cambiar o limpiar los filtros.' : 'Añade tu primera recomendación desde Inicio.'}
              />
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};
