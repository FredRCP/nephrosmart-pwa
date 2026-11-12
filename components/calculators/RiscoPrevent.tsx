'use client';

import { useState, type ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { calcularPrevent, type EntradaPrevent } from '@/lib/clinical/prevent';
import { normalizarNumero } from '@/lib/clinical/numeros';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import Campo from '@/components/ui/Campo';
import Escolha from '@/components/ui/Escolha';
import { TituloInfo } from '@/components/ui/InfoDialog';

const VAZIO: EntradaPrevent = { idade: '', sexo: '', colesterolTotal: '', hdl: '', pas: '', imc: '', egfr: '', uacr: '', tratamentoHas: false, estatina: false, diabetes: false, fumante: false };

function Marcar({ rotulo, marcado, onChange }: { rotulo: string; marcado: boolean; onChange: (v: boolean) => void }) {
  const { colors } = useTheme();
  return (
    <label className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-base" style={{ backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}`, color: colors.text }}>
      <input type="checkbox" checked={marcado} onChange={(e) => onChange(e.target.checked)} className="size-5" />
      <span>{rotulo}</span>
    </label>
  );
}

export default function RiscoPrevent({ topo }: { topo?: ReactNode }) {
  const { colors } = useTheme();
  const [e, setE] = useState<EntradaPrevent>(VAZIO);
  const [erros, setErros] = useState<string[]>([]);
  const [tentativa, setTentativa] = useState(0);
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState(false);
  const mudar = <K extends keyof EntradaPrevent>(k: K, v: EntradaPrevent[K]) => { setE((x) => ({ ...x, [k]: v })); setErros((l) => l.filter((c) => c !== k)); setTexto(''); };
  const txt = (k: 'idade' | 'colesterolTotal' | 'hdl' | 'pas' | 'imc' | 'egfr' | 'uacr') => (t: string) => mudar(k, normalizarNumero(t));
  const pct = (n: number) => n.toFixed(1).replace('.', ',') + '%';

  const calcular = () => {
    setTentativa((t) => t + 1);
    const r = calcularPrevent(e);
    if (!r.ok) { setErros(r.campos); setTexto(r.mensagem); setErro(true); return; }
    setErros([]); setErro(false);
    const linha = (rot: string, x: { totalCvd: number; ascvd: number; insuficienciaCardiaca: number }) =>
      `${rot}\n• DCV total: ${pct(x.totalCvd)}\n• DCV aterosclerótica (infarto, AVC): ${pct(x.ascvd)}\n• Insuficiência cardíaca: ${pct(x.insuficienciaCardiaca)}`;
    setTexto([linha('Risco em 10 anos', r.dez), r.trinta ? linha('Risco em 30 anos', r.trinta) : '', `Modelo: ${r.modelo === 'uacr' ? 'base + albuminúria' : 'base'}`, ...r.avisos].filter(Boolean).join('\n\n'));
  };

  return (
    <CalculadoraLayout titulo="Risco Cardiovascular" info={
      <>
        <TituloInfo>PREVENT (American Heart Association, 2023)</TituloInfo>
        <p>Estima o risco de doença cardiovascular total, doença aterosclerótica (infarto/AVC) e insuficiência cardíaca em 10 anos (30 a 79 anos) e em 30 anos (30 a 59 anos), em pessoas sem doença cardiovascular estabelecida. Inclui TFG, IMC, uso de anti-hipertensivo e estatina, e dispensa raça. Este app usa o modelo base e o modelo com albuminúria (ACR).</p>
        <TituloInfo>Limitações</TituloInfo>
        <ul className="space-y-1">
          <li>• Não validado com TFG &lt; 15 mL/min/1,73 m², em diálise ou transplante; nesses casos o risco tende a ser subestimado.</li>
          <li>• Derivado de coortes norte-americanas; a calibração em populações brasileiras não está estabelecida.</li>
          <li>• Os modelos com HbA1c e com índice socioeconômico não estão disponíveis aqui (o modelo com HbA1c passou por erratum em 10/2026).</li>
          <li>• Os pontos de corte de risco para decisão de tratamento ainda não foram consolidados nas diretrizes: use o julgamento clínico.</li>
          <li>• Sem albuminúria informada, usa-se o modelo base.</li>
        </ul>
        <TituloInfo>Referências</TituloInfo>
        <ul className="space-y-1">
          <li>• Khan SS et al. Development and validation of the AHA PREVENT equations. Circulation 2024;149:430–449.</li>
          <li>• Coeficientes conferidos com o pacote público &quot;preventr&quot; (calculadora da AHA).</li>
        </ul>
      </>
    }>
      {topo}
      <Campo icone="calendar-alt" placeholder="Idade (30–79 anos)" inputMode="numeric" valor={e.idade} erro={erros.includes('idade')} tentativa={tentativa} onChange={txt('idade')} />
      <Escolha rotulo="Sexo" valor={e.sexo} erro={erros.includes('sexo')} onChange={(v) => mudar('sexo', v)} opcoes={[{ valor: 'm', texto: 'Masculino' }, { valor: 'f', texto: 'Feminino' }]} />
      <Campo icone="vial" placeholder="Colesterol total (mg/dL, 130–320)" inputMode="decimal" valor={e.colesterolTotal} erro={erros.includes('colesterolTotal')} tentativa={tentativa} onChange={txt('colesterolTotal')} />
      <Campo icone="vial" placeholder="HDL (mg/dL, 20–100)" inputMode="decimal" valor={e.hdl} erro={erros.includes('hdl')} tentativa={tentativa} onChange={txt('hdl')} />
      <Campo icone="heartbeat" placeholder="Pressão sistólica (mmHg, 90–180)" inputMode="decimal" valor={e.pas} erro={erros.includes('pas')} tentativa={tentativa} onChange={txt('pas')} />
      <Campo icone="weight" placeholder="IMC (kg/m², 18,5–39,9)" inputMode="decimal" valor={e.imc} erro={erros.includes('imc')} tentativa={tentativa} onChange={txt('imc')} />
      <Campo icone="vial" placeholder="TFG estimada (mL/min/1,73 m², 15–140)" inputMode="decimal" valor={e.egfr} erro={erros.includes('egfr')} tentativa={tentativa} onChange={txt('egfr')} />
      <Campo icone="vial" placeholder="Albuminúria – ACR (mg/g) — opcional" inputMode="decimal" valor={e.uacr} erro={erros.includes('uacr')} tentativa={tentativa} onChange={txt('uacr')} />
      <Marcar rotulo="Em tratamento para hipertensão" marcado={e.tratamentoHas} onChange={(v) => mudar('tratamentoHas', v)} />
      <Marcar rotulo="Em uso de estatina" marcado={e.estatina} onChange={(v) => mudar('estatina', v)} />
      <Marcar rotulo="Diabetes" marcado={e.diabetes} onChange={(v) => mudar('diabetes', v)} />
      <Marcar rotulo="Fumante atual" marcado={e.fumante} onChange={(v) => mudar('fumante', v)} />
      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={calcular}>Calcular</BotaoPrimario>
        <BotaoSecundario onClick={() => { setE(VAZIO); setErros([]); setTexto(''); setErro(false); }}>Limpar</BotaoSecundario>
      </div>
      {texto && <CartaoResultado texto={texto} cor={erro ? colors.inputError : colors.resultText} />}
    </CalculadoraLayout>
  );
}
