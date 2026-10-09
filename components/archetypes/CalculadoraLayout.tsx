'use client';

import type { ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';
import LegalNote from '@/components/ui/LegalNote';
import InfoDialog from '@/components/ui/InfoDialog';

/** Modelo de tela para calculadoras: título, aviso legal, formulário (children) e janela de informações. */
export default function CalculadoraLayout({ titulo, info, infoTitulo, children }: { titulo: string; info?: ReactNode; infoTitulo?: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <div className="mx-auto w-full max-w-md pb-24">
      <h1 className="text-center text-2xl font-extrabold" style={{ color: colors.text }}>{titulo}</h1>
      <LegalNote />
      <div className="mt-2">{children}</div>
      {info && <InfoDialog titulo={infoTitulo}>{info}</InfoDialog>}
    </div>
  );
}

export function BotaoPrimario({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { colors } = useTheme();
  return (
    <button {...p} className="flex-1 rounded-xl px-4 py-3 text-base font-semibold shadow transition-transform active:scale-[0.98]"
      style={{ backgroundColor: colors.button, color: colors.buttonText }}>{children}</button>
  );
}

export function BotaoSecundario({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { colors } = useTheme();
  return (
    <button {...p} className="flex items-center justify-center rounded-xl px-5 py-3 text-base font-semibold shadow transition-transform active:scale-[0.98]"
      style={{ backgroundColor: colors.buttonSecondary, color: colors.buttonText }}>{children}</button>
  );
}

export function CartaoResultado({ texto, cor }: { texto: string; cor: string }) {
  const { colors } = useTheme();
  return (
    <div role="status" className="animate-resultado mt-5 rounded-xl p-4 text-center"
      style={{ backgroundColor: colors.resultBg, border: `1px solid ${colors.resultBorder}` }}>
      <p className="whitespace-pre-line text-lg font-semibold leading-7" style={{ color: cor }}>{texto}</p>
    </div>
  );
}
