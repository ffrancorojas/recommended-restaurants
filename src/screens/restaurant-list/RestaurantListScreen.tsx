import { AppText, RestaurantCard } from '@/components';
import { Header } from '@/screens';
import { useRestaurants } from '@/services';
import { RESTAURANT_TYPES, RestaurantFilters } from '@/types';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './restaurantListScreen.styles';
import { RestaurantListScreenProps } from './restaurantListScreen.types';

const initialFilters: RestaurantFilters = { query: '', locality: '', price: '', type: '' };
export const RestaurantListScreen = ({ navigation }: RestaurantListScreenProps) => {
  const { restaurants, removeRestaurant } = useRestaurants();
  const [filters, setFilters] = useState<RestaurantFilters>(initialFilters);
  const results = useMemo(
    () =>
      restaurants.filter((restaurant) => {
        const words =
          `${restaurant.name} ${restaurant.locality} ${restaurant.dishes} ${restaurant.notes}`.toLowerCase();
        return (
          words.includes(filters.query.toLowerCase()) &&
          (!filters.locality ||
            restaurant.locality.toLowerCase().includes(filters.locality.toLowerCase())) &&
          (!filters.price ||
            restaurant.price.toLowerCase().includes(filters.price.toLowerCase())) &&
          (!filters.type || restaurant.type === filters.type)
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
        <TextInput
          style={styles.search}
          placeholder="Buscar en mis recomendaciones"
          placeholderTextColor="#9A9088"
          value={filters.query}
          onChangeText={(query) => setFilters({ ...filters, query })}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
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
          {RESTAURANT_TYPES.map((type) => (
            <Pressable
              key={type}
              onPress={() => setFilters({ ...filters, type: filters.type === type ? '' : type })}
              style={[styles.chip, filters.type === type && styles.chipSelected]}
            >
              <AppText
                style={[styles.chipText, filters.type === type && styles.chipTextSelected]}
                text={type}
              />
            </Pressable>
          ))}
        </ScrollView>
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
                text="Añade tu primera recomendación desde Inicio."
              />
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};
