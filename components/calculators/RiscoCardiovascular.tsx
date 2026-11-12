'use client';

import { useState } from 'react';
import Escolha from '@/components/ui/Escolha';
import RiscoPce from './RiscoPce';
import RiscoPrevent from './RiscoPrevent';

type Equacao = 'prevent' | 'pce';

/** Risco cardiovascular: PREVENT (AHA 2023, recomendado, inclui TFG e albuminúria) ou PCE (ACC/AHA 2013). */
export default function RiscoCardiovascular() {
  const [eq, setEq] = useState<Equacao>('prevent');
  const topo = <Escolha rotulo="Equação" valor={eq} onChange={setEq} opcoes={[{ valor: 'prevent', texto: 'PREVENT (2023)' }, { valor: 'pce', texto: 'PCE (2013)' }]} />;
  return eq === 'prevent' ? <RiscoPrevent topo={topo} /> : <RiscoPce topo={topo} />;
}
