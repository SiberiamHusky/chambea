import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendOtpEmail(email: string, name: string, otp: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Tu código de verificación',
        template: '../../templates/emails/otp-email', // Ruta relativa al directorio de plantillas
        context: {
          name,
          otp,
          appName: this.configService.get<string>('APP_NAME'),
          expiration: this.configService.get<number>('OTP_EXPIRATION_MINUTES', 15),
        },
      });
    } catch (error) {
      throw new Error(`Failed to send OTP email: ${error.message}`);
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Bienvenido a nuestro servicio',
      template: '../../templates/emails/welcome',
      context: {
        name,
        appName: this.configService.get<string>('APP_NAME'),
      },
    });
  }
}
