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
    // TODO: integrate real provider when EMAIL_* env vars are set.
    // e.g. nodemailer.createTransport({...}).sendMail(...)
    if (process.env.SMTP_HOST) {
      // Real sending would go here once credentials are provided.
      this.logger.log(`(SMTP configured) would send email to ${msg.to}: ${msg.subject}`);
      return;
    }
    this.logger.log(`📧 [DEV email] to=${msg.to} | ${msg.subject}\n   ${msg.body}`);
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
