'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { canAccess } from '@/lib/access/canAccess';
import { useSessao } from '@/lib/auth/useSessao';
import { filtrarFerramentas } from '@/lib/tools/catalogo';
import { FILTROS, corDaCategoria } from '@/lib/tools/categorias';
import type { Ferramenta, FiltroId } from '@/lib/tools/tipos';
import { gravarLocal, lerJson } from '@/lib/storage';
import Icone from '@/components/ui/Icone';

const CHAVE_FAVORITOS = 'favoritos';

export default function ListaFerramentas({ ferramentas }: { ferramentas: Ferramenta[] }) {
  const { colors } = useTheme();
  const sessao = useSessao();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<FiltroId>('todos');
  const [favoritos, setFavoritos] = useState<string[]>([]);

  useEffect(() => { setFavoritos(lerJson<string[]>(CHAVE_FAVORITOS, [])); }, []);

  const alternarFavorito = (slug: string) => {
    const novo = favoritos.includes(slug) ? favoritos.filter((f) => f !== slug) : [...favoritos, slug];
    setFavoritos(novo);
    gravarLocal(CHAVE_FAVORITOS, JSON.stringify(novo));
  };

  const lista = useMemo(() => filtrarFerramentas(ferramentas, filtro, busca), [ferramentas, filtro, busca]);
  const favs = lista.filter((f) => favoritos.includes(f.slug));
  const outras = lista.filter((f) => !favoritos.includes(f.slug));

  const card = (f: Ferramenta) => {
    const borda = filtro === 'todos' ? corDaCategoria(f.categorias[0]) : corDaCategoria(filtro);
    const fav = favoritos.includes(f.slug);
    return (
      <li key={f.slug} className="relative">
        <Link href={`/ferramentas/${f.slug}`}
          className="flex h-[88px] flex-col justify-center rounded-xl px-4 py-2 pr-14 shadow-md transition-transform active:scale-[0.99]"
          style={{ backgroundColor: colors.inputBg, borderLeft: `4px solid ${borda}` }}>
          <span className="mb-0.5 flex items-center gap-2 text-base font-semibold" style={{ color: colors.text }}>
            <span className="truncate">{f.titulo}</span>
            {!sessao.carregando && !canAccess(f.slug, sessao.plano) && (
              <span aria-label="Ferramenta Premium" className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold"
                style={{ backgroundColor: colors.button, color: colors.buttonText }}>🔒 Premium</span>
            )}
          </span>
          <span className="line-clamp-2 text-sm leading-[18px] opacity-80" style={{ color: colors.text }}>{f.descricao}</span>
        </Link>
        <button type="button" onClick={() => alternarFavorito(f.slug)} aria-pressed={fav}
          aria-label={fav ? `Remover ${f.titulo} dos favoritos` : `Adicionar ${f.titulo} aos favoritos`}
          className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full">
          <Icone nome="star" tamanho={21} cor={fav ? '#FFD700' : colors.text} />
        </button>
      </li>
    );
  };

  const secao = (titulo: string, itens: Ferramenta[]) => (
    <>
      <li className="px-3 pt-2 text-lg font-bold" style={{ color: colors.text }} aria-hidden>{titulo}</li>
      {itens.map(card)}
    </>
  );

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-3 flex items-center rounded-xl px-3" style={{ backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}` }}>
        <Icone nome="search" tamanho={22} cor={colors.icon} className="mr-3" />
        <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} autoComplete="off" autoCorrect="off"
          placeholder="Buscar ferramenta (ex.: Hiponatremia)" aria-label="Buscar ferramenta"
          className="w-full bg-transparent py-3 text-base outline-none" style={{ color: colors.text }} />
      </div>

      <div role="tablist" aria-label="Categorias" className="mb-3 flex gap-1 overflow-x-auto">
        {FILTROS.map((f) => {
          const ativo = filtro === f.id;
          return (
            <button key={f.id} role="tab" aria-selected={ativo} onClick={() => setFiltro(f.id)}
              className="shrink-0 px-3.5 pb-1 pt-2 text-[15px]" style={{ color: f.cor, fontWeight: ativo ? 800 : 600 }}>
              {f.rotulo}
              <span className="mt-1 block h-[3px] rounded-full" style={{ backgroundColor: ativo ? f.cor : 'transparent' }} />
            </button>
          );
        })}
      </div>

      <ul className="flex flex-col gap-2.5 pb-20">
        {lista.length === 0 ? (
          <li className="mt-10 text-center text-base" style={{ color: colors.text }}>
            {busca ? 'Nenhum resultado encontrado.' : 'Nenhuma ferramenta desta categoria foi migrada ainda.'}
          </li>
        ) : favs.length > 0 ? (
          <>
            {secao('Favoritos', favs)}
            {outras.length > 0 && secao('Outros', outras)}
          </>
        ) : (
          outras.map(card)
        )}
      </ul>
    </div>
  );
}
