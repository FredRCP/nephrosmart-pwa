// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CockcroftGaultCalculator from '@/components/calculators/CockcroftGaultCalculator';
import CKDEPICistatinaCalculator from '@/components/calculators/CKDEPICistatinaCalculator';
import { renderComTema } from './helpers';

let erroConsole: ReturnType<typeof vi.spyOn>;
beforeEach(() => { window.localStorage.clear(); erroConsole = vi.spyOn(console, 'error').mockImplementation(() => {}); });
afterEach(() => { cleanup(); expect(erroConsole, 'avisos do React no console').not.toHaveBeenCalled(); erroConsole.mockRestore(); });

const calcular = (u: ReturnType<typeof userEvent.setup>) => u.click(screen.getByRole('button', { name: 'Calcular' }));

describe('Cockcroft-Gault (interface)', () => {
  it('calcula, mostra o resultado e guarda ultimoClCr', async () => {
    const u = userEvent.setup();
    renderComTema(<CockcroftGaultCalculator />);
    await u.type(screen.getByPlaceholderText('Idade (anos)'), '50');
    await u.type(screen.getByPlaceholderText('Peso (kg)'), '70');
    await u.type(screen.getByPlaceholderText('Creatinina (mg/dL)'), '1,0');
    await u.click(screen.getByRole('button', { name: /Masculino/ }));
    await calcular(u);
    expect(screen.getByRole('status').textContent).toBe('Clearance de Creatinina: 87.5 mL/min');
    expect(window.localStorage.getItem('ultimoClCr')).toBe('87.5');
  });
  it('mulher aplica o fator 0,85', async () => {
    const u = userEvent.setup();
    renderComTema(<CockcroftGaultCalculator />);
    await u.type(screen.getByPlaceholderText('Idade (anos)'), '50');
    await u.type(screen.getByPlaceholderText('Peso (kg)'), '70');
    await u.type(screen.getByPlaceholderText('Creatinina (mg/dL)'), '1');
    await u.click(screen.getByRole('button', { name: /Feminino/ }));
    await calcular(u);
    expect(screen.getByRole('status').textContent).toBe('Clearance de Creatinina: 74.4 mL/min');
  });
  it('campos vazios: mensagem do original e campos marcados; nada é guardado', async () => {
    const u = userEvent.setup();
    renderComTema(<CockcroftGaultCalculator />);
    await calcular(u);
    expect(screen.getByRole('status').textContent).toBe(
      'Por favor, insira uma idade válida (ex.: 50), um peso válido (ex.: 70), uma creatinina válida (ex.: 0.8) e o sexo.');
    expect(screen.getByPlaceholderText('Idade (anos)').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('group', { name: 'Sexo' }).getAttribute('aria-invalid')).toBe('true');
    expect(window.localStorage.getItem('ultimoClCr')).toBeNull();
  });
  it('CG-1: creatinina em µmol/L é recusada com orientação', async () => {
    const u = userEvent.setup();
    renderComTema(<CockcroftGaultCalculator />);
    await u.type(screen.getByPlaceholderText('Idade (anos)'), '50');
    await u.type(screen.getByPlaceholderText('Peso (kg)'), '70');
    await u.type(screen.getByPlaceholderText('Creatinina (mg/dL)'), '88');
    await u.click(screen.getByRole('button', { name: /Masculino/ }));
    await calcular(u);
    expect(screen.getByRole('status').textContent).toContain('divida por 88,4');
    expect(window.localStorage.getItem('ultimoClCr')).toBeNull();
  });
  it('CG-2: menor de 18 anos calcula e mostra o aviso', async () => {
    const u = userEvent.setup();
    renderComTema(<CockcroftGaultCalculator />);
    await u.type(screen.getByPlaceholderText('Idade (anos)'), '10');
    await u.type(screen.getByPlaceholderText('Peso (kg)'), '30');
    await u.type(screen.getByPlaceholderText('Creatinina (mg/dL)'), '0.6');
    await u.click(screen.getByRole('button', { name: /Masculino/ }));
    await calcular(u);
    expect(screen.getByRole('alert').textContent).toContain('adultos (18 anos ou mais)');
    expect(screen.getByRole('status').textContent).toContain('Clearance de Creatinina');
  });
  it('recarregar: sem nada salvo e com valor salvo', async () => {
    const u = userEvent.setup();
    renderComTema(<CockcroftGaultCalculator />);
    await u.click(screen.getByRole('button', { name: 'Recarregar último resultado' }));
    expect(screen.getByRole('status').textContent).toBe('Nenhum ClCr salvo encontrado.');
    window.localStorage.setItem('ultimoClCr', '65.43');
    await u.click(screen.getByRole('button', { name: 'Recarregar último resultado' }));
    expect(screen.getByRole('status').textContent).toBe('Último ClCr salvo: 65.4 mL/min');
  });
  it('Limpar zera tudo', async () => {
    const u = userEvent.setup();
    renderComTema(<CockcroftGaultCalculator />);
    await u.type(screen.getByPlaceholderText('Peso (kg)'), '70');
    await u.click(screen.getByRole('button', { name: 'Limpar campos' }));
    expect((screen.getByPlaceholderText('Peso (kg)') as HTMLInputElement).value).toBe('');
  });
});

