import { colors } from '@/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: 'flex-start', paddingHorizontal: 20 },
  actions: { flexDirection: 'row', alignItems: 'stretch', gap: 10, marginBottom: 10 },
  addButton: {
    flex: 1,
    minWidth: 0,
    marginTop: 0,
  },
  list: { justifyContent: 'flex-start', paddingBottom: 28 },
  empty: { paddingTop: 12, alignItems: 'flex-start' },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: colors.text },
  emptyText: { fontSize: 14, color: colors.muted, marginTop: 8 },
});
