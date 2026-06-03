'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { api, type Order } from '@/lib/api';
import type { Plant } from '@/lib/plants';
import PlantCard from '@/components/PlantCard';
import Icon from '@/components/Icon';
import { inr } from '@/lib/format';

const LABEL: Record<string, string> = {
  PENDING: 'Pending', CONFIRMED: 'Confirmed', PROCESSING: 'Processing',
  SHIPPED: 'Shipped', DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
};

export default function AccountPage() {
  const router = useRouter();
  const { user, authReady, logout } = useCart();
  const [tab, setTab] = useState<'orders' | 'wishlist'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authReady && !user) router.replace('/login?next=/account');
  }, [authReady, user, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([api.myOrders().catch(() => []), api.wishlist().catch(() => [])])
      .then(([o, w]) => { setOrders(o); setWishlist(w); })
      .finally(() => setLoading(false));
  }, [user]);

  if (!authReady || !user) {
    return <main><div className="wrap" style={{ padding: '60px 0' }}><p className="count-label">Loading…</p></div></main>;
  }

  return (
    <main>
      <div className="wrap">
        <div className="account-head">
          <div>
            <span className="eyebrow"><Icon name="user" size={15} stroke={2} /> Your account</span>
            <h1>Hi, {user.name.split(' ')[0]}</h1>
            <p className="count-label">{user.email}{user.role !== 'CUSTOMER' && ` · ${user.role}`}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {user.role !== 'CUSTOMER' && <Link href="/admin" className="btn btn-outline">Admin dashboard</Link>}
            <button className="btn btn-ghost" onClick={() => { logout(); router.push('/'); }}>Log out</button>
          </div>
        </div>

        <div className="pills" style={{ margin: '24px 0' }}>
          <button className={'pill' + (tab === 'orders' ? ' on' : '')} onClick={() => setTab('orders')}>Orders ({orders.length})</button>
          <button className={'pill' + (tab === 'wishlist' ? ' on' : '')} onClick={() => setTab('wishlist')}>Wishlist ({wishlist.length})</button>
        </div>

        {loading ? (
          <p className="count-label">Loading…</p>
        ) : tab === 'orders' ? (
          orders.length === 0 ? (
            <div className="empty">
              <span className="ic"><Icon name="package" size={28} /></span>
              <h4>No orders yet</h4>
              <p>When you place an order, it&apos;ll show up here.</p>
              <Link href="/shop" className="btn btn-primary">Start shopping</Link>
            </div>
          ) : (
            <div className="order-list">
              {orders.map((o) => (
                <Link key={o.id} href={`/order/${o.number}`} className="order-row">
                  <div>
                    <p className="nm">{o.number}</p>
                    <p className="count-label">{new Date(o.createdAt).toLocaleDateString()} · {o.items.reduce((s, i) => s + i.qty, 0)} items</p>
                  </div>
                  <span className={'badge ' + (o.status === 'CANCELLED' ? '' : 'success')}>{LABEL[o.status]}</span>
                  <span className="pr">{inr(o.total)}</span>
                  <Icon name="chevronRight" size={18} color="var(--fg-3)" />
                </Link>
              ))}
            </div>
          )
        ) : wishlist.length === 0 ? (
          <div className="empty">
            <span className="ic"><Icon name="heart" size={28} /></span>
            <h4>Your wishlist is empty</h4>
            <p>Tap the heart on any plant to save it for later.</p>
            <Link href="/shop" className="btn btn-primary">Find something you love</Link>
          </div>
        ) : (
          <div className="plant-grid cols-3">
            {wishlist.map((p) => <PlantCard key={p.id} plant={p} />)}
          </div>
        )}
      </div>
    </main>
  );
}
