'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { glasgow } from '@/lib/clinical/escores';
import CalculadoraLayout, { BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import { TituloInfo } from '@/components/ui/InfoDialog';

const GRUPOS = [
  { id: 'ocular', titulo: 'Abertura ocular', opcoes: [[4, 'Espontânea'], [3, 'Ao comando verbal'], [2, 'À dor'], [1, 'Nenhuma']] },
  { id: 'verbal', titulo: 'Resposta verbal', opcoes: [[5, 'Orientado'], [4, 'Confuso'], [3, 'Palavras inapropriadas'], [2, 'Sons incompreensíveis'], [1, 'Nenhuma']] },
  { id: 'motora', titulo: 'Resposta motora', opcoes: [[6, 'Obedece comandos'], [5, 'Localiza estímulo doloroso'], [4, 'Retirada ao estímulo'], [3, 'Flexão anormal (decorticação)'], [2, 'Extensão anormal (descerebração)'], [1, 'Nenhuma']] },
] as const;
type Id = (typeof GRUPOS)[number]['id'];

export default function Glasgow() {
  const { colors } = useTheme();
  const [v, setV] = useState<Record<Id, number | null>>({ ocular: null, verbal: null, motora: null });
  const r = v.ocular && v.verbal && v.motora ? glasgow(v.ocular, v.verbal, v.motora) : null;
  const cor = r ? (r.classe === 'leve' ? '#16a34a' : r.classe === 'moderado' ? '#d97706' : '#dc2626') : colors.resultText;

  return (
    <CalculadoraLayout titulo="Escala de Coma de Glasgow" info={
      <>
        <TituloInfo>Finalidade</TituloInfo>
        <p>Quantifica o nível de consciência: 3 (coma profundo) a 15 (alerta). Soma de abertura ocular (1–4), resposta verbal (1–5) e resposta motora (1–6).</p>
        <TituloInfo>Interpretação</TituloInfo>
        <ul className="space-y-1"><li>• 13–15: leve</li><li>• 9–12: moderado</li><li>• 3–8: grave</li></ul>
        <TituloInfo>Limitações</TituloInfo>
        <ul className="space-y-1">
          <li>• Não avalia pupilas, reflexos de tronco nem respiração.</li>
          <li>• Em intubados, afásicos ou sedados a resposta verbal não é avaliável: registre os componentes separadamente (ex.: E3 VT M5) em vez de forçar um total.</li>
          <li>• Registre sempre os três componentes, não só o total, e reavalie seriadamente.</li>
        </ul>
        <TituloInfo>Referências</TituloInfo>
        <ul className="space-y-1"><li>• Teasdale G, Jennett B. Assessment of coma and impaired consciousness. Lancet 1974;2:81–84.</li></ul>
      </>
    }>
      {GRUPOS.map((g) => (
        <fieldset key={g.id} className="mb-3 rounded-xl p-3" style={{ backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}` }}>
          <legend className="px-1 text-base font-bold" style={{ color: colors.text }}>{g.titulo}</legend>
          {g.opcoes.map(([pts, texto]) => (
            <label key={pts} className="flex items-center gap-3 py-1.5 text-base" style={{ color: colors.text }}>
              <input type="radio" name={g.id} checked={v[g.id] === pts} onChange={() => setV((x) => ({ ...x, [g.id]: pts }))} className="size-5" />
              <span>{texto} ({pts} {pts === 1 ? 'ponto' : 'pontos'})</span>
            </label>
          ))}
        </fieldset>
      ))}
      <div className="mt-2 flex justify-center"><BotaoSecundario onClick={() => setV({ ocular: null, verbal: null, motora: null })}>Limpar</BotaoSecundario></div>
      {r ? <CartaoResultado texto={`Glasgow: ${r.total} (${r.resumo})\nInterpretação: ${r.rotulo}`} cor={cor} />
        : <p className="mt-4 text-center text-sm" style={{ color: colors.text }}>Selecione um item em cada grupo para ver o resultado.</p>}
    </CalculadoraLayout>
  );
}
