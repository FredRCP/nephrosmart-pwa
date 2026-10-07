# Comandos do NephroSmart (PowerShell, Windows)

Tudo abaixo é para colar no **PowerShell**, uma seção por vez. Pastas usadas:

- App antigo: `D:\PROGRAMACAO\APPS PRONTOS\NEFROSMART`
- PWA novo: `D:\PROGRAMACAO\NEFROSMARTPWA` (sempre com as mesmas letras maiúsculas)

---

## 1. Backup do app antigo (faça primeiro, uma vez)

O `medicamentos_profissional.json`, o `analytics.ts` e o `Authgate.tsx` nunca foram commitados.

```powershell
cd "D:\PROGRAMACAO\APPS PRONTOS\NEFROSMART"
git status --short
git remote -v
git check-ignore -v .env .env.production
git add -u
git add medicamentos_profissional.json analytics.ts Authgate.tsx
git commit -m "backup: estado do app antes da migração para PWA"
git tag backup-pre-pwa
git log --oneline -3
```

- `git remote -v` mostra para onde o código vai. **Só dê `git push` depois de confirmar que o repositório é privado.**
- `git check-ignore` deve listar `.env` e `.env.production`. Se não listar, eles estão sendo versionados.
- Não use `git add .` nesse repositório.

---

## 2. Aplicar uma atualização (zip só com os arquivos novos ou alterados)

Cada atualização vem num zip pequeno **só com o que mudou**, já na estrutura de pastas do projeto. Pare o servidor (`Ctrl+C`) antes. Se o Next avisar *"Port 3000 is in use"* ou *"Another next dev server is already running"*, ainda há um servidor aberto em outro terminal: feche-o ou use `taskkill /PID NUMERO /F` (o número vem na mensagem).

**Passo 1: descobrir onde o zip foi salvo** (o navegador nem sempre usa a pasta Downloads):

```powershell
cd D:\PROGRAMACAO\NEFROSMARTPWA
Get-ChildItem "$env:USERPROFILE\Downloads","$env:USERPROFILE\Desktop","$env:USERPROFILE\OneDrive*\Downloads","D:\","D:\PROGRAMACAO" -Filter "atualizacao*.zip" -ErrorAction SilentlyContinue | Select-Object FullName, LastWriteTime
```

Se não aparecer nada: no Chrome aperte `Ctrl+J`, ache o arquivo e clique em **Mostrar na pasta**. O mais simples é **arrastar o zip para dentro da pasta do projeto** (`D:\PROGRAMACAO\NEFROSMARTPWA`).

**Passo 2: extrair por cima**, trocando o caminho pelo que apareceu (se o zip estiver na pasta do projeto, basta `.\atualizacao-nephrosmart.zip`):

```powershell
Expand-Archive -Path "COLE-AQUI-O-CAMINHO-DO-ZIP" -DestinationPath . -Force
Remove-Item supabase\migrations\001_dialise_schema.sql -ErrorAction SilentlyContinue
npm install
npm test
npm run dev
```

- Também vale: botão direito no zip → **Extrair tudo…** → escolha a pasta do projeto → substituir os arquivos.
- `-Force` copia por cima e **não apaga** nada: `node_modules`, `.env` e `.git` ficam intactos.
- Se eu avisar que algum arquivo deve ser **apagado**, o `Remove-Item` vem junto.
- Como saber se a atualização entrou: o `npm test` mostra o total de testes (agora **205**).

### Se precisar trocar o projeto inteiro (zip completo)

```powershell
$zip  = "$env:USERPROFILE\Downloads\nefrosmart.zip"
$tmp  = "D:\PROGRAMACAO\_tmp_nefrosmart"
$proj = "D:\PROGRAMACAO\NEFROSMARTPWA"

Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
Expand-Archive -Path $zip -DestinationPath $tmp -Force
Remove-Item -Recurse -Force "$proj\app\calculadoras" -ErrorAction SilentlyContinue
Remove-Item -Force "$proj\middleware.ts" -ErrorAction SilentlyContinue
robocopy "$tmp\nefrosmart" $proj /E /XD node_modules .next .git /NFL /NDL /NJH /NJS
Remove-Item -Recurse -Force $tmp
cd $proj
```

