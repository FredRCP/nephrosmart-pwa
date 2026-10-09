// Reescrito na Onda 1 a partir de HiponatremiaScreen.tsx (app original), com os limites de correção unificados
// (ver DIVERGENCIAS_ONDA1.md). Conteúdo educacional: não substitui avaliação médica.
import type { ConteudoPagina } from './tipos';

const hiponatremia: ConteudoPagina = {
  slug: 'hiponatremia-sodio',
  titulo: 'Hiponatremia',
  subtitulo: 'Na⁺ < 135 mEq/L — classifique pela osmolalidade, volemia e tempo de instalação',
  itens: [
    {
      tipo: 'secao', id: 'gravidade', titulo: 'Sintomas e gravidade', icone: { fa: 'user-injured', cor: '#ff9800' }, cor: '#ff9800',
      resumo: 'Do leve (náusea) ao grave (convulsão, coma)', dica: 'Toque para expandir',
      blocos: [
        { tipo: 'linhas', linhas: [{ texto: 'A gravidade depende do nível de Na⁺ e da VELOCIDADE de queda: quedas agudas (< 48 h) são mais perigosas que crônicas no mesmo nível. Os sintomas graves dependem mais da rapidez do que do valor absoluto.' }] },
        { tipo: 'grupos', grupos: [
          { titulo: 'LEVE (Na 130–135)', cor: '#4caf50', itens: [{ texto: 'Cefaleia discreta, náusea, fadiga, irritabilidade.' }, { texto: '"Assintomático" é relativo: déficit de marcha, quedas e prejuízo cognitivo sutil já são descritos com Na 130–135.', estilo: 'atencao' }] },
          { titulo: 'MODERADA (Na 125–129)', cor: '#ff9800', itens: [{ texto: 'Confusão, desorientação, tremores, ataxia, náuseas/vômitos.' }] },
          { titulo: 'GRAVE (sintomas graves, em geral Na < 125)', cor: '#d32f2f', itens: [{ texto: 'Convulsões, rebaixamento do nível de consciência/coma, edema cerebral com herniação, insuficiência respiratória central.', estilo: 'perigo' }] },
          { titulo: 'Grupos de maior risco de edema cerebral', cor: '#7b1fa2', itens: [{ texto: 'Mulheres em idade fértil, pós-operatório, atletas de endurance, polidipsia primária, crianças.' }, { texto: 'Hipocalemia concomitante aumenta o risco de ODS durante a correção.', estilo: 'atencao' }] },
        ] },
        { tipo: 'lista', titulo: 'Potássio e hiponatremia', itens: [
          'Repor K⁺ também eleva o Na⁺ sérico (o K⁺ é osmoticamente ativo): conte esse efeito na meta de correção.',
          'Monitorar K⁺ junto com o Na⁺ durante a correção (a cada 4–6 h).',
        ] },
      ],
    },
    {
      tipo: 'secao', id: 'tratamento', titulo: 'Tratamento', icone: { fa: 'pills', cor: '#4caf50' }, cor: '#4caf50',
      resumo: 'Limites de correção e conduta por cenário', dica: 'Toque para expandir',
      blocos: [
        { tipo: 'linhas', linhas: [{ texto: 'Três eixos: velocidade de instalação (aguda < 48 h × crônica/desconhecida), presença de sintomas graves e causa de base.' }] },
        { tipo: 'lista', titulo: '🚨 Sintomas graves (convulsão, coma) — qualquer duração', itens: [
          'NaCl 3% 100–150 mL IV em 10–20 min; repetir até 2 vezes se os sintomas persistirem (checar Na⁺ após cada bolus).',
          'Preparo: SF 0,9% 89 mL + NaCl 20% 11 mL = 100 mL de NaCl 3% (513 mEq/L).',
          'Meta inicial: ↑ 4–6 mEq/L (suficiente para reverter herniação/convulsão). Em 70 kg, 100 mL elevam o Na⁺ em cerca de 1 mEq/L; a calculadora estima o seu caso.',
          'Monitorar Na⁺ a cada 2–4 h durante o tratamento ativo.',
          'Se ↑ acima do limite do dia: rebaixar com desmopressina 2–4 µg IV/SC + SG 5% (3 mL/kg/h) e checar Na⁺ a cada 1–2 h.',
        ] },
        { tipo: 'lista', titulo: '⏱️ Crônica (> 48 h) ou desconhecida', itens: [
          'Meta: ↑ 6–8 mEq/L nas primeiras 24 h.',
          'Limite: 8 mEq/L em 24 h se ALTO RISCO de ODS (Na ≤ 105, hipocalemia, alcoolismo, desnutrição, hepatopatia); 10 mEq/L nos demais. Nos dias seguintes, não passar de 8 mEq/L por dia.',
          'Restrição hídrica 500–1000 mL/dia em SIADH (ajustar pelo Na⁺ seriado).',
          'Sal oral (NaCl 1 g = 17 mEq) + furosemida 20–40 mg, ou ureia oral 15–30 g/dia (disponibilidade limitada no Brasil).',
        ] },
        { tipo: 'lista', titulo: '🧠 Prevenção de ODS e "clamp" de desmopressina', itens: [
          'Risco de autocorreção: diurese > 100 mL/h com osmolalidade urinária < 100 mOsm/kg.',
          'Estratégia proativa: desmopressina 2–4 µg IV/SC a cada 6–8 h para bloquear a diurese hídrica, com NaCl 3% em doses controladas.',
          'A ODS pode ocorrer mesmo com correção dentro dos limites em pacientes de alto risco: nenhum limite garante ausência de risco.',
        ] },
        { tipo: 'lista', titulo: '💊 Fármacos', itens: [
          'Tolvaptana 7,5–15 mg/dia: SIADH crônica refratária, euvolêmico. Nunca em hiponatremia aguda/sintomática nem em hipovolemia. Risco de correção rápida e hepatotoxicidade. Diretriz europeia de 2014 não recomenda; custo elevado e acesso limitado no Brasil.',
          'Furosemida 20–40 mg + reposição de sal e K⁺: hipervolemia ou SIADH refratária.',
          'Desmopressina: relowering e clamp (acima).',
        ] },
        { tipo: 'lista', titulo: '📋 Por volemia', itens: [
          'Hipovolêmica: NaCl 0,9% (bolus se instável; infusão controlada nos demais), tratar a causa (suspender diurético). Atenção: ao restaurar a volemia o ADH cai e há risco de autocorreção; Na⁺ a cada 4–6 h.',
          'Euvolêmica (SIADH): restrição hídrica + sal oral ± furosemida; 2ª linha ureia; tratar a causa.',
          'Hipervolêmica (IC, cirrose, nefrótica): restrição hídrica e de sódio + diurético de alça; tratar a causa.',
        ] },
        { tipo: 'lista', titulo: '🧮 Fórmula de Adrogué–Madias', itens: [
          'ΔNa por litro infundido = (Na da solução − Na sérico) / (ACT + 1).',
          'ACT (água corporal total): criança 0,6; adulto homem 0,6 e mulher 0,5; idoso homem 0,5 e mulher 0,45.',
          'Na das soluções: NaCl 0,9% 154 | NaCl 3% 513 | Ringer lactato 130 mEq/L.',
          'Ignora perdas ativas e o K⁺: use como estimativa e confirme com Na⁺ seriado. Use a aba "Corrigir hipo" para o cálculo automático.',
        ] },
        { tipo: 'nota', estilo: 'atencao', texto: 'Correção acima do limite do dia → risco de ODS (mielinólise osmótica). Monitorize o Na⁺ a cada 4–6 h (2–4 h se NaCl 3%).' },
      ],
    },
    {
      tipo: 'secao', id: 'causas', titulo: 'Diagnóstico e causas', icone: { fa: 'search', cor: '#2196F3' }, cor: '#2196F3',
      resumo: 'Osmolalidade, volemia e SIADH', dica: 'Toque para expandir',
      blocos: [
        { tipo: 'lista', titulo: '🔬 Critérios de SIADH (todos presentes)', itens: [
          'Hiponatremia hipotônica: Na < 135 + osmolalidade sérica < 275 mOsm/kg.',
          'Osmolalidade urinária inapropriadamente alta: > 100 mOsm/kg (tipicamente > 500).',
          'Na urinário > 20–30 mEq/L com ingestão habitual de sal.',
          'Euvolemia clínica (sem edema, sem hipotensão ortostática, sem sinais de depleção).',
          'Excluir hipotireoidismo, insuficiência adrenal, diuréticos e hipovolemia.',
          'Apoio: ácido úrico sérico < 4 mg/dL e FE-ureia < 35% (esta é útil com diurético).',
        ] },
        { tipo: 'lista', titulo: 'Isotônica (pseudohiponatremia) — osmolalidade medida normal', itens: ['Hipertrigliceridemia grave', 'Hiperproteinemia / paraproteínas (mieloma)'] },
        { tipo: 'lista', titulo: 'Hipertônica (translocacional) — osmolalidade alta', itens: [
          'Hiperglicemia: Na⁺ cai ~1,6 mEq/L a cada 100 mg/dL acima de 100 (2,4 se glicose > 400).', 'Manitol', 'Glicerol',
          'Etanol aumenta o gap osmolar, mas NÃO causa hiponatremia (é osmol inefetivo).',
        ] },
        { tipo: 'lista', titulo: 'Hipotônica hipervolêmica (Na urinário < 20)', itens: ['Insuficiência cardíaca', 'Cirrose', 'Síndrome nefrótica', 'DRC / LRA avançada'] },
        { tipo: 'lista', titulo: 'Hipotônica euvolêmica (Na urinário > 20)', itens: [
          'SIADH (causa mais comum)', 'Hipotireoidismo', 'Insuficiência adrenal', 'Gestação', 'Polidipsia primária (osmolalidade urinária < 100)',
          'Pós-operatório (dor, estresse, opioides)', 'MDMA / ecstasy', 'ISRS, carbamazepina, oxcarbazepina, AINEs, tramadol',
        ] },
        { tipo: 'lista', titulo: 'Hipotônica hipovolêmica', itens: [
          'Renal (Na urinário > 20): diuréticos tiazídicos (mais comum), nefropatia perdedora de sal, ATR, Addison, DRC',
          'Extrarrenal (Na urinário < 10): diarreia/vômitos, hemorragia, sudorese, queimadura, sequestro para 3º espaço',
        ] },
      ],
    },
    {
      tipo: 'secao', id: 'ecg', titulo: 'ECG', icone: { fa: 'heartbeat', cor: '#f44336' }, cor: '#2196F3',
      resumo: 'Achados inespecíficos', dica: 'Toque para expandir',
      blocos: [
        { tipo: 'linhas', linhas: [
          { texto: 'O ECG não define a conduta na hiponatremia. Descrevem-se alterações inespecíficas de ST-T, bradicardia e prolongamento do QT em casos graves, com relação fraca com o nível de Na⁺.' },
          { texto: 'Faça ECG se Na < 120, sintomas neurológicos graves, arritmia, uso de fármacos que prolongam o QT ou hipocalemia associada.', estilo: 'atencao' },
        ] },
      ],
    },
    {
      tipo: 'secao', id: 'monitor', titulo: 'Monitoramento e exames', icone: { fa: 'vial', cor: '#2196F3' }, cor: '#2196F3',
      resumo: 'Exames e frequência', dica: 'Toque para expandir',
      blocos: [
        { tipo: 'lista', titulo: 'Exames', itens: [
          'Osmolalidade sérica e urinária; Na urinário (e FENa); FE-ureia', 'Na, K, Cl, HCO₃, creatinina, ureia, glicemia', 'Ácido úrico', 'TSH e T4 livre; cortisol',
          'Triglicerídeos e proteínas totais (pseudohiponatremia)', 'Gasometria',
        ] },
        { tipo: 'lista', titulo: 'Frequência', itens: [
          'Na⁺ a cada 2–4 h durante NaCl 3%; a cada 4–6 h após estabilizar', 'K⁺ a cada 4–6 h',
          'Diurese horária se houver risco de autocorreção', 'Peso diário e balanço hídrico', 'Glasgow a cada 4 h se Na < 125',
          'RNM de crânio se surgirem sintomas novos 2–6 dias após a correção (ODS)',
        ] },
      ],
    },
  ],
  guiaRapido: {
    titulo: 'Guia rápido',
    secoes: [
      { titulo: 'Velocidade de correção em 24 h', cor: '#4caf50', destaque: true, linhas: [
        'Meta: 6–8 mEq/L',
        'Máximo: 8 se alto risco de ODS ou criança; 10 nos demais',
        'Graves: +4–6 mEq/L nas primeiras horas com NaCl 3%',
      ] },
      { titulo: 'ODS', cor: '#7b1fa2', linhas: [
        'Desmielinização pontina/extrapontina 2–6 dias após correção rápida',
        'Fatores: Na ≤ 105, hipocalemia, alcoolismo, desnutrição, hepatopatia',
        'Dentro do limite o risco diminui, mas não zera em alto risco',
      ] },
    ],
  },
  referencias:
    'Spasovski G et al. Diretriz ESE/ESICM/ERA-EDTA sobre hiponatremia. Eur J Endocrinol 2014. • Sterns RH. Treatment of hyponatremia (CJASN, 2024). • Adrogué HJ, Madias NE. N Engl J Med 2000;342:1581 e 1493. • Revisões recentes de ODS e velocidade de correção.',
};
export default hiponatremia;
