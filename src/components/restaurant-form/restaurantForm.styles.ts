import { colors } from '@/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  field: { marginBottom: 18 },
  label: { fontWeight: '800', color: '#3D3733', marginBottom: 8 },
  nameRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 52,
  },
  nameInput: { flex: 1 },
  searchIcon: {
    height: 52,
    width: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapsIcon: { backgroundColor: colors.softGreen },
  googleIcon: { backgroundColor: colors.softSand },
  mapsSymbol: { color: '#276559', fontSize: 28, fontWeight: '900' },
  googleSymbol: { color: '#4285F4', fontSize: 23, fontWeight: '900' },
  help: { color: '#857B73', fontSize: 12, marginTop: 7, lineHeight: 17 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: colors.softSand,
    borderRadius: 20,
  },
  chipSelected: { backgroundColor: colors.secondary },
  chipText: { color: '#5D554F', fontWeight: '700', fontSize: 13 },
  chipTextSelected: { color: colors.surface },
});
