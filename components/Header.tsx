'use client';
import Link from 'next/link';
import { useState } from 'react';
import Logo from './Logo';
import Icon from './Icon';
import { useCart } from './CartContext';
import NotificationBell from './NotificationBell';

export default function Header() {
  const { cartCount, wishCount, setDrawer, user } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div className="announce">
        <Icon name="truck" size={16} stroke={2} color="#A5D6A7" />
        <span>Free delivery in Mumbai on orders over <strong>₹250</strong> · Healthy-arrival guarantee</span>
      </div>
      <header className="header">
        <div className="wrap header-inner">
          <button
            className="iconbtn nav-toggle"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Icon name={menuOpen ? 'x' : 'menu'} size={22} />
          </button>
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
        {menuOpen && (
          <>
            <div className="mobile-nav-overlay" onClick={closeMenu} aria-hidden />
            <nav className="mobile-nav">
              <Link href="/shop" onClick={closeMenu}>Shop</Link>
              <Link href="/journal" onClick={closeMenu}>Plant care</Link>
              <Link href="/contact" onClick={closeMenu}>Contact</Link>
              <Link href={user ? '/account' : '/login'} onClick={closeMenu}>
                {user ? 'My account' : 'Sign in'}
              </Link>
            </nav>
          </>
        )}
      </header>
    </>
  );
}
