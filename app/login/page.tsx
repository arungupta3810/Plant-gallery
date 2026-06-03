'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import Icon from '@/components/Icon';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/account';
  const { loginUser } = useCart();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await loginUser(email, password);
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setBusy(false);
    }
  };

  return (
    <div className="auth-card">
      <span className="eyebrow"><Icon name="user" size={15} stroke={2} /> Welcome back</span>
      <h1>Log in</h1>
      <form onSubmit={submit}>
        <label className="field"><span>Email</span><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="field"><span>Password</span><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 12 }} disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </form>
      <p className="count-label" style={{ marginTop: 16, textAlign: 'center' }}>
        New here? <Link href={`/register?next=${encodeURIComponent(next)}`} className="link-arrow" style={{ fontSize: 14 }}>Create an account</Link>
      </p>
      <p className="count-label" style={{ marginTop: 8, textAlign: 'center', fontSize: 12.5 }}>Demo: demo@plantgallery.test / demo123</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main>
      <div className="wrap" style={{ maxWidth: 460 }}>
        <Suspense fallback={<div className="auth-card"><p className="count-label">Loading…</p></div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
