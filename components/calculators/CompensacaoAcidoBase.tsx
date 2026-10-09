'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { calcularCompensacao, type Disturbio, type Fase } from '@/lib/clinical/acidobase';
import { normalizarNumero } from '@/lib/clinical/numeros';
import { gravarLocal } from '@/lib/storage';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import Campo from '@/components/ui/Campo';
import Escolha from '@/components/ui/Escolha';
import Icone from '@/components/ui/Icone';
import { BlocoMono, TituloInfo } from '@/components/ui/InfoDialog';

export default function CompensacaoAcidoBase() {
  const { colors } = useTheme();
  const [disturbio, setDisturbio] = useState<Disturbio>('acidose-metabolica');
  const [fase, setFase] = useState<Fase>('aguda');
  const [hco3, setHco3] = useState('');
  const [pco2, setPco2] = useState('');
  const [erros, setErros] = useState({ hco3: false, pco2: false });
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState('');
  const [cor, setCor] = useState('#22c55e');

  const calcular = () => {
    const r = calcularCompensacao({ disturbio, fase, hco3, pco2 });
    setTentativa((t) => t + 1);
    if (!r.ok) { setErros({ hco3: r.erroHco3, pco2: r.erroPco2 }); setResultado(r.mensagem); setCor(colors.inputError); return; }
    setErros({ hco3: false, pco2: false });
    setResultado(r.texto);
    setCor(r.adequada ? '#22c55e' : '#f59e0b');
    gravarLocal('ultimaAcidBase', r.texto);
  };
  const limpar = () => { setHco3(''); setPco2(''); setResultado(''); setErros({ hco3: false, pco2: false }); setDisturbio('acidose-metabolica'); setFase('aguda'); };

  return (
    <CalculadoraLayout titulo="Compensação esperada (HCO₃⁻ / PCO₂)" info={
      <>
        <TituloInfo>Fórmulas de compensação</TituloInfo>
        <BlocoMono>{'Acidose metabólica: PCO₂ = 1,5 × HCO₃ + 8 (±2) — Winter\nAlcalose metabólica: PCO₂ = 0,7 × HCO₃ + 21 (±2)\nAcidose resp. aguda: HCO₃ = 24 + 0,1 × (PCO₂ − 40)\nAcidose resp. crônica: HCO₃ = 24 + 0,35 × (PCO₂ − 40)\nAlcalose resp. aguda: HCO₃ = 24 − 0,2 × (40 − PCO₂)\nAlcalose resp. crônica: HCO₃ = 24 − 0,4 × (40 − PCO₂)'}</BlocoMono>
        <TituloInfo>Como interpretar</TituloInfo>
        <ul className="space-y-1">
          <li>• Valor medido dentro do esperado: compensação adequada.</li>
          <li>• Fora do esperado: há um segundo distúrbio associado (o app indica qual).</li>
          <li>• Tolerância: ±2 (metabólicos e respiratórios agudos); ±4 nos respiratórios crônicos.</li>
          <li>• Na alcalose metabólica a compensação é limitada (PCO₂ raramente passa de 55–60 mmHg).</li>
        </ul>
        <TituloInfo>Referências</TituloInfo>
        <ul className="space-y-1"><li>• Rose BD, Post TW — Clinical Physiology of Acid-Base and Electrolyte Disorders</li><li>• Berend K et al. N Engl J Med 2014;371:1434</li></ul>
      </>
    }>
      <Escolha rotulo="Qual o distúrbio primário?" valor={disturbio} onChange={setDisturbio} opcoes={[
        { valor: 'acidose-metabolica', texto: 'Acidose metabólica' }, { valor: 'alcalose-metabolica', texto: 'Alcalose metabólica' },
        { valor: 'acidose-respiratoria', texto: 'Acidose respiratória' }, { valor: 'alcalose-respiratoria', texto: 'Alcalose respiratória' }]} />
      {disturbio.includes('respiratoria') && (
        <Escolha rotulo="Fase do distúrbio" valor={fase} onChange={setFase} opcoes={[{ valor: 'aguda', texto: 'Aguda' }, { valor: 'cronica', texto: 'Crônica' }]} />
      )}
      <Campo icone="vial" placeholder="HCO₃⁻ (mEq/L)" dica="Bicarbonato (2 a 50)" inputMode="decimal" valor={hco3} erro={erros.hco3} tentativa={tentativa}
        onChange={(v) => { setHco3(normalizarNumero(v)); setErros((e) => ({ ...e, hco3: false })); }} />
      <Campo icone="flask" placeholder="PCO₂ (mmHg)" dica="PCO₂ (5 a 150)" inputMode="decimal" valor={pco2} erro={erros.pco2} tentativa={tentativa}
        onChange={(v) => { setPco2(normalizarNumero(v)); setErros((e) => ({ ...e, pco2: false })); }} />
      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={calcular}>Calcular</BotaoPrimario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>
      {resultado && <CartaoResultado texto={resultado} cor={cor} />}
    </CalculadoraLayout>
  );
}
