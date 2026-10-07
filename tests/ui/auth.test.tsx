// @vitest-environment jsdom
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FormCadastro from '@/components/auth/FormCadastro';
import FormEntrar from '@/components/auth/FormEntrar';
import FormRecuperar from '@/components/auth/FormRecuperar';
import FormRedefinir from '@/components/auth/FormRedefinir';
import PainelConta from '@/components/auth/PainelConta';
import MenuConfiguracoes from '@/components/shell/MenuConfiguracoes';
import { VERSAO_PRIVACIDADE, VERSAO_TERMOS } from '@/lib/legal/versoes';
import { renderComTema } from './helpers';

const h = vi.hoisted(() => {
  const roteador = { push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), back: vi.fn() };
  let perfil: unknown = null;
  const cliente = {
    auth: {
      signInWithPassword: vi.fn(), signUp: vi.fn(), resetPasswordForEmail: vi.fn(), updateUser: vi.fn(),
      signOut: vi.fn(), getUser: vi.fn(), getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: perfil, error: null }) }) }),
      update: (v: unknown) => ({ eq: async () => cliente.__update(v) }),
    })),
    __update: vi.fn(async (_valores?: unknown) => ({ error: null as { message: string } | null })),
  };
  return { roteador, cliente, definirPerfil: (p: unknown) => { perfil = p; } };
});
vi.mock('@/lib/supabase/client', () => ({ createClient: () => h.cliente }));
vi.mock('@/lib/supabase/env', () => ({ isSupabaseConfigured: true, SUPABASE_URL: 'x', SUPABASE_KEY: 'y', SUPABASE_SCHEMA: 'public' }));
vi.mock('next/navigation', () => ({ useRouter: () => h.roteador, usePathname: () => '/' }));
vi.mock('next/link', () => ({
  default: ({ href, children, ...p }: { href: string; children: React.ReactNode }) => <a href={href} {...p}>{children}</a>,
}));

const cliente = h.cliente;
const auth = cliente.auth;
beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  auth.getSession.mockResolvedValue({ data: { session: null } });
  auth.getUser.mockResolvedValue({ data: { user: null } });
  auth.signOut.mockResolvedValue({ error: null });
  cliente.rpc.mockResolvedValue({ error: null });
  h.definirPerfil(null);
});
afterEach(cleanup);

describe('Entrar', () => {
  it('campos vazios: avisa e não chama o servidor', async () => {
    const u = userEvent.setup();
    renderComTema(<FormEntrar />);
    await u.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(screen.getByRole('alert').textContent).toBe('Informe seu e-mail e sua senha.');
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
  });
  it('senha errada: mensagem em português', async () => {
    auth.signInWithPassword.mockResolvedValue({ error: { code: 'invalid_credentials', status: 400 } });
    const u = userEvent.setup();
    renderComTema(<FormEntrar />);
    await u.type(screen.getByPlaceholderText('E-mail'), 'ana@exemplo.com');
    await u.type(screen.getByPlaceholderText('Senha'), 'errada123');
    await u.click(screen.getByRole('button', { name: 'Entrar' }));
    expect((await screen.findByRole('alert')).textContent).toBe('E-mail ou senha incorretos.');
    expect(h.roteador.push).not.toHaveBeenCalled();
  });
  it('sucesso: envia o e-mail sem espaços e vai para a conta', async () => {
    auth.signInWithPassword.mockResolvedValue({ error: null });
    const u = userEvent.setup();
    renderComTema(<FormEntrar />);
    await u.type(screen.getByPlaceholderText('E-mail'), '  ana@exemplo.com ');
    await u.type(screen.getByPlaceholderText('Senha'), 'senha-forte-1');
    await u.click(screen.getByRole('button', { name: 'Entrar' }));
    await waitFor(() => expect(h.roteador.push).toHaveBeenCalledWith('/conta'));
    expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: 'ana@exemplo.com', password: 'senha-forte-1' });
  });
  it('tem os links de recuperar senha e criar conta', () => {
    renderComTema(<FormEntrar />);
    expect(screen.getByRole('link', { name: 'Esqueci minha senha' }).getAttribute('href')).toBe('/recuperar-senha');
    expect(screen.getByRole('link', { name: 'Criar conta' }).getAttribute('href')).toBe('/cadastro');
  });
});

