'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { mensagemDeErro } from '@/lib/auth/mensagens';
import { emailValido } from '@/lib/auth/validacao';
import { createClient } from '@/lib/supabase/client';
import { BotaoPrimario } from '@/components/archetypes/CalculadoraLayout';
import Campo from '@/components/ui/Campo';
import CartaoAuth, { MensagemErro, MensagemInfo } from './CartaoAuth';

export default function FormEntrar() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('erro') === 'link') setErro('Esse link é inválido, expirou ou já foi usado. Peça um novo ou entre com seu e-mail e senha.');
    if (q.get('aviso') === 'conta-excluida') setAviso('Sua conta foi excluída.');
  }, []);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro('');
    if (!emailValido(email) || !senha) { setErro('Informe seu e-mail e sua senha.'); return; }
    setEnviando(true);
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password: senha });
    setEnviando(false);
    if (error) { setErro(mensagemDeErro(error)); return; }
    router.push('/conta');
    router.refresh();
  }

  return (
    <CartaoAuth titulo="Entrar" subtitulo="Acesse sua conta NephroSmart">
      <form onSubmit={enviar} noValidate>
        <MensagemInfo texto={aviso} />
        <MensagemErro texto={erro} />
        <Campo icone="envelope" type="email" autoComplete="email" inputMode="email" placeholder="E-mail" valor={email} onChange={setEmail} />
        <Campo icone="lock" type="password" autoComplete="current-password" placeholder="Senha" valor={senha} onChange={setSenha} />
        <div className="mt-4 flex"><BotaoPrimario type="submit" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</BotaoPrimario></div>
        <p className="mt-4 text-center text-sm" style={{ color: colors.text }}>
          <Link href="/recuperar-senha" className="underline">Esqueci minha senha</Link>
        </p>
        <p className="mt-2 text-center text-sm" style={{ color: colors.text }}>
          Ainda não tem conta? <Link href="/cadastro" className="font-semibold underline">Criar conta</Link>
        </p>
      </form>
    </CartaoAuth>
  );
}
