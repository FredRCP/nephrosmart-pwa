# Escores do app antigo: revisão e divergências (12/11/2026)

Migrados (revisados): Glasgow, Maturação da FAV (regra dos 6), Risco Cardiovascular (PCE), Risco de Progressão da DRC (KFRE) e DRPAD.
NÃO migrado: REIN Score.

## REIN Score — não migrado
- O cálculo do app antigo (7 itens binários: idade ≥75=2, DM=1, DCV=2, albumina<3,5=2, Hb<10=1, IMC<18,5=1, HD=1; cortes 0–2/3–5/≥6) **não corresponde** ao texto do próprio modal (9 itens, 0–26 pontos, riscos de mortalidade em 1 ano "~5–10%…").
- A citação "Couchoud et al., Kidney Int 2009" não confere com o escore publicado (escore clínico de mortalidade em 6 meses em idosos incidentes em diálise, REIN francês). Pontuações e percentuais do texto parecem inventados.
- Para migrar: obter o artigo original (Couchoud C et al., escore de prognóstico a 6 meses em ≥75 anos que iniciam diálise) e implementar item a item com golden test.

## Glasgow
- Fórmula correta (3 componentes, 3–15; 13–15 leve, 9–12 moderado, ≤8 grave).
- Mudança: o app antigo vinha pré-marcado em 15; agora exige escolher os 3 componentes (evita resultado "normal" sem avaliação). Mostra E/V/M. Removido o botão de "T" do texto sem campo correspondente; texto orienta registrar componentes em intubados.

## Maturação da FAV
- Limites do app antigo: fluxo ≥600, diâmetro ≥6, profundidade ≤6 (inclusivos), mas o texto dizia ">6" e "<6": as fontes variam; mantidos inclusivos e informado na tela. **Equipe: confirmar o limite adotado.**
- Bug antigo: profundidade vazia era tratada como 0 (passava) e fluxo vazio como 0 (reprovava). Agora campo vazio = pendente.
- Removidas do texto condutas não verificadas (agulha 16–17G, tempo médio de maturação, conduta de cateter) e os asteriscos de markdown.
- Resultado agora é "critérios atendidos/não atendidos", não "pode puncionar".

## PCE (ASCVD)
- Coeficientes do app antigo conferidos um a um com Goff 2014: **corretos**. Exemplos publicados (55 anos, CT 213, HDL 50, PAS 120): mulher branca 2,1%, afro-americana 3,0%, homem afro 6,1%, homem branco ~5,3–5,4% (arredondamento).
- Mudanças: opção "Outro" não bloqueia mais (usa-se a equação de brancos/outros, como no guideline); faixas oficiais AHA/ACC 2018 (baixo <5, limítrofe 5–7,5, intermediário 7,5–20, alto ≥20); sem teto "<1%/>30%"; removida a lista de medicamentos e doses e afirmações de classe de recomendação não verificadas; PREVENT virou apenas aviso/link (o app antigo embutia o site da AHA).
- Aviso adicionado: PCE não foi desenvolvido para DRC avançada/diálise.

## KFRE (Risco de Progressão da DRC) — fórmula do app antigo estava ERRADA
- O app antigo usava intercepto −1,9265, coeficientes inventados, "calibração Brasil +2,7", rótulo "KFRE 2023/JAMA 2021" e cortes de risco próprios. Nada disso é a KFRE publicada.
- Reimplementada a KFRE de 4 variáveis (Tangri 2011/2016): L = −0,2201(idade/10−7,036) + 0,2467(masc−0,5642) − 0,5567(TFG/5−7,222) + 0,4510(ln ACR−5,137); S0 2/5 anos: 0,9750/0,9240 (América do Norte) e 0,9832/0,9365 (demais). Conferida com cálculo independente. Padrão = "fora da América do Norte".
- Não migrada a versão de 8 variáveis (coeficientes não verificados em fonte primária).
- Sem classificação "baixo/moderado/alto": os cortes do app antigo eram inventados. **Equipe: decidir se mostramos os limiares da KDIGO 2024 (encaminhamento por risco em 5 anos; planejamento de TRS por risco em 2 anos) após conferir o texto da diretriz.**
- Pesquisar: calibração específica para população brasileira (se houver) e fator de 2021+ para regiões.

## DRPAD
- Critérios de Pei 2009 (15–39: ≥3; 40–59: ≥2 por rim; ≥60: ≥4 por rim) conferidos. Os "critérios negativos" do app antigo estavam errados: corrigido (≥40 anos: <2 cistos exclui; 30–39: ausência de cistos; 15–29: US exclui mal).
- Corrigidas citações (Mayo = Irazabal 2015, JASN 26:160). Removida afirmação sobre faixa de TFG para tolvaptana. Cálculo de Mayo continua só como link externo ao site da Mayo (não há cálculo local).
- Equipe: conferir os intervalos de crescimento anual de cada classe (1A <1,5%; 1B 1,5–3; 1C 3–4,5; 1D 4,5–6; 1E >6%) antes de exibi-los no app.

## Nefrolitíase (app antigo → PWA)
- "Rastreio do tipo de cálculo": removido; sugeria estruvita só por pH > 7,5 e calciúria < 200 (sem cultura) e tipos de cálculo por faixas arbitrárias. Substituído por "Investigar causa", que mostra achados fora da faixa e causas a considerar, sem "adivinhar" o tipo.
- "Escore de Recorrência (ROKS simplificado)": removido; pontuações e percentuais não correspondem ao ROKS publicado.
- Conteúdo dos tipos de cálculo mantido, com HU revisadas, e a cólica aguda enxugada (sem posologias de prescrição).
