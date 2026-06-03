import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Plant catalog — self-contained copy so the backend can move to its own repo.
const PLANTS = [
  { slug: 'monstera', name: 'Swiss Cheese Plant', botanical: 'Monstera deliciosa', price: 48, cat: 'Indoor', light: 'Bright, indirect', water: 'Weekly', difficulty: 'Easy', petSafe: false, badge: 'New', icon: 'leaf', theme: ['#D7E9D8', '#A5D6A7'], stock: 12 },
  { slug: 'snake', name: 'Snake Plant', botanical: 'Sansevieria trifasciata', price: 32, cat: 'Low light', light: 'Low to bright', water: 'Every 2–3 wks', difficulty: 'Hard to kill', petSafe: false, badge: null, icon: 'sprout', theme: ['#E6E3DA', '#C9D6C2'], stock: 20 },
  { slug: 'fiddle', name: 'Fiddle Leaf Fig', botanical: 'Ficus lyrata', price: 64, oldPrice: 80, cat: 'Statement', light: 'Bright, indirect', water: 'Weekly', difficulty: 'Fussy', petSafe: false, badge: '20% off', icon: 'tree', theme: ['#DCEAD9', '#9FCBA0'], stock: 6 },
  { slug: 'pothos', name: 'Golden Pothos', botanical: 'Epipremnum aureum', price: 24, cat: 'Hanging', light: 'Low to bright', water: 'Weekly', difficulty: 'Hard to kill', petSafe: false, badge: 'Bestseller', icon: 'leaf', theme: ['#EAF2E3', '#BFD9A0'], stock: 30 },
  { slug: 'zz', name: 'ZZ Plant', botanical: 'Zamioculcas zamiifolia', price: 38, cat: 'Low light', light: 'Low to bright', water: 'Every 2–3 wks', difficulty: 'Hard to kill', petSafe: false, badge: null, icon: 'sprout', theme: ['#E2E8DA', '#AFC9A6'], stock: 14 },
  { slug: 'calathea', name: 'Prayer Plant', botanical: 'Calathea orbifolia', price: 42, cat: 'Indoor', light: 'Medium, indirect', water: 'Keep moist', difficulty: 'Fussy', petSafe: true, badge: 'Pet-safe', icon: 'leaf', theme: ['#D4E7D6', '#A7D3A9'], stock: 9 },
  { slug: 'rubber', name: 'Rubber Plant', botanical: 'Ficus elastica', price: 46, cat: 'Statement', light: 'Bright, indirect', water: 'Weekly', difficulty: 'Easy', petSafe: false, badge: null, icon: 'tree', theme: ['#E0EAD8', '#A9CFA0'], stock: 11 },
  { slug: 'peace', name: 'Peace Lily', botanical: 'Spathiphyllum', price: 34, cat: 'Flowering', light: 'Low to medium', water: 'Weekly', difficulty: 'Easy', petSafe: false, badge: null, icon: 'flower', theme: ['#DDEBDB', '#A3D2A8'], stock: 16 },
  { slug: 'aloe', name: 'Aloe Vera', botanical: 'Aloe barbadensis', price: 22, cat: 'Succulent', light: 'Bright, direct', water: 'Every 2–3 wks', difficulty: 'Hard to kill', petSafe: false, badge: null, icon: 'sprout', theme: ['#E8EEDD', '#C2D6A4'], stock: 25 },
  { slug: 'spider', name: 'Spider Plant', botanical: 'Chlorophytum comosum', price: 26, cat: 'Hanging', light: 'Bright, indirect', water: 'Weekly', difficulty: 'Hard to kill', petSafe: true, badge: 'Pet-safe', icon: 'leaf', theme: ['#E4EFDD', '#B6D6A2'], stock: 18 },
  { slug: 'palm', name: 'Areca Palm', botanical: 'Dypsis lutescens', price: 58, cat: 'Statement', light: 'Bright, indirect', water: 'Weekly', difficulty: 'Easy', petSafe: true, badge: 'Pet-safe', icon: 'tree', theme: ['#DBEAD7', '#A0CC9C'], stock: 7 },
  { slug: 'philo', name: 'Heartleaf Philodendron', botanical: 'Philodendron hederaceum', price: 28, cat: 'Hanging', light: 'Low to bright', water: 'Weekly', difficulty: 'Easy', petSafe: false, badge: null, icon: 'leaf', theme: ['#E1ECDA', '#ACD0A4'], stock: 22 },
];

