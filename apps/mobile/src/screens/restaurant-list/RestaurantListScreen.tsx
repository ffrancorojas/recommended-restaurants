import { AppButton, AppText, RestaurantCard, ScreenLayout } from '@/components';
import { FlatList, View } from 'react-native';
import { createRestaurantListScreenStyles } from './restaurantListScreen.styles';
import type { RestaurantListScreenProps } from './restaurantListScreen.types';
import { useRestaurantListScreen } from './useRestaurantListScreen';
import { FilterButton, Filters } from './components';
import { useThemedStyles } from '@/theme';

export const RestaurantListScreen = ({ navigation }: RestaurantListScreenProps) => {
  const {
    filtersOpen,
    availableTypes,
    activeFilterCount,
    results,
    typesError,
    restaurants,
    filters,
    confirmDelete,
    reloadTypes,
    updateFiltersValue,
    updateFiltersOpen,
  } = useRestaurantListScreen();
  const styles = useThemedStyles(createRestaurantListScreenStyles);

  return (
    <ScreenLayout title="Mi listado" onBack={() => navigation.goBack()}>
      <View style={styles.page}>
        <View style={styles.actions}>
          <AppButton
            label="＋ Nueva entrada"
            accessibilityLabel="Añadir una entrada"
            style={styles.addButton}
            onPress={() => navigation.navigate('NewRestaurant')}
          />
          <FilterButton
            activeFilterCount={activeFilterCount}
            filtersVisible={filtersOpen.filtersVisible}
            onPress={() =>
              updateFiltersOpen({ key: 'filtersVisible', value: !filtersOpen.filtersVisible })
            }
          />
        </View>
        <Filters
          filters={filters}
          filtersOpen={filtersOpen}
          availableTypes={availableTypes}
          typesError={typesError}
          reloadTypes={reloadTypes}
          updateFiltersValue={updateFiltersValue}
          updateFiltersOpen={updateFiltersOpen}
        />
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              onDelete={() => confirmDelete(item.id)}
              onEdit={() => navigation.navigate('NewRestaurant', { restaurantId: item.id })}
              onVisit={() =>
                navigation.navigate('NewRestaurant', { restaurantId: item.id, mode: 'visit' })
              }
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <AppText style={styles.emptyTitle} text="Aún no hay resultados" />
              <AppText
                style={styles.emptyText}
                text={
                  restaurants.length
                    ? 'Prueba a cambiar o limpiar los filtros.'
                    : 'Pulsa «Nueva entrada» para añadir tu primera recomendación.'
                }
              />
            </View>
          }
        />
      </View>
    </ScreenLayout>
  );
};
