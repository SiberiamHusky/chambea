import * as path from 'path';
import * as pug from 'pug';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TemplateService {
  private readonly templatesDir: string;

  constructor(private readonly configService: ConfigService) {
    this.templatesDir = path.join(__dirname, 'templates', 'emails');
  }

  compileTemplate(templateName: string, data: Record<string, any>): string {
    const templatePath = path.join(this.templatesDir, `${templateName}.pug`);
    const compiledFunction = pug.compileFile(templatePath);
    return compiledFunction({
      appName: this.configService.get<string>('APP_NAME'),
      ...data,
    });
  }
}
