// Dados do fluxograma de hiponatremia — portados do app original (HyponatremiaFlowchartScreen.tsx).
// Ajustes da Onda 1: etanol não é soluto translocacional (é osmol inefetivo); ver DIVERGENCIAS_ONDA1.md.
type NodeId = string;

interface FlowNode {
  id: NodeId;
  type: 'input' | 'choice' | 'result';
  question?: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  // type === 'input'
  inputKey?: string;
  inputUnit?: string;
  inputPlaceholder?: string;
  inputKeyboardType?: 'decimal-pad' | 'numeric';
  showCalcButton?: boolean; // abre OsmolarityCalculator
  validate?: (val: string) => string | null; // retorna msg de erro ou null
  next?: (val: string, ctx: Context) => NodeId;
  // type === 'choice'
  choices?: { label: string; sublabel?: string; icon?: string; color?: string; value: string }[];
  choiceKey?: string;
  next_choice?: (val: string, ctx: Context) => NodeId;
  // type === 'result'
  result?: ResultData;
}

interface Context {
  [key: string]: string | undefined;
  missingExamsWarnings?: string;
}

interface ResultData {
  color: string;
  icon: string;
  title: string;
  subtitle: string;
  diagnosis: string;
  exams: string[];
  treatment: string[];
  warning?: string;
  calcRoute?: string;
  calcLabel?: string;
  ddx?: { group: string; items: string[] }[];
  perfil?: string[];
}