describe('CKD-EPI Creatinina + Cistatina C (interface)', () => {
  const preencher = async (u: ReturnType<typeof userEvent.setup>, cr = '1', cis = '1', idade = '50') => {
    await u.type(screen.getByPlaceholderText('Creatinina (mg/dL)'), cr);
    await u.type(screen.getByPlaceholderText('Cistatina C (mg/L)'), cis);
    await u.type(screen.getByPlaceholderText('Idade (anos)'), idade);
    await u.click(screen.getByRole('button', { name: /Masculino/ }));
  };
  it('calcula e guarda ultimoGFR como indexado', async () => {
    const u = userEvent.setup();
    window.localStorage.setItem('ultimoGFR_tipo', 'absoluto'); // sobra de um CKD-EPI com altura e peso
    renderComTema(<CKDEPICistatinaCalculator />);
    await preencher(u);
    await calcular(u);
    expect(screen.getByRole('status').textContent).toBe('eGFR: 88.1 mL/min/1.73m²');
    expect(parseFloat(window.localStorage.getItem('ultimoGFR')!)).toBeCloseTo(88.1, 1);
    expect(window.localStorage.getItem('ultimoGFR_tipo')).toBe('indexado');
  });
  it('com DRC e ACR mostra a classificação G/A', async () => {
    const u = userEvent.setup();
    renderComTema(<CKDEPICistatinaCalculator />);
    await preencher(u);
    await u.click(screen.getByLabelText('Paciente com DRC'));
    await u.type(screen.getByPlaceholderText('Relação Albumina/Creatinina (mg/g)'), '45');
    await calcular(u);
    expect(screen.getByRole('status').textContent).toBe('eGFR: 88.1 mL/min/1.73m²\nClassificação DRC: G2 A2');
  });
  it('DRC marcado sem ACR: mensagem do original, campo marcado', async () => {
    const u = userEvent.setup();
    renderComTema(<CKDEPICistatinaCalculator />);
    await preencher(u);
    await u.click(screen.getByLabelText('Paciente com DRC'));
    await calcular(u);
    expect(screen.getByRole('status').textContent).toBe('Por favor, insira uma relação albumina/creatinina válida.');
    expect(screen.getByPlaceholderText('Relação Albumina/Creatinina (mg/g)').getAttribute('aria-invalid')).toBe('true');
  });
  it('vazio: lista as pendências como o original', async () => {
    const u = userEvent.setup();
    renderComTema(<CKDEPICistatinaCalculator />);
    await calcular(u);
    expect(screen.getByRole('status').textContent).toBe('Por favor, insira uma creatinina válida, uma cistatina C válida, uma idade válida e o sexo.');
  });
  it('CYS-1: cistatina fora da faixa é recusada', async () => {
    const u = userEvent.setup();
    renderComTema(<CKDEPICistatinaCalculator />);
    await preencher(u, '1', '100');
    await calcular(u);
    expect(screen.getByRole('status').textContent).toContain('Cistatina C fora da faixa esperada');
    expect(window.localStorage.getItem('ultimoGFR')).toBeNull();
  });
  it('CYS-2: menor de 18 anos mostra o aviso', async () => {
    const u = userEvent.setup();
    renderComTema(<CKDEPICistatinaCalculator />);
    await preencher(u, '0.6', '0.9', '12');
    await calcular(u);
    expect(screen.getByRole('alert').textContent).toContain('adultos (18 anos ou mais)');
  });
  it('CYS-3: recarregar rotula o valor absoluto guardado pelo CKD-EPI', async () => {
    const u = userEvent.setup();
    window.localStorage.setItem('ultimoGFR', '95.26');
    window.localStorage.setItem('ultimoGFR_tipo', 'absoluto');
    renderComTema(<CKDEPICistatinaCalculator />);
    await u.click(screen.getByRole('button', { name: 'Recarregar último resultado' }));
    expect(screen.getByRole('status').textContent).toBe('Último GFR salvo: 95.3 mL/min (valor absoluto, desindexado)');
  });
});
