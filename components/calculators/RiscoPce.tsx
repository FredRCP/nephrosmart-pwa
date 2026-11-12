'use client';

import { useState, type ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { calcularPce, type EntradaPce } from '@/lib/clinical/escores';
import { normalizarNumero } from '@/lib/clinical/numeros';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import Campo from '@/components/ui/Campo';
import Escolha from '@/components/ui/Escolha';
import { TituloInfo } from '@/components/ui/InfoDialog';

const VAZIO: EntradaPce = { idade: '', sexo: '', grupo: 'branco-outros', colesterolTotal: '', hdl: '', pas: '', tratamentoHas: false, fumante: false, diabetes: false };

function Marcar({ rotulo, marcado, onChange }: { rotulo: string; marcado: boolean; onChange: (v: boolean) => void }) {
  const { colors } = useTheme();
  return (
    <label className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-base" style={{ backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}`, color: colors.text }}>
      <input type="checkbox" checked={marcado} onChange={(e) => onChange(e.target.checked)} className="size-5" />
      <span>{rotulo}</span>
    </label>
  );
}

export default function RiscoPce({ topo }: { topo?: ReactNode }) {
  const { colors } = useTheme();
  const [e, setE] = useState<EntradaPce>(VAZIO);
  const [erros, setErros] = useState<string[]>([]);
  const [tentativa, setTentativa] = useState(0);
  const [texto, setTexto] = useState('');
  const [cor, setCor] = useState(colors.resultText);
  const mudar = <K extends keyof EntradaPce>(k: K, v: EntradaPce[K]) => { setE((x) => ({ ...x, [k]: v })); setErros((l) => l.filter((c) => c !== k)); setTexto(''); };
  const txt = (k: 'idade' | 'colesterolTotal' | 'hdl' | 'pas') => (t: string) => mudar(k, normalizarNumero(t));

  const calcular = () => {
    setTentativa((t) => t + 1);
    const r = calcularPce(e);
    if (!r.ok) { setErros(r.campos); setTexto(r.mensagem); setCor(colors.inputError); return; }
    setErros([]);
    setTexto(`Risco de ASCVD em 10 anos: ${r.risco.toFixed(1).replace('.', ',')}%\nFaixa: ${r.rotulo}`);
    setCor(r.faixa === 'baixo' ? '#16a34a' : r.faixa === 'limitrofe' ? '#ca8a04' : r.faixa === 'intermediario' ? '#ea580c' : '#dc2626');
  };

  return (
    <CalculadoraLayout titulo="Risco Cardiovascular" info={
      <>
        <TituloInfo>Pooled Cohort Equations (ACC/AHA 2013)</TituloInfo>
        <p>Estima o risco em 10 anos de um primeiro evento aterosclerótico (infarto não fatal, morte coronária ou AVC) em adultos de 40 a 79 anos, sem doença cardiovascular estabelecida.</p>
        <TituloInfo>Faixas (diretriz AHA/ACC 2018)</TituloInfo>
        <ul className="space-y-1"><li>• Baixo: &lt; 5%</li><li>• Limítrofe: 5% a &lt; 7,5%</li><li>• Intermediário: 7,5% a &lt; 20%</li><li>• Alto: ≥ 20%</li></ul>
        <TituloInfo>Limitações</TituloInfo>
        <ul className="space-y-1">
          <li>• Desenvolvido sem pacientes com DRC avançada ou em diálise; na DRC o risco costuma ser subestimado. Considere a DRC como fator que aumenta o risco.</li>
          <li>• Só há equações para &quot;brancos/outros&quot; e afro-americanos (coorte norte-americana); em outras populações pode super ou subestimar.</li>
          <li>• Não se aplica a quem já teve evento cardiovascular nem a menores de 40 ou maiores de 79 anos.</li>
          <li>• O PREVENT (AHA 2023), que inclui TFG e dispensa raça, é a equação mais recente e está na outra aba desta ferramenta.</li>
        </ul>
        <TituloInfo>Referências</TituloInfo>
        <ul className="space-y-1">
          <li>• Goff DC Jr et al. 2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk. Circulation 2014;129(25 Suppl 2):S49–S73.</li>
          <li>• Grundy SM et al. 2018 AHA/ACC Cholesterol Guideline. Circulation 2019;139:e1082–e1143.</li>
          <li>• Khan SS et al. PREVENT equations. Circulation 2024;149:430–449.</li>
        </ul>
      </>
    }>
      {topo}
      <Campo icone="calendar-alt" placeholder="Idade (40–79 anos)" inputMode="numeric" valor={e.idade} erro={erros.includes('idade')} tentativa={tentativa} onChange={txt('idade')} />
      <Escolha rotulo="Sexo" valor={e.sexo} erro={erros.includes('sexo')} onChange={(v) => mudar('sexo', v)} opcoes={[{ valor: 'm', texto: 'Masculino' }, { valor: 'f', texto: 'Feminino' }]} />
      <Escolha rotulo="Equação" valor={e.grupo} onChange={(v) => mudar('grupo', v)} opcoes={[{ valor: 'branco-outros', texto: 'Brancos/outros' }, { valor: 'afro', texto: 'Afro-americanos' }]} />
      <Campo icone="vial" placeholder="Colesterol total (mg/dL, 130–320)" inputMode="decimal" valor={e.colesterolTotal} erro={erros.includes('colesterolTotal')} tentativa={tentativa} onChange={txt('colesterolTotal')} />
      <Campo icone="vial" placeholder="HDL (mg/dL, 20–100)" inputMode="decimal" valor={e.hdl} erro={erros.includes('hdl')} tentativa={tentativa} onChange={txt('hdl')} />
      <Campo icone="heartbeat" placeholder="Pressão sistólica (mmHg, 90–200)" inputMode="decimal" valor={e.pas} erro={erros.includes('pas')} tentativa={tentativa} onChange={txt('pas')} />
      <Marcar rotulo="Em tratamento para hipertensão" marcado={e.tratamentoHas} onChange={(v) => mudar('tratamentoHas', v)} />
      <Marcar rotulo="Fumante atual" marcado={e.fumante} onChange={(v) => mudar('fumante', v)} />
      <Marcar rotulo="Diabetes" marcado={e.diabetes} onChange={(v) => mudar('diabetes', v)} />
      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={calcular}>Calcular</BotaoPrimario>
        <BotaoSecundario onClick={() => { setE(VAZIO); setErros([]); setTexto(''); }}>Limpar</BotaoSecundario>
      </div>
      {texto && <CartaoResultado texto={texto} cor={cor} />}
    </CalculadoraLayout>
  );
}
