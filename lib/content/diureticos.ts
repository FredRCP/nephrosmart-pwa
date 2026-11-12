// Guia de diuréticos disponíveis no Brasil. Dados das BULAS (Anvisa/fabricantes, conferidas em 12/11/2026) e, quando a bula é
// omissa, de farmacologia clássica — esses itens vêm marcados em `fora` ("fora da bula"). Não é prescrição. Sem "equivalência"
// entre classes: ela não existe. Pendências de conferência: ver PESQUISAR_EQUIPE.md.

export type ClasseDiuretico = 'alca' | 'tiazidico' | 'poupador' | 'mineralocorticoide' | 'anidrase' | 'osmotico';

/** Em ordem alfabética (pelo nome). `cor` identifica a classe nos cartões, como as categorias na lista de ferramentas. */
export const CLASSES_DIURETICO: { id: ClasseDiuretico; nome: string; cor: string; resumo: string }[] = [
  { id: 'alca', nome: 'Alça', cor: '#3b82f6', resumo: 'Inibem o cotransportador Na-K-2Cl (NKCC2) no ramo ascendente espesso da alça de Henle. Maior potência.' },
  { id: 'anidrase', nome: 'Anidrase carbônica', cor: '#0d9488', resumo: 'Inibe a anidrase carbônica no túbulo proximal: bicarbonatúria e acidose metabólica hiperclorêmica.' },
  { id: 'mineralocorticoide', nome: 'Antagonistas mineralocorticoides', cor: '#8b5cf6', resumo: 'Bloqueiam o receptor de mineralocorticoide no túbulo coletor. Risco de hipercalemia, sobretudo na DRC.' },
  { id: 'osmotico', nome: 'Osmótico', cor: '#ef4444', resumo: 'Filtrado e não reabsorvido: aumenta a osmolaridade tubular e plasmática. Uso hospitalar, IV.' },
  { id: 'poupador', nome: 'Poupadores de potássio', cor: '#f59e0b', resumo: 'Bloqueiam o canal epitelial de sódio (ENaC) no túbulo coletor. Risco de hipercalemia.' },
  { id: 'tiazidico', nome: 'Tiazídicos e similares', cor: '#16a34a', resumo: 'Inibem o cotransportador Na-Cl (NCC) no túbulo contorcido distal. Perdem eficácia na TFG baixa (ver cada fármaco).' },
];

export interface GuiaDiuretico {
  id: string;
  classe: ClasseDiuretico;
  generico: string;
  /** Nomes comerciais encontrados em bula no Brasil (isolados e, em `associacoes`, combinações). */
  comerciais: string[];
  associacoes?: string[];
  apresentacoes: string[];
  /** Posologia de adulto conforme a bula, por indicação. */
  dose: string[];
  inicioDuracao: string[];
  riscos: string[];
  drc: string[];
  /** Observações de literatura/farmacologia que NÃO constam na bula. */
  fora?: string[];
}

