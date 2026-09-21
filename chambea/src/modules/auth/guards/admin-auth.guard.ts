import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { ForbiddenException } from '../../../exceptions';
import { UserType } from '../../../shared/enums';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.user_type !== UserType.ADMIN) {
      throw ForbiddenException.MISSING_PERMISSIONS('Solo los administradores pueden acceder a este recurso.');
    }

    return true;
  }
}
