import dados from './catalogo.json';
import { SLUGS_DISPONIVEIS } from './disponiveis';
import type { Ferramenta, FiltroId } from './tipos';

export const catalogo = dados as Ferramenta[];

/** As 7 frações de excreção formam UM hub: no menu aparece uma entrada só; os 7 endereços continuam funcionando. */
export const SLUG_HUB_FRACOES = 'fracao-de-excrecao-de-sodio';
export const SLUGS_FRACOES = ['fracao-de-excrecao-de-sodio', 'fracao-de-excrecao-de-ureia', 'fracao-de-excrecao-de-potassio', 'fracao-de-excrecao-de-calcio',
  'fracao-de-excrecao-de-fosforo', 'f-e-de-acido-urico', 'fracao-de-excrecao-de-magnesio'];
const TITULO_HUB = 'Frações de Excreção';
const DESCRICAO_HUB = 'Fração de excreção de sódio, ureia, potássio, cálcio, fósforo, ácido úrico e magnésio (FENa, FEUr, FEK, FECa, FEP, FEUA, FEMg).';
const comoHub = (f: Ferramenta): Ferramenta => (SLUGS_FRACOES.includes(f.slug) ? { ...f, titulo: TITULO_HUB, descricao: DESCRICAO_HUB } : f);

const disponiveis = new Set<string>(SLUGS_DISPONIVEIS);

export const ferramentasDisponiveis = catalogo
  .filter((f) => disponiveis.has(f.slug) && !f.oculta && (!SLUGS_FRACOES.includes(f.slug) || f.slug === SLUG_HUB_FRACOES))
  .map(comoHub);

export const porSlug = (slug: string): Ferramenta | undefined => {
  const f = catalogo.find((x) => x.slug === slug);
  return f && comoHub(f);
};

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
