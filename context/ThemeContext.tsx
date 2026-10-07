'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeType = 'light' | 'dark';

export interface ThemeColors {
  gradient: string[];
  text: string;
  button: string;
  buttonText: string;
  inputBg: string;
  inputBorder: string;
  inputError: string;
  resultBg: string;
  resultBorder: string;
  resultTitle: string;
  resultText: string;
  icon: string;
  iconSecondary: string;
  modalBg: string;
  modalBorder: string;
  modalTitle: string;
  modalText: string;
  buttonPrimary: string;
  buttonSecondary: string;
  observacaoText: string;
  cardBg: string;
  cardBgAlt: string;
  placeholder: string;
  warning: string;
  warningBg: string;
  background: string;
}

export interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  toggleTheme: () => void;
}

// Mesma paleta de cores do app original (React Native), preservada 1:1
const themes: Record<ThemeType, ThemeColors> = {
  light: {
    gradient: ['#e5e7eb', '#f3f4f6'],
    text: '#104E8B',
    button: '#104E8B',
    buttonText: '#ffffff',
    inputBg: '#ffffff',
    inputBorder: '#d1d5db',
    inputError: '#ef4444',
    resultBg: '#ffffff',
    resultBorder: '#d1d5db',
    resultTitle: '#104E8B',
    resultText: '#22c55e',
    icon: '#104E8B',
    iconSecondary: '#1e293b',
    modalBg: '#ffffff',
    modalBorder: '#d1d5db',
    modalTitle: '#104E8B',
    modalText: '#4b5563',
    buttonPrimary: '#1d4ed8',
    buttonSecondary: '#9ca3af',
    observacaoText: '#4b5563',
    cardBg: '#f9f9f9',
    cardBgAlt: '#f0f0f0',
    placeholder: '#9ca3af',
    // UI-1: o original usava #ffde21 (amarelo claro) também no tema claro, com contraste baixo sobre branco.
    warning: '#b45309',
    warningBg: '#ff843f',
    background: '#ffffff',
  },
  dark: {
    gradient: ['#0f172a', '#1e293b'],
    text: '#e0f2fe',
    button: '#1d4ed8',
    buttonText: '#ffffff',
    inputBg: '#1e293b',
    inputBorder: '#334155',
    inputError: '#ef4444',
    resultBg: '#1e293b',
    resultBorder: '#334155',
    resultTitle: '#e0f2fe',
    resultText: '#22c55e',
    icon: '#94a3b8',
    iconSecondary: '#94a3b8',
    modalBg: '#1e293b',
    modalBorder: '#334155',
    modalTitle: '#e0f2fe',
    modalText: '#94a3b8',
    buttonPrimary: '#1d4ed8',
    buttonSecondary: '#475569',
    observacaoText: '#94a3b8',
    cardBg: '#2d3748',
    cardBgAlt: '#374151',
    placeholder: '#9ca3af',
    warning: '#ffde21',
    warningBg: '#ff843f',
    background: '#1e293b',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') setTheme(saved);
    setMounted(true);
  }, []);

  // Aplica a cor de fundo no <body>, equivalente ao SystemUI.setBackgroundColorAsync do RN
  useEffect(() => {
    document.body.style.backgroundColor = themes[theme].background;
    document.documentElement.dataset.theme = theme; // alimenta as variáveis CSS e o `dark:` do Tailwind
  }, [theme]);

  const toggleTheme = () => {
    const newTheme: ThemeType = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    window.localStorage.setItem('theme', newTheme);
  };

  const value: ThemeContextType = { theme, colors: themes[theme], toggleTheme };

  // Evita mismatch de hidratação SSR/CSR mostrando o tema padrão até montar
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme: 'light', colors: themes.light, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};
