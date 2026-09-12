import { AppButton, AppText, AppTextField } from '@/components';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './loginScreen.styles';
import type { LoginScreenProps } from './loginScreen.types';

export const LoginScreen = ({ onDemoLogin }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const enterDemo = () => {
    setEmail('');
    setPassword('');
    onDemoLogin();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <AppText style={styles.eyebrow} text="RESTAURANTES RECOMENDADOS" />
            <AppText style={styles.title} text="Bienvenido" />
            <AppText
              style={styles.subtitle}
              text="Tus próximos sitios favoritos, en un solo lugar."
            />
            <AppTextField
              label="Correo electrónico"
              accessibilityLabel="Correo electrónico"
              placeholder="tu@correo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <AppTextField
              label="Contraseña"
              accessibilityLabel="Contraseña"
              placeholder="Tu contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <AppText
              style={styles.notice}
              text="Vista de demostración: el acceso aún no está conectado. Puedes continuar sin introducir credenciales."
            />
            <AppButton label="Entrar en la demo" onPress={enterDemo} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
