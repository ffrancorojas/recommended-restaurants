import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen, LoginScreen, NewRestaurantScreen, RestaurantListScreen } from '@/screens';
import { useState } from 'react';
import { RootStackParamList } from '@/types';
const Stack = createNativeStackNavigator<RootStackParamList>();
export function AppNavigator() {
  const [demoEntered, setDemoEntered] = useState(false);

  if (!demoEntered) {
    return <LoginScreen onDemoLogin={() => setDemoEntered(true)} />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Home">
        {(props) => <HomeScreen {...props} onLogout={() => setDemoEntered(false)} />}
      </Stack.Screen>
      <Stack.Screen name="NewRestaurant" component={NewRestaurantScreen} />
      <Stack.Screen name="RestaurantList" component={RestaurantListScreen} />
    </Stack.Navigator>
  );
}
