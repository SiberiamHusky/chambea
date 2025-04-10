import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, HttpCode, Logger, UseGuards } from '@nestjs/common';
import { GetProfileResDto } from './dtos';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtUserAuthGuard } from '../auth/guards/jwt-user-auth.guard';
import { User } from './user.entity';

@ApiBearerAuth()
@ApiTags('User')
@UseGuards(JwtUserAuthGuard)
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  @HttpCode(200)
  @ApiOkResponse({
    type: GetProfileResDto,
  })
  @Get('me')
  async getFullAccess(@GetUser() user: User): Promise<GetProfileResDto> {
    this.logger.debug(`User ${user.email} requested their profile`);
    // Retorno del usuario logeado
    return {
      message: 'Profile retrieved successfully',
      user,
    };
  }
}
