import { notFound } from 'next/navigation';
import PortaoPremium from '@/components/ui/PortaoPremium';
import { catalogo, estaDisponivel, porSlug } from '@/lib/tools/catalogo';
import { implementacoes } from './implementacoes';

export const dynamicParams = false;

export function generateStaticParams() {
  // Todas as migradas, inclusive as que não aparecem no menu (as frações de excreção abrem o mesmo hub).
  return catalogo.filter((f) => estaDisponivel(f.slug)).map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: porSlug(slug)?.titulo ?? 'Ferramenta' };
}

export default async function FerramentaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const render = implementacoes[slug];
  if (!porSlug(slug) || !render) notFound();
  return <PortaoPremium slug={slug}>{render()}</PortaoPremium>;
}
