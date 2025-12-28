"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const user_entity_1 = require("../users/user.entity");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const users_service_1 = require("../users/users.service");
const email_service_1 = require("../email/email.service");
const otp_util_1 = require("./utils/otp.util");
const email_util_1 = require("./utils/email.util");
let AuthService = class AuthService {
    usersService;
    jwtService;
    emailService;
    usersRepository;
    constructor(usersService, jwtService, emailService, usersRepository) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.usersRepository = usersRepository;
    }
    async signup(signupDto) {
        const { email, password, name } = signupDto;
        if (!(0, email_util_1.isValidEmailFormat)(email)) {
            throw new common_1.BadRequestException('Invalid email address format. Please provide a valid email address.');
        }
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.usersService.create(email, hashedPassword, name);
        await this.sendOtpToUser(user.id, email);
        return {
            message: 'Account created successfully! Please check your email for the verification code.',
            email: email,
            requiresOtp: true,
        };
    }
    async login(loginDto, ipAddress) {
        const { email, password, expectedRole } = loginDto;
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (expectedRole) {
            if (expectedRole === 'admin' && user.role !== 'admin') {
                throw new common_1.UnauthorizedException('This account is not an admin account. Please use the user login portal instead.');
            }
            if (expectedRole === 'user' && user.role === 'admin') {
                throw new common_1.UnauthorizedException('Admin accounts cannot login here. Please use the admin portal instead.');
            }
        }
        if (!user.isVerified) {
            throw new common_1.UnauthorizedException('Please verify your email address first. Check your inbox for the verification code.');
        }
        if (user.role === 'admin') {
            await this.sendOtpToUser(user.id, email);
            return {
                message: 'Please check your email for the verification code to complete login.',
                email: email,
                requiresOtp: true,
            };
        }
        const token = this.generateToken(user.id, user.email, user.role);
        this.emailService.sendLoginNotificationEmail(email, new Date(), ipAddress).catch((error) => {
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
    async verifyOtp(verifyOtpDto, ipAddress) {
        const { email, otp } = verifyOtpDto;
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.otpHash || !user.otpExpiresAt) {
            throw new common_1.BadRequestException('No OTP found. Please request a new one.');
        }
        if ((0, otp_util_1.isOtpExpired)(user.otpExpiresAt)) {
            throw new common_1.BadRequestException('OTP has expired. Please request a new one.');
        }
        if (user.otpAttempts >= 3) {
            throw new common_1.HttpException('Too many failed attempts. Please request a new OTP.', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        const isOtpValid = await (0, otp_util_1.verifyOtp)(otp, user.otpHash);
        if (!isOtpValid) {
            await this.usersService.incrementOtpAttempts(user.id);
            throw new common_1.UnauthorizedException('Invalid OTP. Please try again.');
        }
        await this.usersService.clearOtpData(user.id);
        const isSignup = !user.isVerified;
        if (isSignup) {
            user.isVerified = true;
            await this.usersRepository.save(user);
        }
        const token = this.generateToken(user.id, user.email, user.role);
        if (!isSignup && user.role === 'admin' && ipAddress) {
            this.emailService.sendLoginNotificationEmail(email, new Date(), ipAddress).catch((error) => {
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
    async resendOtp(resendOtpDto) {
        const { email } = resendOtpDto;
        if (!(0, email_util_1.isValidEmailFormat)(email)) {
            throw new common_1.BadRequestException('Invalid email address format. Please provide a valid email address.');
        }
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email address');
        }
        await this.sendOtpToUser(user.id, email);
        return {
            message: 'A new verification code has been sent to your email.',
            email: email,
        };
    }
    async sendOtpToUser(userId, email) {
        if (!(0, email_util_1.isValidEmailFormat)(email)) {
            throw new common_1.BadRequestException('Invalid email address format. Please provide a valid email address.');
        }
        const isDomainValid = await (0, email_util_1.isValidEmailDomain)(email);
        if (!isDomainValid) {
            throw new common_1.BadRequestException('Invalid email address. The email domain does not exist or cannot receive emails. Please check your email address and try again.');
        }
        const otp = (0, otp_util_1.generateOtp)();
        const otpHash = await (0, otp_util_1.hashOtp)(otp);
        const otpExpiresAt = (0, otp_util_1.createOtpExpiration)();
        await this.usersService.updateOtpData(userId, otpHash, otpExpiresAt);
        await this.emailService.sendOtpEmail(email, otp);
    }
    async validateUser(userId) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
    generateToken(userId, email, role) {
        const payload = { sub: userId, email, role };
        return this.jwtService.sign(payload);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        email_service_1.EmailService,
        typeorm_1.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map