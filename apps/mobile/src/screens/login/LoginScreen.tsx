import { AppButton, AppText, AppTextField } from '@/components';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './loginScreen.styles';
import type { LoginScreenProps } from './loginScreen.types';
import { login, resendConfirmation } from '@/services/authApi';

export const LoginScreen = ({ onDemoLogin, onRegister, onLogin }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (resend = false) => {
    if (busy) return;
    setBusy(true);
    try {
      if (resend) setMessage((await resendConfirmation(email)).message);
      else onLogin(await login({ email, password }));
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo conectar.'); }
    finally { setBusy(false); }
  };

  const enterDemo = () => {
    setEmail('');
    setPassword('');
    onDemoLogin();
  };

  if (process.env.EXPO_PUBLIC_DEMO_ONLY === 'true') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.form}>
            <AppText style={styles.eyebrow} text="RESTAURANTES RECOMENDADOS" />
            <AppText style={styles.title} text="Prueba la app" />
            <AppText style={styles.subtitle} text="Guarda tus restaurantes favoritos, anota tu opinión y encuentra dónde comer. Tus datos se guardan en este móvil y no se comparten con otras personas." />
            <AppText style={styles.notice} text="Registro temporalmente no disponible. Puedes utilizar la demo sin crear una cuenta." />
            <AppButton label="Entrar en la demo" onPress={enterDemo} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
            {message ? <AppText style={styles.notice} text={message} /> : null}
            <AppButton label={busy ? 'Conectando…' : 'Iniciar sesión'} onPress={() => submit()} />
            <AppButton label="Reenviar activación" variant="secondary" onPress={() => submit(true)} />
            <AppButton label="Entrar en la demo" onPress={enterDemo} />
            <AppButton label="Crear cuenta" variant="secondary" onPress={onRegister} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
