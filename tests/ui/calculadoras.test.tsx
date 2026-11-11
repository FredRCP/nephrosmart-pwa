// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import IMCCalculator from '@/components/calculators/IMCCalculator';
import CKDEPICalculator from '@/components/calculators/CKDEPICalculator';
import { renderComTema } from './helpers';

beforeEach(() => window.localStorage.clear());
afterEach(cleanup);

describe('IMC (interface)', () => {
  it('calcula e classifica', async () => {
    const u = userEvent.setup();
    renderComTema(<IMCCalculator />);
    await u.type(screen.getByPlaceholderText('Peso (kg)'), '70');
    await u.type(screen.getByPlaceholderText('Altura (cm)'), '175');
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    const r = screen.getByRole('status');
    expect(r.textContent).toContain('IMC: 22.9 kg/m²');
    expect(r.textContent).toContain('Classificação: Peso normal');
    expect(window.localStorage.getItem('ultimoIMC')).not.toBeNull();
  });
  it('mostra a mensagem do app original quando faltam dados', async () => {
    const u = userEvent.setup();
    renderComTema(<IMCCalculator />);
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    expect(screen.getByRole('status').textContent).toBe('Por favor, insira um peso válido (ex.: 70.5) e uma altura válida em cm (ex.: 175).');
    expect(screen.getByPlaceholderText('Peso (kg)').getAttribute('aria-invalid')).toBe('true');
  });
  it('IMC-1: altura em metros é recusada, com a orientação de usar centímetros', async () => {
    const u = userEvent.setup();
    renderComTema(<IMCCalculator />);
    await u.type(screen.getByPlaceholderText('Peso (kg)'), '70');
    await u.type(screen.getByPlaceholderText('Altura (cm)'), '1.75');
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    expect(screen.getByRole('status').textContent).toBe('Altura fora da faixa esperada (50 a 250 cm). Digite a altura em centímetros (ex.: 175).');
    expect(screen.getByPlaceholderText('Altura (cm)').getAttribute('aria-invalid')).toBe('true');
    expect(window.localStorage.getItem('ultimoIMC')).toBeNull();
  });
  it('mostra a dica de unidade da altura', () => {
    renderComTema(<IMCCalculator />);
    expect(screen.getByText('Altura em centímetros (ex.: 175)')).toBeTruthy();
  });
  it('Limpar zera tudo', async () => {
    const u = userEvent.setup();
    renderComTema(<IMCCalculator />);
    await u.type(screen.getByPlaceholderText('Peso (kg)'), '70');
    await u.click(screen.getByRole('button', { name: 'Limpar' }));
    expect((screen.getByPlaceholderText('Peso (kg)') as HTMLInputElement).value).toBe('');
  });
});

