# Onda 2 — IRA e frações de excreção: o que mudou em relação ao app original

Decisões do Fred: incluir FECa, FEP, FEUA e FEMg já nesta onda; **retirar o TTKG** (sem uso na prática); manter a função renal esperada como referência educacional; todas as ferramentas continuam Premium; pesquisar os cortes na literatura.

## Telas
- **Hub "IRA"** (`injuria-renal-aguda-ira`): conteúdo em acordeão + Calculadora KDIGO; atalhos para FENa e FEUr.
- **Hub "Frações de excreção"** (7 abas): FENa, FEUr, FEK, FECa, FEP, FEUA, FEMg. No menu aparece **uma entrada só** ("Frações de Excreção", que abre na aba FENa); os 7 endereços continuam funcionando e abrem a aba certa. Abas: no celular rolam para o lado (ponta esmaecida indica que há mais); no desktop ficam largas, em até duas linhas.
- **Ícone**: favicon.ico novo (aba do navegador) e o rim ao lado do título no menu azul do desktop.
- **Função renal esperada** (`funcao-renal-esperada-p-idade`): tela própria.
- **TTKG** (`gradiente-transtubular-de-k`): sai do menu (nível "fora"); o slug continua no catálogo para não quebrar links.
- **Sobre** (`/sobre`): nova página no menu da engrenagem e no rodapé do desktop.

## Erros corrigidos
| Onde | Original | Agora |
|---|---|---|
| FEMg | Multiplicava o Mg sérico por 0,7 | Divide (denominador `0,7 × Mg sérico`): só ~70% é ultrafiltrável |
| FENa (texto) | "Diurético causa falsa baixa" | Diurético AUMENTA a FENa; use a FEUr |
| KDIGO | +0,3 mg/dL valia em qualquer intervalo | Só em até 48 h; 1,5× vale em até 7 dias; > 7 dias não é critério |
| KDIGO | Cr ≥ 4,0 mg/dL sempre estágio 3 | Só com aumento agudo (senão avisa: pode ser DRC) |
| KDIGO | Comparações com ponto flutuante cru | Razão e delta arredondados a 3 casas (ex.: 1,65/1,1 = 1,4999… agora é 1,5) |
| KDIGO | Peso/diurese sem vírgula decimal | Vírgula aceita em todos os campos |
| IRA (texto) | "KDIGO 2012, atualizado em 2023" e "K⁺ > 6,5–6,5" | KDIGO 2012; "K⁺ > 6,5 mEq/L" |
| Função esperada | `**negrito**` literal na tela; aceitava < 18 anos | Sem marcação; < 18 anos remete ao Clearance Pediátrico |
| Todas as FE | Nenhuma validação de faixa | Creatinina sérica 0,1–30 e urinária 1–600 mg/dL; soluto > 0; aviso se FE > 100% |

## Pontos de corte adotados (pesquisa)
Marcados **(confirmar)** os que vêm de estudos pequenos ou de convenções diferentes; revise com sua experiência.

| Fração | Baixa | Intermediária | Alta | Fonte / observação |
|---|---|---|---|---|
| FENa | < 1% (pré-renal) | 1–2% | > 2% (NTA) | Espinel 1976; Pépin 2007. Algumas séries usam > 3% (confirmar) |
| FEUr | < 35% (pré-renal) | 35–50% | > 50% (NTA) | Carvounis 2002; Diskin 2010; estudos usam 30–40% para o corte inferior. O corte superior de 50% é convenção (confirmar) |
| FEK (hipocalemia) | < 6% (extrarrenal) | 6–9,5% | > 9,5% (renal) | Elisaf 1995: normais 4–16% (média 8%); extrarrenal 1,5–6,4% (média 2,8%); renal 9,5–24% (média 15%). **Hipercalemia: sem corte validado** (o original usava 10/20% sem base sólida) (confirmar) |
| FECa | < 1% | 1–2% | > 2% | Depuração Ca/Cr < 0,01 ≡ FECa < 1% (FHH); 0,01–0,02 indeterminada (confirmar) |
| FEP | < 5% | 5–20% | > 20% | Hipofosfatemia: > 5% (alguns > 10%) sugere perda renal. Na DRC a FEP sobe naturalmente (confirmar) |
| FEUA | < 5% | 5–10% | > 10% | ~10% em euvolêmicos; em hiponatremia > 12% favorece SIADH, < 8% favorece hipovolemia (avisos) (confirmar) |
| FEMg | < 2% | 2–4% | > 4% | Duas convenções (> 2% Elisaf; > 4% Kroll). O app mostra a zona intermediária entre elas. Só em hipomagnesemia e TFG preservada (confirmar) |

## KDIGO — pontos para você validar
- A diretriz em vigor é a de **2012**. Em março de 2026 o KDIGO publicou um **rascunho** (consulta pública) de atualização, "AKI/AKD". Os critérios de creatinina, diurese e o estadiamento 1–3 **são os mesmos**; o rascunho acrescenta cistatina C ≥ 1,5× e biomarcador estrutural como critérios, calcula a diurese pelo peso ideal, define IRA transitória/persistente e recuperação completa/parcial, e traz a DRA (doença renal aguda). Citei os dois e marquei o que vem do rascunho. **Confira o texto final quando sair.** Não encontrei atualização "2023" como citava o app original.
- **DRA** (nova seção): IRA ≤ 7 dias; DRA ≤ 3 meses; DRC > 3 meses. Critérios (ADQI 16 / rascunho 2026): IRA, TFG < 60, queda da TFG ≥ 35%, aumento da Cr > 50%, ou marcador de lesão (albuminúria, hematúria, piúria). Recuperação completa: Cr < 1,2× a basal; parcial: 1,2 a < 1,5×.
- Manejo conforme o rascunho: cristaloide (não coloide), tamponado em vez de salina 0,9%; diálise adiada em vez de precoce quando não há indicação urgente.
- Cr ≥ 4,0 mg/dL só entra no estágio 3 quando a IRA já foi definida por aumento agudo. O texto do KDIGO 2012 lista "aumento da Cr sérica para ≥ 4,0 mg/dL"; a exigência do aumento agudo é a leitura conservadora (evita classificar DRC estável como estágio 3).
- Critério pediátrico (TFG < 35 mL/min/1,73 m²) está descrito no texto, mas não é calculado.
- Prognóstico: tirei os percentuais de mortalidade do original (10–20% / 50–60%), que eu não consegui confirmar. O texto é qualitativo.
- Manejo: acrescentei cristaloide balanceado, evitar amido, e a observação de que o início precoce da diálise sem indicação urgente não melhorou a sobrevida (STARRT-AKI, AKIKI 2). Revise se concorda.
- Seguimento: KDIGO sugere reavaliar aos ~3 meses; o original dizia 7–90 dias.

## Janela e armazenamento
Chaves do localStorage preservadas: `ultimaFENa`, `ultimaFEUr`, `ultimaFEK`, `ultimaFECa`, `ultimaFEP`, `ultimaFEUA`, `ultimaFEMg`, `ultimaGFR Esperada`. O KDIGO não grava nada.

## Ajustes de tela pedidos junto
- **Barra inferior do iPhone**: nova faixa fixa na parte de baixo, só no celular, com a altura exata do indicador de início e a cor final do fundo do app (mesma técnica da faixa do topo, que funcionou). Se continuar branca depois de remover e reinstalar o PWA, mande um print.
- **Desktop**: menu azul agora ocupa a largura toda (título à esquerda, botões de navegação à direita); a saudação da Home foi para o canto esquerdo.
