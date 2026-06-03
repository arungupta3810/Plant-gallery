'use client';
import { useState, useEffect } from 'react';
import { api, type Order } from '@/lib/api';
import Icon from '@/components/Icon';

const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = () => api.adminOrders().then(setOrders).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const updateStatus = async (number: string, status: string) => {
    try {
      const updated = await api.adminUpdateOrderStatus(number, status);
      setOrders((os) => os.map((o) => (o.number === number ? updated : o)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    }
  };

  if (error) return <p className="form-error">{error}</p>;

  return (
    <div>
      <h1>Orders</h1>
      <p className="count-label" style={{ marginBottom: 20 }}>{orders.length} total · update status to keep customers informed.</p>

      {orders.length === 0 ? (
        <p className="count-label">No orders yet.</p>
      ) : (
        <div className="admin-table">
          {orders.map((o) => (
            <div key={o.id}>
              <div className="admin-row order-admin-row">
                <button className="link-arrow" style={{ fontSize: 15, fontWeight: 600 }} onClick={() => setExpanded(expanded === o.number ? null : o.number)}>
                  {o.number}
                </button>
                <span className="count-label">{o.name}</span>
                <span className="count-label">{new Date(o.createdAt).toLocaleDateString()}</span>
                <span className="pr">${o.total}</span>
                <select value={o.status} onChange={(e) => updateStatus(o.number, e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {expanded === o.number && (
                <div className="order-detail-panel">
                  <div className="order-items">
                    {o.items.map((it) => (
                      <div className="summary-line" key={it.id}>
                        <span className="qbadge">{it.qty}</span>
                        <span className="nm">{it.name}</span>
                        <span className="pr">${it.price * it.qty}</span>
                      </div>
                    ))}
                  </div>
                  <p className="count-label"><Icon name="mapPin" size={13} /> {o.shipLine1}, {o.shipCity} {o.shipZip} · {o.email}{o.phone ? ` · ${o.phone}` : ''}</p>
                  <p className="count-label">Payment: {o.payment?.method ?? '—'} ({o.payment?.status ?? '—'})</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
