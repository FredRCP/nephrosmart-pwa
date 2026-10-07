import type { CategoriaId, FiltroId } from './tipos';

// Cores e rótulos idênticos aos do app original (MedicalToolsScreen.tsx)
export const FILTROS: { id: FiltroId; rotulo: string; cor: string }[] = [
  { id: 'todos', rotulo: 'Todos', cor: '#104E8B' },
  { id: 'drc', rotulo: 'DRC', cor: '#16a34a' },
  { id: 'emergencia', rotulo: 'Emergência', cor: '#ef4444' },
  { id: 'eletrolitos', rotulo: 'Eletrólitos', cor: '#3b82f6' },
  { id: 'hemodialise', rotulo: 'Hemodiálise', cor: '#8b5cf6' },
  { id: 'diversos', rotulo: 'Diversos', cor: '#f59e0b' },
];

export const corDaCategoria = (id: CategoriaId): string => FILTROS.find((f) => f.id === id)?.cor ?? '#94a3b8';
