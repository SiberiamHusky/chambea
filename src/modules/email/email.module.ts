import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MailService } from './email.service';
import { TemplateService } from './template.service';

@Module({
  imports: [ConfigModule],
  providers: [MailService, TemplateService],
  exports: [MailService],
})
export class MailModule {}
