'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { avaliarLitiase, FARMACOS_LITOGENICOS, type Composicao, type EntradaLitiase, type ResultadoLitiase, type Sexo } from '@/lib/clinical/litiase';
import { normalizarNumero } from '@/lib/clinical/numeros';
import { BotaoPrimario, BotaoSecundario } from '@/components/archetypes/CalculadoraLayout';
import Campo from '@/components/ui/Campo';
import Icone from '@/components/ui/Icone';
import Seletor from '@/components/ui/Seletor';

const VAZIO: EntradaLitiase = {
  sexo: '', composicao: '', hu: '', volume: '', calcio: '', oxalato: '', citrato: '', acidoUrico: '', sodio: '', ph: '',
  calcioSerico: '', pth: '', acidoUricoSerico: '', bicarbonato: '', potassio: '',
  infeccaoUrease: false, trato: false, nefrocalcinose: false, precoce: false, farmacos: [],
};

function Secao({ titulo, aberta = false, children }: { titulo: string; aberta?: boolean; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <details open={aberta} className="group mb-3 rounded-xl" style={{ backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}` }}>
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-base font-bold" style={{ color: colors.text }}>
        {titulo}
        <span className="transition-transform group-open:rotate-180"><Icone nome="chevron-down" tamanho={16} cor={colors.icon} /></span>
      </summary>
      <div className="px-3 pb-2">{children}</div>
    </details>
  );
}

function Marca({ texto, valor, onChange }: { texto: string; valor: boolean; onChange: (v: boolean) => void }) {
  const { colors } = useTheme();
  return (
    <label className="mb-2 flex cursor-pointer items-start gap-3 px-1 py-1 text-[15px] leading-5" style={{ color: colors.text }}>
      <input type="checkbox" checked={valor} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0" />
      <span>{texto}</span>
    </label>
  );
}

const COR_STATUS = { alto: '#dc2626', baixo: '#d97706', normal: '#16a34a' } as const;

export default function CausaLitiase() {
  const { colors } = useTheme();
  const [e, setE] = useState<EntradaLitiase>(VAZIO);
  const [r, setR] = useState<ResultadoLitiase | null>(null);
  const [erro, setErro] = useState('');

  const set = <K extends keyof EntradaLitiase>(k: K, v: EntradaLitiase[K]) => { setE((x) => ({ ...x, [k]: v })); setR(null); setErro(''); };
  const num = (k: keyof EntradaLitiase, icone: string, placeholder: string) => (
    <Campo icone={icone} placeholder={placeholder} inputMode="decimal" valor={e[k] as string} onChange={(t) => set(k, normalizarNumero(t) as never)} />
  );

  const avaliar = () => {
    const res = avaliarLitiase(e);
    const nada = !e.composicao && !e.hu && !e.infeccaoUrease && !e.trato && !e.nefrocalcinose && !e.precoce && !e.farmacos.length
      && [e.volume, e.calcio, e.oxalato, e.citrato, e.acidoUrico, e.sodio, e.ph, e.calcioSerico, e.pth, e.acidoUricoSerico, e.bicarbonato, e.potassio].every((v) => v.trim() === '');
    if (nada) { setR(null); setErro('Preencha ao menos um dado (urina de 24 h, sangue, composição ou contexto).'); return; }
    setErro(''); setR(res);
  };
  const limpar = () => { setE(VAZIO); setR(null); setErro(''); };

  return (
    <>
      <p className="mb-3 px-1 text-sm leading-5" style={{ color: colors.text, opacity: 0.8 }}>
        Preencha o que tiver (nenhum campo é obrigatório). O resultado mostra o que está fora da faixa e as causas a considerar.
      </p>
      <Secao titulo="Paciente e cálculo" aberta>
        <Seletor rotulo="Sexo" valor={e.sexo} onChange={(v) => set('sexo', v as Sexo)} opcoes={[{ valor: 'f', texto: 'Feminino' }, { valor: 'm', texto: 'Masculino' }]} />
        <Seletor rotulo="Composição do cálculo (se analisado)" valor={e.composicao} onChange={(v) => set('composicao', v as Composicao)}
          opcoes={[{ valor: 'oxalato', texto: 'Oxalato de cálcio' }, { valor: 'fosfato', texto: 'Fosfato de cálcio' }, { valor: 'urico', texto: 'Ácido úrico' }, { valor: 'estruvita', texto: 'Estruvita' }, { valor: 'cistina', texto: 'Cistina' }, { valor: 'outro', texto: 'Outro / raro' }]} />
        {num('hu', 'flask', 'Densidade na TC (HU), se não analisado')}
      </Secao>
      <Secao titulo="Urina de 24 horas">
        {num('volume', 'flask', 'Volume (L/24 h)')}
        {num('calcio', 'flask', 'Cálcio (mg/24 h)')}
        {num('oxalato', 'flask', 'Oxalato (mg/24 h)')}
        {num('citrato', 'flask', 'Citrato (mg/24 h)')}
        {num('acidoUrico', 'flask', 'Ácido úrico (mg/24 h)')}
        {num('sodio', 'flask', 'Sódio (mEq/24 h)')}
        {num('ph', 'flask', 'pH urinário')}
      </Secao>
      <Secao titulo="Sangue">
        {num('calcioSerico', 'flask', 'Cálcio total (mg/dL)')}
        {num('pth', 'flask', 'PTH intacto (pg/mL)')}
        {num('acidoUricoSerico', 'flask', 'Ácido úrico (mg/dL)')}
        {num('bicarbonato', 'flask', 'Bicarbonato (mEq/L)')}
        {num('potassio', 'flask', 'Potássio (mEq/L)')}
      </Secao>
      <Secao titulo="Contexto clínico">
        <Marca texto="Urocultura com germe produtor de urease (Proteus, Klebsiella…) ou ITU de repetição" valor={e.infeccaoUrease} onChange={(v) => set('infeccaoUrease', v)} />
        <Marca texto="Cirurgia bariátrica, doença inflamatória intestinal, má absorção ou ressecção intestinal" valor={e.trato} onChange={(v) => set('trato', v)} />
        <Marca texto="Nefrocalcinose ou rim esponjoso medular" valor={e.nefrocalcinose} onChange={(v) => set('nefrocalcinose', v)} />
        <Marca texto="Início antes dos 18 anos ou história familiar importante" valor={e.precoce} onChange={(v) => set('precoce', v)} />
        <p className="mb-1 mt-2 px-1 text-sm font-semibold" style={{ color: colors.text }}>Em uso:</p>
        {FARMACOS_LITOGENICOS.map((f) => (
          <Marca key={f.id} texto={f.texto} valor={e.farmacos.includes(f.id)} onChange={(v) => set('farmacos', v ? [...e.farmacos, f.id] : e.farmacos.filter((x) => x !== f.id))} />
        ))}
      </Secao>

      <div className="mt-4 flex gap-3">
        <BotaoPrimario onClick={avaliar}>Avaliar causa</BotaoPrimario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>
      {erro && <p role="alert" className="mt-3 text-center text-sm font-semibold" style={{ color: colors.inputError }}>{erro}</p>}

      {r && (
        <div role="status" data-testid="resultado-litiase" className="animate-resultado mt-5 space-y-4">
          {r.achados.length > 0 && (
            <section className="rounded-xl p-4" style={{ backgroundColor: colors.resultBg, border: `1px solid ${colors.resultBorder}` }}>
              <h3 className="mb-2 text-base font-bold" style={{ color: colors.resultText }}>Achados</h3>
              <ul className="space-y-1.5">
                {r.achados.map((a) => (
                  <li key={a.id} className="text-[15px] leading-5" style={{ color: colors.text }}>
                    <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ backgroundColor: COR_STATUS[a.status] }} aria-hidden />
                    <strong>{a.rotulo}:</strong> {a.valor} <span style={{ opacity: 0.8 }}>· {a.leitura}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {r.tipoPorTc && <p className="rounded-xl px-4 py-3 text-[15px] leading-5" style={{ backgroundColor: colors.inputBg, color: colors.text, border: `1px solid ${colors.inputBorder}` }}>{r.tipoPorTc}</p>}
          {r.hipoteses.length > 0 && (
            <section>
              <h3 className="mb-2 px-1 text-base font-bold" style={{ color: colors.text }}>Causas a considerar</h3>
              <div className="space-y-2.5">
                {r.hipoteses.map((h) => (
                  <article key={h.id} data-testid={`hipotese-${h.id}`} className="rounded-xl px-4 py-3 shadow-md" style={{ backgroundColor: colors.inputBg, borderLeft: `4px solid ${h.nivel === 'forte' ? '#dc2626' : '#f59e0b'}` }}>
                    <p className="text-base font-bold leading-5" style={{ color: colors.text }}>{h.titulo}</p>
                    <p className="mb-1 text-xs font-semibold" style={{ color: h.nivel === 'forte' ? '#dc2626' : '#b45309' }}>{h.nivel === 'forte' ? 'Forte indício' : 'Possível'}</p>
                    {h.motivos.map((m, i) => <p key={i} className="text-[15px] leading-5" style={{ color: colors.text, opacity: 0.85 }}>{m}</p>)}
                    {h.proximos.map((p, i) => <p key={i} className="mt-1.5 text-[15px] leading-5" style={{ color: colors.text }}>→ {p}</p>)}
                  </article>
                ))}
              </div>
            </section>
          )}
          {r.lacunas.length > 0 && (
            <section className="rounded-xl px-4 py-3" style={{ backgroundColor: colors.inputBg, border: `1px dashed ${colors.inputBorder}` }}>
              <h3 className="mb-1 text-sm font-bold uppercase tracking-wider" style={{ color: colors.text, opacity: 0.7 }}>O que falta</h3>
              {r.lacunas.map((l, i) => <p key={i} className="py-0.5 text-[15px] leading-5" style={{ color: colors.text }}>• {l}</p>)}
            </section>
          )}
          {r.avisos.map((a, i) => <p key={i} className="px-1 text-xs leading-5" style={{ color: colors.text, opacity: 0.7 }}>{a}</p>)}
        </div>
      )}
    </>
  );
}
