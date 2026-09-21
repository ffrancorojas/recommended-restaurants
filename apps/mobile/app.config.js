const fs = require('node:fs');
const path = require('node:path');

module.exports = ({ config }) => {
  if (['preview-google', 'production-google'].includes(process.env.EAS_BUILD_PROFILE)) {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (!apiUrl || !/^https:\/\//.test(apiUrl) || !apiUrl.replace(/\/$/, '').endsWith('/api/v1')) {
      throw new Error('Define EXPO_PUBLIC_API_URL con la API HTTPS terminada en /api/v1 antes de compilar.');
    }
  }
  // EAS can supply this ignored file through a file-type environment variable.
  const googleServicesFile = process.env.GOOGLE_SERVICES_JSON || path.join(__dirname, 'google-services.json');
  let googleWebClientId;
  if (fs.existsSync(googleServicesFile)) {
    const firebase = JSON.parse(fs.readFileSync(googleServicesFile, 'utf8'));
    const client = firebase.client?.find((item) => item.client_info?.android_client_info?.package_name === config.android.package);
    if (!client) throw new Error('google-services.json no corresponde al paquete Android de la app.');
    googleWebClientId = client.oauth_client?.find((item) => item.client_type === 3)?.client_id;
    if (!googleWebClientId) throw new Error('Activa Google en Firebase y descarga de nuevo google-services.json.');
  } else if (process.env.EAS_BUILD_PLATFORM === 'android' && process.env.EXPO_PUBLIC_DEMO_ONLY !== 'true') {
    throw new Error('Configura GOOGLE_SERVICES_JSON en EAS antes de compilar el acceso con Google.');
  }
  return {
    ...config,
    android: {
      ...config.android,
      ...(googleWebClientId ? { googleServicesFile } : {}),
    },
    plugins: [
      ...(config.plugins || []),
      ...(googleWebClientId ? [
        '@react-native-firebase/app',
        '@react-native-firebase/auth',
        '@react-native-google-signin/google-signin',
      ] : []),
      'expo-secure-store',
    ],
    extra: { ...config.extra, googleWebClientId },
  };
};
