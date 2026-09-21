import type { AppColors } from '@/theme';
import { StyleSheet } from 'react-native';

export const createHomeScreenStyles = (colors: AppColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 28, justifyContent: 'center' },
  footer: { paddingHorizontal: 28, paddingBottom: 16 },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.7,
    marginBottom: 14,
  },
  title: {
    color: colors.text,
    fontSize: 42,
    lineHeight: 46,
    fontWeight: '900',
    letterSpacing: -1.3,
  },
  subtitle: { color: colors.muted, fontSize: 17, lineHeight: 25, marginTop: 18, marginBottom: 28 },
});
