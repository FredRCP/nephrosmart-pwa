'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { calcularAnionGap } from '@/lib/clinical/acidobase';
import { normalizarNumero } from '@/lib/clinical/numeros';
import { gravarLocal } from '@/lib/storage';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import AvisosCalculadora from '@/components/ui/AvisosCalculadora';
import Campo from '@/components/ui/Campo';
import Icone from '@/components/ui/Icone';
import { BlocoMono, TituloInfo } from '@/components/ui/InfoDialog';

const VAZIO = { na: '', cl: '', hco3: '', k: '', albumina: '', refMin: '', refMax: '' };

export default function AnionGapCalculator() {
  const { colors } = useTheme();
  const [v, setV] = useState(VAZIO);
  const [comK, setComK] = useState(false);
  const [corrigir, setCorrigir] = useState(false);
  const [refLab, setRefLab] = useState(false);
  const [erros, setErros] = useState<string[]>([]);
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState('');
  const [cor, setCor] = useState('#22c55e');
  const [avisos, setAvisos] = useState<string[]>([]);

  const set = (campo: keyof typeof VAZIO) => (t: string) => { setV((x) => ({ ...x, [campo]: normalizarNumero(t) })); setErros((e) => e.filter((c) => c !== campo)); };

  const calcular = () => {
    const r = calcularAnionGap({ ...v, comK, corrigir, refMin: refLab ? v.refMin : '', refMax: refLab ? v.refMax : '' });
    setTentativa((t) => t + 1);
    if (!r.ok) { setErros(r.campos); setResultado(r.mensagem); setCor(colors.inputError); setAvisos([]); return; }
    setErros([]); setResultado(r.texto); setAvisos(r.avisos);
    setCor(r.classe === 'normal' ? '#22c55e' : r.classe === 'alto' ? '#ef4444' : '#f59e0b');
    gravarLocal('ultimoAnionGap', r.valor.toString());
  };
  const limpar = () => { setV(VAZIO); setComK(false); setCorrigir(false); setRefLab(false); setErros([]); setResultado(''); setAvisos([]); };

  const marca = (rotulo: string, on: boolean, set_: (b: boolean) => void) => (
    <label className="mb-3 flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold" style={{ backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}`, color: colors.text }}>
      <input type="checkbox" checked={on} onChange={(e) => set_(e.target.checked)} className="size-5" />{rotulo}
    </label>
  );

  return (
    <CalculadoraLayout titulo="Anion Gap" info={
      <>
        <TituloInfo>Fórmula</TituloInfo>
        <BlocoMono>{'AG = Na⁺ − (Cl⁻ + HCO₃⁻)\nCom K⁺: AG = (Na⁺ + K⁺) − (Cl⁻ + HCO₃⁻)\nCorreção: AG corrigido = AG + 2,5 × (4,0 − albumina)'}</BlocoMono>
        <TituloInfo>Valores de referência</TituloInfo>
        <ul className="space-y-1">
          <li>• Padrão do app: sem K⁺ 6–12 mEq/L; com K⁺ 10–16 mEq/L.</li>
          <li>• Com eletrodos íon-seletivos (os usados hoje) a faixa é mais baixa que a clássica 8–12 e muda com o método (valores publicados vão de ~3–11 a ~8–15). Se o seu laboratório informa a faixa, marque "Usar a faixa de referência do meu laboratório".</li>
          <li>• AG &gt; 20: quase sempre patológico.</li>
          <li>• Cada 1 g/dL de albumina abaixo de 4 reduz o AG em ~2,5 mEq/L: corrija sempre que a albumina estiver baixa.</li>
          <li>• Na DRC o fosfato elevado também aumenta o AG; não existe correção validada para isso.</li>
        </ul>
        <TituloInfo>AG elevado — causas (GOLDMARK)</TituloInfo>
        <ul className="space-y-1"><li>• Glicóis (etilenoglicol, propilenoglicol), 5-oxoprolina, L-lactato, D-lactato, metanol, aspirina/salicilato, insuficiência renal, cetoacidose</li></ul>
        <TituloInfo>Referências</TituloInfo>
        <ul className="space-y-1"><li>• Berend K, de Vries APJ, Gans ROB. N Engl J Med 2014;371:1434</li><li>• Mehta AN, Emmett JB, Emmett M. GOLD MARK. Lancet 2008;372:892</li><li>• Sadjadi SA et al. Int J Nephrol Renovasc Dis 2013;6:101</li><li>• Figge J et al. Crit Care Med 1998;26:1807</li></ul>
      </>
    }>
      <Campo icone="vial" placeholder="Sódio (mEq/L)" inputMode="decimal" valor={v.na} erro={erros.includes('na')} tentativa={tentativa} onChange={set('na')} />
      <Campo icone="vial" placeholder="Cloreto (mEq/L)" inputMode="decimal" valor={v.cl} erro={erros.includes('cl')} tentativa={tentativa} onChange={set('cl')} />
      <Campo icone="vial" placeholder="Bicarbonato (mEq/L)" inputMode="decimal" valor={v.hco3} erro={erros.includes('hco3')} tentativa={tentativa} onChange={set('hco3')} />
      {marca('Incluir potássio (K⁺)', comK, setComK)}
      {comK && <Campo icone="vial" placeholder="Potássio (mEq/L)" inputMode="decimal" valor={v.k} erro={erros.includes('k')} tentativa={tentativa} onChange={set('k')} />}
      {marca('Corrigir para albumina', corrigir, setCorrigir)}
      {corrigir && <Campo icone="vial" placeholder="Albumina (g/dL)" inputMode="decimal" valor={v.albumina} erro={erros.includes('albumina')} tentativa={tentativa} onChange={set('albumina')} />}
      {marca('Usar a faixa de referência do meu laboratório', refLab, setRefLab)}
      {refLab && <>
        <Campo icone="vial" placeholder="Referência do AG: mínimo (mEq/L)" inputMode="decimal" valor={v.refMin} erro={erros.includes('ref')} tentativa={tentativa} onChange={set('refMin')} />
        <Campo icone="vial" placeholder="Referência do AG: máximo (mEq/L)" inputMode="decimal" valor={v.refMax} erro={erros.includes('ref')} tentativa={tentativa} onChange={set('refMax')} />
      </>}
      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={calcular}>Calcular</BotaoPrimario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>
      <AvisosCalculadora avisos={avisos} />
      {resultado && <CartaoResultado texto={resultado} cor={cor} />}
    </CalculadoraLayout>
  );
}
