import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { serializePlant } from '../plants/plants.serializer';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      include: { plant: { include: { category: true, inventory: true, images: true } } },
    });
    return items.map((i) => serializePlant(i.plant));
  }

  async toggle(userId: string, slug: string) {
    const plant = await this.prisma.plant.findUnique({ where: { slug } });
    if (!plant) throw new BadRequestException('Unknown plant');

    const existing = await this.prisma.wishlistItem.findUnique({
      where: { userId_plantId: { userId, plantId: plant.id } },
    });
    if (existing) {
      await this.prisma.wishlistItem.delete({ where: { id: existing.id } });
      return { slug, saved: false };
    }
    await this.prisma.wishlistItem.create({ data: { userId, plantId: plant.id } });
    return { slug, saved: true };
  }
}
