import * as bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { addMinutes } from 'date-fns';

import { JwtUserPayload } from './interfaces/jwt-user-payload.interface';
import { LoginReqDto, LoginResDto, SignupReqDto, SignupResDto } from './dtos';
import { ResetPasswordReqDto } from './dtos/reset-password.req.dto';

import { AccountStatus, UserType } from '../../shared/enums';
import { User } from '../user/user.entity';
import { UserQueryService } from '../user/user.query.service';

import { BadRequestException, UnauthorizedException } from '../../exceptions';
import { MailService } from '../mail/email.service';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  private readonly OTP_EXPIRATION_MINUTES = 15;

  private readonly OTP_MIN = 100000;

  private readonly OTP_MAX = 999999;

  private readonly adminEmails = new Set(
    (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );

  constructor(
    private readonly userQueryService: UserQueryService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async signup(signupReqDto: SignupReqDto): Promise<SignupResDto> {
    const { email, password, first_name, last_name, phone } = signupReqDto;

    const user = await this.userQueryService.findByEmail(email);
    if (user) {
      throw BadRequestException.RESOURCE_ALREADY_EXISTS(`User with email ${email} already exists`);
    }

    const saltOrRounds = this.SALT_ROUNDS;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);
    const otp = this.generateOtp();

    const userPayload: User = {
      email,
      phone,
      password: hashedPassword,
      user_type: UserType.PENDING,
      first_name,
      last_name,
      profile_picture_url: null,
      email_verified: false,
      phone_verified: false,
      verificationCode: otp,
      verificationCodeExpiry: this.getOtpExpiration(),
      account_status: AccountStatus.PENDING_VERIFICATION,
      createdAt: new Date(),
      updatedAt: new Date(),
      _id: undefined,
    };

    await this.userQueryService.create(userPayload);

    // Enviar correo de verificación
    await this.mailService.sendEmail({
      to: email,
      subject: 'Codigo de verificación',
      template: 'otp-email',
      context: {
        first_name,
        last_name,
        otp,
        expiration: this.OTP_EXPIRATION_MINUTES,
      },
    });

    return {
      message: 'User created successfully',
    };
  }

  generateOtp(): number {
    return Math.floor(Math.random() * (this.OTP_MAX - this.OTP_MIN + 1)) + this.OTP_MIN;
  }

  private isAdminEmail(email?: string | null): boolean {
    return !!email && this.adminEmails.has(email.trim().toLowerCase());
  }

  private async promoteToAdminIfNeeded(user: User): Promise<User> {
    if (!this.isAdminEmail(user?.email) || user.user_type === UserType.ADMIN) {
      return user;
    }

    await this.userQueryService.update(user._id, {
      user_type: UserType.ADMIN,
      account_status: AccountStatus.ACTIVE,
      updatedAt: new Date(),
    });

    return {
      ...user,
      user_type: UserType.ADMIN,
      account_status: AccountStatus.ACTIVE,
      updatedAt: new Date(),
    };
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
    const user = await this.userQueryService.findById(userId);
    const isAdmin = this.isAdminEmail(user?.email);
    const updateData = {
      verificationCode: null,
      verificationCodeExpiry: null,
      email_verified: true,
      user_type: isAdmin ? UserType.ADMIN : UserType.PENDING,
      account_status: isAdmin ? AccountStatus.ACTIVE : AccountStatus.PENDING_ROLE_SELECTION,
      updatedAt: new Date(),
    };

    await this.userQueryService.update(userId, updateData);
  }

  async resendOtp(email: string): Promise<void> {
    const user = await this.userQueryService.findByEmail(email);
    if (!user) {
      throw BadRequestException.RESOURCE_NOT_FOUND(`User with email ${email} not found`);
    }

    const otp = this.generateOtp();
    const updateData = {
      verificationCode: otp,
      verificationCodeExpiry: this.getOtpExpiration(),
      updatedAt: new Date(),
    };

    await this.userQueryService.update(user._id, updateData);

    // enviar el nuevo codigo de verificacion
    // await this.mailService.sendOtpEmail(email, user.name, otp.toString());
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
    };
    const accessToken = await this.jwtService.signAsync(payload);

    const normalizedUser = await this.promoteToAdminIfNeeded(user);

    delete normalizedUser.password;

    return {
      message: 'Login successful',
      accessToken,
      user: normalizedUser,
    };
  }

  async loginWithGoogle(user: User): Promise<LoginResDto> {
    const normalizedUser = await this.promoteToAdminIfNeeded(user);
    const payload: JwtUserPayload = {
      user: normalizedUser._id,
      email: normalizedUser.email,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    delete normalizedUser.password;
    return {
      message: 'Login with Google successful',
      accessToken,
      user: normalizedUser,
    };
  }

  async requestPasswordReset(email: string): Promise<void> {
    // No revelar si el email existe: siempre actuar como éxito
    const user = await this.userQueryService.findByEmail(email);
    if (!user) return;

    const token = await this.jwtService.signAsync({ email, purpose: 'password_reset' }, { expiresIn: '30m' });

    const clientBase = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${clientBase}/reset-password?token=${encodeURIComponent(token)}`;

    await this.mailService.sendEmail({
      to: email,
      subject: 'Recuperación de contraseña',
      template: 'password-reset',
      context: {
        first_name: user.first_name,
        reset_link: resetLink,
        expiration: '30 minutos',
      },
    });
  }

  async resetPassword(dto: ResetPasswordReqDto): Promise<void> {
    const { token, new_password } = dto;
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch (e) {
      throw BadRequestException.INVALID_INPUT('Token inválido o expirado');
    }

    if (!payload?.email || payload?.purpose !== 'password_reset') {
      throw BadRequestException.INVALID_INPUT('Token inválido');
    }

    const user = await this.userQueryService.findByEmail(payload.email);
    if (!user) {
      throw BadRequestException.RESOURCE_NOT_FOUND('Usuario no encontrado');
    }

    const saltOrRounds = this.SALT_ROUNDS;
    const hashedPassword = await bcrypt.hash(new_password, saltOrRounds);

    await this.userQueryService.update(user._id, {
      password: hashedPassword,
      updatedAt: new Date(),
    });
  }
}
