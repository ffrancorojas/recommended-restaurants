import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

export const lightColors = {
  background: '#FFF9F4',
  surface: '#FFFFFF',
  text: '#24201D',
  muted: '#726963',
  placeholder: '#8A817A',
  border: '#E7DED5',
  primary: '#E85D3F',
  secondary: '#3F776C',
  softGreen: '#E1F0EB',
  softSand: '#F1E9E2',
  danger: '#A94E3D',
  onAccent: '#FFFFFF',
  map: '#276559',
} as const;

export const darkColors = {
  background: '#171B19',
  surface: '#222825',
  text: '#F6F0EB',
  muted: '#B6ACA4',
  placeholder: '#9B9189',
  border: '#3D4843',
  primary: '#FF8A70',
  secondary: '#91D4C1',
  softGreen: '#263D36',
  softSand: '#38312C',
  danger: '#FF9A87',
  onAccent: '#201713',
  map: '#91D4C1',
} as const;

export type AppColors = { [Key in keyof typeof lightColors]: string };

export function useAppColors(): AppColors {
  return useColorScheme() === 'dark' ? darkColors : lightColors;
}

export function useThemedStyles<T>(createStyles: (colors: AppColors) => T): T {
  const colors = useAppColors();
  return useMemo(() => createStyles(colors), [colors, createStyles]);
}
