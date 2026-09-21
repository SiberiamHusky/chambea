import { Module } from '@nestjs/common';
import { JobPosting } from '../jobs/job-posting.entity';
import { JobsModule } from '../jobs/jobs.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([JobPosting]), JobsModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
