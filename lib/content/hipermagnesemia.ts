// Portado de HipermagnesemiaScreen.tsx. Mantidas as medidas consensuais; sem doses não confirmadas.
import type { ConteudoPagina } from './tipos';
import { comOrdem } from './ordem';
import { alerta, etiquetas, linhas, lista, nota, secao, t } from './montagem';

const dados: ConteudoPagina = {
  slug: 'hipermagnesemia-magnesio',
  titulo: 'Hipermagnesemia',
  subtitulo: 'Mg > 2,2 mg/dL (a referência varia entre laboratórios)',
  itens: [
    secao('ecg', 'Bradicardia, bloqueios', [
      linhas('Aumento de PR e QRS, bradicardia, bloqueio AV; em níveis muito altos, assistolia.', alerta('ECG contínuo se Mg > 4 mg/dL ou sintomas.')),
    ]),
    secao('sintomas', 'Fraqueza, hipotensão, bradicardia', [
      { tipo: 'grupos', grupos: [
        { titulo: 'LEVES', cor: '#4caf50', itens: [t('Náuseas, rubor, fraqueza leve')] },
        { titulo: 'MODERADOS', cor: 'warning', itens: [t('Hipotensão, letargia'), t('Perda dos reflexos tendinosos profundos'), t('Bradicardia')] },
        { titulo: 'GRAVES', cor: '#f44336', itens: [t('Depressão respiratória, paralisia muscular, coma'), t('Bloqueio AV, parada cardíaca (níveis muito elevados)')] },
      ] },
      nota('atencao', 'A perda do reflexo patelar é um sinal precoce útil à beira do leito.'),
    ]),
    secao('tratamento', 'Suspender Mg, cálcio IV, diálise', [
      lista('Leve ou assintomática', 'Suspender todas as fontes de magnésio (suplementos, laxantes, antiácidos, nutrição parenteral)', 'Hidratação e promover excreção renal, se a função renal permitir'),
      lista('Moderada/grave ou sintomática', 'Gluconato de cálcio 10%: 10 mL IV em 5–10 min (antagoniza o efeito cardíaco e neuromuscular); repetir se necessário', 'NaCl 0,9% associado a diurético de alça, se houver função renal e sem sobrecarga de volume', 'Suporte ventilatório se depressão respiratória'),
      lista('Insuficiência renal ou refratária', 'Hemodiálise (dialisato sem ou com baixo magnésio); é o tratamento definitivo'),
      nota('atencao', 'Cálcio IV é medida temporária (alguns minutos a poucas horas); reavaliar o Mg e repetir conforme resposta.'),
    ]),
    secao('causas', 'DRC, excesso de Mg', [
      etiquetas('DRC/IRA (principal)', 'Laxantes e antiácidos com magnésio', 'Sulfato de Mg (eclâmpsia)', 'Enemas de magnésio', 'Rabdomiólise, lise tumoral', 'Insuficiência adrenal, hipotireoidismo, lítio'),
    ]),
    secao('monitoramento', 'Mg sérico, ECG se grave', [
      lista(undefined, 'Mg sérico (referência aproximada 1,7–2,2 mg/dL; varia 1,7–2,5 conforme o laboratório) de 2 em 2 a 4 em 4 h nos casos graves', 'ECG contínuo se Mg > 4 mg/dL ou sintomas', 'Reflexos, pressão arterial, função renal e balanço hídrico'),
    ]),
  ],
  guiaRapido: {
    titulo: "⚠️ HIPERMAGNESEMIA - GUIA RÁPIDO",
    secoes: [
      { titulo: "🫀 ECG & RISCO", linhas: ["Bradicardia, bloqueio AV", "Perda dos reflexos precede a parada respiratória"] },
      { titulo: "💉 TRATAMENTO", linhas: ["Suspender fontes de Mg", "Gluconato de Ca 10%: 10 mL em 5–10 min", "Hemodiálise na insuficiência renal"] },
      { titulo: "⏱️ MONITORAMENTO", cor: 'warning', linhas: ["Mg 2–4 h nos graves", "Reflexos e PA"] },
    ],
  },
  referencias: 'StatPearls – Magnesium Disorders | Endotext – Magnesium Disorders | Conteúdo educacional: não substitui avaliação médica.',
};
export default comOrdem(dados, ['ecg', 'sintomas', 'causas', 'tratamento', 'monitoramento', 'conversao']);
