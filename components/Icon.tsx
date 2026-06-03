import {
  Leaf, Sprout, Sun, Droplet, Droplets, Thermometer, Scissors, Shield, Ruler,
  ShoppingBag, ShoppingCart, Heart, Search, User, Truck, Menu, ChevronRight,
  ChevronLeft, ChevronDown, Plus, Minus, X, Star, Check, Filter, Package, Bell,
  MapPin, Phone, Instagram, ArrowRight, ArrowLeft, TreeDeciduous, Trash2, Flower2,
  Clock, RefreshCw, MessageCircle, type LucideIcon,
} from 'lucide-react';

const MAP: Record<string, LucideIcon> = {
  leaf: Leaf, sprout: Sprout, sun: Sun, droplet: Droplet, droplets: Droplets,
  thermometer: Thermometer, scissors: Scissors, shield: Shield, ruler: Ruler,
  bag: ShoppingBag, cart: ShoppingCart, heart: Heart, search: Search, user: User,
  truck: Truck, menu: Menu, chevronRight: ChevronRight, chevronLeft: ChevronLeft,
  chevronDown: ChevronDown, plus: Plus, minus: Minus, x: X, star: Star, check: Check,
  filter: Filter, package: Package, bell: Bell, mapPin: MapPin, phone: Phone,
  instagram: Instagram, arrowRight: ArrowRight, arrowLeft: ArrowLeft, tree: TreeDeciduous,
  trash: Trash2, flower: Flower2, clock: Clock, refresh: RefreshCw, whatsapp: MessageCircle,
};

export default function Icon({
  name, size = 24, stroke = 1.75, color = 'currentColor', className, style,
}: {
  name: string; size?: number; stroke?: number; color?: string;
  className?: string; style?: React.CSSProperties;
}) {
  const C = MAP[name] ?? Leaf;
  return <C size={size} strokeWidth={stroke} color={color} className={className} style={style} />;
}
