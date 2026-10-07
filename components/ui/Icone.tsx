import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICONES } from '@/lib/ui/icones';

export default function Icone({ nome, tamanho = 20, cor, className }: { nome: string; tamanho?: number; cor?: string; className?: string }) {
  const icone = ICONES[nome];
  if (!icone) return null;
  return <FontAwesomeIcon icon={icone} style={{ width: tamanho, height: tamanho, color: cor }} className={className} aria-hidden />;
}
