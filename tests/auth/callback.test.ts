import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const trocar = vi.hoisted(() => vi.fn());
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ auth: { exchangeCodeForSession: trocar } }) }));
import { GET } from '@/app/auth/callback/route';

const chamar = (qs: string) => GET(new NextRequest(`http://localhost:3000/auth/callback${qs}`));
const destino = (r: Response) => r.headers.get('location');

beforeEach(() => { trocar.mockReset(); });

describe('retorno do link do e-mail', () => {
  it('código válido: vai para o destino interno pedido', async () => {
    trocar.mockResolvedValue({ error: null });
    expect(destino(await chamar('?code=abc&next=/redefinir-senha'))).toBe('http://localhost:3000/redefinir-senha');
    expect(trocar).toHaveBeenCalledWith('abc');
  });
  it('sem "next": vai para a conta', async () => {
    trocar.mockResolvedValue({ error: null });
    expect(destino(await chamar('?code=abc'))).toBe('http://localhost:3000/conta');
  });
  it('NÃO redireciona para sites de fora, mesmo com código válido', async () => {
    trocar.mockResolvedValue({ error: null });
    for (const ruim of ['https://golpe.com', '//golpe.com', '/\\golpe.com']) {
      expect(destino(await chamar(`?code=abc&next=${encodeURIComponent(ruim)}`)), ruim).toBe('http://localhost:3000/conta');
    }
  });
  it('erro inesperado ao trocar o código: volta para Entrar, sem tela de erro', async () => {
    trocar.mockImplementation(async () => { throw new Error('rede caiu'); });
    expect(destino(await chamar('?code=abc'))).toBe('http://localhost:3000/entrar?erro=link');
  });
  it('código inválido/expirado ou ausente: volta para Entrar com aviso', async () => {
    trocar.mockResolvedValue({ error: { message: 'expired' } });
    expect(destino(await chamar('?code=velho'))).toBe('http://localhost:3000/entrar?erro=link');
    expect(destino(await chamar(''))).toBe('http://localhost:3000/entrar?erro=link');
  });
});
