import { useThemedStyles, type AppColors } from '@/theme';
import { StyleSheet } from 'react-native';

export const createRestaurantFormStyles = (colors: AppColors) => StyleSheet.create({
  disabled: { opacity: 0.5 },
  ratingOption: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 8 },
  field: { marginBottom: 18 },
  visitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  visitButton: {
    alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center',
    paddingHorizontal: 12, borderRadius: 8, backgroundColor: colors.softGreen,
  },
  visitButtonText: { color: colors.map, fontSize: 13, fontWeight: '800' },
  label: { fontWeight: '800', color: colors.text, marginBottom: 8 },
  nameRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
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
  nameInput: { flex: 1 },
  help: { color: colors.muted, fontSize: 12, marginTop: 7, lineHeight: 17 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: colors.softSand,
    borderRadius: 20,
  },
  chipSelected: { backgroundColor: colors.secondary },
  chipText: { color: colors.text, fontWeight: '700', fontSize: 13 },
  chipTextSelected: { color: colors.surface },
});

export const useRestaurantFormStyles = () => useThemedStyles(createRestaurantFormStyles);
