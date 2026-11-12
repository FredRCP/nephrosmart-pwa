// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
afterEach(cleanup);
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderComTema } from './helpers';
import Glasgow from '@/components/calculators/Glasgow';
import MaturacaoFav from '@/components/calculators/MaturacaoFav';
import RiscoCardiovascular from '@/components/calculators/RiscoCardiovascular';
import RiscoProgressaoDrc from '@/components/calculators/RiscoProgressaoDrc';
import Drpad from '@/components/calculators/Drpad';
import { FILTROS } from '@/lib/tools/categorias';
import { ferramentasDisponiveis } from '@/lib/tools/catalogo';

const resultado = () => screen.getByRole('status').textContent ?? '';

describe('Escores migrados (telas)', () => {
  it('Glasgow só mostra resultado com os 3 grupos preenchidos', async () => {
    const u = userEvent.setup();
    renderComTema(<Glasgow />);
    expect(screen.queryByRole('status')).toBeNull();
    await u.click(screen.getByLabelText(/Espontânea/));
    await u.click(screen.getByLabelText(/Confuso/));
    expect(screen.queryByRole('status')).toBeNull();
    await u.click(screen.getByLabelText(/Obedece comandos/));
    expect(resultado()).toContain('Glasgow: 14 (E4 V4 M6)');
    expect(resultado()).toContain('Leve (13–15)');
    await u.click(screen.getByRole('button', { name: 'Limpar' }));
    expect(screen.queryByRole('status')).toBeNull();
  });
  it('FAV lista critérios não atendidos', async () => {
    const u = userEvent.setup();
    renderComTema(<MaturacaoFav />);
    await u.type(screen.getByPlaceholderText(/Fluxo/), '450');
    await u.type(screen.getByPlaceholderText(/Diâmetro/), '7');
    await u.type(screen.getByPlaceholderText(/Profundidade/), '8');
    await u.click(screen.getByRole('button', { name: 'Sim' }));
    expect(resultado()).toContain('Fluxo < 600 mL/min');
    expect(resultado()).toContain('Profundidade > 6 mm');
    expect(resultado()).not.toContain('Diâmetro');
  });
  it('FAV com tudo certo', async () => {
    const u = userEvent.setup();
    renderComTema(<MaturacaoFav />);
    await u.type(screen.getByPlaceholderText(/Fluxo/), '650');
    await u.type(screen.getByPlaceholderText(/Diâmetro/), '6,5');
    await u.type(screen.getByPlaceholderText(/Profundidade/), '5');
    await u.click(screen.getByRole('button', { name: 'Sim' }));
    expect(resultado()).toContain('Todos os critérios da regra dos 6 foram atendidos');
  });
  it('Risco cardiovascular calcula e valida', async () => {
    const u = userEvent.setup();
    renderComTema(<RiscoCardiovascular />);
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    expect(resultado()).toContain('Informe');
    await u.type(screen.getByPlaceholderText(/Idade/), '55');
    await u.click(screen.getByRole('button', { name: 'Feminino' }));
    await u.type(screen.getByPlaceholderText(/Colesterol total/), '213');
    await u.type(screen.getByPlaceholderText(/HDL/), '50');
    await u.type(screen.getByPlaceholderText(/sistólica/), '120');
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    expect(resultado()).toContain('2,1%');
    expect(resultado()).toContain('Baixo');
  });
  it('KFRE mostra 2 e 5 anos e exige ACR', async () => {
    const u = userEvent.setup();
    renderComTema(<RiscoProgressaoDrc />);
    await u.type(screen.getByPlaceholderText(/Idade/), '60');
    await u.click(screen.getByRole('button', { name: 'Masculino' }));
    await u.type(screen.getByPlaceholderText(/TFG/), '30');
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    expect(resultado()).toContain('albumina/creatinina');
    await u.type(screen.getByPlaceholderText(/albumina/), '500');
    await u.click(screen.getByRole('button', { name: 'América do Norte' }));
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    expect(resultado()).toContain('2 anos: 10,7%');
    expect(resultado()).toContain('5 anos: 29,9%');
  });
  it('DRPAD traz critérios e link externo seguro', () => {
    renderComTema(<Drpad />);
    expect(document.body.textContent).toContain('≥ 3 cistos');
    const a = screen.getByRole('link', { name: /Mayo/ });
    expect(a.getAttribute('rel')).toContain('noopener');
  });
});

describe('Menu Ferramentas', () => {
  it('abas em ordem alfabética: Todos primeiro, Outros por último', () => {
    expect(FILTROS.map((f) => f.rotulo)).toEqual(['Todos', 'Ácido-base', 'Diálise', 'DRC', 'Eletrólitos', 'IRA e emergência', 'Outros']);
  });
  it('os 5 escores novos estão no menu', () => {
    const slugs = ferramentasDisponiveis.map((f) => f.slug);
    for (const s of ['escala-de-coma-de-glasgow', 'escore-brescia-cimino-doqi', 'risco-cardiovascular', 'risco-de-progressao-de-drc', 'drpad']) expect(slugs).toContain(s);
    expect(slugs).not.toContain('rein-score');
  });
});
