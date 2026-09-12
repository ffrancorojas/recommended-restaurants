import { colors } from '@/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  button: { borderRadius: 16, paddingVertical: 17, alignItems: 'center', marginTop: 10 },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: 'transparent' },
  text: { fontWeight: '800', fontSize: 16 },
  primaryText: { color: colors.surface },
  secondaryText: { color: colors.secondary },
});
