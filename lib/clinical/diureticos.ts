// Equivalência de diuréticos (Onda 7, ferramenta nova). Função pura. Equivalência APROXIMADA de dose: não é prescrição.
// Alça (base = furosemida 40 mg VO): furosemida IV 20 · bumetanida 1 · torasemida 20 · ácido etacrínico 50.
// Tiazídicos (base = hidroclorotiazida 25 mg): clortalidona 12,5.
export type GrupoDiuretico = 'alca' | 'tiazidico';
export interface Diuretico { id: string; nome: string; grupo: GrupoDiuretico; /** dose (mg) equivalente à dose-base do grupo */ equivalente: number; nota?: string }

export const DIURETICOS: Diuretico[] = [
  { id: 'furosemida-vo', nome: 'Furosemida VO', grupo: 'alca', equivalente: 40, nota: 'Biodisponibilidade oral variável (10–100%, média ~50%).' },
  { id: 'furosemida-iv', nome: 'Furosemida IV', grupo: 'alca', equivalente: 20 },
  { id: 'bumetanida', nome: 'Bumetanida (VO ou IV)', grupo: 'alca', equivalente: 1 },
  { id: 'torasemida', nome: 'Torasemida (VO ou IV)', grupo: 'alca', equivalente: 20, nota: 'Alguns serviços usam 10–20 mg para 40 mg de furosemida VO.' },
  { id: 'acido-etacrinico', nome: 'Ácido etacrínico VO', grupo: 'alca', equivalente: 50, nota: 'Opção para alergia a sulfonamidas.' },
  { id: 'hidroclorotiazida', nome: 'Hidroclorotiazida', grupo: 'tiazidico', equivalente: 25 },
  { id: 'clortalidona', nome: 'Clortalidona', grupo: 'tiazidico', equivalente: 12.5, nota: 'Mais potente e de ação mais longa que a hidroclorotiazida.' },
];

export const FAIXA_DOSE_DIURETICO = { min: 0.1, max: 2000 } as const; // mg

export interface EquivalenteDiuretico { id: string; nome: string; dose: number; texto: string }
export interface ResultadoDiuretico { ok: true; origem: string; equivalentes: EquivalenteDiuretico[]; avisos: string[]; texto: string }
export interface ErroDiuretico { ok: false; mensagem: string }

const fmt = (n: number) => String(Number(n.toPrecision(3))).replace('.', ',');

export function converterDiuretico(e: { de: string; dose: string }): ResultadoDiuretico | ErroDiuretico {
  const d = DIURETICOS.find((x) => x.id === e.de);
  if (!d) return { ok: false, mensagem: 'Escolha o diurético de origem' };
  const dose = parseFloat(String(e.dose).replace(',', '.'));
  if (!Number.isFinite(dose) || dose < FAIXA_DOSE_DIURETICO.min || dose > FAIXA_DOSE_DIURETICO.max) return { ok: false, mensagem: 'Digite uma dose em mg (maior que zero)' };
  const unidades = dose / d.equivalente; // quantas "doses-base" do grupo
  const equivalentes = DIURETICOS.filter((x) => x.grupo === d.grupo && x.id !== d.id).map((x) => {
    const valor = unidades * x.equivalente;
    return { id: x.id, nome: x.nome, dose: valor, texto: `${x.nome}: ${fmt(valor)} mg` };
  });
  const avisos = ['Equivalência aproximada entre doses; ajuste pela resposta clínica (diurese, peso, pressão, eletrólitos).'];
  if (d.grupo === 'alca') {
    avisos.push('Na TFG baixa ou na insuficiência cardíaca, o diurético de alça tem limiar: doses abaixo dele não produzem diurese. Não extrapole para doses menores nem pressuponha efeito linear.');
    avisos.push('A passagem de IV para VO costuma dobrar a dose de furosemida (biodisponibilidade ~50%); bumetanida e torasemida têm absorção oral mais previsível.');
  } else avisos.push('Tiazídicos perdem efeito com TFG muito baixa (a clortalidona mantém algum efeito); associar a um diurético de alça tem efeito sinérgico (bloqueio sequencial) e risco de hipocalemia/hiponatremia.');
  return { ok: true, origem: `${d.nome}: ${fmt(dose)} mg`, equivalentes, avisos, texto: `${d.nome} ${fmt(dose)} mg ≈\n${equivalentes.map((q) => q.texto).join('\n')}` };
}
