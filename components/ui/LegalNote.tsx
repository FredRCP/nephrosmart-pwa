'use client';

import { useTheme } from '@/context/ThemeContext';

// Texto padrão do app original ("Conteúdo educacional para apoio à prática clínica...").
// ATENÇÃO: o original (utils/LegalNote.tsx) ainda não foi conferido — confirmar o texto exato.
export const TEXTO_LEGAL =
  'Conteúdo educacional para apoio à prática clínica. Não substitui avaliação médica, diagnóstico ou tomada de decisão clínica.';

export default function LegalNote() {
  const { colors } = useTheme();
  return (
    <p className="text-sm italic text-center my-3 px-2 opacity-80" style={{ color: colors.text }}>
      {TEXTO_LEGAL}
    </p>
  );
}
