import type { Plant } from '@/lib/plants';
import Icon from './Icon';

export default function PlantMedia({
  plant, className, glyphSize = 96, radius,
}: {
  plant: Pick<Plant, 'theme' | 'icon'>; className?: string; glyphSize?: number; radius?: string;
}) {
  const [a, b] = plant.theme;
  return (
    <div className={className} style={{ background: `linear-gradient(150deg, ${a}, ${b})`, borderRadius: radius }}>
      <Icon name={plant.icon} size={glyphSize} stroke={1.2} color="#2E7D32" style={{ opacity: 0.5 }} />
    </div>
  );
}
