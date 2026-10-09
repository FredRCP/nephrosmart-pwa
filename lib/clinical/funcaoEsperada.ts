// Função renal esperada para a idade (Onda 2). Referência POPULACIONAL e educacional: 140 − idade (mL/min/1,73 m²).
// Não substitui a TFG estimada por creatinina/cistatina (CKD-EPI). Válida para adultos.
export const FAIXA_IDADE_ADULTO = { min: 18, max: 120 } as const;

export interface ResultadoEsperada { ok: true; valor: number; interpretacao: string; texto: string; avisos: string[] }
export interface ErroEsperada { ok: false; mensagem: string }

export function calcularFuncaoEsperada(idadeTexto: string): ResultadoEsperada | ErroEsperada {
  const idade = parseFloat(String(idadeTexto).replace(',', '.'));
  if (!Number.isFinite(idade) || idade <= 0 || idade > FAIXA_IDADE_ADULTO.max) {
    return { ok: false, mensagem: 'Informe uma idade válida (entre 18 e 120 anos)' };
  }
  if (idade < FAIXA_IDADE_ADULTO.min) {
    return { ok: false, mensagem: 'Fórmula válida apenas para adultos (≥ 18 anos). Para crianças use o Clearance Pediátrico' };
  }
  const valor = Math.round((140 - idade) * 10) / 10;
  let interpretacao: string;
  if (idade < 30) interpretacao = 'Adultos jovens (< 30 anos): geralmente acima de 110 mL/min/1,73 m².';
  else if (idade <= 50) interpretacao = 'Adultos de 30 a 50 anos: geralmente entre 90 e 110 mL/min/1,73 m².';
  else if (idade <= 70) interpretacao = 'Adultos de 51 a 70 anos: geralmente entre 70 e 90 mL/min/1,73 m².';
  else interpretacao = 'Idosos (> 70 anos): geralmente abaixo de 70 mL/min/1,73 m².';
  const texto = `TFG esperada ≈ ${String(valor).replace('.', ',')} mL/min/1,73 m²\n${interpretacao}`;
  return {
    ok: true, valor, interpretacao, texto,
    avisos: ['Estimativa populacional aproximada: não substitui a TFG calculada com creatinina ou cistatina (CKD-EPI).'],
  };
}