/* ================================================================
   RESULTADOS
================================================================ */
const R: Record<string, ResultData> = {

  pseudohipo: {
    color: '#9c27b0', icon: 'flask',
    title: 'Pseudohiponatremia',
    subtitle: 'Hiponatremia Isotônica',
    perfil: ['Osm sérica: Normal (280–290 mOsm/kg)', 'Na real: Normal (artefato analítico)', 'Volume: Euvolemia', 'Gap osmótico: Aumentado (Osm medida − Osm calculada > 10)'],
    diagnosis: 'Artefato laboratorial. O sódio real está normal. Excesso de lipídios ou proteínas no plasma reduz a fração aquosa da amostra. A osmolalidade sérica MEDIDA é normal (280–290 mOsm/kg).',
    exams: [
      'Triglicerídeos séricos',
      'Proteínas totais + eletroforese de proteínas',
      'Osmolalidade medida vs. calculada (gap osmótico)',
      'Repetir Na com método de eletrodo seletivo',
    ],
    treatment: [
      'NÃO tratar como hiponatremia real.',
      'Tratar a causa: fibratos (hipertrigliceridemia), hematologia (mieloma múltiplo).',
      'Confirmar com laboratório que usa eletrodo seletivo.',
    ],
    warning: 'Nunca corrigir Na neste cenário — risco de hipernatremia iatrogênica!',
  },

  hipertonica_glicose: {
    color: '#f44336', icon: 'tint',
    title: 'Hiponatremia por Hiperglicemia',
    subtitle: 'Hiponatremia Hipertônica — Translocacional',
    perfil: ['Osm sérica: Alta (>290 mOsm/kg)', 'Glicemia: Elevada (geralmente >250 mg/dL)', 'Na corrigido: Na + 1,6 × [(Glicemia−100)/100] (fator 2,4 se glicose > 400)', 'Volume: Variável (depende do estado de hidratação)'],
    diagnosis: 'A hiperglicemia puxa água do intracelular para o extracelular, diluindo o sódio. Para cada ↑100 mg/dL de glicose acima de 100 → Na cai ~1,6 mEq/L (alguns autores usam 2,4 quando a glicose passa de 400). A osmolalidade sérica está ELEVADA.',
    exams: [
      'Glicemia capilar e venosa',
      'Gasometria + cetonúria (cetoacidose diabética?)',
      'HbA1c, função renal',
      'Osmolalidade sérica e urinária',
    ],
    treatment: [
      'Controlar glicemia → Na normaliza automaticamente.',
      'CAD: insulinoterapia + hidratação conforme protocolo.',
      'EHH: hidratação vigorosa + insulina após volemia.',
      'Na corrigido = Na medido + 1,6 × [(Glicemia − 100) / 100] (2,4 se glicose > 400).',
      'Não corrigir Na diretamente.',
    ],
    calcRoute: 'OsmolarityCalculator',
    calcLabel: '🧮 Calcular Osmolalidade',
  },

  hipertonica_outro: {
    color: '#f44336', icon: 'tint',
    title: 'Hiponatremia Hipertônica',
    subtitle: 'Translocacional — Outro soluto',
    perfil: ['Osm sérica: Alta (>290 mOsm/kg)', 'Gap osmótico: Muito aumentado', 'Glicemia: Normal', 'Agente em uso: Manitol (principal), glicerol'],
    diagnosis: 'Soluto osmoticamente ativo não permeável (manitol; glicerol) atrai água do intracelular → dilui Na. Osmolalidade sérica ELEVADA. Gap osmótico aumentado.',
    exams: [
      'Osmolalidade sérica e urinária',
      'Gap osmótico (Osm medida − Osm calculada)',
      'Níveis de manitol se em uso',
      'Etanol sérico (eleva o gap osmolar, mas NÃO causa hiponatremia: é osmol inefetivo)',
      'Função renal',
    ],
    treatment: [
      'Suspender o agente causador (manitol, glicerol).',
      'Na normaliza com eliminação do soluto.',
    ],
    warning: 'Não corrigir sódio diretamente — tratar a causa.',
  },

  hipovolemia_extrarrenal: {
    color: '#ff9800', icon: 'tint-slash',
    title: 'Perdas Extrarrenais',
    subtitle: 'Hiponatremia Hipotônica Hipovolêmica',
    perfil: ['Osm sérica: Baixa (<275 mOsm/kg)', 'Volume: Hipovolemia', 'Nau: Baixo (<20 mEq/L) — rim retém Na ao máximo', 'Osm urinária: Alta (>400 mOsm/kg)', 'Ácido úrico sérico: Elevado (hemoconcentração)'],
    diagnosis: 'Perda de sódio e água por via extrarrenal. O rim responde retendo Na ao máximo (Nau <20 mEq/L). ADH elevado por estímulo hemodinâmico. A Osm urinária é alta (>400 mOsm/kg). Ácido úrico sérico elevado (hemoconcentração).',
    exams: [
      'Nau <20 mEq/L (retenção renal máxima — confirma extrarrenal)',
      'Osmolalidade urinária >400 (ADH ativo)',
      'K⁺ sérico (hipocalemia frequente — agrava hiponatremia)',
      'Gasometria: alcalose metabólica (vômitos) ou acidose (diarreia)',
      'Glicemia, função renal, lactato',
      'Cloro urinário <20 mEq/L (útil em alcalose por vômito)',
    ],
    treatment: [
      'NaCl 0,9% IV: restaurar volemia é o tratamento principal.',
      'Volume: 500 mL em bolus → reavaliar hemodinâmica.',
      'Corrigir K⁺ se hipocalemia — cada mEq K⁺ reposto ≈ 1 mEq Na⁺ ganho.',
      'Antiemético IV (vômito); tratar causa infecciosa (diarreia).',
      'Monitorar Na⁺ a cada 4–6h — risco de autocorreção rápida ao restaurar volemia!',
      'Meta 6–8 mEq/L em 24h (máx. 8 se alto risco de ODS; 10 nos demais).',
    ],
    warning: 'Ao restaurar volemia, ADH cai e Na pode subir rapidamente (autocorreção). Se risco de ODS: DDAVP 2–4 mcg IV para controlar a velocidade.',
    calcRoute: 'SodiumCorrectionCalculator',
    calcLabel: '🧮 Calcular Correção de Na⁺',
    ddx: [
      { group: '🤢 GI', items: ['Vômito persistente (alcalose hipoclorêmica)', 'Diarreia secretora ou osmótica', 'Fístula entérica', 'Aspiração nasogástrica'] },
      { group: '🌡️ Pele / Outros', items: ['Sudorese excessiva (exercício, febre)', 'Grandes queimados', 'Sequestro para 3º espaço (pancreatite, peritonite, edema pós-trauma)'] },
    ],
  },

  hipovolemia_renal: {
    color: '#ff9800', icon: 'kidneys',
    title: 'Perdas Renais',
    subtitle: 'Hiponatremia Hipotônica Hipovolêmica',
    perfil: ['Osm sérica: Baixa (<275 mOsm/kg)', 'Volume: Hipovolemia', 'Nau: Alto (>20 mEq/L) — rim perde Na ativamente', 'K⁺: ↓ em diuréticos; ↑ em insuf. adrenal primária', 'FE_urato: <12% após correção → diferencia de SIADH'],
    diagnosis: 'Perda de Na pela urina apesar de depleção de volume. Nau >20 mEq/L. Tiazídicos são a causa mais comum — bloqueiam NaCl no túbulo distal e potencializam ação do ADH. FE_ureia e FE_urato ajudam a diferenciar de SIADH quando paciente em uso de diurético.',
    exams: [
      'Nau >20 mEq/L (perda renal ativa)',
      'K⁺ sérico: ↓ em diuréticos; ↑ em insuficiência adrenal primária',
      'Cortisol basal urgente (insuf. adrenal se K⁺ alto + hipovolemia)',
      'FE_urato: <12% antes e normaliza após correção → diurético; persiste baixo → SIADH',
      'FE_K (potássio): útil para diferenciar tiazídico vs hipoaldosteronismo',
      'Cloro urinário, gasometria (ATR: acidose + Nau alto)',
      'Osmolalidade urinária e sérica',
    ],
    treatment: [
      'Suspender o diurético se for a causa.',
      'NaCl 0,9% IV para restaurar volemia.',
      'K⁺ alto + Nau >20 + sem diurético → suspeita de Addison → hidrocortisona 100 mg IV urgente.',
      'ATR tipo 1: citrato de potássio + alcalinização.',
      'Nefropatia perdedora de sal: reposição oral de NaCl + fludrocortisona.',
      'Monitorar Na⁺ a cada 4–6h. Meta 6–8 mEq/L em 24h (máx. 8 se alto risco de ODS; 10 nos demais).',
    ],
    warning: 'Não esquecer Addison! K⁺ ↑ + Nau ↑ + hipovolemia sem causa óbvia = insuficiência adrenal primária até prova em contrário.',
    calcRoute: 'SodiumCorrectionCalculator',
    calcLabel: '🧮 Calcular Correção de Na⁺',
    ddx: [
      { group: '💊 Diuréticos (causa mais comum)', items: ['Tiazídicos: hidroclorotiazida, clortalidona (bloqueiam NaCl distal + potencializam ADH)', 'Diuréticos de alça: menos comum (bloqueiam ADH em medula)', 'Acetazolamida'] },
      { group: '🧬 Endócrino/Renal', items: ['Insuficiência adrenal primária (Addison): K⁺ ↑, hipotensão, hiperpigmentação', 'Hipoaldosteronismo hiporreninêmico (DM tipo 4)', 'Síndrome de Bartter/Gitelman: perda renal de Na+K + alcalose', 'Acidose Tubular Renal tipo 1 e 2', 'Nefropatia perdedora de sal (DRC, rim policístico, pielonefrite crônica)'] },
    ],
  },

  hipotireoidismo: {
    color: '#795548', icon: 'shield-virus',
    title: 'Hipotireoidismo',
    subtitle: 'Hiponatremia Hipotônica Euvolêmica',
    perfil: ['Osm sérica: Baixa (<275 mOsm/kg)', 'Volume: Euvolemia', 'TSH: Elevado (hipotireoidismo primário)', 'T4 livre: Reduzido', 'Nau: Variável (geralmente >20 mEq/L)'],
    diagnosis: 'Hipotireoidismo causa redução do débito cardíaco e da TFG → estímulo não osmótico de ADH → retenção de água livre. Deve ser excluído ANTES de diagnosticar SIADH.',
    exams: [
      'TSH (elevado no hipotireoidismo primário)',
      'T4 livre (reduzido)',
      'Osmolalidade sérica e urinária',
      'Sódio urinário',
      'Anticorpos anti-TPO (tireoidite de Hashimoto)',
    ],
    treatment: [
      'Levotiroxina oral: dose conforme TSH e peso.',
      'Na normaliza progressivamente com a reposição.',
      'Idosos e cardiopatas: iniciar com dose baixa (25–50 mcg/dia).',
      'Reavaliação de TSH em 6–8 semanas.',
    ],
    warning: 'Não tratar com restrição hídrica ou vaptans sem antes confirmar função tireoidiana!',
  },

  insuf_adrenal: {
    color: '#e91e63', icon: 'exclamation-triangle',
    title: 'Insuficiência Adrenal',
    subtitle: 'Hiponatremia Hipotônica Euvolêmica',
    perfil: ['Osm sérica: Baixa (<275 mOsm/kg)', 'Volume: Euvolemia ou leve hipovolemia', 'K⁺: Elevado (insuficiência adrenal primária)', 'Cortisol basal: <18 mcg/dL (suspeita) / <15 mcg/dL (confirma)', 'ACTH: ↑ se primária, ↓ se secundária', 'Glicemia: Hipoglicemia frequente'],
    diagnosis: 'Cortisol baixo → desinibição do ADH → retenção de água livre. Aldosterona baixa (se primária) → perda de sódio renal. EMERGÊNCIA: crise adrenal pode cursar com choque.',
    exams: [
      'Cortisol basal (idealmente às 8h) — se <18 mcg/dL: suspeita',
      'ACTH plasmático (elevado = primária; baixo = secundária)',
      'ACTH estimulado (250 mcg IV/IM): confirma o diagnóstico',
      'Eletrólitos: Na⁺ baixo, K⁺ elevado (primária)',
      'Glicemia (hipoglicemia frequente)',
      'Anticorpos antiadrenais (primária autoimune)',
    ],
    treatment: [
      'URGÊNCIA: Hidrocortisona 100 mg IV em bolus + 50–100 mg q8h.',
      'Hidratação com NaCl 0,9% para restaurar volemia.',
      'Fludrocortisona 0,1 mg/dia (insuficiência primária, após estabilização).',
      'Na normaliza com a reposição de cortisol.',
      'Investigar causa: TC de adrenais (primária), RNM de hipófise (secundária).',
    ],
    warning: '⚠️ EMERGÊNCIA ENDÓCRINA — não aguardar resultado de cortisol para tratar se quadro grave!',
  },

  siadh: {
    color: '#2196F3', icon: 'brain',
    title: 'SIADH',
    subtitle: 'Síndrome de Antidiurese Inapropriada',
    perfil: ['Osm sérica: Baixa (<275 mOsm/kg)', 'Volume: Euvolemia (normovolemia)', 'Nau: Elevado (>30 mEq/L)', 'Osm urinária: Inapropriadamente alta (>100, tipic. >500)', 'Ácido úrico sérico: <4 mg/dL', 'FE_ureia: <35%'],
    diagnosis: 'ADH elevado inapropriadamente, sem estímulo osmótico ou hemodinâmico. Critérios clássicos (Schwartz-Bartter; Bartter–Schwartz): Na <135 + Osm sérica <275 + Osm urinária >100 (tipic. >500) + Nau >20–30 mEq/L + euvolemia clínica + TSH e cortisol normais. Ácido úrico <4 mg/dL e FE_ureia <35% reforçam o diagnóstico.',
    exams: [
      'Osmolalidade urinária e Nau (OsmU >100; Nau >20–30)',
      'Ácido úrico sérico (<4 mg/dL: sugestivo de SIADH)',
      'FE_ureia <35% e FE_urato <12% (pós-correção: confirma SIADH vs salt-wasting)',
      'RX tórax + TC tórax/abdome (neoplasia oculta, TB, pneumonia)',
      'RNM de crânio se sintoma neurológico (AVC, tumor, meningite)',
      'Revisão rigorosa de medicamentos em uso',
    ],
    treatment: [
      'Restrição hídrica 500 mL/dia (1ª linha — diretriz europeia ESE/ESICM/ERA-EDTA 2014).',
      'Sal oral NaCl 1g (17 mEq) + furosemida 20–40 mg: eficaz e barato.',
      'Ureia oral 15–30 g/dia: 2ª linha; aumenta excreção de água livre.',
      'Tolvaptana 7,5–15 mg VO: SIADH refratária selecionada — monitorar TGF hepático.',
      'NÃO usar vaptan em hiponatremia aguda/sintomática.',
      'Tratar causa de base sempre (suspender droga, tratar infecção, oncologia).',
    ],
    warning: 'Meta de correção: 6–8 mEq/L em 24h (máx. 8 se alto risco de ODS; 10 nos demais). Se sintomas graves → NaCl 3% enquanto investiga.',
    calcRoute: 'SodiumCorrectionCalculator',
    calcLabel: '🧮 Calcular Correção de Na⁺',
    ddx: [
      { group: '🧠 SNC', items: ['Meningite / encefalite', 'AVC isquêmico ou hemorrágico', 'HSA (hemorragia subaracnóide)', 'TCE / neurocirurgia', 'Síndrome perdedora de sal cerebral (diagnóstico diferencial!)', 'Tumor cerebral / Guillain-Barré'] },
      { group: '🫁 Pulmonar', items: ['Pneumonia bacteriana / viral', 'Tuberculose pulmonar', 'Ventilação com pressão positiva', 'DPOC descompensada'] },
      { group: '🧬 Neoplásica (ADH ectópico)', items: ['Ca. de pulmão (pequenas células — mais comum)', 'Ca. de pâncreas, duodeno', 'Timoma, linfomas', 'Ca. de bexiga / próstata'] },
      { group: '💊 Drogas (Shepshelovich, Br J Clin Pharmacol 2017)', items: ['SSRIs (fluoxetina, sertralina, escitalopram)', 'Carbamazepina / oxcarbazepina', 'NSAIDs (inibem prostaglandinas)', 'Tramadol, antipsicóticos', 'Ciclofosfamida IV, vincristina', 'MDMA/ecstasy (Atila et al. JAMA Netw Open 2024)', 'Amiodarona (casos reportados)'] },
      { group: '⚠️ DD SIADH vs Cerebral Salt Wasting', items: ['Ambos: euvolêmico clinicamente, Nau >20, OsmU alta', 'SIADH: FE_urato <12% após correção do Na (persiste)', 'CSW: FE_urato normaliza após correção do Na', 'CSW: hipovolemia real difícil de distinguir clinicamente', 'CSW: responde a reposição de sal e volume (não restrição!)'] },
    ],
  },

  polidipsia: {
    color: '#00bcd4', icon: 'water',
    title: 'Polidipsia Primária',
    subtitle: 'Hiponatremia Hipotônica Euvolêmica',
    perfil: ['Osm sérica: Baixa (<275 mOsm/kg)', 'Volume: Euvolemia', 'Osm urinária: BAIXA (<100 mOsm/kg) — ADH suprimido (chave diagnóstica!)', 'Nau: Baixo', 'Ácido úrico sérico: Normal'],
    diagnosis: 'Ingestão excessiva de água dilui o sódio. ADH é fisiologicamente suprimido → urina diluída (OsmU <100 mOsm/kg). Frequente em psicose, uso de antipsicóticos, corridas de longa distância.',
    exams: [
      'Osmolalidade urinária <100 mOsm/kg (ADH suprimido — chave diagnóstica)',
      'Sódio urinário baixo',
      'Avaliação psiquiátrica',
      'Revisão de medicamentos (antipsicóticos)',
    ],
    treatment: [
      'Restrição hídrica rigorosa.',
      'Tratar causa psiquiátrica de base.',
      'Revisar antipsicóticos (clozapina → polidipsia).',
      'Casos graves (atletas, MDMA): NaCl 3% se sintomático.',
    ],
    warning: 'Urina hipotônica (OsmU <100) em hiponatremia euvolêmica = polidipsia primária, não SIADH.',
  },

  hipervolemia_ic: {
    color: '#4caf50', icon: 'heartbeat',
    title: 'Insuficiência Cardíaca',
    subtitle: 'Hiponatremia Hipotônica Hipervolêmica',
    perfil: ['Osm sérica: Baixa (<275 mOsm/kg)', 'Volume: Hipervolemia (sobrecarga)', 'Nau: Baixo (<20 mEq/L, sem diurético)', 'BNP/NT-proBNP: Elevado', 'POCUS: VCI fixa/dilatada + Linhas B pulmonares difusas'],
    diagnosis: 'Baixo débito cardíaco → ativação de SRAA e ADH → retenção de água e sódio, com predomínio de retenção de água. Nau <20 mEq/L (sem diurético). BNP elevado.',
    exams: [
      'BNP ou NT-proBNP (elevado)',
      'ECO cardíaco (FE reduzida ou preservada)',
      'Raio-X de tórax (congestão)',
      'Eletrólitos, creatinina, ureia',
      'Nau geralmente <20 mEq/L sem diurético',
    ],
    treatment: [
      'Restrição hídrica 500–1000 mL/dia + restrição de sódio dietético.',
      'Furosemida IV: 40–80 mg (ajustar pela diurese).',
      'Otimizar IECA/BRA, betabloqueador, sacubitril/valsartana.',
      'Espironolactona/eplerenona conforme tolerância.',
      'Corrigir Na⁺ só se sintomático — não é o objetivo principal.',
    ],
  },

  hipervolemia_cirrose: {
    color: '#8d6e63', icon: 'procedures',
    title: 'Cirrose Hepática',
    subtitle: 'Hiponatremia Hipotônica Hipervolêmica',
    perfil: ['Osm sérica: Baixa (<275 mOsm/kg)', 'Volume: Hipervolemia (ascite, edema)', 'Nau: Baixo (<20 mEq/L, sem diurético)', 'Albumina: Reduzida', 'TFG hepática: Alterada (TP/INR, bilirrubinas)'],
    diagnosis: 'Vasodilatação esplâncnica → ↓ volume arterial efetivo → ativação de SRAA e ADH → retenção hídrica. Ascite + edema + varizes. Nau <20 mEq/L (sem diurético).',
    exams: [
      'TGO, TGP, GGT, FA, bilirrubinas, albumina',
      'TP/INR (função hepática)',
      'US abdome (ascite, esplenomegalia)',
      'Nau (geralmente <20 mEq/L)',
      'Osmolalidade urinária',
      'Endoscopia (varizes esofágicas)',
    ],
    treatment: [
      'Restrição hídrica 500–1000 mL/dia + sódio dietético <2g/dia.',
      'Espironolactona 100–400 mg + furosemida 40–160 mg.',
      'Paracentese (ascite refratária).',
      'Avaliar TIPS em casos selecionados.',
      'Transplante hepático é o tratamento definitivo.',
    ],
    warning: 'Hiponatremia em cirrótico (Na <130) = pior prognóstico e critério de transplante urgente.',
  },

  hipervolemia_nefrotico: {
    color: '#607d8b', icon: 'tint',
    title: 'Síndrome Nefrótica / DRC',
    subtitle: 'Hiponatremia Hipotônica Hipervolêmica',
    perfil: ['Osm sérica: Baixa (<275 mOsm/kg)', 'Volume: Hipervolemia (edema anasarca)', 'Nau: Baixo (<20 mEq/L)', 'Proteinúria 24h: >3,5 g/dia (nefrótica)', 'Albumina sérica: Muito reduzida (<2,5 g/dL)', 'Creatinina: Elevada (DRC)'],
    diagnosis: 'Proteinúria maciça (>3,5g/dia) → hipoalbuminemia → ↓ pressão oncótica → extravasamento para 3º espaço → ↓ volume efetivo → ADH elevado. DRC avançada também causa retenção de água.',
    exams: [
      'Proteinúria 24h ou relação Prot/Creat urinária',
      'Albumina sérica (baixa na nefrótica)',
      'Complemento C3/C4 (glomerulopatias)',
      'ANCA, FAN, anti-DNA (vasculites, lúpus)',
      'Creatinina e TFG (DRC)',
      'Biópsia renal conforme indicação',
    ],
    treatment: [
      'Restrição hídrica e de sódio.',
      'Furosemida IV + albumina se edema refratário.',
      'Tratar causa da nefropatia (imunossupressão, IECA/BRA).',
      'DRC: diálise se necessário.',
    ],
  },
};

