import { describe, expect, it } from 'vitest';
import { catalogo, ferramentasDisponiveis, filtrarFerramentas, porSlug, SLUGS_FRACOES, SLUG_HUB_FRACOES } from '@/lib/tools/catalogo';
import { SLUGS_DISPONIVEIS } from '@/lib/tools/disponiveis';

describe('catálogo de ferramentas', () => {
  it('slugs únicos', () => {
    expect(new Set(catalogo.map((f) => f.slug)).size).toBe(catalogo.length);
  });
  it('toda ferramenta disponível existe no catálogo', () => {
    for (const s of SLUGS_DISPONIVEIS) expect(catalogo.some((f) => f.slug === s), s).toBe(true);
  });
  it('mesmo inventário do app original: 66 no menu + 2 ocultas', () => {
    expect(catalogo.filter((f) => !f.oculta).length).toBe(66);
    expect(catalogo.filter((f) => f.oculta).length).toBe(2);
  });
  it('busca sem acento e filtro por categoria', () => {
    const todas = catalogo.filter((f) => !f.oculta);
    expect(filtrarFerramentas(todas, 'todos', 'hiponatremia').length).toBeGreaterThanOrEqual(2);
    expect(filtrarFerramentas(todas, 'todos', 'HIPERCALEMIA').some((f) => f.slug === 'hipercalemia-potassio')).toBe(true);
    expect(filtrarFerramentas(todas, 'hemodialise', '').every((f) => f.categorias.includes('hemodialise'))).toBe(true);
  });
  it('as migradas aparecem no menu', () => {
    const esperado = SLUGS_DISPONIVEIS.filter((s) => !SLUGS_FRACOES.includes(s) || s === SLUG_HUB_FRACOES);
    expect(ferramentasDisponiveis.map((f) => f.slug).sort()).toEqual([...esperado].sort());
  });
  it('as 7 frações de excreção aparecem no menu como UMA entrada; os 7 endereços seguem existindo com o mesmo título', () => {
    const noMenu = ferramentasDisponiveis.filter((f) => SLUGS_FRACOES.includes(f.slug));
    expect(noMenu).toHaveLength(1);
    expect(noMenu[0].titulo).toBe('Frações de Excreção');
    for (const s of SLUGS_FRACOES) { expect(SLUGS_DISPONIVEIS as readonly string[]).toContain(s); expect(porSlug(s)?.titulo).toBe('Frações de Excreção'); }
    expect(catalogo.find((f) => f.slug === 'f-e-de-acido-urico')?.titulo).toBe('F.E. de Ácido Úrico'); // catálogo original intacto
  });
});
