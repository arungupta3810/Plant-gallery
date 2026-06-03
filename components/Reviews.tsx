'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, type ReviewSummary, type ReviewEligibility } from '@/lib/api';
import { useCart } from './CartContext';
import Icon from './Icon';

function Stars({ value, onPick }: Readonly<{ value: number; onPick?: (n: number) => void }>) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={onPick ? () => onPick(n) : undefined}
          style={{ background: 'none', border: 'none', padding: 0, cursor: onPick ? 'pointer' : 'default', lineHeight: 0 }}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Icon name="star" size={onPick ? 24 : 16} stroke={1.5} color={n <= value ? '#E0A24A' : '#E6E3DA'} style={{ fill: n <= value ? '#E0A24A' : 'none' }} />
        </button>
      ))}
    </span>
  );
}

export default function Reviews({ slug }: Readonly<{ slug: string }>) {
  const { user, authReady } = useCart();
  const [data, setData] = useState<ReviewSummary | null>(null);
  const [elig, setElig] = useState<ReviewEligibility | null>(null);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => api.reviews(slug).then(setData).catch(() => {});
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [slug]);

  useEffect(() => {
    if (authReady && user) api.reviewEligibility(slug).then(setElig).catch(() => setElig(null));
    else setElig(null);
  }, [authReady, user, slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) { setError('Please pick a star rating.'); return; }
    setBusy(true);
    setError(null);
    try {
      const updated = await api.addReview(slug, { rating, body });
      setData(updated);
      setRating(0);
      setBody('');
      setElig((el) => (el ? { ...el, canReview: false, alreadyReviewed: true } : el));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit review');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <span className="eyebrow"><Icon name="star" size={15} stroke={2} /> Reviews</span>
          <h2>{data && data.count > 0 ? `What customers say (${data.count})` : 'Customer reviews'}</h2>
        </div>
      </div>

      {/* Review form for verified buyers */}
      {authReady && (
        elig?.canReview ? (
          <form className="review-form" onSubmit={submit}>
            <h4>Write a review</h4>
            <p className="count-label" style={{ marginBottom: 12 }}>You bought this plant — share how it&apos;s doing.</p>
            <Stars value={rating} onPick={setRating} />
            <label className="field" style={{ marginTop: 12 }}>
              <span>Your review</span>
              <textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} required minLength={3} placeholder="How has this plant settled in?" />
            </label>
            {error && <p className="form-error">{error}</p>}
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Posting…' : 'Post review'}</button>
          </form>
        ) : user && elig?.alreadyReviewed ? (
          <p className="count-label review-note"><Icon name="check" size={14} /> Thanks — you&apos;ve reviewed this plant.</p>
        ) : user && !elig?.hasPurchased ? (
          <p className="count-label review-note">Only customers who&apos;ve bought this plant can review it.</p>
        ) : !user ? (
          <p className="count-label review-note"><Link href="/login" className="link-arrow" style={{ fontSize: 14 }}>Log in</Link> to review a plant you&apos;ve bought.</p>
        ) : null
      )}

      {/* Review list */}
      {data && data.count > 0 ? (
        <div className="review-list">
          {data.reviews.map((r) => (
            <div className="review" key={r.id}>
              <div className="review-top">
                <strong>{r.author}</strong>
                <Stars value={r.rating} />
              </div>
              <p>{r.body}</p>
              <span className="count-label">{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty" style={{ padding: '36px 20px' }}>
          <span className="ic"><Icon name="star" size={26} /></span>
          <h4>No reviews yet</h4>
          <p>Be the first to share how this plant is doing in your home.</p>
        </div>
      )}
    </section>
  );
}
