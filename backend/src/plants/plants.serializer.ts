// Maps a Prisma Plant (+relations) to the JSON shape the Next.js frontend uses.
// Keeping the wire shape close to the original lib/plants.ts Plant type minimizes
// frontend churn.

type PlantWithRelations = {
  id: string;
  slug: string;
  name: string;
  botanical: string;
  description: string;
  price: number;
  oldPrice: number | null;
  light: string;
  water: string;
  difficulty: string;
  petSafe: boolean;
  badge: string | null;
  icon: string;
  themeFrom: string;
  themeTo: string;
  category?: { name: string } | null;
  inventory?: { stock: number } | null;
  images?: { url: string; alt: string | null; isPrimary: boolean }[];
};

export function serializePlant(p: PlantWithRelations) {
  return {
    id: p.slug, // frontend routes on slug as the public id
    slug: p.slug,
    name: p.name,
    botanical: p.botanical,
    description: p.description,
    price: p.price,
    oldPrice: p.oldPrice ?? undefined,
    cat: p.category?.name ?? 'Indoor',
    light: p.light,
    water: p.water,
    difficulty: p.difficulty,
    petSafe: p.petSafe,
    badge: p.badge,
    icon: p.icon,
    theme: [p.themeFrom, p.themeTo] as [string, string],
    stock: p.inventory?.stock ?? 0,
    images: (p.images ?? []).map((i) => ({ url: i.url, alt: i.alt, isPrimary: i.isPrimary })),
  };
}
