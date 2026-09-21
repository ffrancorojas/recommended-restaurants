import { KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../header';
import { createScreenLayoutStyles } from './screenLayout.styles';
import type { ScreenLayoutProps } from './screenLayout.types';
import { useThemedStyles } from '@/theme';

export const ScreenLayout = ({
  title,
  onBack,
  backLabel,
  avoidKeyboard = false,
  children,
}: ScreenLayoutProps) => {
  const styles = useThemedStyles(createScreenLayoutStyles);
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
