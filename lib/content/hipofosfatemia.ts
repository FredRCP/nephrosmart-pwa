// Portado de HipofosfatemiaScreen.tsx. Dose IV numérica retirada (valores internamente inconsistentes no app e nas fontes) — ver PESQUISAR_EQUIPE.md bloco H.
import type { ConteudoPagina } from './tipos';
import { comOrdem } from './ordem';
import { alerta, etiquetas, linhas, lista, nota, secao } from './montagem';

const dados: ConteudoPagina = {
  slug: 'hipofosfatemia-fosforo',
  titulo: 'Hipofosfatemia',
  subtitulo: 'Fósforo < 2,5 mg/dL (grave < 1,0 mg/dL)',
  itens: [
    secao('ecg', 'QT prolongado, arritmias', [
      linhas('A hipofosfatemia grave compromete a contratilidade e a repolarização cardíaca.', alerta('ECG contínuo durante a reposição IV e se P < 1,5 mg/dL ou sintomas.')),
    ]),
    secao('sintomas', 'Fraqueza, confusão, convulsões', [
      lista('Quadro', 'Fraqueza muscular proximal, mialgia, rabdomiólise', 'Insuficiência respiratória (dificuldade de desmame da ventilação)', 'Confusão, irritabilidade, convulsões, coma', 'Arritmias; disfunção miocárdica', 'Hemólise e disfunção plaquetária (grave)'),
    ]),
    secao('tratamento', 'Oral se leve; IV se grave', [
      lista('Leve a moderada e assintomática', 'Reposição oral (fosfato de sódio ou potássio); pode causar diarreia', 'Dieta rica em fósforo (leite e derivados, carnes, ovos, grãos), quando houver causa nutricional'),
      lista('Grave (< 1,0–1,5 mg/dL) ou sintomática', 'Fosfato IV diluído, infusão lenta, com controle do fósforo, cálcio, potássio e magnésio de 6 em 6 a 12 em 12 h', 'Evitar fosfato de potássio se K+ > 4,5 mEq/L ou DRC com risco de hipercalemia', 'Reduzir/suspender quando P normalizar: risco de hiperfosfatemia, hipocalcemia e hipotensão', 'Cuidado redobrado em IRA/DRC: ajustar dose'),
      nota('atencao', 'Dose IV (mmol/kg ou mmol/dia), concentração, velocidade, diluição e conversão mmol↔mEq↔mg aguardam validação (as fontes consultadas divergem). Use a prescrição do protocolo institucional.'),
      nota('alerta', 'Realimentação (síndrome de realimentação): corrigir P, K e Mg, repor tiamina antes do suporte calórico, iniciar a nutrição devagar. Esquema detalhado aguarda validação.'),
    ]),
    secao('causas', 'Realimentação, alcoolismo, síndrome de Fanconi…', [
      etiquetas('Síndrome de realimentação', 'Alcoolismo/desnutrição', 'Cetoacidose diabética (tratamento com insulina)', 'Alcalose respiratória', 'Hiperparatireoidismo', 'Perdas renais (Fanconi, tenofovir, pós-transplante renal)', 'Diálise prolongada ou contínua sem reposição', 'Quelantes de fósforo/antiácidos com alumínio ou magnésio', 'Deficiência de vitamina D'),
    ]),
    secao('monitoramento', 'P a cada 6–12 h', [
      lista(undefined, 'Fósforo (referência 2,5–4,5 mg/dL) a cada 6–12 h durante a reposição IV', 'Cálcio, magnésio e potássio no mesmo intervalo', 'ECG contínuo se P < 1,5 mg/dL ou sintomas', 'Função renal e balanço hídrico', 'Conversão: 1 mmol/L de P = 3,1 mg/dL'),
    ]),
  ],
  guiaRapido: {
    titulo: "⚠️ HIPOFOSFATEMIA - GUIA RÁPIDO",
    secoes: [
      { titulo: "🫀 ECG & RISCO", linhas: ["Arritmias, rabdomiólise, falência respiratória", "ECG se P < 1,5 mg/dL"] },
      { titulo: "💉 TRATAMENTO", linhas: ["Leve: via oral", "Grave: fosfato IV diluído e lento (protocolo local)", "Repor tiamina na realimentação"] },
      { titulo: "⏱️ MONITORAMENTO", cor: 'warning', linhas: ["P, Ca, Mg e K a cada 6–12 h"] },
    ],
  },
  referencias: 'StatPearls – Hypophosphatemia | Endotext – Disorders of Phosphate Metabolism | Conteúdo educacional: não substitui avaliação médica.',
};
export default comOrdem(dados, ['ecg', 'sintomas', 'causas', 'tratamento', 'monitoramento', 'conversao']);
