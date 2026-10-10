// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FracoesHub from '@/components/hubs/FracoesHub';
import IraHub from '@/components/hubs/IraHub';
import FuncaoRenalEsperada from '@/components/calculators/FuncaoRenalEsperada';
import SobrePage from '@/app/sobre/page';
import { implementacoes } from '@/app/ferramentas/[slug]/implementacoes';
import { SLUGS_DISPONIVEIS } from '@/lib/tools/disponiveis';
import { catalogo } from '@/lib/tools/catalogo';
import { renderComTema } from './helpers';

vi.mock('next/link', () => ({
  default: ({ href, children, ...p }: { href: string; children: React.ReactNode }) => <a href={href} {...p}>{children}</a>,
}));

beforeEach(() => window.localStorage.clear());
afterEach(cleanup);

const digitar = (u: ReturnType<typeof userEvent.setup>, ph: string | RegExp, v: string) => u.type(screen.getByPlaceholderText(ph), v);
const calcular = (u: ReturnType<typeof userEvent.setup>) => u.click(screen.getByRole('button', { name: 'Calcular' }));
const resultado = () => screen.getByRole('status').textContent ?? '';

describe('registro da Onda 2', () => {
  const slugs = ['injuria-renal-aguda-ira', 'fracao-de-excrecao-de-sodio', 'fracao-de-excrecao-de-ureia', 'fracao-de-excrecao-de-potassio',
    'fracao-de-excrecao-de-calcio', 'fracao-de-excrecao-de-fosforo', 'f-e-de-acido-urico', 'fracao-de-excrecao-de-magnesio', 'funcao-renal-esperada-p-idade'];
  it('os 9 slugs estão ativos e implementados; o TTKG saiu do menu', () => {
    for (const s of slugs) { expect((SLUGS_DISPONIVEIS as readonly string[]).includes(s), s).toBe(true); expect(implementacoes[s], s).toBeTypeOf('function'); }
    expect((SLUGS_DISPONIVEIS as readonly string[]).includes('gradiente-transtubular-de-k')).toBe(false);
    expect(implementacoes['gradiente-transtubular-de-k']).toBeUndefined();
    expect(catalogo.some((f) => f.slug === 'gradiente-transtubular-de-k')).toBe(true); // continua no catálogo, só fora do menu
  });
  it('cada slug abre a aba certa', () => {
    const aba = (slug: string) => { const { unmount } = renderComTema(<>{implementacoes[slug]()}</>); const t = screen.getByRole('tab', { selected: true }).textContent; unmount(); return t; };
    expect(aba('injuria-renal-aguda-ira')).toBe('Injúria Renal Aguda');
    expect(aba('fracao-de-excrecao-de-sodio')).toBe('FENa');
    expect(aba('fracao-de-excrecao-de-ureia')).toBe('FEUr');
    expect(aba('fracao-de-excrecao-de-potassio')).toBe('FEK');
    expect(aba('fracao-de-excrecao-de-calcio')).toBe('FECa');
    expect(aba('fracao-de-excrecao-de-fosforo')).toBe('FEP');
    expect(aba('f-e-de-acido-urico')).toBe('FEUA');
    expect(aba('fracao-de-excrecao-de-magnesio')).toBe('FEMg');
  });
});

