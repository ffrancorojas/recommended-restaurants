import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen, NewRestaurantScreen, RestaurantListScreen } from '@/screens';
import { RootStackParamList } from '@/types';
const Stack = createNativeStackNavigator<RootStackParamList>();
export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="NewRestaurant" component={NewRestaurantScreen} />
      <Stack.Screen name="RestaurantList" component={RestaurantListScreen} />
    </Stack.Navigator>
  );
}
