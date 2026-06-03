import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
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
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

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

    // Notify the customer (if logged in) across in-app + email + WhatsApp.
    if (userId) {
      await this.notifications.notify({
        userId,
        type: 'ORDER_PLACED',
        title: `Order ${order.number} confirmed`,
        body: `Thanks ${order.name}! We've received your order of ${order.items.length} item(s) — total ₹${order.total.toLocaleString('en-IN')}. We'll let you know when it ships.`,
        href: `/order/${order.number}`,
        channels: ['inapp', 'email', 'whatsapp'],
        email: order.email,
        phone: order.phone ?? undefined,
      });
    } else {
      // Guest: no in-app inbox, but still send email/WhatsApp confirmation.
      // (notify() needs a userId for the in-app record, so dispatch channels directly is overkill here;
      //  guests get their confirmation on the order page. Email/WhatsApp for guests can be added later.)
    }

    // Notify admins/staff in-app of the new order.
    await this.notifications.notifyAdmins({
      type: 'ORDER_PLACED',
      title: `New order ${order.number}`,
      body: `${order.name} placed an order for ₹${order.total.toLocaleString('en-IN')} (${order.items.length} item(s)).`,
      href: `/admin/orders`,
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

    const updated = await this.prisma.order.update({
      where: { number },
      data: { status: dto.status },
      include: orderInclude,
    });

    // Notify the customer their order status changed.
    const label: Record<string, string> = {
      CONFIRMED: 'confirmed', PROCESSING: 'being prepared', SHIPPED: 'on its way',
      DELIVERED: 'delivered', CANCELLED: 'cancelled', PENDING: 'pending',
    };
    if (order.userId) {
      await this.notifications.notify({
        userId: order.userId,
        type: 'ORDER_STATUS',
        title: `Order ${order.number} ${label[dto.status] ?? dto.status.toLowerCase()}`,
        body: `Your order is now ${label[dto.status] ?? dto.status.toLowerCase()}.`,
        href: `/order/${order.number}`,
        channels: ['inapp', 'email', 'whatsapp'],
        email: order.email,
        phone: order.phone ?? undefined,
      });
    }

    return updated;
  }
}
