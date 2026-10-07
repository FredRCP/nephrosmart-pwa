import { spawnSync } from 'node:child_process';
import { createSerwistRoute } from '@serwist/turbopack';
import { ferramentasDisponiveis } from '@/lib/tools/catalogo';

// Versiona as páginas pré-cacheadas (evita servir cache desatualizado após deploy)
const revision =
  spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' }).stdout?.trim() || crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  additionalPrecacheEntries: [
    { url: '/~offline', revision },
    { url: '/', revision },
    { url: '/ferramentas', revision },
    { url: '/funcao-renal', revision },
    { url: '/ajuste-de-dose', revision },
    { url: '/contato', revision },
    { url: '/termodeuso', revision },
    { url: '/privacidade', revision },
    { url: '/excluir-conta', revision },
    { url: '/images/ns1a.webp', revision },
    { url: '/images/rcp-creative.png', revision },
    // todas as ferramentas migradas ficam disponíveis offline
    ...ferramentasDisponiveis.map((f) => ({ url: `/ferramentas/${f.slug}`, revision })),
  ],
  swSrc: 'app/sw.ts',
  useNativeEsbuild: true,
});
