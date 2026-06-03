import Icon from './Icon';

export function CareChip({ icon, children, plain }: { icon: string; children: React.ReactNode; plain?: boolean }) {
  return (
    <span className={'chip' + (plain ? ' plain' : '')}>
      <Icon name={icon} size={15} stroke={1.9} />
      {children}
    </span>
  );
}

export function Rating({ value = 4.8, count = 124 }: { value?: number; count?: number }) {
  return (
    <div className="rating">
      <span className="stars">
        {[0, 1, 2, 3, 4].map((i) => (
          <Icon key={i} name="star" size={16} stroke={1.5} color={i < Math.round(value) ? '#E0A24A' : '#E6E3DA'}
            style={{ fill: i < Math.round(value) ? '#E0A24A' : 'none' }} />
        ))}
      </span>
      <span><strong style={{ color: 'var(--fg-1)' }}>{value}</strong> · {count} reviews</span>
    </div>
  );
}
