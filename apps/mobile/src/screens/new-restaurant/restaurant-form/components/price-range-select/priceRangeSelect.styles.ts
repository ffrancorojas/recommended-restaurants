import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    minHeight: 52, paddingHorizontal: 14, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  text: { fontSize: 15, color: colors.text, flexShrink: 1 },
  options: { marginTop: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 12, overflow: 'hidden' },
});
