export type CategoriaId = 'drc' | 'eletrolitos' | 'hemodialise' | 'emergencia' | 'diversos';
export type FiltroId = 'todos' | CategoriaId;

export type TipoFerramenta = 'calculadora' | 'calculadora-dados' | 'conteudo' | 'escore' | 'fluxograma' | 'consulta';

export interface Ferramenta {
  slug: string;
  titulo: string;
  descricao: string;
  /** Uma ferramenta pode aparecer em várias categorias (antes eram itens duplicados no menu). */
  categorias: CategoriaId[];
  tipo: TipoFerramenta;
  /** 'alta' = envolve dose/conduta: exige teste de comparação e revisão clínica mais rigorosos. */
  sensibilidade: 'normal' | 'alta';
  prioridade: 'P1' | 'P2' | 'P3' | 'P4';
  /** Nome da tela no app React Native original (rastreabilidade). */
  rotaLegada: string;
  idsLegados: string[];
  oculta?: boolean;
}
