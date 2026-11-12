// Nefrolitíase: ajuda a identificar a CAUSA do cálculo a partir de urina de 24 h, sangue, composição e densidade na TC.
// Função pura. Limiares: AUA 2014 (Medical Management of Kidney Stones) e EAU, ver PESQUISAR_EQUIPE.md para o que ainda precisa de conferência.
// É apoio ao raciocínio clínico: NÃO diagnostica nem prescreve.

export type Sexo = 'm' | 'f' | '';
export type Composicao = '' | 'oxalato' | 'fosfato' | 'urico' | 'estruvita' | 'cistina' | 'outro';

export interface EntradaLitiase {
  sexo: Sexo;
  composicao: Composicao;
  hu: string;
  // urina de 24 h
  volume: string; // L
  calcio: string; // mg
  oxalato: string; // mg
  citrato: string; // mg
  acidoUrico: string; // mg
  sodio: string; // mEq
  ph: string;
  // sangue
  calcioSerico: string; // mg/dL
  pth: string; // pg/mL
  acidoUricoSerico: string; // mg/dL
  bicarbonato: string; // mEq/L
  potassio: string; // mEq/L
  // contexto
  infeccaoUrease: boolean; // urocultura com germe produtor de urease ou ITU de repetição
  trato: boolean; // bariátrica, doença inflamatória intestinal, má absorção, ressecção intestinal
  nefrocalcinose: boolean; // nefrocalcinose ou rim esponjoso medular
  precoce: boolean; // início < 18 anos ou história familiar importante
  farmacos: string[]; // ids de FARMACOS_LITOGENICOS
}

export const FARMACOS_LITOGENICOS: { id: string; texto: string }[] = [
  { id: 'topiramato', texto: 'Topiramato / acetazolamida (hipocitratúria, urina alcalina)' },
  { id: 'indinavir', texto: 'Indinavir / atazanavir (cristais do fármaco)' },
  { id: 'triantereno', texto: 'Triantereno (cálculos do fármaco)' },
  { id: 'vitc', texto: 'Vitamina C ≥ 1 g/dia (oxalato)' },
  { id: 'calcio', texto: 'Suplemento de cálcio ou vitamina D em dose alta' },
  { id: 'alca', texto: 'Diurético de alça (calciúria)' },
  { id: 'sulfa', texto: 'Sulfadiazina / outros (cálculos do fármaco)' },
];

export type Status = 'alto' | 'baixo' | 'normal';
export interface Achado { id: string; rotulo: string; valor: string; status: Status; leitura: string }
export type Nivel = 'forte' | 'possivel';
export interface Hipotese { id: string; titulo: string; nivel: Nivel; motivos: string[]; proximos: string[] }
export interface ResultadoLitiase {
  achados: Achado[];
  hipoteses: Hipotese[];
  lacunas: string[];
  avisos: string[];
  tipoPorTc: string | null;
}

const num = (t: string): number | null => {
  const s = t.replace(',', '.').trim();
  if (s === '') return null;
  const v = Number(s);
  return Number.isFinite(v) ? v : null;
};
const f = (n: number) => String(Number(n.toPrecision(3))).replace('.', ',');

/** Faixa de HU pela TC sem contraste (sobreposição grande; só orienta quando a composição é desconhecida). */
export function tipoPorDensidade(hu: number): string {
  if (hu < 500) return 'Densidade baixa (< 500 HU): sugere ácido úrico; também xantina, 2,8-DHA ou cálculos de fármacos.';
  if (hu <= 1000) return 'Densidade intermediária (500–1000 HU): cistina, estruvita, apatita (fosfato de cálcio) ou cálculo misto.';
  return 'Densidade alta (> 1000 HU): cálcio (oxalato monoidratado ou fosfato/brushita).';
}

