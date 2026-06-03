'use client';
import Link from 'next/link';
import type { Plant } from '@/lib/plants';
import { useCart } from './CartContext';
import PlantMedia from './PlantMedia';
import Icon from './Icon';
import { inr } from '@/lib/format';

export default function PlantCard({ plant }: { plant: Plant }) {
  const { addToCart, toggleFav, fav } = useCart();
  const faved = !!fav[plant.id];
  return (
    <Link href={`/plant/${plant.id}`} className="pcard rise">
      <div className="pcard-media" style={{ background: `linear-gradient(150deg, ${plant.theme[0]}, ${plant.theme[1]})` }}>
        {plant.badge && <span className={'pcard-tag' + (plant.badge.includes('off') ? ' accent' : '')}>{plant.badge}</span>}
        <button
          className={'pcard-fav' + (faved ? ' on' : '')}
          onClick={(e) => { e.preventDefault(); toggleFav(plant); }}
          aria-label="Save"
        >
          <Icon name="heart" size={16} stroke={2} style={{ fill: faved ? 'currentColor' : 'none' }} />
        </button>
        <Icon name={plant.icon} size={88} stroke={1.2} color="#2E7D32" style={{ opacity: 0.5 }} />
      </div>
      <div className="pcard-body">
        <p className="pcard-name">{plant.name}</p>
        <p className="pcard-bot">{plant.botanical}</p>
        <div className="pcard-foot">
          <span className="pcard-price">{inr(plant.price)}{plant.oldPrice && <span className="old">{inr(plant.oldPrice)}</span>}</span>
          <button className="pcard-add" onClick={(e) => { e.preventDefault(); addToCart(plant); }} aria-label="Add to cart">
            <Icon name="plus" size={18} stroke={2.2} color="#fff" />
          </button>
        </div>
      </div>
    </Link>
  );
}
