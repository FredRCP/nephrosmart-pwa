'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { DIURETICOS, converterDiuretico } from '@/lib/clinical/diureticos';
import { normalizarNumero } from '@/lib/clinical/numeros';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import AvisosCalculadora from '@/components/ui/AvisosCalculadora';
import Campo from '@/components/ui/Campo';
import Icone from '@/components/ui/Icone';
import Seletor from '@/components/ui/Seletor';
import { TituloInfo } from '@/components/ui/InfoDialog';

export default function Diureticos() {
  const { colors } = useTheme();
  const [de, setDe] = useState('');
  const [dose, setDose] = useState('');
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState('');
  const [cor, setCor] = useState(colors.resultText);
  const [avisos, setAvisos] = useState<string[]>([]);

  const converter = () => {
    setTentativa((t) => t + 1);
    const r = converterDiuretico({ de, dose });
    if (!r.ok) { setErro(true); setResultado(r.mensagem); setCor(colors.inputError); setAvisos([]); return; }
    setErro(false); setResultado(r.texto); setCor(colors.resultText); setAvisos(r.avisos);
  };
  const limpar = () => { setDe(''); setDose(''); setErro(false); setResultado(''); setAvisos([]); };

  return (
    <CalculadoraLayout titulo="Equivalência de Diuréticos" info={
      <>
        <TituloInfo>Equivalências usadas (dose oral, referência)</TituloInfo>
        <ul className="space-y-1">
          <li>• Alça: furosemida VO 40 mg ≈ furosemida IV 20 mg ≈ bumetanida 1 mg ≈ torasemida 20 mg ≈ ácido etacrínico 50 mg.</li>
          <li>• Tiazídicos: hidroclorotiazida 25 mg ≈ clortalidona 12,5 mg.</li>
        </ul>
        <TituloInfo>Limites</TituloInfo>
        <ul className="space-y-1">
          <li>• A equivalência é aproximada e varia entre as fontes; serve para trocar de fármaco, não para definir a dose inicial.</li>
          <li>• Na TFG baixa ou na insuficiência cardíaca descompensada, é preciso atingir a dose-limiar da alça; doses menores podem não ter efeito.</li>
          <li>• Só é feita conversão dentro do mesmo grupo (alça ou tiazídico).</li>
        </ul>
      </>
    }>
      <Seletor rotulo="Diurético atual" valor={de} onChange={(v) => { setDe(v); setResultado(''); setErro(false); }} erro={erro && !de}
        opcoes={DIURETICOS.map((d) => ({ valor: d.id, texto: d.nome }))} />
      <Campo icone="pills" placeholder="Dose (mg)" inputMode="decimal" valor={dose} erro={erro && !!de} tentativa={tentativa} onChange={(t) => { setDose(normalizarNumero(t)); setErro(false); }} />
      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={converter}>Converter</BotaoPrimario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>
      <AvisosCalculadora avisos={avisos} />
      {resultado && <CartaoResultado texto={resultado} cor={cor} />}
    </CalculadoraLayout>
  );
}
