'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { calcularCreatCistatina, textoGfrSalvo } from '@/lib/clinical/ckdepi-cistatina';
import type { Sexo } from '@/lib/clinical/ckdepi';
import { normalizarNumero } from '@/lib/clinical/numeros';
import { gravarLocal, lerLocal } from '@/lib/storage';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import AvisosCalculadora from '@/components/ui/AvisosCalculadora';
import Campo from '@/components/ui/Campo';
import Icone from '@/components/ui/Icone';
import { BlocoMono, TituloInfo } from '@/components/ui/InfoDialog';
import SeletorSexo from '@/components/ui/SeletorSexo';

const SEM_ERROS = { creatinina: false, cistatina: false, idade: false, sexo: false, acr: false };

export default function CKDEPICistatinaCalculator() {
  const { colors } = useTheme();
  const [creatinina, setCreatinina] = useState('');
  const [cistatina, setCistatina] = useState('');
  const [idade, setIdade] = useState('');
  const [sexo, setSexo] = useState<'' | Sexo>('');
  const [drc, setDrc] = useState(false);
  const [acr, setAcr] = useState('');
  const [erros, setErros] = useState(SEM_ERROS);
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState('');
  const [cor, setCor] = useState('#22c55e');
  const [avisos, setAvisos] = useState<string[]>([]);
  const [temSalvo, setTemSalvo] = useState(false);

  useEffect(() => { setTemSalvo(lerLocal('ultimoGFR') !== null); }, []);

  const calcular = () => {
    const r = calcularCreatCistatina({ creatinina, cistatina, idade, sexo, drc, acr });
    setTentativa((t) => t + 1);
    if (!r.ok) {
      setErros({ creatinina: r.erroCreatinina, cistatina: r.erroCistatina, idade: r.erroIdade, sexo: r.erroSexo, acr: r.erroAcr });
      setAvisos([]);
      setResultado(r.mensagem);
      setCor(colors.inputError);
      return;
    }
    setErros(SEM_ERROS);
    setResultado(r.texto);
    setCor(r.cor);
    setAvisos(r.avisos);
    // Mesma chave do app original ("ultimoGFR"). O valor aqui é sempre indexado; registrar o tipo evita
    // que um "absoluto" antigo (do CKD-EPI com altura e peso) fique mal rotulado no Ajuste de Dose.
    gravarLocal('ultimoGFR', r.gfr.toString());
    gravarLocal('ultimoGFR_tipo', 'indexado');
    setTemSalvo(true);
  };

  const recarregar = () => {
    const s = textoGfrSalvo(lerLocal('ultimoGFR'), lerLocal('ultimoGFR_tipo'));
    setAvisos([]);
    setResultado(s.texto);
    setCor(s.cor ?? colors.inputError);
  };

  const limpar = () => {
    setCreatinina(''); setCistatina(''); setIdade(''); setSexo(''); setDrc(false); setAcr('');
    setErros(SEM_ERROS); setResultado(''); setCor('#22c55e'); setAvisos([]);
  };

  return (
    <CalculadoraLayout
      titulo="CKD-EPI (Cr + Cistatina C)"
      info={
        <>
          <p>
            A equação CKD-EPI (Creatinina + Cistatina C) estima a taxa de filtração glomerular (eGFR) em mL/min/1,73 m², utilizando
            creatinina sérica, cistatina C, idade e sexo.
          </p>
          <p className="mt-3">
            Essa combinação oferece maior acurácia em comparação às fórmulas baseadas apenas em creatinina, especialmente em pacientes
            com função renal limítrofe, baixa massa muscular (idosos frágeis, desnutridos, amputados) ou condições que afetam a produção
            de creatinina.
          </p>
          <p className="mt-3">A classificação da Doença Renal Crônica (DRC) é realizada com base no eGFR (estágios G1 a G5):</p>
          <BlocoMono>{`G1: ≥90 mL/min/1.73m²
G2: 60–89
G3a: 45–59
G3b: 30–44
G4: 15–29
G5: <15`}</BlocoMono>
          <p>A1-A3 com base na relação albumina/creatinina urinária (ACR), se fornecida:</p>
          <BlocoMono>{`A1: <30 mg/g
A2: 30–300 mg/g
A3: >300 mg/g`}</BlocoMono>
          <TituloInfo>Vantagens principais</TituloInfo>
          <ul className="space-y-1">
            <li>• Mais precisa que a versão apenas com creatinina em pacientes com variação de massa muscular</li>
            <li>• Útil para confirmação diagnóstica em valores limítrofes (TFG ~45–75 mL/min/1.73m²)</li>
            <li>• Recomendada em situações de dúvida (idosos frágeis, sarcopenia, amputados, atletas)</li>
          </ul>
          <TituloInfo>Limitações</TituloInfo>
          <ul className="space-y-1">
            <li>• Cistatina C não está disponível em todos os laboratórios (custo mais elevado)</li>
            <li>• Ainda indexada para 1.73 m² → desindexar para ajuste de dose (ver CKD-EPI creatinina)</li>
            <li>• Precisão pode ser afetada em inflamação aguda, uso de corticosteroides ou disfunção tireoidiana</li>
          </ul>
          <TituloInfo>Referências principais</TituloInfo>
          <ul className="space-y-1">
            <li>• Inker LA, et al. New Creatinine- and Cystatin C–Based Equations to Estimate GFR without Race. N Engl J Med 2021;385(19):1737-1749.</li>
            <li>• KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease.</li>
            <li>• NKF KDOQI 2024 Update on Drug Dosing and GFR Estimation.</li>
            <li>• Shlipak MG, et al. Cystatin C versus Creatinine in Determining Risk Based on Kidney Function. N Engl J Med 2013;369:932-943.</li>
          </ul>
        </>
      }
    >
      <Campo icone="vial" placeholder="Creatinina (mg/dL)" dica="Creatinina sérica em mg/dL (ex.: 1,2)" inputMode="decimal"
        valor={creatinina} erro={erros.creatinina} tentativa={tentativa}
        onChange={(v) => { setCreatinina(normalizarNumero(v)); setErros((e) => ({ ...e, creatinina: false })); }} />
      <Campo icone="flask" placeholder="Cistatina C (mg/L)" dica="Cistatina C sérica em mg/L (ex.: 1,0)" inputMode="decimal"
        valor={cistatina} erro={erros.cistatina} tentativa={tentativa}
        onChange={(v) => { setCistatina(normalizarNumero(v)); setErros((e) => ({ ...e, cistatina: false })); }} />
      <Campo icone="calendar-alt" placeholder="Idade (anos)" dica="Idade em anos (ex.: 45)" inputMode="decimal"
        valor={idade} erro={erros.idade} tentativa={tentativa}
        onChange={(v) => { setIdade(normalizarNumero(v)); setErros((e) => ({ ...e, idade: false })); }} />
      <SeletorSexo valor={sexo} erro={erros.sexo} tentativa={tentativa}
        onChange={(s) => { setSexo(s); setErros((e) => ({ ...e, sexo: false })); }} />

      <label className="mb-3 flex cursor-pointer items-center gap-2" style={{ color: colors.text }}>
        <input type="checkbox" checked={drc} onChange={(e) => setDrc(e.target.checked)} className="size-5" />
        <span>Paciente com DRC</span>
      </label>
      {drc && (
        <Campo icone="flask" placeholder="Relação Albumina/Creatinina (mg/g)" inputMode="decimal" valor={acr} erro={erros.acr} tentativa={tentativa}
          onChange={(v) => { setAcr(normalizarNumero(v)); setErros((e) => ({ ...e, acr: false })); }} />
      )}

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
