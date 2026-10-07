'use client';

import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from 'react';
import { planoEfetivo, type PerfilAcesso } from '@/lib/access/plano';
import type { PlanType } from '@/lib/access/plans';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { gravarLocal, lerJson } from '@/lib/storage';

export interface Sessao {
  configurado: boolean;
  carregando: boolean;
  email: string | null;
  nome: string | null;
  /** Plano que vale HOJE (já considera conta não liberada e beta vencido). */
  plano: PlanType;
  ativo: boolean;
  betaExpira: string | null;
}

const CHAVE_CACHE = 'perfilCache';
export const EVENTO_PERFIL = 'nephrosmart:perfil';

interface PerfilCache extends PerfilAcesso { email: string; nome: string | null }

const SEM_LOGIN: Sessao = { configurado: isSupabaseConfigured, carregando: false, email: null, nome: null, plano: 'free', ativo: false, betaExpira: null };

function daqui(p: PerfilCache): Sessao {
  return { configurado: true, carregando: false, email: p.email, nome: p.nome, plano: planoEfetivo(p), ativo: p.ativo, betaExpira: p.beta_expira };
}

function useSessaoInterna(ligado: boolean): Sessao {
  const [estado, setEstado] = useState<Sessao>({ ...SEM_LOGIN, carregando: isSupabaseConfigured && ligado });

  useEffect(() => {
    if (!ligado || !isSupabaseConfigured) return;
    const supabase = createClient();
    let vivo = true;

    async function aplicarUsuario(user: { id: string; email?: string | null } | null) {
      if (!user) {
        gravarLocal(CHAVE_CACHE, '');
        if (vivo) setEstado({ ...SEM_LOGIN, configurado: true });
        return;
      }
      const email = user.email ?? '';
      // mostra na hora o que já se sabe deste aparelho (funciona sem internet) e atualiza em seguida
      const cache = lerJson<PerfilCache | null>(CHAVE_CACHE, null);
      if (vivo) setEstado(cache && cache.email === email ? daqui(cache) : { ...SEM_LOGIN, configurado: true, email });
      const { data, error } = await supabase.from('profiles').select('nome, plano, ativo, beta_expira').eq('id', user.id).single();
      if (!vivo || error || !data) return;
      const novo: PerfilCache = { email, nome: data.nome ?? null, plano: data.plano, ativo: data.ativo, beta_expira: data.beta_expira ?? null };
      gravarLocal(CHAVE_CACHE, JSON.stringify(novo));
      setEstado(daqui(novo));
    }

    supabase.auth.getSession().then(({ data }) => aplicarUsuario(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_evento, sessao) => { void aplicarUsuario(sessao?.user ?? null); });
    const recarregar = () => { supabase.auth.getSession().then(({ data: d }) => aplicarUsuario(d.session?.user ?? null)); };
    window.addEventListener(EVENTO_PERFIL, recarregar);
    return () => { vivo = false; data.subscription.unsubscribe(); window.removeEventListener(EVENTO_PERFIL, recarregar); };
  }, [ligado]);

  return estado;
}

const SessaoContexto = createContext<Sessao | null>(null);

/** Uma única verificação de login para o app inteiro (menu, Home e menu azul compartilham o resultado). */
export function SessaoProvider({ children }: { children: ReactNode }) {
  const sessao = useSessaoInterna(true);
  return createElement(SessaoContexto.Provider, { value: sessao }, children);
}

/** Situação do login. Dentro do SessaoProvider reaproveita o resultado; fora dele (testes), funciona sozinho. */
export function useSessao(): Sessao {
  const doContexto = useContext(SessaoContexto);
  const proprio = useSessaoInterna(doContexto === null);
  return doContexto ?? proprio;
}
