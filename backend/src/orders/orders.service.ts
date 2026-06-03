import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';

const orderInclude = {
  items: { include: { plant: true } },
  payment: true,
} as const;

// Friendly tracking number e.g. PG-7K3Q2A
function genNumber() {
  const s = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '');
  return 'PG-' + s.slice(0, 6).padEnd(6, '0');
}

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto, userId?: string) {
    // Look up plants + prices server-side; never trust client prices.
    const slugs = dto.items.map((i) => i.slug);
    const plants = await this.prisma.plant.findMany({
      where: { slug: { in: slugs } },
      include: { inventory: true },
    });
    const bySlug = new Map(plants.map((p) => [p.slug, p]));

    const lines = dto.items.map((i) => {
      const plant = bySlug.get(i.slug);
      if (!plant) throw new BadRequestException(`Unknown plant: ${i.slug}`);
      if (plant.inventory && plant.inventory.stock < i.qty) {
        throw new BadRequestException(`Not enough stock for ${plant.name}`);
      }
      return { plant, qty: i.qty, price: plant.price };
    });

    // Free delivery above ₹250, otherwise a flat ₹49 (Mumbai, India — INR).
    const FREE_SHIPPING_THRESHOLD = 250;
    const FLAT_SHIPPING = 49;
    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const shipping = subtotal > FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING;
    const total = subtotal + shipping;
    const method = dto.paymentMethod ?? 'cod';

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          number: genNumber(),
          userId: userId ?? null,
          email: dto.email,
          name: dto.name,
          phone: dto.phone,
          shipLine1: dto.shipLine1,
          shipLine2: dto.shipLine2,
          shipCity: dto.shipCity,
          shipState: dto.shipState,
          shipZip: dto.shipZip,
          status: 'CONFIRMED',
          subtotal,
          shipping,
          total,
          items: {
            create: lines.map((l) => ({
              plantId: l.plant.id,
              name: l.plant.name,
              price: l.price,
              qty: l.qty,
            })),
          },
          payment: {
            create: {
              method,
              amount: total,
              status: method === 'card' ? 'PAID' : 'UNPAID',
            },
          },
        },
        include: orderInclude,
      });

      // Decrement inventory
      for (const l of lines) {
        if (l.plant.inventory) {
          await tx.inventory.update({
            where: { plantId: l.plant.id },
            data: { stock: { decrement: l.qty } },
          });
        }
      }
      return created;
    });

    return order;
  }

  async track(number: string) {
    const order = await this.prisma.order.findUnique({
      where: { number },
      include: orderInclude,
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async listForUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ----- Admin -----

  async listAll() {
    return this.prisma.order.findMany({
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(number: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { number } });
    if (!order) throw new NotFoundException('Order not found');
    return this.prisma.order.update({
      where: { number },
      data: { status: dto.status },
      include: orderInclude,
    });
  }
}
