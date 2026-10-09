'use client';

import { useState } from 'react';
import AbasHub from '@/components/ui/AbasHub';
import FracaoExcrecao from '@/components/calculators/FracaoExcrecao';
import { CONFIG_FE, TIPOS_FE, type TipoFE } from '@/lib/clinical/fracoes';

const ABAS = TIPOS_FE.map((t) => ({ id: t, rotulo: CONFIG_FE[t].sigla }));

/** Hub Frações de excreção: 7 calculadoras na mesma tela; cada slug do catálogo abre a aba correspondente. */
export default function FracoesHub({ inicial = 'sodio' }: { inicial?: TipoFE }) {
  const [aba, setAba] = useState<TipoFE>(inicial);
  return (
    <div>
      <AbasHub abas={ABAS} ativa={aba} onChange={setAba} rotulo="Frações de excreção" />
      <FracaoExcrecao key={aba} tipo={aba} />
    </div>
  );
}