(O `robocopy` devolve códigos de 0 a 7 quando dá certo; não é erro.)

---

## 3. Instalar e testar

```powershell
cd D:\PROGRAMACAO\NEFROSMARTPWA
node -v
npm install
npm run typecheck
npm test
```

- `node -v` precisa mostrar **v22** ou mais novo (`nvm use 22`, como administrador, se mostrar v20).
- `npm install` só é demorado na primeira vez.
- `npm test` deve terminar com **205 testes passando**.
- Se o `npm audit` apontar vulnerabilidades, rode **`npm audit fix`** (sem `--force`) e depois `npm test`. **Nunca use `--force`**: ele pode trocar versões principais e quebrar o projeto.

---

## 3b. O que olhar depois de atualizar (versão de 06/10/2026)

Com `npm run dev` aberto em `http://localhost:3000`, largue a janela larga (desktop) e depois estreite até ficar do tamanho de um celular:

- **Larga:** menu azul no topo (Home, Função Renal, Ajuste de Dose, Ferramentas Clínicas) e engrenagem à direita com Tema, Contato, Termos de Uso, Política de Privacidade e Excluir Conta.
- **Estreita:** some o menu azul, a engrenagem passa para a Home e as ferramentas ganham o cabeçalho escuro com botão voltar.
- Abra `/privacidade`, `/termodeuso`, `/excluir-conta` e `/contato`.
- Alterne o tema pela engrenagem e confira a página **Excluir Conta** nos dois temas.

## 3c. Ligar o login (depois de criar o projeto no Supabase)

1. No **SQL Editor do projeto `nephrosmart`**: rode, nesta ordem, `supabase/migrations/0002_aceite_no_cadastro.sql` e `supabase/migrations/0003_cadastro_gratuito.sql` (o `0001` você já rodou) e depois o `04-verificar-projeto-novo.sql`: as 15 linhas continuam "OK".
2. No Supabase, **Authentication → URL Configuration**: *Site URL* = `http://localhost:3000`; em *Redirect URLs* acrescente `http://localhost:3000/**`.
3. No Supabase, **Authentication → Sign In / Providers**: e-mail ligado, **confirmação de e-mail ligada**, login anônimo desligado.
4. Em **Project Settings → API**, copie a *Project URL* e a chave pública (*anon* ou *publishable*; **nunca** a `service_role`) para o arquivo `.env.local` na raiz do projeto (sem aspas, sem espaços):

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica
```

5. Reinicie o servidor (`Ctrl+C` e `npm run dev`). Na engrenagem aparece **Entrar**.
6. Teste: `/cadastro` → crie a conta → abra o link do e-mail **no mesmo navegador** → você entra com o plano **Gratuito** (só as 4 ferramentas livres: CKD-EPI, Cockcroft-Gault, Hipercalemia e IMC; as demais pedem o plano Premium). Para dar acesso total a um testador, use o `05-liberar-usuario.sql` (plano beta ou premium).

O e-mail padrão do Supabase tem limite baixo por hora: nos testes, faça poucos cadastros. O envio por SMTP próprio entra antes de abrir ao público.

## 4. Rodar no computador

```powershell
copy .env.local.example .env.local     # só na primeira vez; preencher quando o Supabase entrar
npm run dev
```

Abra `http://localhost:3000`. Para parar: `Ctrl+C`.

## 5. Ver no celular (mesmo Wi-Fi)

```powershell
ipconfig
npm run dev -- -H 0.0.0.0
```

