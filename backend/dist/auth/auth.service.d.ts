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
        debugOtp?: string | undefined;
        message: string;
        email: string;
        requiresOtp: boolean;
    }>;
    login(loginDto: LoginDto, ipAddress?: string): Promise<{
        message: string;
        email: string;
        requiresOtp: boolean;
        access_token?: undefined;
        user?: undefined;
    } | {
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import("../users/user.entity").UserRole.USER;
            isVerified: true;
        };
        message?: undefined;
        email?: undefined;
        requiresOtp?: undefined;
    }>;
    verifyOtp(verifyOtpDto: VerifyOtpDto, ipAddress?: string): Promise<{
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
    private sendOtpToUserWithDebug;
    private sendOtpToUser;
    validateUser(userId: string): Promise<User>;
    private generateToken;
}
