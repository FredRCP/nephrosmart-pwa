import pkg from '../../package.json';

export const metadata = { title: 'Sobre' };

const EMAIL = 'nefrosmartapp@gmail.com';
const SITE = 'https://nefrosmartapp.com.br';

const cartao = 'rounded-2xl p-5 text-center';
const estilo = { backgroundColor: 'var(--inputBg)', border: '1px solid var(--inputBorder)', color: 'var(--modalText)' } as const;

export default function SobrePage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 pb-24 pt-4">
      <h1 className="text-center text-3xl font-bold" style={{ color: 'var(--text)' }}>Sobre o NephroSmart</h1>
      <img src="/images/ns1a.webp" alt="NephroSmart" width={300} height={250} className="mx-auto h-auto w-40 rounded-2xl bg-white/95 p-2" />

      <section className={cartao} style={estilo}>
        <p className="text-base leading-6">
          O NephroSmart é uma ferramenta de apoio educacional e informativo para médicos e profissionais de saúde.
          Não substitui o julgamento clínico, a avaliação médica individual nem os protocolos institucionais.
        </p>
      </section>

      <section className={cartao} style={estilo}>
        <h2 className="mb-1 text-base font-semibold" style={{ color: 'var(--text)' }}>Versão <em className="font-extrabold">Beta</em></h2>
        <p className="text-base">{pkg.version}</p>
        <p className="mt-2 text-base leading-6">Esta é uma versão beta em fase de testes. Algumas funcionalidades podem sofrer ajustes antes do lançamento oficial.</p>
      </section>

      <section className={cartao} style={estilo}>
        <h2 className="mb-1 text-base font-semibold" style={{ color: 'var(--text)' }}>Desenvolvido por</h2>
        <p className="text-base leading-6">RCP Creative · Desenvolvedor independente</p>
      </section>

      <section className={cartao} style={estilo}>
        <h2 className="mb-1 text-base font-semibold" style={{ color: 'var(--text)' }}>Contato</h2>
        <a href={`mailto:${EMAIL}`} className="block text-base font-semibold underline" style={{ color: 'var(--button)' }}>✉️ {EMAIL}</a>
      </section>

      <img src="/images/rcp-creative.png" alt="RCP Creative" width={60} height={60} className="mx-auto size-14 rounded-2xl" />
      <p className="text-center text-sm opacity-70" style={{ color: 'var(--text)' }}>Desenvolvido com foco em qualidade técnica e prática clínica.</p>
    </div>
  );
}
