// @vitest-environment jsdom
import { cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AcidoBaseHub from '@/components/hubs/AcidoBaseHub';
import SodioHub from '@/components/hubs/SodioHub';
import OsmolaridadeCalculator from '@/components/calculators/OsmolaridadeCalculator';
import { implementacoes } from '@/app/ferramentas/[slug]/implementacoes';
import { SLUGS_DISPONIVEIS } from '@/lib/tools/disponiveis';
import { renderComTema } from './helpers';

vi.mock('next/link', () => ({
  default: ({ href, children, ...p }: { href: string; children: React.ReactNode }) => <a href={href} {...p}>{children}</a>,
}));

beforeEach(() => window.localStorage.clear());
afterEach(cleanup);

const digitar = async (u: ReturnType<typeof userEvent.setup>, ph: string | RegExp, v: string) => u.type(screen.getByPlaceholderText(ph), v);
const calcular = (u: ReturnType<typeof userEvent.setup>) => u.click(screen.getByRole('button', { name: 'Calcular' }));
const resultado = () => screen.getByRole('status').textContent ?? '';

describe('registro dos hubs', () => {
  it('todo slug disponível tem implementação, e os 10 slugs de Onda 1 + osmolaridade estão ativos', () => {
    for (const s of SLUGS_DISPONIVEIS) expect(implementacoes[s], s).toBeTypeOf('function');
    for (const s of ['hiponatremia-sodio', 'hiponatremia-fluxograma-na', 'correcao-de-hiponatremia-na', 'hipernatremia-sodio', 'correcao-de-hipernatremia-na',
      'ingestao-diaria-de-sodio', 'disturbios-acido-base', 'anion-gap', 'gasometria-arterial', 'reposicao-de-bicarbonato', 'osmolaridade-serica']) {
      expect((SLUGS_DISPONIVEIS as readonly string[]).includes(s), s).toBe(true);
    }
  });
  it('cada slug antigo abre a aba certa', () => {
    const abaSelecionada = (slug: string) => {
      const { unmount } = renderComTema(<>{implementacoes[slug]()}</>);
      const nome = screen.getByRole('tab', { selected: true }).textContent;
      unmount();
      return nome;
    };
    expect(abaSelecionada('hiponatremia-sodio')).toBe('Hiponatremia');
    expect(abaSelecionada('hiponatremia-fluxograma-na')).toBe('Fluxograma');
    expect(abaSelecionada('correcao-de-hiponatremia-na')).toBe('Corrigir hipo');
    expect(abaSelecionada('hipernatremia-sodio')).toBe('Hipernatremia');
    expect(abaSelecionada('correcao-de-hipernatremia-na')).toBe('Corrigir hiper');
    expect(abaSelecionada('ingestao-diaria-de-sodio')).toBe('Ingestão');
    expect(abaSelecionada('disturbios-acido-base')).toBe('Compensação');
    expect(abaSelecionada('anion-gap')).toBe('Anion gap');
    expect(abaSelecionada('gasometria-arterial')).toBe('Gasometria');
    expect(abaSelecionada('reposicao-de-bicarbonato')).toBe('Bicarbonato');
  });
});

describe('Hub Ácido-base', () => {
  it('compensação: Winter adequada e inadequada, e grava o último resultado', async () => {
    const u = userEvent.setup();
    renderComTema(<AcidoBaseHub />);
    await digitar(u, 'HCO₃⁻ (mEq/L)', '10');
    await digitar(u, 'PCO₂ (mmHg)', '23');
    await calcular(u);
    expect(resultado()).toContain('PCO₂ esperado: 23 mmHg (±2)');
    expect(resultado()).toContain('Compensação ADEQUADA');
    expect(window.localStorage.getItem('ultimaAcidBase')).toContain('Acidose Metabólica');
    await u.clear(screen.getByPlaceholderText('PCO₂ (mmHg)'));
    await digitar(u, 'PCO₂ (mmHg)', '35');
    await calcular(u);
    expect(resultado()).toContain('INADEQUADA → sugere acidose respiratória associada');
  });
  it('compensação: respiratória mostra a fase e valida', async () => {
    const u = userEvent.setup();
    renderComTema(<AcidoBaseHub />);
    expect(screen.queryByRole('group', { name: 'Fase do distúrbio' })).toBeNull();
    await u.click(screen.getByRole('button', { name: 'Acidose respiratória' }));
    await u.click(screen.getByRole('button', { name: 'Crônica' }));
    await calcular(u);
    expect(resultado()).toBe('Preencha HCO₃⁻ e PCO₂ com valores válidos');
    expect(screen.getByPlaceholderText('HCO₃⁻ (mEq/L)').getAttribute('aria-invalid')).toBe('true');
    await digitar(u, 'HCO₃⁻ (mEq/L)', '31');
    await digitar(u, 'PCO₂ (mmHg)', '60');
    await calcular(u);
    expect(resultado()).toContain('Acidose Respiratória Crônica');
    expect(resultado()).toContain('HCO₃⁻ esperado: 31 mEq/L (±4)');
  });
  it('anion gap: corrigido, com potássio e avisos', async () => {
    const u = userEvent.setup();
    renderComTema(<AcidoBaseHub inicial="anion-gap" />);
    await digitar(u, 'Sódio (mEq/L)', '140');
    await digitar(u, 'Cloreto (mEq/L)', '100');
    await digitar(u, 'Bicarbonato (mEq/L)', '14');
    await calcular(u);
    expect(resultado()).toBe('Anion Gap: 26.0 mEq/L');
    expect(screen.getByRole('alert').textContent).toContain('varia conforme o método do laboratório');
    await u.click(screen.getByLabelText('Corrigir para albumina'));
    await calcular(u);
    expect(screen.getByPlaceholderText('Albumina (g/dL)').getAttribute('aria-invalid')).toBe('true');
    await digitar(u, 'Albumina (g/dL)', '2');
    await calcular(u);
    expect(resultado()).toContain('Anion Gap, corrigido: 31.0 mEq/L');
    expect(window.localStorage.getItem('ultimoAnionGap')).toBe('31');
    await u.click(screen.getByLabelText('Incluir potássio (K⁺)'));
    await digitar(u, 'Potássio (mEq/L)', '4');
    await calcular(u);
    expect(resultado()).toContain('Anion Gap (com K⁺), corrigido: 35.0');
  });
  it('gasometria: albumina em branco avisa e não corrige', async () => {
    const u = userEvent.setup();
    renderComTema(<AcidoBaseHub inicial="gasometria" />);
    await digitar(u, 'pH (ex.: 7,35)', '7.20');
    await digitar(u, 'PCO₂ (mmHg)', '25');
    await digitar(u, 'HCO₃⁻ (mEq/L)', '10');
    await digitar(u, 'Sódio (mEq/L)', '140');
    await digitar(u, 'Cloreto (mEq/L)', '100');
    await calcular(u);
    const todos = screen.getAllByRole('status').map((e) => e.textContent).join(' ');
    expect(todos).toContain('Ânion Gap: 30.0 (sem correção)');
    expect(screen.getByRole('alert').textContent).toContain('Albumina não informada');
  });
  it('gasometria: valida e destaca campos', async () => {
    const u = userEvent.setup();
    renderComTema(<AcidoBaseHub inicial="gasometria" />);
    await calcular(u);
    expect(screen.getByRole('status').textContent).toBe('Verifique os campos destacados.');
    expect(screen.getByPlaceholderText('pH (ex.: 7,35)').getAttribute('aria-invalid')).toBe('true');
  });
  it('bicarbonato: dose padrão, avisos BICAR-ICU, salvar e recarregar', async () => {
    const u = userEvent.setup();
    renderComTema(<AcidoBaseHub inicial="bicarbonato" />);
    await digitar(u, 'Peso (kg)', '70');
    await digitar(u, 'HCO₃⁻ atual (mEq/L)', '10');
    await digitar(u, 'HCO₃⁻ desejado (mEq/L)', '20');
    await calcular(u);
    expect(resultado()).toContain('Dose de bicarbonato: 140 mEq (140 mL');
    expect(screen.getByRole('alert').textContent).toContain('BICAR-ICU');
    expect(window.localStorage.getItem('ultimaDoseBicarb')).toBe('140');
    await u.click(screen.getByRole('button', { name: 'Limpar campos' }));
    expect(screen.queryByRole('status')).toBeNull();
    await u.click(screen.getByRole('button', { name: 'Recarregar última dose' }));
    expect(resultado()).toContain('Última dose salva: 140 mEq');
  });
  it('bicarbonato: base excess aceita sinal negativo; empírica; recarregar sem dado', async () => {
    const u = userEvent.setup();
    renderComTema(<AcidoBaseHub inicial="bicarbonato" />);
    await u.click(screen.getByRole('button', { name: 'Recarregar última dose' }));
    expect(resultado()).toBe('Nenhuma dose salva encontrada.');
    await u.click(screen.getByRole('button', { name: 'Base excess' }));
    await digitar(u, 'Peso (kg)', '70');
    await digitar(u, 'Base excess (negativo, ex.: -10)', '-10');
    await calcular(u);
    expect(resultado()).toContain('Dose de bicarbonato: 105 mEq');
    await u.click(screen.getByRole('button', { name: 'Empírica (mEq/kg)' }));
    await calcular(u);
    expect(resultado()).toContain('Dose de bicarbonato: 105 mEq');
    expect(resultado()).toContain('administrar 315 mL em infusão contínua');
  });
  it('bicarbonato: erro de validação da mensagem', async () => {
    const u = userEvent.setup();
    renderComTema(<AcidoBaseHub inicial="bicarbonato" />);
    await calcular(u);
    expect(resultado()).toBe('Por favor, insira um peso válido, um bicarbonato atual válido e um bicarbonato desejado maior que o atual (máx. 30).');
  });
  it('troca de aba mantém o hub e some o conteúdo anterior', async () => {
    const u = userEvent.setup();
    renderComTema(<AcidoBaseHub />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Compensação esperada (HCO₃⁻ / PCO₂)');
    await u.click(screen.getByRole('tab', { name: 'Gasometria' }));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Gasometria Arterial');
  });
});

describe('Osmolaridade', () => {
  it('calcula, com gap osmolar opcional', async () => {
    const u = userEvent.setup();
    renderComTema(<OsmolaridadeCalculator />);
    await calcular(u);
    expect(resultado()).toContain('Por favor, insira um sódio válido (ex.: 140)');
    await digitar(u, 'Sódio (mEq/L)', '140');
    await digitar(u, 'Glicose (mg/dL)', '90');
    await digitar(u, 'Ureia (mg/dL)', '30');
    await calcular(u);
    expect(resultado()).toBe('Osmolaridade Sérica: 290 mOsm/L');
    expect(window.localStorage.getItem('ultimaOsmolaridade')).toBe('290');
    await digitar(u, /Osmolalidade medida/, '320');
    await calcular(u);
    expect(resultado()).toContain('Gap osmolar: 30');
    expect(screen.getByRole('alert').textContent).toContain('álcoois tóxicos');
  });
});

describe('Hub Sódio — conteúdo', () => {
  it('Hiponatremia: limites unificados e sem as estatísticas sem fonte', async () => {
    const u = userEvent.setup();
    renderComTema(<SodioHub />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Hiponatremia');
    await u.click(screen.getByRole('button', { name: /Tratamento/ }));
    expect(screen.getByText(/Meta: ↑ 6–8 mEq\/L nas primeiras 24 h/)).toBeTruthy();
    expect(screen.getByText(/10 mEq\/L nos demais/)).toBeTruthy();
    expect(document.body.textContent).not.toContain('71%');
    expect(document.body.textContent).not.toContain('3,9×');
  });
  it('Hipernatremia: 0,5 mEq/L/h e 10–12 em 24 h', async () => {
    const u = userEvent.setup();
    renderComTema(<SodioHub inicial="hiper" />);
    await u.click(screen.getByRole('button', { name: /Tratamento/ }));
    expect(screen.getByText(/0,5 mEq\/L\/h nem 10–12 mEq\/L em 24 h/)).toBeTruthy();
    expect(document.body.textContent).not.toContain('QRS');
  });
});

describe('Hub Sódio — correção de hiponatremia', () => {
  it('calcula, avisa e salva', async () => {
    const u = userEvent.setup();
    renderComTema(<SodioHub inicial="corrigir-hipo" />);
    await u.click(screen.getByRole('button', { name: 'Homem' }));
    await digitar(u, 'Sódio atual (mEq/L)', '115');
    await digitar(u, 'Sódio desejado (mEq/L)', '121');
    await digitar(u, 'Peso (kg)', '70');
    await digitar(u, 'Idade (anos)', '40');
    await calcular(u);
    expect(resultado()).toContain('Volume para a meta: 648 mL | máximo seguro: 1080 mL');
    expect(screen.getByRole('alert').textContent).toContain('ignora perdas ativas');
    expect(window.localStorage.getItem('ultimoResultadoHiponatremia')).toContain('648');
    await u.click(screen.getByRole('button', { name: 'Limpar campos' }));
    await u.click(screen.getByRole('button', { name: 'Recarregar último resultado' }));
    expect(resultado()).toContain('648 mL');
  });
  it('aguda + 3% mostra o esquema de bolus; alto risco limita a 8', async () => {
    const u = userEvent.setup();
    renderComTema(<SodioHub inicial="corrigir-hipo" />);
    await u.click(screen.getByRole('button', { name: 'Aguda (< 48 h)' }));
    await u.click(screen.getByLabelText(/Alto risco de ODS/));
    await digitar(u, 'Sódio atual (mEq/L)', '110');
    await digitar(u, 'Sódio desejado (mEq/L)', '125');
    await digitar(u, 'Peso (kg)', '70');
    await digitar(u, 'Idade (anos)', '40');
    await calcular(u);
    expect(screen.getByRole('alert').textContent).toContain('100–150 mL em 10–20 min');
    expect(screen.getByRole('alert').textContent).toContain('acima do limite seguro');
    expect(resultado()).toContain('seguro: 8.0 em 24 h');
  });
  it('neonato e validação', async () => {
    const u = userEvent.setup();
    renderComTema(<SodioHub inicial="corrigir-hipo" />);
    await calcular(u);
    expect(resultado()).toBe('Verifique os campos destacados.');
    expect(screen.getByPlaceholderText('Sódio atual (mEq/L)').getAttribute('aria-invalid')).toBe('true');
    await digitar(u, 'Sódio atual (mEq/L)', '120');
    await digitar(u, 'Sódio desejado (mEq/L)', '126');
    await digitar(u, 'Peso (kg)', '4');
    await digitar(u, 'Idade (anos)', '0,5');
    await calcular(u);
    expect(resultado()).toContain('Não validado para neonatos');
  });
  it('Na corrigido pela glicose', async () => {
    const u = userEvent.setup();
    renderComTema(<SodioHub inicial="corrigir-hipo" />);
    await digitar(u, 'Sódio atual (mEq/L)', '125');
    await digitar(u, 'Glicose (mg/dL)', '500');
    const alvo = screen.getAllByRole('status').map((e) => e.textContent).join(' ');
    expect(alvo).toContain('Na corrigido: 134.6 mEq/L (fator 2,4; glicose > 400)');
  });
});

describe('Hub Sódio — correção de hipernatremia', () => {
  it('calcula com SG 5% e perdas contínuas', async () => {
    const u = userEvent.setup();
    renderComTema(<SodioHub inicial="corrigir-hiper" />);
    await u.click(screen.getByRole('button', { name: 'Homem' }));
    await digitar(u, 'Sódio atual (mEq/L)', '160');
    await digitar(u, 'Sódio desejado (mEq/L)', '150');
    await digitar(u, 'Peso (kg)', '70');
    await digitar(u, 'Idade (anos)', '40');
    await calcular(u);
    expect(resultado()).toContain('Volume para a meta: 2688 mL');
    expect(resultado()).toContain('queda de 0.42 mEq/L/h');
    await digitar(u, /Perdas contínuas/, '500');
    await calcular(u);
    expect(resultado()).toContain('Volume para a meta: 3188 mL');
    expect(window.localStorage.getItem('ultimoResultadoHipernatremia')).toContain('3188');
  });
  it('recarregar sem dado salvo', async () => {
    const u = userEvent.setup();
    renderComTema(<SodioHub inicial="corrigir-hiper" />);
    await u.click(screen.getByRole('button', { name: 'Recarregar último resultado' }));
    expect(resultado()).toBe('Nenhum resultado salvo anteriormente.');
  });
});

describe('Hub Sódio — ingestão', () => {
  it('converte para sódio e sal e guarda as chaves do app original', async () => {
    const u = userEvent.setup();
    renderComTema(<SodioHub inicial="ingestao" />);
    await calcular(u);
    expect(resultado()).toContain('Por favor, insira um sódio urinário válido');
    await digitar(u, 'Na urinário (mEq/L)', '100');
    await digitar(u, 'Volume urinário (L/24 h)', '2');
    await calcular(u);
    expect(resultado()).toContain('4.6 g de sódio/dia (≈ 11.7 g de sal/dia)');
    expect(resultado()).not.toContain('Ingestão alta');
    expect(window.localStorage.getItem('ultimoSodiumIntake')).toBe('11.7');
    expect(window.localStorage.getItem('lastUrineSodium')).toBe('100');
    await u.click(screen.getByLabelText('Mostrar comentário clínico'));
    expect(resultado()).toContain('Ingestão alta');
    expect(resultado()).not.toContain('**');
  });
});

describe('Hub Sódio — fluxograma', () => {
  it('caminho hipotônico → hipervolêmico → cirrose/ICC', async () => {
    const u = userEvent.setup();
    renderComTema(<SodioHub inicial="fluxo" />);
    await digitar(u, /Ex: 128/, '128');
    await u.click(screen.getByRole('button', { name: 'Avançar' }));
    await digitar(u, /Ex: 265/, '260');
    await u.click(screen.getByRole('button', { name: 'Avançar' }));
    await u.click(screen.getByRole('button', { name: /Hipervolemia/ }));
    await u.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(screen.getByRole('heading', { level: 2 })).toBeTruthy();
    await u.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(screen.getByRole('button', { name: /Hipervolemia/ })).toBeTruthy();
  });
  it('valida sódio e pula exame; osmolalidade em branco gera aviso', async () => {
    const u = userEvent.setup();
    renderComTema(<SodioHub inicial="fluxo" />);
    await digitar(u, /Ex: 128/, '140');
    await u.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(screen.getByRole('alert').textContent).toContain('Na ≥135');
    await u.clear(screen.getByPlaceholderText(/Ex: 128/));
    await digitar(u, /Ex: 128/, '120');
    await u.click(screen.getByRole('button', { name: 'Avançar' }));
    await u.click(screen.getByRole('button', { name: 'Não possuo este exame' }));
    expect(screen.getByRole('button', { name: /Hipovolemia/ })).toBeTruthy();
  });
  it('osmolalidade alta com hiperglicemia: resultado com Na corrigido (1,6 / 2,4) e link da osmolaridade', async () => {
    const u = userEvent.setup();
    renderComTema(<SodioHub inicial="fluxo" />);
    await digitar(u, /Ex: 128/, '125');
    await u.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(screen.getByRole('link', { name: 'Calcular osmolaridade' }).getAttribute('href')).toBe('/ferramentas/osmolaridade-serica');
    await digitar(u, /Ex: 265/, '310');
    await u.click(screen.getByRole('button', { name: 'Avançar' }));
    await u.click(screen.getByRole('button', { name: /Sim, glicemia elevada/ }));
    await u.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Hiponatremia por Hiperglicemia');
    expect(document.body.textContent).toContain('2,4 se glicose > 400');
    expect(screen.getByRole('link', { name: /Calcular Osmolalidade/ }).getAttribute('href')).toBe('/ferramentas/osmolaridade-serica');
    await u.click(screen.getByRole('button', { name: 'Recomeçar' }));
    expect(screen.getByPlaceholderText(/Ex: 128/)).toBeTruthy();
  });
  it('não oferece etanol como causa de hiponatremia translocacional', async () => {
    const u = userEvent.setup();
    renderComTema(<SodioHub inicial="fluxo" />);
    await digitar(u, /Ex: 128/, '125');
    await u.click(screen.getByRole('button', { name: 'Avançar' }));
    await digitar(u, /Ex: 265/, '310');
    await u.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(document.body.textContent).toContain('Manitol ou glicerol em uso');
    expect(document.body.textContent).not.toMatch(/glicerol, etanol/);
    const g = within(screen.getByRole('group'));
    expect(g.getAllByRole('button').length).toBe(2);
  });
});
