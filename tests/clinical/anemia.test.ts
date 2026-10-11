import { describe, expect, it } from 'vitest';
import { avaliarAnemia, type EntradaAnemia } from '@/lib/clinical/anemia';

const base: EntradaAnemia = {
  tipo: 'hd', hb: '', ferritina: '', tsat: '', emAee: false, aeeRecente: false, hbAnterior: '', semanas: '', infeccao: false,
  hipoResposta: false, suspeitaAplasia: false, malignidade: false, eventoCv: false, trombose: false, gravidez: false, hepatopatia: false,
};
const ids = (o: Partial<EntradaAnemia>) => { const r = avaliarAnemia({ ...base, ...o }); if (!r.ok) throw new Error(r.mensagem); return r.alertas.map((a) => a.id); };

describe('Anemia KDIGO 2026: casos de teste do documento da equipe', () => {
  it('HD; Hb 9,4; ferritina 250; TSAT 25% → considerar AEE e ferro', () => {
    expect(ids({ hb: '9,4', ferritina: '250', tsat: '25' })).toEqual(['ferro-iniciar', 'aee-iniciar']);
  });
  it('HD; ferritina 750; TSAT 20% → suspender ferro (ferritina > 700)', () => {
    const r = avaliarAnemia({ ...base, ferritina: '750', tsat: '20' });
    expect(r.ok && r.alertas[0].id).toBe('ferro-suspender');
    expect(r.ok && r.alertas[0].fonte).toContain('2.2');
  });
  it('HD; ferritina 400; TSAT 42% → suspender ferro (TSAT ≥ 40)', () => {
    expect(ids({ ferritina: '400', tsat: '42' })).toEqual(['ferro-suspender']);
  });
  it('AEE; Hb 11,7 → acima do alvo', () => {
    expect(ids({ hb: '11,7', emAee: true })).toEqual(['hb-acima']);
  });
  it('AEE iniciado; Hb 9,0 → 10,2 em 3 semanas → subida rápida', () => {
    const r = avaliarAnemia({ ...base, hb: '10,2', hbAnterior: '9', semanas: '3', emAee: true, aeeRecente: true });
    expect(r.ok && r.alertas.map((a) => a.id)).toEqual(['hb-subida']);
    expect(r.ok && r.alertas[0].texto).toContain('25–50%');
  });
});

describe('Anemia: limites das regras', () => {
  it('ferro HD: 500 e 30 entram; 501 ou 31 não', () => {
    expect(ids({ ferritina: '500', tsat: '30' })).toEqual(['ferro-iniciar']);
    expect(ids({ ferritina: '501', tsat: '30' })).toEqual(['ferro-sem-criterio']);
    expect(ids({ ferritina: '500', tsat: '31' })).toEqual(['ferro-sem-criterio']);
  });
  it('suspender: 700 não suspende (> 700); 40 suspende (≥ 40); 39,9 não', () => {
    expect(ids({ ferritina: '700', tsat: '30' })).toEqual(['ferro-sem-criterio']);
    expect(ids({ ferritina: '700,1', tsat: '30' })).toEqual(['ferro-suspender']);
    expect(ids({ ferritina: '400', tsat: '40' })).toEqual(['ferro-suspender']);
    expect(ids({ ferritina: '400', tsat: '39,9' })).toEqual(['ferro-sem-criterio']);
  });
  it('sem diálise: ferritina < 100 e TSAT < 40; ou 100 ≤ ferritina < 300 e TSAT < 25', () => {
    expect(ids({ tipo: 'nd', ferritina: '99', tsat: '39' })).toEqual(['ferro-iniciar']);
    expect(ids({ tipo: 'nd', ferritina: '99', tsat: '40' })).toEqual(['ferro-suspender']);
    expect(ids({ tipo: 'nd', ferritina: '100', tsat: '24' })).toEqual(['ferro-iniciar']);
    expect(ids({ tipo: 'nd', ferritina: '100', tsat: '25' })).toEqual(['ferro-sem-criterio']);
    expect(ids({ tipo: 'nd', ferritina: '299', tsat: '24' })).toEqual(['ferro-iniciar']);
    expect(ids({ tipo: 'nd', ferritina: '300', tsat: '24' })).toEqual(['ferro-sem-criterio']);
    expect(ids({ tipo: 'dp', ferritina: '250', tsat: '24' })).toEqual(['ferro-iniciar']);
  });
  it('o critério de HD (ferritina até 500, TSAT até 30) não vale sem hemodiálise', () => {
    expect(ids({ tipo: 'nd', ferritina: '400', tsat: '28' })).toEqual(['ferro-sem-criterio']);
    expect(ids({ tipo: 'dp', ferritina: '400', tsat: '28' })).toEqual(['ferro-sem-criterio']);
  });
  it('ferro IV é preferido só em HD', () => {
    const hd = avaliarAnemia({ ...base, ferritina: '200', tsat: '20' });
    expect(hd.ok && hd.alertas[0].texto).toContain('intravenoso em vez de oral');
    const nd = avaliarAnemia({ ...base, tipo: 'nd', ferritina: '50', tsat: '10' });
    expect(nd.ok && nd.alertas[0].texto).not.toContain('intravenoso em vez de oral');
  });
  it('início de AEE em diálise: Hb ≤ 10; 10,1 não; não se aplica se já em AEE nem sem diálise', () => {
    expect(ids({ hb: '10' })).toEqual(['aee-iniciar']);
    expect(ids({ hb: '10,1' })).toEqual([]);
    expect(ids({ tipo: 'dp', hb: '9' })).toEqual(['aee-iniciar']);
    expect(ids({ hb: '9', emAee: true })).toEqual([]);
    expect(ids({ tipo: 'nd', hb: '8' })).toEqual(['aee-nd']);
  });
  it('Hb-alvo: 11,5 alerta (≥), 11,4 não; só em uso de AEE', () => {
    expect(ids({ hb: '11,5', emAee: true })).toEqual(['hb-acima']);
    expect(ids({ hb: '11,4', emAee: true })).toEqual([]);
    expect(ids({ hb: '12' })).toEqual([]);
  });
  it('subida rápida: > 1,0 (1,0 não); até 4 semanas (5 não); exige AEE recente', () => {
    const e = { hb: '10', hbAnterior: '9', semanas: '3', emAee: true, aeeRecente: true };
    expect(ids(e)).toEqual([]);
    expect(ids({ ...e, hb: '10,1' })).toEqual(['hb-subida']);
    expect(ids({ ...e, hb: '10,1', semanas: '4' })).toEqual(['hb-subida']);
    expect(ids({ ...e, hb: '10,1', semanas: '4,1' })).toEqual([]);
    expect(ids({ ...e, hb: '10,1', aeeRecente: false })).toEqual([]);
    expect(ids({ ...e, hb: '10,1', emAee: false })).toEqual([]);
  });
  it('infecção: alerta com ou sem exames de ferro', () => {
    expect(ids({ infeccao: true })).toEqual(['ferro-infeccao']);
    expect(ids({ infeccao: true, ferritina: '300', tsat: '20' })).toEqual(['ferro-iniciar', 'ferro-infeccao']);
    const r = avaliarAnemia({ ...base, infeccao: true });
    expect(r.ok && r.alertas[0].texto).toContain('sem grau');
  });
  it('hiporresponsividade e aplasia', () => {
    const r = avaliarAnemia({ ...base, hipoResposta: true, suspeitaAplasia: true });
    expect(r.ok && r.alertas.map((a) => a.id)).toEqual(['hipo', 'prca']);
    expect(r.ok && r.alertas[0].texto).toContain('não define um corte único de dose');
    expect(r.ok && r.alertas[1].nivel).toBe('perigo');
    expect(r.ok && r.alertas[1].fonte).toContain('3.7.6');
  });
  it('HIF-PHI: não usar (3.7.5), gravidez e hepatopatia em níveis diferentes', () => {
    const r = avaliarAnemia({ ...base, malignidade: true, trombose: true });
    expect(r.ok && r.alertas[0]).toMatchObject({ id: 'hif-nao', nivel: 'perigo' });
    expect(r.ok && r.alertas[0].texto).toContain('malignidade ativa, trombose vascular recente');
    expect(ids({ eventoCv: true })).toEqual(['hif-nao']);
    expect(ids({ gravidez: true })).toEqual(['hif-gravidez']);
    const h = avaliarAnemia({ ...base, hepatopatia: true });
    expect(h.ok && h.alertas[0].nivel).toBe('atencao');
    expect(ids({})).toEqual([]);
  });
});

