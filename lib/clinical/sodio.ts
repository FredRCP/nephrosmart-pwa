// Sódio (Onda 1). Funções puras. Regras unificadas aprovadas por Fred: ver DIVERGENCIAS_ONDA1.md.

export type SexoSodio = 'male' | 'female';
const num = (t: string) => parseFloat(t.replace(',', '.'));

/** Fração de água corporal total (Adrogué/Madias): criança 0,6; adulto H 0,6 / M 0,5; idoso (>60) H 0,5 / M 0,45. */
export function fracaoAgua(idade: number, sexo: SexoSodio): number {
  if (idade < 18) return 0.6;
  if (idade <= 60) return sexo === 'male' ? 0.6 : 0.5;
  return sexo === 'male' ? 0.5 : 0.45;
}

export interface Erro { ok: false; campos: string[]; mensagem: string }

const NEONATO = 'Não validado para neonatos/lactentes < 1 ano. Consulte pediatra/neonatologista.';

// ───────────── Correção de hiponatremia ─────────────
export type SolucaoHipo = 'nacl09' | 'nacl3';
export interface HipoEntrada { naAtual: string; naDesejado: string; peso: string; idade: string; sexo: SexoSodio; solucao: SolucaoHipo; tipo: 'aguda' | 'cronica'; altoRisco: boolean }
export interface HipoResultado {
  ok: true; neonato: false; volumeMl: number; volumeMaxMl: number; taxaMlH: number; mudancaDesejada: number; mudancaSegura: number;
  limite24h: number; solucao: string; bolus: boolean; deltaPorLitro: number; deltaPorBolus150: number; avisos: string[]; texto: string;
}
export interface HipoNeonato { ok: true; neonato: true; avisos: string[]; texto: string }

export function limiteHipo(idade: number, altoRisco: boolean): number {
  // Limite de elevação em 24 h: 8 (alto risco de ODS ou < 18 anos), 10 nos demais. Meta habitual: 6–8.
  return altoRisco || idade < 18 ? 8 : 10;
}

export function corrigirHiponatremia(e: HipoEntrada): HipoResultado | HipoNeonato | Erro {
  const na = num(e.naAtual), alvo = num(e.naDesejado), peso = num(e.peso), idade = num(e.idade);
  const campos: string[] = [];
  if (!(na >= 50 && na <= 135)) campos.push('naAtual');
  if (!(alvo > na && alvo <= 145)) campos.push('naDesejado');
  if (!(peso >= 1 && peso <= 500)) campos.push('peso');
  if (!(idade > 0 && idade <= 120)) campos.push('idade');
  if (campos.length) return { ok: false, campos, mensagem: 'Verifique os campos destacados.' };
  if (idade < 1) return { ok: true, neonato: true, avisos: [NEONATO], texto: NEONATO };

  const tbw = peso * fracaoAgua(idade, e.sexo);
  const naSol = e.solucao === 'nacl09' ? 154 : 513;
  const nomeSol = e.solucao === 'nacl09' ? 'NaCl 0,9%' : 'NaCl 3%';
  const deltaL = (naSol - na) / (tbw + 1); // Adrogué–Madias: ΔNa por litro infundido
  const desejada = Math.round((alvo - na) * 1000) / 1000;
  const limite = limiteHipo(idade, e.altoRisco);
  const segura = Math.min(desejada, limite);
  const volumeMl = (desejada / deltaL) * 1000;
  const volumeMaxMl = (limite / deltaL) * 1000;
  const final = Math.min(volumeMl, volumeMaxMl);
  const taxa = final / 24;
  const bolus = e.tipo === 'aguda' && e.solucao === 'nacl3';

  const avisos: string[] = [];
  if (idade < 18) avisos.push('Criança: correção lenta e monitorada (limite de 8 mEq/L em 24 h).');
  if (idade > 60) avisos.push('Idoso: maior risco de desmielinização; prefira o menor valor da meta.');
  if (e.altoRisco) avisos.push('Alto risco de ODS (hipocalemia, alcoolismo, desnutrição, hepatopatia, Na ≤ 105): limite de 8 mEq/L em 24 h; considere meta de 4–6.');
  if (desejada > limite) avisos.push(`Meta de ${desejada} mEq/L acima do limite seguro: calculado para ${limite} mEq/L em 24 h.`);
  if (e.tipo === 'cronica') avisos.push('Hiponatremia crônica: meta habitual de 6–8 mEq/L em 24 h. Se subir além do limite, rebaixar com SG 5% ± desmopressina.');
  if (bolus) avisos.push('Aguda/sintomática grave: NaCl 3% 100–150 mL em 10–20 min, repetível até 2×, com meta de +4–6 mEq/L (checar Na após cada bolus).');
  if (e.solucao === 'nacl09' && e.tipo === 'cronica') avisos.push('Em SIADH, NaCl 0,9% pode piorar a hiponatremia (urina concentrada): confirme o diagnóstico antes.');
  avisos.push('Estimativa de Adrogué–Madias: ignora perdas ativas (diurese, diarreia) e potássio. K⁺ reposto também eleva o Na: monitore o Na a cada 2–4 h.');

  const deltaBolus = (150 / 1000) * deltaL;
  const texto =
    `Solução: ${nomeSol} — ${e.tipo === 'aguda' ? 'Aguda' : 'Crônica'}\n` +
    `ΔNa desejado: ${desejada.toFixed(1)} mEq/L (seguro: ${segura.toFixed(1)} em 24 h)\n` +
    `Volume para a meta: ${Math.round(volumeMl)} mL | máximo seguro: ${Math.round(volumeMaxMl)} mL\n` +
    `Velocidade: ${taxa.toFixed(1)} mL/h em 24 h` +
    (bolus ? `\n150 mL de NaCl 3% elevam o Na em cerca de ${deltaBolus.toFixed(1)} mEq/L` : '');
  return { ok: true, neonato: false, volumeMl: Math.round(volumeMl), volumeMaxMl: Math.round(volumeMaxMl), taxaMlH: taxa, mudancaDesejada: desejada,
    mudancaSegura: segura, limite24h: limite, solucao: nomeSol, bolus, deltaPorLitro: deltaL, deltaPorBolus150: deltaBolus, avisos, texto };
}

