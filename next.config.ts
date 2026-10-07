import type { NextConfig } from 'next';
import { withSerwist } from '@serwist/turbopack';

// Para abrir o servidor de desenvolvimento pelo celular (mesma rede Wi-Fi), o Next 16 exige liberar a origem.
// Padrões das redes domésticas mais comuns. Se a sua for diferente, informe o IP do PC antes de rodar:
//   $env:NEXT_DEV_ORIGINS = "10.1.1.124"
const origensExtras = (process.env.NEXT_DEV_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', ...Array.from({ length: 16 }, (_, i) => `172.${16 + i}.*.*`), ...origensExtras],
};

export default withSerwist(nextConfig);
