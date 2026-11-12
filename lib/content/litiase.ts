// Conteúdo de consulta de nefrolitíase (migrado do app antigo e revisado). Faixas de HU, cristais e doses de referência:
// conferir itens marcados em PESQUISAR_EQUIPE.md. Não é prescrição.

export interface TipoCalculo {
  id: string;
  nome: string;
  cor: string;
  /** Frequência aproximada entre os cálculos. */
  frequencia: string;
  causas: string[];
  exames: string[];
  tratamento: string[];
  imagem: string[];
}

export const TIPOS_CALCULO: TipoCalculo[] = [
  {
    id: 'oxalato', nome: 'Oxalato de cálcio', cor: '#f59e0b', frequencia: 'O mais comum (cerca de 70–80%)',
    causas: ['Hipercalciúria (idiopática é a mais comum)', 'Hiperoxalúria: dietética, entérica (bariátrica, doença inflamatória intestinal, má absorção) ou primária', 'Hipocitratúria', 'Volume urinário baixo (< 2 L/dia)', 'Hiperuricosúria associada', 'Obesidade, diabetes tipo 2, excesso de sódio e de proteína animal'],
    exames: ['Urina de 24 h: cálcio, oxalato, citrato, ácido úrico, sódio, volume', 'Sangue: cálcio e PTH (hiperparatireoidismo primário)'],
    tratamento: ['Hidratação para diurese ≥ 2,5 L/dia', 'Sódio < 2,3 g/dia; proteína animal moderada', 'Cálcio da dieta normal (1.000–1.200 mg/dia), sem restringir', 'Reduzir alimentos ricos em oxalato e evitar vitamina C em dose alta', 'Tiazídico se hipercalciúria; citrato de potássio se hipocitratúria; alopurinol se hiperuricosúria'],
    imagem: ['Radiopaco; densidade alta (em geral > 1.000 HU, sobretudo o monoidratado)'],
  },
  {
    id: 'fosfato', nome: 'Fosfato de cálcio', cor: '#3b82f6', frequencia: 'Menos comum; frequente em mistos',
    causas: ['Urina persistentemente alcalina (pH > 6,5)', 'Hiperparatireoidismo primário', 'Acidose tubular renal distal (excluir sempre)', 'Infecção urinária crônica (carbonato-apatita)'],
    exames: ['Urina de 24 h: pH alto, cálcio alto, citrato baixo', 'Sangue: cálcio, PTH, bicarbonato e potássio'],
    tratamento: ['Tratar a causa (paratireoidectomia no hiperparatireoidismo primário; alcalinização na acidose tubular)', 'Tiazídico se hipercalciúria', 'Cuidado com alcalinizante quando o pH já é alto'],
    imagem: ['Muito radiopaco (brushita: densidade muito alta, > 1.500 HU; resiste à litotripsia)'],
  },
  {
    id: 'urico', nome: 'Ácido úrico', cor: '#eab308', frequencia: 'Cerca de 5–10%',
    causas: ['Urina persistentemente ácida (pH < 5,5): resistência à insulina, síndrome metabólica, diabetes tipo 2, obesidade', 'Hiperuricosúria (dieta rica em purinas, gota)', 'Desidratação, diarreia crônica/ileostomia', 'Doenças com alto turnover celular e quimioterapia'],
    exames: ['Urina de 24 h: pH baixo, ácido úrico', 'Sangue: ácido úrico, glicemia'],
    tratamento: ['Alcalinização com citrato de potássio (alvo de pH 6,0–6,5)', 'Hidratação; perda de peso; reduzir purinas e frutose', 'Alopurinol (ou febuxostate) se hiperuricosúria/gota associada'],
    imagem: ['Radiolúcido na radiografia; visível na TC com densidade baixa (< 500 HU). Pode se dissolver com alcalinização'],
  },
  {
    id: 'estruvita', nome: 'Estruvita (infecção)', cor: '#10b981', frequencia: 'Cerca de 5–10%; mais comum em mulheres',
    causas: ['ITU por bactéria produtora de urease (Proteus, Klebsiella, Providencia, Pseudomonas)', 'Urina alcalina (pH > 7,0)', 'Obstrução, bexiga neurogênica, cateter prolongado'],
    exames: ['Urocultura; pH urinário', 'Frequentemente coraliforme: TC/imagem para extensão'],
    tratamento: ['Remoção completa do cálculo (urologia): qualquer fragmento residual perpetua a infecção', 'Antibiótico guiado por cultura e tratamento dos fatores de ITU', 'Seguimento com imagem e urocultura'],
    imagem: ['Radiopaco, em geral coraliforme (densidade intermediária a alta)'],
  },
  {
    id: 'cistina', nome: 'Cistina', cor: '#8b5cf6', frequencia: 'Raro (1–2%); mais em jovens',
    causas: ['Cistinúria hereditária (autossômica recessiva; SLC3A1 e SLC7A9)', 'Cristalização favorecida por urina ácida'],
    exames: ['Cistina urinária (alvo < 250 mg/L); teste do nitroprussiato como triagem', 'Cristais hexagonais incolores na urina'],
    tratamento: ['Hidratação muito alta (urina > 3 L/dia)', 'Alcalinização (pH > 7,0–7,5) e dieta pobre em sódio e proteína', 'Tiol (tiopronina ou D-penicilamina) se necessário'],
    imagem: ['Fracamente radiopaco, aspecto de “vidro fosco”'],
  },
  {
    id: 'raros', nome: 'Cálculos menos comuns', cor: '#64748b', frequencia: 'Raros',
    causas: ['Xantina: deficiência de xantina oxidase ou excesso de alopurinol', '2,8-diidroxiadenina: deficiência de APRT (confundida com ácido úrico; pode causar DRC)', 'Fármacos: indinavir, atazanavir, triantereno, sulfadiazina, topiramato (este por alterar o citrato e o pH)', 'Mistos: muito frequentes; a conduta segue o componente predominante'],
    exames: ['Análise do cálculo por infravermelho ou difração de raios X (essencial)', 'Pensar nesses casos em cálculo radiolúcido sem ácido úrico, jovens/crianças e falha da conduta padrão'],
    tratamento: ['Suspender o fármaco quando possível', 'Hidratação e alcalinização conforme o caso', 'Alopurinol/febuxostate na deficiência de APRT'],
    imagem: ['Variável; em geral baixa densidade (indinavir, xantina, 2,8-DHA)'],
  },
];

