'use client';

import type { InputHTMLAttributes } from 'react';
import { useTheme } from '@/context/ThemeContext';
import Icone from './Icone';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  icone: string;
  valor: string;
  onChange: (valor: string) => void;
  erro?: boolean;
  /** Muda a cada tentativa inválida para reiniciar a animação de "tremida". */
  tentativa?: number;
  /** Texto de apoio abaixo do campo (ex.: unidade esperada). */
  dica?: string;
}

export default function Campo({ icone, valor, onChange, erro = false, tentativa = 0, dica, ...resto }: Props) {
  const { colors } = useTheme();
  return (
    <div className="mb-3">
    <div
      key={erro ? `erro-${tentativa}` : 'ok'}
      className={`flex items-center rounded-xl px-3 ${erro ? 'animate-shake' : ''}`}
      style={{ backgroundColor: colors.inputBg, border: `1px solid ${erro ? colors.inputError : colors.inputBorder}` }}
    >
      <Icone nome={icone} tamanho={22} cor={colors.icon} className="mr-3" />
      <input
        {...resto}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={erro}
        className="w-full bg-transparent py-3 text-base outline-none placeholder:opacity-70"
        style={{ color: colors.text }}
      />
    </div>
    {dica && <p className="mt-1 px-1 text-xs" style={{ color: colors.text, opacity: 0.65 }}>{dica}</p>}
    </div>
  );
}
