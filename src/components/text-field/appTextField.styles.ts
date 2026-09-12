import { colors } from '@/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  field: { marginBottom: 18 },
  label: { fontWeight: '800', color: '#3D3733', marginBottom: 8 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 52,
  },
  textarea: { minHeight: 105, textAlignVertical: 'top' },
});
