// Portado de HiperfosfatemiaScreen.tsx. Metas numéricas inexistentes no KDIGO, doses de quelantes e valores dietéticos foram retirados (ver DIVERGENCIAS_ONDA3.md).
import type { ConteudoPagina } from './tipos';
import { comOrdem } from './ordem';
import { alerta, etiquetas, linhas, lista, nota, secao } from './montagem';

const dados: ConteudoPagina = {
  slug: 'hiperfosfatemia-fosforo',
  titulo: 'Hiperfosfatemia',
  subtitulo: 'Fósforo sérico acima da faixa de referência do laboratório',
  itens: [
    secao('ecg', 'Arritmias, calcificações', [
      linhas('A hiperfosfatemia crônica favorece calcificação vascular e valvar. Na forma aguda, a queda do cálcio (precipitação) prolonga o QT.', alerta('Na hiperfosfatemia aguda grave, dosar cálcio e monitorizar o ECG.')),
    ]),
    secao('sintomas', 'Prurido, calcificações, dor óssea', [
      lista('Quadro crônico', 'Prurido', 'Calcificação vascular e de tecidos moles', 'Calcifilaxia (necrose cutânea)', 'Dor óssea e fraturas (DMO-DRC)', 'Hipocalcemia e hiperparatireoidismo secundário'),
    ]),
    secao('tratamento', 'Dieta, quelantes, diálise', [
      lista(
        'Princípios (DRC)',
        'Reduzir o fósforo sérico em direção à faixa normal (KDIGO CKD-MBD); não há alvo único validado',
        'Orientar dieta com nutricionista: limitar fósforo inorgânico (aditivos de alimentos industrializados, refrigerantes tipo cola), que é absorvido quase por completo',
        'Quelantes junto das refeições; escolher conforme cálcio sérico, PTH e calcificações',
        'Restringir quelantes à base de cálcio em quem tem hipercalcemia, calcificação vascular ou PTH baixo',
        'Ajustar dialisato e a prescrição de diálise (tempo, frequência, HDF)',
      ),
      etiquetas('Sevelâmer: sem cálcio/alumínio, reduz LDL', 'Lantânio: mastigável, alta afinidade', 'Cálcio (carbonato/acetato): barato, risco de hipercalcemia'),
      lista('Aguda ou muito elevada', 'Suspender fontes exógenas de fósforo (enemas de fosfato, nutrição parenteral)', 'Se função renal preservada: hidratação IV', 'Se IRA/DRC ou sem resposta: hemodiálise'),
      nota('atencao', 'Doses de quelantes, valores de ingesta de fósforo e remoção por sessão de diálise aguardam validação (equipe de pesquisa). Use bula e protocolo local.'),
      nota('alerta', 'Calcifilaxia: tratamento é multidisciplinar (cuidado de feridas, controle mineral, tiossulfato de sódio em alguns serviços). O produto Ca × P não é critério diagnóstico nem meta do KDIGO.'),
    ]),
    secao('causas', 'DRC, lise tumoral, rabdomiólise…', [
      etiquetas('DRC (principal)', 'IRA', 'Lise tumoral', 'Rabdomiólise', 'Acidose láctica/cetoacidose', 'Hipoparatireoidismo', 'Excesso de fosfato (enemas, laxantes, vitamina D)', 'Pseudo-hiperfosfatemia (hemólise, hiperproteinemia)'),
    ]),
    secao('monitoramento', 'Fósforo, cálcio e PTH', [
      lista(undefined, 'DRC G3a–G3b: cálcio/fósforo a cada 6–12 meses; G4: a cada 3–6 meses; G5/G5D: a cada 1–3 meses (KDIGO 2017; ajustar quando houver alteração)', 'PTH e vitamina D 25-OH conforme estágio', 'Avaliar calcificação vascular quando isso mudar a conduta'),
    ]),
  ],
  guiaRapido: {
    titulo: "⚠️ HIPERFOSFATEMIA - GUIA RÁPIDO",
    secoes: [
      { titulo: "🫀 RISCO", linhas: ["Calcificação vascular, calcifilaxia", "Hipocalcemia na forma aguda"] },
      { titulo: "💉 TRATAMENTO", linhas: ["Dieta e quelantes com as refeições", "Ajustar a diálise", "Restringir quelantes com cálcio se hipercalcemia ou calcificação"] },
      { titulo: "⏱️ MONITORAMENTO", cor: 'warning', linhas: ["G5/G5D: Ca/P a cada 1–3 meses", "PTH e vitamina D"] },
    ],
  },
  referencias: 'KDIGO CKD-MBD 2017 (atualização 2024) | StatPearls – Hyperphosphatemia | Conteúdo educacional: não substitui avaliação médica.',
};
export default comOrdem(dados, ['ecg', 'sintomas', 'causas', 'tratamento', 'monitoramento', 'conversao']);
