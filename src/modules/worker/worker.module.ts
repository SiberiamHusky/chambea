import { Module } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { Worker } from './worker.entity';
import { WorkerController } from './worker.controller';
import { WorkerRepository } from './worker.repository';
import { WorkerService } from './worker.service';

@Module({
  imports: [TypeOrmModule.forFeature([Worker]), UserModule],
  providers: [
    {
      provide: WorkerRepository,
      useFactory: (repo: Repository<Worker>) => new WorkerRepository(repo),
      inject: [getRepositoryToken(Worker)],
    },
    WorkerService,
  ],
  controllers: [WorkerController],
  exports: [WorkerRepository],
})
export class WorkerModule {}
