import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLeadDto, userId?: string) {
    const lead = await this.prisma.lead.create({
      data: { ...dto, userId: userId ?? null },
    });
    // Phase 2 hook: notification dispatch (email/WhatsApp) would fire here.
    return { ok: true, id: lead.id };
  }

  // ----- Admin -----
  listAll() {
    return this.prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
