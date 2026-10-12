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
/** Ferramentas que abrem a tela de outra (mesmo hub): não têm entrada própria no menu e herdam título e descrição da principal. */
export const ALIAS_HUB: Record<string, string> = {
  'vacinas-adultos': 'vacinas-drc',
  // Cálcio, fósforo e magnésio: uma entrada por hub (hipo e hiper dentro).
  'hipercalcemia-calcio': 'hipocalcemia-calcio', 'correcao-do-calcio-ca2': 'hipocalcemia-calcio',
  // Sódio: as 6 ferramentas viram uma entrada só.
  'hipernatremia-sodio': 'hiponatremia-sodio', 'hiponatremia-fluxograma-na': 'hiponatremia-sodio', 'correcao-de-hiponatremia-na': 'hiponatremia-sodio',
  'correcao-de-hipernatremia-na': 'hiponatremia-sodio', 'ingestao-diaria-de-sodio': 'hiponatremia-sodio',
  'hipocalemia-potassio': 'hipercalemia-potassio',
  'hiperfosfatemia-fosforo': 'hipofosfatemia-fosforo', 'hipermagnesemia-magnesio': 'hipomagnesemia-magnesio',
};
/** Título e descrição próprios dos hubs de eletrólitos (a busca por "hipercalcemia", "correção do cálcio" etc. continua achando a entrada). */
const TEXTO_HUB: Record<string, { titulo: string; descricao: string }> = {
  'hiponatremia-sodio': { titulo: 'Sódio (Hipo/Hipernatremia e Calculadoras)', descricao: 'Hiponatremia, hipernatremia, fluxograma diagnóstico, correção do sódio e ingestão diária de sódio.' },
  'hipercalemia-potassio': { titulo: 'Potássio (Hipo/Hipercalemia)', descricao: 'Orientações sobre hipocalemia e hipercalemia.' },
  'hipocalcemia-calcio': { titulo: 'Cálcio (Hipo/Hipercalcemia e Correção)', descricao: 'Hipocalcemia, hipercalcemia e correção do cálcio pela albumina.' },
  'hipofosfatemia-fosforo': { titulo: 'Fósforo (Hipo/Hiperfosfatemia)', descricao: 'Orientações sobre hipofosfatemia e hiperfosfatemia.' },
  'hipomagnesemia-magnesio': { titulo: 'Magnésio (Hipo/Hipermagnesemia)', descricao: 'Orientações sobre hipomagnesemia e hipermagnesemia.' },
};
export const SLUGS_ALIAS = Object.keys(ALIAS_HUB);
const comoHub = (f: Ferramenta): Ferramenta => {
  if (SLUGS_FRACOES.includes(f.slug)) return { ...f, titulo: TITULO_HUB, descricao: DESCRICAO_HUB };
  const slugPrincipal = ALIAS_HUB[f.slug] ?? f.slug;
  const texto = TEXTO_HUB[slugPrincipal];
  if (texto) return { ...f, ...texto };
  const principal = ALIAS_HUB[f.slug] && dados.find((x) => x.slug === ALIAS_HUB[f.slug]);
  return principal ? { ...f, titulo: principal.titulo, descricao: principal.descricao } : f;
};

const disponiveis = new Set<string>(SLUGS_DISPONIVEIS);

export const ferramentasDisponiveis = catalogo
  .filter((f) => disponiveis.has(f.slug) && !f.oculta && (!SLUGS_FRACOES.includes(f.slug) || f.slug === SLUG_HUB_FRACOES) && !SLUGS_ALIAS.includes(f.slug))
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