describe('Cadastro', () => {
  async function preencher(u: ReturnType<typeof userEvent.setup>, { aceite = true, confirmacao = 'senha-forte-1' } = {}) {
    await u.type(screen.getByPlaceholderText('Nome (opcional)'), 'Ana');
    await u.type(screen.getByPlaceholderText('E-mail'), 'ana@exemplo.com');
    await u.type(screen.getByPlaceholderText('Senha (mínimo 8 caracteres)'), 'senha-forte-1');
    await u.type(screen.getByPlaceholderText('Repita a senha'), confirmacao);
    if (aceite) await u.click(screen.getByRole('checkbox'));
  }
  it('exige o aceite dos termos e não chama o servidor', async () => {
    const u = userEvent.setup();
    renderComTema(<FormCadastro />);
    await preencher(u, { aceite: false });
    await u.click(screen.getByRole('button', { name: 'Criar conta' }));
    expect(screen.getByRole('alert').textContent).toMatch(/aceite os Termos/);
    expect(auth.signUp).not.toHaveBeenCalled();
  });
  it('confirmação de senha diferente', async () => {
    const u = userEvent.setup();
    renderComTema(<FormCadastro />);
    await preencher(u, { confirmacao: 'outra-senha-9' });
    await u.click(screen.getByRole('button', { name: 'Criar conta' }));
    expect(screen.getByRole('alert').textContent).toMatch(/não confere/);
  });
  it('sucesso: envia as versões dos termos, o retorno do e-mail e pede para confirmar', async () => {
    auth.signUp.mockResolvedValue({ error: null });
    const u = userEvent.setup();
    renderComTema(<FormCadastro />);
    await preencher(u);
    await u.click(screen.getByRole('button', { name: 'Criar conta' }));
    await screen.findByRole('heading', { name: 'Confirme seu e-mail' });
    const arg = auth.signUp.mock.calls[0][0];
    expect(arg.email).toBe('ana@exemplo.com');
    expect(arg.options.emailRedirectTo).toMatch(/\/auth\/callback\?next=\/conta$/);
    expect(arg.options.data).toEqual({ nome: 'Ana', versao_termos: VERSAO_TERMOS, versao_privacidade: VERSAO_PRIVACIDADE });
    expect(screen.getByRole('status').textContent).toMatch(/mesmo aparelho e navegador/);
  });
  it('links para Termos e Política abrem em outra aba', () => {
    renderComTema(<FormCadastro />);
    expect(screen.getByRole('link', { name: 'Termos de Uso' }).getAttribute('href')).toBe('/termodeuso');
    expect(screen.getByRole('link', { name: 'Política de Privacidade' }).getAttribute('href')).toBe('/privacidade');
  });
});

describe('Recuperar senha', () => {
  it('pede o link e responde igual exista ou não a conta', async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ error: { code: 'user_not_found', message: 'x', status: 400 } });
    const u = userEvent.setup();
    renderComTema(<FormRecuperar />);
    await u.type(screen.getByPlaceholderText('E-mail'), 'ninguem@exemplo.com');
    await u.click(screen.getByRole('button', { name: 'Enviar link' }));
    expect((await screen.findByRole('status')).textContent).toMatch(/Se esse e-mail estiver cadastrado/);
    expect(auth.resetPasswordForEmail.mock.calls[0][1].redirectTo).toMatch(/\/auth\/callback\?next=\/redefinir-senha$/);
  });
  it('mostra erro de limite de tentativas', async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ error: { status: 429, code: 'over_email_send_rate_limit', message: 'rate' } });
    const u = userEvent.setup();
    renderComTema(<FormRecuperar />);
    await u.type(screen.getByPlaceholderText('E-mail'), 'ana@exemplo.com');
    await u.click(screen.getByRole('button', { name: 'Enviar link' }));
    expect((await screen.findByRole('alert')).textContent).toMatch(/Muitas tentativas/);
  });
});

