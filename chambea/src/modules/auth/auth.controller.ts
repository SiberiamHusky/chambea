import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Body, Controller, Get, HttpCode, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginReqDto, LoginResDto, SignupReqDto, SignupResDto } from './dtos';
import { ForgotPasswordReqDto } from './dtos/forgot-password.req.dto';
import { ResetPasswordReqDto } from './dtos/reset-password.req.dto';

import { BadRequestException, InternalServerErrorException, UnauthorizedException } from '../../exceptions';
import { ResendOtpReqDto } from './dtos/resend-otp.req.dto';
import { ValidateOtpReqDto } from './dtos/otp-code.req.dto';

@ApiBadRequestResponse({
  type: BadRequestException,
})
@ApiInternalServerErrorResponse({
  type: InternalServerErrorException,
})
@ApiUnauthorizedResponse({
  type: UnauthorizedException,
})
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOkResponse({
    type: SignupResDto,
  })
  @HttpCode(200)
  @Post('signup')
  async signup(@Body(ValidationPipe) signupReqDto: SignupReqDto): Promise<SignupResDto> {
    return this.authService.signup(signupReqDto);
  }

  @ApiOkResponse({
    type: LoginResDto,
  })
  @HttpCode(200)
  @Post('login')
  async login(@Body(ValidationPipe) loginReqDto: LoginReqDto): Promise<LoginResDto> {
    return this.authService.login(loginReqDto);
  }

  // Endpoint para iniciar la autenticación con Google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Esta ruta redirigirá automáticamente a la pantalla de autenticación de Google
  }

  // Endpoint que maneja el callback de Google
  @Get('google-redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req): Promise<LoginResDto> {
    return this.authService.loginWithGoogle(req.user);
  }

  // endpoint para verificar el token de autenticación
  @ApiOkResponse({
    description: 'OTP validado correctamente',
  })
  @HttpCode(200)
  @Post('validate-otp')
  async validateOtp(@Body(ValidationPipe) validateOtpReqDto: ValidateOtpReqDto): Promise<{ isValid: boolean }> {
    const { email, code } = validateOtpReqDto;
    const isValid = await this.authService.validateOtp(email, code);
    return { isValid };
  }

  @ApiOkResponse({
    description: 'OTP reenviado correctamente',
  })
  @HttpCode(200)
  @Post('resend-otp')
  async resendOtp(@Body(ValidationPipe) resendOtpReqDto: ResendOtpReqDto): Promise<{ message: string }> {
    const { email } = resendOtpReqDto;
    await this.authService.resendOtp(email);
    return { message: 'OTP resent successfully' };
  }

  @ApiOkResponse({ description: 'Si el correo existe, se envió el email de recuperación' })
  @HttpCode(200)
  @Post('forgot-password')
  async forgotPassword(@Body(ValidationPipe) dto: ForgotPasswordReqDto): Promise<{ message: string }> {
    await this.authService.requestPasswordReset(dto.email);
    // No revelar si el email existe o no
    return { message: 'Si el correo existe, te enviamos instrucciones de recuperación.' };
  }

  @ApiOkResponse({ description: 'Contraseña actualizada correctamente' })
  @HttpCode(200)
  @Post('reset-password')
  async resetPassword(@Body(ValidationPipe) dto: ResetPasswordReqDto): Promise<{ message: string }> {
    await this.authService.resetPassword(dto);
    return { message: 'Tu contraseña ha sido actualizada.' };
  }
}
