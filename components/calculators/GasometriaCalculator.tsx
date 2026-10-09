'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { calcularGasometria, type GasoResultado } from '@/lib/clinical/acidobase';
import { normalizarNumero } from '@/lib/clinical/numeros';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario } from '@/components/archetypes/CalculadoraLayout';
import AvisosCalculadora from '@/components/ui/AvisosCalculadora';
import Campo from '@/components/ui/Campo';
import Icone from '@/components/ui/Icone';
import { TituloInfo } from '@/components/ui/InfoDialog';

const VAZIO = { ph: '', pco2: '', hco3: '', na: '', cl: '', albumina: '', lactato: '' };

export default function GasometriaCalculator() {
  const { colors } = useTheme();
  const [v, setV] = useState(VAZIO);
  const [erros, setErros] = useState<string[]>([]);
  const [tentativa, setTentativa] = useState(0);
  const [r, setR] = useState<GasoResultado | null>(null);
  const [msg, setMsg] = useState('');
  const set = (c: keyof typeof VAZIO) => (t: string) => { setV((x) => ({ ...x, [c]: normalizarNumero(t) })); setErros((e) => e.filter((k) => k !== c)); };

  const calcular = () => {
    const res = calcularGasometria(v);
    setTentativa((t) => t + 1);
    if (!res.ok) { setErros(res.campos); setMsg(res.mensagem); setR(null); return; }
    setErros([]); setMsg(''); setR(res);
  };
  const limpar = () => { setV(VAZIO); setErros([]); setR(null); setMsg(''); };
  const f = (c: keyof typeof VAZIO, ph: string, dica?: string) => (
    <Campo icone="vial" placeholder={ph} dica={dica} inputMode="decimal" valor={v[c]} erro={erros.includes(c)} tentativa={tentativa} onChange={set(c)} />
  );
  const avisos = r ? [r.avisoAlbumina, r.agAlerta].filter((x): x is string => !!x) : [];

  return (
    <CalculadoraLayout titulo="Gasometria Arterial" info={
      <>
        <TituloInfo>O que a tela faz</TituloInfo>
        <ul className="space-y-1">
          <li>• Identifica o distúrbio primário (pH, PCO₂, HCO₃⁻) e avalia a compensação esperada.</li>
          <li>• Calcula o anion gap (corrigido para albumina, se informada) e o delta-delta.</li>
          <li>• Albumina em branco: o AG NÃO é corrigido e o aplicativo avisa.</li>
          <li>• Lactato é opcional.</li>
        </ul>
        <TituloInfo>Delta-delta (Δ AG / Δ HCO₃)</TituloInfo>
        <ul className="space-y-1">
          <li>• &lt; 0,4: acidose hiperclorêmica pura (AG normal)</li><li>• 0,4–1: acidose de AG + hiperclorêmica</li>
          <li>• 1–2: acidose de AG simples</li><li>• &gt; 2: acidose de AG + alcalose metabólica associada</li>
        </ul>
        <TituloInfo>Referências</TituloInfo>
        <ul className="space-y-1"><li>• Berend K et al. N Engl J Med 2014;371:1434</li><li>• Kraut JA, Madias NE. Nat Rev Nephrol 2010;6:274</li></ul>
      </>
    }>
      {f('ph', 'pH (ex.: 7,35)')}{f('pco2', 'PCO₂ (mmHg)')}{f('hco3', 'HCO₃⁻ (mEq/L)')}{f('na', 'Sódio (mEq/L)')}{f('cl', 'Cloreto (mEq/L)')}
      {f('albumina', 'Albumina (g/dL) — opcional', 'Em branco: sem correção do AG')}{f('lactato', 'Lactato (mmol/L) — opcional')}
      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={calcular}>Calcular</BotaoPrimario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>
      {msg && <p role="status" className="mt-5 text-center text-base font-semibold" style={{ color: colors.inputError }}>{msg}</p>}
      <AvisosCalculadora avisos={avisos} />
      {r && (
        <div role="status" className="animate-resultado mt-5 space-y-2 rounded-xl p-4 text-base leading-6" style={{ backgroundColor: colors.resultBg, border: `1px solid ${colors.resultBorder}`, color: colors.text }}>
          <p className="text-center text-lg font-bold" style={{ color: colors.resultText }}>{r.disturbio}</p>
          <p>{r.parametros}</p>
          <p>{r.ag}</p>
          <p>{r.deltaGap} — {r.deltaGapInterp}</p>
          {r.compEsperada && <p className="whitespace-pre-line">{r.compEsperada}</p>}
          {r.compReal && <p>{r.compReal} {r.compStatus}</p>}
          {r.lactato && <p>{r.lactato}</p>}
          {r.conclusao && <p className="font-semibold">{r.conclusao}</p>}
        </div>
      )}
    </CalculadoraLayout>
  );
}
