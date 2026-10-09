'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { calcularIngestaoSodio, type ClasseIngestao } from '@/lib/clinical/sodio';
import { normalizarNumero } from '@/lib/clinical/numeros';
import { gravarLocal } from '@/lib/storage';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import Campo from '@/components/ui/Campo';
import Icone from '@/components/ui/Icone';
import { BlocoMono, TituloInfo } from '@/components/ui/InfoDialog';

const COR: Record<ClasseIngestao, string> = { baixa: '#22c55e', adequada: '#3b82f6', moderada: '#f59e0b', alta: '#ef4444' };

export default function IngestaoSodio() {
  const { colors } = useTheme();
  const [na, setNa] = useState('');
  const [vol, setVol] = useState('');
  const [erros, setErros] = useState<string[]>([]);
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState('');
  const [cor, setCor] = useState('#22c55e');
  const [comentario, setComentario] = useState('');
  const [mostrar, setMostrar] = useState(false);

  const calcular = () => {
    const r = calcularIngestaoSodio(na, vol);
    setTentativa((t) => t + 1);
    if (!r.ok) { setErros(r.campos); setResultado(r.mensagem); setCor(colors.inputError); setComentario(''); return; }
    setErros([]); setResultado(r.texto); setCor(COR[r.classe]); setComentario(r.comentario);
    gravarLocal('lastUrineSodium', na); gravarLocal('lastUrineVolume', vol);
    gravarLocal('ultimoSodiumIntake', r.salG.toString()); // mesma chave do app original (g de NaCl/dia)
  };
  const limpar = () => { setNa(''); setVol(''); setErros([]); setResultado(''); setComentario(''); setMostrar(false); };

  return (
    <CalculadoraLayout titulo="Ingestão Diária de Sódio" info={
      <>
        <TituloInfo>Como é calculado</TituloInfo>
        <BlocoMono>{'Na urinário (mEq/24 h) = Na urinário (mEq/L) × volume (L/24 h)\nSódio (g/dia) = mEq × 0,023\nSal NaCl (g/dia) = mEq × 0,0585'}</BlocoMono>
        <TituloInfo>Metas</TituloInfo>
        <ul className="space-y-1">
          <li>• OMS e KDIGO 2024: &lt; 2 g de sódio por dia (≈ &lt; 5 g de sal).</li>
          <li>• 1 g de sódio = 2,5 g de sal. Não confundir sódio com sal.</li>
          <li>• Cerca de 90% do sódio ingerido aparece na urina; coleta incompleta subestima a ingestão.</li>
          <li>• Confirme a adequação da coleta pela creatinina urinária de 24 h.</li>
        </ul>
        <TituloInfo>Referências</TituloInfo>
        <ul className="space-y-1"><li>• OMS. Guideline: sodium intake for adults and children (2012)</li><li>• KDIGO 2024 CKD Guideline</li></ul>
      </>
    }>
      <Campo icone="flask" placeholder="Na urinário (mEq/L)" dica="10 a 500" inputMode="decimal" valor={na} erro={erros.includes('na')} tentativa={tentativa} onChange={(t) => { setNa(normalizarNumero(t)); setErros((e) => e.filter((k) => k !== 'na')); }} />
      <Campo icone="vial" placeholder="Volume urinário (L/24 h)" dica="0,5 a 5" inputMode="decimal" valor={vol} erro={erros.includes('volume')} tentativa={tentativa} onChange={(t) => { setVol(normalizarNumero(t)); setErros((e) => e.filter((k) => k !== 'volume')); }} />
      <label className="mb-3 flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold" style={{ backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}`, color: colors.text }}>
        <input type="checkbox" checked={mostrar} onChange={(e) => setMostrar(e.target.checked)} className="size-5" />Mostrar comentário clínico
      </label>
      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={calcular}>Calcular</BotaoPrimario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>
      {resultado && <CartaoResultado texto={mostrar && comentario ? `${resultado}\n\n${comentario}` : resultado} cor={cor} />}
    </CalculadoraLayout>
  );
}
