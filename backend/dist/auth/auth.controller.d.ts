import { AuthService } from './auth.service';
import { SignupDto, LoginDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signup(signupDto: SignupDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import("../users/user.entity").UserRole;
            isVerified: boolean;
        };
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import("../users/user.entity").UserRole;
            isVerified: boolean;
        };
    }>;
    getProfile(req: any): {
        message: string;
        user: any;
    };
}
