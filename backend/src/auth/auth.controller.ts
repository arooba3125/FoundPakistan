import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto, VerifyOtpDto, ResendOtpDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req) {
    // Extract IP address from request
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'Unknown';
    return this.authService.login(loginDto, ipAddress);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Request() req) {
    // Extract IP address from request for login notification (if admin login)
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
    return this.authService.verifyOtp(verifyOtpDto, ipAddress);
  }

  @Post('resend-otp')
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return {
      message: 'This is a protected route',
      user: req.user,
    };
  }
}