describe('Hub Frações de excreção', () => {
  it('FENa: calcula, grava o último valor e mostra o aviso do diurético', async () => {
    const u = userEvent.setup();
    renderComTema(<FracoesHub inicial="sodio" />);
    await digitar(u, 'Sódio urinário (mEq/L)', '20');
    await digitar(u, 'Sódio sérico (mEq/L)', '140');
    await digitar(u, 'Creatinina urinária (mg/dL)', '100');
    await digitar(u, 'Creatinina sérica (mg/dL)', '1,0');
    await calcular(u);
    expect(resultado()).toContain('FENa: 0,14 %');
    expect(resultado()).toContain('pré-renal');
    expect(window.localStorage.getItem('ultimaFENa')).toBe('0.14');
    expect(screen.getByRole('alert').textContent).toContain('FEUr');
  });
  it('FEMg usa a fórmula corrigida (3,97%)', async () => {
    const u = userEvent.setup();
    renderComTema(<FracoesHub inicial="magnesio" />);
    await digitar(u, 'Magnésio urinário (mg/dL)', '5');
    await digitar(u, 'Magnésio sérico (mg/dL)', '1,8');
    await digitar(u, 'Creatinina urinária (mg/dL)', '100');
    await digitar(u, 'Creatinina sérica (mg/dL)', '1');
    await calcular(u);
    expect(resultado()).toContain('FEMg: 3,97 %');
    expect(window.localStorage.getItem('ultimaFEMg')).toBe('3.97');
  });
  it('troca de aba mostra outra fração com os campos vazios; FEK tem contexto clínico', async () => {
    const u = userEvent.setup();
    renderComTema(<FracoesHub inicial="sodio" />);
    await digitar(u, 'Sódio urinário (mEq/L)', '20');
    await u.click(screen.getByRole('tab', { name: 'FEK' }));
    expect(screen.getByPlaceholderText('Potássio urinário (mEq/L)')).toBeTruthy();
    expect((screen.getByPlaceholderText('Potássio urinário (mEq/L)') as HTMLInputElement).value).toBe('');
    await u.click(screen.getByRole('button', { name: 'Hipercalemia' }));
    await digitar(u, 'Potássio urinário (mEq/L)', '20');
    await digitar(u, 'Potássio sérico (mEq/L)', '6');
    await digitar(u, 'Creatinina urinária (mg/dL)', '100');
    await digitar(u, 'Creatinina sérica (mg/dL)', '1');
    await calcular(u);
    expect(resultado()).toContain('FEK: 3,33 %');
    expect(resultado()).toContain('não há ponto de corte');
  });
  it('campo inválido: mostra mensagem de erro e marca o campo', async () => {
    const u = userEvent.setup();
    renderComTema(<FracoesHub inicial="ureia" />);
    await calcular(u);
    expect(resultado()).toContain('Preencha todos os campos');
    expect(screen.getByPlaceholderText('Ureia urinário (mg/dL)').getAttribute('aria-invalid')).toBe('true');
  });
  it('a janela de informações do FENa explica que diurético AUMENTA a FENa', async () => {
    renderComTema(<FracoesHub inicial="sodio" />);
    expect(document.body.textContent).toMatch(/AUMENTAM a FENa/);
  });
});