const CATEGORIES = ['Indoor', 'Low light', 'Statement', 'Hanging', 'Flowering', 'Succulent'];

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const BLOG = [
  { slug: 'is-your-plant-thirsty', title: 'How to tell when your plant is actually thirsty', excerpt: 'Stop guessing — three reliable signs your plant needs a drink.', tag: 'Watering', icon: 'droplets',
    body: 'Overwatering kills more houseplants than neglect ever will. Before you reach for the watering can, push a finger an inch into the soil. If it comes out dry and crumbly, it is time. If it is cool and damp, wait. Lift the pot too — a light pot means dry soil. Most plants would rather be a little too dry than soggy.' },
  { slug: 'reading-your-light', title: "Reading your room's light like a plant would", excerpt: 'Bright, indirect, low — what these labels actually mean for your space.', tag: 'Light', icon: 'sun',
    body: 'Stand where your plant will live at midday and hold up your hand. A sharp, crisp shadow means bright direct light. A soft, fuzzy shadow is bright indirect — what most houseplants love. Barely any shadow means low light, where snake plants and ZZ plants still thrive. Match the plant to the shadow and you are halfway there.' },
  { slug: 'first-trim', title: 'A gentle guide to your first trim', excerpt: 'Pruning feels scary. It is not. Here is where to start.', tag: 'Pruning', icon: 'scissors',
    body: 'Clean scissors, a calm afternoon, and a willingness to make a cut. Remove anything yellow, brown, or leggy first — that is easy and risk-free. To encourage bushier growth, snip just above a leaf node. Your plant will branch from there. Never remove more than a third at once and you cannot go far wrong.' },
];

const FAQS = [
  { question: 'How fast is delivery?', answer: 'Orders ship within 2–3 business days. Free delivery on orders over $75.', order: 1 },
  { question: 'What is the healthy-arrival guarantee?', answer: 'If your plant arrives damaged or unhealthy, contact us within 30 days for a free replacement or refund.', order: 2 },
  { question: 'Are your plants pet-safe?', answer: 'Some are! Look for the “Pet-safe” badge, or filter the shop by Pet-safe to see the full list.', order: 3 },
  { question: 'Do you offer plant care help?', answer: 'Every plant ships with a care card, and you can opt into watering reminders from your account.', order: 4 },
];

async function main() {
  console.log('Seeding…');

  // Admin + demo customer
  const adminPass = await bcrypt.hash('admin123', 10);
  const custPass = await bcrypt.hash('demo123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@plantgallery.test' },
    update: {},
    create: { email: 'admin@plantgallery.test', password: adminPass, name: 'Gallery Admin', role: Role.ADMIN },
  });
  await prisma.user.upsert({
    where: { email: 'demo@plantgallery.test' },
    update: {},
    create: { email: 'demo@plantgallery.test', password: custPass, name: 'Demo Customer', role: Role.CUSTOMER },
  });

  // Categories
  const catMap: Record<string, string> = {};
  for (const name of CATEGORIES) {
    const c = await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: { name },
      create: { name, slug: slugify(name) },
    });
    catMap[name] = c.id;
  }

  // Plants + inventory
  for (const p of PLANTS) {
    const plant = await prisma.plant.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name, botanical: p.botanical, price: p.price, oldPrice: p.oldPrice ?? null,
        light: p.light, water: p.water, difficulty: p.difficulty, petSafe: p.petSafe,
        badge: p.badge ?? null, icon: p.icon, themeFrom: p.theme[0], themeTo: p.theme[1],
        categoryId: catMap[p.cat],
      },
      create: {
        slug: p.slug, name: p.name, botanical: p.botanical, price: p.price, oldPrice: p.oldPrice ?? null,
        light: p.light, water: p.water, difficulty: p.difficulty, petSafe: p.petSafe,
        badge: p.badge ?? null, icon: p.icon, themeFrom: p.theme[0], themeTo: p.theme[1],
        categoryId: catMap[p.cat],
        description: `A leafy favourite that brings instant calm to a room. Easygoing, forgiving, and happiest in ${p.light.toLowerCase()} light.`,
      },
    });
    await prisma.inventory.upsert({
      where: { plantId: plant.id },
      update: { stock: p.stock },
      create: { plantId: plant.id, stock: p.stock },
    });
  }

  // Blog
  for (const b of BLOG) {
    await prisma.blogPost.upsert({
      where: { slug: b.slug },
      update: { title: b.title, excerpt: b.excerpt, body: b.body, tag: b.tag, icon: b.icon },
      create: b,
    });
  }

  // FAQs (clear + recreate, no natural key)
  await prisma.faq.deleteMany();
  for (const f of FAQS) await prisma.faq.create({ data: f });

  // Banner
  await prisma.banner.deleteMany();
  await prisma.banner.create({
    data: { title: 'Free delivery on orders over $75', subtitle: 'Healthy-arrival guarantee', href: '/shop', order: 1 },
  });

  console.log('Seed complete.');
  console.log('  Admin login:    admin@plantgallery.test / admin123');
  console.log('  Customer login: demo@plantgallery.test / demo123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
