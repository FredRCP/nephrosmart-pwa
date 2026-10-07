// @vitest-environment jsdom
import { cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AppShell from '@/components/shell/AppShell';
import Home from '@/app/page';
import PrivacidadePage from '@/app/privacidade/page';
import TermosPage from '@/app/termodeuso/page';
import ContatoPage from '@/app/contato/page';
import ExcluirConta from '@/components/legal/ExcluirConta';
import { renderComTema } from './helpers';

const estado = vi.hoisted(() => ({ caminho: '/' }));
vi.mock('next/navigation', () => ({
  usePathname: () => estado.caminho,
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));
vi.mock('next/link', () => ({
  default: ({ href, children, ...p }: { href: string; children: React.ReactNode }) => <a href={href} {...p}>{children}</a>,
}));

beforeEach(() => { window.localStorage.clear(); estado.caminho = '/'; delete document.documentElement.dataset.theme; });
afterEach(cleanup);

describe('Menu azul no topo (tablet/desktop)', () => {
  it('tem os 4 itens do site e marca o ativo', () => {
    estado.caminho = '/ferramentas';
    renderComTema(<AppShell><p>conteúdo</p></AppShell>);
    const nav = screen.getByRole('navigation', { name: 'Principal' });
    expect(within(nav).getAllByRole('link').map((a) => a.textContent).filter(Boolean)).toEqual(
      ['NephroSmart', 'Home', 'Função Renal', 'Ajuste de Dose', 'Ferramentas Clínicas'],
    );
    expect(within(nav).getByRole('link', { name: 'Ferramentas Clínicas' }).getAttribute('aria-current')).toBe('page');
    expect(within(nav).getByRole('link', { name: 'Home' }).getAttribute('aria-current')).toBeNull();
  });

  it('item de uma ferramenta mantém "Ferramentas Clínicas" ativo', () => {
    estado.caminho = '/ferramentas/imc';
    renderComTema(<AppShell><p>x</p></AppShell>);
    const nav = screen.getByRole('navigation', { name: 'Principal' });
    expect(within(nav).getByRole('link', { name: 'Ferramentas Clínicas' }).getAttribute('aria-current')).toBe('page');
  });

  it('engrenagem abre o menu com tema e páginas legais; Esc fecha', async () => {
    const u = userEvent.setup();
    renderComTema(<AppShell><p>x</p></AppShell>);
    expect(screen.queryByRole('menu')).toBeNull();
    await u.click(screen.getByRole('button', { name: 'Configurações' }));
    const menu = screen.getByRole('menu');
    expect(within(menu).getAllByRole('menuitem').map((i) => i.textContent)).toEqual(
      ['🌙Tema Escuro', '✉️Contato', '📄Termos de Uso', '🔒Política de Privacidade', '🗑️Excluir Conta'],
    );
    expect(within(menu).getByRole('menuitem', { name: /Política de Privacidade/ }).getAttribute('href')).toBe('/privacidade');
    expect(within(menu).getByRole('menuitem', { name: /Excluir Conta/ }).getAttribute('href')).toBe('/excluir-conta');
    await u.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('"Tema Escuro" alterna o tema e publica data-theme no <html>', async () => {
    const u = userEvent.setup();
    renderComTema(<AppShell><p>x</p></AppShell>);
    await u.click(screen.getByRole('button', { name: 'Configurações' }));
    await u.click(screen.getByRole('menuitem', { name: /Tema Escuro/ }));
    expect(window.localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    await u.click(screen.getByRole('button', { name: 'Configurações' }));
    expect(screen.getByRole('menuitem', { name: /Tema Claro/ })).toBeTruthy();
  });

  it('rodapé com os links legais', () => {
    renderComTema(<AppShell><p>x</p></AppShell>);
    const rodape = screen.getByRole('contentinfo');
    expect(rodape.textContent).toContain('© 2026 NephroSmart — RCP Creative');
    expect(within(rodape).getByRole('link', { name: 'Privacidade' }).getAttribute('href')).toBe('/privacidade');
  });
});

describe('Cabeçalho do celular', () => {
  it('na Home não há cabeçalho; nas ferramentas mostra o título', () => {
    estado.caminho = '/';
    const { unmount } = renderComTema(<AppShell><p>x</p></AppShell>);
    expect(screen.queryByRole('button', { name: 'Voltar' })).toBeNull();
    unmount();
    estado.caminho = '/ferramentas/ckd-epi-2021';
    renderComTema(<AppShell><p>x</p></AppShell>);
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('CKD-EPI 2021');
  });
  it('páginas legais têm título no cabeçalho', () => {
    estado.caminho = '/privacidade';
    renderComTema(<AppShell><p>x</p></AppShell>);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Política de Privacidade');
  });
});

describe('Home', () => {
  it('apresentação, módulos e aviso legal do site', () => {
    renderComTema(<Home />);
    expect(screen.getByText(/Ferramentas clínicas para médicos e profissionais de saúde\./)).toBeTruthy();
    expect(screen.getByText('VERSÃO BETA')).toBeTruthy();
    const modulos = within(screen.getByRole('navigation', { name: 'Módulos' }));
    expect(modulos.getByRole('link', { name: 'Função Renal' }).getAttribute('href')).toBe('/funcao-renal');
    expect(modulos.getByRole('link', { name: /Ajuste de Dose/ }).getAttribute('href')).toBe('/ajuste-de-dose');
    expect(modulos.getByRole('link', { name: 'Ferramentas Clínicas' }).getAttribute('href')).toBe('/ferramentas');
    expect(screen.getByText(/Não realiza diagnóstico, não prescreve tratamentos/)).toBeTruthy();
  });
});

describe('Páginas legais portadas do site', () => {
  it('Política de Privacidade', () => {
    renderComTema(<PrivacidadePage />);
    expect(screen.getByRole('heading', { name: 'Política de Privacidade' })).toBeTruthy();
    expect(screen.getByText('Última atualização: 12 de Março de 2026')).toBeTruthy();
  });
  it('Termos de Uso', () => {
    renderComTema(<TermosPage />);
    expect(screen.getByText('Última atualização: 11 de Março de 2026')).toBeTruthy();
    expect(screen.getAllByText(/exclusivamente a médicos e profissionais de saúde legalmente habilitados/).length).toBeGreaterThan(0);
  });
  it('só o e-mail oficial (nefrosmartapp@gmail.com) aparece nas páginas legais', () => {
    for (const Pagina of [PrivacidadePage, TermosPage, ContatoPage]) {
      const { container, unmount } = renderComTema(<Pagina />);
      // lê cada bloco separadamente (o textContent do contêiner cola o fim de uma frase no título seguinte)
      const blocos = Array.from(container.querySelectorAll('p, li, h1, h2, h3, a')).map((e) => e.textContent ?? '');
      const emails = blocos.flatMap((b) => b.match(/[\w.+-]+@[\w-]+(?:\.[a-z]+)+/gi) ?? []);
      expect(emails.length).toBeGreaterThan(0);
      expect(new Set(emails)).toEqual(new Set(['nefrosmartapp@gmail.com']));
      expect(blocos.join(' ')).not.toContain('nefrosmart.com.br');
      unmount();
    }
  });
  it('Contato mostra o e-mail', () => {
    renderComTema(<ContatoPage />);
    expect(screen.getByRole('link', { name: /nefrosmartapp@gmail\.com/ }).getAttribute('href')).toBe('mailto:nefrosmartapp@gmail.com');
  });
  it('Excluir Conta: copia o e-mail e informa o prazo', async () => {
    const u = userEvent.setup();
    renderComTema(<ExcluirConta />);
    expect(screen.getByRole('heading', { name: 'Exclusão de Conta' })).toBeTruthy();
    expect(screen.getByText('30 dias úteis')).toBeTruthy();
    expect(screen.getAllByText(/nefrosmartapp@gmail\.com/).length).toBeGreaterThan(0);
  });
});
