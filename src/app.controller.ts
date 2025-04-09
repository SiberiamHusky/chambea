import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
// import { GoogleOAuthGuard } from './modules/auth/guards/google-auth.guard';

@ApiTags('Health-check')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @Get()
  // @UseGuards(GoogleOAuthGuard)
  // async googleAuth(@Request() req) {
  //   return req;
  // }

  // @Get('google-redirect')
  // @UseGuards(GoogleOAuthGuard)
  // googleAuthRedirect(@Request() req) {
  //   return this.appService.googleLogin(req);
  // }
}
