import { Global, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { EmailChannel, WhatsAppChannel } from './channels';

@Global()
@Module({
  providers: [NotificationsService, EmailChannel, WhatsAppChannel],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
