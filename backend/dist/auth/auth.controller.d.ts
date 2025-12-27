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
    getProfile(req: any): {
        message: string;
        user: any;
    };
}
