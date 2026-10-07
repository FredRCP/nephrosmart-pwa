import ListaFerramentas from '@/components/ferramentas/ListaFerramentas';
import { ferramentasDisponiveis } from '@/lib/tools/catalogo';

export const metadata = { title: 'Ferramentas Clínicas' };

export default function FerramentasPage() {
  return <ListaFerramentas ferramentas={ferramentasDisponiveis} />;
}
