'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Plant } from '@/lib/plants';
import { useCart } from '@/components/CartContext';
import PlantMedia from '@/components/PlantMedia';
import PlantCard from '@/components/PlantCard';
import { CareChip, Rating } from '@/components/CareChip';
import Icon from '@/components/Icon';

export default function PlantPage() {
  const params = useParams<{ id: string }>();
  const { addToCart, toggleFav, fav } = useCart();
  const [qty, setQty] = useState(1);
  const [acc, setAcc] = useState('care');

  const [plant, setPlant] = useState<Plant | null>(null);
  const [rel, setRel] = useState<Plant[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'notfound'>('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    api.plant(params.id)
      .then(async (p) => {
        if (cancelled) return;
        setPlant(p);
        setStatus('ready');
        // related: same category, fall back to anything
        try {
          const same = await api.plants({ category: p.cat });
          let r = same.filter((x) => x.id !== p.id).slice(0, 3);
          if (r.length < 3) {
            const all = await api.plants();
            const fill = all.filter((x) => x.id !== p.id && !r.some((y) => y.id === x.id)).slice(0, 3 - r.length);
            r = [...r, ...fill];
          }
          if (!cancelled) setRel(r);
        } catch { /* ignore related errors */ }
      })
      .catch(() => { if (!cancelled) setStatus('notfound'); });
    return () => { cancelled = true; };
  }, [params.id]);

  if (status === 'loading') {
    return <main><div className="wrap" style={{ padding: '60px 0' }}><p className="count-label">Loading…</p></div></main>;
  }
  if (status === 'notfound' || !plant) {
    return (
      <main><div className="wrap">
        <div className="empty" style={{ marginTop: 48 }}>
          <span className="ic"><Icon name="leaf" size={28} /></span>
          <h4>We couldn&apos;t find that plant</h4>
          <p>It may have sold out or moved.</p>
          <Link href="/shop" className="btn btn-primary">Back to the shop</Link>
        </div>
      </div></main>
    );
  }

  const inStock = plant.stock === undefined || plant.stock > 0;
  const care = [
    { ic: 'sun', k: 'Light', v: plant.light },
    { ic: 'droplet', k: 'Water', v: plant.water },
    { ic: 'sprout', k: 'Difficulty', v: plant.difficulty },
    { ic: plant.petSafe ? 'shield' : 'leaf', k: 'Pet-safe', v: plant.petSafe ? 'Yes' : 'Keep out of reach' },
  ];

  const Acc = ({ id, title, children }: Readonly<{ id: string; title: string; children: React.ReactNode }>) => (
    <div style={{ borderTop: '1px solid var(--border-soft)' }}>
      <div onClick={() => setAcc(acc === id ? '' : id)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', fontWeight: 600, fontSize: 15, color: 'var(--charcoal)', cursor: 'pointer' }}>
        {title}<Icon name="chevronDown" size={20} color="var(--fg-3)" style={{ transform: acc === id ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </div>
      {acc === id && <div style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--fg-2)', padding: '0 0 18px', maxWidth: '60ch' }}>{children}</div>}
    </div>
  );

  return (
    <main>
      <div className="wrap">
        <div className="crumbs">
          <Link href="/">Home</Link><span className="sep">/</span>
          <Link href="/shop">Shop</Link><span className="sep">/</span>
          <span className="cur">{plant.name}</span>
        </div>

        <div className="detail">
          <div className="detail-media">
            <PlantMedia plant={plant} className="detail-figure" glyphSize={180} radius="var(--radius-xl)" />
          </div>

          <div className="detail-info">
            {plant.badge && <span className="badge success">{plant.badge}</span>}
            <h1>{plant.name}</h1>
            <p className="bot">{plant.botanical}</p>
            <Rating value={4.8} count={124} />
            <div className="detail-price">{'$' + plant.price}{plant.oldPrice && <span className="old">{'$' + plant.oldPrice}</span>}</div>
            <p className="detail-desc">{plant.description || `A leafy favourite that brings instant calm to a room. Easygoing, forgiving, and happiest in ${plant.light.toLowerCase()} light — a great pick whether it's your first plant or your fortieth.`}</p>

            <div className="chips">
              <CareChip icon="sun" plain>{plant.light}</CareChip>
              <CareChip icon="droplet" plain>Water {plant.water.toLowerCase()}</CareChip>
              <CareChip icon="sprout" plain>{plant.difficulty}</CareChip>
            </div>

            {!inStock && <p className="badge" style={{ background: 'var(--neutral-100)', color: 'var(--fg-2)', marginBottom: 12 }}>Out of stock</p>}

            <div className="buy-row">
              <div className="qty">
                <button onClick={() => setQty((n) => Math.max(1, n - 1))}><Icon name="minus" size={18} /></button>
                <span>{qty}</span>
                <button onClick={() => setQty((n) => n + 1)}><Icon name="plus" size={18} /></button>
              </div>
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={!inStock} onClick={() => addToCart(plant, qty)}>
                <Icon name="bag" size={18} color="#fff" /> {inStock ? 'Add to cart · $' + plant.price * qty : 'Sold out'}
              </button>
              <button className="iconbtn" style={{ width: 52, height: 52, border: '1.5px solid var(--border)', color: fav[plant.id] ? 'var(--accent)' : 'var(--fg-2)' }} onClick={() => toggleFav(plant)} aria-label="Save">
                <Icon name="heart" size={21} style={{ fill: fav[plant.id] ? 'currentColor' : 'none' }} />
              </button>
            </div>

            <div className="care-grid">
              {care.map((c) => (
                <div className="care-item" key={c.k}>
                  <span className="ic"><Icon name={c.ic} size={19} /></span>
                  <div><div className="k">{c.k}</div><div className="v">{c.v}</div></div>
                </div>
              ))}
            </div>

            <Acc id="care" title="Care guide">
              Water {plant.water.toLowerCase()} — let the top inch of soil dry out between drinks. Give it {plant.light.toLowerCase()} light and keep it away from cold draughts. Wipe the leaves now and then so it can breathe.
            </Acc>
            <Acc id="ship" title="Shipping & returns">
              Carefully packed and shipped within 2–3 business days. Free delivery over $75. If your plant arrives unhappy, our 30-day healthy-arrival guarantee has you covered.
            </Acc>
            <Acc id="pot" title="Pot & size">
              Arrives in a 14cm nursery pot, roughly 30–40cm tall including foliage. Decorative pots sold separately.
            </Acc>
          </div>
        </div>

        {rel.length > 0 && (
          <section className="section">
            <div className="section-head"><div><span className="eyebrow"><Icon name="leaf" size={15} stroke={2} /> You may also like</span><h2>Pairs well with</h2></div></div>
            <div className="plant-grid cols-3">
              {rel.map((p) => <PlantCard key={p.id} plant={p} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
