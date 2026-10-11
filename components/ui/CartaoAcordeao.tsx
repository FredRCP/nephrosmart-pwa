'use client';

import type { ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';

/** Cartão recolhível (cabeçalho com título e resumo; o corpo só aparece aberto). Usado nas telas de consulta com busca. */
export default function CartaoAcordeao({ id, titulo, resumo, cor, aberto, onAlternar, selo, children }: {
  id: string; titulo: string; resumo?: string; cor: string; aberto: boolean; onAlternar: () => void; selo?: string; children: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <section className="mb-3 overflow-hidden rounded-xl shadow-sm" style={{ backgroundColor: colors.inputBg, borderLeft: `4px solid ${cor}` }}>
      <button type="button" onClick={onAlternar} aria-expanded={aberto} aria-controls={`painel-${id}`} className="flex w-full items-start gap-3 p-4 text-left">
        <span className="flex-1">
          <span className="block text-lg font-bold" style={{ color: colors.text }}>{titulo}</span>
          {resumo && !aberto && <span className="mt-0.5 block text-base italic" style={{ color: colors.resultText }}>{resumo}</span>}
        </span>
        {selo && <span className="mt-1 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: colors.inputBorder, color: colors.text }}>{selo}</span>}
      </button>
      {aberto && <div id={`painel-${id}`} className="px-4 pb-4 text-base leading-6" style={{ color: colors.text }}>{children}</div>}
    </section>
  );
}

export function ListaPontos({ itens, cor }: { itens: string[]; cor?: string }) {
  return (
    <ul className="space-y-1.5">
      {itens.map((t, i) => (
        <li key={i} className="flex gap-2" style={cor ? { color: cor } : undefined}><span aria-hidden>•</span><span>{t}</span></li>
      ))}
    </ul>
  );
}
