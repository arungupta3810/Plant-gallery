'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { api } from '@/lib/api';
import Icon from '@/components/Icon';
import { inr, shippingFor } from '@/lib/format';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, user } = useCart();
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  const [form, setForm] = useState({
    name: user?.name ?? '', email: user?.email ?? '', phone: '',
    shipLine1: '', shipLine2: '', shipCity: '', shipState: '', shipZip: '',
  });
  const [method, setMethod] = useState<'cod' | 'card'>('cod');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const order = await api.checkout({
        ...form,
        paymentMethod: method,
        items: items.map((i) => ({ slug: i.slug ?? i.id, qty: i.qty })),
      });
      clearCart();
      router.push(`/order/${order.number}?new=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main><div className="wrap">
        <div className="empty" style={{ marginTop: 48 }}>
          <span className="ic"><Icon name="bag" size={28} /></span>
          <h4>Your cart is empty</h4>
          <p>Add a plant or two before checking out.</p>
          <Link href="/shop" className="btn btn-primary">Browse the collection</Link>
        </div>
      </div></main>
    );
  }

  return (
    <main>
      <div className="wrap">
        <div className="crumbs">
          <Link href="/">Home</Link><span className="sep">/</span>
          <Link href="/shop">Shop</Link><span className="sep">/</span>
          <span className="cur">Checkout</span>
        </div>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={submit}>
            <h1 style={{ marginBottom: 8 }}>Checkout</h1>
            {!user && (
              <p className="count-label" style={{ marginBottom: 20 }}>
                Checking out as a guest. <Link href="/login?next=/checkout" className="link-arrow" style={{ fontSize: 14 }}>Log in</Link> to track orders.
              </p>
            )}

            <fieldset className="field-group">
              <legend>Contact</legend>
              <label className="field"><span>Full name</span><input required value={form.name} onChange={set('name')} /></label>
              <div className="field-row">
                <label className="field"><span>Email</span><input type="email" required value={form.email} onChange={set('email')} /></label>
                <label className="field"><span>Phone (optional)</span><input value={form.phone} onChange={set('phone')} /></label>
              </div>
            </fieldset>

            <fieldset className="field-group">
              <legend>Shipping address</legend>
              <label className="field"><span>Address line 1</span><input required value={form.shipLine1} onChange={set('shipLine1')} /></label>
              <label className="field"><span>Address line 2 (optional)</span><input value={form.shipLine2} onChange={set('shipLine2')} /></label>
              <div className="field-row">
                <label className="field"><span>City</span><input required value={form.shipCity} onChange={set('shipCity')} /></label>
                <label className="field"><span>State</span><input value={form.shipState} onChange={set('shipState')} /></label>
                <label className="field"><span>ZIP</span><input required value={form.shipZip} onChange={set('shipZip')} /></label>
              </div>
            </fieldset>

            <fieldset className="field-group">
              <legend>Payment</legend>
              <label className={'pay-opt' + (method === 'cod' ? ' on' : '')} onClick={() => setMethod('cod')}>
                <span className="box" style={{ borderRadius: '50%' }}>{method === 'cod' && <Icon name="check" size={12} stroke={3} />}</span>
                Cash / card on delivery
              </label>
              <label className={'pay-opt' + (method === 'card' ? ' on' : '')} onClick={() => setMethod('card')}>
                <span className="box" style={{ borderRadius: '50%' }}>{method === 'card' && <Icon name="check" size={12} stroke={3} />}</span>
                Pay now by card (demo — no charge)
              </label>
            </fieldset>

            {error && <p className="form-error">{error}</p>}

            <button className="btn btn-primary btn-block btn-lg" disabled={submitting}>
              {submitting ? 'Placing order…' : `Place order · ${inr(total)}`}
            </button>
          </form>

          <aside className="checkout-summary">
            <h3>Order summary</h3>
            <div className="summary-items">
              {items.map((it) => (
                <div className="summary-line" key={it.slug ?? it.id}>
                  <span className="qbadge">{it.qty}</span>
                  <span className="nm">{it.name}</span>
                  <span className="pr">{inr(it.price * it.qty)}</span>
                </div>
              ))}
            </div>
            <div className="summary-row"><span>Subtotal</span><span style={{ color: 'var(--fg-1)', fontWeight: 600 }}>{inr(subtotal)}</span></div>
            <div className="summary-row"><span>Shipping</span><span style={{ color: shipping === 0 ? 'var(--success-fg)' : 'var(--fg-1)', fontWeight: 600 }}>{shipping === 0 ? 'Free' : inr(shipping)}</span></div>
            <div className="summary-row total"><span>Total</span><span>{inr(total)}</span></div>
            <p className="count-label" style={{ marginTop: 14 }}><Icon name="shield" size={14} /> 30-day healthy-arrival guarantee</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
