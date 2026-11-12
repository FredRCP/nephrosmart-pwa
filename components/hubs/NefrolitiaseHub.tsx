'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { COLICA_AGUDA, COMO_INVESTIGAR, QUEM_INVESTIGAR, TIPOS_CALCULO, type TipoCalculo } from '@/lib/content/litiase';
import CalculadoraLayout from '@/components/archetypes/CalculadoraLayout';
import CausaLitiase from '@/components/calculators/CausaLitiase';
import AbasSublinhadas from '@/components/ui/AbasSublinhadas';
import Icone from '@/components/ui/Icone';
import { TituloInfo } from '@/components/ui/InfoDialog';

type Aba = 'agudo' | 'causa' | 'tipos';

function Lista({ titulo, itens }: { titulo: string; itens: string[] }) {
  const { colors } = useTheme();
  return (
    <section className="border-t py-3" style={{ borderColor: colors.inputBorder }}>
      <h4 className="mb-1 text-xs font-bold uppercase tracking-wider" style={{ color: colors.text, opacity: 0.65 }}>{titulo}</h4>
      {itens.map((t, i) => <p key={i} className="py-0.5 text-[15px] leading-6" style={{ color: colors.text }}>• {t}</p>)}
    </section>
  );
}

function CartaoTipo({ t }: { t: TipoCalculo }) {
  const { colors } = useTheme();
  return (
    <details data-testid={`tipo-${t.id}`} className="group rounded-xl shadow-md" style={{ backgroundColor: colors.inputBg, borderLeft: `4px solid ${t.cor}` }}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <span className="min-w-0">
          <span className="block text-lg font-bold leading-6" style={{ color: colors.text }}>{t.nome}</span>
          <span className="block text-sm" style={{ color: colors.text, opacity: 0.75 }}>{t.frequencia}</span>
        </span>
        <span className="shrink-0 transition-transform group-open:rotate-180"><Icone nome="chevron-down" tamanho={16} cor={colors.icon} /></span>
      </summary>
      <div className="px-4 pb-2">
        <Lista titulo="Causas e fatores de risco" itens={t.causas} />
        <Lista titulo="Como investigar" itens={t.exames} />
        <Lista titulo="Imagem" itens={t.imagem} />
        <Lista titulo="Tratamento e prevenção" itens={t.tratamento} />
      </div>
    </details>
  );
}

function Agudo() {
  const { colors } = useTheme();
  return (
    <div className="space-y-2.5">
      {COLICA_AGUDA.map((b) => (
        <details key={b.titulo} open={b.alerta} className="group rounded-xl shadow-md" style={{ backgroundColor: colors.inputBg, borderLeft: `4px solid ${b.alerta ? '#dc2626' : '#3b82f6'}` }}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-base font-bold" style={{ color: colors.text }}>
            {b.titulo}
            <span className="shrink-0 transition-transform group-open:rotate-180"><Icone nome="chevron-down" tamanho={16} cor={colors.icon} /></span>
          </summary>
          <div className="px-4 pb-3">{b.itens.map((t, i) => <p key={i} className="py-0.5 text-[15px] leading-6" style={{ color: colors.text }}>• {t}</p>)}</div>
        </details>
      ))}
    </div>
  );
}

export default function NefrolitiaseHub({ inicial = 'causa' }: { inicial?: Aba }) {
  const { colors } = useTheme();
  const [aba, setAba] = useState<Aba>(inicial);
  return (
    <CalculadoraLayout reforcado titulo="Nefrolitíase" info={
      <>
        <TituloInfo>O que é esta ferramenta</TituloInfo>
        <p>Guia para o nefrologista identificar a causa do cálculo: a aba “Investigar causa” compara urina de 24 h, sangue, composição e TC com valores de referência (AUA/EAU) e lista causas a considerar e próximos passos.</p>
        <TituloInfo>Quem investigar</TituloInfo>
        <ul className="space-y-1">{QUEM_INVESTIGAR.map((q) => <li key={q}>• {q}</li>)}</ul>
        <TituloInfo>Como investigar</TituloInfo>
        <ul className="space-y-1">{COMO_INVESTIGAR.map((q) => <li key={q}>• {q}</li>)}</ul>
        <TituloInfo>Limites</TituloInfo>
        <p>Os limiares dependem da dieta e do laboratório. A ferramenta apoia o raciocínio clínico e não substitui o julgamento do médico.</p>
      </>
    }>
      <AbasSublinhadas valor={aba} onChange={setAba} opcoes={[{ valor: 'agudo', texto: 'Cólica aguda' }, { valor: 'causa', texto: 'Investigar causa' }, { valor: 'tipos', texto: 'Tipos de cálculo' }]} />
      {aba === 'causa' && <CausaLitiase />}
      {aba === 'tipos' && (
        <>
          <p className="mb-3 px-1 text-sm leading-5" style={{ color: colors.text, opacity: 0.8 }}>Toque no tipo para ver causas, exames, imagem e prevenção.</p>
          <div className="space-y-2.5">{TIPOS_CALCULO.map((t) => <CartaoTipo key={t.id} t={t} />)}</div>
        </>
      )}
      {aba === 'agudo' && <Agudo />}
    </CalculadoraLayout>
  );
}