describe('Nova senha', () => {
  it('sem sessão (link expirado ou outro navegador): orienta pedir novo link', async () => {
    renderComTema(<FormRedefinir />);
    expect((await screen.findByRole('alert')).textContent).toMatch(/expirou/);
    expect(screen.getByRole('link', { name: 'Pedir um novo link' }).getAttribute('href')).toBe('/recuperar-senha');
  });
  it('com sessão: valida e salva', async () => {
    auth.getSession.mockResolvedValue({ data: { session: { user: { email: 'ana@exemplo.com' } } } });
    auth.updateUser.mockResolvedValue({ error: null });
    const u = userEvent.setup();
    renderComTema(<FormRedefinir />);
    await u.type(await screen.findByPlaceholderText('Nova senha (mínimo 8 caracteres)'), 'nova-senha-123');
    await u.type(screen.getByPlaceholderText('Repita a nova senha'), 'diferente-123');
    await u.click(screen.getByRole('button', { name: 'Salvar nova senha' }));
    expect(screen.getByRole('alert').textContent).toMatch(/não confere/);
    await u.clear(screen.getByPlaceholderText('Repita a nova senha'));
    await u.type(screen.getByPlaceholderText('Repita a nova senha'), 'nova-senha-123');
    await u.click(screen.getByRole('button', { name: 'Salvar nova senha' }));
    expect((await screen.findByRole('status')).textContent).toBe('Senha alterada com sucesso.');
    expect(auth.updateUser).toHaveBeenCalledWith({ password: 'nova-senha-123' });
  });
});

describe('Minha conta', () => {
  const usuario = { id: 'u1', email: 'ana@exemplo.com' };
  it('sem login: leva para Entrar', async () => {
    renderComTema(<PainelConta />);
    await waitFor(() => expect(h.roteador.replace).toHaveBeenCalledWith('/entrar'));
  });
  it('conta ainda não liberada: mostra "aguardando liberação"', async () => {
    auth.getUser.mockResolvedValue({ data: { user: usuario } });
    h.definirPerfil({ nome: 'Ana', plano: 'free', ativo: false, beta_expira: null });
    renderComTema(<PainelConta />);
    expect((await screen.findByTestId('situacao')).textContent).toMatch(/aguardando liberação/);
    expect(screen.getByText('ana@exemplo.com')).toBeTruthy();
  });
  it('beta liberado mostra a validade; beta vencido avisa', async () => {
    auth.getUser.mockResolvedValue({ data: { user: usuario } });
    h.definirPerfil({ nome: null, plano: 'beta', ativo: true, beta_expira: '2099-12-31' });
    const a = renderComTema(<PainelConta />);
    expect((await screen.findByTestId('situacao')).textContent).toBe('Plano Beta, válido até 31/12/2099.');
    a.unmount();
    h.definirPerfil({ nome: null, plano: 'beta', ativo: true, beta_expira: '2020-01-31' });
    renderComTema(<PainelConta />);
    expect((await screen.findByTestId('situacao')).textContent).toBe('Seu período beta terminou em 31/01/2020.');
  });
  it('salva o nome', async () => {
    auth.getUser.mockResolvedValue({ data: { user: usuario } });
    h.definirPerfil({ nome: 'Ana', plano: 'free', ativo: true, beta_expira: null });
    const u = userEvent.setup();
    renderComTema(<PainelConta />);
    const campo = await screen.findByPlaceholderText('Nome');
    await u.clear(campo); await u.type(campo, '  Ana Maria ');
    await u.click(screen.getByRole('button', { name: 'Salvar nome' }));
    expect((await screen.findByRole('status')).textContent).toBe('Nome salvo.');
    expect(cliente.__update).toHaveBeenCalledWith({ nome: 'Ana Maria' });
  });
  it('sair encerra a sessão e volta para o início', async () => {
    auth.getUser.mockResolvedValue({ data: { user: usuario } });
    h.definirPerfil({ nome: 'Ana', plano: 'free', ativo: true, beta_expira: null });
    const u = userEvent.setup();
    renderComTema(<PainelConta />);
    await u.click(await screen.findByRole('button', { name: 'Sair da conta' }));
    await waitFor(() => expect(h.roteador.push).toHaveBeenCalledWith('/'));
    expect(auth.signOut).toHaveBeenCalled();
  });
  it('excluir só habilita depois de digitar EXCLUIR; apaga no servidor e limpa a sessão local', async () => {
    auth.getUser.mockResolvedValue({ data: { user: usuario } });
    h.definirPerfil({ nome: 'Ana', plano: 'free', ativo: true, beta_expira: null });
    const u = userEvent.setup();
    renderComTema(<PainelConta />);
    const botao = await screen.findByRole('button', { name: 'Excluir definitivamente' });
    expect((botao as HTMLButtonElement).disabled).toBe(true);
    await u.type(screen.getByPlaceholderText('Digite EXCLUIR'), 'excluir');
    expect((botao as HTMLButtonElement).disabled).toBe(true); // minúsculas não valem
    await u.clear(screen.getByPlaceholderText('Digite EXCLUIR'));
    await u.type(screen.getByPlaceholderText('Digite EXCLUIR'), 'EXCLUIR');
    expect((botao as HTMLButtonElement).disabled).toBe(false);
    await u.click(botao);
    await waitFor(() => expect(h.roteador.push).toHaveBeenCalledWith('/entrar?aviso=conta-excluida'));
    expect(cliente.rpc).toHaveBeenCalledWith('excluir_minha_conta');
    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
  });
  it('se a exclusão falhar, a conta NÃO é desconectada e o erro aparece', async () => {
    auth.getUser.mockResolvedValue({ data: { user: usuario } });
    h.definirPerfil({ nome: 'Ana', plano: 'free', ativo: true, beta_expira: null });
    cliente.rpc.mockResolvedValue({ error: { message: 'boom' } });
    const u = userEvent.setup();
    renderComTema(<PainelConta />);
    await u.type(await screen.findByPlaceholderText('Digite EXCLUIR'), 'EXCLUIR');
    await u.click(screen.getByRole('button', { name: 'Excluir definitivamente' }));
    expect((await screen.findByRole('alert')).textContent).toMatch(/Não foi possível concluir/);
    expect(auth.signOut).not.toHaveBeenCalled();
    expect(h.roteador.push).not.toHaveBeenCalled();
  });
});

