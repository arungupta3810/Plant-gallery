'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import Icon from '@/components/Icon';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: 'package' },
  { href: '/admin/plants', label: 'Plants', icon: 'leaf' },
  { href: '/admin/orders', label: 'Orders', icon: 'truck' },
];

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, authReady } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const allowed = user && user.role !== 'CUSTOMER';

  useEffect(() => {
    if (authReady && !allowed) router.replace('/login?next=/admin');
  }, [authReady, allowed, router]);

  if (!authReady || !allowed) {
    return <main><div className="wrap" style={{ padding: '60px 0' }}><p className="count-label">Checking access…</p></div></main>;
  }

  return (
    <main>
      <div className="wrap admin-shell">
        <aside className="admin-nav">
          <span className="eyebrow"><Icon name="shield" size={15} stroke={2} /> Admin</span>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={'admin-nav-link' + (pathname === n.href ? ' on' : '')}>
              <Icon name={n.icon} size={18} /> {n.label}
            </Link>
          ))}
          <Link href="/" className="admin-nav-link" style={{ marginTop: 'auto' }}><Icon name="arrowLeft" size={18} /> Back to site</Link>
        </aside>
        <section className="admin-main">{children}</section>
      </div>
    </main>
  );
}
