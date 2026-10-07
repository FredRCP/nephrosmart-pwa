'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { calcularIMC } from '@/lib/clinical/imc';
import { gravarLocal } from '@/lib/storage';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario } from '@/components/archetypes/CalculadoraLayout';
import Campo from '@/components/ui/Campo';
import { BlocoMono, TituloInfo } from '@/components/ui/InfoDialog';

export default function IMCCalculator() {
  const { colors } = useTheme();
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [erroPeso, setErroPeso] = useState(false);
  const [erroAltura, setErroAltura] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState('');
  const [resultadoErro, setResultadoErro] = useState(false);

  const calcular = () => {
    const r = calcularIMC(peso, altura);
    setTentativa((t) => t + 1);
    if (!r.ok) {
      setErroPeso(r.erroPeso);
      setErroAltura(r.erroAltura);
      setResultado(r.mensagem);
      setResultadoErro(true);
      return;
    }
    setErroPeso(false);
    setErroAltura(false);
    setResultado(r.texto);
    setResultadoErro(false);
    gravarLocal('ultimoIMC', r.imc.toString());
  };

  const limpar = () => {
    setPeso(''); setAltura(''); setResultado(''); setResultadoErro(false); setErroPeso(false); setErroAltura(false);
  };

  return (
    <CalculadoraLayout
      titulo="Calculadora de IMC"
      info={
        <>
          <TituloInfo>Fórmula (OMS/Adultos)</TituloInfo>
          <BlocoMono>IMC = peso (kg) / [altura (m)]²</BlocoMono>
          <TituloInfo>Classificação detalhada em bloco</TituloInfo>
          <BlocoMono>{`IMC < 18,5 → Abaixo do peso
18,5 – 24,9 → Peso normal (ideal)
25,0 – 29,9 → Sobrepeso
30,0 – 34,9 → Obesidade Grau I
35,0 – 39,9 → Obesidade Grau II
≥ 40,0 → Obesidade Grau III (mórbida)`}</BlocoMono>
          <TituloInfo>Limitações importantes</TituloInfo>
          <ul className="space-y-1">
            <li>• Não diferencia massa muscular de gordura (atletas podem ter IMC elevado sem obesidade)</li>
            <li>• Não considera distribuição de gordura (central vs periférica)</li>
            <li>• Menos preciso em idosos, gestantes, crianças/adolescentes e algumas etnias</li>
            <li>• Sempre associar com circunferência abdominal, % de gordura corporal e avaliação clínica</li>
          </ul>
          <TituloInfo>Recomendação prática</TituloInfo>
          <ul className="space-y-1">
            <li>• Use como triagem inicial, mas não como diagnóstico isolado</li>
            <li>• Combine com exame físico, bioimpedância ou DEXA quando possível</li>
            <li>• DEXA (ou DXA, Dual-Energy X-ray Absorptiometry) é considerado o padrão-ouro (gold standard) para medir composição corporal em muitos contextos clínicos e de pesquisa, especialmente quando se quer precisão alta</li>
            <li>• Em pacientes com IMC ≥30: avaliar comorbidades (DM2, HAS, dislipidemia, apneia do sono, etc.)</li>
          </ul>
          <TituloInfo>Referências principais</TituloInfo>
          <ul className="space-y-1">
            <li>• OMS – Obesity: preventing and managing the global epidemic (2000, atualizado 2024)</li>
            <li>• UpToDate – Obesity in adults: Prevalence, screening, and evaluation (2025–2026)</li>
            <li>• SBN – Diretrizes de Obesidade e Síndrome Metabólica 2025</li>
            <li>• ABESO – Diretrizes Brasileiras de Obesidade 2025</li>
          </ul>
        </>
      }
    >
      <Campo icone="weight" placeholder="Peso (kg)" dica="Peso em quilogramas (ex.: 70,5)" inputMode="decimal" valor={peso} erro={erroPeso} tentativa={tentativa}
        onChange={(v) => { setPeso(v); setErroPeso(false); }} />
      <Campo icone="ruler-vertical" placeholder="Altura (cm)" dica="Altura em centímetros (ex.: 175)" inputMode="decimal" valor={altura} erro={erroAltura} tentativa={tentativa}
        onChange={(v) => { setAltura(v.startsWith(',') ? '0' + v : v); setErroAltura(false); }} />

      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={calcular}>Calcular</BotaoPrimario>
        <BotaoSecundario onClick={limpar}>Limpar</BotaoSecundario>
      </div>

      {resultado && (
        <div role="status" className="animate-resultado mt-5 rounded-xl p-4 text-center"
          style={{ backgroundColor: colors.resultBg, border: `1px solid ${colors.resultBorder}` }}>
          <p className="whitespace-pre-line text-lg font-semibold leading-7"
            style={{ color: resultadoErro ? colors.inputError : colors.resultText }}>{resultado}</p>
        </div>
      )}
    </CalculadoraLayout>
  );
}
