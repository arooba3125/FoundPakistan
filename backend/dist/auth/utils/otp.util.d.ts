export declare function generateOtp(): string;
export declare function hashOtp(otp: string): Promise<string>;
export declare function verifyOtp(otp: string, hash: string): Promise<boolean>;
export declare function isOtpExpired(expiresAt: Date | null): boolean;
export declare function createOtpExpiration(): Date;
