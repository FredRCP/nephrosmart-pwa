'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { canAccess } from '@/lib/access/canAccess';
import { eGratuita, PREMIUM_ENABLED } from '@/lib/access/plans';
import { useSessao } from '@/lib/auth/useSessao';
import Icone from './Icone';

const EMAIL_CONTATO = 'nefrosmartapp@gmail.com';

/** Deixa passar as ferramentas gratuitas e quem tem plano; para os demais mostra o convite (sem expor a ferramenta). */
export default function PortaoPremium({ slug, children }: { slug: string; children: ReactNode }) {
  const sessao = useSessao();
  const { colors } = useTheme();

  if (!PREMIUM_ENABLED || eGratuita(slug)) return <>{children}</>;
  if (sessao.carregando) {
    return <p role="status" className="mt-10 text-center text-sm" style={{ color: colors.text }}>Verificando acesso…</p>;
  }
  if (canAccess(slug, sessao.plano)) return <>{children}</>;

  const logado = !!sessao.email;
  const botao = 'rounded-xl px-5 py-3 text-center font-semibold shadow transition-transform active:scale-[0.98]';
  return (
    <div className="mx-auto mt-6 w-full max-w-md rounded-2xl p-6 text-center shadow"
      style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.inputBorder}` }}>
      <Icone nome="lock" tamanho={36} cor={colors.icon} />
      <h1 className="mt-3 text-xl font-extrabold" style={{ color: colors.text }}>Ferramenta Premium</h1>
      {!logado ? (
        <>
          <p className="mt-2 text-sm" style={{ color: colors.text }}>
            Esta ferramenta faz parte do plano Premium. Entre ou crie uma conta gratuita para continuar.
          </p>
          <div className="mt-5 flex flex-col gap-3">
            {sessao.configurado && (
              <>
                <Link href="/entrar" className={botao} style={{ backgroundColor: colors.button, color: colors.buttonText }}>Entrar</Link>
                <Link href="/cadastro" className={botao} style={{ border: `1px solid ${colors.button}`, color: colors.text }}>Criar conta</Link>
              </>
            )}
          </div>
        </>
      ) : !sessao.ativo ? (
        <p className="mt-2 text-sm" style={{ color: colors.text }}>
          Sua conta está suspensa. Fale com <a href={`mailto:${EMAIL_CONTATO}`} className="underline">{EMAIL_CONTATO}</a>.
        </p>
      ) : (
        <p className="mt-2 text-sm" style={{ color: colors.text }}>
          Esta ferramenta faz parte do plano Premium. A assinatura estará disponível em breve. Durante o beta, o acesso é liberado
          pelo responsável: <a href={`mailto:${EMAIL_CONTATO}`} className="underline">{EMAIL_CONTATO}</a>.
        </p>
      )}
      <p className="mt-5 text-sm">
        <Link href="/ferramentas" className="underline" style={{ color: colors.text }}>Ver as ferramentas gratuitas</Link>
      </p>
    </div>
  );
}
