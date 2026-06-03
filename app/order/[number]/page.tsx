'use client';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, type Order } from '@/lib/api';
import Icon from '@/components/Icon';
import { inr } from '@/lib/format';

const STEPS = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const LABEL: Record<string, string> = {
  PENDING: 'Pending', CONFIRMED: 'Confirmed', PROCESSING: 'Processing',
  SHIPPED: 'Shipped', DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
};

export default function OrderPage() {
  const { number } = useParams<{ number: string }>();
  const params = useSearchParams();
  const isNew = params.get('new') === '1';

  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'notfound'>('loading');

  useEffect(() => {
    let cancelled = false;
    api.trackOrder(number)
      .then((o) => { if (!cancelled) { setOrder(o); setStatus('ready'); } })
      .catch(() => { if (!cancelled) setStatus('notfound'); });
    return () => { cancelled = true; };
  }, [number]);

  if (status === 'loading') {
    return <main><div className="wrap" style={{ padding: '60px 0' }}><p className="count-label">Loading order…</p></div></main>;
  }
  if (status === 'notfound' || !order) {
    return (
      <main><div className="wrap">
        <div className="empty" style={{ marginTop: 48 }}>
          <span className="ic"><Icon name="package" size={28} /></span>
          <h4>Order not found</h4>
          <p>Double-check the order number and try again.</p>
          <Link href="/track" className="btn btn-outline">Track another order</Link>
        </div>
      </div></main>
    );
  }

  const stepIndex = STEPS.indexOf(order.status);
  const cancelled = order.status === 'CANCELLED';

  return (
    <main>
      <div className="wrap" style={{ maxWidth: 760 }}>
        {isNew && (
          <div className="order-success">
            <span className="ic"><Icon name="check" size={26} stroke={2.4} color="#fff" /></span>
            <div>
              <h2>Thank you — your order is confirmed!</h2>
              <p>We&apos;ve emailed a confirmation to {order.email}. Your plants are being prepared with care.</p>
            </div>
          </div>
        )}

        <div className="order-card">
          <div className="order-head">
            <div>
              <span className="eyebrow"><Icon name="package" size={15} stroke={2} /> Order</span>
              <h1>{order.number}</h1>
              <p className="count-label">Placed {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <span className={'badge ' + (cancelled ? '' : 'success')}>{LABEL[order.status]}</span>
          </div>

          {!cancelled && (
            <div className="track-steps">
              {STEPS.map((s, i) => (
                <div key={s} className={'track-step' + (i <= stepIndex ? ' done' : '')}>
                  <span className="dot">{i <= stepIndex && <Icon name="check" size={12} stroke={3} color="#fff" />}</span>
                  <span className="lbl">{LABEL[s]}</span>
                </div>
              ))}
            </div>
          )}

          <div className="order-items">
            {order.items.map((it) => (
              <div className="summary-line" key={it.id}>
                <span className="qbadge">{it.qty}</span>
                <span className="nm">{it.name}</span>
                <span className="pr">{inr(it.price * it.qty)}</span>
              </div>
            ))}
          </div>

          <div className="summary-row"><span>Subtotal</span><span style={{ color: 'var(--fg-1)', fontWeight: 600 }}>{inr(order.subtotal)}</span></div>
          <div className="summary-row"><span>Shipping</span><span style={{ color: order.shipping === 0 ? 'var(--success-fg)' : 'var(--fg-1)', fontWeight: 600 }}>{order.shipping === 0 ? 'Free' : inr(order.shipping)}</span></div>
          <div className="summary-row total"><span>Total</span><span>{inr(order.total)}</span></div>

          <div className="order-ship">
            <h4>Shipping to</h4>
            <p>{order.name}<br />{order.shipLine1}{order.shipLine2 ? `, ${order.shipLine2}` : ''}<br />{order.shipCity}{order.shipState ? `, ${order.shipState}` : ''} {order.shipZip}</p>
          </div>

          <Link href="/shop" className="btn btn-outline btn-block" style={{ marginTop: 20 }}>Continue shopping</Link>
        </div>
      </div>
    </main>
  );
}