// ───────────── Correção de hipernatremia ─────────────
export type SolucaoHiper = 'sg5' | 'nacl045';
export interface HiperEntrada { naAtual: string; naDesejado: string; peso: string; idade: string; sexo: SexoSodio; solucao: SolucaoHiper; tipo: 'aguda' | 'cronica'; perdasMlDia?: string }
export interface HiperResultado {
  ok: true; neonato: false; volumeMl: number; volumeMaxMl: number; taxaMlH: number; mudancaDesejada: number; mudancaSegura: number;
  limite24h: number; taxaNaPorHora: number; solucao: string; deltaPorLitro: number; avisos: string[]; texto: string;
}
export const limiteHiper = (idade: number, tipo: 'aguda' | 'cronica') => (idade < 18 ? 8 : tipo === 'aguda' ? 12 : 10);

export function corrigirHipernatremia(e: HiperEntrada): HiperResultado | HipoNeonato | Erro {
  const na = num(e.naAtual), alvo = num(e.naDesejado), peso = num(e.peso), idade = num(e.idade);
  const perdasTxt = (e.perdasMlDia ?? '').trim();
  const perdas = perdasTxt === '' ? 0 : num(perdasTxt);
  const campos: string[] = [];
  if (!(na > 145 && na <= 200)) campos.push('naAtual');
  if (!(alvo >= 135 && alvo < na)) campos.push('naDesejado');
  if (!(peso >= 1 && peso <= 500)) campos.push('peso');
  if (!(idade > 0 && idade <= 120)) campos.push('idade');
  if (!(perdas >= 0 && perdas <= 20000)) campos.push('perdas');
  if (campos.length) return { ok: false, campos, mensagem: 'Verifique os campos destacados.' };
  if (idade < 1) return { ok: true, neonato: true, avisos: [NEONATO], texto: NEONATO };

  const tbw = peso * fracaoAgua(idade, e.sexo);
  const naSol = e.solucao === 'sg5' ? 0 : 77;
  const nomeSol = e.solucao === 'sg5' ? 'SG 5%' : 'NaCl 0,45%';
  const deltaL = (naSol - na) / (tbw + 1); // negativo
  const desejada = Math.round((na - alvo) * 1000) / 1000;
  const limite = limiteHiper(idade, e.tipo);
  const segura = Math.min(desejada, limite);
  const volumeMl = (desejada / -deltaL) * 1000 + perdas;
  const volumeMaxMl = (limite / -deltaL) * 1000 + perdas;
  const final = Math.min(volumeMl, volumeMaxMl);
  const taxa = final / 24;
  const taxaNa = segura / 24;

  const avisos: string[] = [];
  if (idade < 18) avisos.push('Criança: correção lenta e monitorada (limite de 8 mEq/L em 24 h).');
  if (idade > 60) avisos.push('Idoso: risco elevado de edema cerebral na correção rápida; use o menor ritmo possível.');
  if (desejada > limite) avisos.push(`Queda desejada de ${desejada} mEq/L acima do limite seguro: calculado para ${limite} mEq/L em 24 h.`);
  avisos.push(e.tipo === 'aguda'
    ? 'Instalação < 48 h: correção mais rápida é aceitável (até ~1 mEq/L/h nas primeiras horas), sempre com monitorização.'
    : 'Crônica/desconhecida: não exceder 0,5 mEq/L/h nem 10–12 mEq/L em 24 h (risco de edema cerebral).');
  avisos.push('Prefira via oral/enteral (água livre) quando possível. Hipovolemia grave: ressuscite com cristaloide isotônico antes.');
  avisos.push('Estimativa de Adrogué–Madias: some as perdas contínuas (informe acima) e monitore o Na a cada 4–6 h (2–4 h nas primeiras horas).');
  if (taxaNa > 0.5 && e.tipo === 'cronica') avisos.push(`Ritmo previsto de ${taxaNa.toFixed(2)} mEq/L/h está acima de 0,5: alongue o tempo de correção.`);

  const texto =
    `Solução: ${nomeSol} — ${e.tipo === 'aguda' ? 'Aguda' : 'Crônica'}\n` +
    `ΔNa desejado: ${desejada.toFixed(1)} mEq/L (seguro: ${segura.toFixed(1)} em 24 h)\n` +
    `Volume para a meta: ${Math.round(volumeMl)} mL | máximo seguro: ${Math.round(volumeMaxMl)} mL\n` +
    `Velocidade: ${taxa.toFixed(1)} mL/h em 24 h (queda de ${taxaNa.toFixed(2)} mEq/L/h)`;
  return { ok: true, neonato: false, volumeMl: Math.round(volumeMl), volumeMaxMl: Math.round(volumeMaxMl), taxaMlH: taxa, mudancaDesejada: desejada,
    mudancaSegura: segura, limite24h: limite, taxaNaPorHora: taxaNa, solucao: nomeSol, deltaPorLitro: deltaL, avisos, texto };
}

