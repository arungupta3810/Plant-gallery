'use client';
import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { PLANTS, getPlant } from '@/lib/plants';
import { useCart } from '@/components/CartContext';
import PlantMedia from '@/components/PlantMedia';
import PlantCard from '@/components/PlantCard';
import { CareChip, Rating } from '@/components/CareChip';
import Icon from '@/components/Icon';

export default function PlantPage() {
  const params = useParams<{ id: string }>();
  const plant = getPlant(params.id);
  const { addToCart, toggleFav, fav } = useCart();
  const [qty, setQty] = useState(1);
  const [acc, setAcc] = useState('care');
  if (!plant) return notFound();

  const related = PLANTS.filter((p) => p.id !== plant.id && p.cat === plant.cat).slice(0, 3);
  const fill = related.length < 3 ? PLANTS.filter((p) => p.id !== plant.id && !related.includes(p)).slice(0, 3 - related.length) : [];
  const rel = [...related, ...fill];

  const care = [
    { ic: 'sun', k: 'Light', v: plant.light },
    { ic: 'droplet', k: 'Water', v: plant.water },
    { ic: 'sprout', k: 'Difficulty', v: plant.difficulty },
    { ic: plant.petSafe ? 'shield' : 'leaf', k: 'Pet-safe', v: plant.petSafe ? 'Yes' : 'Keep out of reach' },
  ];

  const Acc = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
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
            <p className="detail-desc">A leafy favourite that brings instant calm to a room. Easygoing, forgiving, and happiest in {plant.light.toLowerCase()} light — a great pick whether it&apos;s your first plant or your fortieth.</p>

            <div className="chips">
              <CareChip icon="sun" plain>{plant.light}</CareChip>
              <CareChip icon="droplet" plain>Water {plant.water.toLowerCase()}</CareChip>
              <CareChip icon="sprout" plain>{plant.difficulty}</CareChip>
            </div>

            <div className="buy-row">
              <div className="qty">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}><Icon name="minus" size={18} /></button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => q + 1)}><Icon name="plus" size={18} /></button>
              </div>
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => addToCart(plant, qty)}>
                <Icon name="bag" size={18} color="#fff" /> {'Add to cart · $' + plant.price * qty}
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

        <section className="section">
          <div className="section-head"><div><span className="eyebrow"><Icon name="leaf" size={15} stroke={2} /> You may also like</span><h2>Pairs well with</h2></div></div>
          <div className="plant-grid cols-3">
            {rel.map((p) => <PlantCard key={p.id} plant={p} />)}
          </div>
        </section>
      </div>
    </main>
  );
}
