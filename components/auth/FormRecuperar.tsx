'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { mensagemDeErro } from '@/lib/auth/mensagens';
import { emailValido } from '@/lib/auth/validacao';
import { createClient } from '@/lib/supabase/client';
import { BotaoPrimario } from '@/components/archetypes/CalculadoraLayout';
import Campo from '@/components/ui/Campo';
import CartaoAuth, { MensagemErro, MensagemInfo } from './CartaoAuth';

export default function FormRecuperar() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro('');
    if (!emailValido(email)) { setErro('Informe um e-mail válido.'); return; }
    setEnviando(true);
    const { error } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
    });
    setEnviando(false);
    // Só mostra erro de limite/conexão; para o resto a resposta é sempre a mesma (não revela quem tem conta).
    if (error && (error.status === 429 || /rate|fetch|network/i.test(`${error.code} ${error.message}`))) { setErro(mensagemDeErro(error)); return; }
    setEnviado(true);
  }

  return (
    <CartaoAuth titulo="Recuperar senha" subtitulo="Enviaremos um link para criar uma nova senha">
      {enviado ? (
        <>
          <MensagemInfo texto="Se esse e-mail estiver cadastrado, enviamos o link para criar uma nova senha. Abra-o neste mesmo aparelho e navegador (e olhe o spam)." />
          <p className="text-center text-sm" style={{ color: colors.text }}><Link href="/entrar" className="font-semibold underline">Voltar para Entrar</Link></p>
        </>
      ) : (
        <form onSubmit={enviar} noValidate>
          <MensagemErro texto={erro} />
          <Campo icone="envelope" type="email" autoComplete="email" inputMode="email" placeholder="E-mail" valor={email} onChange={setEmail} />
          <div className="mt-4 flex"><BotaoPrimario type="submit" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar link'}</BotaoPrimario></div>
          <p className="mt-4 text-center text-sm" style={{ color: colors.text }}><Link href="/entrar" className="underline">Voltar</Link></p>
        </form>
      )}
    </CartaoAuth>
  );
}
