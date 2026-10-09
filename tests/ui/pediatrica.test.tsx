// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PediatricoCalculator from '@/components/calculators/PediatricoCalculator';
import { renderComTema } from './helpers';

let erroConsole: ReturnType<typeof vi.spyOn>;
beforeEach(() => { window.localStorage.clear(); erroConsole = vi.spyOn(console, 'error').mockImplementation(() => {}); });
afterEach(() => { cleanup(); expect(erroConsole, 'avisos do React no console').not.toHaveBeenCalled(); erroConsole.mockRestore(); });

type U = ReturnType<typeof userEvent.setup>;
const calcular = (u: U) => u.click(screen.getByRole('button', { name: 'Calcular' }));
const preencher = async (u: U, altura: string, cr: string, idade: string) => {
  await u.type(screen.getByPlaceholderText('Altura (cm)'), altura);
  await u.type(screen.getByPlaceholderText('Creatinina atual (mg/dL)'), cr);
  await u.type(screen.getByLabelText('Idade'), idade);
};

describe('TFG Pediátrica (interface)', () => {
  it('DRC: CKiD U25, comparação com bedside, aviso de creatinina estável e nada guardado', async () => {
    const u = userEvent.setup();
    renderComTema(<PediatricoCalculator />);
    await preencher(u, '140', '0,6', '10');
    await u.click(screen.getByRole('button', { name: /Feminino/ }));
    await calcular(u);
    const r = screen.getByRole('status').textContent!;
    expect(r).toContain('TFG estimada: 82.9 mL/min/1.73m²');
    expect(r).toContain('Método: CKiD U25 (creatinina)');
    expect(r).toContain('Categoria KDIGO: G2');
    expect(screen.getByRole('alert').textContent).toContain('creatinina ESTÁVEL');
    expect(window.localStorage.length).toBe(0); // não alimenta nenhum Ajuste de Dose
  });
  it('sexo é exigido a partir de 1 ano e o campo é marcado', async () => {
    const u = userEvent.setup();
    renderComTema(<PediatricoCalculator />);
    await preencher(u, '140', '0.6', '10');
    await calcular(u);
    expect(screen.getByRole('status').textContent).toContain('o sexo');
    expect(screen.getByRole('group', { name: 'Sexo' }).getAttribute('aria-invalid')).toBe('true');
  });
  it('cistatina C opcional troca o método para creatinina + cistatina', async () => {
    const u = userEvent.setup();
    renderComTema(<PediatricoCalculator />);
    await preencher(u, '140', '0.6', '10');
    await u.click(screen.getByRole('button', { name: /Masculino/ }));
    await u.click(screen.getByRole('button', { name: '+ Cistatina C' }));
    await u.type(screen.getByPlaceholderText('Cistatina C (mg/L)'), '1');
    await calcular(u);
    expect(screen.getByRole('status').textContent).toContain('creatinina + cistatina C');
  });
  it('lactente: pergunta de prematuridade e aviso de baixa confiabilidade', async () => {
    const u = userEvent.setup();
    renderComTema(<PediatricoCalculator />);
    expect(screen.queryByLabelText(/Prematuro/)).toBeNull();
    await preencher(u, '50', '0.4', '3');
    await u.click(screen.getByRole('button', { name: 'meses' }));
    await u.click(screen.getByLabelText(/Prematuro/));
    await calcular(u);
    expect(screen.getByRole('status').textContent).toContain('TFG estimada: 41.3');
    expect(screen.getByRole('alert').textContent).toContain('baixa confiabilidade');
  });
  it('LRA: estágio, teto e orientação de dose; não guarda TFG', async () => {
    const u = userEvent.setup();
    renderComTema(<PediatricoCalculator />);
    await u.click(screen.getByRole('tab', { name: /LRA/ }));
    await preencher(u, '150', '1.5', '12');
    await u.click(screen.getByRole('button', { name: /Masculino/ }));
    await u.type(screen.getByPlaceholderText('Creatinina basal (mg/dL)'), '0.5');
    await calcular(u);
    const r = screen.getByRole('status').textContent!;
    expect(r).toContain('LRA — KDIGO estágio 3');
    expect(r).toContain('é um TETO');
    expect(r).toContain('Ajuste de dose: dose como TFG < 15');
    expect(window.localStorage.length).toBe(0);
  });
  it('LRA: diurese como critério e basal estimada com aviso', async () => {
    const u = userEvent.setup();
    renderComTema(<PediatricoCalculator />);
    await u.click(screen.getByRole('tab', { name: /LRA/ }));
    await preencher(u, '150', '0.5', '12');
    await u.click(screen.getByRole('button', { name: /Masculino/ }));
    await u.selectOptions(screen.getByLabelText('Diurese'), 'e2');
    await calcular(u);
    expect(screen.getByRole('status').textContent).toContain('LRA — KDIGO estágio 2');
    expect(screen.getByRole('alert').textContent).toContain('ESTIMADA');
  });
  it('trocar de aba limpa o resultado; Limpar zera os campos', async () => {
    const u = userEvent.setup();
    renderComTema(<PediatricoCalculator />);
    await preencher(u, '140', '0.6', '10');
    await u.click(screen.getByRole('button', { name: /Feminino/ }));
    await calcular(u);
    await u.click(screen.getByRole('tab', { name: /LRA/ }));
    expect(screen.queryByRole('status')).toBeNull();
    await u.click(screen.getByRole('button', { name: 'Limpar campos' }));
    expect((screen.getByPlaceholderText('Altura (cm)') as HTMLInputElement).value).toBe('');
  });
});
