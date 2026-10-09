'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { calcularFuncaoEsperada } from '@/lib/clinical/funcaoEsperada';
import { normalizarNumero } from '@/lib/clinical/numeros';
import { gravarLocal } from '@/lib/storage';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import AvisosCalculadora from '@/components/ui/AvisosCalculadora';
import Campo from '@/components/ui/Campo';
import Icone from '@/components/ui/Icone';
import { BlocoMono, TituloInfo } from '@/components/ui/InfoDialog';

export default function FuncaoRenalEsperada() {
  const { colors } = useTheme();
  const [idade, setIdade] = useState('');
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState('');
  const [cor, setCor] = useState('#22c55e');
  const [avisos, setAvisos] = useState<string[]>([]);

  const calcular = () => {
    const r = calcularFuncaoEsperada(idade);
    setTentativa((t) => t + 1);
    if (!r.ok) { setErro(true); setResultado(r.mensagem); setCor(colors.inputError); setAvisos([]); return; }
    setErro(false); setResultado(r.texto); setAvisos(r.avisos); setCor(colors.resultText);
    gravarLocal('ultimaGFR Esperada', r.valor.toString());
  };
  const limpar = () => { setIdade(''); setErro(false); setResultado(''); setAvisos([]); };

  return (
    <CalculadoraLayout titulo="Função Renal Esperada para Idade" info={
      <>
        <TituloInfo>Fórmula</TituloInfo>
        <BlocoMono>TFG esperada ≈ 140 − idade (anos), em mL/min/1,73 m²</BlocoMono>
        <TituloInfo>Para que serve</TituloInfo>
        <ul className="space-y-1">
          <li>• Referência populacional aproximada para adultos saudáveis, sem usar creatinina, sexo ou peso.</li>
          <li>• Serve para contextualizar uma TFG calculada, não para decidir conduta.</li>
          <li>• A TFG declina com a idade (em média cerca de 1 mL/min/1,73 m² por ano após os 40), mas há grande variação individual.</li>
          <li>• Para estimar a TFG de um paciente use o CKD-EPI 2021; para crianças, o Clearance Pediátrico.</li>
        </ul>
      </>
    }>
      <Campo icone="calendar-alt" placeholder="Idade (anos)" inputMode="decimal" valor={idade} erro={erro} tentativa={tentativa} onChange={(t) => { setIdade(normalizarNumero(t)); setErro(false); }} />
      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={calcular}>Calcular</BotaoPrimario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>
      <AvisosCalculadora avisos={avisos} />
      {resultado && <CartaoResultado texto={resultado} cor={cor} />}
    </CalculadoraLayout>
  );
}