export interface BlocoAgudo { titulo: string; itens: string[]; alerta?: boolean }

export const COLICA_AGUDA: BlocoAgudo[] = [
  { titulo: 'Sinais de alerta: urgência urológica', alerta: true, itens: [
    'Febre ou calafrios com obstrução: pielonefrite obstrutiva, emergência (descompressão com duplo J ou nefrostomia + antibiótico).',
    'Rim único, obstrução bilateral ou lesão renal aguda (creatinina elevada).',
    'Anúria/oligúria; dor refratária; vômitos incoercíveis.',
    'Também considerar: transplantado, imunossuprimido, DRC prévia.'] },
  { titulo: 'Quadro típico e diagnóstico diferencial', itens: [
    'Dor súbita em cólica no flanco, irradiando para fossa ilíaca, inguinal ou genitália; agitação; náuseas e vômitos; hematúria (85–90%).',
    'Diferenciais: pielonefrite, apendicite, diverticulite, aneurisma de aorta, torção testicular/anexial, gravidez ectópica.'] },
  { titulo: 'Exames na urgência', itens: [
    'Creatinina e ureia, hemograma, EAS (hematúria; piúria/bacteriúria), urocultura se houver suspeita de infecção; β-hCG em mulheres em idade fértil.',
    'TC de abdome e pelve SEM contraste é o padrão para confirmar, localizar e medir o cálculo (e a densidade).',
    'Ultrassom (± radiografia): gestantes, crianças e quando se quer evitar radiação.'] },
  { titulo: 'Analgesia', itens: [
    'AINE é a primeira escolha (melhor analgesia que opioide). Evitar se TFG baixa, lesão renal aguda, úlcera ativa ou alergia.',
    'Opioide se AINE contraindicado ou dor refratária; associar antiemético; dipirona como adjuvante.',
    'Hidratação venosa vigorosa não ajuda a expulsar o cálculo: manter apenas a euvolemia.'] },
  { titulo: 'Eliminação espontânea e terapia médica expulsiva', itens: [
    'Menos de 5 mm: alta chance de passar sozinho (em torno de 70–80%); 5–10 mm: cerca de 50%; mais de 10 mm: baixa, com indicação de urologia.',
    'Alfabloqueador (tansulosina 0,4 mg/dia) pode ser oferecido em cálculo ureteral distal ≤ 10 mm. O benefício foi menor nos ensaios mais recentes: decisão compartilhada.',
    'Coar a urina para recuperar o cálculo e enviar para análise.'] },
  { titulo: 'Quando intervir (urologia)', itens: [
    'Cálculo > 10 mm ou ureteral distal > 6 mm que não passa; dor intratável; infecção; piora da função renal.',
    'Opções: ureterolitotripsia endoscópica, litotripsia extracorpórea (LECO), nefrolitotripsia percutânea (grandes/coraliformes).'] },
  { titulo: 'Quando chamar o nefrologista', itens: [
    'Lesão renal aguda obstrutiva; litíase recorrente; cálculos bilaterais ou múltiplos; DRC (TFG < 60); suspeita de causa metabólica; encaminhamento para investigação após o episódio agudo.'] },
];

export const QUEM_INVESTIGAR: string[] = [
  'Cálculo recorrente (2 ou mais episódios) ou rim único.',
  'Crianças e adolescentes; início precoce ou história familiar importante.',
  'Composição de alto risco: ácido úrico, cistina, estruvita, brushita/fosfato de cálcio.',
  'Nefrocalcinose, cálculos bilaterais ou múltiplos, DRC, hipercalcemia.',
  'Cirurgia bariátrica, doença inflamatória intestinal ou má absorção; gota; osteoporose.',
  'No primeiro episódio, avaliar caso a caso (paciente interessado ou de maior risco).',
];

export const COMO_INVESTIGAR: string[] = [
  'Coar a urina e enviar o cálculo para análise (infravermelho ou difração de raios X).',
  'Sangue: creatinina/TFG, cálcio, PTH (se cálcio alto ou limítrofe), ácido úrico, bicarbonato e potássio.',
  'Urina de 24 h (2 coletas), em dieta habitual, 4–6 semanas depois do episódio agudo: volume, cálcio, oxalato, citrato, ácido úrico, sódio, pH e creatinina (para checar a coleta).',
  'EAS e urocultura; imagem (TC sem contraste) para número, tamanho e densidade dos cálculos.',
  'Repetir a urina de 24 h 2–3 meses após o tratamento; imagem de seguimento a cada 6–12 meses.',
];
