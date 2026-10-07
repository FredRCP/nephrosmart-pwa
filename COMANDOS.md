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

A partir de agora, cada atualização vem num zip pequeno **só com o que mudou**, já na estrutura de pastas do projeto.

**Antes:** feche o servidor que estiver aberto (`Ctrl+C`). Se o Next avisar *"Port 3000 is in use"* ou *"Another next dev server is already running"*, ainda há um servidor antigo aberto em outro terminal: feche aquele terminal, ou use `taskkill /PID NUMERO /F` (o número aparece na própria mensagem).

```powershell
cd D:\PROGRAMACAO\NEFROSMARTPWA
$zip = Get-ChildItem "$env:USERPROFILE\Downloads" -Filter "atualizacao-nephrosmart*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$zip.FullName
Expand-Archive -Path $zip.FullName -DestinationPath . -Force
npm install
npm test
npm run dev
```

- A segunda linha pega o zip **mais recente** da pasta Downloads, mesmo que o navegador tenha salvo como `atualizacao-nephrosmart (1).zip`, e a terceira mostra qual foi. Se não aparecer nada, o zip não está em Downloads: mova-o para lá.
- `Expand-Archive ... -Force` copia por cima e **não apaga** nada: `node_modules`, `.env` e `.git` ficam intactos.
- Se eu avisar que algum arquivo deve ser **apagado**, o comando `Remove-Item` vem junto com a atualização.
- Como saber se a atualização entrou: o `npm test` mostra o total de testes (agora **147**).

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
- `npm test` deve terminar com **147 testes passando**.
- Se o `npm audit` apontar vulnerabilidades, rode **`npm audit fix`** (sem `--force`) e depois `npm test`. **Nunca use `--force`**: ele pode trocar versões principais e quebrar o projeto.

---

## 3b. O que olhar depois de atualizar (versão de 06/10/2026)

Com `npm run dev` aberto em `http://localhost:3000`, largue a janela larga (desktop) e depois estreite até ficar do tamanho de um celular:

- **Larga:** menu azul no topo (Home, Função Renal, Ajuste de Dose, Ferramentas Clínicas) e engrenagem à direita com Tema, Contato, Termos de Uso, Política de Privacidade e Excluir Conta.
- **Estreita:** some o menu azul, a engrenagem passa para a Home e as ferramentas ganham o cabeçalho escuro com botão voltar.
- Abra `/privacidade`, `/termodeuso`, `/excluir-conta` e `/contato`.
- Alterne o tema pela engrenagem e confira a página **Excluir Conta** nos dois temas.

## 3c. Ligar o login (depois de criar o projeto no Supabase)

1. No **SQL Editor do projeto `nephrosmart`**: rode `supabase/migrations/0002_aceite_no_cadastro.sql` (o `0001` você já rodou) e depois o `04-verificar-projeto-novo.sql`: as 15 linhas continuam "OK".
2. No Supabase, **Authentication → URL Configuration**: *Site URL* = `http://localhost:3000`; em *Redirect URLs* acrescente `http://localhost:3000/**`.
3. No Supabase, **Authentication → Sign In / Providers**: e-mail ligado, **confirmação de e-mail ligada**, login anônimo desligado.
4. Em **Project Settings → API**, copie a *Project URL* e a chave pública (*anon* ou *publishable*; **nunca** a `service_role`) para o arquivo `.env.local` na raiz do projeto (sem aspas, sem espaços):

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica
```

5. Reinicie o servidor (`Ctrl+C` e `npm run dev`). Na engrenagem aparece **Entrar**.
6. Teste: `/cadastro` → crie sua conta → abra o link do e-mail **no mesmo navegador** → `/conta` mostra "aguardando liberação". Rode o `05-liberar-usuario.sql` (troque o seu e-mail) e recarregue: "Plano Beta, válido até…".

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

## 7. Git do projeto novo

```powershell
cd D:\PROGRAMACAO\NEFROSMARTPWA
git init -b main
git add .
git status
```

Confira que **`.env.local` NÃO aparece** na lista. Depois:

```powershell
git commit -m "base: PWA NephroSmart 2.0 (Next 16, Serwist, catálogo, 3 ferramentas)"
git switch -c pwa-migration
git remote add origin https://github.com/SEU-USUARIO/nefrosmart-pwa.git
git push -u origin main
git push -u origin pwa-migration
```

Crie antes o repositório no GitHub como **Private** e troque `SEU-USUARIO`.

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
| Celular não abre `http://IP:3000` | Mesmo Wi-Fi? Firewall do Windows? Passo 5 |
