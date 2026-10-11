'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { calcularTuf } from '@/lib/clinical/hemodialise';
import { normalizarNumero } from '@/lib/clinical/numeros';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import AvisosCalculadora from '@/components/ui/AvisosCalculadora';
import Campo from '@/components/ui/Campo';
import Icone from '@/components/ui/Icone';
import { BlocoMono, TituloInfo } from '@/components/ui/InfoDialog';

/** Taxa de ultrafiltração (mL/kg/h) e ganho interdialítico. */
export default function TaxaUf() {
  const { colors } = useTheme();
  const [uf, setUf] = useState('');
  const [peso, setPeso] = useState('');
  const [horas, setHoras] = useState('');
  const [ganho, setGanho] = useState('');
  const [erros, setErros] = useState<string[]>([]);
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState('');
  const [cor, setCor] = useState(colors.resultText);
  const [avisos, setAvisos] = useState<string[]>([]);
  const erro = (c: string) => erros.includes(c);

  const calcular = () => {
    setTentativa((t) => t + 1);
    const r = calcularTuf({ uf, pesoSeco: peso, horas, ganho });
    if (!r.ok) { setErros(r.campos); setResultado(r.mensagem); setCor(colors.inputError); setAvisos([]); return; }
    setErros([]); setResultado(r.texto); setCor(r.classe === 'alta' ? colors.inputError : r.classe === 'intermediaria' ? colors.warning : colors.resultText); setAvisos(r.avisos);
  };
  const limpar = () => { setUf(''); setPeso(''); setHoras(''); setGanho(''); setErros([]); setResultado(''); setAvisos([]); };
  const campo = (id: string, set: (s: string) => void) => (t: string) => { set(normalizarNumero(t)); setErros((e) => e.filter((x) => x !== id)); setResultado(''); };

  return (
    <CalculadoraLayout titulo="Taxa de Ultrafiltração" info={
      <>
        <TituloInfo>Fórmula</TituloInfo>
        <BlocoMono>{`Taxa de UF (mL/kg/h) = UF (mL) ÷ peso seco (kg) ÷ duração (h)
Ganho interdialítico (%) = ganho (kg) ÷ peso seco × 100`}</BlocoMono>
        <TituloInfo>Como interpretar</TituloInfo>
        <ul className="space-y-1">
          <li>• Na análise do estudo HEMO (Flythe, Kidney Int 2011), taxa &gt; 13 mL/kg/h associou-se a maior mortalidade cardiovascular (HR 1,71) e 10 a 13 a risco intermediário (HR 1,33).</li>
          <li>• A medida de qualidade americana usa 13 mL/kg/h em sessões &lt; 4 h. Não é meta de diretriz: a KDOQI não estabelece um número.</li>
          <li>• Estudos observacionais: a associação pode refletir pacientes mais graves.</li>
        </ul>
        <p className="mt-2">O ganho interdialítico é mostrado só como porcentagem do peso seco, sem classificação.</p>
      </>
    }>
      <Campo icone="vial" placeholder="Volume a ultrafiltrar (litros)" inputMode="decimal" valor={uf} erro={erro('uf')} tentativa={tentativa} onChange={campo('uf', setUf)} />
      <Campo icone="weight" placeholder="Peso seco (kg)" inputMode="decimal" valor={peso} erro={erro('pesoSeco')} tentativa={tentativa} onChange={campo('pesoSeco', setPeso)} />
      <Campo icone="history" placeholder="Duração da sessão (horas)" inputMode="decimal" valor={horas} erro={erro('horas')} tentativa={tentativa} onChange={campo('horas', setHoras)} />
      <Campo icone="weight" placeholder="Ganho interdialítico (kg) — opcional" inputMode="decimal" valor={ganho} erro={erro('ganho')} tentativa={tentativa} onChange={campo('ganho', setGanho)} />
      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={calcular}>Calcular</BotaoPrimario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>
      <AvisosCalculadora avisos={avisos} />
      {resultado && <CartaoResultado texto={resultado} cor={cor} />}
    </CalculadoraLayout>
  );
}
