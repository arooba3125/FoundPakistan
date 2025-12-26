import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignupDto, LoginDto } from './dto/auth.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
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
    validateUser(userId: string): Promise<import("../users/user.entity").User>;
    private generateToken;
}
