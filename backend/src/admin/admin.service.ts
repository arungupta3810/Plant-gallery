import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async stats() {
    const [plants, orders, customers, leads, revenueAgg, lowStock] = await Promise.all([
      this.prisma.plant.count(),
      this.prisma.order.count(),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.lead.count({ where: { status: 'NEW' } }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' } },
      }),
      this.prisma.inventory.findMany({
        where: { stock: { lte: 5 } },
        include: { plant: true },
        orderBy: { stock: 'asc' },
      }),
    ]);

    return {
      plants,
      orders,
      customers,
      newLeads: leads,
      revenue: revenueAgg._sum.total ?? 0,
      lowStock: lowStock.map((i) => ({ name: i.plant.name, slug: i.plant.slug, stock: i.stock })),
    };
  }
}
