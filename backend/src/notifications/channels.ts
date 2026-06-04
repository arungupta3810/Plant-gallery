import { Injectable, Logger } from '@nestjs/common';

// A channel knows how to deliver a message over one medium.
// Today email/WhatsApp log to the console; swap the body of `send` for a real
// provider (Nodemailer/SendGrid, Twilio/Meta WhatsApp) without touching callers.

export type ChannelMessage = {
  to: string; // email address or phone number
  subject: string;
  body: string;
};

export interface NotificationChannel {
  readonly name: string;
  send(msg: ChannelMessage): Promise<void>;
}

@Injectable()
export class EmailChannel implements NotificationChannel {
  readonly name = 'email';
  private readonly logger = new Logger('EmailChannel');

  async send(msg: ChannelMessage): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;

    // No key configured → dev mode: log instead of sending, so the app works
    // end-to-end without a provider account.
    if (!apiKey) {
      this.logger.log(`📧 [DEV email] to=${msg.to} | ${msg.subject}\n   ${msg.body}`);
      return;
    }

    // Real delivery via Resend (https://resend.com) — plain REST, no SDK needed.
    // EMAIL_FROM defaults to Resend's shared testing sender, which works
    // immediately; set it to an address on your verified domain for production.
    const from = process.env.EMAIL_FROM ?? 'Plant Gallery <onboarding@resend.dev>';
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: msg.to,
        subject: msg.subject,
        // body is plain text; wrap newlines so it renders as HTML too.
        html: msg.body.replace(/\n/g, '<br>'),
        text: msg.body,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Resend responded ${res.status}: ${detail}`);
    }
    this.logger.log(`📧 sent email to ${msg.to}: ${msg.subject}`);
  }
}

@Injectable()
export class WhatsAppChannel implements NotificationChannel {
  readonly name = 'whatsapp';
  private readonly logger = new Logger('WhatsAppChannel');

  async send(msg: ChannelMessage): Promise<void> {
    // TODO: integrate Twilio / Meta WhatsApp Business API when WHATSAPP_* env vars are set.
    if (process.env.WHATSAPP_API_TOKEN) {
      this.logger.log(`(WhatsApp configured) would send WhatsApp to ${msg.to}: ${msg.subject}`);
      return;
    }
    this.logger.log(`💬 [DEV WhatsApp] to=${msg.to} | ${msg.body}`);
  }
}
