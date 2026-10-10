'use client';

import { useId } from 'react';
import { useTheme } from '@/context/ThemeContext';

/** Lista suspensa nativa (acessível e boa no celular). */
export default function Seletor({ rotulo, opcoes, valor, onChange, erro = false }: {
  rotulo: string; opcoes: { valor: string; texto: string }[]; valor: string; onChange: (v: string) => void; erro?: boolean;
}) {
  const { colors } = useTheme();
  const id = useId();
  return (
    <div className="mb-3">
      <label htmlFor={id} className="mb-1 block px-1 text-sm font-semibold" style={{ color: colors.text }}>{rotulo}</label>
      <select id={id} value={valor} onChange={(e) => onChange(e.target.value)} aria-invalid={erro}
        className="w-full rounded-xl px-3 py-3 text-base outline-none"
        style={{ backgroundColor: colors.inputBg, color: colors.text, border: `1px solid ${erro ? colors.inputError : colors.inputBorder}` }}>
        <option value="">Selecione…</option>
        {opcoes.map((o) => <option key={o.valor} value={o.valor}>{o.texto}</option>)}
      </select>
    </div>
  );
}
