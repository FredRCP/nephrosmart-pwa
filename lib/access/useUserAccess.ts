'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../supabase/client';
import { isSupabaseConfigured } from '../supabase/env';
import { planoEfetivo, type PerfilAcesso } from './plano';
import { PlanType, PREMIUM_ENABLED } from './plans';

interface UserAccessState {
  loading: boolean;
  plan: PlanType;
  userId: string | null;
}

/**
 * Plano do usuário logado.
 * Com PREMIUM_ENABLED = false, quem estiver logado tem acesso total ('premium').
 */
export function useUserAccess(): UserAccessState {
  const [state, setState] = useState<UserAccessState>({ loading: true, plan: 'free', userId: null });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setState({ loading: false, plan: PREMIUM_ENABLED ? 'free' : 'premium', userId: null });
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return setState({ loading: false, plan: 'free', userId: null });
      if (!PREMIUM_ENABLED) return setState({ loading: false, plan: 'premium', userId: user.id });

      // Com o paywall ligado: lê o perfil real (profiles: plano, ativo, beta_expira) e aplica a regra de validade.
      const { data } = await supabase.from('profiles').select('plano, ativo, beta_expira').eq('id', user.id).single();
      setState({ loading: false, plan: planoEfetivo(data as PerfilAcesso | null), userId: user.id });
    });
  }, []);

  return state;
}
