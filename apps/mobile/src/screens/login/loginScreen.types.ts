export type LoginScreenProps = {
  onLogin: (session: import('@restaurantes/contracts').AuthSession) => void;
  onDemoLogin: () => void;
};
