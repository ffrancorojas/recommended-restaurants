import { KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../header';
import { styles } from './screenLayout.styles';
import type { ScreenLayoutProps } from './screenLayout.types';

export const ScreenLayout = ({
  title,
  onBack,
  backLabel,
  avoidKeyboard = false,
  children,
}: ScreenLayoutProps) => {
  const content = (
    <SafeAreaView style={styles.safe}>
      <Header title={title} onBack={onBack} backLabel={backLabel} />
      {children}
    </SafeAreaView>
  );

  return avoidKeyboard ? (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );
};
