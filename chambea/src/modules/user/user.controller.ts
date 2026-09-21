import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { Body, Controller, Delete, Get, HttpCode, Logger, Post, UseGuards } from '@nestjs/common';
import { GetProfileResDto } from './dtos';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtUserAuthGuard } from '../auth/guards/jwt-user-auth.guard';
import { SelectRoleDto } from './dtos/select-role.req.dto';
import { User } from './user.entity';
import { UserQueryService } from './user.query.service';

@ApiBearerAuth()
@ApiTags('User')
@UseGuards(JwtUserAuthGuard)
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserQueryService) {}

  @HttpCode(200)
  @ApiOkResponse({
    type: GetProfileResDto,
  })
  @Get('me')
  async getFullAccess(@GetUser() user: User): Promise<GetProfileResDto> {
    this.logger.debug(`User ${user.email} requested their profile`);
    return {
      message: 'Profile retrieved successfully',
      user,
    };
  }

  @HttpCode(200)
  @Post('select-role')
  @ApiOkResponse({ description: 'Rol seleccionado exitosamente' })
  @ApiBadRequestResponse({ description: 'No autorizado o ya tiene rol' })
  async selectRole(@GetUser() user: User, @Body() dto: SelectRoleDto) {
    this.logger.debug(`User ${user.email} is selecting role ${dto.user_type}`);
    await this.userService.selectUserRole(user._id, dto.user_type);
    return { message: `Rol seleccionado: ${dto.user_type}` };
  }

  @HttpCode(200)
  @Delete('me')
  @ApiOkResponse({ description: 'Cuenta eliminada permanentemente' })
  @ApiBadRequestResponse({ description: 'Usuario no encontrado o error al eliminar' })
  async deleteMe(@GetUser() user: User) {
    this.logger.debug(`User ${user.email} requested HARD account deletion`);
    return this.userService.deleteAccountHard(user._id);
  }
}
