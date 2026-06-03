import { Injectable, Logger } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailChannel, WhatsAppChannel } from './channels';

type Channel = 'inapp' | 'email' | 'whatsapp';

export type NotifyInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  channels?: Channel[]; // defaults to ['inapp']
  // contact overrides; if omitted we look up the user's email/phone
  email?: string;
  phone?: string;
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger('Notifications');

  constructor(
    private prisma: PrismaService,
    private emailCh: EmailChannel,
    private waCh: WhatsAppChannel,
  ) {}

  /** Create an in-app notification and fan out to the requested channels. */
  async notify(input: NotifyInput) {
    const channels = input.channels ?? ['inapp'];

    // 1. In-app record (the bell). Always create if requested.
    let record: Awaited<ReturnType<typeof this.prisma.notification.create>> | null = null;
    if (channels.includes('inapp')) {
      record = await this.prisma.notification.create({
        data: {
          userId: input.userId,
          type: input.type,
          title: input.title,
          body: input.body,
          href: input.href,
        },
      });
    }

    // 2. External channels — never let a delivery failure break the caller.
    if (channels.includes('email') || channels.includes('whatsapp')) {
      const user = await this.prisma.user.findUnique({ where: { id: input.userId } });
      const to = input.email ?? user?.email;
      const phone = input.phone ?? user?.phone ?? undefined;

      if (channels.includes('email') && to) {
        this.emailCh.send({ to, subject: input.title, body: input.body }).catch((e) =>
          this.logger.warn(`email send failed: ${e.message}`),
        );
      }
      if (channels.includes('whatsapp') && phone) {
        this.waCh.send({ to: phone, subject: input.title, body: input.body }).catch((e) =>
          this.logger.warn(`whatsapp send failed: ${e.message}`),
        );
      }
    }

    return record;
  }

  /** Notify every admin/staff user (used for new orders, leads, low stock). */
  async notifyAdmins(input: Omit<NotifyInput, 'userId'>) {
    const admins = await this.prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'STAFF'] } },
      select: { id: true },
    });
    await Promise.all(admins.map((a) => this.notify({ ...input, userId: a.id })));
  }

  // ---- read APIs (the bell) ----

  async list(userId: string) {
    const items = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    const unread = await this.prisma.notification.count({ where: { userId, read: false } });
    return { items, unread };
  }

  async markRead(userId: string, id: string) {
    await this.prisma.notification.updateMany({ where: { id, userId }, data: { read: true } });
    return { ok: true };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
    return { ok: true };
  }
}
