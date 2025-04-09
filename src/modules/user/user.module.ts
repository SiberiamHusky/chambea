import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserController } from './user.controller';
import { UserQueryService } from './user.query.service';
import { UserRepository } from './user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserQueryService, UserRepository],
  controllers: [UserController],
  exports: [UserQueryService],
})
export class UserModule {}
