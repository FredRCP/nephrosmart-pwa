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
    <CalculadoraLayout titulo="Cálcio e albumina (Payne)" info={
      <>
        <TituloInfo>O que esta tela faz</TituloInfo>
        <ul className="space-y-1">
          <li>• Mostra o cálcio total medido e uma estimativa pela fórmula de Payne: Ca + 0,8 × (4,0 − albumina). Sem ajuste se a albumina for ≥ 4,0 g/dL.</li>
          <li>• Referência: 8,5–10,2 mg/dL (varia conforme o laboratório).</li>
        </ul>
        <TituloInfo>Por que a fórmula foi rebaixada</TituloInfo>
        <ul className="space-y-1">
          <li>• Em 22.658 adultos, o cálcio total sem correção concordou mais com o cálcio iônico (74,5%) do que o Payne (63%) (Desgagnés, JAMA Netw Open 2024).</li>
          <li>• Em DRC estágio 5 e diálise, o cálcio ajustado classifica mal o estado do cálcio (Law, Nephrology 2021).</li>
          <li>• Posição conjunta IOF/IFCC/EFLM (2026): os laboratórios não devem mais reportar cálcio corrigido pela albumina. Em DRC, diálise, doença crítica, acidose, citrato e hipoalbuminemia grave, o exame é o cálcio iônico.</li>
          <li>• Se o total e a estimativa caírem em faixas diferentes, o app avisa e a cor do resultado fica amarela.</li>
          <li>• Não calcula o cálcio iônico. Interprete com PTH, vitamina D, fósforo e magnésio. Nada é gravado: o cálculo é feito na hora.</li>
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
      {res && (<><AvisosCalculadora avisos={res.avisos} /><CartaoResultado texto={res.texto} cor={res.discordante ? '#f59e0b' : COR[res.faixa]} /></>)}
    </CalculadoraLayout>
  );
}
