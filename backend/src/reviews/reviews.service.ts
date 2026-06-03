import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  /** Public: list reviews for a plant plus the real average + count. */
  async forPlant(slug: string) {
    const plant = await this.prisma.plant.findUnique({ where: { slug } });
    if (!plant) throw new NotFoundException('Plant not found');

    const reviews = await this.prisma.review.findMany({
      where: { plantId: plant.id },
      orderBy: { createdAt: 'desc' },
    });

    const count = reviews.length;
    const average = count === 0 ? null : reviews.reduce((s, r) => s + r.rating, 0) / count;

    return {
      average,                              // null until at least one real review
      count,
      reviews: reviews.map((r) => ({
        id: r.id,
        author: r.authorName,
        rating: r.rating,
        body: r.body,
        createdAt: r.createdAt,
      })),
    };
  }

  /** Whether this user is allowed to review (purchased + not yet reviewed). */
  async eligibility(slug: string, userId: string) {
    const plant = await this.prisma.plant.findUnique({ where: { slug } });
    if (!plant) throw new NotFoundException('Plant not found');

    const purchased = await this.prisma.orderItem.findFirst({
      where: { plantId: plant.id, order: { userId } },
    });
    const existing = await this.prisma.review.findUnique({
      where: { userId_plantId: { userId, plantId: plant.id } },
    });
    return { canReview: !!purchased && !existing, hasPurchased: !!purchased, alreadyReviewed: !!existing };
  }

  /** Create a review — verified buyers only, one per plant. */
  async create(slug: string, userId: string, dto: CreateReviewDto) {
    const plant = await this.prisma.plant.findUnique({ where: { slug } });
    if (!plant) throw new NotFoundException('Plant not found');

    const purchased = await this.prisma.orderItem.findFirst({
      where: { plantId: plant.id, order: { userId } },
    });
    if (!purchased) throw new ForbiddenException('Only customers who bought this plant can review it.');

    const existing = await this.prisma.review.findUnique({
      where: { userId_plantId: { userId, plantId: plant.id } },
    });
    if (existing) throw new BadRequestException('You have already reviewed this plant.');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    await this.prisma.review.create({
      data: {
        plantId: plant.id,
        userId,
        authorName: user?.name ?? 'Customer',
        rating: dto.rating,
        body: dto.body,
      },
    });
    return this.forPlant(slug);
  }
}
