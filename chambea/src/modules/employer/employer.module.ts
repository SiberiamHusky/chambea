import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Employer } from './employer.entity';
import { EmployerController } from './employer.controller';
import { EmployerService } from './employer.service';

import { Address, Company } from '../../shared/entities';
import { AddressModule } from '../address/address.module';
import { CompanyModule } from '../company/company.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employer, Company, Address]),
    UserModule, // Para acceder a UserQueryService
    AddressModule,
    CompanyModule,
  ],
  providers: [EmployerService],
  controllers: [EmployerController],
  exports: [EmployerService],
})
export class EmployerModule {}
