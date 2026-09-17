import { colors } from '@/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // page: { flex: 1, justifyContent: 'flex-start', paddingHorizontal: 20 },
  // actions: { flexDirection: 'row', alignItems: 'stretch', gap: 10, marginBottom: 10 },
  // addButton: {
  //   flex: 1,
  //   minWidth: 0,
  //   marginTop: 0,
  // },
  filtersToggle: {
    width: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filtersToggleOpen: { backgroundColor: colors.softGreen, borderColor: colors.secondary },
  filterIcon: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  filterFunnel: {
    width: 20,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.secondary,
  },
  filterStem: {
    width: 4,
    height: 7,
    backgroundColor: colors.secondary,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
  },
  filterBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  filterBadgeText: { color: colors.surface, fontSize: 10, fontWeight: '800' },
});
