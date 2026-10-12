// Portado de HipercalcemiaScreen.tsx. Revisado: doses ambíguas ou conflitantes do app original foram retiradas (ver DIVERGENCIAS_ONDA3.md / PESQUISAR_EQUIPE.md bloco H).
import type { ConteudoPagina } from './tipos';
import { comOrdem } from './ordem';
import { alerta, etiquetas, linhas, lista, nota, secao, t } from './montagem';

const dados: ConteudoPagina = {
  slug: 'hipercalcemia-calcio',
  titulo: 'Hipercalcemia',
  subtitulo: 'Ca total corrigido > 10,2 mg/dL ou Ca iônico > 1,3 mmol/L',
  itens: [
    secao('ecg', 'Encurtamento do QT, arritmias', [
      linhas('A hipercalcemia encurta o QT e pode causar bradiarritmias e bloqueios. Em casos graves, monitorização cardíaca contínua.', alerta('ECG contínuo se hipercalcemia grave (Ca > 14 mg/dL) ou arritmias.')),
    ]),
    secao('sintomas', 'Náusea, confusão, poliúria', [
      lista('Sintomas', 'Poliúria, polidipsia, desidratação', 'Náuseas, vômitos, constipação, dor abdominal', 'Fraqueza, confusão, sonolência, coma (grave)', 'Nefrolitíase, nefrocalcinose; doença renal aguda por vasoconstrição e depleção de volume'),
    ]),
    secao('tratamento', 'Hidratação, bisfosfonato, calcitonina…', [
      linhas(t('Grave ou sintomática (Ca > 14 mg/dL ou sintomas): tratar sem esperar a causa.')),
      lista(
        'Medidas gerais',
        'Hidratação IV com NaCl 0,9% (o paciente costuma estar desidratado); ajustar ao volume e à função renal',
        'Diurético de alça só depois de repor o volume, e se houver sobrecarga (não é rotina)',
        'Suspender cálcio, vitamina D, tiazídicos e antiácidos com cálcio',
        'Tratar a causa (hiperparatireoidismo, neoplasia, excesso de vitamina D…)',
      ),
      lista(
        'Reduzir a reabsorção óssea',
        'Calcitonina (início rápido; efeito dura 48–72 h por taquifilaxia)',
        'Bisfosfonato IV (zoledronato ou pamidronato): início em 2–4 dias, após hidratação',
        'Denosumabe: opção em hipercalcemia refratária ou quando há DRC avançada',
      ),
      nota('alerta', 'Em DRC: os bisfosfonatos exigem cautela/ajuste conforme a TFG e podem causar hipocalcemia. Doses e escolha entre os fármacos em DRC aguardam validação (equipe de pesquisa).'),
      lista('Grave, refratária ou DRC com sobrecarga de volume', 'Hemodiálise com dialisato de cálcio baixo ou zero, com monitorização do cálcio e do magnésio'),
    ]),
    secao('causas', 'Hiperparatireoidismo, neoplasia, vit. D…', [
      etiquetas('Hiperparatireoidismo primário', 'Neoplasias (PTHrP, metástases ósseas, mieloma)', 'Excesso de vitamina D ou cálcio', 'Doenças granulomatosas (sarcoidose, TB)', 'Tiazídicos, lítio', 'Imobilização', 'Hipertireoidismo', 'Hiperparatireoidismo terciário pós-transplante'),
      linhas('Dica: PTH alto ou "inapropriadamente normal" sugere causa paratireoidiana; PTH suprimido sugere causa não paratireoidiana (neoplasia, vitamina D, granulomas).'),
    ]),
    secao('monitoramento', 'Ca iônico, ECG se grave', [
      lista(
        undefined,
        'Cálcio iônico (referência 1,10–1,30 mmol/L) em casos graves, de 4 em 4 a 6 em 6 h',
        'Cálcio total (referência 8,5–10,2 mg/dL; varia conforme o laboratório); corrigir pela albumina só se não houver ionizado',
        'Eletrólitos (incluindo Mg e P), função renal e balanço hídrico diariamente',
        'PTH se a causa não for evidente',
      ),
      nota('atencao', 'Fórmula usual: Ca total + 0,8 × (4 − albumina g/dL). Em DRC e em doença grave, ela é pouco confiável: prefira o cálcio iônico.'),
    ]),
  ],
  guiaRapido: {
    titulo: "⚠️ HIPERCALCEMIA - GUIA RÁPIDO",
    secoes: [
      { titulo: "🫀 ECG & RISCO", linhas: ["QT curto, bradiarritmias", "Monitorizar se Ca > 14 mg/dL"] },
      { titulo: "💉 TRATAMENTO", linhas: ["Hidratação IV com NaCl 0,9% primeiro", "Calcitonina, depois bisfosfonato/denosumabe", "Diálise com dialisato de Ca baixo se refratária"] },
      { titulo: "⏱️ MONITORAMENTO", cor: 'warning', linhas: ["Ca iônico 4–6 h", "PTH para definir a causa"] },
    ],
  },
  referencias: 'KDIGO CKD-MBD 2017 (atualização 2024) | Endotext – Hypercalcemia | StatPearls – Hypercalcemia | Conteúdo educacional: não substitui avaliação médica.',
};
export default comOrdem(dados, ['ecg', 'sintomas', 'causas', 'tratamento', 'monitoramento', 'conversao']);
