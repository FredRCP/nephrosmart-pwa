'use client';

import { useTheme } from '@/context/ThemeContext';

/**
 * Faixa de abas dos hubs. No celular rola para o lado, com a ponta direita esmaecida para indicar que há mais abas
 * (as barras de rolagem do app são ocultas). No desktop ocupa a largura toda, centralizada e sem rolagem.
 */
export default function AbasHub<T extends string>({ abas, ativa, onChange, rotulo }: {
  abas: { id: T; rotulo: string }[]; ativa: T; onChange: (id: T) => void; rotulo: string;
}) {
  const { colors } = useTheme();
  return (
    <div role="tablist" aria-label={rotulo} className="no-scrollbar mx-auto mb-4 flex w-full max-w-md gap-2 overflow-x-auto pb-1 pr-6 [mask-image:linear-gradient(to_right,black_88%,transparent)] md:max-w-5xl md:flex-wrap md:justify-center md:overflow-visible md:pr-0 md:[mask-image:none]">
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
