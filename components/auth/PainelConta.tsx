'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { planoEfetivo, type PerfilAcesso } from '@/lib/access/plano';
import { PLANS } from '@/lib/access/plans';
import { mensagemDeErro } from '@/lib/auth/mensagens';
import { EVENTO_PERFIL } from '@/lib/auth/useSessao';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { BotaoPrimario, BotaoSecundario } from '@/components/archetypes/CalculadoraLayout';
import Campo from '@/components/ui/Campo';
import CartaoAuth, { MensagemErro, MensagemInfo } from './CartaoAuth';

interface Perfil extends PerfilAcesso { nome: string | null }

const dataBR = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR');

export default function PainelConta() {
  const router = useRouter();
  const { colors } = useTheme();
  const [carregando, setCarregando] = useState(true);
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [nome, setNome] = useState('');
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/entrar'); return; }
      setUserId(user.id);
      setEmail(user.email ?? '');
      const { data, error } = await supabase.from('profiles').select('nome, plano, ativo, beta_expira').eq('id', user.id).single();
      if (error || !data) setErro('Não foi possível carregar seu perfil agora.');
      else { setPerfil(data as Perfil); setNome((data as Perfil).nome ?? ''); }
      setCarregando(false);
    })();
  }, [router]);

  async function salvarNome(e: FormEvent) {
    e.preventDefault();
    setMsg(''); setErro('');
    const { error } = await createClient().from('profiles').update({ nome: nome.trim() || null }).eq('id', userId);
    if (error) setErro('Não foi possível salvar o nome.');
    else { setMsg('Nome salvo.'); window.dispatchEvent(new Event(EVENTO_PERFIL)); }
  }

  async function sair() {
    await createClient().auth.signOut();
    router.push('/');
    router.refresh();
  }

  async function excluir() {
    setErro(''); setExcluindo(true);
    const supabase = createClient();
    const { error } = await supabase.rpc('excluir_minha_conta');
    if (error) { setExcluindo(false); setErro(mensagemDeErro(error)); return; }
    await supabase.auth.signOut({ scope: 'local' }); // a conta já não existe no servidor: só limpa a sessão do aparelho
    router.push('/entrar?aviso=conta-excluida');
    router.refresh();
  }

  const efetivo = perfil ? planoEfetivo(perfil) : 'free';
  const situacao = !perfil ? '' : !perfil.ativo
    ? 'Cadastro recebido: aguardando liberação pelo responsável pelo app.'
    : perfil.plano === 'beta' && efetivo === 'free' && perfil.beta_expira
      ? `Seu período beta terminou em ${dataBR(perfil.beta_expira)}.`
      : `Plano ${PLANS[efetivo].label}${perfil.plano === 'beta' && perfil.beta_expira ? `, válido até ${dataBR(perfil.beta_expira)}` : ''}.`;

  return (
    <CartaoAuth titulo="Minha conta">
      {carregando && !erro ? (
        <p role="status" className="text-center text-sm" style={{ color: colors.text }}>Carregando…</p>
      ) : (
        <>
          <MensagemErro texto={erro} />
          <MensagemInfo texto={msg} />
          <p className="text-sm" style={{ color: colors.text, opacity: 0.7 }}>E-mail</p>
          <p className="mb-4 font-semibold" style={{ color: colors.text }}>{email}</p>

          {perfil && (
            <>
              <p className="mb-4 rounded-lg p-3 text-sm font-semibold" data-testid="situacao"
                style={{ color: colors.text, backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}` }}>{situacao}</p>
              <form onSubmit={salvarNome}>
                <Campo icone="user" autoComplete="name" placeholder="Nome" maxLength={120} valor={nome} onChange={setNome} />
                <div className="flex"><BotaoPrimario type="submit">Salvar nome</BotaoPrimario></div>
              </form>
            </>
          )}

          <div className="mt-4 flex"><BotaoSecundario type="button" onClick={sair}>Sair da conta</BotaoSecundario></div>

          <section className="mt-8 rounded-xl p-4" style={{ border: `1px solid ${colors.inputError}` }} aria-labelledby="titulo-excluir">
            <h2 id="titulo-excluir" className="font-bold" style={{ color: colors.inputError }}>Excluir minha conta</h2>
            <p className="mt-1 text-sm" style={{ color: colors.text }}>
              Apaga a conta, o perfil e o registro de aceite dos termos. <strong>Não pode ser desfeito.</strong>{' '}
              Para continuar, digite <strong>EXCLUIR</strong>.
            </p>
            <div className="mt-3">
              <Campo icone="lock" placeholder="Digite EXCLUIR" autoComplete="off" valor={confirmacao} onChange={setConfirmacao} />
            </div>
            <button type="button" onClick={excluir} disabled={confirmacao !== 'EXCLUIR' || excluindo}
              className="w-full rounded-xl px-4 py-3 font-semibold text-white disabled:opacity-40" style={{ backgroundColor: colors.inputError }}>
              {excluindo ? 'Excluindo…' : 'Excluir definitivamente'}
            </button>
            <p className="mt-3 text-xs" style={{ color: colors.text, opacity: 0.7 }}>
              Mais informações em <Link href="/excluir-conta" className="underline">Excluir Conta</Link>.
            </p>
          </section>
        </>
      )}
    </CartaoAuth>
  );
}
