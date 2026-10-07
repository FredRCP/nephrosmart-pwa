// Modelo de CONTEÚDO educacional (páginas em acordeão: Hipercalemia, Intoxicações, etc.).
// O texto clínico vive em dados, não em JSX: dá para revisar, versionar e atualizar sem mexer em tela.

/** Cor em hexadecimal, ou o token 'warning' (amarelo/âmbar do tema, legível nos dois temas). */
export type CorConteudo = string;

export type Icone = { fa: string; cor: CorConteudo } | { emoji: string };

export type EstiloLinha = 'normal' | 'alerta' | 'perigo' | 'atencao';

export interface Linha {
  texto: string;
  estilo?: EstiloLinha;
}

export type ItemLista = string | { texto: string; filhos: string[] };

export type Bloco =
  | { tipo: 'linhas'; linhas: Linha[] }
  | { tipo: 'lista'; titulo?: string; itens: ItemLista[] }
  | { tipo: 'grupos'; grupos: { titulo: string; cor: string; itens: Linha[] }[] }
  | { tipo: 'etiquetas'; itens: string[] }
  | { tipo: 'nota'; estilo: Exclude<EstiloLinha, 'normal'>; texto: string };

export interface Secao {
  tipo: 'secao';
  id: string;
  titulo: string;
  icone: Icone;
  /** Cor da borda esquerda do cartão. */
  cor: string;
  /** Texto exibido com o cartão fechado. */
  resumo: string;
  dica: string;
  blocos: Bloco[];
}

export interface AvisoFaixa {
  tipo: 'aviso';
  texto: string;
  icone: string;
}

export interface GuiaRapido {
  titulo: string;
  secoes: { titulo: string; cor?: string; linhas: string[]; destaque?: boolean }[];
}

export interface ConteudoPagina {
  slug: string;
  titulo: string;
  subtitulo?: string;
  itens: (Secao | AvisoFaixa)[];
  guiaRapido?: GuiaRapido;
  /** Referências bibliográficas (exibidas no guia). */
  referencias?: string;
}