describe('Menu da engrenagem com login configurado', () => {
  it('visitante vê "Entrar"; logado vê "Minha conta"', async () => {
    const u = userEvent.setup();
    const a = renderComTema(<MenuConfiguracoes variante="barra" />);
    await u.click(screen.getByRole('button', { name: 'Configurações' }));
    expect(within(await screen.findByRole('menu')).getByRole('menuitem', { name: /Entrar/ }).getAttribute('href')).toBe('/entrar');
    a.unmount();
    auth.getSession.mockResolvedValue({ data: { session: { user: { email: 'ana@exemplo.com' } } } });
    renderComTema(<MenuConfiguracoes variante="barra" />);
    await u.click(screen.getByRole('button', { name: 'Configurações' }));
    expect(within(await screen.findByRole('menu')).getByRole('menuitem', { name: /Minha conta/ }).getAttribute('href')).toBe('/conta');
  });
});

describe('sem avisos do React nas telas de conta', () => {
  it.each([['Entrar', FormEntrar], ['Cadastro', FormCadastro], ['Recuperar', FormRecuperar], ['Nova senha', FormRedefinir], ['Conta', PainelConta]] as const)('%s', async (_n, Tela) => {
    const erro = vi.spyOn(console, 'error').mockImplementation(() => {});
    const aviso = vi.spyOn(console, 'warn').mockImplementation(() => {});
    auth.getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.co' } } });
    h.definirPerfil({ nome: 'A', plano: 'free', ativo: true, beta_expira: null });
    renderComTema(<Tela />);
    await new Promise((r) => setTimeout(r, 30));
    expect(erro.mock.calls.map((c) => String(c[0]).slice(0, 120))).toEqual([]);
    expect(aviso.mock.calls.map((c) => String(c[0]).slice(0, 120))).toEqual([]);
    erro.mockRestore(); aviso.mockRestore();
  });
});
