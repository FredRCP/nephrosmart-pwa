'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { estadiarDRC, CATEGORIAS_G, CATEGORIAS_A, RISCO, ROTULO_RISCO, type ResultadoDRC, type TipoAlbuminuria, type Risco } from '@/lib/clinical/drc-estadiamento';
import { normalizarNumero } from '@/lib/clinical/numeros';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import AvisosCalculadora from '@/components/ui/AvisosCalculadora';
import Campo from '@/components/ui/Campo';
import Escolha from '@/components/ui/Escolha';
import Icone from '@/components/ui/Icone';
import { TituloInfo } from '@/components/ui/InfoDialog';

const COR_RISCO: Record<Risco, string> = { baixo: '#22c55e', moderado: '#eab308', alto: '#f97316', 'muito-alto': '#ef4444' };
const UNIDADE: Record<TipoAlbuminuria, string> = { rac: 'mg/g', aer: 'mg/24 h', pcr: 'mg/g', per: 'mg/24 h' };

export default function EstadiamentoDrc() {
  const { colors } = useTheme();
  const [tfg, setTfg] = useState('');
  const [tipo, setTipo] = useState<TipoAlbuminuria | ''>('rac');
  const [alb, setAlb] = useState('');
  const [campos, setCampos] = useState<string[]>([]);
  const [tentativa, setTentativa] = useState(0);
  const [msg, setMsg] = useState('');
  const [res, setRes] = useState<ResultadoDRC | null>(null);

  const calcular = () => {
    setTentativa((t) => t + 1);
    const r = estadiarDRC({ tfg, tipo, albuminuria: alb });
    if (!r.ok) { setCampos(r.campos); setMsg(r.mensagem); setRes(null); return; }
    setCampos([]); setMsg(''); setRes(r);
  };
  const limpar = () => { setTfg(''); setAlb(''); setTipo('rac'); setCampos([]); setMsg(''); setRes(null); };
  const limparSaida = () => { setRes(null); setMsg(''); };

  return (
    <CalculadoraLayout titulo="Estadiamento da DRC (KDIGO)" info={
      <>
        <TituloInfo>Classificação KDIGO 2024</TituloInfo>
        <ul className="space-y-1">
          <li>• TFG: G1 ≥ 90 · G2 60–89 · G3a 45–59 · G3b 30–44 · G4 15–29 · G5 &lt; 15 mL/min/1,73 m².</li>
          <li>• Albuminúria: A1 &lt; 30 · A2 30–300 · A3 &gt; 300 mg/g (RAC) ou mg/24 h (EAU).</li>
          <li>• Proteinúria (alternativa): A1 &lt; 150 · A2 150–500 · A3 &gt; 500 mg/g ou mg/24 h.</li>
          <li>• DRC exige alteração por mais de 3 meses. G1/G2 com A1 só é DRC se houver outro marcador de lesão renal.</li>
          <li>• A cor indica o risco de progressão e de eventos cardiovasculares; o número é a frequência sugerida de monitorização (vezes por ano).</li>
        </ul>
      </>
    }>
      <Campo icone="heartbeat" placeholder="TFG (mL/min/1,73 m²)" dica="Use o resultado do CKD-EPI" inputMode="decimal" valor={tfg} erro={campos.includes('tfg')} tentativa={tentativa} onChange={(t) => { setTfg(normalizarNumero(t)); limparSaida(); }} />
      <Escolha rotulo="Exame de urina" valor={tipo} onChange={(t) => { setTipo(t); limparSaida(); }} opcoes={[
        { valor: 'rac', texto: 'Relação albumina/creatinina' }, { valor: 'aer', texto: 'Albumina 24 h' },
        { valor: 'pcr', texto: 'Relação proteína/creatinina' }, { valor: 'per', texto: 'Proteína 24 h' }]} erro={campos.includes('tipo')} />
      <Campo icone="vial" placeholder={`Valor (${tipo ? UNIDADE[tipo] : 'mg/g'})`} inputMode="decimal" valor={alb} erro={campos.includes('albuminuria')} tentativa={tentativa} onChange={(t) => { setAlb(normalizarNumero(t)); limparSaida(); }} />
      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={calcular}>Estadiar</BotaoPrimario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>
      {msg && <CartaoResultado texto={msg} cor={colors.inputError} />}
      {res && (
        <>
          <AvisosCalculadora avisos={res.avisos} />
          <CartaoResultado texto={res.texto} cor={COR_RISCO[res.risco]} />
          <div className="mt-4 overflow-x-auto" role="table" aria-label="Mapa de risco KDIGO" data-testid="mapa-risco">
            <div className="grid min-w-[300px] grid-cols-[auto_1fr_1fr_1fr] gap-1 text-center text-xs">
              <div />
              {CATEGORIAS_A.map((c) => <div key={c.id} className="font-semibold" style={{ color: colors.text }}>{c.id}</div>)}
              {CATEGORIAS_G.map((g) => (
                <div key={g.id} className="contents">
                  <div className="flex items-center pr-1 font-semibold" style={{ color: colors.text }}>{g.id}</div>
                  {CATEGORIAS_A.map((c, i) => {
                    const ativo = res.g === g.id && res.a === c.id;
                    const r = RISCO[g.id][i];
                    return (
                      <div key={c.id} data-ativo={ativo} aria-label={`${g.id} ${c.id}: ${ROTULO_RISCO[r]}`}
                        className="rounded-md py-2 font-semibold"
                        style={{ backgroundColor: COR_RISCO[r], color: '#111', opacity: ativo ? 1 : 0.35, outline: ativo ? `3px solid ${colors.text}` : 'none' }}>
                        {ativo ? '●' : ''}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs" style={{ color: colors.text, opacity: 0.7 }}>Verde: baixo · Amarelo: moderado · Laranja: alto · Vermelho: muito alto</p>
          </div>
        </>
      )}
    </CalculadoraLayout>
  );
}
