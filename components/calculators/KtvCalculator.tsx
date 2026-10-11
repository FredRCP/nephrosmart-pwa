'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { calcularKtv } from '@/lib/clinical/hemodialise';
import { normalizarNumero } from '@/lib/clinical/numeros';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import AvisosCalculadora from '@/components/ui/AvisosCalculadora';
import Campo from '@/components/ui/Campo';
import Icone from '@/components/ui/Icone';
import { BlocoMono, TituloInfo } from '@/components/ui/InfoDialog';

/** Adequação da hemodiálise: spKt/V (Daugirdas), URR e eKt/V estimado. */
export default function KtvCalculator() {
  const { colors } = useTheme();
  const [pre, setPre] = useState('');
  const [pos, setPos] = useState('');
  const [horas, setHoras] = useState('');
  const [uf, setUf] = useState('');
  const [peso, setPeso] = useState('');
  const [erros, setErros] = useState<string[]>([]);
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState('');
  const [cor, setCor] = useState(colors.resultText);
  const [avisos, setAvisos] = useState<string[]>([]);
  const erro = (c: string) => erros.includes(c);
  const zerar = () => { setResultado(''); setErros([]); setAvisos([]); };

  const calcular = () => {
    setTentativa((t) => t + 1);
    const r = calcularKtv({ ureiaPre: pre, ureiaPos: pos, horas, uf, peso });
    if (!r.ok) { setErros(r.campos); setResultado(r.mensagem); setCor(colors.inputError); setAvisos([]); return; }
    setErros([]); setResultado(r.texto); setCor(r.classe === 'abaixo-do-minimo' ? colors.inputError : r.classe === 'abaixo-da-meta' ? colors.warning : colors.resultText); setAvisos(r.avisos);
  };
  const limpar = () => { setPre(''); setPos(''); setHoras(''); setUf(''); setPeso(''); zerar(); };
  const campo = (id: string, set: (s: string) => void) => (t: string) => { set(normalizarNumero(t)); setErros((e) => e.filter((x) => x !== id)); setResultado(''); };

  return (
    <CalculadoraLayout titulo="Kt/V e URR (Hemodiálise)" info={
      <>
        <TituloInfo>Fórmulas</TituloInfo>
        <BlocoMono>{`R = ureia pós ÷ ureia pré
spKt/V = −ln(R − 0,008 × t) + (4 − 3,5 × R) × UF ÷ P
URR (%) = 100 × (1 − R)
t = horas · UF = litros · P = peso pós (kg)`}</BlocoMono>
        <TituloInfo>Metas (KDOQI 2015, 3 sessões por semana)</TituloInfo>
        <ul className="space-y-1">
          <li>• spKt/V alvo 1,4 por sessão; mínimo entregue 1,2.</li>
          <li>• Fora do esquema de 3 sessões por semana, a meta é o Kt/V padrão semanal (stdKt/V) de 2,3, com mínimo de 2,1.</li>
          <li>• Com função renal residual &lt; 2 mL/min, sessões de pelo menos 3 h.</li>
          <li>• A KDOQI não fixa uma meta de URR (o Reino Unido usa &gt; 65%).</li>
        </ul>
        <TituloInfo>Coleta da ureia pós</TituloInfo>
        <p>Colete com a técnica de fluxo lento (50 mL/min, em até 20 s) ou pare o dialisato e colete após 5 minutos. Coleta precoce superestima o Kt/V; tardia subestima.</p>
        <TituloInfo>Limites</TituloInfo>
        <ul className="space-y-1">
          <li>• Kt/V não substitui a avaliação clínica: volume, pressão, nutrição e sintomas continuam decidindo.</li>
        </ul>
      </>
    }>
      <Campo icone="flask" placeholder="Ureia pré-diálise (mg/dL)" inputMode="decimal" valor={pre} erro={erro('ureiaPre')} tentativa={tentativa} onChange={campo('ureiaPre', setPre)} />
      <Campo icone="flask" placeholder="Ureia pós-diálise (mg/dL)" inputMode="decimal" valor={pos} erro={erro('ureiaPos')} tentativa={tentativa} onChange={campo('ureiaPos', setPos)} />
      <Campo icone="history" placeholder="Duração da sessão (horas)" inputMode="decimal" valor={horas} erro={erro('horas')} tentativa={tentativa} onChange={campo('horas', setHoras)} />
      <Campo icone="vial" placeholder="Volume ultrafiltrado (litros)" inputMode="decimal" valor={uf} erro={erro('uf')} tentativa={tentativa} onChange={campo('uf', setUf)} />
      <Campo icone="weight" placeholder="Peso pós-diálise (kg)" inputMode="decimal" valor={peso} erro={erro('peso')} tentativa={tentativa} onChange={campo('peso', setPeso)} />
      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={calcular}>Calcular</BotaoPrimario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>
      <AvisosCalculadora avisos={avisos} />
      {resultado && <CartaoResultado texto={resultado} cor={cor} />}
    </CalculadoraLayout>
  );
}
