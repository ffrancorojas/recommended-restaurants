import type { PropsWithChildren } from 'react';
import type { HeaderProps } from '../header';

export type ScreenLayoutProps = PropsWithChildren<HeaderProps & {
  avoidKeyboard?: boolean;
}>;
