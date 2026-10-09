// Ácido-base (Onda 1). Funções puras; a tela só chama e exibe.
// Decisões clínicas aprovadas por Fred: ver DIVERGENCIAS_ONDA1.md.

export type Disturbio = 'acidose-metabolica' | 'alcalose-metabolica' | 'acidose-respiratoria' | 'alcalose-respiratoria';
export type Fase = 'aguda' | 'cronica';

export const FAIXA_AB = {
  hco3: { min: 2, max: 50 },
  pco2: { min: 5, max: 150 },
  ph: { min: 6.5, max: 8.0 },
  na: { min: 100, max: 180 },
  cl: { min: 80, max: 130 },
} as const;

const dentro = (v: number, f: { min: number; max: number }) => Number.isFinite(v) && v >= f.min && v <= f.max;
const num = (t: string) => parseFloat(t.replace(',', '.'));

// ───────────── Compensação esperada ─────────────
export interface CompensacaoResultado {
  ok: true;
  titulo: string;
  alvo: 'PCO₂' | 'HCO₃⁻';
  esperado: number;
  medido: number;
  unidade: 'mmHg' | 'mEq/L';
  tolerancia: number;
  adequada: boolean;
  /** Distúrbio associado sugerido quando a compensação é inadequada. */
  associado: string | null;
  texto: string;
}
export interface Erro { ok: false; erroHco3: boolean; erroPco2: boolean; mensagem: string }

const TITULOS: Record<Disturbio, string> = {
  'acidose-metabolica': 'Acidose Metabólica',
  'alcalose-metabolica': 'Alcalose Metabólica',
  'acidose-respiratoria': 'Acidose Respiratória',
  'alcalose-respiratoria': 'Alcalose Respiratória',
};

export function calcularCompensacao(e: { disturbio: Disturbio; fase: Fase; hco3: string; pco2: string }): CompensacaoResultado | Erro {
  const h = num(e.hco3);
  const p = num(e.pco2);
  const erroHco3 = !dentro(h, FAIXA_AB.hco3);
  const erroPco2 = !dentro(p, FAIXA_AB.pco2);
  if (erroHco3 || erroPco2) return { ok: false, erroHco3, erroPco2, mensagem: 'Preencha HCO₃⁻ e PCO₂ com valores válidos' };

  const metabolico = e.disturbio.endsWith('metabolica');
  let esperado = 0, tolerancia = 2;
  let titulo = TITULOS[e.disturbio];
  switch (e.disturbio) {
    case 'acidose-metabolica': esperado = Math.round(1.5 * h + 8); break; // Winter
    case 'alcalose-metabolica': esperado = Math.round(0.7 * h + 21); break; // Madias, ±2
    case 'acidose-respiratoria':
      esperado = Math.round(e.fase === 'aguda' ? 24 + 0.1 * (p - 40) : 24 + 0.35 * (p - 40));
      tolerancia = e.fase === 'aguda' ? 2 : 4;
      titulo += e.fase === 'aguda' ? ' Aguda' : ' Crônica';
      break;
    case 'alcalose-respiratoria':
      esperado = Math.round(e.fase === 'aguda' ? 24 - 0.2 * (40 - p) : 24 - 0.4 * (40 - p));
      tolerancia = e.fase === 'aguda' ? 2 : 4;
      titulo += e.fase === 'aguda' ? ' Aguda' : ' Crônica';
      break;
  }
  const medido = metabolico ? p : h;
  const dif = medido - esperado;
  const adequada = Math.abs(dif) <= tolerancia;
  const unidade = metabolico ? 'mmHg' : 'mEq/L';
  let associado: string | null = null;
  if (!adequada) {
    if (metabolico) associado = dif > 0 ? 'acidose respiratória associada' : 'alcalose respiratória associada';
    else associado = dif > 0 ? 'alcalose metabólica associada' : 'acidose metabólica associada';
  }
  const alvo = metabolico ? 'PCO₂' : 'HCO₃⁻';
  const texto = `${titulo}\n${alvo} esperado: ${esperado} ${unidade} (±${tolerancia})\nValor medido: ${medido} ${unidade}\n` +
    (adequada ? 'Compensação ADEQUADA' : `Compensação INADEQUADA → sugere ${associado}`);
  return { ok: true, titulo, alvo, esperado, medido, unidade, tolerancia, adequada, associado, texto };
}

