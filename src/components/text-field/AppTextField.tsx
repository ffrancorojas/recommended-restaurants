import { AppText } from '../text';
import { TextInput, View } from 'react-native';
import { styles } from './appTextField.styles';
import { AppTextFieldProps } from './appTextField.types';

export const AppTextField = ({ label, multiline, ...props }: AppTextFieldProps) => {
  return (
    <View style={styles.field}>
      <AppText style={styles.label} text={label} />
      <TextInput
        multiline={multiline}
        style={[styles.input, multiline && styles.textarea]}
        placeholderTextColor="#9A9088"
        {...props}
      />
    </View>
  );
};
