import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailChannel } from '../notifications/channels';
import { SubscribeDto } from './dto';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger('Newsletter');

  constructor(
    private prisma: PrismaService,
    private email: EmailChannel,
  ) {}

  async subscribe(dto: SubscribeDto) {
    const email = dto.email.trim().toLowerCase();

    // Idempotent: re-subscribing an existing address is fine and won't error.
    // `active` is reset to true so a previously-unsubscribed address re-opts in.
    const existing = await this.prisma.newsletterSubscriber.findUnique({ where: { email } });
    await this.prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email },
      update: { active: true },
    });

    // Only send the welcome email on the first opt-in, so re-submits don't spam.
    const alreadySubscribed = existing?.active === true;
    if (!alreadySubscribed) {
      // Delivery failure must not break the signup — log and move on.
      this.email
        .send({
          to: email,
          subject: 'Welcome to Plant Gallery 🌱',
          body:
            'Thanks for joining the Plant Gallery list!\n\n' +
            'You will get care tips and first dibs on new arrivals, once a month — ' +
            'no clutter, just greenery.\n\n' +
            'Happy growing,\nThe Plant Gallery team',
        })
        .catch((e) => this.logger.warn(`welcome email failed for ${email}: ${e.message}`));
    }

    return { ok: true, alreadySubscribed };
  }
}
