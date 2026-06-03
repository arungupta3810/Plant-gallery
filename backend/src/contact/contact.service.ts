import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateLeadDto } from './dto';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(dto: CreateLeadDto, userId?: string) {
    const lead = await this.prisma.lead.create({
      data: { ...dto, userId: userId ?? null },
    });

    // Alert admins/staff in-app + email about the new inquiry.
    await this.notifications.notifyAdmins({
      type: 'NEW_LEAD',
      title: 'New customer inquiry',
      body: `${dto.name} (${dto.email}) wrote: "${dto.message.slice(0, 120)}"`,
      href: '/admin/leads',
      channels: ['inapp', 'email'],
    });

    return { ok: true, id: lead.id };
  }

  // ----- Admin -----
  listAll() {
    return this.prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