describe('Hub IRA', () => {
  it('mostra o conteúdo (KDIGO) e a seção de DRA e atalhos para FENa e FEUr', () => {
    renderComTema(<IraHub />);
    expect(screen.getByText('Definição (KDIGO)')).toBeTruthy();
    expect(screen.getByText('DRA — Doença renal aguda')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Calcular FENa' }).getAttribute('href')).toBe('/ferramentas/fracao-de-excrecao-de-sodio');
    expect(screen.getByRole('link', { name: 'Calcular FEUr' }).getAttribute('href')).toBe('/ferramentas/fracao-de-excrecao-de-ureia');
  });
  it('calculadora KDIGO: estágio 2 por creatinina em 7 dias e por diurese', async () => {
    const u = userEvent.setup();
    renderComTema(<IraHub inicial="kdigo" />);
    await digitar(u, 'Creatinina basal (mg/dL)', '1,0');
    await digitar(u, 'Creatinina atual (mg/dL)', '2,1');
    await u.click(screen.getByRole('button', { name: '2 a 7 dias' }));
    await calcular(u);
    expect(resultado()).toContain('Estágio KDIGO 2');
    expect(resultado()).toContain('2,1× a basal');
  });
  it('sem o intervalo informado, não calcula e pede o intervalo', async () => {
    const u = userEvent.setup();
    renderComTema(<IraHub inicial="kdigo" />);
    await digitar(u, 'Creatinina basal (mg/dL)', '1');
    await digitar(u, 'Creatinina atual (mg/dL)', '2');
    await calcular(u);
    expect(resultado()).toContain('intervalo');
  });
  it('terapia renal substitutiva marcada = estágio 3', async () => {
    const u = userEvent.setup();
    renderComTema(<IraHub inicial="kdigo" />);
    await u.click(screen.getByRole('checkbox'));
    await calcular(u);
    expect(resultado()).toContain('Estágio KDIGO 3');
  });
  it('diurese com vírgula: 70,5 kg e 400,5 mL em 12 h → estágio 2', async () => {
    const u = userEvent.setup();
    renderComTema(<IraHub inicial="kdigo" />);
    await digitar(u, 'Peso (kg)', '70,5');
    await digitar(u, 'Volume urinário no período (mL)', '400,5');
    await digitar(u, 'Duração do período (horas)', '12');
    await calcular(u);
    expect(resultado()).toContain('Estágio KDIGO 2');
  });
});

describe('Função renal esperada', () => {
  it('calcula, grava e não mostra marcação markdown', async () => {
    const u = userEvent.setup();
    renderComTema(<FuncaoRenalEsperada />);
    await digitar(u, 'Idade (anos)', '60');
    await calcular(u);
    expect(resultado()).toContain('≈ 80 mL/min/1,73 m²');
    expect(resultado()).not.toContain('**');
    expect(window.localStorage.getItem('ultimaGFR Esperada')).toBe('80');
  });
  it('idade pediátrica é recusada com a indicação do Clearance Pediátrico', async () => {
    const u = userEvent.setup();
    renderComTema(<FuncaoRenalEsperada />);
    await digitar(u, 'Idade (anos)', '10');
    await calcular(u);
    expect(resultado()).toContain('Clearance Pediátrico');
  });
});

describe('Faixa de abas e ícone', () => {
  it('abas: rolagem lateral com ponta esmaecida no celular; largas, quebrando linha e sem rolagem no desktop', () => {
    renderComTema(<FracoesHub />);
    const c = screen.getByRole('tablist').className;
    expect(c).toContain('overflow-x-auto');
    expect(c).toContain('mask-image:linear-gradient');
    expect(c).toContain('sm:flex-wrap');
    expect(c).toContain('sm:overflow-visible');
    expect(screen.getAllByRole('tab')).toHaveLength(7);
  });
});

describe('Informações de cada fração são diferentes', () => {
  it('cada aba tem título e fórmula próprios no modal', async () => {
    const u = userEvent.setup();
    renderComTema(<FracoesHub inicial="sodio" />);
    const esperado: Record<string, string[]> = {
      FENa: ['FENa — informações', 'FENa (%) = (U_Na'], FEUr: ['FEUr — informações', 'FEUr (%) = (U_ureia'], FEK: ['FEK — informações', 'FEK (%) = (U_K'],
      FECa: ['FECa — informações', 'FECa (%) = (U_Ca'], FEP: ['FEP — informações', 'FEP (%) = (U_P'], FEUA: ['FEUA — informações', 'FEUA (%) = (U_ácido úrico'],
      FEMg: ['FEMg — informações', 'FEMg (%) = (U_Mg'],
    };
    for (const [aba, trechos] of Object.entries(esperado)) {
      await u.click(screen.getByRole('tab', { name: aba }));
      const d = document.querySelector('dialog')!.textContent!;
      for (const t of trechos) expect(d, aba).toContain(t);
      expect(document.querySelectorAll('dialog')).toHaveLength(1);
    }
  });
});

describe('Tela Sobre', () => {
  it('mostra o aviso educacional, a versão beta, o desenvolvedor e o contato', () => {
    renderComTema(<SobrePage />);
    expect(document.body.textContent).toContain('apoio educacional e informativo');
    expect(document.body.textContent).toContain('Beta');
    expect(document.body.textContent).toContain('Frederico Rodrigues da Cunha Pereira');
    expect(screen.getByRole('link', { name: /nefrosmartapp@gmail.com/ }).getAttribute('href')).toBe('mailto:nefrosmartapp@gmail.com');
  });
});
