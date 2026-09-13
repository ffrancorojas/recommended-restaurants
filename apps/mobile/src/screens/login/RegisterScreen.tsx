import { AppButton, AppText, AppTextField } from '@/components';
import { register, resendConfirmation } from '@/services/authApi';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './loginScreen.styles';

export function RegisterScreen({ onBack, onDemoLogin }: { onBack: () => void; onDemoLogin: () => void }) {
  if (process.env.EXPO_PUBLIC_REGISTRATION_ENABLED === 'true') {
    return <RegistrationForm onBack={onBack} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <AppText style={styles.title} text="Registro temporalmente no disponible" />
          <AppText style={styles.subtitle} text="Mientras tanto, puedes probar la app entrando en la demo. Los restaurantes que guardes se conservarán en este dispositivo." />
          <AppButton label="Entrar en la demo" onPress={onDemoLogin} />
          <AppButton label="Volver al acceso" variant="secondary" onPress={onBack} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RegistrationForm({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState('');
  const [nick, setNick] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const submit = async () => {
    if (submitting.current) return;
    if (!sent && (!name.trim() || !/^[a-z0-9_]{3,40}$/i.test(nick.trim()) || password.length < 12 || password.length > 128)) {
      setMessage('Indica tu nombre, un nick de 3–40 letras, números o guiones bajos y una contraseña de 12–128 caracteres.');
      return;
    }
    submitting.current = true;
    setBusy(true);
    try {
      const result = sent ? await resendConfirmation(email.trim()) : await register({ name: name.trim(), nick: nick.trim(), email: email.trim(), password });
      setMessage(result.message);
      setPassword('');
      setSent(true);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo conectar con el servidor.'); }
    finally { submitting.current = false; setBusy(false); }
  };
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <AppText style={styles.title} text={sent ? 'Revisa tu correo' : 'Crear cuenta'} />
            {sent ? <AppText style={styles.subtitle} text={`Hemos enviado un enlace a ${email}. Ábrelo y pulsa «Activar cuenta». Revisa también la carpeta de spam.`} /> : <>
              <AppTextField label="Nombre" value={name} onChangeText={setName} maxLength={160} autoComplete="name" />
              <AppTextField label="Nick" value={nick} onChangeText={setNick} maxLength={40} autoCapitalize="none" autoCorrect={false} />
              <AppTextField label="Email" value={email} onChangeText={setEmail} maxLength={254} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" />
              <AppTextField label="Contraseña" value={password} onChangeText={setPassword} maxLength={128} secureTextEntry autoCapitalize="none" autoComplete="new-password" placeholder="Al menos 12 caracteres" />
            </>}
            {message ? <AppText style={styles.notice} text={message} /> : null}
            <AppButton label={busy ? 'Enviando…' : sent ? 'Reenviar correo' : 'Registrarme'} onPress={submit} />
            <AppButton label="Volver al acceso" variant="secondary" onPress={onBack} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
