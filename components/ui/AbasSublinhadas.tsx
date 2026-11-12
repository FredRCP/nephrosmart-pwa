'use client';

import { useTheme } from '@/context/ThemeContext';

/** Abas simples (sublinhado), mais leves que botões grandes. */
export default function AbasSublinhadas<T extends string>({ valor, onChange, opcoes }: { valor: T; onChange: (v: T) => void; opcoes: { valor: T; texto: string }[] }) {
  const { colors } = useTheme();
  return (
    <div role="tablist" className="mb-4 flex border-b" style={{ borderColor: colors.inputBorder }}>
      {opcoes.map((o) => {
        const ativo = valor === o.valor;
        return (
          <button key={o.valor} role="tab" aria-selected={ativo} type="button" onClick={() => onChange(o.valor)}
            className="-mb-px flex-1 border-b-2 px-1.5 py-2.5 text-[15px] font-semibold"
            style={{ borderColor: ativo ? colors.button : 'transparent', color: ativo ? colors.button : colors.text, opacity: ativo ? 1 : 0.7 }}>
            {o.texto}
          </button>
        );
      })}
    </div>
  );
}
