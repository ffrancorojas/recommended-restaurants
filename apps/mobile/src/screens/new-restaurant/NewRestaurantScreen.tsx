import { RestaurantForm, ScreenLayout } from '@/components';
import { useRestaurants } from '@/services';
import { EMPTY_RESTAURANT_FORM, RestaurantFormData } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { styles } from './newRestaurantScreen.styles';
import { NewRestaurantScreenProps } from './newRestaurantScreen.types';

export const NewRestaurantScreen = ({ navigation, route }: NewRestaurantScreenProps) => {
  const { restaurants, addRestaurant, editRestaurant } = useRestaurants();
  const restaurantId = route.params?.restaurantId;
  const visitOnly = route.params?.mode === 'visit' && !!restaurantId;
  const [form, setForm] = useState<RestaurantFormData>(() => {
    const restaurant = restaurants.find((item) => item.id === restaurantId);
    if (!restaurant) return { ...EMPTY_RESTAURANT_FORM };
    const { name, locality, dishes, price, type, notes, recommendedBy, visited, opinion, rating } = restaurant;
    return { name, locality, dishes, price, type, notes, recommendedBy, visited: visitOnly || visited, opinion, rating: rating ?? '' };
  });
  const saving = useRef(false);
  const scroll = useRef<ScrollView>(null);
  const [opinionY, setOpinionY] = useState<number | null>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const scrolled = useRef(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  useEffect(() => {
    if (!visitOnly || scrolled.current || opinionY === null || !viewportHeight || contentHeight < opinionY + viewportHeight) return;
    const frame = requestAnimationFrame(() => {
      scroll.current?.scrollTo({ y: opinionY, animated: true });
      scrolled.current = true;
    });
    return () => cancelAnimationFrame(frame);
  }, [visitOnly, opinionY, viewportHeight, contentHeight]);
  const update = <K extends keyof RestaurantFormData,>(key: K, value: RestaurantFormData[K]) =>
    setForm((current) => {
      if (visitOnly && key !== 'opinion' && key !== 'rating') return current;
      return { ...current, [key]: value };
    });
  const save = async () => {
    if (saving.current) return;
    if (!form.name.trim())
      return Alert.alert(
        'Indica el restaurante',
        'Escribe el nombre del restaurante antes de guardar.'
      );
    if (visitOnly && !form.rating)
      return Alert.alert('Elige tu valoración', 'Elige la carita que mejor describa tu experiencia antes de guardar la visita.');
    saving.current = true;
    try {
      if (restaurantId) {
        await editRestaurant(restaurantId, visitOnly
          ? { visited: true, opinion: form.opinion, rating: form.rating }
          : { ...form, name: form.name.trim(), rating: form.visited ? form.rating : '' });
        navigation.goBack();
      } else {
        await addRestaurant({ ...form, name: form.name.trim(), rating: form.visited ? form.rating : '' });
        navigation.popTo('RestaurantList');
      }
    } catch {
      Alert.alert('No se pudo guardar', 'Los cambios no se han guardado. Inténtalo de nuevo.');
    } finally {
      saving.current = false;
    }
  };
  return (
    <ScreenLayout
      title={visitOnly ? 'Valorar visita' : restaurantId ? 'Editar restaurante' : 'Nueva entrada'}
      backLabel={restaurantId ? 'Volver' : 'Inicio'}
      onBack={() => navigation.goBack()}
      avoidKeyboard
    >
      <ScrollView ref={scroll} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled"
        onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
        onContentSizeChange={(_, height) => setContentHeight(height)}>
        <RestaurantForm value={form} onChange={update} onSave={save} visitOnly={visitOnly}
          opinionMinHeight={visitOnly ? Math.max(0, viewportHeight - 40) : undefined}
          onOpinionLayout={setOpinionY}
          legacyPrice={restaurants.find((item) => item.id === restaurantId)?.legacyPrice} />
      </ScrollView>
    </ScreenLayout>
  );
};
