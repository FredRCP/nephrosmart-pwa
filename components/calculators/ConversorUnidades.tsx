'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { ANALITOS, converterUnidade, type IdAnalito } from '@/lib/clinical/unidades';
import { normalizarNumero } from '@/lib/clinical/numeros';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import Campo from '@/components/ui/Campo';
import Escolha from '@/components/ui/Escolha';
import Icone from '@/components/ui/Icone';
import Seletor from '@/components/ui/Seletor';
import { BlocoMono, TituloInfo } from '@/components/ui/InfoDialog';

export default function ConversorUnidades() {
  const { colors } = useTheme();
  const [analito, setAnalito] = useState<IdAnalito | ''>('');
  const [de, setDe] = useState('');
  const [valor, setValor] = useState('');
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState('');
  const [cor, setCor] = useState(colors.resultText);

  const a = ANALITOS.find((x) => x.id === analito);
  const escolher = (v: string) => { setAnalito(v as IdAnalito | ''); setDe(''); setResultado(''); setErro(false); };

  const converter = () => {
    setTentativa((t) => t + 1);
    const r = converterUnidade({ analito: analito as IdAnalito, valor, de });
    if (!r.ok) { setErro(true); setResultado(r.mensagem); setCor(colors.inputError); return; }
    setErro(false); setResultado(r.texto); setCor(colors.resultText);
  };
  const limpar = () => { setAnalito(''); setDe(''); setValor(''); setErro(false); setResultado(''); };

  return (
    <CalculadoraLayout titulo="Conversor de Unidades Laboratoriais" info={
      <>
        <TituloInfo>Como funciona</TituloInfo>
        <BlocoMono>{'mg/dL → mmol/L: × 10 ÷ massa molar\nCreatinina: mg/dL × 88,4 = µmol/L\nUreia (mg/dL) = BUN × 2,14\nPTH: pg/mL ÷ 9,43 = pmol/L\n25-OH vit. D: ng/mL × 2,496 = nmol/L'}</BlocoMono>
        <TituloInfo>Observações</TituloInfo>
        <ul className="space-y-1">
          <li>• Sódio, potássio, cloreto e bicarbonato: mEq/L = mmol/L, não precisam de conversão.</li>
          <li>• Cálcio e magnésio: mEq/L = mmol/L × 2 (íons divalentes).</li>
          <li>• Resultados exibidos com 4 algarismos significativos.</li>
        </ul>
      </>
    }>
      <Seletor rotulo="Exame" valor={analito} onChange={escolher} opcoes={ANALITOS.map((x) => ({ valor: x.id, texto: x.nome }))} />
      {a && <Escolha rotulo="Unidade do valor que você tem" valor={de} onChange={(v) => { setDe(v); setResultado(''); }} opcoes={a.unidades.map((u) => ({ valor: u.id, texto: u.rotulo }))} erro={erro && !de} />}
      {a?.nota && <p className="mb-3 px-1 text-xs" style={{ color: colors.text, opacity: 0.7 }}>{a.nota}</p>}
      <Campo icone="flask" placeholder="Valor" inputMode="decimal" valor={valor} erro={erro && !!de} tentativa={tentativa} onChange={(t) => { setValor(normalizarNumero(t)); setErro(false); }} />
      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={converter}>Converter</BotaoPrimario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>
      {resultado && <CartaoResultado texto={resultado} cor={cor} />}
    </CalculadoraLayout>
  );
}
