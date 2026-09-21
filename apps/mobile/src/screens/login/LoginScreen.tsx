import { AppButton, AppText } from '@/components';
import { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createLoginScreenStyles } from './loginScreen.styles';
import type { LoginScreenProps } from './loginScreen.types';
import { googleLoginAvailable, loginWithGoogle } from '@/services/googleAuth';
import { useThemedStyles } from '@/theme';

export const LoginScreen = ({ onDemoLogin, onLogin }: LoginScreenProps) => {
  const styles = useThemedStyles(createLoginScreenStyles);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const submit = async () => {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setMessage('');
    try {
      const session = await loginWithGoogle();
      if (session) onLogin(session);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo iniciar sesión. Inténtalo de nuevo.');
    } finally { submitting.current = false; setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <AppText style={styles.eyebrow} text="RESTAURANTES RECOMENDADOS" />
          <AppText style={styles.title} text={googleLoginAvailable ? 'Bienvenido' : 'Prueba la app'} />
          <AppText style={styles.subtitle} text="Tus próximos sitios favoritos, en un solo lugar." />
          {googleLoginAvailable ? <>
            <AppText style={styles.notice} text="Entra con tu cuenta de Google para guardar tus restaurantes y recuperarlos en otro móvil." />
            <AppButton label={busy ? 'Conectando…' : 'Continuar con Google'} onPress={submit} disabled={busy} />
          </> : <AppText style={styles.notice} text="En esta versión puedes utilizar la demo. El acceso con Google estará disponible en la app Android completa." />}
          {message ? <AppText style={styles.notice} text={message} /> : null}
          <AppButton label="Entrar en la demo" variant="secondary" onPress={onDemoLogin} disabled={busy} />
          <AppText style={styles.notice} text="La demo guarda los datos solo en este móvil. No se añaden a tu cuenta de Google." />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
