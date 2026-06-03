import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  // ----- Blog -----
  blogList() {
    return this.prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async blogOne(slug: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post || !post.published) throw new NotFoundException('Post not found');
    return post;
  }

  // ----- FAQ -----
  faqs() {
    return this.prisma.faq.findMany({ orderBy: { order: 'asc' } });
  }

  // ----- Banners -----
  banners() {
    return this.prisma.banner.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
  }
}
