'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { corrigirCalcio, type ResultadoCalcio } from '@/lib/clinical/calcio-corrigido';
import { normalizarNumero } from '@/lib/clinical/numeros';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import AvisosCalculadora from '@/components/ui/AvisosCalculadora';
import Campo from '@/components/ui/Campo';
import Icone from '@/components/ui/Icone';
import { TituloInfo } from '@/components/ui/InfoDialog';

const COR = { baixo: '#f44336', normal: '#22c55e', alto: '#f44336' } as const;

export default function CorrecaoCalcio() {
  const { colors } = useTheme();
  const [calcio, setCalcio] = useState('');
  const [albumina, setAlbumina] = useState('');
  const [campos, setCampos] = useState<string[]>([]);
  const [tentativa, setTentativa] = useState(0);
  const [msg, setMsg] = useState('');
  const [res, setRes] = useState<Extract<ResultadoCalcio, { ok: true }> | null>(null);

  const calcular = () => {
    setTentativa((t) => t + 1);
    const r = corrigirCalcio({ calcio, albumina });
    if (!r.ok) { setCampos(r.campos); setMsg(r.mensagem); setRes(null); return; }
    setCampos([]); setMsg(''); setRes(r);
  };
  const limpar = () => { setCalcio(''); setAlbumina(''); setCampos([]); setMsg(''); setRes(null); };
  const limparSaida = () => { setRes(null); setMsg(''); };

  return (
    <CalculadoraLayout titulo="Correção do Cálcio" info={
      <>
        <TituloInfo>Cálcio total corrigido pela albumina</TituloInfo>
        <ul className="space-y-1">
          <li>• Fórmula (Payne): Ca corrigido = Ca total + 0,8 × (4,0 − albumina). Sem ajuste se a albumina for ≥ 4,0 g/dL.</li>
          <li>• Cerca de 40–45% do cálcio total circula ligado à albumina; com albumina baixa, o cálcio total subestima o cálcio livre.</li>
          <li>• Referência: 8,5–10,2 mg/dL (varia conforme o laboratório).</li>
          <li>• A fórmula é aproximada. Em DRC, diálise, acidose grave, UTI, citrato (diálise, transfusão) ou albumina &lt; 2,0 g/dL, meça o cálcio iônico.</li>
          <li>• Não calcula o cálcio iônico. Interprete com PTH, vitamina D, fósforo e magnésio.</li>
          <li>• Nada é gravado: o cálculo é feito na hora.</li>
        </ul>
      </>
    }>
      <Campo icone="bone" placeholder="Cálcio sérico total (mg/dL)" inputMode="decimal" valor={calcio} erro={campos.includes('calcio')} tentativa={tentativa} onChange={(t) => { setCalcio(normalizarNumero(t)); limparSaida(); }} />
      <Campo icone="flask" placeholder="Albumina (g/dL)" inputMode="decimal" valor={albumina} erro={campos.includes('albumina')} tentativa={tentativa} onChange={(t) => { setAlbumina(normalizarNumero(t)); limparSaida(); }} />
      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={calcular}>Calcular</BotaoPrimario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>
      {msg && <CartaoResultado texto={msg} cor={colors.inputError} />}
      {res && (<><AvisosCalculadora avisos={res.avisos} /><CartaoResultado texto={res.texto} cor={COR[res.faixa]} /></>)}
    </CalculadoraLayout>
  );
}
