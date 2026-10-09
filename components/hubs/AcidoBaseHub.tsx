'use client';

import { useState } from 'react';
import AbasHub from '@/components/ui/AbasHub';
import CompensacaoAcidoBase from '@/components/calculators/CompensacaoAcidoBase';
import AnionGapCalculator from '@/components/calculators/AnionGapCalculator';
import GasometriaCalculator from '@/components/calculators/GasometriaCalculator';
import BicarbonatoCalculator from '@/components/calculators/BicarbonatoCalculator';

export type AbaAcidoBase = 'compensacao' | 'anion-gap' | 'gasometria' | 'bicarbonato';
const ABAS: { id: AbaAcidoBase; rotulo: string }[] = [
  { id: 'compensacao', rotulo: 'Compensação' }, { id: 'anion-gap', rotulo: 'Anion gap' },
  { id: 'gasometria', rotulo: 'Gasometria' }, { id: 'bicarbonato', rotulo: 'Bicarbonato' },
];

/** Hub Ácido-base: as 4 ferramentas ficam numa tela só; cada slug antigo abre a aba correspondente. */
export default function AcidoBaseHub({ inicial = 'compensacao' }: { inicial?: AbaAcidoBase }) {
  const [aba, setAba] = useState<AbaAcidoBase>(inicial);
  return (
    <div>
      <AbasHub abas={ABAS} ativa={aba} onChange={setAba} rotulo="Ferramentas de ácido-base" />
      {aba === 'compensacao' && <CompensacaoAcidoBase />}
      {aba === 'anion-gap' && <AnionGapCalculator />}
      {aba === 'gasometria' && <GasometriaCalculator />}
      {aba === 'bicarbonato' && <BicarbonatoCalculator />}
    </div>
  );
}
