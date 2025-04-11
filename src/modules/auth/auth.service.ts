import * as bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { addMinutes } from 'date-fns';

import { JwtUserPayload } from './interfaces/jwt-user-payload.interface';
import { LoginReqDto, LoginResDto, SignupReqDto, SignupResDto } from './dtos';

import { User } from '../user/user.entity';
import { UserQueryService } from '../user/user.query.service';

import { BadRequestException } from '../../exceptions/bad-request.exception';
import { UnauthorizedException } from '../../exceptions/unauthorized.exception';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  private readonly OTP_EXPIRATION_MINUTES = 15;

  private readonly OTP_MIN = 100000;

  private readonly OTP_MAX = 999999;

  constructor(
    private readonly userQueryService: UserQueryService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupReqDto: SignupReqDto): Promise<SignupResDto> {
    const { email, password, name } = signupReqDto;

    const user = await this.userQueryService.findByEmail(email);
    if (user) {
      throw BadRequestException.RESOURCE_ALREADY_EXISTS(`User with email ${email} already exists`);
    }

    const saltOrRounds = this.SALT_ROUNDS;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);

    const userPayload: User = {
      email,
      password: hashedPassword,
      name,
      verified: false,
      registerCode: null,
      verificationCode: this.generateOtp(),
      verificationCodeExpiry: this.getOtpExpiration(),
      resetToken: null,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      _id: undefined,
    };

    await this.userQueryService.create(userPayload);

    return {
      message: 'User created successfully',
    };
  }

  generateOtp(): number {
    return Math.floor(Math.random() * (this.OTP_MAX - this.OTP_MIN + 1)) + this.OTP_MIN;
  }

  getOtpExpiration(): Date {
    return addMinutes(new Date(), this.OTP_EXPIRATION_MINUTES);
  }

  async validateOtp(email: string, code: number): Promise<boolean> {
    const user = await this.userQueryService.findByEmail(email);

    if (!user || !user.verificationCode || !user.verificationCodeExpiry) {
      return false;
    }

    // Verificar si el código coincide y no ha expirado
    const isValid = user.verificationCode === code && new Date() < user.verificationCodeExpiry;

    // Limpiar el OTP después de la validación (incluso si es inválido)
    if (isValid) {
      await this.clearOtp(user._id);
    }

    return isValid;
  }

  async clearOtp(userId: string): Promise<void> {
    const updateData = {
      verificationCode: null,
      verificationCodeExpiry: null,
      verified: true,
      isActive: true,
      updatedAt: new Date(),
    };

    await this.userQueryService.update(userId, updateData);
  }

  async resendOtp(email: string): Promise<void> {
    const user = await this.userQueryService.findByEmail(email);
    if (!user) {
      throw BadRequestException.RESOURCE_NOT_FOUND(`User with email ${email} not found`);
    }

    const updateData = {
      verificationCode: this.generateOtp(),
      verificationCodeExpiry: this.getOtpExpiration(),
      updatedAt: new Date(),
    };

    await this.userQueryService.update(user._id, updateData);
  }

  async login(loginReqDto: LoginReqDto): Promise<LoginResDto> {
    const { email, password } = loginReqDto;

    const user = await this.userQueryService.findByEmail(email);
    if (!user) {
      throw UnauthorizedException.UNAUTHORIZED_ACCESS('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw UnauthorizedException.UNAUTHORIZED_ACCESS('Invalid credentials');
    }

    const payload: JwtUserPayload = {
      user: user._id,
      email: user.email,
      code: user.registerCode,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    delete user.password;

    return {
      message: 'Login successful',
      accessToken,
      user,
    };
  }

  async loginWithGoogle(user: User): Promise<LoginResDto> {
    const payload: JwtUserPayload = {
      user: user._id,
      email: user.email,
      code: user.registerCode,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    delete user.password;
    return {
      message: 'Login with Google successful',
      accessToken,
      user,
    };
  }
}
