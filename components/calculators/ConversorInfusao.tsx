'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { UNIDADES_DOSE, calcularInfusao, type Massa, type Sentido } from '@/lib/clinical/infusao';
import { normalizarNumero } from '@/lib/clinical/numeros';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import AvisosCalculadora from '@/components/ui/AvisosCalculadora';
import Campo from '@/components/ui/Campo';
import Escolha from '@/components/ui/Escolha';
import Icone from '@/components/ui/Icone';
import Seletor from '@/components/ui/Seletor';
import { BlocoMono, TituloInfo } from '@/components/ui/InfoDialog';

/** Conversor de dose de infusão contínua: mcg/kg/min (e outras unidades) ↔ mL/h. */
export default function ConversorInfusao() {
  const { colors } = useTheme();
  const [sentido, setSentido] = useState<Sentido>('dose-para-velocidade');
  const [quantidade, setQuantidade] = useState('');
  const [unidadeQ, setUnidadeQ] = useState<Massa | ''>('mg');
  const [volume, setVolume] = useState('');
  const [unidadeDose, setUnidadeDose] = useState('mcg/kg/min');
  const [peso, setPeso] = useState('');
  const [valor, setValor] = useState('');
  const [erros, setErros] = useState<string[]>([]);
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState('');
  const [cor, setCor] = useState(colors.resultText);
  const [avisos, setAvisos] = useState<string[]>([]);

  const un = UNIDADES_DOSE.find((u) => u.id === unidadeDose);
  const d2v = sentido === 'dose-para-velocidade';
  const erro = (c: string) => erros.includes(c);
  const zerar = () => { setResultado(''); setErros([]); setAvisos([]); };

  const calcular = () => {
    setTentativa((t) => t + 1);
    const r = calcularInfusao({ sentido, quantidade, unidadeQuantidade: unidadeQ, volume, peso, unidadeDose, valor });
    if (!r.ok) { setErros(r.campos); setResultado(r.mensagem); setCor(colors.inputError); setAvisos([]); return; }
    setErros([]); setResultado(r.texto); setCor(colors.resultText); setAvisos(r.avisos);
  };
  const limpar = () => { setQuantidade(''); setVolume(''); setPeso(''); setValor(''); zerar(); };

  return (
    <CalculadoraLayout reforcado titulo="Conversor de Dose (Infusão)" info={
      <>
        <TituloInfo>Fórmulas</TituloInfo>
        <BlocoMono>{`Concentração (C) = quantidade ÷ volume final
mL/h = dose por hora ÷ C
dose por hora = dose × peso (se "por kg") × 60 (se "por min")
Dose = mL/h × C ÷ peso ÷ 60 (se "por kg" / "por min")`}</BlocoMono>
        <p className="mt-2">Exemplo: noradrenalina 16 mg em 250 mL (64 mcg/mL), 80 kg, 0,1 mcg/kg/min → 0,1 × 80 × 60 ÷ 64 = 7,5 mL/h.</p>
        <TituloInfo>Unidades usuais (referência)</TituloInfo>
        <ul className="space-y-1">
          <li>• mcg/kg/min: noradrenalina, adrenalina, dobutamina, dopamina, milrinona, nitroprussiato.</li>
          <li>• mcg/min: nitroglicerina. UI/min ou UI/h (dose fixa, sem peso): vasopressina.</li>
          <li>• mcg/kg/h: fentanil, dexmedetomidina. mg/h ou mg/kg/h: midazolam; mg/kg/h ou mcg/kg/min: propofol.</li>
          <li>• UI/kg/h: heparina. UI/h: insulina. mg/h: furosemida em infusão.</li>
        </ul>
        <TituloInfo>Erros comuns</TituloInfo>
        <ul className="space-y-1">
          <li>• Trocar minuto por hora (diferença de 60 vezes).</li>
          <li>• Misturar mg com mcg (diferença de 1.000 vezes). Use o volume FINAL da solução.</li>
          <li>• Noradrenalina: a dose da literatura e do SOFA-2 é como BASE; 1 mg de base = 2 mg de bitartarato monoidratado. Confira o que está escrito na ampola.</li>
          <li>• Peso: confirme se o protocolo usa o peso real, ideal ou ajustado.</li>
          <li>• Vasopressina é dose fixa em UI, não por kg.</li>
        </ul>
        <p className="mt-3">Esta ferramenta não sugere diluições nem doses: use o protocolo da sua unidade.</p>
      </>
    }>
      <Escolha rotulo="Converter" valor={sentido} onChange={(s) => { setSentido(s); setValor(''); zerar(); }}
        opcoes={[{ valor: 'dose-para-velocidade', texto: 'Dose → mL/h' }, { valor: 'velocidade-para-dose', texto: 'mL/h → dose' }]} />
      <Campo icone="flask" placeholder="Quantidade do fármaco na solução" inputMode="decimal" valor={quantidade} erro={erro('quantidade')} tentativa={tentativa}
        onChange={(t) => { setQuantidade(normalizarNumero(t)); zerar(); }} />
      <Escolha rotulo="Unidade da quantidade" valor={unidadeQ} erro={erro('unidadeQuantidade')} onChange={(u) => { setUnidadeQ(u); zerar(); }}
        opcoes={[{ valor: 'mg', texto: 'mg' }, { valor: 'mcg', texto: 'mcg' }, { valor: 'UI', texto: 'UI' }]} />
      <Campo icone="vial" placeholder="Volume final da solução (mL)" inputMode="decimal" valor={volume} erro={erro('volume')} tentativa={tentativa}
        onChange={(t) => { setVolume(normalizarNumero(t)); zerar(); }} />
      <Seletor rotulo="Unidade da dose" valor={unidadeDose} erro={erro('unidadeDose')} onChange={(u) => { setUnidadeDose(u); zerar(); }}
        opcoes={UNIDADES_DOSE.map((u) => ({ valor: u.id, texto: u.texto }))} />
      {un?.porKg && (
        <Campo icone="weight" placeholder="Peso (kg)" inputMode="decimal" valor={peso} erro={erro('peso')} tentativa={tentativa}
          onChange={(t) => { setPeso(normalizarNumero(t)); zerar(); }} />
      )}
      <Campo icone="heartbeat" placeholder={d2v ? `Dose desejada (${un?.texto ?? ''})` : 'Velocidade da bomba (mL/h)'} inputMode="decimal" valor={valor}
        erro={erro('valor')} tentativa={tentativa} onChange={(t) => { setValor(normalizarNumero(t)); zerar(); }} />
      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={calcular}>Calcular</BotaoPrimario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>
      <AvisosCalculadora avisos={avisos} />
      {resultado && <CartaoResultado texto={resultado} cor={cor} />}
    </CalculadoraLayout>
  );
}
