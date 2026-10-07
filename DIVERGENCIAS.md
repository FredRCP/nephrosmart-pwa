# Divergências do app original — decisões do Fred

Regra do projeto (atualizada em 03/10/2026): **as ferramentas são portadas já com as correções aprovadas.** Os testes comparam com a lógica original, caso a caso, **exceto** nos itens abaixo.

## Decididas e já aplicadas no PWA

| ID | Decisão | O que foi feito | Onde está testado |
|---|---|---|---|
| IMC-1 | ✅ Validar faixas e reforçar altura em cm | Peso 1–500 kg e altura 50–250 cm; fora disso não calcula. Mensagem agora diz “altura válida em **cm** (ex.: 175)” e, se digitarem 1.75: “Altura fora da faixa esperada (50 a 250 cm). Digite a altura em centímetros (ex.: 175).” Dica de unidade sob os campos. | `tests/clinical/imc.test.ts`, `tests/ui/calculadoras.test.tsx` |
| CKD-1 | ✅ Avisar menor de idade e sugerir o Clearance Pediátrico | Abaixo de 18 anos **calcula, mas mostra aviso** “Esta fórmula foi desenvolvida para adultos (18 anos ou mais). Em crianças e adolescentes, use o Clearance Pediátrico (Schwartz).” O link aparece quando essa ferramenta for migrada. | idem CKD-EPI |
| CKD-2 | ✅ Colocar as faixas | Idade 1–120 anos; creatinina 0,1–30 mg/dL (mensagem orienta µmol/L ÷ 88,4); altura 50–250 cm e peso 1–500 kg. Aviso (sem bloquear) para idade decimal (“considerada como 45 anos”) e creatinina < 0,4 ou > 15. Se altura **ou** peso for preenchido, os dois precisam ser válidos (antes eram ignorados em silêncio). | idem |
| CKD-3 | ✅ Guardar e avisar indexado/absoluto | Grava `ultimoGFR_tipo` (`indexado`/`absoluto`) além de `ultimoGFR`, e a tela mostra: “Valor enviado ao Ajuste de Dose: 64.4 mL/min (ABSOLUTO)” ou “… (INDEXADO) — para ajuste de dose, o recomendado é o valor absoluto”. **Falta:** o Ajuste de Dose exibir esse tipo quando for migrado. | idem |
| TXT-1 | ✅ Albuminúria só no estadiamento | Texto reescrito conforme você explicou: a fórmula usa creatinina, idade e sexo; a albuminúria (RAC), informada para pacientes com DRC, **complementa a classificação A1–A3 e não entra no cálculo da TFG**. | `tests/ui/calculadoras.test.tsx` |
| UI-1 | ✅ Corrigir contraste | No tema claro o aviso passa de `#ffde21` (amarelo claro) para `#b45309` (âmbar escuro); no tema escuro continua como no original. | — |

**Texto novo do CKD-EPI, para a sua leitura final:**
- Antes: “…baseada em creatinina sérica, idade, sexo e, opcionalmente, albuminúria, eliminando o fator de raça…” e “A1-A3 com base na albuminúria, se fornecida:”
- Agora: “…baseada em creatinina sérica, idade e sexo, eliminando o fator de raça…” e “A1-A3 com base na albuminúria (relação albumina/creatinina), informada para pacientes com DRC. Ela complementa a classificação da DRC, mas não entra no cálculo da TFG:”

## Mudanças de aparência e navegação (aprovadas com “corrigir tudo”)

| ID | O que mudou |
|---|---|
| UI-2 | “valor absoluto (desindexado)” aparecia com asteriscos literais; no PWA é negrito. |
| UI-3 | Ícones FontAwesome 5 → equivalentes do FontAwesome atual. **Logo ainda não incluído** (preciso de `assets/ns1a.png`). |
| NAV-1 | O link quebrado “Fluxograma para Hiponatremia (Sódio)” foi unificado com “Hiponatremia Fluxograma (Na⁺)”. |
| NAV-2 | As 11 ferramentas repetidas em várias categorias viraram uma ferramenta com várias etiquetas; no menu “Todos” a ordem é alfabética. |

## Achados no protótipo web (nefrosmartapp.com.br) e na política de privacidade

Fonte: repositório `FredRCP/nefrosmart-web` (Vite + React) e as páginas publicadas.

