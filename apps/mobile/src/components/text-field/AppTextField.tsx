import { AppText } from '../text';
import { TextInput, View } from 'react-native';
import { createAppTextFieldStyles } from './appTextField.styles';
import type { AppTextFieldProps } from '.';
import { useAppColors, useThemedStyles } from '@/theme';

export const AppTextField = ({ label, multiline, ...props }: AppTextFieldProps) => {
  const colors = useAppColors();
  const styles = useThemedStyles(createAppTextFieldStyles);
  return (
    <View style={styles.field}>
      <AppText style={styles.label} text={label} />
      <TextInput
        multiline={multiline}
        style={[styles.input, multiline && styles.textarea]}
        placeholderTextColor={colors.placeholder}
        {...props}
      />
    </View>
  );
};