1. No `ipconfig`, procure **Endereço IPv4** da placa Wi-Fi (ex.: `10.1.1.124`).
2. No celular, abra `http://SEU-IP:3000`.
3. Se o Windows perguntar sobre o firewall, permita o Node em **redes privadas**.
4. Se a página abrir sem estilo ou aparecer aviso de "cross-origin" no terminal, informe o IP e reinicie:

```powershell
$env:NEXT_DEV_ORIGINS = "10.1.1.124"
npm run dev -- -H 0.0.0.0
```

Neste modo (http, em desenvolvimento) o celular **não oferece instalar** o app e o cache offline fica desligado. Serve para ver o layout e testar os toques. A instalação só funciona com HTTPS, no deploy (Vercel).

## 6. Testar o PWA e o offline no computador

```powershell
npm run build
npm start
```

Abra `http://localhost:3000`. No Chrome: **F12 → Application → Service Workers** (deve estar ativo) e depois **Network → Offline** e recarregue: as páginas migradas continuam abrindo.

---

## 7. Criar o repositório no GitHub

**Antes, no site:** github.com → botão **New** → nome `nephrosmart-pwa` → marque **Private** → **não** marque README, `.gitignore` nem licença (o repositório precisa nascer vazio) → *Create repository*.

**Depois, no PowerShell:**

```powershell
cd D:\PROGRAMACAO\NEFROSMARTPWA
git config user.name
git config user.email
git init -b main
git add .
git status
```

- Se `git config user.name` ou `user.email` vierem em branco, configure: `git config --global user.name "Seu Nome"` e `git config --global user.email "seu-email@exemplo.com"`.
- No `git status`, confira que **nenhum `.env`** aparece (só `.env.local.example`) e que não há `node_modules` nem `.next`. Se aparecer `.env`, **pare** e me avise.

```powershell
git commit -m "NephroSmart PWA: base, login, ferramentas gratuitas"
git remote add origin https://github.com/FredRCP/nephrosmart-pwa.git
git push -u origin main
```

Na primeira vez o Windows abre o navegador para você autorizar o GitHub. Ligue a **verificação em duas etapas** na sua conta do GitHub.

---

## 7b. Colocar no ar para testar (Vercel)

1. **vercel.com** → entre com o GitHub → *Add New… → Project* → escolha `nephrosmart-pwa` (autorize o acesso ao repositório privado).
2. Crie as duas variáveis do `.env.local` (veja "Onde ficam as variáveis" logo abaixo): `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (a chave pública; **nunca** a `service_role`). Clique em **Deploy**. **Atenção:** as variáveis `NEXT_PUBLIC_…` são gravadas no código durante o build; se você criá-las (ou corrigi-las) depois do primeiro deploy, é preciso um **novo deploy**: *Deployments → ⋯ no último → Redeploy* (desmarque "Use existing Build Cache").
   **Onde ficam as variáveis no painel novo da Vercel** (o menu lateral de *Settings* não tem mais o item solto *Environment Variables*; em 2026 as telas mudaram):
   - **Caminho A:** *Settings → Environments* → clique na linha **Production** e procure a seção de variáveis de ambiente (repita em **Preview**).
   - **Caminho B (endereço direto):** `https://vercel.com/fredrcps-projects/nephrosmart-pwa/settings/environment-variables`
   - **Caminho C (garantido, pelo terminal).** Rode **um comando por vez** (se colar vários de uma vez, as perguntas interativas "engolem" os comandos seguintes):

```powershell
npm i -g vercel
vercel login
vercel link
```

   No `vercel link`, ele pergunta *Which project?*: aperte **Enter** em `nephrosmart-pwa (linked by git)`. Depois, um comando de cada vez (cada um pede o valor: cole e aperte Enter; se perguntar se é sensível, responda `N`, é chave pública; no *preview*, Enter também na pergunta da branch):

