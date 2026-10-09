'use client';

import { useState } from 'react';
import AbasHub from '@/components/ui/AbasHub';
import ConteudoPagina from '@/components/archetypes/ConteudoPagina';
import CorrecaoSodio from '@/components/calculators/CorrecaoSodio';
import FluxogramaHiponatremia from '@/components/calculators/FluxogramaHiponatremia';
import IngestaoSodio from '@/components/calculators/IngestaoSodio';
import hiponatremia from '@/lib/content/hiponatremia';
import hipernatremia from '@/lib/content/hipernatremia';

export type AbaSodio = 'hipo' | 'fluxo' | 'corrigir-hipo' | 'hiper' | 'corrigir-hiper' | 'ingestao';
const ABAS: { id: AbaSodio; rotulo: string }[] = [
  { id: 'hipo', rotulo: 'Hiponatremia' }, { id: 'fluxo', rotulo: 'Fluxograma' }, { id: 'corrigir-hipo', rotulo: 'Corrigir hipo' },
  { id: 'hiper', rotulo: 'Hipernatremia' }, { id: 'corrigir-hiper', rotulo: 'Corrigir hiper' }, { id: 'ingestao', rotulo: 'Ingestão' },
];

/** Hub Sódio: conteúdo, fluxograma e calculadoras na mesma tela; cada slug antigo abre a aba correspondente. */
export default function SodioHub({ inicial = 'hipo' }: { inicial?: AbaSodio }) {
  const [aba, setAba] = useState<AbaSodio>(inicial);
  return (
    <div>
      <AbasHub abas={ABAS} ativa={aba} onChange={setAba} rotulo="Ferramentas de sódio" />
      {aba === 'hipo' && <ConteudoPagina dados={hiponatremia} />}
      {aba === 'fluxo' && <FluxogramaHiponatremia />}
      {aba === 'corrigir-hipo' && <CorrecaoSodio direcao="hipo" />}
      {aba === 'hiper' && <ConteudoPagina dados={hipernatremia} />}
      {aba === 'corrigir-hiper' && <CorrecaoSodio direcao="hiper" />}
      {aba === 'ingestao' && <IngestaoSodio />}
    </div>
  );
}
