'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import AbasHub from '@/components/ui/AbasHub';
import ConteudoPagina from '@/components/archetypes/ConteudoPagina';
import KdigoCalculator from '@/components/calculators/KdigoCalculator';
import ira from '@/lib/content/ira';

export type AbaIra = 'ira' | 'kdigo';
const ABAS: { id: AbaIra; rotulo: string }[] = [{ id: 'ira', rotulo: 'Injúria Renal Aguda' }, { id: 'kdigo', rotulo: 'Calculadora KDIGO' }];

/** Hub IRA: conteúdo e calculadora KDIGO; atalhos para FENa e FEUr (que são ferramentas do menu). */
export default function IraHub({ inicial = 'ira' }: { inicial?: AbaIra }) {
  const { colors } = useTheme();
  const [aba, setAba] = useState<AbaIra>(inicial);
  const botao = 'rounded-xl px-4 py-2.5 text-sm font-semibold shadow';
  return (
    <div>
      <AbasHub abas={ABAS} ativa={aba} onChange={setAba} rotulo="Injúria renal aguda" />
      {aba === 'ira' && (
        <>
          <ConteudoPagina dados={ira} />
          <div className="mx-auto mt-4 flex max-w-md flex-wrap justify-center gap-3 pb-24">
            <Link href="/ferramentas/fracao-de-excrecao-de-sodio" className={botao} style={{ backgroundColor: colors.button, color: colors.buttonText }}>Calcular FENa</Link>
            <Link href="/ferramentas/fracao-de-excrecao-de-ureia" className={botao} style={{ backgroundColor: colors.button, color: colors.buttonText }}>Calcular FEUr</Link>
          </div>
        </>
      )}
      {aba === 'kdigo' && <KdigoCalculator />}
    </div>
  );
}