| ID | Achado | Gravidade | Sugestão |
|---|---|---|---|
| PROTO-1 | **O Ajuste de Dose do site tem uma cópia mais antiga da lógica de risco** (lista de palavras bem menor). Rodando as duas sobre os mesmos 3.555 casos, o badge difere em **208 casos (5,9%)**: 49 pares medicamento/faixa. Em **19 medicamentos** o site mostra **“SEM AJUSTE NECESSÁRIO”** onde o app mostra “AJUSTE NECESSÁRIO” (no valor limite 50 mL/min; ex.: cetirizina 30–50 = 5 mg/dia, colchicina 30–50, alogliptina 30–50). Os dados (JSON) das duas cópias são idênticos; a diferença é só a lógica. Lista completa: `DIFERENCAS_SITE_x_APP.csv`. | **Alta** (site público) | Tirar a página de Ajuste do site até o PWA substituí-la, ou avisar “em migração”. Não corrigir o site: a correção definitiva entra no PWA. |
| PROTO-2 | **Política de Privacidade × o que o app grava.** A política diz “dados anônimos de uso” e que os valores laboratoriais são processados “sem qualquer vínculo com a identidade do usuário”. Mas cada evento do app grava **e-mail e UID** (`analytics.ts`), e o evento do Ajuste grava **medicamento e valor da TFG** (`AjusteForm.tsx`). Provavelmente involuntário. | **Alta** (LGPD) | No PWA: registrar uso **sem e-mail e sem valores clínicos**. Enquanto o app antigo estiver em uso, ajustar a política ou o `analytics.ts`. |
| PROTO-3 | A política, os termos e a página de exclusão citam **Firebase** (login, perfil, analytics). Com a mudança para o Supabase os três textos precisam ser reescritos antes do corte. | Média | Reescrever junto com a migração do login. |
| PROTO-4 | O logotipo do site aparece em fonte “comic” no navegador: o `@import` da fonte Great Vibes está **depois** das regras do Tailwind no CSS e por isso é ignorado. | Baixa | Já resolvido no PWA (fonte hospedada junto com o app). |
| PROTO-5 | A descrição do site (meta tag) diz “cálculos nefrológicos e **gestão de pacientes**”, fora do escopo e da linha “não substitui o julgamento clínico”. | Média | Trocar por “Ferramentas clínicas para médicos e profissionais de saúde.” |
| PROTO-6 | O HTML do site vem vazio (tudo é montado por JavaScript): prévia de link no WhatsApp e indexação no Google ficam só com o título. | Média | No PWA as páginas já saem prontas; falta incluir imagem e descrição de prévia (Open Graph). |
| PROTO-7 | No site, `dark:` seguia o tema do sistema operacional, e não o botão de tema (página Excluir Conta). | Baixa | Já resolvido no PWA. |
| PROTO-8 | **HTML inválido na Política de Privacidade** (item 10, “Consentimento”): uma lista (`<ul>`) dentro de um parágrafo (`<p>`). O navegador “corrige” isso sozinho e o React acusa erro de hidratação no console. Já era assim no site. | Baixa | ✅ **Corrigido no PWA**: o `<p>` virou `<div>` (nenhuma palavra mudou). Novo teste reprova qualquer aviso do React em todas as páginas. |
| PROTO-9 | ✅ **E-mail de contato unificado:** a Política de Privacidade tinha `suporte@nefrosmart.com.br` (itens 8 e 9) além de `nefrosmartapp@gmail.com`. O Fred confirmou que o oficial é **nefrosmartapp@gmail.com** (e o domínio certo é `nefrosmartapp.com.br`); os dois trechos foram trocados e um teste impede o endereço antigo de voltar. | — | — |
| NOME-1 | ✅ **Grafia da marca decidida: NephroSmart** (com “ph”), como no app, no site e nos textos legais. Aplicado no nome instalado do PWA, nos títulos e no título dos Termos de Uso. O endereço do site e o e-mail continuam `nefrosmartapp`. | — | — |

## Pendentes

### Ajuste de Dose (AJD-A…F) — preciso de 3 respostas e da sua revisão

A planilha `REVISAO_AJUSTE_DOSE.csv` (61 linhas) lista cada caso para marcar **OK** ou **CORRIGIR**. Para migrar o módulo com as correções, preciso destas decisões (as sugestões são minhas):

| # | Pergunta | Minha sugestão |
|---|---|---|
| 1 | No valor **exatamente no limite** entre duas faixas (ex.: 30 mL/min), o que mostrar? (11 medicamentos, incluindo lítio, colchicina e dabigatrana) | Mostrar **as duas doses** com um aviso “valor no limite entre as faixas”, sem escolher por você |
| 2 | **Buracos** entre faixas como `30-49` e `>=50` (49,5 fica sem dose): tratar `30-49` como “de 30 até menos de 50”? (9 medicamentos, incluindo vancomicina) | Sim, faixas contínuas |
| 3 | Medicamentos com **texto geral e faixas** (colistina, insulina, liraglutida, oxazepam): mostrar os dois juntos? | Sim: texto geral + dose da faixa correspondente |

Os itens D (badge contraditório), E (31 “verdes” para revisar) e F (fonte e data de revisão por medicamento) dependem da sua revisão clínica: **eu não valido conduta nem dose; essa revisão é sua.** A planilha deixa isso rápido.

### Outros

| ID | Pendência |
|---|---|
| LEGAL-1 | Enviar `utils/LegalNote.tsx` para eu conferir o texto do aviso legal (hoje uso o das janelas do app). |
| TXT-2 | Hipercalemia: texto preservado palavra por palavra; revisão clínica (doses, fontes) é sua. |