/* ================================================================
   FLUXO — NÓS
================================================================ */
const NODES: FlowNode[] = [
  // ---- PASSO 1: Sódio ----
  {
    id: 'na',
    type: 'input',
    icon: 'flask', iconColor: '#2196F3',
    question: 'Qual o sódio sérico?',
    subtitle: 'Confirma o diagnóstico de hiponatremia',
    inputKey: 'na',
    inputUnit: 'mEq/L',
    inputPlaceholder: 'Ex: 128',
    inputKeyboardType: 'decimal-pad',
    validate: (v) => {
      const n = parseFloat(v);
      if (!v || isNaN(n)) return 'Insira o valor do sódio';
      if (n < 50 || n > 180) return 'Valor fora do esperado (50–180)';
      if (n >= 135) return 'Na ≥135: não é hiponatremia. Verificar indicação.';
      return null;
    },
    next: (_v, _ctx) => 'osm',
  },

  // ---- PASSO 2: Osmolalidade ----
  {
    id: 'osm',
    type: 'input',
    icon: 'tint', iconColor: '#9c27b0',
    question: 'Qual a osmolalidade sérica?',
    subtitle: 'Classifica o tipo de hiponatremia. Use a calculadora se necessário.',
    inputKey: 'osm',
    inputUnit: 'mOsm/kg',
    inputPlaceholder: 'Ex: 265',
    inputKeyboardType: 'decimal-pad',
    showCalcButton: true,
    validate: (v) => {
      if (!v) return null; // permite pular via botão "Não possuo"
      const n = parseFloat(v);
      if (isNaN(n) || n < 100 || n > 500) return 'Valor fora do esperado (100–500)';
      return null;
    },
    next: (v, ctx) => {
      if (!v) {
        ctx.missingExamsWarnings = (ctx.missingExamsWarnings || '') +
          '• Osmolalidade sérica não realizada: Hiponatremia Isotônica (Pseudohiponatremia) e Hipertônica não puderam ser formalmente descartadas. Assumido percurso hipotônico.\n';
        return 'volemia';
      }
      const osm = parseFloat(v);
      if (osm < 275) return 'volemia';
      if (osm <= 290) return 'result_pseudohipo';
      return 'glicemia';
    },
  },

  // ---- HIPERTÔNICA: glicemia ----
  {
    id: 'glicemia',
    type: 'choice',
    icon: 'tint', iconColor: '#f44336',
    question: 'Osmolalidade elevada (>290). Há hiperglicemia?',
    subtitle: 'Principal causa de hiponatremia hipertônica',
    choiceKey: 'glicemia',
    choices: [
      { label: 'Sim, glicemia elevada', sublabel: 'Diabetes, CAD, EHH', icon: 'check-circle', color: '#f44336', value: 'sim' },
      { label: 'Não', sublabel: 'Manitol ou glicerol em uso', icon: 'times-circle', color: '#ff9800', value: 'nao' },
    ],
    next_choice: (v) => v === 'sim' ? 'result_hipertonica_glicose' : 'result_hipertonica_outro',
  },

  // ---- PASSO 3: Volemia ----
  {
    id: 'volemia',
    type: 'choice',
    icon: 'heartbeat', iconColor: '#4caf50',
    question: 'Hiponatremia Hipotônica confirmada. Qual o estado volêmico?',
    subtitle: 'Avalie sinais vitais, exame físico e histórico',
    choiceKey: 'volemia',
    choices: [
      {
        label: 'Hipovolemia (Depleção de Volume)',
        sublabel: 'Clínica: Mucosas secas, turgor cutâneo ↓, hipotensão ortostática, taquicardia.\nPOCUS: Colabamento de VCI >50%, ausência de Linhas B pulmonares, variação de pressão de pulso aumentada.',
        icon: 'tint-slash', color: '#ff9800', value: 'hipo',
      },
      {
        label: 'Normovolemia (Euvolemia)',
        sublabel: 'Clínica: Hidratado, sem edemas ou estase jugular, PA estável.\nPOCUS: VCI com diâmetro e colababilidade normais, PLR negativo, ECO com DC estável sem sobrecarga.',
        icon: 'balance-scale', color: '#2196F3', value: 'normo',
      },
      {
        label: 'Hipervolemia (Sobrecarga de Volume)',
        sublabel: 'Clínica: Edema periférico, ascite, crepitações, turgência jugular.\nPOCUS: VCI dilatada (>2 cm) sem colabamento, Linhas B difusas (síndrome intersticial), padrão VExUS de congestão sistêmica.',
        icon: 'water', color: '#4caf50', value: 'hiper',
      },
    ],
    next_choice: (v) => {
      if (v === 'hipo') return 'nau_hipo';
      if (v === 'normo') return 'tsh';
      return 'causa_hiper';
    },
  },

  // ---- HIPOVOLÊMICA: Nau ----
  {
    id: 'nau_hipo',
    type: 'input',
    icon: 'vial', iconColor: '#ff9800',
    question: 'Qual o sódio urinário (Nau)?',
    subtitle: 'Diferencia perdas renais de extrarrenais',
    inputKey: 'nau',
    inputUnit: 'mEq/L',
    inputPlaceholder: 'Ex: 15',
    inputKeyboardType: 'decimal-pad',
    validate: (v) => {
      if (!v) return null; // permite pular
      const n = parseFloat(v);
      if (isNaN(n) || n < 0 || n > 300) return 'Valor fora do esperado';
      return null;
    },
    next: (v, ctx) => {
      if (!v) {
        ctx.missingExamsWarnings = (ctx.missingExamsWarnings || '') +
          '• Sódio urinário (Nau) não realizado: Perdas renais e extrarrenais não puderam ser diferenciadas. Exame essencial — solicitar com urgência.\n';
        return 'result_hipo_extrarenal'; // rota mais comum como padrão
      }
      const nau = parseFloat(v);
      return nau < 20 ? 'result_hipo_extrarenal' : 'result_hipo_renal';
    },
  },

  // ---- EUVOLÊMICA: TSH ----
  {
    id: 'tsh',
    type: 'choice',
    icon: 'shield-virus', iconColor: '#795548',
    question: 'TSH está normal?',
    subtitle: 'Hipotireoidismo deve ser excluído antes de diagnosticar SIADH',
    choiceKey: 'tsh',
    choices: [
      { label: 'Sim, TSH normal', icon: 'check-circle', color: '#4caf50', value: 'normal' },
      { label: 'Não, TSH alterado (elevado)', icon: 'times-circle', color: '#795548', value: 'alterado' },
    ],
    next_choice: (v) => v === 'normal' ? 'cortisol' : 'result_hipotireoidismo',
  },

  // ---- EUVOLÊMICA: Cortisol ----
  {
    id: 'cortisol',
    type: 'choice',
    icon: 'exclamation-triangle', iconColor: '#e91e63',
    question: 'Cortisol basal está normal?',
    subtitle: 'Insuficiência adrenal mimetiza SIADH e é emergência clínica',
    choiceKey: 'cortisol',
    choices: [
      { label: 'Sim, cortisol normal', icon: 'check-circle', color: '#4caf50', value: 'normal' },
      { label: 'Não / Suspeita de insuficiência adrenal', icon: 'times-circle', color: '#e91e63', value: 'alterado' },
    ],
    next_choice: (v) => v === 'normal' ? 'osm_urina' : 'result_insuf_adrenal',
  },

  // ---- EUVOLÊMICA: Osmolalidade urinária ----
  {
    id: 'osm_urina',
    type: 'input',
    icon: 'vial', iconColor: '#2196F3',
    question: 'Qual a osmolalidade urinária?',
    subtitle: 'Distingue SIADH de polidipsia primária',
    inputKey: 'osm_urina',
    inputUnit: 'mOsm/kg',
    inputPlaceholder: 'Ex: 480',
    inputKeyboardType: 'decimal-pad',
    validate: (v) => {
      if (!v) return null; // permite pular
      const n = parseFloat(v);
      if (isNaN(n) || n < 30 || n > 1400) return 'Valor fora do esperado';
      return null;
    },
    next: (v, ctx) => {
      if (!v) {
        ctx.missingExamsWarnings = (ctx.missingExamsWarnings || '') +
          '• Osmolalidade urinária não realizada: SIADH e Polidipsia Primária não puderam ser diferenciadas. Assumido SIADH (hipótese mais provável na euvolemia). Solicitar exame para confirmar.\n';
        return 'result_siadh';
      }
      const osmu = parseFloat(v);
      return osmu < 100 ? 'result_polidipsia' : 'result_siadh';
    },
  },

  // ---- HIPERVOLÊMICA: Causa ----
  {
    id: 'causa_hiper',
    type: 'choice',
    icon: 'water', iconColor: '#4caf50',
    question: 'Qual a causa mais provável da hipervolemia?',
    subtitle: 'Avalie clínica + exames complementares',
    choiceKey: 'causa_hiper',
    choices: [
      { label: 'Insuficiência Cardíaca', sublabel: 'Dispneia, BNP elevado, ECO alterado', icon: 'heartbeat', color: '#f44336', value: 'ic' },
      { label: 'Cirrose Hepática', sublabel: 'Ascite, icterícia, varizes', icon: 'procedures', color: '#8d6e63', value: 'cirrose' },
      { label: 'Sd. Nefrótica / DRC', sublabel: 'Proteinúria, edema, creatinina elevada', icon: 'tint', color: '#607d8b', value: 'nefro' },
    ],
    next_choice: (v) => {
      if (v === 'ic') return 'result_ic';
      if (v === 'cirrose') return 'result_cirrose';
      return 'result_nefro';
    },
  },

  // ---- RESULTADOS ----
  { id: 'result_pseudohipo', type: 'result', result: R.pseudohipo },
  { id: 'result_hipertonica_glicose', type: 'result', result: R.hipertonica_glicose },
  { id: 'result_hipertonica_outro', type: 'result', result: R.hipertonica_outro },
  { id: 'result_hipo_extrarenal', type: 'result', result: R.hipovolemia_extrarrenal },
  { id: 'result_hipo_renal', type: 'result', result: R.hipovolemia_renal },
  { id: 'result_hipotireoidismo', type: 'result', result: R.hipotireoidismo },
  { id: 'result_insuf_adrenal', type: 'result', result: R.insuf_adrenal },
  { id: 'result_siadh', type: 'result', result: R.siadh },
  { id: 'result_polidipsia', type: 'result', result: R.polidipsia },
  { id: 'result_ic', type: 'result', result: R.hipervolemia_ic },
  { id: 'result_cirrose', type: 'result', result: R.hipervolemia_cirrose },
  { id: 'result_nefro', type: 'result', result: R.hipervolemia_nefrotico },
];

const NODE_MAP: Record<string, FlowNode> = Object.fromEntries(NODES.map(n => [n.id, n]));

export { R as RESULTADOS, NODES as NOS, NODE_MAP as MAPA_NOS };
export type { FlowNode as NoFluxo, ResultData as ResultadoFluxo, Context as ContextoFluxo };
