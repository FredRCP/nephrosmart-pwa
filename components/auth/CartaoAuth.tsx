'use client';

import type { ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { isSupabaseConfigured } from '@/lib/supabase/env';

/** Moldura das telas de conta. Avisa quando o projeto Supabase ainda não foi configurado no .env. */
export default function CartaoAuth({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <div className="mx-auto w-full max-w-md pb-16">
      <h1 className="text-center text-2xl font-extrabold" style={{ color: colors.text }}>{titulo}</h1>
      {subtitulo && <p className="mt-1 text-center text-sm" style={{ color: colors.text, opacity: 0.7 }}>{subtitulo}</p>}
      <div className="mt-6 rounded-2xl p-5 shadow" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.inputBorder}` }}>
        {isSupabaseConfigured ? children : (
          <p role="status" className="text-center text-sm" style={{ color: colors.text }}>
            O login ainda não está configurado neste ambiente (faltam as chaves do Supabase no arquivo <code>.env</code>).
            As ferramentas continuam funcionando normalmente.
          </p>
        )}
      </div>
    </div>
  );
}

export function MensagemErro({ texto }: { texto: string }) {
  const { colors } = useTheme();
  if (!texto) return null;
  return <p role="alert" className="mb-3 rounded-lg p-3 text-sm font-semibold" style={{ color: colors.inputError, border: `1px solid ${colors.inputError}` }}>{texto}</p>;
}

export function MensagemInfo({ texto }: { texto: string }) {
  const { colors } = useTheme();
  if (!texto) return null;
  return <p role="status" className="mb-3 rounded-lg p-3 text-sm" style={{ color: colors.text, border: `1px solid ${colors.inputBorder}`, backgroundColor: colors.inputBg }}>{texto}</p>;
}
