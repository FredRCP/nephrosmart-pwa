import type { ReactNode } from 'react';
import CKDEPICalculator from '@/components/calculators/CKDEPICalculator';
import IMCCalculator from '@/components/calculators/IMCCalculator';
import CockcroftGaultCalculator from '@/components/calculators/CockcroftGaultCalculator';
import CKDEPICistatinaCalculator from '@/components/calculators/CKDEPICistatinaCalculator';
import PediatricoCalculator from '@/components/calculators/PediatricoCalculator';
import ConteudoPagina from '@/components/archetypes/ConteudoPagina';
import hipercalemia from '@/lib/content/hipercalemia';
import SodioHub from '@/components/hubs/SodioHub';
import AcidoBaseHub from '@/components/hubs/AcidoBaseHub';
import OsmolaridadeCalculator from '@/components/calculators/OsmolaridadeCalculator';

// slug do catálogo → tela. Ao migrar uma ferramenta, registre aqui E em lib/tools/disponiveis.ts.
export const implementacoes: Record<string, () => ReactNode> = {
  imc: () => <IMCCalculator />,
  'ckd-epi-2021': () => <CKDEPICalculator />,
  'cockcroft-gault': () => <CockcroftGaultCalculator />,
  'ckd-epi-creat-cistatina-c': () => <CKDEPICistatinaCalculator />,
  'clearance-de-creatinina-ped': () => <PediatricoCalculator />,
  'hipercalemia-potassio': () => <ConteudoPagina dados={hipercalemia} />,
  // Onda 1 — hubs: vários slugs do catálogo abrem a mesma tela, cada um na sua aba.
  'hiponatremia-sodio': () => <SodioHub inicial="hipo" />,
  'hiponatremia-fluxograma-na': () => <SodioHub inicial="fluxo" />,
  'correcao-de-hiponatremia-na': () => <SodioHub inicial="corrigir-hipo" />,
  'hipernatremia-sodio': () => <SodioHub inicial="hiper" />,
  'correcao-de-hipernatremia-na': () => <SodioHub inicial="corrigir-hiper" />,
  'ingestao-diaria-de-sodio': () => <SodioHub inicial="ingestao" />,
  'disturbios-acido-base': () => <AcidoBaseHub inicial="compensacao" />,
  'anion-gap': () => <AcidoBaseHub inicial="anion-gap" />,
  'gasometria-arterial': () => <AcidoBaseHub inicial="gasometria" />,
  'reposicao-de-bicarbonato': () => <AcidoBaseHub inicial="bicarbonato" />,
  'osmolaridade-serica': () => <OsmolaridadeCalculator />,
};
