import { AppNavigator } from '@/navigation/AppNavigator';
import { RestaurantProvider } from '@/services';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <RestaurantProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </RestaurantProvider>
    </SafeAreaProvider>
  );
}
