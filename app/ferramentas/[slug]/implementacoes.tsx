import type { ReactNode } from 'react';
import CKDEPICalculator from '@/components/calculators/CKDEPICalculator';
import IMCCalculator from '@/components/calculators/IMCCalculator';
import CockcroftGaultCalculator from '@/components/calculators/CockcroftGaultCalculator';
import CKDEPICistatinaCalculator from '@/components/calculators/CKDEPICistatinaCalculator';
import PediatricoCalculator from '@/components/calculators/PediatricoCalculator';
import ConteudoPagina from '@/components/archetypes/ConteudoPagina';
import SodioHub from '@/components/hubs/SodioHub';
import AcidoBaseHub from '@/components/hubs/AcidoBaseHub';
import IraHub from '@/components/hubs/IraHub';
import FracoesHub from '@/components/hubs/FracoesHub';
import FuncaoRenalEsperada from '@/components/calculators/FuncaoRenalEsperada';
import OsmolaridadeCalculator from '@/components/calculators/OsmolaridadeCalculator';
import ConversorUnidades from '@/components/calculators/ConversorUnidades';
import Clearance24h from '@/components/calculators/Clearance24h';
import EstadiamentoDrc from '@/components/calculators/EstadiamentoDrc';
import Diureticos from '@/components/calculators/Diureticos';
import ConversorInfusao from '@/components/calculators/ConversorInfusao';
import Sofa2 from '@/components/calculators/Sofa2';
import HemodialiseHub from '@/components/hubs/HemodialiseHub';
import VacinasHub from '@/components/hubs/VacinasHub';
import IntoxicacoesHub from '@/components/hubs/IntoxicacoesHub';
import EletrolitoHub from '@/components/hubs/EletrolitoHub';
import AnemiaDrc from '@/components/calculators/AnemiaDrc';

// slug do catálogo → tela. Ao migrar uma ferramenta, registre aqui E em lib/tools/disponiveis.ts.
export const implementacoes: Record<string, () => ReactNode> = {
  imc: () => <IMCCalculator />,
  'ckd-epi-2021': () => <CKDEPICalculator />,
  'cockcroft-gault': () => <CockcroftGaultCalculator />,
  'ckd-epi-creat-cistatina-c': () => <CKDEPICistatinaCalculator />,
  'clearance-de-creatinina-ped': () => <PediatricoCalculator />,
  'hipercalemia-potassio': () => <EletrolitoHub eletrolito="potassio" inicial="hiper" />,
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
  // Onda 2
  'injuria-renal-aguda-ira': () => <IraHub inicial="ira" />,
  'fracao-de-excrecao-de-sodio': () => <FracoesHub inicial="sodio" />,
  'fracao-de-excrecao-de-ureia': () => <FracoesHub inicial="ureia" />,
  'fracao-de-excrecao-de-potassio': () => <FracoesHub inicial="potassio" />,
  'fracao-de-excrecao-de-calcio': () => <FracoesHub inicial="calcio" />,
  'fracao-de-excrecao-de-fosforo': () => <FracoesHub inicial="fosforo" />,
  'f-e-de-acido-urico': () => <FracoesHub inicial="acido-urico" />,
  'fracao-de-excrecao-de-magnesio': () => <FracoesHub inicial="magnesio" />,
  'funcao-renal-esperada-p-idade': () => <FuncaoRenalEsperada />,
  // Onda 7 — ferramentas novas
  'conversor-de-unidades-laboratoriais': () => <ConversorUnidades />,
  'depuracao-de-creatinina-24h': () => <Clearance24h />,
  'estadiamento-da-drc-kdigo': () => <EstadiamentoDrc />,
  'equivalencia-de-diureticos': () => <Diureticos />,
  // Onda 8
  'conversor-de-dose': () => <ConversorInfusao />,
  'kt-v-hemodialise': () => <HemodialiseHub inicial="ktv" />,
  sofa: () => <Sofa2 />,
  'vacinas-drc': () => <VacinasHub inicial="drc" />,
  'vacinas-adultos': () => <VacinasHub inicial="adultos" />,
  'intoxicacoes-exogenas': () => <IntoxicacoesHub />,
  // Onda 3 — eletrólitos (hubs de Ca, P e Mg)
  'hipocalcemia-calcio': () => <EletrolitoHub eletrolito="calcio" inicial="hipo" />,
  'hipercalcemia-calcio': () => <EletrolitoHub eletrolito="calcio" inicial="hiper" />,
  'hipofosfatemia-fosforo': () => <EletrolitoHub eletrolito="fosforo" inicial="hipo" />,
  'hiperfosfatemia-fosforo': () => <EletrolitoHub eletrolito="fosforo" inicial="hiper" />,
  'hipomagnesemia-magnesio': () => <EletrolitoHub eletrolito="magnesio" inicial="hipo" />,
  'hipermagnesemia-magnesio': () => <EletrolitoHub eletrolito="magnesio" inicial="hiper" />,
  'correcao-do-calcio-ca2': () => <EletrolitoHub eletrolito="calcio" inicial="correcao" />,
  'hipocalemia-potassio': () => <EletrolitoHub eletrolito="potassio" inicial="hipo" />,
  // Onda 9
  'anemia-drc-dialise': () => <AnemiaDrc />,
};
