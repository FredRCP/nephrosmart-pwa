'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { MAPA_NOS, RESULTADOS, type ContextoFluxo } from '@/lib/content/hiponatremia-fluxo';
import { estaDisponivel } from '@/lib/tools/catalogo';
import { normalizarNumero } from '@/lib/clinical/numeros';
import LegalNote from '@/components/ui/LegalNote';
import Campo from '@/components/ui/Campo';
import { BotaoPrimario, BotaoSecundario } from '@/components/archetypes/CalculadoraLayout';

/** Fluxograma diagnóstico passo a passo (dados em lib/content/hiponatremia-fluxo.ts). */
export default function FluxogramaHiponatremia() {
  const { colors } = useTheme();
  const [historico, setHistorico] = useState<string[]>(['na']);
  const [ctx, setCtx] = useState<ContextoFluxo>({});
  const [texto, setTexto] = useState('');
  const [escolha, setEscolha] = useState('');
  const [erro, setErro] = useState('');

  const id = historico[historico.length - 1];
  const no = MAPA_NOS[id];
  const resultado = id.startsWith('result_') ? RESULTADOS[id.slice('result_'.length)] : undefined;

  const ir = (proximo: string, novoCtx: ContextoFluxo) => {
    setCtx(novoCtx); setHistorico((h) => [...h, proximo]); setTexto(''); setEscolha(''); setErro('');
  };
  const avancar = () => {
    if (!no) return;
    if (no.type === 'input') {
      const msg = no.validate ? no.validate(texto) : null;
      if (msg) { setErro(msg); return; }
      const novo = { ...ctx, [no.inputKey!]: texto };
      ir(no.next!(texto, novo), novo);
    } else if (no.type === 'choice') {
      if (!escolha) { setErro('Selecione uma opção para continuar.'); return; }
      const novo = { ...ctx, [no.choiceKey!]: escolha };
      ir(no.next_choice!(escolha, novo), novo);
    }
  };
  const voltar = () => { setHistorico((h) => (h.length > 1 ? h.slice(0, -1) : h)); setErro(''); };
  const reiniciar = () => { setHistorico(['na']); setCtx({}); setTexto(''); setEscolha(''); setErro(''); };
  const link = resultado?.calcRoute === 'OsmolarityCalculator' && estaDisponivel('osmolaridade-serica') ? '/ferramentas/osmolaridade-serica' : null;

  return (
    <div className="mx-auto w-full max-w-md pb-24">
      <h1 className="text-center text-2xl font-extrabold" style={{ color: colors.text }}>Fluxograma de Hiponatremia</h1>
      <LegalNote />
      {resultado ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl p-4" style={{ backgroundColor: colors.resultBg, border: `2px solid ${resultado.color}` }}>
            <h2 className="text-xl font-extrabold" style={{ color: resultado.color }}>{resultado.title}</h2>
            <p className="text-sm font-semibold" style={{ color: colors.text }}>{resultado.subtitle}</p>
          </div>
          {resultado.perfil && <Lista titulo="Perfil" itens={resultado.perfil} />}
          <p className="text-base leading-6" style={{ color: colors.text }}>{resultado.diagnosis}</p>
          {ctx.missingExamsWarnings && (
            <div role="alert" className="rounded-xl p-3 text-sm whitespace-pre-line" style={{ backgroundColor: colors.warningBg, color: '#111' }}>{ctx.missingExamsWarnings}</div>
          )}
          <Lista titulo="Exames" itens={resultado.exams} />
          <Lista titulo="Conduta" itens={resultado.treatment} />
          {resultado.warning && <p className="rounded-xl p-3 text-sm font-semibold" style={{ backgroundColor: colors.warningBg, color: '#111' }}>⚠️ {resultado.warning}</p>}
          {link && <Link href={link} className="block text-center font-semibold underline" style={{ color: colors.button }}>{resultado.calcLabel ?? 'Calcular osmolalidade'}</Link>}
          {resultado.ddx?.map((g) => <Lista key={g.group} titulo={g.group} itens={g.items} />)}
          <div className="flex gap-3"><BotaoSecundario onClick={voltar}>Voltar</BotaoSecundario><BotaoPrimario onClick={reiniciar}>Recomeçar</BotaoPrimario></div>
        </div>
      ) : no ? (
        <div className="mt-4">
          <h2 className="text-xl font-bold" style={{ color: colors.text }}>{no.question}</h2>
          {no.subtitle && <p className="mb-3 text-sm" style={{ color: colors.text, opacity: 0.75 }}>{no.subtitle}</p>}
          {no.type === 'input' && (
            <Campo icone="flask" placeholder={`${no.inputPlaceholder ?? ''} (${no.inputUnit})`} inputMode="decimal" valor={texto} erro={!!erro} tentativa={historico.length}
              onChange={(t) => { setTexto(normalizarNumero(t)); setErro(''); }} />
          )}
          {no.type === 'choice' && (
            <div className="space-y-2" role="group" aria-label={no.question}>
              {no.choices!.map((c) => {
                const ativo = escolha === c.value;
                return (
                  <button key={c.value} type="button" aria-pressed={ativo} onClick={() => { setEscolha(c.value); setErro(''); }}
                    className="w-full rounded-xl px-4 py-3 text-left" style={{ backgroundColor: ativo ? colors.button : colors.inputBg, color: ativo ? colors.buttonText : colors.text, border: `1px solid ${colors.inputBorder}` }}>
                    <span className="block font-semibold">{c.label}</span>
                    {c.sublabel && <span className="block whitespace-pre-line text-sm opacity-80">{c.sublabel}</span>}
                  </button>
                );
              })}
            </div>
          )}
          {erro && <p role="alert" className="mt-2 text-sm font-semibold" style={{ color: colors.inputError }}>{erro}</p>}
          {no.showCalcButton && estaDisponivel('osmolaridade-serica') && (
            <Link href="/ferramentas/osmolaridade-serica" className="mt-2 block text-center text-sm font-semibold underline" style={{ color: colors.button }}>Calcular osmolaridade</Link>
          )}
          {no.type === 'input' && no.validate && no.validate('') === null && (
            <button type="button" onClick={() => { const novo = { ...ctx, [no.inputKey!]: '' }; ir(no.next!('', novo), novo); }} className="mt-2 w-full text-center text-sm underline" style={{ color: colors.text }}>Não possuo este exame</button>
          )}
          <div className="mt-4 flex gap-3">
            <BotaoSecundario onClick={voltar} disabled={historico.length <= 1}>Voltar</BotaoSecundario>
            <BotaoPrimario onClick={avancar}>Avançar</BotaoPrimario>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Lista({ titulo, itens }: { titulo: string; itens: string[] }) {
  const { colors } = useTheme();
  return (
    <div>
      <p className="mb-1 text-base font-bold" style={{ color: colors.text }}>{titulo}</p>
      <ul className="space-y-1">{itens.map((i) => <li key={i} className="flex gap-2 text-base leading-6" style={{ color: colors.text }}><span aria-hidden>•</span><span>{i}</span></li>)}</ul>
    </div>
  );
}
