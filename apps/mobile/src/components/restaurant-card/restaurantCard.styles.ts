import type { AppColors } from '@/theme';
import { StyleSheet } from 'react-native';

export const createRestaurantCardStyles = (colors: AppColors) => StyleSheet.create({
  visitStatus: { flexDirection: 'row', alignItems: 'center', height: 32, gap: 8, flexShrink: 0 },
  visitButton: { flexShrink: 0, height: 32, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 8, backgroundColor: colors.softGreen },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  top: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  nameArea: { flex: 1, minWidth: 0 },
  iconButton: {
    width: 28,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitedSymbol: { color: colors.map, fontSize: 12, fontWeight: '800' },
  chevron: {
    width: 10,
    height: 10,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.muted,
    transform: [{ rotate: '45deg' }],
  },
  chevronExpanded: { transform: [{ rotate: '225deg' }] },
  edit: { color: colors.map, fontSize: 22, fontWeight: '700' },
  title: { fontSize: 17, fontWeight: '900', color: colors.text },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 8 },
  metadata: {
    flex: 1, minWidth: 0, minHeight: 32, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6,
  },
  locality: { color: colors.muted, fontSize: 12, flexShrink: 1 },
  price: { color: colors.text, fontSize: 12, fontWeight: '700', flexShrink: 1 },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.softGreen,
    color: colors.map,
    fontWeight: '800',
    fontSize: 11,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
