import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private transporter;
    private logger;
    constructor(configService: ConfigService);
    private initializeTransporter;
    sendVerificationEmail(email: string, token: string): Promise<void>;
    sendOtpEmail(email: string, otp: string): Promise<void>;
    sendCaseStatusEmail(email: string, caseId: string, status: string, caseName?: string, caseType?: string, rejectionReason?: string): Promise<void>;
}
