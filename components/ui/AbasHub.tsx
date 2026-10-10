'use client';

import { useTheme } from '@/context/ThemeContext';

/**
 * Faixa de abas dos hubs. No celular rola para o lado, com a ponta direita esmaecida para indicar que há mais abas
 * (as barras de rolagem do app são ocultas). Se a aba tiver `descricao`, uma frase abaixo explica o que ela faz. Em telas a partir de 640 px (tablet e desktop) ocupa a largura toda, centralizada e sem rolagem.
 */
export default function AbasHub<T extends string>({ abas, ativa, onChange, rotulo }: {
  abas: { id: T; rotulo: string; descricao?: string }[]; ativa: T; onChange: (id: T) => void; rotulo: string;
}) {
  const { colors } = useTheme();
  const atual = abas.find((a) => a.id === ativa);
  return (
    <>
    <div role="tablist" aria-label={rotulo} className="no-scrollbar mx-auto mb-4 flex w-full max-w-md gap-2 overflow-x-auto pb-1 pr-6 [mask-image:linear-gradient(to_right,black_88%,transparent)] sm:max-w-5xl sm:flex-wrap sm:justify-center sm:overflow-visible sm:pr-0 sm:[mask-image:none]">
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
    {atual?.descricao && (
      <p data-testid="descricao-aba" className="mx-auto -mt-1 mb-4 max-w-md px-2 text-center text-sm" style={{ color: colors.text, opacity: 0.8 }}>{atual.descricao}</p>
    )}
    </>
  );
}
