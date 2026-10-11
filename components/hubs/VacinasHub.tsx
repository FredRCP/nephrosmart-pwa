'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { PRINCIPIOS_DRC, ROTULO_GRUPO, VACINAS, buscarVacinas, linhasDrc, type GrupoDrc } from '@/lib/content/vacinas';
import CartaoAcordeao, { ListaPontos } from '@/components/ui/CartaoAcordeao';
import Campo from '@/components/ui/Campo';
import Escolha from '@/components/ui/Escolha';
import LegalNote from '@/components/ui/LegalNote';
import InfoDialog, { TituloInfo } from '@/components/ui/InfoDialog';

export type ModoVacinas = 'adultos' | 'drc';
const GRUPOS: GrupoDrc[] = ['todos', 'naoDialitica', 'dialise'];

/** Vacinas do adulto: alterna entre o calendário do adulto geral e o do adulto com DRC (não dialítica, diálise, pré-transplante). */
export default function VacinasHub({ inicial = 'adultos' }: { inicial?: ModoVacinas }) {
  const { colors } = useTheme();
  const [modo, setModo] = useState<ModoVacinas>(inicial);
  const [grupo, setGrupo] = useState<GrupoDrc>('todos');
  const [busca, setBusca] = useState('');
  const [abertas, setAbertas] = useState<Record<string, boolean>>({});
  const alternar = (id: string) => setAbertas((a) => ({ ...a, [id]: !a[id] }));
  const drc = modo === 'drc';
  const lista = buscarVacinas(VACINAS, busca);

  return (
    <div className="mx-auto w-full max-w-2xl pb-24">
      <h1 className="text-center text-2xl font-extrabold" style={{ color: colors.text }}>Vacinas do Adulto</h1>
      <LegalNote />
      <div className="mx-auto mt-2 max-w-md">
        <Escolha rotulo="Paciente" valor={modo} onChange={setModo}
          opcoes={[{ valor: 'adultos', texto: 'Adulto' }, { valor: 'drc', texto: 'Adulto com DRC' }]} />
        {drc && (
          <Escolha rotulo="Fase da DRC" valor={grupo} onChange={setGrupo}
            opcoes={GRUPOS.map((g) => ({ valor: g, texto: ROTULO_GRUPO[g] }))} />
        )}
        <Campo icone="search" placeholder="Buscar vacina (ex.: hepatite, zóster)" valor={busca} onChange={setBusca} />
      </div>

      <div className="mt-3">
        {drc && !busca.trim() && (
          <CartaoAcordeao id="principios" titulo="Regras gerais na DRC" resumo="Vivas × inativadas, transplante e resposta vacinal" cor={colors.warning}
            aberto={!!abertas.principios} onAlternar={() => alternar('principios')}>
            <ListaPontos itens={PRINCIPIOS_DRC} />
          </CartaoAcordeao>
        )}
        {lista.length === 0 && <p className="mt-6 text-center text-base" style={{ color: colors.text }}>Nenhuma vacina encontrada.</p>}
        {lista.map((v) => {
          const linhas = drc ? linhasDrc(v, grupo) : v.geral;
          return (
            <CartaoAcordeao key={v.id} id={v.id} titulo={v.nome} resumo={drc ? v.resumoDrc : v.resumoGeral}
              cor={v.vivo ? colors.warning : colors.button} selo={v.vivo ? 'Viva' : undefined}
              aberto={!!abertas[v.id]} onAlternar={() => alternar(v.id)}>
              <ListaPontos itens={linhas} />
              {v.disponibilidade && <p className="mt-3"><span className="font-bold">Disponibilidade: </span>{v.disponibilidade}</p>}
              {v.atencao && <p className="mt-2 font-semibold" style={{ color: colors.warning }}>⚠️ {v.atencao}</p>}
              {drc && v.confianca === 'baixa' && <p className="mt-2 text-sm italic opacity-80">Confiança da fonte: baixa. Confirme antes de orientar.</p>}
            </CartaoAcordeao>
          );
        })}
      </div>

      <InfoDialog titulo="Vacinas do adulto">
        <TituloInfo>Como usar</TituloInfo>
        <p>Escolha “Adulto” para o calendário geral ou “Adulto com DRC” para as orientações de quem tem doença renal crônica. Na DRC, filtre por fase: não dialítica ou diálise.</p>
        <TituloInfo>Fontes</TituloInfo>
        <ul className="space-y-1">
          <li>• SBIm: Calendário de Vacinação do Adulto 2026-27 e Calendário de Pacientes Especiais 2026-27.</li>
          <li>• Guia SBIm/ABTO de vacinação em transplante 2025-26.</li>
          <li>• Manual dos Centros de Referência para Imunobiológicos Especiais (CRIE), edição 2023-24.</li>
          <li>• CDC, Adult Immunization Schedule 2026.</li>
        </ul>
        <TituloInfo>Limites</TituloInfo>
        <ul className="space-y-1">
          <li>• Calendários mudam. Não foram conferidos nesta versão o manual CRIE vigente e o calendário do PNI no gov.br.</li>
          <li>• A SBIm e o PNI divergem em alguns pontos (febre amarela, não respondedores de hepatite B, vacinas pneumocócicas no SUS).</li>
          <li>• Isto é apoio à consulta; a decisão é do médico.</li>
        </ul>
      </InfoDialog>
    </div>
  );
}
