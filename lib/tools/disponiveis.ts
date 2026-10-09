// Ferramentas JÁ MIGRADAS para o PWA (as demais existem no catálogo mas ainda não aparecem no menu).
// Para migrar uma ferramenta: implementar o componente/conteúdo, registrar em
// app/ferramentas/[slug]/implementacoes.tsx e acrescentar o slug aqui.
export const SLUGS_DISPONIVEIS = ['imc', 'ckd-epi-2021', 'cockcroft-gault', 'ckd-epi-creat-cistatina-c', 'clearance-de-creatinina-ped', 'hipercalemia-potassio',
  // Onda 1
  'hiponatremia-sodio', 'hiponatremia-fluxograma-na', 'correcao-de-hiponatremia-na', 'hipernatremia-sodio', 'correcao-de-hipernatremia-na', 'ingestao-diaria-de-sodio',
  'disturbios-acido-base', 'anion-gap', 'gasometria-arterial', 'reposicao-de-bicarbonato', 'osmolaridade-serica'] as const;
