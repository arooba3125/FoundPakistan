export declare enum UserRole {
    USER = "user",
    ADMIN = "admin"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    name: string;
    role: UserRole;
    isVerified: boolean;
    verificationToken: string | null;
    verificationExpires: Date | null;
    otpHash: string | null;
    otpExpiresAt: Date | null;
    otpAttempts: number;
    otpSentAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
