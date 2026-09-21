import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { AuthSession, User } from '@restaurantes/contracts';
import { ApiError, authenticatedRequest, exchangeGoogleToken } from './authApi';

const SESSION_KEY = 'restaurantes.google.session.v1';
export const googleLoginAvailable = Platform.OS === 'android'
  && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient
  && process.env.EXPO_PUBLIC_DEMO_ONLY !== 'true'
  && Boolean(Constants.expoConfig?.extra?.googleWebClientId);

// Lazy loading keeps the offline demo usable in Expo Go and on other platforms.
function nativeAuth() {
  if (!googleLoginAvailable) throw new Error('El acceso con Google estará disponible en la app Android.');
  const google = require('@react-native-google-signin/google-signin') as typeof import('@react-native-google-signin/google-signin');
  const firebase = require('@react-native-firebase/auth') as typeof import('@react-native-firebase/auth');
  google.GoogleSignin.configure({ webClientId: Constants.expoConfig?.extra?.googleWebClientId });
  return { google, firebase };
}

export async function loginWithGoogle(): Promise<AuthSession | undefined> {
  const { google, firebase } = nativeAuth();
  let session: AuthSession | undefined;
  try {
    await google.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const result = await google.GoogleSignin.signIn();
    if (result.type === 'cancelled') return;
    if (!result.data.idToken) throw new Error('No se pudo completar el acceso con Google.');
    const credential = firebase.GoogleAuthProvider.credential(result.data.idToken);
    const signedIn = await firebase.signInWithCredential(firebase.getAuth(), credential);
    const idToken = await firebase.getIdToken(signedIn.user, true);
    session = await exchangeGoogleToken(idToken);
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    return session;
  } catch (error) {
    if (session) await authenticatedRequest(session.accessToken, '/auth/logout', 'POST').catch(() => undefined);
    if (google.isErrorWithCode(error)) {
      if (error.code === google.statusCodes.SIGN_IN_CANCELLED) return;
      if (error.code === google.statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Actualiza los servicios de Google Play para iniciar sesión.');
      }
    }
    throw error;
  } finally {
    // The API session is revocable and stored securely; no Firebase session is needed afterwards.
    await firebase.signOut(firebase.getAuth()).catch(() => undefined);
    await google.GoogleSignin.signOut().catch(() => undefined);
  }
}

export async function clearSavedSession(): Promise<void> {
  if (googleLoginAvailable) await SecureStore.deleteItemAsync(SESSION_KEY);
}

export async function restoreSession(): Promise<AuthSession | undefined> {
  if (!googleLoginAvailable) return;
  const saved = await SecureStore.getItemAsync(SESSION_KEY);
  if (!saved) return;
  let session: AuthSession;
  try {
    session = JSON.parse(saved);
    if (!session || typeof session.accessToken !== 'string' || !/^[a-f0-9]{64}$/.test(session.accessToken)
      || !Number.isFinite(Date.parse(session.expiresAt)) || Date.parse(session.expiresAt) <= Date.now()) {
      throw new Error('Invalid stored session');
    }
  } catch { await clearSavedSession(); return; }
  try {
    const user = await authenticatedRequest<User>(session.accessToken, '/auth/me');
    return { ...session, user };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) { await clearSavedSession(); return; }
    throw error;
  }
}

export async function logout(session: AuthSession): Promise<void> {
  // Don't report a successful logout if the remote session couldn't be revoked.
  try { await authenticatedRequest(session.accessToken, '/auth/logout', 'POST'); }
  catch (error) { if (!(error instanceof ApiError && error.status === 401)) throw error; }
  await clearSavedSession();
}
