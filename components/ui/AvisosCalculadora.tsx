'use client';

import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { estaDisponivel } from '@/lib/tools/catalogo';
import Icone from './Icone';

const SLUG_PEDIATRICO = 'clearance-de-creatinina-ped';

/** Avisos que não impedem o cálculo, com link para o Clearance Pediátrico quando ele já estiver no menu. */
export default function AvisosCalculadora({ avisos }: { avisos: string[] }) {
  const { colors } = useTheme();
  if (avisos.length === 0) return null;
  return (
    <div role="alert" className="mt-5 space-y-2 rounded-xl p-4" style={{ backgroundColor: colors.warningBg, borderLeft: '4px solid #ff6b35' }}>
      {avisos.map((a) => (
        <p key={a} className="flex gap-2 text-base font-semibold leading-5" style={{ color: '#111' }}>
          <Icone nome="exclamation-triangle" tamanho={18} cor="#7c2d12" className="mt-0.5 shrink-0" />
          <span>
            {a}
            {a.includes('Clearance Pediátrico') && estaDisponivel(SLUG_PEDIATRICO) && (
              <> <Link href={`/ferramentas/${SLUG_PEDIATRICO}`} className="underline">Abrir Clearance Pediátrico</Link></>
            )}
          </span>
        </p>
      ))}
    </div>
  );
}
