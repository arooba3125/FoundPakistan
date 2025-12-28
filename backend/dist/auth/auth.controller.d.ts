import { AuthService } from './auth.service';
import { SignupDto, LoginDto, VerifyOtpDto, ResendOtpDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signup(signupDto: SignupDto): Promise<{
        message: string;
        email: string;
        requiresOtp: boolean;
    }>;
    login(loginDto: LoginDto, req: any): Promise<{
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
    verifyOtp(verifyOtpDto: VerifyOtpDto, req: any): Promise<{
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
    getProfile(req: any): {
        message: string;
        user: any;
    };
}
