'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { AGENTES, PRINCIPIOS_ECTR, ROTULO_CATEGORIA, ROTULO_GRAU, buscarAgentes, type Categoria, type Grau } from '@/lib/content/ectr';
import CartaoAcordeao, { ListaPontos } from '@/components/ui/CartaoAcordeao';
import Campo from '@/components/ui/Campo';
import Escolha from '@/components/ui/Escolha';
import LegalNote from '@/components/ui/LegalNote';
import InfoDialog, { TituloInfo } from '@/components/ui/InfoDialog';

type Filtro = Categoria | 'todas';
const FILTROS: { valor: Filtro; texto: string }[] = [
  { valor: 'todas', texto: 'Todos' },
  { valor: 'indicar', texto: 'Considerar depuração' },
  { valor: 'nao-indicar', texto: 'Em geral não depurar' },
];
const COR_CATEGORIA: Record<Categoria, string> = { indicar: '#2e7d32', 'nao-indicar': '#c62828' };

/** Intoxicações exógenas: quando indicar depuração extracorpórea (critérios EXTRIP por agente). */
export default function IntoxicacoesHub() {
  const { colors } = useTheme();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [abertas, setAbertas] = useState<Record<string, boolean>>({});
  const alternar = (id: string) => setAbertas((a) => ({ ...a, [id]: !a[id] }));
  const lista = buscarAgentes(AGENTES, busca, filtro);
  const corGrau = (g: Grau) => (g === 'recomendado' ? '#2e7d32' : g === 'sugerido' ? colors.warning : colors.text);

  return (
    <div className="mx-auto w-full max-w-2xl pb-24">
      <h1 className="text-center text-2xl font-extrabold" style={{ color: colors.text }}>Intoxicações Exógenas</h1>
      <p className="text-center text-base font-semibold" style={{ color: colors.resultText }}>Quando indicar depuração extracorpórea</p>
      <LegalNote />
      <div className="mx-auto mt-2 max-w-md">
        <Campo icone="search" placeholder="Buscar agente (ex.: lítio, metanol)" valor={busca} onChange={setBusca} />
        <Escolha rotulo="Mostrar" valor={filtro} onChange={setFiltro} opcoes={FILTROS} />
      </div>

      {filtro === 'todas' && !busca.trim() && PRINCIPIOS_ECTR.map((p, i) => (
        <CartaoAcordeao key={p.titulo} id={`princ-${i}`} titulo={p.titulo} cor={colors.button} aberto={!!abertas[`princ-${i}`]} onAlternar={() => alternar(`princ-${i}`)}>
          <ListaPontos itens={p.itens} />
        </CartaoAcordeao>
      ))}

      {lista.length === 0 && <p className="mt-6 text-center text-base" style={{ color: colors.text }}>Nenhum agente encontrado.</p>}
      {lista.map((a) => (
        <CartaoAcordeao key={a.id} id={a.id} titulo={a.nome} resumo={a.resumo} cor={COR_CATEGORIA[a.categoria]} selo={ROTULO_CATEGORIA[a.categoria]}
          aberto={!!abertas[a.id]} onAlternar={() => alternar(a.id)}>
          {a.criterios && (
            <div>
              <p className="mb-1 font-bold">{a.categoria === 'indicar' ? 'Critérios para depurar' : 'Exceção'}</p>
              <ul className="space-y-1.5">
                {a.criterios.map((c, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0 font-bold" style={{ color: corGrau(c.grau) }}>{ROTULO_GRAU[c.grau]}:</span><span>{c.texto}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {a.contra && (
            <div className={a.criterios ? 'mt-3' : ''}>
              <p className="mb-1 font-bold">{a.categoria === 'indicar' ? 'Atenção' : 'Por que não'}</p>
              <ListaPontos itens={a.contra} />
            </div>
          )}
          {a.modalidade && <p className="mt-3"><span className="font-bold">Modalidade: </span>{a.modalidade}</p>}
          {a.parar && <p className="mt-2"><span className="font-bold">Quando parar: </span>{a.parar}</p>}
          {a.antidoto && <p className="mt-2"><span className="font-bold">Antídoto e cuidados: </span>{a.antidoto}</p>}
          {a.nota && <p className="mt-2 text-sm italic opacity-90">{a.nota}</p>}
          <p className="mt-3 text-sm opacity-70">Fonte: {a.fonte}</p>
        </CartaoAcordeao>
      ))}

      <InfoDialog titulo="Como ler esta tela">
        <TituloInfo>Graduação do EXTRIP</TituloInfo>
        <ul className="space-y-1">
          <li>• <b>Recomendado</b>: o grupo recomenda a depuração nessa situação.</li>
          <li>• <b>Sugerido</b>: o grupo sugere (recomendação mais fraca).</li>
          <li>• <b>Neutro</b>: sem posição a favor nem contra.</li>
        </ul>
        <p className="mt-2">Quase toda a evidência é de qualidade muito baixa (D): são consensos de especialistas. Níveis séricos só aparecem onde o EXTRIP os definiu.</p>
        <TituloInfo>Siglas</TituloInfo>
        <p>HDI: hemodiálise intermitente · CKRT: terapia renal substitutiva contínua · HP: hemoperfusão · MDAC: carvão ativado em múltiplas doses.</p>
        <TituloInfo>Limites</TituloInfo>
        <ul className="space-y-1">
          <li>• Não substitui o centro de toxicologia nem a avaliação clínica.</li>
          <li>• Só entram agentes com recomendação EXTRIP verificada. Os demais ainda estão em pesquisa.</li>
        </ul>
        <TituloInfo>Fonte principal</TituloInfo>
        <p>EXTRIP Workgroup (extrip-workgroup.org) e os artigos de recomendação de cada agente, citados em cada cartão.</p>
      </InfoDialog>
    </div>
  );
}
