# Onda 7 — ferramentas NOVAS (não existiam no app original) — itens para o Dr. Fred confirmar

## 1. Conversor de unidades laboratoriais (GRATUITO)
- Fatores calculados a partir das massas molares; PTH 1 pmol/L = 9,43 pg/mL; vitamina D 1 nmol/L = 0,4006 ng/mL.
- Ureia (mg/dL) = BUN × 2,14. Cálcio/magnésio: mEq/L = mmol/L × 2.
- DECISÃO: entrou na lista de ferramentas gratuitas (agora 6). Se preferir Premium, remova de FERRAMENTAS_GRATUITAS (lib/access/plans.ts) e do teste plano.test.ts.

## 2. Depuração de creatinina em urina de 24 h
- ClCr = (Cr urinária × volume) ÷ (Cr sérica × minutos); correção para 1,73 m² por Mosteller.
- Adequação da coleta (mg/kg/24 h): homens 15–25, mulheres 12–20 (adultos). CONFIRMAR as faixas; idosos e sarcopênicos têm excreção menor (o app avisa).
- Peso sozinho avalia só a excreção; altura sozinha é recusada.

## 3. Estadiamento da DRC (KDIGO 2012/2024)
- Cortes G: 90/60/45/30/15. Cortes A: RAC/EAU 30 e 300; PCR/PER 150 e 500 (limites pertencem a A2).
- Matriz de risco e frequência de monitorização (1, 2, 3, 4+ vezes/ano) conforme figura KDIGO. CONFIRMAR a tabela de frequência (G1/G2 A1 = "1 se DRC").
- Aviso de encaminhamento: G4/G5 ou A3.

## 4. Equivalência de diuréticos
- Alça (base furosemida VO 40 mg): furosemida IV 20, bumetanida 1, torasemida 20, ácido etacrínico 50. CONFIRMAR torasemida (algumas fontes: 10–20 mg) e ácido etacrínico.
- Tiazídicos: hidroclorotiazida 25 = clortalidona 12,5. CONFIRMAR (a equivalência é muito debatida).
- Não converte entre grupos (alça ↔ tiazídico). Sensibilidade "alta" (dose).

# Melhorias pós-Onda 7 — itens para confirmar
- Fluxograma de hiponatremia: NOVO passo inicial (gravidade dos sintomas) com faixa de urgência (NaCl 3% 100–150 mL em 10–20 min, até 2x, meta +4–6; igual à aba de correção). NOVO nó "usa tiazídico?" no ramo euvolêmico. NOVO nó Nau no ramo euvolêmico (Osm urinária ≥100): Nau ≥30 → SIADH; <30 → "Baixa ingestão de solutos" (potomania). CONFIRMAR o corte de Nau 30 nesse ponto.
- Corte de Nau no ramo hipovolêmico continua 20 mEq/L (como no app original); a diretriz europeia 2014 usa 30. DECIDIR se unificamos.
- Som de abertura: navegadores só liberam áudio após um toque; agora toca automaticamente se permitido, senão no primeiro toque da sessão.

# Atualização (Fred confirmou)
- Corte de Nau unificado em 30 mEq/L em todo o fluxograma e no texto de hiponatremia.
- Aviso legal: linha curta em toda ferramenta; texto completo na janela (i); linha reforçada ("Confira dose, volume e velocidade") em correção de sódio, bicarbonato, diuréticos e fluxograma de hiponatremia.
- Cadastro/login levam à Home (antes /conta). Aviso de primeiro uso dos Termos (localStorage, volta se VERSAO_TERMOS/PRIVACIDADE mudar).
- BUG corrigido: resultados de hipovolemia, IC, cirrose e nefrótica no fluxograma apareciam em branco.

# Melhorias 3
- Termos: agora aceite OBRIGATÓRIO no primeiro uso (tela modal, sem como dispensar). Não cobre /termodeuso, /privacidade e /cadastro. Quem cria conta já fica aceito neste aparelho. Registro local apenas (localStorage); o registro com data/versão no banco continua só no cadastro. Se quiser prova de aceite também de quem não tem conta, precisaria gravar no servidor.
- Páginas de eletrólitos: causas antes do tratamento (hipercalemia: aviso de hemólise no topo).
- Botão (i) adicionado em: Fluxograma de hiponatremia, Hipernatremia, IRA (guia rápido). Teste garante (i) em toda ferramenta migrada.
