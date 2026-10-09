// Textos de conduta e avisos da tela pediátrica. REVISAR com o Dr. Fred / protocolo local antes de divulgar:
// são recomendações de prática (não saem de uma equação) — ver REVISAO_CLINICA_PEDIATRIA.md.
export const CONDUTA_LRA: Record<0 | 1 | 2 | 3, string> = {
  0: 'sem critério de LRA — use a TFG estimada da aba "DRC / estável".',
  1: 'não use a TFG estimada como valor real. Para fármacos de eliminação renal ou de janela estreita, use a faixa de TFG imediatamente abaixo do teto e monitorize níveis séricos. Reavalie a cada 24 h.',
  2: 'dose como TFG < 30 mL/min/1.73m² para fármacos de eliminação renal; monitorize níveis séricos e reavalie a cada 12–24 h.',
  3: 'dose como TFG < 15 mL/min/1.73m² (< 10 se oligúria/anúria) para fármacos de eliminação renal; monitorize níveis séricos, reavalie a cada 12–24 h e considere terapia renal substitutiva.',
};

export const AVISOS = {
  estavel: 'Válido apenas com creatinina ESTÁVEL. Se a creatinina está subindo ou a criança tem LRA, use a aba "LRA".',
  lactente: 'Menores de 1 ano: nenhuma equação é bem validada (nos primeiros dias a creatinina reflete a materna). Estimativa de baixa confiabilidade.',
  menor2anos: 'Abaixo de 2 anos a TFG normal é fisiologicamente menor que a do adulto: não classifique como DRC apenas por esta categoria.',
  massaMuscular: 'Em baixa massa muscular (doença neuromuscular, desnutrição, amputação) a creatinina superestima a TFG: prefira incluir a cistatina C.',
  basalEstimada: 'Creatinina basal ESTIMADA (supondo TFG de 120 mL/min/1.73m²): o estágio é provisório. Informe a creatinina basal real quando existir.',
  caindo: 'A creatinina está abaixo da basal: sem critério de LRA.',
} as const;
