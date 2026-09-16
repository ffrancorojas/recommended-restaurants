import type { RestaurantRating } from '@restaurantes/contracts';
import { StyleSheet, View } from 'react-native';

type RatedValue = Exclude<RestaurantRating, ''>;

const faceColors: Record<RatedValue, string> = {
  loved: '#35B779',
  liked: '#A6D96A',
  neutral: '#F5D547',
  disliked: '#F5A04A',
  disappointed: '#ED6A64',
};
const ink = '#24201D';

// Geometry keeps the expression and traffic-light color consistent across phones.
// The containing rating button/status supplies the accessible text label.
export function RatingFace({ rating, size = 32 }: { rating: RatedValue; size?: number }) {
  const happy = rating === 'loved' || rating === 'liked';
  const neutral = rating === 'neutral';
  const mouthHeight = size * (rating === 'loved' ? 0.23 : 0.16);
  return (
    <View accessible={false} pointerEvents="none" style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: faceColors[rating], flexShrink: 0,
      borderWidth: 1, borderColor: '#24201D30',
    }}>
      {[0.29, 0.62].map((left) => (
        <View key={left} style={{
          position: 'absolute', left: size * left, top: size * 0.30,
          width: size * 0.10, height: size * 0.12,
          borderRadius: size * 0.05, backgroundColor: ink,
        }} />
      ))}
      <View style={[
        styles.mouth,
        { left: size * 0.25, width: size * 0.46, top: size * 0.58 },
        neutral ? { height: 2, backgroundColor: ink, borderRadius: 1 } : {
          height: mouthHeight,
          borderColor: ink,
          borderWidth: Math.max(1.5, size * 0.055),
          ...(happy ? {
            borderTopWidth: 0,
            borderBottomLeftRadius: size / 2,
            borderBottomRightRadius: size / 2,
          } : {
            borderBottomWidth: 0,
            borderTopLeftRadius: size / 2,
            borderTopRightRadius: size / 2,
          }),
          ...(rating === 'loved' ? { backgroundColor: ink } : {}),
        },
      ]} />
      {rating === 'disappointed' ? [0.25, 0.59].map((left, index) => (
        <View key={left} style={{ position: 'absolute', left: size * left, top: size * 0.20,
          width: size * 0.16, height: 1.5, backgroundColor: ink,
          transform: [{ rotate: index === 0 ? '-20deg' : '20deg' }],
        }} />
      )) : null}
    </View>
  );
}

const styles = StyleSheet.create({ mouth: { position: 'absolute' } });
