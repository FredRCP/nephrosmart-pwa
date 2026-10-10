// @vitest-environment jsdom
import { act, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children, ...p }: { href: string; children: React.ReactNode }) => <a href={href} {...p}>{children}</a>,
}));

beforeEach(() => { window.localStorage.clear(); window.sessionStorage.clear(); vi.useFakeTimers(); vi.resetModules(); });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('Som de abertura', () => {
  it('se o navegador bloquear o som automático, toca no primeiro toque do usuário (uma vez só)', async () => {
    const play = vi.fn()
      .mockRejectedValueOnce(new Error('NotAllowedError')) // tentativa automática bloqueada
      .mockResolvedValue(undefined);                       // depois do toque
    vi.stubGlobal('Audio', vi.fn(function () { return { play }; }));
    const { default: Home } = await import('@/app/page');
    const { renderComTema } = await import('./helpers');
    renderComTema(<Home />);
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(play).toHaveBeenCalledTimes(1);
    await act(async () => { document.dispatchEvent(new Event('pointerdown')); await vi.advanceTimersByTimeAsync(10); });
    expect(play).toHaveBeenCalledTimes(2);
    await act(async () => { document.dispatchEvent(new Event('pointerdown')); await vi.advanceTimersByTimeAsync(10); });
    expect(play).toHaveBeenCalledTimes(2);
  });
  it('se o som automático funcionar, não fica esperando toque', async () => {
    const play = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('Audio', vi.fn(function () { return { play }; }));
    const { default: Home } = await import('@/app/page');
    const { renderComTema } = await import('./helpers');
    renderComTema(<Home />);
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    await act(async () => { document.dispatchEvent(new Event('pointerdown')); await vi.advanceTimersByTimeAsync(10); });
    expect(play).toHaveBeenCalledTimes(1);
  });
});
