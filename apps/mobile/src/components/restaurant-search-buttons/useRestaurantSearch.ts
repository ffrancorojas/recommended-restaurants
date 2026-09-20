import { Alert, Linking } from 'react-native';

export const useRestaurantSearch = (name: string, locality = '') => {
  const openSearch = async (service: 'maps' | 'google') => {
    if (!name.trim()) {
      Alert.alert(
        'Escribe primero el nombre',
        'Introduce el nombre del bar o restaurante antes de buscar.'
      );
      return;
    }

    const query = encodeURIComponent([name.trim(), locality.trim()].filter(Boolean).join(' '));
    try {
      await Linking.openURL(
        service === 'maps'
          ? `https://www.google.com/maps/search/?api=1&query=${query}`
          : `https://www.google.com/search?q=${query}`
      );
    } catch {
      Alert.alert('No se pudo abrir la búsqueda', 'Inténtalo de nuevo más tarde.');
    }
  };

  return { openSearch };
};
