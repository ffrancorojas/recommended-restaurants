import { useRestaurants } from '@/services';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './homeScreen.styles';
import { HomeScreenProps } from './homeScreen.types';
import { AppText, AppButton } from '@/components';

export const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { restaurants } = useRestaurants();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <AppText style={styles.eyebrow} text="TU MAPA GASTRONÓMICO" />
        <AppText style={styles.title} text={`Restaurantes\nrecomendados`} />
        <AppText
          style={styles.subtitle}
          text="Guarda cada sitio que quieres probar y encuéntralo cuando lo necesites."
        />
        <AppButton label="＋ Nueva entrada" onPress={() => navigation.navigate('NewRestaurant')} />
        <AppButton
          label={`Ver listado (${restaurants.length})`}
          variant="secondary"
          onPress={() => navigation.navigate('RestaurantList')}
        />
      </View>
    </SafeAreaView>
  );
};