// ───────────── Anion gap ─────────────
export interface AnionGapEntrada { na: string; cl: string; hco3: string; k?: string; albumina?: string; comK: boolean; corrigir: boolean }
export interface AnionGapResultado {
  ok: true; ag: number; agCorrigido: number | null; valor: number; faixa: string; classe: 'baixo' | 'normal' | 'alto'; texto: string; avisos: string[];
}
export interface AnionGapErro { ok: false; campos: string[]; mensagem: string }

export function juntarLista(itens: string[]): string {
  if (itens.length === 1) return itens[0];
  if (itens.length === 2) return itens.join(' e ');
  return itens.slice(0, -1).join(', ') + ' e ' + itens[itens.length - 1];
}

export function calcularAnionGap(e: AnionGapEntrada): AnionGapResultado | AnionGapErro {
  const na = num(e.na), cl = num(e.cl), hc = num(e.hco3), k = num(e.k ?? ''), alb = num(e.albumina ?? '');
  const campos: string[] = [], nomes: string[] = [];
  const ruim = (c: string, nome: string) => { campos.push(c); nomes.push(nome); };
  if (!dentro(na, { min: 80, max: 200 })) ruim('na', 'um sódio válido');
  if (!dentro(cl, { min: 50, max: 160 })) ruim('cl', 'um cloreto válido');
  if (!dentro(hc, { min: 1, max: 60 })) ruim('hco3', 'um bicarbonato válido');
  if (e.comK && !dentro(k, { min: 1, max: 12 })) ruim('k', 'um potássio válido');
  if (e.corrigir && !dentro(alb, { min: 0.5, max: 7 })) ruim('albumina', 'uma albumina válida (g/dL)');
  if (campos.length) return { ok: false, campos, mensagem: `Por favor, insira ${juntarLista(nomes)}.` };

  const ag = e.comK ? na + k - (cl + hc) : na - (cl + hc);
  const agCorrigido = e.corrigir ? ag + (4.0 - alb) * 2.5 : null;
  const valor = agCorrigido ?? ag;
  const [lo, hi] = e.comK ? [12, 16] : [8, 12];
  const classe = valor < lo ? 'baixo' : valor > hi ? 'alto' : 'normal';
  const rotulo = `Anion Gap${e.comK ? ' (com K⁺)' : ''}${e.corrigir ? ', corrigido' : ''}`;
  const texto = `${rotulo}: ${valor.toFixed(1)} mEq/L` + (e.corrigir ? `\nAlbumina: ${alb.toFixed(1)} g/dL (AG medido: ${ag.toFixed(1)})` : '');
  const avisos = [`Referência usada: ${lo}–${hi} mEq/L${e.comK ? ' (com K⁺)' : ''}. A faixa normal varia conforme o método do laboratório: confirme com a referência do seu serviço.`];
  if (valor > 20) avisos.push('AG > 20 mEq/L: quase sempre patológico (acidose por ânions não medidos).');
  if (!e.corrigir) avisos.push('Sem correção para albumina: na hipoalbuminemia o AG real fica subestimado (+2,5 mEq/L a cada 1 g/dL abaixo de 4).');
  return { ok: true, ag, agCorrigido, valor, faixa: `${lo}–${hi}`, classe, texto, avisos };
}

// ───────────── Gasometria completa ─────────────
export interface GasoEntrada { ph: string; pco2: string; hco3: string; na: string; cl: string; albumina: string; lactato: string }
export interface GasoResultado {
  ok: true; parametros: string; ag: string; avisoAlbumina?: string; agAlerta?: string; deltaGap: string; deltaGapInterp: string;
  disturbio: string; compEsperada: string; compReal: string; compStatus: string; lactato?: string; conclusao: string;
}
export interface GasoErro { ok: false; campos: string[]; mensagem: string }

