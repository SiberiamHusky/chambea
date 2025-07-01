import { Module } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserController } from './user.controller';
import { UserQueryService } from './user.query.service';
import { UserRepository } from './user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    {
      provide: UserRepository,
      useFactory: (repo: Repository<User>) => new UserRepository(repo),
      inject: [getRepositoryToken(User)],
    },
    UserQueryService,
  ],
  controllers: [UserController],
  exports: [UserRepository, UserQueryService],
})
export class UserModule {}
