// Portado de Hipomagnesemia.tsx. Retiradas: infusão contínua e doses orais por sal (não validadas); L-treonato (indicação cognitiva, não é tratamento de hipomagnesemia).
import type { ConteudoPagina } from './tipos';
import { comOrdem } from './ordem';
import { alerta, etiquetas, linhas, lista, nota, secao, t } from './montagem';

const dados: ConteudoPagina = {
  slug: 'hipomagnesemia-magnesio',
  titulo: 'Hipomagnesemia',
  subtitulo: 'Mg < 1,7 mg/dL (grave < 1,2 mg/dL)',
  itens: [
    secao('ecg', 'QT prolongado, taquicardia', [
      linhas('Prolongamento do QT, alargamento do QRS, risco de torsades de pointes (potencializado por hipocalemia).', alerta('ECG contínuo se Mg < 1,2 mg/dL ou arritmias.')),
    ]),
    secao('sintomas', 'Tremores, tetania, arritmias', [
      { tipo: 'grupos', grupos: [
        { titulo: 'LEVES', cor: '#4caf50', itens: [t('Fraqueza, tremores, irritabilidade')] },
        { titulo: 'MODERADOS', cor: 'warning', itens: [t('Tetania, parestesias, náuseas'), t('Hiper-reflexia, confusão leve')] },
        { titulo: 'GRAVES', cor: '#f44336', itens: [t('Convulsões, delirium'), t('Arritmias graves (torsades)')] },
      ] },
    ]),
    secao('tratamento', 'Oral se leve; IV se grave', [
      lista('Grave ou sintomática (arritmia, convulsão)', 'Sulfato de magnésio 1–2 g IV em 100 mL de SG5% ou NaCl 0,9%, em 10–20 min (em torsades, em 5–20 min); mais lento se não houver emergência, para evitar hipotensão', 'Monitorar reflexos, ECG e pressão arterial', 'Em DRC/IRA: reduzir a dose e monitorar o Mg (risco de hipermagnesemia)'),
      lista('Leve ou assintomática', 'Reposição oral com sal bem tolerado, em doses fracionadas, com a refeição; diarreia limita a dose', 'Reavaliar o Mg em 24–48 h'),
      lista('Em diálise', 'O dialisato fornece magnésio; reposição IV após a sessão, se necessária'),
      nota('atencao', 'Doses orais por sal e esquema de manutenção IV aguardam validação (equipe de pesquisa). Fontes divergem: a dose IV inicial varia de 1–2 g a 5 g.'),
      nota('alerta', 'Corrigir também potássio e cálcio: a hipocalemia e a hipocalcemia persistem se o magnésio estiver baixo.'),
    ]),
    secao('causas', 'Diuréticos, IBP, álcool, diarreia…', [
      etiquetas('Diuréticos (alça, tiazídicos)', 'Inibidores de bomba de prótons', 'Álcool, desnutrição', 'Diarreia, má absorção', 'Nutrição parenteral', 'Cisplatina, anfotericina, aminoglicosídeos, ciclosporina/tacrolimo', 'Anti-EGFR (cetuximabe)', 'Diabetes mal controlado', 'Síndromes tubulares (Gitelman, Bartter)'),
    ]),
    secao('monitoramento', 'Mg sérico, ECG se grave', [
      lista(undefined, 'Mg sérico (referência aproximada 1,7–2,2 mg/dL) de 4 em 4 a 6 em 6 h nos casos graves', 'ECG contínuo se Mg < 1,2 mg/dL ou arritmias', 'Corrigir K+ e Ca2+ se baixos', 'Reflexos e pressão arterial durante a reposição IV'),
    ]),
  ],
  guiaRapido: {
    titulo: "⚠️ HIPOMAGNESEMIA - GUIA RÁPIDO",
    secoes: [
      { titulo: "🫀 ECG & RISCO", linhas: ["QT longo, torsades", "ECG se Mg < 1,2 mg/dL"] },
      { titulo: "💉 TRATAMENTO", linhas: ["Grave: sulfato de Mg 1–2 g IV em 10–20 min", "Leve: via oral", "Em DRC reduzir a dose"] },
      { titulo: "⏱️ MONITORAMENTO", cor: 'warning', linhas: ["Mg 4–6 h nos graves", "Corrigir K e Ca"] },
    ],
  },
  referencias: 'StatPearls – Magnesium Disorders | Endotext – Magnesium Disorders | Conteúdo educacional: não substitui avaliação médica.',
};
export default comOrdem(dados, ['ecg', 'sintomas', 'causas', 'tratamento', 'monitoramento', 'conversao']);
