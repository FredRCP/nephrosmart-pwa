'use client';

import { useTheme } from '@/context/ThemeContext';

/** Texto completo: aparece na janela de informações (ⓘ) de cada ferramenta e nos Termos de Uso. */
export const TEXTO_LEGAL =
  'Conteúdo educacional para apoio à prática clínica. Não substitui avaliação médica, diagnóstico ou tomada de decisão clínica.';
/** Linha curta e discreta, mostrada no topo das ferramentas. */
export const TEXTO_CURTO = 'Apoio à decisão clínica. Não substitui o julgamento médico.';
/** Acrescentado nas ferramentas de dose, volume ou velocidade de correção. */
export const TEXTO_REFORCADO = 'Confira dose, volume e velocidade antes de aplicar.';

export default function LegalNote({ reforcado = false }: { reforcado?: boolean }) {
  const { colors } = useTheme();
  return (
    <div className="my-3 px-2 text-center text-xs" style={{ color: colors.text }}>
      <p className="italic opacity-70">{TEXTO_CURTO}</p>
      {reforcado && <p data-testid="aviso-reforcado" className="mt-1 font-semibold opacity-90">⚠️ {TEXTO_REFORCADO}</p>}
    </div>
  );
}
