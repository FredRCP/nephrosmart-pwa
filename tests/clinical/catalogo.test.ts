import { describe, expect, it } from 'vitest';
import { catalogo, ferramentasDisponiveis, filtrarFerramentas } from '@/lib/tools/catalogo';
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
    expect(ferramentasDisponiveis.map((f) => f.slug).sort()).toEqual([...SLUGS_DISPONIVEIS].sort());
  });
});