export function calcularGasometria(e: GasoEntrada): GasoResultado | GasoErro {
  const ph = num(e.ph), pco2 = num(e.pco2), hco3 = num(e.hco3), na = num(e.na), cl = num(e.cl);
  const campos: string[] = [];
  if (!dentro(ph, FAIXA_AB.ph)) campos.push('ph');
  if (!dentro(pco2, FAIXA_AB.pco2)) campos.push('pco2');
  if (!dentro(hco3, FAIXA_AB.hco3)) campos.push('hco3');
  if (!dentro(na, FAIXA_AB.na)) campos.push('na');
  if (!dentro(cl, FAIXA_AB.cl)) campos.push('cl');
  const albTexto = e.albumina.trim();
  const alb = num(albTexto);
  const temAlb = albTexto !== '' && Number.isFinite(alb);
  if (albTexto !== '' && !dentro(alb, { min: 0.5, max: 7 })) campos.push('albumina');
  const lacTexto = e.lactato.trim();
  const lac = num(lacTexto);
  if (lacTexto !== '' && !(Number.isFinite(lac) && lac >= 0 && lac <= 40)) campos.push('lactato');
  if (campos.length) return { ok: false, campos, mensagem: 'Verifique os campos destacados.' };

  const ag = na - cl - hco3;
  // CORREÇÃO GASO-1: albumina em branco NÃO corrige (antes valia 0 e somava +10 ao AG).
  const agCorr = temAlb ? ag + 2.5 * (4.0 - alb) : ag;
  const agAlerta = agCorr > 20 ? `⚠️ AG${temAlb ? ' corrigido' : ''} ${agCorr.toFixed(1)} > 20 → quase sempre patológico` : undefined;
  const avisoAlbumina = temAlb ? undefined : 'Albumina não informada: AG sem correção (pode estar subestimado na hipoalbuminemia).';

  const deltaAG = agCorr - 12;
  const deltaHCO3 = 24 - hco3;
  const gapGap = Math.abs(deltaHCO3) > 0.5 ? deltaAG / deltaHCO3 : null;
  let deltaGapInterp: string;
  if (gapGap === null) deltaGapInterp = 'Delta-delta indeterminado (HCO₃ próximo ao normal)';
  else if (gapGap < 0.4) deltaGapInterp = 'Acidose metabólica hiperclorêmica (com gap normal) pura';
  else if (gapGap < 1.0) deltaGapInterp = 'Distúrbio misto: acidose com AG + acidose hiperclorêmica';
  else if (gapGap <= 2.0) deltaGapInterp = 'Acidose metabólica com AG elevado simples';
  else deltaGapInterp = 'Distúrbio misto: acidose com AG + alcalose metabólica';

  const acidose = ph < 7.35, alcalose = ph > 7.45;
  const compMetab = hco3 < 22, alcMetab = hco3 > 26, compResp = pco2 > 45, alcResp = pco2 < 35;
  let disturbio = '';
  if (acidose) {
    if (compMetab && compResp) disturbio = '⚠️ Distúrbio misto: Acidose metabólica + Acidose respiratória';
    else if (compMetab) disturbio = 'Acidose metabólica';
    else if (compResp) disturbio = 'Acidose respiratória';
    else disturbio = 'Acidose (origem indeterminada)';
  } else if (alcalose) {
    if (alcMetab && alcResp) disturbio = '⚠️ Distúrbio misto: Alcalose metabólica + Alcalose respiratória';
    else if (alcMetab) disturbio = 'Alcalose metabólica';
    else if (alcResp) disturbio = 'Alcalose respiratória';
    else disturbio = 'Alcalose (origem indeterminada)';
  } else {
    if (compMetab && alcResp) disturbio = '⚠️ Distúrbio misto compensado: Acidose metabólica + Alcalose respiratória';
    else if (alcMetab && compResp) disturbio = '⚠️ Distúrbio misto compensado: Alcalose metabólica + Acidose respiratória';
    else if (compMetab || alcMetab || compResp || alcResp) disturbio = '⚠️ Distúrbio misto compensado (verificar contexto clínico)';
    else disturbio = '✅ Equilíbrio ácido-base normal';
  }

  let compEsperada = '', compReal = '', compStatus = '';
  const pcoMsg = (esp: number, adequado: string) => {
    compReal = `pCO₂ atual: ${pco2.toFixed(0)} mmHg`;
    if (pco2 < esp - 2) compStatus = '→ pCO₂ menor que esperado: sugere alcalose respiratória concomitante';
    else if (pco2 > esp + 2) compStatus = '→ pCO₂ maior que esperado: sugere acidose respiratória concomitante';
    else compStatus = adequado;
  };
  if (acidose && compMetab) {
    const esp = 1.5 * hco3 + 8;
    compEsperada = `pCO₂ esperado = 1,5 × HCO₃ + 8 = ${esp.toFixed(1)} ± 2 mmHg`;
    pcoMsg(esp, '→ Compensação respiratória adequada');
  } else if (alcalose && alcMetab) {
    const esp = 0.7 * hco3 + 21;
    compEsperada = `pCO₂ esperado = 0,7 × HCO₃ + 21 = ${esp.toFixed(1)} ± 2 mmHg`;
    pcoMsg(esp, '→ Compensação ventilatória adequada');
  } else if (acidose && compResp) {
    const d = pco2 - 40, ag_ = 24 + 0.1 * d, cr = 24 + 0.35 * d;
    compEsperada = `HCO₃ esperado:\n  Aguda:   ${ag_.toFixed(1)} mEq/L (+0,1 × ΔpCO₂)\n  Crônica: ${cr.toFixed(1)} mEq/L (+0,35 × ΔpCO₂)`;
    compReal = `HCO₃ atual: ${hco3.toFixed(1)} mEq/L`;
    if (hco3 < ag_ - 2) compStatus = '→ HCO₃ abaixo do esperado para aguda: acidose metabólica concomitante';
    else if (hco3 > cr + 2) compStatus = '→ HCO₃ acima do esperado para crônica: alcalose metabólica concomitante';
    else compStatus = '→ Compensação renal compatível (aguda a crônica)';
  } else if (alcalose && alcResp) {
    const d = 40 - pco2, ag_ = 24 - 0.2 * d, cr = 24 - 0.4 * d;
    compEsperada = `HCO₃ esperado:\n  Aguda:   ${ag_.toFixed(1)} mEq/L (−0,2 × ΔpCO₂)\n  Crônica: ${cr.toFixed(1)} mEq/L (−0,4 × ΔpCO₂)`;
    compReal = `HCO₃ atual: ${hco3.toFixed(1)} mEq/L`;
    if (hco3 > ag_ + 2) compStatus = '→ HCO₃ acima do esperado: alcalose metabólica concomitante';
    else if (hco3 < cr - 2) compStatus = '→ HCO₃ abaixo do esperado: acidose metabólica concomitante';
    else compStatus = '→ Compensação renal compatível (aguda a crônica)';
  }

  let lactato: string | undefined;
  if (lacTexto !== '' && lac > 0) {
    if (lac <= 2.0) lactato = `Lactato ${lac.toFixed(1)} mmol/L → Normal (≤ 2,0)`;
    else if (lac <= 4.0) lactato = `⚠️ Lactato ${lac.toFixed(1)} mmol/L → Hiperlactatemia (2–4): hipoperfusão ou outra causa`;
    else lactato = `🚨 Lactato ${lac.toFixed(1)} mmol/L → Hiperlactatemia importante (> 4): emergência`;
  }

  let conclusao = '';
  if (agCorr > 16) conclusao = 'AG elevado → considerar: cetoacidose (diabética, alcoólica, jejum), acidose láctica, insuficiência renal (uremia), intoxicações (salicilatos, metanol, etilenoglicol, metformina), acidose D-lática.';
  else if (agCorr < 6) conclusao = 'AG baixo → considerar: hipoalbuminemia não corrigida, hipercalcemia/hipermagnesemia, mieloma múltiplo, erro laboratorial.';

  const deltaQualifica = agCorr > 12 && gapGap !== null;
  const partes: string[] = [deltaQualifica ? deltaGapInterp : disturbio];
  if (compStatus.includes('acidose respiratória concomitante')) partes.push('Acidose respiratória concomitante');
  else if (compStatus.includes('alcalose respiratória concomitante')) partes.push('Alcalose respiratória concomitante');
  else if (compStatus.includes('acidose metabólica concomitante')) partes.push('Acidose metabólica concomitante');
  else if (compStatus.includes('alcalose metabólica concomitante')) partes.push('Alcalose metabólica concomitante');

  return {
    ok: true,
    parametros: `pH ${ph.toFixed(2)}  |  pCO₂ ${pco2.toFixed(0)} mmHg  |  HCO₃ ${hco3.toFixed(1)} mEq/L`,
    ag: temAlb ? `Ânion Gap: ${ag.toFixed(1)}  →  corrigido (albumina): ${agCorr.toFixed(1)}` : `Ânion Gap: ${ag.toFixed(1)} (sem correção)`,
    avisoAlbumina, agAlerta,
    deltaGap: gapGap !== null ? `Delta-Delta (Gap-Gap): ${gapGap.toFixed(2)}` : 'Delta-Delta: indeterminado',
    deltaGapInterp, disturbio: [...new Set(partes)].filter(Boolean).join(' + '),
    compEsperada, compReal, compStatus, lactato, conclusao,
  };
}

