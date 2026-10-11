'use client';

import { useState } from 'react';
import AbasHub from '@/components/ui/AbasHub';
import KtvCalculator from '@/components/calculators/KtvCalculator';
import TaxaUf from '@/components/calculators/TaxaUf';

export type AbaHd = 'ktv' | 'uf';
const ABAS: { id: AbaHd; rotulo: string; descricao: string }[] = [
  { id: 'ktv', rotulo: 'Kt/V e URR', descricao: 'Adequação da sessão a partir da ureia pré e pós, tempo, ultrafiltração e peso.' },
  { id: 'uf', rotulo: 'Taxa de UF', descricao: 'Velocidade de ultrafiltração em mL/kg/h e ganho interdialítico.' },
];

/** Hub de hemodiálise: adequação (Kt/V, URR) e taxa de ultrafiltração. */
export default function HemodialiseHub({ inicial = 'ktv' }: { inicial?: AbaHd }) {
  const [aba, setAba] = useState<AbaHd>(inicial);
  return (
    <div>
      <AbasHub abas={ABAS} ativa={aba} onChange={setAba} rotulo="Hemodiálise" />
      {aba === 'ktv' ? <KtvCalculator /> : <TaxaUf />}
    </div>
  );
}
