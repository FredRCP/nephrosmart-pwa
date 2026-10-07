export const metadata = { title: 'Contato' };

const EMAIL = 'nefrosmartapp@gmail.com';

export default function ContatoPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center pt-10 text-center">
      <h1 className="mb-3 text-3xl font-bold" style={{ color: 'var(--text)' }}>Contato</h1>
      <p className="text-lg" style={{ color: 'var(--text)' }}>
        Envie suas dúvidas ou sugestões. Em breve, um formulário estará disponível.
      </p>
      <a href={`mailto:${EMAIL}`} className="mt-6 text-lg font-semibold underline" style={{ color: 'var(--text)' }}>
        ✉️ {EMAIL}
      </a>
    </div>
  );
}
