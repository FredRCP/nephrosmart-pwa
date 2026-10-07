'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import type { Bloco, ConteudoPagina as Dados, EstiloLinha, Icone as TipoIcone, Secao } from '@/lib/content/tipos';
import Icone from '@/components/ui/Icone';
import LegalNote from '@/components/ui/LegalNote';
import InfoDialog, { TituloInfo } from '@/components/ui/InfoDialog';

/** Modelo de tela para conteúdo educacional em acordeão, alimentado por dados (lib/content). */
export default function ConteudoPagina({ dados }: { dados: Dados }) {
  const { colors } = useTheme();
  const [abertas, setAbertas] = useState<Record<string, boolean>>({});
  const alternar = (id: string) => setAbertas((a) => ({ ...a, [id]: !a[id] }));

  const resolverCor = (c: string) => (c === 'warning' ? colors.warning : c);

  const corEstilo = (e?: EstiloLinha) =>
    e === 'atencao' ? colors.warning : e === 'perigo' || e === 'alerta' ? colors.inputError : colors.text;

  const renderIcone = (i: TipoIcone) =>
    'fa' in i ? <Icone nome={i.fa} tamanho={24} cor={resolverCor(i.cor)} /> : <span className="text-2xl leading-none">{i.emoji}</span>;

  const renderBloco = (b: Bloco, k: number) => {
    switch (b.tipo) {
      case 'linhas':
        return (
          <div key={k} className="space-y-2">
            {b.linhas.map((l, i) => (
              <p key={i} className="text-base leading-6" style={{ color: corEstilo(l.estilo) }}>{l.texto}</p>
            ))}
          </div>
        );
      case 'lista':
        return (
          <div key={k} className="mt-3 first:mt-0">
            {b.titulo && <p className="mb-1 text-base font-bold" style={{ color: colors.text }}>{b.titulo}</p>}
            <ul className="space-y-1">
              {b.itens.map((it, i) => (
                <li key={i} className="flex gap-2 text-base leading-6" style={{ color: colors.text }}>
                  <span aria-hidden>•</span>
                  <div>
                    {typeof it === 'string' ? it : it.texto}
                    {typeof it !== 'string' && (
                      <ul className="mt-1 space-y-1 pl-3">
                        {it.filhos.map((f, j) => (
                          <li key={j} className="flex gap-2"><span aria-hidden>-</span><span>{f}</span></li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'grupos':
        return (
          <div key={k} className="space-y-4">
            {b.grupos.map((g, i) => (
              <div key={i}>
                <p className="mb-1 text-base font-bold" style={{ color: resolverCor(g.cor) }}>{g.titulo}</p>
                <ul className="space-y-1">
                  {g.itens.map((l, j) => (
                    <li key={j} className="flex gap-2 text-base leading-6" style={{ color: corEstilo(l.estilo) }}>
                      <span aria-hidden>•</span><span>{l.texto}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
      case 'etiquetas':
        return (
          <div key={k} className="mt-3 flex flex-wrap gap-2">
            {b.itens.map((t) => (
              <span key={t} className="rounded-full px-3 py-1.5 text-base font-medium" style={{ backgroundColor: '#e3f2fd', color: colors.resultText }}>{t}</span>
            ))}
          </div>
        );
      case 'nota':
        return (
          <p key={k} className="mt-3 text-base font-semibold leading-6" style={{ color: corEstilo(b.estilo) }}>{b.texto}</p>
        );
    }
  };

  const renderSecao = (s: Secao) => {
    const aberta = !!abertas[s.id];
    return (
      <section key={s.id} className="mb-4 overflow-hidden rounded-xl shadow-sm"
        style={{ backgroundColor: colors.inputBg, borderLeft: `${s.id === 'treatment' ? 5 : 4}px solid ${s.cor}` }}>
        <button type="button" onClick={() => alternar(s.id)} aria-expanded={aberta} aria-controls={`painel-${s.id}`}
          className="flex w-full items-start gap-3 p-4 text-left">
          <span className="mt-0.5 flex w-7 justify-center">{renderIcone(s.icone)}</span>
          <span className="flex-1">
            <span className="block text-lg font-bold" style={{ color: colors.text }}>{s.titulo}</span>
            {!aberta && <span className="block text-base italic" style={{ color: colors.resultText }}>{s.resumo}</span>}
            <span className="block text-xs" style={{ color: colors.text, opacity: 0.4 }}>{s.dica}</span>
          </span>
        </button>
        {aberta && <div id={`painel-${s.id}`} className="px-4 pb-4">{s.blocos.map(renderBloco)}</div>}
      </section>
    );
  };

  return (
    <div className="mx-auto w-full max-w-2xl pb-24">
      <header className="mb-2 text-center">
        <h1 className="text-2xl font-extrabold" style={{ color: colors.text }}>{dados.titulo}</h1>
        {dados.subtitulo && <p className="mt-1 text-base font-semibold" style={{ color: colors.resultText }}>{dados.subtitulo}</p>}
      </header>
      <LegalNote />

      <div className="mt-3">
        {dados.itens.map((it, i) =>
          it.tipo === 'secao' ? (
            renderSecao(it)
          ) : (
            <div key={i} role="alert" className="mb-4 flex items-center gap-3 rounded-xl p-4 shadow"
              style={{ backgroundColor: colors.warningBg, borderLeft: '4px solid #ff6b35' }}>
              <Icone nome={it.icone} tamanho={20} cor="#ff6b35" />
              <p className="flex-1 text-base font-semibold leading-5" style={{ color: '#111' }}>{it.texto}</p>
            </div>
          ),
        )}
      </div>

      {dados.guiaRapido && (
        <InfoDialog titulo={dados.guiaRapido.titulo}>
          {dados.guiaRapido.secoes.map((s) => (
            <div key={s.titulo} className="mb-4">
              <TituloInfo cor={s.cor ? resolverCor(s.cor) : undefined}>{s.titulo}</TituloInfo>
              <ul className="space-y-0.5">
                {s.linhas.map((l) => (
                  <li key={l} className="flex gap-2"><span aria-hidden>•</span><span>{l}</span></li>
                ))}
              </ul>
            </div>
          ))}
          {dados.referencias && (
            <div>
              <TituloInfo>📚 REFERÊNCIAS</TituloInfo>
              <p style={{ color: colors.resultText }}>{dados.referencias}</p>
            </div>
          )}
        </InfoDialog>
      )}
    </div>
  );
}
