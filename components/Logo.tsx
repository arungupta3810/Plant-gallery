import Link from 'next/link';

export default function Logo({ inverse = false }: { inverse?: boolean }) {
  const a = inverse ? '#A5D6A7' : '#2E7D32';
  const b = inverse ? '#2E7D32' : '#A5D6A7';
  return (
    <Link href="/" className="logo">
      <svg width="38" height="38" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill={a} />
        <path d="M44 18c0 13.5-7.8 24-18.5 24-3 0-5.4-.7-5.4-.7s-1.1 4-1.1 6.7a2 2 0 0 1-4 0c0-9.6 2.4-16.6 6.6-21.2C26 22 34.6 19.4 44 18Z" fill={b} />
        <path d="M40 23.5c-7.7 2.4-13 6.4-16.6 11.8" stroke={a} strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="wm" style={inverse ? { color: '#fff' } : undefined}>Plant<em>{' Gallery'}</em></span>
    </Link>
  );
}
