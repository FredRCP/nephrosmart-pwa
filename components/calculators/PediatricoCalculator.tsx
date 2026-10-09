'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { calcularDrc, calcularLra, ROTULO_DIURESE, type Diurese, type Janela } from '@/lib/clinical/pediatria';
import type { UnidadeIdade } from '@/lib/clinical/pediatria';
import type { Sexo } from '@/lib/clinical/ckdepi';
import { corTfg } from '@/lib/clinical/ckdepi';
import { normalizarNumero } from '@/lib/clinical/numeros';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import Campo from '@/components/ui/Campo';
import Icone from '@/components/ui/Icone';
import { BlocoMono, TituloInfo } from '@/components/ui/InfoDialog';
import SeletorSexo from '@/components/ui/SeletorSexo';

type Aba = 'drc' | 'lra';
const SEM_ERROS = { altura: false, creatinina: false, idade: false, sexo: false, cistatina: false, basal: false };
const COR_ESTAGIO = ['#22c55e', '#facc15', '#f97316', '#ef4444'];

export default function PediatricoCalculator() {
  const { colors } = useTheme();
  const [aba, setAba] = useState<Aba>('drc');
  const [altura, setAltura] = useState('');
  const [creatinina, setCreatinina] = useState('');
  const [idade, setIdade] = useState('');
  const [unidade, setUnidade] = useState<UnidadeIdade>('anos');
  const [sexo, setSexo] = useState<'' | Sexo>('');
  const [prematuro, setPrematuro] = useState(false);
  const [cistatina, setCistatina] = useState('');
  const [cisAberta, setCisAberta] = useState(false);
  const [basal, setBasal] = useState('');
  const [janela, setJanela] = useState<Janela>('48h');
  const [diurese, setDiurese] = useState<Diurese>('normal');
  const [erros, setErros] = useState(SEM_ERROS);
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState('');
  const [cor, setCor] = useState(colors.resultText);
  const [avisos, setAvisos] = useState<string[]>([]);

  const limparSaida = () => { setResultado(''); setAvisos([]); setErros(SEM_ERROS); };
  const apagaErro = (k: keyof typeof SEM_ERROS) => setErros((e) => ({ ...e, [k]: false }));

  const calcular = () => {
    setTentativa((t) => t + 1);
    const comum = { altura, creatinina, idade, unidade, sexo, prematuro };
    if (aba === 'drc') {
      const r = calcularDrc({ ...comum, cistatina });
      if (!r.ok) {
        setErros({ altura: r.erroAltura, creatinina: r.erroCreatinina, idade: r.erroIdade, sexo: r.erroSexo, cistatina: r.erroCistatina, basal: false });
        setAvisos([]); setResultado(r.mensagem); setCor(colors.inputError); return;
      }
      setErros(SEM_ERROS); setResultado(r.texto); setCor(corTfg(r.egfr)); setAvisos(r.avisos);
      // Nada é guardado: o resultado pediátrico não alimenta o Ajuste de Dose (decisão do Dr. Fred)
    } else {
      const r = calcularLra({ ...comum, creatininaBasal: basal, janela, diurese });
      if (!r.ok) {
        setErros({ altura: r.erroAltura, creatinina: r.erroCreatinina, idade: r.erroIdade, sexo: r.erroSexo, cistatina: false, basal: r.erroBasal });
        setAvisos([]); setResultado(r.mensagem); setCor(colors.inputError); return;
      }
      setErros(SEM_ERROS); setResultado(r.texto); setCor(COR_ESTAGIO[r.estagio]); setAvisos(r.avisos);
    }
  };

  const limpar = () => {
    setAltura(''); setCreatinina(''); setIdade(''); setSexo(''); setPrematuro(false); setCistatina(''); setCisAberta(false);
    setBasal(''); setJanela('48h'); setDiurese('normal'); setUnidade('anos'); limparSaida();
  };

  const abaBotao = (valor: Aba, rotulo: string) => {
    const ativa = aba === valor;
    return (
      <button type="button" role="tab" aria-selected={ativa} onClick={() => { setAba(valor); limparSaida(); }}
        className="flex-1 p-3 text-[15px] font-semibold"
        style={{ backgroundColor: ativa ? '#4CAF50' : colors.inputBg, color: ativa ? '#fff' : colors.text }}>
        {rotulo}
      </button>
    );
  };

  const chip = (ativo: boolean, onClick: () => void, rotulo: string) => (
    <button type="button" onClick={onClick} aria-pressed={ativo}
      className="rounded-full px-3 py-1.5 text-sm font-semibold"
      style={{ backgroundColor: ativo ? colors.button : colors.inputBg, color: ativo ? colors.buttonText : colors.text,
        border: `1px solid ${ativo ? colors.button : colors.inputBorder}` }}>
      {rotulo}
    </button>
  );

  const idadeNum = parseFloat(normalizarNumero(idade));
  const lactente = idade.trim() !== '' && !isNaN(idadeNum) && (unidade === 'dias' ? idadeNum / 365.25 : unidade === 'meses' ? idadeNum / 12 : idadeNum) < 1;

  const info = (
    <>
      <TituloInfo>DRC / estável — CKiD U25</TituloInfo>
      <p>Equação recomendada atualmente para 1 a 25 anos (NIDDK/KDIGO). Usa altura em metros e creatinina enzimática:</p>
      <BlocoMono>{`TFG = κ × altura(m) / creatinina(mg/dL)
κ varia com idade e sexo
(ex.: 1–11 anos: 36,1 meninas | 39,0 meninos,
  × 1,008^(idade − 12))`}</BlocoMono>
      <p>Com cistatina C informada, usa a média das equações por creatinina e por cistatina C (preferível quando disponível, sobretudo em baixa massa muscular). O Schwartz bedside (0,413 × altura/creatinina) aparece só como comparação.</p>
      <TituloInfo>Menores de 1 ano</TituloInfo>
      <p>Usa as constantes de Schwartz (0,45 termo; 0,33 prematuro). Nenhuma equação é bem validada nessa idade: tratar como estimativa de baixa confiabilidade.</p>
      <TituloInfo>LRA — estadiamento KDIGO</TituloInfo>
      <p>Nenhuma equação de TFG é válida com a creatinina variando. Esta aba estadia a LRA (creatinina ≥ 1,5× a basal, aumento ≥ 0,3 mg/dL em 48 h, TFG &lt; 35 e diurese) e mostra a TFG pela creatinina atual como TETO, nunca como valor real. Sem creatinina basal, ela é estimada supondo TFG de 120 mL/min/1,73 m².</p>
      <p className="mt-2"><strong>A orientação de dose por estágio é uma sugestão de apoio: confirme com o protocolo local, a bula e níveis séricos.</strong></p>
      <TituloInfo>Referências:</TituloInfo>
      <ul className="space-y-1">
        <li>• Pierce CB et al. Kidney Int 2021;99:948-956 (CKiD U25)</li>
        <li>• Schwartz GJ et al. J Am Soc Nephrol 2009;20:629-637</li>
        <li>• KDIGO 2024 CKD Guideline; KDIGO AKI 2012</li>
      </ul>
    </>
  );

  return (
    <CalculadoraLayout titulo="TFG Pediátrica" infoTitulo={aba === 'drc' ? 'TFG pediátrica — DRC / estável' : 'LRA — estadiamento e dose'} info={info}>
      <div role="tablist" aria-label="Situação clínica" className="mb-4 flex overflow-hidden rounded-xl" style={{ border: `1px solid ${colors.inputBorder}` }}>
        {abaBotao('drc', 'DRC / estável')}
        {abaBotao('lra', 'LRA (creatinina variando)')}
      </div>

      <Campo icone="ruler-vertical" placeholder="Altura (cm)" dica="Altura em centímetros (ex.: 100)" inputMode="decimal"
        valor={altura} erro={erros.altura} tentativa={tentativa}
        onChange={(v) => { setAltura(normalizarNumero(v)); apagaErro('altura'); }} />
      <Campo icone="vial" placeholder="Creatinina atual (mg/dL)" dica="Creatinina sérica em mg/dL (ex.: 0,5)" inputMode="decimal"
        valor={creatinina} erro={erros.creatinina} tentativa={tentativa}
        onChange={(v) => { setCreatinina(normalizarNumero(v)); apagaErro('creatinina'); }} />

      <div className="mb-1 flex items-center gap-3">
        <span className="font-semibold" style={{ color: colors.text }}>Idade:</span>
        <div className="min-w-0 flex-1">
          <Campo icone="calendar-alt" placeholder="0" aria-label="Idade" inputMode="decimal"
            valor={idade} erro={erros.idade} tentativa={tentativa}
            onChange={(v) => { setIdade(normalizarNumero(v)); apagaErro('idade'); }} />
        </div>
      </div>
      <div role="group" aria-label="Unidade da idade" className="mb-3 flex gap-2">
        {(['dias', 'meses', 'anos'] as const).map((u) => {
          const ativo = unidade === u;
          return (
            <button key={u} type="button" aria-pressed={ativo} onClick={() => setUnidade(u)}
              className="flex-1 rounded-xl py-2 font-semibold capitalize"
              style={{ backgroundColor: ativo ? colors.button : colors.inputBg, color: ativo ? colors.buttonText : colors.text, border: `1px solid ${colors.inputBorder}` }}>
              {u}
            </button>
          );
        })}
      </div>

      <SeletorSexo valor={sexo} erro={erros.sexo} tentativa={tentativa} onChange={(s) => { setSexo(s); apagaErro('sexo'); }} />

      {lactente && (
        <label className="mb-3 flex cursor-pointer items-center gap-2" style={{ color: colors.text }}>
          <input type="checkbox" checked={prematuro} onChange={(e) => setPrematuro(e.target.checked)} className="size-5" />
          <span>Prematuro (&lt;37 semanas de gestação)</span>
        </label>
      )}

      {aba === 'drc' && (
        <>
          <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Opções adicionais">
            {chip(cisAberta, () => setCisAberta((a) => !a), cisAberta ? '− Cistatina C' : '+ Cistatina C')}
          </div>
          {cisAberta && (
            <Campo icone="flask" placeholder="Cistatina C (mg/L)" dica="Opcional. Com ela o cálculo usa creatinina + cistatina C" inputMode="decimal"
              valor={cistatina} erro={erros.cistatina} tentativa={tentativa}
              onChange={(v) => { setCistatina(normalizarNumero(v)); apagaErro('cistatina'); }} />
          )}
        </>
      )}

      {aba === 'lra' && (
        <>
          <Campo icone="history" placeholder="Creatinina basal (mg/dL)" dica="Opcional. Sem ela, é estimada (TFG presumida de 120)" inputMode="decimal"
            valor={basal} erro={erros.basal} tentativa={tentativa}
            onChange={(v) => { setBasal(normalizarNumero(v)); apagaErro('basal'); }} />
          <div role="group" aria-label="Tempo desde a basal" className="mb-3 flex gap-2">
            {chip(janela === '48h', () => setJanela('48h'), 'Basal há ≤ 48 h')}
            {chip(janela === '7d', () => setJanela('7d'), 'Basal há ≤ 7 dias')}
          </div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="diurese" style={{ color: colors.text }}>Diurese</label>
          <select id="diurese" value={diurese} onChange={(e) => setDiurese(e.target.value as Diurese)}
            className="mb-3 w-full rounded-xl px-3 py-3 text-base"
            style={{ backgroundColor: colors.inputBg, color: colors.text, border: `1px solid ${colors.inputBorder}` }}>
            {(Object.keys(ROTULO_DIURESE) as Diurese[]).map((k) => <option key={k} value={k}>{ROTULO_DIURESE[k]}</option>)}
          </select>
        </>
      )}

      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={calcular}>Calcular</BotaoPrimario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>

      {avisos.length > 0 && (
        <div role="alert" className="mt-5 space-y-2 rounded-xl p-4" style={{ backgroundColor: colors.warningBg, borderLeft: '4px solid #ff6b35' }}>
          {avisos.map((a) => (
            <p key={a} className="flex gap-2 text-base font-semibold leading-5" style={{ color: '#111' }}>
              <Icone nome="exclamation-triangle" tamanho={18} cor="#7c2d12" className="mt-0.5 shrink-0" /><span>{a}</span>
            </p>
          ))}
        </div>
      )}
      {resultado && <CartaoResultado texto={resultado} cor={cor} />}
    </CalculadoraLayout>
  );
}
