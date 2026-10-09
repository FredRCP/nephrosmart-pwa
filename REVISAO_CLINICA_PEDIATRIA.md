# TFG Pediátrica — revisão clínica para o Dr. Fred conferir antes de divulgar

A tela pediátrica foi refeita (não é mais o port do app original). Tudo abaixo precisa da sua conferência.

## 1. O que vem de fonte (conferido)
| Item | Fonte | Observação |
|---|---|---|
| CKiD U25 por creatinina e por cistatina C, κ por idade/sexo, 1–25 anos | NIDDK (página "eGFR Equations for Children, Adolescents & Young Adults"); Pierce CB et al., Kidney Int 2021 | Altura em **metros**, creatinina **enzimática** (mg/dL), cistatina C padronizada IFCC (mg/L). Constantes conferidas contra a página do NIDDK. |
| Combinada = média das duas equações | NIDDK | "preferida quando os dois marcadores estão disponíveis" |
| Schwartz bedside 2009 (0,413 × altura cm / creat) | Schwartz 2009; NIDDK | Mostrado só como comparação |
| KDIGO 2024: usar cistatina C em baixa massa muscular; excluir LRA antes de estimar TFG para DRC; nenhuma equação específica abaixo de 2 anos | KDIGO 2024 CKD, resumo para pediatras | |
| Lactentes: k = 0,45 termo / 0,33 prematuro; Cr reflete a materna nos primeiros dias; nenhuma equação bem validada | Revisão em Pediatr Nephrol 2019 (Springer) | Usado com aviso de baixa confiabilidade |

## 2. O que NÃO vem de fonte que eu pude abrir — conferir (estão no código, fáceis de editar)
1. **Critérios KDIGO de LRA** (escritos de memória; o artigo do PMC não abriu): estágio 1 = creatinina ≥ 1,5× a basal em até 7 dias **ou** aumento ≥ 0,3 mg/dL em 48 h; estágio 2 = ≥ 2,0×; estágio 3 = ≥ 3,0×, ou **TFG < 35 mL/min/1,73 m² em menores de 18 anos**, ou TRS. Diurese: < 0,5 mL/kg/h por 6–12 h (1); ≥ 12 h (2); < 0,3 por ≥ 24 h ou anúria ≥ 12 h (3).
2. **Creatinina basal estimada** pela creatinina que daria TFG de 120 mL/min/1,73 m² (convenção da literatura pRIFLE). Marcada como "provisório" na tela. Não é usada em menores de 1 ano.
3. **Textos de conduta de dose por estágio** (`lib/clinical/pediatria-conduta.ts`): são recomendações de prática, não saem de equação. Estágio 1: faixa de TFG imediatamente abaixo do teto; estágio 2: dose como TFG < 30; estágio 3: dose como TFG < 15 (< 10 se oligúria/anúria). **Ajuste ao seu protocolo.**
4. Limites de entrada (altura 30–220 cm, creatinina 0,1–15 mg/dL, cistatina 0,1–20 mg/L, idade 0–25 anos).

## 3. Decisões de projeto
- **LRA não gera "TFG"**: nenhuma equação vale com creatinina variando. A tela mostra o estágio, a TFG pela creatinina atual rotulada como **TETO** e a orientação de dose. Não há fórmula cinética: não encontrei validação pediátrica.
- **Nada do resultado pediátrico é guardado** nem enviado ao Ajuste de Dose (decisão do Dr. Fred). A ferramenta é **gratuita**.
- Sexo passa a ser obrigatório a partir de 1 ano (o original assumia feminino em silêncio).
- Estadiamento G1–G5 do KDIGO, com aviso de que abaixo de 2 anos a TFG normal é menor.
- Código legado (`lib/clinical/pediatrico.ts` e seus testes) permanece no projeto, sem uso na tela. Pode ser apagado depois.

## 4. Testes
CKiD U25 conferida contra valores calculados à parte; emendas das faixas etárias; todos os limiares de estágio (inclusive limites que falhariam por ponto flutuante, como 0,6/0,4); mutações nas constantes e limiares são pegas pelos testes.
