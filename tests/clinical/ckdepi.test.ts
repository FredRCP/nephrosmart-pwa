import { describe, expect, it } from 'vitest';
import { AVISO_PEDIATRICO, calcularCkdEpi, classificarDRC, tfgCkdEpi2021, type EntradaCkdEpi } from '@/lib/clinical/ckdepi';
// @ts-expect-error módulo JS de referência (lógica original do app)
import { ckdepiOriginal, gradeCkdEpi } from '../golden/original.mjs';

const base: EntradaCkdEpi = { creatinina: '1', idade: '50', sexo: 'm', altura: '', peso: '', drc: false, acr: '' };
const num = (t: string) => parseFloat(t.replace(',', '.').trim());
const dentro = (n: number, a: number, b: number) => !isNaN(n) && n >= a && n <= b;

/** Motivos aprovados (CKD-2) pelos quais o NOVO recusa algo que o ORIGINAL aceitava. Implementação independente. */
function motivoDeRecusa(e: EntradaCkdEpi): boolean {
  const cr = num(e.creatinina);
  const idade = parseInt(e.idade);
  const temAntropo = e.altura.trim() !== '' || e.peso.trim() !== '';
  const antropoValida = dentro(num(e.altura), 50, 250) && dentro(num(e.peso), 1, 500);
  return !dentro(cr, 0.1, 30) || !dentro(idade, 1, 120) || (temAntropo && !antropoValida);
}

