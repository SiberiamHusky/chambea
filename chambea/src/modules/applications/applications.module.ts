import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { JobApplication } from './job-application.entity';
import { JobPosting } from '../jobs/job-posting.entity';
import { Worker } from '../worker/worker.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobApplication, JobPosting, Worker])],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
