import dados from './catalogo.json';
import { SLUGS_DISPONIVEIS } from './disponiveis';
import type { Ferramenta, FiltroId } from './tipos';

export const catalogo = dados as Ferramenta[];

const disponiveis = new Set<string>(SLUGS_DISPONIVEIS);

export const ferramentasDisponiveis = catalogo.filter((f) => disponiveis.has(f.slug) && !f.oculta);

export const porSlug = (slug: string): Ferramenta | undefined => catalogo.find((f) => f.slug === slug);

export const estaDisponivel = (slug: string): boolean => disponiveis.has(slug);

export const removerAcentos = (t: string): string =>
  t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

/** Mesma regra do menu original: busca sem acento em título + descrição. */
export function filtrarFerramentas(lista: Ferramenta[], filtro: FiltroId, busca: string): Ferramenta[] {
  let r = filtro === 'todos' ? lista : lista.filter((f) => f.categorias.includes(filtro));
  if (busca.trim()) {
    const q = removerAcentos(busca);
    r = r.filter((f) => removerAcentos(f.titulo).includes(q) || removerAcentos(f.descricao).includes(q));
  }
  return [...r].sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
}
