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
const ABAS: { id: AbaSodio; rotulo: string; descricao: string }[] = [
  { id: 'hipo', rotulo: 'Hiponatremia', descricao: 'Texto de consulta: classificação, sintomas, causas e tratamento.' },
  { id: 'fluxo', rotulo: 'Diagnóstico passo a passo', descricao: 'Responda perguntas (sintomas, Na, osmolalidade, volemia…) e chegue à causa provável.' },
  { id: 'corrigir-hipo', rotulo: 'Calcular correção (hipo)', descricao: 'Calcula a solução, o volume e a velocidade para corrigir a hiponatremia com segurança.' },
  { id: 'hiper', rotulo: 'Hipernatremia', descricao: 'Texto de consulta: classificação, causas e tratamento.' },
  { id: 'corrigir-hiper', rotulo: 'Calcular correção (hiper)', descricao: 'Calcula o déficit de água livre e a velocidade de correção da hipernatremia.' },
  { id: 'ingestao', rotulo: 'Ingestão de sódio', descricao: 'Estima o sal ingerido por dia a partir do sódio na urina de 24 h.' },
];

/** Hub Sódio: conteúdo, fluxograma e calculadoras na mesma tela; cada slug antigo abre a aba correspondente. */
export default function SodioHub({ inicial = 'hipo' }: { inicial?: AbaSodio }) {
  const [aba, setAba] = useState<AbaSodio>(inicial);
  return (
    <div>
      <AbasHub abas={ABAS} ativa={aba} onChange={setAba} rotulo="Ferramentas de sódio" />
      {aba === 'hipo' && <ConteudoPagina dados={hiponatremia} />}
      {aba === 'fluxo' && <FluxogramaHiponatremia irParaCorrecao={() => setAba('corrigir-hipo')} />}
      {aba === 'corrigir-hipo' && <CorrecaoSodio direcao="hipo" />}
      {aba === 'hiper' && <ConteudoPagina dados={hipernatremia} />}
      {aba === 'corrigir-hiper' && <CorrecaoSodio direcao="hiper" />}
      {aba === 'ingestao' && <IngestaoSodio />}
    </div>
  );
}
