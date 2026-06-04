'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

type Status = 'idle' | 'loading' | 'done' | 'error';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [msg, setMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    try {
      const res = await api.subscribeNewsletter(email);
      setStatus('done');
      setMsg(
        res.alreadySubscribed
          ? "You're already on the list — see you in your inbox."
          : 'Thanks! Check your inbox for a welcome note. 🌱',
      );
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <form onSubmit={submit}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          aria-label="Email address"
          disabled={status === 'done'}
          style={{ flex: 1, minWidth: 0, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 'var(--radius-md)', padding: '11px 14px', color: '#fff', fontSize: 14 }}
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={status === 'loading' || status === 'done'}>
          {status === 'loading' ? 'Joining…' : 'Join'}
        </button>
      </div>
      {msg && (
        <p style={{ margin: '10px 0 0', fontSize: 13, color: status === 'error' ? '#F4DDD0' : '#A5D6A7' }}>
          {msg}
        </p>
      )}
    </form>
  );
}
