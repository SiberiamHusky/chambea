import { AccountStatus } from 'src/shared/enums';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { User } from 'src/modules/user/user.entity';
import { UserQueryService } from '../../user/user.query.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly userQueryService: UserQueryService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3001/auth/google-redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { name, emails } = profile;
    const email = emails[0].value;
    try {
      let user = await this.userQueryService.findByEmail(email);
      if (!user) {
        user = new User();
        user.email = email;
        user.first_name = `${name.givenName} ${name.familyName}`;
        user.email_verified = true;
        user.account_status = AccountStatus.ACTIVE;
        // Si lo requieres, genera un registerCode para la sesión (para compatibilidad con la validación JWT)
        user = await this.userQueryService.create(user);
      }
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
