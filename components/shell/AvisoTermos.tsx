'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { VERSAO_PRIVACIDADE, VERSAO_TERMOS } from '@/lib/legal/versoes';
import { gravarLocal, lerLocal } from '@/lib/storage';

const CHAVE = 'avisoTermosVisto';
export const VERSAO_ACEITE_LOCAL = `${VERSAO_TERMOS}|${VERSAO_PRIVACIDADE}`;

/** Registra neste aparelho que os Termos já foram aceitos (usado também no cadastro, que tem o checkbox de aceite). */
export function registrarAceiteLocal(): void { gravarLocal(CHAVE, VERSAO_ACEITE_LOCAL); }

/**
 * Tela de aceite obrigatório no primeiro uso (também para quem usa as ferramentas gratuitas sem conta).
 * Cobre o app até a pessoa aceitar os Termos de Uso e a Política de Privacidade. Volta se os textos mudarem.
 * Nas próprias páginas dos Termos e da Privacidade (e no cadastro, que tem o checkbox) não aparece, para dar para ler.
 */
export default function AvisoTermos() {
  const { colors } = useTheme();
  const pathname = usePathname() ?? '';
  const [pendente, setPendente] = useState(false);
  const botao = useRef<HTMLButtonElement>(null);
  useEffect(() => { setPendente(lerLocal(CHAVE) !== VERSAO_ACEITE_LOCAL); }, []);
  const paginaLivre = ['/termodeuso', '/privacidade', '/cadastro'].some((r) => pathname === r || pathname.startsWith(r + '/'));
  const visivel = pendente && !paginaLivre;
  useEffect(() => { if (visivel) botao.current?.focus(); }, [visivel]);
  if (!visivel) return null;
  return (
    <div data-testid="aviso-termos" className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-3 sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="titulo-termos" className="w-full max-w-md rounded-2xl p-5 shadow-xl"
        style={{ backgroundColor: colors.modalBg, border: `1px solid ${colors.modalBorder}`, color: colors.modalText, marginBottom: 'env(safe-area-inset-bottom)' }}>
        <h2 id="titulo-termos" className="mb-2 text-center text-xl font-bold" style={{ color: colors.modalTitle }}>Antes de começar</h2>
        <p className="text-sm leading-relaxed">
          O NephroSmart é uma ferramenta de apoio à decisão clínica para profissionais de saúde. Não substitui o julgamento médico.
          Para continuar, leia e aceite os <Link href="/termodeuso" className="font-semibold underline">Termos de Uso</Link> e
          a <Link href="/privacidade" className="font-semibold underline">Política de Privacidade</Link>.
        </p>
        <button ref={botao} type="button" onClick={() => { registrarAceiteLocal(); setPendente(false); }}
          className="mt-4 w-full rounded-xl px-4 py-3 text-base font-semibold" style={{ backgroundColor: colors.button, color: colors.buttonText }}>
          Li e aceito
        </button>
      </div>
    </div>
  );
}
