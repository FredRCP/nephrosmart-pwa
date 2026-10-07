import { describe, expect, it } from 'vitest';
import { caminhoSeguro } from '@/lib/auth/caminho';
import { mensagemDeErro } from '@/lib/auth/mensagens';
import { emailValido, validarCadastro, validarSenha } from '@/lib/auth/validacao';

const ok = { nome: 'Ana', email: 'ana@exemplo.com', senha: 'senha-forte-1', confirmacao: 'senha-forte-1', aceite: true };

describe('validação do cadastro', () => {
  it('aceita um cadastro correto', () => expect(validarCadastro(ok)).toBeNull());
  it('e-mail inválido', () => {
    for (const e of ['', 'ana', 'ana@', 'ana@exemplo', 'a na@exemplo.com']) expect(emailValido(e), e).toBe(false);
    expect(emailValido('  ana@exemplo.com  ')).toBe(true);
  });
  it('senha curta, igual ao e-mail ou diferente da confirmação', () => {
    expect(validarSenha('1234567')).toMatch(/pelo menos 8/);
    expect(validarSenha('ANA@exemplo.com', 'ana@exemplo.com')).toMatch(/igual ao e-mail/);
    expect(validarCadastro({ ...ok, confirmacao: 'outra-senha-1' })).toMatch(/não confere/);
  });
  it('exige o aceite dos Termos e da Política', () => {
    expect(validarCadastro({ ...ok, aceite: false })).toMatch(/aceite os Termos/);
  });
  it('nome muito longo', () => expect(validarCadastro({ ...ok, nome: 'x'.repeat(121) })).toMatch(/120/));
});

describe('destino seguro após o login (contra redirecionamento aberto)', () => {
  it('aceita caminhos internos', () => {
    expect(caminhoSeguro('/redefinir-senha')).toBe('/redefinir-senha');
    expect(caminhoSeguro('/ferramentas/imc?x=1')).toBe('/ferramentas/imc?x=1');
  });
  it('usa o padrão quando vazio', () => {
    expect(caminhoSeguro(null)).toBe('/conta');
    expect(caminhoSeguro('')).toBe('/conta');
  });
  it('recusa endereços externos e truques', () => {
    for (const ruim of ['https://golpe.com', 'http://golpe.com', '//golpe.com', '/\\golpe.com', 'golpe.com', 'javascript:alert(1)', '/ok\n//golpe.com']) {
      expect(caminhoSeguro(ruim), ruim).toBe('/conta');
    }
  });
});

describe('mensagens de erro em português', () => {
  it('traduz os erros comuns', () => {
    expect(mensagemDeErro({ code: 'invalid_credentials' })).toBe('E-mail ou senha incorretos.');
    expect(mensagemDeErro({ message: 'Invalid login credentials' })).toBe('E-mail ou senha incorretos.');
    expect(mensagemDeErro({ code: 'email_not_confirmed' })).toMatch(/Confirme seu e-mail/);
    expect(mensagemDeErro({ status: 429 })).toMatch(/Muitas tentativas/);
    expect(mensagemDeErro({ code: 'over_email_send_rate_limit' })).toMatch(/Muitas tentativas/);
  });
  it('erro desconhecido vira mensagem genérica, sem vazar detalhe técnico', () => {
    const m = mensagemDeErro({ message: 'duplicate key value violates unique constraint "x_pkey"' });
    expect(m).toBe('Não foi possível concluir agora. Tente novamente em instantes.');
    expect(m).not.toMatch(/duplicate|constraint/);
  });
});
