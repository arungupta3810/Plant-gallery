'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import Icon from '@/components/Icon';
import { inr } from '@/lib/format';

type Stats = {
  plants: number; orders: number; customers: number; newLeads: number; revenue: number;
  lowStock: { name: string; slug: string; stock: number }[];
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.adminStats().then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="form-error">{error}</p>;
  if (!stats) return <p className="count-label">Loading…</p>;

  const cards = [
    { label: 'Revenue', value: inr(stats.revenue), icon: 'package' },
    { label: 'Orders', value: stats.orders, icon: 'truck' },
    { label: 'Plants', value: stats.plants, icon: 'leaf' },
    { label: 'Customers', value: stats.customers, icon: 'user' },
    { label: 'New leads', value: stats.newLeads, icon: 'bell' },
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="count-label" style={{ marginBottom: 24 }}>An at-a-glance view of the business.</p>

      <div className="stat-grid">
        {cards.map((c) => (
          <div className="stat-card" key={c.label}>
            <span className="ic"><Icon name={c.icon} size={20} /></span>
            <div className="v">{c.value}</div>
            <div className="k">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="admin-section">
        <h3><Icon name="bell" size={17} /> Low stock</h3>
        {stats.lowStock.length === 0 ? (
          <p className="count-label">Everything is well stocked. 🌿</p>
        ) : (
          <div className="admin-table">
            {stats.lowStock.map((p) => (
              <div className="admin-row" key={p.slug}>
                <span>{p.name}</span>
                <span className={'badge ' + (p.stock === 0 ? '' : 'success')}>{p.stock} left</span>
                <Link href={`/admin/plants?edit=${p.slug}`} className="link-arrow" style={{ fontSize: 14 }}>Restock <Icon name="arrowRight" size={14} stroke={2} /></Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
