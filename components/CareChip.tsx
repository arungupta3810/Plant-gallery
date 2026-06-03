import Icon from './Icon';

export function CareChip({ icon, children, plain }: { icon: string; children: React.ReactNode; plain?: boolean }) {
  return (
    <span className={'chip' + (plain ? ' plain' : '')}>
      <Icon name={icon} size={15} stroke={1.9} />
      {children}
    </span>
  );
}

// Renders the real average rating. `value` is null when no reviews exist yet —
// in that case we show stars empty and a truthful "No reviews yet" label.
export function Rating({ value, count }: Readonly<{ value: number | null; count: number }>) {
  const avg = value ?? 0;
  return (
    <div className="rating">
      <span className="stars">
        {[0, 1, 2, 3, 4].map((i) => (
          <Icon key={i} name="star" size={16} stroke={1.5} color={i < Math.round(avg) ? '#E0A24A' : '#E6E3DA'}
            style={{ fill: i < Math.round(avg) ? '#E0A24A' : 'none' }} />
        ))}
      </span>
      {count > 0 ? (
        <span><strong style={{ color: 'var(--fg-1)' }}>{avg.toFixed(1)}</strong> · {count} {count === 1 ? 'review' : 'reviews'}</span>
      ) : (
        <span>No reviews yet</span>
      )}
    </div>
  );
}
