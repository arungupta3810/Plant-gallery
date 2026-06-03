'use client';
import Link from 'next/link';
import { useCart } from './CartContext';
import PlantMedia from './PlantMedia';
import Icon from './Icon';

export default function CartDrawer() {
  const { drawer, setDrawer, items, setQty, removeItem } = useCart();
  if (!drawer) return null;
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const shipping = subtotal >= 75 || subtotal === 0 ? 0 : 8;
  const close = () => setDrawer(false);

  return (
    <>
      <div className="overlay" onClick={close} />
      <aside className="drawer">
        <div className="drawer-head">
          <h3>Your cart {items.length > 0 && `(${items.reduce((s, i) => s + i.qty, 0)})`}</h3>
          <button className="iconbtn" onClick={close} aria-label="Close"><Icon name="x" size={22} /></button>
        </div>

        {items.length === 0 ? (
          <div className="drawer-body">
            <div className="empty">
              <span className="ic"><Icon name="bag" size={28} /></span>
              <h4>Your cart is looking bare</h4>
              <p>Let&apos;s fix that — find a plant you&apos;ll love.</p>
              <Link href="/shop" className="btn btn-primary" onClick={close}>Browse the collection</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="drawer-body">
              {items.map((it) => (
                <div className="cart-line" key={it.id}>
                  <PlantMedia plant={it} className="thumb" glyphSize={34} radius="var(--radius-md)" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="nm">{it.name}</p>
                    <p className="bt">{it.botanical}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div className="qty-sm">
                        <button onClick={() => setQty(it, it.qty - 1)}><Icon name="minus" size={15} /></button>
                        <span>{it.qty}</span>
                        <button onClick={() => setQty(it, it.qty + 1)}><Icon name="plus" size={15} /></button>
                      </div>
                      <span className="pr">{'$' + it.price * it.qty}</span>
                    </div>
                  </div>
                  <button className="cart-remove" onClick={() => removeItem(it)} aria-label="Remove"><Icon name="trash" size={17} /></button>
                </div>
              ))}
            </div>
            <div className="drawer-foot">
              <div className="summary-row"><span>Subtotal</span><span style={{ color: 'var(--fg-1)', fontWeight: 600 }}>{'$' + subtotal}</span></div>
              <div className="summary-row"><span>Shipping</span><span style={{ color: shipping === 0 ? 'var(--success-fg)' : 'var(--fg-1)', fontWeight: 600 }}>{shipping === 0 ? 'Free' : '$' + shipping}</span></div>
              <div className="summary-row total"><span>Total</span><span>{'$' + (subtotal + shipping)}</span></div>
              <Link href="/checkout" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 16 }} onClick={close}>{'Checkout · $' + (subtotal + shipping)}</Link>
              <button className="btn btn-ghost btn-block" style={{ marginTop: 8 }} onClick={close}>Continue shopping</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
