import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen, LoginScreen, NewRestaurantScreen, RestaurantListScreen } from '@/screens';
import { useState } from 'react';
import { RootStackParamList } from '@/types';
import { RegisterScreen } from '@/screens/login/RegisterScreen';
import { RestaurantProvider } from '@/services';
import type { AuthSession } from '@restaurantes/contracts';
import { authenticatedRequest } from '@/services/authApi';
const Stack = createNativeStackNavigator<RootStackParamList>();
export function AppNavigator() {
  const [demoEntered, setDemoEntered] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [session, setSession] = useState<AuthSession>();
  const logout = () => {
    if (session) void authenticatedRequest(session.accessToken, '/auth/logout', 'POST').catch(() => undefined);
    setSession(undefined);
    setDemoEntered(false);
  };

  if (!demoEntered && !session) {
    if (registerOpen) return <RegisterScreen onBack={() => setRegisterOpen(false)} onDemoLogin={() => { setRegisterOpen(false); setDemoEntered(true); }} />;
    return <LoginScreen onLogin={setSession} onDemoLogin={() => setDemoEntered(true)} onRegister={() => setRegisterOpen(true)} />;
  }

  return (
    <RestaurantProvider key={session?.user.id ?? 'demo'} session={session}>
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Home">
        {(props) => <HomeScreen {...props} onLogout={logout} />}
      </Stack.Screen>
      <Stack.Screen name="NewRestaurant" component={NewRestaurantScreen} />
      <Stack.Screen name="RestaurantList" component={RestaurantListScreen} />
    </Stack.Navigator>
    </RestaurantProvider>
  );
}
