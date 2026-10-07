import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';

export const renderComTema = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);
