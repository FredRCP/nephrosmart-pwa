// Portado de HipocalcemiaScreen.tsx. Infusão contínua e doses não confirmadas foram retiradas (ver PESQUISAR_EQUIPE.md bloco H).
import type { ConteudoPagina } from './tipos';
import { comOrdem } from './ordem';
import { alerta, etiquetas, linhas, lista, nota, secao, t } from './montagem';

const dados: ConteudoPagina = {
  slug: 'hipocalcemia-calcio',
  titulo: 'Hipocalcemia',
  subtitulo: 'Ca total corrigido < 8,5 mg/dL ou Ca iônico < 1,1 mmol/L',
  itens: [
    secao('ecg', 'QT prolongado, T planas/invertidas', [
      linhas('Alterações mais evidentes com Ca iônico < 1,0 mmol/L; aumentam o risco de arritmias (torsades de pointes).', alerta('Monitorização cardíaca contínua durante a reposição IV.')),
    ]),
    secao('sintomas', 'Parestesias, tetania, convulsões', [
      { tipo: 'grupos', grupos: [
        { titulo: 'NEUROMUSCULARES', cor: '#2196F3', itens: [t('Parestesias periorais e de extremidades'), t('Tetania: Chvostek e Trousseau positivos'), t('Câimbras, fadiga muscular')] },
        { titulo: 'CARDÍACOS', cor: 'warning', itens: [t('QT longo, arritmias (torsades, FV)'), t('Hipotensão, insuficiência cardíaca')] },
        { titulo: 'GRAVES', cor: '#f44336', itens: [t('Convulsões'), t('Laringoespasmo'), t('Confusão, delírio')] },
      ] },
    ]),
    secao('tratamento', 'IV se grave, oral na manutenção', [
      lista(
        'Sintomática ou Ca iônico < 1,0 mmol/L (emergência)',
        'Gluconato de cálcio 10%: 10–20 mL IV diluídos em 100 mL de SG5% ou SF, em 10–20 min, com ECG; repetir se persistirem os sintomas',
        'Cloreto de cálcio só por acesso central (irritante; risco de necrose por extravasamento)',
        'Não misturar cálcio com bicarbonato ou fosfato (precipita)',
        'Corrigir magnésio baixo (a hipocalcemia não corrige sem isso)',
      ),
      nota('atencao', 'Infusão contínua de cálcio: esquema e velocidade aguardam validação (equipe de pesquisa). Use as doses do protocolo da sua instituição.'),
      lista('Manutenção oral', 'Carbonato de cálcio (melhor com refeição); citrato de cálcio se uso de IBP ou má absorção', 'Vitamina D: colecalciferol; calcitriol (ativo) em DRC avançada ou hipoparatireoidismo'),
      lista('Em diálise', 'Considerar dialisato com mais cálcio', 'Reposição IV após a sessão, se necessário', 'Oral: quelante de fósforo com a refeição; cálcio entre as refeições'),
      nota('alerta', 'Antes de repor cálcio em hiperfosfatemia importante, avalie o risco de calcificação. Com digoxina, repor com cautela.'),
    ]),
    secao('causas', 'Hipoparatireoidismo, vit. D, DRC…', [
      etiquetas('Hipoparatireoidismo (pós-cirúrgico, autoimune)', 'Deficiência/resistência à vitamina D', 'DRC (retenção de fósforo)', 'Hipomagnesemia', 'Pancreatite aguda', 'Hiperfosfatemia aguda, rabdomiólise, lise tumoral', 'Síndrome da fome óssea', 'Citrato (transfusão maciça, anticoagulação regional)', 'Fármacos: bisfosfonatos, denosumabe, foscarnet, cinacalcete'),
    ]),
    secao('monitoramento', 'ECG contínuo, Ca iônico', [
      lista(undefined, 'ECG contínuo durante reposição IV', 'Ca iônico de 4 em 4 a 6 em 6 h em casos graves (referência 1,10–1,30 mmol/L)', 'Ca total corrigido apenas se não houver ionizado (referência 8,5–10,2 mg/dL)', 'Reavaliar magnésio, fósforo, albumina e PTH', 'Evitar hipercalcemia de rebote'),
      nota('atencao', 'Ca total + 0,8 × (4 − albumina g/dL). Em DRC e em doença grave a correção é pouco confiável: prefira o cálcio iônico.'),
    ]),
    {
      tipo: 'secao', id: 'conversao', titulo: 'CÁLCIO ELEMENTAR POR SAL', icone: { fa: 'flask', cor: '#9c27b0' }, cor: '#9c27b0',
      resumo: 'Quanto cálcio há em cada apresentação', dica: 'Toque para expandir',
      blocos: [lista(undefined, 'Gluconato de cálcio 10%: 10 mL ≈ 93 mg de cálcio elementar', 'Cloreto de cálcio 10%: 10 mL ≈ 272 mg (via central)', 'Carbonato de cálcio 1250 mg ≈ 500 mg elementar (40%)', 'Citrato de cálcio 950 mg ≈ 200 mg elementar', 'Acetato de cálcio 667 mg ≈ 169 mg elementar (quelante de fósforo)')],
    },
  ],
  guiaRapido: {
    titulo: "⚠️ HIPOCALCEMIA - GUIA RÁPIDO",
    secoes: [
      { titulo: "🫀 ECG & RISCO", linhas: ["QT longo, torsades", "Monitorização contínua na reposição IV"] },
      { titulo: "💉 TRATAMENTO", linhas: ["Gluconato de Ca 10%: 10–20 mL em 10–20 min", "Corrigir Mg", "Vitamina D e Ca oral na manutenção"] },
      { titulo: "⏱️ MONITORAMENTO", cor: 'warning', linhas: ["Ca iônico 4–6 h", "Mg, P, albumina e PTH"] },
    ],
  },
  referencias: 'KDIGO CKD-MBD 2017 (atualização 2024) | StatPearls – Hypocalcemia | Endotext – Disorders of Calcium Metabolism | Conteúdo educacional: não substitui avaliação médica.',
};
export default comOrdem(dados, ['ecg', 'sintomas', 'causas', 'tratamento', 'monitoramento', 'conversao']);
