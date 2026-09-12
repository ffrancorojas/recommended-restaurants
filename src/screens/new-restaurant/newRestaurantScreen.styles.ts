import { colors } from '@/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    height: 62,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  back: { color: colors.primary, fontWeight: '700', width: 56 },
  spacer: { width: 56 },
  form: { padding: 20, paddingBottom: 40 },
});
