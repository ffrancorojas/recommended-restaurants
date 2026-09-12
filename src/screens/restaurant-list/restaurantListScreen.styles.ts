import { colors } from '@/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  page: { flex: 1, paddingHorizontal: 20 },
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 13,
    marginBottom: 10,
  },
  filters: { gap: 8, paddingBottom: 12, alignItems: 'center' },
  mini: {
    width: 115,
    height: 38,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.softSand,
  },
  chipSelected: { backgroundColor: colors.secondary },
  chipText: { fontSize: 12, fontWeight: '700', color: '#5D554F' },
  chipTextSelected: { color: colors.surface },
  list: { paddingBottom: 28 },
  empty: { paddingTop: 75, alignItems: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: colors.text },
  emptyText: { fontSize: 14, color: colors.muted, marginTop: 8 },
});
