'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { porSlug } from '@/lib/tools/catalogo';
import { primeiroNome } from '@/lib/auth/nome';
import { useSessao } from '@/lib/auth/useSessao';
import Icone from '@/components/ui/Icone';
import Logotipo from './Logotipo';
import MenuConfiguracoes, { ITENS_MENU } from './MenuConfiguracoes';

const COR_CABECALHO_CELULAR = '#1f2937'; // cabeçalho escuro do app original (celular)

// Mesmos 4 itens do menu azul do site.
const NAV = [
  { href: '/', rotulo: 'Home' },
  { href: '/funcao-renal', rotulo: 'Função Renal' },
  { href: '/ajuste-de-dose', rotulo: 'Ajuste de Dose' },
  { href: '/ferramentas', rotulo: 'Ferramentas Clínicas' },
];

const TITULOS_FIXOS: Record<string, string> = Object.fromEntries([
  ...NAV.filter((n) => n.href !== '/').map((n) => [n.href, n.rotulo]),
  ...ITENS_MENU.map((i) => [i.href, i.rotulo]),
  ['/entrar', 'Entrar'],
  ['/cadastro', 'Criar conta'],
  ['/recuperar-senha', 'Recuperar senha'],
  ['/redefinir-senha', 'Nova senha'],
  ['/conta', 'Minha conta'],
]);

function tituloDaRota(pathname: string): string {
  if (pathname.startsWith('/ferramentas/')) return porSlug(pathname.split('/')[2])?.titulo ?? 'Ferramentas Clínicas';
  const fixo = Object.keys(TITULOS_FIXOS).find((h) => pathname === h || pathname.startsWith(h + '/'));
  return fixo ? TITULOS_FIXOS[fixo] : 'NephroSmart';
}

const ativoEm = (pathname: string, href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/'));

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { colors, theme } = useTheme();
  const sessao = useSessao();
  const ehHome = pathname === '/';

  const voltar = () => (window.history.length > 1 ? router.back() : router.push('/'));

  return (
    <div className={`flex min-h-dvh flex-col ${ehHome ? 'pt-[env(safe-area-inset-top)] md:pt-0' : ''}`} style={{ background: `linear-gradient(to bottom, ${colors.gradient[0]}, ${colors.gradient[1]})` }}>
      {/* iPhone (PWA em tela cheia): faixa escura sob a hora/bateria, em todas as telas */}
      <div aria-hidden className="fixed inset-x-0 top-0 z-50 h-[env(safe-area-inset-top)] md:hidden" style={{ backgroundColor: ehHome && theme === 'dark' ? colors.gradient[0] : COR_CABECALHO_CELULAR }} />

      {/* Tablet e desktop: menu azul no topo (igual ao do site) */}
      <nav aria-label="Principal" className="sticky top-0 z-40 hidden h-14 shadow-md md:block" style={{ backgroundColor: colors.button }}>
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
          <Link href="/" aria-label="NephroSmart — início" className="shrink-0 text-white"><Logotipo /></Link>
          <div className="flex items-center gap-1">
            {NAV.map((n) => {
              const ativo = ativoEm(pathname, n.href);
              return (
                <Link key={n.href} href={n.href} aria-current={ativo ? 'page' : undefined}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  style={{ background: ativo ? 'rgba(255,255,255,0.18)' : undefined, opacity: ativo ? 1 : 0.85 }}>
                  {n.rotulo}
                </Link>
              );
            })}
            {sessao.configurado && !sessao.carregando && (
              <Link href={sessao.email ? '/conta' : '/entrar'} data-testid="atalho-conta"
                className="ml-2 max-w-40 truncate rounded-lg px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.35)' }}>
                {sessao.email ? `👤 ${primeiroNome(sessao.nome, sessao.email)}` : 'Entrar'}
              </Link>
            )}
            <div className="ml-1"><MenuConfiguracoes variante="barra" /></div>
          </div>
        </div>
      </nav>

      {/* Celular: cabeçalho escuro com botão voltar (como no app); na Home não há cabeçalho */}
      {!ehHome && (
        <header className="sticky top-0 z-30 flex h-[calc(3.5rem+env(safe-area-inset-top))] items-center px-3 pt-[env(safe-area-inset-top)] text-white md:hidden" style={{ backgroundColor: COR_CABECALHO_CELULAR }}>
          <button type="button" onClick={voltar} aria-label="Voltar" className="flex size-10 items-center justify-center rounded-full bg-white/20">
            <Icone nome="chevron-left" tamanho={18} cor="#fff" />
          </button>
          <h1 className="flex-1 truncate px-3 text-center text-lg font-bold">{tituloDaRota(pathname)}</h1>
          <span className="size-10" aria-hidden />
        </header>
      )}

      <main className="flex-1 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 md:px-10 md:pb-24">{children}</main>

      {/* Rodapé fixo na base da tela (desktop/tablet), em todas as páginas */}
      <footer className="fixed inset-x-0 bottom-0 z-30 hidden border-t px-6 py-3 text-sm md:block"
        style={{ borderColor: colors.inputBorder, color: colors.text, backgroundColor: colors.gradient[1] }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <span className="flex items-center gap-3 opacity-80">
            <img src="/images/rcp-creative.png" alt="RCP Creative" width={28} height={28} className="size-7 rounded-lg" />
            © 2026 NephroSmart — RCP Creative
          </span>
          <span className="flex gap-5 opacity-80">
            {ITENS_MENU.slice(1).map((i) => (
              <Link key={i.href} href={i.href} className="hover:underline">{i.rotulo.replace('Política de ', '')}</Link>
            ))}
            <Link href="/contato" className="hover:underline">Contato</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
