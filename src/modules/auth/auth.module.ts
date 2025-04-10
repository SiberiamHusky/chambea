import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { GoogleStrategy } from './strategies/google.strategy';
import { JwtUserStrategy } from './strategies/jwt-user.strategy';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        privateKey: configService.get('jwt.privateKey'),
        publicKey: configService.get('jwt.publicKey'),
        signOptions: { expiresIn: configService.get('jwt.expiresIn'), algorithm: 'RS256' },
        verifyOptions: {
          algorithms: ['RS256'],
        },
      }),
    }),
    UserModule,
  ],
  providers: [JwtUserStrategy, GoogleStrategy, AuthService],
  controllers: [AuthController],
  exports: [JwtUserStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
