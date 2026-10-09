'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { AVISO_PEDIATRICO, calcularCkdEpi, corTfg, type Sexo, type TipoTfg } from '@/lib/clinical/ckdepi';
import { normalizarNumero } from '@/lib/clinical/numeros';
import { gravarLocal, lerJson, lerLocal } from '@/lib/storage';
import { estaDisponivel } from '@/lib/tools/catalogo';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import Campo from '@/components/ui/Campo';
import Icone from '@/components/ui/Icone';
import { BlocoMono, TituloInfo } from '@/components/ui/InfoDialog';

const SLUG_PEDIATRICO = 'clearance-de-creatinina-ped';

interface Salvo {
  gfrIndexado: number;
  gfrAbsoluto?: number;
  comDRC: boolean;
  acr?: number;
  resultadoTexto: string;
  tipoParaAjuste?: TipoTfg;
  valorParaAjuste?: string;
  avisos?: string[];
}

const SEM_ERROS = { creatinina: false, idade: false, sexo: false, acr: false, altura: false, peso: false };

export default function CKDEPICalculator() {
  const { colors } = useTheme();
  const [creatinina, setCreatinina] = useState('');
  const [idade, setIdade] = useState('');
  const [sexo, setSexo] = useState<'' | Sexo>('');
  const [altura, setAltura] = useState('');
  const [peso, setPeso] = useState('');
  const [drc, setDrc] = useState(false);
  const [acr, setAcr] = useState('');
  const [desindexadoAberto, setDesindexadoAberto] = useState(false);

  const [erros, setErros] = useState(SEM_ERROS);
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState('');
  const [cor, setCor] = useState('#22c55e');
  const [avisos, setAvisos] = useState<string[]>([]);
  const [envioAjuste, setEnvioAjuste] = useState<{ tipo: TipoTfg; valor: string } | null>(null);
  const [temSalvo, setTemSalvo] = useState(false);

  useEffect(() => { setTemSalvo(!!lerLocal('ultimoGFR_completo')); }, []);

  const limparSaida = () => { setAvisos([]); setEnvioAjuste(null); };

  const calcular = () => {
    const r = calcularCkdEpi({ creatinina, idade, sexo, altura, peso, drc, acr });
    setTentativa((t) => t + 1);
    if (!r.ok) {
      setErros({ creatinina: r.erroCreatinina, idade: r.erroIdade, sexo: r.erroSexo, acr: false, altura: r.erroAltura, peso: r.erroPeso });
      if (r.erroAltura || r.erroPeso) setDesindexadoAberto(true);
      limparSaida();
      setResultado(r.mensagem);
      setCor(colors.inputError);
      return;
    }
    setErros({ ...SEM_ERROS, acr: r.erroAcr });
    setResultado(r.texto);
    setCor(r.cor);
    setAvisos(r.avisos);
    setEnvioAjuste({ tipo: r.tipoParaAjuste, valor: r.valorParaAjuste });
    // Mesmos nomes de chave do app original: o Ajuste de Dose lê "ultimoGFR" para pré-preencher.
    // "ultimoGFR_tipo" (novo, CKD-3) registra se o valor é indexado ou absoluto.
    gravarLocal('ultimoGFR', r.valorParaAjuste);
    gravarLocal('ultimoGFR_tipo', r.tipoParaAjuste);
    const salvo: Salvo = {
      gfrIndexado: r.gfrIndexado,
      gfrAbsoluto: r.gfrAbsoluto,
      comDRC: drc,
      acr: drc ? parseFloat(normalizarNumero(acr)) : undefined,
      resultadoTexto: r.texto,
      tipoParaAjuste: r.tipoParaAjuste,
      valorParaAjuste: r.valorParaAjuste,
      avisos: r.avisos,
    };
    gravarLocal('ultimoGFR_completo', JSON.stringify(salvo));
    setTemSalvo(true);
  };

  const recarregar = () => {
    const s = lerJson<Salvo | null>('ultimoGFR_completo', null);
    if (s) {
      setResultado(s.resultadoTexto);
      setCor(corTfg(s.gfrIndexado));
      setAvisos(s.avisos ?? []);
      setEnvioAjuste(s.tipoParaAjuste && s.valorParaAjuste ? { tipo: s.tipoParaAjuste, valor: s.valorParaAjuste } : null);
    } else {
      limparSaida();
      setResultado('Nenhum resultado salvo anteriormente.');
      setCor(colors.inputError);
    }
  };

  const limpar = () => {
    setCreatinina(''); setIdade(''); setSexo(''); setAltura(''); setPeso(''); setDrc(false); setAcr('');
    setResultado(''); setCor('#22c55e'); setDesindexadoAberto(false); limparSaida();
    setErros(SEM_ERROS);
  };

  const botaoSexo = (valor: Sexo, rotulo: string, icone: string) => {
    const ativo = sexo === valor;
    return (
      <button type="button" onClick={() => { setSexo(valor); setErros((e) => ({ ...e, sexo: false })); }}
        aria-pressed={ativo}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-base font-semibold"
        style={{ backgroundColor: ativo ? colors.button : colors.inputBg, color: ativo ? colors.buttonText : colors.text,
          border: `1px solid ${colors.inputBorder}` }}>
        <Icone nome={icone} tamanho={20} cor={ativo ? colors.buttonText : colors.icon} />
        {rotulo}
      </button>
    );
  };

  return (
    <CalculadoraLayout
      titulo="CKD-EPI 2021"
      info={
        <>
          <p>
            A fórmula CKD-EPI 2021 é uma equação atualizada para estimar a taxa de filtração glomerular (TFG) baseada em
            creatinina sérica, idade e sexo, eliminando o fator de raça para reduzir vieses.
            Ela é recomendada pela KDIGO para diagnóstico e estadiamento da doença renal crônica (DRC). Os estágios são
            classificados em G1-G5 com base na TFG:
          </p>
          <BlocoMono>{`G1: ≥90 mL/min/1.73m²
G2: 60-89
G3a: 45-59
G3b: 30-44
G4: 15-29
G5: <15`}</BlocoMono>
          <p>
            A1-A3 com base na albuminúria (relação albumina/creatinina), informada para pacientes com DRC. Ela complementa
            a classificação da DRC, mas não entra no cálculo da TFG:
          </p>
          <BlocoMono>{`A1: <30 mg/g
A2: 30-300 mg/g
A3: >300 mg/g`}</BlocoMono>
          <p>Limitações incluem precisão reduzida em extremos de idade, peso ou condições como gravidez, desnutrição ou doenças agudas.</p>
          <TituloInfo>Desindexação para ajuste de dose</TituloInfo>
          <p>
            A TFG da CKD-EPI é indexada para 1.73m² de superfície corporal. Para ajuste posológico de medicamentos, as
            diretrizes atuais (FDA/NKF 2024-2025) recomendam o <strong>valor absoluto (desindexado)</strong>, calculado como:
          </p>
          <BlocoMono>TFG absoluta = TFG (CKD-EPI) × (Superfície corporal do paciente / 1.73)</BlocoMono>
          <p>Isso é especialmente importante em pacientes obesos ou caquéticos para evitar super/subdose.</p>
          <TituloInfo>Viés e limitações</TituloInfo>
          <ul className="space-y-1">
            <li>• CKD-EPI 2021: mais precisa em TFG &gt;60 mL/min/1.73m²; pode superestimar em idosos frágeis ou subestimar em pacientes com massa muscular muito alta.</li>
            <li>• Cockcroft-Gault: tende a superestimar em obesos e subestimar em caquéticos; ainda usado em muitas bulas antigas.</li>
          </ul>
          <TituloInfo>Referências:</TituloInfo>
          <ul className="space-y-1">
            <li>• Inker LA et al. N Engl J Med 2021;385:1737-49</li>
            <li>• KDIGO 2024 CKD Guideline</li>
            <li>• NKF KDOQI Drug Dosing in CKD 2024</li>
            <li>• FDA Renal Impairment Guidance 2024–2025</li>
            <li>• Levey AS et al. Ann Intern Med 2009;150:604-12</li>
          </ul>
        </>
      }
    >
      <Campo icone="vial" placeholder="Creatinina (mg/dL)" dica="Creatinina sérica em mg/dL (ex.: 1,2)" inputMode="decimal"
        valor={creatinina} erro={erros.creatinina} tentativa={tentativa}
        onChange={(v) => { setCreatinina(normalizarNumero(v)); setErros((e) => ({ ...e, creatinina: false })); }} />
      <Campo icone="calendar-alt" placeholder="Idade (anos)" dica="Idade em anos completos (ex.: 45)" inputMode="numeric"
        valor={idade} erro={erros.idade} tentativa={tentativa}
        onChange={(v) => { setIdade(v); setErros((e) => ({ ...e, idade: false })); }} />

      <div key={erros.sexo ? `erro-${tentativa}` : 'ok'} className={`mb-3 flex gap-3 ${erros.sexo ? 'animate-shake' : ''}`}
        role="group" aria-label="Sexo" aria-invalid={erros.sexo}
        style={erros.sexo ? { outline: `1px solid ${colors.inputError}`, outlineOffset: 4, borderRadius: 12 } : undefined}>
        {botaoSexo('m', 'Masculino', 'mars')}
        {botaoSexo('f', 'Feminino', 'venus')}
      </div>

      {/* Opções extras como "chips" discretos: a tela fica enxuta e só mostra o que for pedido */}
      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Opções adicionais">
        <button type="button" onClick={() => setDesindexadoAberto((a) => !a)} aria-expanded={desindexadoAberto}
          title="Altura e peso: valor absoluto recomendado para ajuste de dose"
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold"
          style={{ backgroundColor: desindexadoAberto ? colors.button : colors.inputBg, color: desindexadoAberto ? colors.buttonText : colors.text,
            border: `1px solid ${desindexadoAberto ? colors.button : colors.inputBorder}` }}>
          <span aria-hidden className="font-bold">{desindexadoAberto ? '−' : '+'}</span>
          Valor desindexado
        </button>
        <label className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold"
          style={{ backgroundColor: drc ? colors.button : colors.inputBg, color: drc ? colors.buttonText : colors.text,
            border: `1px solid ${drc ? colors.button : colors.inputBorder}` }}>
          <input type="checkbox" aria-label="Paciente com DRC" checked={drc} onChange={(e) => setDrc(e.target.checked)} className="sr-only" />
          <span aria-hidden className="font-bold">{drc ? '−' : '+'}</span>
          <span>Paciente com DRC</span>
        </label>
      </div>
      {desindexadoAberto && (
        <p className="-mt-1 mb-3 text-sm" style={{ color: colors.text, opacity: 0.7 }}>
          Informe altura e peso para obter o valor absoluto (recomendado para ajuste de dose).
        </p>
      )}
      {desindexadoAberto && (
        <>
          <Campo icone="ruler-vertical" placeholder="Altura (cm)" dica="Altura em centímetros (ex.: 170)" inputMode="decimal"
            valor={altura} erro={erros.altura} tentativa={tentativa}
            onChange={(v) => { setAltura(normalizarNumero(v)); setErros((e) => ({ ...e, altura: false })); }} />
          <Campo icone="weight" placeholder="Peso (kg)" dica="Peso em quilogramas (ex.: 70)" inputMode="decimal"
            valor={peso} erro={erros.peso} tentativa={tentativa}
            onChange={(v) => { setPeso(normalizarNumero(v)); setErros((e) => ({ ...e, peso: false })); }} />
        </>
      )}

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

      {avisos.length > 0 && (
        <div role="alert" className="mt-5 space-y-2 rounded-xl p-4" style={{ backgroundColor: colors.warningBg, borderLeft: '4px solid #ff6b35' }}>
          {avisos.map((a) => (
            <p key={a} className="flex gap-2 text-base font-semibold leading-5" style={{ color: '#111' }}>
              <Icone nome="exclamation-triangle" tamanho={18} cor="#7c2d12" className="mt-0.5 shrink-0" />
              <span>
                {a}
                {a === AVISO_PEDIATRICO && estaDisponivel(SLUG_PEDIATRICO) && (
                  <> <Link href={`/ferramentas/${SLUG_PEDIATRICO}`} className="underline">Abrir Clearance Pediátrico</Link></>
                )}
              </span>
            </p>
          ))}
        </div>
      )}

      {resultado && <CartaoResultado texto={resultado} cor={cor} />}

      {resultado && envioAjuste && (
        <p data-testid="envio-ajuste" className="mt-3 rounded-lg p-3 text-center text-sm"
          style={{ backgroundColor: colors.cardBg, color: colors.text, border: `1px solid ${colors.inputBorder}` }}>
          Valor enviado ao Ajuste de Dose:{' '}
          <strong>
            {envioAjuste.valor} {envioAjuste.tipo === 'absoluto' ? 'mL/min (ABSOLUTO)' : 'mL/min/1.73m² (INDEXADO)'}
          </strong>
          {envioAjuste.tipo === 'indexado' && (
            <> — para ajuste de dose, o recomendado é o valor absoluto (informe altura e peso).</>
          )}
        </p>
      )}
    </CalculadoraLayout>
  );
}
