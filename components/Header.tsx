'use client';
import Link from 'next/link';
import Logo from './Logo';
import Icon from './Icon';
import { useCart } from './CartContext';
import NotificationBell from './NotificationBell';

export default function Header() {
  const { cartCount, wishCount, setDrawer, user } = useCart();
  return (
    <>
      <div className="announce">
        <Icon name="truck" size={16} stroke={2} color="#A5D6A7" />
        <span>Free delivery in Mumbai on orders over <strong>₹250</strong> · Healthy-arrival guarantee</span>
      </div>
      <header className="header">
        <div className="wrap header-inner">
          <Logo />
          <nav className="nav">
            <Link href="/shop">Shop</Link>
            <Link href="/journal">Plant care</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <div className="header-actions">
            <Link href="/shop" className="iconbtn" aria-label="Search"><Icon name="search" size={21} /></Link>
            <NotificationBell />
            <Link href={user ? '/account' : '/login'} className="iconbtn" aria-label="Account"><Icon name="user" size={21} /></Link>
            <Link href="/account" className="iconbtn" aria-label="Wishlist">
              <Icon name="heart" size={21} />
              {wishCount > 0 && <span className="count">{wishCount}</span>}
            </Link>
            <button className="iconbtn" aria-label="Cart" onClick={() => setDrawer(true)}>
              <Icon name="bag" size={21} />
              {cartCount > 0 && <span className="count">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
