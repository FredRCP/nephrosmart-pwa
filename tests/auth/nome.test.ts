import { describe, expect, it } from 'vitest';
import { primeiroNome } from '@/lib/auth/nome';

describe('primeiro nome para a saudação', () => {
  it('usa o primeiro nome do perfil', () => expect(primeiroNome('ana maria silva', 'x@y.com')).toBe('Ana'));
  it('sem nome, usa a parte do e-mail', () => {
    expect(primeiroNome(null, 'fred@exemplo.com')).toBe('Fred');
    expect(primeiroNome('   ', 'fred@exemplo.com')).toBe('Fred');
  });
  it('sem nada, devolve vazio', () => expect(primeiroNome(null, null)).toBe(''));
});
