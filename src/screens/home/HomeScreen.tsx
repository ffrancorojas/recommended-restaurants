import { useRestaurants } from '@/services';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './homeScreen.styles';
import { HomeScreenProps } from './homeScreen.types';
import { AppButton } from '@/components';

export const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { restaurants } = useRestaurants();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>TU MAPA GASTRONÓMICO</Text>
        <Text style={styles.title}>Restaurantes{`\n`}recomendados</Text>
        <Text style={styles.subtitle}>
          Guarda cada sitio que quieres probar y encuéntralo cuando lo necesites.
        </Text>
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