describe('Anemia: validação', () => {
  const erro = (o: Partial<EntradaAnemia>) => avaliarAnemia({ ...base, ...o });
  it('tipo é obrigatório', () => {
    const r = erro({ tipo: '' });
    expect(!r.ok && r.campos).toEqual(['tipo']);
    expect(!r.ok && r.mensagem).toBe('Escolha o tipo de paciente');
  });
  it('faixas', () => {
    expect(erro({ hb: '2,9' }).ok).toBe(false);
    expect(erro({ hb: '3' }).ok).toBe(true);
    expect(erro({ hb: '25' }).ok).toBe(true);
    expect(erro({ hb: '25,1' }).ok).toBe(false);
    expect(erro({ ferritina: '0' }).ok).toBe(false);
    expect(erro({ ferritina: '1' }).ok).toBe(true);
    expect(erro({ ferritina: '10000' }).ok).toBe(true);
    expect(erro({ ferritina: '10001' }).ok).toBe(false);
    expect(erro({ tsat: '0' }).ok).toBe(false);
    expect(erro({ tsat: '100' }).ok).toBe(true);
    expect(erro({ tsat: '101' }).ok).toBe(false);
    expect(erro({ hb: '10', hbAnterior: '9', semanas: '0,4' }).ok).toBe(false);
    expect(erro({ hb: '10', hbAnterior: '9', semanas: '0,5' }).ok).toBe(true);
    expect(erro({ hb: '10', hbAnterior: '9', semanas: '52' }).ok).toBe(true);
    expect(erro({ hb: '10', hbAnterior: '9', semanas: '53' }).ok).toBe(false);
  });
  it('Hb anterior e semanas andam juntas e exigem a Hb atual', () => {
    const a = erro({ hb: '10', hbAnterior: '9' });
    expect(!a.ok && a.campos).toEqual(['semanas']);
    const b = erro({ hb: '10', semanas: '3' });
    expect(!b.ok && b.campos).toEqual(['hbAnterior']);
    const c = erro({ hbAnterior: '9', semanas: '3' });
    expect(!c.ok && c.campos).toEqual(['hb']);
  });
  it('sem nenhum dado e sem marcações: nenhuma regra se aplica (ok, lista vazia)', () => {
    const r = erro({});
    expect(r.ok && r.alertas).toEqual([]);
  });
  it('só ferritina ou só TSAT: sem regra de ferro; erro de tipo junto de outro erro mostra a mensagem genérica', () => {
    expect(ids({ ferritina: '800' })).toEqual([]);
    expect(ids({ tsat: '45' })).toEqual([]);
    const r = erro({ tipo: '', hb: '1' });
    expect(!r.ok && r.mensagem).toBe('Preencha os campos destacados com valores válidos');
  });
});
