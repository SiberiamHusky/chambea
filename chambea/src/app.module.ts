// Import required modules
import * as path from 'path';

import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { Module, ValidationError, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import application files
import { AppConfig } from './app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configuration } from './config';

// Import filters
import { AddressModule } from './modules/address/address.module';
import { AdminModule } from './modules/admin/admin.module';
import {
  AllExceptionsFilter,
  BadRequestExceptionFilter,
  ForbiddenExceptionFilter,
  NotFoundExceptionFilter,
  UnauthorizedExceptionFilter,
  ValidationExceptionFilter,
} from './filters';
import { ApplicationsModule } from './modules/applications/applications.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { CompanyModule } from './modules/company/company.module';
import { EmployerModule } from './modules/employer/employer.module';
import { GoogleStrategy } from './modules/auth/strategies/google.strategy';
import { JobsModule } from './modules/jobs/jobs.module';
import { SearchModule } from './modules/search/search.module';
import { User } from './modules/user/user.entity';
import { UserController } from './modules/user/user.controller';
import { UserModule } from './modules/user/user.module';
import { WorkerModule } from './modules/worker/worker.module';

// Import other modules

@Module({
  imports: [
    // Configure environment variables
    ConfigModule.forRoot({
      isGlobal: true, // Make the configuration global
      load: [configuration], // Load the environment variables from the configuration file
    }),

    // Configure logging
    LoggerModule.forRoot(AppConfig.getLoggerConfig()), // ! forRootAsync is not working with ConfigService in nestjs-pino

    // Configure the database
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USER || 'cheli',
      password: process.env.DB_PASSWORD || 'chelita123',
      database: process.env.DB_NAME || 'snorlarm',
      entities: [path.join(__dirname, '/**/*.entity{.ts,.js}')],
      migrations: [path.join(__dirname, '/migrations/*{.ts,.js}')],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([User]),
    // Import other modules
    AuthModule,
    UserModule,
    ChatModule,
    WorkerModule,
    EmployerModule,
    JobsModule,
    AddressModule,
    CompanyModule,
    ApplicationsModule,
    SearchModule,
    AdminModule,
  ],
  controllers: [AppController, UserController],
  providers: [
    AppService,
    GoogleStrategy,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_FILTER, useClass: ValidationExceptionFilter },
    { provide: APP_FILTER, useClass: BadRequestExceptionFilter },
    { provide: APP_FILTER, useClass: UnauthorizedExceptionFilter },
    { provide: APP_FILTER, useClass: ForbiddenExceptionFilter },
    { provide: APP_FILTER, useClass: NotFoundExceptionFilter },
    {
      // Allowing to do validation through DTO
      // Since class-validator library default throw BadRequestException, here we use exceptionFactory to throw
      // their internal exception so that filter can recognize it
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          exceptionFactory: (errors: ValidationError[]) => {
            return errors[0];
          },
        }),
    },
  ], // Define the application's service
})
export class AppModule {}
