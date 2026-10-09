// Reescrito na Onda 2 a partir de InjuriaRenalAgudaScreen.tsx (app original). Revisão: DIVERGENCIAS_ONDA2.md.
import type { ConteudoPagina } from './tipos';

const ira: ConteudoPagina = {
  slug: 'injuria-renal-aguda-ira',
  titulo: 'Injúria Renal Aguda',
  subtitulo: 'Aumento súbito da creatinina e/ou redução da diurese',
  itens: [
    {
      tipo: 'secao', id: 'definicao', titulo: 'Definição (KDIGO 2012)', icone: { fa: 'info-circle', cor: '#2196F3' }, cor: '#2196F3',
      resumo: 'Critérios de creatinina e diurese', dica: 'Toque para expandir',
      blocos: [
        { tipo: 'linhas', linhas: [
          { texto: 'A IRA é definida por QUALQUER um dos critérios abaixo:' },
        ] },
        { tipo: 'lista', itens: [
          'Aumento da creatinina sérica ≥ 0,3 mg/dL em até 48 horas',
          'Aumento da creatinina sérica ≥ 1,5 vez o valor basal, sabido ou presumido, nos últimos 7 dias',
          'Diurese < 0,5 mL/kg/h por ≥ 6 horas',
        ] },
        { tipo: 'nota', estilo: 'atencao', texto: 'O valor basal é a creatinina estável mais recente (ou a menor dos últimos 7 dias). Quando o aumento levou mais de 7 dias, pense em doença renal aguda/subaguda ou DRC agudizada.' },
      ],
    },
    {
      tipo: 'secao', id: 'tipos', titulo: 'Tipos de IRA', icone: { fa: 'microscope', cor: '#795548' }, cor: '#795548',
      resumo: 'Pré-renal · Renal · Pós-renal', dica: 'Toque para expandir',
      blocos: [
        { tipo: 'lista', titulo: 'Pré-renal (hipoperfusão)', itens: [
          'Hipovolemia: perdas gastrointestinais, hemorragia, sudorese excessiva, queimaduras',
          'Síndrome cardiorrenal: insuficiência cardíaca, choque cardiogênico',
          'Redistribuição vascular: sepse, choque distributivo, cirrose (síndrome hepatorrenal)',
          'Fármacos: AINEs, IECA/BRA em estenose de artéria renal ou depleção de volume',
          'Achados típicos: sedimento urinário bland, FENa < 1% ou FEUr < 35%, melhora com reposição volêmica',
        ] },
        { tipo: 'lista', titulo: 'Renal (intrínseca)', itens: [
          'Glomerular: glomerulonefrites agudas (pós-infecciosa, lúpus, anti-MBG)',
          'Vascular: vasculites ANCA, trombose de veia renal, microangiopatias trombóticas',
          'Tubular: necrose tubular aguda (isquemia, nefrotóxicos, contraste, rabdomiólise)',
          'Intersticial: nefrite intersticial aguda (fármacos, infecções, autoimune)',
          'Achados típicos: sedimento ativo (cilindros granulosos/hemáticos, hemácias dismórficas, leucócitos), FENa > 2%',
        ] },
        { tipo: 'lista', titulo: 'Pós-renal (obstrutiva)', itens: [
          'Intrínseca: cálculos, coágulos, cristais',
          'Extrínseca: tumores de próstata ou pelve, fibrose retroperitoneal, ligadura acidental',
          'Funcional: bexiga neurogênica, anticolinérgicos',
          'Achados típicos: anúria/oligúria súbita, hidronefrose na ultrassonografia, melhora após desobstrução',
        ] },
        { tipo: 'nota', estilo: 'atencao', texto: 'FENa e FEUr não diferenciam sozinhas pré-renal de NTA: diuréticos, DRC, sepse e contraste alteram os valores. Use junto com sedimento, volemia e resposta à reposição.' },
      ],
    },
    {
      tipo: 'secao', id: 'estadiamento', titulo: 'Estadiamento KDIGO', icone: { fa: 'exclamation-triangle', cor: '#e53935' }, cor: '#e53935',
      resumo: 'Baseado em creatinina e diurese', dica: 'Toque para expandir',
      blocos: [
        { tipo: 'grupos', grupos: [
          { titulo: 'Estágio 1', cor: '#fbc02d', itens: [
            { texto: 'Creatinina: 1,5–1,9× a basal OU aumento ≥ 0,3 mg/dL em 48 h' },
            { texto: 'Diurese: < 0,5 mL/kg/h por 6–12 h' },
          ] },
          { titulo: 'Estágio 2', cor: '#fb8c00', itens: [
            { texto: 'Creatinina: 2,0–2,9× a basal' },
            { texto: 'Diurese: < 0,5 mL/kg/h por ≥ 12 h' },
          ] },
          { titulo: 'Estágio 3', cor: '#e53935', itens: [
            { texto: 'Creatinina: ≥ 3,0× a basal OU creatinina ≥ 4,0 mg/dL (com aumento agudo) OU início de terapia renal substitutiva' },
            { texto: 'Diurese: < 0,3 mL/kg/h por ≥ 24 h OU anúria por ≥ 12 h' },
            { texto: 'Em < 18 anos: também TFG estimada < 35 mL/min/1,73 m²', estilo: 'atencao' },
          ] },
        ] },
        { tipo: 'nota', estilo: 'perigo', texto: 'Estágio 3: alto risco de mortalidade e de necessidade de suporte intensivo. O estágio final é o MAIS grave entre os critérios de creatinina e de diurese.' },
      ],
    },
    {
      tipo: 'secao', id: 'avaliacao', titulo: 'Avaliação inicial', icone: { fa: 'search', cor: '#ff9800' }, cor: '#ff9800',
      resumo: 'História, exames e imagem', dica: 'Toque para expandir',
      blocos: [
        { tipo: 'lista', itens: [
          'História: oligúria, edema, perdas de volume, medicamentos (AINEs, IECA/BRA, aminoglicosídeos, contraste), comorbidades',
          'Exame físico: estado volêmico, bexigoma, sinais de doença sistêmica (rash, artrite)',
          'Laboratório: creatinina basal e atual, ureia, eletrólitos, gasometria, hemograma, CK se houver suspeita de rabdomiólise',
          'Urina: EAS, sedimento (cilindros, cristais), proteinúria/albuminúria, índices de excreção (FENa, FEUr)',
          'Imagem: ultrassonografia renal (tamanho, hidronefrose); Doppler se houver suspeita vascular',
          'Biópsia renal se a causa for indefinida ou houver suspeita de glomerulopatia/nefrite intersticial',
        ] },
      ],
    },
    {
      tipo: 'secao', id: 'manejo', titulo: 'Manejo inicial', icone: { fa: 'pills', cor: '#4caf50' }, cor: '#4caf50',
      resumo: 'Causa, volemia, nefrotóxicos e suporte', dica: 'Toque para expandir',
      blocos: [
        { tipo: 'lista', itens: [
          'Identificar e tratar a causa (reposição na hipovolemia, desobstrução na pós-renal)',
          'Otimizar volemia: cristaloide isotônico, preferencialmente balanceado, quando houver hipovolemia; evitar amido. Diurético só para sobrecarga de volume',
          'Suspender ou evitar nefrotóxicos: AINEs, IECA/BRA (se hipotensão/hipovolemia), aminoglicosídeos, contraste quando possível',
          'Ajustar doses de fármacos de eliminação renal (antibióticos, anticoagulantes, digoxina etc.)',
          'Monitorar diurese, balanço hídrico, creatinina, K⁺ e gasometria',
          'Manter pressão de perfusão adequada em pacientes críticos',
        ] },
        { tipo: 'nota', estilo: 'atencao', texto: 'Furosemida controla volume, mas não melhora a evolução da IRA nem a sobrevida.' },
      ],
    },
    {
      tipo: 'secao', id: 'dialise', titulo: 'Diálise de urgência', icone: { fa: 'heartbeat', cor: '#f44336' }, cor: '#f44336',
      resumo: 'Indicações emergenciais (AEIOU)', dica: 'Toque para expandir',
      blocos: [
        { tipo: 'lista', itens: [
          'A: acidose metabólica grave refratária (pH < 7,1–7,2 ou HCO₃⁻ muito baixo apesar do tratamento)',
          'E: eletrólitos: hipercalemia grave refratária ou com alteração de ECG (ex.: K⁺ > 6,5 mEq/L)',
          'I: intoxicações dialisáveis (lítio, metanol, etilenoglicol, salicilato)',
          'O: sobrecarga volêmica (edema pulmonar) refratária a diurético',
          'U: uremia sintomática (encefalopatia, pericardite, sangramento)',
        ] },
        { tipo: 'nota', estilo: 'atencao', texto: 'Sem indicação urgente, iniciar a diálise de forma precoce não melhorou a sobrevida nos estudos recentes (STARRT-AKI, AKIKI 2): em geral, observar e reavaliar. Modalidade: hemodiálise intermitente, diálise peritoneal ou terapia contínua em instabilidade hemodinâmica.' },
      ],
    },
    {
      tipo: 'secao', id: 'prognostico', titulo: 'Prognóstico e seguimento', icone: { fa: 'history', cor: '#673ab7' }, cor: '#673ab7',
      resumo: 'Risco de progressão para DRC', dica: 'Toque para expandir',
      blocos: [
        { tipo: 'lista', itens: [
          'Pior prognóstico: idade avançada, comorbidades, estágio 3, necessidade de diálise',
          'A mortalidade cresce com o estágio da IRA e é maior em UTI com terapia renal substitutiva',
          'Mesmo a IRA que se recupera aumenta o risco de DRC, de eventos cardiovasculares e de nova IRA',
          'Seguimento: reavaliar creatinina e albuminúria após a alta e aos ~3 meses (KDIGO); encaminhar ao nefrologista em estágio ≥ 2, recuperação incompleta ou proteinúria',
          'Prevenção secundária: controle de pressão e diabetes, evitar nefrotóxicos, orientar sobre dias de doença',
        ] },
      ],
    },
  ],
  referencias: 'KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl 2012;2:1. • STARRT-AKI Investigators. N Engl J Med 2020;383:240. • Gaudry S et al. (AKIKI 2). Lancet 2021;397:1293. • Brenner & Rector\'s The Kidney.',
};
export default ira;
