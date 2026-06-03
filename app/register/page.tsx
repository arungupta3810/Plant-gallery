'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import Icon from '@/components/Icon';

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/account';
  const { registerUser } = useCart();

  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await registerUser(form.name, form.email, form.password, form.phone || undefined);
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      setBusy(false);
    }
  };

  return (
    <div className="auth-card">
      <span className="eyebrow"><Icon name="sprout" size={15} stroke={2} /> Join the gallery</span>
      <h1>Create account</h1>
      <form onSubmit={submit}>
        <label className="field"><span>Full name</span><input required value={form.name} onChange={set('name')} /></label>
        <label className="field"><span>Email</span><input type="email" required value={form.email} onChange={set('email')} /></label>
        <label className="field"><span>Phone (optional)</span><input value={form.phone} onChange={set('phone')} /></label>
        <label className="field"><span>Password</span><input type="password" required minLength={6} value={form.password} onChange={set('password')} /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 12 }} disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      <p className="count-label" style={{ marginTop: 16, textAlign: 'center' }}>
        Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="link-arrow" style={{ fontSize: 14 }}>Log in</Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main>
      <div className="wrap" style={{ maxWidth: 460 }}>
        <Suspense fallback={<div className="auth-card"><p className="count-label">Loading…</p></div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </main>
  );
}
