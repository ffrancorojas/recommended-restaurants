import { AppText, RestaurantForm } from '@/components';
import { useRestaurants } from '@/services';
import { EMPTY_RESTAURANT_FORM, RestaurantFormData } from '@/types';
import { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './newRestaurantScreen.styles';
import { NewRestaurantScreenProps } from './newRestaurantScreen.types';

export const NewRestaurantScreen = ({ navigation, route }: NewRestaurantScreenProps) => {
  const { restaurants, addRestaurant, editRestaurant } = useRestaurants();
  const restaurantId = route.params?.restaurantId;
  const [form, setForm] = useState<RestaurantFormData>(() => {
    const restaurant = restaurants.find((item) => item.id === restaurantId);
    if (!restaurant) return { ...EMPTY_RESTAURANT_FORM };
    const { name, locality, dishes, price, type, notes, recommendedBy, visited, opinion } = restaurant;
    return { name, locality, dishes, price, type, notes, recommendedBy, visited, opinion };
  });
  const saving = useRef(false);
  const update = <K extends keyof RestaurantFormData,>(key: K, value: RestaurantFormData[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const save = async () => {
    if (saving.current) return;
    if (!form.name.trim())
      return Alert.alert(
        'Indica el restaurante',
        'Escribe el nombre del restaurante antes de guardar.'
      );
    saving.current = true;
    try {
      if (restaurantId) {
        await editRestaurant(restaurantId, { ...form, name: form.name.trim() });
        navigation.goBack();
      } else {
        await addRestaurant({ ...form, name: form.name.trim() });
        navigation.replace('RestaurantList');
      }
    } catch {
      Alert.alert('No se pudo guardar', 'Los cambios no se han guardado. Inténtalo de nuevo.');
    } finally {
      saving.current = false;
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safe}>
        <Header title={restaurantId ? 'Editar restaurante' : 'Nueva entrada'} backLabel={restaurantId ? 'Volver' : 'Inicio'} onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <RestaurantForm value={form} onChange={update} onSave={save} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};
export function Header({ title, onBack, backLabel = 'Inicio' }: { title: string; onBack: () => void; backLabel?: string }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={12}>
        <AppText style={styles.back} text={`‹ ${backLabel}`} />
      </Pressable>
      <AppText style={styles.headerTitle} text={title} />
      <View style={styles.spacer} />
    </View>
  );
}
