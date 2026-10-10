// @vitest-environment jsdom
import { cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ConteudoPagina from '@/components/archetypes/ConteudoPagina';
import ListaFerramentas from '@/components/ferramentas/ListaFerramentas';
import hipercalemia from '@/lib/content/hipercalemia';
import { ferramentasDisponiveis } from '@/lib/tools/catalogo';
import { renderComTema } from './helpers';

vi.mock('next/link', () => ({
  default: ({ href, children, ...p }: { href: string; children: React.ReactNode }) => <a href={href} {...p}>{children}</a>,
}));

beforeEach(() => window.localStorage.clear());
afterEach(cleanup);

describe('Conteúdo em acordeão (Hipercalemia)', () => {
  it('mostra título, subtítulo e as 5 seções fechadas com o resumo', () => {
    renderComTema(<ConteudoPagina dados={hipercalemia} />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Hipercalemia');
    expect(screen.getByText(/ECG OBRIGATÓRIO/)).toBeTruthy();
    expect(screen.getAllByRole('button', { expanded: false }).length).toBe(5);
    expect(screen.getByText('Cálcio, insulina+glicose, resina...')).toBeTruthy();
    expect(screen.queryByText(/Gluconato de Cálcio 10%/)).toBeNull();
  });
  it('expande o tratamento, com subitens das resinas, e esconde o resumo', async () => {
    const u = userEvent.setup();
    renderComTema(<ConteudoPagina dados={hipercalemia} />);
    await u.click(screen.getByRole('button', { name: /TRATAMENTO/ }));
    expect(screen.getByText(/Gluconato de Cálcio 10% 10-20ml EV/)).toBeTruthy();
    expect(screen.getByText(/LOKELMA/)).toBeTruthy();
    expect(screen.getByText('🚨 Bicarbonato só se acidose confirmada (pH <7.2)')).toBeTruthy();
    expect(screen.queryByText('Cálcio, insulina+glicose, resina...')).toBeNull();
  });
  it('mostra o alerta de hemólise e as etiquetas de causas', async () => {
    const u = userEvent.setup();
    renderComTema(<ConteudoPagina dados={hipercalemia} />);
    expect(screen.getByRole('alert').textContent).toContain('HEMÓLISE? Repetir K+ URGENTE!');
    await u.click(screen.getByRole('button', { name: /PRINCIPAIS CAUSAS/ }));
    expect(screen.getByText('Rabdomiólise')).toBeTruthy();
    expect(screen.getByText('Adrenalectomia')).toBeTruthy();
  });
});

describe('Menu de ferramentas', () => {
  it('lista só as migradas, em ordem alfabética', () => {
    renderComTema(<ListaFerramentas ferramentas={ferramentasDisponiveis} />);
    const titulos = screen.getAllByRole('link').map((a) => a.querySelector('span.truncate')?.textContent);
    expect(titulos).toEqual([
      'Ânion Gap', 'CKD-EPI (Creat + Cistatina C)', 'CKD-EPI 2021', 'Clearance de Creatinina (Ped)', 'Cockcroft-Gault', 'Conversor de Unidades Laboratoriais',
      'Correção de Hipernatremia (Na⁺)', 'Correção de Hiponatremia (Na⁺)', 'Depuração de Creatinina (24 h)', 'Distúrbios Ácido-Base', 'Equivalência de Diuréticos', 'Estadiamento da DRC (KDIGO)', 'Frações de Excreção',
      'Função Renal esperada p/ idade', 'Gasometria Arterial', 'Hipercalemia (Potássio)',
      'Hipernatremia (Sódio)', 'Hiponatremia (Sódio)', 'Hiponatremia Fluxograma (Na⁺)', 'IMC', 'Ingestão Diária de Sódio', 'Injúria Renal Aguda (IRA)', 'Osmolaridade Sérica',
      'Reposição de Bicarbonato',
    ]);
  });
  it('busca sem acento', async () => {
    const u = userEvent.setup();
    renderComTema(<ListaFerramentas ferramentas={ferramentasDisponiveis} />);
    await u.type(screen.getByLabelText('Buscar ferramenta'), 'potassio');
    expect(screen.getAllByRole('link').length).toBe(2); // Hipercalemia (Potássio) e Frações de Excreção (descrição cita potássio)
    await u.clear(screen.getByLabelText('Buscar ferramenta'));
    await u.type(screen.getByLabelText('Buscar ferramenta'), 'zzz');
    expect(screen.getByText('Nenhum resultado encontrado.')).toBeTruthy();
  });
  it('filtra por categoria e avisa quando não há ferramentas migradas nela', async () => {
    const u = userEvent.setup();
    renderComTema(<ListaFerramentas ferramentas={ferramentasDisponiveis} />);
    await u.click(screen.getByRole('tab', { name: 'Eletrólitos' }));
    expect(screen.getAllByRole('link').length).toBe(7);
    await u.click(screen.getByRole('tab', { name: 'Diálise' }));
    expect(screen.getByText('Nenhuma ferramenta desta categoria foi migrada ainda.')).toBeTruthy();
  });
  it('filtros novos: Ácido-base (5), IRA e emergência (IRA) e Outros (IMC); a ferramenta some dos filtros que não são dela', async () => {
    const u = userEvent.setup();
    renderComTema(<ListaFerramentas ferramentas={ferramentasDisponiveis} />);
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['Todos', 'Eletrólitos', 'Ácido-base', 'IRA e emergência', 'Diálise', 'DRC', 'Outros']);
    await u.click(screen.getByRole('tab', { name: 'Ácido-base' }));
    expect(screen.getAllByRole('link')).toHaveLength(5);
    await u.click(screen.getByRole('tab', { name: 'IRA e emergência' }));
    expect(screen.getByText('Injúria Renal Aguda (IRA)')).toBeTruthy();
    await u.click(screen.getByRole('tab', { name: 'Outros' }));
    expect(screen.getByText('IMC')).toBeTruthy();
    await u.click(screen.getByRole('tab', { name: 'DRC' }));
    expect(screen.queryByText('IMC')).toBeNull();
    expect(screen.getByText('CKD-EPI 2021')).toBeTruthy();
  });
  it('favorito sobe para "Favoritos" e persiste', async () => {
    const u = userEvent.setup();
    renderComTema(<ListaFerramentas ferramentas={ferramentasDisponiveis} />);
    await u.click(screen.getByRole('button', { name: 'Adicionar IMC aos favoritos' }));
    expect(screen.getByText('Favoritos')).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem('favoritos')!)).toEqual(['imc']);
    const lista = screen.getAllByRole('list')[0];
    expect(within(lista).getAllByRole('link')[0].textContent).toContain('IMC');
  });
});