```powershell
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
vercel env ls
```

   Os valores estão no Supabase, em *Project Settings → API* (*Project URL* e a chave pública *anon* ou *publishable*; **nunca** a `service_role`). O `vercel env ls` deve listar as 4 linhas (os valores aparecem escondidos). As variáveis só valem para o **próximo** deploy: o jeito mais simples é aplicar a atualização, testar e dar `git push` (a Vercel publica sozinha a cada push na `main`):

```powershell
git add .
git status
git commit -m "NephroSmart: atualizações"
git push
```

   O `.vercel` (criado pelo `vercel link`) já está no `.gitignore`. No `git status`, nenhum `.env` pode aparecer.

   **Sobre o aviso "`NEXT_PUBLIC_` expõe este valor a quem visitar o site":** é esperado e é seguro **para estas duas chaves**. A *Project URL* e a chave *anon/publishable* do Supabase foram feitas para ficar no navegador; quem protege os dados são as regras de acesso (RLS), que já testamos. **Nunca** vão para uma variável `NEXT_PUBLIC_` a chave `service_role` (ou `sb_secret_…`) nem a senha do banco. Para conferir a chave que você vai colar, cole-a no lugar de `COLE_A_CHAVE` (a tela mostra o papel dela: tem que ser `anon`; se aparecer `service_role`, **pare**):

```powershell
$t = "COLE_A_CHAVE"; $p = $t.Split('.')[1].Replace('-','+').Replace('_','/'); $p += '=' * ((4 - $p.Length % 4) % 4); [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($p))
```

   (Chaves novas começam com `sb_publishable_`, que é a pública, ou `sb_secret_`, que é a secreta.) O `npm test` agora também **reprova** se encontrar uma chave de administrador, `sb_secret_` ou senha de banco em qualquer arquivo do projeto.

   **O `vercel link` cria um `.env.local`** com um token temporário da Vercel (`VERCEL_OIDC_TOKEN`). Ele não é uma chave sua, já fica fora do Git e pode ser apagado quando quiser; o seu `.env` com as chaves do Supabase continua valendo para o `npm run dev`.

   **Aviso do build na Vercel** (`npm warn install-scripts … esbuild … @swc/core`): é um recado do npm novo sobre scripts de instalação; **nada é bloqueado**. O `package.json` já lista os dois como aprovados (`allowScripts`), e o aviso some.

3. A Vercel devolve um endereço como `https://nephrosmart-pwa-xxxx.vercel.app`. No Supabase (*Authentication → URL Configuration*), acrescente esse endereço em *Redirect URLs* com `/**` no final e teste o cadastro e o login por ele.
4. **Domínio de teste:** na Vercel, *Settings → Domains → Add* `beta.nefrosmartapp.com.br`. Ela mostra um registro CNAME. No Registro.br, abra o domínio → *DNS → Editar zona* e crie esse CNAME (`beta` apontando para o valor mostrado). Quando propagar, acrescente `https://beta.nefrosmartapp.com.br/**` nas *Redirect URLs* do Supabase e troque a *Site URL* por `https://beta.nefrosmartapp.com.br`.
5. **No celular:** iPhone, abra no Safari → Compartilhar → *Adicionar à Tela de Início*. Android, abra no Chrome → *Instalar app*.

O plano gratuito da Vercel (Hobby) serve enquanto não houver cobrança; ao cobrar pelo app, passa a valer o Pro. A primeira publicação é também o primeiro teste do build lá: se falhar, copie o registro de erro e me mande.

---

## 7c. Conferir as variáveis que estão na Vercel (sem expor nada)

Baixa as variáveis para um arquivo temporário e mostra só o **nome** e os **12 primeiros caracteres** de cada valor (a URL tem que começar com `https://`; a chave pública, com `eyJ` ou `sb_publishable_`):

```powershell
vercel env pull .env.verificacao --environment=production --yes
Get-Content .env.verificacao | Where-Object { $_ -match '=' -and $_ -notmatch '^\s*#' } | ForEach-Object { $n,$v = $_ -split '=',2; $v = $v.Trim('"'); "{0}  ->  começa com: {1}" -f $n, $v.Substring(0,[Math]::Min(12,$v.Length)) }
Remove-Item .env.verificacao
```

