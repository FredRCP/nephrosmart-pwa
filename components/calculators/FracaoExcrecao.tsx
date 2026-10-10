'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { CONFIG_FE, calcularFE, type ClasseFE, type ContextoK, type TipoFE } from '@/lib/clinical/fracoes';
import { normalizarNumero } from '@/lib/clinical/numeros';
import { gravarLocal } from '@/lib/storage';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import AvisosCalculadora from '@/components/ui/AvisosCalculadora';
import Campo from '@/components/ui/Campo';
import Escolha from '@/components/ui/Escolha';
import Icone from '@/components/ui/Icone';
import { BlocoMono, TituloInfo } from '@/components/ui/InfoDialog';

const VAZIO = { uSoluto: '', sSoluto: '', uCr: '', sCr: '' };
const NOME_SOLUTO: Record<TipoFE, string> = { sodio: 'Sódio', ureia: 'Ureia', potassio: 'Potássio', calcio: 'Cálcio', fosforo: 'Fósforo', 'acido-urico': 'Ácido úrico', magnesio: 'Magnésio' };
const COR_CLASSE: Record<ClasseFE, string> = { baixa: '#3b82f6', intermediaria: '#f59e0b', alta: '#ef4444', 'sem-corte': '#64748b' };

/** Calculadora única para as 7 frações de excreção; o tipo escolhe o soluto, os cortes e os textos. */
export default function FracaoExcrecao({ tipo }: { tipo: TipoFE }) {
  const cfg = CONFIG_FE[tipo];
  const { colors } = useTheme();
  const [v, setV] = useState(VAZIO);
  const [contexto, setContexto] = useState<ContextoK>('hipocalemia');
  const [erros, setErros] = useState<string[]>([]);
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState('');
  const [cor, setCor] = useState('#22c55e');
  const [avisos, setAvisos] = useState<string[]>([]);

  const set = (c: keyof typeof VAZIO) => (t: string) => { setV((x) => ({ ...x, [c]: normalizarNumero(t) })); setErros((e) => e.filter((k) => k !== c)); };

  const calcular = () => {
    const r = calcularFE({ tipo, ...v, contexto });
    setTentativa((t) => t + 1);
    if (!r.ok) { setErros(r.campos); setResultado(r.mensagem); setCor(colors.inputError); setAvisos([]); return; }
    setErros([]); setResultado(r.texto); setAvisos(r.avisos); setCor(COR_CLASSE[r.classe]);
    gravarLocal(cfg.chave, r.valor.toString());
  };
  const limpar = () => { setV(VAZIO); setErros([]); setResultado(''); setAvisos([]); };

  return (
    <CalculadoraLayout titulo={cfg.nome} infoTitulo={`${cfg.sigla} — informações`} info={
      <>
        <TituloInfo>Fórmula</TituloInfo>
        <BlocoMono>{cfg.formula}</BlocoMono>
        <TituloInfo>Pontos de corte</TituloInfo>
        <ul className="space-y-1">{cfg.referenciaTexto.map((t) => <li key={t}>• {t}</li>)}</ul>
        <TituloInfo>Quando usar</TituloInfo>
        <ul className="space-y-1">{cfg.usos.map((t) => <li key={t}>• {t}</li>)}</ul>
        <TituloInfo>Limitações</TituloInfo>
        <ul className="space-y-1">{cfg.limites.map((t) => <li key={t}>• {t}</li>)}</ul>
        <TituloInfo>Referências</TituloInfo>
        <ul className="space-y-1">{cfg.fontes.map((t) => <li key={t}>• {t}</li>)}</ul>
      </>
    }>
      {tipo === 'potassio' && (
        <Escolha<ContextoK> rotulo="Contexto clínico" valor={contexto} onChange={setContexto}
          opcoes={[{ valor: 'hipocalemia', texto: 'Hipocalemia' }, { valor: 'hipercalemia', texto: 'Hipercalemia' }]} />
      )}
      <Campo icone="flask" placeholder={`${NOME_SOLUTO[tipo]} urinário (${cfg.unidade})`} inputMode="decimal" valor={v.uSoluto} erro={erros.includes('uSoluto')} tentativa={tentativa} onChange={set('uSoluto')} />
      <Campo icone="vial" placeholder={`${NOME_SOLUTO[tipo]} sérico (${cfg.unidade})`} inputMode="decimal" valor={v.sSoluto} erro={erros.includes('sSoluto')} tentativa={tentativa} onChange={set('sSoluto')} />
      <Campo icone="flask" placeholder="Creatinina urinária (mg/dL)" inputMode="decimal" valor={v.uCr} erro={erros.includes('uCr')} tentativa={tentativa} onChange={set('uCr')} />
      <Campo icone="vial" placeholder="Creatinina sérica (mg/dL)" inputMode="decimal" valor={v.sCr} erro={erros.includes('sCr')} tentativa={tentativa} onChange={set('sCr')} dica="Use a mesma unidade na urina e no sangue para cada substância." />
      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={calcular}>Calcular</BotaoPrimario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>
      <AvisosCalculadora avisos={avisos} />
      {resultado && <CartaoResultado texto={resultado} cor={cor} />}
    </CalculadoraLayout>
  );
}
