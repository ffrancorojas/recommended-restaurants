import { useState } from 'react';
import { Alert, Linking, Pressable, Text, View } from 'react-native';
import { styles } from './restaurantCard.styles';
import { InFoParams, RestaurantCardProps } from './restaurantCard.types';

export const RestaurantCard = ({ restaurant, onDelete }: RestaurantCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const openSearch = async (service: 'maps' | 'google') => {
    const query = encodeURIComponent(
      [restaurant.name.trim(), restaurant.locality.trim()].filter(Boolean).join(' ')
    );
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

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.nameArea}>
          <Text style={styles.title}>{restaurant.name}</Text>
        </View>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Buscar ${restaurant.name} en Google Maps`}
          style={[styles.iconButton, styles.mapsIcon]}
          onPress={() => openSearch('maps')}
        >
          <Text style={styles.mapsSymbol}>⌖</Text>
        </Pressable>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Buscar ${restaurant.name} en Google`}
          style={[styles.iconButton, styles.googleIcon]}
          onPress={() => openSearch('google')}
        >
          <Text style={styles.googleSymbol}>G</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${expanded ? 'Ocultar' : 'Mostrar'} información de ${restaurant.name}`}
          accessibilityState={{ expanded }}
          style={styles.iconButton}
          onPress={() => setExpanded((previous) => !previous)}
        >
          <View style={[styles.chevron, expanded && styles.chevronExpanded]} />
        </Pressable>
      </View>
      {expanded ? (
        <View style={styles.details}>
          <Text style={styles.locality}>⌖ {restaurant.locality || 'Localidad pendiente'}</Text>
          {restaurant.type ? <Text style={styles.tag}>{restaurant.type}</Text> : null}
          <Info label="Para pedir" text={restaurant.dishes} />
          <Info label="Precio medio" text={restaurant.price} />
          <Info label="Observaciones" text={restaurant.notes} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Eliminar ${restaurant.name}`}
            style={styles.deleteButton}
            onPress={onDelete}
          >
            <Text style={styles.delete}>Eliminar</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};
const Info = ({ label, text }: InFoParams) => {
  return text ? (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  ) : null;
};
