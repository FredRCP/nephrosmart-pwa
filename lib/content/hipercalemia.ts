// Portado de HyperkalemiaScreen.tsx (app original). Texto clínico preservado; só a forma mudou.
import type { ConteudoPagina } from './tipos';

const hipercalemia: ConteudoPagina = {
  slug: 'hipercalemia-potassio',
  titulo: 'Hipercalemia',
  subtitulo: 'K+ > 5.5 mEq/L - ECG OBRIGATÓRIO! 🚨',
  itens: [
    {
      tipo: 'secao',
      id: 'ecg',
      titulo: 'ECG - Alterações Clássicas',
      icone: { fa: 'heartbeat', cor: '#f44336' },
      cor: '#2196F3',
      resumo: 'T apiculadas, QRS largo, onda...',
      dica: 'Toque para expandir',
      blocos: [
        {
          tipo: 'linhas',
          linhas: [
            { texto: 'A hipercalemia afeta a despolarização cardíaca, causando ondas T apiculadas e progressão para arritmias fatais.' },
            { texto: '1. Ondas T apiculadas (K+ 5.5-6.5): Altas, simétricas, mais evidentes em V2-V4.' },
            { texto: '2. Alargamento QRS (K+ 6.5-8.0): Pode simular BAV ou IAM.' },
            { texto: '3. PR prolongado e P achatada (K+ 7.0+).' },
            { texto: '4. QRS + T fundidos = "onda senoidal" (pré-parada).' },
            { texto: '5. Assistolia ou FV - PARADA CARDÍACA (K+ >8.0).' },
            { texto: '🚨 ECG a CADA 30-60min na correção!', estilo: 'atencao' },
          ],
        },
      ],
    },
    {
      tipo: 'secao',
      id: 'symptoms',
      titulo: 'SINTOMAS PRINCIPAIS',
      icone: { fa: 'user-injured', cor: '#f44336' },
      cor: '#f44336',
      resumo: 'Arritmias, fraqueza, náuseas',
      dica: 'Toque para expandir',
      blocos: [
        {
          tipo: 'grupos',
          grupos: [
            {
              titulo: '🫀 CARDÍACOS (EMERGÊNCIA)',
              cor: 'warning',
              itens: [
                { texto: 'Arritmias (BAV, TV, FV, assistolia)' },
                { texto: 'Bradicardia sinusal progressiva' },
                { texto: 'Parada cardíaca súbita' },
              ],
            },
            {
              titulo: '💪 NEUROMUSCULARES',
              cor: '#2196F3',
              itens: [
                { texto: 'Fraqueza muscular (começa nas pernas)' },
                { texto: 'Paresteias, formigamento' },
                { texto: 'Paralisia flácida (grave)' },
              ],
            },
            {
              titulo: '⚡ GI & OUTROS',
              cor: '#ff9800',
              itens: [
                { texto: 'Náuseas, vômitos' },
                { texto: 'Diarreia (se aguda)' },
                { texto: '🚨 K+ >6.5 OU ECG alterado = TRATAR IMEDIATAMENTE!', estilo: 'atencao' },
              ],
            },
          ],
        },
      ],
    },
    {
      tipo: 'secao',
      id: 'treatment',
      titulo: 'TRATAMENTO',
      icone: { fa: 'pills', cor: '#4caf50' },
      cor: '#4caf50',
      resumo: 'Cálcio, insulina+glicose, resina...',
      dica: 'Toque para expandir todas as medidas',
      blocos: [
        {
          tipo: 'lista',
          titulo: 'MEDIDAS GERAIS:',
          itens: [
            'Suspender drogas hipercalemiantes (IECAs, BRA, espironolactona, AINEs)',
            'Restringir K+ na dieta (<3g/dia)',
            'Avaliar e otimizar débito urinário',
            'Tratar causas reversíveis (ex: acidose, desidratação)',
          ],
        },
        {
          tipo: 'lista',
          titulo: 'ESTABILIZAÇÃO CARDÍACA (se ECG alterado):',
          itens: ['Gluconato de Cálcio 10% 10-20ml EV + SG5% 100ml em 10min (repetir se necessário)'],
        },
        {
          tipo: 'lista',
          titulo: 'REDISTRIBUIÇÃO DE K+:',
          itens: [
            'Solução Polarizante: Insulina Regular 10UI EV + Glicose 50% 100ml em 30min (repetir 8/8h)',
            'B2 Agonistas: Salbutamol 2-4 jatos INL ou Fenoterol 8-10 gotas NBZ 4/4h',
            'Bicarbonato se acidose: NaHCO3 8,4% 1ml/kg EV 8/8h em 30min OU PESO x 0,3 x Base Excess ÷ 3 doses',
          ],
        },
        {
          tipo: 'lista',
          titulo: 'REMOÇÃO DE K+:',
          itens: [
            'Diuréticos: Furosemida 20-40mg EV (ajustar por função renal) + hidratação se hipovolêmico',
            {
              texto: 'Resinas de Troca (preferir novas):',
              filhos: [
                'LOKELMA® (Zircônio): 10g VO 3x/dia até 48h (agudos); 5g/dia manutenção',
                'Patiromer: 8.4g VO/dia inicial, aumentar 8.4g/semana até máximo de 25.2g/dia',
                'Alternativa: Sorcal® (CPS) 15-90g VO/dia (menos eficaz, riscos GI)',
              ],
            },
          ],
        },
        { tipo: 'lista', titulo: 'REFRATÁRIO/GRAVE:', itens: ['Diálise de urgência se refratária a medidas'] },
        { tipo: 'nota', estilo: 'atencao', texto: '⚠️ Priorize resinas novas (SZC/Patiromer); evite poliestireno sulfonato devido a riscos' },
        { tipo: 'nota', estilo: 'perigo', texto: '🚨 Monitore glicemia/hipoglicemia com insulina; K+ rebote possível' },
        { tipo: 'nota', estilo: 'perigo', texto: '🚨 Cálcio apenas se ECG alterado; duração curta (30-60min)' },
        { tipo: 'nota', estilo: 'perigo', texto: '🚨 Bicarbonato só se acidose confirmada (pH <7.2)' },
      ],
    },
    {
      tipo: 'secao',
      id: 'causes',
      titulo: 'PRINCIPAIS CAUSAS',
      icone: { emoji: '🎯' },
      cor: '#4caf50',
      resumo: 'Lesão renal, medicamentos, lise...',
      dica: 'Toque para expandir',
      blocos: [
        {
          tipo: 'etiquetas',
          itens: [
            'Lesão Renal Aguda', 'DRC avançada', 'Rabdomiólise', 'Queimaduras',
            'Lise tumoral', 'Acidose metabólica', 'Hipóxia', 'Betabloqueadores',
            'IECAs/BRA', 'Hipercalemia familiar', 'Adrenalectomia',
          ],
        },
      ],
    },
    {
      tipo: 'aviso',
      icone: 'exclamation-triangle',
      texto: '⚠️ HEMÓLISE? Repetir K+ URGENTE! Falsos positivos comuns em amostras hemolisadas.',
    },
    {
      tipo: 'secao',
      id: 'monitoramento',
      titulo: 'MONITORAMENTO',
      icone: { emoji: '📈' },
      cor: '#2196F3',
      resumo: 'ECG a cada 30-60min + K+ 1-2h',
      dica: 'Toque para expandir',
      blocos: [
        {
          tipo: 'lista',
          itens: [
            'ECG a cada 30-60min durante tratamento',
            'K+ seriado a cada 1-2h (grave)',
            'Monitoria cardíaca CONTÍNUA',
            'Sinais vitais, diurese, balanço hídrico',
            '⚠️ CÁLCIO ESTABILIZA MEMBRANA por 30-60min apenas!',
            'Reavaliar ECG após CADA intervenção',
          ],
        },
      ],
    },
  ],
  guiaRapido: {
    titulo: '⚠️ HIPERCALEMIA - GUIA RÁPIDO',
    secoes: [
      {
        titulo: '🫀 ECG & RISCO',
        linhas: ['T apiculadas >6.0, QRS largo >6.5', 'Monitorização cardíaca OBRIGATÓRIA', 'Arritmias: TV/FV em >8.0'],
      },
      {
        titulo: '💉 TRATAMENTO',
        linhas: [
          'Cálcio se ECG alterado: 10-20ml EV em 10min',
          'Insulina + Glicose: 10UI + 100ml 50% em 30min',
          'B2 agonistas',
          'Diuréticos de alça',
          'Binders: Lokelma 10g 3x/dia; sorcal',
          'Reposição de bicarbonato quando associada com acidose metabólica',
          'Diálise se refratariedade às medidas clínicas',
        ],
      },
      { titulo: '⏱️ MONITORAMENTO', cor: 'warning', linhas: ['ECG 30-60min + K+ 1-2h', 'Glicemia pós-insulina'] },
    ],
  },
  referencias: 'KDIGO 2024 | UpToDate 2024 | ESC/ACC HF Guidelines',
};

export default hipercalemia;
