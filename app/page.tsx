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
const CHAVE_INTRO = 'introVista';
// Tempos do app original: título por 2,5 s, saída em 0,8 s, logo em 1 s, depois um botão a cada 0,6 s.
const TEMPO_TITULO = 2500;
const TEMPO_SAIDA = 800;

// A abertura toca uma vez por sessão (também ao voltar para a Home navegando dentro do app, ela não repete).
let introJaVista = false;

type Fase = 'titulo' | 'saindo' | 'pronto';

export default function Home() {
  const { colors, theme } = useTheme();
  const sessao = useSessao();
  const [ola, setOla] = useState('Olá');
  const [fase, setFase] = useState<Fase>(introJaVista ? 'pronto' : 'titulo');
  const [animar, setAnimar] = useState(false);

  useEffect(() => {
    const atualizar = () => setOla(saudacaoPara(new Date()));
    atualizar();
    const id = setInterval(atualizar, 60_000); // o app pode ficar aberto atravessando 6h, 12h ou 18h
    return () => clearInterval(id);
  }, []);

  // Abertura animada: só na primeira vez da sessão e para quem não pediu menos animação
  useEffect(() => {
    if (introJaVista) return;
    let vista = false;
    try { vista = window.sessionStorage.getItem(CHAVE_INTRO) === '1'; } catch { /* sem armazenamento: toca sempre */ }
    const reduzir = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (vista || reduzir) { introJaVista = true; setFase('pronto'); return; }
    const t1 = setTimeout(() => setFase('saindo'), TEMPO_TITULO);
    const t2 = setTimeout(() => {
      introJaVista = true;
      try { window.sessionStorage.setItem(CHAVE_INTRO, '1'); } catch { /* ignora */ }
      setAnimar(true);
      setFase('pronto');
    }, TEMPO_TITULO + TEMPO_SAIDA);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // Roda uma vez: depender de `fase` cancelava o segundo timer quando a fase mudava para "saindo" (tela presa no título).
  }, []);

  // Som de abertura quando o logo termina de entrar (navegadores podem bloquear: nesse caso fica em silêncio)
  useEffect(() => {
    if (!animar) return;
    const t = setTimeout(() => {
      try { void new Audio('/sounds/start.mp3').play().catch(() => {}); } catch { /* sem áudio */ }
    }, 1000);
    return () => clearTimeout(t);
  }, [animar]);

  const botao = 'block w-full rounded-xl px-6 py-3.5 text-center text-lg font-bold text-white shadow-md transition-transform active:scale-[0.98]';
  const estadoIntro = fase !== 'pronto' ? 'espera' : animar ? 'anima' : 'parado';
  const atraso = (s: number) => ({ ['--atraso' as string]: `${s}s` });

  return (
    <div data-intro={estadoIntro} className="mx-auto flex max-w-md flex-col items-center md:pt-6">
      {fase !== 'pronto' && (
        <div aria-hidden className="fixed inset-0 z-[60] flex items-center justify-center px-6"
          style={{ background: `linear-gradient(to bottom, ${colors.gradient[0]}, ${colors.gradient[1]})` }}>
          <p className={`text-center text-3xl font-bold ${fase === 'saindo' ? 'intro-titulo-saindo' : ''}`} style={{ color: colors.text }}>
            Bem-vindo ao NephroSmart
          </p>
        </div>
      )}

      {/* Saudação com o nome de quem está logado; a engrenagem aqui só no celular (no desktop fica no menu azul) */}
      <div className="intro-item flex w-full items-start justify-between gap-3 md:fixed md:left-8 md:top-[4.75rem] md:w-auto" style={atraso(1)}>
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
        <h1 className={`intro-item intro-logo mx-auto w-fit rounded-3xl ${theme === 'dark' ? 'bg-white/95 px-6 py-3' : ''}`}>
          <img src="/images/ns1a.webp" alt="NephroSmart" width={300} height={250} className="mx-auto h-auto w-56 md:w-64" />
        </h1>
        <p className="intro-item mx-auto mt-4 w-fit rounded-full px-4 py-0.5 text-xs font-bold tracking-widest opacity-70"
          style={{ color: colors.text, border: `1px solid ${colors.inputBorder}`, ...atraso(1) }}>VERSÃO BETA</p>
      </div>

      <nav aria-label="Módulos" className="flex w-full flex-col gap-3">
        <Link href="/funcao-renal" className={`intro-item ${botao}`} style={{ background: GRADIENTE, ...atraso(1) }}>Função Renal</Link>
        <Link href="/ajuste-de-dose" className={`intro-item ${botao}`} style={{ background: GRADIENTE, ...atraso(1.6) }}>
          <span className="opacity-60">Ajuste de Dose <span className="ml-2 align-middle text-xs font-semibold">em breve</span></span>
        </Link>
        <Link href="/ferramentas" className={`intro-item ${botao}`} style={{ background: GRADIENTE, ...atraso(2.2) }}>Ferramentas Clínicas</Link>
      </nav>

      <p className="intro-item mt-8 text-center text-xs leading-5" style={{ color: colors.text, opacity: 0.6, ...atraso(2.8) }}>
        Uso exclusivo para profissionais de saúde · <Link href="/termodeuso" className="underline">Termo de Uso</Link>
      </p>
    </div>
  );
}
