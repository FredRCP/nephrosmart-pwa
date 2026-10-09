'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { calcularCockcroft, textoClCrSalvo } from '@/lib/clinical/cockcroft';
import type { Sexo } from '@/lib/clinical/ckdepi';
import { normalizarNumero } from '@/lib/clinical/numeros';
import { gravarLocal, lerLocal } from '@/lib/storage';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import AvisosCalculadora from '@/components/ui/AvisosCalculadora';
import Campo from '@/components/ui/Campo';
import Icone from '@/components/ui/Icone';
import { BlocoMono, TituloInfo } from '@/components/ui/InfoDialog';
import SeletorSexo from '@/components/ui/SeletorSexo';

const SEM_ERROS = { idade: false, peso: false, creatinina: false, sexo: false };

export default function CockcroftGaultCalculator() {
  const { colors } = useTheme();
  const [idade, setIdade] = useState('');
  const [peso, setPeso] = useState('');
  const [creatinina, setCreatinina] = useState('');
  const [sexo, setSexo] = useState<'' | Sexo>('');
  const [erros, setErros] = useState(SEM_ERROS);
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState('');
  const [cor, setCor] = useState('#22c55e');
  const [avisos, setAvisos] = useState<string[]>([]);
  const [temSalvo, setTemSalvo] = useState(false);

  useEffect(() => { setTemSalvo(lerLocal('ultimoClCr') !== null); }, []);

  const calcular = () => {
    const r = calcularCockcroft({ idade, peso, creatinina, sexo });
    setTentativa((t) => t + 1);
    if (!r.ok) {
      setErros({ idade: r.erroIdade, peso: r.erroPeso, creatinina: r.erroCreatinina, sexo: r.erroSexo });
      setAvisos([]);
      setResultado(r.mensagem);
      setCor(colors.inputError);
      return;
    }
    setErros(SEM_ERROS);
    setResultado(r.texto);
    setCor(r.cor);
    setAvisos(r.avisos);
    // Mesma chave do app original: o Ajuste de Dose lê "ultimoClCr" para pré-preencher.
    gravarLocal('ultimoClCr', r.clcr.toString());
    setTemSalvo(true);
  };

  const recarregar = () => {
    const s = textoClCrSalvo(lerLocal('ultimoClCr'));
    setAvisos([]);
    setResultado(s.texto);
    setCor(s.cor ?? colors.inputError);
  };

  const limpar = () => {
    setIdade(''); setPeso(''); setCreatinina(''); setSexo('');
    setErros(SEM_ERROS); setResultado(''); setCor('#22c55e'); setAvisos([]);
  };

  return (
    <CalculadoraLayout
      titulo="Cockcroft-Gault (ClCr)"
      info={
        <>
          <TituloInfo>Fórmula clássica para Clearance de Creatinina (ClCr)</TituloInfo>
          <ul className="space-y-1">
            <li>• Estima o ClCr em mL/min com base em creatinina sérica, idade, peso e sexo</li>
            <li>• Ainda amplamente utilizada em 2026 para ajuste de dose de medicamentos (antibióticos, anticoagulantes, digoxina, etc.)</li>
            <li>• Principal referência em muitas bulas aprovadas pela Anvisa e protocolos tradicionais</li>
            <li>• Resultado em mL/min (não indexado para superfície corporal)</li>
          </ul>
          <TituloInfo>Fórmulas (idade em anos, peso em kg, creatinina em mg/dL)</TituloInfo>
          <BlocoMono>Homens: ClCr = [(140 − idade) × peso] / (72 × creatinina)</BlocoMono>
          <BlocoMono>Mulheres: ClCr = [(140 − idade) × peso × 0.85] / (72 × creatinina)</BlocoMono>
          <TituloInfo>Limitações importantes</TituloInfo>
          <ul className="space-y-1">
            <li>• Superestima ClCr em obesos (usa peso total)</li>
            <li>• Subestima em idosos frágeis, sarcopênicos ou desnutridos</li>
            <li>• Não recomendada para diagnóstico/estadiamento de DRC (prefira CKD-EPI 2021)</li>
            <li>• Use quando a bula ou protocolo exigir explicitamente &quot;ClCr&quot; (ex.: &lt;30 mL/min, &lt;50 mL/min)</li>
          </ul>
          <TituloInfo>Recomendação prática (2026)</TituloInfo>
          <ul className="space-y-1">
            <li>• Prefira CKD-EPI 2021 (desindexada quando necessário) na maioria dos casos modernos</li>
            <li>• Recorra ao Cockcroft-Gault apenas quando exigido pela bula ou protocolo institucional</li>
            <li>• Sempre consulte a bula oficial e o serviço local</li>
          </ul>
          <TituloInfo>Referências principais:</TituloInfo>
          <ul className="space-y-1">
            <li>• Cockcroft &amp; Gault (1976) – Nephron 16:31-41</li>
            <li>• KDIGO 2024 CKD Guideline</li>
            <li>• NKF KDOQI Drug Dosing Update 2024</li>
            <li>• FDA Renal Impairment Guidance 2024–2025</li>
            <li>• SBN Diretrizes DRC 2025</li>
          </ul>
        </>
      }
    >
      <Campo icone="calendar-alt" placeholder="Idade (anos)" dica="Idade em anos (ex.: 50)" inputMode="decimal"
        valor={idade} erro={erros.idade} tentativa={tentativa}
        onChange={(v) => { setIdade(normalizarNumero(v)); setErros((e) => ({ ...e, idade: false })); }} />
      <Campo icone="weight" placeholder="Peso (kg)" dica="Peso em quilogramas (ex.: 70)" inputMode="decimal"
        valor={peso} erro={erros.peso} tentativa={tentativa}
        onChange={(v) => { setPeso(normalizarNumero(v)); setErros((e) => ({ ...e, peso: false })); }} />
      <Campo icone="vial" placeholder="Creatinina (mg/dL)" dica="Creatinina sérica em mg/dL (ex.: 0,8)" inputMode="decimal"
        valor={creatinina} erro={erros.creatinina} tentativa={tentativa}
        onChange={(v) => { setCreatinina(normalizarNumero(v)); setErros((e) => ({ ...e, creatinina: false })); }} />
      <SeletorSexo valor={sexo} erro={erros.sexo} tentativa={tentativa}
        onChange={(s) => { setSexo(s); setErros((e) => ({ ...e, sexo: false })); }} />

      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={calcular}>Calcular</BotaoPrimario>
        <BotaoSecundario onClick={recarregar} aria-label="Recarregar último resultado">
          <span className="relative"><Icone nome="history" tamanho={20} cor={colors.buttonText} />
            {temSalvo && <span className="absolute -right-2 -top-2 size-2 rounded-full bg-green-500" />}</span>
        </BotaoSecundario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>

      <AvisosCalculadora avisos={avisos} />
      {resultado && <CartaoResultado texto={resultado} cor={cor} />}
    </CalculadoraLayout>
  );
}
