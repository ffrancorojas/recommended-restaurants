import { AppNavigator } from '@/navigation/AppNavigator';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppColors } from '@/theme';

export default function App() {
  const colorScheme = useColorScheme();
  const colors = useAppColors();
  const baseNavigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseNavigationTheme,
    colors: {
      ...baseNavigationTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
          translucent={false}
        />
        <NavigationContainer theme={navigationTheme}>
          <AppNavigator />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}
