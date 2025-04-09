import * as bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtUserPayload } from './interfaces/jwt-user-payload.interface';
import { LoginReqDto, LoginResDto, SignupReqDto, SignupResDto } from './dtos';

import { User } from '../user/user.entity';
import { UserQueryService } from '../user/user.query.service';

import { BadRequestException } from '../../exceptions/bad-request.exception';
import { UnauthorizedException } from '../../exceptions/unauthorized.exception';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

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
      verified: true,
      registerCode: this.generateCode(),
      verificationCode: null,
      verificationCodeExpiry: null,
      resetToken: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      _id: undefined,
    };

    await this.userQueryService.create(userPayload);

    return {
      message: 'User created successfully',
    };
  }

  generateCode(): number {
    const OTP_MIN = 100000;
    const OTP_MAX = 999999;
    return Math.floor(Math.random() * (OTP_MAX - OTP_MIN + 1)) + OTP_MIN;
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
