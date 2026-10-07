import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@fontsource/great-vibes/400.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { SessaoProvider } from '@/lib/auth/useSessao';
import AppShell from '@/components/shell/AppShell';
import { SerwistProvider } from './serwist';
import './globals.css';

config.autoAddCss = false;

const APP_NAME = 'NephroSmart';

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: 'Calculadoras e ferramentas clínicas de nefrologia',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: APP_NAME },
  formatDetection: { telephone: false },
  icons: { apple: '/icons/apple-touch-icon.png' },
};

export const viewport: Viewport = {
  themeColor: '#104E8B',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {/* Service worker desativado em dev para não cachear enquanto você edita */}
        <SerwistProvider swUrl="/serwist/sw.js" disable={process.env.NODE_ENV === 'development'}>
          <ThemeProvider>
            <SessaoProvider>
              <AppShell>{children}</AppShell>
            </SessaoProvider>
          </ThemeProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}
