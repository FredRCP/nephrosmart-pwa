'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { calcularBicarbonato, TEXTO_CONC, corDoseBic, type ConcentracaoBic, type ModoBicarbonato } from '@/lib/clinical/acidobase';
import { normalizarNumero } from '@/lib/clinical/numeros';
import { gravarLocal, lerLocal } from '@/lib/storage';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import AvisosCalculadora from '@/components/ui/AvisosCalculadora';
import Campo from '@/components/ui/Campo';
import Escolha from '@/components/ui/Escolha';
import Icone from '@/components/ui/Icone';
import { BlocoMono, TituloInfo } from '@/components/ui/InfoDialog';

const VAZIO = { peso: '', bicAtual: '', bicDesejado: '', baseExcess: '' };

export default function BicarbonatoCalculator() {
  const { colors } = useTheme();
  const [modo, setModo] = useState<ModoBicarbonato>('padrao');
  const [v, setV] = useState(VAZIO);
  const [dose, setDose] = useState<'1' | '1.5' | '2'>('1.5');
  const [conc, setConc] = useState<ConcentracaoBic>('1');
  const [grave, setGrave] = useState(false);
  const [erros, setErros] = useState<string[]>([]);
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState('');
  const [cor, setCor] = useState('#22c55e');
  const [avisos, setAvisos] = useState<string[]>([]);
  const [temSalvo, setTemSalvo] = useState(false);
  useEffect(() => { setTemSalvo(lerLocal('ultimaDoseBicarb') !== null); }, []);

  const set = (c: keyof typeof VAZIO) => (t: string) => {
    // Base Excess aceita sinal negativo.
    const n = c === 'baseExcess' ? t.replace(',', '.').trim() : normalizarNumero(t);
    setV((x) => ({ ...x, [c]: n })); setErros((e) => e.filter((k) => k !== c));
  };

  const calcular = () => {
    const r = calcularBicarbonato({ modo, ...v, dose, concentracao: conc, grave });
    setTentativa((t) => t + 1);
    if (!r.ok) { setErros(r.campos); setResultado(r.mensagem); setCor(colors.inputError); setAvisos([]); return; }
    setErros([]); setResultado(r.texto); setCor(r.cor); setAvisos(r.avisos);
    gravarLocal('ultimaDoseBicarb', r.doseMeq.toString()); setTemSalvo(true);
  };
  const recarregar = () => {
    const d = parseFloat(lerLocal('ultimaDoseBicarb') ?? '');
    if (!Number.isFinite(d)) { setResultado('Nenhuma dose salva encontrada.'); setCor(colors.inputError); return; }
    const vol = d / parseFloat(conc);
    setResultado(`Última dose salva: ${d.toFixed(0)} mEq (${vol.toFixed(0)} mL de bicarbonato ${TEXTO_CONC[conc]})\nDivida em 3 doses de ${(d / 3).toFixed(0)} mEq (${(vol / 3).toFixed(0)} mL) a cada 8 horas, com infusão lenta, ou administrar em infusão contínua.`);
    setCor(corDoseBic(d)); setAvisos([]);
  };
  const limpar = () => { setV(VAZIO); setDose('1.5'); setConc('1'); setGrave(false); setErros([]); setResultado(''); setAvisos([]); };

  const campo = (c: keyof typeof VAZIO, ph: string, dica?: string) => (
    <Campo icone={c === 'peso' ? 'weight' : 'vial'} placeholder={ph} dica={dica} inputMode={c === 'baseExcess' ? 'text' : 'decimal'} valor={v[c]} erro={erros.includes(c)} tentativa={tentativa} onChange={set(c)} />
  );

  return (
    <CalculadoraLayout titulo="Reposição de Bicarbonato" info={
      <>
        <TituloInfo>Fórmulas (repõe 50% do déficit)</TituloInfo>
        <BlocoMono>{'Padrão: déficit = (HCO₃ desejado − atual) × peso × 0,4 (0,5 se grave)\nBase excess: déficit = |BE| × peso × 0,3 (0,5 se grave)\nEmpírica: 1, 1,5 ou 2 mEq/kg\nDose = 50% do déficit, em 3 tomadas a cada 8 h'}</BlocoMono>
        <TituloInfo>Quando repor</TituloInfo>
        <ul className="space-y-1">
          <li>• BICAR-ICU (Jaber, Lancet 2018): benefício em pH &lt; 7,20 com LRA grave (KDIGO 2–3). Sem benefício claro se pH ≥ 7,20.</li>
          <li>• Acidose láctica: não é rotina; trate a causa. CAD: só se pH &lt; 6,9.</li>
          <li>• DRC com HCO₃ persistentemente &lt; 22 mEq/L: bicarbonato oral (KDIGO 2024), não a via IV.</li>
        </ul>
        <TituloInfo>Cuidados</TituloInfo>
        <ul className="space-y-1"><li>• Sobrecarga de Na⁺/volume, hipocalcemia ionizada, hipocalemia e alcalose de rebote. Gasometria de controle.</li></ul>
      </>
    }>
      <Escolha rotulo="Método" valor={modo} onChange={setModo} opcoes={[{ valor: 'padrao', texto: 'HCO₃ atual/desejado' }, { valor: 'be', texto: 'Base excess' }, { valor: 'empirica', texto: 'Empírica (mEq/kg)' }]} />
      {campo('peso', 'Peso (kg)')}
      {modo === 'padrao' && <>{campo('bicAtual', 'HCO₃⁻ atual (mEq/L)')}{campo('bicDesejado', 'HCO₃⁻ desejado (mEq/L)', 'Maior que o atual (máx. 30)')}</>}
      {modo === 'be' && campo('baseExcess', 'Base excess (negativo, ex.: -10)')}
      {modo === 'empirica' && <Escolha rotulo="Dose (mEq/kg)" valor={dose} onChange={setDose} opcoes={[{ valor: '1', texto: '1' }, { valor: '1.5', texto: '1,5' }, { valor: '2', texto: '2' }]} />}
      {modo !== 'empirica' && (
        <label className="mb-3 flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold" style={{ backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}`, color: colors.text }}>
          <input type="checkbox" checked={grave} onChange={(e) => setGrave(e.target.checked)} className="size-5" />Acidose grave (usa espaço de distribuição 0,5)
        </label>
      )}
      <Escolha rotulo="Concentração" valor={conc} onChange={setConc} opcoes={[{ valor: '1', texto: '8,4% (1 mEq/mL)' }, { valor: '0.5', texto: '4,2% (0,5)' }, { valor: '0.1', texto: 'Diluída (0,1)' }]} />
      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={calcular}>Calcular</BotaoPrimario>
        <BotaoSecundario onClick={recarregar} aria-label="Recarregar última dose">
          <span className="relative"><Icone nome="history" tamanho={20} cor={colors.buttonText} />{temSalvo && <span className="absolute -right-2 -top-2 size-2 rounded-full bg-green-500" />}</span>
        </BotaoSecundario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>
      <AvisosCalculadora avisos={avisos} />
      {resultado && <CartaoResultado texto={resultado} cor={cor} />}
    </CalculadoraLayout>
  );
}
