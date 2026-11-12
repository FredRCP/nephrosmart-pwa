'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { CLASSES_DIURETICO, GUIA_DIURETICOS, type ClasseDiuretico, type GuiaDiuretico } from '@/lib/content/diureticos';
import CalculadoraLayout from '@/components/archetypes/CalculadoraLayout';
import ConversorDiureticos from '@/components/calculators/ConversorDiureticos';
import AbasSublinhadas from '@/components/ui/AbasSublinhadas';
import Icone from '@/components/ui/Icone';
import { TituloInfo } from '@/components/ui/InfoDialog';

type Aba = 'guia' | 'equivalencia';

function Bloco({ titulo, itens, destaque = false }: { titulo: string; itens: string[]; destaque?: boolean }) {
  const { colors } = useTheme();
  return (
    <section className="border-t py-3" style={{ borderColor: colors.inputBorder }}>
      <h4 className="mb-1 text-xs font-bold uppercase tracking-wider" style={{ color: colors.text, opacity: 0.65 }}>{titulo}</h4>
      <div className={destaque ? 'rounded-lg px-3 py-2' : ''} style={destaque ? { backgroundColor: colors.resultBg } : undefined}>
        {itens.map((t, i) => <p key={i} className="py-0.5 text-[15px] leading-6" style={{ color: colors.text }}>{t}</p>)}
      </div>
    </section>
  );
}

function Cartao({ d }: { d: GuiaDiuretico }) {
  const { colors } = useTheme();
  const classe = CLASSES_DIURETICO.find((c) => c.id === d.classe)!;
  return (
    <details data-testid={`diuretico-${d.id}`} className="group rounded-xl shadow-md" style={{ backgroundColor: colors.inputBg, borderLeft: `4px solid ${classe.cor}` }}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <span className="min-w-0">
          <span className="block text-lg font-bold leading-6" style={{ color: colors.text }}>{d.generico}</span>
          <span className="block truncate text-sm" style={{ color: colors.text, opacity: 0.75 }}>
            {d.comerciais.length ? d.comerciais.join(' · ') : 'Só em associação'}
          </span>
          <span className="mt-0.5 block text-xs font-semibold" style={{ color: classe.cor }}>{classe.nome}</span>
        </span>
        <span className="shrink-0 transition-transform group-open:rotate-180"><Icone nome="chevron-down" tamanho={16} cor={colors.icon} /></span>
      </summary>
      <div className="px-4 pb-2">
        {d.associacoes && <p className="pb-2 text-sm italic" style={{ color: colors.text, opacity: 0.8 }}>Em associação: {d.associacoes.join('; ')}</p>}
        <Bloco titulo="Apresentações" itens={d.apresentacoes} />
        <Bloco titulo="Dose de bula (adulto)" itens={d.dose} />
        <Bloco titulo="Início e duração" itens={d.inicioDuracao} />
        <Bloco titulo="Riscos principais" itens={d.riscos} />
        <Bloco titulo="Na DRC" itens={d.drc} />
        {d.fora && <Bloco titulo="Fora da bula (literatura)" itens={d.fora} destaque />}
      </div>
    </details>
  );
}

export default function DiureticosHub({ inicial = 'guia' }: { inicial?: Aba }) {
  const { colors } = useTheme();
  const [aba, setAba] = useState<Aba>(inicial);
  const [classe, setClasse] = useState<ClasseDiuretico | 'todas'>('todas');
  const lista = [...GUIA_DIURETICOS].sort((a, b) => a.generico.localeCompare(b.generico, 'pt-BR')).filter((d) => classe === 'todas' || d.classe === classe);
  const info = CLASSES_DIURETICO.find((c) => c.id === classe);
  const chips: { id: ClasseDiuretico | 'todas'; nome: string; cor?: string }[] = [{ id: 'todas', nome: 'Todas' }, ...CLASSES_DIURETICO.map((c) => ({ id: c.id, nome: c.nome, cor: c.cor }))];

  return (
    <CalculadoraLayout reforcado titulo="Diuréticos" info={
      <>
        <TituloInfo>O que é esta ferramenta</TituloInfo>
        <p>Guia de consulta dos diuréticos disponíveis no Brasil: nome genérico e comercial, mecanismo, dose de bula, início e duração, riscos e cuidados na DRC. Os dados vêm das bulas (Anvisa/fabricantes); o que não consta na bula aparece separado, como &quot;fora da bula&quot;.</p>
        <TituloInfo>Equivalência</TituloInfo>
        <ul className="space-y-1">
          <li>• Só há equivalência de dose DENTRO da mesma classe (alça com alça; tiazídico com tiazídico) e ela é aproximada.</li>
          <li>• Não existe equivalência entre classes (ex.: furosemida × espironolactona), nem entre os poupadores de potássio, acetazolamida ou manitol.</li>
          <li>• Indapamida e piretanida: sem equivalência consolidada, por isso não entram.</li>
        </ul>
        <TituloInfo>Não incluídos</TituloInfo>
        <p>Inibidores de SGLT2 (gliflozinas) não são diuréticos: têm efeito natriurético discreto e indicação cardiorrenal própria.</p>
        <TituloInfo>Limites</TituloInfo>
        <p>As bulas mudam; confira a bula vigente do produto antes de prescrever. O app não substitui o julgamento clínico.</p>
      </>
    }>
      <AbasSublinhadas valor={aba} onChange={setAba} opcoes={[{ valor: 'guia', texto: 'Guia' }, { valor: 'equivalencia', texto: 'Equivalência de dose' }]} />
      {aba === 'equivalencia' ? <ConversorDiureticos /> : (
        <>
          <div role="group" aria-label="Classe" className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1">
            {chips.map((c) => {
              const ativo = classe === c.id;
              return (
                <button key={c.id} type="button" aria-pressed={ativo} onClick={() => setClasse(c.id)}
                  className="shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold"
                  style={{ backgroundColor: ativo ? (c.cor ?? colors.button) : 'transparent', color: ativo ? '#fff' : colors.text, border: `1px solid ${ativo ? (c.cor ?? colors.button) : (c.cor ?? colors.inputBorder)}` }}>
                  {c.nome}
                </button>
              );
            })}
          </div>
          {info && <p className="mb-3 px-1 text-sm leading-5" style={{ color: colors.text, opacity: 0.8 }}>{info.resumo}</p>}
          <div className="space-y-2.5">{lista.map((d) => <Cartao key={d.id} d={d} />)}</div>
          <p className="mt-4 px-1 text-xs leading-5" style={{ color: colors.text, opacity: 0.65 }}>Fonte: bulas Lasix, Burinax, Arelix, Clorana, Higroton, Natrilix, Moduretic, Iguassina, Aldactone, Inspra, Firialta, Diamox e Manitol (Fresenius Kabi), conferidas em 12/11/2026.</p>
        </>
      )}
    </CalculadoraLayout>
  );
}
