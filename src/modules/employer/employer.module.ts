import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Employer } from './employer.entity';
import { EmployerController } from './employer.controller';
import { EmployerService } from './employer.service';

import { Address, Company } from '../../shared/entities';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employer, Company, Address]),
    UserModule, // Para acceder a UserQueryService
  ],
  providers: [EmployerService],
  controllers: [EmployerController],
  exports: [EmployerService],
})
export class EmployerModule {}
