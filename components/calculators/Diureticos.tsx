'use client';

import CalculadoraLayout from '@/components/archetypes/CalculadoraLayout';
import { TituloInfo } from '@/components/ui/InfoDialog';
import ConversorDiureticos from './ConversorDiureticos';

export default function Diureticos() {
  return (
    <CalculadoraLayout reforcado titulo="Equivalência de Diuréticos" info={

      <>
        <TituloInfo>Equivalências usadas (dose oral, referência)</TituloInfo>
        <ul className="space-y-1">
          <li>• Alça: furosemida VO 40 mg ≈ furosemida IV 20 mg ≈ bumetanida 1 mg ≈ torasemida 20 mg.</li>
          <li>• Tiazídicos: hidroclorotiazida 25 mg ≈ clortalidona 12,5 mg.</li>
        </ul>
        <TituloInfo>Limites</TituloInfo>
        <ul className="space-y-1">
          <li>• A equivalência é aproximada e varia entre as fontes; serve para trocar de fármaco, não para definir a dose inicial.</li>
          <li>• Na TFG baixa ou na insuficiência cardíaca descompensada, é preciso atingir a dose-limiar da alça; doses menores podem não ter efeito.</li>
          <li>• Só é feita conversão dentro do mesmo grupo (alça ou tiazídico).</li>
        </ul>
      </>
    }>
      <ConversorDiureticos />
    </CalculadoraLayout>
  );
}
