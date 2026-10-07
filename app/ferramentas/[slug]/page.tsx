import { notFound } from 'next/navigation';
import { ferramentasDisponiveis, porSlug } from '@/lib/tools/catalogo';
import { implementacoes } from './implementacoes';

export const dynamicParams = false;

export function generateStaticParams() {
  return ferramentasDisponiveis.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: porSlug(slug)?.titulo ?? 'Ferramenta' };
}

export default async function FerramentaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const render = implementacoes[slug];
  if (!porSlug(slug) || !render) notFound();
  return <>{render()}</>;
}