// ───────────── Osmolaridade ─────────────
export interface OsmolaridadeResultado { ok: true; osm: number; gap: number | null; texto: string; avisos: string[] }
export interface OsmolaridadeErro { ok: false; campos: string[]; mensagem: string }

export function calcularOsmolaridade(e: { na: string; glicose: string; ureia: string; etanol?: string; medida?: string }): OsmolaridadeResultado | OsmolaridadeErro {
  const na = num(e.na), gli = num(e.glicose), ur = num(e.ureia);
  const campos: string[] = [], nomes: string[] = [];
  if (!(na > 0)) { campos.push('na'); nomes.push('um sódio válido (ex.: 140)'); }
  if (!(gli > 0)) { campos.push('glicose'); nomes.push('uma glicose válida (ex.: 90)'); }
  if (!(ur > 0)) { campos.push('ureia'); nomes.push('uma ureia válida (ex.: 30)'); }
  const et = (e.etanol ?? '').trim() === '' ? 0 : num(e.etanol!);
  if (!(et >= 0)) { campos.push('etanol'); nomes.push('um etanol válido'); }
  const med = (e.medida ?? '').trim() === '' ? null : num(e.medida!);
  if (med !== null && !(med > 0)) { campos.push('medida'); nomes.push('uma osmolalidade medida válida'); }
  if (campos.length) return { ok: false, campos, mensagem: `Por favor, insira ${juntarLista(nomes)}.` };

  const osm = 2 * na + gli / 18 + ur / 6 + et / 4.6;
  const gap = med === null ? null : med - osm;
  let texto = `Osmolaridade Sérica: ${osm.toFixed(0)} mOsm/L`;
  const avisos: string[] = [];
  if (gap !== null) {
    texto += `\nGap osmolar: ${gap.toFixed(0)} mOsm/kg`;
    if (gap > 10) avisos.push('Gap osmolar > 10: investigar álcoois tóxicos (metanol, etilenoglicol), manitol, cetoacidose ou uremia grave. Se houver acidose com AG elevado, tratar como emergência.');
  }
  if (osm > 320) avisos.push('Osmolaridade > 320 com rebaixamento do nível de consciência: considerar hipernatremia grave, hiperglicemia hiperosmolar ou manitol.');
  return { ok: true, osm, gap, texto, avisos };
}