export function avaliarLitiase(e: EntradaLitiase): ResultadoLitiase {
  const achados: Achado[] = [];
  const hip = new Map<string, Hipotese>();
  const lacunas: string[] = [];
  const avisos: string[] = [];

  const add = (id: string, titulo: string, nivel: Nivel, motivo: string, proximos: string[]) => {
    const h = hip.get(id);
    if (!h) { hip.set(id, { id, titulo, nivel, motivos: [motivo], proximos }); return; }
    h.motivos.push(motivo);
    if (nivel === 'forte') h.nivel = 'forte';
  };

  const vol = num(e.volume), ca = num(e.calcio), ox = num(e.oxalato), cit = num(e.citrato), ua = num(e.acidoUrico), na = num(e.sodio), ph = num(e.ph);
  const caS = num(e.calcioSerico), pth = num(e.pth), uaS = num(e.acidoUricoSerico), bic = num(e.bicarbonato), k = num(e.potassio), hu = num(e.hu);

  const temUrina24 = [vol, ca, ox, cit, ua, na].some((v) => v !== null);
  const limCa = e.sexo === 'f' ? 250 : e.sexo === 'm' ? 300 : 250;
  const limUa = e.sexo === 'f' ? 750 : 800;

  // ── Urina de 24 h ──
  if (vol !== null) {
    const baixo = vol < 2.5;
    achados.push({ id: 'volume', rotulo: 'Volume urinário', valor: `${f(vol)} L/24 h`, status: baixo ? 'baixo' : 'normal', leitura: vol < 2 ? 'Baixo (< 2 L)' : baixo ? 'Abaixo do alvo de 2,5 L/dia' : 'No alvo (≥ 2,5 L)' });
    if (baixo) add('volume', 'Volume urinário baixo (ingestão hídrica insuficiente ou perdas)', 'possivel', `Volume de ${f(vol)} L/24 h (alvo ≥ 2,5 L).`, ['Meta de diurese ≥ 2,5 L/dia; perguntar clima, atividade, perdas extrarrenais (diarreia, suor).']);
  }
  if (ca !== null) {
    const alto = ca > limCa;
    achados.push({ id: 'calcio', rotulo: 'Cálcio urinário', valor: `${f(ca)} mg/24 h`, status: alto ? 'alto' : 'normal', leitura: alto ? `Hipercalciúria (> ${limCa} mg${e.sexo ? '' : '; sexo não informado, usei o limite feminino'})` : 'Normal' });
    if (alto) {
      const motivo = `Calciúria de ${f(ca)} mg/24 h.`;
      add('hipercalciuria', 'Hipercalciúria', 'possivel', motivo, ['Descartar causa secundária: hiperparatireoidismo primário, sarcoidose/excesso de vitamina D, acidose tubular renal distal, uso de diurético de alça, excesso de sal e de proteína animal.', 'Se nada for achado: hipercalciúria idiopática (a mais comum).']);
      if (na !== null && na > 200) add('hipercalciuria', 'Hipercalciúria', 'possivel', 'Sódio urinário alto: o excesso de sal aumenta a calciúria.', []);
    }
  }
  if (ox !== null) {
    const alto = ox > 40, marcada = ox >= 80;
    achados.push({ id: 'oxalato', rotulo: 'Oxalato urinário', valor: `${f(ox)} mg/24 h`, status: alto ? 'alto' : 'normal', leitura: marcada ? 'Muito elevado (≥ 80 mg)' : alto ? 'Hiperoxalúria (> 40 mg)' : 'Normal' });
    if (alto) {
      if (e.trato) add('oxal-enterica', 'Hiperoxalúria entérica', marcada ? 'forte' : 'possivel', `Oxalato de ${f(ox)} mg/24 h com má absorção, doença inflamatória intestinal ou cirurgia bariátrica.`, ['Dieta pobre em gordura e rica em cálcio nas refeições (liga o oxalato no intestino); citrato de potássio; considerar quelantes.', 'Avaliar também hipocitratúria e volume urinário, quase sempre associados.']);
      else if (marcada || e.precoce || e.nefrocalcinose) add('oxal-primaria', 'Hiperoxalúria primária (ou secundária marcada)', marcada && (e.precoce || e.nefrocalcinose) ? 'forte' : 'possivel', `Oxalato de ${f(ox)} mg/24 h${e.precoce ? ', início precoce/familiar' : ''}${e.nefrocalcinose ? ', nefrocalcinose' : ''}.`, ['Conferir ingestão de oxalato e vitamina C; se persistir muito alto, considerar teste genético (AGXT, GRHPR, HOGA1) e encaminhar a centro de referência.']);
      else add('oxal-dieta', 'Hiperoxalúria (dietética ou idiopática)', 'possivel', `Oxalato de ${f(ox)} mg/24 h.`, ['Revisar dieta (espinafre, beterraba, nozes, chocolate, chá preto) e vitamina C; manter cálcio da dieta normal.']);
    }
  }
  if (cit !== null) {
    const baixo = cit < 320;
    achados.push({ id: 'citrato', rotulo: 'Citrato urinário', valor: `${f(cit)} mg/24 h`, status: baixo ? 'baixo' : 'normal', leitura: baixo ? 'Hipocitratúria (< 320 mg)' : 'Normal' });
    if (baixo) add('hipocitraturia', 'Hipocitratúria', 'possivel', `Citrato de ${f(cit)} mg/24 h.`, ['Procurar acidose tubular renal distal (bicarbonato baixo, pH urinário alto), diarreia crônica, uso de topiramato/acetazolamida e dieta rica em proteína animal e pobre em frutas e vegetais.']);
  }
  if (ua !== null) {
    const alto = ua > limUa;
    achados.push({ id: 'urico-u', rotulo: 'Ácido úrico urinário', valor: `${f(ua)} mg/24 h`, status: alto ? 'alto' : 'normal', leitura: alto ? `Hiperuricosúria (> ${limUa} mg)` : 'Normal' });
    if (alto) add('hiperuricosuria', 'Hiperuricosúria', 'possivel', `Ácido úrico urinário de ${f(ua)} mg/24 h.`, ['Rever dieta rica em purinas (carnes, vísceras, frutos do mar, álcool); avaliar gota, síndrome metabólica e doenças com alto turnover celular.']);
  }
  if (na !== null) {
    const alto = na > 200;
    achados.push({ id: 'sodio', rotulo: 'Sódio urinário', valor: `${f(na)} mEq/24 h`, status: alto ? 'alto' : 'normal', leitura: alto ? 'Ingestão de sal excessiva (> 200 mEq ≈ 4,6 g de sódio)' : 'Aceitável' });
    if (alto) add('sal', 'Excesso de sal na dieta', 'possivel', `Sódio urinário de ${f(na)} mEq/24 h.`, ['Meta de sódio < 2,3 g/dia (≈ 100 mEq): reduz calciúria e a recorrência.']);
  }
  if (ph !== null) {
    const leitura = ph < 5.5 ? 'Ácido (< 5,5): favorece ácido úrico' : ph > 7 ? 'Muito alcalino (> 7,0): considerar infecção por urease' : ph > 6.5 ? 'Alcalino (> 6,5): favorece fosfato de cálcio' : 'Faixa intermediária';
    achados.push({ id: 'ph', rotulo: 'pH urinário', valor: f(ph), status: ph < 5.5 ? 'baixo' : ph > 6.5 ? 'alto' : 'normal', leitura });
    if (ph < 5.5) add('urico', 'Litíase por ácido úrico (urina ácida)', ua !== null && ua > limUa ? 'forte' : 'possivel', `pH urinário de ${f(ph)}.`, ['Causa mais frequente: urina persistentemente ácida (resistência à insulina, síndrome metabólica, diabetes tipo 2, obesidade); a hiperuricosúria é menos importante que o pH.', 'Alcalinizar a urina (alvo de pH 6,0–6,5) com citrato de potássio, mais hidratação e perda de peso.']);
  }

  // ── Sangue ──
  if (caS !== null) {
    const alto = caS > 10.5;
    achados.push({ id: 'ca-s', rotulo: 'Cálcio sérico', valor: `${f(caS)} mg/dL`, status: alto ? 'alto' : 'normal', leitura: alto ? 'Hipercalcemia' : 'Sem hipercalcemia' });
  }
  if (pth !== null) {
    achados.push({ id: 'pth', rotulo: 'PTH intacto', valor: `${f(pth)} pg/mL`, status: pth > 65 ? 'alto' : pth < 15 ? 'baixo' : 'normal', leitura: pth > 65 ? 'Elevado (referência do método: confira o seu laboratório)' : pth < 15 ? 'Suprimido' : 'Dentro da faixa de referência' });
  }
  if (caS !== null && caS > 10.5) {
    if (pth !== null && pth > 65) add('hpt', 'Hiperparatireoidismo primário', 'forte', `Hipercalcemia (${f(caS)} mg/dL) com PTH elevado (${f(pth)} pg/mL).`, ['Confirmar com cálcio iônico/repetição, 25-OH vitamina D e creatinina; avaliar densitometria e imagem das paratireoides; encaminhar à cirurgia (litíase é indicação).']);
    else if (pth !== null && pth >= 30) add('hpt', 'Hiperparatireoidismo primário (PTH inapropriadamente normal)', 'possivel', `Hipercalcemia (${f(caS)} mg/dL) com PTH não suprimido (${f(pth)} pg/mL): em hipercalcemia o PTH deveria estar baixo.`, ['Repetir cálcio e PTH; checar vitamina D e uso de lítio ou tiazídico.']);
    else if (pth !== null) add('hipercalcemia-pth-baixo', 'Hipercalcemia com PTH baixo (causa independente do PTH)', 'forte', `Cálcio de ${f(caS)} mg/dL com PTH de ${f(pth)} pg/mL.`, ['Investigar sarcoidose/granulomatose (1,25-vitamina D), intoxicação por vitamina D ou cálcio (síndrome leite-álcali), neoplasia (PTHrP) e imobilização.']);
    else add('hpt', 'Hipercalcemia: falta o PTH', 'possivel', `Cálcio sérico de ${f(caS)} mg/dL.`, ['Dosar PTH intacto: hiperparatireoidismo primário é a principal causa de hipercalcemia com cálculo.']);
  }
  if (uaS !== null) achados.push({ id: 'urico-s', rotulo: 'Ácido úrico sérico', valor: `${f(uaS)} mg/dL`, status: uaS > 7 ? 'alto' : 'normal', leitura: uaS > 7 ? 'Elevado' : 'Normal' });
  if (bic !== null) achados.push({ id: 'bic', rotulo: 'Bicarbonato sérico', valor: `${f(bic)} mEq/L`, status: bic < 22 ? 'baixo' : 'normal', leitura: bic < 22 ? 'Acidose metabólica' : 'Normal' });
  if (k !== null) achados.push({ id: 'k', rotulo: 'Potássio sérico', valor: `${f(k)} mEq/L`, status: k < 3.5 ? 'baixo' : k > 5.0 ? 'alto' : 'normal', leitura: k < 3.5 ? 'Hipocalemia' : k > 5.0 ? 'Hipercalemia' : 'Normal' });

  // Acidose tubular renal distal: acidose metabólica hiperclorêmica + pH urinário inadequadamente alto
  if (bic !== null && bic < 22 && ph !== null && ph > 5.5) {
    const sinais = [k !== null && k < 3.5 ? 'hipocalemia' : '', cit !== null && cit < 320 ? 'hipocitratúria' : '', ca !== null && ca > limCa ? 'hipercalciúria' : '', e.nefrocalcinose ? 'nefrocalcinose' : '', e.composicao === 'fosfato' ? 'cálculo de fosfato de cálcio' : ''].filter(Boolean);
    add('atr', 'Acidose tubular renal distal (tipo 1)', sinais.length >= 2 ? 'forte' : 'possivel',
      `Bicarbonato de ${f(bic)} mEq/L com pH urinário de ${f(ph)} (inadequadamente alto)${sinais.length ? ` e ${sinais.join(', ')}` : ''}.`,
      ['Confirmar: ânion gap urinário/hiperclorêmica, pH urinário em amostra fresca e, se necessário, teste de acidificação. Excluir infecção por urease como causa de pH alto.', 'O tratamento é alcalinização contínua (citrato de potássio), que reduz o cálculo e protege a função renal.']);
  } else if (bic === null && ph !== null && ph > 6.5) {
    lacunas.push('pH urinário alto sem bicarbonato sérico: dose o bicarbonato (e o potássio) para descartar acidose tubular renal distal.');
  }

  // ── Contexto ──
  if (e.infeccaoUrease || e.composicao === 'estruvita') {
    add('estruvita', 'Cálculo de estruvita (infecção por bactéria produtora de urease)', 'forte', e.composicao === 'estruvita' ? 'Composição: estruvita.' : 'Infecção urinária por germe produtor de urease (Proteus, Klebsiella, Providencia etc.).', ['Remoção completa do cálculo (urologia), antibiótico guiado por cultura e controle de fatores de ITU; qualquer fragmento residual mantém o foco.', 'A recorrência é alta se houver resíduo: seguir com imagem e urocultura.']);
  } else if (ph !== null && ph > 7) {
    lacunas.push('pH urinário > 7,0: colha urocultura (urease) antes de concluir; estruvita é a causa a excluir.');
  }
  if (e.composicao === 'cistina') add('cistinuria', 'Cistinúria', 'forte', 'Composição: cistina.', ['Quantificar a cistina urinária; teste genético (SLC3A1/SLC7A9) e estudo familiar.', 'Hidratação muito alta (urina > 3 L/dia), alcalinização (pH > 7,0–7,5) e, se preciso, tiol (tiopronina).']);
  else if (e.precoce && e.composicao === '') add('cistinuria', 'Cistinúria (considerar)', 'possivel', 'Início precoce ou história familiar, composição desconhecida.', ['Pedir cistina urinária (ou teste do nitroprussiato) e análise do cálculo.']);
  if (e.composicao === 'urico' && !hip.has('urico')) add('urico', 'Litíase por ácido úrico', 'forte', 'Composição: ácido úrico.', ['Medir o pH urinário em várias amostras; urina persistentemente ácida é o mecanismo principal.', 'Alcalinizar (alvo de pH 6,0–6,5), hidratar, perder peso; avaliar síndrome metabólica e diabetes.']);
  if (e.composicao === 'fosfato' && !hip.has('atr')) add('fosfato', 'Cálculo de fosfato de cálcio (apatita/brushita)', 'possivel', 'Composição: fosfato de cálcio.', ['Sempre excluir hiperparatireoidismo primário e acidose tubular renal distal; checar pH urinário alto e hipocitratúria.', 'Cuidado com citrato de potássio se o pH já for alto (pode piorar a precipitação do fosfato).']);
  if (e.composicao === 'outro') add('raro', 'Cálculo incomum (xantina, 2,8-DHA, fármaco, proteico)', 'possivel', 'Composição fora do grupo habitual.', ['Confirmar a análise por infravermelho/difração de raios X; considerar deficiência de APRT (2,8-DHA, confundida com ácido úrico) e xantinúria.']);
  if (e.farmacos.length) {
    const nomes = FARMACOS_LITOGENICOS.filter((x) => e.farmacos.includes(x.id)).map((x) => x.texto.split(' (')[0]);
    add('farmaco', 'Fármaco ou suplemento litogênico', 'possivel', `Em uso: ${nomes.join('; ')}.`, ['Avaliar suspensão ou troca quando possível e repetir a urina de 24 h depois.']);
  }
  if (e.nefrocalcinose && !hip.has('atr') && !hip.has('oxal-primaria')) add('nefrocalcinose', 'Nefrocalcinose / rim esponjoso medular', 'possivel', 'Nefrocalcinose ou rim esponjoso medular relatados.', ['Investigar hiperparatireoidismo, acidose tubular renal distal, hiperoxalúria e hipercalciúria; o rim esponjoso é um achado de imagem que se associa à hipercalciúria e à hipocitratúria.']);
  if (e.precoce) add('genetica', 'Doença hereditária ou monogênica', 'possivel', 'Início antes dos 18 anos ou história familiar importante.', ['Considerar cistinúria, hiperoxalúria primária, acidose tubular renal hereditária, doença de Dent, deficiência de APRT e hipercalciúria monogênica; estudo genético e família.']);
  if (e.composicao === 'oxalato' && !hip.size) add('oxal-idiopatico', 'Oxalato de cálcio sem causa identificada até aqui', 'possivel', 'Composição: oxalato de cálcio, sem alterações nos dados informados.', ['Falta urina de 24 h ou ela veio normal: repetir em dieta habitual; considerar baixa ingestão hídrica e dieta.']);

  // ── Lacunas e orientação ──
  if (!temUrina24) lacunas.unshift('Sem urina de 24 h: é o exame central. Colete duas amostras em dieta habitual, 4–6 semanas após o episódio agudo, e confira se a coleta foi completa (creatinina de 24 h compatível com a massa magra).');
  if (caS === null) lacunas.push('Sem cálcio sérico: necessário em todo paciente que vai ser investigado (hiperparatireoidismo primário).');
  if (caS !== null && caS > 10.5 && pth === null) { /* já tratado na hipótese */ } else if (pth === null && caS !== null && caS >= 10.2) lacunas.push('Cálcio no limite superior: dose o PTH.');
  if (e.composicao === '') lacunas.push('Sem composição do cálculo: peça análise por infravermelho ou difração de raios X (oriente a coar a urina).');

  let tipoPorTc: string | null = null;
  if (hu !== null && hu > 0 && hu < 3000 && e.composicao === '') tipoPorTc = tipoPorDensidade(hu);
  if (hu !== null && (hu <= 0 || hu >= 3000)) avisos.push('Densidade em HU fora da faixa plausível (confira o valor).');

  const ordem: Record<Nivel, number> = { forte: 0, possivel: 1 };
  const hipoteses = [...hip.values()].sort((a, b) => ordem[a.nivel] - ordem[b.nivel]);
  if (!hipoteses.length && temUrina24) avisos.push('Nenhuma alteração metabólica evidente nos dados informados. Cálculos podem ocorrer por baixa diurese; reavalie hidratação, repita a coleta e revise a composição.');
  avisos.push('Os limiares são de referência (AUA/EAU) e dependem da dieta e do método do laboratório. Isto é apoio ao raciocínio, não substitui o julgamento clínico.');
  return { achados, hipoteses, lacunas, avisos, tipoPorTc };
}
