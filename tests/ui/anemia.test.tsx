// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import AnemiaDrc from '@/components/calculators/AnemiaDrc';
import { renderComTema } from './helpers';

beforeEach(() => window.localStorage.clear());
afterEach(cleanup);
const alertas = () => screen.getByTestId('alertas-anemia').textContent ?? '';

describe('Anemia na DRC (tela)', () => {
  it('HD, Hb 9,4, ferritina 250, TSAT 25: ferro IV e faixa de AEE, com grau e fonte', async () => {
    const u = userEvent.setup();
    renderComTema(<AnemiaDrc />);
    await u.click(screen.getByRole('button', { name: 'Hemodiálise' }));
    await u.type(screen.getByPlaceholderText('Hemoglobina (g/dL)'), '9,4');
    await u.type(screen.getByPlaceholderText('Ferritina (ng/mL)'), '250');
    await u.type(screen.getByPlaceholderText(/TSAT/), '25');
    await u.click(screen.getByRole('button', { name: 'Avaliar' }));
    expect(alertas()).toContain('Considerar iniciar ferro (hemodiálise)');
    expect(alertas()).toContain('recomendações 2.1 e 2.2 (2D)');
    expect(alertas()).toContain('recomendação 3.2.1 (2D)');
  });
  it('sem escolher o tipo de paciente mostra erro', async () => {
    const u = userEvent.setup();
    renderComTema(<AnemiaDrc />);
    await u.click(screen.getByRole('button', { name: 'Avaliar' }));
    expect(screen.getByRole('status').textContent).toContain('Escolha o tipo de paciente');
  });
  it('em uso de AEE mostra os campos de subida rápida e o alerta de Hb acima do alvo', async () => {
    const u = userEvent.setup();
    renderComTema(<AnemiaDrc />);
    expect(screen.queryByPlaceholderText('Hb anterior (g/dL)')).toBeNull();
    await u.click(screen.getByRole('button', { name: 'Hemodiálise' }));
    await u.click(screen.getByLabelText(/Em uso de AEE/));
    await u.click(screen.getByLabelText(/AEE iniciado há 4 semanas/));
    await u.type(screen.getByPlaceholderText('Hemoglobina (g/dL)'), '10,2');
    await u.type(screen.getByPlaceholderText('Hb anterior (g/dL)'), '9');
    await u.type(screen.getByPlaceholderText('Semanas entre as duas Hb'), '3');
    await u.click(screen.getByRole('button', { name: 'Avaliar' }));
    expect(alertas()).toContain('Aumento rápido da Hb');
    expect(alertas()).toContain('3.4.1.2');
  });
  it('HIF-PHI: malignidade ativa gera alerta de não usar; limpar zera', async () => {
    const u = userEvent.setup();
    renderComTema(<AnemiaDrc />);
    await u.click(screen.getByRole('button', { name: 'Sem diálise' }));
    await u.click(screen.getByLabelText('Malignidade ativa'));
    await u.click(screen.getByRole('button', { name: 'Avaliar' }));
    expect(alertas()).toContain('HIF-PHI: não usar');
    await u.click(screen.getByRole('button', { name: 'Limpar campos' }));
    expect(screen.queryByTestId('alertas-anemia')).toBeNull();
  });
  it('nenhuma regra: mensagem neutra; info cita a frequência trimestral', async () => {
    const u = userEvent.setup();
    renderComTema(<AnemiaDrc />);
    await u.click(screen.getByRole('button', { name: 'Hemodiálise' }));
    await u.click(screen.getByRole('button', { name: 'Avaliar' }));
    expect(alertas()).toContain('Nenhuma regra se aplica');
    expect(document.body.textContent).toContain('pelo menos a cada 3 meses');
    expect(document.body.textContent).toContain('não define um corte único de dose');
  });
  it('o modal explica as siglas AEE, HIF-PHI, HIF, PHI e TSAT', () => {
    renderComTema(<AnemiaDrc />);
    const t = document.body.textContent ?? '';
    expect(t).toContain('agente estimulador da eritropoiese');
    expect(t).toContain('inibidor da prolil-hidroxilase do fator induzível por hipóxia');
    expect(t).toContain('roxadustate');
    expect(t).toContain('saturação de transferrina');
  });
});
