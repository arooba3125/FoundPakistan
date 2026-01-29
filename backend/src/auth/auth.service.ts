import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { SignupDto, LoginDto, VerifyOtpDto, ResendOtpDto } from './dto/auth.dto';
import {
  generateOtp,
  hashOtp,
  verifyOtp,
  isOtpExpired,
  createOtpExpiration,
} from './utils/otp.util';
import { isValidEmailFormat, isValidEmailDomain } from './utils/email.util';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, password, name } = signupDto;

    // Validate email format
    if (!isValidEmailFormat(email)) {
      throw new BadRequestException('Invalid email address format. Please provide a valid email address.');
    }

    // Check if user exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (NOT verified initially - needs OTP)
    const user = await this.usersService.create(
      email,
      hashedPassword,
      name,
    );

    // Generate and send OTP - get the OTP for debug purposes
    const debugOtp = await this.sendOtpToUserWithDebug(user.id, email);

    return {
      message: 'Account created successfully! Please check your email for the verification code.',
      email: email,
      requiresOtp: true,
      // Include debug OTP in response (remove in production later)
      ...(debugOtp && { debugOtp }),
    };
  }

  async login(loginDto: LoginDto, ipAddress?: string) {
    const { email, password, expectedRole } = loginDto;

    // Find user - check if email exists
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check role if expectedRole is provided
    if (expectedRole) {
      if (expectedRole === 'admin' && user.role !== 'admin') {
        throw new UnauthorizedException('This account is not an admin account. Please use the user login portal instead.');
      }
      if (expectedRole === 'user' && user.role === 'admin') {
        throw new UnauthorizedException('Admin accounts cannot login here. Please use the admin portal instead.');
      }
    }

    // Check if user is verified (must have verified email via OTP at signup)
    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email address first. Check your inbox for the verification code.');
    }

    // If admin, require OTP for login (additional security layer)
    if (user.role === 'admin') {
      try {
        // Generate and send OTP
        await this.sendOtpToUser(user.id, email);
        return {
          message: 'Please check your email for the verification code to complete login.',
          email: email,
          requiresOtp: true,
        };
      } catch (error) {
        // Log the error for debugging
        console.error('Failed to send OTP to admin:', error);
        // Re-throw with a user-friendly message
        throw new BadRequestException(
          error.message || 'Failed to send verification code. Please try again or contact support.'
        );
      }
    }

    // Regular users: Generate JWT token immediately (no OTP required)
    const token = this.generateToken(user.id, user.email, user.role);

    // Send login notification email (non-blocking - don't wait for it)
    this.emailService.sendLoginNotificationEmail(email, new Date(), ipAddress).catch((error) => {
      // Log error but don't fail the login
      console.error('Failed to send login notification email:', error);
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto, ipAddress?: string) {
    const { email, otp } = verifyOtpDto;

    // Find user
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if OTP exists
    if (!user.otpHash || !user.otpExpiresAt) {
      throw new BadRequestException('No OTP found. Please request a new one.');
    }

    // Check if OTP expired
    if (isOtpExpired(user.otpExpiresAt)) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    // Check attempt limit (3 attempts)
    if (user.otpAttempts >= 3) {
      throw new HttpException('Too many failed attempts. Please request a new OTP.', HttpStatus.TOO_MANY_REQUESTS);
    }

    // Verify OTP
    const isOtpValid = await verifyOtp(otp, user.otpHash);
    if (!isOtpValid) {
      // Increment attempts
      await this.usersService.incrementOtpAttempts(user.id);
      throw new UnauthorizedException('Invalid OTP. Please try again.');
    }

    // OTP is valid - clear OTP data
    await this.usersService.clearOtpData(user.id);
    
    // Determine if this is signup (user not verified) or login (user already verified)
    const isSignup = !user.isVerified;
    
    // Mark user as verified (if signup)
    if (isSignup) {
      user.isVerified = true;
      await this.usersRepository.save(user);
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.email, user.role);

    // If admin login (user already verified), send login notification email
    if (!isSignup && user.role === 'admin' && ipAddress) {
      // Send login notification email (non-blocking - don't wait for it)
      this.emailService.sendLoginNotificationEmail(email, new Date(), ipAddress).catch((error) => {
        // Log error but don't fail the login
        console.error('Failed to send admin login notification email:', error);
      });
    }

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }

  async resendOtp(resendOtpDto: ResendOtpDto) {
    const { email } = resendOtpDto;

    // Validate email format
    if (!isValidEmailFormat(email)) {
      throw new BadRequestException('Invalid email address format. Please provide a valid email address.');
    }

    // Find user
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email address');
    }

    // Send new OTP
    await this.sendOtpToUser(user.id, email);

    return {
      message: 'A new verification code has been sent to your email.',
      email: email,
    };
  }

  private async sendOtpToUserWithDebug(userId: string, email: string): Promise<string | null> {
    // Same as sendOtpToUser but returns OTP if email fails (for debugging)
    if (!isValidEmailFormat(email)) {
      throw new BadRequestException('Invalid email address format.');
    }

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const otpExpiresAt = createOtpExpiration();

    await this.usersService.updateOtpData(userId, otpHash, otpExpiresAt);

    try {
      await this.emailService.sendOtpEmail(email, otp);
      console.log(`OTP sent successfully to ${email}`);
      return null; // Email sent successfully, don't return OTP
    } catch (error) {
      console.error(`Failed to send OTP email to ${email}:`, error);
      console.log(`⚠️ EMAIL FAILED - OTP for ${email}: ${otp}`);
      return otp; // Return OTP for debugging when email fails
    }
  }

  private async sendOtpToUser(userId: string, email: string) {
    // Validate email format before sending
    if (!isValidEmailFormat(email)) {
      throw new BadRequestException('Invalid email address format. Please provide a valid email address.');
    }

    // Validate email domain (check if domain can receive emails)
    // Use a timeout to prevent DNS lookup from hanging
    try {
      const domainValidationPromise = isValidEmailDomain(email);
      const timeoutPromise = new Promise<boolean>((_, reject) => 
        setTimeout(() => reject(new Error('Email domain validation timeout')), 5000)
      );
      
      const isDomainValid = await Promise.race([domainValidationPromise, timeoutPromise]);
      
      if (!isDomainValid) {
        console.warn(`Email domain validation failed for ${email}, but proceeding anyway`);
        // Don't throw error - let SMTP handle delivery validation
      }
    } catch (error) {
      // If domain validation fails or times out, log but continue
      // Let the SMTP server handle the actual delivery validation
      console.warn(`Email domain validation error for ${email}:`, error.message);
    }

    // Generate OTP
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const otpExpiresAt = createOtpExpiration();

    // Save OTP data to user
    await this.usersService.updateOtpData(userId, otpHash, otpExpiresAt);

    // Send OTP email
    try {
      await this.emailService.sendOtpEmail(email, otp);
      console.log(`OTP sent successfully to ${email}`);
    } catch (error) {
      console.error(`Failed to send OTP email to ${email}:`, error);
      // In production, if email fails, still allow user to proceed with OTP shown in logs
      // This is a fallback - check Render logs for the OTP
      console.log(`⚠️ EMAIL FAILED - OTP for ${email}: ${otp}`);
      // Don't throw error - let user check logs or use debug endpoint
    }
  }

  async validateUser(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  private generateToken(userId: string, email: string, role: string): string {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }
}
