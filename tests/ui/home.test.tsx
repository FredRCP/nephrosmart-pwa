// @vitest-environment jsdom
import { cleanup, screen, within } from '@testing-library/react';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Home from '@/app/page';
import { renderComTema } from './helpers';

beforeEach(() => window.sessionStorage.clear());
afterEach(cleanup);

describe('Home', () => {
  it('módulos, selo beta, aviso curto e abertura animada', () => {
    renderComTema(<Home />);
    expect(screen.getByText('Bem-vindo ao NephroSmart')).toBeTruthy(); // abertura (aria-hidden), primeira vez da sessão
    expect(screen.getByText('VERSÃO BETA')).toBeTruthy();
    const modulos = within(screen.getByRole('navigation', { name: 'Módulos' }));
    expect(modulos.getByRole('link', { name: 'Função Renal' }).getAttribute('href')).toBe('/funcao-renal');
    expect(modulos.getByRole('link', { name: /Ajuste de Dose/ }).getAttribute('href')).toBe('/ajuste-de-dose');
    expect(modulos.getByRole('link', { name: 'Ferramentas Clínicas' }).getAttribute('href')).toBe('/ferramentas');
    expect(screen.getByText(/Uso exclusivo para profissionais de saúde/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Termo de Uso' }).getAttribute('href')).toBe('/termodeuso');
  });
  it('a abertura não esconde o conteúdo do leitor de tela e começa em modo de espera', () => {
    const { container } = renderComTema(<Home />);
    expect(container.querySelector('[data-intro]')?.getAttribute('data-intro')).toBe('espera');
    expect(screen.getByText('Bem-vindo ao NephroSmart').closest('[aria-hidden="true"]')).not.toBeNull();
  });
});

describe('Home — abertura completa', () => {
  it('o título sai sozinho depois de ~3,3 s e a Home aparece (não pode ficar presa em "Bem-vindo")', async () => {
    vi.resetModules();
    vi.useFakeTimers();
    try {
      const { default: HomeNova } = await import('@/app/page');
      const { ThemeProvider } = await import('@/context/ThemeContext');
      const { render } = await import('@testing-library/react');
      const { container } = render(<ThemeProvider><HomeNova /></ThemeProvider>);
      expect(screen.queryByText('Bem-vindo ao NephroSmart')).not.toBeNull();
      await act(async () => { vi.advanceTimersByTime(2600); });
      expect(container.querySelector('[data-intro]')?.getAttribute('data-intro')).toBe('espera');
      await act(async () => { vi.advanceTimersByTime(1000); });
      expect(screen.queryByText('Bem-vindo ao NephroSmart')).toBeNull();
      expect(container.querySelector('[data-intro]')?.getAttribute('data-intro')).toBe('anima');
      expect(window.sessionStorage.getItem('introVista')).toBe('1');
    } finally { vi.useRealTimers(); }
  });
});
