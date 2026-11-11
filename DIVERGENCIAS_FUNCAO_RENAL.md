# Função Renal — o que mudou em relação ao app original (para aprovação do Fred)

Os três cálculos foram portados com a MESMA conta, cores, textos e mensagens do app original.
Cada ferramenta foi comparada com a lógica original (copiada literalmente em `tests/golden/original.mjs`):
Cockcroft-Gault 9.504 entradas · CKD-EPI Cr+Cistatina 65.520 entradas · Pediátrico 343 mil entradas.

## Já aplicado (mesmo critério que você aprovou no IMC-1 e CKD-1/2/3) — diga se NÃO concorda
| Id | Ferramenta | Mudança | Por quê |
|---|---|---|---|
| CG-1 | Cockcroft-Gault | Recusa idade fora de 1–120 anos, peso fora de 1–500 kg, creatinina fora de 0,1–30 mg/dL | O original calculava qualquer número (ex.: creatinina 88 em µmol/L dava ClCr ≈ 1) |
| CG-2 | Cockcroft-Gault | Menor de 18 anos: calcula e mostra aviso apontando o Clearance Pediátrico | Fórmula é só para adultos |
| CYS-1 | CKD-EPI Cr+Cis | Mesmas faixas; cistatina C aceita 0,1–20 mg/L | Idem |
| CYS-2 | CKD-EPI Cr+Cis | Aviso para menor de 18 anos | Idem |
| CYS-3 | CKD-EPI Cr+Cis | Grava `ultimoGFR_tipo = indexado`; ao recarregar, se o último valor veio do CKD-EPI com altura e peso, escreve "mL/min (valor absoluto, desindexado)" em vez de "/1.73m²" | As duas telas usam a mesma chave `ultimoGFR`; sem isso o rótulo ficaria errado |
Para desfazer qualquer uma: é só remover o bloco de faixas / aviso em `lib/clinical/cockcroft.ts` ou `ckdepi-cistatina.ts`.

## Pediatria (PED-1 a PED-4): RESOLVIDO por redesenho
A aba "Chen", o sexo não exigido e as constantes 0,70/0,55 foram substituídos pela tela nova (CKiD U25 + estadiamento KDIGO de LRA).
Detalhes e itens a conferir: `REVISAO_CLINICA_PEDIATRIA.md`.

## Beta fechado (nov/2026)
- ALB-1: a relação albumina/creatinina é OPCIONAL no CKD-EPI (creatinina) e no CKD-EPI (creatinina + cistatina C). Sem ela, mostra só o estágio G; só marca o campo se algo inválido for digitado. O original bloqueava (cistatina) ou marcava em vermelho (creatinina). O Cockcroft-Gault nunca teve esse campo.
- DES-1: tela do CKD-EPI reorganizada: "Ajuste de dose (altura e peso)" no lugar de "Valor desindexado"; resultado separa "para classificar a DRC" (mL/min/1,73 m²) de "TFG absoluta, para ajustar dose" (mL/min).
- ACE-1: ferramentas em validação (equivalência de diuréticos, IRA, intoxicações) ocultas para quem não é administrador (lib/access/restritas.ts). Oculta no menu, na busca e no endereço direto, mas o código continua no pacote do app (barreira de interface, como o bloqueio Premium).