describe('CKD-EPI 2021 (interface)', () => {
  it('calcula, guarda o último TFG e exibe o resultado', async () => {
    const u = userEvent.setup();
    renderComTema(<CKDEPICalculator />);
    await u.type(screen.getByPlaceholderText('Creatinina (mg/dL)'), '1,0');
    await u.type(screen.getByPlaceholderText('Idade (anos)'), '50');
    await u.click(screen.getByRole('button', { name: /Masculino/ }));
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    expect(screen.getByRole('status').textContent).toContain('91.7 mL/min/1.73m²');
    expect(window.localStorage.getItem('ultimoGFR')).toBe('91.7');
    // CKD-3: avisa que o valor enviado ao Ajuste de Dose é o INDEXADO e registra o tipo
    expect(screen.queryByTestId('envio-ajuste')).toBeNull(); // o aviso foi retirado da tela
    expect(screen.getByRole('status').textContent).not.toContain('Para ajustar dose de medicamentos, abra');
    expect(window.localStorage.getItem('ultimoGFR_tipo')).toBe('indexado');
  });
  it('com altura e peso informa o valor absoluto e guarda ESSE valor para o ajuste de dose', async () => {
    const u = userEvent.setup();
    renderComTema(<CKDEPICalculator />);
    await u.type(screen.getByPlaceholderText('Creatinina (mg/dL)'), '1');
    await u.type(screen.getByPlaceholderText('Idade (anos)'), '50');
    await u.click(screen.getByRole('button', { name: /Feminino/ }));
    await u.click(screen.getByRole('button', { name: /Ajuste de dose/ }));
    await u.type(screen.getByPlaceholderText('Altura (cm)'), '160');
    await u.type(screen.getByPlaceholderText('Peso (kg)'), '60');
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    expect(screen.getByRole('status').textContent).toContain('TFG absoluta (desindexada)');
    // indexada = 68,6 ; absoluta (BSA de 1,62 m²) = 64,4 → é a ABSOLUTA que alimenta o Ajuste de Dose
    expect(screen.getByRole('status').textContent).toContain('68.6 mL/min/1.73m²');
    expect(screen.getByRole('status').textContent).toContain('64.4 mL/min');
    expect(window.localStorage.getItem('ultimoGFR')).toBe('64.4');
    expect(window.localStorage.getItem('ultimoGFR_tipo')).toBe('absoluto');
    expect(screen.queryByTestId('envio-ajuste')).toBeNull();
  });
  it('CKD-1: menor de 18 anos calcula, mas mostra o aviso pediátrico', async () => {
    const u = userEvent.setup();
    renderComTema(<CKDEPICalculator />);
    await u.type(screen.getByPlaceholderText('Creatinina (mg/dL)'), '0,6');
    await u.type(screen.getByPlaceholderText('Idade (anos)'), '12');
    await u.click(screen.getByRole('button', { name: /Masculino/ }));
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    expect(screen.getByRole('alert').textContent).toContain('Em crianças e adolescentes, use o Clearance Pediátrico');
    expect(screen.getByRole('status').textContent).toContain('TFG estimada');
  });
  it('CKD-2: idade acima da faixa e creatinina em µmol/L são recusadas', async () => {
    const u = userEvent.setup();
    renderComTema(<CKDEPICalculator />);
    await u.type(screen.getByPlaceholderText('Creatinina (mg/dL)'), '88');
    await u.type(screen.getByPlaceholderText('Idade (anos)'), '200');
    await u.click(screen.getByRole('button', { name: /Masculino/ }));
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    const msg = screen.getByRole('status').textContent!;
    expect(msg).toContain('Creatinina fora da faixa esperada');
    expect(msg).toContain('Idade fora da faixa esperada (1 a 120 anos).');
    expect(window.localStorage.getItem('ultimoGFR')).toBeNull();
  });
  it('CKD-2: altura em metros no valor desindexado abre a seção e marca o campo', async () => {
    const u = userEvent.setup();
    renderComTema(<CKDEPICalculator />);
    await u.type(screen.getByPlaceholderText('Creatinina (mg/dL)'), '1');
    await u.type(screen.getByPlaceholderText('Idade (anos)'), '50');
    await u.click(screen.getByRole('button', { name: /Masculino/ }));
    await u.click(screen.getByRole('button', { name: /Ajuste de dose/ }));
    await u.type(screen.getByPlaceholderText('Altura (cm)'), '1,70');
    await u.type(screen.getByPlaceholderText('Peso (kg)'), '70');
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    expect(screen.getByPlaceholderText('Altura (cm)').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('status').textContent).toContain('Para o valor desindexado, informe altura');
  });
  it('TXT-1: a janela de informações não diz mais que a albuminúria entra no cálculo da TFG', () => {
    const { container } = renderComTema(<CKDEPICalculator />);
    const texto = container.textContent!;
    expect(texto).not.toContain('opcionalmente, albuminúria');
    expect(texto).toContain('não entra no cálculo da TFG');
  });
  it('exige creatinina, idade e sexo', async () => {
    const u = userEvent.setup();
    renderComTema(<CKDEPICalculator />);
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    expect(screen.getByRole('status').textContent).toBe('Por favor, preencha creatinina, idade e sexo.');
  });
  it('estadiamento com DRC e albuminúria', async () => {
    const u = userEvent.setup();
    renderComTema(<CKDEPICalculator />);
    await u.type(screen.getByPlaceholderText('Creatinina (mg/dL)'), '2.3');
    await u.type(screen.getByPlaceholderText('Idade (anos)'), '70');
    await u.click(screen.getByRole('button', { name: /Masculino/ }));
    await u.click(screen.getByLabelText('Paciente com DRC'));
    await u.type(screen.getByPlaceholderText(/Relação Albumina\/Creatinina/), '120');
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    // 29,8 mL/min/1,73 m² (limite entre G3b e G4) com albuminúria 120 mg/g
    expect(screen.getByRole('status').textContent).toContain('Classificação DRC: G4 A2');
  });
  it('os dois opcionais ficam lado a lado e abrir um fecha o outro', async () => {
    const u = userEvent.setup();
    renderComTema(<CKDEPICalculator />);
    const dose = screen.getByRole('button', { name: /Ajuste de dose/ });
    const drc = screen.getByRole('button', { name: 'Paciente com DRC' });
    expect(dose.parentElement).toBe(drc.parentElement);
    await u.click(dose);
    expect(screen.getByPlaceholderText('Altura (cm)')).toBeTruthy();
    await u.click(drc);
    expect(screen.queryByPlaceholderText('Altura (cm)')).toBeNull();
    expect(screen.getByPlaceholderText(/Relação Albumina\/Creatinina/)).toBeTruthy();
    expect(dose.getAttribute('aria-expanded')).toBe('false');
    await u.click(dose);
    expect(screen.queryByPlaceholderText(/Relação Albumina/)).toBeNull();
    await u.click(dose);
    expect(screen.queryByPlaceholderText('Altura (cm)')).toBeNull(); // clicar de novo fecha
  });
  it('altura e peso de um painel fechado não entram no cálculo', async () => {
    const u = userEvent.setup();
    renderComTema(<CKDEPICalculator />);
    await u.type(screen.getByPlaceholderText('Creatinina (mg/dL)'), '1');
    await u.type(screen.getByPlaceholderText('Idade (anos)'), '50');
    await u.click(screen.getByRole('button', { name: /Masculino/ }));
    await u.click(screen.getByRole('button', { name: /Ajuste de dose/ }));
    await u.type(screen.getByPlaceholderText('Altura (cm)'), '170');
    await u.type(screen.getByPlaceholderText('Peso (kg)'), '70');
    await u.click(screen.getByRole('button', { name: 'Paciente com DRC' })); // fecha o ajuste de dose
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    expect(screen.getByRole('status').textContent).not.toContain('absoluta');
  });
  it('botões: Calcular só com texto; Último e Limpar só com ícone', () => {
    renderComTema(<CKDEPICalculator />);
    expect(screen.getByRole('button', { name: 'Calcular' }).textContent).toBe('Calcular');
    expect(screen.getByRole('button', { name: 'Recarregar último resultado' }).textContent).toBe('');
    expect(screen.getByRole('button', { name: 'Limpar campos' }).textContent).toBe('');
  });
  it('o painel de ajuste de dose explica o que é desindexar', async () => {
    const u = userEvent.setup();
    renderComTema(<CKDEPICalculator />);
    await u.click(screen.getByRole('button', { name: /Ajuste de dose/ }));
    expect(screen.getByText(/é tirar a padronização pela superfície corporal/)).toBeTruthy();
  });
  it('albuminúria é opcional: DRC marcado sem o campo calcula e mostra o estágio G', async () => {
    const u = userEvent.setup();
    renderComTema(<CKDEPICalculator />);
    await u.type(screen.getByPlaceholderText('Creatinina (mg/dL)'), '2.3');
    await u.type(screen.getByPlaceholderText('Idade (anos)'), '70');
    await u.click(screen.getByRole('button', { name: /Masculino/ }));
    await u.click(screen.getByLabelText('Paciente com DRC'));
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    expect(screen.getByRole('status').textContent).toContain('Estágio da DRC pela TFG: G4');
    expect(screen.getByPlaceholderText(/Relação Albumina\/Creatinina/).getAttribute('aria-invalid')).not.toBe('true');
  });
  it('recarregar traz o último resultado salvo', async () => {
    const u = userEvent.setup();
    renderComTema(<CKDEPICalculator />);
    await u.type(screen.getByPlaceholderText('Creatinina (mg/dL)'), '1');
    await u.type(screen.getByPlaceholderText('Idade (anos)'), '50');
    await u.click(screen.getByRole('button', { name: /Masculino/ }));
    await u.click(screen.getByRole('button', { name: 'Calcular' }));
    await u.click(screen.getByRole('button', { name: 'Limpar campos' }));
    expect(screen.queryByRole('status')).toBeNull();
    await u.click(screen.getByRole('button', { name: 'Recarregar último resultado' }));
    expect(screen.getByRole('status').textContent).toContain('91.7');
  });
});
