// @vitest-environment jsdom
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AppShell from '@/components/shell/AppShell';
import Home from '@/app/page';
import PrivacidadePage from '@/app/privacidade/page';
import TermosPage from '@/app/termodeuso/page';
import ContatoPage from '@/app/contato/page';
import ExcluirConta from '@/components/legal/ExcluirConta';
import FormEntrar from '@/components/auth/FormEntrar';
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

describe('iPhone e desktop: barras e margens', () => {
  it('faixa inferior (sob o indicador de início) existe, só no celular, na cor final do fundo', () => {
    renderComTema(<AppShell><p>x</p></AppShell>);
    const faixa = screen.getByTestId('faixa-inferior');
    expect(faixa.className).toContain('h-[env(safe-area-inset-bottom)]');
    expect(faixa.className).toContain('md:hidden');
    expect(faixa.getAttribute('style')).toContain('background-color');
  });
  it('menu azul mostra o ícone do rim ao lado do título', () => {
    renderComTema(<AppShell><p>x</p></AppShell>);
    const nav = screen.getByRole('navigation', { name: 'Principal' });
    expect(nav.querySelector('img[src="/icons/icon-192.png"]')).toBeTruthy();
  });
  it('menu azul ocupa a largura toda (título à esquerda, navegação à direita), sem contêiner centralizado', () => {
    renderComTema(<AppShell><p>x</p></AppShell>);
    const nav = screen.getByRole('navigation', { name: 'Principal' });
    const linha = nav.firstElementChild as HTMLElement;
    expect(linha.className).toContain('w-full');
    expect(linha.className).toContain('justify-between');
    expect(linha.className).not.toContain('max-w');
  });
  it('na Home, a saudação sai do contêiner central e vai para a esquerda no desktop', () => {
    renderComTema(<Home />);
    const saud = screen.getByTestId('saudacao').parentElement!.parentElement!;
    expect(saud.className).toContain('md:fixed');
    expect(saud.className).toContain('md:left-8');
  });
});

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
      ['🌙Tema Escuro', '✉️Contato', 'ℹ️Sobre', '📄Termos de Uso', '🔒Política de Privacidade', '🗑️Excluir Conta'],
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

describe('Home: logotipo oficial', () => {
  it('mostra o logotipo NephroSmart como título da página', () => {
    renderComTema(<Home />);
    const titulo = screen.getByRole('heading', { level: 1 });
    const imagem = within(titulo).getByRole('img', { name: 'NephroSmart' });
    expect(imagem.getAttribute('src')).toBe('/images/ns1a.webp');
  });
  it('no tema escuro o logotipo ganha fundo claro (azul sobre escuro não se lê)', () => {
    window.localStorage.setItem('theme', 'dark');
    renderComTema(<Home />);
    return waitFor(() => expect(screen.getByRole('heading', { level: 1 }).className).toContain('bg-white'));
  });
});

describe('login não configurado (ex.: site publicado sem as chaves do Supabase)', () => {
  it('explica o que fazer: .env.local no computador, variáveis e novo deploy na Vercel', () => {
    renderComTema(<FormEntrar />);
    const aviso = screen.getByRole('status').textContent ?? '';
    expect(aviso).toContain('.env.local');
    expect(aviso).toContain('Vercel');
    expect(aviso).toContain('novo deploy');
    expect(screen.queryByPlaceholderText('Senha')).toBeNull(); // sem formulário que não funcionaria
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