// ───────────── Reposição de bicarbonato ─────────────
export type ModoBicarbonato = 'padrao' | 'be' | 'empirica';
export type ConcentracaoBic = '1' | '0.5' | '0.1';
export interface BicEntrada {
  modo: ModoBicarbonato; peso: string; bicAtual: string; bicDesejado: string; baseExcess: string;
  dose: '1' | '1.5' | '2'; concentracao: ConcentracaoBic; grave: boolean;
}
export interface BicResultado { ok: true; doseMeq: number; volumeMl: number; porDoseMeq: number; porDoseMl: number; cor: string; texto: string; avisos: string[] }
export interface BicErro { ok: false; campos: string[]; mensagem: string }

export const TEXTO_CONC: Record<ConcentracaoBic, string> = {
  '1': '8,4% (1 mEq/mL)', '0.5': '4,2% (0,5 mEq/mL)', '0.1': 'solução diluída (0,1 mEq/mL)',
};
export const corDoseBic = (d: number) => (d <= 100 ? '#22c55e' : d <= 200 ? '#facc15' : '#ef4444');

export const AVISOS_BICARBONATO = [
  'Evidência (BICAR-ICU): o benefício do bicarbonato foi visto em pH < 7,20 com lesão renal aguda grave (KDIGO 2–3), com menor necessidade de diálise e menos mortalidade nesse subgrupo. Com pH ≥ 7,20 não há benefício claro.',
  'Na acidose láctica o bicarbonato NÃO é rotina: trate a causa (perfusão, sepse, etc.). Na cetoacidose diabética só se pH < 6,9.',
  'Confirmar com nova gasometria após a reposição. Cuidado com sobrecarga de sódio/volume, hipernatremia, hipocalcemia ionizada e hipocalemia.',
];

