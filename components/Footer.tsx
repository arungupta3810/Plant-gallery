import Link from 'next/link';
import Logo from './Logo';
import Icon from './Icon';

const cols = [
  { h: 'Shop', items: [
    { t: 'All plants', href: '/shop' },
    { t: 'Indoor plants', href: '/shop' },
    { t: 'Pet-safe', href: '/shop' },
    { t: 'Track an order', href: '/track' },
  ] },
  { h: 'Learn', items: [
    { t: 'Plant care guides', href: '/journal' },
    { t: 'Journal', href: '/journal' },
    { t: 'Contact us', href: '/contact' },
    { t: 'My account', href: '/account' },
  ] },
];

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? '';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-top">
        <div>
          <Logo inverse />
          <p>Hand-grown, healthy plants matched to your space — delivered with everything you need to help them thrive.</p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <h5>{c.h}</h5>
            <ul>{c.items.map((i) => <li key={i.t}><Link href={i.href}>{i.t}</Link></li>)}</ul>
          </div>
        ))}
        <div>
          <h5>Get growing</h5>
          <p style={{ margin: '0 0 12px' }}>Care tips and new arrivals, monthly.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              placeholder="you@email.com"
              style={{ flex: 1, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 'var(--radius-md)', padding: '11px 14px', color: '#fff', fontSize: 14 }}
            />
            <button className="btn btn-primary btn-sm">Join</button>
          </div>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>© 2026 Plant Gallery. Grown with care.</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <a aria-label="Instagram" href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: '#B6CDB6' }}><Icon name="instagram" size={19} /></a>
          {WHATSAPP && <a aria-label="WhatsApp" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" style={{ color: '#B6CDB6' }}><Icon name="whatsapp" size={19} /></a>}
        </div>
      </div>
    </footer>
  );
}