export const GUIA_DIURETICOS: GuiaDiuretico[] = [
  {
    id: 'furosemida', classe: 'alca', generico: 'Furosemida', comerciais: ['Lasix®'],
    apresentacoes: ['Comprimido 40 mg', 'Injetável 10 mg/mL (ampola de 2 mL = 20 mg), IV ou IM'],
    dose: ['VO: início 20–80 mg/dia; manutenção 20–40 mg/dia (máximo conforme resposta); em jejum.',
      'IV/IM: 20–40 mg; se necessário, aumentar 20 mg a cada 2 h até diurese adequada, e repetir a dose eficaz 1–2×/dia.',
      'Edema agudo de pulmão (IV): 40 mg; se preciso, mais 20–40 mg após 20 min. Faixa de 100–300 mg/dia por no máximo 48 h.',
      'Infusão IV: no máximo 4 mg/min (2,5 mg/min se creatinina > 5 mg/dL).'],
    inicioDuracao: ['VO: início em ~60 min; duração de 3–6 h (após 40 mg em voluntários sadios).', 'IV: início em ~15 min; duração de ~3 h (após 20 mg).'],
    riscos: ['Hipocalemia e hiponatremia (distúrbios eletrolíticos muito comuns), desidratação/hipovolemia.',
      'Ototoxicidade: incomum e em geral transitória, mais frequente na insuficiência renal, hipoproteinemia e injeção IV rápida; há relatos de surdez às vezes irreversível.',
      'Contraindicada em anúria, pré-coma/coma hepático, hipopotassemia ou hiponatremia graves, hipovolemia e lactação.'],
    drc: ['Eliminação reduzida: meia-vida pode chegar a 24 h na insuficiência renal grave; pouco dialisável.', 'Reduzir a velocidade da infusão IV (≤ 2,5 mg/min com creatinina > 5 mg/dL).', 'Monitorar sódio, potássio e creatinina.'],
    fora: ['Na TFG baixa é preciso atingir a dose-limiar para haver natriurese; a biodisponibilidade oral é variável (~50%).'],
  },
  {
    id: 'bumetanida', classe: 'alca', generico: 'Bumetanida', comerciais: ['Burinax®'],
    apresentacoes: ['Comprimido 1 mg'],
    dose: ['VO: dose habitual de 0,5 a 1 mg/dia (meio a um comprimido). A bula consultada não traz via IV nem dose máxima.'],
    inicioDuracao: ['Início ~30 min após a ingestão oral; pico ~1,5 h; ação diurética completa em 4–6 h.'],
    riscos: ['Hipocalemia: comum (1–10%); a bula orienta repor potássio em tratamentos prolongados, sobretudo com digitálicos.',
      'A bula não cita hiponatremia nem ototoxicidade como reação, mas contraindica o uso com ototóxicos (gentamicina, neomicina, estreptomicina, amicacina), lítio e nefrotóxicos.',
      'Contraindicada em anúria, coma hepático e perda eletrolítica grave.'],
    drc: ['Cautela na disfunção renal; a bula não traz ajuste específico. Insuficiência renal é reação rara.'],
    fora: ['Equivalência de referência: 1 mg de bumetanida ≈ 40 mg de furosemida VO (ver aba Converter).'],
  },
  {
    id: 'piretanida', classe: 'alca', generico: 'Piretanida', comerciais: ['Arelix®'],
    apresentacoes: ['Cápsula de liberação prolongada 6 mg'],
    dose: ['Hipertensão leve a moderada: 1 a 2 cápsulas/dia (a 2ª não à noite); manutenção usual 1 cápsula/dia.', 'Edema: em geral 1 cápsula/dia no início; doses adicionais conforme resposta. Engolir inteira, após refeição. A bula consultada não define dose máxima.'],
    inicioDuracao: ['Efeito anti-hipertensivo gradual nas primeiras 1–2 semanas; duração de cerca de 24 h (formulação de liberação prolongada).'],
    riscos: ['Pouco efeito sobre o potássio nas doses recomendadas, mas pode ocorrer perda (risco maior com vômitos, diarreia, laxantes).', 'Depleção de sódio com restrição salina muito rígida; desidratação, hipotensão, aumento de ácido úrico, redução da tolerância à glicose, fotossensibilidade.',
      'Ototoxicidade não listada como reação; a bula alerta para soma de efeitos com antibióticos ototóxicos.', 'Contraindicada em insuficiência renal com anúria, hipopotassemia/hiponatremia graves e hipovolemia.'],
    drc: ['Ureia e creatinina podem subir durante o tratamento; sem ajuste específico na bula. Monitorar potássio, glicemia e ácido úrico.'],
  },
  {
    id: 'hidroclorotiazida', classe: 'tiazidico', generico: 'Hidroclorotiazida', comerciais: ['Clorana®'],
    associacoes: ['Moduretic®/Amiretic® (com amilorida)', 'Iguassina® (com triantereno)', 'Aldazida® (com espironolactona)'],
    apresentacoes: ['Comprimido 25 mg e 50 mg'],
    dose: ['Hipertensão: início 50–100 mg/dia, dose única pela manhã ou fracionada; reavaliar após 1 semana.', 'Edema: início 50–100 mg 1–2×/dia até o peso seco; manutenção 25–200 mg/dia ou em dias alternados. A bula não define máximo diário (maior valor citado: 200 mg/dia).'],
    inicioDuracao: ['Início em ~2 h; efeito máximo em ~4 h; duração de ~6–12 h.'],
    riscos: ['Hipocalemia (mais provável com diurese rápida, uso prolongado, cirrose grave, corticoides/ACTH) e hiponatremia (atenção com carbamazepina).', 'Aumenta a toxicidade da digoxina pela hipocalemia. Monitorar eletrólitos.', 'Contraindicada com depuração de creatinina < 30 mL/min, distúrbio hepático grave, distúrbio eletrolítico grave e anúria.'],
    drc: ['Contraindicada pela bula com ClCr < 30 mL/min; pode causar azotemia. Se a função renal piorar, rever ou suspender.'],
  },
  {
    id: 'clortalidona', classe: 'tiazidico', generico: 'Clortalidona', comerciais: ['Higroton®'],
    apresentacoes: ['Comprimido 12,5 mg, 25 mg e 50 mg'],
    dose: ['Hipertensão: 12,5–50 mg/dia (início 12,5 ou 25 mg); efeito pleno em 3–4 semanas.', 'Insuficiência cardíaca estável (NYHA II/III): início 25–50 mg/dia; casos graves até 100–200 mg/dia; manutenção 25–50 mg/dia ou em dias alternados.',
      'Edema: menor dose eficaz, por períodos limitados, sem exceder 50 mg/dia.', 'Cálculo renal de oxalato de cálcio recorrente: 25 mg/dia (sem ganho acima de 50 mg).'],
    inicioDuracao: ['Diurese inicia 2–3 h após a dose, com pico entre 4 e 24 h, e pode durar 2–3 dias.', 'Meia-vida média de eliminação ~50 h; edema melhora em ~2 dias, perda de peso pode levar até 2 semanas.'],
    riscos: ['Hipocalemia dose-dependente (queda média de ~0,5 mmol/L com 25–50 mg/dia): dosar potássio no início e após 3–4 semanas.', 'Hiponatremia; hiperuricemia (reduz a depuração de ácido úrico); hipercalcemia refratária contraindica.', 'Contraindicada em anúria, insuficiência hepática grave, ClCr < 30 mL/min, hipocalemia/hiponatremia/hipercalcemia refratárias e hiperuricemia sintomática.'],
    drc: ['Pela bula: cautela na insuficiência renal grave (ClCr < 30 mL/min), com risco de azotemia e acúmulo; sem ajuste inicial na insuficiência leve a moderada; abaixo de 30 mL/min o efeito diurético se perde.'],
    fora: ['CLICK (Agarwal R et al., N Engl J Med 2021;385:2507): DRC estágio 4 (TFG 15–29) com hipertensão não controlada; clortalidona iniciada com 12,5 mg/dia e dobrada a cada 4 semanas até 50 mg, por 12 semanas, reduziu a pressão arterial versus placebo, com mais hipocalemia, hiponatremia, hiperglicemia, hipotensão ortostática, queda da TFG e lesão renal aguda. É uso fora do que a bula orienta.'],
  },
  {
    id: 'indapamida', classe: 'tiazidico', generico: 'Indapamida', comerciais: ['Natrilix®', 'Natrilix SR®', 'Flux SR®'],
    apresentacoes: ['Drágea 2,5 mg (Natrilix)', 'Comprimido de liberação prolongada 1,5 mg (Natrilix SR, Flux SR)'],
    dose: ['Hipertensão essencial: 1 drágea/dia de 2,5 mg, de preferência pela manhã, sem exceder 2,5 mg/dia (Natrilix).', 'Natrilix SR / Flux SR (1,5 mg, liberação prolongada): 1 comprimido ao dia, de preferência pela manhã, engolido inteiro com água (não mastigar, partir ou abrir).'],
    inicioDuracao: ['A bula consultada não informa início e duração; a posologia é de dose única diária.'],
    riscos: ['Hipocalemia e hiponatremia (frequência desconhecida na bula); monitorar sódio, potássio e cálcio.', 'Reações cutâneas e alérgicas; angioedema ou reação cutânea grave exige suspensão imediata.', 'Contraindicada em alergia a sulfonamidas, doença renal grave, doença hepática grave/encefalopatia, hipocalemia e crianças.'],
    drc: ['Contraindicada na doença renal grave; a bula não traz ajuste de dose para a insuficiência renal.'],
    fora: ['É um diurético tiazídico-símile (como a clortalidona; revisão da ESH 2019), com duração de ação de 24–34 h. Não há equivalência de dose consolidada com a hidroclorotiazida.'],
  },
  {
    id: 'amilorida', classe: 'poupador', generico: 'Amilorida', comerciais: [], associacoes: ['Moduretic®/Amiretic® e genéricos (hidroclorotiazida 25 mg + amilorida 2,5 mg, ou 50 mg + 5 mg)'],
    apresentacoes: ['No Brasil, em geral combinada com hidroclorotiazida: 25/2,5 mg e 50/5 mg (comprimido)'],
    dose: ['Combinação (adulto): hipertensão, 1 comprimido de 50/5 mg por dia (ou 2 de 25/2,5 mg), em dose única ou fracionada.', 'Edema cardíaco ou ascite da cirrose: início com 1 comprimido de 50/5 mg/dia.'],
    inicioDuracao: ['A bula consultada não informa.'],
    riscos: ['Hipercalemia: a bula contraindica o uso com potássio já elevado ou com outros fármacos/suplementos que o aumentem; cautela com IECA/BRA e outros poupadores.', 'Cefaleia, fraqueza, náuseas, exantema; fotossensibilidade.'],
    drc: ['A bula do paciente contraindica em doença renal; a bula não traz ajuste por função renal.'],
    fora: ['Isolada: efeito natriurético fraco; duração de ação > 24 h (revisão da ESH 2019). O início de ação não foi confirmado em fonte. Usada para hipocalemia induzida por diuréticos e síndrome de Liddle.'],
  },
  {
    id: 'triantereno', classe: 'poupador', generico: 'Triantereno', comerciais: [], associacoes: ['Iguassina® (hidroclorotiazida 50 mg + triantereno 50 mg)'],
    apresentacoes: ['No Brasil, apenas em associação com hidroclorotiazida 50/50 mg (comprimido)'],
    dose: ['Associação: 1 comprimido ao dia, de preferência pela manhã, ou a critério médico.'],
    inicioDuracao: ['A bula consultada não informa.'],
    riscos: ['Hipercalemia (monitorar potássio, sobretudo em uso prolongado do tiazídico); contraindicado no 1º trimestre de gestação.'],
    drc: ['Contraindicado na insuficiência renal grave ou terminal; usado em retenção hídrica com insuficiência renal leve a moderada, sem ajuste na bula.'],
    fora: ['Na literatura o triantereno tem duração de ação < 24 h (revisão da ESH 2019); o início de ação não foi confirmado em fonte.'],
  },
  {
    id: 'espironolactona', classe: 'mineralocorticoide', generico: 'Espironolactona', comerciais: ['Aldactone®'], associacoes: ['Aldazida® (com hidroclorotiazida)'],
    apresentacoes: ['Comprimido 25 mg, 50 mg e 100 mg'],
    dose: ['Hipertensão essencial: 50–100 mg/dia, aumentando a cada 2 semanas até 200 mg/dia.', 'Insuficiência cardíaca: habitual 100 mg/dia; casos resistentes 25–200 mg/dia.', 'Cirrose: 100 mg/dia (relação Na/K urinária > 1) ou 200–400 mg/dia (< 1).',
      'Síndrome nefrótica: 100–200 mg/dia, só se outra terapia for ineficaz.', 'Hipopotassemia/hipomagnesemia por diuréticos: 25–100 mg/dia. Hiperaldosteronismo primário: 100–400 mg/dia.'],
    inicioDuracao: ['A bula consultada não informa; recomenda manter por no mínimo 2 semanas para avaliar a hipertensão.'],
    riscos: ['Hipercalemia: reação muito comum (> 10%); pode ser fatal, sobretudo com IECA e outros poupadores de potássio.', 'Ginecomastia e dor mamária em homens (comum).', 'Contraindicada em insuficiência renal aguda, redução significativa da função renal, anúria, hipercalemia, doença de Addison e uso com eplerenona.'],
    drc: ['Sem tabela de ajuste na bula; contraindicada em IRA/redução significativa da função renal; insuficiência renal aguda é reação comum. Monitorar potássio e creatinina.'],
    fora: ['Na literatura algum efeito aparece em 3–4 h e o efeito máximo leva até 2 dias; os metabólitos ativos têm meia-vida de 10–12 h (Deranged Physiology). A duração de ação anti-hipertensiva é de 24–34 h (ESH 2019).'],
  },
  {
    id: 'eplerenona', classe: 'mineralocorticoide', generico: 'Eplerenona', comerciais: ['Inspra®'],
    apresentacoes: ['Comprimido 25 mg e 50 mg'],
    dose: ['Hipertensão: 50 mg 1×/dia; se necessário 50 mg 2×/dia (máximo 100 mg/dia).', 'IC pós-infarto: iniciar 25 mg/dia e ir a 50 mg/dia em até 4 semanas, guiado pelo potássio (máx. 50 mg/dia).',
      'IC classe II com TFG ≥ 50: 25 mg/dia → 50 mg/dia. Com ClCr 30–60: 25 mg em dias alternados → 25 mg/dia se K < 5,0 mmol/L.', 'Ajuste pelo potássio: < 5,0 aumentar; 5,0–5,4 manter; 5,5–5,9 reduzir; ≥ 6,0 suspender.'],
    inicioDuracao: ['Pressão arterial cai em ~2 semanas, com efeito máximo em ~4 semanas; Tmax 1,5–2 h; meia-vida de 3–6 h; estado de equilíbrio em ~2 dias.'],
    riscos: ['Hipercalemia (evento mais frequente nos estudos), maior com IECA/BRA e função renal reduzida; evitar suplementos de potássio e substitutos do sal.', 'Contraindicada com potássio > 5,0 mmol/L, poupadores de potássio e inibidores potentes do CYP3A4; máximo 25 mg/dia com inibidores moderados.'],
    drc: ['Na IC, contraindicada com ClCr < 30 mL/min; na hipertensão, contraindicada com ClCr < 50 mL/min, creatinina > 2,0 mg/dL (homens) ou > 1,8 (mulheres) e diabetes tipo 2 com microalbuminúria.', 'Não é removida por hemodiálise.'],
  },
  {
    id: 'finerenona', classe: 'mineralocorticoide', generico: 'Finerenona', comerciais: ['Firialta®'],
    apresentacoes: ['Comprimido revestido 10 mg e 20 mg'],
    dose: ['Iniciar só se potássio ≤ 4,8 mmol/L (4,8–5,0: pode iniciar com monitorização mais próxima; > 5,0: não recomendado).', 'TFG ≥ 60: iniciar 20 mg/dia. TFG 25 a < 60: iniciar 10 mg/dia. TFG < 25: não iniciar.', 'Meta e dose máxima: 20 mg 1×/dia.',
      'Em 4 semanas: K ≤ 4,8 → manter/aumentar a 20 mg (se a TFG não caiu > 30%); 4,8–5,5 → manter; > 5,5 → suspender e retomar 10 mg quando K ≤ 5,0.'],
    inicioDuracao: ['Efeito nas primeiras horas após a dose; meia-vida plasmática ~2–3 h; equilíbrio plasmático em 2 dias. O efeito sobre a albuminúria é gradual (semanas a meses).'],
    riscos: ['Hipercalemia (muito comum, > 10%): risco maior com suplementos de potássio, substitutos do sal e trimetoprima.', 'Contraindicada com inibidores potentes do CYP3A4 (itraconazol, cetoconazol, ritonavir, claritromicina etc.) e na doença de Addison; evitar verapamil, amiodarona, fluvoxamina.'],
    drc: ['Não iniciar com TFG < 25; suspender ao chegar a doença renal terminal (TFG < 15) pela pouca experiência.', 'Queda inicial e reversível da TFG é esperada (~2 mL/min). Exposição ~34–36% maior na insuficiência renal moderada a grave. Não é dialisável (~90% ligada a proteínas).'],
  },
  {
    id: 'acetazolamida', classe: 'anidrase', generico: 'Acetazolamida', comerciais: ['Diamox®'],
    apresentacoes: ['Comprimido 250 mg'],
    dose: ['ICC: 250–375 mg 1×/dia pela manhã (melhor em dias alternados); edema por fármacos: 250–375 mg/dia por 1–2 dias, alternando com 1 dia de descanso.', 'Glaucoma de ângulo aberto: 250 mg–1 g/dia; doença aguda das montanhas: 500 mg–1 g/dia, em doses divididas.', 'Epilepsia: 8–30 mg/kg/dia (faixa de 375 mg–1 g/dia).'],
    inicioDuracao: ['A bula consultada não informa.'],
    riscos: ['Acidose metabólica, hipocalemia e hiponatremia; fraqueza muscular na paralisia periódica hipocalêmica.', 'Cristalúria e litíase renal em uso prolongado (maior com bicarbonato de sódio).', 'Contraindicada em alergia a sulfonamidas, Na/K séricos baixos, insuficiência renal ou hepática grave, acidose hiperclorêmica, cirrose, TFG < 10 mL/min.'],
    drc: ['Insuficiência renal moderada a grave com TFG > 10: reduzir a dose pela metade ou espaçar para 12 h. Em idosos com disfunção renal a acidose pode ser grave. Contraindicada com TFG < 10 mL/min.'],
  },
  {
    id: 'manitol', classe: 'osmotico', generico: 'Manitol', comerciais: ['Manitol 20% (Fresenius Kabi, Cristália, Farmace)'],
    apresentacoes: ['Solução IV a 20% (200 mg/mL; ~1.098 mOsm/L), frasco de 250 mL'],
    dose: ['Dose-teste: ~200 mg/kg (~75 mL) em 3–5 min; meta de diurese ≥ 30–50 mL/h nas 2–3 h seguintes.', 'Redução de pressão intracraniana/intraocular: 1,5–2 g/kg (7,5–10 mL/kg) em 30–60 min; manutenção intracraniana ~0,25 g/kg a cada 6–8 h no máximo.'],
    inicioDuracao: ['Pressão intracraniana/intraocular cai em ~15 min e o efeito dura 3–8 h após o fim da infusão; diurese 1–3 h após a infusão; meia-vida ~100 min (até 36 h na IRA).'],
    riscos: ['Sobrecarga de volume (insuficiência cardíaca, edema pulmonar), hipernatremia/desidratação; o deslocamento de água pode reduzir o sódio sérico e piorar hiponatremia.', 'Náuseas, vômitos, cefaleia, sede, taquicardia; extravasamento causa necrose; tromboflebite.', 'Contraindicado em anúria total, descompensação cardíaca grave, hemorragia intracraniana ativa, desidratação grave e edema pulmonar.'],
    drc: ['Meia-vida pode chegar a 36 h na insuficiência renal; pode causar insuficiência renal oligúrica; removido por hemodiálise. A bula não traz ajuste de dose.'],
  },
];
