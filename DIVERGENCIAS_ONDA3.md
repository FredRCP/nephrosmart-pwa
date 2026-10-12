# Onda 3 — Cálcio, fósforo e magnésio (portabilidade em 11/10/2026)

Seis telas do app original viraram três hubs (Cálcio, Fósforo, Magnésio), cada um com as abas hipo/hiper. Cada slug antigo abre a aba certa.
Não portado: **Calculadora de correção do magnésio** (fórmula sem validação; ver PESQUISAR_EQUIPE.md bloco H). Kt/V e Hipercalemia já estavam prontos.

## Erros do app original corrigidos
- **Hipomagnesemia:** o app dizia "hiporreflexia"; na hipomagnesemia há **hiper-reflexia** (a hiporreflexia é da hipermagnesemia).
- **Hipomagnesemia:** infusão contínua "0,5–1 g/h" (12–24 g/dia) é excessiva; retirada. Retirado também o L-treonato (uso cognitivo, não trata hipomagnesemia). Doses orais por sal retiradas (não validadas).
- **Hipercalcemia:** a calcitonina aparecia como 4–8 UI/kg em um lugar e 4 UI/kg em outro; o zoledronato era "preferido em DRC" num cartão e "preferível com função renal preservada" em outro. Doses de bisfosfonato/calcitonina/denosumabe em DRC retiradas até validação; texto qualitativo mantido.
- **Hipercalcemia:** "Ca ionizado > 1,60 = grave" e furosemida logo após hidratação como rotina: removido/qualificado (alça só se sobrecarga de volume).
- **Hiperfosfatemia:** "Meta KDIGO 2,5–4,5 mg/dL" e "P < 5,5 no dialítico" não são alvos do KDIGO (que sugere reduzir em direção ao normal); Ca×P como critério, "ecocardiograma anual", "máx 2000 mg de cálcio elementar", dieta "< 800 mg" e dose de quelantes foram retirados.
- **Hipofosfatemia:** dose IV (0,08–0,16 mmol/kg, máx 45 mmol/dia) e conversões mmol↔mEq inconsistentes; retiradas (a "ampola de fosfato de sódio 15 mEq" não bate com 1 mmol/mL).
- **Hipocalcemia:** infusão contínua retirada. Mantidas as conversões de cálcio elementar (conferidas).
- Hiper-Mg: mantidos gluconato de cálcio 10 mL em 5–10 min, hidratação+alça e diálise; faixa de referência com ressalva laboratorial.

## Decisões de Fred pendentes
1. Menu: hoje cada slug continua com sua entrada (como o sódio). Quer **uma entrada por hub** (Cálcio / Fósforo / Magnésio), como nas Frações?
2. **Correção do cálcio** e **Hipocalemia** não foram enviadas: quer enviar as telas?

## Segunda parte (12/10/2026): menu, Correção do Cálcio e Hipocalemia
- **Menu:** uma entrada por hub (Cálcio, Fósforo, Magnésio). Os endereços antigos (hipercalcemia, hiperfosfatemia, hipermagnesemia, correção do cálcio) continuam abrindo o hub na aba certa; a busca por esses nomes acha a entrada.
- **Correção do cálcio:** virou aba do hub de Cálcio e calculadora nova (Payne, +0,8 por g/dL abaixo de 4,0; sem ajuste se albumina ≥ 4,0). Nada é gravado (o app original guardava o último valor no aparelho). Faixa de entrada: Ca 2–20 mg/dL, albumina 0,5–7 g/dL. Cores pela referência 8,5–10,2 (o app usava cortes 8,0/11,0 sem fonte). Avisos: albumina < 2,0 e DRC/UTI/diálise/citrato → preferir cálcio iônico. O modal do app citava "James 0,55" e "Payne 0,9", dados que não conferimos; omitidos.
- **Hipocalemia (erros do app original):** "diluição mínima 40 mEq em 250 mL" (= 160 mEq/L) contradizia o limite de 40 mEq/L; "KCl 25 mEq em 100 mL em 1 h" (250 mEq/L) é perigoso; limites diários de 200–300 mEq e "sedação se > 20 mEq/h" não têm base; o modal dava central "≤ 80 mEq/L e ≤ 25 mEq/h" e a tela "10 mEq/h", incoerentes. Mantido: KCl 19,1% = 2,5 mEq/mL, periférico até 40 mEq/L e 10 mEq/h, central com monitorização. Adicionada cautela em DRC/diálise/poupadores de K+. Doses orais, velocidade máxima em central e dose máxima diária foram para o bloco H.

## Terceira parte (12/10/2026): hub de Potássio
- Hipercalemia e Hipocalemia viraram um hub ("Potássio (Hipo/Hipercalemia)"). Decisão do Fred: **hub inteiro gratuito** (os dois endereços estão em FERRAMENTAS_GRATUITAS). Cálcio, fósforo e magnésio seguem premium.
- Agora há um hub por eletrólito: Sódio, Potássio, Cálcio, Fósforo, Magnésio.

## Quarta parte (12/10/2026): Sódio também em um hub só no menu
- As 6 ferramentas de sódio (hipo, hiper, fluxograma, 2 correções, ingestão) aparecem como UMA entrada, "Sódio (Hipo/Hipernatremia e Calculadoras)", igual aos demais eletrólitos. Os seis endereços continuam abrindo a aba correspondente. Para desfazer, basta tirar os 5 slugs de sódio de ALIAS_HUB em lib/tools/catalogo.ts.
- Dengue (vacinas): acrescentada a oferta do SUS para a Qdenga (10–14 anos, localidades prioritárias) e a faixa licenciada da Butantan-DV (12–59 anos).