export function calcularBicarbonato(e: BicEntrada): BicResultado | BicErro {
  const peso = num(e.peso);
  const campos: string[] = [], nomes: string[] = [];
  if (!(peso > 0 && peso <= 500)) { campos.push('peso'); nomes.push('um peso válido'); }
  let dose = 0;
  let conc = parseFloat(e.concentracao);
  let ehEmpirica = false;
  if (e.modo === 'padrao') {
    const at = num(e.bicAtual), de = num(e.bicDesejado);
    if (!(at > 0 && at <= 40)) { campos.push('bicAtual'); nomes.push('um bicarbonato atual válido'); }
    if (!(de > at && de <= 30)) { campos.push('bicDesejado'); nomes.push('um bicarbonato desejado maior que o atual (máx. 30)'); }
    if (!campos.length) dose = (de - at) * peso * (e.grave ? 0.5 : 0.4) * 0.5;
  } else if (e.modo === 'be') {
    const be = num(e.baseExcess);
    if (!(be < 0 && be >= -40)) { campos.push('baseExcess'); nomes.push('um Base Excess negativo (ex.: -10 ou -5.5)'); }
    if (!campos.length) dose = Math.abs(be) * peso * (e.grave ? 0.5 : 0.3) * 0.5;
  } else {
    ehEmpirica = true;
    if (!campos.length) dose = peso * parseFloat(e.dose);
  }
  if (campos.length) return { ok: false, campos, mensagem: `Por favor, insira ${juntarLista(nomes)}.` };

  const volume = dose / conc;
  const porDose = ehEmpirica ? dose : dose / 3;
  const porMl = ehEmpirica ? volume : volume / 3;
  const c = TEXTO_CONC[e.concentracao];
  const base = `Dose de bicarbonato: ${dose.toFixed(0)} mEq (${volume.toFixed(0)} mL de bicarbonato ${c})\n`;
  const texto = ehEmpirica
    ? `${base}Correr ${porDose.toFixed(0)} mEq (${porMl.toFixed(0)} mL) a cada 8 horas, com infusão lenta, ou administrar ${(porMl * 3).toFixed(0)} mL em infusão contínua.`
    : `${base}Divida em 3 doses de ${porDose.toFixed(0)} mEq (${porMl.toFixed(0)} mL) a cada 8 horas, com infusão lenta, ou administrar em infusão contínua.`;
  return { ok: true, doseMeq: dose, volumeMl: volume, porDoseMeq: porDose, porDoseMl: porMl, cor: corDoseBic(dose), texto, avisos: AVISOS_BICARBONATO };
}
