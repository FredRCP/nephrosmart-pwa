'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { calcularClearance24h, type Sexo } from '@/lib/clinical/clearance24h';
import { normalizarNumero } from '@/lib/clinical/numeros';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import AvisosCalculadora from '@/components/ui/AvisosCalculadora';
import Campo from '@/components/ui/Campo';
import Escolha from '@/components/ui/Escolha';
import Icone from '@/components/ui/Icone';
import { BlocoMono, TituloInfo } from '@/components/ui/InfoDialog';

const VAZIO = { volume: '', horas: '24', uCr: '', sCr: '', peso: '', altura: '' };

export default function Clearance24h() {
  const { colors } = useTheme();
  const [v, setV] = useState(VAZIO);
  const [sexo, setSexo] = useState<Sexo | ''>('');
  const [campos, setCampos] = useState<string[]>([]);
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState('');
  const [cor, setCor] = useState(colors.resultText);
  const [avisos, setAvisos] = useState<string[]>([]);

  const set = (k: keyof typeof VAZIO) => (t: string) => { setV((x) => ({ ...x, [k]: normalizarNumero(t) })); setCampos((c) => c.filter((n) => n !== k)); };

  const calcular = () => {
    setTentativa((t) => t + 1);
    const r = calcularClearance24h({ ...v, sexo });
    if (!r.ok) { setCampos(r.campos); setResultado(r.mensagem); setCor(colors.inputError); setAvisos([]); return; }
    setCampos([]); setResultado(r.texto); setCor(colors.resultText); setAvisos(r.avisos);
  };
  const limpar = () => { setV(VAZIO); setSexo(''); setCampos([]); setResultado(''); setAvisos([]); };
  const campo = (k: keyof typeof VAZIO, icone: string, placeholder: string, dica?: string) => (
    <Campo icone={icone} placeholder={placeholder} dica={dica} inputMode="decimal" valor={v[k]} erro={campos.includes(k)} tentativa={tentativa} onChange={set(k)} />
  );

  return (
    <CalculadoraLayout titulo="Depuração de Creatinina (24 h)" info={
      <>
        <TituloInfo>Fórmula</TituloInfo>
        <BlocoMono>{'ClCr (mL/min) = (Cr urinária × volume) ÷ (Cr sérica × minutos)\nCorrigida = ClCr × 1,73 ÷ SC (Mosteller)'}</BlocoMono>
        <TituloInfo>Pontos de atenção</TituloInfo>
        <ul className="space-y-1">
          <li>• A coleta incompleta é o erro mais comum: confira a excreção de creatinina (mg/kg/24 h), que deve ser relativamente constante em cada pessoa.</li>
          <li>• A creatinina é também secretada pelo túbulo: o clearance tende a SUPERESTIMAR a TFG, mais ainda quando a função renal é baixa.</li>
          <li>• Hoje as diretrizes KDIGO preferem a TFG estimada (CKD-EPI); a coleta de urina fica para situações especiais (dieta atípica, massa muscular extrema, amputados, dose de medicamentos).</li>
          <li>• Informe peso e altura para obter o valor corrigido para 1,73 m² e a avaliação da coleta.</li>
        </ul>
      </>
    }>
      {campo('volume', 'flask', 'Volume urinário total (mL)')}
      {campo('horas', 'history', 'Duração da coleta (horas)', 'Habitualmente 24 h')}
      {campo('uCr', 'vial', 'Creatinina urinária (mg/dL)')}
      {campo('sCr', 'vial', 'Creatinina sérica (mg/dL)', 'Coletada durante o período da urina')}
      {campo('peso', 'weight', 'Peso (kg) — opcional')}
      {campo('altura', 'ruler-vertical', 'Altura (cm) — opcional')}
      <Escolha rotulo="Sexo (opcional, avalia a coleta)" valor={sexo} onChange={setSexo} opcoes={[{ valor: 'M', texto: 'Masculino' }, { valor: 'F', texto: 'Feminino' }]} />
      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={calcular}>Calcular</BotaoPrimario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>
      <AvisosCalculadora avisos={avisos} />
      {resultado && <CartaoResultado texto={resultado} cor={cor} />}
    </CalculadoraLayout>
  );
}
