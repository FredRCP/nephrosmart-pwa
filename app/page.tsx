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

  // Som de abertura. Navegadores (principalmente iPhone) só liberam áudio depois de um toque do usuário:
  // tenta tocar sozinho; se for bloqueado, toca no primeiro toque/tecla da sessão.
  useEffect(() => {
    if (!animar) return;
    let tocou = false;
    const fim = () => { document.removeEventListener('pointerdown', gesto); document.removeEventListener('keydown', gesto); };
    const tocar = () => {
      if (tocou) return Promise.resolve(false);
      try {
        const a = new Audio('/sounds/start.mp3');
        return a.play().then(() => { tocou = true; fim(); return true; }, () => false);
      } catch { return Promise.resolve(false); }
    };
    function gesto() { void tocar(); }
    const t = setTimeout(() => { void tocar().then((ok) => { if (!ok && !tocou) { document.addEventListener('pointerdown', gesto); document.addEventListener('keydown', gesto); } }); }, 1000);
    return () => { clearTimeout(t); fim(); };
  }, [animar]);

  const botao = 'flex h-16 w-full items-center justify-center rounded-xl px-6 text-center text-lg font-bold text-white shadow-md transition-transform active:scale-[0.98]';
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
      {/* Saudação centralizada; a engrenagem aqui só no celular (no desktop fica no menu azul) */}
      <div className="intro-item relative w-full" style={atraso(1)}>
        <div className="text-center">
          <p className="text-xl font-bold" style={{ color: colors.text }} data-testid="saudacao">
            {ola}, {sessao.email ? primeiroNome(sessao.nome, sessao.email) : 'Usuário'}
          </p>
          {sessao.email && (
            <p className="text-sm" style={{ color: colors.text, opacity: 0.85 }} data-testid="situacao-login">
              Conectado · {sessao.ativo ? `Plano ${PLANS[sessao.plano].label}` : 'conta suspensa'}
            </p>
          )}
        </div>
        <div className="absolute right-0 top-0 md:hidden"><MenuConfiguracoes variante="home" /></div>
      </div>

      <div className="my-8 text-center">
        {/* Tema escuro: versão do logotipo com texto claro e brilho suave, sem caixa branca atrás */}
        <h1 className="intro-item intro-logo mx-auto w-fit">
          <img src={theme === 'dark' ? '/images/ns1a-escuro.webp' : '/images/ns1a.webp'} alt="NephroSmart" width={300} height={250}
            className={`mx-auto h-auto ${theme === 'dark' ? 'w-60 md:w-72' : 'w-56 md:w-64'}`} />
        </h1>
        <p className="intro-item mx-auto mt-4 w-fit rounded-full px-4 py-0.5 text-sm font-bold tracking-widest opacity-85"
          style={{ color: colors.text, border: `1px solid ${colors.inputBorder}`, ...atraso(1) }}>VERSÃO BETA</p>
      </div>

      <nav aria-label="Módulos" className="flex w-full flex-col gap-3">
        <Link href="/funcao-renal" className={`intro-item ${botao}`} style={{ background: GRADIENTE, ...atraso(1) }}>Função Renal</Link>
        <Link href="/ajuste-de-dose" className={`intro-item ${botao}`} style={{ background: GRADIENTE, ...atraso(1.6) }}>
          <span className="flex flex-col items-center leading-tight">
            <span className="opacity-80">Ajuste de Dose</span>
            <span className="mt-0.5 text-[13px] font-semibold opacity-90">Disponível em breve para assinantes</span>
          </span>
        </Link>
        <Link href="/ferramentas" className={`intro-item ${botao}`} style={{ background: GRADIENTE, ...atraso(2.2) }}>Ferramentas Clínicas</Link>
      </nav>

      <p className="intro-item mt-8 text-center text-sm leading-5" style={{ color: colors.text, opacity: 0.85, ...atraso(2.8) }}>
        Principais fontes: KDIGO 2024 (DRC) · CKD-EPI 2021 (Inker, NEJM) · SBN<br />
        Uso exclusivo para profissionais de saúde · <Link href="/termodeuso" className="underline">Termo de Uso</Link>
      </p>
    </div>
  );
}