Para corrigir uma variável: `vercel env rm NOME production`, depois `vercel env add NOME production` (e o mesmo em `preview`), colando **só o valor**, sem aspas. Em seguida, novo deploy (`git push` ou *Redeploy*).

---

## 8. Regenerar o catálogo de ferramentas

Só se o menu do app antigo mudar:

```powershell
node scripts/gerar-catalogo.mjs "D:\PROGRAMACAO\APPS PRONTOS\NEFROSMART\MedicalToolsScreen.tsx"
npm test
```

## 9. Ranking de uso (Firestore)

```powershell
mkdir D:\PROGRAMACAO\ranking
cd D:\PROGRAMACAO\ranking
copy "$env:USERPROFILE\Downloads\ranking-uso.mjs" .
npm init -y
npm i firebase-admin
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\caminho\da\chave.json"
$env:EXCLUIR_UIDS = "seu-uid"          # opcional: tira os seus próprios testes
node ranking-uso.mjs
```

A chave de serviço fica **fora de qualquer pasta de projeto** e é apagada depois (IAM e administrador → Contas de serviço → Chaves).

---

## 10. Dia a dia

| Para quê | Comando |
|---|---|
| Testes ao salvar arquivos | `npm run test:watch` |
| Conferir tipos | `npm run typecheck` |
| Limpar o cache do Next (quando algo estranho acontecer) | `Remove-Item -Recurse -Force .next` |
| Ver quem está usando a porta 3000 | `netstat -ano \| findstr :3000` |
| Encerrar esse processo | `taskkill /PID NUMERO /F` |
| Ver o que mudou antes de commitar | `git status` e `git diff` |

## 11. Se algo der errado

| Sintoma | Solução |
|---|---|
| `'next' não é reconhecido` | Faltou `npm install` nessa pasta |
| `EBADENGINE` / avisos de Node | Node antigo: `nvm use 22` e `npm install` de novo |
| `Port 3000 is in use` | Há um servidor antigo aberto: feche o outro terminal ou `taskkill /PID NUMERO /F` (número na mensagem) |
| `Another next dev server is already running` | Só pode haver um servidor por pasta: feche o outro (`taskkill /PID NUMERO /F`) e rode `npm run dev` de novo |
| `Expand-Archive ... não existe` | O zip não está nesse caminho: use o comando da seção 2 (acha o mais recente em Downloads) |
| Aviso `ESM syntax in a file loaded as CommonJS (vitest.config.ts)` | Apague `vitest.config.ts` (o novo se chama `vitest.config.mts`) |
| Página em branco depois de atualizar o zip | `Remove-Item -Recurse -Force .next` e `npm run dev` |
| Aviso amarelo `webpack.cache ... snapshot` | Inofensivo; some limpando `.next` |
| Site na Vercel sem "Entrar" nem "Criar conta" | Abra `https://SEU-SITE.vercel.app/cadastro`. Se aparecer o aviso "o login ainda não está configurado", o build ficou sem as chaves: em *Settings → Environment Variables* confira os dois nomes **exatos** (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`), marcados para *Production* e *Preview*, e faça **Redeploy** |
| Site na Vercel mostra **"Internal Server Error"** em todas as páginas | Causa mais comum: valor inválido em `NEXT_PUBLIC_SUPABASE_URL` (sem `https://`, com aspas ou o texto errado colado). **Desde a versão de 08/10 o site não cai mais por isso**: o login fica desligado e `/cadastro` diz qual variável está errada. **Emergência:** Vercel → *Deployments* → no último deploy que funcionava, *⋯ → Instant Rollback* (ou *Promote to Production*) |
| Celular não abre `http://IP:3000` | Mesmo Wi-Fi? Firewall do Windows? Passo 5 |
