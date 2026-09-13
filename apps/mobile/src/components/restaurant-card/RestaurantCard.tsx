import { AppText } from '../text';
import { useState } from 'react';
import { Alert, Linking, Pressable, View } from 'react-native';
import { styles } from './restaurantCard.styles';
import { InFoParams, RestaurantCardProps } from './restaurantCard.types';

export const RestaurantCard = ({ restaurant, onDelete, onEdit }: RestaurantCardProps) => {
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
          <AppText style={styles.title} numberOfLines={expanded ? undefined : 1} text={restaurant.name} />
        </View>
        {restaurant.visited ? (
          <View accessible accessibilityLabel="Visitado" style={styles.visitedIcon}>
            <AppText style={styles.visitedSymbol} text="✓" />
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Editar ${restaurant.name}`}
          style={styles.iconButton}
          hitSlop={4}
          onPress={onEdit}
        >
          <AppText style={styles.edit} text="✎" />
        </Pressable>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Buscar ${restaurant.name} en Google Maps`}
          style={[styles.iconButton, styles.mapsIcon]}
          hitSlop={4}
          onPress={() => openSearch('maps')}
        >
          <AppText style={styles.mapsSymbol} text="⌖" />
        </Pressable>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Buscar ${restaurant.name} en Google`}
          style={[styles.iconButton, styles.googleIcon]}
          hitSlop={4}
          onPress={() => openSearch('google')}
        >
          <AppText style={styles.googleSymbol} text="G" />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${expanded ? 'Ocultar' : 'Mostrar'} información de ${restaurant.name}`}
          accessibilityState={{ expanded }}
          style={styles.iconButton}
          hitSlop={4}
          onPress={() => setExpanded((previous) => !previous)}
        >
          <View style={[styles.chevron, expanded && styles.chevronExpanded]} />
        </Pressable>
      </View>
      <View style={styles.metadata}>
        <AppText
          style={styles.locality}
          numberOfLines={expanded ? undefined : 1}
          text={`⌖ ${restaurant.locality || 'Localidad pendiente'}`}
        />
        {restaurant.type ? <AppText style={styles.tag} text={restaurant.type} /> : null}
        {restaurant.price ? (
          <AppText style={styles.price} numberOfLines={expanded ? undefined : 1} text={restaurant.price} />
        ) : null}
      </View>
      {expanded ? (
        <View style={styles.details}>
          <Info label="Recomendado por" text={restaurant.recommendedBy} />
          <Info label="Platos recomendados" text={restaurant.dishes} />
          <Info label="Observaciones" text={restaurant.notes} />
          {restaurant.visited ? <Info label="Mi opinión" text={restaurant.opinion} /> : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Eliminar ${restaurant.name}`}
            style={styles.deleteButton}
            onPress={onDelete}
          >
            <AppText style={styles.delete} text="Eliminar" />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};
const Info = ({ label, text }: InFoParams) => {
  return text ? (
    <View style={styles.info}>
      <AppText style={styles.infoLabel} text={label} />
      <AppText style={styles.infoText} text={text} />
    </View>
  ) : null;
};
