import { type CSSProperties } from 'react';

/** Wordmark em script (mesma fonte do site: Great Vibes, hospedada junto com o app). */
export default function Logotipo({ tamanho = '1.9rem', className = '', style }: { tamanho?: string; className?: string; style?: CSSProperties }) {
  return (
    <span className={`font-bold leading-none ${className}`} style={{ fontFamily: "'Great Vibes', cursive", fontSize: tamanho, ...style }}>
      NephroSmart
    </span>
  );
}
