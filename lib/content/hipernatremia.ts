// Reescrito na Onda 1 a partir de HipernatremiaScreen.tsx (app original), com limites unificados (DIVERGENCIAS_ONDA1.md).
import type { ConteudoPagina } from './tipos';

const hipernatremia: ConteudoPagina = {
  slug: 'hipernatremia-sodio',
  titulo: 'Hipernatremia',
  subtitulo: 'Na⁺ > 145 mEq/L (grave: > 160) — déficit de água livre',
  itens: [
    {
      tipo: 'secao', id: 'sintomas', titulo: 'Sintomas', icone: { fa: 'user-injured', cor: '#ff9800' }, cor: '#ff9800',
      resumo: 'Sede, letargia, convulsões, coma', dica: 'Toque para expandir',
      blocos: [
        { tipo: 'linhas', linhas: [
          { texto: 'A desidratação neuronal causa os sintomas; dependem do nível e da velocidade de instalação.' },
          { texto: 'Leve: sede, irritabilidade, fraqueza. Moderada: confusão, letargia, agitação. Grave (> 160 ou instalação rápida): convulsões, coma, hemorragia intracraniana.' },
          { texto: 'Em idosos e doentes graves a sede pode estar ausente.', estilo: 'atencao' },
        ] },
      ],
    },
    {
      tipo: 'secao', id: 'tratamento', titulo: 'Tratamento', icone: { fa: 'pills', cor: '#4caf50' }, cor: '#4caf50',
      resumo: 'Correção lenta: até 0,5 mEq/L/h', dica: 'Toque para expandir',
      blocos: [
        { tipo: 'lista', titulo: 'Princípios', itens: [
          'Hipovolemia grave/instabilidade: primeiro cristaloide isotônico para restaurar a perfusão; depois corrigir o déficit de água.',
          'Preferir água livre por via oral/enteral; IV: SG 5% (0 mEq/L de Na) ou NaCl 0,45% (77 mEq/L).',
          'Crônica/desconhecida: não reduzir mais que 0,5 mEq/L/h nem 10–12 mEq/L em 24 h (crianças: 8).',
          'Aguda (< 48 h) ou sintomática: pode-se corrigir mais rápido (até ~1 mEq/L/h nas primeiras horas) com monitorização em UTI, sem passar do total diário.',
          'Somar as perdas contínuas (diurese hipotônica, febre, diarreia) ao volume calculado.',
          'Edema cerebral é o risco de corrigir rápido demais: se surgir cefaleia, vômitos, convulsão, reduzir o ritmo.',
        ] },
        { tipo: 'lista', titulo: 'Diabetes insípido', itens: [
          'Central: desmopressina 1–2 µg IV/SC (ou formulação nasal/oral conforme disponibilidade).',
          'Nefrogênico: tratar a causa (lítio, hipercalcemia, hipocalemia), restrição de sódio e de proteína, tiazídico ± amilorida.',
        ] },
        { tipo: 'lista', titulo: 'Fórmula (Adrogué–Madias)', itens: [
          'ΔNa por litro infundido = (Na da solução − Na sérico) / (ACT + 1). SG 5%: 1 L reduz ~1,7 mEq/L em ~70 kg.',
          'Use a aba "Corrigir hiper" para o volume e a velocidade.',
        ] },
        { tipo: 'nota', estilo: 'atencao', texto: 'Correção acima de 0,5 mEq/L/h na hipernatremia crônica → risco de edema cerebral. Na⁺ a cada 4–6 h (2–4 h no início).' },
      ],
    },
    {
      tipo: 'secao', id: 'causas', titulo: 'Causas', icone: { fa: 'search', cor: '#4caf50' }, cor: '#4caf50',
      resumo: 'Perda de água, ganho de sódio, DI', dica: 'Toque para expandir',
      blocos: [
        { tipo: 'lista', itens: [
          'Perda de água pura: diabetes insípido central/nefrogênico, febre, hiperventilação, perdas insensíveis',
          'Perda de água > sódio: diarreia osmótica, vômitos, diurese osmótica (glicose, manitol, ureia), diuréticos de alça',
          'Ganho de sódio: NaCl hipertônico/bicarbonato, ingestão de sal, afogamento em água salgada',
          'Redução do acesso à água: idosos, dependentes, rebaixamento da consciência',
        ] },
      ],
    },
    {
      tipo: 'secao', id: 'monitor', titulo: 'Monitoramento', icone: { fa: 'vial', cor: '#2196F3' }, cor: '#2196F3',
      resumo: 'Na a cada 4–6 h, osmolalidade', dica: 'Toque para expandir',
      blocos: [
        { tipo: 'lista', itens: [
          'Na⁺ sérico a cada 4–6 h (2–4 h nas primeiras horas) até estabilizar',
          'Osmolalidade sérica e urinária; volume urinário (diagnóstico de DI)',
          'Peso diário e balanço hídrico', 'Estado neurológico, função renal, glicemia, K⁺ e Ca²⁺',
        ] },
      ],
    },
  ],
  referencias: 'Adrogué HJ, Madias NE. N Engl J Med 2000;342:1493. • Sterns RH. Disorders of plasma sodium (revisões 2015–2024). • Diretrizes e revisões recentes de hipernatremia.',
};
export default hipernatremia;
