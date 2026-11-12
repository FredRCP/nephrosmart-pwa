'use client';

import { useTheme } from '@/context/ThemeContext';
import LegalNote from '@/components/ui/LegalNote';
import InfoDialog, { BlocoMono, TituloInfo } from '@/components/ui/InfoDialog';

export default function Drpad() {
  const { colors } = useTheme();
  const cartao = { backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}`, color: colors.text };
  return (
    <div className="mx-auto w-full max-w-md pb-24">
      <h1 className="text-center text-2xl font-extrabold" style={{ color: colors.text }}>Doença Renal Policística Autossômica Dominante</h1>
      <LegalNote />
      <section className="mt-4 rounded-2xl p-4" style={cartao} aria-labelledby="drpad-dx">
        <h2 id="drpad-dx" className="text-lg font-bold">Diagnóstico por ultrassonografia (Pei 2009)</h2>
        <p className="mt-1 text-sm">Para indivíduos em risco (história familiar, genótipo desconhecido).</p>
        <BlocoMono>{`Idade     Critério positivo
15–39     ≥ 3 cistos (uni ou bilateral)
40–59     ≥ 2 cistos em cada rim
≥ 60      ≥ 4 cistos em cada rim`}</BlocoMono>
        <p className="font-semibold">Exclusão</p>
        <ul className="mt-1 space-y-1 text-sm">
          <li>• ≥ 40 anos: menos de 2 cistos exclui a doença.</li>
          <li>• 30–39 anos: ausência de qualquer cisto torna a exclusão quase certa.</li>
          <li>• 15–29 anos: o ultrassom exclui mal; considerar repetir o exame ou teste genético (ex.: potencial doador).</li>
        </ul>
      </section>
      <section className="mt-4 rounded-2xl p-4" style={cartao} aria-labelledby="drpad-mayo">
        <h2 id="drpad-mayo" className="text-lg font-bold">Classificação por imagem de Mayo</h2>
        <p className="mt-1 text-sm">Estima a velocidade de progressão na DRPAD típica (classe 1) com base no volume renal total ajustado pela altura (htTKV, RM ou TC) e na idade: classes 1A (crescimento mais lento) a 1E (mais rápido). As classes 1C–1E indicam progressão rápida.</p>
        <p className="mt-2 text-sm italic">Conteúdo externo: o cálculo é feito no site oficial da Mayo Clinic.</p>
        <a href="https://www.mayo.edu/research/documents/pkd-center-adpkd-classification/doc-20094754" target="_blank" rel="noopener noreferrer"
          className="mt-3 block rounded-xl px-4 py-3 text-center font-semibold" style={{ backgroundColor: colors.button, color: colors.buttonText }}>
          Abrir página da Mayo Clinic
        </a>
      </section>
      <InfoDialog>
        <TituloInfo>Observações</TituloInfo>
        <ul className="space-y-1">
          <li>• Os critérios de Pei são ultrassonográficos; para RM/TC e para casos atípicos (cistos unilaterais, início precoce, sem história familiar) considere genética (PKD1/PKD2) e avaliação especializada.</li>
          <li>• A classificação de Mayo não se aplica a formas atípicas (classe 2) e depende de volumetria renal.</li>
          <li>• Indicação de terapias modificadoras da doença segue bula e diretrizes vigentes: não está neste app.</li>
        </ul>
        <TituloInfo>Referências</TituloInfo>
        <ul className="space-y-1">
          <li>• Pei Y et al. Unified criteria for ultrasonographic diagnosis of ADPKD. J Am Soc Nephrol 2009;20:205–212.</li>
          <li>• Irazabal MV et al. Imaging classification of ADPKD: a simple model for selecting patients for clinical trials. J Am Soc Nephrol 2015;26:160–172.</li>
          <li>• KDIGO 2025 Clinical Practice Guideline for ADPKD.</li>
        </ul>
      </InfoDialog>
    </div>
  );
}
