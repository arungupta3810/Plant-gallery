'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/Icon';

export default function TrackPage() {
  const router = useRouter();
  const [number, setNumber] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = number.trim().toUpperCase();
    if (n) router.push(`/order/${n}`);
  };

  return (
    <main>
      <div className="wrap" style={{ maxWidth: 520 }}>
        <div className="crumbs">
          <Link href="/">Home</Link><span className="sep">/</span><span className="cur">Track order</span>
        </div>
        <div className="auth-card">
          <span className="eyebrow"><Icon name="package" size={15} stroke={2} /> Order tracking</span>
          <h1>Track your order</h1>
          <p className="count-label" style={{ marginBottom: 20 }}>Enter the order number from your confirmation (e.g. PG-AB12CD).</p>
          <form onSubmit={submit}>
            <label className="field"><span>Order number</span>
              <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="PG-XXXXXX" required />
            </label>
            <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 16 }}>Track order</button>
          </form>
        </div>
      </div>
    </main>
  );
}
