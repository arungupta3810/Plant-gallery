import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="wrap" style={{ padding: '120px 28px', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--charcoal)', margin: 0 }}>This plant wandered off.</h1>
      <p style={{ color: 'var(--fg-2)', fontSize: 17, margin: '14px 0 28px' }}>We couldn&apos;t find that page — but the greenhouse is still open.</p>
      <Link href="/" className="btn btn-primary btn-lg">Back to home</Link>
    </main>
  );
}
