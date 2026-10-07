export const metadata = { title: 'Sem conexão' };

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold" style={{ color: '#104E8B' }}>Você está offline</h1>
      <p className="mt-2 text-sm text-gray-500 max-w-xs">
        Esta página ainda não foi salva no aparelho. As calculadoras que você já abriu
        continuam disponíveis sem internet.
      </p>
    </main>
  );
}
