/** Mesma regra do app original (App.tsx, getGreeting): 6h–11h59 bom dia · 12h–17h59 boa tarde · resto boa noite. */
export function saudacaoPara(data: Date): 'Bom dia' | 'Boa tarde' | 'Boa noite' {
  const hora = data.getHours();
  if (hora >= 6 && hora < 12) return 'Bom dia';
  if (hora >= 12 && hora < 18) return 'Boa tarde';
  return 'Boa noite';
}
