// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderComTema } from './helpers';
import DiureticosHub from '@/components/hubs/DiureticosHub';
import { CLASSES_DIURETICO, GUIA_DIURETICOS } from '@/lib/content/diureticos';
afterEach(cleanup);

describe('Guia de diuréticos (dados)', () => {
  it('cobre os fármacos pedidos, com nome comercial e todas as seções preenchidas', () => {
    const nomes = GUIA_DIURETICOS.map((d) => d.generico);
    for (const n of ['Furosemida', 'Espironolactona', 'Hidroclorotiazida', 'Clortalidona', 'Amilorida', 'Finerenona', 'Eplerenona', 'Triantereno', 'Bumetanida', 'Piretanida', 'Acetazolamida', 'Manitol', 'Indapamida'])
      expect(nomes).toContain(n);
    for (const d of GUIA_DIURETICOS) {
      expect(CLASSES_DIURETICO.some((c) => c.id === d.classe)).toBe(true);
      for (const campo of ['apresentacoes', 'dose', 'inicioDuracao', 'riscos', 'drc'] as const) expect(d[campo].length, `${d.id}.${campo}`).toBeGreaterThan(0);
      expect(d.comerciais.length + (d.associacoes?.length ?? 0), d.id).toBeGreaterThan(0);
    }
  });
  it('finerenona é Firialta; SGLT2 não está no guia', () => {
    expect(GUIA_DIURETICOS.find((d) => d.id === 'finerenona')!.comerciais).toContain('Firialta®');
    expect(JSON.stringify(GUIA_DIURETICOS).toLowerCase()).not.toContain('empagliflozina');
  });
});

describe('Guia de diuréticos (tela)', () => {
  it('abre no guia, filtra por classe e mostra dados de bula', async () => {
    const u = userEvent.setup();
    renderComTema(<DiureticosHub />);
    expect(screen.getByTestId('diuretico-furosemida')).toBeTruthy();
    await u.click(screen.getByRole('button', { name: 'Antagonistas mineralocorticoides' }));
    expect(screen.queryByTestId('diuretico-furosemida')).toBeNull();
    const f = screen.getByTestId('diuretico-finerenona');
    expect(within(f).getByText(/Firialta/)).toBeTruthy();
    expect(f.textContent).toContain('TFG < 25: não iniciar');
  });
  it('a aba Converter continua convertendo dentro da classe', async () => {
    const u = userEvent.setup();
    renderComTema(<DiureticosHub />);
    await u.click(screen.getByRole('tab', { name: 'Equivalência de dose' }));
    expect(screen.getByPlaceholderText('Dose (mg)')).toBeTruthy();
    expect(screen.queryByTestId('diuretico-furosemida')).toBeNull();
  });
});
