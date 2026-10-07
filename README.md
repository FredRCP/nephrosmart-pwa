# NephroSmart 2.0

Next.js 16 · React 19 · Tailwind 4 · PWA (Serwist) · Supabase (schema `nefrosmart`)

## Rodar
```powershell
npm install
copy .env.local.example .env.local     # preencher quando o Supabase entrar
npm run dev                            # http://localhost:3000
```
Node 22+ (`nvm use 22`). Teste do PWA/offline: `npm run build` e `npm start`. Lista completa de comandos: `COMANDOS.md`.

## Testes
```powershell
npm test
```
- `tests/clinical/*` compara cada cálculo com a **lógica original do app** (`tests/golden/original.mjs`), caso a caso.
- `tests/ui/*` renderiza as telas e simula digitação e cliques.
- `tests/db/*` testa as regras de segurança do banco (quem lê e altera o quê).
- `tests/access/*` testa a regra de plano (beta com validade, conta liberada).

## Como migrar uma ferramenta
1. Está no catálogo (`lib/tools/catalogo.json`, gerado do app antigo com `node scripts/gerar-catalogo.mjs <caminho do MedicalToolsScreen.tsx>`).
2. **Cálculo:** função pura em `lib/clinical/` + teste de comparação com o original em `tests/clinical/`.
3. **Tela:** componente em `components/calculators/` (modelo `CalculadoraLayout`) ou dados em `lib/content/` (modelo `ConteudoPagina`).
4. Registrar em `app/ferramentas/[slug]/implementacoes.tsx` e acrescentar o slug em `lib/tools/disponiveis.ts`.
5. Conferir o texto contra o original (palavra por palavra); correções aprovadas entram no código e em `DIVERGENCIAS.md`.

## Documentos
`DECISOES.md` (decisões e pendências) · `DIVERGENCIAS.md` (correções aprovadas e pendências) · `AUDITORIA_AJUSTE_DOSE.md` · `COMANDOS.md`
