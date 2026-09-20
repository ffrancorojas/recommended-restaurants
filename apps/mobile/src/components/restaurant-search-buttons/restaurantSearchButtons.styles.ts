import { colors } from '@/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  button: {
    height: 52,
    width: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactButton: { width: 28, height: 32, borderRadius: 8 },
  mapsIcon: { backgroundColor: colors.softGreen },
  googleIcon: { backgroundColor: colors.softSand },
  mapsSymbol: { color: '#276559', fontSize: 28, fontWeight: '900' },
  googleSymbol: { color: '#4285F4', fontSize: 23, fontWeight: '900' },
  compactMapsSymbol: { fontSize: 20 },
  compactGoogleSymbol: { fontSize: 16 },
});
