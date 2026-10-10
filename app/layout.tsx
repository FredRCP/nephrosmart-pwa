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
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: APP_NAME },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any' }, { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' }],
    shortcut: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  // Celular: barra do sistema escura (igual ao cabeçalho); tablet/desktop: azul do menu
  themeColor: [
    { media: '(max-width: 767px)', color: '#1f2937' },
    { media: '(min-width: 768px)', color: '#104E8B' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // o app ocupa a tela toda, inclusive sob a barra de status do iPhone
};

const SCRIPT_TEMA = `try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t;}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Aplica o tema salvo antes da primeira pintura: evita o fundo claro/branco piscando (e a faixa branca no iPhone) para quem usa o tema escuro */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
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
