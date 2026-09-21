import type { AppColors } from '@/theme';
import { StyleSheet } from 'react-native';

export const createAppTextFieldStyles = (colors: AppColors) => StyleSheet.create({
  field: { marginBottom: 18 },
  label: { fontWeight: '800', color: colors.text, marginBottom: 8 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.text,
    minHeight: 52,
  },
  textarea: { minHeight: 105, textAlignVertical: 'top' },
});
