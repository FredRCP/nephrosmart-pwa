'use client';

import { useTheme } from '@/context/ThemeContext';

/** Faixa de abas dos hubs (Sódio, Ácido-base). Rolagem horizontal em telas estreitas. */
export default function AbasHub<T extends string>({ abas, ativa, onChange, rotulo }: {
  abas: { id: T; rotulo: string }[]; ativa: T; onChange: (id: T) => void; rotulo: string;
}) {
  const { colors } = useTheme();
  return (
    <div role="tablist" aria-label={rotulo} className="no-scrollbar mx-auto mb-4 flex w-full max-w-md gap-2 overflow-x-auto pb-1">
      {abas.map((a) => {
        const sel = a.id === ativa;
        return (
          <button key={a.id} role="tab" type="button" aria-selected={sel} onClick={() => onChange(a.id)}
            className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: sel ? colors.button : colors.inputBg, color: sel ? colors.buttonText : colors.text,
              border: `1px solid ${colors.inputBorder}` }}>
            {a.rotulo}
          </button>
        );
      })}
    </div>
  );
}
