'use client';

import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { estaDisponivel } from '@/lib/tools/catalogo';
import Icone from '@/components/ui/Icone';
import InfoDialog, { TituloInfo } from '@/components/ui/InfoDialog';

const hexParaRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

// Mesmas fórmulas, descrições e cores do RenalFunctionHub.tsx original.
const FERRAMENTAS = [
  { slug: 'ckd-epi-2021', titulo: 'CKD-EPI 2021', descricao: 'Fórmula padrão atual (creatinina sérica, idade, sexo)', icone: 'vial', cor: '#4CAF50' },
  { slug: 'cockcroft-gault', titulo: 'Cockcroft-Gault', descricao: 'Clássica para ajuste de dose de medicamentos', icone: 'flask', cor: '#2196F3' },
  { slug: 'clearance-de-creatinina-ped', titulo: 'Clearance Pediátrico', descricao: 'Fórmula de Schwartz / Chen (crianças)', icone: 'child', cor: '#9C27B0' },
  { slug: 'ckd-epi-creat-cistatina-c', titulo: 'CKD-EPI Creat + Cistatina C', descricao: 'Mais precisa em casos selecionados', icone: 'microscope', cor: '#FF9800' },
];

export default function FuncaoRenalPage() {
  const { colors } = useTheme();
  return (
    <div className="mx-auto w-full max-w-2xl pb-24">
      <h1 className="mb-2 text-center text-2xl font-extrabold" style={{ color: colors.text }}>Função Renal</h1>
      <p className="mb-6 text-center text-base italic" style={{ color: colors.text, opacity: 0.6 }}>Estimativa de TFG / Clearance de Creatinina</p>

      <ul className="flex flex-col gap-2.5">
        {FERRAMENTAS.map((f) => {
          const disponivel = estaDisponivel(f.slug);
          const estilo = { backgroundColor: `rgba(${hexParaRgb(f.cor)}, 0.2)`, border: `2px solid ${f.cor}`, opacity: disponivel ? 1 : 0.55 };
          const conteudo = (
            <span className="flex h-full items-center gap-4">
              <span className="flex w-8 shrink-0 justify-center"><Icone nome={f.icone} tamanho={26} cor={f.cor} /></span>
              <span className="min-w-0 flex-1">
                <span className="mb-0.5 block truncate text-base font-semibold" style={{ color: colors.text }}>{f.titulo}</span>
                <span className="line-clamp-2 block text-sm leading-[18px]" style={{ color: colors.text, opacity: 0.7 }}>{f.descricao}</span>
              </span>
              {!disponivel && <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: colors.buttonSecondary, color: colors.buttonText }}>Em breve</span>}
            </span>
          );
          return (
            <li key={f.slug}>
              {disponivel ? (
                <Link href={`/ferramentas/${f.slug}`} className="block h-[88px] rounded-2xl px-4 py-3 transition-transform active:scale-[0.99]" style={estilo}>{conteudo}</Link>
              ) : (
                <div className="h-[88px] rounded-2xl px-4 py-3" style={estilo} aria-disabled>{conteudo}</div>
              )}
            </li>
          );
        })}
      </ul>

      <InfoDialog titulo="Quando usar cada fórmula?">
        <TituloInfo>CKD-EPI 2021 (apenas creatinina)</TituloInfo>
        <ul className="space-y-1">
          <li>• Fórmula padrão recomendada atualmente (KDIGO 2024, NKF, ERA-EDTA, SBN 2025)</li>
          <li>• Melhor desempenho geral na população adulta (18–90+ anos)</li>
          <li>• Menor viés que MDRD, especialmente em TFG &gt;60 mL/min/1,73m²</li>
          <li>• Recomendada para:
            <ul className="pl-3">
              <li>- Diagnóstico e estadiamento de DRC na maioria dos pacientes</li>
              <li>- Acompanhamento ambulatorial de DRC estável</li>
              <li>- Triagem populacional e programas de saúde pública</li>
              <li>- Relatórios laboratoriais automáticos (maioria dos labs brasileiros já adotou)</li>
            </ul>
          </li>
          <li>• Não ideal quando massa muscular muito atípica (extremos de peso, desnutrição grave, amputações, atletas, paralisias)</li>
        </ul>

        <TituloInfo>Cockcroft-Gault</TituloInfo>
        <ul className="space-y-1">
          <li>• Fórmula clássica (1976), ainda muito usada em 2025/2026</li>
          <li>• Principal indicação:
            <ul className="pl-3">
              <li>• Ajuste de dose de medicamentos excretados renalmente</li>
              <li>• Antibióticos (vancomicina, aminoglicosídeos, cefepime...)</li>
              <li>• Anticoagulantes (enoxaparina, apixabana, rivaroxabana)</li>
              <li>• Metformina, digoxina, lítio, alguns quimioterápicos</li>
            </ul>
          </li>
          <li>• Continua sendo a mais citada nas bulas e diretrizes farmacológicas</li>
          <li>• Limitações:
            <ul className="pl-3">
              <li>- Superestima TFG em obesos (usa peso total)</li>
              <li>- Subestima em idosos frágeis/sarcopênicos</li>
              <li>- Não recomendada para diagnóstico/estadiamento de DRC (KDIGO desde 2012/2024)</li>
            </ul>
          </li>
        </ul>

        <TituloInfo>Clearance Pediátrico</TituloInfo>
        <ul className="space-y-1">
          <li>• Fórmulas específicas e validadas para crianças e adolescentes</li>
          <li>• Método padrão na prática clínica: Schwartz Bedside 2009 (creatinina + altura)</li>
          <li>• A altura é obrigatória na maioria das equações pediátricas</li>
          <li>• NÃO utilizar fórmulas adultas em pacientes pediátricos</li>
        </ul>

        <TituloInfo>CKD-EPI Creatinina + Cistatina C</TituloInfo>
        <ul className="space-y-1">
          <li>• Combinação → maior precisão quando creatinina isolada é duvidosa</li>
          <li>• Principais indicações:
            <ul className="pl-3">
              <li>- Idosos frágeis com sarcopenia avançada</li>
              <li>- Baixa massa muscular (caquexia, cirrose, DPOC grave, desnutrição)</li>
              <li>- Amputados, paraplégicos, tetraplégicos</li>
              <li>- Atletas/fisiculturistas (creatinina elevada por massa muscular)</li>
              <li>- Confirmação em valores limítrofes (TFG ~55–75 mL/min)</li>
              <li>- Avaliação de doadores renais vivos (&gt;50 anos)</li>
            </ul>
          </li>
          <li>• Considerada o padrão-ouro não invasivo atual nessas situações</li>
        </ul>

        <p className="mt-5">
          A escolha da equação deve ser individualizada considerando: idade, composição corporal, objetivo clínico
          (diagnóstico × ajuste de dose), disponibilidade laboratorial e contexto do paciente. Em caso de dúvida
          significativa → considerar clearance medido (urina 24h ou métodos exógenos) ou creatinina + cistatina C.
        </p>
      </InfoDialog>
    </div>
  );
}
