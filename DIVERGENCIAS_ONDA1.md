# Onda 1 — ácido-base e sódio: o que mudou em relação ao app original

Tudo abaixo foi apresentado ao Fred e aprovado ("ESTOU DE ACORDO COM TUDO"). Onde digo "confirmar", é um número ou uma referência que precisa de conferência na fonte antes de ir a público.

## Como ficou a navegação
- **Hub Sódio** (abas: Hiponatremia · Fluxograma · Corrigir hipo · Hipernatremia · Corrigir hiper · Ingestão) abre pelos 6 slugs antigos, cada um na sua aba.
- **Hub Ácido-base** (abas: Compensação · Anion gap · Gasometria · Bicarbonato) abre pelos 4 slugs antigos.
- **Osmolaridade sérica** continua tela própria (o fluxograma tem um link para ela).
- O catálogo (66 + 2 ocultas), o ranking de uso e os favoritos não mudam: os slugs são os mesmos.
- Todas continuam **Premium** (nenhuma está em `FERRAMENTAS_GRATUITAS`).

## Erros de código corrigidos
| # | Onde | Antes | Agora |
|---|------|-------|-------|
| GASO-1 | Gasometria | `parseFloat(albumina) \|\| 0`: albumina em branco valia 0 e somava ~10 ao AG | Em branco = não corrige e avisa |
| SOD-1 | Ingestão de sódio | `**negrito**` aparecia literal; limites de sódio aplicados a g de NaCl | Sem marcação; classifica em g de **sódio** e mostra o sal equivalente |
| BIC-1 | Bicarbonato | `volumePerAdmin*3` sem arredondar; 0,1 mEq/mL rotulado "Diluída" | Arredondado; "solução diluída (0,1 mEq/mL)" |
| UI-1 | Campo (compartilhado) | Depois de um erro, a primeira letra digitada fechava o teclado (campo remontava) | Tremida por classe; o campo não remonta. **Vale para todas as calculadoras** |

## Regras unificadas
| Tema | Original | Agora |
|------|----------|-------|
| Alcalose metabólica | 0,7·HCO₃+20 ±5 (AcidBase) × 0,7·HCO₃+21 ±2 (Gasometria) | 0,7·HCO₃+21 ±2 nas duas telas |
| Alcalose respiratória crônica | HCO₃ = 24 − 0,5·ΔPCO₂ | 24 − 0,4·ΔPCO₂ (tolerância ±4 mantida) |
| Compensação metabólica "excessiva/insuficiente" | Rótulo pelo sinal da diferença (confuso) | "Inadequada → sugere acidose/alcalose respiratória associada" |
| Na corrigido pela glicose | 1,6 em todo o app | 1,6; mostra também 2,4 e usa 2,4 como principal se glicose > 400 |
| Hiponatremia — meta/limite 24 h | Conteúdo: ≤8/≤6; calculadora: 10 agudo, 6 crônico, 8/4 > 60 anos, 4 criança | Meta 6–8; máximo 8 (alto risco de ODS ou < 18 anos) e 10 nos demais; sem redução automática por idade (só aviso) |
| Bolus de NaCl 3% | 100–150 mL, "até 3×/30 min"; efeito de +1–1,5 × +2–3 mEq/L por 100 mL | 100–150 mL em 10–20 min, até 2 repetições; meta +4–6 mEq/L; a calculadora mostra o efeito calculado de 150 mL |
| Hipernatremia — limites | Calculadora 12/10/8 (< 18 e > 60 anos) × conteúdo 0,5 mEq/L/h | Crônica ≤ 10 (e ≤ 0,5 mEq/L/h), aguda ≤ 12, criança 8; idoso só recebe aviso |
| Hipernatremia — fórmula | Déficit de água (só vale para SG 5%) | Adrogué–Madias para qualquer solução, mais perdas contínuas (campo opcional) |
| ACT em crianças | 0,65 | 0,6 (Adrogué/Madias) |
| Anion gap | Sem referência | 8–12 (12–16 com K⁺) + aviso "varia por laboratório" |
| Bicarbonato | Sem contexto de indicação | Avisos BICAR-ICU (pH < 7,20 + LRA grave), acidose láctica sem rotina, CAD só se pH < 6,9 |
| Neonatos/lactentes < 1 ano | "Não recomendado" | "Não validado" (mantido, sem cálculo) |

## Conteúdo removido por falta de fonte (confirmar antes de recolocar)
- "71% dos casos de ODS ocorreram com correção < 8 mEq/L/24 h" e "correção rápida: risco de ODS 3,9×, mortalidade −50%".
- Frases de ECG de baixa evidência: "QRS alargado" na hipernatremia, "P-wave alternans" na hiponatremia.
- "Copeptina elevada na SIADH" e as atribuições "JASN 2025", "guideline ESE 2024" no fluxograma (trocadas por "diretriz europeia ESE/ESICM/ERA-EDTA 2014").
- Etanol como causa de hiponatremia translocacional (é osmol inefetivo; só eleva o gap osmolar).

## Pontos para o Fred conferir na fonte
1. Limite de 10 mEq/L nas primeiras 24 h para hiponatremia crônica sem alto risco (a diretriz europeia de 2014 usa 10; Sterns recomenda 8 como meta máxima geral). Se preferir 8 para todos, é uma constante em `limiteHipo` (lib/clinical/sodio.ts).
2. Tolvaptana: o texto avisa que a diretriz europeia de 2014 não recomenda. Confira se mantém o item.
3. Texto do BICAR-ICU (Jaber et al., Lancet 2018): conferi de memória.
4. Faixas de classificação da ingestão de sódio (< 1 g baixa; ≤ 2 g adequada; ≤ 3,5 g moderada; > 3,5 g alta) são deste app, não da OMS (só a meta de < 2 g vem da OMS/KDIGO).
5. Todo o texto clínico das abas Hiponatremia/Hipernatremia foi reescrito de forma mais enxuta que o original; revise antes de publicar.

## Não incluído
- Dados antigos salvos no celular continuam sendo lidos pelas mesmas chaves (`ultimoResultadoHiponatremia`, `ultimoResultadoHipernatremia`, `ultimaDoseBicarb`, `ultimoAnionGap`, `ultimaAcidBase`, `ultimaOsmolaridade`, `lastUrineSodium`, `lastUrineVolume`, `ultimoSodiumIntake`). Os JSON antigos de hipo/hipernatremia tinham outro formato; se não tiverem `texto`, a tela mostra "Falha ao carregar"/vazio sem quebrar.
