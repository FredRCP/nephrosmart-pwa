// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderComTema } from './helpers';
import NefrolitiaseHub from '@/components/hubs/NefrolitiaseHub';
afterEach(cleanup);

describe('Nefrolitíase (tela)', () => {
  it('abre em "Investigar causa" e as abas ficam em ordem alfabética', () => {
    renderComTema(<NefrolitiaseHub />);
    const abas = screen.getAllByRole('tab').map((t) => t.textContent);
    expect(abas).toEqual(['Cólica aguda', 'Investigar causa', 'Tipos de cálculo']);
    expect(screen.getByRole('tab', { name: 'Investigar causa' }).getAttribute('aria-selected')).toBe('true');
  });
  it('sem dados, pede ao menos um campo', async () => {
    const u = userEvent.setup();
    renderComTema(<NefrolitiaseHub />);
    await u.click(screen.getByRole('button', { name: 'Avaliar causa' }));
    expect(screen.getByRole('alert').textContent).toContain('ao menos um dado');
  });
  it('cálcio alto + PTH alto aponta hiperparatireoidismo primário', async () => {
    const u = userEvent.setup();
    renderComTema(<NefrolitiaseHub />);
    await u.type(screen.getByPlaceholderText('Cálcio total (mg/dL)'), '11,2');
    await u.type(screen.getByPlaceholderText('PTH intacto (pg/mL)'), '120');
    await u.click(screen.getByRole('button', { name: 'Avaliar causa' }));
    expect(screen.getByTestId('hipotese-hpt').textContent).toContain('Forte indício');
  });
  it('lista os tipos de cálculo com cores e a cólica aguda', async () => {
    const u = userEvent.setup();
    renderComTema(<NefrolitiaseHub />);
    await u.click(screen.getByRole('tab', { name: 'Tipos de cálculo' }));
    expect(screen.getByTestId('tipo-cistina')).toBeTruthy();
    await u.click(screen.getByRole('tab', { name: 'Cólica aguda' }));
    expect(screen.getByText(/pielonefrite obstrutiva/)).toBeTruthy();
  });
});
