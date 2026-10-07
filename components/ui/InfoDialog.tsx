'use client';

import { useRef, type ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';
import Icone from './Icone';
import { TEXTO_LEGAL } from './LegalNote';

/** Botão "i" flutuante + janela de informações (equivale ao Modal do app original). */
export default function InfoDialog({ titulo = 'Informações', children }: { titulo?: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { colors } = useTheme();

  return (
    <>
      <button
        type="button"
        aria-label="Informações"
        onClick={() => ref.current?.showModal()}
        className="fixed bottom-6 right-6 z-30 rounded-full p-3 shadow-lg transition-transform active:scale-95"
        style={{ backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}` }}
      >
        <Icone nome="info-circle" tamanho={26} cor={colors.icon} />
      </button>

      <dialog
        ref={ref}
        onClick={(e) => e.target === ref.current && ref.current?.close()}
        className="m-auto w-[92%] max-w-xl rounded-xl p-0 backdrop:bg-black/70"
        style={{ backgroundColor: colors.modalBg, border: `1px solid ${colors.modalBorder}`, color: colors.modalText }}
      >
        <div className="flex max-h-[82vh] flex-col p-5">
          <h2 className="mb-3 text-center text-xl font-bold" style={{ color: colors.modalTitle }}>{titulo}</h2>
          <div className="overflow-y-auto pr-1 text-base leading-relaxed">
            {children}
            <p className="mt-6 mb-4 text-center text-base font-medium italic" style={{ color: colors.text }}>{TEXTO_LEGAL}</p>
          </div>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="mx-auto mt-3 rounded-lg px-8 py-3 font-semibold"
            style={{ backgroundColor: colors.button, color: colors.buttonText }}
          >
            Fechar
          </button>
        </div>
      </dialog>
    </>
  );
}

export function TituloInfo({ children, cor }: { children: ReactNode; cor?: string }) {
  const { colors } = useTheme();
  return <h3 className="mt-4 mb-1 font-bold" style={{ color: cor ?? colors.modalTitle }}>{children}</h3>;
}

/** Bloco em fonte monoespaçada (fórmulas, tabelas de classificação). */
export function BlocoMono({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <pre
      className="my-3 whitespace-pre-wrap rounded-lg p-3 text-center font-mono text-[15px] font-semibold leading-6"
      style={{ backgroundColor: colors.inputBg, border: `1.5px solid ${colors.button}`, color: colors.resultText }}
    >
      {children}
    </pre>
  );
}
