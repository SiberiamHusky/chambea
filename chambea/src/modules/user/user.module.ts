import { Module } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserController } from './user.controller';
import { UserQueryService } from './user.query.service';
import { UserRepository } from './user.repository';
import { Employer } from '../employer/employer.entity';
import { Worker } from '../worker/worker.entity';
import { JobPosting } from '../jobs/job-posting.entity';
import { JobApplication } from '../applications/job-application.entity';
import { ChatMessage } from '../chat/chat-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Employer, Worker, JobPosting, JobApplication, ChatMessage])],
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
