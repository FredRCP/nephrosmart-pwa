import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NephroSmart',
    short_name: 'NephroSmart',
    description: 'Calculadoras e ferramentas clínicas de nefrologia',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'pt-BR',
    background_color: '#f3f4f6', // igual ao fim do degradê do app: sem faixa branca atrás do conteúdo no iPhone
    theme_color: '#1f2937',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
