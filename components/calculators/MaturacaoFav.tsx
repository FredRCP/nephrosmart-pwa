'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { avaliarFav } from '@/lib/clinical/escores';
import { normalizarNumero } from '@/lib/clinical/numeros';
import CalculadoraLayout, { BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import Campo from '@/components/ui/Campo';
import Escolha from '@/components/ui/Escolha';
import { TituloInfo } from '@/components/ui/InfoDialog';

export default function MaturacaoFav() {
  const { colors } = useTheme();
  const [fluxo, setFluxo] = useState('');
  const [diametro, setDiametro] = useState('');
  const [prof, setProf] = useState('');
  const [palpavel, setPalpavel] = useState<'sim' | 'nao' | ''>('');
  const r = avaliarFav(fluxo, diametro, prof, palpavel === '' ? null : palpavel === 'sim');
  const sit = (id: string) => r.criterios.find((c) => c.id === id)!.situacao;
  const nota = (id: string, req: string) => {
    const s = sit(id);
    const cor = s === 'ok' ? '#16a34a' : s === 'falha' || s === 'invalido' ? colors.inputError : colors.text;
    return <p className="-mt-2 mb-3 px-1 text-sm font-medium" style={{ color: cor }}>{s === 'invalido' ? 'Valor fora da faixa plausível' : req}</p>;
  };
  const algumDado = fluxo !== '' || diametro !== '' || prof !== '' || palpavel !== '';
  const invalido = r.criterios.some((c) => c.situacao === 'invalido');
  let texto = '', cor = colors.resultText;
  if (algumDado && !invalido) {
    if (r.naoAtendidos.length) { texto = `Critérios não atendidos: ${r.naoAtendidos.join('; ')}`; cor = colors.inputError; }
    else if (r.completo) { texto = 'Todos os critérios da regra dos 6 foram atendidos.'; cor = '#16a34a'; }
    else texto = 'Até agora, nenhum critério reprovado. Preencha os demais.';
  }
  const limpar = () => { setFluxo(''); setDiametro(''); setProf(''); setPalpavel(''); };

  return (
    <CalculadoraLayout titulo="Maturação da FAV (regra dos 6)" info={
      <>
        <TituloInfo>Finalidade</TituloInfo>
        <p>Auxilia a checar se uma fístula arteriovenosa para hemodiálise atende aos critérios ultrassonográficos e clínicos clássicos de maturação (&quot;regra dos 6&quot;, KDOQI). A decisão de puncionar é do nefrologista/cirurgião vascular.</p>
        <TituloInfo>Critérios usados</TituloInfo>
        <ul className="space-y-1">
          <li>• Fluxo (Doppler) ≥ 600 mL/min</li>
          <li>• Diâmetro da veia ≥ 6 mm</li>
          <li>• Profundidade ≤ 6 mm da pele</li>
          <li>• Veia palpável/compressível ao exame físico</li>
        </ul>
        <TituloInfo>Observações</TituloInfo>
        <ul className="space-y-1">
          <li>• A literatura varia no limite exato (&quot;&gt;&quot; ou &quot;≥&quot;; &quot;&lt;&quot; ou &quot;≤&quot;); aqui os limites são inclusivos.</li>
          <li>• Margens bem definidas e avaliação em torno de 6 semanas também fazem parte da regra clássica.</li>
          <li>• Medidas por profissional treinado; considere estenose, trombose e trajeto da veia.</li>
          <li>• Em fístula que não amadurece, discuta com o cirurgião vascular.</li>
        </ul>
        <TituloInfo>Referências</TituloInfo>
        <ul className="space-y-1">
          <li>• KDOQI Clinical Practice Guidelines for Vascular Access, 2006.</li>
          <li>• Lok CE et al. KDOQI Clinical Practice Guideline for Vascular Access: 2019 Update. Am J Kidney Dis 2020;75(4 Suppl 2):S1–S164.</li>
        </ul>
      </>
    }>
      <Campo icone="vial" placeholder="Fluxo no Doppler (mL/min)" inputMode="decimal" valor={fluxo} onChange={(t) => setFluxo(normalizarNumero(t))} erro={sit('fluxo') === 'invalido'} />
      {nota('fluxo', 'Requerido: ≥ 600 mL/min')}
      <Campo icone="ruler-vertical" placeholder="Diâmetro da veia (mm)" inputMode="decimal" valor={diametro} onChange={(t) => setDiametro(normalizarNumero(t))} erro={sit('diametro') === 'invalido'} />
      {nota('diametro', 'Requerido: ≥ 6 mm')}
      <Campo icone="ruler-vertical" placeholder="Profundidade da veia (mm)" inputMode="decimal" valor={prof} onChange={(t) => setProf(normalizarNumero(t))} erro={sit('profundidade') === 'invalido'} />
      {nota('profundidade', 'Requerido: ≤ 6 mm')}
      <Escolha rotulo="Veia palpável/compressível" valor={palpavel} onChange={setPalpavel} opcoes={[{ valor: 'sim', texto: 'Sim' }, { valor: 'nao', texto: 'Não' }]} />
      <div className="mt-2 flex justify-center"><BotaoSecundario onClick={limpar}>Limpar</BotaoSecundario></div>
      {texto && <CartaoResultado texto={texto} cor={cor} />}
    </CalculadoraLayout>
  );
}
