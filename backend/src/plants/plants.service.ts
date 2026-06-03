import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PlantQueryDto, UpsertPlantDto } from './dto';
import { serializePlant } from './plants.serializer';

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const include = { category: true, inventory: true, images: true } as const;

@Injectable()
export class PlantsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PlantQueryDto) {
    const where: Prisma.PlantWhereInput = { active: true };

    if (query.category === 'Pet-safe') {
      where.petSafe = true;
    } else if (query.category && query.category !== 'All plants') {
      where.category = { name: query.category };
    }

    if (query.light) {
      where.light = { in: query.light.split(',').map((s) => s.trim()).filter(Boolean) };
    }
    if (query.difficulty) {
      where.difficulty = { in: query.difficulty.split(',').map((s) => s.trim()).filter(Boolean) };
    }
    if (query.q) {
      const q = query.q.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { botanical: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    let orderBy: Prisma.PlantOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort === 'low') orderBy = { price: 'asc' };
    if (query.sort === 'high') orderBy = { price: 'desc' };

    const plants = await this.prisma.plant.findMany({ where, include, orderBy });
    return plants.map(serializePlant);
  }

  async findOne(slug: string) {
    const plant = await this.prisma.plant.findUnique({ where: { slug }, include });
    if (!plant) throw new NotFoundException('Plant not found');
    return serializePlant(plant);
  }

  async categories() {
    const cats = await this.prisma.category.findMany({ orderBy: { name: 'asc' } });
    return ['All plants', ...cats.map((c) => c.name), 'Pet-safe'];
  }

  async upsert(dto: UpsertPlantDto) {
    const slug = dto.slug || slugify(dto.name);
    const category = await this.prisma.category.upsert({
      where: { slug: slugify(dto.category) },
      update: {},
      create: { name: dto.category, slug: slugify(dto.category) },
    });

    const data = {
      name: dto.name,
      botanical: dto.botanical,
      description: dto.description ?? '',
      price: dto.price,
      oldPrice: dto.oldPrice ?? null,
      light: dto.light,
      water: dto.water,
      difficulty: dto.difficulty,
      petSafe: dto.petSafe ?? false,
      badge: dto.badge ?? null,
      icon: dto.icon ?? 'leaf',
      themeFrom: dto.theme?.[0] ?? '#D7E9D8',
      themeTo: dto.theme?.[1] ?? '#A5D6A7',
      categoryId: category.id,
    };

    const plant = await this.prisma.plant.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
      include,
    });

    if (dto.stock !== undefined) {
      await this.prisma.inventory.upsert({
        where: { plantId: plant.id },
        update: { stock: dto.stock },
        create: { plantId: plant.id, stock: dto.stock },
      });
    }
    return this.findOne(slug);
  }

  async remove(slug: string) {
    const plant = await this.prisma.plant.findUnique({ where: { slug } });
    if (!plant) throw new NotFoundException('Plant not found');
    await this.prisma.plant.delete({ where: { slug } });
    return { ok: true };
  }
}
