'use client';

import { useState } from 'react';
import AbasHub from '@/components/ui/AbasHub';
import ConteudoPagina from '@/components/archetypes/ConteudoPagina';
import hipercalcemia from '@/lib/content/hipercalcemia';
import hipercalemia from '@/lib/content/hipercalemia';
import hipocalemia from '@/lib/content/hipocalemia';
import hipocalcemia from '@/lib/content/hipocalcemia';
import hiperfosfatemia from '@/lib/content/hiperfosfatemia';
import hipofosfatemia from '@/lib/content/hipofosfatemia';
import hipermagnesemia from '@/lib/content/hipermagnesemia';
import hipomagnesemia from '@/lib/content/hipomagnesemia';
import CorrecaoCalcio from '@/components/calculators/CorrecaoCalcio';
import type { ConteudoPagina as Dados } from '@/lib/content/tipos';

export type Eletrolito = 'potassio' | 'calcio' | 'fosforo' | 'magnesio';
export type Direcao = 'hipo' | 'hiper' | 'correcao';

const CONFIG: Record<Eletrolito, { rotulo: string; hipo: Dados; hiper: Dados; nomeHipo: string; nomeHiper: string }> = {
  potassio: { rotulo: 'Ferramentas de potássio', hipo: hipocalemia, hiper: hipercalemia, nomeHipo: 'Hipocalemia', nomeHiper: 'Hipercalemia' },
  calcio: { rotulo: 'Ferramentas de cálcio', hipo: hipocalcemia, hiper: hipercalcemia, nomeHipo: 'Hipocalcemia', nomeHiper: 'Hipercalcemia' },
  fosforo: { rotulo: 'Ferramentas de fósforo', hipo: hipofosfatemia, hiper: hiperfosfatemia, nomeHipo: 'Hipofosfatemia', nomeHiper: 'Hiperfosfatemia' },
  magnesio: { rotulo: 'Ferramentas de magnésio', hipo: hipomagnesemia, hiper: hipermagnesemia, nomeHipo: 'Hipomagnesemia', nomeHiper: 'Hipermagnesemia' },
};

/** Hub de um eletrólito (Ca, P ou Mg): hipo e hiper na mesma tela; cada slug do catálogo abre a aba certa. */
export default function EletrolitoHub({ eletrolito, inicial }: { eletrolito: Eletrolito; inicial: Direcao }) {
  const c = CONFIG[eletrolito];
  const [aba, setAba] = useState<Direcao>(inicial);
  const abas: { id: Direcao; rotulo: string; descricao: string }[] = [
    { id: 'hipo', rotulo: c.nomeHipo, descricao: 'Texto de consulta: ECG, sintomas, tratamento, causas e monitoramento.' },
    { id: 'hiper', rotulo: c.nomeHiper, descricao: 'Texto de consulta: ECG, sintomas, tratamento, causas e monitoramento.' },
    ...(eletrolito === 'calcio' ? [{ id: 'correcao' as const, rotulo: 'Correção do cálcio', descricao: 'Corrige o cálcio total pela albumina sérica.' }] : []),
  ];
  return (
    <div>
      <AbasHub abas={abas} ativa={aba} onChange={setAba} rotulo={c.rotulo} />
      {aba === 'correcao' ? <CorrecaoCalcio /> : <ConteudoPagina dados={aba === 'hipo' ? c.hipo : c.hiper} />}
    </div>
  );
}
