'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { calcularOsmolaridade } from '@/lib/clinical/acidobase';
import { normalizarNumero } from '@/lib/clinical/numeros';
import { gravarLocal } from '@/lib/storage';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import AvisosCalculadora from '@/components/ui/AvisosCalculadora';
import Campo from '@/components/ui/Campo';
import Icone from '@/components/ui/Icone';
import { BlocoMono, TituloInfo } from '@/components/ui/InfoDialog';

const VAZIO = { na: '', glicose: '', ureia: '', etanol: '', medida: '' };

export default function OsmolaridadeCalculator() {
  const { colors } = useTheme();
  const [v, setV] = useState(VAZIO);
  const [erros, setErros] = useState<string[]>([]);
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState('');
  const [cor, setCor] = useState('#22c55e');
  const [avisos, setAvisos] = useState<string[]>([]);
  const set = (c: keyof typeof VAZIO) => (t: string) => { setV((x) => ({ ...x, [c]: normalizarNumero(t) })); setErros((e) => e.filter((k) => k !== c)); };

  const calcular = () => {
    const r = calcularOsmolaridade(v);
    setTentativa((t) => t + 1);
    if (!r.ok) { setErros(r.campos); setResultado(r.mensagem); setCor(colors.inputError); setAvisos([]); return; }
    setErros([]); setResultado(r.texto); setAvisos(r.avisos); setCor(colors.resultText);
    gravarLocal('ultimaOsmolaridade', r.osm.toString());
  };
  const limpar = () => { setV(VAZIO); setErros([]); setResultado(''); setAvisos([]); };

  return (
    <CalculadoraLayout titulo="Osmolaridade Sérica" info={
      <>
        <TituloInfo>Fórmula (osmolaridade calculada)</TituloInfo>
        <BlocoMono>Osm (mOsm/L) = 2 × Na⁺ + glicose/18 + ureia/6 (+ etanol/4,6)</BlocoMono>
        <TituloInfo>Referência e interpretação</TituloInfo>
        <ul className="space-y-1">
          <li>• Normal: 275–295 mOsm/kg. Baixa: hiponatremia hipotônica. Alta: hipernatremia, hiperglicemia, manitol.</li>
          <li>• Gap osmolar = osmolalidade medida − calculada. Normal: &lt; 10 mOsm/kg.</li>
          <li>• Gap &gt; 10 com acidose de AG elevado: suspeitar metanol ou etilenoglicol (urgência: fomepizol ± hemodiálise).</li>
          <li>• Ureia em mg/dL (ureia mg/dL ÷ 2,14 = BUN; ou ÷ 6 na fórmula).</li>
          <li>• Etanol é osmol ativo no cálculo, mas inefetivo (não causa movimento de água).</li>
        </ul>
        <TituloInfo>Referências</TituloInfo>
        <ul className="space-y-1"><li>• Rose BD, Post TW — Clinical Physiology of Acid-Base and Electrolyte Disorders</li></ul>
      </>
    }>
      <Campo icone="flask" placeholder="Sódio (mEq/L)" inputMode="decimal" valor={v.na} erro={erros.includes('na')} tentativa={tentativa} onChange={set('na')} />
      <Campo icone="flask" placeholder="Glicose (mg/dL)" inputMode="decimal" valor={v.glicose} erro={erros.includes('glicose')} tentativa={tentativa} onChange={set('glicose')} />
      <Campo icone="flask" placeholder="Ureia (mg/dL)" inputMode="decimal" valor={v.ureia} erro={erros.includes('ureia')} tentativa={tentativa} onChange={set('ureia')} />
      <Campo icone="flask" placeholder="Etanol (mg/dL) — opcional" inputMode="decimal" valor={v.etanol} erro={erros.includes('etanol')} tentativa={tentativa} onChange={set('etanol')} />
      <Campo icone="flask" placeholder="Osmolalidade medida (mOsm/kg) — opcional" dica="Informe para calcular o gap osmolar" inputMode="decimal" valor={v.medida} erro={erros.includes('medida')} tentativa={tentativa} onChange={set('medida')} />
      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={calcular}>Calcular</BotaoPrimario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>
      <AvisosCalculadora avisos={avisos} />
      {resultado && <CartaoResultado texto={resultado} cor={cor} />}
    </CalculadoraLayout>
  );
}
