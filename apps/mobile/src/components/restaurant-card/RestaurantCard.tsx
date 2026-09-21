import { RestaurantSearchButtons } from '../restaurant-search-buttons';
import { PRICE_RANGES } from '@restaurantes/contracts';
import { AppText } from '../text';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { createRestaurantCardStyles } from './restaurantCard.styles';
import type { RestaurantCardProps } from './restaurantCard.types';
import { RestaurantDetails } from './components/restaurant-details';
import { EditRestaurantButton } from './components/edit-restaurant-button';
import { ToggleRestaurantInfoButton } from './components/toggle-restaurant-info-button';
import { RestaurantVisitStatus } from './components/restaurant-visit-status';
import { useThemedStyles } from '@/theme';

export const RestaurantCard = ({ restaurant, onDelete, onEdit, onVisit }: RestaurantCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const styles = useThemedStyles(createRestaurantCardStyles);

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
        <EditRestaurantButton name={restaurant.name} onEdit={onEdit} />
        <RestaurantSearchButtons name={restaurant.name} locality={restaurant.locality} compact />
        <ToggleRestaurantInfoButton
          name={restaurant.name}
          expanded={expanded}
          onToggle={() => setExpanded((previous) => !previous)}
        />
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
          {!!restaurant.price && (
            <AppText
              style={styles.price}
              numberOfLines={expanded ? undefined : 1}
              text={
                PRICE_RANGES.find((range) => range.value === restaurant.price)?.label ??
                ''
              }
            />
          )}
        </View>
        <RestaurantVisitStatus restaurant={restaurant} onVisit={onVisit} />
      </View>
      {expanded && <RestaurantDetails restaurant={restaurant} onDelete={onDelete} />}
    </Pressable>
  );
};
