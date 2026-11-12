'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { calcularKfre, type EntradaKfre } from '@/lib/clinical/escores';
import { normalizarNumero } from '@/lib/clinical/numeros';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import Campo from '@/components/ui/Campo';
import Escolha from '@/components/ui/Escolha';
import { TituloInfo } from '@/components/ui/InfoDialog';

const VAZIO: EntradaKfre = { idade: '', sexo: '', egfr: '', acr: '', regiao: 'fora-america-norte' };

export default function RiscoProgressaoDrc() {
  const { colors } = useTheme();
  const [e, setE] = useState<EntradaKfre>(VAZIO);
  const [erros, setErros] = useState<string[]>([]);
  const [tentativa, setTentativa] = useState(0);
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState(false);
  const mudar = <K extends keyof EntradaKfre>(k: K, v: EntradaKfre[K]) => { setE((x) => ({ ...x, [k]: v })); setErros((l) => l.filter((c) => c !== k)); setTexto(''); };
  const txt = (k: 'idade' | 'egfr' | 'acr') => (t: string) => mudar(k, normalizarNumero(t));
  const pct = (n: number) => n.toFixed(1).replace('.', ',');

  const calcular = () => {
    setTentativa((t) => t + 1);
    const r = calcularKfre(e);
    if (!r.ok) { setErros(r.campos); setTexto(r.mensagem); setErro(true); return; }
    setErros([]); setErro(false);
    setTexto(`Risco de falência renal (diálise/transplante)\n• 2 anos: ${pct(r.risco2)}%\n• 5 anos: ${pct(r.risco5)}%${r.avisos.length ? '\n\n' + r.avisos.join('\n') : ''}`);
  };

  return (
    <CalculadoraLayout titulo="Risco de Progressão da DRC (KFRE)" info={
      <>
        <TituloInfo>Finalidade</TituloInfo>
        <p>A Kidney Failure Risk Equation (KFRE, 4 variáveis) estima o risco de falência renal tratada (diálise ou transplante) em 2 e 5 anos, a partir de idade, sexo, TFG estimada e relação albumina/creatinina urinária (mg/g).</p>
        <TituloInfo>Equação</TituloInfo>
        <p className="text-sm">Risco = 1 − S₀<sup>exp(L)</sup>, com L = −0,2201·(idade/10 − 7,036) + 0,2467·(masc − 0,5642) − 0,5567·(TFG/5 − 7,222) + 0,4510·(ln ACR − 5,137). S₀ (2 anos / 5 anos): 0,9750 / 0,9240 (América do Norte) e 0,9832 / 0,9365 (fora da América do Norte).</p>
        <TituloInfo>Limitações</TituloInfo>
        <ul className="space-y-1">
          <li>• Desenvolvida em DRC G3–G5 acompanhada por nefrologistas; não validada para TFG ≥ 60, menores de 18 anos, diálise ou transplante.</li>
          <li>• Fora da América do Norte, a calibração é diferente (opção padrão aqui); a acurácia em coortes brasileiras específicas pode variar.</li>
          <li>• Não considera mortalidade por outras causas (competing risk) nem etiologia da DRC.</li>
          <li>• O resultado apoia, não substitui, o julgamento clínico (encaminhamento, preparo de acesso, educação do paciente).</li>
        </ul>
        <TituloInfo>Referências</TituloInfo>
        <ul className="space-y-1">
          <li>• Tangri N et al. A predictive model for progression of CKD to kidney failure. JAMA 2011;305:1553–1559.</li>
          <li>• Tangri N et al. Multinational assessment of accuracy of equations for predicting risk of kidney failure. JAMA 2016;315:164–174.</li>
          <li>• KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of CKD.</li>
        </ul>
      </>
    }>
      <Campo icone="calendar-alt" placeholder="Idade (anos)" inputMode="decimal" valor={e.idade} erro={erros.includes('idade')} tentativa={tentativa} onChange={txt('idade')} />
      <Escolha rotulo="Sexo" valor={e.sexo} erro={erros.includes('sexo')} onChange={(v) => mudar('sexo', v)} opcoes={[{ valor: 'm', texto: 'Masculino' }, { valor: 'f', texto: 'Feminino' }]} />
      <Campo icone="vial" placeholder="TFG estimada (mL/min/1,73 m²)" inputMode="decimal" valor={e.egfr} erro={erros.includes('egfr')} tentativa={tentativa} onChange={txt('egfr')} />
      <Campo icone="vial" placeholder="Relação albumina/creatinina (mg/g)" inputMode="decimal" valor={e.acr} erro={erros.includes('acr')} tentativa={tentativa} onChange={txt('acr')} />
      <Escolha rotulo="Calibração" valor={e.regiao} onChange={(v) => mudar('regiao', v)} opcoes={[{ valor: 'fora-america-norte', texto: 'Fora da América do Norte' }, { valor: 'america-norte', texto: 'América do Norte' }]} />
      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={calcular}>Calcular</BotaoPrimario>
        <BotaoSecundario onClick={() => { setE(VAZIO); setErros([]); setTexto(''); setErro(false); }}>Limpar</BotaoSecundario>
      </div>
      {texto && <CartaoResultado texto={texto} cor={erro ? colors.inputError : colors.resultText} />}
    </CalculadoraLayout>
  );
}
