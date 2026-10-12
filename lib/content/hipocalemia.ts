// Portado de HypokalemiaScreen.tsx. Corrigido: o app misturava diluições/velocidades incompatíveis (ver DIVERGENCIAS_ONDA3.md).
import type { ConteudoPagina } from './tipos';
import { comOrdem } from './ordem';
import { alerta, etiquetas, linhas, lista, nota, secao, t } from './montagem';

const dados: ConteudoPagina = {
  slug: 'hipocalemia-potassio',
  titulo: 'Hipocalemia',
  subtitulo: 'K+ < 3,5 mEq/L - ECG recomendado',
  itens: [
    secao('ecg', 'Onda U, T achatada, ST↓', [
      linhas(
        'A hipocalemia retarda a repolarização. Mais evidente com K+ < 3,0 mEq/L e com risco de arritmia.',
        '1. Onda U proeminente (precoce, V2–V3)', '2. Onda T achatada ou invertida', '3. Depressão do segmento ST', '4. QT aparentemente longo (na verdade QU)', '5. PR longo e P ampla (casos moderados)',
        '6. Arritmias: TV, torsades, FV; bradicardia/bloqueio em casos graves',
        alerta('Monitorização contínua nos casos moderados e graves e durante reposição IV.'),
      ),
    ]),
    secao('sintomas', 'Fraqueza, arritmias, câimbras', [
      { tipo: 'grupos', grupos: [
        { titulo: '🫀 CARDÍACOS (mais graves)', cor: 'warning', itens: [t('Arritmias (TV, FV, bradicardia)'), t('Palpitações, síncope'), t('Hipotensão')] },
        { titulo: '💪 NEUROMUSCULARES', cor: '#2196F3', itens: [t('Fraqueza muscular generalizada'), t('Parestesias'), t('Câimbras, tetania'), t('Paralisia flácida (grave) e rabdomiólise')] },
        { titulo: '🧠 OUTROS', cor: '#9c27b0', itens: [t('Fadiga, confusão'), t('Constipação, íleo paralítico'), t('Poliúria, noctúria (diabetes insípido nefrogênico)')] },
      ] },
      nota('perigo', 'Sintomas graves ou K+ < 2,5 mEq/L: emergência.'),
    ]),
    secao('causas', 'Diuréticos, perdas GI, alcalose', [
      etiquetas('Diuréticos', 'Vômitos/diarreia', 'Alcalose metabólica', 'Abuso de laxantes', 'Hipomagnesemia', 'Insulina/β-agonistas (desvio para dentro da célula)', 'Tubulopatias (Gitelman, Bartter)', 'Hiperaldosteronismo', 'Corticosteroides', 'Paralisia periódica hipocalêmica'),
      nota('alerta', 'Hipomagnesemia? Corrija o Mg: sem isso a reposição de K+ é pouco eficaz.'),
    ]),
    secao('tratamento', 'Oral se possível; IV se grave', [
      lista('Leve (3,0–3,5 mEq/L) e assintomática', 'Via oral preferencial (KCl), fracionada em várias doses, com alimentos', 'Corrigir a causa e o magnésio'),
      lista('Moderada a grave (< 3,0 mEq/L) ou com sintomas/ECG alterado', 'Reposição IV diluída, com monitorização cardíaca contínua', 'KCl 19,1% = 2,5 mEq/mL (ampola de 10 mL = 25 mEq). Nunca em bolus/direto', 'Veia periférica: em geral até 40 mEq/L e até 10 mEq/h. Acima disso: acesso central e monitorização', 'Casos graves em acesso central: velocidades maiores (ex.: até 20 mEq/h) só com monitorização contínua, conforme protocolo do serviço', 'Reavaliar o K+ a cada 1–2 h nos graves e 2–4 h nos moderados'),
      nota('alerta', 'Em DRC, diálise, acidose ou uso de poupadores de K+/IECA/BRA, a reposição deve ser mais cautelosa (risco de hipercalemia). Reponha em doses menores e reavalie com frequência.'),
      nota('atencao', 'Doses orais por dia, velocidade máxima em central, dose máxima diária e apresentações brasileiras (KCl 6%, comprimidos) aguardam validação (equipe de pesquisa).'),
    ]),
    secao('monitoramento', 'K+ seriado + ECG', [
      lista(undefined, 'K+ a cada 1–2 h (grave), 2–4 h (moderada), 6–8 h (leve, em reposição)', 'ECG seriado durante a correção', 'Sinais vitais e diurese', 'Correção rápida demais pode causar hipercalemia de rebote', 'Balancear a reposição com perdas contínuas (diuréticos, diarreia)'),
    ]),
  ],
  guiaRapido: {
    titulo: '⚠️ HIPOCALEMIA - GUIA RÁPIDO',
    secoes: [
      { titulo: '🫀 ECG & RISCO', linhas: ['Onda U, T achatada, ST↓', 'Arritmias (TV/FV) com K+ < 2,5 mEq/L'] },
      { titulo: '💉 VIA IV', linhas: ['KCl 19,1% = 2,5 mEq/mL', 'Periférico: até 40 mEq/L e 10 mEq/h', 'Acima disso: acesso central e monitorização', 'Nunca em bolus'] },
      { titulo: '⏱️ MONITORAMENTO', cor: 'warning', linhas: ['K+ 1–2 h (grave), 2–4 h (moderada)', 'Corrigir Mg', 'Cuidado em DRC'] },
    ],
  },
  referencias: 'UpToDate – Treatment and prevention of hypokalemia | KDIGO 2024 (potássio) | Conteúdo educacional: não substitui avaliação médica.',
};
export default comOrdem(dados, ['ecg', 'sintomas', 'causas', 'tratamento', 'monitoramento']);
