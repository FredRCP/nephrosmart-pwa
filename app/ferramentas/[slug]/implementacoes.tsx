import type { ReactNode } from 'react';
import CKDEPICalculator from '@/components/calculators/CKDEPICalculator';
import IMCCalculator from '@/components/calculators/IMCCalculator';
import ConteudoPagina from '@/components/archetypes/ConteudoPagina';
import hipercalemia from '@/lib/content/hipercalemia';

// slug do catálogo → tela. Ao migrar uma ferramenta, registre aqui E em lib/tools/disponiveis.ts.
export const implementacoes: Record<string, () => ReactNode> = {
  imc: () => <IMCCalculator />,
  'ckd-epi-2021': () => <CKDEPICalculator />,
  'hipercalemia-potassio': () => <ConteudoPagina dados={hipercalemia} />,
};
