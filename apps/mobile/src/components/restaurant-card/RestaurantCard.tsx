import { RatingFace } from '../rating-face/RatingFace';
import { VisitedIcon } from './VisitedIcon';
import { PRICE_RANGES, RESTAURANT_RATINGS } from '@restaurantes/contracts';
import { AppText } from '../text';
import { useState } from 'react';
import { Alert, Linking, Pressable, View } from 'react-native';
import { styles } from './restaurantCard.styles';
import type { RestaurantCardProps } from './restaurantCard.types';
import { RestaurantDetails } from './components/restaurant-details';

export const RestaurantCard = ({ restaurant, onDelete, onEdit, onVisit }: RestaurantCardProps) => {
  const rating = RESTAURANT_RATINGS.find((option) => option.value === restaurant.rating);
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
    <Pressable
      style={styles.card}
      accessible={false}
      onPress={() => setExpanded((previous) => !previous)}
    >
      <View style={styles.top}>
        <View style={styles.nameArea}>
          <AppText style={styles.title} text={restaurant.name} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Editar ${restaurant.name}`}
          style={styles.iconButton}
          hitSlop={4}
          onPress={(event) => {
            event.stopPropagation();
            onEdit();
          }}
        >
          <AppText style={styles.edit} text="✎" />
        </Pressable>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Buscar ${restaurant.name} en Google Maps`}
          style={[styles.iconButton, styles.mapsIcon]}
          hitSlop={4}
          onPress={(event) => {
            event.stopPropagation();
            void openSearch('maps');
          }}
        >
          <AppText style={styles.mapsSymbol} text="⌖" />
        </Pressable>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Buscar ${restaurant.name} en Google`}
          style={[styles.iconButton, styles.googleIcon]}
          hitSlop={4}
          onPress={(event) => {
            event.stopPropagation();
            void openSearch('google');
          }}
        >
          <AppText style={styles.googleSymbol} text="G" />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${expanded ? 'Ocultar' : 'Mostrar'} información de ${restaurant.name}`}
          accessibilityState={{ expanded }}
          style={styles.iconButton}
          hitSlop={4}
          onPress={(event) => {
            event.stopPropagation();
            setExpanded((previous) => !previous);
          }}
        >
          <View style={[styles.chevron, expanded && styles.chevronExpanded]} />
        </Pressable>
      </View>
      <View style={styles.summaryRow}>
        <View style={styles.metadata}>
          <AppText
            style={styles.locality}
            numberOfLines={expanded ? undefined : 1}
            text={`⌖ ${restaurant.locality || 'Localidad pendiente'}`}
          />
          {restaurant.type.map((type) => (
            <AppText key={type} style={styles.tag} text={type} />
          ))}
          {restaurant.price || restaurant.legacyPrice ? (
            <AppText
              style={styles.price}
              numberOfLines={expanded ? undefined : 1}
              text={PRICE_RANGES.find((range) => range.value === restaurant.price)?.label ?? restaurant.legacyPrice ?? ''}
            />
          ) : null}
        </View>
        {restaurant.visited ? (
          <View
            style={styles.visitStatus}
            accessible
            accessibilityLabel={`Visitado${rating ? `, ${rating.label}` : ''}`}
          >
            <VisitedIcon />
            {rating ? <RatingFace rating={rating.value} size={32} /> : null}
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Marcar ${restaurant.name} como visitado`}
            style={styles.visitButton}
            hitSlop={{ top: 4, bottom: 8 }}
            onPress={(event) => {
              event.stopPropagation();
              onVisit();
            }}
          >
            <AppText style={styles.visitedSymbol} text="Registrar visita" />
          </Pressable>
        )}
      </View>
      {expanded && <RestaurantDetails restaurant={restaurant} onDelete={onDelete} />}
    </Pressable>
  );
};
