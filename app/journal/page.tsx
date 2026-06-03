import Link from 'next/link';
import { api, type BlogPost } from '@/lib/api';
import Icon from '@/components/Icon';

export const dynamic = 'force-dynamic';

export default async function JournalPage() {
  let posts: BlogPost[] = [];
  try { posts = await api.blog(); } catch { /* empty state below */ }

  return (
    <main>
      <div className="wrap">
        <div className="crumbs">
          <Link href="/">Home</Link><span className="sep">/</span><span className="cur">Journal</span>
        </div>
        <div className="shop-head">
          <div>
            <span className="eyebrow"><Icon name="droplet" size={15} stroke={2} /> The journal</span>
            <h1>Plant care, made simple</h1>
            <p className="count-label">Honest, practical guides to help your plants thrive.</p>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="empty">
            <span className="ic"><Icon name="droplet" size={28} /></span>
            <h4>No guides yet</h4>
            <p>Check back soon — we&apos;re writing them.</p>
          </div>
        ) : (
          <div className="plant-grid cols-3">
            {posts.map((p) => (
              <Link key={p.slug} href={`/journal/${p.slug}`} className="pcard rise" style={{ textDecoration: 'none' }}>
                <div className="pcard-media" style={{ background: 'linear-gradient(150deg, #DCEAD9, #9FCBA0)' }}>
                  <Icon name={p.icon} size={72} stroke={1.2} color="#2E7D32" style={{ opacity: 0.5 }} />
                </div>
                <div className="pcard-body">
                  <span className="eyebrow" style={{ fontSize: 11 }}>{p.tag}</span>
                  <p className="pcard-name" style={{ marginTop: 6 }}>{p.title}</p>
                  <p className="pcard-bot">{p.excerpt}</p>
                  <span className="link-arrow" style={{ fontSize: 14, marginTop: 8 }}>Read guide <Icon name="arrowRight" size={15} stroke={2} /></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
