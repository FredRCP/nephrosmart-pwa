// Reordena os cartões de uma página de conteúdo. Ids que não forem citados ficam no fim, na ordem original.
// "aviso" representa as faixas de aviso (tipo: 'aviso').
import type { ConteudoPagina } from './tipos';

export function comOrdem(dados: ConteudoPagina, ordem: string[]): ConteudoPagina {
  const chave = (i: ConteudoPagina['itens'][number]) => {
    const k = ordem.indexOf(i.tipo === 'aviso' ? 'aviso' : i.id);
    return k < 0 ? ordem.length : k;
  };
  const itens = dados.itens.map((item, idx) => ({ item, idx, k: chave(item) })).sort((x, y) => x.k - y.k || x.idx - y.idx).map((x) => x.item);
  return { ...dados, itens };
}
