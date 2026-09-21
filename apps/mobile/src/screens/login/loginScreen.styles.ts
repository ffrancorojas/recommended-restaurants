import type { AppColors } from '@/theme';
import { StyleSheet } from 'react-native';

export const createLoginScreenStyles = (colors: AppColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  keyboard: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40 },
  form: { width: '100%', maxWidth: 440, alignSelf: 'center' },
  eyebrow: { color: colors.secondary, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  title: { color: colors.text, fontSize: 34, fontWeight: '900', marginTop: 16 },
  subtitle: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 10, marginBottom: 32 },
  notice: { color: colors.muted, fontSize: 13, lineHeight: 19, marginBottom: 16 },
});