describe('CKD-EPI 2021 — novo x original (com divergências aprovadas CKD-1/2/3)', () => {
  it(`concorda com o original em ${gradeCkdEpi.length} entradas, exceto pelas recusas aprovadas`, () => {
    for (const e of gradeCkdEpi) {
      const orig = ckdepiOriginal({ ...e, isRenalCronico: e.drc });
      const novo = calcularCkdEpi(e);
      const ctx = JSON.stringify(e);

      if (!orig.ok) {
        // inválido no original → continua inválido, mesma mensagem e mesmos campos marcados
        expect(novo.ok, ctx).toBe(false);
        if (!novo.ok) {
          expect(novo.mensagem, ctx).toBe(orig.mensagem);
          expect([novo.erroCreatinina, novo.erroIdade, novo.erroSexo], ctx).toEqual([orig.erroCreatinina, orig.erroIdade, orig.erroSexo]);
        }
      } else if (novo.ok) {
        // aceito nos dois → resultado idêntico (os campos novos são apenas acréscimos)
        expect(motivoDeRecusa(e), ctx).toBe(false);
        const { avisos, tipoParaAjuste, ...compartilhado } = novo;
        expect(compartilhado, ctx).toEqual(orig);
        expect(tipoParaAjuste, ctx).toBe(orig.gfrAbsoluto ? 'absoluto' : 'indexado');
        expect(Array.isArray(avisos)).toBe(true);
      } else {
        // o original aceitava e o novo recusa → só vale pelos motivos aprovados
        expect(motivoDeRecusa(e), ctx).toBe(true);
      }
    }
  });

  // Conferidos à mão (calculadora), não são valores tabelados da publicação:
  // mulher: 142 × (1,0/0,7)^-1,2 × 0,9938^50 × 1,012 = 68,6
  it('mulher, 50 anos, creatinina 1,0 mg/dL ≈ 68,6', () => {
    expect(tfgCkdEpi2021(1.0, 50, 'f')).toBeCloseTo(68.6, 1);
  });
  // homem: 142 × (1,0/0,9)^-1,2 × 0,9938^50 = 91,7
  it('homem, 50 anos, creatinina 1,0 mg/dL ≈ 91,7', () => {
    expect(tfgCkdEpi2021(1.0, 50, 'm')).toBeCloseTo(91.7, 1);
  });
  it('estadiamento G/A', () => {
    expect(classificarDRC(95, 10)).toBe('G1 A1');
    expect(classificarDRC(44.9, 300)).toBe('G3b A2');
    expect(classificarDRC(10, 301)).toBe('G5 A3');
  });

  describe('CKD-1: menor de 18 anos', () => {
    it('calcula, mas avisa e aponta o Clearance Pediátrico', () => {
      const r = calcularCkdEpi({ ...base, idade: '12' });
      expect(r.ok && r.avisos).toContain(AVISO_PEDIATRICO);
    });
    it('18 anos não gera o aviso', () => {
      const r = calcularCkdEpi({ ...base, idade: '18' });
      expect(r.ok && r.avisos.includes(AVISO_PEDIATRICO)).toBe(false);
    });
  });

  describe('CKD-2: faixas de plausibilidade', () => {
    it('idade acima de 120 é recusada', () => {
      const r = calcularCkdEpi({ ...base, idade: '200' });
      expect(r.ok).toBe(false);
      expect(!r.ok && r.erroIdade).toBe(true);
      expect(!r.ok && r.mensagem).toBe('Idade fora da faixa esperada (1 a 120 anos).');
    });
    it('creatinina em µmol/L (ex.: 88) é recusada com orientação de unidade', () => {
      const r = calcularCkdEpi({ ...base, creatinina: '88' });
      expect(!r.ok && r.erroCreatinina).toBe(true);
      expect(!r.ok && r.mensagem).toContain('µmol/L');
      expect(!r.ok && r.mensagem).toContain('88,4');
    });
    it('limites aceitos: creatinina 0,1 e 30; idade 1 e 120', () => {
      expect(calcularCkdEpi({ ...base, creatinina: '0,1' }).ok).toBe(true);
      expect(calcularCkdEpi({ ...base, creatinina: '30' }).ok).toBe(true);
      expect(calcularCkdEpi({ ...base, idade: '1' }).ok).toBe(true);
      expect(calcularCkdEpi({ ...base, idade: '120' }).ok).toBe(true);
      expect(calcularCkdEpi({ ...base, creatinina: '0.09' }).ok).toBe(false);
      expect(calcularCkdEpi({ ...base, creatinina: '30.1' }).ok).toBe(false);
    });
    it('idade decimal ("45,9") calcula como 45 e AVISA', () => {
      const r = calcularCkdEpi({ ...base, idade: '45,9' });
      expect(r.ok && r.avisos).toContain('Idade considerada como 45 anos (a parte decimal é ignorada).');
      expect(r.ok && r.gfrIndexado).toBeCloseTo(tfgCkdEpi2021(1, 45, 'm'), 10);
    });
    it('creatinina incomum gera aviso mas calcula', () => {
      const r = calcularCkdEpi({ ...base, creatinina: '0.3' });
      expect(r.ok && r.avisos).toContain('Valor de creatinina incomum: confira se está em mg/dL.');
    });
    it('altura/peso inválidos no valor desindexado não são mais ignorados em silêncio', () => {
      const r = calcularCkdEpi({ ...base, altura: '1,70', peso: '70' }); // altura em metros por engano
      expect(r.ok).toBe(false);
      expect(!r.ok && r.erroAltura).toBe(true);
      expect(!r.ok && r.erroPeso).toBe(false);
      const so = calcularCkdEpi({ ...base, altura: '170', peso: '' });
      expect(!so.ok && so.erroPeso).toBe(true);
    });
    it('altura e peso em branco continuam permitidos (só valor indexado)', () => {
      const r = calcularCkdEpi(base);
      expect(r.ok && r.gfrAbsoluto).toBeUndefined();
    });
  });

  describe('CKD-3: indexado x absoluto', () => {
    it('sem altura/peso → envia o INDEXADO ao Ajuste de Dose', () => {
      const r = calcularCkdEpi(base);
      expect(r.ok && r.tipoParaAjuste).toBe('indexado');
      expect(r.ok && r.valorParaAjuste).toBe('91.7');
    });
    it('com altura e peso → envia o ABSOLUTO', () => {
      const r = calcularCkdEpi({ ...base, sexo: 'f', altura: '160', peso: '60' });
      expect(r.ok && r.tipoParaAjuste).toBe('absoluto');
      expect(r.ok && r.valorParaAjuste).toBe('64.4');
    });
  });
});
