import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { JwtUserPayload } from '../interfaces/jwt-user-payload.interface';
import { UnauthorizedException } from '../../../exceptions/unauthorized.exception';
import { UserQueryService } from '../../user/user.query.service';

@Injectable()
export class JwtUserStrategy extends PassportStrategy(Strategy, 'authUser') {
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
    const user = await this.userQueryService.findByEmail(payload.email);
    if (!user) {
      throw UnauthorizedException.UNAUTHORIZED_ACCESS();
    }
    if (!user.email_verified) {
      throw UnauthorizedException.USER_NOT_VERIFIED();
    }
    delete user.password; // remove password from the user object
    return user;
  }
}
