// mail/mail.service.ts
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { SentMessageInfo } from 'nodemailer';
import { TemplateService } from './template.service';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly templateService: TemplateService,
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<boolean>('SMTP_SECURE'),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendMail(options: {
    to: string;
    subject: string;
    template?: string;
    context?: Record<string, any>;
    text?: string;
    html?: string;
  }): Promise<SentMessageInfo> {
    let { html } = options;

    if (options.template) {
      html = this.templateService.compileTemplate(options.template, options.context || {});
    }

    const mailOptions = {
      from: this.configService.get<string>('SMTP_FROM'),
      ...options,
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      throw new Error(`Error sending email: ${error.message}`);
    }
  }

  async sendOtpEmail(email: string, name: string, otp: string): Promise<SentMessageInfo> {
    return this.sendMail({
      to: email,
      subject: 'Tu código de verificación',
      template: 'otp-email',
      context: {
        name,
        otp,
        expiration: this.configService.get<number>('OTP_EXPIRATION_MINUTES'),
      },
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<SentMessageInfo> {
    return this.sendMail({
      to: email,
      subject: 'Bienvenido a nuestro servicio',
      template: 'welcome',
      context: { name },
    });
  }
}
