import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { SignupDto, LoginDto, VerifyOtpDto, ResendOtpDto } from './dto/auth.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    private emailService;
    private usersRepository;
    constructor(usersService: UsersService, jwtService: JwtService, emailService: EmailService, usersRepository: Repository<User>);
    signup(signupDto: SignupDto): Promise<{
        message: string;
        email: string;
        requiresOtp: boolean;
    }>;
    login(loginDto: LoginDto): Promise<{
        message: string;
        email: string;
        requiresOtp: boolean;
    }>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import("../users/user.entity").UserRole;
            isVerified: boolean;
        };
    }>;
    resendOtp(resendOtpDto: ResendOtpDto): Promise<{
        message: string;
        email: string;
    }>;
    private sendOtpToUser;
    validateUser(userId: string): Promise<User>;
    private generateToken;
}
