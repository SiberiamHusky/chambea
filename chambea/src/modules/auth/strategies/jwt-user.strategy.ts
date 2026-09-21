import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { JwtUserPayload } from '../interfaces/jwt-user-payload.interface';
import { UnauthorizedException } from '../../../exceptions/unauthorized.exception';
import { AccountStatus, UserType } from '../../../shared/enums';
import { UserQueryService } from '../../user/user.query.service';

@Injectable()
export class JwtUserStrategy extends PassportStrategy(Strategy, 'authUser') {
  private readonly adminEmails = new Set(
    (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );

  constructor(
    private readonly configService: ConfigService,
    private readonly userQueryService: UserQueryService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('jwt.publicKey'),
    });
  }

  // validate method is called by passport-jwt when it has verified the token signature
  async validate(payload: JwtUserPayload) {
    let user = await this.userQueryService.findByEmail(payload.email);
    if (!user) {
      throw UnauthorizedException.UNAUTHORIZED_ACCESS();
    }
    if (!user.email_verified) {
      throw UnauthorizedException.USER_NOT_VERIFIED();
    }

    if (this.adminEmails.has(user.email?.trim().toLowerCase()) && user.user_type !== UserType.ADMIN) {
      await this.userQueryService.update(user._id, {
        user_type: UserType.ADMIN,
        account_status: AccountStatus.ACTIVE,
        updatedAt: new Date(),
      });
      user = await this.userQueryService.findByEmail(payload.email);
    }

    delete user.password; // remove password from the user object
    return user;
  }
}
