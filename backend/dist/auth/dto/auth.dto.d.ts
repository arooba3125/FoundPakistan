export declare class SignupDto {
    email: string;
    password: string;
    name?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
    expectedRole?: string;
}
export declare class VerifyOtpDto {
    email: string;
    otp: string;
}
export declare class ResendOtpDto {
    email: string;
}
