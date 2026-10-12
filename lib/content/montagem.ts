// Atalhos para montar páginas de eletrólitos (mesma estrutura das demais páginas de conteúdo).
import type { Bloco, Linha, Secao } from './tipos';

type Tipo = 'ecg' | 'sintomas' | 'tratamento' | 'causas' | 'monitoramento';
const ESTILO: Record<Tipo, { titulo: string; fa: string; cor: string; borda: string }> = {
  ecg: { titulo: 'ECG - Alterações Clássicas', fa: 'heartbeat', cor: '#f44336', borda: '#2196F3' },
  sintomas: { titulo: 'SINTOMAS PRINCIPAIS', fa: 'user-injured', cor: '#f44336', borda: '#f44336' },
  tratamento: { titulo: 'TRATAMENTO', fa: 'syringe', cor: '#4caf50', borda: '#4caf50' },
  causas: { titulo: 'PRINCIPAIS CAUSAS', fa: 'search', cor: '#ff9800', borda: '#ff9800' },
  monitoramento: { titulo: 'MONITORAMENTO', fa: 'chart-line', cor: '#2196F3', borda: '#2196F3' },
};

export const t = (texto: string): Linha => ({ texto });
export const alerta = (texto: string): Linha => ({ texto, estilo: 'atencao' });

export function secao(tipo: Tipo, resumo: string, blocos: Bloco[]): Secao {
  const e = ESTILO[tipo];
  return { tipo: 'secao', id: tipo, titulo: e.titulo, icone: { fa: e.fa, cor: e.cor }, cor: e.borda, resumo, dica: 'Toque para expandir', blocos };
}
export const linhas = (...l: (string | Linha)[]): Bloco => ({ tipo: 'linhas', linhas: l.map((x) => (typeof x === 'string' ? t(x) : x)) });
export const lista = (titulo: string | undefined, ...itens: string[]): Bloco => ({ tipo: 'lista', titulo, itens });
export const nota = (estilo: 'alerta' | 'perigo' | 'atencao', texto: string): Bloco => ({ tipo: 'nota', estilo, texto });
export const etiquetas = (...itens: string[]): Bloco => ({ tipo: 'etiquetas', itens });
