// @vitest-environment jsdom
import { cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ConversorInfusao from '@/components/calculators/ConversorInfusao';
import HemodialiseHub from '@/components/hubs/HemodialiseHub';
import Sofa2 from '@/components/calculators/Sofa2';
import VacinasHub from '@/components/hubs/VacinasHub';
import IntoxicacoesHub from '@/components/hubs/IntoxicacoesHub';
import { AGENTES, buscarAgentes } from '@/lib/content/ectr';
import { VACINAS, buscarVacinas, linhasDrc } from '@/lib/content/vacinas';
import { renderComTema } from './helpers';

vi.mock('next/link', () => ({
  default: ({ href, children, ...p }: { href: string; children: React.ReactNode }) => <a href={href} {...p}>{children}</a>,
}));
beforeEach(() => window.localStorage.clear());
afterEach(cleanup);
const resultado = () => screen.getByRole('status').textContent ?? '';

describe('Conversor de infusão (tela)', () => {
  it('noradrenalina 0,1 mcg/kg/min, 80 kg, 16 mg em 250 mL → 7,50 mL/h', async () => {
    const u = userEvent.setup();
    renderComTema(<ConversorInfusao />);
    await u.type(screen.getByPlaceholderText('Quantidade do fármaco na solução'), '16');
    await u.type(screen.getByPlaceholderText('Volume final da solução (mL)'), '250');
    await u.type(screen.getByPlaceholderText('Peso (kg)'), '80');
    await u.type(screen.getByPlaceholderText(/Dose desejada/), '0,1');
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    expect(resultado()).toContain('7,50 mL/h');
    expect(resultado()).toContain('64,0 mcg/mL');
    expect(screen.getByTestId('aviso-reforcado')).toBeTruthy();
  });
  it('sentido inverso troca o campo e converte mL/h em dose', async () => {
    const u = userEvent.setup();
    renderComTema(<ConversorInfusao />);
    await u.click(screen.getByRole('button', { name: 'mL/h → dose' }));
    await u.type(screen.getByPlaceholderText('Quantidade do fármaco na solução'), '16');
    await u.type(screen.getByPlaceholderText('Volume final da solução (mL)'), '250');
    await u.type(screen.getByPlaceholderText('Peso (kg)'), '70');
    await u.type(screen.getByPlaceholderText('Velocidade da bomba (mL/h)'), '10');
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    expect(resultado()).toContain('0,152 mcg/kg/min');
  });
  it('dose sem peso (mg/h) esconde o campo de peso', async () => {
    const u = userEvent.setup();
    renderComTema(<ConversorInfusao />);
    expect(screen.queryByPlaceholderText('Peso (kg)')).toBeTruthy();
    await u.selectOptions(screen.getByLabelText('Unidade da dose'), 'mg/h');
    expect(screen.queryByPlaceholderText('Peso (kg)')).toBeNull();
  });
  it('mistura de UI com mg dá erro; limpar zera', async () => {
    const u = userEvent.setup();
    renderComTema(<ConversorInfusao />);
    await u.type(screen.getByPlaceholderText('Quantidade do fármaco na solução'), '100');
    await u.type(screen.getByPlaceholderText('Volume final da solução (mL)'), '100');
    await u.selectOptions(screen.getByLabelText('Unidade da dose'), 'UI/h');
    await u.type(screen.getByPlaceholderText(/Dose desejada/), '1');
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    expect(resultado()).toContain('compatível');
    await u.click(screen.getByRole('button', { name: 'Limpar campos' }));
    expect(screen.queryByRole('status')).toBeNull();
  });
});

describe('Hub de hemodiálise', () => {
  it('Kt/V: spKt/V 1,42 e URR 70%', async () => {
    const u = userEvent.setup();
    renderComTema(<HemodialiseHub />);
    await u.type(screen.getByPlaceholderText('Ureia pré-diálise (mg/dL)'), '100');
    await u.type(screen.getByPlaceholderText('Ureia pós-diálise (mg/dL)'), '30');
    await u.type(screen.getByPlaceholderText('Duração da sessão (horas)'), '4');
    await u.type(screen.getByPlaceholderText('Volume ultrafiltrado (litros)'), '2,5');
    await u.type(screen.getByPlaceholderText('Peso pós-diálise (kg)'), '70');
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    expect(resultado()).toContain('spKt/V: 1,42');
    expect(resultado()).toContain('URR: 70,0%');
    expect(resultado()).not.toContain('eKt/V');
  });
  it('ureia pós maior que a pré dá erro', async () => {
    const u = userEvent.setup();
    renderComTema(<HemodialiseHub />);
    await u.type(screen.getByPlaceholderText('Ureia pré-diálise (mg/dL)'), '50');
    await u.type(screen.getByPlaceholderText('Ureia pós-diálise (mg/dL)'), '60');
    await u.type(screen.getByPlaceholderText('Duração da sessão (horas)'), '4');
    await u.type(screen.getByPlaceholderText('Volume ultrafiltrado (litros)'), '2');
    await u.type(screen.getByPlaceholderText('Peso pós-diálise (kg)'), '70');
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    expect(resultado()).toContain('menor que a pré-diálise');
  });
  it('aba Taxa de UF: 3,38 L, 65 kg, 4 h → 13,0 mL/kg/h (alta)', async () => {
    const u = userEvent.setup();
    renderComTema(<HemodialiseHub />);
    await u.click(screen.getByRole('tab', { name: 'Taxa de UF' }));
    expect(screen.getByTestId('descricao-aba').textContent).toContain('mL/kg/h');
    await u.type(screen.getByPlaceholderText('Volume a ultrafiltrar (litros)'), '3,38');
    await u.type(screen.getByPlaceholderText('Peso seco (kg)'), '65');
    await u.type(screen.getByPlaceholderText('Duração da sessão (horas)'), '4');
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    expect(resultado()).toContain('13,0 mL/kg/h');
    expect(resultado()).toContain('Taxa alta');
  });
});

describe('SOFA-2 (tela)', () => {
  it('soma os sistemas e mostra o detalhe', async () => {
    const u = userEvent.setup();
    renderComTema(<Sofa2 />);
    await u.type(screen.getByPlaceholderText('PaO₂ (mmHg)'), '70');
    await u.type(screen.getByPlaceholderText('FiO₂ (%)'), '50');
    await u.click(screen.getByLabelText(/Suporte ventilatório avançado/));
    await u.type(screen.getByPlaceholderText('Plaquetas (×10³/µL)'), '90');
    await u.type(screen.getByPlaceholderText('Noradrenalina base (µg/kg/min)'), '0,25');
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    expect(resultado()).toContain('SOFA-2: 8 / 24'); // resp 3 + plaq 2 + cardio 3
    expect(resultado()).toContain('Respiratório: 3');
    expect(within(screen.getByTestId('detalhe-sofa')).getByText(/Coagulação: plaquetas 90/)).toBeTruthy();
    expect(document.body.textContent).toContain('Sem dado em: Fígado');
  });
  it('sem nenhum dado, pede ao menos um parâmetro', async () => {
    const u = userEvent.setup();
    renderComTema(<Sofa2 />);
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    expect(resultado()).toContain('pelo menos um parâmetro');
  });
  it('trocar a unidade muda os rótulos', async () => {
    const u = userEvent.setup();
    renderComTema(<Sofa2 />);
    await u.click(screen.getByRole('button', { name: 'µmol/L' }));
    expect(screen.getByPlaceholderText('Bilirrubina total (µmol/L)')).toBeTruthy();
    expect(screen.getByPlaceholderText('Creatinina (µmol/L)')).toBeTruthy();
  });
});

describe('Vacinas do adulto', () => {
  it('alterna entre adulto e adulto com DRC', async () => {
    const u = userEvent.setup();
    renderComTema(<VacinasHub inicial="adultos" />);
    expect(screen.queryByRole('button', { name: /Regras gerais na DRC/ })).toBeNull();
    await u.click(screen.getByRole('button', { name: /Hepatite B/ }));
    expect(document.body.textContent).toContain('3 doses: 0, 1 e 6 meses.');
    await u.click(screen.getByRole('button', { name: 'Adulto com DRC' }));
    expect(screen.getByRole('button', { name: /Regras gerais na DRC/ })).toBeTruthy();
    expect(document.body.textContent).toContain('DOBRO do volume');
    expect(document.body.textContent).not.toContain('3 doses: 0, 1 e 6 meses.');
  });
  it('filtro por fase da DRC mostra só as linhas do grupo', async () => {
    const u = userEvent.setup();
    renderComTema(<VacinasHub inicial="drc" />);
    await u.click(screen.getByRole('button', { name: /Hepatite B/ }));
    expect(document.body.textContent).toContain('Diálise: Repetir o anti-HBs');
    await u.click(screen.getByRole('button', { name: 'Diálise' }));
    expect(document.body.textContent).toContain('Repetir o anti-HBs todo ano');
    expect(document.body.textContent).not.toContain('Diálise: Repetir');
    await u.click(screen.getByRole('button', { name: 'Não dialítica' }));
    expect(document.body.textContent).not.toContain('Repetir o anti-HBs todo ano');
    expect(document.body.textContent).toContain('Vacinar cedo');
  });
  it('busca sem acento e vazia', async () => {
    const u = userEvent.setup();
    renderComTema(<VacinasHub inicial="drc" />);
    await u.type(screen.getByPlaceholderText(/Buscar vacina/), 'zoster');
    expect(screen.getByRole('button', { name: /Herpes-zóster/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Influenza/ })).toBeNull();
    await u.clear(screen.getByPlaceholderText(/Buscar vacina/));
    await u.type(screen.getByPlaceholderText(/Buscar vacina/), 'xyzxyz');
    expect(screen.getByText('Nenhuma vacina encontrada.')).toBeTruthy();
  });
  it('vivas são marcadas e o dado é consistente', () => {
    expect(VACINAS.filter((v) => v.vivo).map((v) => v.id).sort()).toEqual(['febreAmarela', 'triplice', 'varicela']);
    expect(new Set(VACINAS.map((v) => v.id)).size).toBe(VACINAS.length);
    for (const v of VACINAS) { expect(v.geral.length, v.id).toBeGreaterThan(0); expect(v.drc.length, v.id).toBeGreaterThan(0); }
    expect(buscarVacinas(VACINAS, 'ZÓSTER')).toHaveLength(1);
    expect(buscarVacinas(VACINAS, '')).toHaveLength(VACINAS.length);
    const hepB = VACINAS.find((v) => v.id === 'hepatiteB')!;
    expect(linhasDrc(hepB, 'todos').length).toBeGreaterThan(linhasDrc(hepB, 'dialise').length);
    expect(linhasDrc(hepB, 'dialise')).not.toEqual(linhasDrc(hepB, 'naoDialitica'));
    expect(linhasDrc(hepB, 'todos').some((l) => l.startsWith('Diálise: '))).toBe(true);
  });
  it('não repete erros do app antigo e não traz itens ainda em pesquisa', () => {
    const texto = JSON.stringify(VACINAS).toLowerCase();
    for (const t of ['hib', 'raiva', 'bcg', 'dengue', 'covid', 'meningoc', 'sincicial']) expect(texto, t).not.toContain(t);
    expect(VACINAS.find((v) => v.id === 'hpv')!.geral.join(' ')).toContain('3 doses');
    expect(VACINAS.find((v) => v.id === 'hepatiteB')!.drc.join(' ')).toContain('DOBRO do volume');
  });
});

describe('Intoxicações exógenas — indicação de depuração', () => {
  it('lista os agentes, filtra por categoria e busca', async () => {
    const u = userEvent.setup();
    renderComTema(<IntoxicacoesHub />);
    expect(screen.getByRole('button', { name: /Lítio/ })).toBeTruthy();
    await u.click(screen.getByRole('button', { name: 'Em geral não depurar' }));
    expect(screen.queryByRole('button', { name: /Lítio/ })).toBeNull();
    expect(screen.getByRole('button', { name: /Antidepressivos tricíclicos/ })).toBeTruthy();
    await u.click(screen.getByRole('button', { name: 'Todos' }));
    await u.type(screen.getByPlaceholderText(/Buscar agente/), 'aspirina');
    expect(screen.getByRole('button', { name: /Salicilato/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Lítio/ })).toBeNull();
  });
  it('card do lítio mostra graus, modalidade e quando parar', async () => {
    const u = userEvent.setup();
    renderComTema(<IntoxicacoesHub />);
    await u.click(screen.getByRole('button', { name: /Lítio/ }));
    const txt = document.body.textContent ?? '';
    expect(txt).toContain('Recomendado:');
    expect(txt).toContain('lítio > 4,0 mEq/L');
    expect(txt).toContain('Sugerido:');
    expect(txt).toContain('Quando parar:');
    expect(txt).toContain('Decker');
  });
  it('dados: todo agente "indicar" tem critérios e todo "não indicar" tem justificativa', () => {
    expect(new Set(AGENTES.map((a) => a.id)).size).toBe(AGENTES.length);
    for (const a of AGENTES) {
      expect(a.fonte, a.id).toBeTruthy();
      expect(a.resumo, a.id).toBeTruthy();
      if (a.categoria === 'indicar') expect(a.criterios?.length, a.id).toBeGreaterThan(0);
      if (a.categoria === 'nao-indicar') expect((a.contra?.length ?? 0) > 0, a.id).toBe(true);
    }
    expect(buscarAgentes(AGENTES, 'zzz', 'todas')).toHaveLength(0);
    expect(buscarAgentes(AGENTES, '', 'indicar').every((a) => a.categoria === 'indicar')).toBe(true);
  });
  it('limiares-chave do EXTRIP estão nos dados (valproato 1.300; metanol pH 7,15; lítio 4,0)', () => {
    const t = (id: string) => JSON.stringify(AGENTES.find((a) => a.id === id));
    expect(t('valproato')).toContain('1.300 mg/L');
    expect(t('valproato')).not.toContain('> 1000');
    expect(t('metanol')).toContain('pH ≤ 7,15');
    expect(t('litio')).toContain('4,0 mEq/L');
    for (const id of ['etilenoglicol', 'digoxina', 'talio', 'dabigatrana', 'isopropanol', 'outros']) expect(AGENTES.some((a) => a.id === id), id).toBe(false);
    expect(t('salicilato')).toContain('100 mg/dL');
    expect(t('metformina')).toContain('20 mmol/L');
    expect(t('teofilina')).toContain('100 mg/L');
  });
});
