'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import Icon from '@/components/Icon';

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? '';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.contact(form);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your message');
    } finally {
      setBusy(false);
    }
  };

  const waText = encodeURIComponent(
    `Hi Plant Gallery! I'd like to ask about your plants.${form.name ? `\n\nName: ${form.name}` : ''}${form.message ? `\nMessage: ${form.message}` : ''}`,
  );
  const waHref = WHATSAPP ? `https://wa.me/${WHATSAPP}?text=${waText}` : '#';

  return (
    <main>
      <div className="wrap">
        <div className="crumbs">
          <Link href="/">Home</Link><span className="sep">/</span><span className="cur">Contact</span>
        </div>

        <div className="contact-layout">
          <div className="contact-intro">
            <span className="eyebrow"><Icon name="phone" size={15} stroke={2} /> Get in touch</span>
            <h1>We&apos;d love to help</h1>
            <p className="lead">Questions about a plant, an order, or plant care? Send us a note and we&apos;ll get back to you, usually within a day.</p>

            {WHATSAPP && (
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-light btn-lg" style={{ marginTop: 24 }}>
                <Icon name="whatsapp" size={19} stroke={2} color="#2E7D32" /> Chat on WhatsApp
              </a>
            )}

            <div className="contact-meta">
              <div><span className="ic"><Icon name="mapPin" size={18} /></span> The Greenhouse, Linking Road, Bandra West, Mumbai 400050</div>
              <div><span className="ic"><Icon name="clock" size={18} /></span> Mon–Sat, 9am–6pm</div>
            </div>
          </div>

          <div className="auth-card">
            {sent ? (
              <div className="empty" style={{ padding: '20px 0' }}>
                <span className="ic"><Icon name="check" size={28} stroke={2.4} /></span>
                <h4>Thanks — message sent!</h4>
                <p>We&apos;ve received your inquiry and will reply to {form.email} soon.</p>
                <Link href="/shop" className="btn btn-outline">Back to shopping</Link>
              </div>
            ) : (
              <form onSubmit={submit}>
                <h3 style={{ marginBottom: 16 }}>Send us a message</h3>
                <label className="field"><span>Name</span><input required value={form.name} onChange={set('name')} /></label>
                <label className="field"><span>Email</span><input type="email" required value={form.email} onChange={set('email')} /></label>
                <label className="field"><span>Phone (optional)</span><input value={form.phone} onChange={set('phone')} /></label>
                <label className="field"><span>Message</span><textarea required rows={4} value={form.message} onChange={set('message')} /></label>
                {error && <p className="form-error">{error}</p>}
                <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 8 }} disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
