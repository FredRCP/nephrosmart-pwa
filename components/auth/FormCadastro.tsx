'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { VERSAO_PRIVACIDADE, VERSAO_TERMOS } from '@/lib/legal/versoes';
import { mensagemDeErro } from '@/lib/auth/mensagens';
import { validarCadastro } from '@/lib/auth/validacao';
import { createClient } from '@/lib/supabase/client';
import { BotaoPrimario } from '@/components/archetypes/CalculadoraLayout';
import Campo from '@/components/ui/Campo';
import CartaoAuth, { MensagemErro, MensagemInfo } from './CartaoAuth';

export default function FormCadastro() {
  const { colors } = useTheme();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [aceite, setAceite] = useState(false);
  const [erro, setErro] = useState('');
  const [enviado, setEnviado] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro('');
    const problema = validarCadastro({ nome, email, senha, confirmacao, aceite });
    if (problema) { setErro(problema); return; }
    setEnviando(true);
    const { error } = await createClient().auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/conta`,
        // o banco grava o aceite (com as versões vistas pelo usuário) assim que a conta é criada
        data: { nome: nome.trim(), versao_termos: VERSAO_TERMOS, versao_privacidade: VERSAO_PRIVACIDADE },
      },
    });
    setEnviando(false);
    if (error) { setErro(mensagemDeErro(error)); return; }
    // Mesma resposta para e-mail novo ou já cadastrado: não revela quem tem conta.
    setEnviado(email.trim());
  }

  if (enviado) {
    return (
      <CartaoAuth titulo="Confirme seu e-mail">
        <MensagemInfo texto={`Se ${enviado} puder receber uma conta, enviamos uma mensagem com o link de confirmação. Abra o link neste mesmo aparelho e navegador (e olhe o spam). Depois de confirmar, seu cadastro será liberado pelo responsável pelo app.`} />
        <p className="text-center text-sm" style={{ color: colors.text }}>
          <Link href="/entrar" className="font-semibold underline">Ir para Entrar</Link>
        </p>
      </CartaoAuth>
    );
  }

  return (
    <CartaoAuth titulo="Criar conta" subtitulo="Para médicos e profissionais de saúde habilitados">
      <form onSubmit={enviar} noValidate>
        <MensagemErro texto={erro} />
        <Campo icone="user" autoComplete="name" placeholder="Nome (opcional)" valor={nome} onChange={setNome} />
        <Campo icone="envelope" type="email" autoComplete="email" inputMode="email" placeholder="E-mail" valor={email} onChange={setEmail} />
        <Campo icone="lock" type="password" autoComplete="new-password" placeholder="Senha (mínimo 8 caracteres)" valor={senha} onChange={setSenha} />
        <Campo icone="lock" type="password" autoComplete="new-password" placeholder="Repita a senha" valor={confirmacao} onChange={setConfirmacao} />
        <label className="mt-1 flex cursor-pointer items-start gap-2 text-sm" style={{ color: colors.text }}>
          <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} className="mt-0.5 size-5 shrink-0" />
          <span>
            Li e aceito os <Link href="/termodeuso" target="_blank" className="underline">Termos de Uso</Link> e
            a <Link href="/privacidade" target="_blank" className="underline">Política de Privacidade</Link>.
          </span>
        </label>
        <div className="mt-5 flex"><BotaoPrimario type="submit" disabled={enviando}>{enviando ? 'Criando…' : 'Criar conta'}</BotaoPrimario></div>
        <p className="mt-4 text-center text-sm" style={{ color: colors.text }}>
          Já tem conta? <Link href="/entrar" className="font-semibold underline">Entrar</Link>
        </p>
      </form>
    </CartaoAuth>
  );
}
