import { RootStackParamList } from '@/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'> & {
  onLogout: () => void;
};
