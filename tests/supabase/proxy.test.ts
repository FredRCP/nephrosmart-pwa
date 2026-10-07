import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({ criar: vi.fn(), configurado: { valor: true } }));
vi.mock('@supabase/ssr', () => ({ createServerClient: h.criar }));
vi.mock('@/lib/supabase/env', () => ({
  get isSupabaseConfigured() { return h.configurado.valor; },
  SUPABASE_URL: 'https://abc.supabase.co',
  SUPABASE_KEY: 'chave-publica',
}));
import { proxy } from '@/proxy';

const pedido = () => new NextRequest('http://localhost:3000/ferramentas/imc');
beforeEach(() => { h.criar.mockReset(); h.configurado.valor = true; vi.spyOn(console, 'error').mockImplementation(() => {}); });
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe('proxy: o site nunca pode cair por causa do login', () => {
  it('sem configuração: segue direto, sem tocar no Supabase', async () => {
    h.configurado.valor = false;
    const r = await proxy(pedido());
    expect(r.status).toBe(200);
    expect(h.criar).not.toHaveBeenCalled();
  });
  it('funcionamento normal: renova a sessão e segue', async () => {
    const getUser = vi.fn().mockResolvedValue({ data: { user: null }, error: null });
    h.criar.mockReturnValue({ auth: { getUser } });
    const r = await proxy(pedido());
    expect(r.status).toBe(200);
    expect(getUser).toHaveBeenCalledOnce();
  });
  it('o cliente do Supabase lança erro ao ser criado (ex.: URL inválida): a página abre mesmo assim', async () => {
    h.criar.mockImplementation(() => { throw new Error('Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.'); });
    const r = await proxy(pedido());
    expect(r.status).toBe(200);
  });
  it('o Supabase está fora do ar (a consulta falha): a página abre mesmo assim', async () => {
    h.criar.mockReturnValue({ auth: { getUser: vi.fn().mockRejectedValue(new Error('fetch failed')) } });
    expect((await proxy(pedido())).status).toBe(200);
  });
  it('o Supabase trava (nunca responde): desiste em poucos segundos e abre a página', async () => {
    vi.useFakeTimers();
    h.criar.mockReturnValue({ auth: { getUser: () => new Promise(() => {}) } });
    const andamento = proxy(pedido());
    await vi.advanceTimersByTimeAsync(2600);
    const r = await andamento;
    expect(r.status).toBe(200);
  });
  it('o erro é registrado no log, sem derrubar nada', async () => {
    h.criar.mockImplementation(() => { throw new Error('quebrou'); });
    await proxy(pedido());
    expect(console.error).toHaveBeenCalled();
  });
});
