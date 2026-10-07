'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import MenuConfiguracoes from '@/components/shell/MenuConfiguracoes';
import { PLANS } from '@/lib/access/plans';
import { primeiroNome } from '@/lib/auth/nome';
import { useSessao } from '@/lib/auth/useSessao';
import { saudacaoPara } from '@/lib/saudacao';

const GRADIENTE = 'linear-gradient(135deg, #1e5a9c, #2b6cb0)';

// Textos do site (nefrosmartapp.com.br)
const APRESENTACAO = ['Ferramentas clínicas para médicos e profissionais de saúde.', 'Rápido, preciso e baseado em evidências.'];
const AVISO_LEGAL =
  'O NephroSmart é uma ferramenta educacional e de consulta técnica, destinada exclusivamente a médicos e profissionais de saúde legalmente habilitados. Não realiza diagnóstico, não prescreve tratamentos e não substitui o julgamento clínico profissional.';

export default function Home() {
  const { colors, theme } = useTheme();
  const sessao = useSessao();
  const [ola, setOla] = useState('Olá');
  useEffect(() => {
    const atualizar = () => setOla(saudacaoPara(new Date()));
    atualizar();
    const id = setInterval(atualizar, 60_000); // o app pode ficar aberto atravessando 6h, 12h ou 18h
    return () => clearInterval(id);
  }, []);

  const botao = 'block w-full rounded-2xl px-6 py-5 text-center text-xl font-bold text-white shadow-lg transition-transform active:scale-[0.98]';

  return (
    <div className="mx-auto flex max-w-md flex-col items-center md:pt-6">
      {/* Saudação com o nome de quem está logado; a engrenagem aqui só no celular (no desktop fica no menu azul) */}
      <div className="flex w-full items-start justify-between gap-3">
        <div>
          <p className="text-xl font-bold" style={{ color: colors.text }} data-testid="saudacao">
            {ola}, {sessao.email ? primeiroNome(sessao.nome, sessao.email) : 'Usuário'}
          </p>
          {sessao.email && (
            <p className="text-xs" style={{ color: colors.text, opacity: 0.7 }} data-testid="situacao-login">
              Conectado · {sessao.ativo ? `Plano ${PLANS[sessao.plano].label}` : 'conta suspensa'}
            </p>
          )}
        </div>
        <div className="md:hidden"><MenuConfiguracoes variante="home" /></div>
      </div>

      <div className="my-8 text-center">
        {/* O logotipo é azul sobre transparente: no tema escuro ganha um fundo claro para continuar legível */}
        <h1 className={`mx-auto w-fit rounded-3xl ${theme === 'dark' ? 'bg-white/95 px-6 py-3' : ''}`}>
          <img src="/images/ns1a.webp" alt="NephroSmart" width={300} height={250} className="mx-auto h-auto w-56 md:w-64" />
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-base leading-6" style={{ color: colors.text, opacity: 0.8 }}>
          {APRESENTACAO[0]}<br />{APRESENTACAO[1]}
        </p>
        <p className="mx-auto mt-4 w-fit rounded-full px-4 py-0.5 text-xs font-bold tracking-widest opacity-70"
          style={{ color: colors.text, border: `1px solid ${colors.inputBorder}` }}>VERSÃO BETA</p>
      </div>

      <nav aria-label="Módulos" className="flex w-full flex-col gap-4">
        <Link href="/funcao-renal" className={botao} style={{ background: GRADIENTE }}>Função Renal</Link>
        <Link href="/ajuste-de-dose" className={botao} style={{ background: GRADIENTE, opacity: 0.55 }}>
          Ajuste de Dose <span className="ml-2 align-middle text-xs font-semibold opacity-80">em breve</span>
        </Link>
        <Link href="/ferramentas" className={botao} style={{ background: GRADIENTE }}>Ferramentas Clínicas</Link>
      </nav>

      <p className="mt-10 rounded-2xl px-5 py-4 text-center text-xs leading-5"
        style={{ color: colors.text, opacity: 0.7, border: `1px solid ${colors.inputBorder}`, backgroundColor: colors.cardBg }}>
        {AVISO_LEGAL}
      </p>
    </div>
  );
}
