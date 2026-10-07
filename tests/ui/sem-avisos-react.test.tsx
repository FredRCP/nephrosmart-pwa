// @vitest-environment jsdom
// Qualquer aviso do React (HTML inválido como <ul> dentro de <p>, erro de hidratação, key faltando…)
// reprova o teste. Isso pega, antes de o usuário ver, defeitos que só aparecem no console do navegador.
import { cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Home from '@/app/page';
import FuncaoRenal from '@/app/funcao-renal/page';
import AjusteDeDose from '@/app/ajuste-de-dose/page';
import Ferramentas from '@/app/ferramentas/page';
import Privacidade from '@/app/privacidade/page';
import Termos from '@/app/termodeuso/page';
import Contato from '@/app/contato/page';
import ExcluirConta from '@/components/legal/ExcluirConta';
import AppShell from '@/components/shell/AppShell';
import { implementacoes } from '@/app/ferramentas/[slug]/implementacoes';
import { SLUGS_DISPONIVEIS } from '@/lib/tools/disponiveis';
import { renderComTema } from './helpers';

vi.mock('next/navigation', () => ({ usePathname: () => '/', useRouter: () => ({ back: vi.fn(), push: vi.fn() }) }));
vi.mock('next/link', () => ({
  default: ({ href, children, ...p }: { href: string; children: React.ReactNode }) => <a href={href} {...p}>{children}</a>,
}));

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const paginas: [string, () => React.ReactElement][] = [
  ['Home', () => <Home />],
  ['Função Renal', () => <FuncaoRenal />],
  ['Ajuste de Dose (em breve)', () => <AjusteDeDose />],
  ['Ferramentas', () => <Ferramentas />],
  ['Política de Privacidade', () => <Privacidade />],
  ['Termos de Uso', () => <Termos />],
  ['Contato', () => <Contato />],
  ['Excluir Conta', () => <ExcluirConta />],
  ...SLUGS_DISPONIVEIS.map((slug): [string, () => React.ReactElement] => [`ferramenta: ${slug}`, () => <>{implementacoes[slug]()}</>]),
];

describe('páginas renderizam sem avisos do React', () => {
  it.each(paginas)('%s', (_nome, pagina) => {
    const erro = vi.spyOn(console, 'error').mockImplementation(() => {});
    const aviso = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderComTema(<AppShell>{pagina()}</AppShell>);
    expect(erro.mock.calls.map((c) => String(c[0]).slice(0, 160))).toEqual([]);
    expect(aviso.mock.calls.map((c) => String(c[0]).slice(0, 160))).toEqual([]);
  });
});
