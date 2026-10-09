'use client';

import { useTheme } from '@/context/ThemeContext';

/** Botões de escolha única (segmented). Usado para tipo, solução, distúrbio etc. */
export default function Escolha<T extends string>({ rotulo, opcoes, valor, onChange, erro = false }: {
  rotulo?: string; opcoes: { valor: T; texto: string }[]; valor: T | ''; onChange: (v: T) => void; erro?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <div className="mb-3" role="group" aria-label={rotulo}>
      {rotulo && <p className="mb-1 px-1 text-sm font-semibold" style={{ color: colors.text }}>{rotulo}</p>}
      <div className="flex flex-wrap gap-2">
        {opcoes.map((o) => {
          const ativo = valor === o.valor;
          return (
            <button key={o.valor} type="button" onClick={() => onChange(o.valor)} aria-pressed={ativo}
              className="min-w-[30%] flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold"
              style={{ backgroundColor: ativo ? colors.button : colors.inputBg, color: ativo ? colors.buttonText : colors.text,
                border: `1px solid ${erro ? colors.inputError : colors.inputBorder}` }}>
              {o.texto}
            </button>
          );
        })}
      </div>
    </div>
  );
}
