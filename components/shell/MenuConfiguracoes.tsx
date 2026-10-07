'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useSessao } from '@/lib/auth/useSessao';
import Icone from '@/components/ui/Icone';

// Mesmos itens do menu da engrenagem do site. "Login" entra quando o login for migrado.
export const ITENS_MENU = [
  { href: '/contato', rotulo: 'Contato', emoji: '✉️' },
  { href: '/termodeuso', rotulo: 'Termos de Uso', emoji: '📄' },
  { href: '/privacidade', rotulo: 'Política de Privacidade', emoji: '🔒' },
  { href: '/excluir-conta', rotulo: 'Excluir Conta', emoji: '🗑️' },
];

/** Engrenagem com menu: tema claro/escuro + páginas legais. `variante` muda só o visual do botão. */
export default function MenuConfiguracoes({ variante }: { variante: 'barra' | 'home' }) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme, colors } = useTheme();
  const sessao = useSessao();

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => { if (!raiz.current?.contains(e.target as Node)) setAberto(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setAberto(false); };
    document.addEventListener('mousedown', fora);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', fora); document.removeEventListener('keydown', esc); };
  }, [aberto]);

  const escuro = theme === 'dark';
  const botao =
    variante === 'barra'
      ? { className: 'flex size-9 items-center justify-center rounded-lg text-white', style: { background: aberto ? 'rgba(255,255,255,0.18)' : 'transparent' } }
      : { className: 'flex size-11 items-center justify-center rounded-xl text-white shadow', style: { background: '#104E8B' } };

  return (
    <div className="relative" ref={raiz}>
      <button type="button" onClick={() => setAberto((a) => !a)} aria-label="Configurações" aria-haspopup="menu" aria-expanded={aberto}
        className={botao.className} style={botao.style}>
        <Icone nome="cog" tamanho={20} cor="#fff" />
      </button>

      {aberto && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl text-sm shadow-xl"
          style={{ backgroundColor: colors.modalBg, border: `1px solid ${colors.modalBorder}`, color: colors.modalText }}>
          <button type="button" role="menuitem" onClick={() => { toggleTheme(); setAberto(false); }}
            className="flex w-full items-center gap-3 px-4 py-3 text-left font-medium hover:bg-black/5 dark:hover:bg-white/5"
            style={{ borderBottom: `1px solid ${colors.modalBorder}` }}>
            <span aria-hidden>{escuro ? '☀️' : '🌙'}</span>
            {escuro ? 'Tema Claro' : 'Tema Escuro'}
          </button>
          {sessao.configurado && !sessao.carregando && (
            <Link href={sessao.email ? '/conta' : '/entrar'} role="menuitem" onClick={() => setAberto(false)}
              className="flex items-center gap-2 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5">
              <span aria-hidden>👤</span>
              <span>
                {sessao.email ? 'Minha conta' : 'Entrar'}
                {sessao.email && <span className="block max-w-44 truncate text-xs opacity-70">{sessao.email}</span>}
              </span>
            </Link>
          )}
          {ITENS_MENU.map((i) => (
            <Link key={i.href} href={i.href} role="menuitem" onClick={() => setAberto(false)}
              className="flex items-center gap-2 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5">
              <span aria-hidden>{i.emoji}</span>{i.rotulo}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
