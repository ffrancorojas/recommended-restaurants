import { RatingFace } from '../rating-face/RatingFace';
import { VisitedIcon } from './VisitedIcon';
import { RESTAURANT_RATINGS } from '@restaurantes/contracts';
import { AppText } from '../text';
import { useState } from 'react';
import { Alert, Linking, Pressable, View } from 'react-native';
import { styles } from './restaurantCard.styles';
import { InFoParams, RestaurantCardProps } from './restaurantCard.types';

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
          onPress={(event) => { event.stopPropagation(); onEdit(); }}
        >
          <AppText style={styles.edit} text="✎" />
        </Pressable>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Buscar ${restaurant.name} en Google Maps`}
          style={[styles.iconButton, styles.mapsIcon]}
          hitSlop={4}
          onPress={(event) => { event.stopPropagation(); void openSearch('maps'); }}
        >
          <AppText style={styles.mapsSymbol} text="⌖" />
        </Pressable>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Buscar ${restaurant.name} en Google`}
          style={[styles.iconButton, styles.googleIcon]}
          hitSlop={4}
          onPress={(event) => { event.stopPropagation(); void openSearch('google'); }}
        >
          <AppText style={styles.googleSymbol} text="G" />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${expanded ? 'Ocultar' : 'Mostrar'} información de ${restaurant.name}`}
          accessibilityState={{ expanded }}
          style={styles.iconButton}
          hitSlop={4}
          onPress={(event) => { event.stopPropagation(); setExpanded((previous) => !previous); }}
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
          {restaurant.type ? <AppText style={styles.tag} text={restaurant.type} /> : null}
          {restaurant.price ? (
            <AppText style={styles.price} numberOfLines={expanded ? undefined : 1} text={restaurant.price} />
          ) : null}
        </View>
        {restaurant.visited ? (
          <View style={styles.visitStatus} accessible accessibilityLabel={`Visitado${rating ? `, ${rating.label}` : ''}`}>
            <VisitedIcon />
            {rating ? <RatingFace rating={rating.value} size={32} /> : null}
          </View>
        ) : (
          <Pressable accessibilityRole="button" accessibilityLabel={`Marcar ${restaurant.name} como visitado`} style={styles.visitButton} hitSlop={{ top: 4, bottom: 8 }} onPress={(event) => { event.stopPropagation(); onVisit(); }}>
            <AppText style={styles.visitedSymbol} text="Registrar visita" />
          </Pressable>
        )}
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
            onPress={(event) => { event.stopPropagation(); onDelete(); }}
          >
            <AppText style={styles.delete} text="Eliminar" />
          </Pressable>
        </View>
      ) : null}
    </Pressable>
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
