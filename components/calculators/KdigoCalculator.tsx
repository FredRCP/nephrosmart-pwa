'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { estadiarKDIGO, type EstagioKDIGO, type JanelaCr } from '@/lib/clinical/kdigo';
import { normalizarNumero } from '@/lib/clinical/numeros';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import AvisosCalculadora from '@/components/ui/AvisosCalculadora';
import Campo from '@/components/ui/Campo';
import Escolha from '@/components/ui/Escolha';
import Icone from '@/components/ui/Icone';
import { BlocoMono, TituloInfo } from '@/components/ui/InfoDialog';

const VAZIO = { basal: '', atual: '', peso: '', volume: '', horas: '' };
const COR_ESTAGIO: Record<EstagioKDIGO, string> = { 0: '#22c55e', 1: '#f59e0b', 2: '#ea580c', 3: '#ef4444' };

export default function KdigoCalculator() {
  const { colors } = useTheme();
  const [v, setV] = useState(VAZIO);
  const [janela, setJanela] = useState<JanelaCr | ''>('');
  const [trs, setTrs] = useState(false);
  const [erros, setErros] = useState<string[]>([]);
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState('');
  const [cor, setCor] = useState('#22c55e');
  const [avisos, setAvisos] = useState<string[]>([]);

  const set = (c: keyof typeof VAZIO) => (t: string) => { setV((x) => ({ ...x, [c]: normalizarNumero(t) })); setErros((e) => e.filter((k) => k !== c)); };

  const calcular = () => {
    const r = estadiarKDIGO({ ...v, janela, trs });
    setTentativa((t) => t + 1);
    if (!r.ok) { setErros(r.campos); setResultado(r.mensagem); setCor(colors.inputError); setAvisos([]); return; }
    setErros([]); setResultado(r.texto); setAvisos(r.avisos); setCor(COR_ESTAGIO[r.estagio]);
  };
  const limpar = () => { setV(VAZIO); setJanela(''); setTrs(false); setErros([]); setResultado(''); setAvisos([]); };

  return (
    <CalculadoraLayout titulo="Calculadora KDIGO" info={
      <>
        <TituloInfo>Critérios (KDIGO 2012)</TituloInfo>
        <BlocoMono>{'IRA: ΔCr ≥ 0,3 mg/dL em 48 h, OU Cr ≥ 1,5× a basal em 7 dias, OU diurese < 0,5 mL/kg/h por ≥ 6 h'}</BlocoMono>
        <ul className="space-y-1">
          <li>• Estágio 1: Cr 1,5–1,9× OU +0,3 mg/dL; diurese &lt; 0,5 por 6–12 h</li>
          <li>• Estágio 2: Cr 2,0–2,9×; diurese &lt; 0,5 por ≥ 12 h</li>
          <li>• Estágio 3: Cr ≥ 3× OU ≥ 4,0 mg/dL (com aumento agudo) OU terapia renal substitutiva; diurese &lt; 0,3 por ≥ 24 h OU anúria ≥ 12 h</li>
        </ul>
        <TituloInfo>Como usar</TituloInfo>
        <ul className="space-y-1">
          <li>• Informe creatinina basal e atual E o intervalo entre elas; e/ou o volume urinário do período.</li>
          <li>• Diurese: volume total (mL) ÷ peso (kg) ÷ horas. Use o período contínuo de oligúria.</li>
          <li>• O estágio final é o mais grave entre creatinina, diurese e terapia renal substitutiva.</li>
        </ul>
        <TituloInfo>Limitações</TituloInfo>
        <ul className="space-y-1">
          <li>• Estadia a gravidade; não diagnostica a causa. O critério pediátrico de TFG &lt; 35 mL/min/1,73 m² não está incluído.</li>
          <li>• Creatinina não reflete a TFG fora do equilíbrio (IRA em evolução).</li>
        </ul>
        <TituloInfo>Referência</TituloInfo>
        <ul className="space-y-1"><li>• KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl 2012;2:1</li></ul>
      </>
    }>
      <p className="mb-2 px-1 text-sm" style={{ color: colors.text, opacity: 0.8 }}>Informe a creatinina e/ou a diurese. Os campos de diurese são opcionais.</p>
      <Campo icone="vial" placeholder="Creatinina basal (mg/dL)" inputMode="decimal" valor={v.basal} erro={erros.includes('basal')} tentativa={tentativa} onChange={set('basal')} />
      <Campo icone="vial" placeholder="Creatinina atual (mg/dL)" inputMode="decimal" valor={v.atual} erro={erros.includes('atual')} tentativa={tentativa} onChange={set('atual')} />
      <Escolha<JanelaCr> rotulo="Intervalo entre a basal e a atual" valor={janela} erro={erros.includes('janela')} onChange={setJanela}
        opcoes={[{ valor: 'ate48h', texto: 'Até 48 h' }, { valor: 'ate7d', texto: '2 a 7 dias' }, { valor: 'mais7d', texto: '> 7 dias' }]} />
      <Campo icone="weight" placeholder="Peso (kg)" inputMode="decimal" valor={v.peso} erro={erros.includes('peso')} tentativa={tentativa} onChange={set('peso')} />
      <Campo icone="flask" placeholder="Volume urinário no período (mL)" inputMode="decimal" valor={v.volume} erro={erros.includes('volume')} tentativa={tentativa} onChange={set('volume')} />
      <Campo icone="history" placeholder="Duração do período (horas)" inputMode="decimal" valor={v.horas} erro={erros.includes('horas')} tentativa={tentativa} onChange={set('horas')} />
      <label className="mb-3 flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold" style={{ backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}`, color: colors.text }}>
        <input type="checkbox" checked={trs} onChange={(e) => setTrs(e.target.checked)} className="size-5" />Em terapia renal substitutiva
      </label>
      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={calcular}>Calcular</BotaoPrimario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>
      <AvisosCalculadora avisos={avisos} />
      {resultado && <CartaoResultado texto={resultado} cor={cor} />}
    </CalculadoraLayout>
  );
}
