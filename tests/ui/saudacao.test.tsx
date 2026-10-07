// @vitest-environment jsdom
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Home from '@/app/page';
import AppShell from '@/components/shell/AppShell';
import { SessaoProvider } from '@/lib/auth/useSessao';
import { renderComTema } from './helpers';

const h = vi.hoisted(() => {
  let resposta: { data: unknown; error: unknown } = { data: null, error: null };
  const from = vi.fn(() => ({ select: () => ({ eq: () => ({ single: async () => resposta }) }) }));
  const cliente = {
    auth: { getSession: vi.fn(), onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })) },
    from,
  };
  return { cliente, definir: (r: { data: unknown; error: unknown }) => { resposta = r; } };
});
vi.mock('@/lib/supabase/client', () => ({ createClient: () => h.cliente }));
vi.mock('@/lib/supabase/env', () => ({ isSupabaseConfigured: true, SUPABASE_URL: 'x', SUPABASE_KEY: 'y', SUPABASE_SCHEMA: 'public' }));
vi.mock('next/navigation', () => ({ usePathname: () => '/', useRouter: () => ({ push: vi.fn(), back: vi.fn() }) }));
vi.mock('next/link', () => ({
  default: ({ href, children, ...p }: { href: string; children: React.ReactNode }) => <a href={href} {...p}>{children}</a>,
}));

const logado = (email = 'ana@exemplo.com') => h.cliente.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'u1', email } } } });
const app = () => renderComTema(<SessaoProvider><AppShell><Home /></AppShell></SessaoProvider>);

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  h.cliente.auth.getSession.mockResolvedValue({ data: { session: null } });
  h.definir({ data: null, error: null });
});
afterEach(cleanup);

describe('saudação e situação do login', () => {
  it('visitante: "Usuário" e nenhum aviso de conexão', async () => {
    app();
    await waitFor(() => expect(screen.getByTestId('saudacao').textContent).toMatch(/^(Bom dia|Boa tarde|Boa noite), Usuário$/));
    expect(screen.queryByTestId('situacao-login')).toBeNull();
    expect(screen.getByTestId('atalho-conta').textContent).toBe('Entrar');
  });
  it('logado: cumprimenta pelo primeiro nome e mostra "Conectado · Plano ..."', async () => {
    logado();
    h.definir({ data: { nome: 'Ana Maria', plano: 'beta', ativo: true, beta_expira: '2099-12-31' }, error: null });
    app();
    await waitFor(() => expect(screen.getByTestId('saudacao').textContent).toMatch(/^(Bom dia|Boa tarde|Boa noite), Ana$/));
    expect(screen.getByTestId('situacao-login').textContent).toBe('Conectado · Plano Beta');
    expect(screen.getByTestId('atalho-conta').textContent).toBe('👤 Ana');
    expect(screen.getByTestId('atalho-conta').getAttribute('href')).toBe('/conta');
  });
  it('logado com conta suspensa: mostra o aviso', async () => {
    logado();
    h.definir({ data: { nome: null, plano: 'free', ativo: false, beta_expira: null }, error: null });
    app();
    await waitFor(() => expect(screen.getByTestId('situacao-login').textContent).toBe('Conectado · conta suspensa'));
    expect(screen.getByTestId('saudacao').textContent).toMatch(/, Ana$/); // sem nome: usa o e-mail
  });
  it('beta vencido aparece como plano Gratuito', async () => {
    logado();
    h.definir({ data: { nome: 'Ana', plano: 'beta', ativo: true, beta_expira: '2020-01-31' }, error: null });
    app();
    await waitFor(() => expect(screen.getByTestId('situacao-login').textContent).toBe('Conectado · Plano Gratuito'));
  });
  it('sem internet: usa o que ficou guardado neste aparelho', async () => {
    logado();
    window.localStorage.setItem('perfilCache', JSON.stringify({ email: 'ana@exemplo.com', nome: 'Ana Maria', plano: 'premium', ativo: true, beta_expira: null }));
    h.definir({ data: null, error: { message: 'Failed to fetch' } });
    app();
    await waitFor(() => expect(screen.getByTestId('saudacao').textContent).toMatch(/, Ana$/));
    expect(screen.getByTestId('situacao-login').textContent).toBe('Conectado · Plano Premium');
  });
  it('o cache de outra pessoa NÃO é mostrado', async () => {
    logado('bia@exemplo.com');
    window.localStorage.setItem('perfilCache', JSON.stringify({ email: 'ana@exemplo.com', nome: 'Ana', plano: 'premium', ativo: true, beta_expira: null }));
    h.definir({ data: null, error: { message: 'Failed to fetch' } });
    app();
    await waitFor(() => expect(screen.getByTestId('saudacao').textContent).toMatch(/, Bia$/));
    expect(screen.getByTestId('situacao-login').textContent).not.toMatch(/Premium/);
  });
  it('o menu da engrenagem mostra o e-mail sob "Minha conta"', async () => {
    logado();
    h.definir({ data: { nome: 'Ana', plano: 'free', ativo: true, beta_expira: null }, error: null });
    app();
    const { default: userEvent } = await import('@testing-library/user-event');
    const u = userEvent.setup();
    const botoes = await screen.findAllByRole('button', { name: 'Configurações' });
    await u.click(botoes[0]);
    const item = within(await screen.findByRole('menu')).getByRole('menuitem', { name: /Minha conta/ });
    expect(item.textContent).toContain('ana@exemplo.com');
  });
  it('se a leitura da sessão falhar, o "Entrar" aparece (não fica escondido para sempre)', async () => {
    h.cliente.auth.getSession.mockRejectedValue(new Error('storage indisponível'));
    app();
    await waitFor(() => expect(screen.getByTestId('atalho-conta').textContent).toBe('Entrar'));
    expect(screen.getByTestId('saudacao').textContent).toMatch(/, Usuário$/);
  });
  it('sem avisos do React', async () => {
    const erro = vi.spyOn(console, 'error').mockImplementation(() => {});
    logado();
    h.definir({ data: { nome: 'Ana', plano: 'free', ativo: true, beta_expira: null }, error: null });
    app();
    await new Promise((r) => setTimeout(r, 40));
    expect(erro.mock.calls.map((c) => String(c[0]).slice(0, 120))).toEqual([]);
    erro.mockRestore();
  });
});
