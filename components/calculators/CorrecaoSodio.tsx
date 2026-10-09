'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { corrigirHiponatremia, corrigirHipernatremia, naCorrigidoGlicose, type SexoSodio, type SolucaoHipo, type SolucaoHiper } from '@/lib/clinical/sodio';
import { normalizarNumero } from '@/lib/clinical/numeros';
import { gravarLocal, lerLocal } from '@/lib/storage';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import AvisosCalculadora from '@/components/ui/AvisosCalculadora';
import Campo from '@/components/ui/Campo';
import Escolha from '@/components/ui/Escolha';
import Icone from '@/components/ui/Icone';
import { BlocoMono, TituloInfo } from '@/components/ui/InfoDialog';

const VAZIO = { naAtual: '', naDesejado: '', peso: '', idade: '', perdas: '', glicose: '' };
type Direcao = 'hipo' | 'hiper';

/** Correção de Na⁺ (hiponatremia e hipernatremia). Mesma estrutura; muda a fórmula, as soluções e os limites. */
export default function CorrecaoSodio({ direcao }: { direcao: Direcao }) {
  const { colors } = useTheme();
  const hipo = direcao === 'hipo';
  const chave = hipo ? 'ultimoResultadoHiponatremia' : 'ultimoResultadoHipernatremia';
  const [sexo, setSexo] = useState<SexoSodio>('female');
  const [tipo, setTipo] = useState<'aguda' | 'cronica'>('cronica');
  const [solHipo, setSolHipo] = useState<SolucaoHipo>('nacl3');
  const [solHiper, setSolHiper] = useState<SolucaoHiper>('sg5');
  const [altoRisco, setAltoRisco] = useState(false);
  const [v, setV] = useState(VAZIO);
  const [erros, setErros] = useState<string[]>([]);
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState('');
  const [cor, setCor] = useState('#22c55e');
  const [avisos, setAvisos] = useState<string[]>([]);
  const [temSalvo, setTemSalvo] = useState(false);
  const [glicTexto, setGlicTexto] = useState('');
  useEffect(() => { setTemSalvo(lerLocal(chave) !== null); }, [chave]);

  const set = (c: keyof typeof VAZIO) => (t: string) => { setV((x) => ({ ...x, [c]: normalizarNumero(t) })); setErros((e) => e.filter((k) => k !== c)); };

  const calcular = () => {
    const base = { naAtual: v.naAtual, naDesejado: v.naDesejado, peso: v.peso, idade: v.idade, sexo, tipo };
    const r = hipo
      ? corrigirHiponatremia({ ...base, solucao: solHipo, altoRisco })
      : corrigirHipernatremia({ ...base, solucao: solHiper, perdasMlDia: v.perdas });
    setTentativa((t) => t + 1);
    if (!r.ok) { setErros(r.campos); setResultado(r.mensagem); setCor(colors.inputError); setAvisos([]); return; }
    setErros([]); setAvisos(r.avisos); setResultado(r.texto);
    setCor(r.neonato ? colors.inputError : '#22c55e');
    gravarLocal(chave, JSON.stringify({ texto: r.texto, avisos: r.avisos })); setTemSalvo(true);
  };
  const recarregar = () => {
    try {
      const s = JSON.parse(lerLocal(chave) ?? 'null') as { texto: string; avisos: string[] } | null;
      if (!s) { setResultado('Nenhum resultado salvo anteriormente.'); setCor(colors.inputError); setAvisos([]); return; }
      setResultado(s.texto); setAvisos(s.avisos ?? []); setCor('#22c55e');
    } catch { setResultado('Falha ao carregar os dados salvos.'); setCor(colors.inputError); }
  };
  const limpar = () => { setV(VAZIO); setErros([]); setResultado(''); setAvisos([]); setSexo('female'); setTipo('cronica'); setAltoRisco(false); setSolHipo('nacl3'); setSolHiper('sg5'); setGlicTexto(''); };

  const glic = hipo && glicTexto ? naCorrigidoGlicose(v.naAtual, glicTexto) : null;

  return (
    <CalculadoraLayout titulo={hipo ? 'Correção de Hiponatremia' : 'Correção de Hipernatremia'} info={
      <>
        <TituloInfo>Fórmula de Adrogué–Madias</TituloInfo>
        <BlocoMono>{'ΔNa por litro = (Na da solução − Na sérico) / (ACT + 1)\nACT = peso × fração (criança 0,6; H 0,6; M 0,5; idoso H 0,5 / M 0,45)'}</BlocoMono>
        {hipo ? (
          <>
            <TituloInfo>Limites de correção em 24 h</TituloInfo>
            <ul className="space-y-1">
              <li>• Meta habitual: 6–8 mEq/L.</li>
              <li>• Máximo: 8 mEq/L se alto risco de ODS (Na ≤ 105, hipocalemia, alcoolismo, desnutrição, hepatopatia) ou criança; 10 nos demais.</li>
              <li>• Sintomas graves: NaCl 3% 100–150 mL em 10–20 min, até 2 repetições, meta de +4–6 mEq/L.</li>
              <li>• Soluções: NaCl 0,9% (154 mEq/L) e NaCl 3% (513 mEq/L).</li>
            </ul>
          </>
        ) : (
          <>
            <TituloInfo>Limites de correção em 24 h</TituloInfo>
            <ul className="space-y-1">
              <li>• Não reduzir mais que 0,5 mEq/L/h (crônica); máximo de 10 mEq/L (crônica), 12 (aguda), 8 em crianças.</li>
              <li>• Soluções: SG 5% (0 mEq/L) e NaCl 0,45% (77 mEq/L). Prefira água livre VO/enteral quando possível.</li>
              <li>• Informe as perdas contínuas (mL/dia) para somá-las ao volume.</li>
            </ul>
          </>
        )}
        <TituloInfo>Limitações</TituloInfo>
        <ul className="space-y-1"><li>• Estimativa: ignora perdas ativas e potássio. Confirme com Na⁺ seriado (2–4 h no início).</li><li>• Neonatos/lactentes &lt; 1 ano: não validado.</li></ul>
        <TituloInfo>Referências</TituloInfo>
        <ul className="space-y-1"><li>• Adrogué HJ, Madias NE. N Engl J Med 2000;342:1493 e 1581</li><li>• Spasovski G et al. Eur J Endocrinol 2014</li><li>• Sterns RH. CJASN 2024</li></ul>
      </>
    }>
      <Escolha rotulo="Tempo de instalação" valor={tipo} onChange={setTipo} opcoes={[{ valor: 'aguda', texto: 'Aguda (< 48 h)' }, { valor: 'cronica', texto: 'Crônica / desconhecida' }]} />
      {hipo
        ? <Escolha rotulo="Solução" valor={solHipo} onChange={setSolHipo} opcoes={[{ valor: 'nacl3', texto: 'NaCl 3%' }, { valor: 'nacl09', texto: 'NaCl 0,9%' }]} />
        : <Escolha rotulo="Solução" valor={solHiper} onChange={setSolHiper} opcoes={[{ valor: 'sg5', texto: 'SG 5%' }, { valor: 'nacl045', texto: 'NaCl 0,45%' }]} />}
      <Escolha rotulo="Sexo" valor={sexo} onChange={setSexo} opcoes={[{ valor: 'male', texto: 'Homem' }, { valor: 'female', texto: 'Mulher' }]} />
      {hipo && (
        <label className="mb-3 flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold" style={{ backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}`, color: colors.text }}>
          <input type="checkbox" checked={altoRisco} onChange={(e) => setAltoRisco(e.target.checked)} className="size-5" />Alto risco de ODS (limite de 8 mEq/L)
        </label>
      )}
      <Campo icone="vial" placeholder="Sódio atual (mEq/L)" dica={hipo ? 'Entre 50 e 135' : 'Acima de 145'} inputMode="decimal" valor={v.naAtual} erro={erros.includes('naAtual')} tentativa={tentativa} onChange={set('naAtual')} />
      <Campo icone="vial" placeholder="Sódio desejado (mEq/L)" dica={hipo ? 'Maior que o atual (máx. 145)' : 'Entre 135 e o valor atual'} inputMode="decimal" valor={v.naDesejado} erro={erros.includes('naDesejado')} tentativa={tentativa} onChange={set('naDesejado')} />
      <Campo icone="weight" placeholder="Peso (kg)" inputMode="decimal" valor={v.peso} erro={erros.includes('peso')} tentativa={tentativa} onChange={set('peso')} />
      <Campo icone="calendar-alt" placeholder="Idade (anos)" inputMode="decimal" valor={v.idade} erro={erros.includes('idade')} tentativa={tentativa} onChange={set('idade')} />
      {!hipo && <Campo icone="flask" placeholder="Perdas contínuas (mL/dia) — opcional" inputMode="decimal" valor={v.perdas} erro={erros.includes('perdas')} tentativa={tentativa} onChange={set('perdas')} />}
      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={calcular}>Calcular</BotaoPrimario>
        <BotaoSecundario onClick={recarregar} aria-label="Recarregar último resultado">
          <span className="relative"><Icone nome="history" tamanho={20} cor={colors.buttonText} />{temSalvo && <span className="absolute -right-2 -top-2 size-2 rounded-full bg-green-500" />}</span>
        </BotaoSecundario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>
      <AvisosCalculadora avisos={avisos} />
      {resultado && <CartaoResultado texto={resultado} cor={cor} />}
      {hipo && (
        <div className="mt-8 rounded-xl p-4" style={{ backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}` }}>
          <p className="mb-2 text-base font-bold" style={{ color: colors.text }}>Na⁺ corrigido pela glicose</p>
          <p className="mb-2 text-sm" style={{ color: colors.text, opacity: 0.75 }}>Usa o campo &quot;Sódio atual&quot; acima. Fator 1,6 por 100 mg/dL acima de 100 (2,4 se glicose &gt; 400).</p>
          <Campo icone="flask" placeholder="Glicose (mg/dL)" inputMode="decimal" valor={glicTexto} onChange={(t) => setGlicTexto(normalizarNumero(t))} />
          {glic && (glic.ok
            ? <p role="status" className="whitespace-pre-line text-center text-base font-semibold" style={{ color: colors.resultText }}>{glic.texto}</p>
            : <p className="text-center text-sm" style={{ color: colors.inputError }}>Informe um sódio e uma glicose válidos.</p>)}
        </div>
      )}
    </CalculadoraLayout>
  );
}
