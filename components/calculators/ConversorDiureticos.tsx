'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { DIURETICOS, converterDiuretico } from '@/lib/clinical/diureticos';
import { normalizarNumero } from '@/lib/clinical/numeros';
import { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import AvisosCalculadora from '@/components/ui/AvisosCalculadora';
import Campo from '@/components/ui/Campo';
import Icone from '@/components/ui/Icone';
import Seletor from '@/components/ui/Seletor';

export default function ConversorDiureticos() {
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
    <>
      <Seletor rotulo="Diurético atual" valor={de} onChange={(v) => { setDe(v); setResultado(''); setErro(false); }} erro={erro && !de}
        opcoes={[...DIURETICOS].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).map((d) => ({ valor: d.id, texto: d.nome }))} />
      <Campo icone="pills" placeholder="Dose (mg)" inputMode="decimal" valor={dose} erro={erro && !!de} tentativa={tentativa} onChange={(t) => { setDose(normalizarNumero(t)); setErro(false); }} />
      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={converter}>Converter</BotaoPrimario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>
      <AvisosCalculadora avisos={avisos} />
      {resultado && <CartaoResultado texto={resultado} cor={cor} />}
    </>
  );
}

