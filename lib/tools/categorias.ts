import type { CategoriaId, FiltroId } from './tipos';

// Filtros da tela Ferramentas (reorganizados no PWA): cada um responde a uma pergunta clínica.
// Função renal e Ajuste de Dose têm botão próprio na Home; as calculadoras seguem em "DRC" e em "Todos".
export const FILTROS: { id: FiltroId; rotulo: string; cor: string }[] = [
  { id: 'todos', rotulo: 'Todos', cor: '#104E8B' },
  { id: 'eletrolitos', rotulo: 'Eletrólitos', cor: '#3b82f6' },
  { id: 'acido-base', rotulo: 'Ácido-base', cor: '#0d9488' },
  { id: 'ira-emergencia', rotulo: 'IRA e emergência', cor: '#ef4444' },
  { id: 'dialise', rotulo: 'Diálise', cor: '#8b5cf6' },
  { id: 'drc', rotulo: 'DRC', cor: '#16a34a' },
  { id: 'outros', rotulo: 'Outros', cor: '#f59e0b' },
];

export const corDaCategoria = (id: CategoriaId): string => FILTROS.find((f) => f.id === id)?.cor ?? '#94a3b8';
