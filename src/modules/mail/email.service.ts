// src/modules/mail/mail.service.ts
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private readonly templatesDir: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    // Verificar ruta de plantillas
    this.templatesDir = join(process.cwd(), 'src', 'templates', 'emails');
    this.verifyTemplates();
  }

  private verifyTemplates() {
    const requiredTemplates = ['otp-email.pug', 'welcome.pug'];

    requiredTemplates.forEach((template) => {
      const templatePath = join(this.templatesDir, template);
      if (!existsSync(templatePath)) {
        throw new Error(`Plantilla requerida no encontrada: ${templatePath}`);
      }
    });
  }

  async sendEmail(params: { to: string; subject: string; template: string; context: Record<string, any> }): Promise<boolean> {
    const templatePath = `./emails/${params.template}`;
    const fullPath = join(this.templatesDir, `${params.template}.pug`);

    if (!existsSync(fullPath)) {
      throw new Error(`Plantilla no encontrada: ${fullPath}`);
    }

    try {
      await this.mailerService.sendMail({
        to: params.to,
        subject: params.subject,
        template: templatePath,
        context: params.context,
      });
      return true;
    } catch (error) {
      this.logger.error('Error enviando email', error.stack);
      throw error;
    }
  }
}
