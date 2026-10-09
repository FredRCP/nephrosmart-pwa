'use client';

import { useTheme } from '@/context/ThemeContext';
import type { Sexo } from '@/lib/clinical/ckdepi';
import Icone from './Icone';

/** Botões Masculino / Feminino (mesmo visual do CKD-EPI), com marcação de erro e tremida. */
export default function SeletorSexo({ valor, onChange, erro, tentativa }: {
  valor: '' | Sexo; onChange: (s: Sexo) => void; erro: boolean; tentativa: number;
}) {
  const { colors } = useTheme();
  const botao = (v: Sexo, rotulo: string, icone: string) => {
    const ativo = valor === v;
    return (
      <button type="button" onClick={() => onChange(v)} aria-pressed={ativo}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-base font-semibold"
        style={{ backgroundColor: ativo ? colors.button : colors.inputBg, color: ativo ? colors.buttonText : colors.text,
          border: `1px solid ${colors.inputBorder}` }}>
        <Icone nome={icone} tamanho={20} cor={ativo ? colors.buttonText : colors.icon} />
        {rotulo}
      </button>
    );
  };
  return (
    <div key={erro ? `erro-${tentativa}` : 'ok'} className={`mb-3 flex gap-3 ${erro ? 'animate-shake' : ''}`}
      role="group" aria-label="Sexo" aria-invalid={erro}
      style={erro ? { outline: `1px solid ${colors.inputError}`, outlineOffset: 4, borderRadius: 12 } : undefined}>
      {botao('m', 'Masculino', 'mars')}
      {botao('f', 'Feminino', 'venus')}
    </div>
  );
}
