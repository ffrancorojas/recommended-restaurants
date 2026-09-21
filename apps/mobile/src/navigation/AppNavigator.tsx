import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen, LoginScreen, NewRestaurantScreen, RestaurantListScreen } from '@/screens';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { RootStackParamList } from '@/types';
import { RestaurantProvider } from '@/services';
import { AppButton, AppText } from '@/components';
import type { AuthSession } from '@restaurantes/contracts';
import { onSessionExpired } from '@/services/authApi';
import { clearSavedSession, logout as closeSession, restoreSession } from '@/services/googleAuth';
import { useAppColors } from '@/theme';
const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const colors = useAppColors();
  const [demoEntered, setDemoEntered] = useState(false);
  const [session, setSession] = useState<AuthSession>();
  const [restoring, setRestoring] = useState(true);
  const [restoreError, setRestoreError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const loggingOut = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setRestoring(true);
    setRestoreError('');
    restoreSession().then((saved) => { if (!cancelled) setSession(saved); })
      .catch(() => { if (!cancelled) setRestoreError('No se pudo comprobar tu sesión. Revisa la conexión y vuelve a intentarlo.'); })
      .finally(() => { if (!cancelled) setRestoring(false); });
    return () => { cancelled = true; };
  }, [attempt]);

  useEffect(() => {
    onSessionExpired((token) => {
      if (session?.accessToken !== token) return;
      void clearSavedSession().catch(() => undefined);
      setSession(undefined);
      Alert.alert('Sesión caducada', 'Vuelve a entrar con Google para continuar.');
    });
    return () => onSessionExpired();
  }, [session]);

  const logout = async () => {
    if (loggingOut.current) return;
    loggingOut.current = true;
    try {
      if (session) await closeSession(session);
      setSession(undefined);
      setDemoEntered(false);
    } catch {
      Alert.alert('No se pudo cerrar la sesión', 'Comprueba la conexión y vuelve a intentarlo.');
    } finally { loggingOut.current = false; }
  };

  if (restoring || (restoreError && !demoEntered)) {
    return <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background }}>
      {restoring ? <ActivityIndicator color={colors.primary} accessibilityLabel="Recuperando sesión" /> : <>
        <AppText text={restoreError} />
        <AppButton label="Reintentar" onPress={() => setAttempt((value) => value + 1)} />
        <AppButton label="Entrar en la demo" variant="secondary" onPress={() => setDemoEntered(true)} />
      </>}
    </View>;
  }
  if (!demoEntered && !session) {
    return <LoginScreen onLogin={setSession} onDemoLogin={() => setDemoEntered(true)} />;
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
