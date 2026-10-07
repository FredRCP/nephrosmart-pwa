'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { mensagemDeErro } from '@/lib/auth/mensagens';
import { validarSenha } from '@/lib/auth/validacao';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { BotaoPrimario } from '@/components/archetypes/CalculadoraLayout';
import Campo from '@/components/ui/Campo';
import CartaoAuth, { MensagemErro, MensagemInfo } from './CartaoAuth';

export default function FormRedefinir() {
  const { colors } = useTheme();
  const [sessao, setSessao] = useState<'verificando' | 'ok' | 'sem'>('verificando');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [pronto, setPronto] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    createClient().auth.getSession().then(({ data }) => setSessao(data.session ? 'ok' : 'sem'));
  }, []);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro('');
    const problema = validarSenha(senha);
    if (problema) { setErro(problema); return; }
    if (senha !== confirmacao) { setErro('A confirmação da senha não confere.'); return; }
    setEnviando(true);
    const { error } = await createClient().auth.updateUser({ password: senha });
    setEnviando(false);
    if (error) { setErro(mensagemDeErro(error)); return; }
    setPronto(true);
  }

  return (
    <CartaoAuth titulo="Nova senha">
      {pronto ? (
        <>
          <MensagemInfo texto="Senha alterada com sucesso." />
          <p className="text-center text-sm" style={{ color: colors.text }}><Link href="/conta" className="font-semibold underline">Ir para minha conta</Link></p>
        </>
      ) : sessao === 'sem' ? (
        <>
          <MensagemErro texto="Esse link expirou ou não foi aberto no mesmo aparelho e navegador em que você pediu a recuperação." />
          <p className="text-center text-sm" style={{ color: colors.text }}><Link href="/recuperar-senha" className="font-semibold underline">Pedir um novo link</Link></p>
        </>
      ) : (
        <form onSubmit={enviar} noValidate>
          <MensagemErro texto={erro} />
          <Campo icone="lock" type="password" autoComplete="new-password" placeholder="Nova senha (mínimo 8 caracteres)" valor={senha} onChange={setSenha} />
          <Campo icone="lock" type="password" autoComplete="new-password" placeholder="Repita a nova senha" valor={confirmacao} onChange={setConfirmacao} />
          <div className="mt-4 flex"><BotaoPrimario type="submit" disabled={enviando || sessao === 'verificando'}>{enviando ? 'Salvando…' : 'Salvar nova senha'}</BotaoPrimario></div>
        </form>
      )}
    </CartaoAuth>
  );
}
