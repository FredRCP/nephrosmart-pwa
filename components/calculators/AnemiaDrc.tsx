'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { CAUSAS_HIPORRESPONSIVIDADE, avaliarAnemia, type Alerta, type EntradaAnemia, type TipoPaciente } from '@/lib/clinical/anemia';
import { normalizarNumero } from '@/lib/clinical/numeros';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import Campo from '@/components/ui/Campo';
import Escolha from '@/components/ui/Escolha';
import Icone from '@/components/ui/Icone';
import { TituloInfo } from '@/components/ui/InfoDialog';

const VAZIO: EntradaAnemia = {
  tipo: '', hb: '', ferritina: '', tsat: '', emAee: false, aeeRecente: false, hbAnterior: '', semanas: '', infeccao: false,
  hipoResposta: false, suspeitaAplasia: false, malignidade: false, eventoCv: false, trombose: false, gravidez: false, hepatopatia: false,
};

function Marcar({ rotulo, marcado, onChange }: { rotulo: string; marcado: boolean; onChange: (v: boolean) => void }) {
  const { colors } = useTheme();
  return (
    <label className="mb-2 flex items-start gap-3 rounded-xl px-3 py-2.5 text-base" style={{ backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}`, color: colors.text }}>
      <input type="checkbox" checked={marcado} onChange={(e) => onChange(e.target.checked)} className="mt-1 size-5 shrink-0" />
      <span>{rotulo}</span>
    </label>
  );
}

/** Anemia na DRC (KDIGO 2026): mostra as recomendações aplicáveis, com grau e fonte. Não prescreve e não guarda dados. */
export default function AnemiaDrc() {
  const { colors } = useTheme();
  const [e, setE] = useState<EntradaAnemia>(VAZIO);
  const [erros, setErros] = useState<string[]>([]);
  const [tentativa, setTentativa] = useState(0);
  const [mensagem, setMensagem] = useState('');
  const [alertas, setAlertas] = useState<Alerta[] | null>(null);
  const erro = (c: string) => erros.includes(c);
  const mudar = <K extends keyof EntradaAnemia>(k: K, v: EntradaAnemia[K]) => { setE((x) => ({ ...x, [k]: v })); setErros((l) => l.filter((c) => c !== k)); setAlertas(null); setMensagem(''); };
  const num = (k: keyof EntradaAnemia) => (t: string) => mudar(k, normalizarNumero(t) as never);
  const bool = (k: keyof EntradaAnemia) => (v: boolean) => mudar(k, v as never);

  const avaliar = () => {
    setTentativa((t) => t + 1);
    const r = avaliarAnemia(e);
    if (!r.ok) { setErros(r.campos); setMensagem(r.mensagem); setAlertas(null); return; }
    setErros([]); setMensagem(''); setAlertas(r.alertas);
  };
  const limpar = () => { setE(VAZIO); setErros([]); setMensagem(''); setAlertas(null); };
  const corNivel = (n: Alerta['nivel']) => (n === 'perigo' ? colors.inputError : n === 'atencao' ? '#ff6b35' : colors.button);

  return (
    <CalculadoraLayout titulo="Anemia na DRC (KDIGO 2026)" info={
      <>
        <TituloInfo>Siglas</TituloInfo>
        <ul className="space-y-1">
          <li>• <b>AEE</b>: agente estimulador da eritropoiese. Medicamentos que estimulam a medula a produzir hemácias, como a eritropoetina (epoetina), a darbepoetina e a CERA (metoxi-polietilenoglicol-epoetina beta).</li>
          <li>• <b>HIF-PHI</b>: inibidor da prolil-hidroxilase do fator induzível por hipóxia (em inglês, hypoxia-inducible factor prolyl hydroxylase inhibitor). São comprimidos, como roxadustate, daprodustate e vadadustate, que fazem o organismo produzir mais eritropoetina própria.</li>
          <li>• <b>HIF</b>: fator induzível por hipóxia, a proteína que aumenta a produção de eritropoetina quando falta oxigênio. <b>PHI</b>: inibidor da prolil-hidroxilase, a enzima que normalmente degrada o HIF.</li>
          <li>• <b>TSAT</b>: saturação de transferrina. <b>Hb</b>: hemoglobina. <b>HD</b>: hemodiálise. <b>DP</b>: diálise peritoneal.</li>
        </ul>
        <TituloInfo>O que esta tela faz</TituloInfo>
        <p>Compara os valores informados com as recomendações da KDIGO 2026 (Kidney Int 2026;109 suplemento 1S) e mostra o que se aplica, com o grau da recomendação e o número do ponto de prática. Não prescreve, não calcula dose e não guarda dados.</p>
        <TituloInfo>Graus</TituloInfo>
        <p>1D: recomendação forte, evidência muito baixa. 2D: sugestão (condicional), evidência muito baixa. Ponto de prática: consenso sem grau.</p>
        <TituloInfo>Frequência dos exames</TituloInfo>
        <ul className="space-y-1">
          <li>• Hb a cada 2 a 4 semanas depois de iniciar ou mudar a dose do AEE (ponto de prática).</li>
          <li>• Hb pelo menos a cada 3 meses na manutenção (ponto de prática).</li>
          <li>• A KDIGO não exige todos os exames de anemia todo mês: a rotina mensal vem do protocolo da unidade.</li>
        </ul>
        <TituloInfo>Hiporresponsividade: causas a investigar</TituloInfo>
        <ul className="space-y-1">{CAUSAS_HIPORRESPONSIVIDADE.map((c) => <li key={c}>• {c}</li>)}</ul>
        <p className="mt-2">A KDIGO não define um corte único de dose nem um painel de exames obrigatório: a investigação é guiada pelas causas.</p>
        <TituloInfo>HIF-PHI</TituloInfo>
        <ul className="space-y-1">
          <li>• Recomendação (2D): sugere-se AEE, e não HIF-PHI, como primeira linha, depois de tratar as causas corrigíveis.</li>
          <li>• Na hiporresponsividade, pode-se considerar um curso experimental de HIF-PHI após discutir riscos e benefícios, com a menor dose eficaz; suspender se não houver resposta em 3 a 4 meses (pontos de prática).</li>
          <li>• Não usar com malignidade ativa, evento cardiovascular recente ou trombose vascular recente.</li>
        </ul>
      </>
    }>
      <Escolha rotulo="Paciente" valor={e.tipo} erro={erro('tipo')} onChange={(t: TipoPaciente) => mudar('tipo', t)}
        opcoes={[{ valor: 'hd', texto: 'Hemodiálise' }, { valor: 'dp', texto: 'Diálise peritoneal' }, { valor: 'nd', texto: 'Sem diálise' }]} />
      <Campo icone="vial" placeholder="Hemoglobina (g/dL)" inputMode="decimal" valor={e.hb} erro={erro('hb')} tentativa={tentativa} onChange={num('hb')} />
      <Campo icone="vial" placeholder="Ferritina (ng/mL)" inputMode="decimal" valor={e.ferritina} erro={erro('ferritina')} tentativa={tentativa} onChange={num('ferritina')} />
      <Campo icone="vial" placeholder="Saturação de transferrina, TSAT (%)" inputMode="decimal" valor={e.tsat} erro={erro('tsat')} tentativa={tentativa} onChange={num('tsat')} />
      <Marcar rotulo="Em uso de AEE (eritropoetina, darbepoetina, CERA)" marcado={e.emAee} onChange={bool('emAee')} />
      {e.emAee && (
        <>
          <Marcar rotulo="AEE iniciado há 4 semanas ou menos" marcado={e.aeeRecente} onChange={bool('aeeRecente')} />
          {e.aeeRecente && (
            <>
              <Campo icone="vial" placeholder="Hb anterior (g/dL)" inputMode="decimal" valor={e.hbAnterior} erro={erro('hbAnterior')} tentativa={tentativa} onChange={num('hbAnterior')} />
              <Campo icone="calendar-alt" placeholder="Semanas entre as duas Hb" inputMode="decimal" valor={e.semanas} erro={erro('semanas')} tentativa={tentativa} onChange={num('semanas')} />
            </>
          )}
          <Marcar rotulo="Hb fora da meta apesar de aumento da dose, ou exigindo doses altas (hiporresponsividade)" marcado={e.hipoResposta} onChange={bool('hipoResposta')} />
          <Marcar rotulo="Queda súbita da Hb apesar do AEE, com reticulocitopenia e leucócitos e plaquetas normais" marcado={e.suspeitaAplasia} onChange={bool('suspeitaAplasia')} />
        </>
      )}
      <Marcar rotulo="Infecção sistêmica ativa" marcado={e.infeccao} onChange={bool('infeccao')} />
      <p className="mb-1 mt-4 px-1 text-sm font-semibold" style={{ color: colors.text }}>Se estiver pensando em HIF-PHI (roxadustate, daprodustate, vadadustate), marque o que existir:</p>
      <Marcar rotulo="Malignidade ativa" marcado={e.malignidade} onChange={bool('malignidade')} />
      <Marcar rotulo="Evento cardiovascular recente" marcado={e.eventoCv} onChange={bool('eventoCv')} />
      <Marcar rotulo="Trombose vascular recente" marcado={e.trombose} onChange={bool('trombose')} />
      <Marcar rotulo="Gravidez" marcado={e.gravidez} onChange={bool('gravidez')} />
      <Marcar rotulo="Insuficiência hepática significativa" marcado={e.hepatopatia} onChange={bool('hepatopatia')} />
      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={avaliar}>Avaliar</BotaoPrimario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>
      {mensagem && <CartaoResultado texto={mensagem} cor={colors.inputError} />}
      {alertas && (
        <div role="status" data-testid="alertas-anemia" className="mt-5 space-y-3">
          {alertas.length === 0 && <p className="text-center text-base" style={{ color: colors.text }}>Nenhuma regra se aplica aos dados informados.</p>}
          {alertas.map((al) => (
            <section key={al.id} className="rounded-xl p-4" style={{ backgroundColor: colors.resultBg, borderLeft: `5px solid ${corNivel(al.nivel)}` }}>
              <h2 className="text-lg font-bold" style={{ color: colors.text }}>{al.titulo}</h2>
              <p className="mt-1 text-base leading-6" style={{ color: colors.text }}>{al.texto}</p>
              <p className="mt-2 text-sm italic opacity-75" style={{ color: colors.text }}>{al.fonte}</p>
            </section>
          ))}
        </div>
      )}
    </CalculadoraLayout>
  );
}
