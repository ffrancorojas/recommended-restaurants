import { RestaurantSearchButtons } from '../restaurant-search-buttons';
import { RatingFace } from '../rating-face/RatingFace';
import { VisitedIcon } from './VisitedIcon';
import { PRICE_RANGES, RESTAURANT_RATINGS } from '@restaurantes/contracts';
import { AppText } from '../text';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { styles } from './restaurantCard.styles';
import type { RestaurantCardProps } from './restaurantCard.types';
import { RestaurantDetails } from './components/restaurant-details';

export const RestaurantCard = ({ restaurant, onDelete, onEdit, onVisit }: RestaurantCardProps) => {
  const rating = RESTAURANT_RATINGS.find((option) => option.value === restaurant.rating);
  const [expanded, setExpanded] = useState(false);

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
        <RestaurantSearchButtons name={restaurant.name} locality={restaurant.locality} compact />
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
