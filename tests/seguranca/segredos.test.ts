// Barreira contra o erro que de fato seria grave: uma chave SECRETA (service_role / sb_secret_) parar no código.
// A URL e a chave pública (anon/publishable) do Supabase PODEM aparecer no navegador: quem protege os dados é a RLS.
// As mensagens de falha mostram só o caminho do arquivo, nunca o conteúdo da chave.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const RAIZ = process.cwd();
const IGNORAR = new Set(['node_modules', '.next', '.git', '.vercel', 'coverage']);
const EXTENSOES = /\.(ts|tsx|js|mjs|cjs|json|md|sql|css|txt|ps1|yml|yaml)$|(^|[\\/])\.env[^\\/]*$/i;
const ESTE_ARQUIVO = join('tests', 'seguranca', 'segredos.test.ts');

function arquivos(dir: string, acc: string[] = []): string[] {
  for (const nome of readdirSync(dir)) {
    if (IGNORAR.has(nome)) continue;
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) arquivos(caminho, acc);
    else if (EXTENSOES.test(caminho) && relative(RAIZ, caminho) !== ESTE_ARQUIVO && nome !== 'package-lock.json') acc.push(caminho);
  }
  return acc;
}

const lista = arquivos(RAIZ);
const rel = (f: string) => relative(RAIZ, f).replace(/\\/g, '/');

function papelDoJwt(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8'));
    return typeof payload.role === 'string' ? payload.role : null;
  } catch { return null; }
}

describe('nenhuma chave secreta no projeto', () => {
  it('varre os arquivos do projeto (inclusive .env locais)', () => {
    expect(lista.length).toBeGreaterThan(50);
  });

  it('nenhum JWT com papel de administrador (service_role)', () => {
    const culpados: string[] = [];
    for (const f of lista) {
      const tokens = readFileSync(f, 'utf-8').match(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g) ?? [];
      if (tokens.some((t) => ['service_role', 'supabase_admin', 'postgres'].includes(papelDoJwt(t) ?? ''))) culpados.push(rel(f));
    }
    expect(culpados, 'arquivos com chave de administrador').toEqual([]);
  });

  it('nenhuma "secret key" nova do Supabase (sb_secret_...)', () => {
    const culpados = lista.filter((f) => /sb_secret_[A-Za-z0-9_-]{10,}/.test(readFileSync(f, 'utf-8'))).map(rel);
    expect(culpados, 'arquivos com sb_secret_').toEqual([]);
  });

  it('nenhuma variável NEXT_PUBLIC_ com nome de chave secreta (ela iria para o navegador)', () => {
    const culpados = lista.filter((f) => /NEXT_PUBLIC_[A-Z0-9_]*(SERVICE|SECRET|PRIVATE|PASSWORD)/i.test(readFileSync(f, 'utf-8'))).map(rel);
    expect(culpados, 'arquivos com NEXT_PUBLIC_ suspeita').toEqual([]);
  });

  it('chave privada ou senha de banco colada em arquivo', () => {
    const culpados = lista.filter((f) => /-----BEGIN [A-Z ]*PRIVATE KEY-----|postgres(ql)?:\/\/[^:\s]+:[^@\s]{4,}@/.test(readFileSync(f, 'utf-8'))).map(rel);
    expect(culpados, 'arquivos com chave privada/senha de banco').toEqual([]);
  });

  it('o .gitignore impede que .env e .vercel sejam enviados ao GitHub', () => {
    const gi = readFileSync(join(RAIZ, '.gitignore'), 'utf-8').split(/\r?\n/).map((l) => l.trim());
    expect(gi).toContain('.env*');
    expect(gi).toContain('.vercel');
    expect(gi).toContain('!.env.local.example'); // só o modelo sem valores é versionado
  });

  it('o modelo .env.local.example não traz valores reais', () => {
    const modelo = readFileSync(join(RAIZ, '.env.local.example'), 'utf-8');
    expect(modelo).not.toMatch(/eyJ[A-Za-z0-9_-]{10,}/);
    expect(modelo).not.toMatch(/sb_(publishable|secret)_[A-Za-z0-9]{6,}/);
  });
});