// ───────────── Na corrigido pela glicose ─────────────
export interface NaGlicoseResultado { ok: true; fator16: number; fator24: number; texto: string }
export function naCorrigidoGlicose(naTxt: string, gliTxt: string): NaGlicoseResultado | Erro {
  const na = num(naTxt), gli = num(gliTxt);
  const campos: string[] = [];
  if (!(na >= 80 && na <= 200)) campos.push('na');
  if (!(gli >= 20 && gli <= 2000)) campos.push('glicose');
  if (campos.length) return { ok: false, campos, mensagem: 'Verifique os campos destacados.' };
  const exc = Math.max(0, gli - 100) / 100;
  const f16 = na + 1.6 * exc, f24 = na + 2.4 * exc;
  const texto = gli > 400
    ? `Na corrigido: ${f24.toFixed(1)} mEq/L (fator 2,4; glicose > 400)\nCom fator 1,6: ${f16.toFixed(1)} mEq/L`
    : `Na corrigido: ${f16.toFixed(1)} mEq/L (fator 1,6)\nCom fator 2,4: ${f24.toFixed(1)} mEq/L`;
  return { ok: true, fator16: f16, fator24: f24, texto };
}

// ───────────── Ingestão de sódio (Na urinário 24 h) ─────────────
export type ClasseIngestao = 'baixa' | 'adequada' | 'moderada' | 'alta';
export interface IngestaoResultado { ok: true; meq24h: number; sodioG: number; salG: number; classe: ClasseIngestao; comentario: string; texto: string }
export function calcularIngestaoSodio(naTxt: string, volTxt: string): IngestaoResultado | Erro {
  const na = num(naTxt), vol = num(volTxt);
  const campos: string[] = [], nomes: string[] = [];
  if (!(na >= 10 && na <= 500)) { campos.push('na'); nomes.push('um sódio urinário válido (10–500 mEq/L)'); }
  if (!(vol >= 0.5 && vol <= 5)) { campos.push('volume'); nomes.push('um volume urinário válido (0,5–5 L/24h)'); }
  if (campos.length) return { ok: false, campos, mensagem: `Por favor, insira ${nomes.join(' e ')}.` };
  const meq = na * vol;
  // Arredonda a 3 casas antes de classificar: evita erro de ponto flutuante nas fronteiras (ex.: 2,0000001 g).
  const sodioG = Math.round(meq * 0.023 * 1000) / 1000;   // 1 mEq Na = 23 mg
  const salG = Math.round(meq * 0.0585 * 1000) / 1000;    // 1 mEq NaCl = 58,5 mg
  let classe: ClasseIngestao, comentario: string;
  if (sodioG < 1.0) {
    classe = 'baixa';
    comentario = 'Ingestão baixa. Avaliar coleta incompleta de urina, restrição excessiva ou perda extrarrenal (sudorese intensa, diarreia).';
  } else if (sodioG <= 2.0) {
    classe = 'adequada';
    comentario = 'Ingestão dentro da meta da OMS/KDIGO (< 2 g de sódio/dia ≈ < 5 g de sal).';
  } else if (sodioG <= 3.5) {
    classe = 'moderada';
    comentario = 'Ingestão moderada (acima da meta). Considerar redução em HAS, insuficiência cardíaca, DRC ou risco cardiovascular.';
  } else {
    classe = 'alta';
    comentario = 'Ingestão alta: risco aumentado de hipertensão, insuficiência cardíaca, AVC e progressão da DRC. Orientar restrição para < 2 g de sódio/dia e reavaliar em 4–6 semanas.';
  }
  const texto = `Na urinário total: ${meq.toFixed(0)} mEq/24h\nIngestão estimada: ${sodioG.toFixed(1)} g de sódio/dia (≈ ${salG.toFixed(1)} g de sal/dia)`;
  return { ok: true, meq24h: meq, sodioG, salG, classe, comentario, texto };
}
