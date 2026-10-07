// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ListaFerramentas from '@/components/ferramentas/ListaFerramentas';
import PortaoPremium from '@/components/ui/PortaoPremium';
import { ThemeProvider } from '@/context/ThemeContext';
import { SessaoProvider } from '@/lib/auth/useSessao';
import { porSlug } from '@/lib/tools/catalogo';
import type { Ferramenta } from '@/lib/tools/tipos';

const h = vi.hoisted(() => {
  let resposta: { data: unknown; error: unknown } = { data: null, error: null };
  const cliente = {
    auth: { getSession: vi.fn(), onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })) },
    from: vi.fn(() => ({ select: () => ({ eq: () => ({ single: async () => resposta }) }) })),
  };
  return { cliente, definir: (r: { data: unknown; error: unknown }) => { resposta = r; } };
});
vi.mock('@/lib/supabase/client', () => ({ createClient: () => h.cliente }));
vi.mock('@/lib/supabase/env', () => ({ isSupabaseConfigured: true, SUPABASE_URL: 'x', SUPABASE_KEY: 'y', SUPABASE_SCHEMA: 'public' }));
vi.mock('next/link', () => ({
  default: ({ href, children, ...p }: { href: string; children: React.ReactNode }) => <a href={href} {...p}>{children}</a>,
}));

const logado = () => h.cliente.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'u1', email: 'ana@exemplo.com' } } } });
const perfil = (plano: string, ativo = true, beta_expira: string | null = null) => h.definir({ data: { nome: 'Ana', plano, ativo, beta_expira }, error: null });
const montar = (ui: React.ReactElement) => render(<ThemeProvider><SessaoProvider>{ui}</SessaoProvider></ThemeProvider>);
const PREMIUM = 'ajuste-de-dose'; // não está na lista gratuita

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  h.cliente.auth.getSession.mockResolvedValue({ data: { session: null } });
  h.definir({ data: null, error: null });
});
afterEach(cleanup);

describe('portão premium', () => {
  it('ferramenta gratuita: aparece para visitante, sem login', async () => {
    montar(<PortaoPremium slug="imc"><p>CONTEÚDO</p></PortaoPremium>);
    expect(screen.getByText('CONTEÚDO')).toBeTruthy();
  });
  it('premium + visitante: convida a entrar ou criar conta e NÃO mostra a ferramenta', async () => {
    montar(<PortaoPremium slug={PREMIUM}><p>CONTEÚDO SECRETO</p></PortaoPremium>);
    await screen.findByRole('heading', { name: 'Ferramenta Premium' });
    expect(screen.queryByText('CONTEÚDO SECRETO')).toBeNull();
    expect(screen.getByRole('link', { name: 'Entrar' }).getAttribute('href')).toBe('/entrar');
    expect(screen.getByRole('link', { name: 'Criar conta' }).getAttribute('href')).toBe('/cadastro');
    expect(screen.getByRole('link', { name: 'Ver as ferramentas gratuitas' }).getAttribute('href')).toBe('/ferramentas');
  });
  it('premium + conta gratuita: explica que a assinatura vem em breve (sem botão de login)', async () => {
    logado(); perfil('free');
    montar(<PortaoPremium slug={PREMIUM}><p>CONTEÚDO SECRETO</p></PortaoPremium>);
    await screen.findByText(/A assinatura estará disponível em breve/);
    expect(screen.queryByText('CONTEÚDO SECRETO')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Entrar' })).toBeNull();
    expect(screen.getByRole('link', { name: 'nefrosmartapp@gmail.com' }).getAttribute('href')).toBe('mailto:nefrosmartapp@gmail.com');
  });
  it.each(['beta', 'premium'])('plano %s: libera a ferramenta', async (plano) => {
    logado(); perfil(plano);
    montar(<PortaoPremium slug={PREMIUM}><p>CONTEÚDO SECRETO</p></PortaoPremium>);
    expect(await screen.findByText('CONTEÚDO SECRETO')).toBeTruthy();
  });
  it('beta vencido volta a ficar bloqueado', async () => {
    logado(); perfil('beta', true, '2020-01-31');
    montar(<PortaoPremium slug={PREMIUM}><p>CONTEÚDO SECRETO</p></PortaoPremium>);
    await screen.findByText(/A assinatura estará disponível em breve/);
    expect(screen.queryByText('CONTEÚDO SECRETO')).toBeNull();
  });
  it('conta suspensa: bloqueada, mesmo com plano premium', async () => {
    logado(); perfil('premium', false);
    montar(<PortaoPremium slug={PREMIUM}><p>CONTEÚDO SECRETO</p></PortaoPremium>);
    await screen.findByText(/Sua conta está suspensa/);
    expect(screen.queryByText('CONTEÚDO SECRETO')).toBeNull();
  });
  it('enquanto verifica o login: mostra "Verificando acesso…" (sem piscar o convite)', async () => {
    h.cliente.auth.getSession.mockReturnValue(new Promise(() => {}));
    montar(<PortaoPremium slug={PREMIUM}><p>CONTEÚDO SECRETO</p></PortaoPremium>);
    expect(screen.getByRole('status').textContent).toBe('Verificando acesso…');
    expect(screen.queryByRole('heading', { name: 'Ferramenta Premium' })).toBeNull();
  });
  it('sem internet, o plano guardado no aparelho continua valendo', async () => {
    logado();
    window.localStorage.setItem('perfilCache', JSON.stringify({ email: 'ana@exemplo.com', nome: 'Ana', plano: 'premium', ativo: true, beta_expira: null }));
    h.definir({ data: null, error: { message: 'Failed to fetch' } });
    montar(<PortaoPremium slug={PREMIUM}><p>CONTEÚDO SECRETO</p></PortaoPremium>);
    expect(await screen.findByText('CONTEÚDO SECRETO')).toBeTruthy();
  });
});

describe('selo Premium na lista de ferramentas', () => {
  const lista = ['imc', PREMIUM].map((s) => porSlug(s) as Ferramenta);
  it('conta gratuita vê o selo só nas premium', async () => {
    logado(); perfil('free');
    montar(<ListaFerramentas ferramentas={lista} />);
    await waitFor(() => expect(screen.getAllByLabelText('Ferramenta Premium').length).toBe(1));
    expect(screen.getByText('Ajuste de Dose').parentElement?.textContent).toContain('Premium');
    expect(screen.getByText('IMC').parentElement?.textContent).not.toContain('Premium');
  });
  it('plano beta não vê selo nenhum', async () => {
    logado(); perfil('beta');
    montar(<ListaFerramentas ferramentas={lista} />);
    await waitFor(() => expect(screen.queryAllByLabelText('Ferramenta Premium').length).toBe(0));
  });
});
