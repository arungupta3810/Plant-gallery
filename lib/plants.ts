export type Plant = {
  id: string;
  slug?: string;
  name: string;
  botanical: string;
  description?: string;
  price: number;
  oldPrice?: number;
  cat: string;
  light: string;
  water: string;
  difficulty: string;
  petSafe: boolean;
  badge: string | null;
  icon: string;
  theme: [string, string];
  stock?: number;
  images?: { url: string; alt: string | null; isPrimary: boolean }[];
};

export const PLANTS: Plant[] = [
  { id: 'monstera', name: 'Swiss Cheese Plant', botanical: 'Monstera deliciosa', price: 48, cat: 'Indoor', light: 'Bright, indirect', water: 'Weekly', difficulty: 'Easy', petSafe: false, badge: 'New', icon: 'leaf', theme: ['#D7E9D8', '#A5D6A7'] },
  { id: 'snake', name: 'Snake Plant', botanical: 'Sansevieria trifasciata', price: 32, cat: 'Low light', light: 'Low to bright', water: 'Every 2–3 wks', difficulty: 'Hard to kill', petSafe: false, badge: null, icon: 'sprout', theme: ['#E6E3DA', '#C9D6C2'] },
  { id: 'fiddle', name: 'Fiddle Leaf Fig', botanical: 'Ficus lyrata', price: 64, oldPrice: 80, cat: 'Statement', light: 'Bright, indirect', water: 'Weekly', difficulty: 'Fussy', petSafe: false, badge: '20% off', icon: 'tree', theme: ['#DCEAD9', '#9FCBA0'] },
  { id: 'pothos', name: 'Golden Pothos', botanical: 'Epipremnum aureum', price: 24, cat: 'Hanging', light: 'Low to bright', water: 'Weekly', difficulty: 'Hard to kill', petSafe: false, badge: 'Bestseller', icon: 'leaf', theme: ['#EAF2E3', '#BFD9A0'] },
  { id: 'zz', name: 'ZZ Plant', botanical: 'Zamioculcas zamiifolia', price: 38, cat: 'Low light', light: 'Low to bright', water: 'Every 2–3 wks', difficulty: 'Hard to kill', petSafe: false, badge: null, icon: 'sprout', theme: ['#E2E8DA', '#AFC9A6'] },
  { id: 'calathea', name: 'Prayer Plant', botanical: 'Calathea orbifolia', price: 42, cat: 'Indoor', light: 'Medium, indirect', water: 'Keep moist', difficulty: 'Fussy', petSafe: true, badge: 'Pet-safe', icon: 'leaf', theme: ['#D4E7D6', '#A7D3A9'] },
  { id: 'rubber', name: 'Rubber Plant', botanical: 'Ficus elastica', price: 46, cat: 'Statement', light: 'Bright, indirect', water: 'Weekly', difficulty: 'Easy', petSafe: false, badge: null, icon: 'tree', theme: ['#E0EAD8', '#A9CFA0'] },
  { id: 'peace', name: 'Peace Lily', botanical: 'Spathiphyllum', price: 34, cat: 'Flowering', light: 'Low to medium', water: 'Weekly', difficulty: 'Easy', petSafe: false, badge: null, icon: 'flower', theme: ['#DDEBDB', '#A3D2A8'] },
  { id: 'aloe', name: 'Aloe Vera', botanical: 'Aloe barbadensis', price: 22, cat: 'Succulent', light: 'Bright, direct', water: 'Every 2–3 wks', difficulty: 'Hard to kill', petSafe: false, badge: null, icon: 'sprout', theme: ['#E8EEDD', '#C2D6A4'] },
  { id: 'spider', name: 'Spider Plant', botanical: 'Chlorophytum comosum', price: 26, cat: 'Hanging', light: 'Bright, indirect', water: 'Weekly', difficulty: 'Hard to kill', petSafe: true, badge: 'Pet-safe', icon: 'leaf', theme: ['#E4EFDD', '#B6D6A2'] },
  { id: 'palm', name: 'Areca Palm', botanical: 'Dypsis lutescens', price: 58, cat: 'Statement', light: 'Bright, indirect', water: 'Weekly', difficulty: 'Easy', petSafe: true, badge: 'Pet-safe', icon: 'tree', theme: ['#DBEAD7', '#A0CC9C'] },
  { id: 'philo', name: 'Heartleaf Philodendron', botanical: 'Philodendron hederaceum', price: 28, cat: 'Hanging', light: 'Low to bright', water: 'Weekly', difficulty: 'Easy', petSafe: false, badge: null, icon: 'leaf', theme: ['#E1ECDA', '#ACD0A4'] },
];

export const CATEGORIES = ['All plants', 'Indoor', 'Low light', 'Statement', 'Hanging', 'Flowering', 'Succulent', 'Pet-safe'];

export const getPlant = (id: string) => PLANTS.find((p) => p.id === id);
