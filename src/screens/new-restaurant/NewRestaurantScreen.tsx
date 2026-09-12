import { AppText, RestaurantForm } from '@/components';
import { useRestaurants } from '@/services';
import { EMPTY_RESTAURANT_FORM, RestaurantFormData } from '@/types';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './newRestaurantScreen.styles';
import { NewRestaurantScreenProps } from './newRestaurantScreen.types';

export const NewRestaurantScreen = ({ navigation }: NewRestaurantScreenProps) => {
  const [form, setForm] = useState<RestaurantFormData>(EMPTY_RESTAURANT_FORM);
  const { addRestaurant } = useRestaurants();
  const update = (key: keyof RestaurantFormData, value: string) =>
    setForm((current) => ({ ...current, [key]: value }) as RestaurantFormData);
  const save = async () => {
    if (!form.name.trim())
      return Alert.alert(
        'Indica el restaurante',
        'Escribe el nombre del restaurante antes de guardar.'
      );
    await addRestaurant(form);
    navigation.replace('RestaurantList');
  };
  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safe}>
        <Header title="Nueva entrada" onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <RestaurantForm value={form} onChange={update} onSave={save} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};
export function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={12}>
        <AppText style={styles.back} text="‹ Inicio" />
      </Pressable>
      <AppText style={styles.headerTitle} text={title} />
      <View style={styles.spacer} />
    </View>
  );
}
