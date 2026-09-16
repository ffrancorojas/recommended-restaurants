import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme';

// A location marker with an inset confirmation represents a completed visit.
// The parent status supplies the accessible label.
export function VisitedIcon() {
  return (
    <View accessible={false} pointerEvents="none" style={styles.icon}>
      <View style={styles.ground} />
      <View style={styles.pin} />
      <View style={styles.confirmation} />
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.softGreen },
  ground: {
    position: 'absolute', left: 4, top: 21, width: 24, height: 8,
    borderWidth: 1.5, borderColor: colors.secondary, borderRadius: 12,
  },
  pin: {
    position: 'absolute', left: 7, top: 4, width: 18, height: 18,
    borderWidth: 1.8, borderColor: colors.secondary,
    borderTopLeftRadius: 10, borderTopRightRadius: 10,
    borderBottomLeftRadius: 10, borderBottomRightRadius: 1,
    backgroundColor: colors.softGreen, transform: [{ rotate: '45deg' }],
  },
  confirmation: {
    position: 'absolute', left: 13, top: 8, width: 6, height: 9,
    borderRightWidth: 1.8, borderBottomWidth: 1.8,
    borderColor: colors.secondary, transform: [{ rotate: '40deg' }],
  },
});
