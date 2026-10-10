// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ConversorUnidades from '@/components/calculators/ConversorUnidades';
import Clearance24h from '@/components/calculators/Clearance24h';
import EstadiamentoDrc from '@/components/calculators/EstadiamentoDrc';
import Diureticos from '@/components/calculators/Diureticos';
import { renderComTema } from './helpers';

vi.mock('next/link', () => ({
  default: ({ href, children, ...p }: { href: string; children: React.ReactNode }) => <a href={href} {...p}>{children}</a>,
}));
beforeEach(() => window.localStorage.clear());
afterEach(cleanup);
const resultado = () => screen.getByRole('status').textContent ?? '';

describe('Ferramentas novas (Onda 7)', () => {
  it('conversor: creatinina 1 mg/dL → 88,4 µmol/L', async () => {
    const u = userEvent.setup();
    renderComTema(<ConversorUnidades />);
    await u.selectOptions(screen.getByLabelText('Exame'), 'creatinina');
    await u.click(screen.getByRole('button', { name: 'mg/dL' }));
    await u.type(screen.getByPlaceholderText('Valor'), '1');
    await u.click(screen.getByRole('button', { name: 'Converter' }));
    expect(resultado()).toContain('88,4 µmol/L');
  });
  it('conversor: sem exame mostra erro', async () => {
    const u = userEvent.setup();
    renderComTema(<ConversorUnidades />);
    await u.click(screen.getByRole('button', { name: 'Converter' }));
    expect(resultado()).toContain('Escolha o exame');
  });
  it('clearance 24 h: 83,3 mL/min e aviso de superestimação', async () => {
    const u = userEvent.setup();
    renderComTema(<Clearance24h />);
    await u.type(screen.getByPlaceholderText('Volume urinário total (mL)'), '1500');
    await u.type(screen.getByPlaceholderText('Creatinina urinária (mg/dL)'), '80');
    await u.type(screen.getByPlaceholderText('Creatinina sérica (mg/dL)'), '1');
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    expect(resultado()).toContain('83,3 mL/min');
    expect(document.body.textContent).toContain('SUPERESTIMA');
  });
  it('estadiamento: TFG 35 + RAC 100 → G3b A2, célula marcada', async () => {
    const u = userEvent.setup();
    renderComTema(<EstadiamentoDrc />);
    await u.type(screen.getByPlaceholderText(/TFG/), '35');
    await u.type(screen.getByPlaceholderText(/Valor/), '100');
    await u.click(screen.getByRole('button', { name: 'Estadiar' }));
    expect(resultado()).toContain('G3b');
    const ativas = document.querySelectorAll('[data-ativo="true"]');
    expect(ativas).toHaveLength(1);
    expect(ativas[0].getAttribute('aria-label')).toBe('G3b A2: Risco muito alto');
  });
  it('diuréticos: torasemida 40 mg → furosemida VO 80 mg', async () => {
    const u = userEvent.setup();
    renderComTema(<Diureticos />);
    await u.selectOptions(screen.getByLabelText('Diurético atual'), 'torasemida');
    await u.type(screen.getByPlaceholderText('Dose (mg)'), '40');
    await u.click(screen.getByRole('button', { name: 'Converter' }));
    expect(resultado()).toMatch(/Furosemida VO.*80/);
  });
});
