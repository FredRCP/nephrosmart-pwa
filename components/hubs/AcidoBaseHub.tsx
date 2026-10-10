'use client';

import { useState } from 'react';
import AbasHub from '@/components/ui/AbasHub';
import CompensacaoAcidoBase from '@/components/calculators/CompensacaoAcidoBase';
import AnionGapCalculator from '@/components/calculators/AnionGapCalculator';
import GasometriaCalculator from '@/components/calculators/GasometriaCalculator';
import BicarbonatoCalculator from '@/components/calculators/BicarbonatoCalculator';

export type AbaAcidoBase = 'compensacao' | 'anion-gap' | 'gasometria' | 'bicarbonato';
const ABAS: { id: AbaAcidoBase; rotulo: string; descricao: string }[] = [
  { id: 'compensacao', rotulo: 'Compensação', descricao: 'Você já sabe o distúrbio (ex.: acidose metabólica)? Informe HCO₃⁻ e PCO₂ para ver se a compensação é adequada ou se há distúrbio misto.' },
  { id: 'anion-gap', rotulo: 'Ânion gap', descricao: 'Calcular o ânion gap: informe Na⁺, Cl⁻ e HCO₃⁻ (e albumina, para corrigir) para investigar a causa da acidose metabólica.' },
  { id: 'gasometria', rotulo: 'Interpretar gasometria', descricao: 'Análise completa: com pH, PCO₂, HCO₃⁻, Na⁺ e Cl⁻ mostra o distúrbio, a compensação, o ânion gap e o delta-delta.' },
  { id: 'bicarbonato', rotulo: 'Repor bicarbonato', descricao: 'Calcula a dose e o volume de bicarbonato de sódio para repor na acidose metabólica.' },
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
